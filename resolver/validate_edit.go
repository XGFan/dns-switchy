package resolver

import (
	"dns-switchy/config"
	"fmt"
	"os"
)

// StrictValidateForEdit performs the extra, save-time validation the web config
// editor needs before persisting a config. The normal construction path
// (CreateResolvers / NewForward / NewFile) is lenient: NewFile->update only logs
// a bad path, and NewForward only fails when *all* upstreams are unparseable.
// This function promotes those tolerated inputs into explicit pre-save errors:
//
//   - file resolver: location (unless "system") must stat (exist) on disk
//   - every forward/preloader upstream URL must be parseable
//   - resolver type must be a known type
//
// It returns the first error found, or nil when the config passes.
func StrictValidateForEdit(conf *config.SwitchyConfig) error {
	if conf == nil {
		return fmt.Errorf("nil config")
	}
	for i, rc := range conf.Resolvers {
		if err := strictValidateResolver(rc); err != nil {
			return fmt.Errorf("resolver[%d]: %w", i, err)
		}
	}
	return nil
}

func strictValidateResolver(rc config.ResolverConfig) error {
	switch rc.Type() {
	case config.FILTER, config.MOCK:
		return nil
	case config.FILE:
		return strictValidateFile(rc.(*config.FileConfig))
	case config.FORWARD, config.FORWARD_GROUP:
		return strictValidateForward(rc.(*config.ForwardConfig))
	case config.PRELOADER:
		return strictValidateForward(&rc.(*config.PreloaderConfig).ForwardConfig)
	default:
		return fmt.Errorf("unknown resolver type %s", rc.Type())
	}
}

func strictValidateFile(fc *config.FileConfig) error {
	// "system" is resolved to the OS hosts path at construction time; skip it.
	if fc.Location == "" || fc.Location == "system" {
		return nil
	}
	if _, err := os.Stat(fc.Location); err != nil {
		return fmt.Errorf("file location %q not accessible: %w", fc.Location, err)
	}
	return nil
}

func strictValidateForward(fc *config.ForwardConfig) error {
	urls := make([]config.UpstreamConfig, 0, len(fc.Upstreams)+1)
	if fc.UpstreamConfig.Url != "" {
		urls = append(urls, fc.UpstreamConfig)
	}
	urls = append(urls, fc.Upstreams...)
	if len(urls) == 0 {
		return fmt.Errorf("forward %q has no upstream", fc.Name)
	}
	for _, uc := range urls {
		up, err := createUpStream(uc)
		if err != nil {
			return fmt.Errorf("forward %q upstream %q invalid: %w", fc.Name, uc.Url, err)
		}
		// createUpStream opens an upstream; close the throwaway so it does not leak.
		_ = up.Close()
	}
	return nil
}
