package resolver

import (
	"dns-switchy/config"
	"fmt"
	"github.com/miekg/dns"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"
)

func newFileResolverForCloseTest(t *testing.T) *FileResolver {
	t.Helper()
	hostsFile := filepath.Join(t.TempDir(), "hosts")
	if err := os.WriteFile(hostsFile, []byte("127.0.0.1 localhost\n"), 0600); err != nil {
		t.Fatalf("write hosts file fail: %v", err)
	}
	resolver, err := NewFile(&config.FileConfig{
		Location:        hostsFile,
		RefreshInterval: time.Hour,
		FileType:        "host",
	})
	if err != nil {
		t.Fatalf("NewFile fail: %v", err)
	}
	return resolver
}

func waitForResolverTest(t *testing.T, done <-chan struct{}, message string) {
	t.Helper()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal(message)
	}
}

func writeFileResolverTestContent(t *testing.T, path string, content string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(content), 0600); err != nil {
		t.Fatalf("write resolver content fail: %v", err)
	}
}

func TestFileResolverConcurrentRefreshAndLookup(t *testing.T) {
	hostsFile := filepath.Join(t.TempDir(), "hosts")
	const domain = "dynamic.example.com"
	const ip1 = "127.0.0.1"
	const ip2 = "127.0.0.2"
	writeFileResolverTestContent(t, hostsFile, ip1+" "+domain+"\n")

	resolver := &FileResolver{
		location:   hostsFile,
		inConfig:   make(QueryMap),
		fileParser: Hosts{},
	}
	resolver.update()

	msg := &dns.Msg{Question: []dns.Question{{Name: dns.Fqdn(domain), Qtype: dns.TypeA, Qclass: dns.ClassINET}}}
	start := make(chan struct{})
	var wg sync.WaitGroup
	lookupErr := make(chan error, 1)
	reportErr := func(err error) {
		select {
		case lookupErr <- err:
		default:
		}
	}

	writer := func() {
		defer wg.Done()
		<-start
		for i := 0; i < 200; i++ {
			if i%2 == 0 {
				writeFileResolverTestContent(t, hostsFile, ip1+" "+domain+"\n")
			} else {
				writeFileResolverTestContent(t, hostsFile, ip2+" "+domain+"\n")
			}
			resolver.update()
			time.Sleep(time.Millisecond)
		}
	}

	reader := func() {
		defer wg.Done()
		<-start
		for i := 0; i < 500; i++ {
			if !resolver.Accept(msg) {
				reportErr(fmt.Errorf("Accept() returned false during concurrent refresh"))
				return
			}
			resp, err := resolver.Resolve(msg)
			if err != nil {
				reportErr(err)
				return
			}
			if len(resp.Answer) != 1 {
				reportErr(fmt.Errorf("Resolve() answer count = %d, want 1", len(resp.Answer)))
				return
			}
			answer, ok := resp.Answer[0].(*dns.A)
			if !ok {
				reportErr(fmt.Errorf("Resolve() answer type = %T, want *dns.A", resp.Answer[0]))
				return
			}
			ip := answer.A.String()
			if ip != ip1 && ip != ip2 {
				reportErr(fmt.Errorf("Resolve() answer IP = %s, want %s or %s", ip, ip1, ip2))
				return
			}
		}
	}

	wg.Add(1)
	go writer()
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go reader()
	}

	close(start)
	wg.Wait()

	select {
	case err := <-lookupErr:
		t.Fatalf("concurrent lookup failed: %v", err)
	default:
	}

	writeFileResolverTestContent(t, hostsFile, ip2+" "+domain+"\n")
	resolver.update()
	resp, err := resolver.Resolve(msg)
	if err != nil {
		t.Fatalf("Resolve fail after refresh: %v", err)
	}
	if got := resp.Answer[0].(*dns.A).A.String(); got != ip2 {
		t.Fatalf("Resolve() = %s, want %s", got, ip2)
	}
}

func TestFileResolverCloseStopsWorker(t *testing.T) {
	resolver := newFileResolverForCloseTest(t)

	closeDone := make(chan struct{})
	go func() {
		resolver.Close()
		close(closeDone)
	}()

	waitForResolverTest(t, closeDone, "FileResolver.Close blocked")
	waitForResolverTest(t, resolver.done, "FileResolver worker did not exit")

	secondCloseDone := make(chan struct{})
	go func() {
		resolver.Close()
		close(secondCloseDone)
	}()

	waitForResolverTest(t, secondCloseDone, "second FileResolver.Close blocked")
}

func TestFileResolverCloseRepeatedCreateCycles(t *testing.T) {
	for i := 0; i < 10; i++ {
		resolver := newFileResolverForCloseTest(t)

		closeDone := make(chan struct{})
		go func() {
			resolver.Close()
			close(closeDone)
		}()

		waitForResolverTest(t, closeDone, "FileResolver.Close blocked during repeated create/close cycle")
	}
}
