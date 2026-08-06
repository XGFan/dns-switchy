var vo, A, oe, L, qo, ee, re, xo, po, eo, ie, To, Eo, zo, ho = {}, fo = [], Se = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, yo = Array.isArray;
function H(o, e) {
  for (var i in e) o[i] = e[i];
  return o;
}
function Po(o) {
  o && o.parentNode && o.parentNode.removeChild(o);
}
function Te(o, e, i) {
  var t, n, a, s = {};
  for (a in e) a == "key" ? t = e[a] : a == "ref" ? n = e[a] : s[a] = e[a];
  if (arguments.length > 2 && (s.children = arguments.length > 3 ? vo.call(arguments, 2) : i), typeof o == "function" && o.defaultProps != null) for (a in o.defaultProps) s[a] === void 0 && (s[a] = o.defaultProps[a]);
  return so(o, s, t, n, null);
}
function so(o, e, i, t, n) {
  var a = { type: o, props: e, key: i, ref: t, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: n ?? ++oe, __i: -1, __u: 0 };
  return n == null && A.vnode != null && A.vnode(a), a;
}
function F(o) {
  return o.children;
}
function uo(o, e) {
  this.props = o, this.context = e;
}
function X(o, e) {
  if (e == null) return o.__ ? X(o.__, o.__i + 1) : null;
  for (var i; e < o.__k.length; e++) if ((i = o.__k[e]) != null && i.__e != null) return i.__e;
  return typeof o.type == "function" ? X(o) : null;
}
function Pe(o) {
  if (o.__P && o.__d) {
    var e = o.__v, i = e.__e, t = [], n = [], a = H({}, e);
    a.__v = e.__v + 1, A.vnode && A.vnode(a), Io(o.__P, a, e, o.__n, o.__P.namespaceURI, 32 & e.__u ? [i] : null, t, i ?? X(e), !!(32 & e.__u), n), a.__v = e.__v, a.__.__k[a.__i] = a, le(t, a, n), e.__e = e.__ = null, a.__e != i && te(a);
  }
}
function te(o) {
  if ((o = o.__) != null && o.__c != null) return o.__e = o.__c.base = null, o.__k.some(function(e) {
    if (e != null && e.__e != null) return o.__e = o.__c.base = e.__e;
  }), te(o);
}
function No(o) {
  (!o.__d && (o.__d = !0) && L.push(o) && !go.__r++ || qo != A.debounceRendering) && ((qo = A.debounceRendering) || ee)(go);
}
function go() {
  try {
    for (var o, e = 1; L.length; ) L.length > e && L.sort(re), o = L.shift(), e = L.length, Pe(o);
  } finally {
    L.length = go.__r = 0;
  }
}
function ae(o, e, i, t, n, a, s, d, m, p, f) {
  var w, c, u, C, z, S, v, k = t && t.__k || fo, E = e.length;
  for (m = Ie(i, e, k, m, E), w = 0; w < E; w++) (u = i.__k[w]) != null && (c = u.__i != -1 && k[u.__i] || ho, u.__i = w, S = Io(o, u, c, n, a, s, d, m, p, f), C = u.__e, u.ref && c.ref != u.ref && (c.ref && Do(c.ref, null, u), f.push(u.ref, u.__c || C, u)), z == null && C != null && (z = C), (v = !!(4 & u.__u)) || c.__k === u.__k ? (m = ce(u, m, o, v), v && c.__e && (c.__e = null)) : typeof u.type == "function" && S !== void 0 ? m = S : C && (m = C.nextSibling), u.__u &= -7);
  return i.__e = z, m;
}
function Ie(o, e, i, t, n) {
  var a, s, d, m, p, f = i.length, w = f, c = 0;
  for (o.__k = new Array(n), a = 0; a < n; a++) (s = e[a]) != null && typeof s != "boolean" && typeof s != "function" ? (typeof s == "string" || typeof s == "number" || typeof s == "bigint" || s.constructor == String ? s = o.__k[a] = so(null, s, null, null, null) : yo(s) ? s = o.__k[a] = so(F, { children: s }, null, null, null) : s.constructor === void 0 && s.__b > 0 ? s = o.__k[a] = so(s.type, s.props, s.key, s.ref ? s.ref : null, s.__v) : o.__k[a] = s, m = a + c, s.__ = o, s.__b = o.__b + 1, d = null, (p = s.__i = De(s, i, m, w)) != -1 && (w--, (d = i[p]) && (d.__u |= 2)), d == null || d.__v == null ? (p == -1 && (n > f ? c-- : n < f && c++), typeof s.type != "function" && (s.__u |= 4)) : p != m && (p == m - 1 ? c-- : p == m + 1 ? c++ : (p > m ? c-- : c++, s.__u |= 4))) : o.__k[a] = null;
  if (w) for (a = 0; a < f; a++) (d = i[a]) != null && !(2 & d.__u) && (d.__e == t && (t = X(d)), se(d, d));
  return t;
}
function ce(o, e, i, t) {
  var n, a;
  if (typeof o.type == "function") {
    for (n = o.__k, a = 0; n && a < n.length; a++) n[a] && (n[a].__ = o, e = ce(n[a], e, i, t));
    return e;
  }
  o.__e != e && (t && (e && o.type && !e.parentNode && (e = X(o)), i.insertBefore(o.__e, e || null)), e = o.__e);
  do
    e = e && e.nextSibling;
  while (e != null && e.nodeType == 8);
  return e;
}
function De(o, e, i, t) {
  var n, a, s, d = o.key, m = o.type, p = e[i], f = p != null && (2 & p.__u) == 0;
  if (p === null && d == null || f && d == p.key && m == p.type) return i;
  if (t > (f ? 1 : 0)) {
    for (n = i - 1, a = i + 1; n >= 0 || a < e.length; ) if ((p = e[s = n >= 0 ? n-- : a++]) != null && !(2 & p.__u) && d == p.key && m == p.type) return s;
  }
  return -1;
}
function Oo(o, e, i) {
  e[0] == "-" ? o.setProperty(e, i ?? "") : o[e] = i == null ? "" : typeof i != "number" || Se.test(e) ? i : i + "px";
}
function lo(o, e, i, t, n) {
  var a, s;
  o: if (e == "style") if (typeof i == "string") o.style.cssText = i;
  else {
    if (typeof t == "string" && (o.style.cssText = t = ""), t) for (e in t) i && e in i || Oo(o.style, e, "");
    if (i) for (e in i) t && i[e] == t[e] || Oo(o.style, e, i[e]);
  }
  else if (e[0] == "o" && e[1] == "n") a = e != (e = e.replace(ie, "$1")), s = e.toLowerCase(), e = s in o || e == "onFocusOut" || e == "onFocusIn" ? s.slice(2) : e.slice(2), o.l || (o.l = {}), o.l[e + a] = i, i ? t ? i[eo] = t[eo] : (i[eo] = To, o.addEventListener(e, a ? zo : Eo, a)) : o.removeEventListener(e, a ? zo : Eo, a);
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
function Bo(o) {
  return function(e) {
    if (this.l) {
      var i = this.l[e.type + o];
      if (e[po] == null) e[po] = To++;
      else if (e[po] < i[eo]) return;
      return i(A.event ? A.event(e) : e);
    }
  };
}
function Io(o, e, i, t, n, a, s, d, m, p) {
  var f, w, c, u, C, z, S, v, k, E, D, j, q, M, O, $, T = e.type;
  if (e.constructor !== void 0) return null;
  128 & i.__u && (m = !!(32 & i.__u), a = [d = e.__e = i.__e]), (f = A.__b) && f(e);
  o: if (typeof T == "function") {
    w = s.length;
    try {
      if (k = e.props, E = T.prototype && T.prototype.render, D = (f = T.contextType) && t[f.__c], j = f ? D ? D.props.value : f.__ : t, i.__c ? v = (c = e.__c = i.__c).__ = c.__E : (E ? e.__c = c = new T(k, j) : (e.__c = c = new uo(k, j), c.constructor = T, c.render = Re), D && D.sub(c), c.state || (c.state = {}), c.__n = t, u = c.__d = !0, c.__h = [], c._sb = []), E && c.__s == null && (c.__s = c.state), E && T.getDerivedStateFromProps != null && (c.__s == c.state && (c.__s = H({}, c.__s)), H(c.__s, T.getDerivedStateFromProps(k, c.__s))), C = c.props, z = c.state, c.__v = e, u) E && T.getDerivedStateFromProps == null && c.componentWillMount != null && c.componentWillMount(), E && c.componentDidMount != null && c.__h.push(c.componentDidMount);
      else {
        if (E && T.getDerivedStateFromProps == null && k !== C && c.componentWillReceiveProps != null && c.componentWillReceiveProps(k, j), e.__v == i.__v || !c.__e && c.shouldComponentUpdate != null && c.shouldComponentUpdate(k, c.__s, j) === !1) {
          e.__v != i.__v && (c.props = k, c.state = c.__s, c.__d = !1), e.__e = i.__e, e.__k = i.__k, e.__k.some(function(N) {
            N && (N.__ = e);
          }), fo.push.apply(c.__h, c._sb), c._sb = [], c.__h.length && s.push(c);
          break o;
        }
        c.componentWillUpdate != null && c.componentWillUpdate(k, c.__s, j), E && c.componentDidUpdate != null && c.__h.push(function() {
          c.componentDidUpdate(C, z, S);
        });
      }
      if (c.context = j, c.props = k, c.__P = o, c.__e = !1, q = A.__r, M = 0, E) c.state = c.__s, c.__d = !1, q && q(e), f = c.render(c.props, c.state, c.context), fo.push.apply(c.__h, c._sb), c._sb = [];
      else do
        c.__d = !1, q && q(e), f = c.render(c.props, c.state, c.context), c.state = c.__s;
      while (c.__d && ++M < 25);
      c.state = c.__s, c.getChildContext != null && (t = H(H({}, t), c.getChildContext())), E && !u && c.getSnapshotBeforeUpdate != null && (S = c.getSnapshotBeforeUpdate(C, z)), O = f != null && f.type === F && f.key == null ? pe(f.props.children) : f, d = ae(o, yo(O) ? O : [O], e, i, t, n, a, s, d, m, p), c.base = e.__e, e.__u &= -161, c.__h.length && s.push(c), v && (c.__E = c.__ = null);
    } catch (N) {
      if (s.length = w, e.__v = null, m || a != null) {
        if (N.then) {
          for (e.__u |= m ? 160 : 128; d && d.nodeType == 8 && d.nextSibling; ) d = d.nextSibling;
          a != null && (a[a.indexOf(d)] = null), e.__e = d;
        } else if (a != null) for ($ = a.length; $--; ) Po(a[$]);
      } else e.__e = i.__e;
      e.__k == null && (e.__k = i.__k || []), N.then || ne(e), A.__e(N, e, i);
    }
  } else a == null && e.__v == i.__v ? (e.__k = i.__k, e.__e = i.__e) : d = e.__e = je(i.__e, e, i, t, n, a, s, m, p);
  return (f = A.diffed) && f(e), 128 & e.__u ? void 0 : d;
}
function ne(o) {
  o && (o.__c && (o.__c.__e = !0), o.__k && o.__k.some(ne));
}
function le(o, e, i) {
  for (var t = 0; t < i.length; t++) Do(i[t], i[++t], i[++t]);
  A.__c && A.__c(e, o), o.some(function(n) {
    try {
      o = n.__h, n.__h = [], o.some(function(a) {
        a.call(n);
      });
    } catch (a) {
      A.__e(a, n.__v);
    }
  });
}
function pe(o) {
  return typeof o != "object" || o == null || o.__b > 0 ? o : yo(o) ? o.map(pe) : o.constructor !== void 0 ? null : H({}, o);
}
function je(o, e, i, t, n, a, s, d, m) {
  var p, f, w, c, u, C, z, S = i.props || ho, v = e.props, k = e.type;
  if (k == "svg" ? n = "http://www.w3.org/2000/svg" : k == "math" ? n = "http://www.w3.org/1998/Math/MathML" : n || (n = "http://www.w3.org/1999/xhtml"), a != null) {
    for (p = 0; p < a.length; p++) if ((u = a[p]) && "setAttribute" in u == !!k && (k ? u.localName == k : u.nodeType == 3)) {
      o = u, a[p] = null;
      break;
    }
  }
  if (o == null) {
    if (k == null) return document.createTextNode(v);
    o = document.createElementNS(n, k, v.is && v), d && (A.__m && A.__m(e, a), d = !1), a = null;
  }
  if (k == null) S === v || d && o.data == v || (o.data = v);
  else {
    if (a = k == "textarea" && v.defaultValue != null ? null : a && vo.call(o.childNodes), !d && a != null) for (S = {}, p = 0; p < o.attributes.length; p++) S[(u = o.attributes[p]).name] = u.value;
    for (p in S) u = S[p], p == "dangerouslySetInnerHTML" ? w = u : p == "children" || p in v || p == "value" && "defaultValue" in v || p == "checked" && "defaultChecked" in v || lo(o, p, null, u, n);
    for (p in v) u = v[p], p == "children" ? c = u : p == "dangerouslySetInnerHTML" ? f = u : p == "value" ? C = u : p == "checked" ? z = u : d && typeof u != "function" || S[p] === u || lo(o, p, u, S[p], n);
    if (f) d || w && (f.__html == w.__html || f.__html == o.innerHTML) || (o.innerHTML = f.__html), e.__k = [];
    else if (w && (o.innerHTML = ""), ae(e.type == "template" ? o.content : o, yo(c) ? c : [c], e, i, t, k == "foreignObject" ? "http://www.w3.org/1999/xhtml" : n, a, s, a ? a[0] : i.__k && X(i, 0), d, m), a != null) for (p = a.length; p--; ) Po(a[p]);
    d && k != "textarea" || (p = "value", k == "progress" && C == null ? o.removeAttribute("value") : C != null && (C !== o[p] || k == "progress" && !C || k == "option" && C != S[p]) && lo(o, p, C, S[p], n), p = "checked", z != null && z != o[p] && lo(o, p, z, S[p], n));
  }
  return o;
}
function Do(o, e, i) {
  try {
    if (typeof o == "function") {
      var t = typeof o.__u == "function";
      t && o.__u(), t && e == null || (o.__u = o(e));
    } else o.current = e;
  } catch (n) {
    A.__e(n, i);
  }
}
function se(o, e, i) {
  var t, n;
  if (A.unmount && A.unmount(o), (t = o.ref) && (t.current && t.current != o.__e || Do(t, null, e)), (t = o.__c) != null) {
    if (t.componentWillUnmount) try {
      t.componentWillUnmount();
    } catch (a) {
      A.__e(a, e);
    }
    t.base = t.__P = t.__n = null;
  }
  if (t = o.__k) for (n = 0; n < t.length; n++) t[n] && se(t[n], e, i || typeof o.type != "function");
  i || Po(o.__e), o.__c = o.__ = o.__e = void 0;
}
function Re(o, e, i) {
  return this.constructor(o, i);
}
function Ho(o, e, i) {
  var t, n, a, s;
  e == document && (e = document.documentElement), A.__ && A.__(o, e), n = (t = !1) ? null : e.__k, a = [], s = [], Io(e, o = e.__k = Te(F, null, [o]), n || ho, ho, e.namespaceURI, n ? null : e.firstChild ? vo.call(e.childNodes) : null, a, n ? n.__e : e.firstChild, t, s), le(a, o, s), o.props.children = null;
}
vo = fo.slice, A = { __e: function(o, e, i, t) {
  for (var n, a, s; e = e.__; ) if ((n = e.__c) && !n.__) try {
    if ((a = n.constructor) && a.getDerivedStateFromError != null && (n.setState(a.getDerivedStateFromError(o)), s = n.__d), n.componentDidCatch != null && (n.componentDidCatch(o, t || {}), s = n.__d), s) return n.__E = n;
  } catch (d) {
    o = d;
  }
  throw o;
} }, oe = 0, uo.prototype.setState = function(o, e) {
  var i;
  i = this.__s != null && this.__s != this.state ? this.__s : this.__s = H({}, this.state), typeof o == "function" && (o = o(H({}, i), this.props)), o && H(i, o), o != null && this.__v && (e && this._sb.push(e), No(this));
}, uo.prototype.forceUpdate = function(o) {
  this.__v && (this.__e = !0, o && this.__h.push(o), No(this));
}, uo.prototype.render = F, L = [], ee = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, re = function(o, e) {
  return o.__v.__b - e.__v.__b;
}, go.__r = 0, xo = Math.random().toString(8), po = "__d" + xo, eo = "__a" + xo, ie = /(PointerCapture)$|Capture$/i, To = 0, Eo = Bo(!1), zo = Bo(!0);
var $e = 0;
function r(o, e, i, t, n, a) {
  e || (e = {});
  var s, d, m = e;
  if ("ref" in m) for (d in m = {}, e) d == "ref" ? s = e[d] : m[d] = e[d];
  var p = { type: o, props: m, key: i, ref: s, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --$e, __i: -1, __u: 0, __source: n, __self: a };
  if (typeof o == "function" && (s = o.defaultProps)) for (d in s) m[d] === void 0 && (m[d] = s[d]);
  return A.vnode && A.vnode(p), p;
}
const qe = `@charset "UTF-8";@layer pico,joy;@layer pico{/*!
 * Pico CSS ✨ v2.1.1 (https://picocss.com)
 * Copyright 2019-2025 - Licensed under MIT
 */:host,:root{--pico-font-family-emoji:"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--pico-font-family-sans-serif:system-ui,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,Helvetica,Arial,"Helvetica Neue",sans-serif,var(--pico-font-family-emoji);--pico-font-family-monospace:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace,var(--pico-font-family-emoji);--pico-font-family:var(--pico-font-family-sans-serif);--pico-line-height:1.5;--pico-font-weight:400;--pico-font-size:100%;--pico-text-underline-offset:.1rem;--pico-border-radius:.25rem;--pico-border-width:.0625rem;--pico-outline-width:.125rem;--pico-transition:.2s ease-in-out;--pico-spacing:1rem;--pico-typography-spacing-vertical:1rem;--pico-block-spacing-vertical:var(--pico-spacing);--pico-block-spacing-horizontal:var(--pico-spacing);--pico-grid-column-gap:var(--pico-spacing);--pico-grid-row-gap:var(--pico-spacing);--pico-form-element-spacing-vertical:.75rem;--pico-form-element-spacing-horizontal:1rem;--pico-group-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-group-box-shadow-focus-with-button:0 0 0 var(--pico-outline-width) var(--pico-primary-focus);--pico-group-box-shadow-focus-with-input:0 0 0 .0625rem var(--pico-form-element-border-color);--pico-modal-overlay-backdrop-filter:blur(.375rem);--pico-nav-element-spacing-vertical:1rem;--pico-nav-element-spacing-horizontal:.5rem;--pico-nav-link-spacing-vertical:.5rem;--pico-nav-link-spacing-horizontal:.5rem;--pico-nav-breadcrumb-divider:">";--pico-icon-checkbox:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-minus:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3C/svg%3E");--pico-icon-chevron:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-date:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");--pico-icon-time:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-search:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");--pico-icon-close:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E");--pico-icon-loading:url("data:image/svg+xml,%3Csvg fill='none' height='24' width='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' %3E%3Cstyle%3E g %7B animation: rotate 2s linear infinite; transform-origin: center center; %7D circle %7B stroke-dasharray: 75,100; stroke-dashoffset: -5; animation: dash 1.5s ease-in-out infinite; stroke-linecap: round; %7D @keyframes rotate %7B 0%25 %7B transform: rotate(0deg); %7D 100%25 %7B transform: rotate(360deg); %7D %7D @keyframes dash %7B 0%25 %7B stroke-dasharray: 1,100; stroke-dashoffset: 0; %7D 50%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -17.5; %7D 100%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -62; %7D %7D %3C/style%3E%3Cg%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='rgb(136, 145, 164)' stroke-width='4' /%3E%3C/g%3E%3C/svg%3E")}@media (min-width:576px){:host,:root{--pico-font-size:106.25%}}@media (min-width:768px){:host,:root{--pico-font-size:112.5%}}@media (min-width:1024px){:host,:root{--pico-font-size:118.75%}}@media (min-width:1280px){:host,:root{--pico-font-size:125%}}@media (min-width:1536px){:host,:root{--pico-font-size:131.25%}}a,a.contrast,a.secondary{--pico-text-decoration:underline}small{--pico-font-size:.875em}h1,h2,h3,h4,h5,h6{--pico-font-weight:700}h1{--pico-font-size:2rem;--pico-line-height:1.125;--pico-typography-spacing-top:3rem}h2{--pico-font-size:1.75rem;--pico-line-height:1.15;--pico-typography-spacing-top:2.625rem}h3{--pico-font-size:1.5rem;--pico-line-height:1.175;--pico-typography-spacing-top:2.25rem}h4{--pico-font-size:1.25rem;--pico-line-height:1.2;--pico-typography-spacing-top:1.874rem}h5{--pico-font-size:1.125rem;--pico-line-height:1.225;--pico-typography-spacing-top:1.6875rem}h6{--pico-font-size:1rem;--pico-line-height:1.25;--pico-typography-spacing-top:1.5rem}tfoot td,tfoot th,thead td,thead th{--pico-font-weight:600;--pico-border-width:.1875rem}code,kbd,pre,samp{--pico-font-family:var(--pico-font-family-monospace)}kbd{--pico-font-weight:bolder}:where(select,textarea),input:not([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-outline-width:.0625rem}[type=search]{--pico-border-radius:5rem}[type=checkbox],[type=radio]{--pico-border-width:.125rem}[type=checkbox][role=switch]{--pico-border-width:.1875rem}details.dropdown summary:not([role=button]){--pico-outline-width:.0625rem}nav details.dropdown summary:focus-visible{--pico-outline-width:.125rem}[role=search]{--pico-border-radius:5rem}[role=group]:has(button.secondary:focus,[type=submit].secondary:focus,[type=button].secondary:focus,[role=button].secondary:focus),[role=search]:has(button.secondary:focus,[type=submit].secondary:focus,[type=button].secondary:focus,[role=button].secondary:focus){--pico-group-box-shadow-focus-with-button:0 0 0 var(--pico-outline-width) var(--pico-secondary-focus)}[role=group]:has(button.contrast:focus,[type=submit].contrast:focus,[type=button].contrast:focus,[role=button].contrast:focus),[role=search]:has(button.contrast:focus,[type=submit].contrast:focus,[type=button].contrast:focus,[role=button].contrast:focus){--pico-group-box-shadow-focus-with-button:0 0 0 var(--pico-outline-width) var(--pico-contrast-focus)}[role=group] [role=button],[role=group] [type=button],[role=group] [type=submit],[role=group] button,[role=search] [role=button],[role=search] [type=button],[role=search] [type=submit],[role=search] button{--pico-form-element-spacing-horizontal:2rem}.pico details summary[role=button]:not(.outline):after{filter:brightness(0) invert(1)}.pico [aria-busy=true]:not(input,select,textarea):is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before{filter:brightness(0) invert(1)}:host(:not([data-theme=dark])),:root:not([data-theme=dark]),[data-theme=light]{color-scheme:light;--pico-background-color:#fff;--pico-color:#373c44;--pico-text-selection-color:rgba(2, 154, 232, .25);--pico-muted-color:#646b79;--pico-muted-border-color:rgb(231, 234, 239.5);--pico-primary:#0172ad;--pico-primary-background:#0172ad;--pico-primary-border:var(--pico-primary-background);--pico-primary-underline:rgba(1, 114, 173, .5);--pico-primary-hover:#015887;--pico-primary-hover-background:#02659a;--pico-primary-hover-border:var(--pico-primary-hover-background);--pico-primary-hover-underline:var(--pico-primary-hover);--pico-primary-focus:rgba(2, 154, 232, .5);--pico-primary-inverse:#fff;--pico-secondary:#5d6b89;--pico-secondary-background:#525f7a;--pico-secondary-border:var(--pico-secondary-background);--pico-secondary-underline:rgba(93, 107, 137, .5);--pico-secondary-hover:#48536b;--pico-secondary-hover-background:#48536b;--pico-secondary-hover-border:var(--pico-secondary-hover-background);--pico-secondary-hover-underline:var(--pico-secondary-hover);--pico-secondary-focus:rgba(93, 107, 137, .25);--pico-secondary-inverse:#fff;--pico-contrast:#181c25;--pico-contrast-background:#181c25;--pico-contrast-border:var(--pico-contrast-background);--pico-contrast-underline:rgba(24, 28, 37, .5);--pico-contrast-hover:#000;--pico-contrast-hover-background:#000;--pico-contrast-hover-border:var(--pico-contrast-hover-background);--pico-contrast-hover-underline:var(--pico-secondary-hover);--pico-contrast-focus:rgba(93, 107, 137, .25);--pico-contrast-inverse:#fff;--pico-box-shadow:.0145rem .029rem .174rem rgba(129, 145, 181, .01698),.0335rem .067rem .402rem rgba(129, 145, 181, .024),.0625rem .125rem .75rem rgba(129, 145, 181, .03),.1125rem .225rem 1.35rem rgba(129, 145, 181, .036),.2085rem .417rem 2.502rem rgba(129, 145, 181, .04302),.5rem 1rem 6rem rgba(129, 145, 181, .06),0 0 0 .0625rem rgba(129, 145, 181, .015);--pico-h1-color:#2d3138;--pico-h2-color:#373c44;--pico-h3-color:#424751;--pico-h4-color:#4d535e;--pico-h5-color:#5c6370;--pico-h6-color:#646b79;--pico-mark-background-color:rgb(252.5, 230.5, 191.5);--pico-mark-color:#0f1114;--pico-ins-color:rgb(28.5, 105.5, 84);--pico-del-color:rgb(136, 56.5, 53);--pico-blockquote-border-color:var(--pico-muted-border-color);--pico-blockquote-footer-color:var(--pico-muted-color);--pico-button-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-button-hover-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-table-border-color:var(--pico-muted-border-color);--pico-table-row-stripped-background-color:rgba(111, 120, 135, .0375);--pico-code-background-color:rgb(243, 244.5, 246.75);--pico-code-color:#646b79;--pico-code-kbd-background-color:var(--pico-color);--pico-code-kbd-color:var(--pico-background-color);--pico-form-element-background-color:rgb(251, 251.5, 252.25);--pico-form-element-selected-background-color:#dfe3eb;--pico-form-element-border-color:#cfd5e2;--pico-form-element-color:#23262c;--pico-form-element-placeholder-color:var(--pico-muted-color);--pico-form-element-active-background-color:#fff;--pico-form-element-active-border-color:var(--pico-primary-border);--pico-form-element-focus-color:var(--pico-primary-border);--pico-form-element-disabled-opacity:.5;--pico-form-element-invalid-border-color:rgb(183.5, 105.5, 106.5);--pico-form-element-invalid-active-border-color:rgb(200.25, 79.25, 72.25);--pico-form-element-invalid-focus-color:var(--pico-form-element-invalid-active-border-color);--pico-form-element-valid-border-color:rgb(76, 154.5, 137.5);--pico-form-element-valid-active-border-color:rgb(39, 152.75, 118.75);--pico-form-element-valid-focus-color:var(--pico-form-element-valid-active-border-color);--pico-switch-background-color:#bfc7d9;--pico-switch-checked-background-color:var(--pico-primary-background);--pico-switch-color:#fff;--pico-switch-thumb-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-range-border-color:#dfe3eb;--pico-range-active-border-color:#bfc7d9;--pico-range-thumb-border-color:var(--pico-background-color);--pico-range-thumb-color:var(--pico-secondary-background);--pico-range-thumb-active-color:var(--pico-primary-background);--pico-accordion-border-color:var(--pico-muted-border-color);--pico-accordion-active-summary-color:var(--pico-primary-hover);--pico-accordion-close-summary-color:var(--pico-color);--pico-accordion-open-summary-color:var(--pico-muted-color);--pico-card-background-color:var(--pico-background-color);--pico-card-border-color:var(--pico-muted-border-color);--pico-card-box-shadow:var(--pico-box-shadow);--pico-card-sectioning-background-color:rgb(251, 251.5, 252.25);--pico-dropdown-background-color:#fff;--pico-dropdown-border-color:#eff1f4;--pico-dropdown-box-shadow:var(--pico-box-shadow);--pico-dropdown-color:var(--pico-color);--pico-dropdown-hover-background-color:#eff1f4;--pico-loading-spinner-opacity:.5;--pico-modal-overlay-background-color:rgba(232, 234, 237, .75);--pico-progress-background-color:#dfe3eb;--pico-progress-color:var(--pico-primary-background);--pico-tooltip-background-color:var(--pico-contrast-background);--pico-tooltip-color:var(--pico-contrast-inverse);--pico-icon-valid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(76, 154.5, 137.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-invalid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(200.25, 79.25, 72.25)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E")}:host(:not([data-theme=dark])) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]),:root:not([data-theme=dark]) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]),[data-theme=light] input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-form-element-focus-color:var(--pico-primary-focus)}@media only screen and (prefers-color-scheme:dark){:host(:not([data-theme])),:root:not([data-theme]){color-scheme:dark;--pico-background-color:rgb(19, 22.5, 30.5);--pico-color:#c2c7d0;--pico-text-selection-color:rgba(1, 170, 255, .1875);--pico-muted-color:#7b8495;--pico-muted-border-color:#202632;--pico-primary:#01aaff;--pico-primary-background:#0172ad;--pico-primary-border:var(--pico-primary-background);--pico-primary-underline:rgba(1, 170, 255, .5);--pico-primary-hover:#79c0ff;--pico-primary-hover-background:#017fc0;--pico-primary-hover-border:var(--pico-primary-hover-background);--pico-primary-hover-underline:var(--pico-primary-hover);--pico-primary-focus:rgba(1, 170, 255, .375);--pico-primary-inverse:#fff;--pico-secondary:#969eaf;--pico-secondary-background:#525f7a;--pico-secondary-border:var(--pico-secondary-background);--pico-secondary-underline:rgba(150, 158, 175, .5);--pico-secondary-hover:#b3b9c5;--pico-secondary-hover-background:#5d6b89;--pico-secondary-hover-border:var(--pico-secondary-hover-background);--pico-secondary-hover-underline:var(--pico-secondary-hover);--pico-secondary-focus:rgba(144, 158, 190, .25);--pico-secondary-inverse:#fff;--pico-contrast:#dfe3eb;--pico-contrast-background:#eff1f4;--pico-contrast-border:var(--pico-contrast-background);--pico-contrast-underline:rgba(223, 227, 235, .5);--pico-contrast-hover:#fff;--pico-contrast-hover-background:#fff;--pico-contrast-hover-border:var(--pico-contrast-hover-background);--pico-contrast-hover-underline:var(--pico-contrast-hover);--pico-contrast-focus:rgba(207, 213, 226, .25);--pico-contrast-inverse:#000;--pico-box-shadow:.0145rem .029rem .174rem rgba(7, 8.5, 12, .01698),.0335rem .067rem .402rem rgba(7, 8.5, 12, .024),.0625rem .125rem .75rem rgba(7, 8.5, 12, .03),.1125rem .225rem 1.35rem rgba(7, 8.5, 12, .036),.2085rem .417rem 2.502rem rgba(7, 8.5, 12, .04302),.5rem 1rem 6rem rgba(7, 8.5, 12, .06),0 0 0 .0625rem rgba(7, 8.5, 12, .015);--pico-h1-color:#f0f1f3;--pico-h2-color:#e0e3e7;--pico-h3-color:#c2c7d0;--pico-h4-color:#b3b9c5;--pico-h5-color:#a4acba;--pico-h6-color:#8891a4;--pico-mark-background-color:#014063;--pico-mark-color:#fff;--pico-ins-color:#62af9a;--pico-del-color:rgb(205.5, 126, 123);--pico-blockquote-border-color:var(--pico-muted-border-color);--pico-blockquote-footer-color:var(--pico-muted-color);--pico-button-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-button-hover-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-table-border-color:var(--pico-muted-border-color);--pico-table-row-stripped-background-color:rgba(111, 120, 135, .0375);--pico-code-background-color:rgb(26, 30.5, 40.25);--pico-code-color:#8891a4;--pico-code-kbd-background-color:var(--pico-color);--pico-code-kbd-color:var(--pico-background-color);--pico-form-element-background-color:rgb(28, 33, 43.5);--pico-form-element-selected-background-color:#2a3140;--pico-form-element-border-color:#2a3140;--pico-form-element-color:#e0e3e7;--pico-form-element-placeholder-color:#8891a4;--pico-form-element-active-background-color:rgb(26, 30.5, 40.25);--pico-form-element-active-border-color:var(--pico-primary-border);--pico-form-element-focus-color:var(--pico-primary-border);--pico-form-element-disabled-opacity:.5;--pico-form-element-invalid-border-color:rgb(149.5, 74, 80);--pico-form-element-invalid-active-border-color:rgb(183.25, 63.5, 59);--pico-form-element-invalid-focus-color:var(--pico-form-element-invalid-active-border-color);--pico-form-element-valid-border-color:#2a7b6f;--pico-form-element-valid-active-border-color:rgb(22, 137, 105.5);--pico-form-element-valid-focus-color:var(--pico-form-element-valid-active-border-color);--pico-switch-background-color:#333c4e;--pico-switch-checked-background-color:var(--pico-primary-background);--pico-switch-color:#fff;--pico-switch-thumb-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-range-border-color:#202632;--pico-range-active-border-color:#2a3140;--pico-range-thumb-border-color:var(--pico-background-color);--pico-range-thumb-color:var(--pico-secondary-background);--pico-range-thumb-active-color:var(--pico-primary-background);--pico-accordion-border-color:var(--pico-muted-border-color);--pico-accordion-active-summary-color:var(--pico-primary-hover);--pico-accordion-close-summary-color:var(--pico-color);--pico-accordion-open-summary-color:var(--pico-muted-color);--pico-card-background-color:#181c25;--pico-card-border-color:var(--pico-card-background-color);--pico-card-box-shadow:var(--pico-box-shadow);--pico-card-sectioning-background-color:rgb(26, 30.5, 40.25);--pico-dropdown-background-color:#181c25;--pico-dropdown-border-color:#202632;--pico-dropdown-box-shadow:var(--pico-box-shadow);--pico-dropdown-color:var(--pico-color);--pico-dropdown-hover-background-color:#202632;--pico-loading-spinner-opacity:.5;--pico-modal-overlay-background-color:rgba(7.5, 8.5, 10, .75);--pico-progress-background-color:#202632;--pico-progress-color:var(--pico-primary-background);--pico-tooltip-background-color:var(--pico-contrast-background);--pico-tooltip-color:var(--pico-contrast-inverse);--pico-icon-valid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(42, 123, 111)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-invalid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(149.5, 74, 80)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E")}:host(:not([data-theme])) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]),:root:not([data-theme]) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-form-element-focus-color:var(--pico-primary-focus)}:host(:not([data-theme])) .pico details summary[role=button].contrast:not(.outline):after,:root:not([data-theme]) .pico details summary[role=button].contrast:not(.outline):after{filter:brightness(0)}:host(:not([data-theme])) .pico [aria-busy=true]:not(input,select,textarea).contrast:is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before,:root:not([data-theme]) .pico [aria-busy=true]:not(input,select,textarea).contrast:is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before{filter:brightness(0)}}[data-theme=dark]{color-scheme:dark;--pico-background-color:rgb(19, 22.5, 30.5);--pico-color:#c2c7d0;--pico-text-selection-color:rgba(1, 170, 255, .1875);--pico-muted-color:#7b8495;--pico-muted-border-color:#202632;--pico-primary:#01aaff;--pico-primary-background:#0172ad;--pico-primary-border:var(--pico-primary-background);--pico-primary-underline:rgba(1, 170, 255, .5);--pico-primary-hover:#79c0ff;--pico-primary-hover-background:#017fc0;--pico-primary-hover-border:var(--pico-primary-hover-background);--pico-primary-hover-underline:var(--pico-primary-hover);--pico-primary-focus:rgba(1, 170, 255, .375);--pico-primary-inverse:#fff;--pico-secondary:#969eaf;--pico-secondary-background:#525f7a;--pico-secondary-border:var(--pico-secondary-background);--pico-secondary-underline:rgba(150, 158, 175, .5);--pico-secondary-hover:#b3b9c5;--pico-secondary-hover-background:#5d6b89;--pico-secondary-hover-border:var(--pico-secondary-hover-background);--pico-secondary-hover-underline:var(--pico-secondary-hover);--pico-secondary-focus:rgba(144, 158, 190, .25);--pico-secondary-inverse:#fff;--pico-contrast:#dfe3eb;--pico-contrast-background:#eff1f4;--pico-contrast-border:var(--pico-contrast-background);--pico-contrast-underline:rgba(223, 227, 235, .5);--pico-contrast-hover:#fff;--pico-contrast-hover-background:#fff;--pico-contrast-hover-border:var(--pico-contrast-hover-background);--pico-contrast-hover-underline:var(--pico-contrast-hover);--pico-contrast-focus:rgba(207, 213, 226, .25);--pico-contrast-inverse:#000;--pico-box-shadow:.0145rem .029rem .174rem rgba(7, 8.5, 12, .01698),.0335rem .067rem .402rem rgba(7, 8.5, 12, .024),.0625rem .125rem .75rem rgba(7, 8.5, 12, .03),.1125rem .225rem 1.35rem rgba(7, 8.5, 12, .036),.2085rem .417rem 2.502rem rgba(7, 8.5, 12, .04302),.5rem 1rem 6rem rgba(7, 8.5, 12, .06),0 0 0 .0625rem rgba(7, 8.5, 12, .015);--pico-h1-color:#f0f1f3;--pico-h2-color:#e0e3e7;--pico-h3-color:#c2c7d0;--pico-h4-color:#b3b9c5;--pico-h5-color:#a4acba;--pico-h6-color:#8891a4;--pico-mark-background-color:#014063;--pico-mark-color:#fff;--pico-ins-color:#62af9a;--pico-del-color:rgb(205.5, 126, 123);--pico-blockquote-border-color:var(--pico-muted-border-color);--pico-blockquote-footer-color:var(--pico-muted-color);--pico-button-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-button-hover-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-table-border-color:var(--pico-muted-border-color);--pico-table-row-stripped-background-color:rgba(111, 120, 135, .0375);--pico-code-background-color:rgb(26, 30.5, 40.25);--pico-code-color:#8891a4;--pico-code-kbd-background-color:var(--pico-color);--pico-code-kbd-color:var(--pico-background-color);--pico-form-element-background-color:rgb(28, 33, 43.5);--pico-form-element-selected-background-color:#2a3140;--pico-form-element-border-color:#2a3140;--pico-form-element-color:#e0e3e7;--pico-form-element-placeholder-color:#8891a4;--pico-form-element-active-background-color:rgb(26, 30.5, 40.25);--pico-form-element-active-border-color:var(--pico-primary-border);--pico-form-element-focus-color:var(--pico-primary-border);--pico-form-element-disabled-opacity:.5;--pico-form-element-invalid-border-color:rgb(149.5, 74, 80);--pico-form-element-invalid-active-border-color:rgb(183.25, 63.5, 59);--pico-form-element-invalid-focus-color:var(--pico-form-element-invalid-active-border-color);--pico-form-element-valid-border-color:#2a7b6f;--pico-form-element-valid-active-border-color:rgb(22, 137, 105.5);--pico-form-element-valid-focus-color:var(--pico-form-element-valid-active-border-color);--pico-switch-background-color:#333c4e;--pico-switch-checked-background-color:var(--pico-primary-background);--pico-switch-color:#fff;--pico-switch-thumb-box-shadow:0 0 0 rgba(0, 0, 0, 0);--pico-range-border-color:#202632;--pico-range-active-border-color:#2a3140;--pico-range-thumb-border-color:var(--pico-background-color);--pico-range-thumb-color:var(--pico-secondary-background);--pico-range-thumb-active-color:var(--pico-primary-background);--pico-accordion-border-color:var(--pico-muted-border-color);--pico-accordion-active-summary-color:var(--pico-primary-hover);--pico-accordion-close-summary-color:var(--pico-color);--pico-accordion-open-summary-color:var(--pico-muted-color);--pico-card-background-color:#181c25;--pico-card-border-color:var(--pico-card-background-color);--pico-card-box-shadow:var(--pico-box-shadow);--pico-card-sectioning-background-color:rgb(26, 30.5, 40.25);--pico-dropdown-background-color:#181c25;--pico-dropdown-border-color:#202632;--pico-dropdown-box-shadow:var(--pico-box-shadow);--pico-dropdown-color:var(--pico-color);--pico-dropdown-hover-background-color:#202632;--pico-loading-spinner-opacity:.5;--pico-modal-overlay-background-color:rgba(7.5, 8.5, 10, .75);--pico-progress-background-color:#202632;--pico-progress-color:var(--pico-primary-background);--pico-tooltip-background-color:var(--pico-contrast-background);--pico-tooltip-color:var(--pico-contrast-inverse);--pico-icon-valid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(42, 123, 111)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");--pico-icon-invalid:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(149.5, 74, 80)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E")}[data-theme=dark] input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-form-element-focus-color:var(--pico-primary-focus)}[data-theme=dark] .pico details summary[role=button].contrast:not(.outline):after{filter:brightness(0)}[data-theme=dark] .pico [aria-busy=true]:not(input,select,textarea).contrast:is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before{filter:brightness(0)}.pico [type=checkbox],.pico [type=radio],.pico [type=range],.pico progress{accent-color:var(--pico-primary)}*,:after,:before{box-sizing:border-box;background-repeat:no-repeat}:after,:before{text-decoration:inherit;vertical-align:inherit}:where(:host),:where(:root){-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;text-size-adjust:100%;background-color:var(--pico-background-color);color:var(--pico-color);font-weight:var(--pico-font-weight);font-size:var(--pico-font-size);line-height:var(--pico-line-height);font-family:var(--pico-font-family);text-underline-offset:var(--pico-text-underline-offset);text-rendering:optimizeLegibility;overflow-wrap:break-word;-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{width:100%;margin:0}main{display:block}.pico body>footer,.pico body>header,.pico body>main{padding-block:var(--pico-block-spacing-vertical)}.pico section{margin-bottom:var(--pico-block-spacing-vertical)}.container,.container-fluid{width:100%;margin-right:auto;margin-left:auto;padding-right:var(--pico-spacing);padding-left:var(--pico-spacing)}@media (min-width:576px){.container{max-width:510px;padding-right:0;padding-left:0}}@media (min-width:768px){.container{max-width:700px}}@media (min-width:1024px){.container{max-width:950px}}@media (min-width:1280px){.container{max-width:1200px}}@media (min-width:1536px){.container{max-width:1450px}}.grid{grid-column-gap:var(--pico-grid-column-gap);grid-row-gap:var(--pico-grid-row-gap);display:grid;grid-template-columns:1fr}@media (min-width:768px){.grid{grid-template-columns:repeat(auto-fit,minmax(0%,1fr))}}.grid>*{min-width:0}.pico .overflow-auto{overflow:auto}.pico b,.pico strong{font-weight:bolder}.pico sub,.pico sup{position:relative;font-size:.75em;line-height:0;vertical-align:baseline}.pico sub{bottom:-.25em}.pico sup{top:-.5em}.pico address,.pico blockquote,.pico dl,.pico ol,.pico p,.pico pre,.pico table,.pico ul{margin-top:0;margin-bottom:var(--pico-typography-spacing-vertical);color:var(--pico-color);font-style:normal;font-weight:var(--pico-font-weight)}.pico h1,.pico h2,.pico h3,.pico h4,.pico h5,.pico h6{margin-top:0;margin-bottom:var(--pico-typography-spacing-vertical);color:var(--pico-color);font-weight:var(--pico-font-weight);font-size:var(--pico-font-size);line-height:var(--pico-line-height);font-family:var(--pico-font-family)}.pico h1{--pico-color:var(--pico-h1-color)}.pico h2{--pico-color:var(--pico-h2-color)}.pico h3{--pico-color:var(--pico-h3-color)}.pico h4{--pico-color:var(--pico-h4-color)}.pico h5{--pico-color:var(--pico-h5-color)}.pico h6{--pico-color:var(--pico-h6-color)}.pico :where(article,address,blockquote,dl,figure,form,ol,p,pre,table,ul)~:is(h1,h2,h3,h4,h5,h6){margin-top:var(--pico-typography-spacing-top)}.pico p{margin-bottom:var(--pico-typography-spacing-vertical)}.pico hgroup{margin-bottom:var(--pico-typography-spacing-vertical)}.pico hgroup>*{margin-top:0;margin-bottom:0}.pico hgroup>:not(:first-child):last-child{--pico-color:var(--pico-muted-color);--pico-font-weight:unset;font-size:1rem}.pico :where(ol,ul) li{margin-bottom:calc(var(--pico-typography-spacing-vertical) * .25)}.pico :where(dl,ol,ul) :where(dl,ol,ul){margin:0;margin-top:calc(var(--pico-typography-spacing-vertical) * .25)}.pico ul li{list-style:square}.pico mark{padding:.125rem .25rem;background-color:var(--pico-mark-background-color);color:var(--pico-mark-color);vertical-align:baseline}.pico blockquote{display:block;margin:var(--pico-typography-spacing-vertical) 0;padding:var(--pico-spacing);border-right:none;border-left:.25rem solid var(--pico-blockquote-border-color);border-inline-start:.25rem solid var(--pico-blockquote-border-color);border-inline-end:none}.pico blockquote footer{margin-top:calc(var(--pico-typography-spacing-vertical) * .5);color:var(--pico-blockquote-footer-color)}.pico abbr[title]{border-bottom:1px dotted;text-decoration:none;cursor:help}.pico ins{color:var(--pico-ins-color);text-decoration:none}.pico del{color:var(--pico-del-color)}.pico ::-moz-selection{background-color:var(--pico-text-selection-color)}.pico ::selection{background-color:var(--pico-text-selection-color)}.pico :where(a:not([role=button])),.pico [role=link]{--pico-color:var(--pico-primary);--pico-background-color:transparent;--pico-underline:var(--pico-primary-underline);outline:0;background-color:var(--pico-background-color);color:var(--pico-color);-webkit-text-decoration:var(--pico-text-decoration);text-decoration:var(--pico-text-decoration);text-decoration-color:var(--pico-underline);text-underline-offset:.125em;transition:background-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition),-webkit-text-decoration var(--pico-transition);transition:background-color var(--pico-transition),color var(--pico-transition),text-decoration var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),color var(--pico-transition),text-decoration var(--pico-transition),box-shadow var(--pico-transition),-webkit-text-decoration var(--pico-transition)}.pico :where(a:not([role=button])):is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [role=link]:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-primary-hover);--pico-underline:var(--pico-primary-hover-underline);--pico-text-decoration:underline}.pico :where(a:not([role=button])):focus-visible,.pico [role=link]:focus-visible{box-shadow:0 0 0 var(--pico-outline-width) var(--pico-primary-focus)}.pico :where(a:not([role=button])).secondary,.pico [role=link].secondary{--pico-color:var(--pico-secondary);--pico-underline:var(--pico-secondary-underline)}.pico :where(a:not([role=button])).secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [role=link].secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-secondary-hover);--pico-underline:var(--pico-secondary-hover-underline)}.pico :where(a:not([role=button])).contrast,.pico [role=link].contrast{--pico-color:var(--pico-contrast);--pico-underline:var(--pico-contrast-underline)}.pico :where(a:not([role=button])).contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [role=link].contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-contrast-hover);--pico-underline:var(--pico-contrast-hover-underline)}.pico a[role=button]{display:inline-block}.pico button{margin:0;overflow:visible;font-family:inherit;text-transform:none}.pico [type=button],.pico [type=reset],.pico [type=submit],.pico button{-webkit-appearance:button}.pico [role=button],.pico [type=button],.pico [type=file]::file-selector-button,.pico [type=reset],.pico [type=submit],.pico button{--pico-background-color:var(--pico-primary-background);--pico-border-color:var(--pico-primary-border);--pico-color:var(--pico-primary-inverse);--pico-box-shadow:var(--pico-button-box-shadow, 0 0 0 rgba(0, 0, 0, 0));padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);border:var(--pico-border-width) solid var(--pico-border-color);border-radius:var(--pico-border-radius);outline:0;background-color:var(--pico-background-color);box-shadow:var(--pico-box-shadow);color:var(--pico-color);font-weight:var(--pico-font-weight);font-size:1rem;line-height:var(--pico-line-height);text-align:center;text-decoration:none;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none;transition:background-color var(--pico-transition),border-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition)}.pico [role=button]:is(:hover,:active,:focus),.pico [role=button]:is([aria-current]:not([aria-current=false])),.pico [type=button]:is(:hover,:active,:focus),.pico [type=button]:is([aria-current]:not([aria-current=false])),.pico [type=file]::file-selector-button:is(:hover,:active,:focus),.pico [type=file]::file-selector-button:is([aria-current]:not([aria-current=false])),.pico [type=reset]:is(:hover,:active,:focus),.pico [type=reset]:is([aria-current]:not([aria-current=false])),.pico [type=submit]:is(:hover,:active,:focus),.pico [type=submit]:is([aria-current]:not([aria-current=false])),.pico button:is(:hover,:active,:focus),.pico button:is([aria-current]:not([aria-current=false])){--pico-background-color:var(--pico-primary-hover-background);--pico-border-color:var(--pico-primary-hover-border);--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0));--pico-color:var(--pico-primary-inverse)}.pico [role=button]:focus,.pico [role=button]:is([aria-current]:not([aria-current=false])):focus,.pico [type=button]:focus,.pico [type=button]:is([aria-current]:not([aria-current=false])):focus,.pico [type=file]::file-selector-button:focus,.pico [type=file]::file-selector-button:is([aria-current]:not([aria-current=false])):focus,.pico [type=reset]:focus,.pico [type=reset]:is([aria-current]:not([aria-current=false])):focus,.pico [type=submit]:focus,.pico [type=submit]:is([aria-current]:not([aria-current=false])):focus,.pico button:focus,.pico button:is([aria-current]:not([aria-current=false])):focus{--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),0 0 0 var(--pico-outline-width) var(--pico-primary-focus)}.pico [type=button],.pico [type=reset],.pico [type=submit]{margin-bottom:var(--pico-spacing)}.pico :is(button,[type=submit],[type=button],[role=button]).secondary,.pico [type=file]::file-selector-button,.pico [type=reset]{--pico-background-color:var(--pico-secondary-background);--pico-border-color:var(--pico-secondary-border);--pico-color:var(--pico-secondary-inverse);cursor:pointer}.pico :is(button,[type=submit],[type=button],[role=button]).secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [type=file]::file-selector-button:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [type=reset]:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-background-color:var(--pico-secondary-hover-background);--pico-border-color:var(--pico-secondary-hover-border);--pico-color:var(--pico-secondary-inverse)}.pico :is(button,[type=submit],[type=button],[role=button]).secondary:focus,.pico :is(button,[type=submit],[type=button],[role=button]).secondary:is([aria-current]:not([aria-current=false])):focus,.pico [type=file]::file-selector-button:focus,.pico [type=file]::file-selector-button:is([aria-current]:not([aria-current=false])):focus,.pico [type=reset]:focus,.pico [type=reset]:is([aria-current]:not([aria-current=false])):focus{--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),0 0 0 var(--pico-outline-width) var(--pico-secondary-focus)}.pico :is(button,[type=submit],[type=button],[role=button]).contrast{--pico-background-color:var(--pico-contrast-background);--pico-border-color:var(--pico-contrast-border);--pico-color:var(--pico-contrast-inverse)}.pico :is(button,[type=submit],[type=button],[role=button]).contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-background-color:var(--pico-contrast-hover-background);--pico-border-color:var(--pico-contrast-hover-border);--pico-color:var(--pico-contrast-inverse)}.pico :is(button,[type=submit],[type=button],[role=button]).contrast:focus,.pico :is(button,[type=submit],[type=button],[role=button]).contrast:is([aria-current]:not([aria-current=false])):focus{--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),0 0 0 var(--pico-outline-width) var(--pico-contrast-focus)}.pico :is(button,[type=submit],[type=button],[role=button]).outline,[type=reset].outline{--pico-background-color:transparent;--pico-color:var(--pico-primary);--pico-border-color:var(--pico-primary)}.pico :is(button,[type=submit],[type=button],[role=button]).outline:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),[type=reset].outline:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-background-color:transparent;--pico-color:var(--pico-primary-hover);--pico-border-color:var(--pico-primary-hover)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.secondary,[type=reset].outline{--pico-color:var(--pico-secondary);--pico-border-color:var(--pico-secondary)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),[type=reset].outline:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-secondary-hover);--pico-border-color:var(--pico-secondary-hover)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.contrast{--pico-color:var(--pico-contrast);--pico-border-color:var(--pico-contrast)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-contrast-hover);--pico-border-color:var(--pico-contrast-hover)}.pico :where(button,[type=submit],[type=reset],[type=button],[role=button])[disabled],.pico :where(fieldset[disabled]) :is(button,[type=submit],[type=button],[type=reset],[role=button]){opacity:.5;pointer-events:none}.pico :where(table){width:100%;border-collapse:collapse;border-spacing:0;text-indent:0}.pico td,.pico th{padding:calc(var(--pico-spacing)/ 2) var(--pico-spacing);border-bottom:var(--pico-border-width) solid var(--pico-table-border-color);background-color:var(--pico-background-color);color:var(--pico-color);font-weight:var(--pico-font-weight);text-align:left;text-align:start}.pico tfoot td,.pico tfoot th{border-top:var(--pico-border-width) solid var(--pico-table-border-color);border-bottom:0}.pico table.striped tbody tr:nth-child(odd) td,.pico table.striped tbody tr:nth-child(odd) th{background-color:var(--pico-table-row-stripped-background-color)}.pico :where(audio,canvas,iframe,img,svg,video){vertical-align:middle}.pico audio,.pico video{display:inline-block}.pico audio:not([controls]){display:none;height:0}.pico :where(iframe){border-style:none}.pico img{max-width:100%;height:auto;border-style:none}.pico :where(svg:not([fill])){fill:currentColor}.pico svg:not(:host),.pico svg:not(:root){overflow:hidden}.pico code,.pico kbd,.pico pre,.pico samp{font-size:.875em;font-family:var(--pico-font-family)}.pico pre code,.pico pre samp{font-size:inherit;font-family:inherit}.pico pre{-ms-overflow-style:scrollbar;overflow:auto}.pico code,.pico kbd,.pico pre,.pico samp{border-radius:var(--pico-border-radius);background:var(--pico-code-background-color);color:var(--pico-code-color);font-weight:var(--pico-font-weight);line-height:initial}.pico code,.pico kbd,.pico samp{display:inline-block;padding:.375rem}.pico pre{display:block;margin-bottom:var(--pico-spacing);overflow-x:auto}.pico pre>code,.pico pre>samp{display:block;padding:var(--pico-spacing);background:0 0;line-height:var(--pico-line-height)}.pico kbd{background-color:var(--pico-code-kbd-background-color);color:var(--pico-code-kbd-color);vertical-align:baseline}.pico figure{display:block;margin:0;padding:0}.pico figure figcaption{padding:calc(var(--pico-spacing) * .5) 0;color:var(--pico-muted-color)}.pico hr{height:0;margin:var(--pico-typography-spacing-vertical) 0;border:0;border-top:1px solid var(--pico-muted-border-color);color:inherit}.pico [hidden],.pico template{display:none!important}.pico canvas{display:inline-block}.pico input,.pico optgroup,.pico select,.pico textarea{margin:0;font-size:1rem;line-height:var(--pico-line-height);font-family:inherit;letter-spacing:inherit}.pico input{overflow:visible}.pico select{text-transform:none}.pico legend{max-width:100%;padding:0;color:inherit;white-space:normal}.pico textarea{overflow:auto}.pico [type=checkbox],.pico [type=radio]{padding:0}.pico ::-webkit-inner-spin-button,.pico ::-webkit-outer-spin-button{height:auto}.pico [type=search]{-webkit-appearance:textfield;outline-offset:-2px}.pico [type=search]::-webkit-search-decoration{-webkit-appearance:none}.pico ::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}.pico ::-moz-focus-inner{padding:0;border-style:none}.pico :-moz-focusring{outline:0}.pico :-moz-ui-invalid{box-shadow:none}.pico ::-ms-expand{display:none}.pico [type=file],.pico [type=range]{padding:0;border-width:0}.pico input:not([type=checkbox],[type=radio],[type=range]){height:calc(1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 + var(--pico-border-width) * 2)}.pico fieldset{width:100%;margin:0;margin-bottom:var(--pico-spacing);padding:0;border:0}.pico fieldset legend,.pico label{display:block;margin-bottom:calc(var(--pico-spacing) * .375);color:var(--pico-color);font-weight:var(--pico-form-label-font-weight,var(--pico-font-weight))}.pico fieldset legend{margin-bottom:calc(var(--pico-spacing) * .5)}.pico button[type=submit],.pico input:not([type=checkbox],[type=radio]),.pico select,.pico textarea{width:100%}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file]),.pico select,.pico textarea{-webkit-appearance:none;-moz-appearance:none;appearance:none;padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal)}.pico input,.pico select,.pico textarea{--pico-background-color:var(--pico-form-element-background-color);--pico-border-color:var(--pico-form-element-border-color);--pico-color:var(--pico-form-element-color);--pico-box-shadow:none;border:var(--pico-border-width) solid var(--pico-border-color);border-radius:var(--pico-border-radius);outline:0;background-color:var(--pico-background-color);box-shadow:var(--pico-box-shadow);color:var(--pico-color);font-weight:var(--pico-font-weight);transition:background-color var(--pico-transition),border-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition)}.pico :where(select,textarea):not([readonly]):is(:active,:focus),.pico input:not([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[readonly]):is(:active,:focus){--pico-background-color:var(--pico-form-element-active-background-color)}.pico :where(select,textarea):not([readonly]):is(:active,:focus),.pico input:not([type=submit],[type=button],[type=reset],[role=switch],[readonly]):is(:active,:focus){--pico-border-color:var(--pico-form-element-active-border-color)}.pico :where(select,textarea):not([readonly]):focus,.pico input:not([type=submit],[type=button],[type=reset],[type=range],[type=file],[readonly]):focus{--pico-box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-focus-color)}.pico :where(fieldset[disabled]) :is(input:not([type=submit],[type=button],[type=reset]),select,textarea),.pico input:not([type=submit],[type=button],[type=reset])[disabled],.pico label[aria-disabled=true],.pico select[disabled],.pico textarea[disabled]{opacity:var(--pico-form-element-disabled-opacity);pointer-events:none}.pico label[aria-disabled=true] input[disabled]{opacity:1}.pico :where(input,select,textarea):not([type=checkbox],[type=radio],[type=date],[type=datetime-local],[type=month],[type=time],[type=week],[type=range])[aria-invalid]{padding-right:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem)!important;padding-left:var(--pico-form-element-spacing-horizontal);padding-inline-start:var(--pico-form-element-spacing-horizontal)!important;padding-inline-end:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem)!important;background-position:center right .75rem;background-size:1rem auto;background-repeat:no-repeat}.pico :where(input,select,textarea):not([type=checkbox],[type=radio],[type=date],[type=datetime-local],[type=month],[type=time],[type=week],[type=range])[aria-invalid=false]:not(select){background-image:var(--pico-icon-valid)}.pico :where(input,select,textarea):not([type=checkbox],[type=radio],[type=date],[type=datetime-local],[type=month],[type=time],[type=week],[type=range])[aria-invalid=true]:not(select){background-image:var(--pico-icon-invalid)}.pico :where(input,select,textarea)[aria-invalid=false]{--pico-border-color:var(--pico-form-element-valid-border-color)}.pico :where(input,select,textarea)[aria-invalid=false]:is(:active,:focus){--pico-border-color:var(--pico-form-element-valid-active-border-color)!important}.pico :where(input,select,textarea)[aria-invalid=false]:is(:active,:focus):not([type=checkbox],[type=radio]){--pico-box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-valid-focus-color)!important}.pico :where(input,select,textarea)[aria-invalid=true]{--pico-border-color:var(--pico-form-element-invalid-border-color)}.pico :where(input,select,textarea)[aria-invalid=true]:is(:active,:focus){--pico-border-color:var(--pico-form-element-invalid-active-border-color)!important}.pico :where(input,select,textarea)[aria-invalid=true]:is(:active,:focus):not([type=checkbox],[type=radio]){--pico-box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-invalid-focus-color)!important}[dir=rtl] .pico :where(input,select,textarea):not([type=checkbox],[type=radio]):is([aria-invalid],[aria-invalid=true],[aria-invalid=false]){background-position:center left .75rem}.pico input::-webkit-input-placeholder,.pico input::placeholder,.pico select:invalid,.pico textarea::-webkit-input-placeholder,.pico textarea::placeholder{color:var(--pico-form-element-placeholder-color);opacity:1}.pico input:not([type=checkbox],[type=radio]),.pico select,.pico textarea{margin-bottom:var(--pico-spacing)}.pico select::-ms-expand{border:0;background-color:transparent}.pico select:not([multiple],[size]){padding-right:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem);padding-left:var(--pico-form-element-spacing-horizontal);padding-inline-start:var(--pico-form-element-spacing-horizontal);padding-inline-end:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem);background-image:var(--pico-icon-chevron);background-position:center right .75rem;background-size:1rem auto;background-repeat:no-repeat}.pico select[multiple] option:checked{background:var(--pico-form-element-selected-background-color);color:var(--pico-form-element-color)}[dir=rtl] .pico select:not([multiple],[size]){background-position:center left .75rem}.pico textarea{display:block;resize:vertical}.pico textarea[aria-invalid]{--pico-icon-height:calc(1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 + var(--pico-border-width) * 2);background-position:top right .75rem!important;background-size:1rem var(--pico-icon-height)!important}.pico :where(input,select,textarea,fieldset,.grid)+small{display:block;width:100%;margin-top:calc(var(--pico-spacing) * -.75);margin-bottom:var(--pico-spacing);color:var(--pico-muted-color)}.pico :where(input,select,textarea,fieldset,.grid)[aria-invalid=false]+small{color:var(--pico-ins-color)}.pico :where(input,select,textarea,fieldset,.grid)[aria-invalid=true]+small{color:var(--pico-del-color)}.pico label>:where(input,select,textarea){margin-top:calc(var(--pico-spacing) * .25)}.pico label:has([type=checkbox],[type=radio]){width:-moz-fit-content;width:fit-content;cursor:pointer}.pico [type=checkbox],.pico [type=radio]{-webkit-appearance:none;-moz-appearance:none;appearance:none;width:1.25em;height:1.25em;margin-top:-.125em;margin-inline-end:.5em;border-width:var(--pico-border-width);vertical-align:middle;cursor:pointer}.pico [type=checkbox]::-ms-check,.pico [type=radio]::-ms-check{display:none}.pico [type=checkbox]:checked,.pico [type=checkbox]:checked:active,.pico [type=checkbox]:checked:focus,.pico [type=radio]:checked,.pico [type=radio]:checked:active,.pico [type=radio]:checked:focus{--pico-background-color:var(--pico-primary-background);--pico-border-color:var(--pico-primary-border);background-image:var(--pico-icon-checkbox);background-position:center;background-size:.75em auto;background-repeat:no-repeat}.pico [type=checkbox]~label,.pico [type=radio]~label{display:inline-block;margin-bottom:0;cursor:pointer}.pico [type=checkbox]~label:not(:last-of-type),.pico [type=radio]~label:not(:last-of-type){margin-inline-end:1em}.pico [type=checkbox]:indeterminate{--pico-background-color:var(--pico-primary-background);--pico-border-color:var(--pico-primary-border);background-image:var(--pico-icon-minus);background-position:center;background-size:.75em auto;background-repeat:no-repeat}.pico [type=radio]{border-radius:50%}.pico [type=radio]:checked,.pico [type=radio]:checked:active,.pico [type=radio]:checked:focus{--pico-background-color:var(--pico-primary-inverse);border-width:.35em;background-image:none}.pico [type=checkbox][role=switch]{--pico-background-color:var(--pico-switch-background-color);--pico-color:var(--pico-switch-color);width:2.25em;height:1.25em;border:var(--pico-border-width) solid var(--pico-border-color);border-radius:1.25em;background-color:var(--pico-background-color);line-height:1.25em}.pico [type=checkbox][role=switch]:not([aria-invalid]){--pico-border-color:var(--pico-switch-background-color)}.pico [type=checkbox][role=switch]:before{display:block;aspect-ratio:1;height:100%;border-radius:50%;background-color:var(--pico-color);box-shadow:var(--pico-switch-thumb-box-shadow);content:"";transition:margin .1s ease-in-out}.pico [type=checkbox][role=switch]:focus{--pico-background-color:var(--pico-switch-background-color);--pico-border-color:var(--pico-switch-background-color)}.pico [type=checkbox][role=switch]:checked{--pico-background-color:var(--pico-switch-checked-background-color);--pico-border-color:var(--pico-switch-checked-background-color);background-image:none}.pico [type=checkbox][role=switch]:checked:before{margin-inline-start:1em}.pico [type=checkbox][role=switch][disabled]{--pico-background-color:var(--pico-border-color)}.pico [type=checkbox][aria-invalid=false]:checked,.pico [type=checkbox][aria-invalid=false]:checked:active,.pico [type=checkbox][aria-invalid=false]:checked:focus,.pico [type=checkbox][role=switch][aria-invalid=false]:checked,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:active,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:focus{--pico-background-color:var(--pico-form-element-valid-border-color)}.pico [type=checkbox]:checked:active[aria-invalid=true],.pico [type=checkbox]:checked:focus[aria-invalid=true],.pico [type=checkbox]:checked[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:active[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:focus[aria-invalid=true],.pico [type=checkbox][role=switch]:checked[aria-invalid=true]{--pico-background-color:var(--pico-form-element-invalid-border-color)}.pico [type=checkbox][aria-invalid=false]:checked,.pico [type=checkbox][aria-invalid=false]:checked:active,.pico [type=checkbox][aria-invalid=false]:checked:focus,.pico [type=checkbox][role=switch][aria-invalid=false]:checked,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:active,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:focus,.pico [type=radio][aria-invalid=false]:checked,.pico [type=radio][aria-invalid=false]:checked:active,.pico [type=radio][aria-invalid=false]:checked:focus{--pico-border-color:var(--pico-form-element-valid-border-color)}.pico [type=checkbox]:checked:active[aria-invalid=true],.pico [type=checkbox]:checked:focus[aria-invalid=true],.pico [type=checkbox]:checked[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:active[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:focus[aria-invalid=true],.pico [type=checkbox][role=switch]:checked[aria-invalid=true],.pico [type=radio]:checked:active[aria-invalid=true],.pico [type=radio]:checked:focus[aria-invalid=true],.pico [type=radio]:checked[aria-invalid=true]{--pico-border-color:var(--pico-form-element-invalid-border-color)}.pico [type=color]::-webkit-color-swatch-wrapper{padding:0}.pico [type=color]::-moz-focus-inner{padding:0}.pico [type=color]::-webkit-color-swatch{border:0;border-radius:calc(var(--pico-border-radius) * .5)}.pico [type=color]::-moz-color-swatch{border:0;border-radius:calc(var(--pico-border-radius) * .5)}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file]):is([type=date],[type=datetime-local],[type=month],[type=time],[type=week]){--pico-icon-position:.75rem;--pico-icon-width:1rem;padding-right:calc(var(--pico-icon-width) + var(--pico-icon-position));background-image:var(--pico-icon-date);background-position:center right var(--pico-icon-position);background-size:var(--pico-icon-width) auto;background-repeat:no-repeat}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=time]{background-image:var(--pico-icon-time)}.pico [type=date]::-webkit-calendar-picker-indicator,.pico [type=datetime-local]::-webkit-calendar-picker-indicator,.pico [type=month]::-webkit-calendar-picker-indicator,.pico [type=time]::-webkit-calendar-picker-indicator,.pico [type=week]::-webkit-calendar-picker-indicator{width:var(--pico-icon-width);margin-right:calc(var(--pico-icon-width) * -1);margin-left:var(--pico-icon-position);opacity:0}@-moz-document url-prefix(){.pico [type=date],.pico [type=datetime-local],.pico [type=month],.pico [type=time],.pico [type=week]{padding-right:var(--pico-form-element-spacing-horizontal)!important;background-image:none!important}}[dir=rtl] .pico :is([type=date],[type=datetime-local],[type=month],[type=time],[type=week]){text-align:right}.pico [type=file]{--pico-color:var(--pico-muted-color);margin-left:calc(var(--pico-outline-width) * -1);padding:calc(var(--pico-form-element-spacing-vertical) * .5) 0;padding-left:var(--pico-outline-width);border:0;border-radius:0;background:0 0}.pico [type=file]::file-selector-button{margin-right:calc(var(--pico-spacing)/ 2);padding:calc(var(--pico-form-element-spacing-vertical) * .5) var(--pico-form-element-spacing-horizontal)}.pico [type=file]:is(:hover,:active,:focus)::file-selector-button{--pico-background-color:var(--pico-secondary-hover-background);--pico-border-color:var(--pico-secondary-hover-border)}.pico [type=file]:focus::file-selector-button{--pico-box-shadow:var(--pico-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),0 0 0 var(--pico-outline-width) var(--pico-secondary-focus)}.pico [type=range]{-webkit-appearance:none;-moz-appearance:none;appearance:none;width:100%;height:1.25rem;background:0 0}.pico [type=range]::-webkit-slider-runnable-track{width:100%;height:.375rem;border-radius:var(--pico-border-radius);background-color:var(--pico-range-border-color);-webkit-transition:background-color var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),box-shadow var(--pico-transition)}.pico [type=range]::-moz-range-track{width:100%;height:.375rem;border-radius:var(--pico-border-radius);background-color:var(--pico-range-border-color);-moz-transition:background-color var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),box-shadow var(--pico-transition)}.pico [type=range]::-ms-track{width:100%;height:.375rem;border-radius:var(--pico-border-radius);background-color:var(--pico-range-border-color);-ms-transition:background-color var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),box-shadow var(--pico-transition)}.pico [type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:1.25rem;height:1.25rem;margin-top:-.4375rem;border:2px solid var(--pico-range-thumb-border-color);border-radius:50%;background-color:var(--pico-range-thumb-color);cursor:pointer;-webkit-transition:background-color var(--pico-transition),transform var(--pico-transition);transition:background-color var(--pico-transition),transform var(--pico-transition)}.pico [type=range]::-moz-range-thumb{-webkit-appearance:none;width:1.25rem;height:1.25rem;margin-top:-.4375rem;border:2px solid var(--pico-range-thumb-border-color);border-radius:50%;background-color:var(--pico-range-thumb-color);cursor:pointer;-moz-transition:background-color var(--pico-transition),transform var(--pico-transition);transition:background-color var(--pico-transition),transform var(--pico-transition)}.pico [type=range]::-ms-thumb{-webkit-appearance:none;width:1.25rem;height:1.25rem;margin-top:-.4375rem;border:2px solid var(--pico-range-thumb-border-color);border-radius:50%;background-color:var(--pico-range-thumb-color);cursor:pointer;-ms-transition:background-color var(--pico-transition),transform var(--pico-transition);transition:background-color var(--pico-transition),transform var(--pico-transition)}.pico [type=range]:active,.pico [type=range]:focus-within{--pico-range-border-color:var(--pico-range-active-border-color);--pico-range-thumb-color:var(--pico-range-thumb-active-color)}.pico [type=range]:active::-webkit-slider-thumb{transform:scale(1.25)}.pico [type=range]:active::-moz-range-thumb{transform:scale(1.25)}.pico [type=range]:active::-ms-thumb{transform:scale(1.25)}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search]{padding-inline-start:calc(var(--pico-form-element-spacing-horizontal) + 1.75rem);background-image:var(--pico-icon-search);background-position:center left calc(var(--pico-form-element-spacing-horizontal) + .125rem);background-size:1rem auto;background-repeat:no-repeat}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid]{padding-inline-start:calc(var(--pico-form-element-spacing-horizontal) + 1.75rem)!important;background-position:center left 1.125rem,center right .75rem}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid=false]{background-image:var(--pico-icon-search),var(--pico-icon-valid)}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid=true]{background-image:var(--pico-icon-search),var(--pico-icon-invalid)}[dir=rtl] .pico :where(input):not([type=checkbox],[type=radio],[type=range],[type=file])[type=search]{background-position:center right 1.125rem}[dir=rtl] .pico :where(input):not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid]{background-position:center right 1.125rem,center left .75rem}.pico details{display:block;margin-bottom:var(--pico-spacing)}.pico details summary{line-height:1rem;list-style-type:none;cursor:pointer;transition:color var(--pico-transition)}.pico details summary:not([role]){color:var(--pico-accordion-close-summary-color)}.pico details summary::-webkit-details-marker{display:none}.pico details summary::marker{display:none}.pico details summary::-moz-list-bullet{list-style-type:none}.pico details summary:after{display:block;width:1rem;height:1rem;margin-inline-start:calc(var(--pico-spacing,1rem) * .5);float:right;transform:rotate(-90deg);background-image:var(--pico-icon-chevron);background-position:right center;background-size:1rem auto;background-repeat:no-repeat;content:"";transition:transform var(--pico-transition)}.pico details summary:focus{outline:0}.pico details summary:focus:not([role]){color:var(--pico-accordion-active-summary-color)}.pico details summary:focus-visible:not([role]){outline:var(--pico-outline-width) solid var(--pico-primary-focus);outline-offset:calc(var(--pico-spacing,1rem) * .5);color:var(--pico-primary)}.pico details summary[role=button]{width:100%;text-align:left}.pico details summary[role=button]:after{height:calc(1rem * var(--pico-line-height,1.5))}.pico details[open]>summary{margin-bottom:var(--pico-spacing)}.pico details[open]>summary:not([role]):not(:focus){color:var(--pico-accordion-open-summary-color)}.pico details[open]>summary:after{transform:rotate(0)}[dir=rtl] .pico details summary{text-align:right}[dir=rtl] .pico details summary:after{float:left;background-position:left center}.pico article{margin-bottom:var(--pico-block-spacing-vertical);padding:var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);border-radius:var(--pico-border-radius);background:var(--pico-card-background-color);box-shadow:var(--pico-card-box-shadow)}.pico article>footer,.pico article>header{margin-right:calc(var(--pico-block-spacing-horizontal) * -1);margin-left:calc(var(--pico-block-spacing-horizontal) * -1);padding:calc(var(--pico-block-spacing-vertical) * .66) var(--pico-block-spacing-horizontal);background-color:var(--pico-card-sectioning-background-color)}.pico article>header{margin-top:calc(var(--pico-block-spacing-vertical) * -1);margin-bottom:var(--pico-block-spacing-vertical);border-bottom:var(--pico-border-width) solid var(--pico-card-border-color);border-top-right-radius:var(--pico-border-radius);border-top-left-radius:var(--pico-border-radius)}.pico article>footer{margin-top:var(--pico-block-spacing-vertical);margin-bottom:calc(var(--pico-block-spacing-vertical) * -1);border-top:var(--pico-border-width) solid var(--pico-card-border-color);border-bottom-right-radius:var(--pico-border-radius);border-bottom-left-radius:var(--pico-border-radius)}.pico details.dropdown{position:relative;border-bottom:none}.pico details.dropdown>a:after,.pico details.dropdown>button:after,.pico details.dropdown>summary:after{display:block;width:1rem;height:calc(1rem * var(--pico-line-height,1.5));margin-inline-start:.25rem;float:right;transform:rotate(0) translate(.2rem);background-image:var(--pico-icon-chevron);background-position:right center;background-size:1rem auto;background-repeat:no-repeat;content:""}.pico nav details.dropdown{margin-bottom:0}.pico details.dropdown>summary:not([role]){height:calc(1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 + var(--pico-border-width) * 2);padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);border:var(--pico-border-width) solid var(--pico-form-element-border-color);border-radius:var(--pico-border-radius);background-color:var(--pico-form-element-background-color);color:var(--pico-form-element-placeholder-color);line-height:inherit;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none;transition:background-color var(--pico-transition),border-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition)}.pico details.dropdown>summary:not([role]):active,.pico details.dropdown>summary:not([role]):focus{border-color:var(--pico-form-element-active-border-color);background-color:var(--pico-form-element-active-background-color)}.pico details.dropdown>summary:not([role]):focus{box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-focus-color)}.pico details.dropdown>summary:not([role]):focus-visible{outline:0}.pico details.dropdown>summary:not([role])[aria-invalid=false]{--pico-form-element-border-color:var(--pico-form-element-valid-border-color);--pico-form-element-active-border-color:var(--pico-form-element-valid-focus-color);--pico-form-element-focus-color:var(--pico-form-element-valid-focus-color)}.pico details.dropdown>summary:not([role])[aria-invalid=true]{--pico-form-element-border-color:var(--pico-form-element-invalid-border-color);--pico-form-element-active-border-color:var(--pico-form-element-invalid-focus-color);--pico-form-element-focus-color:var(--pico-form-element-invalid-focus-color)}.pico nav details.dropdown{display:inline;margin:calc(var(--pico-nav-element-spacing-vertical) * -1) 0}.pico nav details.dropdown>summary:after{transform:rotate(0) translate(0)}.pico nav details.dropdown>summary:not([role]){height:calc(1rem * var(--pico-line-height) + var(--pico-nav-link-spacing-vertical) * 2);padding:calc(var(--pico-nav-link-spacing-vertical) - var(--pico-border-width) * 2) var(--pico-nav-link-spacing-horizontal)}.pico nav details.dropdown>summary:not([role]):focus-visible{box-shadow:0 0 0 var(--pico-outline-width) var(--pico-primary-focus)}.pico details.dropdown>summary+ul{display:flex;z-index:99;position:absolute;left:0;flex-direction:column;width:100%;min-width:-moz-fit-content;min-width:fit-content;margin:0;margin-top:var(--pico-outline-width);padding:0;border:var(--pico-border-width) solid var(--pico-dropdown-border-color);border-radius:var(--pico-border-radius);background-color:var(--pico-dropdown-background-color);box-shadow:var(--pico-dropdown-box-shadow);color:var(--pico-dropdown-color);white-space:nowrap;opacity:0;transition:opacity var(--pico-transition),transform 0s ease-in-out 1s}.pico details.dropdown>summary+ul[dir=rtl]{right:0;left:auto}.pico details.dropdown>summary+ul li{width:100%;margin-bottom:0;padding:calc(var(--pico-form-element-spacing-vertical) * .5) var(--pico-form-element-spacing-horizontal);list-style:none}.pico details.dropdown>summary+ul li:first-of-type{margin-top:calc(var(--pico-form-element-spacing-vertical) * .5)}.pico details.dropdown>summary+ul li:last-of-type{margin-bottom:calc(var(--pico-form-element-spacing-vertical) * .5)}.pico details.dropdown>summary+ul li a{display:block;margin:calc(var(--pico-form-element-spacing-vertical) * -.5) calc(var(--pico-form-element-spacing-horizontal) * -1);padding:calc(var(--pico-form-element-spacing-vertical) * .5) var(--pico-form-element-spacing-horizontal);overflow:hidden;border-radius:0;color:var(--pico-dropdown-color);text-decoration:none;text-overflow:ellipsis}.pico details.dropdown>summary+ul li a:active,.pico details.dropdown>summary+ul li a:focus,.pico details.dropdown>summary+ul li a:focus-visible,.pico details.dropdown>summary+ul li a:hover,.pico details.dropdown>summary+ul li a[aria-current]:not([aria-current=false]){background-color:var(--pico-dropdown-hover-background-color)}.pico details.dropdown>summary+ul li label{width:100%}.pico details.dropdown>summary+ul li:has(label):hover{background-color:var(--pico-dropdown-hover-background-color)}.pico details.dropdown[open]>summary{margin-bottom:0}.pico details.dropdown[open]>summary+ul{transform:scaleY(1);opacity:1;transition:opacity var(--pico-transition),transform 0s ease-in-out 0s}.pico details.dropdown[open]>summary:before{display:block;z-index:1;position:fixed;width:100vw;height:100vh;inset:0;background:0 0;content:"";cursor:default}.pico label>details.dropdown{margin-top:calc(var(--pico-spacing) * .25)}.pico [role=group],.pico [role=search]{display:inline-flex;position:relative;width:100%;margin-bottom:var(--pico-spacing);border-radius:var(--pico-border-radius);box-shadow:var(--pico-group-box-shadow,0 0 0 transparent);vertical-align:middle;transition:box-shadow var(--pico-transition)}.pico [role=group] input:not([type=checkbox],[type=radio]),.pico [role=group] select,.pico [role=group]>*,.pico [role=search] input:not([type=checkbox],[type=radio]),.pico [role=search] select,.pico [role=search]>*{position:relative;flex:1 1 auto;margin-bottom:0}.pico [role=group] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=group] select:not(:first-child),.pico [role=group]>:not(:first-child),.pico [role=search] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=search] select:not(:first-child),.pico [role=search]>:not(:first-child){margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0}.pico [role=group] input:not([type=checkbox],[type=radio]):not(:last-child),.pico [role=group] select:not(:last-child),.pico [role=group]>:not(:last-child),.pico [role=search] input:not([type=checkbox],[type=radio]):not(:last-child),.pico [role=search] select:not(:last-child),.pico [role=search]>:not(:last-child){border-top-right-radius:0;border-bottom-right-radius:0}.pico [role=group] input:not([type=checkbox],[type=radio]):focus,.pico [role=group] select:focus,.pico [role=group]>:focus,.pico [role=search] input:not([type=checkbox],[type=radio]):focus,.pico [role=search] select:focus,.pico [role=search]>:focus{z-index:2}.pico [role=group] [role=button]:not(:first-child),.pico [role=group] [type=button]:not(:first-child),.pico [role=group] [type=reset]:not(:first-child),.pico [role=group] [type=submit]:not(:first-child),.pico [role=group] button:not(:first-child),.pico [role=group] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=group] select:not(:first-child),.pico [role=search] [role=button]:not(:first-child),.pico [role=search] [type=button]:not(:first-child),.pico [role=search] [type=reset]:not(:first-child),.pico [role=search] [type=submit]:not(:first-child),.pico [role=search] button:not(:first-child),.pico [role=search] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=search] select:not(:first-child){margin-left:calc(var(--pico-border-width) * -1)}.pico [role=group] [role=button],.pico [role=group] [type=button],.pico [role=group] [type=reset],.pico [role=group] [type=submit],.pico [role=group] button,.pico [role=search] [role=button],.pico [role=search] [type=button],.pico [role=search] [type=reset],.pico [role=search] [type=submit],.pico [role=search] button{width:auto}@supports selector(:has(*)){.pico [role=group]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus),.pico [role=search]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus){--pico-group-box-shadow:var(--pico-group-box-shadow-focus-with-button)}.pico [role=group]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) input:not([type=checkbox],[type=radio]),.pico [role=group]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) select,.pico [role=search]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) input:not([type=checkbox],[type=radio]),.pico [role=search]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) select{border-color:transparent}.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus),.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus){--pico-group-box-shadow:var(--pico-group-box-shadow-focus-with-input)}.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) [role=button],.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=button],.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=submit],.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) button,.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) [role=button],.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=button],.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=submit],.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) button{--pico-button-box-shadow:0 0 0 var(--pico-border-width) var(--pico-primary-border);--pico-button-hover-box-shadow:0 0 0 var(--pico-border-width) var(--pico-primary-hover-border)}.pico [role=group] [role=button]:focus,.pico [role=group] [type=button]:focus,.pico [role=group] [type=reset]:focus,.pico [role=group] [type=submit]:focus,.pico [role=group] button:focus,.pico [role=search] [role=button]:focus,.pico [role=search] [type=button]:focus,.pico [role=search] [type=reset]:focus,.pico [role=search] [type=submit]:focus,.pico [role=search] button:focus{box-shadow:none}}.pico [role=search]>:first-child{border-top-left-radius:5rem;border-bottom-left-radius:5rem}.pico [role=search]>:last-child{border-top-right-radius:5rem;border-bottom-right-radius:5rem}.pico [aria-busy=true]:not(input,select,textarea,html,form){white-space:nowrap}.pico [aria-busy=true]:not(input,select,textarea,html,form):before{display:inline-block;width:1em;height:1em;background-image:var(--pico-icon-loading);background-size:1em auto;background-repeat:no-repeat;content:"";vertical-align:-.125em}.pico [aria-busy=true]:not(input,select,textarea,html,form):not(:empty):before{margin-inline-end:calc(var(--pico-spacing) * .5)}.pico [aria-busy=true]:not(input,select,textarea,html,form):empty{text-align:center}.pico [role=button][aria-busy=true],.pico [type=button][aria-busy=true],.pico [type=reset][aria-busy=true],.pico [type=submit][aria-busy=true],.pico a[aria-busy=true],.pico button[aria-busy=true]{pointer-events:none}:host,:root{--pico-scrollbar-width:0px}.pico dialog{display:flex;z-index:999;position:fixed;inset:0;align-items:center;justify-content:center;width:inherit;min-width:100%;height:inherit;min-height:100%;padding:0;border:0;-webkit-backdrop-filter:var(--pico-modal-overlay-backdrop-filter);backdrop-filter:var(--pico-modal-overlay-backdrop-filter);background-color:var(--pico-modal-overlay-background-color);color:var(--pico-color)}.pico dialog>article{width:100%;max-height:calc(100vh - var(--pico-spacing) * 2);margin:var(--pico-spacing);overflow:auto}@media (min-width:576px){.pico dialog>article{max-width:510px}}@media (min-width:768px){.pico dialog>article{max-width:700px}}.pico dialog>article>header>*{margin-bottom:0}.pico dialog>article>header .close,.pico dialog>article>header :is(a,button)[rel=prev]{margin:0;margin-left:var(--pico-spacing);padding:0;float:right}.pico dialog>article>footer{text-align:right}.pico dialog>article>footer [role=button],.pico dialog>article>footer button{margin-bottom:0}.pico dialog>article>footer [role=button]:not(:first-of-type),.pico dialog>article>footer button:not(:first-of-type){margin-left:calc(var(--pico-spacing) * .5)}.pico dialog>article .close,.pico dialog>article :is(a,button)[rel=prev]{display:block;width:1rem;height:1rem;margin-top:calc(var(--pico-spacing) * -1);margin-bottom:var(--pico-spacing);margin-left:auto;border:none;background-image:var(--pico-icon-close);background-position:center;background-size:auto 1rem;background-repeat:no-repeat;background-color:transparent;opacity:.5;transition:opacity var(--pico-transition)}.pico dialog>article .close:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico dialog>article :is(a,button)[rel=prev]:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){opacity:1}.pico dialog:not([open]),.pico dialog[open=false]{display:none}.modal-is-open{padding-right:var(--pico-scrollbar-width,0);overflow:hidden;pointer-events:none;touch-action:none}.modal-is-open dialog{pointer-events:auto;touch-action:auto}:where(.modal-is-opening,.modal-is-closing) dialog,:where(.modal-is-opening,.modal-is-closing) dialog>article{animation-duration:.2s;animation-timing-function:ease-in-out;animation-fill-mode:both}:where(.modal-is-opening,.modal-is-closing) dialog{animation-duration:.8s;animation-name:modal-overlay}:where(.modal-is-opening,.modal-is-closing) dialog>article{animation-delay:.2s;animation-name:modal}.modal-is-closing dialog,.modal-is-closing dialog>article{animation-delay:0s;animation-direction:reverse}@keyframes modal-overlay{0%{-webkit-backdrop-filter:none;backdrop-filter:none;background-color:transparent}}@keyframes modal{0%{transform:translateY(-100%);opacity:0}}:where(nav li):before{float:left;content:"​"}.pico nav,.pico nav ul{display:flex}.pico nav{justify-content:space-between;overflow:visible}.pico nav ol,.pico nav ul{align-items:center;margin-bottom:0;padding:0;list-style:none}.pico nav ol:first-of-type,.pico nav ul:first-of-type{margin-left:calc(var(--pico-nav-element-spacing-horizontal) * -1)}.pico nav ol:last-of-type,.pico nav ul:last-of-type{margin-right:calc(var(--pico-nav-element-spacing-horizontal) * -1)}.pico nav li{display:inline-block;margin:0;padding:var(--pico-nav-element-spacing-vertical) var(--pico-nav-element-spacing-horizontal)}.pico nav li :where(a,[role=link]){display:inline-block;margin:calc(var(--pico-nav-link-spacing-vertical) * -1) calc(var(--pico-nav-link-spacing-horizontal) * -1);padding:var(--pico-nav-link-spacing-vertical) var(--pico-nav-link-spacing-horizontal);border-radius:var(--pico-border-radius)}.pico nav li :where(a,[role=link]):not(:hover){text-decoration:none}.pico nav li [role=button],.pico nav li [type=button],.pico nav li button,.pico nav li input:not([type=checkbox],[type=radio],[type=range],[type=file]),.pico nav li select{height:auto;margin-right:inherit;margin-bottom:0;margin-left:inherit;padding:calc(var(--pico-nav-link-spacing-vertical) - var(--pico-border-width) * 2) var(--pico-nav-link-spacing-horizontal)}.pico nav[aria-label=breadcrumb]{align-items:center;justify-content:start}.pico nav[aria-label=breadcrumb] ul li:not(:first-child){margin-inline-start:var(--pico-nav-link-spacing-horizontal)}.pico nav[aria-label=breadcrumb] ul li a{margin:calc(var(--pico-nav-link-spacing-vertical) * -1) 0;margin-inline-start:calc(var(--pico-nav-link-spacing-horizontal) * -1)}.pico nav[aria-label=breadcrumb] ul li:not(:last-child):after{display:inline-block;position:absolute;width:calc(var(--pico-nav-link-spacing-horizontal) * 4);margin:0 calc(var(--pico-nav-link-spacing-horizontal) * -1);content:var(--pico-nav-breadcrumb-divider);color:var(--pico-muted-color);text-align:center;text-decoration:none;white-space:nowrap}.pico nav[aria-label=breadcrumb] a[aria-current]:not([aria-current=false]){background-color:transparent;color:inherit;text-decoration:none;pointer-events:none}.pico aside li,.pico aside nav,.pico aside ol,.pico aside ul{display:block}.pico aside li{padding:calc(var(--pico-nav-element-spacing-vertical) * .5) var(--pico-nav-element-spacing-horizontal)}.pico aside li a{display:block}.pico aside li [role=button]{margin:inherit}[dir=rtl] .pico nav[aria-label=breadcrumb] ul li:not(:last-child) :after{content:"\\\\"}.pico progress{display:inline-block;vertical-align:baseline}.pico progress{-webkit-appearance:none;-moz-appearance:none;display:inline-block;appearance:none;width:100%;height:.5rem;margin-bottom:calc(var(--pico-spacing) * .5);overflow:hidden;border:0;border-radius:var(--pico-border-radius);background-color:var(--pico-progress-background-color);color:var(--pico-progress-color)}.pico progress::-webkit-progress-bar{border-radius:var(--pico-border-radius);background:0 0}.pico progress[value]::-webkit-progress-value{background-color:var(--pico-progress-color);-webkit-transition:inline-size var(--pico-transition);transition:inline-size var(--pico-transition)}.pico progress::-moz-progress-bar{background-color:var(--pico-progress-color)}@media (prefers-reduced-motion:no-preference){.pico progress:indeterminate{background:var(--pico-progress-background-color) linear-gradient(to right,var(--pico-progress-color) 30%,var(--pico-progress-background-color) 30%) top left/150% 150% no-repeat;animation:progress-indeterminate 1s linear infinite}.pico progress:indeterminate[value]::-webkit-progress-value{background-color:transparent}.pico progress:indeterminate::-moz-progress-bar{background-color:transparent}}@media (prefers-reduced-motion:no-preference){[dir=rtl] .pico progress:indeterminate{animation-direction:reverse}}@keyframes progress-indeterminate{0%{background-position:200% 0}to{background-position:-200% 0}}.pico [data-tooltip]{position:relative}.pico [data-tooltip]:not(a,button,input,[role=button]){border-bottom:1px dotted;text-decoration:none;cursor:help}.pico [data-tooltip]:after,.pico [data-tooltip]:before,.pico [data-tooltip][data-placement=top]:after,.pico [data-tooltip][data-placement=top]:before{display:block;z-index:99;position:absolute;bottom:100%;left:50%;padding:.25rem .5rem;overflow:hidden;transform:translate(-50%,-.25rem);border-radius:var(--pico-border-radius);background:var(--pico-tooltip-background-color);content:attr(data-tooltip);color:var(--pico-tooltip-color);font-style:normal;font-weight:var(--pico-font-weight);font-size:.875rem;text-decoration:none;text-overflow:ellipsis;white-space:nowrap;opacity:0;pointer-events:none}.pico [data-tooltip]:after,.pico [data-tooltip][data-placement=top]:after{padding:0;transform:translate(-50%);border-top:.3rem solid;border-right:.3rem solid transparent;border-left:.3rem solid transparent;border-radius:0;background-color:transparent;content:"";color:var(--pico-tooltip-background-color)}.pico [data-tooltip][data-placement=bottom]:after,.pico [data-tooltip][data-placement=bottom]:before{top:100%;bottom:auto;transform:translate(-50%,.25rem)}.pico [data-tooltip][data-placement=bottom]:after{transform:translate(-50%,-.3rem);border:.3rem solid transparent;border-bottom:.3rem solid}.pico [data-tooltip][data-placement=left]:after,.pico [data-tooltip][data-placement=left]:before{inset:50% 100% auto auto;transform:translate(-.25rem,-50%)}.pico [data-tooltip][data-placement=left]:after{transform:translate(.3rem,-50%);border:.3rem solid transparent;border-left:.3rem solid}.pico [data-tooltip][data-placement=right]:after,.pico [data-tooltip][data-placement=right]:before{inset:50% auto auto 100%;transform:translate(.25rem,-50%)}.pico [data-tooltip][data-placement=right]:after{transform:translate(-.3rem,-50%);border:.3rem solid transparent;border-right:.3rem solid}.pico [data-tooltip]:focus:after,.pico [data-tooltip]:focus:before,.pico [data-tooltip]:hover:after,.pico [data-tooltip]:hover:before{opacity:1}@media (hover:hover) and (pointer:fine){.pico [data-tooltip]:focus:after,.pico [data-tooltip]:focus:before,.pico [data-tooltip]:hover:after,.pico [data-tooltip]:hover:before{--pico-tooltip-slide-to:translate(-50%, -.25rem);transform:translate(-50%,.75rem);animation-duration:.2s;animation-fill-mode:forwards;animation-name:tooltip-slide;opacity:0}.pico [data-tooltip]:focus:after,.pico [data-tooltip]:hover:after{--pico-tooltip-caret-slide-to:translate(-50%, 0rem);transform:translate(-50%,-.25rem);animation-name:tooltip-caret-slide}.pico [data-tooltip][data-placement=bottom]:focus:after,.pico [data-tooltip][data-placement=bottom]:focus:before,.pico [data-tooltip][data-placement=bottom]:hover:after,.pico [data-tooltip][data-placement=bottom]:hover:before{--pico-tooltip-slide-to:translate(-50%, .25rem);transform:translate(-50%,-.75rem);animation-name:tooltip-slide}.pico [data-tooltip][data-placement=bottom]:focus:after,.pico [data-tooltip][data-placement=bottom]:hover:after{--pico-tooltip-caret-slide-to:translate(-50%, -.3rem);transform:translate(-50%,-.5rem);animation-name:tooltip-caret-slide}.pico [data-tooltip][data-placement=left]:focus:after,.pico [data-tooltip][data-placement=left]:focus:before,.pico [data-tooltip][data-placement=left]:hover:after,.pico [data-tooltip][data-placement=left]:hover:before{--pico-tooltip-slide-to:translate(-.25rem, -50%);transform:translate(.75rem,-50%);animation-name:tooltip-slide}.pico [data-tooltip][data-placement=left]:focus:after,.pico [data-tooltip][data-placement=left]:hover:after{--pico-tooltip-caret-slide-to:translate(.3rem, -50%);transform:translate(.05rem,-50%);animation-name:tooltip-caret-slide}.pico [data-tooltip][data-placement=right]:focus:after,.pico [data-tooltip][data-placement=right]:focus:before,.pico [data-tooltip][data-placement=right]:hover:after,.pico [data-tooltip][data-placement=right]:hover:before{--pico-tooltip-slide-to:translate(.25rem, -50%);transform:translate(-.75rem,-50%);animation-name:tooltip-slide}.pico [data-tooltip][data-placement=right]:focus:after,.pico [data-tooltip][data-placement=right]:hover:after{--pico-tooltip-caret-slide-to:translate(-.3rem, -50%);transform:translate(-.05rem,-50%);animation-name:tooltip-caret-slide}}@keyframes tooltip-slide{to{transform:var(--pico-tooltip-slide-to);opacity:1}}@keyframes tooltip-caret-slide{50%{opacity:0}to{transform:var(--pico-tooltip-caret-slide-to);opacity:1}}.pico [aria-controls]{cursor:pointer}.pico [aria-disabled=true],.pico [disabled]{cursor:not-allowed}.pico [aria-hidden=false][hidden]{display:initial}.pico [aria-hidden=false][hidden]:not(:focus){clip:rect(0,0,0,0);position:absolute}.pico [tabindex],.pico a,.pico area,.pico button,.pico input,.pico label,.pico select,.pico summary,.pico textarea{-ms-touch-action:manipulation}.pico [dir=rtl]{direction:rtl}@media (prefers-reduced-motion:reduce){.pico :not([aria-busy=true]),.pico :not([aria-busy=true]):after,.pico :not([aria-busy=true]):before{background-attachment:initial!important;animation-duration:1ms!important;animation-delay:-1ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-delay:0s!important;transition-duration:0s!important}}}@layer joy{:root,:host,[data-theme=light]{--joy-font: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;--joy-radius: 6px;--joy-accent: #5e81ac;--joy-accent-hover: #81a1c1;--joy-ok: #a3be8c;--joy-warn: #ebcb8b;--joy-err: #bf616a;--pico-font-family: var(--joy-font);--pico-border-radius: var(--joy-radius);--pico-primary: var(--joy-accent);--pico-primary-hover: var(--joy-accent-hover);--pico-primary-background: var(--joy-accent);--pico-primary-hover-background: var(--joy-accent-hover);--pico-secondary: #64708a;--pico-secondary-hover: #4c566a;--pico-secondary-background: #e5e9f0;--pico-secondary-hover-background: #d8dee9;--pico-secondary-border: #d8dee9;--pico-secondary-hover-border: #c9d2e0;--pico-secondary-inverse: #3b4252}}@layer joy{:host{display:block;font-size:1rem;--pico-primary-underline: color-mix(in srgb, var(--joy-accent, #5e81ac) 50%, transparent);--pico-primary-focus: color-mix(in srgb, var(--joy-accent, #5e81ac) 37.5%, transparent);--pico-spacing: .8rem;--pico-form-element-spacing-vertical: .5rem;--pico-form-element-spacing-horizontal: .7rem;--pico-typography-spacing-vertical: .8rem;--mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace}.pico{font-size:.9rem;color:var(--pico-color);background:var(--pico-background-color)}.pico input,.pico select,.pico textarea{margin-bottom:0}.panel{box-sizing:border-box;max-width:72rem;margin-inline:auto;padding:1rem}.section{margin-bottom:2rem}.section:last-child{margin-bottom:0}.section-head{display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap;margin:0 0 .75rem;padding:0 0 .5rem;border-bottom:1px solid var(--pico-muted-border-color)}.pico .section-title{margin:0;font-size:1rem;font-weight:600}.section-actions{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.head-note{display:inline-flex;align-items:center;gap:.35rem;color:var(--pico-muted-color);font-size:.8rem}.pico button{display:inline-flex;align-items:center;justify-content:center;width:auto;margin:0;height:1.7rem;padding:0 .85em;border-radius:var(--joy-radius, 6px);font-size:.85rem;line-height:1;white-space:nowrap;cursor:pointer;transition:background-color .15s ease,border-color .15s ease,color .15s ease}.pico .btn-inline{height:1.4rem;padding:0 .6em;font-size:.78rem}.pico input[type=text],.pico input[type=password],.pico select{height:1.7rem;padding:0 .5em;font-size:.85rem}.pico textarea{padding:.4rem .5em;font-size:.85rem}.pico .btn-danger{background:transparent;border-color:var(--joy-err, #bf616a);color:var(--joy-err, #bf616a)}.pico .btn-danger:hover,.pico .btn-danger:focus{background:var(--joy-err, #bf616a);border-color:var(--joy-err, #bf616a);color:#fff}.pico .add-line{align-self:flex-start;height:1.4rem;padding:0 .6em;font-size:.78rem;background:transparent;border:1px dashed var(--pico-muted-border-color);color:var(--joy-accent, #5e81ac)}.pico .add-line:hover{border-color:var(--joy-accent, #5e81ac)}.row{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.spacer{flex:1}.mono{font-family:var(--mono)}.muted{color:var(--pico-muted-color)}.tiny{font-size:.8rem}.hint{color:var(--pico-muted-color);font-weight:400;font-size:.8rem;margin-left:.35rem}.notice{padding:.5rem .75rem;border-radius:var(--joy-radius, 6px);border-left:3px solid var(--pico-muted-border-color);background:var(--pico-code-background-color);font-size:.85rem;line-height:1.5}.notice-ok{border-left-color:var(--joy-ok, #a3be8c)}.notice-warn{border-left-color:var(--joy-warn, #ebcb8b)}.notice-err{border-left-color:var(--joy-err, #bf616a)}.pico .notice code{display:block;margin-top:.25rem;font-size:.8rem;color:var(--pico-muted-color);word-break:break-all;background:none;padding:0}.spinner{width:15px;height:15px;border:2px solid var(--pico-muted-border-color);border-top-color:var(--joy-accent, #5e81ac);border-radius:50%;animation:spin .6s linear infinite;display:inline-block;vertical-align:-2px}@keyframes spin{to{transform:rotate(360deg)}}.badge{display:inline-block;padding:.1rem .45rem;border-radius:var(--joy-radius, 6px);font-size:.8rem;font-weight:500;border:1px solid var(--pico-muted-border-color);color:var(--pico-muted-color);white-space:nowrap}.badge-ok,.badge-warn{border-color:transparent;font-weight:600;color:#1c1c1c}.badge-ok{background:var(--joy-ok, #a3be8c)}.badge-warn{background:var(--joy-warn, #ebcb8b)}.badge.mono{font-family:var(--mono)}.lookup-form{display:flex;gap:.75rem;flex-wrap:wrap;align-items:flex-end}.lf-field{display:flex;flex-direction:column;gap:.25rem;min-width:0}.lf-field>label{font-size:.85rem;color:var(--pico-muted-color)}.lf-domain{flex:1 1 18rem}.lf-type{flex:0 0 7rem}.pico .lookup-form input[type=text],.pico .lookup-form select{font-family:var(--mono)}.table-wrap{overflow-x:auto}.pico table.answers{width:100%;font-size:.9rem;margin:0}.pico table.answers th{padding:.4rem .6rem;font-size:.8rem;font-weight:500;color:var(--pico-muted-color);background:none;border-bottom:1px solid var(--pico-muted-border-color)}.pico table.answers td{padding:.4rem .6rem;font-family:var(--mono);word-break:break-all;vertical-align:top;border-bottom:1px solid var(--pico-muted-border-color)}.pico table.answers tbody tr{transition:background-color .15s ease}.pico table.answers tbody tr:hover{background:var(--pico-secondary-background)}.pico table.answers .num{text-align:right;font-variant-numeric:tabular-nums}.ro-grid{display:flex;flex-wrap:wrap;gap:.4rem 1.5rem;font-size:.85rem}.ro-grid .k{color:var(--pico-muted-color);margin-right:.35rem}.ro-grid .v{font-family:var(--mono)}.master-detail{display:grid;grid-template-columns:minmax(190px,260px) 1fr;gap:1rem;align-items:start}.master{border:1px solid var(--pico-muted-border-color);border-radius:var(--joy-radius, 6px);background:var(--pico-card-background-color);display:flex;flex-direction:column;overflow:hidden}.master-head{padding:.5rem .6rem;font-size:.8rem;color:var(--pico-muted-color);border-bottom:1px solid var(--pico-muted-border-color)}.r-list{padding:.3rem;max-height:26rem;overflow-y:auto}.r-item{display:flex;align-items:center;gap:.4rem;padding:.35rem .4rem;border-radius:var(--joy-radius, 6px);border:1px solid transparent;cursor:pointer;margin-bottom:.15rem;transition:background-color .15s ease,border-color .15s ease}.r-item:hover{background:color-mix(in srgb,var(--joy-accent, #5e81ac) 10%,transparent)}.r-item[aria-selected=true]{border-color:var(--joy-accent, #5e81ac);background:color-mix(in srgb,var(--joy-accent, #5e81ac) 16%,transparent)}.r-item.dragging{opacity:.4}.r-item.dragover{box-shadow:inset 0 2px 0 var(--joy-accent, #5e81ac)}.r-handle{cursor:grab;color:var(--pico-muted-color);user-select:none;flex-shrink:0}.r-idx{font-family:var(--mono);font-size:.8rem;color:var(--pico-muted-color);width:1.1rem;text-align:right;flex-shrink:0}.r-label{flex:1;min-width:0;font-size:.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.r-label.unnamed{font-style:italic;color:var(--pico-muted-color)}.master-foot{display:flex;gap:.4rem;align-items:center;padding:.5rem;border-top:1px solid var(--pico-muted-border-color)}.add-wrap{position:relative}.add-menu{position:absolute;bottom:calc(100% + 4px);left:0;z-index:20;background:var(--pico-background-color);border:1px solid var(--pico-muted-border-color);border-radius:var(--joy-radius, 6px);padding:.2rem;min-width:9.5rem;box-shadow:0 6px 20px #0000002e}.pico .add-menu button{display:block;width:100%;height:auto;text-align:left;background:transparent;border:none;color:var(--pico-color);padding:.3rem .4rem;font-size:.85rem;line-height:1.5;border-radius:4px}.pico .add-menu button:hover{background:var(--pico-secondary-background);color:var(--pico-secondary-inverse)}.detail{border:1px solid var(--pico-muted-border-color);border-radius:var(--joy-radius, 6px);background:var(--pico-card-background-color);padding:1rem;min-width:0}.detail-head{display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem;padding-bottom:.5rem;border-bottom:1px solid var(--pico-muted-border-color)}.detail-name{font-weight:600}.pico .back-btn{display:none}.field{margin-bottom:.75rem}.field>label{display:block;margin-bottom:.25rem;color:var(--pico-muted-color);font-size:.85rem}.pico .field input[type=text],.pico .field textarea,.pico .field select{font-family:var(--mono)}.field-row{display:flex;gap:1rem;flex-wrap:wrap}.field-row>.field{flex:1 1 14rem;min-width:0}.check-line{display:flex;align-items:center;gap:.4rem;font-size:.85rem;cursor:pointer}.pico .check-line input[type=checkbox]{width:1.25em;height:1.25em;margin:0;flex-shrink:0}.row-list{display:flex;flex-direction:column;gap:.3rem}.line-row{display:flex;align-items:center;gap:.3rem}.pico .line-row input{flex:1;min-width:0}.line-row.dragging{opacity:.4}.line-row.dragover{box-shadow:inset 0 2px 0 var(--joy-accent, #5e81ac)}.arrows{display:inline-flex;gap:.2rem}.lr-handle{cursor:grab;color:var(--pico-muted-color);user-select:none;flex-shrink:0;width:.9rem;text-align:center}.kv-row{display:flex;gap:.3rem;align-items:center}.pico .kv-row input.k{flex:0 0 35%;min-width:5rem}.pico .kv-row input.v{flex:1;min-width:0}.qtype-grid{display:flex;flex-wrap:wrap;gap:.3rem}.qtype-chip{display:inline-flex;align-items:center;height:1.4rem;padding:0 .6em;border:1px solid transparent;border-radius:var(--joy-radius, 6px);background:var(--pico-secondary-background);font-family:var(--mono);font-size:.78rem;color:var(--pico-secondary-inverse);cursor:pointer;user-select:none;transition:background-color .15s ease,color .15s ease}.pico .qtype-chip input{display:none}.qtype-chip.on{background:var(--joy-accent, #5e81ac);color:#fff}.upstream-block{padding-top:.5rem;margin-bottom:.5rem;border-top:1px solid var(--pico-muted-border-color)}.upstream-block .ub-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem}.upstream-block .ub-title{font-size:.8rem;color:var(--pico-muted-color)}.pico details.adv{margin-top:.75rem;border-top:1px solid var(--pico-muted-border-color);padding-top:.75rem}.pico details.adv>summary{font-size:.85rem;font-weight:600;color:var(--joy-accent, #5e81ac);cursor:pointer;margin-bottom:.5rem}.pico details.adv>summary+*{margin-top:.5rem}.detail-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem;padding-top:.75rem;border-top:1px solid var(--pico-muted-border-color)}.empty{display:flex;flex-direction:column;align-items:center;gap:.25rem;padding:2rem 1rem;color:var(--pico-muted-color);text-align:center}.pico .empty p{margin:0}.empty-title{font-size:.9rem}.empty-hint{font-size:.85rem}:host(dns-card),:host(dns-card) .pico{background:transparent}.card-stats{display:flex;flex-wrap:wrap;gap:.3em 1.1em;font-size:.8em;margin-bottom:.6em}.card-stats .k{color:var(--pico-muted-color);margin-right:.3em}.card-stats .v{font-family:var(--mono)}.card-answer{font-family:var(--mono);font-size:.8em;word-break:break-all}.lookup-form.compact{--pico-form-element-spacing-vertical: .3em;--pico-form-element-spacing-horizontal: .55em;gap:.35em;align-items:center;margin-bottom:.5em}.pico .lookup-form.compact input[type=text],.pico .lookup-form.compact select,.pico .lookup-form.compact button{font-size:.85em;height:auto;line-height:var(--pico-line-height, 1.5);padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal)}.pico .lookup-form.compact input[type=text]{flex:1 1 7rem}.pico .lookup-form.compact select{flex:0 0 5.5rem}.key-prompt{max-width:26rem}.pico .key-prompt input{font-family:var(--mono)}@media (max-width: 640px){.master-detail{grid-template-columns:1fr}.master-detail[data-view=detail] .master,.master-detail[data-view=list] .detail{display:none}.pico .back-btn{display:inline-flex}}}`, Ao = "dns.apiKey";
class J extends Error {
  constructor(e) {
    super(e === 403 ? "forbidden" : "unauthorized"), this.status = e, this.name = "AuthError";
  }
}
function Ne() {
  try {
    return localStorage.getItem(Ao) || "";
  } catch {
    return "";
  }
}
function Oe(o) {
  try {
    o ? localStorage.setItem(Ao, o) : localStorage.removeItem(Ao);
  } catch {
  }
}
function Be(o) {
  let e = Ne();
  const i = o.replace(/\/+$/, "");
  async function t(n, a) {
    const s = new Headers(a.headers);
    e && s.set("X-Api-Key", e);
    const d = await fetch(i + n, { ...a, headers: s });
    if (d.status === 401 || d.status === 403) throw new J(d.status);
    const m = await d.text();
    let p = null;
    if (m)
      try {
        p = JSON.parse(m);
      } catch {
        p = { error: m.trim() };
      }
    return { status: d.status, data: p };
  }
  return {
    key: () => e,
    setKey(n) {
      e = n, Oe(n);
    },
    get: (n) => t(n, { method: "GET" }),
    postJSON: (n, a) => t(n, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a)
    })
  };
}
var io, P, Co, Mo, to = 0, de = [], I = A, Lo = I.__b, Uo = I.__r, Fo = I.diffed, Ko = I.__c, Vo = I.unmount, Wo = I.__;
function jo(o, e) {
  I.__h && I.__h(P, o, to || e), to = 0;
  var i = P.__H || (P.__H = { __: [], __h: [] });
  return o >= i.__.length && i.__.push({}), i.__[o];
}
function _(o) {
  return to = 1, He(he, o);
}
function He(o, e, i) {
  var t = jo(io++, 2);
  if (t.t = o, !t.__c && (t.__ = [he(void 0, e), function(d) {
    var m = t.__N ? t.__N[0] : t.__[0], p = t.t(m, d);
    m !== p && (t.__N = [p, t.__[1]], t.__c.setState({}));
  }], t.__c = P, !P.__f)) {
    var n = function(d, m, p) {
      if (!t.__c.__H) return !0;
      var f = !1, w = t.__c.props !== d;
      if (t.__c.__H.__.some(function(u) {
        if (u.__N) {
          f = !0;
          var C = u.__[0];
          u.__ = u.__N, u.__N = void 0, C !== u.__[0] && (w = !0);
        }
      }), a) {
        var c = a.call(this, d, m, p);
        return f ? c || w : c;
      }
      return !f || w;
    };
    P.__f = !0;
    var a = P.shouldComponentUpdate, s = P.componentWillUpdate;
    P.componentWillUpdate = function(d, m, p) {
      if (this.__e) {
        var f = a;
        a = void 0, n(d, m, p), a = f;
      }
      s && s.call(this, d, m, p);
    }, P.shouldComponentUpdate = n;
  }
  return t.__N || t.__;
}
function ro(o, e) {
  var i = jo(io++, 3);
  !I.__s && be(i.__H, e) && (i.__ = o, i.u = e, P.__H.__h.push(i));
}
function ue(o) {
  return to = 5, me(function() {
    return { current: o };
  }, []);
}
function me(o, e) {
  var i = jo(io++, 7);
  return be(i.__H, e) && (i.__ = o(), i.__H = e, i.__h = o), i.__;
}
function U(o, e) {
  return to = 8, me(function() {
    return o;
  }, e);
}
function Me() {
  for (var o; o = de.shift(); ) {
    var e = o.__H;
    if (o.__P && e) try {
      e.__h.some(mo), e.__h.some(So), e.__h = [];
    } catch (i) {
      e.__h = [], I.__e(i, o.__v);
    }
  }
}
I.__b = function(o) {
  P = null, Lo && Lo(o);
}, I.__ = function(o, e) {
  o && e.__k && e.__k.__m && (o.__m = e.__k.__m), Wo && Wo(o, e);
}, I.__r = function(o) {
  Uo && Uo(o), io = 0;
  var e = (P = o.__c).__H;
  e && (Co === P ? (e.__h = [], P.__h = [], e.__.some(function(i) {
    i.__N && (i.__ = i.__N), i.u = i.__N = void 0;
  })) : (e.__h.some(mo), e.__h.some(So), e.__h = [], io = 0)), Co = P;
}, I.diffed = function(o) {
  Fo && Fo(o);
  var e = o.__c;
  e && e.__H && (e.__H.__h.length && (de.push(e) !== 1 && Mo === I.requestAnimationFrame || ((Mo = I.requestAnimationFrame) || Le)(Me)), e.__H.__.some(function(i) {
    i.u && (i.__H = i.u, i.u = void 0);
  })), Co = P = null;
}, I.__c = function(o, e) {
  e.some(function(i) {
    try {
      i.__h.some(mo), i.__h = i.__h.filter(function(t) {
        return !t.__ || So(t);
      });
    } catch (t) {
      e.some(function(n) {
        n.__h && (n.__h = []);
      }), e = [], I.__e(t, i.__v);
    }
  }), Ko && Ko(o, e);
}, I.unmount = function(o) {
  Vo && Vo(o);
  var e, i = o.__c;
  i && i.__H && (i.__H.__.some(function(t) {
    try {
      mo(t);
    } catch (n) {
      e = n;
    }
  }), i.__H = void 0, e && I.__e(e, i.__v));
};
var Yo = typeof requestAnimationFrame == "function";
function Le(o) {
  var e, i = function() {
    clearTimeout(t), Yo && cancelAnimationFrame(e), setTimeout(o);
  }, t = setTimeout(i, 35);
  Yo && (e = requestAnimationFrame(i));
}
function mo(o) {
  var e = P, i = o.__c;
  typeof i == "function" && (o.__c = void 0, i()), P = e;
}
function So(o) {
  var e = P;
  o.__c = o.__(), P = e;
}
function be(o, e) {
  return !o || o.length !== e.length || e.some(function(i, t) {
    return i !== o[t];
  });
}
function he(o, e) {
  return typeof e == "function" ? e(o) : e;
}
const Ue = {
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
}, Fe = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "PTR", "SRV", "CAA"];
function Ke(o) {
  return Ue[o] || `TYPE${o}`;
}
function Ve(o, e) {
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
function We(o) {
  return (o && Array.isArray(o.Answer) ? o.Answer : []).map((i) => {
    const t = i.Hdr || {}, n = t.Rrtype || 0;
    return {
      name: t.Name || "",
      type: Ke(n),
      ttl: t.Ttl != null ? String(t.Ttl) : "",
      value: Ve(i, n)
    };
  });
}
function Jo(o) {
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
function ao({ label: o }) {
  return /* @__PURE__ */ r("span", { class: "row", children: [
    /* @__PURE__ */ r("span", { class: "spinner" }),
    " ",
    o ? /* @__PURE__ */ r("span", { class: "muted tiny", children: o }) : null
  ] });
}
function Q({ title: o, detail: e }) {
  return /* @__PURE__ */ r("div", { class: "notice notice-err", children: [
    /* @__PURE__ */ r("strong", { children: o }),
    e ? /* @__PURE__ */ r("code", { children: e }) : null
  ] });
}
function Ye({ text: o }) {
  return /* @__PURE__ */ r("div", { class: "notice notice-ok", children: o });
}
function bo({ title: o, hint: e }) {
  return /* @__PURE__ */ r("div", { class: "empty", children: [
    /* @__PURE__ */ r("p", { class: "empty-title", children: o }),
    e ? /* @__PURE__ */ r("p", { class: "empty-hint", children: e }) : null
  ] });
}
function fe({ api: o, onSubmit: e }) {
  const [i, t] = _(o.key());
  return /* @__PURE__ */ r(
    "form",
    {
      class: "key-prompt",
      onSubmit: (n) => {
        n.preventDefault(), o.setKey(i.trim()), e();
      },
      children: [
        /* @__PURE__ */ r("div", { class: "notice notice-warn", style: "margin-bottom:.75rem", children: [
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
              onInput: (n) => t(n.target.value),
              placeholder: "config.yaml 里的 api_key"
            }
          )
        ] }),
        /* @__PURE__ */ r("button", { type: "submit", children: "保存并重试" })
      ]
    }
  );
}
function ge({ api: o, onAuthRequired: e, compact: i }) {
  const [t, n] = _(""), [a, s] = _("A"), [d, m] = _(!1), [p, f] = _(null), [w, c] = _("");
  async function u(v) {
    v.preventDefault();
    const k = t.trim();
    if (k) {
      m(!0), c(""), f(null);
      try {
        const { status: E, data: D } = await o.get(
          `/query?question=${encodeURIComponent(k)}&type=${encodeURIComponent(a)}`
        );
        if (E !== 200) {
          c(`HTTP ${E}${D && D.error ? " — " + Jo(D.error) : ""}`);
          return;
        }
        f({
          resolver: D?.resolver,
          queryError: D?.error ? Jo(D.error) : void 0,
          rows: We(D?.answer)
        });
      } catch (E) {
        if (E instanceof J) {
          e();
          return;
        }
        c(E instanceof Error ? E.message : String(E));
      } finally {
        m(!1);
      }
    }
  }
  function C() {
    f(null), c("");
  }
  const z = Fe.map((v) => /* @__PURE__ */ r("option", { value: v, children: v }, v));
  return i ? /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("form", { class: "lookup-form compact", onSubmit: u, children: [
      /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          value: t,
          placeholder: "example.com",
          autocomplete: "off",
          spellcheck: !1,
          onInput: (v) => n(v.target.value)
        }
      ),
      /* @__PURE__ */ r("select", { value: a, onChange: (v) => s(v.target.value), children: z }),
      /* @__PURE__ */ r("button", { type: "submit", class: "outline", disabled: d, children: "查询" })
    ] }),
    d ? /* @__PURE__ */ r(ao, { label: "查询中…" }) : null,
    w ? /* @__PURE__ */ r(Q, { title: "请求失败", detail: w }) : null,
    p ? /* @__PURE__ */ r(Xo, { result: p, compact: !0 }) : null
  ] }) : /* @__PURE__ */ r(F, { children: [
    /* @__PURE__ */ r("section", { class: "section section-lookup", children: [
      /* @__PURE__ */ r("div", { class: "section-head", children: /* @__PURE__ */ r("h2", { class: "section-title", children: "查询" }) }),
      /* @__PURE__ */ r("form", { class: "lookup-form", onSubmit: u, children: [
        /* @__PURE__ */ r("div", { class: "lf-field lf-domain", children: [
          /* @__PURE__ */ r("label", { for: "lookup-domain", children: "域名" }),
          /* @__PURE__ */ r(
            "input",
            {
              id: "lookup-domain",
              type: "text",
              value: t,
              placeholder: "example.com",
              autocomplete: "off",
              spellcheck: !1,
              onInput: (v) => n(v.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { class: "lf-field lf-type", children: [
          /* @__PURE__ */ r("label", { for: "lookup-type", children: "类型" }),
          /* @__PURE__ */ r(
            "select",
            {
              id: "lookup-type",
              value: a,
              onChange: (v) => s(v.target.value),
              children: z
            }
          )
        ] }),
        /* @__PURE__ */ r("button", { type: "submit", disabled: d, "aria-busy": d, children: "查询" })
      ] })
    ] }),
    d || !!w || !!p ? /* @__PURE__ */ r("section", { class: "section section-result", children: [
      /* @__PURE__ */ r("div", { class: "section-head", children: [
        /* @__PURE__ */ r("h2", { class: "section-title", children: "结果" }),
        /* @__PURE__ */ r("span", { class: "section-actions", children: [
          p?.resolver ? /* @__PURE__ */ r("span", { class: "head-note", children: [
            "命中 ",
            /* @__PURE__ */ r("span", { class: "badge mono", children: p.resolver })
          ] }) : null,
          /* @__PURE__ */ r("button", { type: "button", class: "secondary", disabled: d, onClick: C, children: "清除" })
        ] })
      ] }),
      d ? /* @__PURE__ */ r(ao, { label: "查询中…" }) : null,
      w ? /* @__PURE__ */ r(Q, { title: "请求失败", detail: w }) : null,
      p ? /* @__PURE__ */ r(Xo, { result: p, compact: !1 }) : null
    ] }) : null
  ] });
}
function Xo({ result: o, compact: e }) {
  return /* @__PURE__ */ r("div", { children: [
    e && o.resolver ? /* @__PURE__ */ r("p", { class: "row tiny", style: "margin-bottom:.5rem", children: [
      /* @__PURE__ */ r("span", { class: "muted", children: "Resolver" }),
      /* @__PURE__ */ r("span", { class: "badge", children: o.resolver })
    ] }) : null,
    o.queryError ? /* @__PURE__ */ r(Q, { title: "解析失败", detail: o.queryError }) : null,
    !o.queryError && o.rows.length === 0 ? e ? /* @__PURE__ */ r("p", { class: "muted tiny", children: "没有记录" }) : /* @__PURE__ */ r(bo, { title: "没有记录", hint: "换个记录类型，或确认该域名确实有此类记录" }) : null,
    !o.queryError && o.rows.length > 0 ? e ? /* @__PURE__ */ r("p", { class: "card-answer", children: o.rows.map((i) => i.value).filter(Boolean).join(", ") }) : /* @__PURE__ */ r("div", { class: "table-wrap", children: /* @__PURE__ */ r("table", { class: "answers", children: [
      /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ r("tr", { children: [
        /* @__PURE__ */ r("th", { children: "名称" }),
        /* @__PURE__ */ r("th", { children: "类型" }),
        /* @__PURE__ */ r("th", { class: "num", children: "TTL" }),
        /* @__PURE__ */ r("th", { children: "值" })
      ] }) }),
      /* @__PURE__ */ r("tbody", { children: o.rows.map((i, t) => /* @__PURE__ */ r("tr", { children: [
        /* @__PURE__ */ r("td", { title: i.name, children: i.name }),
        /* @__PURE__ */ r("td", { children: /* @__PURE__ */ r("span", { class: "badge", children: i.type }) }),
        /* @__PURE__ */ r("td", { class: "num muted", children: i.ttl }),
        /* @__PURE__ */ r("td", { children: i.value })
      ] }, t)) })
    ] }) }) : null
  ] });
}
function Je({ api: o }) {
  const [e, i] = _(null), [t, n] = _(""), [a, s] = _(!0), [d, m] = _(!1), [p, f] = _(0), w = U(() => m(!0), []);
  return ro(() => {
    let c = !1;
    return s(!0), n(""), o.get("/config").then(({ status: u, data: C }) => {
      if (c) return;
      if (u !== 200) {
        n(`HTTP ${u}`);
        return;
      }
      const z = C?.config || {};
      i({
        addr: z.addr || "",
        http: z.http || "",
        ttl: z.ttl || "",
        resolverCount: Array.isArray(z.resolvers) ? z.resolvers.length : 0
      });
    }).catch((u) => {
      if (!c) {
        if (u instanceof J) {
          m(!0);
          return;
        }
        n(u instanceof Error ? u.message : String(u));
      }
    }).finally(() => {
      c || s(!1);
    }), () => {
      c = !0;
    };
  }, [o, p]), d ? /* @__PURE__ */ r(
    fe,
    {
      api: o,
      onSubmit: () => {
        m(!1), f((c) => c + 1);
      }
    }
  ) : /* @__PURE__ */ r("div", { children: [
    a ? /* @__PURE__ */ r(ao, { label: "加载中…" }) : null,
    t ? /* @__PURE__ */ r(Q, { title: "状态不可用", detail: t }) : null,
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
    /* @__PURE__ */ r(ge, { api: o, onAuthRequired: w, compact: !0 }, `card-lookup-${p}`)
  ] });
}
const Xe = ["forward", "forward-group", "preloader", "filter", "mock", "file"], Qe = [
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
], Ge = ["forward", "forward-group", "preloader", "filter", "mock"], Ze = ["forward", "forward-group", "preloader"];
function or(o) {
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
const oo = "__id";
function Qo(o) {
  !o.config || typeof o.config != "object" || (o.config = { ...o.config }, Array.isArray(o.config.serverIP) && (o.config.serverIP = o.config.serverIP.map((e) => (e || "").trim()).filter((e) => e !== ""), o.config.serverIP.length === 0 && delete o.config.serverIP), typeof o.config.timeout == "string" && o.config.timeout.trim() === "" && delete o.config.timeout, Object.keys(o.config).length === 0 && delete o.config);
}
function Go(o) {
  return o.map((e) => {
    const i = {};
    for (const t of Object.keys(e))
      t !== oo && (i[t] = e[t]);
    return Array.isArray(i.rule) && (i.rule = i.rule.map((t) => (t == null ? "" : String(t)).trim()).filter((t) => t !== "")), Qo(i), Array.isArray(i.upstreams) && (i.upstreams = i.upstreams.map((t) => {
      const n = { ...t };
      return Qo(n), n;
    })), i.extraConfig && typeof i.extraConfig == "object" && Object.keys(i.extraConfig).length === 0 && delete i.extraConfig, i;
  });
}
function er(o) {
  return o.name || `(${o.type || "?"})`;
}
let ve = 0;
function rr(o) {
  return !o.extraConfig || typeof o.extraConfig != "object" ? [] : Object.keys(o.extraConfig).map((e) => ({ id: ++ve, k: e, v: o.extraConfig[e] }));
}
function ir(o) {
  const { resolver: e, onChange: i } = o, t = String(e.type || ""), [n, a] = _(-1), [s, d] = _(-1), [m, p] = _(() => rr(e)), f = (l, b) => {
    e[l] = b, i();
  }, w = (l, b) => {
    b === "" || b == null ? delete e[l] : e[l] = b, i();
  }, c = (l) => {
    l.config && Object.keys(l.config).length === 0 && delete l.config;
  }, u = Array.isArray(e.rule) ? e.rule : [], C = () => {
    Array.isArray(e.rule) || (e.rule = []), e.rule.push(""), i();
  }, z = (l, b) => {
    Array.isArray(e.rule) && (e.rule[l] = b), i();
  }, S = (l) => {
    Array.isArray(e.rule) && e.rule.splice(l, 1), i();
  }, v = (l, b) => {
    if (!Array.isArray(e.rule)) return;
    const g = l + b;
    if (g < 0 || g >= e.rule.length) return;
    const R = e.rule[l];
    e.rule[l] = e.rule[g], e.rule[g] = R, i();
  }, k = (l) => {
    if (n >= 0 && Array.isArray(e.rule) && n !== l) {
      const b = e.rule.splice(n, 1)[0];
      e.rule.splice(l, 0, b), i();
    }
    a(-1), d(-1);
  }, E = (l) => Array.isArray(e.queryType) && e.queryType.includes(l), D = (l) => {
    Array.isArray(e.queryType) || (e.queryType = []);
    const b = e.queryType.indexOf(l);
    b >= 0 ? e.queryType.splice(b, 1) : e.queryType.push(l), i();
  }, j = (l, b) => {
    l.config || (l.config = {}), b === "" ? delete l.config.timeout : l.config.timeout = b, c(l), i();
  }, q = (l) => l.config && Array.isArray(l.config.serverIP) ? l.config.serverIP : [], M = (l) => {
    l.config || (l.config = {}), Array.isArray(l.config.serverIP) || (l.config.serverIP = []), l.config.serverIP.push(""), i();
  }, O = (l, b, g) => {
    l.config && Array.isArray(l.config.serverIP) && (l.config.serverIP[b] = g), i();
  }, $ = (l, b) => {
    l.config && Array.isArray(l.config.serverIP) && (l.config.serverIP.splice(b, 1), l.config.serverIP.length === 0 && delete l.config.serverIP, c(l)), i();
  }, T = Array.isArray(e.upstreams) ? e.upstreams : [], N = () => {
    Array.isArray(e.upstreams) || (e.upstreams = []), e.upstreams.push({ url: "" }), i();
  }, G = (l) => {
    Array.isArray(e.upstreams) && e.upstreams.splice(l, 1), i();
  }, K = (l) => {
    p(l);
    const b = {};
    l.forEach((g) => {
      g.k !== "" && (b[g.k] = g.v);
    }), Object.keys(b).length ? e.extraConfig = b : delete e.extraConfig, i();
  }, V = () => K([...m, { id: ++ve, k: "", v: "" }]), ko = (l, b) => K(m.map((g, R) => R === l ? { ...g, k: b } : g)), co = (l, b) => K(m.map((g, R) => R === l ? { ...g, v: b } : g)), W = (l) => K(m.filter((b, g) => g !== l)), Y = (() => {
    const l = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set();
    return m.forEach((g) => {
      g.k !== "" && (l.has(g.k) && b.add(g.k), l.add(g.k));
    }), [...b];
  })(), no = /* @__PURE__ */ r("div", { class: "field-row", children: [
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
          onInput: (l) => w("nftset", l.target.value)
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
          onInput: (l) => w("nftset_ttl", l.target.value)
        }
      )
    ] })
  ] });
  return /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("div", { class: "detail-head", children: [
      /* @__PURE__ */ r("button", { class: "secondary back-btn", onClick: o.onBack, children: "← 返回" }),
      /* @__PURE__ */ r("span", { class: "detail-name", children: e.name || "(unnamed)" }),
      /* @__PURE__ */ r("span", { class: "badge", children: t })
    ] }),
    t !== "file" ? /* @__PURE__ */ r("div", { class: "field", children: [
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
          onInput: (l) => f("name", l.target.value)
        }
      )
    ] }) : null,
    Ze.includes(t) ? /* @__PURE__ */ r(F, { children: [
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
            onInput: (l) => w("ttl", l.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ r("div", { class: "field", children: /* @__PURE__ */ r("label", { class: "check-line", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "checkbox",
            checked: !!e["break-on-fail"],
            onChange: (l) => f("break-on-fail", l.target.checked)
          }
        ),
        "break-on-fail ",
        /* @__PURE__ */ r("span", { class: "hint", children: "失败即中断 resolver 链" })
      ] }) })
    ] }) : null,
    t === "forward" || t === "preloader" ? /* @__PURE__ */ r("div", { class: "field", children: [
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
          onInput: (l) => f("url", l.target.value)
        }
      )
    ] }) : null,
    t === "forward-group" ? /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "upstreams ",
        /* @__PURE__ */ r("span", { class: "hint", children: "并发竞速，最先成功者胜出" })
      ] }),
      T.map((l, b) => /* @__PURE__ */ r("div", { class: "upstream-block", children: [
        /* @__PURE__ */ r("div", { class: "ub-head", children: [
          /* @__PURE__ */ r("span", { class: "ub-title", children: [
            "upstream ",
            b + 1
          ] }),
          /* @__PURE__ */ r("button", { class: "btn-inline secondary", title: "移除 upstream", onClick: () => G(b), children: "✕" })
        ] }),
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: "url" }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              value: l.url || "",
              placeholder: "https://dns.google/dns-query",
              onInput: (g) => {
                l.url = g.target.value, i();
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
              onInput: (g) => j(l, g.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { class: "field", style: "margin-bottom:0", children: [
          /* @__PURE__ */ r("label", { children: [
            "config.serverIP ",
            /* @__PURE__ */ r("span", { class: "hint", children: "bootstrap IP" })
          ] }),
          /* @__PURE__ */ r("div", { class: "row-list", children: [
            q(l).map((g, R) => /* @__PURE__ */ r("div", { class: "line-row", children: [
              /* @__PURE__ */ r(
                "input",
                {
                  type: "text",
                  value: g,
                  placeholder: "8.8.8.8",
                  onInput: (Z) => O(l, R, Z.target.value)
                }
              ),
              /* @__PURE__ */ r("button", { class: "btn-inline secondary", title: "移除", onClick: () => $(l, R), children: "✕" })
            ] }, R)),
            /* @__PURE__ */ r("button", { class: "add-line", onClick: () => M(l), children: "+ serverIP" })
          ] })
        ] })
      ] }, b)),
      /* @__PURE__ */ r("button", { class: "add-line", onClick: N, children: "+ 添加 upstream" })
    ] }) : null,
    Ge.includes(t) ? /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "rule ",
        /* @__PURE__ */ r("span", { class: "hint", children: "一行一条 · 支持 v2fly:cn、include:…、!黑名单、keyword:、regexp:" })
      ] }),
      /* @__PURE__ */ r("div", { class: "row-list", children: [
        u.length === 0 ? /* @__PURE__ */ r("p", { class: "muted tiny", style: "margin:0", children: "没有规则 —— 该 resolver 会接下它作用域内的全部查询。" }) : null,
        u.map((l, b) => /* @__PURE__ */ r(
          "div",
          {
            class: `line-row${n === b ? " dragging" : ""}${s === b ? " dragover" : ""}`,
            onDragOver: (g) => {
              g.preventDefault(), d(b);
            },
            onDragLeave: () => d((g) => g === b ? -1 : g),
            onDrop: (g) => {
              g.preventDefault(), k(b);
            },
            children: [
              /* @__PURE__ */ r(
                "span",
                {
                  class: "lr-handle",
                  title: "拖动排序",
                  draggable: !0,
                  onDragStart: (g) => {
                    a(b), g.dataTransfer && (g.dataTransfer.effectAllowed = "move");
                  },
                  onDragEnd: () => {
                    a(-1), d(-1);
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
                  onInput: (g) => z(b, g.target.value)
                }
              ),
              /* @__PURE__ */ r("span", { class: "arrows", children: [
                /* @__PURE__ */ r("button", { class: "btn-inline secondary", title: "上移", disabled: b === 0, onClick: () => v(b, -1), children: "↑" }),
                /* @__PURE__ */ r(
                  "button",
                  {
                    class: "btn-inline secondary",
                    title: "下移",
                    disabled: b === u.length - 1,
                    onClick: () => v(b, 1),
                    children: "↓"
                  }
                )
              ] }),
              /* @__PURE__ */ r("button", { class: "btn-inline secondary", title: "删除规则", onClick: () => S(b), children: "✕" })
            ]
          },
          b
        )),
        /* @__PURE__ */ r("button", { class: "add-line", onClick: C, children: "+ 添加规则" })
      ] })
    ] }) : null,
    t === "filter" || t === "mock" ? /* @__PURE__ */ r("div", { class: "field", children: [
      /* @__PURE__ */ r("label", { children: [
        "queryType ",
        /* @__PURE__ */ r("span", { class: "hint", children: "匹配这些记录类型（空 = 全部）" })
      ] }),
      /* @__PURE__ */ r("div", { class: "qtype-grid", children: Qe.map((l) => /* @__PURE__ */ r("label", { class: `qtype-chip${E(l) ? " on" : ""}`, children: [
        /* @__PURE__ */ r("input", { type: "checkbox", checked: E(l), onChange: () => D(l) }),
        /* @__PURE__ */ r("span", { children: l })
      ] }, l)) })
    ] }) : null,
    t === "mock" ? /* @__PURE__ */ r("div", { class: "field", children: [
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
          onInput: (l) => f("answer", l.target.value)
        }
      )
    ] }) : null,
    t === "file" ? /* @__PURE__ */ r(F, { children: [
      /* @__PURE__ */ r("div", { class: "field-row", children: [
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: "fileType" }),
          /* @__PURE__ */ r(
            "select",
            {
              value: e.fileType || "host",
              onChange: (l) => f("fileType", l.target.value),
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
              onInput: (l) => w("refreshInterval", l.target.value)
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
            onInput: (l) => f("location", l.target.value)
          }
        ),
        (e.location || "") === "system" ? /* @__PURE__ */ r("div", { class: "notice notice-warn", style: "margin-top:.4rem", children: [
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
              onInput: (l) => w("extraContent", l.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { class: "field", children: [
          /* @__PURE__ */ r("label", { children: [
            "extraConfig ",
            /* @__PURE__ */ r("span", { class: "hint", children: "key → value（如 domain → lan）" })
          ] }),
          /* @__PURE__ */ r("div", { class: "row-list", children: [
            m.map((l, b) => /* @__PURE__ */ r("div", { class: "kv-row", children: [
              /* @__PURE__ */ r(
                "input",
                {
                  class: "k",
                  type: "text",
                  value: l.k,
                  spellcheck: !1,
                  placeholder: "key",
                  onInput: (g) => ko(b, g.target.value)
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
                  onInput: (g) => co(b, g.target.value)
                }
              ),
              /* @__PURE__ */ r("button", { class: "btn-inline secondary", title: "移除", onClick: () => W(b), children: "✕" })
            ] }, l.id)),
            /* @__PURE__ */ r("button", { class: "add-line", onClick: V, children: "+ key/value" })
          ] }),
          m.some((l) => l.k === "") ? /* @__PURE__ */ r("p", { class: "muted tiny", style: "margin:.35rem 0 0", children: "key 为空的行不会被保存。" }) : null,
          Y.length ? /* @__PURE__ */ r("div", { class: "notice notice-warn", style: "margin-top:.4rem", children: [
            /* @__PURE__ */ r("strong", { children: [
              "重复的 key：",
              Y.join("、")
            ] }),
            /* @__PURE__ */ r("code", { children: "同名 key 只会保留最后一行的值，请改名或删掉多余的行。" })
          ] }) : null
        ] })
      ] })
    ] }) : null,
    t === "forward" || t === "preloader" ? /* @__PURE__ */ r("details", { class: "adv", children: [
      /* @__PURE__ */ r("summary", { children: "Advanced · timeout / serverIP / nftset" }),
      /* @__PURE__ */ r("div", { class: "field", children: [
        /* @__PURE__ */ r("label", { children: "config.timeout" }),
        /* @__PURE__ */ r(
          "input",
          {
            type: "text",
            value: e.config && e.config.timeout || "",
            placeholder: "3s",
            onInput: (l) => j(e, l.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ r("div", { class: "field", children: [
        /* @__PURE__ */ r("label", { children: [
          "config.serverIP ",
          /* @__PURE__ */ r("span", { class: "hint", children: "DoH/DoT 的 bootstrap IP" })
        ] }),
        /* @__PURE__ */ r("div", { class: "row-list", children: [
          q(e).map((l, b) => /* @__PURE__ */ r("div", { class: "line-row", children: [
            /* @__PURE__ */ r(
              "input",
              {
                type: "text",
                value: l,
                placeholder: "8.8.8.8",
                onInput: (g) => O(e, b, g.target.value)
              }
            ),
            /* @__PURE__ */ r("button", { class: "btn-inline secondary", title: "移除", onClick: () => $(e, b), children: "✕" })
          ] }, b)),
          /* @__PURE__ */ r("button", { class: "add-line", onClick: () => M(e), children: "+ serverIP" })
        ] })
      ] }),
      no
    ] }) : null,
    t === "forward-group" || t === "file" ? /* @__PURE__ */ r("details", { class: "adv", children: [
      /* @__PURE__ */ r("summary", { children: "Advanced · nftset" }),
      no
    ] }) : null,
    /* @__PURE__ */ r("div", { class: "detail-actions", children: /* @__PURE__ */ r("button", { class: "btn-danger", onClick: o.onDelete, children: "删除该 resolver" }) })
  ] });
}
let Zo = 0;
function tr({
  api: o,
  onAuthRequired: e,
  onDirtyChange: i,
  retryToken: t,
  children: n
}) {
  const [a, s] = _(!1), [d, m] = _(""), [p, f] = _(!1), [w, c] = _({ addr: "", http: "", nftset_table: "", ttl: "" }), [u, C] = _([]), [z, S] = _(""), [v, k] = _(-1), [E, D] = _(!1), [j, q] = _(!1), [M, O] = _(!1), [$, T] = _({ kind: "" }), [N, G] = _(!1), [K, V] = _("list"), [, ko] = _(0), co = U(() => ko((h) => h + 1), []), [W, Y] = _(-1), [no, l] = _(-1), b = ue(null);
  ro(() => {
    i?.(E);
  }, [E, i]);
  const g = U(() => T({ kind: "" }), []), R = U(() => {
    D(!0), O(!1), T((h) => h.kind === "ok" ? { kind: "" } : h), co();
  }, [co]), Z = U((h, y) => {
    const x = h?.config || {};
    S(h?.version || ""), c({
      addr: x.addr || "",
      http: x.http || "",
      nftset_table: x.nftset_table || "",
      ttl: x.ttl || ""
    });
    const B = Array.isArray(x.resolvers) ? x.resolvers : [];
    B.forEach((Ae) => {
      Ae[oo] = ++Zo;
    }), C(B), k(
      y != null && y >= 0 && y < B.length ? y : B.length ? 0 : -1
    ), D(!1), O(!1);
  }, []), wo = U(
    async (h) => {
      s(!0), m(""), g();
      try {
        const { status: y, data: x } = await o.get("/config");
        if (y !== 200) throw new Error(`HTTP ${y}${x?.error ? " — " + x.error : ""}`);
        Z(x, h), f(!0);
      } catch (y) {
        if (y instanceof J) {
          e();
          return;
        }
        m(y instanceof Error ? y.message : String(y));
      } finally {
        s(!1);
      }
    },
    [o, Z, g, e]
  );
  ro(() => {
    !p && !a && !d && wo();
  }, [t]), ro(() => {
    if (!N) return;
    const h = (y) => {
      const x = b.current;
      x && !y.composedPath().includes(x) && G(!1);
    };
    return window.addEventListener("click", h), () => window.removeEventListener("click", h);
  }, [N]);
  const _o = v >= 0 && v < u.length ? u[v] : null, ke = j || !E || $.kind === "conflict";
  function we(h) {
    k(h), V("detail");
  }
  function _e(h) {
    G(!1);
    const y = or(h);
    y[oo] = ++Zo, u.push(y), k(u.length - 1), V("detail"), R();
  }
  function xe() {
    v < 0 || (u.splice(v, 1), u.length === 0 ? k(-1) : v >= u.length && k(u.length - 1), V(u.length ? "detail" : "list"), R());
  }
  function Ro(h, y) {
    if (h < 0) return;
    const x = h + y;
    if (x < 0 || x >= u.length) return;
    const B = u[h];
    u[h] = u[x], u[x] = B, k(x), R();
  }
  function Ce(h) {
    if (W < 0) {
      l(-1);
      return;
    }
    if (W !== h) {
      const y = u.splice(W, 1)[0];
      u.splice(h, 0, y), k(h), R();
    }
    Y(-1), l(-1);
  }
  function $o(h) {
    if (!h) return "";
    if (h.error) {
      if (typeof h.error == "string") return h.error;
      try {
        return JSON.stringify(h.error);
      } catch {
        return String(h.error);
      }
    }
    return "";
  }
  async function Ee() {
    q(!0), g();
    try {
      const { status: h, data: y } = await o.postJSON("/config/validate", {
        resolvers: Go(u)
      });
      h === 200 && y?.valid ? T({ kind: "ok", msg: "校验通过。" }) : T({
        kind: "error",
        msg: "校验失败" + (y?.stage ? `（${y.stage}）` : ""),
        detail: $o(y)
      });
    } catch (h) {
      if (h instanceof J) {
        e();
        return;
      }
      T({
        kind: "error",
        msg: "校验请求失败",
        detail: h instanceof Error ? h.message : String(h)
      });
    } finally {
      q(!1);
    }
  }
  async function ze() {
    q(!0), g();
    try {
      const { status: h, data: y } = await o.postJSON("/config", {
        version: z,
        resolvers: Go(u)
      });
      if (h === 200 && y?.ok) {
        const x = v, B = await o.get("/config");
        B.status === 200 && Z(B.data, x), O(!0), T({ kind: "ok", msg: "已保存，配置已重新加载并热更新生效。" });
      } else h === 409 && y?.stage === "version" ? T({ kind: "conflict" }) : T({
        kind: "error",
        msg: "保存失败" + (y?.stage ? `（${y.stage}）` : ""),
        detail: $o(y)
      });
    } catch (h) {
      if (h instanceof J) {
        e();
        return;
      }
      T({
        kind: "error",
        msg: "保存请求失败",
        detail: h instanceof Error ? h.message : String(h)
      });
    } finally {
      q(!1);
    }
  }
  return (
    // 单页里本组件出两个区块，中间夹着调用方塞进来的查询区块，所以整体是 fragment
    // 而不是一个 div——多一层 div 会把区块之间的 2rem 节奏割断。
    /* @__PURE__ */ r(F, { children: [
      /* @__PURE__ */ r("section", { class: "section", children: [
        /* @__PURE__ */ r("div", { class: "section-head", children: [
          /* @__PURE__ */ r("h2", { class: "section-title", children: "服务概览" }),
          /* @__PURE__ */ r("span", { class: "head-note", children: "顶层字段只读，改请直接编辑配置文件" })
        ] }),
        a ? /* @__PURE__ */ r(ao, { label: "加载配置…" }) : null,
        d ? /* @__PURE__ */ r("div", { children: [
          /* @__PURE__ */ r(Q, { title: "配置加载失败", detail: d }),
          /* @__PURE__ */ r("button", { class: "secondary", style: "margin-top:.75rem", onClick: () => void wo(), children: "重试" })
        ] }) : null,
        !a && !d ? /* @__PURE__ */ r("div", { class: "ro-grid", children: [
          /* @__PURE__ */ r("span", { children: [
            /* @__PURE__ */ r("span", { class: "k", children: "addr" }),
            /* @__PURE__ */ r("span", { class: "v", children: w.addr || "—" })
          ] }),
          /* @__PURE__ */ r("span", { children: [
            /* @__PURE__ */ r("span", { class: "k", children: "http" }),
            /* @__PURE__ */ r("span", { class: "v", children: w.http || "—" })
          ] }),
          /* @__PURE__ */ r("span", { children: [
            /* @__PURE__ */ r("span", { class: "k", children: "nftset_table" }),
            /* @__PURE__ */ r("span", { class: "v", children: w.nftset_table || "(default)" })
          ] }),
          /* @__PURE__ */ r("span", { children: [
            /* @__PURE__ */ r("span", { class: "k", children: "ttl" }),
            /* @__PURE__ */ r("span", { class: "v", children: w.ttl || "—" })
          ] }),
          /* @__PURE__ */ r("span", { children: [
            /* @__PURE__ */ r("span", { class: "k", children: "version" }),
            /* @__PURE__ */ r("span", { class: "v", children: z ? z.slice(0, 8) : "—" })
          ] })
        ] }) : null
      ] }),
      n,
      d ? null : /* @__PURE__ */ r("section", { class: "section section-resolvers", children: [
        /* @__PURE__ */ r("div", { class: "section-head", children: [
          /* @__PURE__ */ r("h2", { class: "section-title", children: "解析器" }),
          /* @__PURE__ */ r("span", { class: "section-actions", children: [
            E && !M ? /* @__PURE__ */ r("span", { class: "badge badge-warn", children: "未保存" }) : null,
            M ? /* @__PURE__ */ r("span", { class: "badge badge-ok", children: "已保存" }) : null,
            /* @__PURE__ */ r("button", { class: "secondary", disabled: j || !p, onClick: () => void Ee(), children: "校验" }),
            /* @__PURE__ */ r("button", { disabled: ke, "aria-busy": j, onClick: () => void ze(), children: j ? "保存中…" : "保存" })
          ] })
        ] }),
        a ? /* @__PURE__ */ r(ao, { label: "加载配置…" }) : null,
        !a && !p ? /* @__PURE__ */ r(bo, { title: "配置还没加载", hint: "填入上方的 API key 后会自动加载" }) : null,
        !a && p ? /* @__PURE__ */ r("div", { class: "master-detail", "data-view": K, children: [
          /* @__PURE__ */ r("div", { class: "master", children: [
            /* @__PURE__ */ r("div", { class: "master-head", children: "顺序即优先级，第一条命中的生效" }),
            /* @__PURE__ */ r("div", { class: "r-list", children: [
              u.length === 0 ? /* @__PURE__ */ r(bo, { title: "还没有 resolver", hint: "用下方「+ 添加」新建一个" }) : null,
              u.map((h, y) => /* @__PURE__ */ r(
                "div",
                {
                  class: `r-item${W === y ? " dragging" : ""}${no === y ? " dragover" : ""}`,
                  "aria-selected": y === v,
                  onClick: () => we(y),
                  draggable: !0,
                  onDragStart: (x) => {
                    Y(y), x.dataTransfer && (x.dataTransfer.effectAllowed = "move");
                  },
                  onDragOver: (x) => {
                    x.preventDefault(), l(y);
                  },
                  onDragLeave: () => l((x) => x === y ? -1 : x),
                  onDrop: (x) => {
                    x.preventDefault(), Ce(y);
                  },
                  onDragEnd: () => {
                    Y(-1), l(-1);
                  },
                  children: [
                    /* @__PURE__ */ r("span", { class: "r-handle", title: "拖动排序", children: "∷" }),
                    /* @__PURE__ */ r("span", { class: "r-idx", children: y + 1 }),
                    /* @__PURE__ */ r("span", { class: `r-label${h.name ? "" : " unnamed"}`, children: er(h) }),
                    /* @__PURE__ */ r("span", { class: "badge", children: h.type || "?" })
                  ]
                },
                h[oo]
              ))
            ] }),
            /* @__PURE__ */ r("div", { class: "master-foot", children: [
              /* @__PURE__ */ r("div", { class: "add-wrap", ref: b, children: [
                /* @__PURE__ */ r("button", { class: "secondary", onClick: () => G((h) => !h), children: "+ 添加 ▾" }),
                N ? /* @__PURE__ */ r("div", { class: "add-menu", children: Xe.map((h) => /* @__PURE__ */ r("button", { onClick: () => _e(h), children: h }, h)) }) : null
              ] }),
              /* @__PURE__ */ r("span", { class: "spacer" }),
              /* @__PURE__ */ r(
                "button",
                {
                  class: "secondary",
                  title: "上移",
                  "aria-label": "上移",
                  disabled: v <= 0,
                  onClick: () => Ro(v, -1),
                  children: "↑"
                }
              ),
              /* @__PURE__ */ r(
                "button",
                {
                  class: "secondary",
                  title: "下移",
                  "aria-label": "下移",
                  disabled: v < 0 || v === u.length - 1,
                  onClick: () => Ro(v, 1),
                  children: "↓"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ r("div", { class: "detail", children: _o ? /* @__PURE__ */ r(
            ir,
            {
              resolver: _o,
              onChange: R,
              onBack: () => V("list"),
              onDelete: xe
            },
            _o[oo]
          ) : /* @__PURE__ */ r(
            bo,
            {
              title: u.length ? "还没有选中 resolver" : "还没有 resolver",
              hint: u.length ? "在左侧列表里点一个来编辑" : "用左侧「+ 添加」新建一个"
            }
          ) })
        ] }) : null,
        /* @__PURE__ */ r("div", { style: "margin-top:1rem", children: [
          $.kind === "ok" ? /* @__PURE__ */ r(Ye, { text: $.msg || "" }) : null,
          $.kind === "error" ? /* @__PURE__ */ r(Q, { title: $.msg || "出错了", detail: $.detail }) : null,
          $.kind === "conflict" ? /* @__PURE__ */ r("div", { class: "notice notice-err", children: [
            /* @__PURE__ */ r("strong", { children: "配置已在别处变更" }),
            /* @__PURE__ */ r("code", { children: "加载之后配置被别处改过了。重新加载会丢弃你本地未保存的改动。" }),
            /* @__PURE__ */ r("div", { style: "margin-top:.6rem", children: /* @__PURE__ */ r(
              "button",
              {
                onClick: () => {
                  g(), wo();
                },
                children: "重新加载（丢弃本地改动）"
              }
            ) })
          ] }) : null
        ] })
      ] })
    ] })
  );
}
function ar({ api: o }) {
  const [e, i] = _(!1), [t, n] = _(0), a = ue(!1), s = U(() => i(!0), []), d = U((m) => {
    a.current = m;
  }, []);
  return ro(() => {
    const m = (p) => {
      a.current && (p.preventDefault(), p.returnValue = "");
    };
    return window.addEventListener("beforeunload", m), () => window.removeEventListener("beforeunload", m);
  }, []), // .panel 是面板的内容列（视觉语言 §5：72rem 居中 + 两侧 1rem），壳内与 standalone 同一份。
  /* @__PURE__ */ r("div", { class: "panel", children: [
    e ? /* @__PURE__ */ r("div", { style: "margin-bottom:1rem", children: /* @__PURE__ */ r(
      fe,
      {
        api: o,
        onSubmit: () => {
          i(!1), n((m) => m + 1);
        }
      }
    ) }) : null,
    /* @__PURE__ */ r(
      tr,
      {
        api: o,
        onAuthRequired: s,
        onDirtyChange: d,
        retryToken: t,
        children: /* @__PURE__ */ r(ge, { api: o, onAuthRequired: s }, `lookup-${t}`)
      }
    )
  ] });
}
function ye(o, e) {
  if (customElements.get(o)) return;
  class i extends HTMLElement {
    constructor() {
      super(...arguments), this.mount = null;
    }
    connectedCallback() {
      this.hasAttribute("data-theme") || this.setAttribute("data-theme", "light");
      const n = this.shadowRoot ?? this.attachShadow({ mode: "open" });
      if (!this.mount) {
        const s = document.createElement("style");
        s.textContent = qe, n.appendChild(s), this.mount = document.createElement("div"), this.mount.className = "pico", n.appendChild(this.mount);
      }
      const a = this.getAttribute("api-base") || "/api";
      Ho(/* @__PURE__ */ r(e, { api: Be(a) }), this.mount);
    }
    disconnectedCallback() {
      this.mount && Ho(null, this.mount);
    }
  }
  customElements.define(o, i);
}
ye("dns-card", Je);
ye("dns-panel", ar);
