var G=Object.defineProperty;var J=(e,t,n)=>t in e?G(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var b=(e,t,n)=>(J(e,typeof t!="symbol"?t+"":t,n),n);import{S as X,i as K,s as Q,e as T,b as Z,g as k,d as P,f as ee,h as te,C as re,o as ne,D as p,E as se,F as ae,G as ie,H as oe,v as ce}from"../chunks/index.ca81ac94.js";import{w as m,l as x}from"../chunks/localforage.dc2bd444.js";var C=Symbol("Comlink.proxy"),le=Symbol("Comlink.endpoint"),S=Symbol("Comlink.releaseProxy"),A=Symbol("Comlink.thrown"),z=e=>typeof e=="object"&&e!==null||typeof e=="function",ue={canHandle:e=>z(e)&&Boolean(e[C]),serialize(e){const{port1:t,port2:n}=new MessageChannel,r=e[C];return H(e,t,typeof r=="object"?r:void 0),[n,[n]]},deserialize(e){return e.start(),V(e)}},fe={canHandle:e=>z(e)&&A in e,serialize({value:e}){let t;return e instanceof Error?t={isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:t={isError:!1,value:e},[t,[]]},deserialize(e){throw e.isError?Object.assign(new Error(e.value.message),e.value):e.value}},N=new Map([["proxy",ue],["throw",fe]]);function H(e,t=self,n){t.addEventListener("message",function r(s){if(!s||!s.data)return;const{id:a,type:i,path:o}=Object.assign({path:[]},s.data),u=(s.data.argumentList||[]).map(h);let c;try{const l=(n==null?void 0:n.spec)==null;let w=e,f=e,y=n==null?void 0:n.spec,F=y;for(const d of o){if(w=f,F=y,l){f=f[d];continue}if(typeof y=="object"&&y.hasOwnProperty(d))f=f[d],y=y[d];else{f=void 0,y=void 0;break}}switch(i){case 0:c=f;break;case 1:{c=!1;const d=(n==null?void 0:n.set)!==!1,g=l||F==="primitive"||y==="primitive";g||(w=void 0),(d||!g)&&(w[o.slice(-1)[0]]=h(s.data.value),c=!0)}break;case 2:l||y==="function"||(f=void 0),c=f.apply(w,u);break;case 3:{l||(f=void 0);const d=new f(...u);c=M(d)}break;case 4:{const{port1:d,port2:g}=new MessageChannel;H(e,g,n),c=L(d,[d])}break;case 5:c=void 0;break}}catch(l){c={value:l,[A]:0}}Promise.resolve(c).catch(l=>({value:l,[A]:0})).then(l=>{const[w,f]=R(l);t.postMessage(Object.assign(Object.assign({},w),{id:a}),f),i===5&&(t.removeEventListener("message",r),B(t))})}),t.start&&t.start()}function de(e){return e.constructor.name==="MessagePort"}function B(e){de(e)&&e.close()}function V(e,t){return I(e,[],t)}function v(e){if(e)throw new Error("Proxy has been released and is not useable")}function I(e,t=[],n=function(){}){let r=!1;const s=new Proxy(n,{get(a,i){if(v(r),i===S)return()=>_(e,{type:5,path:t.map(o=>o.toString())}).then(()=>{B(e),r=!0});if(i==="then"){if(t.length===0)return{then:()=>s};const o=_(e,{type:0,path:t.map(u=>u.toString())}).then(h);return o.then.bind(o)}return I(e,[...t,i])},set(a,i,o){v(r);const[u,c]=R(o);return _(e,{type:1,path:[...t,i].map(l=>l.toString()),value:u},c).then(h)},apply(a,i,o){v(r);const u=t[t.length-1];if(u===le)return _(e,{type:4}).then(h);if(u==="bind")return I(e,t.slice(0,-1));const[c,l]=O(o);return _(e,{type:2,path:t.map(w=>w.toString()),argumentList:c},l).then(h)},construct(a,i){v(r);const[o,u]=O(i);return _(e,{type:3,path:t.map(c=>c.toString()),argumentList:o},u).then(h)}});return s}function me(e){return Array.prototype.concat.apply([],e)}function O(e){const t=e.map(R);return[t.map(n=>n[0]),me(t.map(n=>n[1]))]}var $=new WeakMap;function L(e,t){return $.set(e,t),e}function M(e,t){return Object.assign(e,{[C]:t??!0})}function R(e){for(const[t,n]of N)if(n.canHandle(e)){const[r,s]=n.serialize(e);return[{type:3,name:t,value:r},s]}return[{type:0,value:e},$.get(e)||[]]}function h(e){switch(e.type){case 3:return N.get(e.name).deserialize(e.value);case 0:return e.value}}function _(e,t,n){return new Promise(r=>{const s=ye();e.addEventListener("message",function a(i){!i.data||!i.data.id||i.data.id!==s||(e.removeEventListener("message",a),r(i.data))}),e.start&&e.start(),e.postMessage(Object.assign({id:s},t),n)})}function ye(){return new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-")}function Y(e){const t={d:{}};for(const n of Object.keys(e)){const r=e[n];if("file"in r){const a=r.file.contents,i=typeof a=="string"?a:we(a),o=typeof a=="string"?{}:{b:!0};t.d[n]={f:{c:i,...o}};continue}const s=Y(r.directory);t.d[n]=s}return t}function we(e){let t="";for(const n of e)t+=String.fromCharCode(n);return t}var pe="https://stackblitz.com/headless",E=null,U=!1,D=!1,he=new TextDecoder,_e=new TextEncoder,q=class{constructor(e,t,n){b(this,"fs");this._endpoint=e,this._iframe=n,this.fs=new ke(t)}async spawn(e,t,n){let r=[];Array.isArray(t)?r=t:n=t;let s=new ReadableStream,a;(n==null?void 0:n.output)!==!1&&(s=new ReadableStream({start(u){a=c=>u.enqueue(c)}}));const i=Ce(Pe(a)),o=await this._endpoint.run({command:e,args:r,env:n==null?void 0:n.env,terminal:n==null?void 0:n.terminal},void 0,void 0,i);return new Ee(o,s)}on(e,t){let n=!1,r=()=>{};const s=(...a)=>{n||t(...a)};return this._endpoint.on(e,M(s)).then(a=>{r=a,n&&r()}),()=>{n=!0,r()}}mount(e,t){const n=_e.encode(JSON.stringify(Y(e)));return this._endpoint.loadFiles(L(n,[n.buffer]),{mountPoints:t==null?void 0:t.mountPoint})}teardown(){if(D)throw new Error("WebContainer already torn down");D=!0,this.fs._teardown(),this._endpoint.teardown(),this._endpoint[S](),this._iframe.remove()}static async boot(){for(;E;)await E;if(U)throw new Error("WebContainer already booted");const e=Se();E=e.catch(()=>{});try{const t=await e;return U=!0,t}finally{E=null}}},ge=1,be=2,ve=class{constructor(e,t){this.name=e,this._type=t}isFile(){return this._type===ge}isDirectory(){return this._type===be}},Ee=class{constructor(e,t){b(this,"input");this._process=e,this.output=t,this.input=new WritableStream({write:n=>{this._process.write(n).catch(()=>{})}})}get exit(){return this._process.onExit}kill(){this._process.kill()}resize(e){this._process.resize(e)}},ke=class{constructor(e){b(this,"_fs");this._fs=e}rm(...e){return this._fs.rm(...e)}async readFile(e,t){return await this._fs.readFile(e,t)}async writeFile(e,t,n){if(t instanceof Uint8Array){const r=t.buffer.slice(t.byteOffset,t.byteOffset+t.byteLength);t=L(new Uint8Array(r),[r])}await this._fs.writeFile(e,t,n)}async readdir(e,t){const n=await this._fs.readdir(e,t);return Ie(n)||Le(n)?n:n.map(s=>new ve(s.name,s["Symbol(type)"]))}async mkdir(e,t){return await this._fs.mkdir(e,t)}_teardown(){this._fs[S]()}};async function Se(){const{iframe:e,endpointPromise:t}=Ae(),n=await t,r=await n.build({host:window.location.host,version:"1.0.2"}),s=await r.fs();return n[S](),new q(r,s,e)}function Pe(e){if(e!=null)return t=>{t instanceof Uint8Array&&e(he.decode(t))}}function Ce(e){if(e!=null)return M(e)}function Ae(){const e=document.createElement("iframe");e.style.display="none",e.setAttribute("allow","cross-origin-isolated");const t=W();e.src=W().toString();const{origin:n}=t,r=new Promise(s=>{const a=i=>{if(i.origin!==n)return;const{data:o}=i;if(o.type==="init"){s(V(i.ports[0]));return}if(o.type==="warning"){console[o.level].call(console,o.message);return}};window.addEventListener("message",a)});return document.body.insertBefore(e,null),{iframe:e,endpointPromise:r}}function Ie(e){return typeof e[0]=="string"}function Le(e){return e[0]instanceof Uint8Array}function W(){return new URL(window.WEBCONTAINER_API_IFRAME_URL??pe)}function j(e){let t;const n=e[2].default,r=se(n,e,e[1],null);return{c(){r&&r.c()},l(s){r&&r.l(s)},m(s,a){r&&r.m(s,a),t=!0},p(s,a){r&&r.p&&(!t||a&2)&&ae(r,n,s,s[1],t?oe(n,s[1],a,null):ie(s[1]),null)},i(s){t||(k(r,s),t=!0)},o(s){P(r,s),t=!1},d(s){r&&r.d(s)}}}function Me(e){let t,n,r=e[0]&&j(e);return{c(){r&&r.c(),t=T()},l(s){r&&r.l(s),t=T()},m(s,a){r&&r.m(s,a),Z(s,t,a),n=!0},p(s,[a]){s[0]?r?(r.p(s,a),a&1&&k(r,1)):(r=j(s),r.c(),k(r,1),r.m(t.parentNode,t)):r&&(ce(),P(r,1,1,()=>{r=null}),ee())},i(s){n||(k(r),n=!0)},o(s){P(r),n=!1},d(s){r&&r.d(s),s&&te(t)}}}function Re(e,t,n){let r;re(e,m,i=>n(0,r=i));let{$$slots:s={},$$scope:a}=t;return ne(async()=>{console.log(crossOriginIsolated);try{p(m,r=await q.boot(),r),r.on("server-ready",(i,o)=>{p(m,r.host=o,r),p(m,r.port=i,r),p(m,r.pwd=`~/${new URL(r.host).host.split(".")[0].split("--")[0]}/`,r)}),await r.mount(await x.getItem("indexedDB")||{}),p(m,r.terminal=await r.spawn("jsh"),r),p(m,r.terminal.stream=await x.getItem("terminal")||"",r),r.terminal.output.pipeTo(new WritableStream({write(i){p(m,r.terminal.stream+=i,r)}})),p(m,r.terminal.input=r.terminal.input.getWriter(),r),m.set(r)}catch{}}),e.$$set=i=>{"$$scope"in i&&n(1,a=i.$$scope)},[r,a,s]}class Oe extends X{constructor(t){super(),K(this,t,Re,Me,Q,{})}}export{Oe as default};
