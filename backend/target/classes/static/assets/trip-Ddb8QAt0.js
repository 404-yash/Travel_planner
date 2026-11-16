import{c as d}from"./index-DLT8jEul.js";/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=d("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=d("Coffee",[["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M14 2v2",key:"6buw04"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",key:"pwadti"}],["path",{d:"M6 2v2",key:"colzsn"}]]);/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=d("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);function s(e){const a=/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(e.trim());if(!a)throw new Error(`Bad date-time: ${e}`);const[,o,n,t,i,$]=a.map(Number),r=new Date(Date.UTC(o,n-1,t,i,$)-(5*60+30)*6e4),c=T=>String(T).padStart(2,"0");return`${r.getUTCFullYear()}${c(r.getUTCMonth()+1)}${c(r.getUTCDate())}T${c(r.getUTCHours())}${c(r.getUTCMinutes())}00Z`}const p=e=>e.replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");function E(e,a=new Date){const o=s(new Date(a.getTime()+198e5).toISOString().slice(0,16).replace("T"," ")),n=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Journey//Trip//EN","CALSCALE:GREGORIAN"];return e.legs.forEach((t,i)=>{n.push("BEGIN:VEVENT",`UID:${e.bookingRef}-${i+1}@journey.app`,`DTSTAMP:${o}`,`DTSTART:${s(t.departureTime)}`,`DTEND:${s(t.arrivalTime)}`,`SUMMARY:${p(`${t.mode} ${t.from} to ${t.to} (${e.bookingRef})`)}`,`DESCRIPTION:${p(`${t.operator} ${t.name}. Booking ${e.bookingRef}.`)}`,`LOCATION:${p(t.from)}`,"BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Time to leave","TRIGGER:-PT60M","END:VALARM","END:VEVENT")}),n.push("END:VCALENDAR"),n.join(`\r
`)+`\r
`}function k(e){const a=[`My trip ${e.origin} to ${e.destination} (ref ${e.bookingRef})`,...e.legs.map((o,n)=>`${n+1}. ${o.mode} ${o.from} ${o.departureTime.slice(11)} to ${o.to} ${o.arrivalTime.slice(11)}`)].join(`
`);return`https://wa.me/?text=${encodeURIComponent(a)}`}export{g as C,h as S,y as a,E as b,k as w};
