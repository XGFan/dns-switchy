package config

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"

	"gopkg.in/yaml.v3"
)

// doc.go provides a yaml.Node-based read/write API for the web config editor.
//
// The editing chain MUST stay on *yaml.Node (never typed structs or maps):
//   - _SwitchyConfig.TTL is a time.Duration, so a struct/JSON round-trip turns
//     `ttl: 5m` into `300000000000` (nanoseconds) or `5m0s`.
//   - map[string]interface{} drops comments/anchors and re-orders keys.
//
// A yaml.Node preserves the original scalar text (`ttl: 5m`, `v2fly:cn`,
// `include:...`), unknown top-level/nested keys, and key order. Rules are NOT
// expanded here; ParseConfig remains the (separate) validation path.

// LoadDoc decodes a full YAML document into a *yaml.Node (a DocumentNode whose
// single child is the root mapping/sequence). All scalar text, unknown keys,
// and key order are preserved verbatim; rules are not expanded.
func LoadDoc(r io.Reader) (*yaml.Node, error) {
	doc := &yaml.Node{}
	if err := yaml.NewDecoder(r).Decode(doc); err != nil {
		return nil, fmt.Errorf("load yaml doc: %w", err)
	}
	return doc, nil
}

// rootMapping returns the top-level mapping node of a decoded document.
// It accepts either a DocumentNode wrapping a mapping or a bare mapping node.
func rootMapping(doc *yaml.Node) (*yaml.Node, error) {
	if doc == nil {
		return nil, fmt.Errorf("yaml doc is nil")
	}
	root := doc
	if root.Kind == yaml.DocumentNode {
		if len(root.Content) == 0 {
			return nil, fmt.Errorf("yaml doc is empty")
		}
		root = root.Content[0]
	}
	if root.Kind != yaml.MappingNode {
		return nil, fmt.Errorf("yaml doc root is not a mapping (kind=%d)", root.Kind)
	}
	return root, nil
}

// mappingValue finds the value node for a key in a mapping node.
// Mapping content alternates [key0, value0, key1, value1, ...].
func mappingValue(mapping *yaml.Node, key string) (*yaml.Node, bool) {
	for i := 0; i+1 < len(mapping.Content); i += 2 {
		if mapping.Content[i].Value == key {
			return mapping.Content[i+1], true
		}
	}
	return nil, false
}

// ResolversNode locates and returns the value node of the top-level `resolvers`
// key (expected to be a sequence). Returns an error when the document has no
// `resolvers` key; callers can treat that as "no resolvers to edit".
func ResolversNode(doc *yaml.Node) (*yaml.Node, error) {
	root, err := rootMapping(doc)
	if err != nil {
		return nil, err
	}
	value, ok := mappingValue(root, "resolvers")
	if !ok {
		return nil, fmt.Errorf("no top-level resolvers key found")
	}
	return value, nil
}

// ReplaceResolvers replaces the value node of the top-level `resolvers` key with
// the given sequence node, leaving every other top-level key untouched. If the
// document has no `resolvers` key, it is appended.
func ReplaceResolvers(doc *yaml.Node, resolvers *yaml.Node) error {
	if resolvers == nil {
		return fmt.Errorf("resolvers node is nil")
	}
	root, err := rootMapping(doc)
	if err != nil {
		return err
	}
	for i := 0; i+1 < len(root.Content); i += 2 {
		if root.Content[i].Value == "resolvers" {
			root.Content[i+1] = resolvers
			return nil
		}
	}
	// No existing resolvers key: append a new key/value pair.
	keyNode := &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!str", Value: "resolvers"}
	root.Content = append(root.Content, keyNode, resolvers)
	return nil
}

// MarshalDoc serializes a yaml.Node document back to YAML bytes.
func MarshalDoc(doc *yaml.Node) ([]byte, error) {
	out, err := yaml.Marshal(doc)
	if err != nil {
		return nil, fmt.Errorf("marshal yaml doc: %w", err)
	}
	return out, nil
}

// ConfigVersion returns a stable content hash (sha256 hex, first 16 chars) used
// as an optimistic-concurrency version token. Identical bytes yield an identical
// version; any change yields a different one.
func ConfigVersion(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])[:16]
}
