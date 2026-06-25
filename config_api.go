package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"dns-switchy/config"
	"dns-switchy/resolver"

	"gopkg.in/yaml.v3"
)

// maxConfigBodyBytes caps the size of a config write/validate request body.
const maxConfigBodyBytes = 1 << 20 // 1 MiB

// configResolversRequest is the body shape for POST /api/config and
// /api/config/validate. Only `resolvers` is read; top-level fields (addr/http/
// ttl/nftset_table) are server-authoritative and taken from the on-disk doc.
//
// Resolvers decodes via *orderedMap so each resolver object keeps its key order
// (type, name, rule, ...) on the round-trip to YAML.
type configResolversRequest struct {
	Resolvers []interface{} `json:"-"`
	Version   string        `json:"version"`
}

// rawConfigRequest mirrors configResolversRequest but keeps resolvers as a raw
// JSON message so it can be decoded with the order-preserving decoder.
type rawConfigRequest struct {
	Resolvers json.RawMessage `json:"resolvers"`
	Version   string          `json:"version"`
}

// apiConfigHandler serves GET /api/config and POST /api/config.
func (s *DnsSwitchyServer) apiConfigHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.handleConfigGet(w, r)
	case http.MethodPost:
		s.handleConfigPost(w, r)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleConfigGet reads the current config from disk and returns it as JSON
// along with its content version. Scalars (ttl "5m", v2fly:cn rules, unknown
// keys) are preserved verbatim.
func (s *DnsSwitchyServer) handleConfigGet(w http.ResponseWriter, _ *http.Request) {
	if s.configCtl == nil {
		http.Error(w, "config editor not enabled", http.StatusNotFound)
		return
	}
	raw, err := s.configCtl.Load()
	if err != nil {
		http.Error(w, "read config: "+err.Error(), http.StatusInternalServerError)
		return
	}
	doc, err := config.LoadDoc(bytes.NewReader(raw))
	if err != nil {
		http.Error(w, "parse config doc: "+err.Error(), http.StatusInternalServerError)
		return
	}
	// Re-marshal so the version matches what subsequent writes hash against.
	canonical, err := config.MarshalDoc(doc)
	if err != nil {
		http.Error(w, "marshal config doc: "+err.Error(), http.StatusInternalServerError)
		return
	}
	cfg := nodeToJSONValue(doc)
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"config":  cfg,
		"version": config.ConfigVersion(canonical),
	})
}

