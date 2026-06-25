package main

import (
	"bytes"
	"encoding/json"
)

// orderedMap is a string-keyed map that preserves insertion order when
// marshalled to JSON. It is used so the config returned by GET /api/config keeps
// the YAML key order (type, name, rule, url, ...) instead of Go's random map
// iteration order, and so a JSON body decoded back to a yaml.Node keeps that
// same order on write.
type orderedMap struct {
	keys   []string
	values map[string]interface{}
}

func newOrderedMap() *orderedMap {
	return &orderedMap{values: make(map[string]interface{})}
}

func (m *orderedMap) set(key string, value interface{}) {
	if _, ok := m.values[key]; !ok {
		m.keys = append(m.keys, key)
	}
	m.values[key] = value
}

func (m *orderedMap) MarshalJSON() ([]byte, error) {
	var buf bytes.Buffer
	buf.WriteByte('{')
	for i, k := range m.keys {
		if i > 0 {
			buf.WriteByte(',')
		}
		keyJSON, err := json.Marshal(k)
		if err != nil {
			return nil, err
		}
		buf.Write(keyJSON)
		buf.WriteByte(':')
		valJSON, err := json.Marshal(m.values[k])
		if err != nil {
			return nil, err
		}
		buf.Write(valJSON)
	}
	buf.WriteByte('}')
	return buf.Bytes(), nil
}

// UnmarshalJSON decodes a JSON object preserving key order, recursing into
// nested objects/arrays so the whole tree is ordered.
func (m *orderedMap) UnmarshalJSON(data []byte) error {
	m.values = make(map[string]interface{})
	m.keys = nil
	dec := json.NewDecoder(bytes.NewReader(data))
	// Read opening brace.
	tok, err := dec.Token()
	if err != nil {
		return err
	}
	if delim, ok := tok.(json.Delim); !ok || delim != '{' {
		return &json.UnmarshalTypeError{Value: "non-object", Type: nil}
	}
	for dec.More() {
		keyTok, err := dec.Token()
		if err != nil {
			return err
		}
		key := keyTok.(string)
		val, err := decodeOrderedValue(dec)
		if err != nil {
			return err
		}
		m.set(key, val)
	}
	// Read closing brace.
	if _, err := dec.Token(); err != nil {
		return err
	}
	return nil
}

// decodeOrderedValue decodes the next JSON value from dec, using orderedMap for
// objects so order is preserved at every level.
func decodeOrderedValue(dec *json.Decoder) (interface{}, error) {
	tok, err := dec.Token()
	if err != nil {
		return nil, err
	}
	switch t := tok.(type) {
	case json.Delim:
		switch t {
		case '{':
			obj := newOrderedMap()
			for dec.More() {
				keyTok, err := dec.Token()
				if err != nil {
					return nil, err
				}
				key := keyTok.(string)
				val, err := decodeOrderedValue(dec)
				if err != nil {
					return nil, err
				}
				obj.set(key, val)
			}
			if _, err := dec.Token(); err != nil { // closing }
				return nil, err
			}
			return obj, nil
		case '[':
			arr := make([]interface{}, 0)
			for dec.More() {
				val, err := decodeOrderedValue(dec)
				if err != nil {
					return nil, err
				}
				arr = append(arr, val)
			}
			if _, err := dec.Token(); err != nil { // closing ]
				return nil, err
			}
			return arr, nil
		}
	}
	return tok, nil
}
