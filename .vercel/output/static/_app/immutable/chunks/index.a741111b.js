function M(){}function ct(t,e){for(const n in e)t[n]=e[n];return t}function lt(t){return!!t&&(typeof t=="object"||typeof t=="function")&&typeof t.then=="function"}function V(t){return t()}function W(){return Object.create(null)}function $(t){t.forEach(V)}function X(t){return typeof t=="function"}function At(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}let T;function St(t,e){return T||(T=document.createElement("a")),T.href=e,t===T.href}function ut(t){return Object.keys(t).length===0}function ot(t,...e){if(t==null)return M;const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function Mt(t,e,n){t.$$.on_destroy.push(ot(e,n))}function Ct(t,e,n,i){if(t){const r=Y(t,e,n,i);return t[0](r)}}function Y(t,e,n,i){return t[1]&&i?ct(n.ctx.slice(),t[1](i(e))):n.ctx}function jt(t,e,n,i){if(t[2]&&i){const r=t[2](i(n));if(e.dirty===void 0)return r;if(typeof r=="object"){const u=[],s=Math.max(e.dirty.length,r.length);for(let o=0;o<s;o+=1)u[o]=e.dirty[o]|r[o];return u}return e.dirty|r}return e.dirty}function Ht(t,e,n,i,r,u){if(r){const s=Y(e,n,i,u);t.p(s,r)}}function Lt(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}function Bt(t,e,n){return t.set(n),e}let j=!1;function at(){j=!0}function ft(){j=!1}function _t(t,e,n,i){for(;t<e;){const r=t+(e-t>>1);n(r)<=i?t=r+1:e=r}return t}function dt(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const c=[];for(let l=0;l<e.length;l++){const _=e[l];_.claim_order!==void 0&&c.push(_)}e=c}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let r=0;for(let c=0;c<e.length;c++){const l=e[c].claim_order,_=(r>0&&e[n[r]].claim_order<=l?r+1:_t(1,r,a=>e[n[a]].claim_order,l))-1;i[c]=n[_]+1;const d=_+1;n[d]=c,r=Math.max(d,r)}const u=[],s=[];let o=e.length-1;for(let c=n[r]+1;c!=0;c=i[c-1]){for(u.push(e[c-1]);o>=c;o--)s.push(e[o]);o--}for(;o>=0;o--)s.push(e[o]);u.reverse(),s.sort((c,l)=>c.claim_order-l.claim_order);for(let c=0,l=0;c<s.length;c++){for(;l<u.length&&s[c].claim_order>=u[l].claim_order;)l++;const _=l<u.length?u[l]:null;t.insertBefore(s[c],_)}}function ht(t,e){if(j){for(dt(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function mt(t,e,n){t.insertBefore(e,n||null)}function pt(t,e,n){j&&!n?ht(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function C(t){t.parentNode&&t.parentNode.removeChild(t)}function Z(t){return document.createElement(t)}function tt(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function G(t){return document.createTextNode(t)}function Dt(){return G(" ")}function Pt(){return G("")}function qt(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function Ot(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function yt(t){return Array.from(t.childNodes)}function et(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function nt(t,e,n,i,r=!1){et(t);const u=(()=>{for(let s=t.claim_info.last_index;s<t.length;s++){const o=t[s];if(e(o)){const c=n(o);return c===void 0?t.splice(s,1):t[s]=c,r||(t.claim_info.last_index=s),o}}for(let s=t.claim_info.last_index-1;s>=0;s--){const o=t[s];if(e(o)){const c=n(o);return c===void 0?t.splice(s,1):t[s]=c,r?c===void 0&&t.claim_info.last_index--:t.claim_info.last_index=s,o}}return i()})();return u.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,u}function it(t,e,n,i){return nt(t,r=>r.nodeName===e,r=>{const u=[];for(let s=0;s<r.attributes.length;s++){const o=r.attributes[s];n[o.name]||u.push(o.name)}u.forEach(s=>r.removeAttribute(s))},()=>i(e))}function Gt(t,e,n){return it(t,e,n,Z)}function zt(t,e,n){return it(t,e,n,tt)}function gt(t,e){return nt(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>G(e),!0)}function Ft(t){return gt(t," ")}function J(t,e,n){for(let i=n;i<t.length;i+=1){const r=t[i];if(r.nodeType===8&&r.textContent.trim()===e)return i}return t.length}function It(t,e){const n=J(t,"HTML_TAG_START",0),i=J(t,"HTML_TAG_END",n);if(n===i)return new K(void 0,e);et(t);const r=t.splice(n,i-n+1);C(r[0]),C(r[r.length-1]);const u=r.slice(1,r.length-1);for(const s of u)s.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1;return new K(u,e)}function Rt(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function Wt(t,e,n,i){n===null?t.style.removeProperty(e):t.style.setProperty(e,n,i?"important":"")}function Jt(t,e,n){t.classList[n?"add":"remove"](e)}function bt(t,e,{bubbles:n=!1,cancelable:i=!1}={}){const r=document.createEvent("CustomEvent");return r.initCustomEvent(t,n,i,e),r}class xt{constructor(e=!1){this.is_svg=!1,this.is_svg=e,this.e=this.n=null}c(e){this.h(e)}m(e,n,i=null){this.e||(this.is_svg?this.e=tt(n.nodeName):this.e=Z(n.nodeName),this.t=n,this.c(e)),this.i(i)}h(e){this.e.innerHTML=e,this.n=Array.from(this.e.childNodes)}i(e){for(let n=0;n<this.n.length;n+=1)mt(this.t,this.n[n],e)}p(e){this.d(),this.h(e),this.i(this.a)}d(){this.n.forEach(C)}}class K extends xt{constructor(e,n=!1){super(n),this.e=this.n=null,this.l=e}c(e){this.l?this.n=this.l:super.c(e)}i(e){for(let n=0;n<this.n.length;n+=1)pt(this.t,this.n[n],e)}}function Kt(t,e){return new t(e)}let v;function g(t){v=t}function k(){if(!v)throw new Error("Function called outside component initialization");return v}function Qt(t){k().$$.on_mount.push(t)}function Ut(t){k().$$.after_update.push(t)}function Vt(t){k().$$.on_destroy.push(t)}function Xt(){const t=k();return(e,n,{cancelable:i=!1}={})=>{const r=t.$$.callbacks[e];if(r){const u=bt(e,n,{cancelable:i});return r.slice().forEach(s=>{s.call(t,u)}),!u.defaultPrevented}return!0}}const w=[],Q=[],A=[],U=[],rt=Promise.resolve();let q=!1;function st(){q||(q=!0,rt.then(z))}function Yt(){return st(),rt}function O(t){A.push(t)}const P=new Set;let x=0;function z(){if(x!==0)return;const t=v;do{try{for(;x<w.length;){const e=w[x];x++,g(e),wt(e.$$)}}catch(e){throw w.length=0,x=0,e}for(g(null),w.length=0,x=0;Q.length;)Q.pop()();for(let e=0;e<A.length;e+=1){const n=A[e];P.has(n)||(P.add(n),n())}A.length=0}while(w.length);for(;U.length;)U.pop()();q=!1,P.clear(),g(t)}function wt(t){if(t.fragment!==null){t.update(),$(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(O)}}const S=new Set;let b;function vt(){b={r:0,c:[],p:b}}function $t(){b.r||$(b.c),b=b.p}function F(t,e){t&&t.i&&(S.delete(t),t.i(e))}function kt(t,e,n,i){if(t&&t.o){if(S.has(t))return;S.add(t),b.c.push(()=>{S.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}else i&&i()}function Zt(t,e){const n=e.token={};function i(r,u,s,o){if(e.token!==n)return;e.resolved=o;let c=e.ctx;s!==void 0&&(c=c.slice(),c[s]=o);const l=r&&(e.current=r)(c);let _=!1;e.block&&(e.blocks?e.blocks.forEach((d,a)=>{a!==u&&d&&(vt(),kt(d,1,1,()=>{e.blocks[a]===d&&(e.blocks[a]=null)}),$t())}):e.block.d(1),l.c(),F(l,1),l.m(e.mount(),e.anchor),_=!0),e.block=l,e.blocks&&(e.blocks[u]=l),_&&z()}if(lt(t)){const r=k();if(t.then(u=>{g(r),i(e.then,1,e.value,u),g(null)},u=>{if(g(r),i(e.catch,2,e.error,u),g(null),!e.hasCatch)throw u}),e.current!==e.pending)return i(e.pending,0),!0}else{if(e.current!==e.then)return i(e.then,1,e.value,t),!0;e.resolved=t}}function te(t,e,n){const i=e.slice(),{resolved:r}=t;t.current===t.then&&(i[t.value]=r),t.current===t.catch&&(i[t.error]=r),t.block.p(i,n)}function ee(t,e){t.d(1),e.delete(t.key)}function ne(t,e,n,i,r,u,s,o,c,l,_,d){let a=t.length,m=u.length,h=a;const H={};for(;h--;)H[t[h].key]=h;const E=[],L=new Map,B=new Map;for(h=m;h--;){const f=d(r,u,h),p=n(f);let y=s.get(p);y?i&&y.p(f,e):(y=l(p,f),y.c()),L.set(p,E[h]=y),p in H&&B.set(p,Math.abs(h-H[p]))}const I=new Set,R=new Set;function D(f){F(f,1),f.m(o,_),s.set(f.key,f),_=f.first,m--}for(;a&&m;){const f=E[m-1],p=t[a-1],y=f.key,N=p.key;f===p?(_=f.first,a--,m--):L.has(N)?!s.has(y)||I.has(y)?D(f):R.has(N)?a--:B.get(y)>B.get(N)?(R.add(y),D(f)):(I.add(N),a--):(c(p,s),a--)}for(;a--;){const f=t[a];L.has(f.key)||c(f,s)}for(;m;)D(E[m-1]);return E}function ie(t){t&&t.c()}function re(t,e){t&&t.l(e)}function Et(t,e,n,i){const{fragment:r,after_update:u}=t.$$;r&&r.m(e,n),i||O(()=>{const s=t.$$.on_mount.map(V).filter(X);t.$$.on_destroy?t.$$.on_destroy.push(...s):$(s),t.$$.on_mount=[]}),u.forEach(O)}function Nt(t,e){const n=t.$$;n.fragment!==null&&($(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Tt(t,e){t.$$.dirty[0]===-1&&(w.push(t),st(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function se(t,e,n,i,r,u,s,o=[-1]){const c=v;g(t);const l=t.$$={fragment:null,ctx:[],props:u,update:M,not_equal:r,bound:W(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(c?c.$$.context:[])),callbacks:W(),dirty:o,skip_bound:!1,root:e.target||c.$$.root};s&&s(l.root);let _=!1;if(l.ctx=n?n(t,e.props||{},(d,a,...m)=>{const h=m.length?m[0]:a;return l.ctx&&r(l.ctx[d],l.ctx[d]=h)&&(!l.skip_bound&&l.bound[d]&&l.bound[d](h),_&&Tt(t,d)),a}):[],l.update(),_=!0,$(l.before_update),l.fragment=i?i(l.ctx):!1,e.target){if(e.hydrate){at();const d=yt(e.target);l.fragment&&l.fragment.l(d),d.forEach(C)}else l.fragment&&l.fragment.c();e.intro&&F(t.$$.fragment),Et(t,e.target,e.anchor,e.customElement),ft(),z()}g(c)}class ce{$destroy(){Nt(this,1),this.$destroy=M}$on(e,n){if(!X(n))return M;const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const r=i.indexOf(n);r!==-1&&i.splice(r,1)}}$set(e){this.$$set&&!ut(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}export{Et as A,Nt as B,Mt as C,Bt as D,Ct as E,Ht as F,Lt as G,jt as H,ht as I,M as J,Xt as K,Vt as L,tt as M,zt as N,Jt as O,St as P,qt as Q,ne as R,ce as S,$ as T,Zt as U,te as V,K as W,It as X,ee as Y,Dt as a,pt as b,Ft as c,kt as d,Pt as e,$t as f,F as g,C as h,se as i,Ut as j,Z as k,Gt as l,yt as m,Ot as n,Qt as o,Wt as p,G as q,gt as r,At as s,Yt as t,Rt as u,vt as v,Q as w,Kt as x,ie as y,re as z};
