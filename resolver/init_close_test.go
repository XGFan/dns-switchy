package resolver

import (
	"dns-switchy/config"
	"runtime"
	"testing"
	"time"
)

// waitGoroutinesSettle waits until the goroutine count drops to at most baseline
// (allowing the runtime to reclaim exited goroutines) within the deadline.
func waitGoroutinesSettle(t *testing.T, baseline int) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		runtime.GC()
		if runtime.NumGoroutine() <= baseline {
			return
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatalf("goroutines did not settle: have %d, want <= %d (earlier resolvers likely leaked on error)", runtime.NumGoroutine(), baseline)
}

// TestCreateResolversClosesBuiltResolversOnError verifies that when a later
// resolver fails to construct, the already-built resolvers (which start
// goroutines/tickers) are Closed instead of leaked.
func TestCreateResolversClosesBuiltResolversOnError(t *testing.T) {
	runtime.GC()
	baseline := runtime.NumGoroutine()

	_, err := CreateResolvers(&config.SwitchyConfig{
		Resolvers: []config.ResolverConfig{
			// A preloader starts a background Work() goroutine on construction.
			&config.PreloaderConfig{
				ForwardConfig: config.ForwardConfig{
					Name:           "leak-check-preloader",
					TTL:            time.Hour,
					UpstreamConfig: config.UpstreamConfig{Url: "127.0.0.1:53"},
				},
			},
			// A filter with an invalid query type fails to construct, forcing the
			// error path that must Close the preloader above.
			&config.FilterConfig{QueryType: []string{"NOT_A_DNS_TYPE"}},
		},
	})
	if err == nil {
		t.Fatal("CreateResolvers() error = nil, want failure on bad filter")
	}

	// If the preloader was not Closed, its Work() goroutine stays alive and the
	// count never returns to baseline.
	waitGoroutinesSettle(t, baseline)
}
