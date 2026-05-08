include $(TOPDIR)/rules.mk

DS_PACKAGE_VERSION:=$(if $(DS_PACKAGE_VERSION),$(DS_PACKAGE_VERSION),0.0.0)
DS_PACKAGE_RELEASE:=$(if $(DS_PACKAGE_RELEASE),$(DS_PACKAGE_RELEASE),1)

PKG_NAME:=luci-app-dns-switchy
PKG_VERSION:=$(DS_PACKAGE_VERSION)
PKG_RELEASE:=$(DS_PACKAGE_RELEASE)

PKG_LICENSE:=MIT
PKG_MAINTAINER:=dns-switchy project

PKGARCH:=all

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-dns-switchy
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=DNS-Switchy LuCI shell entry
  PKGARCH:=$(PKGARCH)
  DEPENDS:=+luci-base +rpcd
endef

define Package/luci-app-dns-switchy/description
 Lightweight LuCI shell that wraps the dns-switchy web portal in an iframe.
endef

define Build/Compile
endef

define Package/luci-app-dns-switchy/install
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/dns-switchy
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/dns-switchy/index.js $(1)/www/luci-static/resources/view/dns-switchy/index.js
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/dns-switchy.json $(1)/usr/share/luci/menu.d/dns-switchy.json
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-dns-switchy.json $(1)/usr/share/rpcd/acl.d/luci-app-dns-switchy.json
endef

define Package/luci-app-dns-switchy/postinst
#!/bin/sh

[ -n "$${IPKG_INSTROOT:-}" ] && exit 0

rm -f /tmp/luci-indexcache.*
rm -rf /tmp/luci-modulecache/
/etc/init.d/rpcd reload >/dev/null 2>&1 || true

exit 0
endef

define Package/luci-app-dns-switchy/postrm
#!/bin/sh

[ -n "$${IPKG_INSTROOT:-}" ] && exit 0

rm -f /tmp/luci-indexcache.*
rm -rf /tmp/luci-modulecache/
/etc/init.d/rpcd reload >/dev/null 2>&1 || true

exit 0
endef

$(eval $(call BuildPackage,luci-app-dns-switchy))
