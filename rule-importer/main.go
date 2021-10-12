package main

import (
	"fmt"
	"github.com/v2fly/v2ray-core/v4/infra/conf/geodata"
	_ "github.com/v2fly/v2ray-core/v4/infra/conf/geodata/standard"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
)

func init() {
	envArg := strings.ReplaceAll(strings.ToUpper(strings.TrimSpace("v2ray.location.asset")), ".", "_")
	wd, _ := os.Getwd()
	os.Setenv(envArg, wd)
}

func download() {
	s, err := os.Stat("geosite.dat")
	if err != nil {
		log.Println(err)
		if os.IsNotExist(err) {
			get, err := http.Get("https://raw.githubusercontent.com/v2fly/domain-list-community/release/dlc.dat")
			if err != nil {
				log.Fatalln(err)
			}
			all, err := ioutil.ReadAll(get.Body)
			if err != nil {
				log.Fatalln(err)
			}
			err = ioutil.WriteFile("geosite.dat", all, 0644)
			if err != nil {
				log.Fatalln(err)
			}
		}
	} else {
		log.Println(s)
	}
}

func main() {
	download()
	loader, err := geodata.GetGeoDataLoader("standard")
	if err != nil {
		log.Fatalln(err)
	}
	site, err := loader.LoadSite("geosite.dat", "cn")
	if err != nil {
		log.Fatalln(err)
	}
	sort.Slice(site, func(i, j int) bool {
		if site[i].Type < site[j].Type {
			return true
		} else {
			if site[i].Type == site[j].Type {
				return site[i].Value < site[j].Value
			} else {
				return false
			}
		}
	})
	lines := make([]string, 0, len(site))
	for _, domain := range site {
		//lines = append(lines, fmt.Sprintf("%s:%s", router.Domain_Type_name[int32(domain.GetType())], domain.Value))
		lines = append(lines, fmt.Sprintf("%s", domain.Value))
	}
	join := strings.Join(lines, "\n")
	os.WriteFile("v2-rule.txt", []byte(join), 0644)
}
