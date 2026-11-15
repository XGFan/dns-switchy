// node_modules/preact/dist/preact.mjs
var e, t, n, r, i, a, o, s, c, l, u = Symbol.for("pv"), d = {}, f = [], p = /^m(i|n|o|s|text|space)$/, m = Array.isArray, h = f.slice, g = Object.assign;
function _(e) {
	e && e.parentNode && e.remove();
}
function v(n, r, i, a, o) {
	var s = {
		type: n,
		props: r,
		key: i,
		ref: a,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: u,
		__v: o || ++t,
		__i: -1,
		__u: 0
	};
	return !o && e.vnode && e.vnode(s), s;
}
function y(e) {
	return e.children;
}
function b(e, t) {
	this.props = e, this.context = t, this.__g = 0;
}
function x(e, t) {
	if (t == null) return e.__ && x(e.__, e.__i + 1);
	for (var n; t < e.__k.length; t++) if ((n = e.__k[t]) && n.__e) return n.__e;
	return typeof e.type != "function" || e.props.__P ? null : x(e);
}
function S(t) {
	var n, r = t.__v, i = r.__e, a = [], o = [], s = t.__P;
	s && ((n = g({ constructor: u }, r)).__v = r.__v + 1, e.vnode && e.vnode(n), N(s, n, r, t.__n, s.namespaceURI, 32 & r.__u ? [i] : null, a, i || x(r), 32 & r.__u, o), n.__v = r.__v, n.__.__k[n.__i] = n, I(a, n, o), r.__ = r.__e = null, n.__e != i && C(n));
}
function C(e) {
	if ((e = e.__) && e.__c && !e.props.__P) return e.__e = null, e.__k.some(function(t) {
		return t && (e.__e = t.__e);
	}), C(e);
}
function w(t) {
	(8 & t.__g || (t.__g |= 8, n.push(t), i++)) && r == e.debounceRendering || ((r = e.debounceRendering) || queueMicrotask)(T);
}
function T() {
	try {
		for (var e, t = 1; n.length;) n.length > t && n.sort(a), e = n.shift(), t = n.length, 8 & e.__g && S(e);
	} finally {
		(i = n.length) && (r || queueMicrotask)(T);
	}
}
function E(e, t, n, r, i, a, o, s, c, l, u) {
	var p, m, h, g, _, v, y = r.__k || f, b = t.length;
	for (c = D(n, t, y, c, b), p = 0; p < b; p++) (h = n.__k[p]) != null && (m = ~h.__i && y[h.__i] || d, h.__i = p, v = N(e, h, m, i, a, o, s, c, l, u), g = h.__e, (m.ref != h.ref || 8 & m.__u) && (m.ref && R(m.ref, null, h, m), h.ref && u.push(h.ref, h.__c || g, h)), _ ||= g, 4 & h.__u ? (c = O(h, c, e, !m.__v), m.__e && (m.__e = null)) : typeof h.type == "function" && v !== void 0 ? c = v : g && (c = g.nextSibling), h.__u &= -21);
	return n.__e = _, c;
}
function D(e, t, n, r, i) {
	var a, o, s, c, l, d, f, p, h, g = n.length, _ = g, b = 0, S = 0, C = e.__k = Array(i);
	for (a = 0; a < i; a++) (o = t[a]) != null && typeof o != "boolean" && typeof o != "function" ? (typeof o != "object" || o.constructor === String ? o = C[a] = v(null, o) : m(o) ? o = C[a] = v(y, { children: o }) : o.constructor === u && o.__b ? o = C[a] = v(o.type, o.props, o.key, o.ref, o.__v) : C[a] = o, c = a + b, o.__ = e, o.__b = e.__b + 1, s = null, ~(l = o.__i = k(o, n, c, _)) && (_--, (s = n[l]) && (s.__u |= 2)), s && s.__v ? (o.__u |= 16, l == c - 1 ? b-- : l == c + 1 ? b++ : l != c && (l > c ? b-- : b++, S = 1)) : (~l || (i > g ? b-- : i < g && b++), typeof o.type != "function" && (o.__u |= 4))) : C[a] = null;
	if (S) {
		for (d = [], f = [], a = 0; a < i; a++) if ((o = C[a]) && 16 & o.__u) {
			for (b = 0, p = d.length; b < p;) d[h = b + p >> 1] < o.__i ? b = h + 1 : p = h;
			d[b] = o.__i, f[a] = b + 1;
		}
		for (b = d.length; a--;) f[a] && (f[a] == b ? b-- : C[a].__u |= 4);
	}
	if (_) for (a = 0; a < g; a++) !(s = n[a]) || 2 & s.__u || (s.__e == r && (r = x(s)), z(s, s));
	return r;
}
function O(e, t, n, r) {
	var i, a, o, s;
	if (typeof e.type == "function") {
		if (e.props.__P) return t;
		if (i = e.__k) for (a = 0; a < i.length; a++) i[a] && (i[a].__ = e, t = O(i[a], t, n, !1));
		return t;
	}
	for (t && !t.parentNode && (t = x(e)) && !t.parentNode && (t = null), o = e.__e, s = t; s && s.nodeType == 8;) s = s.nextSibling;
	for (o != s && (!r && n.moveBefore && o.parentNode ? n.moveBefore(o, t) : n.insertBefore(o, t || null)), t = o; (t &&= t.nextSibling) && t.nodeType == 8 && !t.data.startsWith("$s"););
	return t;
}
function k(e, t, n, r) {
	var i, a = e.key, o = e.type, s = t[n], c = s && !(2 & s.__u);
	if (s === null && a == null || c && a == s.key && o == s.type) return n;
	if (r > +!!c) {
		for (i = n - 1; i >= 0; i--) if ((s = t[i]) && !(2 & s.__u) && a == s.key && o == s.type) return i;
		for (i = n + 1; i < t.length; i++) if ((s = t[i]) && !(2 & s.__u) && a == s.key && o == s.type) return i;
	}
	return -1;
}
function A(e, t, n) {
	n ??= "", t[0] == "-" ? e.setProperty(t, n) : e[t] = n;
}
function j(e, t, n, r, i) {
	var a, o;
	if (t == "style") {
		if (typeof n == "string") e.style.cssText = n;
		else {
			if (typeof r == "string" && (e.style.cssText = r = ""), r) for (t in r) n && t in n || A(e.style, t);
			if (n) for (t in n) r && n[t] == r[t] || A(e.style, t, n[t]);
		}
	} else if (t[0] == "o" && t[1] == "n") typeof n != "function" && (n = null), typeof r != "function" && (r = null), (e.__e ||= {})[t] = n, n && r || (o = l[t] || (l[t] = M(t)), (e.__a ||= {})[t] = c, a = t != (t = t.replace(s, "$1")), (t = t.slice(2))[0] < "a" && (t = t.toLowerCase()), n ? e.addEventListener(t, o, a) : e.removeEventListener(t, o, a));
	else {
		if (i == "http://www.w3.org/2000/svg") t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if (t != "width" && t != "height" && t != "href" && t != "list" && t != "form" && t != "tabIndex" && t != "download" && t != "rowSpan" && t != "colSpan" && t != "role" && t != "popover" && t in e) try {
			e[t] = n ?? "";
			return;
		} catch {}
		if (typeof n == "function") return;
		n == null || !1 === n && t[4] != "-" ? e.removeAttribute(t) : e.setAttribute(t, t == "popover" && n == 1 ? "" : n);
	}
}
function M(t) {
	return function(n) {
		var r = this.__e;
		if (r) {
			if (r = r[t], n[o] == null) n[o] = c++;
			else if (n[o] < this.__a[t]) return;
			return r(e.event ? e.event(n) : n);
		}
	};
}
function N(t, n, r, i, a, o, s, c, l, d) {
	var p, h, v, S, C, w, T, D, O, k, A, j, M, N, I, R, V, H, U = n.type;
	if (n.constructor !== u) return null;
	128 & r.__u && (l = 32 & r.__u, p = r.__c.__z) && (n.__u |= l, h = o = [], p.nodeType == 8 ? c = P(p, o) : o.push(p), c = o[0] || c), (p = e.__b) && p(n);
	n: if (typeof U == "function") {
		v = s.length;
		try {
			if (D = n.props, O = (p = U.prototype) && p.render, k = (p = U.contextType) && i[p.__c], A = p ? k ? k.props.value : p.__ : i, (S = r.__c) ? (n.__c = S, 2 & S.__g && (S.__g |= 1)) : (O ? n.__c = S = new U(D, A) : (n.__c = S = new b(D, A), S.constructor = U, S.render = B), k && k.sub(S), S.state || (S.state = {}), S.__n = i, S.__g |= 8, S.__h = [], S.__k = []), O && (S.__s || (S.__s = S.state), U.getDerivedStateFromProps && (S.__s == S.state && (S.__s = g({}, S.__s)), g(S.__s, U.getDerivedStateFromProps(D, S.__s)))), C = S.props, w = S.state, S.__v = n, r.__c) {
				if (D !== C && O && !U.getDerivedStateFromProps && S.componentWillReceiveProps && S.componentWillReceiveProps(D, A), n.__v == r.__v && !(8 & S.__g) || !(4 & S.__g) && S.shouldComponentUpdate && !1 === S.shouldComponentUpdate(D, S.__s, A)) {
					n.__v != r.__v && (S.props = D, S.state = S.__s, S.__g &= -9), n.__e = r.__e, n.__k = r.__k, n.__k.some(function(e) {
						e && (e.__ = n);
					}), f.push.apply(S.__h, S.__k), S.__k = [], S.__h.length && s.push(S), c = x(r);
					break n;
				}
				S.componentWillUpdate && S.componentWillUpdate(D, S.__s, A), O && S.componentDidUpdate && S.__h.push(function() {
					S.componentDidUpdate(C, w, T);
				});
			} else O && !U.getDerivedStateFromProps && S.componentWillMount && S.componentWillMount(), O && S.componentDidMount && S.__h.push(S.componentDidMount);
			S.context = A, S.props = D, S.__P = t, S.__g &= -5, j = e.__r, M = O ? 25 : 0;
			do
				S.__g &= -9, j && j(n), p = S.render(S.props, S.state = S.__s, S.context);
			while (8 & S.__g && ++M < 25);
			O && (f.push.apply(S.__h, S.__k), S.__k = []), S.state = S.__s, S.getChildContext && (i = g({}, i, S.getChildContext())), O && r.__c && S.getSnapshotBeforeUpdate && (T = S.getSnapshotBeforeUpdate(C, w)), N = p && p.type === y && p.key == null ? p.props.children : p, D.__P && (p = c, a = (t = D.__P).namespaceURI, l = o = null, r.props && r.props.__P != t && (r.__k.some(function(e) {
				e && z(e, e);
			}), r.__k = null), c = r.__k ? x(r, 0) : null), c = E(t, m(N) ? N : [N], n, r, i, a, o, s, c, l, d), D.__P && (n.__e = null, c = p), n.__u &= -161, h && h.some(_), S.__h.length && s.push(S), 1 & S.__g && (S.__g &= -4);
		} catch (t) {
			if (s.length = v, n.__v = null, l || o) {
				if (t && t.then) {
					if (n.__u |= 128 | l, o) {
						for (~(V = o.indexOf(c || void 0)) || (V = o.length); (H = o[V - 1]) && H.nodeType == 8;) V--;
						for (; V < o.length; V++) if (H = o[V]) {
							if (o[V] = null, I) {
								if (H == R) break;
							} else {
								if (H.nodeType != 8) break;
								H.data.startsWith("$s") && (R = P(I = H));
							}
						}
					}
					if (!I) {
						for (; c && c.nodeType == 8 && c.nextSibling;) c = c.nextSibling;
						I = c;
					}
					(p = P(I = n.__c.__z || (n.__c.__z = I))) ? (n.__e = I, c = p) : n.__e = c, c &&= c.nextSibling;
				} else o && o.some(_);
			} else n.__e = r.__e;
			n.__k ||= r.__k || [], t && t.then || F(n), e.__e(t, n, r);
		}
	} else c = n.__e = L(r.__e, n, r, i, a, o, s, l, d, t);
	return (p = e.diffed) && p(n), c;
}
function P(e, t) {
	if (e && e.nodeType == 8 && e.data.startsWith("$s")) for (var n = 1; e = e.nextSibling;) {
		if (e.nodeType == 8) {
			if (e.data.startsWith("$s")) n++;
			else if (e.data.startsWith("/$s") && !--n) return e;
		}
		t && t.push(e);
	}
}
function F(e) {
	e && (e.__c && (e.__c.__g |= 4), e.__k && e.__k.some(F));
}
function I(t, n, r) {
	for (var i = 0; i < r.length;) R(r[i++], r[i++], r[i++]);
	e.__c && e.__c(n, t), t.some(function(n) {
		try {
			t = n.__h, n.__h = [], t.some(function(e) {
				e.call(n);
			});
		} catch (t) {
			e.__e(t, n.__v);
		}
	});
}
function L(t, n, r, i, a, o, s, c, l, u) {
	var f, g, v, y, b, S, C, w, T = r.props || d, D = n.props, O = n.type;
	if (O == "svg" ? a = "http://www.w3.org/2000/svg" : O == "math" ? a = "http://www.w3.org/1998/Math/MathML" : a ||= "http://www.w3.org/1999/xhtml", o) {
		for (f = 0; f < o.length; f++) if ((b = o[f]) && (O ? b.localName == O : b.nodeType == 3)) {
			t = b, o[f] = null;
			break;
		}
	}
	if (!t) {
		if (w = u.ownerDocument || document, !O) return w.createTextNode(D);
		t = w.createElementNS(a, O, D.is ? D : u), c &&= (e.__m && e.__m(n, o), !1), o = null;
	}
	if (O) {
		if (u = O == "template" && t.content || t, o = O == "textarea" && D.defaultValue != null ? null : o && h.call(u.childNodes), !c && o) for (T = {}, f = 0; f < t.attributes.length; f++) T[(b = t.attributes[f]).name] = b.value;
		for (f in T) b = T[f], f == "dangerouslySetInnerHTML" ? v = b : f == "children" || f in D || f == "value" && "defaultValue" in D || f == "checked" && "defaultChecked" in D || j(t, f, null, b, a);
		for (f in D) b = D[f], f == "children" ? y = b : f == "dangerouslySetInnerHTML" ? g = b : f == "value" ? S = b : f == "checked" ? C = b : c && typeof b != "function" || T[f] === b || j(t, f, b, T[f], a);
		g ? (c || v && (g.__html == v.__html || g.__html == t.innerHTML) || (t.innerHTML = g.__html), n.__k = []) : (v && (t.textContent = ""), (O == "foreignObject" || a == "http://www.w3.org/1998/Math/MathML" && p.test(O)) && (a = "http://www.w3.org/1999/xhtml"), E(u, m(y) ? y : [y], n, r, i, a, o, s, o ? o[0] : r.__k && x(r, 0), c, l), o && o.some(_)), c && O != "textarea" || (f = "value", O == "progress" && S == null ? t.removeAttribute(f) : S == null || S === t[f] && (O != "progress" || S) || j(t, f, S, T[f], a), f = "checked", C != null && C != t[f] && j(t, f, C, T[f], a));
	} else T === D || c && t.data == D || (t.data = D);
	return t;
}
function R(t, n, r, i) {
	try {
		typeof t == "function" ? n ? n.__x = t(n) || 1 : (i &&= i.__c || i.__e) && (n = i.__x) && (i.__x = null, typeof n == "function" ? n() : t(null)) : t.current = n;
	} catch (t) {
		e.__e(t, r);
	}
}
function z(t, n, r) {
	var i, a, o, s;
	if (e.unmount && e.unmount(t), !(i = t.ref) || i.current && i.current != t.__e || R(i, null, n, t), i = t.__c) {
		if (i.componentWillUnmount) try {
			i.componentWillUnmount();
		} catch (t) {
			e.__e(t, n);
		}
		i.__P = i.__n = null;
	}
	if (i = t.__k) for (s = 0; s < i.length; s++) i[s] && z(i[s], n, typeof t.type != "function" || r && !t.props.__P);
	!r && (i = t.__c) && (i = i.__z) && (a = P(i, o = [])) && (i == t.__e && o.some(_), _(a), _(i)), r || _(t.__e), t.__e = t.__c = t.__ = null;
}
function B(e, t, n) {
	return this.constructor(e, n);
}
function V(t, n) {
	var r, i, a, o;
	e.__ && e.__(t, n), n.nodeType == 9 && (n = n.documentElement), i = (r = t && 32 & t.__u) ? null : n.__k, n.__k = v(y, { children: [t] }), a = [], o = [], N(n, n.__k, i || d, d, n.namespaceURI, i ? null : n.firstChild ? h.call(n.childNodes) : null, a, i ? i.__e : n.firstChild, r, o), I(a, n.__k, o), n.__k.props.children = null;
}
e = { __e: function(e, t, n, r) {
	for (var a, o, s; t = t.__;) if ((a = t.__c) && !(1 & a.__g)) {
		a.__g |= 4;
		try {
			if ((s = (o = a.constructor) && o.getDerivedStateFromError) && a.setState(o.getDerivedStateFromError(e)), a.componentDidCatch && (a.componentDidCatch(e, r || {}), s = 1), s && 8 & a.__g) return void (a.__g |= 2);
		} catch (t) {
			e = t;
		}
	}
	throw i = 0, e;
} }, t = 0, b.prototype.setState = function(e, t) {
	var n = this.__s;
	n && n != this.state || (n = this.__s = g({}, this.state)), typeof e == "function" && (e = e(g({}, n), this.props)), e && (g(n, e), this.__v && (t && this.__k.push(t), w(this)));
}, b.prototype.forceUpdate = function(e) {
	this.__v && (this.__g |= 4, e && this.__h.push(e), w(this));
}, b.prototype.render = y, n = [], i = 0, a = function(e, t) {
	return e.__v.__b - t.__v.__b;
}, o = Symbol(), s = /(PointerCapture)$|Capture$/i, c = 0, l = {};
// src/panel-bundle.css?inline
var H = "@layer pico{:host,:root{--pico-font-family-emoji:\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\";--pico-font-family-sans-serif:system-ui,\"Segoe UI\",Roboto,Oxygen,Ubuntu,Cantarell,Helvetica,Arial,\"Helvetica Neue\",sans-serif,var(--pico-font-family-emoji);--pico-font-family-monospace:ui-monospace,SFMono-Regular,\"SF Mono\",Menlo,Consolas,\"Liberation Mono\",monospace,var(--pico-font-family-emoji);--pico-font-family:var(--pico-font-family-sans-serif);--pico-line-height:1.5;--pico-font-weight:400;--pico-font-size:100%;--pico-text-underline-offset:.1rem;--pico-border-radius:.25rem;--pico-border-width:.0625rem;--pico-outline-width:.125rem;--pico-transition:.2s ease-in-out;--pico-spacing:1rem;--pico-typography-spacing-vertical:1rem;--pico-block-spacing-vertical:var(--pico-spacing);--pico-block-spacing-horizontal:var(--pico-spacing);--pico-grid-column-gap:var(--pico-spacing);--pico-grid-row-gap:var(--pico-spacing);--pico-form-element-spacing-vertical:.75rem;--pico-form-element-spacing-horizontal:1rem;--pico-group-box-shadow:0 0 0 #0000;--pico-group-box-shadow-focus-with-button:0 0 0 var(--pico-outline-width) var(--pico-primary-focus);--pico-group-box-shadow-focus-with-input:0 0 0 .0625rem var(--pico-form-element-border-color);--pico-modal-overlay-backdrop-filter:blur(.375rem);--pico-nav-element-spacing-vertical:1rem;--pico-nav-element-spacing-horizontal:.5rem;--pico-nav-link-spacing-vertical:.5rem;--pico-nav-link-spacing-horizontal:.5rem;--pico-nav-breadcrumb-divider:\">\";--pico-icon-checkbox:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\");--pico-icon-minus:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3C/svg%3E\");--pico-icon-chevron:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\");--pico-icon-date:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E\");--pico-icon-time:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E\");--pico-icon-search:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E\");--pico-icon-close:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E\");--pico-icon-loading:url(\"data:image/svg+xml,%3Csvg fill='none' height='24' width='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' %3E%3Cstyle%3E g %7B animation: rotate 2s linear infinite; transform-origin: center center; %7D circle %7B stroke-dasharray: 75,100; stroke-dashoffset: -5; animation: dash 1.5s ease-in-out infinite; stroke-linecap: round; %7D @keyframes rotate %7B 0%25 %7B transform: rotate(0deg); %7D 100%25 %7B transform: rotate(360deg); %7D %7D @keyframes dash %7B 0%25 %7B stroke-dasharray: 1,100; stroke-dashoffset: 0; %7D 50%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -17.5; %7D 100%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -62; %7D %7D %3C/style%3E%3Cg%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='rgb(136, 145, 164)' stroke-width='4' /%3E%3C/g%3E%3C/svg%3E\")}@media (width>=576px){:host,:root{--pico-font-size:106.25%}}@media (width>=768px){:host,:root{--pico-font-size:112.5%}}@media (width>=1024px){:host,:root{--pico-font-size:118.75%}}@media (width>=1280px){:host,:root{--pico-font-size:125%}}@media (width>=1536px){:host,:root{--pico-font-size:131.25%}}a,a.contrast,a.secondary{--pico-text-decoration:underline}small{--pico-font-size:.875em}h1,h2,h3,h4,h5,h6{--pico-font-weight:700}h1{--pico-font-size:2rem;--pico-line-height:1.125;--pico-typography-spacing-top:3rem}h2{--pico-font-size:1.75rem;--pico-line-height:1.15;--pico-typography-spacing-top:2.625rem}h3{--pico-font-size:1.5rem;--pico-line-height:1.175;--pico-typography-spacing-top:2.25rem}h4{--pico-font-size:1.25rem;--pico-line-height:1.2;--pico-typography-spacing-top:1.874rem}h5{--pico-font-size:1.125rem;--pico-line-height:1.225;--pico-typography-spacing-top:1.6875rem}h6{--pico-font-size:1rem;--pico-line-height:1.25;--pico-typography-spacing-top:1.5rem}tfoot td,tfoot th,thead td,thead th{--pico-font-weight:600;--pico-border-width:.1875rem}code,kbd,pre,samp{--pico-font-family:var(--pico-font-family-monospace)}kbd{--pico-font-weight:bolder}:where(select,textarea),input:not([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-outline-width:.0625rem}[type=search]{--pico-border-radius:5rem}[type=checkbox],[type=radio]{--pico-border-width:.125rem}[type=checkbox][role=switch]{--pico-border-width:.1875rem}details.dropdown summary:not([role=button]){--pico-outline-width:.0625rem}nav details.dropdown summary:focus-visible{--pico-outline-width:.125rem}[role=search]{--pico-border-radius:5rem}[role=group]:has(button.secondary:focus,[type=submit].secondary:focus,[type=button].secondary:focus,[role=button].secondary:focus),[role=search]:has(button.secondary:focus,[type=submit].secondary:focus,[type=button].secondary:focus,[role=button].secondary:focus){--pico-group-box-shadow-focus-with-button:0 0 0 var(--pico-outline-width) var(--pico-secondary-focus)}[role=group]:has(button.contrast:focus,[type=submit].contrast:focus,[type=button].contrast:focus,[role=button].contrast:focus),[role=search]:has(button.contrast:focus,[type=submit].contrast:focus,[type=button].contrast:focus,[role=button].contrast:focus){--pico-group-box-shadow-focus-with-button:0 0 0 var(--pico-outline-width) var(--pico-contrast-focus)}[role=group] [role=button],[role=group] [type=button],[role=group] [type=submit],[role=group] button,[role=search] [role=button],[role=search] [type=button],[role=search] [type=submit],[role=search] button{--pico-form-element-spacing-horizontal:2rem}.pico details summary[role=button]:not(.outline):after,.pico [aria-busy=true]:not(input,select,textarea):is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before{filter:brightness(0)invert()}:host(:not([data-theme=dark])),:root:not([data-theme=dark]),[data-theme=light]{color-scheme:light;--pico-background-color:#fff;--pico-color:#373c44;--pico-text-selection-color:#029ae840;--pico-muted-color:#646b79;--pico-muted-border-color:#e7eaf0;--pico-primary:#0172ad;--pico-primary-background:#0172ad;--pico-primary-border:var(--pico-primary-background);--pico-primary-underline:#0172ad80;--pico-primary-hover:#015887;--pico-primary-hover-background:#02659a;--pico-primary-hover-border:var(--pico-primary-hover-background);--pico-primary-hover-underline:var(--pico-primary-hover);--pico-primary-focus:#029ae880;--pico-primary-inverse:#fff;--pico-secondary:#5d6b89;--pico-secondary-background:#525f7a;--pico-secondary-border:var(--pico-secondary-background);--pico-secondary-underline:#5d6b8980;--pico-secondary-hover:#48536b;--pico-secondary-hover-background:#48536b;--pico-secondary-hover-border:var(--pico-secondary-hover-background);--pico-secondary-hover-underline:var(--pico-secondary-hover);--pico-secondary-focus:#5d6b8940;--pico-secondary-inverse:#fff;--pico-contrast:#181c25;--pico-contrast-background:#181c25;--pico-contrast-border:var(--pico-contrast-background);--pico-contrast-underline:#181c2580;--pico-contrast-hover:#000;--pico-contrast-hover-background:#000;--pico-contrast-hover-border:var(--pico-contrast-hover-background);--pico-contrast-hover-underline:var(--pico-secondary-hover);--pico-contrast-focus:#5d6b8940;--pico-contrast-inverse:#fff;--pico-box-shadow:.0145rem .029rem .174rem #8191b504,.0335rem .067rem .402rem #8191b506,.0625rem .125rem .75rem #8191b508,.1125rem .225rem 1.35rem #8191b509,.2085rem .417rem 2.502rem #8191b50b,.5rem 1rem 6rem #8191b50f,0 0 0 .0625rem #8191b504;--pico-h1-color:#2d3138;--pico-h2-color:#373c44;--pico-h3-color:#424751;--pico-h4-color:#4d535e;--pico-h5-color:#5c6370;--pico-h6-color:#646b79;--pico-mark-background-color:#fde7c0;--pico-mark-color:#0f1114;--pico-ins-color:#1d6a54;--pico-del-color:#883935;--pico-blockquote-border-color:var(--pico-muted-border-color);--pico-blockquote-footer-color:var(--pico-muted-color);--pico-button-box-shadow:0 0 0 #0000;--pico-button-hover-box-shadow:0 0 0 #0000;--pico-table-border-color:var(--pico-muted-border-color);--pico-table-row-stripped-background-color:#6f78870a;--pico-code-background-color:#f3f5f7;--pico-code-color:#646b79;--pico-code-kbd-background-color:var(--pico-color);--pico-code-kbd-color:var(--pico-background-color);--pico-form-element-background-color:#fbfcfc;--pico-form-element-selected-background-color:#dfe3eb;--pico-form-element-border-color:#cfd5e2;--pico-form-element-color:#23262c;--pico-form-element-placeholder-color:var(--pico-muted-color);--pico-form-element-active-background-color:#fff;--pico-form-element-active-border-color:var(--pico-primary-border);--pico-form-element-focus-color:var(--pico-primary-border);--pico-form-element-disabled-opacity:.5;--pico-form-element-invalid-border-color:#b86a6b;--pico-form-element-invalid-active-border-color:#c84f48;--pico-form-element-invalid-focus-color:var(--pico-form-element-invalid-active-border-color);--pico-form-element-valid-border-color:#4c9b8a;--pico-form-element-valid-active-border-color:#279977;--pico-form-element-valid-focus-color:var(--pico-form-element-valid-active-border-color);--pico-switch-background-color:#bfc7d9;--pico-switch-checked-background-color:var(--pico-primary-background);--pico-switch-color:#fff;--pico-switch-thumb-box-shadow:0 0 0 #0000;--pico-range-border-color:#dfe3eb;--pico-range-active-border-color:#bfc7d9;--pico-range-thumb-border-color:var(--pico-background-color);--pico-range-thumb-color:var(--pico-secondary-background);--pico-range-thumb-active-color:var(--pico-primary-background);--pico-accordion-border-color:var(--pico-muted-border-color);--pico-accordion-active-summary-color:var(--pico-primary-hover);--pico-accordion-close-summary-color:var(--pico-color);--pico-accordion-open-summary-color:var(--pico-muted-color);--pico-card-background-color:var(--pico-background-color);--pico-card-border-color:var(--pico-muted-border-color);--pico-card-box-shadow:var(--pico-box-shadow);--pico-card-sectioning-background-color:#fbfcfc;--pico-dropdown-background-color:#fff;--pico-dropdown-border-color:#eff1f4;--pico-dropdown-box-shadow:var(--pico-box-shadow);--pico-dropdown-color:var(--pico-color);--pico-dropdown-hover-background-color:#eff1f4;--pico-loading-spinner-opacity:.5;--pico-modal-overlay-background-color:#e8eaedbf;--pico-progress-background-color:#dfe3eb;--pico-progress-color:var(--pico-primary-background);--pico-tooltip-background-color:var(--pico-contrast-background);--pico-tooltip-color:var(--pico-contrast-inverse);--pico-icon-valid:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(76, 154.5, 137.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\");--pico-icon-invalid:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(200.25, 79.25, 72.25)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E\")}:host(:not([data-theme=dark])) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]),:root:not([data-theme=dark]) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]),[data-theme=light] input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-form-element-focus-color:var(--pico-primary-focus)}@media only screen and (prefers-color-scheme:dark){:host(:not([data-theme])),:root:not([data-theme]){color-scheme:dark;--pico-background-color:#13171f;--pico-color:#c2c7d0;--pico-text-selection-color:#01aaff30;--pico-muted-color:#7b8495;--pico-muted-border-color:#202632;--pico-primary:#01aaff;--pico-primary-background:#0172ad;--pico-primary-border:var(--pico-primary-background);--pico-primary-underline:#01aaff80;--pico-primary-hover:#79c0ff;--pico-primary-hover-background:#017fc0;--pico-primary-hover-border:var(--pico-primary-hover-background);--pico-primary-hover-underline:var(--pico-primary-hover);--pico-primary-focus:#01aaff60;--pico-primary-inverse:#fff;--pico-secondary:#969eaf;--pico-secondary-background:#525f7a;--pico-secondary-border:var(--pico-secondary-background);--pico-secondary-underline:#969eaf80;--pico-secondary-hover:#b3b9c5;--pico-secondary-hover-background:#5d6b89;--pico-secondary-hover-border:var(--pico-secondary-hover-background);--pico-secondary-hover-underline:var(--pico-secondary-hover);--pico-secondary-focus:#909ebe40;--pico-secondary-inverse:#fff;--pico-contrast:#dfe3eb;--pico-contrast-background:#eff1f4;--pico-contrast-border:var(--pico-contrast-background);--pico-contrast-underline:#dfe3eb80;--pico-contrast-hover:#fff;--pico-contrast-hover-background:#fff;--pico-contrast-hover-border:var(--pico-contrast-hover-background);--pico-contrast-hover-underline:var(--pico-contrast-hover);--pico-contrast-focus:#cfd5e240;--pico-contrast-inverse:#000;--pico-box-shadow:.0145rem .029rem .174rem #07090c04,.0335rem .067rem .402rem #07090c06,.0625rem .125rem .75rem #07090c08,.1125rem .225rem 1.35rem #07090c09,.2085rem .417rem 2.502rem #07090c0b,.5rem 1rem 6rem #07090c0f,0 0 0 .0625rem #07090c04;--pico-h1-color:#f0f1f3;--pico-h2-color:#e0e3e7;--pico-h3-color:#c2c7d0;--pico-h4-color:#b3b9c5;--pico-h5-color:#a4acba;--pico-h6-color:#8891a4;--pico-mark-background-color:#014063;--pico-mark-color:#fff;--pico-ins-color:#62af9a;--pico-del-color:#ce7e7b;--pico-blockquote-border-color:var(--pico-muted-border-color);--pico-blockquote-footer-color:var(--pico-muted-color);--pico-button-box-shadow:0 0 0 #0000;--pico-button-hover-box-shadow:0 0 0 #0000;--pico-table-border-color:var(--pico-muted-border-color);--pico-table-row-stripped-background-color:#6f78870a;--pico-code-background-color:#1a1f28;--pico-code-color:#8891a4;--pico-code-kbd-background-color:var(--pico-color);--pico-code-kbd-color:var(--pico-background-color);--pico-form-element-background-color:#1c212c;--pico-form-element-selected-background-color:#2a3140;--pico-form-element-border-color:#2a3140;--pico-form-element-color:#e0e3e7;--pico-form-element-placeholder-color:#8891a4;--pico-form-element-active-background-color:#1a1f28;--pico-form-element-active-border-color:var(--pico-primary-border);--pico-form-element-focus-color:var(--pico-primary-border);--pico-form-element-disabled-opacity:.5;--pico-form-element-invalid-border-color:#964a50;--pico-form-element-invalid-active-border-color:#b7403b;--pico-form-element-invalid-focus-color:var(--pico-form-element-invalid-active-border-color);--pico-form-element-valid-border-color:#2a7b6f;--pico-form-element-valid-active-border-color:#16896a;--pico-form-element-valid-focus-color:var(--pico-form-element-valid-active-border-color);--pico-switch-background-color:#333c4e;--pico-switch-checked-background-color:var(--pico-primary-background);--pico-switch-color:#fff;--pico-switch-thumb-box-shadow:0 0 0 #0000;--pico-range-border-color:#202632;--pico-range-active-border-color:#2a3140;--pico-range-thumb-border-color:var(--pico-background-color);--pico-range-thumb-color:var(--pico-secondary-background);--pico-range-thumb-active-color:var(--pico-primary-background);--pico-accordion-border-color:var(--pico-muted-border-color);--pico-accordion-active-summary-color:var(--pico-primary-hover);--pico-accordion-close-summary-color:var(--pico-color);--pico-accordion-open-summary-color:var(--pico-muted-color);--pico-card-background-color:#181c25;--pico-card-border-color:var(--pico-card-background-color);--pico-card-box-shadow:var(--pico-box-shadow);--pico-card-sectioning-background-color:#1a1f28;--pico-dropdown-background-color:#181c25;--pico-dropdown-border-color:#202632;--pico-dropdown-box-shadow:var(--pico-box-shadow);--pico-dropdown-color:var(--pico-color);--pico-dropdown-hover-background-color:#202632;--pico-loading-spinner-opacity:.5;--pico-modal-overlay-background-color:#08090abf;--pico-progress-background-color:#202632;--pico-progress-color:var(--pico-primary-background);--pico-tooltip-background-color:var(--pico-contrast-background);--pico-tooltip-color:var(--pico-contrast-inverse);--pico-icon-valid:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(42, 123, 111)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\");--pico-icon-invalid:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(149.5, 74, 80)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E\")}:host(:not([data-theme])) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]),:root:not([data-theme]) input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-form-element-focus-color:var(--pico-primary-focus)}:host(:not([data-theme])) .pico details summary[role=button].contrast:not(.outline):after,:root:not([data-theme]) .pico details summary[role=button].contrast:not(.outline):after,:host(:not([data-theme])) .pico [aria-busy=true]:not(input,select,textarea).contrast:is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before,:root:not([data-theme]) .pico [aria-busy=true]:not(input,select,textarea).contrast:is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before{filter:brightness(0)}}[data-theme=dark]{color-scheme:dark;--pico-background-color:#13171f;--pico-color:#c2c7d0;--pico-text-selection-color:#01aaff30;--pico-muted-color:#7b8495;--pico-muted-border-color:#202632;--pico-primary:#01aaff;--pico-primary-background:#0172ad;--pico-primary-border:var(--pico-primary-background);--pico-primary-underline:#01aaff80;--pico-primary-hover:#79c0ff;--pico-primary-hover-background:#017fc0;--pico-primary-hover-border:var(--pico-primary-hover-background);--pico-primary-hover-underline:var(--pico-primary-hover);--pico-primary-focus:#01aaff60;--pico-primary-inverse:#fff;--pico-secondary:#969eaf;--pico-secondary-background:#525f7a;--pico-secondary-border:var(--pico-secondary-background);--pico-secondary-underline:#969eaf80;--pico-secondary-hover:#b3b9c5;--pico-secondary-hover-background:#5d6b89;--pico-secondary-hover-border:var(--pico-secondary-hover-background);--pico-secondary-hover-underline:var(--pico-secondary-hover);--pico-secondary-focus:#909ebe40;--pico-secondary-inverse:#fff;--pico-contrast:#dfe3eb;--pico-contrast-background:#eff1f4;--pico-contrast-border:var(--pico-contrast-background);--pico-contrast-underline:#dfe3eb80;--pico-contrast-hover:#fff;--pico-contrast-hover-background:#fff;--pico-contrast-hover-border:var(--pico-contrast-hover-background);--pico-contrast-hover-underline:var(--pico-contrast-hover);--pico-contrast-focus:#cfd5e240;--pico-contrast-inverse:#000;--pico-box-shadow:.0145rem .029rem .174rem #07090c04,.0335rem .067rem .402rem #07090c06,.0625rem .125rem .75rem #07090c08,.1125rem .225rem 1.35rem #07090c09,.2085rem .417rem 2.502rem #07090c0b,.5rem 1rem 6rem #07090c0f,0 0 0 .0625rem #07090c04;--pico-h1-color:#f0f1f3;--pico-h2-color:#e0e3e7;--pico-h3-color:#c2c7d0;--pico-h4-color:#b3b9c5;--pico-h5-color:#a4acba;--pico-h6-color:#8891a4;--pico-mark-background-color:#014063;--pico-mark-color:#fff;--pico-ins-color:#62af9a;--pico-del-color:#ce7e7b;--pico-blockquote-border-color:var(--pico-muted-border-color);--pico-blockquote-footer-color:var(--pico-muted-color);--pico-button-box-shadow:0 0 0 #0000;--pico-button-hover-box-shadow:0 0 0 #0000;--pico-table-border-color:var(--pico-muted-border-color);--pico-table-row-stripped-background-color:#6f78870a;--pico-code-background-color:#1a1f28;--pico-code-color:#8891a4;--pico-code-kbd-background-color:var(--pico-color);--pico-code-kbd-color:var(--pico-background-color);--pico-form-element-background-color:#1c212c;--pico-form-element-selected-background-color:#2a3140;--pico-form-element-border-color:#2a3140;--pico-form-element-color:#e0e3e7;--pico-form-element-placeholder-color:#8891a4;--pico-form-element-active-background-color:#1a1f28;--pico-form-element-active-border-color:var(--pico-primary-border);--pico-form-element-focus-color:var(--pico-primary-border);--pico-form-element-disabled-opacity:.5;--pico-form-element-invalid-border-color:#964a50;--pico-form-element-invalid-active-border-color:#b7403b;--pico-form-element-invalid-focus-color:var(--pico-form-element-invalid-active-border-color);--pico-form-element-valid-border-color:#2a7b6f;--pico-form-element-valid-active-border-color:#16896a;--pico-form-element-valid-focus-color:var(--pico-form-element-valid-active-border-color);--pico-switch-background-color:#333c4e;--pico-switch-checked-background-color:var(--pico-primary-background);--pico-switch-color:#fff;--pico-switch-thumb-box-shadow:0 0 0 #0000;--pico-range-border-color:#202632;--pico-range-active-border-color:#2a3140;--pico-range-thumb-border-color:var(--pico-background-color);--pico-range-thumb-color:var(--pico-secondary-background);--pico-range-thumb-active-color:var(--pico-primary-background);--pico-accordion-border-color:var(--pico-muted-border-color);--pico-accordion-active-summary-color:var(--pico-primary-hover);--pico-accordion-close-summary-color:var(--pico-color);--pico-accordion-open-summary-color:var(--pico-muted-color);--pico-card-background-color:#181c25;--pico-card-border-color:var(--pico-card-background-color);--pico-card-box-shadow:var(--pico-box-shadow);--pico-card-sectioning-background-color:#1a1f28;--pico-dropdown-background-color:#181c25;--pico-dropdown-border-color:#202632;--pico-dropdown-box-shadow:var(--pico-box-shadow);--pico-dropdown-color:var(--pico-color);--pico-dropdown-hover-background-color:#202632;--pico-loading-spinner-opacity:.5;--pico-modal-overlay-background-color:#08090abf;--pico-progress-background-color:#202632;--pico-progress-color:var(--pico-primary-background);--pico-tooltip-background-color:var(--pico-contrast-background);--pico-tooltip-color:var(--pico-contrast-inverse);--pico-icon-valid:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(42, 123, 111)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\");--pico-icon-invalid:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(149.5, 74, 80)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E\")}[data-theme=dark] input:is([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[type=file]){--pico-form-element-focus-color:var(--pico-primary-focus)}[data-theme=dark] .pico details summary[role=button].contrast:not(.outline):after,[data-theme=dark] .pico [aria-busy=true]:not(input,select,textarea).contrast:is(button,[type=submit],[type=button],[type=reset],[role=button]):not(.outline):before{filter:brightness(0)}.pico [type=checkbox],.pico [type=radio],.pico [type=range],.pico progress{accent-color:var(--pico-primary)}*,:after,:before{box-sizing:border-box;background-repeat:no-repeat}:after,:before{text-decoration:inherit;vertical-align:inherit}:where(:host),:where(:root){-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;text-size-adjust:100%;background-color:var(--pico-background-color);color:var(--pico-color);font-weight:var(--pico-font-weight);font-size:var(--pico-font-size);line-height:var(--pico-line-height);font-family:var(--pico-font-family);text-underline-offset:var(--pico-text-underline-offset);text-rendering:optimizelegibility;overflow-wrap:break-word;-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{width:100%;margin:0}main{display:block}.pico body>footer,.pico body>header,.pico body>main{padding-block:var(--pico-block-spacing-vertical)}.pico section{margin-bottom:var(--pico-block-spacing-vertical)}.container,.container-fluid{width:100%;padding-right:var(--pico-spacing);padding-left:var(--pico-spacing);margin-left:auto;margin-right:auto}@media (width>=576px){.container{max-width:510px;padding-left:0;padding-right:0}}@media (width>=768px){.container{max-width:700px}}@media (width>=1024px){.container{max-width:950px}}@media (width>=1280px){.container{max-width:1200px}}@media (width>=1536px){.container{max-width:1450px}}.grid{grid-column-gap:var(--pico-grid-column-gap);grid-row-gap:var(--pico-grid-row-gap);grid-template-columns:1fr;display:grid}@media (width>=768px){.grid{grid-template-columns:repeat(auto-fit,minmax(0%,1fr))}}.grid>*{min-width:0}.pico .overflow-auto{overflow:auto}.pico b,.pico strong{font-weight:bolder}.pico sub,.pico sup{vertical-align:baseline;font-size:.75em;line-height:0;position:relative}.pico sub{bottom:-.25em}.pico sup{top:-.5em}.pico address,.pico blockquote,.pico dl,.pico ol,.pico p,.pico pre,.pico table,.pico ul{margin-top:0;margin-bottom:var(--pico-typography-spacing-vertical);color:var(--pico-color);font-style:normal;font-weight:var(--pico-font-weight)}.pico h1,.pico h2,.pico h3,.pico h4,.pico h5,.pico h6{margin-top:0;margin-bottom:var(--pico-typography-spacing-vertical);color:var(--pico-color);font-weight:var(--pico-font-weight);font-size:var(--pico-font-size);line-height:var(--pico-line-height);font-family:var(--pico-font-family)}.pico h1{--pico-color:var(--pico-h1-color)}.pico h2{--pico-color:var(--pico-h2-color)}.pico h3{--pico-color:var(--pico-h3-color)}.pico h4{--pico-color:var(--pico-h4-color)}.pico h5{--pico-color:var(--pico-h5-color)}.pico h6{--pico-color:var(--pico-h6-color)}.pico :where(article,address,blockquote,dl,figure,form,ol,p,pre,table,ul)~:is(h1,h2,h3,h4,h5,h6){margin-top:var(--pico-typography-spacing-top)}.pico p,.pico hgroup{margin-bottom:var(--pico-typography-spacing-vertical)}.pico hgroup>*{margin-top:0;margin-bottom:0}.pico hgroup>:not(:first-child):last-child{--pico-color:var(--pico-muted-color);--pico-font-weight:unset;font-size:1rem}.pico :where(ol,ul) li{margin-bottom:calc(var(--pico-typography-spacing-vertical) * .25)}.pico :where(dl,ol,ul) :where(dl,ol,ul){margin:0;margin-top:calc(var(--pico-typography-spacing-vertical) * .25)}.pico ul li{list-style:square}.pico mark{background-color:var(--pico-mark-background-color);color:var(--pico-mark-color);vertical-align:baseline;padding:.125rem .25rem}.pico blockquote{margin:var(--pico-typography-spacing-vertical) 0;padding:var(--pico-spacing);border-right:none;border-left:.25rem solid var(--pico-blockquote-border-color);border-inline-start:.25rem solid var(--pico-blockquote-border-color);border-inline-end:none;display:block}.pico blockquote footer{margin-top:calc(var(--pico-typography-spacing-vertical) * .5);color:var(--pico-blockquote-footer-color)}.pico abbr[title]{cursor:help;border-bottom:1px dotted;text-decoration:none}.pico ins{color:var(--pico-ins-color);text-decoration:none}.pico del{color:var(--pico-del-color)}.pico ::-moz-selection{background-color:var(--pico-text-selection-color)}.pico ::selection{background-color:var(--pico-text-selection-color)}.pico :where(a:not([role=button])),.pico [role=link]{--pico-color:var(--pico-primary);--pico-background-color:transparent;--pico-underline:var(--pico-primary-underline);background-color:var(--pico-background-color);color:var(--pico-color);-webkit-text-decoration:var(--pico-text-decoration);text-decoration:var(--pico-text-decoration);text-decoration-color:var(--pico-underline);text-underline-offset:.125em;transition:background-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition),-webkit-text-decoration var(--pico-transition);transition:background-color var(--pico-transition),color var(--pico-transition),text-decoration var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),color var(--pico-transition),text-decoration var(--pico-transition),box-shadow var(--pico-transition),-webkit-text-decoration var(--pico-transition);outline:0}.pico :where(a:not([role=button])):is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [role=link]:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-primary-hover);--pico-underline:var(--pico-primary-hover-underline);--pico-text-decoration:underline}.pico :where(a:not([role=button])):focus-visible,.pico [role=link]:focus-visible{box-shadow:0 0 0 var(--pico-outline-width) var(--pico-primary-focus)}.pico :where(a:not([role=button])).secondary,.pico [role=link].secondary{--pico-color:var(--pico-secondary);--pico-underline:var(--pico-secondary-underline)}.pico :where(a:not([role=button])).secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [role=link].secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-secondary-hover);--pico-underline:var(--pico-secondary-hover-underline)}.pico :where(a:not([role=button])).contrast,.pico [role=link].contrast{--pico-color:var(--pico-contrast);--pico-underline:var(--pico-contrast-underline)}.pico :where(a:not([role=button])).contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [role=link].contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-contrast-hover);--pico-underline:var(--pico-contrast-hover-underline)}.pico a[role=button]{display:inline-block}.pico button{text-transform:none;margin:0;font-family:inherit;overflow:visible}.pico [type=button],.pico [type=reset],.pico [type=submit],.pico button{-webkit-appearance:button}.pico [role=button],.pico [type=button],.pico [type=file]::file-selector-button,.pico [type=reset],.pico [type=submit],.pico button{--pico-background-color:var(--pico-primary-background);--pico-border-color:var(--pico-primary-border);--pico-color:var(--pico-primary-inverse);--pico-box-shadow:var(--pico-button-box-shadow,0 0 0 #0000);padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);border:var(--pico-border-width) solid var(--pico-border-color);border-radius:var(--pico-border-radius);background-color:var(--pico-background-color);box-shadow:var(--pico-box-shadow);color:var(--pico-color);font-weight:var(--pico-font-weight);font-size:1rem;line-height:var(--pico-line-height);text-align:center;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none;transition:background-color var(--pico-transition),border-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition);outline:0;text-decoration:none}.pico [role=button]:is(:hover,:active,:focus),.pico [role=button][aria-current]:not([aria-current=false]),.pico [type=button]:is(:hover,:active,:focus),.pico [type=button][aria-current]:not([aria-current=false]),.pico [type=file]::file-selector-button:is(:hover,:active,:focus),.pico [type=file]::file-selector-button:is(),.pico [type=reset]:is(:hover,:active,:focus),.pico [type=reset][aria-current]:not([aria-current=false]),.pico [type=submit]:is(:hover,:active,:focus),.pico [type=submit][aria-current]:not([aria-current=false]),.pico button:is(:hover,:active,:focus),.pico button[aria-current]:not([aria-current=false]){--pico-background-color:var(--pico-primary-hover-background);--pico-border-color:var(--pico-primary-hover-border);--pico-box-shadow:var(--pico-button-hover-box-shadow,0 0 0 #0000);--pico-color:var(--pico-primary-inverse)}.pico [role=button]:focus,.pico [role=button][aria-current]:not([aria-current=false]):focus,.pico [type=button]:focus,.pico [type=button][aria-current]:not([aria-current=false]):focus,.pico [type=file]::file-selector-button:focus,.pico [type=file]::file-selector-button:is():focus,.pico [type=reset]:focus,.pico [type=reset][aria-current]:not([aria-current=false]):focus,.pico [type=submit]:focus,.pico [type=submit][aria-current]:not([aria-current=false]):focus,.pico button:focus,.pico button[aria-current]:not([aria-current=false]):focus{--pico-box-shadow:var(--pico-button-hover-box-shadow,0 0 0 #0000),0 0 0 var(--pico-outline-width) var(--pico-primary-focus)}.pico [type=button],.pico [type=reset],.pico [type=submit]{margin-bottom:var(--pico-spacing)}.pico :is(button,[type=submit],[type=button],[role=button]).secondary,.pico [type=file]::file-selector-button,.pico [type=reset]{--pico-background-color:var(--pico-secondary-background);--pico-border-color:var(--pico-secondary-border);--pico-color:var(--pico-secondary-inverse);cursor:pointer}.pico :is(button,[type=submit],[type=button],[role=button]).secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico [type=file]::file-selector-button:is(:hover,:active,:focus),.pico [type=reset]:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-background-color:var(--pico-secondary-hover-background);--pico-border-color:var(--pico-secondary-hover-border);--pico-color:var(--pico-secondary-inverse)}.pico :is(button,[type=submit],[type=button],[role=button]).secondary:focus,.pico :is(button,[type=submit],[type=button],[role=button]).secondary[aria-current]:not([aria-current=false]):focus,.pico [type=file]::file-selector-button:focus,.pico [type=file]::file-selector-button:is():focus,.pico [type=reset]:focus,.pico [type=reset][aria-current]:not([aria-current=false]):focus{--pico-box-shadow:var(--pico-button-hover-box-shadow,0 0 0 #0000),0 0 0 var(--pico-outline-width) var(--pico-secondary-focus)}.pico :is(button,[type=submit],[type=button],[role=button]).contrast{--pico-background-color:var(--pico-contrast-background);--pico-border-color:var(--pico-contrast-border);--pico-color:var(--pico-contrast-inverse)}.pico :is(button,[type=submit],[type=button],[role=button]).contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-background-color:var(--pico-contrast-hover-background);--pico-border-color:var(--pico-contrast-hover-border);--pico-color:var(--pico-contrast-inverse)}.pico :is(button,[type=submit],[type=button],[role=button]).contrast:focus,.pico :is(button,[type=submit],[type=button],[role=button]).contrast[aria-current]:not([aria-current=false]):focus{--pico-box-shadow:var(--pico-button-hover-box-shadow,0 0 0 #0000),0 0 0 var(--pico-outline-width) var(--pico-contrast-focus)}.pico :is(button,[type=submit],[type=button],[role=button]).outline,[type=reset].outline{--pico-background-color:transparent;--pico-color:var(--pico-primary);--pico-border-color:var(--pico-primary)}.pico :is(button,[type=submit],[type=button],[role=button]).outline:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),[type=reset].outline:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-background-color:transparent;--pico-color:var(--pico-primary-hover);--pico-border-color:var(--pico-primary-hover)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.secondary,[type=reset].outline{--pico-color:var(--pico-secondary);--pico-border-color:var(--pico-secondary)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.secondary:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),[type=reset].outline:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-secondary-hover);--pico-border-color:var(--pico-secondary-hover)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.contrast{--pico-color:var(--pico-contrast);--pico-border-color:var(--pico-contrast)}.pico :is(button,[type=submit],[type=button],[role=button]).outline.contrast:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){--pico-color:var(--pico-contrast-hover);--pico-border-color:var(--pico-contrast-hover)}.pico :where(button,[type=submit],[type=reset],[type=button],[role=button])[disabled],.pico :where(fieldset[disabled]) :is(button,[type=submit],[type=button],[type=reset],[role=button]){opacity:.5;pointer-events:none}.pico :where(table){border-collapse:collapse;border-spacing:0;text-indent:0;width:100%}.pico td,.pico th{padding:calc(var(--pico-spacing)/ 2) var(--pico-spacing);border-bottom:var(--pico-border-width) solid var(--pico-table-border-color);background-color:var(--pico-background-color);color:var(--pico-color);font-weight:var(--pico-font-weight);text-align:left;text-align:start}.pico tfoot td,.pico tfoot th{border-top:var(--pico-border-width) solid var(--pico-table-border-color);border-bottom:0}.pico table.striped tbody tr:nth-child(odd) td,.pico table.striped tbody tr:nth-child(odd) th{background-color:var(--pico-table-row-stripped-background-color)}.pico :where(audio,canvas,iframe,img,svg,video){vertical-align:middle}.pico audio,.pico video{display:inline-block}.pico audio:not([controls]){height:0;display:none}.pico :where(iframe){border-style:none}.pico img{border-style:none;max-width:100%;height:auto}.pico :where(svg:not([fill])){fill:currentColor}.pico svg:not(:host),.pico svg:not(:root){overflow:hidden}.pico code,.pico kbd,.pico pre,.pico samp{font-size:.875em;font-family:var(--pico-font-family)}.pico pre code,.pico pre samp{font-size:inherit;font-family:inherit}.pico pre{-ms-overflow-style:scrollbar;overflow:auto}.pico code,.pico kbd,.pico pre,.pico samp{border-radius:var(--pico-border-radius);background:var(--pico-code-background-color);color:var(--pico-code-color);font-weight:var(--pico-font-weight);line-height:initial}.pico code,.pico kbd,.pico samp{padding:.375rem;display:inline-block}.pico pre{margin-bottom:var(--pico-spacing);display:block;overflow-x:auto}.pico pre>code,.pico pre>samp{padding:var(--pico-spacing);line-height:var(--pico-line-height);background:0 0;display:block}.pico kbd{background-color:var(--pico-code-kbd-background-color);color:var(--pico-code-kbd-color);vertical-align:baseline}.pico figure{margin:0;padding:0;display:block}.pico figure figcaption{padding:calc(var(--pico-spacing) * .5) 0;color:var(--pico-muted-color)}.pico hr{height:0;margin:var(--pico-typography-spacing-vertical) 0;border:0;border-top:1px solid var(--pico-muted-border-color);color:inherit}.pico [hidden],.pico template{display:none!important}.pico canvas{display:inline-block}.pico input,.pico optgroup,.pico select,.pico textarea{font-size:1rem;line-height:var(--pico-line-height);letter-spacing:inherit;margin:0;font-family:inherit}.pico input{overflow:visible}.pico select{text-transform:none}.pico legend{max-width:100%;color:inherit;white-space:normal;padding:0}.pico textarea{overflow:auto}.pico [type=checkbox],.pico [type=radio]{padding:0}.pico ::-webkit-inner-spin-button,.pico ::-webkit-outer-spin-button{height:auto}.pico [type=search]{-webkit-appearance:textfield;outline-offset:-2px}.pico [type=search]::-webkit-search-decoration{-webkit-appearance:none}.pico ::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}.pico ::-moz-focus-inner{border-style:none;padding:0}.pico :-moz-focusring{outline:0}.pico :-moz-ui-invalid{box-shadow:none}.pico ::-ms-expand{display:none}.pico [type=file],.pico [type=range]{border-width:0;padding:0}.pico input:not([type=checkbox],[type=radio],[type=range]){height:calc(1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 + var(--pico-border-width) * 2)}.pico fieldset{width:100%;margin:0;margin-bottom:var(--pico-spacing);border:0;padding:0}.pico fieldset legend,.pico label{margin-bottom:calc(var(--pico-spacing) * .375);color:var(--pico-color);font-weight:var(--pico-form-label-font-weight,var(--pico-font-weight));display:block}.pico fieldset legend{margin-bottom:calc(var(--pico-spacing) * .5)}.pico button[type=submit],.pico input:not([type=checkbox],[type=radio]),.pico select,.pico textarea{width:100%}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file]),.pico select,.pico textarea{-webkit-appearance:none;-moz-appearance:none;appearance:none;padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal)}.pico input,.pico select,.pico textarea{--pico-background-color:var(--pico-form-element-background-color);--pico-border-color:var(--pico-form-element-border-color);--pico-color:var(--pico-form-element-color);--pico-box-shadow:none;border:var(--pico-border-width) solid var(--pico-border-color);border-radius:var(--pico-border-radius);background-color:var(--pico-background-color);box-shadow:var(--pico-box-shadow);color:var(--pico-color);font-weight:var(--pico-font-weight);transition:background-color var(--pico-transition),border-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition);outline:0}.pico :where(select,textarea):not([readonly]):is(:active,:focus),.pico input:not([type=submit],[type=button],[type=reset],[type=checkbox],[type=radio],[readonly]):is(:active,:focus){--pico-background-color:var(--pico-form-element-active-background-color)}.pico :where(select,textarea):not([readonly]):is(:active,:focus),.pico input:not([type=submit],[type=button],[type=reset],[role=switch],[readonly]):is(:active,:focus){--pico-border-color:var(--pico-form-element-active-border-color)}.pico :where(select,textarea):not([readonly]):focus,.pico input:not([type=submit],[type=button],[type=reset],[type=range],[type=file],[readonly]):focus{--pico-box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-focus-color)}.pico :where(fieldset[disabled]) :is(input:not([type=submit],[type=button],[type=reset]),select,textarea),.pico input:not([type=submit],[type=button],[type=reset])[disabled],.pico label[aria-disabled=true],.pico select[disabled],.pico textarea[disabled]{opacity:var(--pico-form-element-disabled-opacity);pointer-events:none}.pico label[aria-disabled=true] input[disabled]{opacity:1}.pico :where(input,select,textarea):not([type=checkbox],[type=radio],[type=date],[type=datetime-local],[type=month],[type=time],[type=week],[type=range])[aria-invalid]{padding-left:var(--pico-form-element-spacing-horizontal);background-position:right .75rem center;background-repeat:no-repeat;background-size:1rem;padding-right:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem)!important;padding-inline-start:var(--pico-form-element-spacing-horizontal)!important;padding-inline-end:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem)!important}.pico :where(input,select,textarea):not([type=checkbox],[type=radio],[type=date],[type=datetime-local],[type=month],[type=time],[type=week],[type=range])[aria-invalid=false]:not(select){background-image:var(--pico-icon-valid)}.pico :where(input,select,textarea):not([type=checkbox],[type=radio],[type=date],[type=datetime-local],[type=month],[type=time],[type=week],[type=range])[aria-invalid=true]:not(select){background-image:var(--pico-icon-invalid)}.pico :where(input,select,textarea)[aria-invalid=false]{--pico-border-color:var(--pico-form-element-valid-border-color)}.pico :where(input,select,textarea)[aria-invalid=false]:is(:active,:focus){--pico-border-color:var(--pico-form-element-valid-active-border-color)!important}.pico :where(input,select,textarea)[aria-invalid=false]:is(:active,:focus):not([type=checkbox],[type=radio]){--pico-box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-valid-focus-color)!important}.pico :where(input,select,textarea)[aria-invalid=true]{--pico-border-color:var(--pico-form-element-invalid-border-color)}.pico :where(input,select,textarea)[aria-invalid=true]:is(:active,:focus){--pico-border-color:var(--pico-form-element-invalid-active-border-color)!important}.pico :where(input,select,textarea)[aria-invalid=true]:is(:active,:focus):not([type=checkbox],[type=radio]){--pico-box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-invalid-focus-color)!important}[dir=rtl] .pico :where(input,select,textarea):not([type=checkbox],[type=radio]):is([aria-invalid],[aria-invalid=true],[aria-invalid=false]){background-position:.75rem}.pico input::-webkit-input-placeholder,.pico input::placeholder,.pico select:invalid,.pico textarea::-webkit-input-placeholder,.pico textarea::placeholder{color:var(--pico-form-element-placeholder-color);opacity:1}.pico input:not([type=checkbox],[type=radio]),.pico select,.pico textarea{margin-bottom:var(--pico-spacing)}.pico select::-ms-expand{background-color:#0000;border:0}.pico select:not([multiple],[size]){padding-right:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem);padding-left:var(--pico-form-element-spacing-horizontal);background-image:var(--pico-icon-chevron);background-position:right .75rem center;background-repeat:no-repeat;background-size:1rem;padding-inline-start:var(--pico-form-element-spacing-horizontal);padding-inline-end:calc(var(--pico-form-element-spacing-horizontal) + 1.5rem)}.pico select[multiple] option:checked{background:var(--pico-form-element-selected-background-color);color:var(--pico-form-element-color)}[dir=rtl] .pico select:not([multiple],[size]){background-position:.75rem}.pico textarea{resize:vertical;display:block}.pico textarea[aria-invalid]{--pico-icon-height:calc(1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 + var(--pico-border-width) * 2);background-position:right .75rem top!important;background-size:1rem var(--pico-icon-height)!important}.pico :where(input,select,textarea,fieldset,.grid)+small{width:100%;margin-top:calc(var(--pico-spacing) * -.75);margin-bottom:var(--pico-spacing);color:var(--pico-muted-color);display:block}.pico :where(input,select,textarea,fieldset,.grid)[aria-invalid=false]+small{color:var(--pico-ins-color)}.pico :where(input,select,textarea,fieldset,.grid)[aria-invalid=true]+small{color:var(--pico-del-color)}.pico label>:where(input,select,textarea){margin-top:calc(var(--pico-spacing) * .25)}.pico label:has([type=checkbox],[type=radio]){cursor:pointer;width:fit-content}.pico [type=checkbox],.pico [type=radio]{-webkit-appearance:none;-moz-appearance:none;appearance:none;margin-top:-.125em;border-width:var(--pico-border-width);vertical-align:middle;cursor:pointer;width:1.25em;height:1.25em;margin-inline-end:.5em}.pico [type=checkbox]::-ms-check,.pico [type=radio]::-ms-check{display:none}.pico [type=checkbox]:checked,.pico [type=checkbox]:checked:active,.pico [type=checkbox]:checked:focus,.pico [type=radio]:checked,.pico [type=radio]:checked:active,.pico [type=radio]:checked:focus{--pico-background-color:var(--pico-primary-background);--pico-border-color:var(--pico-primary-border);background-image:var(--pico-icon-checkbox);background-position:50%;background-repeat:no-repeat;background-size:.75em}.pico [type=checkbox]~label,.pico [type=radio]~label{cursor:pointer;margin-bottom:0;display:inline-block}.pico [type=checkbox]~label:not(:last-of-type),.pico [type=radio]~label:not(:last-of-type){margin-inline-end:1em}.pico [type=checkbox]:indeterminate{--pico-background-color:var(--pico-primary-background);--pico-border-color:var(--pico-primary-border);background-image:var(--pico-icon-minus);background-position:50%;background-repeat:no-repeat;background-size:.75em}.pico [type=radio]{border-radius:50%}.pico [type=radio]:checked,.pico [type=radio]:checked:active,.pico [type=radio]:checked:focus{--pico-background-color:var(--pico-primary-inverse);background-image:none;border-width:.35em}.pico [type=checkbox][role=switch]{--pico-background-color:var(--pico-switch-background-color);--pico-color:var(--pico-switch-color);border:var(--pico-border-width) solid var(--pico-border-color);background-color:var(--pico-background-color);border-radius:1.25em;width:2.25em;height:1.25em;line-height:1.25em}.pico [type=checkbox][role=switch]:not([aria-invalid]){--pico-border-color:var(--pico-switch-background-color)}.pico [type=checkbox][role=switch]:before{aspect-ratio:1;background-color:var(--pico-color);height:100%;box-shadow:var(--pico-switch-thumb-box-shadow);content:\"\";border-radius:50%;transition:margin .1s ease-in-out;display:block}.pico [type=checkbox][role=switch]:focus{--pico-background-color:var(--pico-switch-background-color);--pico-border-color:var(--pico-switch-background-color)}.pico [type=checkbox][role=switch]:checked{--pico-background-color:var(--pico-switch-checked-background-color);--pico-border-color:var(--pico-switch-checked-background-color);background-image:none}.pico [type=checkbox][role=switch]:checked:before{margin-inline-start:1em}.pico [type=checkbox][role=switch][disabled]{--pico-background-color:var(--pico-border-color)}.pico [type=checkbox][aria-invalid=false]:checked,.pico [type=checkbox][aria-invalid=false]:checked:active,.pico [type=checkbox][aria-invalid=false]:checked:focus,.pico [type=checkbox][role=switch][aria-invalid=false]:checked,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:active,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:focus{--pico-background-color:var(--pico-form-element-valid-border-color)}.pico [type=checkbox]:checked:active[aria-invalid=true],.pico [type=checkbox]:checked:focus[aria-invalid=true],.pico [type=checkbox]:checked[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:active[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:focus[aria-invalid=true],.pico [type=checkbox][role=switch]:checked[aria-invalid=true]{--pico-background-color:var(--pico-form-element-invalid-border-color)}.pico [type=checkbox][aria-invalid=false]:checked,.pico [type=checkbox][aria-invalid=false]:checked:active,.pico [type=checkbox][aria-invalid=false]:checked:focus,.pico [type=checkbox][role=switch][aria-invalid=false]:checked,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:active,.pico [type=checkbox][role=switch][aria-invalid=false]:checked:focus,.pico [type=radio][aria-invalid=false]:checked,.pico [type=radio][aria-invalid=false]:checked:active,.pico [type=radio][aria-invalid=false]:checked:focus{--pico-border-color:var(--pico-form-element-valid-border-color)}.pico [type=checkbox]:checked:active[aria-invalid=true],.pico [type=checkbox]:checked:focus[aria-invalid=true],.pico [type=checkbox]:checked[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:active[aria-invalid=true],.pico [type=checkbox][role=switch]:checked:focus[aria-invalid=true],.pico [type=checkbox][role=switch]:checked[aria-invalid=true],.pico [type=radio]:checked:active[aria-invalid=true],.pico [type=radio]:checked:focus[aria-invalid=true],.pico [type=radio]:checked[aria-invalid=true]{--pico-border-color:var(--pico-form-element-invalid-border-color)}.pico [type=color]::-webkit-color-swatch-wrapper{padding:0}.pico [type=color]::-moz-focus-inner{padding:0}.pico [type=color]::-webkit-color-swatch{border-radius:calc(var(--pico-border-radius) * .5);border:0}.pico [type=color]::-moz-color-swatch{border-radius:calc(var(--pico-border-radius) * .5);border:0}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file]):is([type=date],[type=datetime-local],[type=month],[type=time],[type=week]){--pico-icon-position:.75rem;--pico-icon-width:1rem;padding-right:calc(var(--pico-icon-width) + var(--pico-icon-position));background-image:var(--pico-icon-date);background-position:center right var(--pico-icon-position);background-size:var(--pico-icon-width) auto;background-repeat:no-repeat}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=time]{background-image:var(--pico-icon-time)}.pico [type=date]::-webkit-calendar-picker-indicator,.pico [type=datetime-local]::-webkit-calendar-picker-indicator,.pico [type=month]::-webkit-calendar-picker-indicator,.pico [type=time]::-webkit-calendar-picker-indicator,.pico [type=week]::-webkit-calendar-picker-indicator{width:var(--pico-icon-width);margin-right:calc(var(--pico-icon-width) * -1);margin-left:var(--pico-icon-position);opacity:0}@-moz-document url-prefix(){.pico [type=date],.pico [type=datetime-local],.pico [type=month],.pico [type=time],.pico [type=week]{padding-right:var(--pico-form-element-spacing-horizontal)!important;background-image:none!important}}[dir=rtl] .pico :is([type=date],[type=datetime-local],[type=month],[type=time],[type=week]){text-align:right}.pico [type=file]{--pico-color:var(--pico-muted-color);margin-left:calc(var(--pico-outline-width) * -1);padding:calc(var(--pico-form-element-spacing-vertical) * .5) 0;padding-left:var(--pico-outline-width);background:0 0;border:0;border-radius:0}.pico [type=file]::file-selector-button{margin-right:calc(var(--pico-spacing)/ 2);padding:calc(var(--pico-form-element-spacing-vertical) * .5) var(--pico-form-element-spacing-horizontal)}.pico [type=file]:is(:hover,:active,:focus)::file-selector-button{--pico-background-color:var(--pico-secondary-hover-background);--pico-border-color:var(--pico-secondary-hover-border)}.pico [type=file]:focus::file-selector-button{--pico-box-shadow:var(--pico-button-hover-box-shadow,0 0 0 #0000),0 0 0 var(--pico-outline-width) var(--pico-secondary-focus)}.pico [type=range]{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:0 0;width:100%;height:1.25rem}.pico [type=range]::-webkit-slider-runnable-track{border-radius:var(--pico-border-radius);background-color:var(--pico-range-border-color);width:100%;height:.375rem;-webkit-transition:background-color var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),box-shadow var(--pico-transition)}.pico [type=range]::-moz-range-track{border-radius:var(--pico-border-radius);background-color:var(--pico-range-border-color);width:100%;height:.375rem;-moz-transition:background-color var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),box-shadow var(--pico-transition)}.pico [type=range]::-ms-track{border-radius:var(--pico-border-radius);background-color:var(--pico-range-border-color);width:100%;height:.375rem;-ms-transition:background-color var(--pico-transition),box-shadow var(--pico-transition);transition:background-color var(--pico-transition),box-shadow var(--pico-transition)}.pico [type=range]::-webkit-slider-thumb{-webkit-appearance:none;border:2px solid var(--pico-range-thumb-border-color);background-color:var(--pico-range-thumb-color);cursor:pointer;width:1.25rem;height:1.25rem;-webkit-transition:background-color var(--pico-transition),transform var(--pico-transition);transition:background-color var(--pico-transition),transform var(--pico-transition);border-radius:50%;margin-top:-.4375rem}.pico [type=range]::-moz-range-thumb{-webkit-appearance:none;border:2px solid var(--pico-range-thumb-border-color);background-color:var(--pico-range-thumb-color);cursor:pointer;width:1.25rem;height:1.25rem;-moz-transition:background-color var(--pico-transition),transform var(--pico-transition);transition:background-color var(--pico-transition),transform var(--pico-transition);border-radius:50%;margin-top:-.4375rem}.pico [type=range]::-ms-thumb{-webkit-appearance:none;border:2px solid var(--pico-range-thumb-border-color);background-color:var(--pico-range-thumb-color);cursor:pointer;width:1.25rem;height:1.25rem;-ms-transition:background-color var(--pico-transition),transform var(--pico-transition);transition:background-color var(--pico-transition),transform var(--pico-transition);border-radius:50%;margin-top:-.4375rem}.pico [type=range]:active,.pico [type=range]:focus-within{--pico-range-border-color:var(--pico-range-active-border-color);--pico-range-thumb-color:var(--pico-range-thumb-active-color)}.pico [type=range]:active::-webkit-slider-thumb{transform:scale(1.25)}.pico [type=range]:active::-moz-range-thumb{transform:scale(1.25)}.pico [type=range]:active::-ms-thumb{transform:scale(1.25)}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search]{background-image:var(--pico-icon-search);background-position:center left calc(var(--pico-form-element-spacing-horizontal) + .125rem);background-repeat:no-repeat;background-size:1rem;padding-inline-start:calc(var(--pico-form-element-spacing-horizontal) + 1.75rem)}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid]{background-position:1.125rem,right .75rem center;padding-inline-start:calc(var(--pico-form-element-spacing-horizontal) + 1.75rem)!important}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid=false]{background-image:var(--pico-icon-search),var(--pico-icon-valid)}.pico input:not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid=true]{background-image:var(--pico-icon-search),var(--pico-icon-invalid)}[dir=rtl] .pico :where(input):not([type=checkbox],[type=radio],[type=range],[type=file])[type=search]{background-position:right 1.125rem center}[dir=rtl] .pico :where(input):not([type=checkbox],[type=radio],[type=range],[type=file])[type=search][aria-invalid]{background-position:right 1.125rem center,.75rem}.pico details{margin-bottom:var(--pico-spacing);display:block}.pico details summary{cursor:pointer;transition:color var(--pico-transition);line-height:1rem;list-style-type:none}.pico details summary:not([role]){color:var(--pico-accordion-close-summary-color)}.pico details summary::-webkit-details-marker{display:none}.pico details summary::marker{display:none}.pico details summary::-moz-list-bullet{list-style-type:none}.pico details summary:after{width:1rem;height:1rem;float:right;background-image:var(--pico-icon-chevron);content:\"\";transition:transform var(--pico-transition);background-position:100%;background-repeat:no-repeat;background-size:1rem;margin-inline-start:calc(var(--pico-spacing,1rem) * .5);display:block;transform:rotate(-90deg)}.pico details summary:focus{outline:0}.pico details summary:focus:not([role]){color:var(--pico-accordion-active-summary-color)}.pico details summary:focus-visible:not([role]){outline:var(--pico-outline-width) solid var(--pico-primary-focus);outline-offset:calc(var(--pico-spacing,1rem) * .5);color:var(--pico-primary)}.pico details summary[role=button]{text-align:left;width:100%}.pico details summary[role=button]:after{height:calc(1rem * var(--pico-line-height,1.5))}.pico details[open]>summary{margin-bottom:var(--pico-spacing)}.pico details[open]>summary:not([role]):not(:focus){color:var(--pico-accordion-open-summary-color)}.pico details[open]>summary:after{transform:rotate(0)}[dir=rtl] .pico details summary{text-align:right}[dir=rtl] .pico details summary:after{float:left;background-position:0}.pico article{margin-bottom:var(--pico-block-spacing-vertical);padding:var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);border-radius:var(--pico-border-radius);background:var(--pico-card-background-color);box-shadow:var(--pico-card-box-shadow)}.pico article>footer,.pico article>header{margin-right:calc(var(--pico-block-spacing-horizontal) * -1);margin-left:calc(var(--pico-block-spacing-horizontal) * -1);padding:calc(var(--pico-block-spacing-vertical) * .66) var(--pico-block-spacing-horizontal);background-color:var(--pico-card-sectioning-background-color)}.pico article>header{margin-top:calc(var(--pico-block-spacing-vertical) * -1);margin-bottom:var(--pico-block-spacing-vertical);border-bottom:var(--pico-border-width) solid var(--pico-card-border-color);border-top-right-radius:var(--pico-border-radius);border-top-left-radius:var(--pico-border-radius)}.pico article>footer{margin-top:var(--pico-block-spacing-vertical);margin-bottom:calc(var(--pico-block-spacing-vertical) * -1);border-top:var(--pico-border-width) solid var(--pico-card-border-color);border-bottom-right-radius:var(--pico-border-radius);border-bottom-left-radius:var(--pico-border-radius)}.pico details.dropdown{border-bottom:none;position:relative}.pico details.dropdown>a:after,.pico details.dropdown>button:after,.pico details.dropdown>summary:after{width:1rem;height:calc(1rem * var(--pico-line-height,1.5));float:right;background-image:var(--pico-icon-chevron);content:\"\";background-position:100%;background-repeat:no-repeat;background-size:1rem;margin-inline-start:.25rem;display:block;transform:rotate(0)translate(.2rem)}.pico nav details.dropdown{margin-bottom:0}.pico details.dropdown>summary:not([role]){height:calc(1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 + var(--pico-border-width) * 2);padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);border:var(--pico-border-width) solid var(--pico-form-element-border-color);border-radius:var(--pico-border-radius);background-color:var(--pico-form-element-background-color);color:var(--pico-form-element-placeholder-color);line-height:inherit;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none;transition:background-color var(--pico-transition),border-color var(--pico-transition),color var(--pico-transition),box-shadow var(--pico-transition)}.pico details.dropdown>summary:not([role]):active,.pico details.dropdown>summary:not([role]):focus{border-color:var(--pico-form-element-active-border-color);background-color:var(--pico-form-element-active-background-color)}.pico details.dropdown>summary:not([role]):focus{box-shadow:0 0 0 var(--pico-outline-width) var(--pico-form-element-focus-color)}.pico details.dropdown>summary:not([role]):focus-visible{outline:0}.pico details.dropdown>summary:not([role])[aria-invalid=false]{--pico-form-element-border-color:var(--pico-form-element-valid-border-color);--pico-form-element-active-border-color:var(--pico-form-element-valid-focus-color);--pico-form-element-focus-color:var(--pico-form-element-valid-focus-color)}.pico details.dropdown>summary:not([role])[aria-invalid=true]{--pico-form-element-border-color:var(--pico-form-element-invalid-border-color);--pico-form-element-active-border-color:var(--pico-form-element-invalid-focus-color);--pico-form-element-focus-color:var(--pico-form-element-invalid-focus-color)}.pico nav details.dropdown{margin:calc(var(--pico-nav-element-spacing-vertical) * -1) 0;display:inline}.pico nav details.dropdown>summary:after{transform:rotate(0)translate(0)}.pico nav details.dropdown>summary:not([role]){height:calc(1rem * var(--pico-line-height) + var(--pico-nav-link-spacing-vertical) * 2);padding:calc(var(--pico-nav-link-spacing-vertical) - var(--pico-border-width) * 2) var(--pico-nav-link-spacing-horizontal)}.pico nav details.dropdown>summary:not([role]):focus-visible{box-shadow:0 0 0 var(--pico-outline-width) var(--pico-primary-focus)}.pico details.dropdown>summary+ul{z-index:99;width:100%;min-width:fit-content;margin:0;margin-top:var(--pico-outline-width);border:var(--pico-border-width) solid var(--pico-dropdown-border-color);border-radius:var(--pico-border-radius);background-color:var(--pico-dropdown-background-color);box-shadow:var(--pico-dropdown-box-shadow);color:var(--pico-dropdown-color);white-space:nowrap;opacity:0;transition:opacity var(--pico-transition),transform 0s ease-in-out 1s;flex-direction:column;padding:0;display:flex;position:absolute;left:0}.pico details.dropdown>summary+ul[dir=rtl]{left:auto;right:0}.pico details.dropdown>summary+ul li{width:100%;padding:calc(var(--pico-form-element-spacing-vertical) * .5) var(--pico-form-element-spacing-horizontal);margin-bottom:0;list-style:none}.pico details.dropdown>summary+ul li:first-of-type{margin-top:calc(var(--pico-form-element-spacing-vertical) * .5)}.pico details.dropdown>summary+ul li:last-of-type{margin-bottom:calc(var(--pico-form-element-spacing-vertical) * .5)}.pico details.dropdown>summary+ul li a{margin:calc(var(--pico-form-element-spacing-vertical) * -.5) calc(var(--pico-form-element-spacing-horizontal) * -1);padding:calc(var(--pico-form-element-spacing-vertical) * .5) var(--pico-form-element-spacing-horizontal);color:var(--pico-dropdown-color);text-overflow:ellipsis;border-radius:0;text-decoration:none;display:block;overflow:hidden}.pico details.dropdown>summary+ul li a:active,.pico details.dropdown>summary+ul li a:focus,.pico details.dropdown>summary+ul li a:focus-visible,.pico details.dropdown>summary+ul li a:hover,.pico details.dropdown>summary+ul li a[aria-current]:not([aria-current=false]){background-color:var(--pico-dropdown-hover-background-color)}.pico details.dropdown>summary+ul li label{width:100%}.pico details.dropdown>summary+ul li:has(label):hover{background-color:var(--pico-dropdown-hover-background-color)}.pico details.dropdown[open]>summary{margin-bottom:0}.pico details.dropdown[open]>summary+ul{opacity:1;transition:opacity var(--pico-transition),transform 0s ease-in-out 0s;transform:scaleY(1)}.pico details.dropdown[open]>summary:before{z-index:1;content:\"\";cursor:default;background:0 0;width:100vw;height:100vh;display:block;position:fixed;inset:0}.pico label>details.dropdown{margin-top:calc(var(--pico-spacing) * .25)}.pico [role=group],.pico [role=search]{width:100%;margin-bottom:var(--pico-spacing);border-radius:var(--pico-border-radius);box-shadow:var(--pico-group-box-shadow,0 0 0 transparent);vertical-align:middle;transition:box-shadow var(--pico-transition);display:inline-flex;position:relative}.pico [role=group] input:not([type=checkbox],[type=radio]),.pico [role=group] select,.pico [role=group]>*,.pico [role=search] input:not([type=checkbox],[type=radio]),.pico [role=search] select,.pico [role=search]>*{flex:auto;margin-bottom:0;position:relative}.pico [role=group] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=group] select:not(:first-child),.pico [role=group]>:not(:first-child),.pico [role=search] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=search] select:not(:first-child),.pico [role=search]>:not(:first-child){border-top-left-radius:0;border-bottom-left-radius:0;margin-left:0}.pico [role=group] input:not([type=checkbox],[type=radio]):not(:last-child),.pico [role=group] select:not(:last-child),.pico [role=group]>:not(:last-child),.pico [role=search] input:not([type=checkbox],[type=radio]):not(:last-child),.pico [role=search] select:not(:last-child),.pico [role=search]>:not(:last-child){border-top-right-radius:0;border-bottom-right-radius:0}.pico [role=group] input:not([type=checkbox],[type=radio]):focus,.pico [role=group] select:focus,.pico [role=group]>:focus,.pico [role=search] input:not([type=checkbox],[type=radio]):focus,.pico [role=search] select:focus,.pico [role=search]>:focus{z-index:2}.pico [role=group] [role=button]:not(:first-child),.pico [role=group] [type=button]:not(:first-child),.pico [role=group] [type=reset]:not(:first-child),.pico [role=group] [type=submit]:not(:first-child),.pico [role=group] button:not(:first-child),.pico [role=group] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=group] select:not(:first-child),.pico [role=search] [role=button]:not(:first-child),.pico [role=search] [type=button]:not(:first-child),.pico [role=search] [type=reset]:not(:first-child),.pico [role=search] [type=submit]:not(:first-child),.pico [role=search] button:not(:first-child),.pico [role=search] input:not([type=checkbox],[type=radio]):not(:first-child),.pico [role=search] select:not(:first-child){margin-left:calc(var(--pico-border-width) * -1)}.pico [role=group] [role=button],.pico [role=group] [type=button],.pico [role=group] [type=reset],.pico [role=group] [type=submit],.pico [role=group] button,.pico [role=search] [role=button],.pico [role=search] [type=button],.pico [role=search] [type=reset],.pico [role=search] [type=submit],.pico [role=search] button{width:auto}@supports selector(:has(*)){.pico [role=group]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus),.pico [role=search]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus){--pico-group-box-shadow:var(--pico-group-box-shadow-focus-with-button)}.pico [role=group]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) input:not([type=checkbox],[type=radio]),.pico [role=group]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) select,.pico [role=search]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) input:not([type=checkbox],[type=radio]),.pico [role=search]:has(button:focus,[type=submit]:focus,[type=button]:focus,[role=button]:focus) select{border-color:#0000}.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus),.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus){--pico-group-box-shadow:var(--pico-group-box-shadow-focus-with-input)}.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) [role=button],.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=button],.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=submit],.pico [role=group]:has(input:not([type=submit],[type=button]):focus,select:focus) button,.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) [role=button],.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=button],.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) [type=submit],.pico [role=search]:has(input:not([type=submit],[type=button]):focus,select:focus) button{--pico-button-box-shadow:0 0 0 var(--pico-border-width) var(--pico-primary-border);--pico-button-hover-box-shadow:0 0 0 var(--pico-border-width) var(--pico-primary-hover-border)}.pico [role=group] [role=button]:focus,.pico [role=group] [type=button]:focus,.pico [role=group] [type=reset]:focus,.pico [role=group] [type=submit]:focus,.pico [role=group] button:focus,.pico [role=search] [role=button]:focus,.pico [role=search] [type=button]:focus,.pico [role=search] [type=reset]:focus,.pico [role=search] [type=submit]:focus,.pico [role=search] button:focus{box-shadow:none}}.pico [role=search]>:first-child{border-top-left-radius:5rem;border-bottom-left-radius:5rem}.pico [role=search]>:last-child{border-top-right-radius:5rem;border-bottom-right-radius:5rem}.pico [aria-busy=true]:not(input,select,textarea,html,form){white-space:nowrap}.pico [aria-busy=true]:not(input,select,textarea,html,form):before{background-image:var(--pico-icon-loading);content:\"\";vertical-align:-.125em;background-repeat:no-repeat;background-size:1em;width:1em;height:1em;display:inline-block}.pico [aria-busy=true]:not(input,select,textarea,html,form):not(:empty):before{margin-inline-end:calc(var(--pico-spacing) * .5)}.pico [aria-busy=true]:not(input,select,textarea,html,form):empty{text-align:center}.pico [role=button][aria-busy=true],.pico [type=button][aria-busy=true],.pico [type=reset][aria-busy=true],.pico [type=submit][aria-busy=true],.pico a[aria-busy=true],.pico button[aria-busy=true]{pointer-events:none}:host,:root{--pico-scrollbar-width:0px}.pico dialog{z-index:999;width:inherit;min-width:100%;height:inherit;min-height:100%;backdrop-filter:var(--pico-modal-overlay-backdrop-filter);background-color:var(--pico-modal-overlay-background-color);color:var(--pico-color);border:0;justify-content:center;align-items:center;padding:0;display:flex;position:fixed;inset:0}.pico dialog>article{width:100%;max-height:calc(100vh - var(--pico-spacing) * 2);margin:var(--pico-spacing);overflow:auto}@media (width>=576px){.pico dialog>article{max-width:510px}}@media (width>=768px){.pico dialog>article{max-width:700px}}.pico dialog>article>header>*{margin-bottom:0}.pico dialog>article>header .close,.pico dialog>article>header :is(a,button)[rel=prev]{margin:0;margin-left:var(--pico-spacing);float:right;padding:0}.pico dialog>article>footer{text-align:right}.pico dialog>article>footer [role=button],.pico dialog>article>footer button{margin-bottom:0}.pico dialog>article>footer [role=button]:not(:first-of-type),.pico dialog>article>footer button:not(:first-of-type){margin-left:calc(var(--pico-spacing) * .5)}.pico dialog>article .close,.pico dialog>article :is(a,button)[rel=prev]{width:1rem;height:1rem;margin-top:calc(var(--pico-spacing) * -1);margin-bottom:var(--pico-spacing);background-image:var(--pico-icon-close);opacity:.5;transition:opacity var(--pico-transition);background-color:#0000;background-position:50%;background-repeat:no-repeat;background-size:auto 1rem;border:none;margin-left:auto;display:block}.pico dialog>article .close:is([aria-current]:not([aria-current=false]),:hover,:active,:focus),.pico dialog>article :is(a,button)[rel=prev]:is([aria-current]:not([aria-current=false]),:hover,:active,:focus){opacity:1}.pico dialog:not([open]),.pico dialog[open=false]{display:none}.modal-is-open{padding-right:var(--pico-scrollbar-width,0);pointer-events:none;touch-action:none;overflow:hidden}.modal-is-open dialog{pointer-events:auto;touch-action:auto}:where(.modal-is-opening,.modal-is-closing) dialog,:where(.modal-is-opening,.modal-is-closing) dialog>article{animation-duration:.2s;animation-timing-function:ease-in-out;animation-fill-mode:both}:where(.modal-is-opening,.modal-is-closing) dialog{animation-name:modal-overlay;animation-duration:.8s}:where(.modal-is-opening,.modal-is-closing) dialog>article{animation-name:modal;animation-delay:.2s}.modal-is-closing dialog,.modal-is-closing dialog>article{animation-direction:reverse;animation-delay:0s}@keyframes modal-overlay{0%{backdrop-filter:none;background-color:#0000}}@keyframes modal{0%{opacity:0;transform:translateY(-100%)}}:where(nav li):before{float:left;content:\"​\"}.pico nav,.pico nav ul{display:flex}.pico nav{justify-content:space-between;overflow:visible}.pico nav ol,.pico nav ul{align-items:center;margin-bottom:0;padding:0;list-style:none}.pico nav ol:first-of-type,.pico nav ul:first-of-type{margin-left:calc(var(--pico-nav-element-spacing-horizontal) * -1)}.pico nav ol:last-of-type,.pico nav ul:last-of-type{margin-right:calc(var(--pico-nav-element-spacing-horizontal) * -1)}.pico nav li{padding:var(--pico-nav-element-spacing-vertical) var(--pico-nav-element-spacing-horizontal);margin:0;display:inline-block}.pico nav li :where(a,[role=link]){margin:calc(var(--pico-nav-link-spacing-vertical) * -1) calc(var(--pico-nav-link-spacing-horizontal) * -1);padding:var(--pico-nav-link-spacing-vertical) var(--pico-nav-link-spacing-horizontal);border-radius:var(--pico-border-radius);display:inline-block}.pico nav li :where(a,[role=link]):not(:hover){text-decoration:none}.pico nav li [role=button],.pico nav li [type=button],.pico nav li button,.pico nav li input:not([type=checkbox],[type=radio],[type=range],[type=file]),.pico nav li select{height:auto;margin-right:inherit;margin-bottom:0;margin-left:inherit;padding:calc(var(--pico-nav-link-spacing-vertical) - var(--pico-border-width) * 2) var(--pico-nav-link-spacing-horizontal)}.pico nav[aria-label=breadcrumb]{justify-content:start;align-items:center}.pico nav[aria-label=breadcrumb] ul li:not(:first-child){margin-inline-start:var(--pico-nav-link-spacing-horizontal)}.pico nav[aria-label=breadcrumb] ul li a{margin:calc(var(--pico-nav-link-spacing-vertical) * -1) 0;margin-inline-start:calc(var(--pico-nav-link-spacing-horizontal) * -1)}.pico nav[aria-label=breadcrumb] ul li:not(:last-child):after{width:calc(var(--pico-nav-link-spacing-horizontal) * 4);margin:0 calc(var(--pico-nav-link-spacing-horizontal) * -1);content:var(--pico-nav-breadcrumb-divider);color:var(--pico-muted-color);text-align:center;white-space:nowrap;text-decoration:none;display:inline-block;position:absolute}.pico nav[aria-label=breadcrumb] a[aria-current]:not([aria-current=false]){color:inherit;pointer-events:none;background-color:#0000;text-decoration:none}.pico aside li,.pico aside nav,.pico aside ol,.pico aside ul{display:block}.pico aside li{padding:calc(var(--pico-nav-element-spacing-vertical) * .5) var(--pico-nav-element-spacing-horizontal)}.pico aside li a{display:block}.pico aside li [role=button]{margin:inherit}[dir=rtl] .pico nav[aria-label=breadcrumb] ul li:not(:last-child) :after{content:\"\\\\\"}.pico progress{vertical-align:baseline;-webkit-appearance:none;-moz-appearance:none;appearance:none;width:100%;height:.5rem;margin-bottom:calc(var(--pico-spacing) * .5);border-radius:var(--pico-border-radius);background-color:var(--pico-progress-background-color);color:var(--pico-progress-color);border:0;display:inline-block;overflow:hidden}.pico progress::-webkit-progress-bar{border-radius:var(--pico-border-radius);background:0 0}.pico progress[value]::-webkit-progress-value{background-color:var(--pico-progress-color);-webkit-transition:inline-size var(--pico-transition);transition:inline-size var(--pico-transition)}.pico progress::-moz-progress-bar{background-color:var(--pico-progress-color)}@media (prefers-reduced-motion:no-preference){.pico progress:indeterminate{background:var(--pico-progress-background-color) linear-gradient(to right,var(--pico-progress-color) 30%,var(--pico-progress-background-color) 30%) top left/150% 150% no-repeat;animation:1s linear infinite progress-indeterminate}.pico progress:indeterminate[value]::-webkit-progress-value{background-color:#0000}.pico progress:indeterminate::-moz-progress-bar{background-color:#0000}[dir=rtl] .pico progress:indeterminate{animation-direction:reverse}}@keyframes progress-indeterminate{0%{background-position:200% 0}to{background-position:-200% 0}}.pico [data-tooltip]{position:relative}.pico [data-tooltip]:not(a,button,input,[role=button]){cursor:help;border-bottom:1px dotted;text-decoration:none}.pico [data-tooltip]:after,.pico [data-tooltip]:before,.pico [data-tooltip][data-placement=top]:after,.pico [data-tooltip][data-placement=top]:before{z-index:99;border-radius:var(--pico-border-radius);background:var(--pico-tooltip-background-color);content:attr(data-tooltip);color:var(--pico-tooltip-color);font-style:normal;font-weight:var(--pico-font-weight);text-overflow:ellipsis;white-space:nowrap;opacity:0;pointer-events:none;padding:.25rem .5rem;font-size:.875rem;text-decoration:none;display:block;position:absolute;bottom:100%;left:50%;overflow:hidden;transform:translate(-50%,-.25rem)}.pico [data-tooltip]:after,.pico [data-tooltip][data-placement=top]:after{content:\"\";color:var(--pico-tooltip-background-color);background-color:#0000;border-top:.3rem solid;border-left:.3rem solid #0000;border-right:.3rem solid #0000;border-radius:0;padding:0;transform:translate(-50%)}.pico [data-tooltip][data-placement=bottom]:after,.pico [data-tooltip][data-placement=bottom]:before{top:100%;bottom:auto;transform:translate(-50%,.25rem)}.pico [data-tooltip][data-placement=bottom]:after{border:.3rem solid #0000;border-bottom-color:currentColor;transform:translate(-50%,-.3rem)}.pico [data-tooltip][data-placement=left]:after,.pico [data-tooltip][data-placement=left]:before{inset:50% 100% auto auto;transform:translate(-.25rem,-50%)}.pico [data-tooltip][data-placement=left]:after{border:.3rem solid #0000;border-left-color:currentColor;transform:translate(.3rem,-50%)}.pico [data-tooltip][data-placement=right]:after,.pico [data-tooltip][data-placement=right]:before{inset:50% auto auto 100%;transform:translate(.25rem,-50%)}.pico [data-tooltip][data-placement=right]:after{border:.3rem solid #0000;border-right-color:currentColor;transform:translate(-.3rem,-50%)}.pico [data-tooltip]:focus:after,.pico [data-tooltip]:focus:before,.pico [data-tooltip]:hover:after,.pico [data-tooltip]:hover:before{opacity:1}@media (hover:hover) and (pointer:fine){.pico [data-tooltip]:focus:after,.pico [data-tooltip]:focus:before,.pico [data-tooltip]:hover:after,.pico [data-tooltip]:hover:before{--pico-tooltip-slide-to:translate(-50%, -.25rem);opacity:0;animation-name:tooltip-slide;animation-duration:.2s;animation-fill-mode:forwards;transform:translate(-50%,.75rem)}.pico [data-tooltip]:focus:after,.pico [data-tooltip]:hover:after{--pico-tooltip-caret-slide-to:translate(-50%, 0rem);animation-name:tooltip-caret-slide;transform:translate(-50%,-.25rem)}.pico [data-tooltip][data-placement=bottom]:focus:after,.pico [data-tooltip][data-placement=bottom]:focus:before,.pico [data-tooltip][data-placement=bottom]:hover:after,.pico [data-tooltip][data-placement=bottom]:hover:before{--pico-tooltip-slide-to:translate(-50%, .25rem);animation-name:tooltip-slide;transform:translate(-50%,-.75rem)}.pico [data-tooltip][data-placement=bottom]:focus:after,.pico [data-tooltip][data-placement=bottom]:hover:after{--pico-tooltip-caret-slide-to:translate(-50%, -.3rem);animation-name:tooltip-caret-slide;transform:translate(-50%,-.5rem)}.pico [data-tooltip][data-placement=left]:focus:after,.pico [data-tooltip][data-placement=left]:focus:before,.pico [data-tooltip][data-placement=left]:hover:after,.pico [data-tooltip][data-placement=left]:hover:before{--pico-tooltip-slide-to:translate(-.25rem, -50%);animation-name:tooltip-slide;transform:translate(.75rem,-50%)}.pico [data-tooltip][data-placement=left]:focus:after,.pico [data-tooltip][data-placement=left]:hover:after{--pico-tooltip-caret-slide-to:translate(.3rem, -50%);animation-name:tooltip-caret-slide;transform:translate(.05rem,-50%)}.pico [data-tooltip][data-placement=right]:focus:after,.pico [data-tooltip][data-placement=right]:focus:before,.pico [data-tooltip][data-placement=right]:hover:after,.pico [data-tooltip][data-placement=right]:hover:before{--pico-tooltip-slide-to:translate(.25rem, -50%);animation-name:tooltip-slide;transform:translate(-.75rem,-50%)}.pico [data-tooltip][data-placement=right]:focus:after,.pico [data-tooltip][data-placement=right]:hover:after{--pico-tooltip-caret-slide-to:translate(-.3rem, -50%);animation-name:tooltip-caret-slide;transform:translate(-.05rem,-50%)}}@keyframes tooltip-slide{to{transform:var(--pico-tooltip-slide-to);opacity:1}}@keyframes tooltip-caret-slide{50%{opacity:0}to{transform:var(--pico-tooltip-caret-slide-to);opacity:1}}.pico [aria-controls]{cursor:pointer}.pico [aria-disabled=true],.pico [disabled]{cursor:not-allowed}.pico [aria-hidden=false][hidden]{display:initial}.pico [aria-hidden=false][hidden]:not(:focus){clip:rect(0,0,0,0);position:absolute}.pico [tabindex],.pico a,.pico area,.pico button,.pico input,.pico label,.pico select,.pico summary,.pico textarea{-ms-touch-action:manipulation}.pico [dir=rtl]{direction:rtl}@media (prefers-reduced-motion:reduce){.pico :not([aria-busy=true]),.pico :not([aria-busy=true]):after,.pico :not([aria-busy=true]):before{background-attachment:initial!important;scroll-behavior:auto!important;transition-duration:0s!important;transition-delay:0s!important;animation-duration:1ms!important;animation-iteration-count:1!important;animation-delay:-1ms!important}}}@layer joy{:root,:host,[data-theme=light]{--joy-font:system-ui, -apple-system, \"PingFang SC\", \"Microsoft YaHei\", sans-serif;--joy-radius:6px;--joy-accent:#5e81ac;--joy-accent-hover:#81a1c1;--joy-ok:#a3be8c;--joy-warn:#ebcb8b;--joy-err:#bf616a;--pico-font-family:var(--joy-font);--pico-border-radius:var(--joy-radius);--pico-primary:var(--joy-accent);--pico-primary-hover:var(--joy-accent-hover);--pico-primary-background:var(--joy-accent);--pico-primary-hover-background:var(--joy-accent-hover);--pico-secondary:#64708a;--pico-secondary-hover:#4c566a;--pico-secondary-background:#e5e9f0;--pico-secondary-hover-background:#d8dee9;--pico-secondary-border:#d8dee9;--pico-secondary-hover-border:#c9d2e0;--pico-secondary-inverse:#3b4252}:host{--pico-primary-underline:color-mix(in srgb, var(--joy-accent,#5e81ac) 50%, transparent);--pico-primary-focus:color-mix(in srgb, var(--joy-accent,#5e81ac) 37.5%, transparent);--pico-spacing:.8rem;--pico-form-element-spacing-vertical:.5rem;--pico-form-element-spacing-horizontal:.7rem;--pico-typography-spacing-vertical:.8rem;--mono:ui-monospace, SFMono-Regular, \"SF Mono\", Menlo, Consolas, monospace;font-size:1rem;display:block}.pico{color:var(--pico-color);background:var(--pico-background-color);font-size:.9rem}.pico input,.pico select,.pico textarea{margin-bottom:0}.panel{box-sizing:border-box;max-width:72rem;margin-inline:auto;padding:1rem}.section{margin-bottom:2rem}.section:last-child{margin-bottom:0}.section-head{border-bottom:1px solid var(--pico-muted-border-color);flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.5rem;margin:0 0 .75rem;padding:0 0 .5rem;display:flex}.pico .section-title{margin:0;font-size:1rem;font-weight:600}.section-actions{flex-wrap:wrap;align-items:center;gap:.5rem;display:flex}.head-note{color:var(--pico-muted-color);align-items:center;gap:.35rem;font-size:.8rem;display:inline-flex}.pico button{border-radius:var(--joy-radius,6px);white-space:nowrap;cursor:pointer;justify-content:center;align-items:center;width:auto;height:1.7rem;margin:0;padding:0 .85em;font-size:.85rem;line-height:1;transition:background-color .15s,border-color .15s,color .15s;display:inline-flex}.pico .btn-inline{height:1.4rem;padding:0 .6em;font-size:.78rem}.pico input[type=text],.pico input[type=password],.pico select{height:1.7rem;padding:0 .5em;font-size:.85rem}.pico textarea{padding:.4rem .5em;font-size:.85rem}.pico .btn-danger{border-color:var(--joy-err,#bf616a);color:var(--joy-err,#bf616a);background:0 0}.pico .btn-danger:hover,.pico .btn-danger:focus{background:var(--joy-err,#bf616a);border-color:var(--joy-err,#bf616a);color:#fff}.pico .add-line{border:1px dashed var(--pico-muted-border-color);height:1.4rem;color:var(--joy-accent,#5e81ac);background:0 0;align-self:flex-start;padding:0 .6em;font-size:.78rem}.pico .add-line:hover{border-color:var(--joy-accent,#5e81ac)}.row{flex-wrap:wrap;align-items:center;gap:.5rem;display:flex}.spacer{flex:1}.mono{font-family:var(--mono)}.muted{color:var(--pico-muted-color)}.tiny{font-size:.8rem}.hint{color:var(--pico-muted-color);margin-left:.35rem;font-size:.8rem;font-weight:400}.notice{border-radius:var(--joy-radius,6px);border-left:3px solid var(--pico-muted-border-color);background:var(--pico-code-background-color);padding:.5rem .75rem;font-size:.85rem;line-height:1.5}.notice-ok{border-left-color:var(--joy-ok,#a3be8c)}.notice-warn{border-left-color:var(--joy-warn,#ebcb8b)}.notice-err{border-left-color:var(--joy-err,#bf616a)}.pico .notice code{color:var(--pico-muted-color);word-break:break-all;background:0 0;margin-top:.25rem;padding:0;font-size:.8rem;display:block}.spinner{border:2px solid var(--pico-muted-border-color);border-top-color:var(--joy-accent,#5e81ac);vertical-align:-2px;border-radius:50%;width:15px;height:15px;animation:.6s linear infinite spin;display:inline-block}@keyframes spin{to{transform:rotate(360deg)}}.badge{border-radius:var(--joy-radius,6px);border:1px solid var(--pico-muted-border-color);color:var(--pico-muted-color);white-space:nowrap;padding:.1rem .45rem;font-size:.8rem;font-weight:500;display:inline-block}.badge-ok,.badge-warn{color:#1c1c1c;border-color:#0000;font-weight:600}.badge-ok{background:var(--joy-ok,#a3be8c)}.badge-warn{background:var(--joy-warn,#ebcb8b)}.badge.mono{font-family:var(--mono)}.lookup-form{flex-wrap:wrap;align-items:flex-end;gap:.75rem;display:flex}.lf-field{flex-direction:column;gap:.25rem;min-width:0;display:flex}.lf-field>label{color:var(--pico-muted-color);font-size:.85rem}.lf-domain{flex:18rem}.lf-type{flex:0 0 7rem}.pico .lookup-form input[type=text],.pico .lookup-form select{font-family:var(--mono)}.table-wrap{overflow-x:auto}.pico table.answers{width:100%;margin:0;font-size:.9rem}.pico table.answers th{color:var(--pico-muted-color);border-bottom:1px solid var(--pico-muted-border-color);background:0 0;padding:.4rem .6rem;font-size:.8rem;font-weight:500}.pico table.answers td{font-family:var(--mono);word-break:break-all;vertical-align:top;border-bottom:1px solid var(--pico-muted-border-color);padding:.4rem .6rem}.pico table.answers tbody tr{transition:background-color .15s}.pico table.answers tbody tr:hover{background:var(--pico-secondary-background)}.pico table.answers .num{text-align:right;font-variant-numeric:tabular-nums}.ro-grid{flex-wrap:wrap;gap:.4rem 1.5rem;font-size:.85rem;display:flex}.ro-grid .k{color:var(--pico-muted-color);margin-right:.35rem}.ro-grid .v{font-family:var(--mono)}.master-detail{grid-template-columns:minmax(190px,260px) 1fr;align-items:start;gap:1rem;display:grid}.master{border:1px solid var(--pico-muted-border-color);border-radius:var(--joy-radius,6px);background:var(--pico-card-background-color);flex-direction:column;display:flex;overflow:hidden}.master-head{color:var(--pico-muted-color);border-bottom:1px solid var(--pico-muted-border-color);padding:.5rem .6rem;font-size:.8rem}.r-list{max-height:26rem;padding:.3rem;overflow-y:auto}.r-item{border-radius:var(--joy-radius,6px);cursor:pointer;border:1px solid #0000;align-items:center;gap:.4rem;margin-bottom:.15rem;padding:.35rem .4rem;transition:background-color .15s,border-color .15s;display:flex}.r-item:hover{background:color-mix(in srgb, var(--joy-accent,#5e81ac) 10%, transparent)}.r-item[aria-selected=true]{border-color:var(--joy-accent,#5e81ac);background:color-mix(in srgb, var(--joy-accent,#5e81ac) 16%, transparent)}.r-item.dragging{opacity:.4}.r-item.dragover{box-shadow:inset 0 2px 0 var(--joy-accent,#5e81ac)}.r-handle{cursor:grab;color:var(--pico-muted-color);user-select:none;flex-shrink:0}.r-idx{font-family:var(--mono);color:var(--pico-muted-color);text-align:right;flex-shrink:0;width:1.1rem;font-size:.8rem}.r-label{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-size:.85rem;overflow:hidden}.r-label.unnamed{color:var(--pico-muted-color);font-style:italic}.master-foot{border-top:1px solid var(--pico-muted-border-color);align-items:center;gap:.4rem;padding:.5rem;display:flex}.add-wrap{position:relative}.add-menu{z-index:20;background:var(--pico-background-color);border:1px solid var(--pico-muted-border-color);border-radius:var(--joy-radius,6px);min-width:9.5rem;padding:.2rem;position:absolute;bottom:calc(100% + 4px);left:0;box-shadow:0 6px 20px #0000002e}.pico .add-menu button{text-align:left;width:100%;height:auto;color:var(--pico-color);background:0 0;border:none;border-radius:4px;padding:.3rem .4rem;font-size:.85rem;line-height:1.5;display:block}.pico .add-menu button:hover{background:var(--pico-secondary-background);color:var(--pico-secondary-inverse)}.detail{border:1px solid var(--pico-muted-border-color);border-radius:var(--joy-radius,6px);background:var(--pico-card-background-color);min-width:0;padding:1rem}.detail-head{border-bottom:1px solid var(--pico-muted-border-color);align-items:center;gap:.5rem;margin-bottom:.75rem;padding-bottom:.5rem;display:flex}.detail-name{font-weight:600}.pico .back-btn{display:none}.field{margin-bottom:.75rem}.field>label{color:var(--pico-muted-color);margin-bottom:.25rem;font-size:.85rem;display:block}.pico .field input[type=text],.pico .field textarea,.pico .field select{font-family:var(--mono)}.field-row{flex-wrap:wrap;gap:1rem;display:flex}.field-row>.field{flex:14rem;min-width:0}.check-line{cursor:pointer;align-items:center;gap:.4rem;font-size:.85rem;display:flex}.pico .check-line input[type=checkbox]{flex-shrink:0;width:1.25em;height:1.25em;margin:0}.row-list{flex-direction:column;gap:.3rem;display:flex}.line-row{align-items:center;gap:.3rem;display:flex}.pico .line-row input{flex:1;min-width:0}.line-row.dragging{opacity:.4}.line-row.dragover{box-shadow:inset 0 2px 0 var(--joy-accent,#5e81ac)}.arrows{gap:.2rem;display:inline-flex}.lr-handle{cursor:grab;color:var(--pico-muted-color);user-select:none;text-align:center;flex-shrink:0;width:.9rem}.kv-row{align-items:center;gap:.3rem;display:flex}.pico .kv-row input.k{flex:0 0 35%;min-width:5rem}.pico .kv-row input.v{flex:1;min-width:0}.qtype-grid{flex-wrap:wrap;gap:.3rem;display:flex}.qtype-chip{border-radius:var(--joy-radius,6px);background:var(--pico-secondary-background);height:1.4rem;font-family:var(--mono);color:var(--pico-secondary-inverse);cursor:pointer;user-select:none;border:1px solid #0000;align-items:center;padding:0 .6em;font-size:.78rem;transition:background-color .15s,color .15s;display:inline-flex}.pico .qtype-chip input{display:none}.qtype-chip.on{background:var(--joy-accent,#5e81ac);color:#fff}.upstream-block{border-top:1px solid var(--pico-muted-border-color);margin-bottom:.5rem;padding-top:.5rem}.upstream-block .ub-head{justify-content:space-between;align-items:center;margin-bottom:.5rem;display:flex}.upstream-block .ub-title{color:var(--pico-muted-color);font-size:.8rem}.pico details.adv{border-top:1px solid var(--pico-muted-border-color);margin-top:.75rem;padding-top:.75rem}.pico details.adv>summary{color:var(--joy-accent,#5e81ac);cursor:pointer;margin-bottom:.5rem;font-size:.85rem;font-weight:600}.pico details.adv>summary+*{margin-top:.5rem}.detail-actions{border-top:1px solid var(--pico-muted-border-color);flex-wrap:wrap;gap:.5rem;margin-top:1rem;padding-top:.75rem;display:flex}.empty{color:var(--pico-muted-color);text-align:center;flex-direction:column;align-items:center;gap:.25rem;padding:2rem 1rem;display:flex}.pico .empty p{margin:0}.empty-title{font-size:.9rem}.empty-hint{font-size:.85rem}:host(dns-card),:host(dns-card) .pico{background:0 0}.card-stats{flex-wrap:wrap;gap:.3em 1.1em;margin-bottom:.6em;font-size:.8em;display:flex}.card-stats .k{color:var(--pico-muted-color);margin-right:.3em}.card-stats .v{font-family:var(--mono)}.card-answer{font-family:var(--mono);word-break:break-all;font-size:.8em}.lookup-form.compact{--pico-form-element-spacing-vertical:.3em;--pico-form-element-spacing-horizontal:.55em;align-items:center;gap:.35em;margin-bottom:.5em}.pico .lookup-form.compact input[type=text],.pico .lookup-form.compact select,.pico .lookup-form.compact button{height:auto;font-size:.85em;line-height:var(--pico-line-height,1.5);padding:var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal)}.pico .lookup-form.compact input[type=text]{flex:7rem}.pico .lookup-form.compact select{flex:0 0 5.5rem}.key-prompt{max-width:26rem}.pico .key-prompt input{font-family:var(--mono)}@media (width<=640px){.master-detail{grid-template-columns:1fr}.master-detail[data-view=detail] .master,.master-detail[data-view=list] .detail{display:none}.pico .back-btn{display:inline-flex}}}", U = "dns.apiKey", W = class extends Error {
	constructor(e) {
		super(e === 403 ? "forbidden" : "unauthorized"), this.status = e, this.name = "AuthError";
	}
};
function ee() {
	try {
		return localStorage.getItem("dns.apiKey") || "";
	} catch {
		return "";
	}
}
function te(e) {
	try {
		e ? localStorage.setItem(U, e) : localStorage.removeItem(U);
	} catch {}
}
function ne(e) {
	let t = ee(), n = e.replace(/\/+$/, "");
	async function r(e, r) {
		let i = new Headers(r.headers);
		t && i.set("X-Api-Key", t);
		let a = await fetch(n + e, {
			...r,
			headers: i
		});
		if (a.status === 401 || a.status === 403) throw new W(a.status);
		let o = await a.text(), s = null;
		if (o) try {
			s = JSON.parse(o);
		} catch {
			s = { error: o.trim() };
		}
		return {
			status: a.status,
			data: s
		};
	}
	return {
		key: () => t,
		setKey(e) {
			t = e, te(e);
		},
		get: (e) => r(e, { method: "GET" }),
		postJSON: (e, t) => r(e, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(t)
		})
	};
}
// node_modules/preact/hooks/dist/hooks.mjs
var G, K, re, ie, ae = Object.is, q = 0, oe = [], se = [], J = e, ce = J.__b, le = J.__r, ue = J.diffed, de = J.__c, fe = J.unmount, pe = J.__;
function me(e, t) {
	J.__h && J.__h(K, e, q || t), q = 0;
	var n = K.__H || (K.__H = {
		__: [],
		__h: []
	});
	return e >= n.__.length && n.__.push({}), n.__[e];
}
function Y(e) {
	return q = 1, he(Te, e);
}
function he(e, t, n) {
	var r = me(G++, 2);
	if (r.t = e, !r.__c && (r.__ = [n ? n(t) : Te(void 0, t), function(e) {
		var t = (r.__N || r.__)[0], n = r.t(t, e);
		ae(t, n) || (r.__N = [n, r.__[1]], r.__c.setState({}));
	}], r.__c = K, !K.__f)) {
		K.__f = !0;
		var i = K.shouldComponentUpdate;
		K.shouldComponentUpdate = function(e, t, n) {
			var r = this.__H;
			if (!r) return !0;
			var a = !1, o = this.props != e;
			if (r.__.some(function(e) {
				e.__N && (a = !0, ae(e.__[0], e.__N[0]) || (o = !0));
			}), i) {
				var s = i.call(this, e, t, n);
				return a ? s || o : s;
			}
			return !a || o;
		};
	}
	return r.__;
}
function X(e, t) {
	var n = me(G++, 3);
	!J.__s && we(n.__H, t) && (n.__P = !0, n.__ = e, n.u = t, K.__H.__h.push(n));
}
function ge(e) {
	return q = 5, _e(function() {
		return { current: e };
	}, []);
}
function _e(e, t) {
	var n = me(G++, 7);
	return we(n.__H, t) && (n.__ = e(), n.__H = t), n.__;
}
function Z(e, t) {
	return q = 8, _e(function() {
		return e;
	}, t);
}
function ve() {
	var e;
	do {
		for (; e = se.shift();) try {
			Se(e);
		} catch (t) {
			J.__e(t, { __: (e = e.__P) && e.__v });
		}
		for (; e = oe.shift();) {
			var t = e.__H;
			if (e.__P && t) try {
				t.__h.some(Se), t.__h.some(Ce), t.__h = [];
			} catch (n) {
				t.__h = [], J.__e(n, e.__v);
			}
		}
	} while (se.length);
}
J.__b = function(e) {
	K = null, ce && ce(e);
}, J.__ = function(e, t) {
	e && t.__k && t.__k.__m && (e.__m = t.__k.__m), pe && pe(e, t);
}, J.__r = function(e) {
	le && le(e), G = 0;
	var t = (K = e.__c).__H;
	t && (re == K ? K.__h = [] : (t.__h.some(Se), t.__h.some(Ce), G = 0), t.__h = [], t.__.some(function(e) {
		e.__N && (e.__ = e.__N), e.u = e.__N = void 0;
	})), re = K;
}, J.diffed = function(e) {
	ue && ue(e);
	var t = e.__c;
	t && t.__H && (t.__H.__h.length && xe(oe.push(t)), t.__H.__.some(function(e) {
		e.u && (e.__H = e.u);
	})), re = K = null;
}, J.__c = function(e, t) {
	t.some(function(e) {
		try {
			e.__h.some(Se), e.__h = e.__h.filter(function(e) {
				return !e.__ || Ce(e);
			});
		} catch (t) {
			e.__h = [function() {
				throw t;
			}];
		}
	}), de && de(e, t);
}, J.unmount = function(e) {
	fe && fe(e);
	var t, n, r = e.__c;
	r && r.__H && (r.__H.__.some(function(r) {
		try {
			if (r.__P && r.__c) {
				if (n === void 0) {
					for (n = e.__; n && (!n.__c || !n.__c.__P);) n = n.__;
					n &&= n.__c;
				}
				r.__P = n, xe(se.push(r));
			} else Se(r);
		} catch (e) {
			t = e;
		}
	}), r.__H = void 0, t && J.__e(t, r.__v));
};
var ye = typeof requestAnimationFrame == "function";
function be(e) {
	var t, n = function() {
		clearTimeout(r), ye && cancelAnimationFrame(t), setTimeout(e);
	}, r = setTimeout(n, 35);
	ye && (t = requestAnimationFrame(n));
}
function xe(e) {
	e != 1 && ie == J.requestAnimationFrame || ((ie = J.requestAnimationFrame) || be)(ve);
}
function Se(e) {
	var t = K, n = e.__c;
	typeof n == "function" && (e.__c = void 0, n()), K = t;
}
function Ce(e) {
	var t = K;
	e.__c = e.__(), K = t;
}
function we(e, t) {
	return !e || e.length != t.length || t.some(function(t, n) {
		return !ae(t, e[n]);
	});
}
function Te(e, t) {
	return typeof t == "function" ? t(e) : t;
}
// src/dns.ts
var Ee = {
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
}, De = [
	"A",
	"AAAA",
	"CNAME",
	"MX",
	"TXT",
	"NS",
	"SOA",
	"PTR",
	"SRV",
	"CAA"
];
function Oe(e) {
	return Ee[e] || `TYPE${e}`;
}
function ke(e, t) {
	switch (t) {
		case 1: return e.A || "";
		case 28: return e.AAAA || e.Aaaa || "";
		case 5: return e.Cname || e.Target || "";
		case 15: return (e.Preference == null ? "" : e.Preference + " ") + (e.Mx || "");
		case 16: return Array.isArray(e.Txt) ? e.Txt.join(" ") : e.Txt || "";
		case 2: return e.Ns || "";
		case 6: return [
			e.Ns,
			e.Mbox,
			"serial=" + (e.Serial || ""),
			"refresh=" + (e.Refresh || ""),
			"retry=" + (e.Retry || ""),
			"expire=" + (e.Expire || ""),
			"minttl=" + (e.Minttl || "")
		].filter(Boolean).join(" ");
		case 12: return e.Ptr || "";
		case 33: return `${e.Priority || 0} ${e.Weight || 0} ${e.Port || 0} ${e.Target || ""}`;
		case 257: return (e.Flag == null ? "" : e.Flag + " ") + (e.Tag ? e.Tag + " " : "") + (e.Value || "");
		default: try {
			return JSON.stringify(e);
		} catch {
			return String(e);
		}
	}
}
function Ae(e) {
	return (e && Array.isArray(e.Answer) ? e.Answer : []).map((e) => {
		let t = e.Hdr || {}, n = t.Rrtype || 0;
		return {
			name: t.Name || "",
			type: Oe(n),
			ttl: t.Ttl == null ? "" : String(t.Ttl),
			value: ke(e, n)
		};
	});
}
function je(e) {
	if (e == null) return "";
	if (typeof e == "string") return e;
	if (typeof e == "object" && "message" in e && e.message) return String(e.message);
	try {
		return JSON.stringify(e);
	} catch {
		return String(e);
	}
}
// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var Me = Symbol.for("pv"), Ne = 0;
Array.isArray;
function Q(t, n, r, i, a, o) {
	n ||= {};
	var s, c, l = n;
	if ("ref" in l && typeof t != "function") for (c in l = {}, n) c == "ref" ? s = n[c] : l[c] = n[c];
	var u = {
		type: t,
		props: l,
		key: r,
		ref: s,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: Me,
		__v: --Ne,
		__i: -1,
		__u: 0
	};
	return (a || o) && (u.__source = a, u.__self = o), e.vnode && e.vnode(u), u;
}
// src/ui.tsx
function Pe({ label: e }) {
	return /* @__PURE__ */ Q("span", {
		class: "row",
		children: [
			/* @__PURE__ */ Q("span", { class: "spinner" }),
			" ",
			e ? /* @__PURE__ */ Q("span", {
				class: "muted tiny",
				children: e
			}) : null
		]
	});
}
function $({ title: e, detail: t }) {
	return /* @__PURE__ */ Q("div", {
		class: "notice notice-err",
		children: [/* @__PURE__ */ Q("strong", { children: e }), t ? /* @__PURE__ */ Q("code", { children: t }) : null]
	});
}
function Fe({ text: e }) {
	return /* @__PURE__ */ Q("div", {
		class: "notice notice-ok",
		children: e
	});
}
function Ie({ title: e, hint: t }) {
	return /* @__PURE__ */ Q("div", {
		class: "empty",
		children: [/* @__PURE__ */ Q("p", {
			class: "empty-title",
			children: e
		}), t ? /* @__PURE__ */ Q("p", {
			class: "empty-hint",
			children: t
		}) : null]
	});
}
function Le({ api: e, onSubmit: t }) {
	let [n, r] = Y(e.key());
	return /* @__PURE__ */ Q("form", {
		class: "key-prompt",
		onSubmit: (r) => {
			r.preventDefault(), e.setKey(n.trim()), t();
		},
		children: [
			/* @__PURE__ */ Q("div", {
				class: "notice notice-warn",
				style: "margin-bottom:.75rem",
				children: [/* @__PURE__ */ Q("strong", { children: "需要 API key" }), /* @__PURE__ */ Q("code", { children: "服务端配置了 api_key，请求需带 X-Api-Key。填入后会存在本浏览器。" })]
			}),
			/* @__PURE__ */ Q("div", {
				class: "field",
				children: [/* @__PURE__ */ Q("label", { children: "API key" }), /* @__PURE__ */ Q("input", {
					type: "password",
					value: n,
					autocomplete: "off",
					spellcheck: !1,
					onInput: (e) => r(e.target.value),
					placeholder: "config.yaml 里的 api_key"
				})]
			}),
			/* @__PURE__ */ Q("button", {
				type: "submit",
				children: "保存并重试"
			})
		]
	});
}
// src/Lookup.tsx
function Re({ api: e, onAuthRequired: t, compact: n }) {
	let [r, i] = Y(""), [a, o] = Y("A"), [s, c] = Y(!1), [l, u] = Y(null), [d, f] = Y("");
	async function p(n) {
		n.preventDefault();
		let i = r.trim();
		if (i) {
			c(!0), f(""), u(null);
			try {
				let { status: t, data: n } = await e.get(`/query?question=${encodeURIComponent(i)}&type=${encodeURIComponent(a)}`);
				if (t !== 200) {
					f(`HTTP ${t}${n && n.error ? " — " + je(n.error) : ""}`);
					return;
				}
				u({
					resolver: n?.resolver,
					queryError: n?.error ? je(n.error) : void 0,
					rows: Ae(n?.answer)
				});
			} catch (e) {
				if (e instanceof W) {
					t();
					return;
				}
				f(e instanceof Error ? e.message : String(e));
			} finally {
				c(!1);
			}
		}
	}
	function m() {
		u(null), f("");
	}
	let h = De.map((e) => /* @__PURE__ */ Q("option", {
		value: e,
		children: e
	}, e));
	return n ? /* @__PURE__ */ Q("div", { children: [
		/* @__PURE__ */ Q("form", {
			class: "lookup-form compact",
			onSubmit: p,
			children: [
				/* @__PURE__ */ Q("input", {
					type: "text",
					value: r,
					placeholder: "example.com",
					autocomplete: "off",
					spellcheck: !1,
					onInput: (e) => i(e.target.value)
				}),
				/* @__PURE__ */ Q("select", {
					value: a,
					onChange: (e) => o(e.target.value),
					children: h
				}),
				/* @__PURE__ */ Q("button", {
					type: "submit",
					class: "outline",
					disabled: s,
					children: "查询"
				})
			]
		}),
		s ? /* @__PURE__ */ Q(Pe, { label: "查询中…" }) : null,
		d ? /* @__PURE__ */ Q($, {
			title: "请求失败",
			detail: d
		}) : null,
		l ? /* @__PURE__ */ Q(ze, {
			result: l,
			compact: !0
		}) : null
	] }) : /* @__PURE__ */ Q(y, { children: [/* @__PURE__ */ Q("section", {
		class: "section section-lookup",
		children: [/* @__PURE__ */ Q("div", {
			class: "section-head",
			children: /* @__PURE__ */ Q("h2", {
				class: "section-title",
				children: "查询"
			})
		}), /* @__PURE__ */ Q("form", {
			class: "lookup-form",
			onSubmit: p,
			children: [
				/* @__PURE__ */ Q("div", {
					class: "lf-field lf-domain",
					children: [/* @__PURE__ */ Q("label", {
						for: "lookup-domain",
						children: "域名"
					}), /* @__PURE__ */ Q("input", {
						id: "lookup-domain",
						type: "text",
						value: r,
						placeholder: "example.com",
						autocomplete: "off",
						spellcheck: !1,
						onInput: (e) => i(e.target.value)
					})]
				}),
				/* @__PURE__ */ Q("div", {
					class: "lf-field lf-type",
					children: [/* @__PURE__ */ Q("label", {
						for: "lookup-type",
						children: "类型"
					}), /* @__PURE__ */ Q("select", {
						id: "lookup-type",
						value: a,
						onChange: (e) => o(e.target.value),
						children: h
					})]
				}),
				/* @__PURE__ */ Q("button", {
					type: "submit",
					disabled: s,
					"aria-busy": s,
					children: "查询"
				})
			]
		})]
	}), s || d || l ? /* @__PURE__ */ Q("section", {
		class: "section section-result",
		children: [
			/* @__PURE__ */ Q("div", {
				class: "section-head",
				children: [/* @__PURE__ */ Q("h2", {
					class: "section-title",
					children: "结果"
				}), /* @__PURE__ */ Q("span", {
					class: "section-actions",
					children: [l?.resolver ? /* @__PURE__ */ Q("span", {
						class: "head-note",
						children: ["命中 ", /* @__PURE__ */ Q("span", {
							class: "badge mono",
							children: l.resolver
						})]
					}) : null, /* @__PURE__ */ Q("button", {
						type: "button",
						class: "secondary",
						disabled: s,
						onClick: m,
						children: "清除"
					})]
				})]
			}),
			s ? /* @__PURE__ */ Q(Pe, { label: "查询中…" }) : null,
			d ? /* @__PURE__ */ Q($, {
				title: "请求失败",
				detail: d
			}) : null,
			l ? /* @__PURE__ */ Q(ze, {
				result: l,
				compact: !1
			}) : null
		]
	}) : null] });
}
function ze({ result: e, compact: t }) {
	return /* @__PURE__ */ Q("div", { children: [
		t && e.resolver ? /* @__PURE__ */ Q("p", {
			class: "row tiny",
			style: "margin-bottom:.5rem",
			children: [/* @__PURE__ */ Q("span", {
				class: "muted",
				children: "Resolver"
			}), /* @__PURE__ */ Q("span", {
				class: "badge",
				children: e.resolver
			})]
		}) : null,
		e.queryError ? /* @__PURE__ */ Q($, {
			title: "解析失败",
			detail: e.queryError
		}) : null,
		!e.queryError && e.rows.length === 0 ? t ? /* @__PURE__ */ Q("p", {
			class: "muted tiny",
			children: "没有记录"
		}) : /* @__PURE__ */ Q(Ie, {
			title: "没有记录",
			hint: "换个记录类型，或确认该域名确实有此类记录"
		}) : null,
		!e.queryError && e.rows.length > 0 ? t ? /* @__PURE__ */ Q("p", {
			class: "card-answer",
			children: e.rows.map((e) => e.value).filter(Boolean).join(", ")
		}) : /* @__PURE__ */ Q("div", {
			class: "table-wrap",
			children: /* @__PURE__ */ Q("table", {
				class: "answers",
				children: [/* @__PURE__ */ Q("thead", { children: /* @__PURE__ */ Q("tr", { children: [
					/* @__PURE__ */ Q("th", { children: "名称" }),
					/* @__PURE__ */ Q("th", { children: "类型" }),
					/* @__PURE__ */ Q("th", {
						class: "num",
						children: "TTL"
					}),
					/* @__PURE__ */ Q("th", { children: "值" })
				] }) }), /* @__PURE__ */ Q("tbody", { children: e.rows.map((e, t) => /* @__PURE__ */ Q("tr", { children: [
					/* @__PURE__ */ Q("td", {
						title: e.name,
						children: e.name
					}),
					/* @__PURE__ */ Q("td", { children: /* @__PURE__ */ Q("span", {
						class: "badge",
						children: e.type
					}) }),
					/* @__PURE__ */ Q("td", {
						class: "num muted",
						children: e.ttl
					}),
					/* @__PURE__ */ Q("td", { children: e.value })
				] }, t)) })]
			})
		}) : null
	] });
}
// src/Card.tsx
function Be({ api: e }) {
	let [t, n] = Y(null), [r, i] = Y(""), [a, o] = Y(!0), [s, c] = Y(!1), [l, u] = Y(0), d = Z(() => c(!0), []);
	return X(() => {
		let t = !1;
		return o(!0), i(""), e.get("/config").then(({ status: e, data: r }) => {
			if (t) return;
			if (e !== 200) {
				i(`HTTP ${e}`);
				return;
			}
			let a = r?.config || {};
			n({
				addr: a.addr || "",
				http: a.http || "",
				ttl: a.ttl || "",
				resolverCount: Array.isArray(a.resolvers) ? a.resolvers.length : 0
			});
		}).catch((e) => {
			t || (e instanceof W ? c(!0) : i(e instanceof Error ? e.message : String(e)));
		}).finally(() => {
			t || o(!1);
		}), () => {
			t = !0;
		};
	}, [e, l]), s ? /* @__PURE__ */ Q(Le, {
		api: e,
		onSubmit: () => {
			c(!1), u((e) => e + 1);
		}
	}) : /* @__PURE__ */ Q("div", { children: [
		a ? /* @__PURE__ */ Q(Pe, { label: "加载中…" }) : null,
		r ? /* @__PURE__ */ Q($, {
			title: "状态不可用",
			detail: r
		}) : null,
		t ? /* @__PURE__ */ Q("div", {
			class: "card-stats",
			children: [
				/* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q("span", {
					class: "k",
					children: "resolvers"
				}), /* @__PURE__ */ Q("span", {
					class: "v",
					children: t.resolverCount
				})] }),
				/* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q("span", {
					class: "k",
					children: "dns"
				}), /* @__PURE__ */ Q("span", {
					class: "v",
					children: t.addr || "—"
				})] }),
				/* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q("span", {
					class: "k",
					children: "http"
				}), /* @__PURE__ */ Q("span", {
					class: "v",
					children: t.http || "—"
				})] }),
				/* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q("span", {
					class: "k",
					children: "ttl"
				}), /* @__PURE__ */ Q("span", {
					class: "v",
					children: t.ttl || "—"
				})] })
			]
		}) : null,
		/* @__PURE__ */ Q(Re, {
			api: e,
			onAuthRequired: d,
			compact: !0
		}, `card-lookup-${l}`)
	] });
}
// src/resolvers.ts
var Ve = [
	"forward",
	"forward-group",
	"preloader",
	"filter",
	"mock",
	"file"
], He = [
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
], Ue = [
	"forward",
	"forward-group",
	"preloader",
	"filter",
	"mock"
], We = [
	"forward",
	"forward-group",
	"preloader"
];
function Ge(e) {
	switch (e) {
		case "forward": return {
			name: "",
			type: "forward",
			url: "",
			rule: []
		};
		case "forward-group": return {
			name: "",
			type: "forward-group",
			rule: [],
			upstreams: [{ url: "" }]
		};
		case "preloader": return {
			name: "",
			type: "preloader",
			url: "",
			rule: []
		};
		case "filter": return {
			name: "",
			type: "filter",
			queryType: [],
			rule: []
		};
		case "mock": return {
			name: "",
			type: "mock",
			queryType: ["A"],
			rule: [],
			answer: ""
		};
		case "file": return {
			type: "file",
			fileType: "host",
			location: "",
			refreshInterval: "10m"
		};
		default: return { type: e };
	}
}
var Ke = "__id";
function qe(e) {
	e.config && typeof e.config == "object" && (e.config = { ...e.config }, Array.isArray(e.config.serverIP) && (e.config.serverIP = e.config.serverIP.map((e) => (e || "").trim()).filter((e) => e !== ""), e.config.serverIP.length === 0 && delete e.config.serverIP), typeof e.config.timeout == "string" && e.config.timeout.trim() === "" && delete e.config.timeout, Object.keys(e.config).length === 0 && delete e.config);
}
function Je(e) {
	return e.map((e) => {
		let t = {};
		for (let n of Object.keys(e)) n !== "__id" && (t[n] = e[n]);
		return Array.isArray(t.rule) && (t.rule = t.rule.map((e) => (e == null ? "" : String(e)).trim()).filter((e) => e !== "")), qe(t), Array.isArray(t.upstreams) && (t.upstreams = t.upstreams.map((e) => {
			let t = { ...e };
			return qe(t), t;
		})), t.extraConfig && typeof t.extraConfig == "object" && Object.keys(t.extraConfig).length === 0 && delete t.extraConfig, t;
	});
}
function Ye(e) {
	return e.name || `(${e.type || "?"})`;
}
// src/ResolverForm.tsx
var Xe = 0;
function Ze(e) {
	return !e.extraConfig || typeof e.extraConfig != "object" ? [] : Object.keys(e.extraConfig).map((t) => ({
		id: ++Xe,
		k: t,
		v: e.extraConfig[t]
	}));
}
function Qe(e) {
	let { resolver: t, onChange: n } = e, r = String(t.type || ""), [i, a] = Y(-1), [o, s] = Y(-1), [c, l] = Y(() => Ze(t)), u = (e, r) => {
		t[e] = r, n();
	}, d = (e, r) => {
		r === "" || r == null ? delete t[e] : t[e] = r, n();
	}, f = (e) => {
		e.config && Object.keys(e.config).length === 0 && delete e.config;
	}, p = Array.isArray(t.rule) ? t.rule : [], m = () => {
		Array.isArray(t.rule) || (t.rule = []), t.rule.push(""), n();
	}, h = (e, r) => {
		Array.isArray(t.rule) && (t.rule[e] = r), n();
	}, g = (e) => {
		Array.isArray(t.rule) && t.rule.splice(e, 1), n();
	}, _ = (e, r) => {
		if (!Array.isArray(t.rule)) return;
		let i = e + r;
		if (i < 0 || i >= t.rule.length) return;
		let a = t.rule[e];
		t.rule[e] = t.rule[i], t.rule[i] = a, n();
	}, v = (e) => {
		if (i >= 0 && Array.isArray(t.rule) && i !== e) {
			let r = t.rule.splice(i, 1)[0];
			t.rule.splice(e, 0, r), n();
		}
		a(-1), s(-1);
	}, b = (e) => Array.isArray(t.queryType) && t.queryType.includes(e), x = (e) => {
		Array.isArray(t.queryType) || (t.queryType = []);
		let r = t.queryType.indexOf(e);
		r >= 0 ? t.queryType.splice(r, 1) : t.queryType.push(e), n();
	}, S = (e, t) => {
		e.config ||= {}, t === "" ? delete e.config.timeout : e.config.timeout = t, f(e), n();
	}, C = (e) => e.config && Array.isArray(e.config.serverIP) ? e.config.serverIP : [], w = (e) => {
		e.config ||= {}, Array.isArray(e.config.serverIP) || (e.config.serverIP = []), e.config.serverIP.push(""), n();
	}, T = (e, t, r) => {
		e.config && Array.isArray(e.config.serverIP) && (e.config.serverIP[t] = r), n();
	}, E = (e, t) => {
		e.config && Array.isArray(e.config.serverIP) && (e.config.serverIP.splice(t, 1), e.config.serverIP.length === 0 && delete e.config.serverIP, f(e)), n();
	}, D = Array.isArray(t.upstreams) ? t.upstreams : [], O = () => {
		Array.isArray(t.upstreams) || (t.upstreams = []), t.upstreams.push({ url: "" }), n();
	}, k = (e) => {
		Array.isArray(t.upstreams) && t.upstreams.splice(e, 1), n();
	}, A = (e) => {
		l(e);
		let r = {};
		e.forEach((e) => {
			e.k !== "" && (r[e.k] = e.v);
		}), Object.keys(r).length ? t.extraConfig = r : delete t.extraConfig, n();
	}, j = () => A([...c, {
		id: ++Xe,
		k: "",
		v: ""
	}]), M = (e, t) => A(c.map((n, r) => r === e ? {
		...n,
		k: t
	} : n)), N = (e, t) => A(c.map((n, r) => r === e ? {
		...n,
		v: t
	} : n)), P = (e) => A(c.filter((t, n) => n !== e)), F = (() => {
		let e = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set();
		return c.forEach((n) => {
			n.k !== "" && (e.has(n.k) && t.add(n.k), e.add(n.k));
		}), [...t];
	})(), I = /* @__PURE__ */ Q("div", {
		class: "field-row",
		children: [/* @__PURE__ */ Q("div", {
			class: "field",
			children: [/* @__PURE__ */ Q("label", { children: ["nftset ", /* @__PURE__ */ Q("span", {
				class: "hint",
				children: "nftables set 名"
			})] }), /* @__PURE__ */ Q("input", {
				type: "text",
				value: t.nftset || "",
				placeholder: "corp4",
				onInput: (e) => d("nftset", e.target.value)
			})]
		}), /* @__PURE__ */ Q("div", {
			class: "field",
			children: [/* @__PURE__ */ Q("label", { children: "nftset_ttl" }), /* @__PURE__ */ Q("input", {
				type: "text",
				value: t.nftset_ttl || "",
				placeholder: "1h",
				onInput: (e) => d("nftset_ttl", e.target.value)
			})]
		})]
	});
	return /* @__PURE__ */ Q("div", { children: [
		/* @__PURE__ */ Q("div", {
			class: "detail-head",
			children: [
				/* @__PURE__ */ Q("button", {
					class: "secondary back-btn",
					onClick: e.onBack,
					children: "← 返回"
				}),
				/* @__PURE__ */ Q("span", {
					class: "detail-name",
					children: t.name || "(unnamed)"
				}),
				/* @__PURE__ */ Q("span", {
					class: "badge",
					children: r
				})
			]
		}),
		r === "file" ? null : /* @__PURE__ */ Q("div", {
			class: "field",
			children: [/* @__PURE__ */ Q("label", { children: ["name ", /* @__PURE__ */ Q("span", {
				class: "hint",
				children: "可选标签"
			})] }), /* @__PURE__ */ Q("input", {
				type: "text",
				value: t.name || "",
				placeholder: "(unnamed)",
				onInput: (e) => u("name", e.target.value)
			})]
		}),
		We.includes(r) ? /* @__PURE__ */ Q(y, { children: [/* @__PURE__ */ Q("div", {
			class: "field",
			children: [/* @__PURE__ */ Q("label", { children: ["ttl ", /* @__PURE__ */ Q("span", {
				class: "hint",
				children: "缓存时长，如 600s / 5m；留空用全局 ttl"
			})] }), /* @__PURE__ */ Q("input", {
				type: "text",
				value: t.ttl || "",
				placeholder: "(use global ttl)",
				onInput: (e) => d("ttl", e.target.value)
			})]
		}), /* @__PURE__ */ Q("div", {
			class: "field",
			children: /* @__PURE__ */ Q("label", {
				class: "check-line",
				children: [
					/* @__PURE__ */ Q("input", {
						type: "checkbox",
						checked: !!t["break-on-fail"],
						onChange: (e) => u("break-on-fail", e.target.checked)
					}),
					"break-on-fail ",
					/* @__PURE__ */ Q("span", {
						class: "hint",
						children: "失败即中断 resolver 链"
					})
				]
			})
		})] }) : null,
		r === "forward" || r === "preloader" ? /* @__PURE__ */ Q("div", {
			class: "field",
			children: [/* @__PURE__ */ Q("label", { children: ["url ", /* @__PURE__ */ Q("span", {
				class: "hint",
				children: "上游：IP、IP:port、https://…(DoH)、tls://…(DoT)"
			})] }), /* @__PURE__ */ Q("input", {
				type: "text",
				value: t.url || "",
				placeholder: "114.114.114.114",
				onInput: (e) => u("url", e.target.value)
			})]
		}) : null,
		r === "forward-group" ? /* @__PURE__ */ Q("div", {
			class: "field",
			children: [
				/* @__PURE__ */ Q("label", { children: ["upstreams ", /* @__PURE__ */ Q("span", {
					class: "hint",
					children: "并发竞速，最先成功者胜出"
				})] }),
				D.map((e, t) => /* @__PURE__ */ Q("div", {
					class: "upstream-block",
					children: [
						/* @__PURE__ */ Q("div", {
							class: "ub-head",
							children: [/* @__PURE__ */ Q("span", {
								class: "ub-title",
								children: ["upstream ", t + 1]
							}), /* @__PURE__ */ Q("button", {
								class: "btn-inline secondary",
								title: "移除 upstream",
								onClick: () => k(t),
								children: "✕"
							})]
						}),
						/* @__PURE__ */ Q("div", {
							class: "field",
							children: [/* @__PURE__ */ Q("label", { children: "url" }), /* @__PURE__ */ Q("input", {
								type: "text",
								value: e.url || "",
								placeholder: "https://dns.google/dns-query",
								onInput: (t) => {
									e.url = t.target.value, n();
								}
							})]
						}),
						/* @__PURE__ */ Q("div", {
							class: "field",
							children: [/* @__PURE__ */ Q("label", { children: "config.timeout" }), /* @__PURE__ */ Q("input", {
								type: "text",
								value: e.config && e.config.timeout || "",
								placeholder: "3s",
								onInput: (t) => S(e, t.target.value)
							})]
						}),
						/* @__PURE__ */ Q("div", {
							class: "field",
							style: "margin-bottom:0",
							children: [/* @__PURE__ */ Q("label", { children: ["config.serverIP ", /* @__PURE__ */ Q("span", {
								class: "hint",
								children: "bootstrap IP"
							})] }), /* @__PURE__ */ Q("div", {
								class: "row-list",
								children: [C(e).map((t, n) => /* @__PURE__ */ Q("div", {
									class: "line-row",
									children: [/* @__PURE__ */ Q("input", {
										type: "text",
										value: t,
										placeholder: "8.8.8.8",
										onInput: (t) => T(e, n, t.target.value)
									}), /* @__PURE__ */ Q("button", {
										class: "btn-inline secondary",
										title: "移除",
										onClick: () => E(e, n),
										children: "✕"
									})]
								}, n)), /* @__PURE__ */ Q("button", {
									class: "add-line",
									onClick: () => w(e),
									children: "+ serverIP"
								})]
							})]
						})
					]
				}, t)),
				/* @__PURE__ */ Q("button", {
					class: "add-line",
					onClick: O,
					children: "+ 添加 upstream"
				})
			]
		}) : null,
		Ue.includes(r) ? /* @__PURE__ */ Q("div", {
			class: "field",
			children: [/* @__PURE__ */ Q("label", { children: ["rule ", /* @__PURE__ */ Q("span", {
				class: "hint",
				children: "一行一条 · 支持 v2fly:cn、include:…、!黑名单、keyword:、regexp:"
			})] }), /* @__PURE__ */ Q("div", {
				class: "row-list",
				children: [
					p.length === 0 ? /* @__PURE__ */ Q("p", {
						class: "muted tiny",
						style: "margin:0",
						children: "没有规则 —— 该 resolver 会接下它作用域内的全部查询。"
					}) : null,
					p.map((e, t) => /* @__PURE__ */ Q("div", {
						class: `line-row${i === t ? " dragging" : ""}${o === t ? " dragover" : ""}`,
						onDragOver: (e) => {
							e.preventDefault(), s(t);
						},
						onDragLeave: () => s((e) => e === t ? -1 : e),
						onDrop: (e) => {
							e.preventDefault(), v(t);
						},
						children: [
							/* @__PURE__ */ Q("span", {
								class: "lr-handle",
								title: "拖动排序",
								draggable: !0,
								onDragStart: (e) => {
									a(t), e.dataTransfer && (e.dataTransfer.effectAllowed = "move");
								},
								onDragEnd: () => {
									a(-1), s(-1);
								},
								children: "∷"
							}),
							/* @__PURE__ */ Q("input", {
								type: "text",
								value: e,
								spellcheck: !1,
								placeholder: "example.com / v2fly:cn / !blocked.com",
								onInput: (e) => h(t, e.target.value)
							}),
							/* @__PURE__ */ Q("span", {
								class: "arrows",
								children: [/* @__PURE__ */ Q("button", {
									class: "btn-inline secondary",
									title: "上移",
									disabled: t === 0,
									onClick: () => _(t, -1),
									children: "↑"
								}), /* @__PURE__ */ Q("button", {
									class: "btn-inline secondary",
									title: "下移",
									disabled: t === p.length - 1,
									onClick: () => _(t, 1),
									children: "↓"
								})]
							}),
							/* @__PURE__ */ Q("button", {
								class: "btn-inline secondary",
								title: "删除规则",
								onClick: () => g(t),
								children: "✕"
							})
						]
					}, t)),
					/* @__PURE__ */ Q("button", {
						class: "add-line",
						onClick: m,
						children: "+ 添加规则"
					})
				]
			})]
		}) : null,
		r === "filter" || r === "mock" ? /* @__PURE__ */ Q("div", {
			class: "field",
			children: [/* @__PURE__ */ Q("label", { children: ["queryType ", /* @__PURE__ */ Q("span", {
				class: "hint",
				children: "匹配这些记录类型（空 = 全部）"
			})] }), /* @__PURE__ */ Q("div", {
				class: "qtype-grid",
				children: He.map((e) => /* @__PURE__ */ Q("label", {
					class: `qtype-chip${b(e) ? " on" : ""}`,
					children: [/* @__PURE__ */ Q("input", {
						type: "checkbox",
						checked: b(e),
						onChange: () => x(e)
					}), /* @__PURE__ */ Q("span", { children: e })]
				}, e))
			})]
		}) : null,
		r === "mock" ? /* @__PURE__ */ Q("div", {
			class: "field",
			children: [/* @__PURE__ */ Q("label", { children: ["answer ", /* @__PURE__ */ Q("span", {
				class: "hint",
				children: "命中时返回的固定 IP"
			})] }), /* @__PURE__ */ Q("input", {
				type: "text",
				value: t.answer || "",
				placeholder: "192.168.1.1",
				onInput: (e) => u("answer", e.target.value)
			})]
		}) : null,
		r === "file" ? /* @__PURE__ */ Q(y, { children: [
			/* @__PURE__ */ Q("div", {
				class: "field-row",
				children: [/* @__PURE__ */ Q("div", {
					class: "field",
					children: [/* @__PURE__ */ Q("label", { children: "fileType" }), /* @__PURE__ */ Q("select", {
						value: t.fileType || "host",
						onChange: (e) => u("fileType", e.target.value),
						children: [/* @__PURE__ */ Q("option", {
							value: "host",
							children: "host"
						}), /* @__PURE__ */ Q("option", {
							value: "lease",
							children: "lease"
						})]
					})]
				}), /* @__PURE__ */ Q("div", {
					class: "field",
					children: [/* @__PURE__ */ Q("label", { children: "refreshInterval" }), /* @__PURE__ */ Q("input", {
						type: "text",
						value: t.refreshInterval || "",
						placeholder: "10m",
						onInput: (e) => d("refreshInterval", e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ Q("div", {
				class: "field",
				children: [
					/* @__PURE__ */ Q("label", { children: ["location ", /* @__PURE__ */ Q("span", {
						class: "hint",
						children: "保存时会校验路径"
					})] }),
					/* @__PURE__ */ Q("input", {
						type: "text",
						value: t.location || "",
						placeholder: "/tmp/dhcp.leases 或 system",
						onInput: (e) => u("location", e.target.value)
					}),
					(t.location || "") === "system" ? /* @__PURE__ */ Q("div", {
						class: "notice notice-warn",
						style: "margin-top:.4rem",
						children: [/* @__PURE__ */ Q("strong", { children: "system" }), " = 读操作系统 hosts 文件。非 system 的路径必须在磁盘上存在， 否则保存会被拒（409）。"]
					}) : null
				]
			}),
			/* @__PURE__ */ Q("details", {
				class: "adv",
				children: [
					/* @__PURE__ */ Q("summary", { children: "Advanced · extraContent / extraConfig" }),
					/* @__PURE__ */ Q("div", {
						class: "field",
						children: [/* @__PURE__ */ Q("label", { children: ["extraContent ", /* @__PURE__ */ Q("span", {
							class: "hint",
							children: "内联的 host/lease 行"
						})] }), /* @__PURE__ */ Q("textarea", {
							rows: 4,
							value: t.extraContent || "",
							placeholder: "1.1.1.1 a.com b.com",
							onInput: (e) => d("extraContent", e.target.value)
						})]
					}),
					/* @__PURE__ */ Q("div", {
						class: "field",
						children: [
							/* @__PURE__ */ Q("label", { children: ["extraConfig ", /* @__PURE__ */ Q("span", {
								class: "hint",
								children: "key → value（如 domain → lan）"
							})] }),
							/* @__PURE__ */ Q("div", {
								class: "row-list",
								children: [c.map((e, t) => /* @__PURE__ */ Q("div", {
									class: "kv-row",
									children: [
										/* @__PURE__ */ Q("input", {
											class: "k",
											type: "text",
											value: e.k,
											spellcheck: !1,
											placeholder: "key",
											onInput: (e) => M(t, e.target.value)
										}),
										/* @__PURE__ */ Q("input", {
											class: "v",
											type: "text",
											value: e.v,
											spellcheck: !1,
											placeholder: "value",
											onInput: (e) => N(t, e.target.value)
										}),
										/* @__PURE__ */ Q("button", {
											class: "btn-inline secondary",
											title: "移除",
											onClick: () => P(t),
											children: "✕"
										})
									]
								}, e.id)), /* @__PURE__ */ Q("button", {
									class: "add-line",
									onClick: j,
									children: "+ key/value"
								})]
							}),
							c.some((e) => e.k === "") ? /* @__PURE__ */ Q("p", {
								class: "muted tiny",
								style: "margin:.35rem 0 0",
								children: "key 为空的行不会被保存。"
							}) : null,
							F.length ? /* @__PURE__ */ Q("div", {
								class: "notice notice-warn",
								style: "margin-top:.4rem",
								children: [/* @__PURE__ */ Q("strong", { children: ["重复的 key：", F.join("、")] }), /* @__PURE__ */ Q("code", { children: "同名 key 只会保留最后一行的值，请改名或删掉多余的行。" })]
							}) : null
						]
					})
				]
			})
		] }) : null,
		r === "forward" || r === "preloader" ? /* @__PURE__ */ Q("details", {
			class: "adv",
			children: [
				/* @__PURE__ */ Q("summary", { children: "Advanced · timeout / serverIP / nftset" }),
				/* @__PURE__ */ Q("div", {
					class: "field",
					children: [/* @__PURE__ */ Q("label", { children: "config.timeout" }), /* @__PURE__ */ Q("input", {
						type: "text",
						value: t.config && t.config.timeout || "",
						placeholder: "3s",
						onInput: (e) => S(t, e.target.value)
					})]
				}),
				/* @__PURE__ */ Q("div", {
					class: "field",
					children: [/* @__PURE__ */ Q("label", { children: ["config.serverIP ", /* @__PURE__ */ Q("span", {
						class: "hint",
						children: "DoH/DoT 的 bootstrap IP"
					})] }), /* @__PURE__ */ Q("div", {
						class: "row-list",
						children: [C(t).map((e, n) => /* @__PURE__ */ Q("div", {
							class: "line-row",
							children: [/* @__PURE__ */ Q("input", {
								type: "text",
								value: e,
								placeholder: "8.8.8.8",
								onInput: (e) => T(t, n, e.target.value)
							}), /* @__PURE__ */ Q("button", {
								class: "btn-inline secondary",
								title: "移除",
								onClick: () => E(t, n),
								children: "✕"
							})]
						}, n)), /* @__PURE__ */ Q("button", {
							class: "add-line",
							onClick: () => w(t),
							children: "+ serverIP"
						})]
					})]
				}),
				I
			]
		}) : null,
		r === "forward-group" || r === "file" ? /* @__PURE__ */ Q("details", {
			class: "adv",
			children: [/* @__PURE__ */ Q("summary", { children: "Advanced · nftset" }), I]
		}) : null,
		/* @__PURE__ */ Q("div", {
			class: "detail-actions",
			children: /* @__PURE__ */ Q("button", {
				class: "btn-danger",
				onClick: e.onDelete,
				children: "删除该 resolver"
			})
		})
	] });
}
// src/Config.tsx
var $e = 0;
function et({ api: e, onAuthRequired: t, onDirtyChange: n, retryToken: r, children: i }) {
	let [a, o] = Y(!1), [s, c] = Y(""), [l, u] = Y(!1), [d, f] = Y({
		addr: "",
		http: "",
		nftset_table: "",
		ttl: ""
	}), [p, m] = Y([]), [h, g] = Y(""), [_, v] = Y(-1), [b, x] = Y(!1), [S, C] = Y(!1), [w, T] = Y(!1), [E, D] = Y({ kind: "" }), [O, k] = Y(!1), [A, j] = Y("list"), [, M] = Y(0), N = Z(() => M((e) => e + 1), []), [P, F] = Y(-1), [I, L] = Y(-1), R = ge(null);
	X(() => {
		n?.(b);
	}, [b, n]);
	let z = Z(() => D({ kind: "" }), []), B = Z(() => {
		x(!0), T(!1), D((e) => e.kind === "ok" ? { kind: "" } : e), N();
	}, [N]), V = Z((e, t) => {
		let n = e?.config || {};
		g(e?.version || ""), f({
			addr: n.addr || "",
			http: n.http || "",
			nftset_table: n.nftset_table || "",
			ttl: n.ttl || ""
		});
		let r = Array.isArray(n.resolvers) ? n.resolvers : [];
		r.forEach((e) => {
			e[Ke] = ++$e;
		}), m(r), v(t != null && t >= 0 && t < r.length ? t : r.length ? 0 : -1), x(!1), T(!1);
	}, []), H = Z(async (n) => {
		o(!0), c(""), z();
		try {
			let { status: t, data: r } = await e.get("/config");
			if (t !== 200) throw Error(`HTTP ${t}${r?.error ? " — " + r.error : ""}`);
			V(r, n), u(!0);
		} catch (e) {
			if (e instanceof W) {
				t();
				return;
			}
			c(e instanceof Error ? e.message : String(e));
		} finally {
			o(!1);
		}
	}, [
		e,
		V,
		z,
		t
	]);
	X(() => {
		l || a || s || H();
	}, [r]), X(() => {
		if (!O) return;
		let e = (e) => {
			let t = R.current;
			t && !e.composedPath().includes(t) && k(!1);
		};
		return window.addEventListener("click", e), () => window.removeEventListener("click", e);
	}, [O]);
	let U = _ >= 0 && _ < p.length ? p[_] : null, ee = S || !b || E.kind === "conflict";
	function te(e) {
		v(e), j("detail");
	}
	function ne(e) {
		k(!1);
		let t = Ge(e);
		t[Ke] = ++$e, p.push(t), v(p.length - 1), j("detail"), B();
	}
	function G() {
		_ < 0 || (p.splice(_, 1), p.length === 0 ? v(-1) : _ >= p.length && v(p.length - 1), j(p.length ? "detail" : "list"), B());
	}
	function K(e, t) {
		if (e < 0) return;
		let n = e + t;
		if (n < 0 || n >= p.length) return;
		let r = p[e];
		p[e] = p[n], p[n] = r, v(n), B();
	}
	function re(e) {
		if (P < 0) L(-1);
		else {
			if (P !== e) {
				let t = p.splice(P, 1)[0];
				p.splice(e, 0, t), v(e), B();
			}
			F(-1), L(-1);
		}
	}
	function ie(e) {
		if (!e) return "";
		if (e.error) {
			if (typeof e.error == "string") return e.error;
			try {
				return JSON.stringify(e.error);
			} catch {
				return String(e.error);
			}
		}
		return "";
	}
	async function ae() {
		C(!0), z();
		try {
			let { status: t, data: n } = await e.postJSON("/config/validate", { resolvers: Je(p) });
			t === 200 && n?.valid ? D({
				kind: "ok",
				msg: "校验通过。"
			}) : D({
				kind: "error",
				msg: "校验失败" + (n?.stage ? `（${n.stage}）` : ""),
				detail: ie(n)
			});
		} catch (e) {
			if (e instanceof W) {
				t();
				return;
			}
			D({
				kind: "error",
				msg: "校验请求失败",
				detail: e instanceof Error ? e.message : String(e)
			});
		} finally {
			C(!1);
		}
	}
	async function q() {
		C(!0), z();
		try {
			let { status: t, data: n } = await e.postJSON("/config", {
				version: h,
				resolvers: Je(p)
			});
			if (t === 200 && n?.ok) {
				let t = _, n = await e.get("/config");
				n.status === 200 && V(n.data, t), T(!0), D({
					kind: "ok",
					msg: "已保存，配置已重新加载并热更新生效。"
				});
			} else t === 409 && n?.stage === "version" ? D({ kind: "conflict" }) : D({
				kind: "error",
				msg: "保存失败" + (n?.stage ? `（${n.stage}）` : ""),
				detail: ie(n)
			});
		} catch (e) {
			if (e instanceof W) {
				t();
				return;
			}
			D({
				kind: "error",
				msg: "保存请求失败",
				detail: e instanceof Error ? e.message : String(e)
			});
		} finally {
			C(!1);
		}
	}
	return /* @__PURE__ */ Q(y, { children: [
		/* @__PURE__ */ Q("section", {
			class: "section",
			children: [
				/* @__PURE__ */ Q("div", {
					class: "section-head",
					children: [/* @__PURE__ */ Q("h2", {
						class: "section-title",
						children: "服务概览"
					}), /* @__PURE__ */ Q("span", {
						class: "head-note",
						children: "顶层字段只读，改请直接编辑配置文件"
					})]
				}),
				a ? /* @__PURE__ */ Q(Pe, { label: "加载配置…" }) : null,
				s ? /* @__PURE__ */ Q("div", { children: [/* @__PURE__ */ Q($, {
					title: "配置加载失败",
					detail: s
				}), /* @__PURE__ */ Q("button", {
					class: "secondary",
					style: "margin-top:.75rem",
					onClick: () => void H(),
					children: "重试"
				})] }) : null,
				!a && !s ? /* @__PURE__ */ Q("div", {
					class: "ro-grid",
					children: [
						/* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q("span", {
							class: "k",
							children: "addr"
						}), /* @__PURE__ */ Q("span", {
							class: "v",
							children: d.addr || "—"
						})] }),
						/* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q("span", {
							class: "k",
							children: "http"
						}), /* @__PURE__ */ Q("span", {
							class: "v",
							children: d.http || "—"
						})] }),
						/* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q("span", {
							class: "k",
							children: "nftset_table"
						}), /* @__PURE__ */ Q("span", {
							class: "v",
							children: d.nftset_table || "(default)"
						})] }),
						/* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q("span", {
							class: "k",
							children: "ttl"
						}), /* @__PURE__ */ Q("span", {
							class: "v",
							children: d.ttl || "—"
						})] }),
						/* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q("span", {
							class: "k",
							children: "version"
						}), /* @__PURE__ */ Q("span", {
							class: "v",
							children: h ? h.slice(0, 8) : "—"
						})] })
					]
				}) : null
			]
		}),
		i,
		s ? null : /* @__PURE__ */ Q("section", {
			class: "section section-resolvers",
			children: [
				/* @__PURE__ */ Q("div", {
					class: "section-head",
					children: [/* @__PURE__ */ Q("h2", {
						class: "section-title",
						children: "解析器"
					}), /* @__PURE__ */ Q("span", {
						class: "section-actions",
						children: [
							b && !w ? /* @__PURE__ */ Q("span", {
								class: "badge badge-warn",
								children: "未保存"
							}) : null,
							w ? /* @__PURE__ */ Q("span", {
								class: "badge badge-ok",
								children: "已保存"
							}) : null,
							/* @__PURE__ */ Q("button", {
								class: "secondary",
								disabled: S || !l,
								onClick: () => void ae(),
								children: "校验"
							}),
							/* @__PURE__ */ Q("button", {
								disabled: ee,
								"aria-busy": S,
								onClick: () => void q(),
								children: S ? "保存中…" : "保存"
							})
						]
					})]
				}),
				a ? /* @__PURE__ */ Q(Pe, { label: "加载配置…" }) : null,
				!a && !l ? /* @__PURE__ */ Q(Ie, {
					title: "配置还没加载",
					hint: "填入上方的 API key 后会自动加载"
				}) : null,
				!a && l ? /* @__PURE__ */ Q("div", {
					class: "master-detail",
					"data-view": A,
					children: [/* @__PURE__ */ Q("div", {
						class: "master",
						children: [
							/* @__PURE__ */ Q("div", {
								class: "master-head",
								children: "顺序即优先级，第一条命中的生效"
							}),
							/* @__PURE__ */ Q("div", {
								class: "r-list",
								children: [p.length === 0 ? /* @__PURE__ */ Q(Ie, {
									title: "还没有 resolver",
									hint: "用下方「+ 添加」新建一个"
								}) : null, p.map((e, t) => /* @__PURE__ */ Q("div", {
									class: `r-item${P === t ? " dragging" : ""}${I === t ? " dragover" : ""}`,
									"aria-selected": t === _,
									onClick: () => te(t),
									draggable: !0,
									onDragStart: (e) => {
										F(t), e.dataTransfer && (e.dataTransfer.effectAllowed = "move");
									},
									onDragOver: (e) => {
										e.preventDefault(), L(t);
									},
									onDragLeave: () => L((e) => e === t ? -1 : e),
									onDrop: (e) => {
										e.preventDefault(), re(t);
									},
									onDragEnd: () => {
										F(-1), L(-1);
									},
									children: [
										/* @__PURE__ */ Q("span", {
											class: "r-handle",
											title: "拖动排序",
											children: "∷"
										}),
										/* @__PURE__ */ Q("span", {
											class: "r-idx",
											children: t + 1
										}),
										/* @__PURE__ */ Q("span", {
											class: `r-label${e.name ? "" : " unnamed"}`,
											children: Ye(e)
										}),
										/* @__PURE__ */ Q("span", {
											class: "badge",
											children: e.type || "?"
										})
									]
								}, e[Ke]))]
							}),
							/* @__PURE__ */ Q("div", {
								class: "master-foot",
								children: [
									/* @__PURE__ */ Q("div", {
										class: "add-wrap",
										ref: R,
										children: [/* @__PURE__ */ Q("button", {
											class: "secondary",
											onClick: () => k((e) => !e),
											children: "+ 添加 ▾"
										}), O ? /* @__PURE__ */ Q("div", {
											class: "add-menu",
											children: Ve.map((e) => /* @__PURE__ */ Q("button", {
												onClick: () => ne(e),
												children: e
											}, e))
										}) : null]
									}),
									/* @__PURE__ */ Q("span", { class: "spacer" }),
									/* @__PURE__ */ Q("button", {
										class: "secondary",
										title: "上移",
										"aria-label": "上移",
										disabled: _ <= 0,
										onClick: () => K(_, -1),
										children: "↑"
									}),
									/* @__PURE__ */ Q("button", {
										class: "secondary",
										title: "下移",
										"aria-label": "下移",
										disabled: _ < 0 || _ === p.length - 1,
										onClick: () => K(_, 1),
										children: "↓"
									})
								]
							})
						]
					}), /* @__PURE__ */ Q("div", {
						class: "detail",
						children: U ? /* @__PURE__ */ Q(Qe, {
							resolver: U,
							onChange: B,
							onBack: () => j("list"),
							onDelete: G
						}, U[Ke]) : /* @__PURE__ */ Q(Ie, {
							title: p.length ? "还没有选中 resolver" : "还没有 resolver",
							hint: p.length ? "在左侧列表里点一个来编辑" : "用左侧「+ 添加」新建一个"
						})
					})]
				}) : null,
				/* @__PURE__ */ Q("div", {
					style: "margin-top:1rem",
					children: [
						E.kind === "ok" ? /* @__PURE__ */ Q(Fe, { text: E.msg || "" }) : null,
						E.kind === "error" ? /* @__PURE__ */ Q($, {
							title: E.msg || "出错了",
							detail: E.detail
						}) : null,
						E.kind === "conflict" ? /* @__PURE__ */ Q("div", {
							class: "notice notice-err",
							children: [
								/* @__PURE__ */ Q("strong", { children: "配置已在别处变更" }),
								/* @__PURE__ */ Q("code", { children: "加载之后配置被别处改过了。重新加载会丢弃你本地未保存的改动。" }),
								/* @__PURE__ */ Q("div", {
									style: "margin-top:.6rem",
									children: /* @__PURE__ */ Q("button", {
										onClick: () => {
											z(), H();
										},
										children: "重新加载（丢弃本地改动）"
									})
								})
							]
						}) : null
					]
				})
			]
		})
	] });
}
// src/Panel.tsx
function tt({ api: e }) {
	let [t, n] = Y(!1), [r, i] = Y(0), a = ge(!1), o = Z(() => n(!0), []), s = Z((e) => {
		a.current = e;
	}, []);
	return X(() => {
		let e = (e) => {
			a.current && (e.preventDefault(), e.returnValue = "");
		};
		return window.addEventListener("beforeunload", e), () => window.removeEventListener("beforeunload", e);
	}, []), /* @__PURE__ */ Q("div", {
		class: "panel",
		children: [t ? /* @__PURE__ */ Q("div", {
			style: "margin-bottom:1rem",
			children: /* @__PURE__ */ Q(Le, {
				api: e,
				onSubmit: () => {
					n(!1), i((e) => e + 1);
				}
			})
		}) : null, /* @__PURE__ */ Q(et, {
			api: e,
			onAuthRequired: o,
			onDirtyChange: s,
			retryToken: r,
			children: /* @__PURE__ */ Q(Re, {
				api: e,
				onAuthRequired: o
			}, `lookup-${r}`)
		})]
	});
}
// src/main.tsx
function nt(e, t) {
	if (customElements.get(e)) return;
	class n extends HTMLElement {
		constructor(...e) {
			super(...e), this.mount = null;
		}
		connectedCallback() {
			this.hasAttribute("data-theme") || this.setAttribute("data-theme", "light");
			let e = this.shadowRoot ?? this.attachShadow({ mode: "open" });
			if (!this.mount) {
				let t = document.createElement("style");
				t.textContent = H, e.appendChild(t), this.mount = document.createElement("div"), this.mount.className = "pico", e.appendChild(this.mount);
			}
			V(/* @__PURE__ */ Q(t, { api: ne(this.getAttribute("api-base") || "/api") }), this.mount);
		}
		disconnectedCallback() {
			this.mount && V(null, this.mount);
		}
	}
	customElements.define(e, n);
}
nt("dns-card", Be), nt("dns-panel", tt);
