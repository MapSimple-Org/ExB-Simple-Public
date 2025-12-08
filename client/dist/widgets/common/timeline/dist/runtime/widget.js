System.register(["jimu-core/emotion","jimu-core","jimu-arcgis","jimu-ui","jimu-core/dnd","jimu-theme"],function(e,t){var n={},a={},i={},o={},r={},s={};return{setters:[function(e){n.jsx=e.jsx,n.jsxs=e.jsxs},function(e){a.AppMode=e.AppMode,a.BaseVersionManager=e.BaseVersionManager,a.DataSourceComponent=e.DataSourceComponent,a.DataSourceManager=e.DataSourceManager,a.DataSourceStatus=e.DataSourceStatus,a.DataSourceTypes=e.DataSourceTypes,a.Immutable=e.Immutable,a.React=e.React,a.ReactRedux=e.ReactRedux,a.ReactResizeDetector=e.ReactResizeDetector,a.TimezoneConfig=e.TimezoneConfig,a.classNames=e.classNames,a.css=e.css,a.dataSourceUtils=e.dataSourceUtils,a.dateUtils=e.dateUtils,a.defaultMessages=e.defaultMessages,a.focusElementInKeyboardMode=e.focusElementInKeyboardMode,a.getAppStore=e.getAppStore,a.hooks=e.hooks,a.lodash=e.lodash,a.polished=e.polished,a.useIntl=e.useIntl,a.utils=e.utils},function(e){i.JimuMapViewComponent=e.JimuMapViewComponent,i.MapViewManager=e.MapViewManager,i.loadArcGISJSAPIModules=e.loadArcGISJSAPIModules},function(e){o.Alert=e.Alert,o.Button=e.Button,o.Dropdown=e.Dropdown,o.DropdownButton=e.DropdownButton,o.DropdownItem=e.DropdownItem,o.DropdownMenu=e.DropdownMenu,o.Icon=e.Icon,o.Label=e.Label,o.Paper=e.Paper,o.Popper=e.Popper,o.Switch=e.Switch,o.Tooltip=e.Tooltip,o.Typography=e.Typography,o.WidgetPlaceholder=e.WidgetPlaceholder,o.defaultMessages=e.defaultMessages},function(e){r.interact=e.interact},function(e){s.colorUtils=e.colorUtils}],execute:function(){e((()=>{var e={1888:e=>{"use strict";e.exports=s},10307:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#000" d="m9 6.809 3.276 1.638.448-.894L10 6.19V3H9z"></path><path fill="#000" fill-rule="evenodd" d="M10.293 11.943A5.501 5.501 0 0 0 9.5 1a5.5 5.5 0 0 0-.792 10.943L9.5 13zM14 6.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0M12 16.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0m-1 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" clip-rule="evenodd"></path><path fill="#000" d="M6 16H0v1h6zM13 16h6v1h-6z"></path></svg>'},12033:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M14 2.22V1l-1 .7-8.128 5.69L4 8l.872.61L13 14.3l1 .7V2.22M5.744 8 13 13.08V2.92zM2 1h1v14H2z" clip-rule="evenodd"></path></svg>'},14321:e=>{"use strict";e.exports=o},26245:e=>{"use strict";e.exports=r},40904:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M5 1H4v14h1zm7 0h-1v14h1z" clip-rule="evenodd"></path></svg>'},44383:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 4 16"><path fill="#282828" fill-rule="evenodd" d="M.322.03A.504.504 0 0 1 .96.305L4 8 .96 15.695a.504.504 0 0 1-.638.275.464.464 0 0 1-.29-.606L2.94 8 .031.636A.464.464 0 0 1 .322.03" clip-rule="evenodd"></path></svg>'},45508:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6.5 7.5A.5.5 0 0 1 7 7h1.5v4.5h1a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1h1V8H7a.5.5 0 0 1-.5-.5"></path><path fill="#000" fill-rule="evenodd" d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16m0-1A7 7 0 1 0 8 1a7 7 0 0 0 0 14" clip-rule="evenodd"></path></svg>'},62241:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M2 2.22V1l1 .7 8.128 5.69L12 8l-.872.61L3 14.3 2 15V2.22M10.256 8 3 13.08V2.92zM14 1h-1v14h1z" clip-rule="evenodd"></path></svg>'},62686:e=>{"use strict";e.exports=i},64811:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0m1 0A7 7 0 1 1 1 8a7 7 0 0 1 14 0M7.5 4.5a.5.5 0 0 1 1 0v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3z" clip-rule="evenodd"></path></svg>'},67386:e=>{"use strict";e.exports=n},72259:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0m1 0A7 7 0 1 1 1 8a7 7 0 0 1 14 0M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" clip-rule="evenodd"></path></svg>'},75102:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M8 3c1.175 0 2.27.337 3.195.92l.9-.598A7 7 0 0 0 2.5 13.33h10.999A6.97 6.97 0 0 0 15 9a6.97 6.97 0 0 0-1.256-4.002l-.603.906C13.686 6.808 14 7.867 14 9a5.97 5.97 0 0 1-1.008 3.33H3.008A6 6 0 0 1 8 3m-.183 6.9a1.322 1.322 0 0 1-.43-2.158L13 4 9.258 9.612a1.32 1.32 0 0 1-1.441.287" clip-rule="evenodd"></path></svg>'},79244:e=>{"use strict";e.exports=a},97408:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="m2 1 12 7-12 7zm9.983 6.999L3 2.723v10.553z" clip-rule="evenodd"></path></svg>'}},t={};function l(n){var a=t[n];if(void 0!==a)return a.exports;var i=t[n]={exports:{}};return e[n](i,i.exports,l),i.exports}l.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return l.d(t,{a:t}),t},l.d=(e,t)=>{for(var n in t)l.o(t,n)&&!l.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},l.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),l.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.p="";var c={};return l.p=window.jimuConfig.baseUrl,(()=>{"use strict";l.r(c),l.d(c,{__set_webpack_public_path__:()=>Be,default:()=>$e});var e,t,n,a=l(67386),i=l(79244),o=l(62686),r=l(14321);!function(e){e.Classic="CLASSIC",e.Modern="MODERN"}(e||(e={})),function(e){e.Slowest="SLOWEST",e.Slow="SLOW",e.Medium="MEDIUM",e.Fast="FAST",e.Fastest="FASTEST"}(t||(t={})),function(e){e.instant="INSTANT",e.current="CURRENT",e.cumulatively="CUMULATIVE"}(n||(n={}));const s=["year","month","day"],u=["hour","minute","second"],d=[...s,...u];var m;!function(e){e[e.year=31536e3]="year",e[e.month=2592e3]="month",e[e.day=86400]="day",e[e.hour=3600]="hour",e[e.minute=60]="minute",e[e.second=1]="second"}(m||(m={}));const p={slowest:5e3,slow:4e3,medium:3e3,fast:2e3,fastest:1e3};function h(e){let n;const a=1e3*Math.ceil(e/1e3);return Object.keys(p).some(e=>p[e]===a&&(n=e.toUpperCase(),!0)),n||(a>p.slowest?n=t.Slowest:a<p.fastest&&(n=t.Fastest)),n}function g(e,n,a=!1){const{startTime:o={value:i.dateUtils.VirtualDateType.Min},endTime:r={value:i.dateUtils.VirtualDateType.Max},layerList:s,accuracy:l,stepLength:c}=e||{};let u;const{startTime:d,endTime:p}=function(e,t,n,a){const i=f(n,!0,e,t),o=f(a,!1,e,t);return x(i,o,!0)}(n,s,o,r);if(!d||!p)return null;const h=b(d,p),g=h[0],v=function(e,t,n){const a=(t-e)/1e3/m[n];return{val:a>15?10:a>10?5:1,unit:n}}(d,p,g);if(e){u=(0,i.Immutable)(e);const t=!h.includes(l);t&&(u=u.set("accuracy",g)),c&&(t||m[c.unit]>m[g]||1e3*m[c.unit]*c.val>p-d)&&(u=u.set("stepLength",v))}else u=(0,i.Immutable)(function(e,n){return{layerList:null,startTime:{value:i.dateUtils.VirtualDateType.Min},endTime:{value:i.dateUtils.VirtualDateType.Max},timeDisplayStrategy:"CURRENT",dividedCount:null,accuracy:e,stepLength:n,speed:t.Medium}}(g,v));return a?(u=u.set("startTime",{value:d}).set("endTime",{value:p}),u):(0,i.Immutable)({config:u,exactStartTime:d,exactEndTime:p,minAccuracy:g,accuracyList:h})}function f(e,t=!0,n,a){let o=null;if(e)if("number"==typeof e.value)o=e.value;else{const r=new Date;if(r.setMinutes(0),r.setSeconds(0),r.setMilliseconds(0),e.value===i.dateUtils.VirtualDateType.Today)r.setHours(0),o=r.getTime()+v(e),o=t?o:o+1e3*m.day;else if(e.value===i.dateUtils.VirtualDateType.Now)o=r.getTime()+v(e),o=t?o:o+1e3*m.hour;else if(e.value===i.dateUtils.VirtualDateType.Max||e.value===i.dateUtils.VirtualDateType.Min){const t=w(n,a);t&&(n=t);if(Object.keys(n).filter(e=>null===n[e]).length===Object.keys(n).length)return null;Object.keys(n).forEach(t=>{var a,r;const s=n[t];if(!s)return;const l=s.getTimeInfo();if(e.value===i.dateUtils.VirtualDateType.Max){const e=null===(a=null==l?void 0:l.timeExtent)||void 0===a?void 0:a[1];o=o?Math.max(o,e):e}else{const e=null===(r=null==l?void 0:l.timeExtent)||void 0===r?void 0:r[0];o=o?Math.min(o,e):e}})}}return o}function v(e){return e.offset?e.offset.val*m[e.offset.unit]*1e3:0}function y(e){return e===i.DataSourceTypes.WebMap||e===i.DataSourceTypes.WebScene}function w(e,t){let n=null;const a=Object.keys(e).map(t=>e[t])[0];if(y(null==a?void 0:a.type)){const e=[];a.getAllChildDataSources().forEach(t=>{(t.type===i.DataSourceTypes.MapService||t.type===i.DataSourceTypes.SubtypeGroupLayer||t.type===i.DataSourceTypes.ImageryLayer||t.type===i.DataSourceTypes.ImageryTileLayer||t.type===i.DataSourceTypes.FeatureLayer&&null===i.dataSourceUtils.findMapServiceDataSource(t)||t.type===i.DataSourceTypes.SceneLayer)&&t.supportTime()&&e.push(t)});const o=(null==t?void 0:t.map(e=>e.dataSourceId))||[];n={},e.forEach(e=>{(0===o.length||o.includes(e.id))&&(n[e.id]=e)})}return n}function x(e,t,n=!1){let a;if(a=window.jimuConfig.isBuilder?(0,i.getAppStore)().getState().appStateInBuilder.appConfig.attributes.timezone:(0,i.getAppStore)().getState().appConfig.attributes.timezone,(null==a?void 0:a.type)===i.TimezoneConfig.Specific){const o=i.dataSourceUtils.getTimeZoneOffsetByName(a.value),r=i.dataSourceUtils.getLocalTimeOffset();n?(e=e-r+o,t=t-r+o):(e=e+r-o,t=t+r-o)}return{startTime:e,endTime:t}}function b(e,t){const n=[...s,...u],a=[],i=t-e;return n.forEach(e=>{i>=1e3*m[e]&&a.push(e)}),a}function S(e){return e===i.DataSourceTypes.FeatureLayer||e===i.DataSourceTypes.ImageryLayer||e===i.DataSourceTypes.ImageryTileLayer||e===i.DataSourceTypes.SubtypeGroupLayer||e===i.DataSourceTypes.SceneLayer}var j;function M(e){const{width:t,startTime:n,endTime:a,accuracy:i="hour"}=e,o=j[i],r={year:null,month:null,day:null,hour:null,minute:null,second:null},s=function(e,t,n){const a=n/4;let i,o;const r=(t.getTime()-e.getTime())/31536e6,s=a/r;s>=1?(i=1,o=4*s):(s>=.2?i=5:s>=.1&&s<.2?i=10:s>=.02&&s<.1?i=50:s<.02&&(i=100),o=n/(r/i));return{value:i,tickWidth:o/n}}(new Date(n),new Date(a),t);if(r.year={value:s.value,tickWidth:s.tickWidth},j.month<=o&&1===s.value){const e=function(e,t){const n=e*t/4;let a=null;n>=12?a=1:n>=4?a=3:n>=2&&(a=6);return{value:a,tickWidth:e/(12/a)}}(s.tickWidth,t);if(null!==e.value&&(r.month={value:e.value,tickWidth:e.tickWidth},j.day<=o&&1===e.value)){const e=function(e,t,n){const a=n/4;let i;const o=(t-e)/864e5,r=a/o;i=r>=1?1:r>=.5&&r<1?2:r>=1/7&&r<.5?7:r>=.1&&r<1/7?10:r>=1/15&&r<.1?15:null;return{value:i,tickWidth:1/(o/i)}}(n,a,t);if(null!==e.value&&(r.day={value:e.value,tickWidth:e.tickWidth},j.hour<=o&&1===e.value)){const n=function(e,t){const n=e*t/4;let a;n>=24?a=1:n>=12&&n<24?a=2:n>=4&&n<12?a=6:n>=3&&n<4?a=8:n>=2&&n<3?a=12:n<2&&(a=null);return{value:a,tickWidth:e/(24/a)}}(e.tickWidth,t);if(null!==n.value&&(r.hour={value:n.value,tickWidth:n.tickWidth},j.minute<=o&&1===n.value)){const e=D(n.tickWidth,t);if(null!==e.value&&(r.minute={value:e.value,tickWidth:e.tickWidth},j.second<=o)){const n=D(e.tickWidth,t);null!==n.value&&(r.second={value:n.value,tickWidth:n.tickWidth})}}}}}return r}function D(e,t){const n=e*t/4;let a;n>=60?a=1:n>=12&&n<60?a=5:n>=6&&n<12?a=10:n>=4&&n<6?a=15:n>=2&&n<4?a=30:n<2&&(a=null);return{value:a,tickWidth:e/(60/a)}}function T(e){const{details:t,width:n,localStartTime:a,localEndTime:i,leftPosition:o,endPosition:r,scale:s,intl:l}=e,c=new Date(a),u=new Date(i),d=c.getFullYear(),m=u.getFullYear(),p=[],h=[],g={value:d,label:L(t,c,l,!0),position:0};_(o,r,0,s)&&(p.push(g),h.push(g));let f=function(e,t){let n=new Date(e).getFullYear(),a=null;for(;!a;)n%100%t==0&&(a=n),n++;return a}(a,t.year.value);f===d&&(f=d+t.year.value);for(let e=f;e<=m;e+=t.year.value){const c=new Date(e,0,1,0,0,0),u=(c.getTime()-a)/(i-a);if(!_(o,r,100*u,s))continue;let m=!1;const g=t.year.tickWidth*n/52;g>=1?m=!0:g<.03?m=e%50==0&&e-d>=49:g<.15?m=e%(10*t.year.value)==0&&e-d>=9:g<.3?m=e%(5*t.year.value)==0&&e-d>=4:g<1&&(m=e%2==0);const f=L(t,c,l);m=I(m,f,u,h,n);const v={value:e,label:m?f:null,position:100*u+"%"};m&&h.push(v),p.push(v)}return p}function k(e){const{details:t,width:n,localStartTime:a,localEndTime:i,leftPosition:o,endPosition:r,scale:s,intl:l}=e;if(!t.month||t.month.tickWidth>1&&new Date(i).getMonth()===new Date(a).getMonth())return[];const c=new Date(a),u=new Date(i),d=c.getMonth()+1,m=u.getMonth()+1,p=c.getFullYear(),h=12-d+12*(u.getFullYear()-p-1)+m+1,g=[],f=[];let v=function(e,t){const n=new Date(e);n.setDate(1),n.setHours(0),n.setMinutes(0),n.setSeconds(0),n.setMilliseconds(0),e>n.getTime()&&n.setMonth(n.getMonth()+1);let a=n.getMonth(),i=null;for(;!i;)a%t!==0&&11!==a||(i=a),a++;return i+1}(a,t.month.value);v===d&&(v=d+t.month.value);let y=!1;for(let e=v-d;e<=h-1;e+=t.month.value){const c=new Date(p,d+e-1,1,0,0,0),u=(c.getTime()-a)/(i-a);if(!_(o,r,100*u,s))continue;if(!y||0===c.getMonth()){const e=new Date(c.getFullYear(),c.getMonth()-1,1,0,0,0),n=e.getTime()-a,o=Math.max(n,0)/(i-a);if(f.unshift({value:e.getFullYear(),label:L(t,e,l,!y),position:100*o+"%"}),y=!0,0===c.getMonth())continue}let m=!1;const h=t.month.tickWidth*n;t.year.tickWidth*n>58&&(m=h>=28||(h>=15?c.getMonth()%3==0:(c.getMonth()+1)%12==7));const v=P(t,c,l);m=I(m,v,u,f,n);const w={value:c.getMonth()+1,label:m?v:null,position:100*u+"%"};m&&f.push(w),g.push(w)}return g}function O(e,t,n){let a=!1;const i=n.day.value;if(1!==i){const n=e.getMonth()+1;2===i?(2===n&&28===t||30===t)&&(a=!0):7===i?(2===n&&21===t||28===t)&&(a=!0):10===i?20===t&&(a=!0):15===i&&15===t&&(a=!0)}return a}function R(e){const{details:t,width:n,localStartTime:a,localEndTime:i,leftPosition:o,endPosition:r,scale:s,intl:l}=e;if(!t.day)return[];const c=new Date(a),u=c.getDate(),d=c.getFullYear(),m=c.getMonth(),p=Math.ceil((i-a)/864e5)+1,h=[],g=[],f={value:u,label:P(t,c,l),position:0};g.push(f);let v=function(e,t){let n=new Date(e).getDate(),a=null;for(;!a;)(n-1)%t==0&&1!==n&&(a=n),n++;return a}(a,t.day.value);v===u&&(v=u+t.day.value);for(let e=v-u;e<=p-1;e+=t.day.value){const c=new Date(d,m,u+e,0,0,0),p=c.getDate();if(1===p)continue;const f=(c.getTime()-a)/(i-a);if(!_(o,r,100*f,s))continue;let v=!1;const y=t.day.tickWidth*n;t.month.tickWidth*n>100&&(y>=30?v=!0:y>=15?v=p%2==0:y>=8?v=(p-1)%7==0:y>=3&&(v=11===p||21===p));const w=z(c,t,l);v=I(v,w,f,g,n);const x={value:p,label:v?w:"",position:100*f+"%"};if(v&&g.push(x),h.push(x),O(c,p,t)){const t=new Date(c.getTime());t.setDate(1),t.setMonth(t.getMonth()+1);e+=(t.getTime()-c.getTime())/864e5-1}}return h}function C(e){const{details:t,width:n,localStartTime:a,localEndTime:i,leftPosition:o,endPosition:r,scale:s,intl:l}=e;if(!t.hour)return[];const c=new Date(a),u=c.getHours(),d=c.getFullYear(),m=c.getMonth(),p=c.getDate(),h=Math.ceil((i-a)/36e5)+1,g=[],f=[],v={value:u,label:z(c,t,l),position:0};f.push(v);let y=function(e,t){let n=new Date(e).getHours(),a=null;for(;!a;)n%t===0&&(a=n),n++;return a}(a,t.hour.value);y===u&&(y=u+t.hour.value);for(let e=y-u;e<=h-1;e+=t.hour.value){const l=new Date(d,m,p,u+e,0,0),c=l.getHours();if(0===c)continue;if(l.getTime()>i)break;const h=(l.getTime()-a)/(i-a);if(!_(o,r,100*h,s))continue;let v=!1;const y=t.day.tickWidth*n,w=t.hour.tickWidth*n;y<60?v=!1:y<100?v=c%12==0:w>=40?v=!0:w>=20?v=c%2==0:w>=6.67?v=c%6==0:w>=5?v=c%8==0:w>=3.3&&(v=c%12==0);const x=V(l,t);v=I(v,x,h,f,n);const b={value:c,label:v?x:"",position:100*h+"%"};v&&f.push(b),g.push(b)}return g}function E(e){const{details:t,width:n,localStartTime:a,localEndTime:i,leftPosition:o,endPosition:r,scale:s}=e;if(!t.minute)return[];const l=new Date(a),c=l.getMinutes(),u=l.getFullYear(),d=l.getMonth(),m=l.getDate(),p=l.getHours(),h=(i-a)/6e4+1,g=[],f=[],v={value:c,label:V(l,t),position:0};f.push(v);let y=function(e,t){let n=new Date(e).getMinutes(),a=null;for(;!a;)n%t===0&&(a=n),n++;return a}(a,t.minute.value);y===c&&(y=c+t.minute.value);for(let e=y-c;e<=h-1;e+=t.minute.value){const l=new Date(u,d,m,p,c+e,0),h=l.getMinutes();if(0===l.getMinutes())continue;const v=(l.getTime()-a)/(i-a);if(!_(o,r,100*v,s))continue;let y=!1;const w=t.hour.tickWidth*n,x=t.minute.tickWidth*n;w<60?y=!1:w<=160?y=h%30==0:w<300?y=h%15==0:x>28?y=!0:x>20?y=h%2==0:w>15?y=h%5==0:w>10&&(y=h%10==0);const b=W(l,t);y=I(y,b,v,f,n);const S={value:l.getMinutes(),label:y?b:"",position:100*v+"%"};y&&f.push(S),g.push(S)}return g}function N(e){const{details:t,width:n,localStartTime:a,localEndTime:i,leftPosition:o,endPosition:r,scale:s}=e;if(!t.second)return[];const l=new Date(a),c=l.getSeconds(),u=l.getFullYear(),d=l.getMonth(),m=l.getDate(),p=l.getHours(),h=l.getMinutes(),g=(i-a)/1e3+1,f=[],v=[],y={value:c,label:W(l,t),position:0};v.push(y);let w=function(e,t){let n=new Date(e).getSeconds(),a=null;for(;!a;)n%t===0&&(a=n),n++;return a}(a,t.second.value);w===c&&(w=c+t.second.value);for(let e=w-c;e<=g-1;e+=t.second.value){const l=new Date(u,d,m,p,h,c+e),g=l.getSeconds();if(0===l.getSeconds())continue;const y=(l.getTime()-a)/(i-a);if(!_(o,r,100*y,s))continue;let w=!1;const x=t.minute.tickWidth*n,b=t.second.tickWidth*n;x<60?w=!1:x<=160?w=g%30==0:x<300?w=g%15==0:b>28?w=!0:b>20?w=g%2==0:x>15?w=g%5==0:x>10&&(w=g%10==0);const S=U(l,t);w=I(w,S,y,v,n);const j={value:l.getSeconds(),label:w?S:"",position:100*y+"%"};w&&v.push(j),f.push(j)}return f}function I(e,t,n,a,i){if(e){const o=a[a.length-1];if(!o)return!0;const r=A(o.label),s=A(t);r/(1===a.length?1:2)+s/2>(n-parseFloat(o.position)/100)*i&&(e=!1)}return e}function L(e,t,n,a=!1){let i="";return e.day?i=t.getFullYear():e.month?(i=t.getFullYear(),a&&(i=n.formatDate(new Date(t.getFullYear(),t.getMonth()),{year:"numeric",month:"numeric"}))):i=t.getFullYear(),i}function P(e,t,n){const a=t.getMonth()+1;let i="";return!e.day||e.hour&&1===e.hour.value?1!==a&&(i=a):i=n.formatDate(new Date(2e3,t.getMonth(),t.getDate()),{month:"numeric",day:"numeric"}),i}function z(e,t,n){let a=e.getDate();return t.hour&&(a=n.formatDate(new Date(2e3,e.getMonth(),e.getDate()),{month:"numeric",day:"numeric"})),a}function V(e,t){return e.getHours()+":00"}function W(e,t){let n=e.getMinutes();return t.second&&(n=e.getHours()+":"+(n<10?"0":"")+n),n}function U(e,t){return e.getSeconds()}!function(e){e[e.year=1]="year",e[e.month=2]="month",e[e.day=3]="day",e[e.hour=4]="hour",e[e.minute=5]="minute",e[e.second=6]="second"}(j||(j={}));const F={};function A(e,t,n){const a=window;if(void 0===a.measureCanvasCTX){const e=document.createElement("canvas");a.measureCanvasCTX=e.getContext("2d")}if(F[e])return F[e];const i=a.measureCanvasCTX.measureText(e).width+10;return F[e]=i,i}function $(e){const{interact:t,dragRef:n,getDragProps:a,resizeHandlerDragging:i,resizeHandlerDragend:o}=e;let r,s,l,c,u,d,p=null;return t(n).draggable({inertia:!1,modifiers:[],autoScroll:!0,onstart:e=>{e.stopPropagation(),e.preventDefault(),s=a(),l=s.startValue,c=s.endValue,u=s.startValue,d=s.endValue,r=0},onmove:e=>{e.stopPropagation(),e.preventDefault();const{extent:t,width:n}=s;r=e.clientX-e.clientX0;const a=function(e,t,n){return(e[1]-e[0])/t*n}(t,n,r),o=function(e){const{valueForDw:t,dragProps:n,initStartValue:a,initEndValue:i,startValue:o,endValue:r,newTempEnd:s}=e;let l=s;const{extent:c,stepLength:u,dividedCount:d}=n;let p=a,h=i;if(u){const e=Math.round(t/m[u.unit]/u.val/1e3);0!==e&&(p=H(u.unit,new Date(p),e*u.val),h=H(u.unit,new Date(h),e*u.val))}else{const e=(c[1]-c[0])/d,n=Math.round(t/e);0!==n&&(p+=n*e,h+=n*e)}t>0?h>c[1]?u?p>=c[1]?(p=o,h=r):l=c[1]:(p=c[1]-(i-a),h=c[1]):l=null:(l=null,p<c[0]&&(p=c[0],h=p+(i-a)));return{newStart:p,newEnd:h,updatedNewTempEnd:l}}({valueForDw:a,dragProps:s,initStartValue:l,initEndValue:c,startValue:u,endValue:d,newTempEnd:p});i(o.newStart,o.newEnd),u=o.newStart,d=o.newEnd,p=o.updatedNewTempEnd},onend:e=>{e.stopPropagation(),o(u,d,p)}})}function B(e,t,n,a,i){let o,r;let s,l,c,u,d,p;return e(t).resizable({edges:{left:".resize-left",right:".resize-right"}}).on("resizestart",e=>{e.stopPropagation(),s=n(),c=s.startValue,u=s.endValue,d=s.startValue,p=s.endValue,l=u-c,o=0;const a=t.getBoundingClientRect();r=a.width,t.style.minWidth="0px"}).on("resizemove",e=>{const{extent:t}=s;e.stopPropagation();const n=e.deltaRect;o+=n.width;const i=l&&r+o,h=function(e,t,n,a,i,o){let r=e,s=t;const l=(n[1]-n[0])/a*i;o.edges.left?r=e-l:s=t+l;return{newStart:r,newEnd:s}}(d,p,t,i,o,e),g=function(e,t,n,a,i){const{width:o,extent:r,stepLength:s,accuracy:l,dividedCount:c}=n,{initStartValue:u,initEndValue:d}=a,{newStart:p,newEnd:h}=i;let g=u,f=d;if(s){const n=Math.round((r[1]-r[0])*t/o/m[l]/1e3);e.edges.left?g=H(l,new Date(h),-n):f=H(l,new Date(p),n)}else{const n=(r[1]-r[0])/c,a=Math.round((r[1]-r[0])*t/o/n);e.edges.left?g=h-a*n:f=p+a*n}e.edges.left?(g=Math.min(g,f),g=Math.max(r[0],g),g=Math.min(r[1],g)):(f=Math.max(g,f),f=Math.min(r[1],f),f=Math.max(r[0],f));return{newStart:g,newEnd:f}}(e,i||o,s,{initStartValue:c,initEndValue:u},h);a(g.newStart,g.newEnd),d=g.newStart,p=g.newEnd}).on("resizeend",e=>{e.stopPropagation(),i(d,p)})}function H(e,t,n){switch(e){case"year":t.setFullYear(t.getFullYear()+n);break;case"month":t.setMonth(t.getMonth()+n);break;case"day":t.setDate(t.getDate()+n);break;case"hour":t.setHours(t.getHours()+n);break;case"minute":t.setMinutes(t.getMinutes()+n);break;case"second":t.setSeconds(t.getSeconds()+n)}return t.getTime()}function Y(e,t,n,a,i,o=!0){let r;const s=o?1:-1;if(i)r=n+1/i*(t-e)*s,r=Math.round(r),Math.abs(r-e)<1e4?r=e:Math.abs(r-t)<1e4&&(r=t);else{const e=new Date(n),t=a.val*s;switch(null==a?void 0:a.unit){case"year":e.setFullYear(e.getFullYear()+t);break;case"month":e.setMonth(e.getMonth()+t);break;case"day":e.setDate(e.getDate()+t);break;case"hour":e.setHours(e.getHours()+t);break;case"minute":e.setMinutes(e.getMinutes()+t);break;case"second":e.setSeconds(e.getSeconds()+t)}r=e.getTime()}return r}function _(e,t,n,a){let i=!1;const o=1/a/2*100;return n>=e-o&&n<=t+o&&(i=!0),i}function G(e,t,n){return(null==n?void 0:n.zoomLevel)===t&&0!==t?n.maxWidth/e:Math.pow(2,t)}function J(e,t,n){return e*G(e,t,n)}var X=l(26245);const K={_widgetLabel:"Timeline",overallTimeExtent:"Overall time extent",filteringApplied:"Timeline filtering applied",noTlFromHonoredMapWarning:"Oops! Seems like something went wrong with this map and we cannot get any valid time settings.",noSupportedLayersInMapWidget:"The map does not contain any time-aware data.",invalidTimeSpanWarning:"Please check the widget configurations to make sure the time span is valid.",timezoneWarning:"The Timeline widget is not available to use under the data time zone."};var q=l(64811),Q=l.n(q),Z=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(n[a[i]]=e[a[i]])}return n};const ee=e=>{const t=window.SVG,{className:n}=e,o=Z(e,["className"]),r=(0,i.classNames)("jimu-icon jimu-icon-component",n);return t?(0,a.jsx)(t,Object.assign({className:r,src:Q()},o)):(0,a.jsx)("svg",Object.assign({className:r},o))};var te=l(72259),ne=l.n(te),ae=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(n[a[i]]=e[a[i]])}return n};const ie=e=>{const t=window.SVG,{className:n}=e,o=ae(e,["className"]),r=(0,i.classNames)("jimu-icon jimu-icon-component",n);return t?(0,a.jsx)(t,Object.assign({className:r,src:ne()},o)):(0,a.jsx)("svg",Object.assign({className:r},o))};var oe=l(45508),re=l.n(oe),se=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(n[a[i]]=e[a[i]])}return n};const le=e=>{const t=window.SVG,{className:n}=e,o=se(e,["className"]),r=(0,i.classNames)("jimu-icon jimu-icon-component",n);return t?(0,a.jsx)(t,Object.assign({className:r,src:re()},o)):(0,a.jsx)("svg",Object.assign({className:r},o))};var ce=l(97408),ue=l.n(ce),de=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(n[a[i]]=e[a[i]])}return n};const me=e=>{const t=window.SVG,{className:n}=e,o=de(e,["className"]),r=(0,i.classNames)("jimu-icon jimu-icon-component",n);return t?(0,a.jsx)(t,Object.assign({className:r,src:ue()},o)):(0,a.jsx)("svg",Object.assign({className:r},o))};var pe=l(40904),he=l.n(pe),ge=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(n[a[i]]=e[a[i]])}return n};const fe=e=>{const t=window.SVG,{className:n}=e,o=ge(e,["className"]),r=(0,i.classNames)("jimu-icon jimu-icon-component",n);return t?(0,a.jsx)(t,Object.assign({className:r,src:he()},o)):(0,a.jsx)("svg",Object.assign({className:r},o))};var ve=l(12033),ye=l.n(ve),we=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(n[a[i]]=e[a[i]])}return n};const xe=e=>{const t=window.SVG,{className:n}=e,o=we(e,["className"]),r=(0,i.classNames)("jimu-icon jimu-icon-component",n);return t?(0,a.jsx)(t,Object.assign({className:r,src:ye()},o)):(0,a.jsx)("svg",Object.assign({className:r},o))};var be=l(62241),Se=l.n(be),je=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(n[a[i]]=e[a[i]])}return n};const Me=e=>{const t=window.SVG,{className:n}=e,o=je(e,["className"]),r=(0,i.classNames)("jimu-icon jimu-icon-component",n);return t?(0,a.jsx)(t,Object.assign({className:r,src:Se()},o)):(0,a.jsx)("svg",Object.assign({className:r},o))};var De=l(75102),Te=l.n(De),ke=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(n[a[i]]=e[a[i]])}return n};const Oe=e=>{const t=window.SVG,{className:n}=e,o=ke(e,["className"]),r=(0,i.classNames)("jimu-icon jimu-icon-component",n);return t?(0,a.jsx)(t,Object.assign({className:r,src:Te()},o)):(0,a.jsx)("svg",Object.assign({className:r},o))};var Re=l(1888);const Ce=l(44383),Ee=Object.assign({},K,i.defaultMessages,r.defaultMessages);const Ne=()=>{const e=(0,i.useIntl)();return i.React.useCallback((t,n)=>e.formatMessage({id:t,defaultMessage:Ee[t]},n),[e])},Ie=function(o){const{width:s,height:l,applied:c,timeStyle:u=e.Classic,foregroundColor:d,backgroundColor:h,sliderColor:g,theme:f,startTime:v,endTime:y,accuracy:w="year",stepLength:x,dividedCount:b,displayStrategy:S=n.current,enablePlayControl:j=!1,speed:D=t.Medium,autoPlay:O,dateTimePattern:I,updating:L=!1,onTimeChanged:P,onApplyStateChanged:z}=o,[V,W]=i.React.useState(s),[U,F]=i.React.useState(l);i.React.useEffect(()=>{W(s-(u===e.Classic?64:80)),F(u===e.Classic?52:80)},[s,l,u]);const[A,_]=i.React.useState(0),[K,q]=i.React.useState(null),Q=(0,i.useIntl)(),Z=Ne(),te=i.React.useMemo(()=>[{value:t.Slowest,label:Z("slowest")},{value:t.Slow,label:Z("slow")},{value:t.Medium,label:Z("medium")},{value:t.Fast,label:Z("fast")},{value:t.Fastest,label:Z("fastest")}],[]),[ne,ae]=i.React.useState(D);i.React.useEffect(()=>{ae(D)},[D]);const[oe,re]=i.React.useState(O||!1),se=i.React.useRef(null),ce=i.React.useRef(null),[ue,de]=i.React.useState(null),[pe,he]=i.React.useState(0),[ge,ve]=i.React.useState(v),[ye,we]=i.React.useState(null),[be,Se]=i.React.useState(null),[je,De]=i.React.useState(null),[Te,ke]=i.React.useState(null),[Ee,Ie]=i.React.useState(null),[Le,Pe]=i.React.useState(null),ze=i.React.useRef(null),Ve=i.React.useRef(null),We=i.React.useRef(null),Ue=i.React.useRef(null),Fe=i.React.useRef(null),Ae=i.React.useRef(null),[$e,Be]=i.React.useState(!1),He=i.React.useRef(!1),Ye=e=>{window.jimuConfig.isInBuilder&&He.current&&e.key.includes("Arrow")&&e.preventDefault()};i.React.useEffect(()=>{function e(e){He.current=!0}function t(e){He.current=!1}function n(e){e.edges={left:!0},_e(e)}function a(e){e.edges={right:!0},_e(e)}return se.current.addEventListener("mousedown",Ze),Ve.current?(Ve.current.addEventListener("keyup",n,!0),Ve.current.addEventListener("focus",e,!0),Ve.current.addEventListener("blur",t,!0)):(We.current.addEventListener("keyup",n,!0),Ue.current.addEventListener("keyup",a,!0),We.current.addEventListener("focus",e,!0),We.current.addEventListener("blur",t,!0),Ue.current.addEventListener("focus",e,!0),Ue.current.addEventListener("blur",t,!0)),document.body.addEventListener("keydown",Ye,{passive:!1}),()=>{var i;null===(i=se.current)||void 0===i||i.removeEventListener("mousedown",Ze),null==Ee||Ee.unset(),null==Le||Le.unset(),Ve.current?(Ve.current.removeEventListener("keyup",n,!0),Ve.current.removeEventListener("focus",e,!0),Ve.current.removeEventListener("blur",t,!0)):We.current&&Ue.current&&(We.current.removeEventListener("keyup",n,!0),Ue.current.removeEventListener("keyup",a,!0),We.current.removeEventListener("focus",e,!0),We.current.removeEventListener("blur",t,!0),Ue.current.removeEventListener("focus",e,!0),Ue.current.removeEventListener("blur",t,!0)),document.body.removeEventListener("keydown",Ye)}},[]);const _e=i.hooks.useEventCallback(e=>{if(e.key.includes("Arrow")){e.preventDefault();const t="ArrowLeft"===e.key||"ArrowTop"===e.key?-1:1,n=Xe();let a=n.startValue,i=n.endValue;if(x)e.edges.left?a=H(x.unit,new Date(n.startValue),t*x.val):i=H(x.unit,new Date(n.endValue),t*x.val);else{const o=(n.extent[1]-n.extent[0])/b;e.edges.left?a+=t*o:i+=t*o}e.edges.left?(a=Math.max(n.extent[0],a),a=Math.min(a,i)):(i=Math.min(n.extent[1],i),i=Math.max(a,i)),ot(a,i)}});i.React.useEffect(()=>{if(ze.current){Ie(B(X.interact,ze.current,Xe,ot,rt));const e={interact:X.interact,dragRef:ze.current,getDragProps:Ke,resizeHandlerDragging:ot,resizeHandlerDragend:rt};Pe($(e))}},[u]),i.React.useEffect(()=>{ce.current={left:0,x:0},Be(!1),he(0),_(0),re(O),Se(null),ve(v);const e=S===n.current?Y(v,y,v,x,b):v;we(e),P(v,e)},[O,j,v,S,y,w,x,b]),i.React.useEffect(()=>{const e=M({width:J(V,A,K),startTime:v,endTime:y,accuracy:w});de(e)},[V,v,y,w,A,K]),i.React.useEffect(()=>{const e=function(e,t,n,a){if(e<0)return;const i=(n-t)/m[a]/1e3,o=Math.max(e,32*i);let r=0;for(;J(e,r)<o||30===r;)r++;return{maxWidth:o,zoomLevel:r}}(V,v,y,w);q(e)},[V,v,y,w]);const Ge=i.ReactRedux.useSelector(e=>{var t,n;return oe?(null===(t=e.appRuntimeInfo)||void 0===t?void 0:t.appMode)===i.AppMode.Design||(null===(n=e.appRuntimeInfo)||void 0===n?void 0:n.isPrintPreview):null}),Je=i.React.useRef(Ge),Xe=i.hooks.useEventCallback(()=>({startValue:je||ge,endValue:Te||be||ye,extent:[v,y],width:J(V,A,K),accuracy:w,stepLength:x,dividedCount:b})),Ke=i.hooks.useEventCallback(()=>({startValue:je||ge,endValue:Te||ye,extent:[v,y],width:J(V,A,K),accuracy:w,stepLength:x,dividedCount:b})),qe=i.hooks.useEventCallback(e=>{i.lodash.debounce(()=>{if(je)return;const t=G(V,A,K),n=e.clientX-ce.current.x;let a=ce.current.left-n/(t*V)*100;a=Math.min(a/100,(t-1)/t),a=a<0?0:a,he(100*a)},50)()}),Qe=i.hooks.useEventCallback(()=>{se.current.style.cursor="grab",se.current.style.removeProperty("user-select"),document.removeEventListener("mousemove",qe),document.removeEventListener("mouseup",Qe)}),Ze=i.hooks.useEventCallback(e=>{0!==A&&"BUTTON"!==e.target.tagName&&(se.current.style.cursor="grabbing",se.current.style.userSelect="none",ce.current={left:pe,x:e.clientX},document.addEventListener("mousemove",qe),document.addEventListener("mouseup",Qe))}),et=i.React.useCallback((e=ge,t=ye,n)=>{if(e<=v)return void he(0);const a=y-v,i=a/G(V,A,K),o=v+pe/100*a,r=o+i;let s;if(n&&(t<=o||e>=r))s=Math.min(e,y-i);else{if(n||!(e>=r||t<=o))return;s=Math.max(v,t-i)}he((s-v)/(y-v)*100)},[A,v,y,pe,ge,ye,V,K]),tt=i.React.useCallback(e=>{const t=A+(e?1:-1);if(0===t)return void he(0);const n=y-v,a=G(V,A,K),i=G(V,t,K),o=n/a,r=v+pe/100*n,s=r+o;let l=pe;const c=be||ye;if(c===y&&c===s)l=(i-1)/i*100;else if(ge<r&&c>r&&c<s)l=(c-(c-r)/(i/a)-v)/(y-v)*100;else{if(ge>=s||ye<=r&&ge!==ye||ge<r&&ye>s)l=(ge+(ye-ge)/2-o*a/i/2-v)/(y-v)*100;else{const t=(ge-v)/(y-v)*100-pe;l=e?pe+t/2:pe-t}}l=Math.max(0,l),l=Math.min(l,(i-1)/i*100),he(l)},[A,v,y,pe,V,ge,ye,be,K]),nt=i.React.useCallback(e=>{const t=Y(v,y,ye,x,b,e);let a=v,i=y;if(S===n.instant)e&&t>y||!e&&t<v?(a=v,i=v):(a=t,i=t),ve(a);else if(S===n.cumulatively){const n=e&&ye>=y,a=!e&&v===ye;if(e&&t>y)(be||b)&&e?(i=v,Se(null)):(i=t,Se(y));else{if(a)return;i=n?v:t,Se(null)}}else{const n=Y(v,y,ge,x,b,e),o=!e&&v===ge,r=!e&&n<v,s=e&&n>=y;if(n<y&&t>y)(be||b)&&e?(a=v,i=v+ye-ge,Se(null)):(a=n,i=t,Se(y));else{if(o)return;r||s?(a=v,i=v+ye-ge):(a=n,i=t),Se(null)}ve(a)}we(i),0!==A&&et(a,i,e),P(a,i)},[b,y,ye,v,ge,x,S,P,et]),at=i.React.useCallback(()=>{Fe.current&&(clearInterval(Fe.current),Fe.current=null)},[]),it=i.React.useCallback(()=>{at(),Fe.current=setInterval(()=>{L||nt(!0)},p[ne.toLowerCase()])},[ne,at,L,nt]);i.React.useEffect(()=>{if(!Fe.current){if(Ge||!oe||L)return void at();it()}return()=>{at()}},[oe,L,Ge,at,it]),i.React.useEffect(()=>{if(Je.current!==Ge&&null!==Ge){if(Je.current=Ge,Ge)return void at();oe&&!L&&it()}},[Ge,it,at,oe,L]);const ot=(e,t)=>{De(e),ke(t)},rt=(e,t,n)=>{ot(null,null),ve(e),we(t),Se(n),P(e,n||t)},st=i.React.useMemo(()=>{if(!ue)return null;const e=J(V,A,K),t={details:ue,width:e,localStartTime:v,localEndTime:y,leftPosition:pe,endPosition:V/e*100+pe,scale:e/V,intl:Q},n=T(t),o=k(t),r=R(t),s=C(t),l=E(t),c=N(t),u=function(e){const{tsDetails:t,years:n,months:a,days:i,hours:o,minutes:r,seconds:s}=e,l={labels:{},ticks:{}},c=[];n.length>1&&c.push("year"),a.length>1&&c.push("month"),i.length>1&&c.push("day"),o.length>1&&c.push("hour"),r.length>1&&c.push("minute"),s.length>1&&c.push("second");const u=c[c.length-1],d=Object.keys(t).filter(e=>t[e]);if(1===c.length)d.forEach(e=>{l.ticks[e]="medium",l.labels[e]="short"});else{if(2===c.length)l.ticks[u]="medium",d.forEach(e=>{e!==u&&(l.ticks[e]="long")});else{const e=c[c.length-2];l.ticks[u]="short",l.ticks[e]="medium",d.forEach(t=>{t!==u&&t!==e&&(l.ticks[t]="long")})}l.labels=l.ticks}return l}({tsDetails:ue,years:n,months:o,days:r,hours:s,minutes:l,seconds:c}),d=["year","month","day","hour","minute","second"];return(0,a.jsx)("div",{className:"timeline-ticks",children:[n,o,r,s,l,c].map((e,t)=>e.map((e,n)=>{const o=e.position,r=d[t];return(0,a.jsxs)("div",{className:"timeline-tick-container","data-unit":r,style:{left:o},children:[e.label&&(0,a.jsx)("div",{className:`timeline-tick_label ${u.labels[r]}-label ${"year"===r&&0===n&&0===pe?"timeline-first_label":""}`,children:e.label}),(0,a.jsx)("div",{className:(0,i.classNames)(`timeline-tick ${u.ticks[r]}-tick`,e.label?"has-label":"no-label")},n)]},`item-${t}-${n}`)}))})},[ue,A,pe]),lt=i.React.useMemo(()=>function(e,t,n,a,o){const r=(0,i.getAppStore)().getState().appContext.isRTL;return n=Re.colorUtils.parseThemeVariable(n||e.sys.color.surface.paperText,e),a=a||e.sys.color.surface.paper,o=Re.colorUtils.parseThemeVariable(o||e.sys.color.primary.main,e),i.css`
    height: fit-content;
    color: ${n};

    // Common style
    .timeline-header, .timeline-footer {
      height: 16px;
      display: flex;
      flex-direction: ${r?"row-reverse":"row"};
      align-items: center;
      justify-content: space-between;
      .zoom-container {
        min-width: 36px;
        display: flex;
        flex-direction: ${r?"row-reverse":"row"};
      }
      .range-label {
        display: flex;
        align-items: center;
        font-size: ${i.polished.rem(12)};
        font-weight: 500;
        line-height: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .range-label-badge {
          width: 8px;
          height: 8px;
          min-width: 8px;
          border-radius: 4px;
          margin-right: 0.25rem;
        }
      }
    }
    .timeline-content {
      overflow-x: hidden;

      .timeline-whole {
        .timeline-ticks {
          position: relative;
          .timeline-tick-container {
            position: absolute;
            user-select: none;
            .timeline-tick {
              width: 1px;
              background: ${Re.colorUtils.colorMixOpacity(n,.5)};
            }
            .timeline-tick_label {
              font-size: ${i.polished.rem(11)};
              font-weight: 400;
              line-height: 15px;
              width: max-content;
              transform: translate(${r?"50%":"-50%"});
              color: foregroundColor;
              &.long-label {
                font-weight: 600;
              }
              &.medium-label {
                font-weight: 500;
              }
              &.short-label {
                font-weight: 400;
              }
              &.timeline-first_label {
                /* transform: ${`translate(-${t}px)`}; */
                transform: translate(0);
              }
            }
          }
        }
      }

      .timeline-range-container {
        height: 8px;
        /* width: ${`calc(100% - ${2*t}px)`}; */
        width: 100%;
        border-radius: 4px;
        background-color: ${Re.colorUtils.colorMixOpacity(n,.2)};
        .resize-handlers {
          height: 100%;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          background-color: ${o};

          .resize-handler {
            width: 8px;
            height: 8px;
            padding: 0;
            overflow: visible;
            border-radius: 8px;
            background: ${o};
            border: 2px solid ${o};
            &.resize-instant {
              background: ${a};
            }
          }

          &:hover {
            .resize-handler {
              background: ${a};
            }
          }
        }
      }
      .timeline-arrow {
        position: absolute;
        &.left-arrow{
          transform: scaleX(-1);
        }
      }
    }
    .jimu-btn {
        color: ${n};
        border-radius: 16px;
        &:hover:not(:disabled) {
          color: ${n};
          background-color: ${Re.colorUtils.colorMixOpacity(n,.2)};
        }
        &.disabled {
          color: ${Re.colorUtils.colorMixOpacity(n,.2)};
          &:hover {
            color: ${Re.colorUtils.colorMixOpacity(n,.2)};
          }
        }
        .jimu-icon {
          margin: 0
        }

        .icon-btn-sizer {
          min-width: 0;
          min-height: 0;
        }
    }

    .jimu-dropdown-button {
      &:not(:disabled):not(.disabled):active,
      &[aria-expanded="true"]{
        border-color: transparent !important;
        color: unset !important;
      }
    }

    // Clasic style
    &.timeline-classic {
      padding: 1rem 1.5rem;
      .timeline-header .range-label {
        .range-label-badge {
          background-color: ${o};
        }
        .range-label-context {
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .timeline-content {
        margin: 1rem 0.5rem;
        .timeline-whole {
          .timeline-ticks {
            padding-top: 0.75rem;
            .timeline-tick-container {
              .timeline-tick {
                &.long-tick {
                  height: 12px;
                  &.no-label {
                    margin-top: 19px;
                  }
                  &.has-label {
                    margin-top: 0;
                  }
                }
                &.medium-tick {
                  height: 8px;
                  &.no-label {
                    margin-top: 23px;
                  }
                  &.has-label {
                    margin-top: 8px;
                  }
                }
                &.short-tick {
                  height: 4px;
                  &.no-label {
                    margin-top: 27px;
                  }
                  &.has-label {
                    margin-top: 12px;
                  }
                }
              }
              .timeline-tick_label {
                margin-bottom: 4px;
              }
            }
          }
          .timeline-arrow {
            top: 78px;
            &.left-arrow{
              left: ${r?"unset":"20px"};
              right: ${r?"20px":"unset"};
            }
            &.right-arrow{
              left: ${r?"20px":"unset"};
              right: ${r?"unset":"20px"};
            }
          }
        }
        .timeline-range-container .resize-handlers .resize-handler {
          min-width: 8px;
          &:focus {
            background: ${a};
            outline-offset: 0;
          }
        }
      }
      .timeline-footer {
        flex-direction: ${r?"row-reverse":"row"};
        .play-container {
          min-width: 65px;
        }
      }
    }

    // Modern style
    &.timeline-modern {
      padding: 1rem 0.5rem;
      height: 156px;

      .timeline-header{
        padding-top: 0;
        padding-bottom: 0;
        padding: 0 36px;
        &.no-play-container {
          padding-left: ${r?"12px":"36px"};
          padding-right: ${r?"36px":"12px"};
        }
        .range-label {
          margin: 0 0.25rem;
          .range-label-badge {
            background-color: ${Re.colorUtils.colorMixOpacity(o,.7)};
          }
        }
      }

      .timeline-content {
        display: flex;
        margin-top: 0.5rem;
          .timeline-left, .timeline-right {
            display: flex;
            height: 80px;
            .play-container {
              min-width: 17px; /* when play btn is hidden */
              display: flex;
              flex-direction: column;
              justify-content: center;
              .jimu-btn {
                margin: 0 0.5rem;
                &.next-btn {
                  margin-bottom: 0.5rem;
                }
                &.play-btn {
                  margin-top: 0.5rem;
                }
              }
            }
          }
        .timeline-middle {
          height: 115px;
          overflow-x: hidden;
          flex-grow: 1;
          .timeline-content-inside {
            border: 1px solid ${Re.colorUtils.colorMixOpacity(n,.5)};
            border-radius: 8px;
            .timeline-whole {
              display: flex;
              flex-direction: column;
              .timeline-ticks {
                .timeline-tick-container {
                  display: flex;
                  flex-direction: column-reverse;
                  .timeline-tick {
                    &.long-tick {
                      height: 32px;
                    }
                    &.medium-tick {
                      height: 16px;
                      margin-top: 16px;
                    }
                    &.short-tick {
                      height: 8px;
                      margin-top: 24px;
                    }
                  }
                  .timeline-tick_label {
                    margin-top: 0.5rem;
                  }
                }
              }
              .timeline-range-container {
                z-index: 1;
                width: 100%;
                background: transparent;
                .resize-handlers {
                  background-color: ${Re.colorUtils.colorMixOpacity(o,.7)};
                  .resize-handler {
                    min-width: 4px;
                    width: 4px;
                    height: calc(100% - 10px);
                    margin: 5px 0;
                    background: transparent;
                    border: none;
                    &.show-bg { /** When handlers.w = 0 */
                      background-color: ${Re.colorUtils.colorMixOpacity(o,.7)};
                      height: 100%;
                      margin: 0;
                      &:hover {
                        background-color: ${Re.colorUtils.colorMixOpacity(o,.9)};
                      }
                    }
                  }
                  &:hover {
                    .resize-handler {
                      background: ${Re.colorUtils.colorMixOpacity(o,.7)};

                    }
                  }
                }
              }
            }
          }
          .timeline-arrow {
            z-index: 2;
            top: 68px;
            &.left-arrow{
              left: 50px;
              left: ${r?"unset":"50px"};
              right: ${r?"50px":"unset"};
            }
            &.right-arrow{
              right: 50px;
              left: ${r?"50px":"unset"};
              right: ${r?"unset":"50px"};
              &.no-play-container {
                left: ${r?"25px":"unset"};
                right: ${r?"unset":"25px"};
              }
            }
          }
        }
      }
    }
  `}(f,7,d,h,g),[f,7,d,h,g]),ct=i.React.useMemo(()=>{const e=(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",size:"sm",disabled:0===A,onClick:()=>{tt(!1),_(Math.max(0,A-1))},children:(0,a.jsx)(ie,{})}),t=(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",size:"sm",disabled:A===(null==K?void 0:K.zoomLevel),onClick:()=>{tt(!0),_(Math.min(null==K?void 0:K.zoomLevel,A+1))},children:(0,a.jsx)(ee,{})});return(0,a.jsxs)("div",{className:"zoom-container",children:[0===A?e:(0,a.jsx)(r.Tooltip,{title:Z("zoomOut"),placement:"bottom",children:e}),A===(null==K?void 0:K.zoomLevel)?t:(0,a.jsx)(r.Tooltip,{title:Z("zoomIn"),placement:"bottom",children:t})]})},[A,Z,K,tt]),ut=i.React.useMemo(()=>j?(0,a.jsx)(r.Tooltip,{title:Z(oe?"pause":"play"),placement:"bottom",children:(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",size:"sm",className:"play-btn",onClick:()=>{re(!oe)},children:oe?(0,a.jsx)(fe,{}):(0,a.jsx)(me,{})})}):null,[j,oe,Z]),dt=i.React.useMemo(()=>(0,a.jsx)(r.Tooltip,{title:Z("previous"),placement:"bottom",children:(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",size:"sm",onClick:e=>{nt(!1)},children:(0,a.jsx)(xe,{})})}),[Z,nt]),mt=i.React.useMemo(()=>(0,a.jsx)(r.Tooltip,{title:Z("next"),placement:"bottom",children:(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",size:"sm",className:"next-btn",onClick:e=>{nt(!0)},children:(0,a.jsx)(Me,{})})}),[Z,nt]),pt=i.React.useMemo(()=>{const e=Q.formatDate(v,I),t=Q.formatDate(y,I);return(0,a.jsxs)(i.React.Fragment,{children:[(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",ref:e=>{Ae.current=e},"aria-label":Z("moreInfo"),"aria-haspopup":"true","aria-expanded":$e,onClick:e=>{Be(!$e)},children:(0,a.jsx)(le,{})}),(0,a.jsx)(r.Popper,{open:$e,keepMount:!0,arrowOptions:!0,reference:Ae,toggle:e=>{Be(!1),"Escape"===(null==e?void 0:e.key)&&i.lodash.defer(()=>{(0,i.focusElementInKeyboardMode)(Ae.current)})},children:(0,a.jsxs)("div",{className:"p-4",children:[(0,a.jsx)(r.Typography,{className:"mb-2",variant:"title2",children:Z("overallTimeExtent")}),(0,a.jsx)("div",{className:"mb-4",children:`${e} - ${t}`}),(0,a.jsxs)(r.Label,{check:!0,className:"d-flex align-items-center",children:[(0,a.jsx)(r.Typography,{className:"flex-grow-1 mb-0 mr-1",variant:"title3",children:Z("filteringApplied")}),(0,a.jsx)(r.Switch,{checked:c,onChange:(e,t)=>{z(t)}})]})]})})]})},[Z,v,y,Q,$e,c,I,z]),ht=i.React.useMemo(()=>(0,a.jsxs)(r.Dropdown,{menuRole:"listbox",activeIcon:!0,className:u===e.Classic?"":"justify-content-center","aria-label":Z("speed"),children:[(0,a.jsx)(r.Tooltip,{placement:"bottom",title:Z("speed"),"a11y-description":te.filter(e=>e.value===ne)[0].label,children:(0,a.jsx)(r.DropdownButton,{icon:!0,type:"tertiary",arrow:!1,children:(0,a.jsx)(Oe,{})})}),(0,a.jsx)(r.DropdownMenu,{children:te.map(e=>(0,a.jsx)(r.DropdownItem,{active:e.value===ne,onClick:()=>{ae(e.value)},children:e.label},e.value))})]}),[te,ne,u,Z]),gt=i.hooks.useEventCallback(e=>{const t=y-v,n=G(V,A,K);let a=(v+pe/100*t+(e?1:-1)*(t/n)-v)/(y-v)*100;a=Math.max(0,a),a=Math.min(a,(n-1)/n*100),he(a)}),ft=G(V,A,K),vt=(0,i.getAppStore)().getState().appContext.isRTL,yt=je||ge,wt=Te||be||ye,{startPositionForStep:xt,widthForStep:bt}=((t,n)=>{let a=(t-v)/(y-v),i=(n-v)/(y-v)-a;return t===y?(a=u===e.Classic?"calc(100% - 16px)":"calc(100% - 8px)",i=0):a=100*a+"%",{startPositionForStep:a,widthForStep:i}})(yt,wt),St=Q.formatDate(yt,I),jt=Q.formatDate(wt,I),Mt=0!==pe,Dt=100-pe-1/ft*100>1e-11,Tt=S===n.instant,kt=St+(Tt?"":" - "+jt);return(0,a.jsx)("div",{css:lt,dir:"ltr",className:(0,i.classNames)("timeline w-100",{"timeline-classic":u===e.Classic,"timeline-modern":u===e.Modern}),children:u===e.Classic?(0,a.jsxs)(i.React.Fragment,{children:[(0,a.jsxs)("div",{className:"timeline-header",children:[(0,a.jsxs)("div",{className:"range-label",dir:vt?"rtl":"ltr",children:[(0,a.jsx)("div",{className:"range-label-badge"}),(0,a.jsx)("div",{className:"range-label-context",children:kt})]}),ct]}),(0,a.jsx)("div",{className:"timeline-content",children:(0,a.jsxs)("div",{className:"timeline-content-inside",children:[(0,a.jsxs)("div",{className:"timeline-whole",ref:e=>{se.current=e},style:{width:100*ft+"%",height:U+"px",marginLeft:-pe*ft+"%"},children:[st,Mt&&(0,a.jsx)(r.Tooltip,{title:Z("slideBackward"),placement:"bottom",children:(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",size:"sm",className:"timeline-arrow left-arrow",onClick:e=>gt(!1),children:(0,a.jsx)(r.Icon,{width:4,height:16,icon:Ce})})}),Dt&&(0,a.jsx)(r.Tooltip,{title:Z("slideForward"),placement:"bottom",children:(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",size:"sm",className:"timeline-arrow right-arrow",onClick:e=>gt(!0),children:(0,a.jsx)(r.Icon,{width:4,height:16,icon:Ce})})})]}),(0,a.jsx)("div",{className:"timeline-range-container",style:{width:100*ft+"%",marginLeft:-pe*ft+"%"},children:(0,a.jsx)("div",{className:"resize-handlers",ref:e=>{ze.current=e},style:{marginLeft:xt,width:Tt?"fit-content":100*bt+"%"},children:Tt?(0,a.jsx)("button",{className:"resize-handler resize-instant",ref:e=>{Ve.current=e},title:St,"aria-label":St}):(0,a.jsxs)(i.React.Fragment,{children:[(0,a.jsx)("button",{className:"resize-handler resize-left",ref:e=>{We.current=e},title:St,"aria-label":St}),(0,a.jsx)("button",{className:"resize-handler resize-right",ref:e=>{Ue.current=e},title:jt,"aria-label":jt})]})})})]})}),(0,a.jsxs)("div",{className:"timeline-footer",children:[pt,(0,a.jsxs)("div",{className:"play-container",children:[dt,ut,mt]}),j?ht:(0,a.jsx)("div",{})]})]}):(0,a.jsxs)(i.React.Fragment,{children:[(0,a.jsxs)("div",{className:(0,i.classNames)("timeline-header",{"no-play-container":!j}),children:[pt,(0,a.jsxs)("div",{className:"range-label",dir:vt?"rtl":"ltr",children:[(0,a.jsx)("div",{className:"range-label-badge"}),kt]}),ct]}),(0,a.jsxs)("div",{className:"timeline-content",children:[(0,a.jsx)("div",{className:"timeline-left",children:(0,a.jsxs)("div",{className:"play-container",children:[mt,dt]})}),(0,a.jsxs)("div",{className:"timeline-middle",children:[Mt&&(0,a.jsx)(r.Tooltip,{title:Z("slideBackward"),placement:"bottom",children:(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",size:"sm",className:(0,i.classNames)("timeline-arrow left-arrow",{"no-play-container":!j}),onClick:e=>gt(!1),children:(0,a.jsx)(r.Icon,{width:4,height:16,icon:Ce})})}),(0,a.jsx)("div",{className:"timeline-content-inside",children:(0,a.jsxs)("div",{className:"timeline-whole",ref:e=>{se.current=e},style:{width:100*ft+"%",height:U+"px",marginLeft:-pe*ft+"%"},children:[(0,a.jsx)("div",{style:{height:U-32+"px"}}),st,(0,a.jsx)("div",{className:"timeline-range-container",style:{height:U+"px",marginTop:-(U-32)+"px"},children:(0,a.jsx)("div",{className:"resize-handlers",ref:e=>{ze.current=e},style:{marginLeft:xt,width:Tt?"fit-content":100*bt+"%"},children:Tt?(0,a.jsx)("button",{className:"resize-handler resize-instant",ref:e=>{Ve.current=e},title:St,"aria-label":St}):(0,a.jsxs)(i.React.Fragment,{children:[(0,a.jsx)("button",{className:"resize-handler resize-left "+(yt===wt?"show-bg":""),ref:e=>{We.current=e},title:St,"aria-label":St}),(0,a.jsx)("button",{className:"resize-handler resize-right "+(yt===wt?"show-bg":""),ref:e=>{Ue.current=e},title:jt,"aria-label":jt})]})})})]})}),Dt&&(0,a.jsx)(r.Tooltip,{title:Z("slideForward"),placement:"bottom",children:(0,a.jsx)(r.Button,{icon:!0,type:"tertiary",size:"sm",className:(0,i.classNames)("timeline-arrow right-arrow",{"no-play-container":!j}),onClick:e=>gt(!0),children:(0,a.jsx)(r.Icon,{width:4,height:16,icon:Ce})})})]}),(0,a.jsx)("div",{className:"timeline-right",children:(0,a.jsxs)("div",{className:"play-container",children:[j&&ht,ut]})})]})]})})};class Le extends i.BaseVersionManager{constructor(){super(...arguments),this.versions=[{version:"1.11.0",description:"",upgrader:e=>{let t=e;if(!t.honorTimeSettings)if(t.timeSettings){const{stepLength:e,dividedCount:n}=t.timeSettings;t=e?t.setIn(["timeSettings","stepLength","val"],Math.round(e.val)):t.setIn(["timeSettings","dividedCount"],Math.round(n))}else t=t.set("honorTimeSettings",!0);return t}},{version:"1.12.0",description:"",upgrader:e=>{let n=e;return n=n.without("speed"),!n.honorTimeSettings&&n.timeSettings&&(n=n.setIn(["timeSettings","speed"],t.Medium)),n}}]}}const Pe=new Le;class ze extends i.React.PureComponent{constructor(){super(...arguments),this.onDataSourceCreated=e=>{this.props.onCreateDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId,e)},this.onCreateDataSourceFailed=()=>{this.props.onCreateDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId,null)},this.onDataSourceInfoChange=e=>{this.props.onIsDataSourceNotReady(this.props.useDataSource.dataSourceId,null==e?void 0:e.status)}}componentWillUnmount(){this.props.onCreateDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId,null,!0),this.props.onIsDataSourceNotReady(this.props.useDataSource.dataSourceId,i.DataSourceStatus.NotReady)}render(){const{useDataSource:e}=this.props;return(0,a.jsx)(i.DataSourceComponent,{useDataSource:e,onDataSourceCreated:this.onDataSourceCreated,onCreateDataSourceFailed:this.onCreateDataSourceFailed,onDataSourceInfoChange:this.onDataSourceInfoChange})}}var Ve=function(e,t,n,a){return new(n||(n=Promise))(function(i,o){function r(e){try{l(a.next(e))}catch(e){o(e)}}function s(e){try{l(a.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n(function(e){e(t)})).then(r,s)}l((a=a.apply(e,t||[])).next())})};const We=Object.assign({},K,i.defaultMessages,r.defaultMessages),Ue=l(10307),Fe="156px",Ae=e=>{var t,s,l,c,u,p;const{useMapWidgetIds:f,useDataSources:v,theme:j,id:M,config:D,intl:T,autoWidth:k,autoHeight:O,controllerWidgetId:R,offPanel:C}=e,{addSourceByData:E=!0,enablePlayControl:N,applyFilteringByDefault:I=!0,autoPlay:L,enableDisplayAccuracy:P=!1,displayAccuracy:z,timeSettings:V,honorTimeSettings:W,dataSourceType:U,timeStyle:F,foregroundColor:A,backgroundColor:$,sliderColor:B}=D,H=E?null:f,Y=R&&C,{speed:_}=V||{},[G,J]=i.React.useState(null),[X,K]=i.React.useState(I),[q,Q]=i.React.useState(_),[Z,ee]=i.React.useState(null),te=i.React.useRef(null),[ne,ae]=i.React.useState(!1),[ie,oe]=i.React.useState(null),[re,se]=i.React.useState(null),[le,ce]=i.React.useState(null),[ue,de]=i.React.useState([]),[me,pe]=i.React.useState(!0),[he,ge]=i.React.useState(null),[fe,ve]=i.React.useState(null),ye=i.React.useRef(null),we=i.ReactRedux.useSelector(e=>{var t,n;return(null===(n=null===(t=e.appConfig.attributes)||void 0===t?void 0:t.timezone)||void 0===n?void 0:n.type)===i.TimezoneConfig.Data}),xe=i.React.useMemo(()=>o.MapViewManager.getInstance(),[]),be=i.React.useMemo(()=>i.DataSourceManager.getInstance(),[]),Se=i.React.useMemo(()=>{if(ue.length)return!1;const e=Object.keys(le||{}).sort();let t;if(null==H?void 0:H.length)t=!0;else{const n=(v||(0,i.Immutable)([])).map(e=>e.dataSourceId).asMutable({deep:!0});t=i.utils.diffArrays(!0,e,n).isEqual}return t},[H,le,v,ue]);i.React.useEffect(()=>{var e;return ge(Y?480:null===(e=ye.current)||void 0===e?void 0:e.clientWidth),(0,o.loadArcGISJSAPIModules)(["esri/core/reactiveUtils"]).then(e=>{se(e[0])}),()=>{Me(null,null,!0)}},[]),i.React.useEffect(()=>{ce(null),oe(null),ve(null)},[U]),i.React.useEffect(()=>{K(I)},[I]),i.React.useEffect(()=>{if(S(U))ae(!1),oe(v);else if((null==H?void 0:H.length)>0)if(te.current){const e={},t={dataSourceId:te.current,mainDataSourceId:te.current};be.createDataSourceByUseDataSource((0,i.Immutable)(t)).then(t=>Ve(void 0,void 0,void 0,function*(){if(te.current&&Z){const n=[];Object.keys(Z).forEach(e=>{n.push(Z[e].createLayerDataSource())}),yield Promise.all(n),e[t.id]=t,ce(e),ae(0===Object.keys(Z).length)}}))}else""===te.current?(ae(!0),ce(null)):(ae(!1),ce(null));else if((null==v?void 0:v.length)>0){ae(!1);const e=[];v.forEach(t=>{e.push(be.createDataSourceByUseDataSource((0,i.Immutable)(t)).then(e=>e.isDataSourceSet()&&!e.areChildDataSourcesCreated()?e.childDataSourcesReady().then(()=>e):e))}),Promise.all(e).then(e=>{const t={};e.forEach(e=>{t[e.id]=e}),ce(t)})}},[H,te,Z,v,be,U,oe,ce]),i.React.useEffect(()=>{if(le&&re&&Se)if(W){const e=function(e,t=!1){var a,i,o;let r=null;const s=e[Object.keys(e).filter(t=>y(e[t].type))[0]],l=null===(o=null===(i=null===(a=null==s?void 0:s.getItemData())||void 0===a?void 0:a.widgets)||void 0===i?void 0:i.timeSlider)||void 0===o?void 0:o.properties;if(l){const{startTime:e,endTime:a,timeStopInterval:i,numberOfStops:o,thumbMovingRate:s,thumbCount:c}=l;let u=e,d=a;if(t){const t=x(e,a,!0);u=t.startTime,d=t.endTime}if(r={speed:h(s),layerList:null,startTime:{value:u},endTime:{value:d},timeDisplayStrategy:2===c?n.current:n.cumulatively},i){const e=function(e){switch(e){case"esriTimeUnitsMonths":return"month";case"esriTimeUnitsDays":return"day";case"esriTimeUnitsHours":return"hour";case"esriTimeUnitsMinutes":return"minute";default:return"year"}}(i.units);r.accuracy=e,r.stepLength={val:i.interval,unit:e}}else if(o){r.dividedCount=o;const e=b(u,d);r.accuracy=e[0];const t=(d-u)/o;e.some(e=>t>=1e3*m[e]&&(r.accuracy=e,!0))}}return r}(le,!0);Q(null==e?void 0:e.speed),ve(e)}else{const e=g(V,le,!0);Q(_),ve(e)}},[le,re,W,_,V,Se]);const je=(e,t)=>{let n=null;return Object.keys(e.jimuLayerViews).forEach(a=>{e.jimuLayerViews[a].layerDataSourceId===t&&(n=e.jimuLayerViews[a])}),n},Me=i.hooks.useEventCallback((e,t,n=!1)=>{var a;if(!le)return;const i={time:n?null:[e,t]};if(!n){const n=x(e,t);i.time=[n.startTime,n.endTime]}if(n||(()=>{let e=[],t=null;const n=[];if(null==H?void 0:H.length)Z&&Object.keys(Z).forEach(e=>{var t;(null===(t=Z[e])||void 0===t?void 0:t.view)&&n.push(re.whenOnce(()=>!Z[e].view.updating))});else{const a=xe.getAllJimuMapViewIds();y(U)?(t=le[Object.keys(le)[0]],e=t.getAllChildDataSources().map(e=>e.id)):e=Object.keys(le),e.forEach(e=>{var i;const o=t||(null===(i=le[e])||void 0===i?void 0:i.getRootDataSource());if(y(null==o?void 0:o.type)){const t=a.filter(e=>xe.getJimuMapViewById(e).dataSourceId===o.id);t.forEach(t=>{const a=xe.getJimuMapViewById(t),i=je(a,e);(null==i?void 0:i.view)&&n.push(re.whenOnce(()=>!i.view.updating))})}})}Promise.all(n).then(e=>{pe(!1)})})(),y(U))if(null==H?void 0:H.length)Object.keys(Z).forEach(e=>{const t=Z[e].getLayerDataSource();t&&De(t,i,e)});else{const e=w(le,null===(a=D.timeSettings)||void 0===a?void 0:a.layerList);Object.keys(e).forEach(t=>{De(e[t],i,M)})}else Object.keys(le).forEach(e=>{le[e]&&De(le[e],i,M)})});i.React.useEffect(()=>{G&&Me(G[0],G[1],!X)},[G,X,Me]);const De=(e,t,n)=>{var a,o,r,s;e.type===i.DataSourceTypes.MapService?(null===(a=e.supportTime)||void 0===a?void 0:a.call(e))&&(t=Te(e,t),null===(o=e.changeTimeExtent)||void 0===o||o.call(e,t.time,n)):S(e.type)&&(null===(r=e.supportTime)||void 0===r?void 0:r.call(e))&&(t=Te(e,t),null===(s=e.updateQueryParams)||void 0===s||s.call(e,t,n))},Te=(e,t)=>{var n;const a=(null===(n=e.getTimeInfo())||void 0===n?void 0:n.exportOptions)||{},{TimeOffset:i=0,timeOffsetUnits:o}=a;if((null==t?void 0:t.time)&&0!==i){let e=t.time[0],n=t.time[1];const a=new Date(e),r=new Date(n);switch(o){case"esriTimeUnitsCenturies":case"esriTimeUnitsDecades":case"esriTimeUnitsYears":const t="esriTimeUnitsCenturies"===o?100:"esriTimeUnitsDecades"===o?10:1;e=a.setFullYear(a.getFullYear()-i*t),n=r.setFullYear(r.getFullYear()-i*t);break;case"esriTimeUnitsMonths":e=a.setMonth(a.getMonth()-i),n=r.setMonth(r.getMonth()-i);break;case"esriTimeUnitsWeeks":case"esriTimeUnitsDays":const s="esriTimeUnitsWeeks"===o?7:1;e=a.setDate(a.getDate()-i*s),n=r.setDate(r.getDate()-i*s);break;case"esriTimeUnitsHours":e=a.setHours(a.getHours()-i),n=r.setHours(r.getHours()-i);break;case"esriTimeUnitsMinutes":e=a.setMinutes(a.getMinutes()-i),n=r.setMinutes(r.getMinutes()-i);break;case"esriTimeUnitsSeconds":e=a.setSeconds(a.getSeconds()-i),n=r.setSeconds(r.getSeconds()-i);break;case"esriTimeUnitsMilliseconds":e=a.setMilliseconds(a.getMilliseconds()-i),n=r.setMilliseconds(r.getMilliseconds()-i)}t.time=[e,n]}return t},ke=({width:t,height:n})=>{var a,o,r,s;if(k){const{layoutId:n,layoutItemId:l}=e,c=(0,i.getAppStore)().getState(),u=null===(s=null===(r=null===(o=null===(a=null==c?void 0:c.appConfig)||void 0===a?void 0:a.layouts)||void 0===o?void 0:o[n])||void 0===r?void 0:r.content)||void 0===s?void 0:s[l];if(!u)return;const d=u.bbox.width;if(d.includes("px"))t=d;else{const e=`div.layout[data-layoutid=${n}]`,a=document.querySelector(e),{clientWidth:i=480}=a||{};t=i*parseInt(d.split("%")[0])/100}}ge(t)},Oe=i.React.useMemo(()=>null!==le&&Object.keys(le).filter(e=>null===le[e]).length===Object.keys(le).length,[le]),Re=ue.length>0,Ce=(e,t)=>{S(U)&&le&&le[e]&&le[e].getDataSourceJson().isOutputFromWidget&&Ne(e,t)},Ee=(e,t,n=!1)=>{S(U)&&ce(a=>{const o=t||(null==a?void 0:a[e]);if((null==o?void 0:o.getDataSourceJson().isOutputFromWidget)&&Ne(e,t?o.getInfo().status:i.DataSourceStatus.Unloaded),!a&&!t&&n)return a;const r=Object.assign({},a);return t||!(null==a?void 0:a[e])&&null!==(null==a?void 0:a[e])?r[e]=t:delete r[e],t&&t.getDataSourceJson().arcadeScript&&!t.supportTime()&&(r[e]=null),r})},Ne=(e,t)=>{de(n=>{let a=[];return a=t===i.DataSourceStatus.NotReady?n.includes(e)?n:n.concat(e):n.includes(e)?n.filter(t=>t!==e):n,a})},Le=e=>{(null==e?void 0:e.view)&&e.dataSourceId?(te.current=e.dataSourceId,Pe(e.id).then(e=>{ee(e)})):(te.current="",ee(null))},Pe=e=>Ve(void 0,void 0,void 0,function*(){const t=o.MapViewManager.getInstance().getJimuMapViewById(e),n=yield t.whenAllJimuLayerViewLoaded(),a={};return Object.keys(n).forEach(e=>{"sublayer"!==n[e].layer.type&&n[e].supportTime()&&(a[e]=n[e])}),a}),Ae=()=>{let e="";return e=Oe?"dataSourceCreateError":Re?"outputDatasAreNotGenerated":ne?"noSupportedLayersInMapWidget":Ye?"noTlFromHonoredMapWarning":we?"timezoneWarning":"invalidTimeSpanWarning",(0,a.jsxs)("div",{className:"placeholder-container w-100 h-100 position-relative",children:[Be(),(0,a.jsx)(r.Alert,{form:"tooltip",size:"small",type:"warning",withIcon:!0,className:"position-absolute",style:{bottom:10,right:10},text:$e(e)})]})},$e=e=>T.formatMessage({id:e,defaultMessage:We[e]}),Be=()=>(0,a.jsx)(r.WidgetPlaceholder,{className:"timeline-placeholder",icon:Ue,widgetId:M,css:i.css`
          width: ${Y?"480px":"inherit"};
          height: ${O||Y?Fe:"100%"};
        `,name:$e("_widgetLabel")}),He=i.React.useMemo(()=>function(e){const t={second:"2-digit",minute:"2-digit",hour:"2-digit",day:"numeric",month:"numeric",year:"numeric"},n={};return d.some(a=>(n[a]=t[a],a===e)),n}(P?z:"second"),[P,z]),Ye=le&&y(U)&&re&&null===fe,_e=(null===(t=null==fe?void 0:fe.startTime)||void 0===t?void 0:t.value)>(null===(s=null==fe?void 0:fe.endTime)||void 0===s?void 0:s.value),Ge=Oe||Re||ne||Ye||_e||we;return!E&&0===(H||[]).length||E&&(!v||0===v.length)||!Re&&fe&&(null===(l=null==fe?void 0:fe.startTime)||void 0===l?void 0:l.value)===(null===(c=null==fe?void 0:fe.endTime)||void 0===c?void 0:c.value)?Be():(0,a.jsxs)(i.React.Fragment,{children:[(null==H?void 0:H.length)>0&&(0,a.jsx)(o.JimuMapViewComponent,{useMapWidgetId:H[0],onActiveViewChange:Le}),(null==ie?void 0:ie.length)>0&&(null==ie?void 0:ie.map(e=>(0,a.jsx)(ze,{useDataSource:e,onIsDataSourceNotReady:Ce,onCreateDataSourceCreatedOrFailed:Ee},e.dataSourceId))),Ge?Ae():E||null!==le?(0,a.jsxs)(r.Paper,{shape:Y?"shape2":"none",className:"timeline-widget",css:i.css`
                    width: ${Y||k?he+"px":"unset"};
                    height: ${Y||O&&!le?Fe:"unset"};
                    background: ${$||j.sys.color.surface.paper};
                  `,ref:e=>{ye.current=e},children:[!Y&&(0,a.jsx)(i.ReactResizeDetector,{targetRef:ye,handleWidth:!0,onResize:ke}),null!==le&&Se?fe&&he>=0&&(0,a.jsx)(Ie,{theme:j,width:he,updating:!!le&&Object.keys(le).filter(e=>{var t;return(null===(t=le[e])||void 0===t?void 0:t.getInfo().status)===i.DataSourceStatus.Loading}).length>0||me,startTime:null===(u=fe.startTime)||void 0===u?void 0:u.value,endTime:null===(p=fe.endTime)||void 0===p?void 0:p.value,accuracy:fe.accuracy,stepLength:fe.stepLength,dividedCount:fe.dividedCount,displayStrategy:fe.timeDisplayStrategy,timeStyle:F,foregroundColor:A,backgroundColor:$,sliderColor:B,enablePlayControl:N,speed:q,autoPlay:L,dateTimePattern:He,applied:X,onTimeChanged:(e,t)=>{J([e,t])},onApplyStateChanged:e=>{K(e)}}):(0,a.jsx)("div",{className:"jimu-secondary-loading",css:i.css`position: 'absolute';left: '50%';top: '50%';`})]}):Be()]})};Ae.versionManager=Pe;const $e=Ae;function Be(e){l.p=e}})(),c})())}}});