// handleConfigPost validates the submitted resolvers, and on success backs up +
// atomically writes the new config and hot-swaps the resolver chain. Top-level
// fields are taken from the current on-disk doc (server-authoritative).
func (s *DnsSwitchyServer) handleConfigPost(w http.ResponseWriter, r *http.Request) {
	if s.configCtl == nil {
		http.Error(w, "config editor not enabled", http.StatusNotFound)
		return
	}
	if g, bad := guardWrite(r); bad {
		http.Error(w, g.message, g.status)
		return
	}
	req, perr := decodeConfigRequest(w, r)
	if perr != nil {
		writeJSON(w, bodyErrStatus(perr), map[string]interface{}{"ok": false, "stage": "body", "error": perr.Error()})
		return
	}

	// Load current on-disk doc, replace only its resolvers value.
	doc, currentVersion, lerr := s.loadCurrentDoc()
	if lerr != nil {
		http.Error(w, lerr.Error(), http.StatusInternalServerError)
		return
	}

	// Optimistic concurrency: version is required and must match the
	// current on-disk content (plan §3.6.3). A missing version would let a
	// client bypass conflict detection entirely, so reject it.
	if req.Version == "" {
		writeJSON(w, http.StatusBadRequest, map[string]interface{}{
			"ok": false, "stage": "version", "error": "version required",
			"version": currentVersion,
		})
		return
	}
	if req.Version != currentVersion {
		writeJSON(w, http.StatusConflict, map[string]interface{}{
			"ok": false, "stage": "version", "error": "config changed elsewhere",
			"version": currentVersion,
		})
		return
	}

	newBytes, conf, stage, verr := buildAndValidate(doc, req.Resolvers)
	if verr != nil {
		writeJSON(w, validationStatus(stage), map[string]interface{}{"ok": false, "stage": stage, "error": verr.Error()})
		return
	}

	if err := s.configCtl.Save(newBytes); err != nil {
		http.Error(w, "save config: "+err.Error(), http.StatusInternalServerError)
		return
	}
	newVersion := config.ConfigVersion(newBytes)
	// Suppress the self-write fsnotify event, then swap the resolver chain.
	s.configCtl.markApplied(newVersion, newBytes)
	if err := s.SwapResolvers(conf); err != nil {
		// Build already succeeded above, so this is unexpected; report 500.
		http.Error(w, "swap resolvers: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"ok": true, "version": newVersion})
}

// apiConfigValidateHandler serves POST /api/config/validate: it runs the full
// parse + construct + strict validation pipeline without writing anything.
func (s *DnsSwitchyServer) apiConfigValidateHandler(w http.ResponseWriter, r *http.Request) {
	if s.configCtl == nil {
		http.Error(w, "config editor not enabled", http.StatusNotFound)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if g, bad := guardWrite(r); bad {
		http.Error(w, g.message, g.status)
		return
	}
	req, perr := decodeConfigRequest(w, r)
	if perr != nil {
		writeJSON(w, bodyErrStatus(perr), map[string]interface{}{"valid": false, "stage": "body", "error": perr.Error()})
		return
	}
	doc, _, lerr := s.loadCurrentDoc()
	if lerr != nil {
		http.Error(w, lerr.Error(), http.StatusInternalServerError)
		return
	}
	_, _, stage, verr := buildAndValidate(doc, req.Resolvers)
	if verr != nil {
		writeJSON(w, validationStatus(stage), map[string]interface{}{"valid": false, "stage": stage, "error": verr.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"valid": true})
}

// loadCurrentDoc reads and decodes the on-disk config, returning the doc and its
// canonical content version.
func (s *DnsSwitchyServer) loadCurrentDoc() (*yaml.Node, string, error) {
	raw, err := s.configCtl.Load()
	if err != nil {
		return nil, "", errors.New("read config: " + err.Error())
	}
	doc, err := config.LoadDoc(bytes.NewReader(raw))
	if err != nil {
		return nil, "", errors.New("parse config doc: " + err.Error())
	}
	canonical, err := config.MarshalDoc(doc)
	if err != nil {
		return nil, "", errors.New("marshal config doc: " + err.Error())
	}
	return doc, config.ConfigVersion(canonical), nil
}

// buildAndValidate replaces the doc's resolvers with the submitted JSON
// resolvers, marshals, then runs parse -> construct -> strict validation. It
// returns the marshalled bytes and the constructed *SwitchyConfig (whose
// resolver set has NOT been built into running resolvers — that happens in
// SwapResolvers). On failure it returns the failing stage and the error; on
// success stage is "" and conf is ready for SwapResolvers.
//
// Any resolver set constructed purely for validation is Closed here so its
// tickers/goroutines do not leak.
func buildAndValidate(doc *yaml.Node, resolversJSON []interface{}) (newBytes []byte, conf *config.SwitchyConfig, stage string, err error) {
	resolversNode := jsonValueToNode(resolversJSON)
	if resolversNode.Kind != yaml.SequenceNode {
		return nil, nil, "body", errors.New("resolvers must be an array")
	}
	if err = config.ReplaceResolvers(doc, resolversNode); err != nil {
		return nil, nil, "parse", err
	}
	newBytes, err = config.MarshalDoc(doc)
	if err != nil {
		return nil, nil, "parse", err
	}
	conf, err = config.ParseConfig(bytes.NewReader(newBytes))
	if err != nil {
		return nil, nil, "parse", err
	}
	// Construct the resolver set to surface hard construction errors, then Close
	// the throwaway so tickers/goroutines do not leak. SwapResolvers rebuilds
	// from conf when the caller actually applies it.
	built, berr := resolver.CreateResolvers(conf)
	if berr != nil {
		return nil, nil, "construct", berr
	}
	for _, rr := range built {
		rr.Close()
	}
	if serr := resolver.StrictValidateForEdit(conf); serr != nil {
		return nil, nil, "construct", serr
	}
	return newBytes, conf, "", nil
}

// validationStatus maps a validation stage to its HTTP status: parse->400,
// construct/strict->409.
func validationStatus(stage string) int {
	switch stage {
	case "parse", "body":
		return http.StatusBadRequest
	case "construct":
		return http.StatusConflict
	default:
		return http.StatusBadRequest
	}
}

// guardErr carries an HTTP status + message for write-request hardening.
type guardErr struct {
	status  int
	message string
}

// guardWrite enforces the cheap hardening for write endpoints: JSON content
// type and same-origin (CSRF). Method is checked by the caller. The bool is true
// when the request is rejected.
func guardWrite(r *http.Request) (guardErr, bool) {
	ct := r.Header.Get("Content-Type")
	if i := strings.IndexByte(ct, ';'); i >= 0 {
		ct = ct[:i]
	}
	if strings.TrimSpace(strings.ToLower(ct)) != "application/json" {
		return guardErr{http.StatusUnsupportedMediaType, "content-type must be application/json"}, true
	}
	if !sameOriginOK(r) {
		return guardErr{http.StatusForbidden, "cross-origin request rejected"}, true
	}
	return guardErr{}, false
}

// sameOriginOK rejects cross-site requests by comparing the Origin (preferred)
// or Referer host against the request Host. A request with neither header is
// allowed (e.g. curl / same-origin non-browser clients).
func sameOriginOK(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin != "" {
		return originHostMatches(origin, r.Host)
	}
	referer := r.Header.Get("Referer")
	if referer != "" {
		return originHostMatches(referer, r.Host)
	}
	return true
}

func originHostMatches(rawURL, host string) bool {
	// Strip scheme.
	if i := strings.Index(rawURL, "://"); i >= 0 {
		rawURL = rawURL[i+3:]
	}
	// Keep only the authority (host[:port]) part.
	if i := strings.IndexAny(rawURL, "/?#"); i >= 0 {
		rawURL = rawURL[:i]
	}
	return rawURL == host
}

// decodeConfigRequest enforces a body-size limit and decodes the JSON request,
// keeping resolver object key order via the order-preserving decoder.
func decodeConfigRequest(w http.ResponseWriter, r *http.Request) (*configResolversRequest, error) {
	r.Body = http.MaxBytesReader(w, r.Body, maxConfigBodyBytes)
	var raw rawConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		return nil, err
	}
	req := &configResolversRequest{Version: raw.Version}
	if len(raw.Resolvers) > 0 {
		dec := json.NewDecoder(bytes.NewReader(raw.Resolvers))
		val, err := decodeOrderedValue(dec)
		if err != nil {
			return nil, err
		}
		arr, ok := val.([]interface{})
		if !ok {
			return nil, errors.New("resolvers must be an array")
		}
		req.Resolvers = arr
	} else {
		req.Resolvers = []interface{}{}
	}
	return req, nil
}

// bodyErrStatus maps a request-body decode error to its HTTP status: a body
// exceeding maxConfigBodyBytes becomes 413, everything else 400.
func bodyErrStatus(err error) int {
	var maxErr *http.MaxBytesError
	if errors.As(err, &maxErr) {
		return http.StatusRequestEntityTooLarge
	}
	return http.StatusBadRequest
}

func writeJSON(w http.ResponseWriter, status int, body interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
