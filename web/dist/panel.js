var ho, z, oe, F, No, ee, re, ko, no, oo, ie, zo, _o, xo, uo = {}, mo = [], Ee = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, fo = Array.isArray;
function L(o, e) {
  for (var i in e) o[i] = e[i];
  return o;
}
function Ao(o) {
  o && o.parentNode && o.parentNode.removeChild(o);
}
function ze(o, e, i) {
  var a, n, c, s = {};
  for (c in e) c == "key" ? a = e[c] : c == "ref" ? n = e[c] : s[c] = e[c];
  if (arguments.length > 2 && (s.children = arguments.length > 3 ? ho.call(arguments, 2) : i), typeof o == "function" && o.defaultProps != null) for (c in o.defaultProps) s[c] === void 0 && (s[c] = o.defaultProps[c]);
  return lo(o, s, a, n, null);
}
function lo(o, e, i, a, n) {
  var c = { type: o, props: e, key: i, ref: a, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: n ?? ++oe, __i: -1, __u: 0 };
  return n == null && z.vnode != null && z.vnode(c), c;
}
function J(o) {
  return o.children;
}
function po(o, e) {
  this.props = o, this.context = e;
}
function X(o, e) {
  if (e == null) return o.__ ? X(o.__, o.__i + 1) : null;
  for (var i; e < o.__k.length; e++) if ((i = o.__k[e]) != null && i.__e != null) return i.__e;
  return typeof o.type == "function" ? X(o) : null;
}
function Ae(o) {
  if (o.__P && o.__d) {
    var e = o.__v, i = e.__e, a = [], n = [], c = L({}, e);
    c.__v = e.__v + 1, z.vnode && z.vnode(c), So(o.__P, c, e, o.__n, o.__P.namespaceURI, 32 & e.__u ? [i] : null, a, i ?? X(e), !!(32 & e.__u), n), c.__v = e.__v, c.__.__k[c.__i] = c, le(a, c, n), e.__e = e.__ = null, c.__e != i && te(c);
  }
}
function te(o) {
  if ((o = o.__) != null && o.__c != null) return o.__e = o.__c.base = null, o.__k.some(function(e) {
    if (e != null && e.__e != null) return o.__e = o.__c.base = e.__e;
  }), te(o);
}
function Oo(o) {
  (!o.__d && (o.__d = !0) && F.push(o) && !bo.__r++ || No != z.debounceRendering) && ((No = z.debounceRendering) || ee)(bo);
}
function bo() {
  try {
    for (var o, e = 1; F.length; ) F.length > e && F.sort(re), o = F.shift(), e = F.length, Ae(o);
  } finally {
    F.length = bo.__r = 0;
  }
}
function ae(o, e, i, a, n, c, s, d, b, p, h) {
  var _, t, u, g, A, k, w, x = a && a.__k || mo, P = e.length;
  for (b = Se(i, e, x, b, P), _ = 0; _ < P; _++) (u = i.__k[_]) != null && (t = u.__i != -1 && x[u.__i] || uo, u.__i = _, k = So(o, u, t, n, c, s, d, b, p, h), g = u.__e, u.ref && t.ref != u.ref && (t.ref && To(t.ref, null, u), h.push(u.ref, u.__c || g, u)), A == null && g != null && (A = g), (w = !!(4 & u.__u)) || t.__k === u.__k ? (b = ce(u, b, o, w), w && t.__e && (t.__e = null)) : typeof u.type == "function" && k !== void 0 ? b = k : g && (b = g.nextSibling), u.__u &= -7);
  return i.__e = A, b;
}
function Se(o, e, i, a, n) {
  var c, s, d, b, p, h = i.length, _ = h, t = 0;
  for (o.__k = new Array(n), c = 0; c < n; c++) (s = e[c]) != null && typeof s != "boolean" && typeof s != "function" ? (typeof s == "string" || typeof s == "number" || typeof s == "bigint" || s.constructor == String ? s = o.__k[c] = lo(null, s, null, null, null) : fo(s) ? s = o.__k[c] = lo(J, { children: s }, null, null, null) : s.constructor === void 0 && s.__b > 0 ? s = o.__k[c] = lo(s.type, s.props, s.key, s.ref ? s.ref : null, s.__v) : o.__k[c] = s, b = c + t, s.__ = o, s.__b = o.__b + 1, d = null, (p = s.__i = Te(s, i, b, _)) != -1 && (_--, (d = i[p]) && (d.__u |= 2)), d == null || d.__v == null ? (p == -1 && (n > h ? t-- : n < h && t++), typeof s.type != "function" && (s.__u |= 4)) : p != b && (p == b - 1 ? t-- : p == b + 1 ? t++ : (p > b ? t-- : t++, s.__u |= 4))) : o.__k[c] = null;
  if (_) for (c = 0; c < h; c++) (d = i[c]) != null && !(2 & d.__u) && (d.__e == a && (a = X(d)), se(d, d));
  return a;
}
function ce(o, e, i, a) {
  var n, c;
  if (typeof o.type == "function") {
    for (n = o.__k, c = 0; n && c < n.length; c++) n[c] && (n[c].__ = o, e = ce(n[c], e, i, a));
    return e;
  }
  o.__e != e && (a && (e && o.type && !e.parentNode && (e = X(o)), i.insertBefore(o.__e, e || null)), e = o.__e);
  do
    e = e && e.nextSibling;
  while (e != null && e.nodeType == 8);
  return e;
}
function Te(o, e, i, a) {
  var n, c, s, d = o.key, b = o.type, p = e[i], h = p != null && (2 & p.__u) == 0;
  if (p === null && d == null || h && d == p.key && b == p.type) return i;
  if (a > (h ? 1 : 0)) {
    for (n = i - 1, c = i + 1; n >= 0 || c < e.length; ) if ((p = e[s = n >= 0 ? n-- : c++]) != null && !(2 & p.__u) && d == p.key && b == p.type) return s;
  }
  return -1;
}
function Bo(o, e, i) {
  e[0] == "-" ? o.setProperty(e, i ?? "") : o[e] = i == null ? "" : typeof i != "number" || Ee.test(e) ? i : i + "px";
}
function co(o, e, i, a, n) {
  var c, s;
  o: if (e == "style") if (typeof i == "string") o.style.cssText = i;
  else {
    if (typeof a == "string" && (o.style.cssText = a = ""), a) for (e in a) i && e in i || Bo(o.style, e, "");
    if (i) for (e in i) a && i[e] == a[e] || Bo(o.style, e, i[e]);
  }
  else if (e[0] == "o" && e[1] == "n") c = e != (e = e.replace(ie, "$1")), s = e.toLowerCase(), e = s in o || e == "onFocusOut" || e == "onFocusIn" ? s.slice(2) : e.slice(2), o.l || (o.l = {}), o.l[e + c] = i, i ? a ? i[oo] = a[oo] : (i[oo] = zo, o.addEventListener(e, c ? xo : _o, c)) : o.removeEventListener(e, c ? xo : _o, c);
  else {
    if (n == "http://www.w3.org/2000/svg") e = e.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if (e != "width" && e != "height" && e != "href" && e != "list" && e != "form" && e != "tabIndex" && e != "download" && e != "rowSpan" && e != "colSpan" && e != "role" && e != "popover" && e in o) try {
      o[e] = i ?? "";
      break o;
    } catch {
    }
    typeof i == "function" || (i == null || i === !1 && e[4] != "-" ? o.removeAttribute(e) : o.setAttribute(e, e == "popover" && i == 1 ? "" : i));
  }
}
function Ho(o) {
  return function(e) {
    if (this.l) {
      var i = this.l[e.type + o];
      if (e[no] == null) e[no] = zo++;
      else if (e[no] < i[oo]) return;
      return i(z.event ? z.event(e) : e);
    }
  };
}
function So(o, e, i, a, n, c, s, d, b, p) {
  var h, _, t, u, g, A, k, w, x, P, q, R, O, B, $, I, D = e.type;
  if (e.constructor !== void 0) return null;
  128 & i.__u && (b = !!(32 & i.__u), c = [d = e.__e = i.__e]), (h = z.__b) && h(e);
  o: if (typeof D == "function") {
    _ = s.length;
    try {
      if (x = e.props, P = D.prototype && D.prototype.render, q = (h = D.contextType) && a[h.__c], R = h ? q ? q.props.value : h.__ : a, i.__c ? w = (t = e.__c = i.__c).__ = t.__E : (P ? e.__c = t = new D(x, R) : (e.__c = t = new po(x, R), t.constructor = D, t.render = Ie), q && q.sub(t), t.state || (t.state = {}), t.__n = a, u = t.__d = !0, t.__h = [], t._sb = []), P && t.__s == null && (t.__s = t.state), P && D.getDerivedStateFromProps != null && (t.__s == t.state && (t.__s = L({}, t.__s)), L(t.__s, D.getDerivedStateFromProps(x, t.__s))), g = t.props, A = t.state, t.__v = e, u) P && D.getDerivedStateFromProps == null && t.componentWillMount != null && t.componentWillMount(), P && t.componentDidMount != null && t.__h.push(t.componentDidMount);
      else {
        if (P && D.getDerivedStateFromProps == null && x !== g && t.componentWillReceiveProps != null && t.componentWillReceiveProps(x, R), e.__v == i.__v || !t.__e && t.shouldComponentUpdate != null && t.shouldComponentUpdate(x, t.__s, R) === !1) {
          e.__v != i.__v && (t.props = x, t.state = t.__s, t.__d = !1), e.__e = i.__e, e.__k = i.__k, e.__k.some(function(N) {
            N && (N.__ = e);
          }), mo.push.apply(t.__h, t._sb), t._sb = [], t.__h.length && s.push(t);
          break o;
        }
        t.componentWillUpdate != null && t.componentWillUpdate(x, t.__s, R), P && t.componentDidUpdate != null && t.__h.push(function() {
          t.componentDidUpdate(g, A, k);
        });
      }
      if (t.context = R, t.props = x, t.__P = o, t.__e = !1, O = z.__r, B = 0, P) t.state = t.__s, t.__d = !1, O && O(e), h = t.render(t.props, t.state, t.context), mo.push.apply(t.__h, t._sb), t._sb = [];
      else do
        t.__d = !1, O && O(e), h = t.render(t.props, t.state, t.context), t.state = t.__s;
      while (t.__d && ++B < 25);
      t.state = t.__s, t.getChildContext != null && (a = L(L({}, a), t.getChildContext())), P && !u && t.getSnapshotBeforeUpdate != null && (k = t.getSnapshotBeforeUpdate(g, A)), $ = h != null && h.type === J && h.key == null ? pe(h.props.children) : h, d = ae(o, fo($) ? $ : [$], e, i, a, n, c, s, d, b, p), t.base = e.__e, e.__u &= -161, t.__h.length && s.push(t), w && (t.__E = t.__ = null);
    } catch (N) {
      if (s.length = _, e.__v = null, b || c != null) {
        if (N.then) {
          for (e.__u |= b ? 160 : 128; d && d.nodeType == 8 && d.nextSibling; ) d = d.nextSibling;
          c != null && (c[c.indexOf(d)] = null), e.__e = d;
        } else if (c != null) for (I = c.length; I--; ) Ao(c[I]);
      } else e.__e = i.__e;
      e.__k == null && (e.__k = i.__k || []), N.then || ne(e), z.__e(N, e, i);
    }
  } else c == null && e.__v == i.__v ? (e.__k = i.__k, e.__e = i.__e) : d = e.__e = Pe(i.__e, e, i, a, n, c, s, b, p);
  return (h = z.diffed) && h(e), 128 & e.__u ? void 0 : d;
}
function ne(o) {
  o && (o.__c && (o.__c.__e = !0), o.__k && o.__k.some(ne));
}
function le(o, e, i) {
  for (var a = 0; a < i.length; a++) To(i[a], i[++a], i[++a]);
  z.__c && z.__c(e, o), o.some(function(n) {
    try {
      o = n.__h, n.__h = [], o.some(function(c) {
        c.call(n);
      });
    } catch (c) {
      z.__e(c, n.__v);
    }
  });
}
function pe(o) {
  return typeof o != "object" || o == null || o.__b > 0 ? o : fo(o) ? o.map(pe) : o.constructor !== void 0 ? null : L({}, o);
}
function Pe(o, e, i, a, n, c, s, d, b) {
  var p, h, _, t, u, g, A, k = i.props || uo, w = e.props, x = e.type;
  if (x == "svg" ? n = "http://www.w3.org/2000/svg" : x == "math" ? n = "http://www.w3.org/1998/Math/MathML" : n || (n = "http://www.w3.org/1999/xhtml"), c != null) {
    for (p = 0; p < c.length; p++) if ((u = c[p]) && "setAttribute" in u == !!x && (x ? u.localName == x : u.nodeType == 3)) {
      o = u, c[p] = null;
      break;
    }
  }
  if (o == null) {
    if (x == null) return document.createTextNode(w);
    o = document.createElementNS(n, x, w.is && w), d && (z.__m && z.__m(e, c), d = !1), c = null;
  }
  if (x == null) k === w || d && o.data == w || (o.data = w);
  else {
    if (c = x == "textarea" && w.defaultValue != null ? null : c && ho.call(o.childNodes), !d && c != null) for (k = {}, p = 0; p < o.attributes.length; p++) k[(u = o.attributes[p]).name] = u.value;
    for (p in k) u = k[p], p == "dangerouslySetInnerHTML" ? _ = u : p == "children" || p in w || p == "value" && "defaultValue" in w || p == "checked" && "defaultChecked" in w || co(o, p, null, u, n);
    for (p in w) u = w[p], p == "children" ? t = u : p == "dangerouslySetInnerHTML" ? h = u : p == "value" ? g = u : p == "checked" ? A = u : d && typeof u != "function" || k[p] === u || co(o, p, u, k[p], n);
    if (h) d || _ && (h.__html == _.__html || h.__html == o.innerHTML) || (o.innerHTML = h.__html), e.__k = [];
    else if (_ && (o.innerHTML = ""), ae(e.type == "template" ? o.content : o, fo(t) ? t : [t], e, i, a, x == "foreignObject" ? "http://www.w3.org/1999/xhtml" : n, c, s, c ? c[0] : i.__k && X(i, 0), d, b), c != null) for (p = c.length; p--; ) Ao(c[p]);
    d && x != "textarea" || (p = "value", x == "progress" && g == null ? o.removeAttribute("value") : g != null && (g !== o[p] || x == "progress" && !g || x == "option" && g != k[p]) && co(o, p, g, k[p], n), p = "checked", A != null && A != o[p] && co(o, p, A, k[p], n));
  }
  return o;
}
function To(o, e, i) {
  try {
    if (typeof o == "function") {
      var a = typeof o.__u == "function";
      a && o.__u(), a && e == null || (o.__u = o(e));
    } else o.current = e;
  } catch (n) {
    z.__e(n, i);
  }
}
function se(o, e, i) {
  var a, n;
  if (z.unmount && z.unmount(o), (a = o.ref) && (a.current && a.current != o.__e || To(a, null, e)), (a = o.__c) != null) {
    if (a.componentWillUnmount) try {
      a.componentWillUnmount();
    } catch (c) {
      z.__e(c, e);
    }
    a.base = a.__P = a.__n = null;
  }
  if (a = o.__k) for (n = 0; n < a.length; n++) a[n] && se(a[n], e, i || typeof o.type != "function");
  i || Ao(o.__e), o.__c = o.__ = o.__e = void 0;
}
function Ie(o, e, i) {
  return this.constructor(o, i);
}
function Mo(o, e, i) {
  var a, n, c, s;
  e == document && (e = document.documentElement), z.__ && z.__(o, e), n = (a = !1) ? null : e.__k, c = [], s = [], So(e, o = e.__k = ze(J, null, [o]), n || uo, uo, e.namespaceURI, n ? null : e.firstChild ? ho.call(e.childNodes) : null, c, n ? n.__e : e.firstChild, a, s), le(c, o, s), o.props.children = null;
}
ho = mo.slice, z = { __e: function(o, e, i, a) {
  for (var n, c, s; e = e.__; ) if ((n = e.__c) && !n.__) try {
    if ((c = n.constructor) && c.getDerivedStateFromError != null && (n.setState(c.getDerivedStateFromError(o)), s = n.__d), n.componentDidCatch != null && (n.componentDidCatch(o, a || {}), s = n.__d), s) return n.__E = n;
  } catch (d) {
    o = d;
  }
  throw o;
} }, oe = 0, po.prototype.setState = function(o, e) {
  var i;
  i = this.__s != null && this.__s != this.state ? this.__s : this.__s = L({}, this.state), typeof o == "function" && (o = o(L({}, i), this.props)), o && L(i, o), o != null && this.__v && (e && this._sb.push(e), Oo(this));
}, po.prototype.forceUpdate = function(o) {
  this.__v && (this.__e = !0, o && this.__h.push(o), Oo(this));
}, po.prototype.render = J, F = [], ee = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, re = function(o, e) {
  return o.__v.__b - e.__v.__b;
}, bo.__r = 0, ko = Math.random().toString(8), no = "__d" + ko, oo = "__a" + ko, ie = /(PointerCapture)$|Capture$/i, zo = 0, _o = Ho(!1), xo = Ho(!0);
var De = 0;
function r(o, e, i, a, n, c) {
  e || (e = {});
  var s, d, b = e;
  if ("ref" in b) for (d in b = {}, e) d == "ref" ? s = e[d] : b[d] = e[d];
  var p = { type: o, props: b, key: i, ref: s, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --De, __i: -1, __u: 0, __source: n, __self: c };
  if (typeof o == "function" && (s = o.defaultProps)) for (d in s) b[d] === void 0 && (b[d] = s[d]);
  return z.vnode && z.vnode(p), p;
}
const Re = `@charset "UTF-8";@layer pico,joy;@layer pico{/*!
 * Pico CSS ✨ v2.1.1 (https://picocss.com)
 * Copyright 2019-2025 - Licensed under MIT
 */:host,:root{--pico-font-family-emoji:"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--pico-font-family-sans-serif:system-ui,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,Helvetica,Arial,"Helvetica Neue",sans-serif,var(--pico-font-family-emoji);--pico-font-family-monospace:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace,var(--pico-font-family-emoji);--pico-font-family:var(--pico-font-family-sans-serif);--pico-line-height:1.5;--pico-font-weight:400;--pico-font-size:100%;--pico-text-underline-offset:.1rem;--pico-border-radius:.25rem;--pico-border-width:.0625rem;--pico-outline-width:.125rem;--pico-transition:.2s ease-in-out;--pico-spacing:1rem;--pico-typography-spacing-vertical:1rem;--pico-block-spacing-vertical:var(--pico-spacing);--pico-block-spacing-horizontal:var(--pico-spacing);--pico-grid-column-gap:var(--pico-spacing);--pico-grid-row-gap:var(--pico-spacing);--pico-form-element-spacing-vertical:.75rem;--pico-form-element-spacing-horizontal:1rem;--pico-group-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-group-box-shadow-focus-with-button:0 0 0 var(--pico-outline-width) var(--pico-primary-focus);--pico-group-box-shadow-focus-with-input:0 0 0 .0625rem var(--pico-form-element-border-color);--pico-modal-overlay-backdrop-filter:blur(.375rem);--pico-nav-element-spacing-vertical:1rem;--pico-nav-element-spacing-horizontal:.5rem;--pico-nav-link-spacing-vertical:.5rem;--pico-nav-link-spacing-horizontal:.5rem;--pico-nav-breadcrumb-divider:">";--pico-icon-checkbox:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-minus:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3C/svg%3E");--pico-icon-chevron:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-date:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");--pico-icon-time:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-search:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");--pico-icon-close:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E");--pico-icon-loading:url("data:image/svg+xml,%3Csvg fill='none' height='24' width='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' %3E%3Cstyle%3E g %7B animation: rotate 2s linear infinite; transform-origin: center center; %7D circle %7B stroke-dasharray: 75,100; stroke-dashoffset: -5; animation: dash 1.5s ease-in-out infinite; stroke-linecap: round; %7D @keyframes rotate %7B 0%25 %7B transform: rotate(0deg); %7D 100%25 %7B transform: rotate(360deg); %7D %7D @keyframes dash %7B 0%25 %7B stroke-dasharray: 1,100; stroke-dashoffset: 0; %7D 50%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -17.5; %7D 100%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -62; %7D %7D %3C/style%3E%3Cg%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='rgb(136, 145, 164)' stroke-width='4' /%3E%3C/g%3E%3C/svg%3E")}@media (min-width:576px){:host,:root{--pico-font-size:106.25%}}@media (min-width:768px){:host,:root{--pico-font-size:112.5%}}@media (min-width:1024px){:host,:root{--pico-font-size:118.75%}}@media (min-width:1280px){:host,:root{--pico-font-size:125%}}@media (min-width:1536px){:host,:root{--pico-font-size:131.25%}}a,a.contrast,a.secondary{--pico-text-decoration:underline}small{--pico-font-size:.875em}h1,h2,h3,h4,h5,h6{--pico-font-weight:700}h1{--pico-font-size:2rem;--pico-line-height:1.125;--pico-typography-spacing-top:3rem}h2{--pico-font-size:1.75rem;--pico-line-height:1.15;--pico-typography-spacing-top:2.625rem}h3{--pico-font-size:1.5rem;--pico-line-height:1.175;--pico-typography-spacing-top:2.25rem}h4{--pico-font-size:1.25rem;--pico-line-height:1.2;--pico-typography-spacing-top:1.874rem}h5{--pico-font-size:1.125rem;--pico-line-height:1.225;--pico-typography-spacing-top:1.6875rem}h6{--pico-font-size:1rem;--pico-line-height:1.25;--pico-typography-spacing-top:1.5rem}tfoot td,tfoot th,thead td,thead th{--pico-font-weight:600;--pico-border-width:.1875rem}code,kbd,pre,samp{--pico-font-family:var(--pico-font-family-monospace)}kbd{--pico-font-weight:bolder}:where(select,textarea),input:not([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-outline-width:.0625rem}[type=search]{--pico-border-radius:5rem}[type=checkbox],[type=radio]{--pico-border-width:.125rem}[type=checkbox][role=switch]{--pico-border-width:.1875rem}details.dropdown summary:not([role=button]){--pico-outline-width:.0625rem}nav details.dropdown summary:focus-visible{--pico-outline-width:.125rem}[role=search]{--pico-border-radius:5rem}[role=group]:has(button.secondary:focus,[type=submit].secondary:focus,[type=button].secondary:focus,[role=button].secondary:focus),[role=search]:has(button.secondary:focus,[type=submit].secondary:focus,[type=button].secondary:focus,[role=button].secondary:focus){--pico-group-box-shadow-focus-with-button:0 0 0 var(--pico-outline-width) var(--pico-secondary-focus)}[role=group]:has(button.contrast:focus,[type=submit].contrast:focus,[type=button].contrast:focus,[role=button].contrast:focus),[role=search]:has(button.contrast:focus,[type=submit].contrast:focus,[type=button].contrast:focus,[role=button].contrast:focus){--pico-group-box-shadow-focus-with-button:0 0 0 var(--pico-outline-width) var(--pico-contrast-focus)}[role=group] [role=button],[role=group] [type=button],[role=group] [type=submit],[role=group] button,[role=search] [role=button],[role=search] [type=button],[role=search] [type=submit],[role=search] button{--pico-form-element-spacing-horizontal:2rem}.pico details summary[role=button]:not(.outline):after{filter:brightness(0) invert(1)}.pico [aria-busy=true]:not(input,select,textarea):is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before{filter:brightness(0) invert(1)}:host(:not([data-theme=dark])),:root:not([data-theme=dark]),[data-theme=light]{color-scheme:light;--pico-background-color:#fff;--pico-color:#373c44;--pico-text-selection-color:rgba(2, 154, 232, .25);--pico-muted-color:#646b79;--pico-muted-border-color:rgb(231, 234, 239.5);--pico-primary:#0172ad;--pico-primary-background:#0172ad;--pico-primary-border:var(--pico-primary-background);--pico-primary-underline:rgba(1, 114, 173, .5);--pico-primary-hover:#015887;--pico-primary-hover-background:#02659a;--pico-primary-hover-border:var(--pico-primary-hover-background);--pico-primary-hover-underline:var(--pico-primary-hover);--pico-primary-focus:rgba(2, 154, 232, .5);--pico-primary-inverse:#fff;--pico-secondary:#5d6b89;--pico-secondary-background:#525f7a;--pico-secondary-border:var(--pico-secondary-background);--pico-secondary-underline:rgba(93, 107, 137, .5);--pico-secondary-hover:#48536b;--pico-secondary-hover-background:#48536b;--pico-secondary-hover-border:var(--pico-secondary-hover-background);--pico-secondary-hover-underline:var(--pico-secondary-hover);--pico-secondary-focus:rgba(93, 107, 137, .25);--pico-secondary-inverse:#fff;--pico-contrast:#181c25;--pico-contrast-background:#181c25;--pico-contrast-border:var(--pico-contrast-background);--pico-contrast-underline:rgba(24, 28, 37, .5);--pico-contrast-hover:#000;--pico-contrast-hover-background:#000;--pico-contrast-hover-border:var(--pico-contrast-hover-background);--pico-contrast-hover-underline:var(--pico-secondary-hover);--pico-contrast-focus:rgba(93, 107, 137, .25);--pico-contrast-inverse:#fff;--pico-box-shadow:.0145rem .029rem .174rem rgba(129, 145, 181, .01698),.0335rem .067rem .402rem rgba(129, 145, 181, .024),.0625rem .125rem .75rem rgba(129, 145, 181, .03),.1125rem .225rem 1.35rem rgba(129, 145, 181, .036),.2085rem .417rem 2.502rem rgba(129, 145, 181, .04302),.5rem 1rem 6rem rgba(129, 145, 181, .06),0 0 0 .0625rem rgba(129, 145, 181, .015);--pico-h1-color:#2d3138;--pico-h2-color:#373c44;--pico-h3-color:#424751;--pico-h4-color:#4d535e;--pico-h5-color:#5c6370;--pico-h6-color:#646b79;--pico-mark-background-color:rgb(252.5, 230.5, 191.5);--pico-mark-color:#0f1114;--pico-ins-color:rgb(28.5, 105.5, 84);--pico-del-color:rgb(136, 56.5, 53);--pico-blockquote-border-color:var(--pico-muted-border-color);--pico-blockquote-footer-color:var(--pico-muted-color);--pico-button-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-button-hover-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-table-border-color:var(--pico-muted-border-color);--pico-table-row-stripped-background-color:rgba(111, 120, 135, .0375);--pico-code-background-color:rgb(243, 244.5, 246.75);--pico-code-color:#646b79;--pico-code-kbd-background-color:var(--pico-color);--pico-code-kbd-color:var(--pico-background-color);--pico-form-element-background-color:rgb(251, 251.5, 252.25);--pico-form-element-selected-background-color:#dfe3eb;--pico-form-element-border-color:#cfd5e2;--pico-form-element-color:#23262c;--pico-form-element-placeholder-color:var(--pico-muted-color);--pico-form-element-active-background-color:#fff;--pico-form-element-active-border-color:var(--pico-primary-border);--pico-form-element-focus-color:var(--pico-primary-border);--pico-form-element-disabled-opacity:.5;--pico-form-element-invalid-border-color:rgb(183.5, 105.5, 106.5);--pico-form-element-invalid-active-border-color:rgb(200.25, 79.25, 72.25);--pico-form-element-invalid-focus-color:var(--pico-form-element-invalid-active-border-color);--pico-form-element-valid-border-color:rgb(76, 154.5, 137.5);--pico-form-element-valid-active-border-color:rgb(39, 152.75, 118.75);--pico-form-element-valid-focus-color:var(--pico-form-element-valid-active-border-color);--pico-switch-background-color:#bfc7d9;--pico-switch-checked-background-color:var(--pico-primary-background);--pico-switch-color:#fff;--pico-switch-thumb-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-range-border-color:#dfe3eb;--pico-range-active-border-color:#bfc7d9;--pico-range-thumb-border-color:var(--pico-background-color);--pico-range-thumb-color:var(--pico-secondary-background);--pico-range-thumb-active-color:var(--pico-primary-background);--pico-accordion-border-color:var(--pico-muted-border-color);--pico-accordion-active-summary-color:var(--pico-primary-hover);--pico-accordion-close-summary-color:var(--pico-color);--pico-accordion-open-summary-color:var(--pico-muted-color);--pico-card-background-color:var(--pico-background-color);--pico-card-border-color:var(--pico-muted-border-color);--pico-card-box-shadow:var(--pico-box-shadow);--pico-card-sectioning-background-color:rgb(251, 251.5, 252.25);--pico-dropdown-background-color:#fff;--pico-dropdown-border-color:#eff1f4;--pico-dropdown-box-shadow:var(--pico-box-shadow);--pico-dropdown-color:var(--pico-color);--pico-dropdown-hover-background-color:#eff1f4;--pico-loading-spinner-opacity:.5;--pico-modal-overlay-background-color:rgba(232, 234, 237, .75);--pico-progress-background-color:#dfe3eb;--pico-progress-color:var(--pico-primary-background);--pico-tooltip-background-color:var(--pico-contrast-background);--pico-tooltip-color:var(--pico-contrast-inverse);--pico-icon-valid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(76, 154.5, 137.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-invalid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(200.25, 79.25, 72.25)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E")}:host(:not([data-theme=dark])) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]),:root:not([data-theme=dark]) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]),[data-theme=light] input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-form-element-focus-color:var(--pico-primary-focus)}@media only screen and (prefers-color-scheme:dark){:host(:not([data-theme])),:root:not([data-theme]){color-scheme:dark;--pico-background-color:rgb(19, 22.5, 30.5);--pico-color:#c2c7d0;--pico-text-selection-color:rgba(1, 170, 255, .1875);--pico-muted-color:#7b8495;--pico-muted-border-color:#202632;--pico-primary:#01aaff;--pico-primary-background:#0172ad;--pico-primary-border:var(--pico-primary-background);--pico-primary-underline:rgba(1, 170, 255, .5);--pico-primary-hover:#79c0ff;--pico-primary-hover-background:#017fc0;--pico-primary-hover-border:var(--pico-primary-hover-background);--pico-primary-hover-underline:var(--pico-primary-hover);--pico-primary-focus:rgba(1, 170, 255, .375);--pico-primary-inverse:#fff;--pico-secondary:#969eaf;--pico-secondary-background:#525f7a;--pico-secondary-border:var(--pico-secondary-background);--pico-secondary-underline:rgba(150, 158, 175, .5);--pico-secondary-hover:#b3b9c5;--pico-secondary-hover-background:#5d6b89;--pico-secondary-hover-border:var(--pico-secondary-hover-background);--pico-secondary-hover-underline:var(--pico-secondary-hover);--pico-secondary-focus:rgba(144, 158, 190, .25);--pico-secondary-inverse:#fff;--pico-contrast:#dfe3eb;--pico-contrast-background:#eff1f4;--pico-contrast-border:var(--pico-contrast-background);--pico-contrast-underline:rgba(223, 227, 235, .5);--pico-contrast-hover:#fff;--pico-contrast-hover-background:#fff;--pico-contrast-hover-border:var(--pico-contrast-hover-background);--pico-contrast-hover-underline:var(--pico-contrast-hover);--pico-contrast-focus:rgba(207, 213, 226, .25);--pico-contrast-inverse:#000;--pico-box-shadow:.0145rem .029rem .174rem rgba(7, 8.5, 12, .01698),.0335rem .067rem .402rem rgba(7, 8.5, 12, .024),.0625rem .125rem .75rem rgba(7, 8.5, 12, .03),.1125rem .225rem 1.35rem rgba(7, 8.5, 12, .036),.2085rem .417rem 2.502rem rgba(7, 8.5, 12, .04302),.5rem 1rem 6rem rgba(7, 8.5, 12, .06),0 0 0 .0625rem rgba(7, 8.5, 12, .015);--pico-h1-color:#f0f1f3;--pico-h2-color:#e0e3e7;--pico-h3-color:#c2c7d0;--pico-h4-color:#b3b9c5;--pico-h5-color:#a4acba;--pico-h6-color:#8891a4;--pico-mark-background-color:#014063;--pico-mark-color:#fff;--pico-ins-color:#62af9a;--pico-del-color:rgb(205.5, 126, 123);--pico-blockquote-border-color:var(--pico-muted-border-color);--pico-blockquote-footer-color:var(--pico-muted-color);--pico-button-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-button-hover-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-table-border-color:var(--pico-muted-border-color);--pico-table-row-stripped-background-color:rgba(111, 120, 135, .0375);--pico-code-background-color:rgb(26, 30.5, 40.25);--pico-code-color:#8891a4;--pico-code-kbd-background-color:var(--pico-color);--pico-code-kbd-color:var(--pico-background-color);--pico-form-element-background-color:rgb(28, 33, 43.5);--pico-form-element-selected-background-color:#2a3140;--pico-form-element-border-color:#2a3140;--pico-form-element-color:#e0e3e7;--pico-form-element-placeholder-color:#8891a4;--pico-form-element-active-background-color:rgb(26, 30.5, 40.25);--pico-form-element-active-border-color:var(--pico-primary-border);--pico-form-element-focus-color:var(--pico-primary-border);--pico-form-element-disabled-opacity:.5;--pico-form-element-invalid-border-color:rgb(149.5, 74, 80);--pico-form-element-invalid-active-border-color:rgb(183.25, 63.5, 59);--pico-form-element-invalid-focus-color:var(--pico-form-element-invalid-active-border-color);--pico-form-element-valid-border-color:#2a7b6f;--pico-form-element-valid-active-border-color:rgb(22, 137, 105.5);--pico-form-element-valid-focus-color:var(--pico-form-element-valid-active-border-color);--pico-switch-background-color:#333c4e;--pico-switch-checked-background-color:var(--pico-primary-background);--pico-switch-color:#fff;--pico-switch-thumb-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-range-border-color:#202632;--pico-range-active-border-color:#2a3140;--pico-range-thumb-border-color:var(--pico-background-color);--pico-range-thumb-color:var(--pico-secondary-background);--pico-range-thumb-active-color:var(--pico-primary-background);--pico-accordion-border-color:var(--pico-muted-border-color);--pico-accordion-active-summary-color:var(--pico-primary-hover);--pico-accordion-close-summary-color:var(--pico-color);--pico-accordion-open-summary-color:var(--pico-muted-color);--pico-card-background-color:#181c25;--pico-card-border-color:var(--pico-card-background-color);--pico-card-box-shadow:var(--pico-box-shadow);--pico-card-sectioning-background-color:rgb(26, 30.5, 40.25);--pico-dropdown-background-color:#181c25;--pico-dropdown-border-color:#202632;--pico-dropdown-box-shadow:var(--pico-box-shadow);--pico-dropdown-color:var(--pico-color);--pico-dropdown-hover-background-color:#202632;--pico-loading-spinner-opacity:.5;--pico-modal-overlay-background-color:rgba(7.5, 8.5, 10, .75);--pico-progress-background-color:#202632;--pico-progress-color:var(--pico-primary-background);--pico-tooltip-background-color:var(--pico-contrast-background);--pico-tooltip-color:var(--pico-contrast-inverse);--pico-icon-valid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(42, 123, 111)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-invalid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(149.5, 74, 80)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E")}:host(:not([data-theme])) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]),:root:not([data-theme]) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-form-element-focus-color:var(--pico-primary-focus)}:host(:not([data-theme])) .pico details summary[role=button].contrast:not(.outline):after,:root:not([data-theme]) .pico details summary[role=button].contrast:not(.outline):after{filter:brightness(0)}:host(:not([data-theme])) .pico [aria-busy=true]:not(input,select,textarea).contrast:is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before,:root:not([data-theme]) .pico [aria-busy=true]:not(input,select,textarea).contrast:is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before{filter:brightness(0)}}[data-theme=dark]{color-scheme:dark;--pico-background-color:rgb(19, 22.5, 30.5);--pico-color:#c2c7d0;--pico-text-selection-color:rgba(1, 170, 255, .1875);--pico-muted-color:#7b8495;--pico-muted-border-color:#202632;--pico-primary:#01aaff;--pico-primary-background:#0172ad;--pico-primary-border:var(--pico-primary-background);--pico-primary-underline:rgba(1, 170, 255, .5);--pico-primary-hover:#79c0ff;--pico-primary-hover-background:#017fc0;--pico-primary-hover-border:var(--pico-primary-hover-background);--pico-primary-hover-underline:var(--pico-primary-hover);--pico-primary-focus:rgba(1, 170, 255, .375);--pico-primary-inverse:#fff;--pico-secondary:#969eaf;--pico-secondary-background:#525f7a;--pico-secondary-border:var(--pico-secondary-background);--pico-secondary-underline:rgba(150, 158, 175, .5);--pico-secondary-hover:#b3b9c5;--pico-secondary-hover-background:#5d6b89;--pico-secondary-hover-border:var(--pico-secondary-hover-background);--pico-secondary-hover-underline:var(--pico-secondary-hover);--pico-secondary-focus:rgba(144, 158, 190, .25);--pico-secondary-inverse:#fff;--pico-contrast:#dfe3eb;--pico-contrast-background:#eff1f4;--pico-contrast-border:var(--pico-contrast-background);--pico-contrast-underline:rgba(223, 227, 235, .5);--pico-contrast-hover:#fff;--pico-contrast-hover-background:#fff;--pico-contrast-hover-border:var(--pico-contrast-hover-background);--pico-contrast-hover-underline:var(--pico-contrast-hover);--pico-contrast-focus:rgba(207, 213, 226, .25);--pico-contrast-inverse:#000;--pico-box-shadow:.0145rem .029rem .174rem rgba(7, 8.5, 12, .01698),.0335rem .067rem .402rem rgba(7, 8.5, 12, .024),.0625rem .125rem .75rem rgba(7, 8.5, 12, .03),.1125rem .225rem 1.35rem rgba(7, 8.5, 12, .036),.2085rem .417rem 2.502rem rgba(7, 8.5, 12, .04302),.5rem 1rem 6rem rgba(7, 8.5, 12, .06),0 0 0 .0625rem rgba(7, 8.5, 12, .015);--pico-h1-color:#f0f1f3;--pico-h2-color:#e0e3e7;--pico-h3-color:#c2c7d0;--pico-h4-color:#b3b9c5;--pico-h5-color:#a4acba;--pico-h6-color:#8891a4;--pico-mark-background-color:#014063;--pico-mark-color:#fff;--pico-ins-color:#62af9a;--pico-del-color:rgb(205.5, 126, 123);--pico-blockquote-border-color:var(--pico-muted-border-color);--pico-blockquote-footer-color:var(--pico-muted-color);--pico-button-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-button-hover-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-table-border-color:var(--pico-muted-border-color);--pico-table-row-stripped-background-color:rgba(111, 120, 135, .0375);--pico-code-background-color:rgb(26, 30.5, 40.25);--pico-code-color:#8891a4;--pico-code-kbd-background-color:var(--pico-color);--pico-code-kbd-color:var(--pico-background-color);--pico-form-element-background-color:rgb(28, 33, 43.5);--pico-form-element-selected-background-color:#2a3140;--pico-form-element-border-color:#2a3140;--pico-form-element-color:#e0e3e7;--pico-form-element-placeholder-color:#8891a4;--pico-form-element-active-background-color:rgb(26, 30.5, 40.25);--pico-form-element-active-border-color:var(--pico-primary-border);--pico-form-element-focus-color:var(--pico-primary-border);--pico-form-element-disabled-opacity:.5;--pico-form-element-invalid-border-color:rgb(149.5, 74, 80);--pico-form-element-invalid-active-border-color:rgb(183.25, 63.5, 59);--pico-form-element-invalid-focus-color:var(--pico-form-element-invalid-active-border-color);--pico-form-element-valid-border-color:#2a7b6f;--pico-form-element-valid-active-border-color:rgb(22, 137, 105.5);--pico-form-element-valid-focus-color:var(--pico-form-element-valid-active-border-color);--pico-switch-background-color:#333c4e;--pico-switch-checked-background-color:var(--pico-primary-background);--pico-switch-color:#fff;--pico-switch-thumb-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-range-border-color:#202632;--pico-range-active-border-color:#2a3140;--pico-range-thumb-border-color:var(--pico-background-color);--pico-range-thumb-color:var(--pico-secondary-background);--pico-range-thumb-active-color:var(--pico-primary-background);--pico-accordion-border-color:var(--pico-muted-border-color);--pico-accordion-active-summary-color:var(--pico-primary-hover);--pico-accordion-close-summary-color:var(--pico-color);--pico-accordion-open-summary-color:var(--pico-muted-color);--pico-card-background-color:#181c25;--pico-card-border-color:var(--pico-card-background-color);--pico-card-box-shadow:var(--pico-box-shadow);--pico-card-sectioning-background-color:rgb(26, 30.5, 40.25);--pico-dropdown-background-color:#181c25;--pico-dropdown-border-color:#202632;--pico-dropdown-box-shadow:var(--pico-box-shadow);--pico-dropdown-color:var(--pico-color);--pico-dropdown-hover-background-color:#202632;--pico-loading-spinner-opacity:.5;--pico-modal-overlay-background-color:rgba(7.5, 8.5, 10, .75);--pico-progress-background-color:#202632;--pico-progress-color:var(--pico-primary-background);--pico-tooltip-background-color:var(--pico-contrast-background);--pico-tooltip-color:var(--pico-contrast-inverse);--pico-icon-valid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(42, 123, 111)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-invalid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(149.5, 74, 80)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E")}[data-theme=dark] input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-form-element-focus-color:var(--pico-primary-focus)}[data-theme=dark] .pico details summary[role=button].contrast:not(.outline):after{filter:brightness(0)}[data-theme=dark] .pico [aria-busy=true]:not(input,select,textarea).contrast:is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before{filter:brightness(0)}.pico [type=checkbox],.pico [type=radio],.pico [type=range],.pico progress{accent-color:var(--pico-primary)}*,:after,:before{box-sizing:border-box;background-repeat:no-repeat}:after,:before{text-decoration:inherit;vertical-align:inherit}:where(:host),:where(:root){-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;text-size-adjust:100%;background-color:var(--pico-background-color);color:var(--pico-color);font-weight:var(--pico-font-weight);font-size:var(--pico-font-size);line-height:var(--pico-line-height);font-family:var(--pico-font-family);text-underline-offset:var(--pico-text-underline-offset);text-rendering:optimizeLegibility;overflow-wrap:break-word;-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{width:100%;margin:0}main{display:block}.pico body>footer,.pico body>header,.pico body>main{padding-block:var(--pico-block-spacing-vertical)}.pico section{margin-bottom:var(--pico-block-spacing-vertical)}.container,.container-fluid{width:100%;margin-right:auto;margin-left:auto;padding-right:var(--pico-spacing);padding-left:var(--pico-spacing)}@media (min-width:576px){.container{max-width:510px;padding-right:0;padding-left:0}}@media (min-width:768px){.container{max-width:700px}}@media (min-width:1024px){.container{max-width:950px}}@media (min-width:1280px){.container{max-width:1200px}}@media (min-width:1536px){.container{max-width:1450px}}.grid{grid-column-gap:var(--pico-grid-column-gap);grid-row-gap:var(--pico-grid-row-gap);display:grid;grid-template-columns:1fr}@media (min-width:768px){.grid{grid-template-columns:repeat(auto-fit,minmax(0%,1fr))}}.grid>*{min-width:0}.pico .overflow-auto{overflow:auto}.pico b,.pico strong{font-weight:bolder}.pico sub,.pico sup{position:relative;font-size:.75em;line-height:0;vertical-align:baseline}.pico sub{bottom:-.25em}.pico sup{top:-.5em}.pico address,.pico blockquote,.pico dl,.pico ol,.pico p,.pico pre,.pico table,.pico ul{margin-top:0;margin-bottom:var(--pico-typography-spacing-vertical);color:var(--pico-color);font-style:normal;font-weight:var(--pico-font-weight)}.pico h1,.pico h2,.pico h3,.pico h4,.pico h5,.pico h6{margin-top:0;margin-bottom:var(--pico-typography-spacing-vertical);color:var(--pico-color);font-weight:var(--pico-font-weight);font-size:var(--pico-font-size);line-height:var(--pico-line-height);font-family:var(--pico-font-family)}.pico h1{--pico-color:var(--pico-h1-color)}.pico h2{--pico-color:var(--pico-h2-color)}.pico h3{--pico-color:var(--pico-h3-color)}.pico h4{--pico-color:var(--pico-h4-color)}.pico h5{--pico-color:var(--pico-h5-color)}.pico h6{--pico-color:var(--pico-h6-color)}.pico :where(article,address,blockquote,dl,figure,form,ol,p,pre,table,ul)~:is(h1,h2,h3,h4,h5,h6){margin-top:var(--pico-typography-spacing-top)}.pico p{margin-bottom:var(--pico-typography-spacing-vertical)}.pico hgroup{margin-bottom:var(--pico-typography-spacing-vertical)}.pico hgroup>*{margin-top:0;margin-bottom:0}.pico hgroup>:not(:first-child):last-child{--pico-color:var(--pico-muted-color);--pico-font-weight:unset;font-size:1rem}.pico :where(ol,ul) li{margin-bottom:calc(var(--pico-typography-spacing-vertical) * .25)}.pico :where(dl,ol,ul) :where(dl,ol,ul){margin:0;margin-top:calc(var(--pico-typography-spacing-vertical) * .25)}.pico ul li{list-style:square}.pico mark{padding:.125rem .25rem;background-color:var(--pico-mark-background-color);color:var(--pico-mark-color);vertical-align:baseline}.pico blockquote{display:block;margin:var(--pico-typography-spacing-vertical) 0;padding:var(--pico-spacing);border-right:none;border-left:.25rem solid var(--pico-blockquote-border-color);border-inline-start:.25rem solid var(--pico-blockquote-border-color);border-inline-end:none}.pico blockquote footer{margin-top:calc(var(--pico-typography-spacing-vertical) * .5);color:var(--pico-blockquote-footer-color)}.pico abbr[title]{border-bottom:1px dotted;text-decoration:none;cursor:help}.pico ins{color:var(--pico-ins-color);text-decoration:none}.pico del{color:var(--pico-del-color)}.pico ::-moz-selection{background-color:var(--pico-text-selection-color)}.pico ::selection{background-color:var(--pico-text-selection-color)}.pico :where(a:not([role=button])),.pico [role=link]{--pico-color:var(--pico-primary);--pico-background-color:transparent;--pico-underline:var(--pico-primary-underline);outline:0;background-color:var(--pico-background-color);color:var(--pico-color);-webkit-text-decoration:var(--pico-text-decoration);text-decoration:var(--pico-text-decoration);text-decoration-color:var(--pico-underline);text-underline-offset:.125em;transition:background-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition),-webkit-text-decoration var(--pico-transition);transition:background-color var(--pico-transition),color var(--pico-transition),text-decoration var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),color var(--pico-transition),text-decoration var(--pico-transition),box-shadow var(--pico-transition),-webkit-text-decoration var(--pico-transition)}.pico :where(a:not([role=button])):is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [role=link]:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-primary-hover);--pico-underline:var(--pico-primary-hover-underline);--pico-text-decoration:underline}.pico :where(a:not([role=button])):focus-visible,.pico [role=link]:focus-visible{box-shadow:0 0 0 var(--pico-outline-width) var(--pico-primary-focus)}.pico :where(a:not([role=button])).secondary,.pico [role=link].secondary{--pico-color:var(--pico-secondary);--pico-underline:var(--pico-secondary-underline)}.pico :where(a:not([role=button])).secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [role=link].secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-secondary-hover);--pico-underline:var(--pico-secondary-hover-underline)}.pico :where(a:not([role=button])).contrast,.pico [role=link].contrast{--pico-color:var(--pico-contrast);--pico-underline:var(--pico-contrast-underline)}.pico :where(a:not([role=button])).contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [role=link].contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-contrast-hover);--pico-underline:var(--pico-contrast-hover-underline)}.pico a[role=button]{display:inline-block}.pico button{margin:0;overflow:visible;font-family:inherit;text-transform:none}.pico [type=button],.pico [type=reset],.pico [type=submit],.pico button{-webkit-appearance:button}.pico [role=button],.pico [type=button],.pico [type=file]::file-selector-button,.pico [type=reset],.pico [type=submit],.pico button{--pico-background-color:var(--pico-primary-background);--pico-border-color:var(--pico-primary-border);--pico-color:var(--pico-primary-inverse);--pico-box-shadow:var(--pico-button-box-shadow, 0 0 0 rgba(0, 0, 0, 0));padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);border:var(--pico-border-width) solid var(--pico-border-color);border-radius:var(--pico-border-radius);outline:0;background-color:var(--pico-background-color);box-shadow:var(--pico-box-shadow);color:var(--pico-color);font-weight:var(--pico-font-weight);font-size:1rem;line-height:var(--pico-line-height);text-align:center;text-decoration:none;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none;transition:background-color var(--pico-transition),border-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition)}.pico [role=button]:is(:hover,:active,:focus),.pico [role=button]:is([aria-current]:not([aria-current=false])),.pico [type=button]:is(:hover,:active,:focus),.pico [type=button]:is([aria-current]:not([aria-current=false])),.pico [type=file]::file-selector-button:is(:hover,:active,:focus),.pico [type=file]::file-selector-button:is([aria-current]:not([aria-current=false])),.pico [type=reset]:is(:hover,:active,:focus),.pico [type=reset]:is([aria-current]:not([aria-current=false])),.pico [type=submit]:is(:hover,:active,:focus),.pico [type=submit]:is([aria-current]:not([aria-current=false])),.pico button:is(:hover,:active,:focus),.pico button:is([aria-current]:not([aria-current=false])){--pico-background-color:var(--pico-primary-hover-background);--pico-border-color:var(--pico-primary-hover-border);--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0));--pico-color:var(--pico-primary-inverse)}.pico [role=button]:focus,.pico [role=button]:is([aria-current]:not([aria-current=false])):focus,.pico [type=button]:focus,.pico [type=button]:is([aria-current]:not([aria-current=false])):focus,.pico [type=file]::file-selector-button:focus,.pico [type=file]::file-selector-button:is([aria-current]:not([aria-current=false])):focus,.pico [type=reset]:focus,.pico [type=reset]:is([aria-current]:not([aria-current=false])):focus,.pico [type=submit]:focus,.pico [type=submit]:is([aria-current]:not([aria-current=false])):focus,.pico button:focus,.pico button:is([aria-current]:not([aria-current=false])):focus{--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),0 0 0 var(--pico-outline-width) var(--pico-primary-focus)}.pico [type=button],.pico [type=reset],.pico [type=submit]{margin-bottom:var(--pico-spacing)}.pico :is(button,[type=submit],[type=button],[role=button]).secondary,.pico [type=file]::file-selector-button,.pico [type=reset]{--pico-background-color:var(--pico-secondary-background);--pico-border-color:var(--pico-secondary-border);--pico-color:var(--pico-secondary-inverse);cursor:pointer}.pico :is(button,[type=submit],[type=button],[role=button]).secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [type=file]::file-selector-button:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [type=reset]:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-background-color:var(--pico-secondary-hover-background);--pico-border-color:var(--pico-secondary-hover-border);--pico-color:var(--pico-secondary-inverse)}.pico :is(button,[type=submit],[type=button],[role=button]).secondary:focus,.pico :is(button,[type=submit],[type=button],[role=button]).secondary:is([aria-current]:not([aria-current=false])):focus,.pico [type=file]::file-selector-button:focus,.pico [type=file]::file-selector-button:is([aria-current]:not([aria-current=false])):focus,.pico [type=reset]:focus,.pico [type=reset]:is([aria-current]:not([aria-current=false])):focus{--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),0 0 0 var(--pico-outline-width) var(--pico-secondary-focus)}.pico :is(button,[type=submit],[type=button],[role=button]).contrast{--pico-background-color:var(--pico-contrast-background);--pico-border-color:var(--pico-contrast-border);--pico-color:var(--pico-contrast-inverse)}.pico :is(button,[type=submit],[type=button],[role=button]).contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-background-color:var(--pico-contrast-hover-background);--pico-border-color:var(--pico-contrast-hover-border);--pico-color:var(--pico-contrast-inverse)}.pico :is(button,[type=submit],[type=button],[role=button]).contrast:focus,.pico :is(button,[type=submit],[type=button],[role=button]).contrast:is([aria-current]:not([aria-current=false])):focus{--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),0 0 0 var(--pico-outline-width) var(--pico-contrast-focus)}.pico :is(button,[type=submit],[type=button],[role=button]).outline,[type=reset].outline{--pico-background-color:transparent;--pico-color:var(--pico-primary);--pico-border-color:var(--pico-primary)}.pico :is(button,[type=submit],[type=button],[role=button]).outline:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),[type=reset].outline:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-background-color:transparent;--pico-color:var(--pico-primary-hover);--pico-border-color:var(--pico-primary-hover)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.secondary,[type=reset].outline{--pico-color:var(--pico-secondary);--pico-border-color:var(--pico-secondary)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),[type=reset].outline:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-secondary-hover);--pico-border-color:var(--pico-secondary-hover)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.contrast{--pico-color:var(--pico-contrast);--pico-border-color:var(--pico-contrast)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-contrast-hover);--pico-border-color:var(--pico-contrast-hover)}.pico :where(button,[type=submit],[type=reset],[type=button],[role=button])[disabled],.pico :where(fieldset[disabled]) :is(button,[type=submit],[type=button],[type=reset],[role=button]){opacity:.5;pointer-events:none}.pico :where(table){width:100%;border-collapse:collapse;border-spacing:0;text-indent:0}.pico td,.pico th{padding:calc(var(--pico-spacing)/ 2) var(--pico-spacing);border-bottom:var(--pico-border-width) solid var(--pico-table-border-color);background-color:var(--pico-background-color);color:var(--pico-color);font-weight:var(--pico-font-weight);text-align:left;text-align:start}.pico tfoot td,.pico tfoot th{border-top:var(--pico-border-width) solid var(--pico-table-border-color);border-bottom:0}.pico table.striped tbody tr:nth-child(odd) td,.pico table.striped tbody tr:nth-child(odd) th{background-color:var(--pico-table-row-stripped-background-color)}.pico :where(audio,canvas,iframe,img,svg,video){vertical-align:middle}.pico audio,.pico video{display:inline-block}.pico audio:not([controls]){display:none;height:0}.pico :where(iframe){border-style:none}.pico img{max-width:100%;height:auto;border-style:none}.pico :where(svg:not([fill])){fill:currentColor}.pico svg:not(:host),.pico svg:not(:root){overflow:hidden}.pico code,.pico kbd,.pico pre,.pico samp{font-size:.875em;font-family:var(--pico-font-family)}.pico pre code,.pico pre samp{font-size:inherit;font-family:inherit}.pico pre{-ms-overflow-style:scrollbar;overflow:auto}.pico code,.pico kbd,.pico pre,.pico samp{border-radius:var(--pico-border-radius);background:var(--pico-code-background-color);color:var(--pico-code-color);font-weight:var(--pico-font-weight);line-height:initial}.pico code,.pico kbd,.pico samp{display:inline-block;padding:.375rem}.pico pre{display:block;margin-bottom:var(--pico-spacing);overflow-x:auto}.pico pre>code,.pico pre>samp{display:block;padding:var(--pico-spacing);background:0 0;line-height:var(--pico-line-height)}.pico kbd{background-color:var(--pico-code-kbd-background-color);color:var(--pico-code-kbd-color);vertical-align:baseline}.pico figure{display:block;margin:0;padding:0}.pico figure figcaption{padding:calc(var(--pico-spacing) * .5) 0;color:var(--pico-muted-color)}.pico hr{height:0;margin:var(--pico-typography-spacing-vertical) 0;border:0;border-top:1px solid var(--pico-muted-border-color);color:inherit}.pico [hidden],.pico template{display:none!important}.pico canvas{display:inline-block}.pico input,.pico optgroup,.pico select,.pico textarea{margin:0;font-size:1rem;line-height:var(--pico-line-height);font-family:inherit;letter-spacing:inherit}.pico input{overflow:visible}.pico select{text-transform:none}.pico legend{max-width:100%;padding:0;color:inherit;white-space:normal}.pico textarea{overflow:auto}.pico [type=checkbox],.pico [type=radio]{padding:0}.pico ::-webkit-inner-spin-button,.pico ::-webkit-outer-spin-button{height:auto}.pico [type=search]{-webkit-appearance:textfield;outline-offset:-2px}.pico [type=search]::-webkit-search-decoration{-webkit-appearance:none}.pico ::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}.pico ::-moz-focus-inner{padding:0;border-style:none}.pico :-moz-focusring{outline:0}.pico :-moz-ui-invalid{box-shadow:none}.pico ::-ms-expand{display:none}.pico [type=file],.pico [type=range]{padding:0;border-width:0}.pico input:not([type=checkbox],[type=radio],[type=range]){height:calc(1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 + var(--pico-border-width) * 2)}.pico fieldset{width:100%;margin:0;margin-bottom:var(--pico-spacing);padding:0;border:0}.pico fieldset legend,.pico label{display:block;margin-bottom:calc(var(--pico-spacing) * .375);color:var(--pico-color);font-weight:var(--pico-form-label-font-weight,var(--pico-font-weight))}.pico fieldset legend{margin-bottom:calc(var(--pico-spacing) * .5)}.pico button[type=submit],.pico input:not([type=checkbox],[type=radio]),.pico select,.pico textarea{width:100%}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file]),.pico select,.pico textarea{-webkit-appearance:none;-moz-appearance:none;appearance:none;padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal)}.pico input,.pico select,.pico textarea{--pico-background-color:var(--pico-form-element-background-color);--pico-border-color:var(--pico-form-element-border-color);--pico-color:var(--pico-form-element-color);--pico-box-shadow:none;border:var(--pico-border-width) solid var(--pico-border-color);border-radius:var(--pico-border-radius);outline:0;background-color:var(--pico-background-color);box-shadow:var(--pico-box-shadow);color:var(--pico-color);font-weight:var(--pico-font-weight);transition:background-color var(--pico-transition),border-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition)}.pico :where(select,textarea):not([readonly]):is(:active,:focus),.pico input:not([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[readonly]):is(:active,:focus){--pico-background-color:var(--pico-form-element-active-background-color)}.pico :where(select,textarea):not([readonly]):is(:active,:focus),.pico input:not([type=submit],[type=button],[type=reset],[role=switch],[readonly]):is(:active,:focus){--pico-border-color:var(--pico-form-element-active-border-color)}.pico :where(select,textarea):not([readonly]):focus,.pico input:not([type=submit],[type=button],[type=reset],[type=range],[type=file],[readonly]):focus{--pico-box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-focus-color)}.pico :where(fieldset[disabled]) :is(input:not([type=submit],[type=button],[type=reset]),select,textarea),.pico input:not([type=submit],[type=button],[type=reset])[disabled],.pico label[aria-disabled=true],.pico select[disabled],.pico textarea[disabled]{opacity:var(--pico-form-element-disabled-opacity);pointer-events:none}.pico label[aria-disabled=true] input[disabled]{opacity:1}.pico :where(input,select,textarea):not([type=checkbox],[type=radio],[type=date],[type=datetime-local],[type=month],[type=time],[type=week],[type=range])[aria-invalid]{padding-right:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem)!important;padding-left:var(--pico-form-element-spacing-horizontal);padding-inline-start:var(--pico-form-element-spacing-horizontal)!important;padding-inline-end:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem)!important;background-position:center right .75rem;background-size:1rem auto;background-repeat:no-repeat}.pico :where(input,select,textarea):not([type=checkbox],[type=radio],[type=date],[type=datetime-local],[type=month],[type=time],[type=week],[type=range])[aria-invalid=false]:not(select){background-image:var(--pico-icon-valid)}.pico :where(input,select,textarea):not([type=checkbox],[type=radio],[type=date],[type=datetime-local],[type=month],[type=time],[type=week],[type=range])[aria-invalid=true]:not(select){background-image:var(--pico-icon-invalid)}.pico :where(input,select,textarea)[aria-invalid=false]{--pico-border-color:var(--pico-form-element-valid-border-color)}.pico :where(input,select,textarea)[aria-invalid=false]:is(:active,:focus){--pico-border-color:var(--pico-form-element-valid-active-border-color)!important}.pico :where(input,select,textarea)[aria-invalid=false]:is(:active,:focus):not([type=checkbox],[type=radio]){--pico-box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-valid-focus-color)!important}.pico :where(input,select,textarea)[aria-invalid=true]{--pico-border-color:var(--pico-form-element-invalid-border-color)}.pico :where(input,select,textarea)[aria-invalid=true]:is(:active,:focus){--pico-border-color:var(--pico-form-element-invalid-active-border-color)!important}.pico :where(input,select,textarea)[aria-invalid=true]:is(:active,:focus):not([type=checkbox],[type=radio]){--pico-box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-invalid-focus-color)!important}[dir=rtl] .pico :where(input,select,textarea):not([type=checkbox],[type=radio]):is([aria-invalid],[aria-invalid=true],[aria-invalid=false]){background-position:center left .75rem}.pico input::-webkit-input-placeholder,.pico input::placeholder,.pico select:invalid,.pico textarea::-webkit-input-placeholder,.pico textarea::placeholder{color:var(--pico-form-element-placeholder-color);opacity:1}.pico input:not([type=checkbox],[type=radio]),.pico select,.pico textarea{margin-bottom:var(--pico-spacing)}.pico select::-ms-expand{border:0;background-color:transparent}.pico select:not([multiple],[size]){padding-right:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem);padding-left:var(--pico-form-element-spacing-horizontal);padding-inline-start:var(--pico-form-element-spacing-horizontal);padding-inline-end:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem);background-image:var(--pico-icon-chevron);background-position:center right .75rem;background-size:1rem auto;background-repeat:no-repeat}.pico select[multiple] option:checked{background:var(--pico-form-element-selected-background-color);color:var(--pico-form-element-color)}[dir=rtl] .pico select:not([multiple],[size]){background-position:center left .75rem}.pico textarea{display:block;resize:vertical}.pico textarea[aria-invalid]{--pico-icon-height:calc(1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 + var(--pico-border-width) * 2);background-position:top right .75rem!important;background-size:1rem var(--pico-icon-height)!important}.pico :where(input,select,textarea,fieldset,.grid)+small{display:block;width:100%;margin-top:calc(var(--pico-spacing) * -.75);margin-bottom:var(--pico-spacing);color:var(--pico-muted-color)}.pico :where(input,select,textarea,fieldset,.grid)[aria-invalid=false]+small{color:var(--pico-ins-color)}.pico :where(input,select,textarea,fieldset,.grid)[aria-invalid=true]+small{color:var(--pico-del-color)}.pico label>:where(input,select,textarea){margin-top:calc(var(--pico-spacing) * .25)}.pico label:has([type=checkbox],[type=radio]){width:-moz-fit-content;width:fit-content;cursor:pointer}.pico [type=checkbox],.pico [type=radio]{-webkit-appearance:none;-moz-appearance:none;appearance:none;width:1.25em;height:1.25em;margin-top:-.125em;margin-inline-end:.5em;border-width:var(--pico-border-width);vertical-align:middle;cursor:pointer}.pico [type=checkbox]::-ms-check,.pico [type=radio]::-ms-check{display:none}.pico [type=checkbox]:checked,.pico [type=checkbox]:checked:active,.pico [type=checkbox]:checked:focus,.pico [type=radio]:checked,.pico [type=radio]:checked:active,.pico [type=radio]:checked:focus{--pico-background-color:var(--pico-primary-background);--pico-border-color:var(--pico-primary-border);background-image:var(--pico-icon-checkbox);background-position:center;background-size:.75em auto;background-repeat:no-repeat}.pico [type=checkbox]~label,.pico [type=radio]~label{display:inline-block;margin-bottom:0;cursor:pointer}.pico [type=checkbox]~label:not(:last-of-type),.pico [type=radio]~label:not(:last-of-type){margin-inline-end:1em}.pico [type=checkbox]:indeterminate{--pico-background-color:var(--pico-primary-background);--pico-border-color:var(--pico-primary-border);background-image:var(--pico-icon-minus);background-position:center;background-size:.75em auto;background-repeat:no-repeat}.pico [type=radio]{border-radius:50%}.pico [type=radio]:checked,.pico [type=radio]:checked:active,.pico [type=radio]:checked:focus{--pico-background-color:var(--pico-primary-inverse);border-width:.35em;background-image:none}.pico [type=checkbox][role=switch]{--pico-background-color:var(--pico-switch-background-color);--pico-color:var(--pico-switch-color);width:2.25em;height:1.25em;border:var(--pico-border-width) solid var(--pico-border-color);border-radius:1.25em;background-color:var(--pico-background-color);line-height:1.25em}.pico [type=checkbox][role=switch]:not([aria-invalid]){--pico-border-color:var(--pico-switch-background-color)}.pico [type=checkbox][role=switch]:before{display:block;aspect-ratio:1;height:100%;border-radius:50%;background-color:var(--pico-color);box-shadow:var(--pico-switch-thumb-box-shadow);content:"";transition:margin .1s ease-in-out}.pico [type=checkbox][role=switch]:focus{--pico-background-color:var(--pico-switch-background-color);--pico-border-color:var(--pico-switch-background-color)}.pico [type=checkbox][role=switch]:checked{--pico-background-color:var(--pico-switch-checked-background-color);--pico-border-color:var(--pico-switch-checked-background-color);background-image:none}.pico [type=checkbox][role=switch]:checked:before{margin-inline-start:1em}.pico [type=checkbox][role=switch][disabled]{--pico-background-color:var(--pico-border-color)}.pico [type=checkbox][aria-invalid=false]:checked,.pico [type=checkbox][aria-invalid=false]:checked:active,.pico [type=checkbox][aria-invalid=false]:checked:focus,.pico [type=checkbox][role=switch][aria-invalid=false]:checked,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:active,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:focus{--pico-background-color:var(--pico-form-element-valid-border-color)}.pico [type=checkbox]:checked:active[aria-invalid=true],.pico [type=checkbox]:checked:focus[aria-invalid=true],.pico [type=checkbox]:checked[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:active[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:focus[aria-invalid=true],.pico [type=checkbox][role=switch]:checked[aria-invalid=true]{--pico-background-color:var(--pico-form-element-invalid-border-color)}.pico [type=checkbox][aria-invalid=false]:checked,.pico [type=checkbox][aria-invalid=false]:checked:active,.pico [type=checkbox][aria-invalid=false]:checked:focus,.pico [type=checkbox][role=switch][aria-invalid=false]:checked,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:active,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:focus,.pico [type=radio][aria-invalid=false]:checked,.pico [type=radio][aria-invalid=false]:checked:active,.pico [type=radio][aria-invalid=false]:checked:focus{--pico-border-color:var(--pico-form-element-valid-border-color)}.pico [type=checkbox]:checked:active[aria-invalid=true],.pico [type=checkbox]:checked:focus[aria-invalid=true],.pico [type=checkbox]:checked[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:active[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:focus[aria-invalid=true],.pico [type=checkbox][role=switch]:checked[aria-invalid=true],.pico [type=radio]:checked:active[aria-invalid=true],.pico [type=radio]:checked:focus[aria-invalid=true],.pico [type=radio]:checked[aria-invalid=true]{--pico-border-color:var(--pico-form-element-invalid-border-color)}.pico [type=color]::-webkit-color-swatch-wrapper{padding:0}.pico [type=color]::-moz-focus-inner{padding:0}.pico [type=color]::-webkit-color-swatch{border:0;border-radius:calc(var(--pico-border-radius) * .5)}.pico [type=color]::-moz-color-swatch{border:0;border-radius:calc(var(--pico-border-radius) * .5)}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file]):is([type=date],[type=datetime-local],[type=month],[type=time],[type=week]){--pico-icon-position:.75rem;--pico-icon-width:1rem;padding-right:calc(var(--pico-icon-width) + var(--pico-icon-position));background-image:var(--pico-icon-date);background-position:center right var(--pico-icon-position);background-size:var(--pico-icon-width) auto;background-repeat:no-repeat}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=time]{background-image:var(--pico-icon-time)}.pico [type=date]::-webkit-calendar-picker-indicator,.pico [type=datetime-local]::-webkit-calendar-picker-indicator,.pico [type=month]::-webkit-calendar-picker-indicator,.pico [type=time]::-webkit-calendar-picker-indicator,.pico [type=week]::-webkit-calendar-picker-indicator{width:var(--pico-icon-width);margin-right:calc(var(--pico-icon-width) * -1);margin-left:var(--pico-icon-position);opacity:0}@-moz-document url-prefix(){.pico [type=date],.pico [type=datetime-local],.pico [type=month],.pico [type=time],.pico [type=week]{padding-right:var(--pico-form-element-spacing-horizontal)!important;background-image:none!important}}[dir=rtl] .pico :is([type=date],[type=datetime-local],[type=month],[type=time],[type=week]){text-align:right}.pico [type=file]{--pico-color:var(--pico-muted-color);margin-left:calc(var(--pico-outline-width) * -1);padding:calc(var(--pico-form-element-spacing-vertical) * .5) 0;padding-left:var(--pico-outline-width);border:0;border-radius:0;background:0 0}.pico [type=file]::file-selector-button{margin-right:calc(var(--pico-spacing)/ 2);padding:calc(var(--pico-form-element-spacing-vertical) * .5) var(--pico-form-element-spacing-horizontal)}.pico [type=file]:is(:hover,:active,:focus)::file-selector-button{--pico-background-color:var(--pico-secondary-hover-background);--pico-border-color:var(--pico-secondary-hover-border)}.pico [type=file]:focus::file-selector-button{--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),0 0 0 var(--pico-outline-width) var(--pico-secondary-focus)}.pico [type=range]{-webkit-appearance:none;-moz-appearance:none;appearance:none;width:100%;height:1.25rem;background:0 0}.pico [type=range]::-webkit-slider-runnable-track{width:100%;height:.375rem;border-radius:var(--pico-border-radius);background-color:var(--pico-range-border-color);-webkit-transition:background-color var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),box-shadow var(--pico-transition)}.pico [type=range]::-moz-range-track{width:100%;height:.375rem;border-radius:var(--pico-border-radius);background-color:var(--pico-range-border-color);-moz-transition:background-color var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),box-shadow var(--pico-transition)}.pico [type=range]::-ms-track{width:100%;height:.375rem;border-radius:var(--pico-border-radius);background-color:var(--pico-range-border-color);-ms-transition:background-color var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),box-shadow var(--pico-transition)}.pico [type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:1.25rem;height:1.25rem;margin-top:-.4375rem;border:2px solid var(--pico-range-thumb-border-color);border-radius:50%;background-color:var(--pico-range-thumb-color);cursor:pointer;-webkit-transition:background-color var(--pico-transition),transform var(--pico-transition);transition:background-color var(--pico-transition),transform var(--pico-transition)}.pico [type=range]::-moz-range-thumb{-webkit-appearance:none;width:1.25rem;height:1.25rem;margin-top:-.4375rem;border:2px solid var(--pico-range-thumb-border-color);border-radius:50%;background-color:var(--pico-range-thumb-color);cursor:pointer;-moz-transition:background-color var(--pico-transition),transform var(--pico-transition);transition:background-color var(--pico-transition),transform var(--pico-transition)}.pico [type=range]::-ms-thumb{-webkit-appearance:none;width:1.25rem;height:1.25rem;margin-top:-.4375rem;border:2px solid var(--pico-range-thumb-border-color);border-radius:50%;background-color:var(--pico-range-thumb-color);cursor:pointer;-ms-transition:background-color var(--pico-transition),transform var(--pico-transition);transition:background-color var(--pico-transition),transform var(--pico-transition)}.pico [type=range]:active,.pico [type=range]:focus-within{--pico-range-border-color:var(--pico-range-active-border-color);--pico-range-thumb-color:var(--pico-range-thumb-active-color)}.pico [type=range]:active::-webkit-slider-thumb{transform:scale(1.25)}.pico [type=range]:active::-moz-range-thumb{transform:scale(1.25)}.pico [type=range]:active::-ms-thumb{transform:scale(1.25)}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search]{padding-inline-start:calc(var(--pico-form-element-spacing-horizontal) + 1.75rem);background-image:var(--pico-icon-search);background-position:center left calc(var(--pico-form-element-spacing-horizontal) + .125rem);background-size:1rem auto;background-repeat:no-repeat}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid]{padding-inline-start:calc(var(--pico-form-element-spacing-horizontal) + 1.75rem)!important;background-position:center left 1.125rem,center right .75rem}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid=false]{background-image:var(--pico-icon-search),var(--pico-icon-valid)}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid=true]{background-image:var(--pico-icon-search),var(--pico-icon-invalid)}[dir=rtl] .pico :where(input):not([type=checkbox],[type=radio],[type=range],[type=file])[type=search]{background-position:center right 1.125rem}[dir=rtl] .pico :where(input):not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid]{background-position:center right 1.125rem,center left .75rem}.pico details{display:block;margin-bottom:var(--pico-spacing)}.pico details summary{line-height:1rem;list-style-type:none;cursor:pointer;transition:color var(--pico-transition)}.pico details summary:not([role]){color:var(--pico-accordion-close-summary-color)}.pico details summary::-webkit-details-marker{display:none}.pico details summary::marker{display:none}.pico details summary::-moz-list-bullet{list-style-type:none}.pico details summary:after{display:block;width:1rem;height:1rem;margin-inline-start:calc(var(--pico-spacing,1rem) * .5);float:right;transform:rotate(-90deg);background-image:var(--pico-icon-chevron);background-position:right center;background-size:1rem auto;background-repeat:no-repeat;content:"";transition:transform var(--pico-transition)}.pico details summary:focus{outline:0}.pico details summary:focus:not([role]){color:var(--pico-accordion-active-summary-color)}.pico details summary:focus-visible:not([role]){outline:var(--pico-outline-width) solid var(--pico-primary-focus);outline-offset:calc(var(--pico-spacing,1rem) * .5);color:var(--pico-primary)}.pico details summary[role=button]{width:100%;text-align:left}.pico details summary[role=button]:after{height:calc(1rem * var(--pico-line-height,1.5))}.pico details[open]>summary{margin-bottom:var(--pico-spacing)}.pico details[open]>summary:not([role]):not(:focus){color:var(--pico-accordion-open-summary-color)}.pico details[open]>summary:after{transform:rotate(0)}[dir=rtl] .pico details summary{text-align:right}[dir=rtl] .pico details summary:after{float:left;background-position:left center}.pico article{margin-bottom:var(--pico-block-spacing-vertical);padding:var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);border-radius:var(--pico-border-radius);background:var(--pico-card-background-color);box-shadow:var(--pico-card-box-shadow)}.pico article>footer,.pico article>header{margin-right:calc(var(--pico-block-spacing-horizontal) * -1);margin-left:calc(var(--pico-block-spacing-horizontal) * -1);padding:calc(var(--pico-block-spacing-vertical) * .66) var(--pico-block-spacing-horizontal);background-color:var(--pico-card-sectioning-background-color)}.pico article>header{margin-top:calc(var(--pico-block-spacing-vertical) * -1);margin-bottom:var(--pico-block-spacing-vertical);border-bottom:var(--pico-border-width) solid var(--pico-card-border-color);border-top-right-radius:var(--pico-border-radius);border-top-left-radius:var(--pico-border-radius)}.pico article>footer{margin-top:var(--pico-block-spacing-vertical);margin-bottom:calc(var(--pico-block-spacing-vertical) * -1);border-top:var(--pico-border-width) solid var(--pico-card-border-color);border-bottom-right-radius:var(--pico-border-radius);border-bottom-left-radius:var(--pico-border-radius)}.pico details.dropdown{position:relative;border-bottom:none}.pico details.dropdown>a:after,.pico details.dropdown>button:after,.pico details.dropdown>summary:after{display:block;width:1rem;height:calc(1rem * var(--pico-line-height,1.5));margin-inline-start:.25rem;float:right;transform:rotate(0) translate(.2rem);background-image:var(--pico-icon-chevron);background-position:right center;background-size:1rem auto;background-repeat:no-repeat;content:""}.pico nav details.dropdown{margin-bottom:0}.pico details.dropdown>summary:not([role]){height:calc(1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 + var(--pico-border-width) * 2);padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);border:var(--pico-border-width) solid var(--pico-form-element-border-color);border-radius:var(--pico-border-radius);background-color:var(--pico-form-element-background-color);color:var(--pico-form-element-placeholder-color);line-height:inherit;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none;transition:background-color var(--pico-transition),border-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition)}.pico details.dropdown>summary:not([role]):active,.pico details.dropdown>summary:not([role]):focus{border-color:var(--pico-form-element-active-border-color);background-color:var(--pico-form-element-active-background-color)}.pico details.dropdown>summary:not([role]):focus{box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-focus-color)}.pico details.dropdown>summary:not([role]):focus-visible{outline:0}.pico details.dropdown>summary:not([role])[aria-invalid=false]{--pico-form-element-border-color:var(--pico-form-element-valid-border-color);--pico-form-element-active-border-color:var(--pico-form-element-valid-focus-color);--pico-form-element-focus-color:var(--pico-form-element-valid-focus-color)}.pico details.dropdown>summary:not([role])[aria-invalid=true]{--pico-form-element-border-color:var(--pico-form-element-invalid-border-color);--pico-form-element-active-border-color:var(--pico-form-element-invalid-focus-color);--pico-form-element-focus-color:var(--pico-form-element-invalid-focus-color)}.pico nav details.dropdown{display:inline;margin:calc(var(--pico-nav-element-spacing-vertical) * -1) 0}.pico nav details.dropdown>summary:after{transform:rotate(0) translate(0)}.pico nav details.dropdown>summary:not([role]){height:calc(1rem * var(--pico-line-height) + var(--pico-nav-link-spacing-vertical) * 2);padding:calc(var(--pico-nav-link-spacing-vertical) - var(--pico-border-width) * 2) var(--pico-nav-link-spacing-horizontal)}.pico nav details.dropdown>summary:not([role]):focus-visible{box-shadow:0 0 0 var(--pico-outline-width) var(--pico-primary-focus)}.pico details.dropdown>summary+ul{display:flex;z-index:99;position:absolute;left:0;flex-direction:column;width:100%;min-width:-moz-fit-content;min-width:fit-content;margin:0;margin-top:var(--pico-outline-width);padding:0;border:var(--pico-border-width) solid var(--pico-dropdown-border-color);border-radius:var(--pico-border-radius);background-color:var(--pico-dropdown-background-color);box-shadow:var(--pico-dropdown-box-shadow);color:var(--pico-dropdown-color);white-space:nowrap;opacity:0;transition:opacity var(--pico-transition),transform 0s ease-in-out 1s}.pico details.dropdown>summary+ul[dir=rtl]{right:0;left:auto}.pico details.dropdown>summary+ul li{width:100%;margin-bottom:0;padding:calc(var(--pico-form-element-spacing-vertical) * .5) var(--pico-form-element-spacing-horizontal);list-style:none}.pico details.dropdown>summary+ul li:first-of-type{margin-top:calc(var(--pico-form-element-spacing-vertical) * .5)}.pico details.dropdown>summary+ul li:last-of-type{margin-bottom:calc(var(--pico-form-element-spacing-vertical) * .5)}.pico details.dropdown>summary+ul li a{display:block;margin:calc(var(--pico-form-element-spacing-vertical) * -.5) calc(var(--pico-form-element-spacing-horizontal) * -1);padding:calc(var(--pico-form-element-spacing-vertical) * .5) var(--pico-form-element-spacing-horizontal);overflow:hidden;border-radius:0;color:var(--pico-dropdown-color);text-decoration:none;text-overflow:ellipsis}.pico details.dropdown>summary+ul li a:active,.pico details.dropdown>summary+ul li a:focus,.pico details.dropdown>summary+ul li a:focus-visible,.pico details.dropdown>summary+ul li a:hover,.pico details.dropdown>summary+ul li a[aria-current]:not([aria-current=false]){background-color:var(--pico-dropdown-hover-background-color)}.pico details.dropdown>summary+ul li label{width:100%}.pico details.dropdown>summary+ul li:has(label):hover{background-color:var(--pico-dropdown-hover-background-color)}.pico details.dropdown[open]>summary{margin-bottom:0}.pico details.dropdown[open]>summary+ul{transform:scaleY(1);opacity:1;transition:opacity var(--pico-transition),transform 0s ease-in-out 0s}.pico details.dropdown[open]>summary:before{display:block;z-index:1;position:fixed;width:100vw;height:100vh;inset:0;background:0 0;content:"";cursor:default}.pico label>details.dropdown{margin-top:calc(var(--pico-spacing) * .25)}.pico [role=group],.pico [role=search]{display:inline-flex;position:relative;width:100%;margin-bottom:var(--pico-spacing);border-radius:var(--pico-border-radius);box-shadow:var(--pico-group-box-shadow,0 0 0 transparent);vertical-align:middle;transition:box-shadow var(--pico-transition)}.pico [role=group] input:not([type=checkbox],[type=radio]),.pico [role=group] select,.pico [role=group]>*,.pico [role=search] input:not([type=checkbox],[type=radio]),.pico [role=search] select,.pico [role=search]>*{position:relative;flex:1 1 auto;margin-bottom:0}.pico [role=group] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=group] select:not(:first-child),.pico [role=group]>:not(:first-child),.pico [role=search] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=search] select:not(:first-child),.pico [role=search]>:not(:first-child){margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0}.pico [role=group] input:not([type=checkbox],[type=radio]):not(:last-child),.pico [role=group] select:not(:last-child),.pico [role=group]>:not(:last-child),.pico [role=search] input:not([type=checkbox],[type=radio]):not(:last-child),.pico [role=search] select:not(:last-child),.pico [role=search]>:not(:last-child){border-top-right-radius:0;border-bottom-right-radius:0}.pico [role=group] input:not([type=checkbox],[type=radio]):focus,.pico [role=group] select:focus,.pico [role=group]>:focus,.pico [role=search] input:not([type=checkbox],[type=radio]):focus,.pico [role=search] select:focus,.pico [role=search]>:focus{z-index:2}.pico [role=group] [role=button]:not(:first-child),.pico [role=group] [type=button]:not(:first-child),.pico [role=group] [type=reset]:not(:first-child),.pico [role=group] [type=submit]:not(:first-child),.pico [role=group] button:not(:first-child),.pico [role=group] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=group] select:not(:first-child),.pico [role=search] [role=button]:not(:first-child),.pico [role=search] [type=button]:not(:first-child),.pico [role=search] [type=reset]:not(:first-child),.pico [role=search] [type=submit]:not(:first-child),.pico [role=search] button:not(:first-child),.pico [role=search] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=search] select:not(:first-child){margin-left:calc(var(--pico-border-width) * -1)}.pico [role=group] [role=button],.pico [role=group] [type=button],.pico [role=group] [type=reset],.pico [role=group] [type=submit],.pico [role=group] button,.pico [role=search] [role=button],.pico [role=search] [type=button],.pico [role=search] [type=reset],.pico [role=search] [type=submit],.pico [role=search] button{width:auto}@supports selector(:has(*)){.pico [role=group]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus),.pico [role=search]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus){--pico-group-box-shadow:var(--pico-group-box-shadow-focus-with-button)}.pico [role=group]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) input:not([type=checkbox],[type=radio]),.pico [role=group]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) select,.pico [role=search]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) input:not([type=checkbox],[type=radio]),.pico [role=search]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) select{border-color:transparent}.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus),.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus){--pico-group-box-shadow:var(--pico-group-box-shadow-focus-with-input)}.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) [role=button],.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=button],.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=submit],.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) button,.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) [role=button],.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=button],.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=submit],.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) button{--pico-button-box-shadow:0 0 0 var(--pico-border-width) var(--pico-primary-border);--pico-button-hover-box-shadow:0 0 0 var(--pico-border-width) var(--pico-primary-hover-border)}.pico [role=group] [role=button]:focus,.pico [role=group] [type=button]:focus,.pico [role=group] [type=reset]:focus,.pico [role=group] [type=submit]:focus,.pico [role=group] button:focus,.pico [role=search] [role=button]:focus,.pico [role=search] [type=button]:focus,.pico [role=search] [type=reset]:focus,.pico [role=search] [type=submit]:focus,.pico [role=search] button:focus{box-shadow:none}}.pico [role=search]>:first-child{border-top-left-radius:5rem;border-bottom-left-radius:5rem}.pico [role=search]>:last-child{border-top-right-radius:5rem;border-bottom-right-radius:5rem}.pico [aria-busy=true]:not(input,select,textarea,html,form){white-space:nowrap}.pico [aria-busy=true]:not(input,select,textarea,html,form):before{display:inline-block;width:1em;height:1em;background-image:var(--pico-icon-loading);background-size:1em auto;background-repeat:no-repeat;content:"";vertical-align:-.125em}.pico [aria-busy=true]:not(input,select,textarea,html,form):not(:empty):before{margin-inline-end:calc(var(--pico-spacing) * .5)}.pico [aria-busy=true]:not(input,select,textarea,html,form):empty{text-align:center}.pico [role=button][aria-busy=true],.pico [type=button][aria-busy=true],.pico [type=reset][aria-busy=true],.pico [type=submit][aria-busy=true],.pico a[aria-busy=true],.pico button[aria-busy=true]{pointer-events:none}:host,:root{--pico-scrollbar-width:0px}.pico dialog{display:flex;z-index:999;position:fixed;inset:0;align-items:center;justify-content:center;width:inherit;min-width:100%;height:inherit;min-height:100%;padding:0;border:0;-webkit-backdrop-filter:var(--pico-modal-overlay-backdrop-filter);backdrop-filter:var(--pico-modal-overlay-backdrop-filter);background-color:var(--pico-modal-overlay-background-color);color:var(--pico-color)}.pico dialog>article{width:100%;max-height:calc(100vh - var(--pico-spacing) * 2);margin:var(--pico-spacing);overflow:auto}@media (min-width:576px){.pico dialog>article{max-width:510px}}@media (min-width:768px){.pico dialog>article{max-width:700px}}.pico dialog>article>header>*{margin-bottom:0}.pico dialog>article>header .close,.pico dialog>article>header :is(a,button)[rel=prev]{margin:0;margin-left:var(--pico-spacing);padding:0;float:right}.pico dialog>article>footer{text-align:right}.pico dialog>article>footer [role=button],.pico dialog>article>footer button{margin-bottom:0}.pico dialog>article>footer [role=button]:not(:first-of-type),.pico dialog>article>footer button:not(:first-of-type){margin-left:calc(var(--pico-spacing) * .5)}.pico dialog>article .close,.pico dialog>article :is(a,button)[rel=prev]{display:block;width:1rem;height:1rem;margin-top:calc(var(--pico-spacing) * -1);margin-bottom:var(--pico-spacing);margin-left:auto;border:none;background-image:var(--pico-icon-close);background-position:center;background-size:auto 1rem;background-repeat:no-repeat;background-color:transparent;opacity:.5;transition:opacity var(--pico-transition)}.pico dialog>article .close:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico dialog>article :is(a,button)[rel=prev]:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){opacity:1}.pico dialog:not([open]),.pico dialog[open=false]{display:none}.modal-is-open{padding-right:var(--pico-scrollbar-width,0);overflow:hidden;pointer-events:none;touch-action:none}.modal-is-open dialog{pointer-events:auto;touch-action:auto}:where(.modal-is-opening,.modal-is-closing) dialog,:where(.modal-is-opening,.modal-is-closing) dialog>article{animation-duration:.2s;animation-timing-function:ease-in-out;animation-fill-mode:both}:where(.modal-is-opening,.modal-is-closing) dialog{animation-duration:.8s;animation-name:modal-overlay}:where(.modal-is-opening,.modal-is-closing) dialog>article{animation-delay:.2s;animation-name:modal}.modal-is-closing dialog,.modal-is-closing dialog>article{animation-delay:0s;animation-direction:reverse}@keyframes modal-overlay{0%{-webkit-backdrop-filter:none;backdrop-filter:none;background-color:transparent}}@keyframes modal{0%{transform:translateY(-100%);opacity:0}}:where(nav li):before{float:left;content:"​"}.pico nav,.pico nav ul{display:flex}.pico nav{justify-content:space-between;overflow:visible}.pico nav ol,.pico nav ul{align-items:center;margin-bottom:0;padding:0;list-style:none}.pico nav ol:first-of-type,.pico nav ul:first-of-type{margin-left:calc(var(--pico-nav-element-spacing-horizontal) * -1)}.pico nav ol:last-of-type,.pico nav ul:last-of-type{margin-right:calc(var(--pico-nav-element-spacing-horizontal) * -1)}.pico nav li{display:inline-block;margin:0;padding:var(--pico-nav-element-spacing-vertical) var(--pico-nav-element-spacing-horizontal)}.pico nav li :where(a,[role=link]){display:inline-block;margin:calc(var(--pico-nav-link-spacing-vertical) * -1) calc(var(--pico-nav-link-spacing-horizontal) * -1);padding:var(--pico-nav-link-spacing-vertical) var(--pico-nav-link-spacing-horizontal);border-radius:var(--pico-border-radius)}.pico nav li :where(a,[role=link]):not(:hover){text-decoration:none}.pico nav li [role=button],.pico nav li [type=button],.pico nav li button,.pico nav li input:not([type=checkbox],[type=radio],[type=range],[type=file]),.pico nav li select{height:auto;margin-right:inherit;margin-bottom:0;margin-left:inherit;padding:calc(var(--pico-nav-link-spacing-vertical) - var(--pico-border-width) * 2) var(--pico-nav-link-spacing-horizontal)}.pico nav[aria-label=breadcrumb]{align-items:center;justify-content:start}.pico nav[aria-label=breadcrumb] ul li:not(:first-child){margin-inline-start:var(--pico-nav-link-spacing-horizontal)}.pico nav[aria-label=breadcrumb] ul li a{margin:calc(var(--pico-nav-link-spacing-vertical) * -1) 0;margin-inline-start:calc(var(--pico-nav-link-spacing-horizontal) * -1)}.pico nav[aria-label=breadcrumb] ul li:not(:last-child):after{display:inline-block;position:absolute;width:calc(var(--pico-nav-link-spacing-horizontal) * 4);margin:0 calc(var(--pico-nav-link-spacing-horizontal) * -1);content:var(--pico-nav-breadcrumb-divider);color:var(--pico-muted-color);text-align:center;text-decoration:none;white-space:nowrap}.pico nav[aria-label=breadcrumb] a[aria-current]:not([aria-current=false]){background-color:transparent;color:inherit;text-decoration:none;pointer-events:none}.pico aside li,.pico aside nav,.pico aside ol,.pico aside ul{display:block}.pico aside li{padding:calc(var(--pico-nav-element-spacing-vertical) * .5) var(--pico-nav-element-spacing-horizontal)}.pico aside li a{display:block}.pico aside li [role=button]{margin:inherit}[dir=rtl] .pico nav[aria-label=breadcrumb] ul li:not(:last-child) :after{content:"\\\\"}.pico progress{display:inline-block;vertical-align:baseline}.pico progress{-webkit-appearance:none;-moz-appearance:none;display:inline-block;appearance:none;width:100%;height:.5rem;margin-bottom:calc(var(--pico-spacing) * .5);overflow:hidden;border:0;border-radius:var(--pico-border-radius);background-color:var(--pico-progress-background-color);color:var(--pico-progress-color)}.pico progress::-webkit-progress-bar{border-radius:var(--pico-border-radius);background:0 0}.pico progress[value]::-webkit-progress-value{background-color:var(--pico-progress-color);-webkit-transition:inline-size var(--pico-transition);transition:inline-size var(--pico-transition)}.pico progress::-moz-progress-bar{background-color:var(--pico-progress-color)}@media (prefers-reduced-motion:no-preference){.pico progress:indeterminate{background:var(--pico-progress-background-color) linear-gradient(to right,var(--pico-progress-color) 30%,var(--pico-progress-background-color) 30%) top left/150% 150% no-repeat;animation:progress-indeterminate 1s linear infinite}.pico progress:indeterminate[value]::-webkit-progress-value{background-color:transparent}.pico progress:indeterminate::-moz-progress-bar{background-color:transparent}}@media (prefers-reduced-motion:no-preference){[dir=rtl] .pico progress:indeterminate{animation-direction:reverse}}@keyframes progress-indeterminate{0%{background-position:200% 0}to{background-position:-200% 0}}.pico [data-tooltip]{position:relative}.pico [data-tooltip]:not(a,button,input,[role=button]){border-bottom:1px dotted;text-decoration:none;cursor:help}.pico [data-tooltip]:after,.pico [data-tooltip]:before,.pico [data-tooltip][data-placement=top]:after,.pico [data-tooltip][data-placement=top]:before{display:block;z-index:99;position:absolute;bottom:100%;left:50%;padding:.25rem .5rem;overflow:hidden;transform:translate(-50%,-.25rem);border-radius:var(--pico-border-radius);background:var(--pico-tooltip-background-color);content:attr(data-tooltip);color:var(--pico-tooltip-color);font-style:normal;font-weight:var(--pico-font-weight);font-size:.875rem;text-decoration:none;text-overflow:ellipsis;white-space:nowrap;opacity:0;pointer-events:none}.pico [data-tooltip]:after,.pico [data-tooltip][data-placement=top]:after{padding:0;transform:translate(-50%);border-top:.3rem solid;border-right:.3rem solid transparent;border-left:.3rem solid transparent;border-radius:0;background-color:transparent;content:"";color:var(--pico-tooltip-background-color)}.pico [data-tooltip][data-placement=bottom]:after,.pico [data-tooltip][data-placement=bottom]:before{top:100%;bottom:auto;transform:translate(-50%,.25rem)}.pico [data-tooltip][data-placement=bottom]:after{transform:translate(-50%,-.3rem);border:.3rem solid transparent;border-bottom:.3rem solid}.pico [data-tooltip][data-placement=left]:after,.pico [data-tooltip][data-placement=left]:before{inset:50% 100% auto auto;transform:translate(-.25rem,-50%)}.pico [data-tooltip][data-placement=left]:after{transform:translate(.3rem,-50%);border:.3rem solid transparent;border-left:.3rem solid}.pico [data-tooltip][data-placement=right]:after,.pico [data-tooltip][data-placement=right]:before{inset:50% auto auto 100%;transform:translate(.25rem,-50%)}.pico [data-tooltip][data-placement=right]:after{transform:translate(-.3rem,-50%);border:.3rem solid transparent;border-right:.3rem solid}.pico [data-tooltip]:focus:after,.pico [data-tooltip]:focus:before,.pico [data-tooltip]:hover:after,.pico [data-tooltip]:hover:before{opacity:1}@media (hover:hover) and (pointer:fine){.pico [data-tooltip]:focus:after,.pico [data-tooltip]:focus:before,.pico [data-tooltip]:hover:after,.pico [data-tooltip]:hover:before{--pico-tooltip-slide-to:translate(-50%, -.25rem);transform:translate(-50%,.75rem);animation-duration:.2s;animation-fill-mode:forwards;animation-name:tooltip-slide;opacity:0}.pico [data-tooltip]:focus:after,.pico [data-tooltip]:hover:after{--pico-tooltip-caret-slide-to:translate(-50%, 0rem);transform:translate(-50%,-.25rem);animation-name:tooltip-caret-slide}.pico [data-tooltip][data-placement=bottom]:focus:after,.pico [data-tooltip][data-placement=bottom]:focus:before,.pico [data-tooltip][data-placement=bottom]:hover:after,.pico [data-tooltip][data-placement=bottom]:hover:before{--pico-tooltip-slide-to:translate(-50%, .25rem);transform:translate(-50%,-.75rem);animation-name:tooltip-slide}.pico [data-tooltip][data-placement=bottom]:focus:after,.pico [data-tooltip][data-placement=bottom]:hover:after{--pico-tooltip-caret-slide-to:translate(-50%, -.3rem);transform:translate(-50%,-.5rem);animation-name:tooltip-caret-slide}.pico [data-tooltip][data-placement=left]:focus:after,.pico [data-tooltip][data-placement=left]:focus:before,.pico [data-tooltip][data-placement=left]:hover:after,.pico [data-tooltip][data-placement=left]:hover:before{--pico-tooltip-slide-to:translate(-.25rem, -50%);transform:translate(.75rem,-50%);animation-name:tooltip-slide}.pico [data-tooltip][data-placement=left]:focus:after,.pico [data-tooltip][data-placement=left]:hover:after{--pico-tooltip-caret-slide-to:translate(.3rem, -50%);transform:translate(.05rem,-50%);animation-name:tooltip-caret-slide}.pico [data-tooltip][data-placement=right]:focus:after,.pico [data-tooltip][data-placement=right]:focus:before,.pico [data-tooltip][data-placement=right]:hover:after,.pico [data-tooltip][data-placement=right]:hover:before{--pico-tooltip-slide-to:translate(.25rem, -50%);transform:translate(-.75rem,-50%);animation-name:tooltip-slide}.pico [data-tooltip][data-placement=right]:focus:after,.pico [data-tooltip][data-placement=right]:hover:after{--pico-tooltip-caret-slide-to:translate(-.3rem, -50%);transform:translate(-.05rem,-50%);animation-name:tooltip-caret-slide}}@keyframes tooltip-slide{to{transform:var(--pico-tooltip-slide-to);opacity:1}}@keyframes tooltip-caret-slide{50%{opacity:0}to{transform:var(--pico-tooltip-caret-slide-to);opacity:1}}.pico [aria-controls]{cursor:pointer}.pico [aria-disabled=true],.pico [disabled]{cursor:not-allowed}.pico [aria-hidden=false][hidden]{display:initial}.pico [aria-hidden=false][hidden]:not(:focus){clip:rect(0,0,0,0);position:absolute}.pico [tabindex],.pico a,.pico area,.pico button,.pico input,.pico label,.pico select,.pico summary,.pico textarea{-ms-touch-action:manipulation}.pico [dir=rtl]{direction:rtl}@media (prefers-reduced-motion:reduce){.pico :not([aria-busy=true]),.pico :not([aria-busy=true]):after,.pico :not([aria-busy=true]):before{background-attachment:initial!important;animation-duration:1ms!important;animation-delay:-1ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-delay:0s!important;transition-duration:0s!important}}}@layer joy{:root,:host{--joy-font: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;--joy-radius: 6px;--joy-accent: #5e81ac;--joy-accent-hover: #81a1c1;--joy-ok: #a3be8c;--joy-warn: #ebcb8b;--joy-err: #bf616a;--pico-font-family: var(--joy-font);--pico-border-radius: var(--joy-radius);--pico-primary: var(--joy-accent);--pico-primary-hover: var(--joy-accent-hover);--pico-primary-background: var(--joy-accent);--pico-primary-hover-background: var(--joy-accent-hover)}}@layer joy{:host{--pico-primary-underline: color-mix(in srgb, var(--joy-accent, #5e81ac) 50%, transparent);--pico-primary-focus: color-mix(in srgb, var(--joy-accent, #5e81ac) 37.5%, transparent);--pico-spacing: .8rem;--pico-form-element-spacing-vertical: .5rem;--pico-form-element-spacing-horizontal: .7rem;--pico-typography-spacing-vertical: .8rem;--mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace}.pico{font-size:.9rem;color:var(--pico-color);background:var(--pico-background-color)}.pico input,.pico select,.pico textarea{margin-bottom:0}.pico button{margin-bottom:0;width:auto}.row{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.spacer{flex:1}.mono{font-family:var(--mono)}.muted{color:var(--pico-muted-color)}.tiny{font-size:.75rem}.hint{color:var(--pico-muted-color);font-weight:400;font-size:.7rem;margin-left:.35rem}.pico .btn-sm{padding:.28rem .65rem;font-size:.75rem;line-height:1.3}.pico .btn-icon{padding:.15rem .45rem;font-size:.75rem;line-height:1.4}.box{border:1px solid var(--pico-muted-border-color);border-radius:var(--pico-border-radius);padding:.6rem .8rem;font-size:.8rem;line-height:1.5}.box.ok{border-color:var(--joy-ok, #a3be8c);color:var(--joy-ok, #a3be8c)}.box.err{border-color:var(--joy-err, #bf616a);color:var(--joy-err, #bf616a)}.box.warn{border-color:var(--joy-warn, #ebcb8b);color:var(--joy-warn, #ebcb8b)}.pico .box code{display:block;margin-top:.25rem;font-size:.72rem;color:var(--pico-muted-color);word-break:break-all;background:none;padding:0}.spinner{width:15px;height:15px;border:2px solid var(--pico-muted-border-color);border-top-color:var(--joy-accent, #5e81ac);border-radius:50%;animation:spin .6s linear infinite;display:inline-block;vertical-align:-2px}@keyframes spin{to{transform:rotate(360deg)}}.tabs{display:inline-flex;gap:.2rem;padding:.2rem;border:1px solid var(--pico-muted-border-color);border-radius:999px;margin-bottom:.8rem}.pico .tabs button{background:transparent;border:none;color:var(--pico-muted-color);font-size:.78rem;font-weight:600;padding:.3rem .9rem;border-radius:999px;cursor:pointer}.pico .tabs button[aria-selected=true]{background:var(--joy-accent, #5e81ac);color:#fff}.lookup-form{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.8rem}.pico .lookup-form input[type=text]{flex:1 1 12rem;font-family:var(--mono)}.pico .lookup-form select{flex:0 0 6.5rem;width:auto;font-family:var(--mono)}.pico table.answers{width:100%;font-size:.78rem;margin:0}.pico table.answers th{font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:var(--pico-muted-color)}.pico table.answers td{font-family:var(--mono);word-break:break-all;vertical-align:top}.badge{display:inline-block;padding:.1rem .45rem;border-radius:999px;font-family:var(--mono);font-size:.65rem;font-weight:600;border:1px solid var(--pico-muted-border-color);color:var(--pico-muted-color);white-space:nowrap}.badge.accent{border-color:var(--joy-accent, #5e81ac);color:var(--joy-accent, #5e81ac)}.readonly-bar{display:flex;flex-wrap:wrap;gap:.3rem 1rem;align-items:center;padding:.5rem .7rem;border:1px solid var(--pico-muted-border-color);border-radius:var(--pico-border-radius);font-size:.72rem;margin-bottom:.6rem}.readonly-bar .k{color:var(--pico-muted-color);margin-right:.3rem}.readonly-bar .v{font-family:var(--mono)}.readonly-bar .note{margin-left:auto;color:var(--pico-muted-color);font-size:.68rem}.toolbar{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap;margin-bottom:.6rem}.dirty{font-size:.72rem;color:var(--joy-warn, #ebcb8b)}.saved{font-size:.72rem;color:var(--joy-ok, #a3be8c)}.master-detail{display:grid;grid-template-columns:minmax(190px,260px) 1fr;gap:.8rem;align-items:start}.master{border:1px solid var(--pico-muted-border-color);border-radius:var(--pico-border-radius);display:flex;flex-direction:column;overflow:hidden}.master-head{padding:.45rem .6rem;font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--pico-muted-color);border-bottom:1px solid var(--pico-muted-border-color)}.r-list{padding:.3rem;max-height:26rem;overflow-y:auto}.r-item{display:flex;align-items:center;gap:.4rem;padding:.35rem .4rem;border-radius:var(--pico-border-radius);border:1px solid transparent;cursor:pointer;margin-bottom:.15rem}.r-item:hover{background:color-mix(in srgb,var(--joy-accent, #5e81ac) 10%,transparent)}.r-item[aria-selected=true]{border-color:var(--joy-accent, #5e81ac);background:color-mix(in srgb,var(--joy-accent, #5e81ac) 16%,transparent)}.r-item.dragging{opacity:.4}.r-item.dragover{box-shadow:inset 0 2px 0 var(--joy-accent, #5e81ac)}.r-handle{cursor:grab;color:var(--pico-muted-color);user-select:none;flex-shrink:0}.r-idx{font-family:var(--mono);font-size:.66rem;color:var(--pico-muted-color);width:1.1rem;text-align:right;flex-shrink:0}.r-label{flex:1;min-width:0;font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.r-label.unnamed{font-style:italic;color:var(--pico-muted-color)}.master-foot{display:flex;gap:.3rem;align-items:center;padding:.4rem;border-top:1px solid var(--pico-muted-border-color)}.add-wrap{position:relative}.add-menu{position:absolute;bottom:calc(100% + 4px);left:0;z-index:20;background:var(--pico-background-color);border:1px solid var(--pico-muted-border-color);border-radius:var(--pico-border-radius);padding:.2rem;min-width:9.5rem;box-shadow:0 6px 20px #0000002e}.pico .add-menu button{display:block;width:100%;text-align:left;background:transparent;border:none;color:var(--pico-color);padding:.28rem .4rem;font-size:.76rem;cursor:pointer;border-radius:4px}.pico .add-menu button:hover{background:var(--pico-secondary-background);color:var(--pico-secondary-inverse)}.detail{border:1px solid var(--pico-muted-border-color);border-radius:var(--pico-border-radius);padding:.8rem;min-width:0}.detail-head{display:flex;align-items:center;gap:.5rem;margin-bottom:.8rem}.back-btn{display:none}.field{margin-bottom:.7rem}.field>label{display:block;font-size:.72rem;font-weight:600;color:var(--pico-muted-color);margin-bottom:.25rem}.pico .field input[type=text],.pico .field textarea,.pico .field select{font-family:var(--mono);font-size:.78rem}.field-row{display:flex;gap:.5rem;flex-wrap:wrap}.field-row>.field{flex:1 1 8rem;min-width:0}.check-line{display:flex;align-items:center;gap:.4rem;font-size:.78rem;cursor:pointer}.pico .check-line input{width:auto}.row-list{display:flex;flex-direction:column;gap:.3rem}.line-row{display:flex;align-items:center;gap:.3rem}.pico .line-row input{flex:1;min-width:0}.line-row.dragging{opacity:.4}.line-row.dragover{box-shadow:inset 0 2px 0 var(--joy-accent, #5e81ac)}.lr-handle{cursor:grab;color:var(--pico-muted-color);user-select:none;flex-shrink:0;width:.9rem;text-align:center}.arrows{display:flex;flex-direction:column;gap:1px}.pico .arrows button{padding:0 .3rem;font-size:.55rem;line-height:1.2}.pico .add-line{align-self:flex-start;background:transparent;border:1px dashed var(--pico-muted-border-color);color:var(--joy-accent, #5e81ac);font-size:.72rem;padding:.22rem .55rem;cursor:pointer}.kv-row{display:flex;gap:.3rem;align-items:center}.pico .kv-row input.k{flex:0 0 35%;min-width:5rem}.pico .kv-row input.v{flex:1;min-width:0}.qtype-grid{display:flex;flex-wrap:wrap;gap:.3rem}.qtype-chip{display:inline-flex;align-items:center;gap:.3rem;padding:.15rem .5rem;border:1px solid var(--pico-muted-border-color);border-radius:999px;font-family:var(--mono);font-size:.68rem;color:var(--pico-muted-color);cursor:pointer;user-select:none}.pico .qtype-chip input{display:none}.qtype-chip.on{border-color:var(--joy-accent, #5e81ac);color:var(--joy-accent, #5e81ac);font-weight:600}.upstream-block{border:1px solid var(--pico-muted-border-color);border-radius:var(--pico-border-radius);padding:.6rem;margin-bottom:.45rem}.upstream-block .ub-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.45rem}.upstream-block .ub-title{font-size:.66rem;text-transform:uppercase;letter-spacing:.04em;color:var(--pico-muted-color)}.pico details.adv{margin-top:.6rem;border-top:1px solid var(--pico-muted-border-color);padding-top:.6rem}.pico details.adv>summary{font-size:.72rem;font-weight:600;color:var(--joy-accent, #5e81ac);cursor:pointer;margin-bottom:.5rem}.pico details.adv>summary+*{margin-top:.4rem}.detail-actions{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.9rem;padding-top:.7rem;border-top:1px solid var(--pico-muted-border-color)}.empty{display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:1.6rem .8rem;color:var(--pico-muted-color);font-size:.78rem;text-align:center}.card-stats{display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;font-size:.75rem;margin-bottom:.6rem}.card-stats .k{color:var(--pico-muted-color);margin-right:.3rem}.card-stats .v{font-family:var(--mono)}.card-answer{font-family:var(--mono);font-size:.75rem;word-break:break-all}.key-prompt{max-width:26rem}.pico .key-prompt input{font-family:var(--mono)}@media (max-width: 640px){.master-detail{grid-template-columns:1fr}.master-detail[data-view=detail] .master,.master-detail[data-view=list] .detail{display:none}.back-btn{display:inline-flex}}}`, Co = "dns.apiKey";
