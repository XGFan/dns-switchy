package main

import (
	"flag"
	"fmt"
	"github.com/v2fly/v2ray-core/v4/app/router"
	_ "github.com/v2fly/v2ray-core/v4/infra/conf/geodata/standard"
	"google.golang.org/protobuf/proto"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
)

func main() {
	file := flag.String("f", "v2-rule.txt", "file to write")
	flag.Parse()
	resp, err := http.Get("https://raw.githubusercontent.com/v2fly/domain-list-community/release/dlc.dat")
	failOnError(err)
	all, err := ioutil.ReadAll(resp.Body)
	failOnError(err)
	var geositeList router.GeoSiteList
	err = proto.Unmarshal(all, &geositeList)
	failOnError(err)
	var sites []*router.Domain
	for _, site := range geositeList.Entry {
		if strings.EqualFold(site.CountryCode, "cn") {
			sites = site.Domain
			break
		}
	}
	sort.Slice(sites, func(i, j int) bool {
		if sites[i].Type < sites[j].Type {
			return true
		} else {
			if sites[i].Type == sites[j].Type {
				return sites[i].Value < sites[j].Value
			} else {
				return false
			}
		}
	})
	lines := make([]string, 0, len(sites))
	for _, domain := range sites {
		//lines = append(lines, fmt.Sprintf("%s:%s", router.Domain_Type_name[int32(domain.GetType())], domain.Value))
		lines = append(lines, fmt.Sprintf("%s", domain.Value))
	}
	join := strings.Join(lines, "\n")
	err = os.WriteFile(*file, []byte(join), 0644)
	failOnError(err)
}

func failOnError(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}
