import{c as h,a as g}from"./index-DLT8jEul.js";import{r as s}from"./react-BSuFBZJa.js";/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=h("CircleCheckBig",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=h("CreditCard",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]),k=40,e=new Map,E=()=>e.clear();function b(r,y=250){const[i,a]=s.useState([]),[u,o]=s.useState("idle"),[C,c]=s.useState(""),n=r?JSON.stringify(r):"";return s.useEffect(()=>{if(!r)return;const l=e.get(n);if(l){a(l),c(""),o("ok");return}o("loading");const d=new AbortController,f=setTimeout(async()=>{try{const t=await g.routes.search(r,d.signal);e.size>=k&&e.delete(e.keys().next().value),e.set(n,t),a(t),c(""),o("ok")}catch(t){if(t?.name==="AbortError")return;a([]),c(t?.message||"No routes found"),o("error")}},y);return()=>{clearTimeout(f),d.abort()}},[n]),{routes:i,status:u,error:C,isStale:u==="loading"&&i.length>0}}export{S as C,x as a,E as c,b as u};