class W extends Error {
  constructor(e) {
    super(e === 403 ? "forbidden" : "unauthorized"), this.status = e, this.name = "AuthError";
  }
}
function $e() {
  try {
    return localStorage.getItem(Co) || "";
  } catch {
    return "";
  }
}
function je(o) {
  try {
    o ? localStorage.setItem(Co, o) : localStorage.removeItem(Co);
  } catch {
  }
}
function qe(o) {
  let e = $e();
  const i = o.replace(/\/+$/, "");
  async function a(n, c) {
    const s = new Headers(c.headers);
    e && s.set("X-Api-Key", e);
    const d = await fetch(i + n, { ...c, headers: s });
    if (d.status === 401 || d.status === 403) throw new W(d.status);
    const b = await d.text();
    let p = null;
    if (b)
      try {
        p = JSON.parse(b);
      } catch {
        p = { error: b.trim() };
      }
    return { status: d.status, data: p };
  }
  return {
    key: () => e,
    setKey(n) {
      e = n, je(n);
    },
    get: (n) => a(n, { method: "GET" }),
    postJSON: (n, c) => a(n, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c)
    })
  };
}
var eo, S, wo, Lo, ro = 0, de = [], T = z, Uo = T.__b, Fo = T.__r, Vo = T.diffed, Ko = T.__c, Wo = T.unmount, Yo = T.__;
function Po(o, e) {
  T.__h && T.__h(S, o, ro || e), ro = 0;
  var i = S.__H || (S.__H = { __: [], __h: [] });
  return o >= i.__.length && i.__.push({}), i.__[o];
}
function C(o) {
  return ro = 1, Ne(he, o);
}
function Ne(o, e, i) {
  var a = Po(eo++, 2);
  if (a.t = o, !a.__c && (a.__ = [he(void 0, e), function(d) {
    var b = a.__N ? a.__N[0] : a.__[0], p = a.t(b, d);
    b !== p && (a.__N = [p, a.__[1]], a.__c.setState({}));
  }], a.__c = S, !S.__f)) {
    var n = function(d, b, p) {
      if (!a.__c.__H) return !0;
      var h = !1, _ = a.__c.props !== d;
      if (a.__c.__H.__.some(function(u) {
        if (u.__N) {
          h = !0;
          var g = u.__[0];
          u.__ = u.__N, u.__N = void 0, g !== u.__[0] && (_ = !0);
        }
      }), c) {
        var t = c.call(this, d, b, p);
        return h ? t || _ : t;
      }
      return !h || _;
    };
    S.__f = !0;
    var c = S.shouldComponentUpdate, s = S.componentWillUpdate;
    S.componentWillUpdate = function(d, b, p) {
      if (this.__e) {
        var h = c;
        c = void 0, n(d, b, p), c = h;
      }
      s && s.call(this, d, b, p);
    }, S.shouldComponentUpdate = n;
  }
  return a.__N || a.__;
}
function Y(o, e) {
  var i = Po(eo++, 3);
  !T.__s && be(i.__H, e) && (i.__ = o, i.u = e, S.__H.__h.push(i));
}
function ue(o) {
  return ro = 5, me(function() {
    return { current: o };
  }, []);
}
function me(o, e) {
  var i = Po(eo++, 7);
  return be(i.__H, e) && (i.__ = o(), i.__H = e, i.__h = o), i.__;
}
function V(o, e) {
  return ro = 8, me(function() {
    return o;
  }, e);
}
function Oe() {
  for (var o; o = de.shift(); ) {
    var e = o.__H;
    if (o.__P && e) try {
      e.__h.some(so), e.__h.some(Eo), e.__h = [];
    } catch (i) {
      e.__h = [], T.__e(i, o.__v);
    }
  }
}
T.__b = function(o) {
  S = null, Uo && Uo(o);
}, T.__ = function(o, e) {
  o && e.__k && e.__k.__m && (o.__m = e.__k.__m), Yo && Yo(o, e);
}, T.__r = function(o) {
  Fo && Fo(o), eo = 0;
  var e = (S = o.__c).__H;
  e && (wo === S ? (e.__h = [], S.__h = [], e.__.some(function(i) {
    i.__N && (i.__ = i.__N), i.u = i.__N = void 0;
  })) : (e.__h.some(so), e.__h.some(Eo), e.__h = [], eo = 0)), wo = S;
}, T.diffed = function(o) {
  Vo && Vo(o);
  var e = o.__c;
  e && e.__H && (e.__H.__h.length && (de.push(e) !== 1 && Lo === T.requestAnimationFrame || ((Lo = T.requestAnimationFrame) || Be)(Oe)), e.__H.__.some(function(i) {
    i.u && (i.__H = i.u, i.u = void 0);
  })), wo = S = null;
}, T.__c = function(o, e) {
  e.some(function(i) {
    try {
      i.__h.some(so), i.__h = i.__h.filter(function(a) {
        return !a.__ || Eo(a);
      });
    } catch (a) {
      e.some(function(n) {
        n.__h && (n.__h = []);
      }), e = [], T.__e(a, i.__v);
    }
  }), Ko && Ko(o, e);
}, T.unmount = function(o) {
  Wo && Wo(o);
  var e, i = o.__c;
  i && i.__H && (i.__H.__.some(function(a) {
    try {
      so(a);
    } catch (n) {
      e = n;
    }
  }), i.__H = void 0, e && T.__e(e, i.__v));
};
var Jo = typeof requestAnimationFrame == "function";
function Be(o) {
  var e, i = function() {
    clearTimeout(a), Jo && cancelAnimationFrame(e), setTimeout(o);
  }, a = setTimeout(i, 35);
  Jo && (e = requestAnimationFrame(i));
}
function so(o) {
  var e = S, i = o.__c;
  typeof i == "function" && (o.__c = void 0, i()), S = e;
}
function Eo(o) {
  var e = S;
  o.__c = o.__(), S = e;
}
function be(o, e) {
  return !o || o.length !== e.length || e.some(function(i, a) {
    return i !== o[a];
  });
}
function he(o, e) {
  return typeof e == "function" ? e(o) : e;
}
const He = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  33: "SRV",
  257: "CAA"
}, Me = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "PTR", "SRV", "CAA"];
function Le(o) {
  return He[o] || `TYPE${o}`;
}
function Ue(o, e) {
  switch (e) {
    case 1:
      return o.A || "";
    case 28:
      return o.AAAA || o.Aaaa || "";
    case 5:
      return o.Cname || o.Target || "";
    case 15:
      return (o.Preference != null ? o.Preference + " " : "") + (o.Mx || "");
    case 16:
      return Array.isArray(o.Txt) ? o.Txt.join(" ") : o.Txt || "";
    case 2:
      return o.Ns || "";
    case 6:
      return [
        o.Ns,
        o.Mbox,
        "serial=" + (o.Serial || ""),
        "refresh=" + (o.Refresh || ""),
        "retry=" + (o.Retry || ""),
        "expire=" + (o.Expire || ""),
        "minttl=" + (o.Minttl || "")
      ].filter(Boolean).join(" ");
    case 12:
      return o.Ptr || "";
    case 33:
      return `${o.Priority || 0} ${o.Weight || 0} ${o.Port || 0} ${o.Target || ""}`;
    case 257:
      return (o.Flag != null ? o.Flag + " " : "") + (o.Tag ? o.Tag + " " : "") + (o.Value || "");
    default:
      try {
        return JSON.stringify(o);
      } catch {
        return String(o);
      }
  }
}
function Fe(o) {
  return (o && Array.isArray(o.Answer) ? o.Answer : []).map((i) => {
    const a = i.Hdr || {}, n = a.Rrtype || 0;
    return {
      name: a.Name || "",
      type: Le(n),
      ttl: a.Ttl != null ? String(a.Ttl) : "",
      value: Ue(i, n)
    };
  });
}
function Xo(o) {
  if (o == null) return "";
  if (typeof o == "string") return o;
  if (typeof o == "object" && "message" in o && o.message)
    return String(o.message);
  try {
    return JSON.stringify(o);
  } catch {
    return String(o);
  }
}
function Io({ label: o }) {
  return /* @__PURE__ */ r("span", { class: "row", children: [
    /* @__PURE__ */ r("span", { class: "spinner" }),
    " ",
    o ? /* @__PURE__ */ r("span", { class: "muted tiny", children: o }) : null
  ] });
}
function io({ title: o, detail: e }) {
  return /* @__PURE__ */ r("div", { class: "box err", children: [
    /* @__PURE__ */ r("strong", { children: o }),
    e ? /* @__PURE__ */ r("code", { children: e }) : null
  ] });
}
function Ve({ text: o }) {
  return /* @__PURE__ */ r("div", { class: "box ok", children: o });
}
function fe({ api: o, onSubmit: e }) {
  const [i, a] = C(o.key());
  return /* @__PURE__ */ r(
    "form",
    {
      class: "key-prompt",
      onSubmit: (n) => {
        n.preventDefault(), o.setKey(i.trim()), e();
      },
      children: [
        /* @__PURE__ */ r("div", { class: "box warn", style: "margin-bottom:.7rem", children: [
          /* @__PURE__ */ r("strong", { children: "需要 API key" }),
          /* @__PURE__ */ r("code", { children: "服务端配置了 api_key，请求需带 X-Api-Key。填入后会存在本浏览器。" })
        ] }),
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: "API key" }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "password",
              value: i,
              autocomplete: "off",
              spellcheck: !1,
              onInput: (n) => a(n.target.value),
              placeholder: "config.yaml 里的 api_key"
            }
          )
        ] }),
        /* @__PURE__ */ r("button", { type: "submit", class: "btn-sm", children: "保存并重试" })
      ]
    }
  );
}
function ve({ api: o, onAuthRequired: e, compact: i }) {
  const [a, n] = C(""), [c, s] = C("A"), [d, b] = C(!1), [p, h] = C(null), [_, t] = C("");
  async function u(g) {
    g.preventDefault();
    const A = a.trim();
    if (A) {
      b(!0), t(""), h(null);
      try {
        const { status: k, data: w } = await o.get(
          `/query?question=${encodeURIComponent(A)}&type=${encodeURIComponent(c)}`
        );
        if (k !== 200) {
          t(`HTTP ${k}${w && w.error ? " — " + Xo(w.error) : ""}`);
          return;
        }
        h({
          resolver: w?.resolver,
          queryError: w?.error ? Xo(w.error) : void 0,
          rows: Fe(w?.answer)
        });
      } catch (k) {
        if (k instanceof W) {
          e();
          return;
        }
        t(k instanceof Error ? k.message : String(k));
      } finally {
        b(!1);
      }
    }
  }
  return /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("form", { class: "lookup-form", onSubmit: u, children: [
      /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          value: a,
          placeholder: "example.com",
          autocomplete: "off",
          spellcheck: !1,
          onInput: (g) => n(g.target.value)
        }
      ),
      /* @__PURE__ */ r("select", { value: c, onChange: (g) => s(g.target.value), children: Me.map((g) => /* @__PURE__ */ r("option", { value: g, children: g }, g)) }),
      /* @__PURE__ */ r("button", { type: "submit", disabled: d, children: "Lookup" })
    ] }),
    d ? /* @__PURE__ */ r(Io, { label: "Resolving…" }) : null,
    _ ? /* @__PURE__ */ r(io, { title: "Request failed", detail: _ }) : null,
    p ? /* @__PURE__ */ r(Ke, { result: p, compact: !!i }) : null,
    !d && !_ && !p && !i ? /* @__PURE__ */ r("p", { class: "empty", children: "Enter a domain to query" }) : null
  ] });
}
function Ke({ result: o, compact: e }) {
  return /* @__PURE__ */ r("div", { children: [
    o.resolver ? /* @__PURE__ */ r("p", { class: "row tiny", style: "margin-bottom:.5rem", children: [
      /* @__PURE__ */ r("span", { class: "muted", children: "Resolver" }),
      /* @__PURE__ */ r("span", { class: "badge accent", children: o.resolver })
    ] }) : null,
    o.queryError ? /* @__PURE__ */ r(io, { title: "Query failed", detail: o.queryError }) : null,
    !o.queryError && o.rows.length === 0 ? /* @__PURE__ */ r("p", { class: "muted tiny", children: "No records found" }) : null,
    !o.queryError && o.rows.length > 0 ? e ? /* @__PURE__ */ r("p", { class: "card-answer", children: o.rows.map((i) => i.value).filter(Boolean).join(", ") }) : /* @__PURE__ */ r("div", { style: "overflow-x:auto", children: /* @__PURE__ */ r("table", { class: "answers", children: [
      /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ r("tr", { children: [
        /* @__PURE__ */ r("th", { children: "Name" }),
        /* @__PURE__ */ r("th", { children: "Type" }),
        /* @__PURE__ */ r("th", { children: "TTL" }),
        /* @__PURE__ */ r("th", { children: "Value" })
      ] }) }),
      /* @__PURE__ */ r("tbody", { children: o.rows.map((i, a) => /* @__PURE__ */ r("tr", { children: [
        /* @__PURE__ */ r("td", { title: i.name, children: i.name }),
        /* @__PURE__ */ r("td", { children: /* @__PURE__ */ r("span", { class: "badge", children: i.type }) }),
        /* @__PURE__ */ r("td", { class: "muted", children: i.ttl }),
        /* @__PURE__ */ r("td", { children: i.value })
      ] }, a)) })
    ] }) }) : null
  ] });
}
function We({ api: o }) {
  const [e, i] = C(null), [a, n] = C(""), [c, s] = C(!0), [d, b] = C(!1), [p, h] = C(0), _ = V(() => b(!0), []);
  return Y(() => {
    let t = !1;
    return s(!0), n(""), o.get("/config").then(({ status: u, data: g }) => {
      if (t) return;
      if (u !== 200) {
        n(`HTTP ${u}`);
        return;
      }
      const A = g?.config || {};
      i({
        addr: A.addr || "",
        http: A.http || "",
        ttl: A.ttl || "",
        resolverCount: Array.isArray(A.resolvers) ? A.resolvers.length : 0
      });
    }).catch((u) => {
      if (!t) {
        if (u instanceof W) {
          b(!0);
          return;
        }
        n(u instanceof Error ? u.message : String(u));
      }
    }).finally(() => {
      t || s(!1);
    }), () => {
      t = !0;
    };
  }, [o, p]), d ? /* @__PURE__ */ r(
    fe,
    {
      api: o,
      onSubmit: () => {
        b(!1), h((t) => t + 1);
      }
    }
  ) : /* @__PURE__ */ r("div", { children: [
    c ? /* @__PURE__ */ r(Io, { label: "加载中…" }) : null,
    a ? /* @__PURE__ */ r(io, { title: "状态不可用", detail: a }) : null,
    e ? /* @__PURE__ */ r("div", { class: "card-stats", children: [
      /* @__PURE__ */ r("span", { children: [
        /* @__PURE__ */ r("span", { class: "k", children: "resolvers" }),
        /* @__PURE__ */ r("span", { class: "v", children: e.resolverCount })
      ] }),
      /* @__PURE__ */ r("span", { children: [
        /* @__PURE__ */ r("span", { class: "k", children: "dns" }),
        /* @__PURE__ */ r("span", { class: "v", children: e.addr || "—" })
      ] }),
      /* @__PURE__ */ r("span", { children: [
        /* @__PURE__ */ r("span", { class: "k", children: "http" }),
        /* @__PURE__ */ r("span", { class: "v", children: e.http || "—" })
      ] }),
      /* @__PURE__ */ r("span", { children: [
        /* @__PURE__ */ r("span", { class: "k", children: "ttl" }),
        /* @__PURE__ */ r("span", { class: "v", children: e.ttl || "—" })
      ] })
    ] }) : null,
    /* @__PURE__ */ r(ve, { api: o, onAuthRequired: _, compact: !0 }, `card-lookup-${p}`)
  ] });
}
const Ye = ["forward", "forward-group", "preloader", "filter", "mock", "file"], Je = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SOA",
  "PTR",
  "SRV",
  "CAA",
  "HTTPS"
], Xe = ["forward", "forward-group", "preloader", "filter", "mock"], Qe = ["forward", "forward-group", "preloader"];
function Ge(o) {
  switch (o) {
    case "forward":
      return { name: "", type: "forward", url: "", rule: [] };
    case "forward-group":
      return {
        name: "",
        type: "forward-group",
        rule: [],
        upstreams: [{ url: "" }]
      };
    case "preloader":
      return { name: "", type: "preloader", url: "", rule: [] };
    case "filter":
      return { name: "", type: "filter", queryType: [], rule: [] };
    case "mock":
      return { name: "", type: "mock", queryType: ["A"], rule: [], answer: "" };
    case "file":
      return { type: "file", fileType: "host", location: "", refreshInterval: "10m" };
    default:
      return { type: o };
  }
}
const Z = "__id";
function Qo(o) {
  !o.config || typeof o.config != "object" || (o.config = { ...o.config }, Array.isArray(o.config.serverIP) && (o.config.serverIP = o.config.serverIP.map((e) => (e || "").trim()).filter((e) => e !== ""), o.config.serverIP.length === 0 && delete o.config.serverIP), typeof o.config.timeout == "string" && o.config.timeout.trim() === "" && delete o.config.timeout, Object.keys(o.config).length === 0 && delete o.config);
}
function Go(o) {
  return o.map((e) => {
    const i = {};
    for (const a of Object.keys(e))
      a !== Z && (i[a] = e[a]);
    return Array.isArray(i.rule) && (i.rule = i.rule.map((a) => (a == null ? "" : String(a)).trim()).filter((a) => a !== "")), Qo(i), Array.isArray(i.upstreams) && (i.upstreams = i.upstreams.map((a) => {
      const n = { ...a };
      return Qo(n), n;
    })), i.extraConfig && typeof i.extraConfig == "object" && Object.keys(i.extraConfig).length === 0 && delete i.extraConfig, i;
  });
}
function Ze(o) {
  return o.name || `(${o.type || "?"})`;
}
let ge = 0;
function or(o) {
  return !o.extraConfig || typeof o.extraConfig != "object" ? [] : Object.keys(o.extraConfig).map((e) => ({ id: ++ge, k: e, v: o.extraConfig[e] }));
}
function er(o) {
  const { resolver: e, onChange: i } = o, a = String(e.type || ""), [n, c] = C(-1), [s, d] = C(-1), [b, p] = C(() => or(e)), h = (l, m) => {
    e[l] = m, i();
  }, _ = (l, m) => {
    m === "" || m == null ? delete e[l] : e[l] = m, i();
  }, t = (l) => {
    l.config && Object.keys(l.config).length === 0 && delete l.config;
  }, u = Array.isArray(e.rule) ? e.rule : [], g = () => {
    Array.isArray(e.rule) || (e.rule = []), e.rule.push(""), i();
  }, A = (l, m) => {
    Array.isArray(e.rule) && (e.rule[l] = m), i();
  }, k = (l) => {
    Array.isArray(e.rule) && e.rule.splice(l, 1), i();
  }, w = (l, m) => {
    if (!Array.isArray(e.rule)) return;
    const v = l + m;
    if (v < 0 || v >= e.rule.length) return;
    const j = e.rule[l];
    e.rule[l] = e.rule[v], e.rule[v] = j, i();
  }, x = (l) => {
    if (n >= 0 && Array.isArray(e.rule) && n !== l) {
      const m = e.rule.splice(n, 1)[0];
      e.rule.splice(l, 0, m), i();
    }
    c(-1), d(-1);
  }, P = (l) => Array.isArray(e.queryType) && e.queryType.includes(l), q = (l) => {
    Array.isArray(e.queryType) || (e.queryType = []);
    const m = e.queryType.indexOf(l);
    m >= 0 ? e.queryType.splice(m, 1) : e.queryType.push(l), i();
  }, R = (l, m) => {
    l.config || (l.config = {}), m === "" ? delete l.config.timeout : l.config.timeout = m, t(l), i();
  }, O = (l) => l.config && Array.isArray(l.config.serverIP) ? l.config.serverIP : [], B = (l) => {
    l.config || (l.config = {}), Array.isArray(l.config.serverIP) || (l.config.serverIP = []), l.config.serverIP.push(""), i();
  }, $ = (l, m, v) => {
    l.config && Array.isArray(l.config.serverIP) && (l.config.serverIP[m] = v), i();
  }, I = (l, m) => {
    l.config && Array.isArray(l.config.serverIP) && (l.config.serverIP.splice(m, 1), l.config.serverIP.length === 0 && delete l.config.serverIP, t(l)), i();
  }, D = Array.isArray(e.upstreams) ? e.upstreams : [], N = () => {
    Array.isArray(e.upstreams) || (e.upstreams = []), e.upstreams.push({ url: "" }), i();
  }, vo = (l) => {
    Array.isArray(e.upstreams) && e.upstreams.splice(l, 1), i();
  }, H = (l) => {
    p(l);
    const m = {};
    l.forEach((v) => {
      v.k !== "" && (m[v.k] = v.v);
    }), Object.keys(m).length ? e.extraConfig = m : delete e.extraConfig, i();
  }, go = () => H([...b, { id: ++ge, k: "", v: "" }]), to = (l, m) => H(b.map((v, j) => j === l ? { ...v, k: m } : v)), K = (l, m) => H(b.map((v, j) => j === l ? { ...v, v: m } : v)), Q = (l) => H(b.filter((m, v) => v !== l)), ao = (() => {
    const l = /* @__PURE__ */ new Set(), m = /* @__PURE__ */ new Set();
    return b.forEach((v) => {
      v.k !== "" && (l.has(v.k) && m.add(v.k), l.add(v.k));
    }), [...m];
  })(), U = /* @__PURE__ */ r("div", { class: "field-row", children: [
    /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "nftset ",
        /* @__PURE__ */ r("span", { class: "hint", children: "nftables set 名" })
      ] }),
      /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          value: e.nftset || "",
          placeholder: "corp4",
          onInput: (l) => _("nftset", l.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: "nftset_ttl" }),
      /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          value: e.nftset_ttl || "",
          placeholder: "1h",
          onInput: (l) => _("nftset_ttl", l.target.value)
        }
      )
    ] })
  ] });
  return /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("div", { class: "detail-head", children: [
      /* @__PURE__ */ r("button", { class: "btn-sm secondary back-btn", onClick: o.onBack, children: "← Back" }),
      /* @__PURE__ */ r("strong", { children: e.name || "(unnamed)" }),
      /* @__PURE__ */ r("span", { class: "badge accent", children: a })
    ] }),
    a !== "file" ? /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "name ",
        /* @__PURE__ */ r("span", { class: "hint", children: "可选标签" })
      ] }),
      /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          value: e.name || "",
          placeholder: "(unnamed)",
          onInput: (l) => h("name", l.target.value)
        }
      )
    ] }) : null,
    Qe.includes(a) ? /* @__PURE__ */ r(J, { children: [
      /* @__PURE__ */ r("div", { class: "field", children: [
        /* @__PURE__ */ r("label", { children: [
          "ttl ",
          /* @__PURE__ */ r("span", { class: "hint", children: "缓存时长，如 600s / 5m；留空用全局 ttl" })
        ] }),
        /* @__PURE__ */ r(
          "input",
          {
            type: "text",
            value: e.ttl || "",
            placeholder: "(use global ttl)",
            onInput: (l) => _("ttl", l.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ r("div", { class: "field", children: /* @__PURE__ */ r("label", { class: "check-line", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "checkbox",
            checked: !!e["break-on-fail"],
            onChange: (l) => h("break-on-fail", l.target.checked)
          }
        ),
        "break-on-fail ",
        /* @__PURE__ */ r("span", { class: "hint", children: "失败即中断 resolver 链" })
      ] }) })
    ] }) : null,
    a === "forward" || a === "preloader" ? /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "url ",
        /* @__PURE__ */ r("span", { class: "hint", children: "上游：IP、IP:port、https://…(DoH)、tls://…(DoT)" })
      ] }),
      /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          value: e.url || "",
          placeholder: "114.114.114.114",
          onInput: (l) => h("url", l.target.value)
        }
      )
    ] }) : null,
    a === "forward-group" ? /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "upstreams ",
        /* @__PURE__ */ r("span", { class: "hint", children: "并发竞速，最先成功者胜出" })
      ] }),
      D.map((l, m) => /* @__PURE__ */ r("div", { class: "upstream-block", children: [
        /* @__PURE__ */ r("div", { class: "ub-head", children: [
          /* @__PURE__ */ r("span", { class: "ub-title", children: [
            "upstream ",
            m + 1
          ] }),
          /* @__PURE__ */ r("button", { class: "btn-icon secondary", title: "移除 upstream", onClick: () => vo(m), children: "✕" })
        ] }),
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: "url" }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              value: l.url || "",
              placeholder: "https://dns.google/dns-query",
              onInput: (v) => {
                l.url = v.target.value, i();
              }
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: "config.timeout" }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              value: l.config && l.config.timeout || "",
              placeholder: "3s",
              onInput: (v) => R(l, v.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { class: "field", style: "margin-bottom:0", children: [
          /* @__PURE__ */ r("label", { children: [
            "config.serverIP ",
            /* @__PURE__ */ r("span", { class: "hint", children: "bootstrap IP" })
          ] }),
          /* @__PURE__ */ r("div", { class: "row-list", children: [
            O(l).map((v, j) => /* @__PURE__ */ r("div", { class: "line-row", children: [
              /* @__PURE__ */ r(
                "input",
                {
                  type: "text",
                  value: v,
                  placeholder: "8.8.8.8",
                  onInput: (G) => $(l, j, G.target.value)
                }
              ),
              /* @__PURE__ */ r("button", { class: "btn-icon secondary", title: "移除", onClick: () => I(l, j), children: "✕" })
            ] }, j)),
            /* @__PURE__ */ r("button", { class: "add-line", onClick: () => B(l), children: "+ serverIP" })
          ] })
        ] })
      ] }, m)),
      /* @__PURE__ */ r("button", { class: "add-line", onClick: N, children: "+ 添加 upstream" })
    ] }) : null,
    Xe.includes(a) ? /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "rule ",
        /* @__PURE__ */ r("span", { class: "hint", children: "一行一条 · 支持 v2fly:cn、include:…、!黑名单、keyword:、regexp:" })
      ] }),
      /* @__PURE__ */ r("div", { class: "row-list", children: [
        u.length === 0 ? /* @__PURE__ */ r("p", { class: "muted tiny", style: "margin:0", children: "No rules — matches all queries of this resolver's scope." }) : null,
        u.map((l, m) => /* @__PURE__ */ r(
          "div",
          {
            class: `line-row${n === m ? " dragging" : ""}${s === m ? " dragover" : ""}`,
            onDragOver: (v) => {
              v.preventDefault(), d(m);
            },
            onDragLeave: () => d((v) => v === m ? -1 : v),
            onDrop: (v) => {
              v.preventDefault(), x(m);
            },
            children: [
              /* @__PURE__ */ r(
                "span",
                {
                  class: "lr-handle",
                  title: "拖动排序",
                  draggable: !0,
                  onDragStart: (v) => {
                    c(m), v.dataTransfer && (v.dataTransfer.effectAllowed = "move");
                  },
                  onDragEnd: () => {
                    c(-1), d(-1);
                  },
                  children: "∷"
                }
              ),
              /* @__PURE__ */ r(
                "input",
                {
                  type: "text",
                  value: l,
                  spellcheck: !1,
                  placeholder: "example.com / v2fly:cn / !blocked.com",
                  onInput: (v) => A(m, v.target.value)
                }
              ),
              /* @__PURE__ */ r("span", { class: "arrows", children: [
                /* @__PURE__ */ r("button", { class: "btn-icon secondary", title: "上移", disabled: m === 0, onClick: () => w(m, -1), children: "↑" }),
                /* @__PURE__ */ r(
                  "button",
                  {
                    class: "btn-icon secondary",
                    title: "下移",
                    disabled: m === u.length - 1,
                    onClick: () => w(m, 1),
                    children: "↓"
                  }
                )
              ] }),
              /* @__PURE__ */ r("button", { class: "btn-icon secondary", title: "删除规则", onClick: () => k(m), children: "✕" })
            ]
          },
          m
        )),
        /* @__PURE__ */ r("button", { class: "add-line", onClick: g, children: "+ 添加规则" })
      ] })
    ] }) : null,
    a === "filter" || a === "mock" ? /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "queryType ",
        /* @__PURE__ */ r("span", { class: "hint", children: "匹配这些记录类型（空 = 全部）" })
      ] }),
      /* @__PURE__ */ r("div", { class: "qtype-grid", children: Je.map((l) => /* @__PURE__ */ r("label", { class: `qtype-chip${P(l) ? " on" : ""}`, children: [
        /* @__PURE__ */ r("input", { type: "checkbox", checked: P(l), onChange: () => q(l) }),
        /* @__PURE__ */ r("span", { children: l })
      ] }, l)) })
    ] }) : null,
    a === "mock" ? /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "answer ",
        /* @__PURE__ */ r("span", { class: "hint", children: "命中时返回的固定 IP" })
      ] }),
      /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          value: e.answer || "",
          placeholder: "192.168.1.1",
          onInput: (l) => h("answer", l.target.value)
        }
      )
    ] }) : null,
    a === "file" ? /* @__PURE__ */ r(J, { children: [
      /* @__PURE__ */ r("div", { class: "field-row", children: [
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: "fileType" }),
          /* @__PURE__ */ r(
            "select",
            {
              value: e.fileType || "host",
              onChange: (l) => h("fileType", l.target.value),
              children: [
                /* @__PURE__ */ r("option", { value: "host", children: "host" }),
                /* @__PURE__ */ r("option", { value: "lease", children: "lease" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: "refreshInterval" }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              value: e.refreshInterval || "",
              placeholder: "10m",
              onInput: (l) => _("refreshInterval", l.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ r("div", { class: "field", children: [
        /* @__PURE__ */ r("label", { children: [
          "location ",
          /* @__PURE__ */ r("span", { class: "hint", children: "保存时会校验路径" })
        ] }),
        /* @__PURE__ */ r(
          "input",
          {
            type: "text",
            value: e.location || "",
            placeholder: "/tmp/dhcp.leases 或 system",
            onInput: (l) => h("location", l.target.value)
          }
        ),
        (e.location || "") === "system" ? /* @__PURE__ */ r("div", { class: "box warn", style: "margin-top:.4rem", children: [
          /* @__PURE__ */ r("strong", { children: "system" }),
          " = 读操作系统 hosts 文件。非 system 的路径必须在磁盘上存在， 否则保存会被拒（409）。"
        ] }) : null
      ] }),
      /* @__PURE__ */ r("details", { class: "adv", children: [
        /* @__PURE__ */ r("summary", { children: "Advanced · extraContent / extraConfig" }),
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: [
            "extraContent ",
            /* @__PURE__ */ r("span", { class: "hint", children: "内联的 host/lease 行" })
          ] }),
          /* @__PURE__ */ r(
            "textarea",
            {
              rows: 4,
              value: e.extraContent || "",
              placeholder: "1.1.1.1 a.com b.com",
              onInput: (l) => _("extraContent", l.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: [
            "extraConfig ",
            /* @__PURE__ */ r("span", { class: "hint", children: "key → value（如 domain → lan）" })
          ] }),
          /* @__PURE__ */ r("div", { class: "row-list", children: [
            b.map((l, m) => /* @__PURE__ */ r("div", { class: "kv-row", children: [
              /* @__PURE__ */ r(
                "input",
                {
                  class: "k",
                  type: "text",
                  value: l.k,
                  spellcheck: !1,
                  placeholder: "key",
                  onInput: (v) => to(m, v.target.value)
                }
              ),
              /* @__PURE__ */ r(
                "input",
                {
                  class: "v",
                  type: "text",
                  value: l.v,
                  spellcheck: !1,
                  placeholder: "value",
                  onInput: (v) => K(m, v.target.value)
                }
              ),
              /* @__PURE__ */ r("button", { class: "btn-icon secondary", title: "移除", onClick: () => Q(m), children: "✕" })
            ] }, l.id)),
            /* @__PURE__ */ r("button", { class: "add-line", onClick: go, children: "+ key/value" })
          ] }),
          b.some((l) => l.k === "") ? /* @__PURE__ */ r("p", { class: "muted tiny", style: "margin:.35rem 0 0", children: "key 为空的行不会被保存。" }) : null,
          ao.length ? /* @__PURE__ */ r("div", { class: "box warn", style: "margin-top:.4rem", children: [
            /* @__PURE__ */ r("strong", { children: [
              "重复的 key：",
              ao.join("、")
            ] }),
            /* @__PURE__ */ r("code", { children: "同名 key 只会保留最后一行的值，请改名或删掉多余的行。" })
          ] }) : null
        ] })
      ] })
    ] }) : null,
    a === "forward" || a === "preloader" ? /* @__PURE__ */ r("details", { class: "adv", children: [
      /* @__PURE__ */ r("summary", { children: "Advanced · timeout / serverIP / nftset" }),
      /* @__PURE__ */ r("div", { class: "field", children: [
        /* @__PURE__ */ r("label", { children: "config.timeout" }),
        /* @__PURE__ */ r(
          "input",
          {
            type: "text",
            value: e.config && e.config.timeout || "",
            placeholder: "3s",
            onInput: (l) => R(e, l.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ r("div", { class: "field", children: [
        /* @__PURE__ */ r("label", { children: [
          "config.serverIP ",
          /* @__PURE__ */ r("span", { class: "hint", children: "DoH/DoT 的 bootstrap IP" })
        ] }),
        /* @__PURE__ */ r("div", { class: "row-list", children: [
          O(e).map((l, m) => /* @__PURE__ */ r("div", { class: "line-row", children: [
            /* @__PURE__ */ r(
              "input",
              {
                type: "text",
                value: l,
                placeholder: "8.8.8.8",
                onInput: (v) => $(e, m, v.target.value)
              }
            ),
            /* @__PURE__ */ r("button", { class: "btn-icon secondary", title: "移除", onClick: () => I(e, m), children: "✕" })
          ] }, m)),
          /* @__PURE__ */ r("button", { class: "add-line", onClick: () => B(e), children: "+ serverIP" })
        ] })
      ] }),
      U
    ] }) : null,
    a === "forward-group" || a === "file" ? /* @__PURE__ */ r("details", { class: "adv", children: [
      /* @__PURE__ */ r("summary", { children: "Advanced · nftset" }),
      U
    ] }) : null,
    /* @__PURE__ */ r("div", { class: "detail-actions", children: [
      /* @__PURE__ */ r("button", { class: "btn-sm secondary", onClick: o.onDelete, children: "Delete resolver" }),
      /* @__PURE__ */ r("span", { class: "spacer" }),
      /* @__PURE__ */ r("button", { class: "btn-sm secondary", disabled: o.busy, onClick: o.onValidate, children: "Validate" }),
      /* @__PURE__ */ r("button", { class: "btn-sm", disabled: o.saveDisabled, onClick: o.onSave, children: "Save" })
    ] })
  ] });
}
let Zo = 0;
function rr({ api: o, onAuthRequired: e, onDirtyChange: i, retryToken: a }) {
  const [n, c] = C(!1), [s, d] = C(""), [b, p] = C(!1), [h, _] = C({ addr: "", http: "", nftset_table: "", ttl: "" }), [t, u] = C([]), [g, A] = C(""), [k, w] = C(-1), [x, P] = C(!1), [q, R] = C(!1), [O, B] = C(!1), [$, I] = C({ kind: "" }), [D, N] = C(!1), [vo, H] = C("list"), [, go] = C(0), to = V(() => go((f) => f + 1), []), [K, Q] = C(-1), [ao, U] = C(-1), l = ue(null);
  Y(() => {
    i?.(x);
  }, [x, i]);
  const m = V(() => I({ kind: "" }), []), v = V(() => {
    P(!0), B(!1), I((f) => f.kind === "ok" ? { kind: "" } : f), to();
  }, [to]), j = V((f, y) => {
    const E = f?.config || {};
    A(f?.version || ""), _({
      addr: E.addr || "",
      http: E.http || "",
      nftset_table: E.nftset_table || "",
      ttl: E.ttl || ""
    });
    const M = Array.isArray(E.resolvers) ? E.resolvers : [];
    M.forEach((Ce) => {
      Ce[Z] = ++Zo;
    }), u(M), w(
      y != null && y >= 0 && y < M.length ? y : M.length ? 0 : -1
    ), P(!1), B(!1);
  }, []), G = V(
    async (f) => {
      c(!0), d(""), m();
      try {
        const { status: y, data: E } = await o.get("/config");
        if (y !== 200) throw new Error(`HTTP ${y}${E?.error ? " — " + E.error : ""}`);
        j(E, f), p(!0);
      } catch (y) {
        if (y instanceof W) {
          e();
          return;
        }
        d(y instanceof Error ? y.message : String(y));
      } finally {
        c(!1);
      }
    },
    [o, j, m, e]
  );
  Y(() => {
    !b && !n && !s && G();
  }, [a]), Y(() => {
    if (!D) return;
    const f = (y) => {
      const E = l.current;
      E && !y.composedPath().includes(E) && N(!1);
    };
    return window.addEventListener("click", f), () => window.removeEventListener("click", f);
  }, [D]);
  const yo = k >= 0 && k < t.length ? t[k] : null, Do = q || !x || $.kind === "conflict";
  function ke(f) {
    w(f), H("detail");
  }
  function we(f) {
    N(!1);
    const y = Ge(f);
    y[Z] = ++Zo, t.push(y), w(t.length - 1), H("detail"), v();
  }
  function _e() {
    k < 0 || (t.splice(k, 1), t.length === 0 ? w(-1) : k >= t.length && w(t.length - 1), H(t.length ? "detail" : "list"), v());
  }
  function Ro(f, y) {
    if (f < 0) return;
    const E = f + y;
    if (E < 0 || E >= t.length) return;
    const M = t[f];
    t[f] = t[E], t[E] = M, w(E), v();
  }
  function xe(f) {
    if (K < 0) {
      U(-1);
      return;
    }
    if (K !== f) {
      const y = t.splice(K, 1)[0];
      t.splice(f, 0, y), w(f), v();
    }
    Q(-1), U(-1);
  }
  function $o(f) {
    if (!f) return "";
    if (f.error) {
      if (typeof f.error == "string") return f.error;
      try {
        return JSON.stringify(f.error);
      } catch {
        return String(f.error);
      }
    }
    return "";
  }
  async function jo() {
    R(!0), m();
    try {
      const { status: f, data: y } = await o.postJSON("/config/validate", {
        resolvers: Go(t)
      });
      f === 200 && y?.valid ? I({ kind: "ok", msg: "Configuration is valid." }) : I({
        kind: "error",
        msg: "Validation failed" + (y?.stage ? ` (${y.stage})` : ""),
        detail: $o(y)
      });
    } catch (f) {
      if (f instanceof W) {
        e();
        return;
      }
      I({
        kind: "error",
        msg: "Validate request failed",
        detail: f instanceof Error ? f.message : String(f)
      });
    } finally {
      R(!1);
    }
  }
  async function qo() {
    R(!0), m();
    try {
      const { status: f, data: y } = await o.postJSON("/config", {
        version: g,
        resolvers: Go(t)
      });
      if (f === 200 && y?.ok) {
        const E = k, M = await o.get("/config");
        M.status === 200 && j(M.data, E), B(!0), I({ kind: "ok", msg: "Saved. Config reloaded and applied live." });
      } else f === 409 && y?.stage === "version" ? I({ kind: "conflict" }) : I({
        kind: "error",
        msg: "Save failed" + (y?.stage ? ` (${y.stage})` : ""),
        detail: $o(y)
      });
    } catch (f) {
      if (f instanceof W) {
        e();
        return;
      }
      I({
        kind: "error",
        msg: "Save request failed",
        detail: f instanceof Error ? f.message : String(f)
      });
    } finally {
      R(!1);
    }
  }
  return n ? /* @__PURE__ */ r(Io, { label: "Loading configuration…" }) : s ? /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r(io, { title: "Failed to load config", detail: s }),
    /* @__PURE__ */ r("button", { class: "btn-sm secondary", style: "margin-top:.7rem", onClick: () => void G(), children: "Retry" })
  ] }) : /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("div", { class: "readonly-bar", children: [
      /* @__PURE__ */ r("span", { children: [
        /* @__PURE__ */ r("span", { class: "k", children: "addr" }),
        /* @__PURE__ */ r("span", { class: "v", children: h.addr || "—" })
      ] }),
      /* @__PURE__ */ r("span", { children: [
        /* @__PURE__ */ r("span", { class: "k", children: "http" }),
        /* @__PURE__ */ r("span", { class: "v", children: h.http || "—" })
      ] }),
      /* @__PURE__ */ r("span", { children: [
        /* @__PURE__ */ r("span", { class: "k", children: "nftset_table" }),
        /* @__PURE__ */ r("span", { class: "v", children: h.nftset_table || "(default)" })
      ] }),
      /* @__PURE__ */ r("span", { children: [
        /* @__PURE__ */ r("span", { class: "k", children: "ttl" }),
        /* @__PURE__ */ r("span", { class: "v", children: h.ttl || "—" })
      ] }),
      /* @__PURE__ */ r("span", { class: "note", title: "顶层字段只读，改请直接编辑配置文件", children: "只读，改请直接编辑配置文件" })
    ] }),
    /* @__PURE__ */ r("div", { class: "toolbar", children: [
      /* @__PURE__ */ r("button", { class: "btn-sm secondary", disabled: q, onClick: () => void jo(), children: "Validate" }),
      /* @__PURE__ */ r("button", { class: "btn-sm", disabled: Do, onClick: () => void qo(), children: q ? "Saving…" : "Save" }),
      x && !O ? /* @__PURE__ */ r("span", { class: "dirty", children: "● Unsaved changes" }) : null,
      O ? /* @__PURE__ */ r("span", { class: "saved", children: "✓ Saved" }) : null,
      /* @__PURE__ */ r("span", { class: "spacer" }),
      /* @__PURE__ */ r("span", { class: "muted tiny", children: [
        "version ",
        /* @__PURE__ */ r("span", { class: "mono", children: g ? g.slice(0, 8) : "—" })
      ] })
    ] }),
    /* @__PURE__ */ r("div", { class: "master-detail", "data-view": vo, children: [
      /* @__PURE__ */ r("div", { class: "master", children: [
        /* @__PURE__ */ r("div", { class: "master-head", children: "Resolvers · order = priority" }),
        /* @__PURE__ */ r("div", { class: "r-list", children: [
          t.length === 0 ? /* @__PURE__ */ r("div", { class: "empty", children: [
            /* @__PURE__ */ r("span", { children: "No resolvers yet" }),
            /* @__PURE__ */ r("span", { class: "tiny", children: "Use + Add below to create one" })
          ] }) : null,
          t.map((f, y) => /* @__PURE__ */ r(
            "div",
            {
              class: `r-item${K === y ? " dragging" : ""}${ao === y ? " dragover" : ""}`,
              "aria-selected": y === k,
              onClick: () => ke(y),
              draggable: !0,
              onDragStart: (E) => {
                Q(y), E.dataTransfer && (E.dataTransfer.effectAllowed = "move");
              },
              onDragOver: (E) => {
                E.preventDefault(), U(y);
              },
              onDragLeave: () => U((E) => E === y ? -1 : E),
              onDrop: (E) => {
                E.preventDefault(), xe(y);
              },
              onDragEnd: () => {
                Q(-1), U(-1);
              },
              children: [
                /* @__PURE__ */ r("span", { class: "r-handle", title: "Drag to reorder", children: "∷" }),
                /* @__PURE__ */ r("span", { class: "r-idx", children: y + 1 }),
                /* @__PURE__ */ r("span", { class: `r-label${f.name ? "" : " unnamed"}`, children: Ze(f) }),
                /* @__PURE__ */ r("span", { class: "badge", children: f.type || "?" })
              ]
            },
            f[Z]
          ))
        ] }),
        /* @__PURE__ */ r("div", { class: "master-foot", children: [
          /* @__PURE__ */ r("div", { class: "add-wrap", ref: l, children: [
            /* @__PURE__ */ r("button", { class: "btn-sm secondary", onClick: () => N((f) => !f), children: "+ Add ▾" }),
            D ? /* @__PURE__ */ r("div", { class: "add-menu", children: Ye.map((f) => /* @__PURE__ */ r("button", { onClick: () => we(f), children: f }, f)) }) : null
          ] }),
          /* @__PURE__ */ r("span", { class: "spacer" }),
          /* @__PURE__ */ r(
            "button",
            {
              class: "btn-icon secondary",
              title: "Move up",
              disabled: k <= 0,
              onClick: () => Ro(k, -1),
              children: "↑"
            }
          ),
          /* @__PURE__ */ r(
            "button",
            {
              class: "btn-icon secondary",
              title: "Move down",
              disabled: k < 0 || k === t.length - 1,
              onClick: () => Ro(k, 1),
              children: "↓"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ r("div", { class: "detail", children: yo ? /* @__PURE__ */ r(
        er,
        {
          resolver: yo,
          busy: q,
          saveDisabled: Do,
          onChange: v,
          onBack: () => H("list"),
          onDelete: _e,
          onValidate: () => void jo(),
          onSave: () => void qo()
        },
        yo[Z]
      ) : /* @__PURE__ */ r("div", { class: "empty", children: t.length ? "Select a resolver to edit" : "Add a resolver to begin" }) })
    ] }),
    /* @__PURE__ */ r("div", { style: "margin-top:.7rem", children: [
      $.kind === "ok" ? /* @__PURE__ */ r(Ve, { text: $.msg || "" }) : null,
      $.kind === "error" ? /* @__PURE__ */ r(io, { title: $.msg || "Error", detail: $.detail }) : null,
      $.kind === "conflict" ? /* @__PURE__ */ r("div", { class: "box err", children: [
        /* @__PURE__ */ r("strong", { children: "配置已在别处变更" }),
        /* @__PURE__ */ r("code", { children: "The configuration was modified elsewhere since you loaded it. Reload to discard your local changes." }),
        /* @__PURE__ */ r(
          "button",
          {
            class: "btn-sm",
            style: "margin-top:.6rem",
            onClick: () => {
              m(), G();
            },
            children: "重新加载（丢弃本地改动）"
          }
        )
      ] }) : null
    ] })
  ] });
}
function ir({ api: o }) {
  const [e, i] = C("lookup"), [a, n] = C(!1), [c, s] = C(0), [d, b] = C(!1), p = ue(!1);
  Y(() => {
    e === "config" && b(!0);
  }, [e]);
  const h = V(() => n(!0), []), _ = V((u) => {
    p.current = u;
  }, []);
  Y(() => {
    const u = (g) => {
      p.current && (g.preventDefault(), g.returnValue = "");
    };
    return window.addEventListener("beforeunload", u), () => window.removeEventListener("beforeunload", u);
  }, []);
  function t(u) {
    e === "config" && u !== "config" && p.current && !confirm("You have unsaved configuration changes. Leave anyway?") || i(u);
  }
  return /* @__PURE__ */ r("div", { children: [
    a ? /* @__PURE__ */ r("div", { style: "margin-bottom:.8rem", children: /* @__PURE__ */ r(
      fe,
      {
        api: o,
        onSubmit: () => {
          n(!1), s((u) => u + 1);
        }
      }
    ) }) : null,
    /* @__PURE__ */ r("div", { class: "tabs", role: "tablist", children: [
      /* @__PURE__ */ r("button", { role: "tab", "aria-selected": e === "lookup", onClick: () => t("lookup"), children: "Lookup" }),
      /* @__PURE__ */ r("button", { role: "tab", "aria-selected": e === "config", onClick: () => t("config"), children: "Config" })
    ] }),
    /* @__PURE__ */ r("div", { hidden: e !== "lookup", children: /* @__PURE__ */ r(ve, { api: o, onAuthRequired: h }, `lookup-${c}`) }),
    d ? /* @__PURE__ */ r("div", { hidden: e !== "config", children: /* @__PURE__ */ r(
      rr,
      {
        api: o,
        onAuthRequired: h,
        onDirtyChange: _,
        retryToken: c
      }
    ) }) : null
  ] });
}
function ye(o, e) {
  if (customElements.get(o)) return;
  class i extends HTMLElement {
    constructor() {
      super(...arguments), this.mount = null;
    }
    connectedCallback() {
      const n = this.shadowRoot ?? this.attachShadow({ mode: "open" });
      if (!this.mount) {
        const s = document.createElement("style");
        s.textContent = Re, n.appendChild(s), this.mount = document.createElement("div"), this.mount.className = "pico", n.appendChild(this.mount);
      }
      const c = this.getAttribute("api-base") || "/api";
      Mo(/* @__PURE__ */ r(e, { api: qe(c) }), this.mount);
    }
    disconnectedCallback() {
      this.mount && Mo(null, this.mount);
    }
  }
  customElements.define(o, i);
}
ye("dns-card", We);
ye("dns-panel", ir);
