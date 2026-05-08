include $(TOPDIR)/rules.mk

DS_PACKAGE_VERSION:=$(if $(DS_PACKAGE_VERSION),$(DS_PACKAGE_VERSION),0.0.0)
DS_PACKAGE_RELEASE:=$(if $(DS_PACKAGE_RELEASE),$(DS_PACKAGE_RELEASE),1)
DS_PACKAGE_ARCH:=$(if $(DS_PACKAGE_ARCH),$(DS_PACKAGE_ARCH),aarch64_generic)

PKG_NAME:=dns-switchy
PKG_VERSION:=$(DS_PACKAGE_VERSION)
PKG_RELEASE:=$(DS_PACKAGE_RELEASE)

PKG_LICENSE:=MIT
PKG_MAINTAINER:=dns-switchy project

include $(INCLUDE_DIR)/package.mk

define Package/dns-switchy
  SECTION:=net
  CATEGORY:=Network
  TITLE:=Rule-based DNS proxy
  PKGARCH:=$(DS_PACKAGE_ARCH)
endef

define Package/dns-switchy/description
 Rule-based DNS proxy with multi-upstream forwarding (UDP/DoH/DoT/DNSCrypt),
 caching, hot-reload and an embedded web portal.
endef

define Build/Compile
endef

define Package/dns-switchy/install
	# Binary
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/dns-switchy $(1)/usr/bin/dns-switchy

	# Init script
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ../../files/etc/init.d/dns-switchy $(1)/etc/init.d/dns-switchy

	# UCI defaults (conffile, preserved on upgrade)
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ../../files/etc/config/dns-switchy $(1)/etc/config/dns-switchy

	# Default yaml config (conffile, preserved on upgrade)
	$(INSTALL_DIR) $(1)/etc/dns-switchy
	$(INSTALL_CONF) ../../files/etc/dns-switchy/config.yaml $(1)/etc/dns-switchy/config.yaml
endef

define Package/dns-switchy/conffiles
/etc/config/dns-switchy
/etc/dns-switchy/config.yaml
endef

define Package/dns-switchy/postinst
#!/bin/sh
set -eu

[ -n "$${IPKG_INSTROOT:-}" ] && exit 0

guest_initd="/etc/init.d/dns-switchy"

if [ -x "$${guest_initd}" ]; then
  "$${guest_initd}" enable >/dev/null 2>&1 || true
  "$${guest_initd}" restart >/dev/null 2>&1 || "$${guest_initd}" start >/dev/null 2>&1 || true
fi

exit 0
endef

define Package/dns-switchy/prerm
#!/bin/sh
set -eu

[ -n "$${IPKG_INSTROOT:-}" ] && exit 0

action="$${1:-}"
guest_initd="/etc/init.d/dns-switchy"

if [ -x "$${guest_initd}" ]; then
  "$${guest_initd}" stop >/dev/null 2>&1 || true

  case "$${action}" in
    remove|purge|deconfigure)
      "$${guest_initd}" disable >/dev/null 2>&1 || true
      ;;
  esac
fi

exit 0
endef

define Package/dns-switchy/postrm
#!/bin/sh
set -eu

[ -n "$${IPKG_INSTROOT:-}" ] && exit 0

action="$${1:-}"

case "$${action}" in
  remove|purge|deconfigure)
    rm -f /var/run/dns-switchy.pid /var/run/dns-switchy.yaml

    if [ ! -e /etc/dns-switchy/config.yaml ]; then
      rmdir /etc/dns-switchy >/dev/null 2>&1 || true
    fi
    ;;
esac

exit 0
endef

$(eval $(call BuildPackage,dns-switchy))
