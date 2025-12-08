System.register(["jimu-core/emotion","jimu-core","jimu-ui","jimu-core/react","jimu-arcgis","jimu-layouts/layout-runtime","jimu-theme"],function(e,t){var i={},a={},o={},s={},n={},r={},l={};return{setters:[function(e){i.jsx=e.jsx,i.jsxs=e.jsxs},function(e){a.AnimationDirection=e.AnimationDirection,a.AnimationEffectType=e.AnimationEffectType,a.AnimationType=e.AnimationType,a.AppMode=e.AppMode,a.BaseVersionManager=e.BaseVersionManager,a.BrowserSizeMode=e.BrowserSizeMode,a.Immutable=e.Immutable,a.React=e.React,a.ReactRedux=e.ReactRedux,a.ReactResizeDetector=e.ReactResizeDetector,a.TransitionContainer=e.TransitionContainer,a.TransitionDirection=e.TransitionDirection,a.TransitionType=e.TransitionType,a.ViewVisibilityContext=e.ViewVisibilityContext,a.appActions=e.appActions,a.classNames=e.classNames,a.css=e.css,a.defaultMessages=e.defaultMessages,a.getAppStore=e.getAppStore,a.hooks=e.hooks,a.indexedDBUtils=e.indexedDBUtils,a.loadArcGISJSAPIModules=e.loadArcGISJSAPIModules,a.lodash=e.lodash,a.polished=e.polished,a.utils=e.utils},function(e){o.Button=e.Button,o.Card=e.Card,o.CardBody=e.CardBody,o.DistanceUnits=e.DistanceUnits,o.Dropdown=e.Dropdown,o.DropdownButton=e.DropdownButton,o.DropdownItem=e.DropdownItem,o.DropdownMenu=e.DropdownMenu,o.FontFamilyValue=e.FontFamilyValue,o.Image=e.Image,o.ImageFillMode=e.ImageFillMode,o.NavButtonGroup=e.NavButtonGroup,o.Paper=e.Paper,o.Select=e.Select,o.TextInput=e.TextInput,o.defaultMessages=e.defaultMessages,o.utils=e.utils},function(e){s.Fragment=e.Fragment},function(e){n.JimuMapViewComponent=e.JimuMapViewComponent,n.loadArcGISJSAPIModules=e.loadArcGISJSAPIModules},function(e){r.LayoutEntry=e.LayoutEntry},function(e){l.useTheme=e.useTheme}],execute:function(){e((()=>{var e={1888:e=>{"use strict";e.exports=l},14321:e=>{"use strict";e.exports=o},21210:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M13 6.133c0 .598-.28 1.46-.825 2.51-.53 1.02-1.247 2.102-1.981 3.102A46 46 0 0 1 8 14.492a48 48 0 0 1-2.194-2.747c-.734-1-1.451-2.081-1.98-3.102C3.28 7.593 3 6.731 3 6.133 3 3.277 5.26 1 8 1s5 2.277 5 5.133m1 0c0 2.685-3.768 7.311-5.332 9.115C8.258 15.722 8 16 8 16s-.258-.279-.668-.751C5.768 13.444 2 8.817 2 6.133 2 2.746 4.686 0 8 0s6 2.746 6 6.133M10 5.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0m1 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0" clip-rule="evenodd"></path></svg>'},23662:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M7.5 0a.5.5 0 0 0-.5.5V7H.5a.5.5 0 0 0 0 1H7v6.5a.5.5 0 0 0 1 0V8h6.5a.5.5 0 0 0 0-1H8V.5a.5.5 0 0 0-.5-.5"></path></svg>'},30655:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M2.146 4.653a.485.485 0 0 1 .708 0L8 10.24l5.146-5.587a.485.485 0 0 1 .708 0 .54.54 0 0 1 0 .738l-5.5 5.956a.485.485 0 0 1-.708 0l-5.5-5.956a.54.54 0 0 1 0-.738" clip-rule="evenodd"></path></svg>'},37568:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M11.347 2.146a.485.485 0 0 1 0 .708L5.76 8l5.587 5.146a.486.486 0 0 1 0 .708.54.54 0 0 1-.738 0l-5.956-5.5a.485.485 0 0 1 0-.708l5.956-5.5a.54.54 0 0 1 .738 0" clip-rule="evenodd"></path></svg>'},38796:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M4 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0m1.5-.5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1zM3 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m1-4a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8A.5.5 0 0 1 5 8m.5 3.5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1z" clip-rule="evenodd"></path></svg>'},40904:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M5 1H4v14h1zm7 0h-1v14h1z" clip-rule="evenodd"></path></svg>'},41496:e=>{"use strict";e.exports=r},52943:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M4.653 13.854a.485.485 0 0 1 0-.708L10.24 8 4.653 2.854a.485.485 0 0 1 0-.708.54.54 0 0 1 .738 0l5.956 5.5a.485.485 0 0 1 0 .708l-5.956 5.5a.54.54 0 0 1-.738 0" clip-rule="evenodd"></path></svg>'},54855:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjU2cHgiIGhlaWdodD0iMjU2cHgiIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiB2ZXJzaW9uPSIxLjEiPg0KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTY3LjAwMDAwMCwgLTY1Ny4wMDAwMDApIiBmaWxsPSIjQzVDNUM1Ij4NCiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2Ny4wMDAwMDAsIDY1Ny4wMDAwMDApIj4NCiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTczLjcxNDI4Niw4OSBMMjU2LDE5OCBMMCwxOTggTDY0LDExNi4yNSBMMTA5LjcxNDI4NiwxNzAuNzUgTDE3My43MTQyODYsODkgWiBNOTksNTggQzEwNy44MzY1NTYsNTggMTE1LDY1LjE2MzQ0NCAxMTUsNzQgQzExNSw4Mi44MzY1NTYgMTA3LjgzNjU1Niw5MCA5OSw5MCBDOTAuMTYzNDQ0LDkwIDgzLDgyLjgzNjU1NiA4Myw3NCBDODMsNjUuMTYzNDQ0IDkwLjE2MzQ0NCw1OCA5OSw1OCBaIi8+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4="},62686:e=>{"use strict";e.exports=n},67386:e=>{"use strict";e.exports=i},68972:e=>{"use strict";e.exports=s},79244:e=>{"use strict";e.exports=a},79703:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0M6.25 5.621a.6.6 0 0 1 .933-.5l3.568 2.38a.6.6 0 0 1 0 .998l-3.568 2.38a.6.6 0 0 1-.933-.5z" clip-rule="evenodd"></path></svg>'},81594:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="m2.556 4.75.297 9.75c0 .398.164.78.455 1.06.292.282.688.44 1.1.44h7.184c.412 0 .808-.158 1.1-.44.291-.28.455-.662.455-1.06l.297-9.75zm4.333 8.222a.778.778 0 1 1-1.556 0V7.778a.778.778 0 1 1 1.556 0zm3.667 0a.778.778 0 1 1-1.556 0V7.778a.778.778 0 1 1 1.556 0zM12.058 2.5a1 1 0 0 1-.766-.357l-.659-.786A1 1 0 0 0 9.867 1H6.133a1 1 0 0 0-.766.357l-.659.786a1 1 0 0 1-.766.357H2a1 1 0 0 0-1 1V4h14v-.5a1 1 0 0 0-1-1z"></path></svg>'},94064:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M13.854 11.347a.486.486 0 0 1-.708 0L8 5.76l-5.146 5.587a.485.485 0 0 1-.708 0 .54.54 0 0 1 0-.738l5.5-5.956a.485.485 0 0 1 .708 0l5.5 5.956a.54.54 0 0 1 0 .738" clip-rule="evenodd"></path></svg>'}},t={};function d(i){var a=t[i];if(void 0!==a)return a.exports;var o=t[i]={exports:{}};return e[i](o,o.exports,d),o.exports}d.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return d.d(t,{a:t}),t},d.d=(e,t)=>{for(var i in t)d.o(t,i)&&!d.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},d.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),d.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},d.p="";var c={};return d.p=window.jimuConfig.baseUrl,(()=>{"use strict";d.r(c),d.d(c,{Widget:()=>Ie,__set_webpack_public_path__:()=>Me,default:()=>Ce});var e,t,i,a,o,s,n,r=d(67386),l=d(79244),m=d(14321);!function(e){e.Horizon="HORIZON",e.Vertical="VERTICAL"}(e||(e={})),function(e){e.Scroll="SCROLL",e.Paging="PAGING"}(t||(t={})),function(e){e.All="ALL",e.Selected="SELECTED"}(i||(i={})),function(e){e.Card="CARD",e.List="LIST",e.Slide1="SLIDE1",e.Slide2="SLIDE2",e.Slide3="SLIDE3",e.Gallery="GALLERY",e.Navigator="NAVIGATOR",e.Custom1="CUSTOM1",e.Custom2="CUSTOM2"}(a||(a={})),function(e){e.Default="DEFAULT",e.Regular="REGULAR",e.Hover="HOVER"}(o||(o={})),function(e){e.Snapshot="SNAPSHOT",e.Custom="CUSTOM"}(s||(s={})),function(e){e.HonorMap="HONOR_MAP",e.Custom="CUSTOM"}(n||(n={}));const p=35;var u=function(e,t,i,a){return new(i||(i=Promise))(function(o,s){function n(e){try{l(a.next(e))}catch(e){s(e)}}function r(e){try{l(a.throw(e))}catch(e){s(e)}}function l(e){var t;e.done?o(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(n,r)}l((a=a.apply(e,t||[])).next())})};const h=l.utils.getLocalStorageAppKey(),g=(e,t)=>`${h}-bookmark-${e}-bookmarks-${t||"default"}`,y=(e,t)=>{const i=((e,t)=>`${h}-${e}-${t||"default"}-RtBmArray`)(e,t),a=g(e,t);return JSON.parse(l.utils.readLocalStorage(a)||l.utils.readLocalStorage(i))||[]};function v(e,t){return e.unit===m.DistanceUnits.PERCENTAGE?e.distance/100*t:e.distance}function k(e,t,i,a){const o=function(e,t,i,a){const o=t-24,s=e+10,n=Math.floor(o/s)||1;if(0===i&&0===a)return Math.min(n,3);{const e=Math.max(i,a);return Math.min(n,e)}}(e,t,i,a);return(t-o*(e+10)-24)/2}const f=(e,t)=>![a.Custom1,a.Custom2].includes(e.templateType)&&e.displayFromWeb?e.bookmarks.concat(t):e.bookmarks,x={_widgetLabel:"Bookmark",_widgetDescription:"A widget identify specific geographic locations and save to refer later.",addBookmark:"Add bookmark",addBookmarkAriaLabel:"Click to add a new bookmark based on the current map status",layoutTips:"This is the customizable area",bookmarkList:"Bookmark list",graphicLayer:"Bookmark graphics layer",previousBookmark:"Click to view the previous bookmark",nextBookmark:"Click to view the next bookmark"};var b=d(68972),w=d(62686),j=d(41496),S=d(1888);function N(t){const{theme:i,direction:a,galleryItemWidth:o,galleryItemHeight:s,galleryItemSpace:r,cardBackground:d,displayName:c,isWebMap:m,itemSizeType:u,widgetRect:h}=t,g=a===e.Horizon,y=g&&void 0===o,v=d?`background-color: ${d} !important;`:"",k=u===n.HonorMap,f=(e,t,i,a,o,s)=>{if(t){if(e){let e;return o?(e=s-24,(a?e-p:e)+"px"):(e=s-24-2,(a?e-p:e)/31*57+2+"px")}return`${i||200}px !important`}},x=(e,t,i,a,o,n)=>{if(e)return t?"187.5px !important":"auto";if(i){let e;return a?(e=n-32,(o?e+p:e)+"px"):(e=n-32-2,(o?e/57*31+p+2:e/57*31+2)+"px")}return`${s}px !important`};return l.css`
    &.gallery-card {
      width: ${f(k,g,o,c,m,null==h?void 0:h.height)};
      min-width: ${f(k,g,o,c,m,null==h?void 0:h.height)};
      height: ${x(g,y,k,m,c,null==h?void 0:h.width)};
      position: relative;
      margin: ${g?"var(--sys-spacing-3) 0":"0 var(--sys-spacing-4)"};
      ${!g&&`margin-top: ${r}px`};
      ${g&&`margin-left: ${r}px`};
      &:first-of-type {
        margin-top: ${g?"var(--sys-spacing-3)":"var(--sys-spacing-4)"};
        margin-left: ${g?"var(--sys-spacing-3)":"var(--sys-spacing-4)"};
      };
      .gallery-card-inner {
        transition: all 0.5s;
        ${v}
        &:hover {
          transform: scale(1.05);
        }
      }
      .gallery-card-operation {
        display: none;
      }
      &:hover, &:focus, &:focus-within {
        .gallery-card-operation {
          display: block;
          position: absolute;
          top: var(--sys-spacing-1);
          right: var(--sys-spacing-1);
        }
      }
      .gallery-img, .gallery-img-vertical {
        width: 100%;
        height: ${c?"calc(100% - 35px)":"100%"};
      }
    }
    &.gallery-card-add {
      cursor: pointer;
      width: ${f(k,g,o,c,m,null==h?void 0:h.height)};
      min-width: ${f(k,g,o,c,m,null==h?void 0:h.height)};
      height: ${x(g,y,k,m,c,null==h?void 0:h.width)};
      display: grid;
      border: 1px solid ${i.sys.color.divider.tertiary};
      background: ${i.sys.color.action.default};
      margin: ${g?"var(--sys-spacing-3) 0":"0 var(--sys-spacing-4)"};
      ${!g&&`margin-top: ${r}px`};
      ${g&&`margin-left: ${r}px`};
    }
  `}function I(t){const{config:i,bookmarkName:a,isWebMap:o,widgetRect:s}=t,{displayName:n,direction:l,galleryItemWidth:d,galleryItemHeight:c=237.5,galleryItemSpace:p=24,cardBackground:u,itemSizeType:h}=i,g=l===e.Horizon,y=N({theme:(0,S.useTheme)(),direction:l,galleryItemWidth:d,galleryItemHeight:c,galleryItemSpace:p,cardBackground:u,displayName:n,isWebMap:o,itemSizeType:h,widgetRect:s});return new Array(3).fill(1).map((e,t)=>(0,r.jsx)("div",{className:"gallery-card",css:y,children:(0,r.jsxs)(m.Card,{shape:"shape2",className:"bookmark-pointer gallery-card-inner h-100",children:[(0,r.jsx)("div",{className:"widget-card-image bg-light-300 "+(g?"gallery-img":"gallery-img-vertical"),children:(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})}),n&&(0,r.jsx)(m.CardBody,{className:"pl-2 pr-2 bookmark-card-title text-truncate",children:(0,r.jsx)("span",{title:a,children:a})})]})},t))}var C=d(81594),M=d.n(C),B=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const O=e=>{const t=window.SVG,{className:i}=e,a=B(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:M()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))};var A=d(23662),L=d.n(A),$=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const P=e=>{const t=window.SVG,{className:i}=e,a=$(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:L()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))};var T=d(30655),D=d.n(T),R=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const z=e=>{const t=window.SVG,{className:i}=e,a=R(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:D()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))};var V=d(94064),E=d.n(V),F=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const H=e=>{const t=window.SVG,{className:i}=e,a=F(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:E()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))};var G=d(52943),U=d.n(G),W=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const J=e=>{const t=window.SVG,{className:i}=e,a=W(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:U()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))};var K=d(37568),_=d.n(K),Z=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const Y=e=>{const t=window.SVG,{className:i}=e,a=Z(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:_()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))},Q=l.css`
&.suspension-navbar {
  display: flex;
  width: 100%;
  padding: 0 8px;
  position: absolute;
  top: 50%;
  z-index: 1;
  .navbar-btn-pre{
    position: absolute;
    left: 5px;
    border-radius: 50%;
  }
  .navbar-btn-next{
    position: absolute;
    right: 5px;
    border-radius: 50%;
  }
}
&.suspension-navbar-vertical {
  display: flex;
  height: 100%;
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 1;
  margin-left: -13px;
  .navbar-btn-pre{
    position: absolute;
    top: 5px;
    border-radius: 50%;
  }
  .navbar-btn-next{
    position: absolute;
    bottom: 5px;
    border-radius: 50%;
  }
}
`;function X(t){const{config:i}=t,{itemHeight:a=280,itemWidth:o=210,space:s=0,direction:n}=i,d=l.React.useRef(null),c=n===e.Horizon,p=l.ReactRedux.useSelector(e=>e.appContext.isRTL),u=l.hooks.useTranslation(m.defaultMessages),h=(e="next")=>{var t;const i=null===(t=d.current)||void 0===t?void 0:t.parentElement;if(!i)return;const n=((e,t,i,a,o,s)=>{let n,r;const l=a+s;return"next"===e?(n=t?0:o,r=t?i?-l:l:0):"previous"===e&&(n=t?0:-o,r=t?i?l:-l:0),{top:n,left:r,behavior:"smooth"}})(e,c,p,o,a,s);i.scrollBy(n)};return(0,r.jsxs)("div",{ref:d,css:Q,className:(c?"suspension-navbar":"suspension-navbar-vertical")+" align-items-center justify-content-between",children:[(0,r.jsx)(m.Button,{title:u("slideBackward"),"aria-label":u("slideBackward"),type:"primary",size:"sm",icon:!0,onClick:()=>{h("previous")},className:"navbar-btn-pre",children:c?(0,r.jsx)(Y,{autoFlip:!0,size:"s"}):(0,r.jsx)(H,{autoFlip:!0,size:"s"})}),(0,r.jsx)(m.Button,{title:u("slideForward"),"aria-label":u("slideForward"),type:"primary",size:"sm",icon:!0,onClick:()=>{h("next")},className:"navbar-btn-next",children:c?(0,r.jsx)(J,{autoFlip:!0,size:"s"}):(0,r.jsx)(z,{autoFlip:!0,size:"s"})})]},"navBar")}function q(t){const{config:i,bookmarks:a,runtimeBookmarkArray:o,runtimeBmItemsInfo:n,runtimeSnaps:d,highLightIndex:c,runtimeHighLightIndex:p,onViewBookmark:u,handleRuntimeTitleChange:h,onRuntimeBookmarkNameChange:g,onRuntimeAdd:y,onRuntimeDelete:v,isWebMap:k,widgetRect:f}=t,{displayName:b,direction:w,runtimeAddAllow:j,galleryItemWidth:I,galleryItemHeight:C=237.5,galleryItemSpace:M=24,cardBackground:B,itemSizeType:A}=i,L=w===e.Horizon,$=(0,S.useTheme)(),T=e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation())},D=(e,t)=>{"Enter"!==e.key&&" "!==e.key||(e.stopPropagation(),u(t))},R=l.hooks.useTranslation(x),z=N({theme:$,direction:w,galleryItemWidth:I,galleryItemHeight:C,galleryItemSpace:M,cardBackground:B,displayName:b,isWebMap:k,itemSizeType:A,widgetRect:f});return(0,r.jsxs)(l.React.Fragment,{children:[a.map((e,t)=>{var i,a;const o=e.imgSourceType===s.Snapshot?null===(i=e.snapParam)||void 0===i?void 0:i.url:null===(a=e.imgParam)||void 0===a?void 0:a.url,n=t===c;return(0,r.jsx)("div",{className:"gallery-card",css:z,children:(0,r.jsxs)(m.Card,{shape:"shape2",onClick:()=>{u(e,!1,t)},role:"listitem","aria-selected":n,tabIndex:0,onKeyDown:T,onKeyUp:t=>{D(t,e)},className:(0,l.classNames)("gallery-card-inner h-100 bookmark-pointer",{"active-bookmark-item":n}),children:[(0,r.jsx)("div",{className:"widget-card-image bg-light-300 "+(L?"gallery-img":"gallery-img-vertical"),children:o?(0,r.jsx)(m.Image,{src:o,alt:"",fadeInOnLoad:!0,imageFillMode:e.imagePosition}):(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})}),b&&(0,r.jsx)(m.CardBody,{className:"pl-2 pr-2 bookmark-card-title text-truncate",children:(0,r.jsx)("span",{title:e.name,children:e.name})})]})},t)}),o.map((e,t)=>{var i;let a=(0,l.Immutable)(n[e]);a=a.set("snapParam",{url:d[a.id]});const o=null===(i=a.snapParam)||void 0===i?void 0:i.url,s=l.React.createRef(),c=t===p;return(0,r.jsxs)("div",{className:"gallery-card",css:z,children:[(0,r.jsxs)(m.Card,{shape:"shape2",onClick:()=>{u(a,!0,t)},className:(0,l.classNames)("gallery-card-inner h-100 runtime-bookmark bookmark-pointer bookmark-pointer",{"active-bookmark-item":c}),role:"listitem","aria-selected":c,tabIndex:0,onKeyUp:e=>{"INPUT"!==e.target.tagName&&D(e,a)},children:[(0,r.jsx)("div",{className:"widget-card-image bg-light-300 "+(L?"gallery-img":"gallery-img-vertical"),children:o?(0,r.jsx)(m.Image,{src:o,alt:"",fadeInOnLoad:!0,imageFillMode:a.imagePosition}):(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})}),b&&(0,r.jsx)(m.CardBody,{className:"bookmark-card-title text-truncate runtime-title-con",children:(0,r.jsx)(m.TextInput,{className:"runtime-title w-100",ref:s,size:"sm",title:a.name,value:a.name||"",onClick:e=>{e.stopPropagation()},onKeyDown:e=>{((e,t)=>{"Enter"===e.key&&t.current.blur()})(e,s)},onChange:t=>{h(e,t)},onAcceptValue:t=>{g(e,t)}})})]}),(0,r.jsx)("span",{className:"gallery-card-operation float-right",children:(0,r.jsx)(m.Button,{title:R("deleteOption"),onClick:t=>{v(t,e)},type:"tertiary",icon:!0,children:(0,r.jsx)(O,{size:"s"})})})]},`RuntimeGallery-${e}`)}),j&&(0,r.jsx)(l.React.Fragment,{children:(0,r.jsx)("div",{className:"gallery-card-add",css:z,onClick:y,title:R("addBookmark"),"aria-label":R("addBookmarkAriaLabel"),role:"button",tabIndex:0,onKeyDown:T,onKeyUp:e=>{"Enter"!==e.key&&" "!==e.key||(e.stopPropagation(),y())},children:(0,r.jsx)("div",{className:"gallery-add-icon",children:(0,r.jsx)(P,{className:"mr-1",size:"l"})})})},"galleryAdd"),(0,r.jsx)("div",{className:"vertical-border"},"last"),(0,r.jsx)(X,{config:i})]})}var ee=function(e,t,i,a){return new(i||(i=Promise))(function(o,s){function n(e){try{l(a.next(e))}catch(e){s(e)}}function r(e){try{l(a.throw(e))}catch(e){s(e)}}function l(e){var t;e.done?o(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(n,r)}l((a=a.apply(e,t||[])).next())})};class te extends l.BaseVersionManager{constructor(){super(...arguments),this.versions=[{version:"1.2.0",description:"1.2.0",upgrader:e=>{let t=e;return t.bookmarks?(t.bookmarks.forEach((e,i)=>{Object.keys(e.layersConfig||{}).forEach(a=>{const o=e.layersConfig[a];t=t.setIn(["bookmarks",i,"layersConfig",a],{visibility:o})})}),t):t}},{version:"1.18.0",description:"support draw #23418",upgrader:e=>ee(this,void 0,void 0,function*(){if(!e.bookmarks)return e;const t=e.bookmarks.map(e=>ee(this,void 0,void 0,function*(){if("2d"===e.type&&e.graphics.length>0){const[t]=yield(0,l.loadArcGISJSAPIModules)(["esri/Graphic"]),i=e.graphics,a=[];i.forEach(e=>{var i;const o=t.fromJSON(e);(null===(i=null==o?void 0:o.geometry)||void 0===i?void 0:i.hasZ)&&(o.geometry.hasZ=!1),a.push(o.toJSON())}),e=e.set("graphics",a)}return e})),i=yield Promise.all(t);return e.set("bookmarks",i)})}]}}const ie=new te;var ae=d(38796),oe=d.n(ae),se=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const ne=e=>{const t=window.SVG,{className:i}=e,a=se(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:oe()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))};var re=d(79703),le=d.n(re),de=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const ce=e=>{const t=window.SVG,{className:i}=e,a=de(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:le()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))};var me=d(40904),pe=d.n(me),ue=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const he=e=>{const t=window.SVG,{className:i}=e,a=ue(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:pe()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))};var ge=d(21210),ye=d.n(ge),ve=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};const ke=e=>{const t=window.SVG,{className:i}=e,a=ve(e,["className"]),o=(0,l.classNames)("jimu-icon jimu-icon-component",i);return t?(0,r.jsx)(t,Object.assign({className:o,src:ye()},a)):(0,r.jsx)("svg",Object.assign({className:o},a))};const fe=e=>"hide"!==(null==e?void 0:e.listMode);function xe(i){var o,s,r,c,p,u,h,g,y,f,x,b,w,j,S,N;const{theme:I,config:C,id:M,appMode:B,widgetRect:O,configBookmarkNum:A,runtimeBookmarkNum:L,isWebMap:$}=i,P=[a.Custom1,a.Custom2],T=P.includes(C.templateType),D=C.cardBackground?`background-color: ${C.cardBackground} !important;`:T?`background-color: ${I.sys.color.surface.paper} !important;`:"",R=function(e,t,i,a,o){const s=m.utils.toLinearUnit(e);let n=v(m.utils.toLinearUnit(e),o.width-24);s.unit===m.DistanceUnits.PERCENTAGE&&(n-=10);let r=v(m.utils.toLinearUnit(t),o.height);return i&&(r=n*a),{width:n,height:r}}(C.cardItemWidth,C.cardItemHeight,C.keepAspectRatio,C.cardItemSizeRatio,O),z=k(R.width,O.width,A,L),V=void 0===C.cardItemWidth,E=C.itemSizeType===n.HonorMap,F=(e,t,i,a)=>e?t?"128px":"114px":i?"150px":`${a.width}px`,H=(e,t,i,a)=>e?t?i?"163px":"128px":i?"97px":"62px":`${a.height}px`,G=e=>{const t=e.fontStyles;return`${(null==t?void 0:t.decoration)?null==t?void 0:t.decoration:""} ${"underline"===(null==t?void 0:t.underline)?"underline":""} ${"line-through"===(null==t?void 0:t.strike)?"line-through":""};`};return l.css`
    ${"&.bookmark-widget-"+M} {
      overflow: ${window.jimuConfig.isInBuilder&&B===l.AppMode.Design?"hidden":"auto"};
      position: relative;
      height: 100%;
      width: 100%;
      .bookmark-btn-container {
        width: 32px;
        height: 32px;
      }
      .bookmark-btn {
        font-weight: bold;
        font-size: ${l.polished.rem(12)};
      }
      .bookmark-view-auto {
        overflow-y: ${window.jimuConfig.isInBuilder&&B===l.AppMode.Design&&!P.includes(C.templateType)?"hidden":"auto"};
        align-content: flex-start;
      }
      .card-add {
        cursor: pointer;
        width: ${F(E,$,V,R)};
        height: ${H(E,$,C.displayName,R)};
        display: inline-flex;
        border: 1px solid ${I.sys.color.divider.tertiary};
        background: ${I.sys.color.action.default};
        margin: 5px;
        position: relative;
        .add-placeholder {
          height: ${C.displayName?"calc(100% - 35px)":"100%"};
        }
      }
      .list-add {
        cursor: pointer;
        height: 37px;
        display: inline-flex;
        border: 1px solid ${I.sys.color.divider.tertiary};
        background: ${I.sys.color.action.default};
        width: calc(100% - 30px);
        margin: 0 15px 15px;
        position: relative;
      }
      .gallery-add-icon {
        position: relative;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin-top: -${l.polished.rem(10)};
        margin-left: -${l.polished.rem(10)};
      }
      .bookmark-runtimeSeparator {
        ${C.templateType===a.Card&&"margin: 5px 0"};
        ${C.templateType===a.List&&"margin: 10px 0 0"};
        border: 1px dashed ${I.sys.color.secondary.main};
        width: 100%;
        height: 1px;
        &:last-of-type, &:first-of-type {
          display: none;
        }
      }
      .bookmark-container {
        ${C.templateType!==a.Card&&C.templateType!==a.List&&"height: 100%"};
        width: 100%;
        color: ${I.sys.color.action.text};
        ${C.templateType===a.Card&&!V&&`padding: 5px ${z}px 5px ${z+12}px`};
        .bookmark-card-title, .bookmark-card-title input {
          padding: 0px;
          height: 35px;
          line-height: 35px;
          font-family: ${C.cardNameStyle.fontFamily};
          font-size: ${C.cardNameStyle.fontSize}px;
          font-weight: ${null===(o=C.cardNameStyle.fontStyles)||void 0===o?void 0:o.weight};
          font-style: ${null===(s=C.cardNameStyle.fontStyles)||void 0===s?void 0:s.style};
          text-decoration: ${G(C.cardNameStyle)};
          color: ${C.cardNameStyle.fontColor};
        }
        .widget-card-image {
          border-radius: inherit;
          > div {
            border-top-left-radius: inherit;
            border-top-right-radius: inherit;
          }
        }
        .bookmark-card-col {
          width: ${F(E,$,V,R)};
          margin: 5px;
          height: ${H(E,$,C.displayName,R)};
          position: relative;
          .card-inner{
            width: 100%;
            transition: all 0.5s;
            ${D}
            .widget-card-image {
              width: 100%;
              height: ${C.displayName?"calc(100% - 35px)":"100%"};
              img {
                vertical-align: unset;
              }
            }
          }
        }
        .bookmark-list-col {
          height: 37.5px;
          align-items: center !important;
          margin: 8px 15px 0;
          border: 1px solid var(--sys-color-divider-secondary);
          background-color: ${I.sys.color.surface.paper};
          ${D}
          .bookmark-list-icon {
            flex: 0 0 20px;
            color: ${C.cardNameStyle.fontColor};
          }
        }
        .bookmark-list-title {
          flex: 1;
        }
        .bookmark-list-title, .bookmark-list-title-runtime input {
          font-family: ${C.cardNameStyle.fontFamily};
          font-size: ${C.cardNameStyle.fontSize}px;
          font-weight: ${null===(r=C.cardNameStyle.fontStyles)||void 0===r?void 0:r.weight};
          font-style: ${null===(c=C.cardNameStyle.fontStyles)||void 0===c?void 0:c.style};
          text-decoration: ${G(C.cardNameStyle)};;
          color: ${C.cardNameStyle.fontColor};
        }
        .bookmark-custom-contents {
          ${D}
        }
        .jimu-keyboard-nav & .bookmark-custom-contents:focus {
          padding: 2px 2px 0;
        }
        .bookmark-pointer {
          cursor: pointer;
        }
        .active-bookmark-item {
          border: 1px solid var(--sys-color-primary-main) !important;
        }
        .bookmark-custom-pointer {
          cursor: pointer;
          width: 100%;
          ${C.direction===e.Vertical&&"position: absolute;"}
          ${C.direction===e.Vertical&&`height: calc(100% - ${C.space}px) !important;`}
        }
        .layout-height{
          height: ${C.pageStyle===t.Paging?"calc(100% - 49px)":"100%"} !important;
        }
        .border-none {
          border: none !important;
        }
        .runtime-bookmarkCard {
          .runtime-bookmark {
            ${D}
          }
          .runtimeBookmarkCard-operation {
            display: none;
          }
          &:hover, &:focus, &:focus-within {
            .runtimeBookmarkCard-operation {
              display: block;
              position: absolute;
              top: var(--sys-spacing-1);
              right: var(--sys-spacing-1);
            }
          }
        }
        .runtime-bookmarkList {
          width: calc(100% - 30px);
          height: 37.5px;
          line-height: 37.5px;
          margin: 8px 15px 0;
          align-items: center !important;
          ${D}
          .bookmark-list-title-runtime {
            width: 50%;
            display: flex;
            align-items: center;
            .input-wrapper {
              border: none;
              background-color: transparent;
            }
          }
          .bookmark-list-icon {
            color: ${C.cardNameStyle.fontColor};
          }
          .runtimeBookmarkList-operation {
            margin-right: 15px;
            display: none;
          }
          &:hover, &:focus, &:focus-within  {
            .runtimeBookmarkList-operation {
              display: block;
            }
          }
        }
        .runtime-title-con {
          height: 35px;
          line-height: 35px;
        }
        .runtime-title {
          width: auto;
          display: inline-block !important;
          height: 35px;
          .input-wrapper {
            border: none;
            background-color: transparent;
          }
        }
        .suspension-drop-btn{
          border-radius: 12px;
          border: 0;
        }
        .suspension-drop-placeholder{
          width: 32px;
        }
        .suspension-nav-placeholder1{
          height: 32px;
          width: 60px;
        }
        .suspension-nav-placeholder2{
          height: 24px;
          width: 100px;
        }
        .suspension-noborder-btn{
          border: 0;
          padding-left: ${l.polished.rem(7)};
        }
        .suspension-tools-top {
          position: absolute;
          top: 5px;
          left: 5px;
          z-index: 1;
          .jimu-dropdown {
            width: 32px;
          }
          .caret-icon {
            margin-left: 2px;
          }
        }
        .suspension-top-number {
          position: absolute;
          top: 5px;
          right: 5px;
          background: ${I.sys.color.action.default};
          border-radius: 10px;
          opacity: 0.8;
          width: 40px;
          text-align: center;
          z-index: 1;
        }
        .suspension-tools-middle {
          display: flex;
          width: 100%;
          padding: 0 var(--sys-spacing-2);
          position: absolute;
          top: 50%;
          margin-top: ${C.direction===e.Horizon?"-13px":"-26px"};
          z-index: 1;
          .middle-nav-group button {
            background: ${I.sys.color.action.default};
            opacity: 0.8;
            border-radius: 50%;
          }
        }
        .suspension-middle-play {
          position: absolute;
          right: 5px;
          bottom: 20px;
          z-index: 2;
        }
        .suspension-tools-text {
          display: flex;
          width: 100%;
          padding: var(--sys-spacing-2);
          position: absolute;
          border-top: 1px solid ${I.sys.color.secondary.main};
          bottom: 0;
          z-index: 1;
          .jimu-dropdown {
            width: 32px;
          }
          .caret-icon {
            margin-left: 2px;
          }
          .nav-btn-text {
            width: 100px;
          }
        }
        .suspension-tools-bottom {
          display: flex;
          width: 100%;
          padding: 0 var(--sys-spacing-2);
          position: absolute;
          bottom: 5px;
          z-index: 1;
          .jimu-dropdown {
            width: 32px;
          }
          .caret-icon {
            margin-left: 3px;
          }
          .scroll-navigator {
            .btn {
              border-radius: 50%;
            }
          }
          .nav-btn-bottom {
            width: ${C.autoPlayAllow?"100px":"60px"};
            border-radius: 16px;
            opacity: 0.8;
            background: ${I.sys.color.action.default};
          }
          .number-count {
            border-radius: 10px;
            opacity: 0.8;
            background: ${I.sys.color.action.default};
            width: 40px;
            text-align: center;
          }
        }
        .bookmark-slide {
          position: absolute;
          bottom: ${C.templateType===a.Slide3?"0px":"unset"};
          opacity: 0.8;
          background: ${I.sys.color.surface.paper};
          ${D}
          width: 100%;
          z-index: 1;
          padding: var(--sys-spacing-2);
          .bookmark-slide-title {
            font-family: ${C.slidesNameStyle.fontFamily};
            font-size: ${C.slidesNameStyle.fontSize}px;
            font-weight: ${null===(p=C.slidesNameStyle.fontStyles)||void 0===p?void 0:p.weight};
            font-style: ${null===(u=C.slidesNameStyle.fontStyles)||void 0===u?void 0:u.style};
            text-decoration: ${G(C.slidesNameStyle)};
            color: ${C.slidesNameStyle.fontColor};
          }
          .bookmark-slide-description {
            max-height: 80px;
            overflow-y: auto;
            font-family: ${C.slidesDescriptionStyle.fontFamily};
            font-size: ${C.slidesDescriptionStyle.fontSize}px;
            font-weight: ${null===(h=C.slidesDescriptionStyle.fontStyles)||void 0===h?void 0:h.weight};
            font-style: ${null===(g=C.slidesDescriptionStyle.fontStyles)||void 0===g?void 0:g.style};
            text-decoration: ${G(C.slidesDescriptionStyle)};
            color: ${C.slidesDescriptionStyle.fontColor};
          }
        }
        .jimu-keyboard-nav & .bookmark-slide-outline:focus {
          .bookmark-slide {
            margin: 2px;
            width: calc(100% - 4px);
          }
        }
        .bookmark-slide-gallery {
          position: absolute;
          bottom: ${C.templateType===a.Slide3?0:"unset"};
          opacity: 0.8;
          background: ${I.sys.color.action.default};
          ${D}
          width: 100%;
          z-index: 1;
          padding: var(--sys-spacing-2);
          .bookmark-slide-title {
            font-family: ${C.slidesNameStyle.fontFamily};
            font-size: ${C.slidesNameStyle.fontSize}px;
            font-weight: ${null===(y=C.slidesNameStyle.fontStyles)||void 0===y?void 0:y.weight};
            font-style: ${null===(f=C.slidesNameStyle.fontStyles)||void 0===f?void 0:f.style};
            text-decoration: ${G(C.slidesNameStyle)};
            color: ${C.slidesNameStyle.fontColor};
          }
          .bookmark-slide-description {
            max-height: 60px;
            overflow-y: auto;
            font-family: ${C.slidesDescriptionStyle.fontFamily};
            font-size: ${C.slidesDescriptionStyle.fontSize}px;
            font-weight: ${null===(x=C.slidesDescriptionStyle.fontStyles)||void 0===x?void 0:x.weight};
            font-style: ${null===(b=C.slidesDescriptionStyle.fontStyles)||void 0===b?void 0:b.style};
            text-decoration: ${G(C.slidesDescriptionStyle)};
            color: ${C.slidesDescriptionStyle.fontColor};
          }
        }
        .bookmark-slide2 {
          background: ${I.sys.color.surface.paper};
          ${D}
          width: 100%;
          height: 60%;
          z-index: 1;
          padding: var(--sys-spacing-2);
          .bookmark-slide2-title {
            font-family: ${C.slidesNameStyle.fontFamily};
            font-size: ${C.slidesNameStyle.fontSize}px;
            font-weight: ${null===(w=C.slidesNameStyle.fontStyles)||void 0===w?void 0:w.weight};
            font-style: ${null===(j=C.slidesNameStyle.fontStyles)||void 0===j?void 0:j.style};
            text-decoration: ${G(C.slidesNameStyle)};
            color: ${C.slidesNameStyle.fontColor};
          }
          .bookmark-slide2-description {
            height: calc(100% - 75px);
            overflow-y: auto;
            font-family: ${C.slidesDescriptionStyle.fontFamily};
            font-size: ${C.slidesDescriptionStyle.fontSize}px;
            font-weight: ${null===(S=C.slidesDescriptionStyle.fontStyles)||void 0===S?void 0:S.weight};
            font-style: ${null===(N=C.slidesDescriptionStyle.fontStyles)||void 0===N?void 0:N.style};
            text-decoration: ${G(C.slidesDescriptionStyle)};
            color: ${C.slidesDescriptionStyle.fontColor};
          }
        }
        .gallery-slide-card {
          ${C.direction===e.Horizon&&`width: ${C.itemWidth}px !important`};
          ${C.direction===e.Horizon?`min-width: ${C.itemWidth}px !important`:`height: ${C.itemHeight}px !important`};
          height: calc(100% - ${l.polished.rem(32)});
          position: relative;
          margin: ${C.direction===e.Horizon?"var(--sys-spacing-4) 0":"0 var(--sys-spacing-4)"};
          padding-top: ${C.direction===e.Horizon?"unset":l.polished.rem(C.space)};
          ${C.direction===e.Horizon&&`margin-left: ${l.polished.rem(C.space)}`};
          &:first-of-type {
            margin-top: ${C.direction===e.Horizon?"var(--sys-spacing-4)":"10px"};
            padding-top: ${C.direction===e.Horizon?"unset":l.polished.rem(10)};
          }
          &:last-of-type {
            ${C.direction===e.Horizon?"padding-right: var(--sys-spacing-4)":`margin-bottom: ${l.polished.rem(20)}`};
          }
          .gallery-slide-inner {
            transition: all 0.5s;
            &:hover {
              transform: scale(1.05);
              .bookmark-slide-gallery {
                width: 100%;
              }
            }
          }
        }
        .gallery-slide-lastItem {
          padding-right: 16px;
          margin-bottom: 16px;
        }
        .nav-bar {
          height: 48px;
          width: 280px;
          min-width: 280px;
          border: 1px solid ${I.sys.color.secondary.main};
          ${D}
          padding: 0 var(--sys-spacing-2);
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -24px;
          margin-left: -140px;
          .scroll-navigator {
            .btn {
              border-radius: 50%;
            }
          }
          .nav-btn {
            width: 100px;
          }
        }
        .example-tips {
          margin-top: -10px;
          top: 50%;
          position: relative;
          text-align: center;
        }
      }
      .bookmark-container::-webkit-scrollbar {
        display: none;
      }
      .gallery-container {
        display: inline-flex !important;
        overflow-x: ${window.jimuConfig.isInBuilder&&B===l.AppMode.Design&&!P.includes(C.templateType)?"hidden":"auto"};
        scrollbar-width: none;
      }
      .gallery-container-ver {
        overflow-y: ${window.jimuConfig.isInBuilder&&B===l.AppMode.Design&&!P.includes(C.templateType)?"hidden":"auto"};
        scrollbar-width: none;
      }
      .horizon-line {
        margin: 10px 15px;
        border-bottom: 1px solid ${I.sys.color.secondary.main};
      }
      .vertical-line {
        margin: 10px 15px;
        border-right: 1px solid ${I.sys.color.secondary.main};
      }
      .vertical-border {
        padding-right: var(--sys-spacing-4);
      }
      .default-img {
        width: 100%;
        height: 100%;
        background-color: var(--sys-color-action-disabled);
        .default-img-svg {
          width: 100%;
          height: 100%;
          background-color: var(--sys-color-action-disabled-text);
          mask-image: url(${d(54855)});
          mask-size: 50% 50%;
          mask-position: center center;
          mask-repeat: no-repeat;
        }
      }
      .edit-mask {
        height: calc(100% - 49px);
        z-index: 2;
      }
    }
  `}function be(e){const{config:t,bookmarks:i,runtimeBookmarkArray:a,runtimeBmItemsInfo:o,runtimeSnaps:n,highLightIndex:d,runtimeHighLightIndex:c,onViewBookmark:p,handleRuntimeTitleChange:u,onRuntimeBookmarkNameChange:h,onRuntimeAdd:g,onRuntimeDelete:y}=e,{displayName:v,runtimeAddAllow:k}=t,f=l.hooks.useTranslation(x),b=e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation())},w=(e,t)=>{"Enter"!==e.key&&" "!==e.key||(e.stopPropagation(),p(t))};return(0,r.jsxs)(l.React.Fragment,{children:[i.map((e,t)=>{var i,a;const o=e.imgSourceType===s.Snapshot?null===(i=e.snapParam)||void 0===i?void 0:i.url:null===(a=e.imgParam)||void 0===a?void 0:a.url,n=t===d;return(0,r.jsx)(l.React.Fragment,{children:(0,r.jsx)("div",{className:"d-inline-flex bookmark-card-col",children:(0,r.jsxs)(m.Card,{shape:"shape2",onClick:()=>{p(e,!1,t)},className:(0,l.classNames)("card-inner bookmark-pointer",{"active-bookmark-item":n}),role:"listitem","aria-selected":n,tabIndex:0,onKeyDown:b,onKeyUp:t=>{w(t,e)},children:[(0,r.jsx)("div",{className:"widget-card-image",children:o?(0,r.jsx)(m.Image,{src:o,alt:"",fadeInOnLoad:!0,imageFillMode:e.imagePosition}):(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})}),v&&(0,r.jsx)(m.CardBody,{className:"pl-2 pr-2 bookmark-card-title text-truncate",children:(0,r.jsx)("span",{title:e.name,children:e.name})})]})})},t)}),(0,r.jsx)("div",{className:"bookmark-runtimeSeparator"}),a.map((e,t)=>{var i;let a=(0,l.Immutable)(o[e]);a=a.set("snapParam",{url:n[a.id]});const s=null===(i=null==a?void 0:a.snapParam)||void 0===i?void 0:i.url,d=l.React.createRef(),g=t===c;return(0,r.jsx)(l.React.Fragment,{children:(0,r.jsxs)("div",{className:"d-inline-flex bookmark-card-col runtime-bookmarkCard",children:[(0,r.jsxs)(m.Card,{onClick:()=>{p(a,!0,t)},className:(0,l.classNames)("card-inner runtime-bookmark bookmark-pointer",{"active-bookmark-item":g}),role:"listitem","aria-selected":g,tabIndex:0,onKeyUp:e=>{"INPUT"!==e.target.tagName&&w(e,a)},children:[(0,r.jsx)("div",{className:"widget-card-image bg-default",children:s?(0,r.jsx)(m.Image,{src:s,alt:"",fadeInOnLoad:!0,imageFillMode:a.imagePosition}):(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})}),v&&(0,r.jsx)(m.CardBody,{className:"bookmark-card-title runtime-title-con",children:(0,r.jsx)(m.TextInput,{className:"runtime-title w-100",ref:d,size:"sm",title:a.name,value:a.name||"",onClick:e=>{e.stopPropagation()},onKeyDown:e=>{((e,t)=>{"Enter"===e.key&&t.current.blur()})(e,d)},onChange:t=>{u(e,t)},onAcceptValue:t=>{h(e,t)}})})]}),(0,r.jsx)("span",{className:"runtimeBookmarkCard-operation float-right",children:(0,r.jsx)(m.Button,{title:f("deleteOption"),onClick:t=>{y(t,e)},type:"tertiary",icon:!0,children:(0,r.jsx)(O,{size:"s"})})})]})},e)}),k&&(0,r.jsxs)(l.React.Fragment,{children:[(0,r.jsxs)("div",{className:"card-add",onClick:g,title:f("addBookmark"),"aria-label":f("addBookmarkAriaLabel"),role:"button",tabIndex:0,onKeyDown:b,onKeyUp:e=>{"Enter"!==e.key&&" "!==e.key||(e.stopPropagation(),g())},children:[(0,r.jsx)("div",{className:"add-placeholder"}),(0,r.jsx)("div",{className:"gallery-add-icon",children:(0,r.jsx)(P,{className:"mr-1",size:"l"})})]}),(0,r.jsx)("div",{className:"vertical-border"})]},"card-add")]})}function we(e){const{config:t,bookmarkName:i}=e,{displayName:a}=t;return new Array(3).fill(1).map((e,t)=>(0,r.jsx)("div",{className:"d-inline-flex bookmark-card-col",children:(0,r.jsxs)(m.Card,{shape:"shape2",className:"card-inner bookmark-pointer",children:[(0,r.jsx)("div",{className:"widget-card-image bg-default",children:(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})}),a&&(0,r.jsx)(m.CardBody,{className:"pl-2 pr-2 bookmark-card-title text-truncate",children:(0,r.jsx)("span",{title:i,children:i})})]})},t))}function je(e){const{config:t,bookmarks:i,runtimeBookmarkArray:a,runtimeBmItemsInfo:o,highLightIndex:s,runtimeHighLightIndex:n,onViewBookmark:d,handleRuntimeTitleChange:c,onRuntimeBookmarkNameChange:p,onRuntimeAdd:u,onRuntimeDelete:h}=e,{runtimeAddAllow:g,hideIcon:y}=t,v=l.hooks.useTranslation(x),k=(e,t)=>{"Enter"!==e.key&&" "!==e.key||(e.stopPropagation(),d(t))};return(0,r.jsxs)(l.React.Fragment,{children:[i.map((e,t)=>{const i=t===s;return(0,r.jsxs)(m.Paper,{onClick:()=>{d(e,!1,t)},className:(0,l.classNames)("d-flex bookmark-list-col bookmark-pointer",{"active-bookmark-item":i}),role:"listitem","aria-selected":i,tabIndex:0,onKeyUp:t=>{k(t,e)},children:[!y&&(0,r.jsx)(ke,{className:"ml-4 bookmark-list-icon"}),(0,r.jsx)("div",{className:"ml-2 bookmark-list-title text-truncate",title:e.name,children:e.name})]},t)}),(0,r.jsx)("div",{className:"bookmark-runtimeSeparator"}),a.map((e,t)=>{const i=(0,l.Immutable)(o[e]),a=l.React.createRef(),s=t===n;return(0,r.jsxs)(m.Paper,{onClick:()=>{d(i,!0,t)},role:"listitem","aria-selected":s,tabIndex:0,onKeyUp:e=>{k(e,i)},className:(0,l.classNames)("d-flex runtime-bookmark runtime-bookmarkList bookmark-pointer",{"active-bookmark-item":s}),children:[!y&&(0,r.jsx)(ke,{className:"ml-4 bookmark-list-icon"}),(0,r.jsx)(m.TextInput,{className:"bookmark-list-title-runtime",ref:a,size:"sm",title:i.name,value:i.name||"",onKeyDown:e=>{((e,t)=>{"Enter"===e.key&&t.current.blur()})(e,a)},onChange:t=>{c(e,t)},onAcceptValue:t=>{p(e,t)}}),(0,r.jsx)("div",{className:"h-100 flex-grow-1"}),(0,r.jsx)(m.Button,{className:"runtimeBookmarkList-operation",title:v("deleteOption"),onClick:t=>{h(t,e)},type:"tertiary",icon:!0,size:"sm",children:(0,r.jsx)(O,{size:"s"})})]},e)}),g&&(0,r.jsxs)(l.React.Fragment,{children:[(0,r.jsx)("div",{className:"list-add",onClick:u,onKeyUp:e=>{"Enter"!==e.key&&" "!==e.key||(e.stopPropagation(),u())},title:v("addBookmark"),"aria-label":v("addBookmarkAriaLabel"),role:"button",tabIndex:0,children:(0,r.jsx)("div",{className:"gallery-add-icon",children:(0,r.jsx)(P,{className:"mr-1",size:"l"})})}),(0,r.jsx)("div",{className:"vertical-border"})]},"list-add")]})}var Se=function(e,t,i,a){return new(i||(i=Promise))(function(o,s){function n(e){try{l(a.next(e))}catch(e){s(e)}}function r(e){try{l(a.throw(e))}catch(e){s(e)}}function l(e){var t;e.done?o(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(n,r)}l((a=a.apply(e,t||[])).next())})},Ne=function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(a=Object.getOwnPropertySymbols(e);o<a.length;o++)t.indexOf(a[o])<0&&Object.prototype.propertyIsEnumerable.call(e,a[o])&&(i[a[o]]=e[a[o]])}return i};class Ie extends l.React.PureComponent{constructor(n){var d;super(n),this.Graphic=null,this.GraphicsLayer=null,this.Extent=null,this.Viewpoint=null,this.Basemap=null,this.resizeConRef=l.React.createRef(),this.autoOffCondition=e=>{var i,a;const{config:o,appMode:s,browserSizeMode:n}=this.props,{pageStyle:r,autoPlayAllow:d,autoInterval:c,autoLoopAllow:m}=o,p=n!==e.browserSizeMode,u=c!==(null===(i=e.config)||void 0===i?void 0:i.autoInterval)||m!==(null===(a=e.config)||void 0===a?void 0:a.autoLoopAllow);return s===l.AppMode.Design||r===t.Scroll||!d||u||p},this.settingLayout=()=>{const{layoutId:e,layoutItemId:t,id:i,selectionIsSelf:a}=this.props,{isSetLayout:o}=this.state;e&&i&&t&&!o&&a&&(this.props.dispatch(l.appActions.widgetStatePropChange(i,"layoutInfo",{layoutId:e,layoutItemId:t})),this.setState({isSetLayout:!0}))},this.formatMessage=(e,t)=>{const i=Object.assign({},x,m.defaultMessages,l.defaultMessages);return this.props.intl.formatMessage({id:e,defaultMessage:i[e]},t)},this.onResize=(e,t)=>{const{id:i,dispatch:a}=this.props,o={width:e,height:t};this.setState({widgetRect:o}),a(l.appActions.widgetStatePropChange(i,"widgetRect",o))},this.isEditing=()=>{const{appMode:e,config:t,selectionIsSelf:i,selectionIsInSelf:a}=this.props;return!!window.jimuConfig.isInBuilder&&((i||a)&&window.jimuConfig.isInBuilder&&e!==l.AppMode.Run&&t.isTemplateConfirm)},this.handleRuntimeAdd=()=>Se(this,void 0,void 0,function*(){this.rtBookmarkId++;const{jimuMapView:e}=this.state;if(!e)return;const t=e.view,{id:i}=this.props,a=(e=>{const t=(e,i)=>(e.forEach(e=>{var a;if("string"==typeof e.id&&e.id.includes("jimu-draw"))return;i[e.id]={layers:{}},i[e.id].visibility=null==e?void 0:e.visible;const o=e.layers||e.sublayers||e.allSublayers;o&&o.length>0&&t(o,null===(a=i[e.id])||void 0===a?void 0:a.layers)}),i);return t(e,{})})(t.map.layers.toArray());let o=this.rtBookmarkId.toString();const{dataUrl:n}=yield t.takeScreenshot({width:148,height:120});if(this.isUseCache){o=`${l.utils.getLocalStorageAppKey()}-bookmark-${i}-bookmark-${l.utils.getUUID()}`}const r={id:o,name:`${this.formatMessage("_widgetLabel")}(${this.rtBookmarkId})`,title:`${this.formatMessage("_widgetLabel")}-${this.rtBookmarkId}`,type:t.type,imgSourceType:s.Snapshot,extent:t.extent.toJSON(),viewpoint:t.viewpoint.toJSON(),showFlag:!0,runTimeFlag:!0,mapDataSourceId:e.dataSourceId,layersConfig:a};if("3d"===t.type&&(r.environment=JSON.parse(JSON.stringify(t.environment))),this.isUseCache){const e=g(this.props.id,this.props.mapWidgetId);l.utils.setLocalStorage(e,JSON.stringify(this.state.runtimeBmArray.concat(o))),l.utils.setLocalStorage(o,JSON.stringify(r)),this.runtimeSnapCache.put(o,n)}this.setState({runtimeBmArray:this.state.runtimeBmArray.concat(o),runtimeBmItemsInfo:Object.assign(Object.assign({},this.state.runtimeBmItemsInfo),{[o]:r}),runtimeSnaps:Object.assign(Object.assign({},this.state.runtimeSnaps),{[o]:n})})}),this.flatVisibleLayers=e=>{let t=[];for(let i=0;i<e.length;i++){const a=e[i];a.id&&t.push(a.id),a.subLayerIds&&(t=t.concat(a.subLayerIds.asMutable()))}return t},this.showMapOriginLayer=(e,t)=>{const i=this.flatVisibleLayers(t),a=(e,t)=>{e.forEach(e=>{fe(e)&&(e.visible=!1,(null==t?void 0:t.includes(e.id))&&(e.visible=!0)),e.layers&&e.layers.length>0?a(e.layers.toArray(),t):e.sublayers&&e.sublayers.length>0&&a(e.sublayers.toArray(),t)})};a(e,i)},this.onViewBookmark=(e,t,i)=>{var a,o;if(!e)return;const{jimuMapView:s,viewGroup:n}=this.state,{id:r,useMapWidgetIds:d}=this.props,c=(null===(o=null===(a=this.props)||void 0===a?void 0:a.stateProps)||void 0===o?void 0:o.activeBookmarkId)||0;t?this.setState({highLightIndex:-1,runtimeHighLightIndex:i}):void 0!==t&&this.setState({highLightIndex:i,runtimeHighLightIndex:-1});const m=document.querySelectorAll(`.widget-bookmark.useMapWidgetId-${null==d?void 0:d[0]}`),p=`bookmark-widget-${r}`;m.forEach(e=>{if(!e.classList.contains(p)){const t=e.querySelector(".bookmark-container .active-bookmark-item");null==t||t.classList.remove("active-bookmark-item")}}),t||i!==this.state.highLightIndex||m.forEach(e=>{if(e.classList.contains(p)){e.querySelectorAll(".bookmark-container .bookmark-pointer,.bookmark-custom-pointer")[i].classList.add("active-bookmark-item")}}),t&&i===this.state.runtimeHighLightIndex&&m.forEach(e=>{if(e.classList.contains(p)){e.querySelectorAll(".bookmark-container .bookmark-pointer.runtime-bookmark")[i].classList.add("active-bookmark-item")}}),e&&!e.runTimeFlag&&c!==e.id&&this.props.dispatch(l.appActions.widgetStatePropChange(r,"activeBookmarkId",e.id)),d&&0!==d.length&&(0,l.getAppStore)().dispatch(l.appActions.requestAutoControlMapWidget(d[0],r)),s&&(e&&s.dataSourceId!==e.mapDataSourceId?n&&n.switchMap().then(()=>{this.viewBookmark(e)}):this.viewBookmark(e))},this.isNumber=e=>!isNaN(parseFloat(e))&&isFinite(e)&&"[object Number]"===Object.prototype.toString.call(e),this.viewBookmark=e=>{var t,a,o;const{id:s,appMode:n,config:r}=this.props,{jimuMapView:d}=this.state,{viewpoint:c}=e,m={duration:1e3};if((n===l.AppMode.Run||n===l.AppMode.Express)&&d&&d.view){if(d.view.goTo(this.Viewpoint.fromJSON(c),m),e.baseMap){const t=e.baseMap.asMutable?e.baseMap.asMutable({deep:!0}):e.baseMap;d.view.map.basemap=this.Basemap.fromJSON(t,{origin:"web-scene"})}if(e.timeExtent){((e,t)=>{const i=e.getAllJimuLayerViews();(0,l.loadArcGISJSAPIModules)(["esri/layers/support/FeatureFilter","esri/TimeExtent"]).then(a=>{const o=a[0],s=a[1];i.forEach(i=>u(void 0,void 0,void 0,function*(){yield e.whenJimuLayerViewLoaded(i.id);const a=i.view;if(a)if(a.filter){const e=a.filter.clone();e.timeExtent=new s({start:t[0],end:t[1]}),a.filter=e}else{const e=new o({});e.timeExtent=new s({start:t[0],end:t[1]}),a.filter=e}}))})})(d,e.timeExtent.asMutable({deep:!0}))}const n=null===(t=null==e?void 0:e.ground)||void 0===t?void 0:t.transparency;(null==e?void 0:e.ground)&&this.isNumber(n)?d.view.map.ground.opacity=(100-n)/100:d.view.map.ground.opacity=this.mapOpacity;const p=d.view.map.layers.toArray(),h=null===(a=null==e?void 0:e.environment)||void 0===a?void 0:a.lighting.asMutable({deep:!0});if((null==e?void 0:e.environment)&&h){d.view.environment.lighting={type:h.type,date:h.datetime,directShadowsEnabled:h.directShadows,displayUTCOffset:h.displayUTCOffset}}const g=null===(o=null==e?void 0:e.environment)||void 0===o?void 0:o.weather;if((null==e?void 0:e.environment)&&g){d.view.environment.weather=g.asMutable({deep:!0})}const y=d.dataSourceId!==e.mapDataSourceId;if(!r.ignoreLayerVisibility)if(e.mapOriginFlag){if("3d"===d.view.type){const t=p.concat(d.view.map.ground.layers.toArray());this.showMapOriginLayer(t,e.visibleLayers)}}else((e,t,i=!1)=>{if(i)return;const a=(e,t)=>{e.forEach(e=>{var i,o,s;fe(e)&&void 0!==(null===(i=t[e.id])||void 0===i?void 0:i.visibility)&&(e.visible=null===(o=t[e.id])||void 0===o?void 0:o.visibility);const n=e.layers||e.sublayers||e.allSublayers,r=null===(s=null==t?void 0:t[e.id])||void 0===s?void 0:s.layers;n&&n.length>0&&r&&Object.keys(r).length>0&&a(n.toArray(),r)})};a(e,t)})(p,e.layersConfig,y);const v=e.graphics&&e.graphics.length>0;if(this.graphicsLayerCreated[d.id]){const t=d.view.map.findLayerById(this.graphicsLayerId[d.id]);r.displayType===i.Selected?(null==t||t.removeAll(),v&&t&&e.graphics.forEach(e=>{t.graphics.push(this.Graphic.fromJSON(e))})):this.graphicsPainted[d.id][e.id]?v&&(e.graphics.forEach(e=>{const i=t.graphics.find(t=>t.attributes.jimuDrawId===e.attributes.jimuDrawId);t.remove(i)}),e.graphics.forEach(e=>{t.graphics.push(this.Graphic.fromJSON(e))})):(v&&e.graphics.forEach(e=>{t.graphics.push(this.Graphic.fromJSON(e))}),this.graphicsPainted[d.id][e.id]=!0)}else{const t=(new Date).getTime(),i=`bookmark-layer-${s}-${d.id}-${t}`,a=new this.GraphicsLayer({id:i,listMode:"hide",title:this.formatMessage("graphicLayer"),elevationInfo:{mode:"relative-to-scene"}});v&&e.graphics.forEach(e=>{a.graphics.push(this.Graphic.fromJSON(e))}),d.view.map.add(a),this.graphicsPainted[d.id]={},this.graphicsPainted[d.id][e.id]=!0,this.graphicsLayerId[d.id]=a.id,this.graphicsLayerCreated[d.id]=!0}}},this.onActiveViewChange=e=>{var t,i,a;const{appMode:o,config:s}=this.props;if(this.setState({jimuMapView:e}),this.mapOpacity=(null===(a=null===(i=null===(t=null==e?void 0:e.view)||void 0===t?void 0:t.map)||void 0===i?void 0:i.ground)||void 0===a?void 0:a.opacity)||1,e&&(o===l.AppMode.Run||o===l.AppMode.Express)&&s.initBookmark&&!this.alreadyActiveLoading){const t=this.getMapBookmarks(e)||[],i=f(s,t);i.length>0&&(this.alreadyActiveLoading=!0,e.view.when(()=>{this.setState({bookmarkOnViewId:i[0].id}),setTimeout(()=>{this.onViewBookmark(i[0])},0)}))}},this.handleViewGroupCreate=e=>{this.setState({viewGroup:e})},this.typedImgExist=e=>{var t,i;return e.imgSourceType===s.Snapshot?null===(t=e.snapParam)||void 0===t?void 0:t.url:null===(i=e.imgParam)||void 0===i?void 0:i.url},this.renderSlideViewTop=e=>{var t,i;const a=e.imgSourceType===s.Snapshot?null===(t=e.snapParam)||void 0===t?void 0:t.url:null===(i=e.imgParam)||void 0===i?void 0:i.url,{displayName:o}=this.props.config;return(0,r.jsxs)("div",{className:"w-100 h-100 bookmark-pointer border-0 bookmark-slide-outline jimu-outline-inside",onClick:()=>{this.onViewBookmark(e)},role:"listitem",tabIndex:0,"aria-label":this.formatMessage("_widgetLabel"),onKeyDown:e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation())},onKeyUp:t=>{"Enter"!==t.key&&" "!==t.key||(t.stopPropagation(),this.onViewBookmark(e))},children:[(0,r.jsxs)("div",{className:(0,l.classNames)("bookmark-slide",{"d-none":!o&&!e.description}),children:[(0,r.jsx)("div",{className:(0,l.classNames)("bookmark-slide-title",{"d-none":!o}),children:e.name}),(0,r.jsx)("div",{className:"bookmark-slide-description",children:e.description})]}),a?(0,r.jsx)(m.Image,{src:a,alt:"",fadeInOnLoad:!0,imageFillMode:e.imagePosition}):(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})]},e.id||`webmap-${e.name}`)},this.renderSlideViewText=e=>{var t,i;const a=e.imgSourceType===s.Snapshot?null===(t=e.snapParam)||void 0===t?void 0:t.url:null===(i=e.imgParam)||void 0===i?void 0:i.url,{displayName:o}=this.props.config;return(0,r.jsxs)("div",{className:"w-100 h-100 bookmark-pointer jimu-outline-inside border-0",onClick:()=>{this.onViewBookmark(e)},role:"listitem",tabIndex:0,onKeyDown:e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation())},onKeyUp:t=>{"Enter"!==t.key&&" "!==t.key||(t.stopPropagation(),this.onViewBookmark(e))},children:[(0,r.jsx)("div",{className:"w-100",style:{height:"40%"},children:a?(0,r.jsx)(m.Image,{src:a,alt:"",fadeInOnLoad:!0,imageFillMode:e.imagePosition}):(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})}),(0,r.jsxs)("div",{className:(0,l.classNames)("bookmark-slide2",{"d-none":!o&&!e.description}),children:[(0,r.jsx)("div",{className:(0,l.classNames)("bookmark-slide2-title",{"d-none":!o}),children:e.name}),(0,r.jsx)("div",{className:"bookmark-slide2-description",children:e.description})]})]},e.id||`webmap-${e.name}`)},this.renderSlideViewBottom=e=>{var t,i;const a=e.imgSourceType===s.Snapshot?null===(t=e.snapParam)||void 0===t?void 0:t.url:null===(i=e.imgParam)||void 0===i?void 0:i.url,{displayName:o}=this.props.config;return(0,r.jsxs)("div",{className:"w-100 h-100 bookmark-pointer border-0 bookmark-slide-outline jimu-outline-inside",onClick:()=>{this.onViewBookmark(e)},role:"listitem","aria-label":this.formatMessage("_widgetLabel"),tabIndex:0,children:[a?(0,r.jsx)(m.Image,{src:a,alt:"",fadeInOnLoad:!0,imageFillMode:e.imagePosition}):(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})}),(0,r.jsxs)("div",{className:(0,l.classNames)("bookmark-slide",{"d-none":!o&&!e.description}),children:[(0,r.jsx)("div",{className:(0,l.classNames)("bookmark-slide-title",{"d-none":!o}),children:e.name}),(0,r.jsx)("div",{className:"bookmark-slide-description",children:e.description})]})]},e.id||`webmap-${e.name}`)},this.renderCustomContents=e=>{const t=this.getLayoutEntry(),{layouts:i}=this.props;return i&&e.layoutName?(0,r.jsx)("div",{className:"w-100 h-100 bookmark-custom-contents bookmark-pointer border-0 jimu-outline-inside",onClick:()=>{this.onViewBookmark(e)},role:"listitem",tabIndex:0,onKeyUp:t=>{"Enter"!==t.key&&" "!==t.key||(t.stopPropagation(),this.onViewBookmark(e))},children:(0,r.jsx)(t,{isRepeat:!0,layouts:i[e.layoutName],isInWidget:!0,className:"layout-height"})},e.id):(0,r.jsx)("div",{},e.id)},this.renderCustomExample=()=>{const e=this.getLayoutEntry(),{layouts:t}=this.props;if(null==t?void 0:t[o.Default])return(0,r.jsx)("div",{className:"w-100 h-100 bookmark-custom-contents bookmark-pointer border-0",children:(0,r.jsx)(e,{isRepeat:!0,layouts:t[o.Default],isInWidget:!0,className:"layout-height"})})},this.handleArrowChange=e=>{const{config:t}=this.props,{jimuMapView:i}=this.state,a=this.getMapBookmarks(i)||[],o=f(t,a),s=o.length;if(0===s)return;const{bookmarkOnViewId:n}=this.state;let r=o.findIndex(e=>e.id===n)>-1?o.findIndex(e=>e.id===n):0;r!==s-1||e?0===r&&e?r=s-1:e&&r>0?r--:e||r++:r=0,this.setState({bookmarkOnViewId:o[r].id}),this.onViewBookmark(o[r])},this.handleOnViewChange=e=>{const{config:t}=this.props,{jimuMapView:i}=this.state,a=this.getMapBookmarks(i)||[],o=f(t,a),s=o.findIndex(t=>t.id===e)>-1?o.findIndex(t=>t.id===e):0;this.setState({bookmarkOnViewId:e}),this.onViewBookmark(o[s])},this.getBookmarksOptions=e=>{const t=[];return e.forEach(e=>{t.push((0,r.jsx)("option",{value:e.id,children:e.name},e.id))}),t},this.getBookmarksDropdownItems=e=>{const{bookmarkOnViewId:t}=this.state,i=[];return e.forEach(e=>{i.push((0,r.jsx)(m.DropdownItem,{active:e.id===t,children:e.name},e.id))}),i},this.handleAutoPlay=()=>{const{config:e,useMapWidgetIds:t,id:i}=this.props,{bookmarkOnViewId:a,autoPlayStart:o,playTimer:s,jimuMapView:n}=this.state,r=this.getMapBookmarks(n)||[],d=f(e,r);if(0===d.length)return;if(o)return s&&clearInterval(s),void this.setState({autoPlayStart:!1,playTimer:void 0});t&&0!==t.length&&(0,l.getAppStore)().dispatch(l.appActions.requestAutoControlMapWidget(t[0],i));const{autoInterval:c,autoLoopAllow:m}=e;let p=d.findIndex(e=>e.id===a);-1!==p&&p!==d.length-1||(p=0),this.setState({bookmarkOnViewId:d[p].id}),this.onViewBookmark(d[p]);const u=setInterval(()=>{if(p++,m)p>=d.length&&(p=0);else if(p>=d.length)return clearInterval(u),s&&clearInterval(s),void this.setState({autoPlayStart:!1,playTimer:void 0});this.setState({bookmarkOnViewId:d[p].id}),this.onViewBookmark(d[p])},1e3*c+1e3);this.setState({autoPlayStart:!0,playTimer:u})},this.renderBottomTools=e=>{const{config:t}=this.props,{jimuMapView:i}=this.state,o=this.getMapBookmarks(i)||[],s=f(t,o),n=s.length,{bookmarkOnViewId:l,autoPlayStart:d}=this.state;let c=1;c=e?0:s.findIndex(e=>e.id===l)>-1?s.findIndex(e=>e.id===l)+1:1;return(e=>{let i;switch(e){case a.Slide1:i=(0,r.jsxs)("div",{className:"suspension-tools-bottom align-items-center justify-content-around",children:[s.length>1?(0,r.jsxs)(m.Dropdown,{size:"sm",activeIcon:!0,menuRole:"listbox",children:[(0,r.jsx)(m.DropdownButton,{arrow:!1,icon:!0,size:"sm",type:"default",className:"suspension-drop-btn",title:this.formatMessage("bookmarkList"),children:(0,r.jsx)(ne,{autoFlip:!0,className:"suspension-drop-btn"})}),(0,r.jsx)(m.DropdownMenu,{children:s.map(e=>{const t=e.id===l;return(0,r.jsx)(m.DropdownItem,{active:t,onClick:()=>{this.handleOnViewChange(e.id)},children:e.name},e.id)})})]}):(0,r.jsx)("div",{className:"suspension-drop-placeholder"}),s.length>1?(0,r.jsx)(m.NavButtonGroup,{type:"tertiary",vertical:!1,onChange:this.handleArrowChange,className:"nav-btn-bottom",previousAriaLabel:`${c}/${n}. `+this.formatMessage("previousBookmark"),nextAriaLabel:`${c}/${n}. `+this.formatMessage("nextBookmark"),previousTitle:this.formatMessage("previousBookmark"),nextTitle:this.formatMessage("nextBookmark"),children:(0,r.jsx)("div",{className:"bookmark-btn-container",children:t.autoPlayAllow&&(0,r.jsx)(m.Button,{icon:!0,className:"bookmark-btn",type:"link",onClick:this.handleAutoPlay,title:d?this.formatMessage("pause"):this.formatMessage("play"),"aria-label":d?this.formatMessage("pause"):this.formatMessage("play"),"data-testid":"triggerAuto",children:d?(0,r.jsx)(he,{className:"mr-1",size:"l"}):(0,r.jsx)(ce,{className:"mr-1",size:"l"})})})}):(0,r.jsx)("div",{className:"suspension-nav-placeholder1"}),(0,r.jsx)("span",{className:"number-count",children:this.isRTL?`${n}/${c}`:`${c}/${n}`})]});break;case a.Slide2:case a.Custom1:case a.Custom2:i=s.length>1?(0,r.jsxs)("div",{className:"suspension-tools-text align-items-center justify-content-around",children:[(0,r.jsxs)(m.Dropdown,{size:"sm",activeIcon:!0,children:[(0,r.jsx)(m.DropdownButton,{arrow:!1,icon:!0,size:"sm",type:"default",className:"suspension-drop-btn",title:this.formatMessage("bookmarkList"),children:(0,r.jsx)(ne,{autoFlip:!0,className:"suspension-drop-btn"})}),(0,r.jsx)(m.DropdownMenu,{children:s.map(e=>{const t=e.id===l;return(0,r.jsx)(m.DropdownItem,{active:t,onClick:()=>{this.handleOnViewChange(e.id)},children:e.name},e.id)})})]}),(0,r.jsx)(m.NavButtonGroup,{type:"tertiary",vertical:!1,onChange:this.handleArrowChange,className:"nav-btn-text",previousAriaLabel:`${c}/${n}. `+this.formatMessage("previousBookmark"),nextAriaLabel:`${c}/${n}. `+this.formatMessage("nextBookmark"),previousTitle:this.formatMessage("previousBookmark"),nextTitle:this.formatMessage("nextBookmark"),children:(0,r.jsxs)("span",{children:[c,"/",n]})}),(0,r.jsx)("div",{className:"bookmark-btn-container",children:t.autoPlayAllow&&(0,r.jsx)(m.Button,{icon:!0,className:"bookmark-btn",type:"link",onClick:this.handleAutoPlay,title:d?this.formatMessage("pause"):this.formatMessage("play"),"aria-label":d?this.formatMessage("pause"):this.formatMessage("play"),children:d?(0,r.jsx)(he,{className:"mr-1",size:"l"}):(0,r.jsx)(ce,{className:"mr-1",size:"l"})})})]}):(0,r.jsx)("div",{className:"align-items-center"});break;case a.Slide3:i=(0,r.jsxs)(b.Fragment,{children:[(0,r.jsx)("div",{className:"suspension-tools-top align-items-center justify-content-around",children:s.length>1?(0,r.jsxs)(m.Dropdown,{size:"sm",activeIcon:!0,children:[(0,r.jsx)(m.DropdownButton,{arrow:!1,icon:!0,size:"sm",type:"default",className:"suspension-drop-btn",title:this.formatMessage("bookmarkList"),children:(0,r.jsx)(ne,{autoFlip:!0,className:"suspension-drop-btn"})}),(0,r.jsx)(m.DropdownMenu,{children:s.map(e=>{const t=e.id===l;return(0,r.jsx)(m.DropdownItem,{active:t,onClick:()=>{this.handleOnViewChange(e.id)},children:e.name},e.id)})})]}):(0,r.jsx)("div",{className:"suspension-drop-placeholder"})}),(0,r.jsxs)("span",{className:"suspension-top-number",children:[c,"/",n]}),(0,r.jsx)("div",{className:"suspension-tools-middle",children:s.length>1&&(0,r.jsx)(m.NavButtonGroup,{type:"tertiary",vertical:!1,onChange:this.handleArrowChange,className:"middle-nav-group",previousAriaLabel:`${c}/${n}. `+this.formatMessage("previousBookmark"),nextAriaLabel:`${c}/${n}. `+this.formatMessage("nextBookmark"),previousTitle:this.formatMessage("previousBookmark"),nextTitle:this.formatMessage("nextBookmark")})}),t.autoPlayAllow&&(0,r.jsx)("div",{className:"suspension-middle-play",children:(0,r.jsx)(m.Button,{icon:!0,className:"bookmark-btn",type:"link",onClick:this.handleAutoPlay,title:d?this.formatMessage("pause"):this.formatMessage("play"),"aria-label":d?this.formatMessage("pause"):this.formatMessage("play"),children:d?(0,r.jsx)(he,{className:"mr-1",size:30}):(0,r.jsx)(ce,{className:"mr-1",size:30})})})]})}return i})(t.templateType)},this.renderSlideScroll=e=>{const t=e.map((e,t)=>{var i,a;const o=e.imgSourceType===s.Snapshot?null===(i=e.snapParam)||void 0===i?void 0:i.url:null===(a=e.imgParam)||void 0===a?void 0:a.url,n=t===this.state.highLightIndex,{displayName:d}=this.props.config;return(0,r.jsx)("div",{className:"gallery-slide-card",children:(0,r.jsxs)("div",{className:(0,l.classNames)("w-100 h-100 bookmark-pointer gallery-slide-inner border-0",{"active-bookmark-item":n}),onClick:()=>{this.onViewBookmark(e,!1,t)},role:"listitem","aria-selected":n,tabIndex:0,onKeyDown:e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation())},onKeyUp:t=>{"Enter"!==t.key&&" "!==t.key||(t.stopPropagation(),this.onViewBookmark(e))},children:[(0,r.jsxs)("div",{className:(0,l.classNames)("bookmark-slide-gallery",{"d-none":!d&&!e.description}),children:[(0,r.jsx)("div",{className:(0,l.classNames)("bookmark-slide-title",{"d-none":!d}),children:e.name}),(0,r.jsx)("div",{className:"bookmark-slide-description",children:e.description})]}),o?(0,r.jsx)(m.Image,{src:o,alt:"",fadeInOnLoad:!0,imageFillMode:e.imagePosition}):(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})]})},t)}),i=(0,r.jsx)("div",{className:"gallery-slide-lastItem"},"last");return t.asMutable({deep:!0}).concat(i)},this.renderCustomScroll=e=>{const t=this.getLayoutEntry(),{layouts:i}=this.props,a=e.map((e,a)=>{const o=a===this.state.highLightIndex;return(0,r.jsx)("div",{className:"gallery-slide-card",children:(0,r.jsx)("div",{className:(0,l.classNames)("w-100 h-100 bookmark-custom-pointer border-0",{"active-bookmark-item":o}),onClick:()=>{this.onViewBookmark(e,!1,a)},role:"listitem","aria-selected":o,tabIndex:0,children:(0,r.jsx)(t,{isRepeat:!0,layouts:i[e.layoutName],isInWidget:!0,className:"layout-height"})})},a)}),o=(0,r.jsx)("div",{className:"gallery-slide-lastItem"},"last");return a.asMutable({deep:!0}).concat(o)},this.getMapBookmarks=e=>{var t,i;if(e&&(null==e?void 0:e.dataSourceId)){const a=e.view;if(!a)return;const o=null===(t=e.view)||void 0===t?void 0:t.map;let s=[];if("3d"===a.type){let e;try{e=o.toJSON()}catch(e){console.log(e)}s=(null===(i=null==e?void 0:e.presentation)||void 0===i?void 0:i.slides)?JSON.parse(JSON.stringify(null==e?void 0:e.presentation.slides)):[]}else"2d"===a.type&&(s=(null==o?void 0:o.bookmarks)?JSON.parse(JSON.stringify(o.bookmarks)):[]);return s.map((t,i)=>{var a,o;return t.id=`mapOrigin-${i}`,t.runTimeFlag=!0,t.mapOriginFlag=!0,t.mapDataSourceId=e.dataSourceId,(null===(a=t.thumbnail)||void 0===a?void 0:a.url)?t.imgParam={url:t.thumbnail.url}:t.imgParam={},(null===(o=t.title)||void 0===o?void 0:o.text)&&(t.name=t.title.text),t.imagePosition=m.ImageFillMode.Fill,t})}},this.renderBookmarkList=i=>{var o;const{appMode:s,config:n,selectionIsSelf:d,selectionIsInSelf:c}=this.props,{transitionInfo:p}=n,{bookmarkOnViewId:u,autoPlayStart:h,jimuMapView:g}=this.state,y="3d"!==(null===(o=null==g?void 0:g.view)||void 0===o?void 0:o.type),v=this.getMapBookmarks(g)||[];![a.Custom1,a.Custom2].includes(n.templateType)&&n.displayFromWeb&&(i=i.concat(v));const k=i.findIndex(e=>e.id===u)>-1?i.findIndex(e=>e.id===u):0,f=0===k?1:Math.max(0,k-1),x=n.direction===e.Horizon,w=[a.Slide1,a.Slide2,a.Slide3,a.Custom1,a.Custom2],j=(d||c?null==p?void 0:p.previewId:null)||null,S=n.templateType===a.Gallery||w.includes(n.templateType)&&n.pageStyle===t.Scroll;return(0,r.jsx)("div",{className:"bookmark-container "+(S?x?"gallery-container":"gallery-container-ver":""),ref:this.containerRef,role:"list",children:(e=>{var o,d,c,g,v,x,w,S;let N;switch(e){case a.Card:N=(0,r.jsx)(be,{config:this.props.config,bookmarks:i,runtimeBookmarkArray:this.state.runtimeBmArray,runtimeBmItemsInfo:this.state.runtimeBmItemsInfo,runtimeSnaps:this.state.runtimeSnaps,highLightIndex:this.state.highLightIndex,runtimeHighLightIndex:this.state.runtimeHighLightIndex,onViewBookmark:this.onViewBookmark,handleRuntimeTitleChange:this.handleRuntimeTitleChange,onRuntimeBookmarkNameChange:this.onRuntimeBookmarkNameChange,onRuntimeDelete:this.handleRuntimeDelete,onRuntimeAdd:this.handleRuntimeAdd});break;case a.List:N=(0,r.jsx)(je,{config:this.props.config,bookmarks:i,runtimeBookmarkArray:this.state.runtimeBmArray,runtimeBmItemsInfo:this.state.runtimeBmItemsInfo,highLightIndex:this.state.highLightIndex,runtimeHighLightIndex:this.state.runtimeHighLightIndex,onViewBookmark:this.onViewBookmark,handleRuntimeTitleChange:this.handleRuntimeTitleChange,onRuntimeBookmarkNameChange:this.onRuntimeBookmarkNameChange,onRuntimeDelete:this.handleRuntimeDelete,onRuntimeAdd:this.handleRuntimeAdd});break;case a.Slide1:const e=i.map(e=>this.renderSlideViewTop(e));return(0,r.jsxs)(b.Fragment,{children:[n.pageStyle===t.Paging?(0,r.jsx)(l.TransitionContainer,{previousIndex:f,currentIndex:k,transitionType:null===(o=null==p?void 0:p.transition)||void 0===o?void 0:o.type,direction:null===(d=null==p?void 0:p.transition)||void 0===d?void 0:d.direction,playId:j,children:e}):this.renderSlideScroll(i),n.pageStyle===t.Scroll&&(0,r.jsx)(X,{config:n}),n.pageStyle===t.Paging&&this.renderBottomTools()]});case a.Slide2:const I=i.map(e=>this.renderSlideViewText(e));return(0,r.jsxs)(b.Fragment,{children:[n.pageStyle===t.Paging?(0,r.jsx)(l.TransitionContainer,{previousIndex:f,currentIndex:k,transitionType:null===(c=null==p?void 0:p.transition)||void 0===c?void 0:c.type,direction:null===(g=null==p?void 0:p.transition)||void 0===g?void 0:g.direction,playId:j,children:I}):this.renderSlideScroll(i),n.pageStyle===t.Scroll&&(0,r.jsx)(X,{config:n}),n.pageStyle===t.Paging&&this.renderBottomTools()]});case a.Slide3:const C=i.map(e=>this.renderSlideViewBottom(e));return(0,r.jsxs)(b.Fragment,{children:[n.pageStyle===t.Paging?(0,r.jsx)(l.TransitionContainer,{previousIndex:f,currentIndex:k,transitionType:null===(v=null==p?void 0:p.transition)||void 0===v?void 0:v.type,direction:null===(x=null==p?void 0:p.transition)||void 0===x?void 0:x.direction,playId:j,children:C}):this.renderSlideScroll(i),n.pageStyle===t.Scroll&&(0,r.jsx)(X,{config:n}),n.pageStyle===t.Paging&&this.renderBottomTools()]});case a.Gallery:N=(0,r.jsx)(q,{config:this.props.config,bookmarks:i,runtimeBookmarkArray:this.state.runtimeBmArray,runtimeBmItemsInfo:this.state.runtimeBmItemsInfo,runtimeSnaps:this.state.runtimeSnaps,highLightIndex:this.state.highLightIndex,runtimeHighLightIndex:this.state.runtimeHighLightIndex,onViewBookmark:this.onViewBookmark,handleRuntimeTitleChange:this.handleRuntimeTitleChange,onRuntimeBookmarkNameChange:this.onRuntimeBookmarkNameChange,onRuntimeDelete:this.handleRuntimeDelete,onRuntimeAdd:this.handleRuntimeAdd,isWebMap:y,widgetRect:this.state.widgetRect});break;case a.Navigator:const M=n.bookmarks.length,B=n.bookmarks.findIndex(e=>e.id===u)>-1?n.bookmarks.findIndex(e=>e.id===u)+1:1;return(0,r.jsxs)("div",{className:"nav-bar d-flex align-items-center justify-content-around",children:[(0,r.jsx)(m.Select,{size:"sm",value:u,onChange:this.handleOnViewChange,style:{width:32},children:this.getBookmarksOptions(i)}),(0,r.jsx)(m.Button,{icon:!0,className:"bookmark-btn",type:"tertiary",onClick:this.handleRuntimeAdd,children:(0,r.jsx)(P,{className:"mr-1",size:"l"})}),(0,r.jsx)(m.NavButtonGroup,{type:"tertiary",circle:!0,vertical:!1,onChange:this.handleArrowChange,className:"nav-btn",children:(0,r.jsxs)("span",{children:[B,"/",M]})}),(0,r.jsx)(m.Button,{icon:!0,className:"bookmark-btn",type:"tertiary",onClick:this.handleAutoPlay,title:h?this.formatMessage("pause"):this.formatMessage("play"),"aria-label":h?this.formatMessage("pause"):this.formatMessage("play"),disabled:!n.autoPlayAllow,children:h?(0,r.jsx)(he,{className:"mr-1",size:"l"}):(0,r.jsx)(ce,{className:"mr-1",size:"l"})})]});case a.Custom1:case a.Custom2:const O=this.isEditing(),A=i.map(e=>this.renderCustomContents(e));return(0,r.jsxs)(b.Fragment,{children:[n.pageStyle===t.Paging?(0,r.jsx)(l.TransitionContainer,{previousIndex:f,currentIndex:k,transitionType:null===(w=null==p?void 0:p.transition)||void 0===w?void 0:w.type,direction:null===(S=null==p?void 0:p.transition)||void 0===S?void 0:S.direction,playId:j,children:A}):this.renderCustomScroll(i),n.pageStyle===t.Scroll&&(0,r.jsx)(X,{config:n}),n.pageStyle===t.Paging&&this.renderBottomTools(),!O&&n.pageStyle===t.Paging&&s===l.AppMode.Design&&(0,r.jsx)("div",{className:"edit-mask position-absolute w-100"})]})}return N})(n.templateType)})},this.renderExampleSlideScroll=e=>(0,r.jsx)("div",{className:"gallery-slide-card",children:(0,r.jsxs)("div",{className:"w-100 h-100 bookmark-pointer border-0",children:[(0,r.jsxs)("div",{className:"bookmark-slide-gallery",children:[(0,r.jsx)("div",{className:"bookmark-slide-title",children:e.title}),(0,r.jsx)("div",{className:"bookmark-slide-description",children:e.description})]}),(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})]})}),this.renderBookmarkExample=i=>{var o;const{appMode:s,config:n}=this.props,{jimuMapView:d}=this.state,c=n.direction===e.Horizon,p="3d"!==(null===(o=null==d?void 0:d.view)||void 0===o?void 0:o.type),u=n.templateType===a.Gallery;return(0,r.jsx)("div",{className:"bookmark-container "+(u?c?"gallery-container":"gallery-container-ver":""),ref:this.containerRef,children:(e=>{let o;switch(e){case a.Card:o=(0,r.jsx)(we,{config:this.props.config,bookmarkName:i.name});break;case a.List:o=new Array(3).fill(1).map((e,t)=>(0,r.jsxs)(m.Paper,{className:"d-flex bookmark-list-col bookmark-pointer",children:[!n.hideIcon&&(0,r.jsx)(ke,{className:"ml-4 bookmark-list-icon"}),(0,r.jsx)("div",{className:"ml-2 bookmark-list-title",children:i.name})]},t));break;case a.Slide1:o=(0,r.jsxs)(b.Fragment,{children:[n.pageStyle===t.Paging?(0,r.jsx)(l.TransitionContainer,{previousIndex:1,currentIndex:0,transitionType:n.transition,direction:n.transitionDirection,children:(0,r.jsxs)("div",{className:"w-100 h-100 bookmark-pointer border-0",children:[(0,r.jsxs)("div",{className:"bookmark-slide",children:[(0,r.jsx)("div",{className:"bookmark-slide-title",children:i.title}),(0,r.jsx)("div",{className:"bookmark-slide-description",children:i.description})]}),(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})]})}):this.renderExampleSlideScroll(i),n.pageStyle===t.Scroll&&(0,r.jsx)(X,{config:n}),n.pageStyle===t.Paging&&this.renderBottomTools(!0)]});break;case a.Slide2:o=(0,r.jsxs)(b.Fragment,{children:[n.pageStyle===t.Paging?(0,r.jsx)(l.TransitionContainer,{previousIndex:1,currentIndex:0,transitionType:n.transition,direction:n.transitionDirection,children:(0,r.jsxs)("div",{className:"w-100 h-100 bookmark-pointer border-0",children:[(0,r.jsx)("div",{className:"w-100",style:{height:"40%"},children:(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})})}),(0,r.jsxs)("div",{className:"bookmark-slide2",children:[(0,r.jsx)("div",{className:"bookmark-slide2-title",children:i.title}),(0,r.jsx)("div",{className:"bookmark-slide2-description",children:i.description})]})]})}):this.renderExampleSlideScroll(i),n.pageStyle===t.Scroll&&(0,r.jsx)(X,{config:n}),n.pageStyle===t.Paging&&this.renderBottomTools(!0)]});break;case a.Slide3:o=(0,r.jsxs)(b.Fragment,{children:[n.pageStyle===t.Paging?(0,r.jsx)(l.TransitionContainer,{previousIndex:1,currentIndex:0,transitionType:n.transition,direction:n.transitionDirection,children:(0,r.jsxs)("div",{className:"w-100 h-100 bookmark-pointer border-0",children:[(0,r.jsx)("div",{className:"default-img",children:(0,r.jsx)("div",{className:"default-img-svg"})}),(0,r.jsxs)("div",{className:"bookmark-slide",children:[(0,r.jsx)("div",{className:"bookmark-slide-title",children:i.title}),(0,r.jsx)("div",{className:"bookmark-slide-description",children:i.description})]})]})}):this.renderExampleSlideScroll(i),n.pageStyle===t.Scroll&&(0,r.jsx)(X,{config:n}),n.pageStyle===t.Paging&&this.renderBottomTools(!0)]});break;case a.Gallery:o=(0,r.jsx)(I,{config:this.props.config,bookmarkName:i.name,isWebMap:p,widgetRect:this.state.widgetRect});break;case a.Custom1:case a.Custom2:const e=this.isEditing(),d=this.renderCustomExample();o=(0,r.jsxs)(b.Fragment,{children:[n.pageStyle===t.Paging?(0,r.jsx)(l.TransitionContainer,{previousIndex:1,currentIndex:0,transitionType:n.transition,direction:n.transitionDirection,children:d}):(0,r.jsx)("div",{className:"gallery-slide-card",children:d}),n.pageStyle===t.Scroll&&(0,r.jsx)(X,{config:n}),n.pageStyle===t.Paging&&this.renderBottomTools(!0),!e&&n.pageStyle===t.Paging&&s===l.AppMode.Design&&(0,r.jsx)("div",{className:"edit-mask position-absolute w-100 h-100"})]})}return o})(n.templateType)})},this.onRuntimeBookmarkNameChange=(e,t)=>{this.setState(i=>{const a=Object.assign(Object.assign({},i.runtimeBmItemsInfo[e]),{name:t}),o=Object.assign(Object.assign({},i.runtimeBmItemsInfo),{[e]:a});return this.isUseCache&&l.utils.setLocalStorage(e,JSON.stringify(a)),{runtimeBmItemsInfo:o}})},this.handleRuntimeTitleChange=(e,t)=>{const i=t.target.value;this.setState(t=>{const a=Object.assign(Object.assign({},t.runtimeBmItemsInfo[e]),{name:i});return{runtimeBmItemsInfo:Object.assign(Object.assign({},t.runtimeBmItemsInfo),{[e]:a})}})},this.handleKeydown=(e,t)=>{"Enter"===e.key&&t.current.blur()},this.handleRuntimeDelete=(e,t)=>{e.stopPropagation();const i=this.state.runtimeBmArray.filter(e=>e!==t);if(this.isUseCache){const e=g(this.props.id,this.props.mapWidgetId);l.utils.setLocalStorage(e,JSON.stringify(i)),l.utils.removeFromLocalStorage(t),this.runtimeSnapCache.delete(t)}const a=this.state.runtimeSnaps,{rmbId:o}=a,s=Ne(a,["rmbId"]),n=this.state.runtimeBmItemsInfo,{rmbId:r}=n,d=Ne(n,["rmbId"]);this.setState({runtimeBmArray:i,runtimeSnaps:s,runtimeBmItemsInfo:d})},this.isUseCache=!window.jimuConfig.isInBuilder;const c=(0,l.getAppStore)().getState(),p=this.isUseCache?y(this.props.id,this.props.mapWidgetId):[],h=this.isUseCache?(e=>{const t={};return e.forEach(e=>{const i=l.utils.readLocalStorage(e);t[e]=JSON.parse(i)}),t})(p):{},v={jimuMapView:void 0,widgetRect:{width:516,height:210},apiLoaded:!1,viewGroup:void 0,bookmarkOnViewId:1,autoPlayStart:!1,runtimeBmArray:p,runtimeBmItemsInfo:h,runtimeSnaps:{},playTimer:void 0,isSetLayout:!1,isSuspendMode:!1,highLightIndex:-1,runtimeHighLightIndex:-1,showInView:!0};let k=0;if(p.length>0){const e=p[p.length-1],{title:t}=JSON.parse(l.utils.readLocalStorage(e)),i=t.lastIndexOf("-");k=parseInt(t.substring(i+1))}this.state=v,this.graphicsLayerCreated={},this.graphicsPainted={},this.graphicsLayerId={},this.runtimeReference=void 0,this.containerRef=l.React.createRef(),this.rtBookmarkId=k,this.alreadyActiveLoading=!1,this.mapOpacity=1,this.isRTL=null===(d=null==c?void 0:c.appContext)||void 0===d?void 0:d.isRTL,this.runtimeSnapCache=new l.indexedDBUtils.IndexedDBCache(n.id,"bookmark","runtime-snap"),this.intersectionObserver=null,this.onResize=this.onResize.bind(this),this.debounceOnResize=l.lodash.debounce(({width:e,height:t})=>{this.onResize(e,t)},100)}getLayoutEntry(){return window.jimuConfig.isInBuilder&&this.props.appMode===l.AppMode.Design?this.props.builderSupportModules.LayoutEntry:j.LayoutEntry}initRuntimeSnaps(){return Se(this,void 0,void 0,function*(){try{this.runtimeSnapCache.initialized()||(yield this.runtimeSnapCache.init());const e=yield this.runtimeSnapCache.getAllKeys(),t=yield this.runtimeSnapCache.getAll(),i={};e.forEach((e,a)=>{i[e]=t[a]}),this.setState({runtimeSnaps:i})}catch(e){console.error(e)}})}static getDerivedStateFromProps(e,t){if(!e||0===Object.keys(e).length||!t||0===Object.keys(t).length)return null;const{autoPlayStart:i,playTimer:a}=t;return e.autoplayActiveId!==e.id?(i&&a&&clearInterval(a),{autoPlayStart:!1,playTimer:void 0}):null}componentDidMount(){this.state.apiLoaded||(0,w.loadArcGISJSAPIModules)(["esri/Graphic","esri/layers/GraphicsLayer","esri/Viewpoint","esri/Basemap"]).then(e=>{[this.Graphic,this.GraphicsLayer,this.Viewpoint,this.Basemap]=e,this.setState({apiLoaded:!0})}),this.isUseCache&&this.initRuntimeSnaps()}componentDidUpdate(e){var t,i,a,o,s,n;const{config:r,appMode:d,id:c,autoplayActiveId:m,isPrintPreview:p}=this.props,{autoPlayStart:u,playTimer:h,jimuMapView:g,isSuspendMode:y,showInView:v}=this.state,k=(null===(i=null===(t=this.props)||void 0===t?void 0:t.stateProps)||void 0===i?void 0:i.activeBookmarkId)||0;if(m&&g&&c!==m){const e=this.graphicsLayerId[g.id];if(!e)return;const t=g.view.map.findLayerById(e);t&&t.removeAll(),this.graphicsPainted[g.id]={}}if(e.appMode===l.AppMode.Design&&d===l.AppMode.Run&&g&&r.initBookmark){const e=this.getMapBookmarks(g)||[],t=f(r,e);t.length>0&&v&&g.view.when(()=>{this.setState({bookmarkOnViewId:t[0].id}),this.onViewBookmark(t[0])})}if(this.autoOffCondition(e)&&u)return h&&clearInterval(h),void this.setState({autoPlayStart:!1,playTimer:void 0});e.isPrintPreview!==p&&(u?(this.setState({isSuspendMode:!0}),this.handleAutoPlay()):y&&!u&&(this.setState({isSuspendMode:!1}),this.handleAutoPlay()));if(((null===(o=null===(a=this.props)||void 0===a?void 0:a.stateProps)||void 0===o?void 0:o.settingChangeBookmark)||!1)&&k){const e=r.bookmarks.findIndex(e=>e.id===k)>-1?r.bookmarks.findIndex(e=>e.id===k):0;this.setState({bookmarkOnViewId:k}),this.props.dispatch(l.appActions.widgetStatePropChange(c,"settingChangeBookmark",!1)),d!==l.AppMode.Run&&d!==l.AppMode.Express||this.onViewBookmark(r.bookmarks[e],!1,e)}if((null===(n=null===(s=this.props)||void 0===s?void 0:s.stateProps)||void 0===n?void 0:n.lastFlag)||!1){this.props.dispatch(l.appActions.widgetStatePropChange(c,"lastFlag",!1));const e=g.view.map.findLayerById(this.graphicsLayerId[g.id]);e&&e.removeAll()}this.settingLayout()}componentWillUnmount(){var e,t;const{jimuMapView:i}=this.state;if(!(0,l.getAppStore)().getState().appConfig.widgets[this.props.id]&&i){const a=null===(t=null===(e=null==i?void 0:i.view)||void 0===e?void 0:e.map)||void 0===t?void 0:t.findLayerById(this.graphicsLayerId[i.id]);a&&a.removeAll()}this.intersectionObserver&&this.intersectionObserver.disconnect()}rootRefCallback(e){if(!e)return;this.intersectionObserver&&this.intersectionObserver.disconnect();this.intersectionObserver=new IntersectionObserver(e=>{var t;const i=(null===(t=e[0])||void 0===t?void 0:t.intersectionRatio)>.5;i&&(this.alreadyActiveLoading=!1),this.setState({showInView:i})},{threshold:[0,.5,1]}),this.intersectionObserver.observe(e)}render(){var e;const{config:t,id:i,useMapWidgetIds:o,theme:s,isPrintPreview:n,appMode:d}=this.props,{jimuMapView:c,apiLoaded:m,showInView:p}=this.state,{runtimeAddAllow:u}=t,h=(0,l.classNames)("jimu-widget","widget-bookmark","bookmark-widget-"+i,"useMapWidgetId-"+(null==o?void 0:o[0])),g=this.getMapBookmarks(c)||[],y=f(t,g).length,v=this.state.runtimeBmArray.length,k={id:99999,name:this.formatMessage("_widgetLabel"),title:this.formatMessage("_widgetLabel"),description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",type:"2d",mapDataSourceId:"dataSource_eg"},x="3d"!==(null===(e=null==c?void 0:c.view)||void 0===e?void 0:e.type);return(0,r.jsx)(l.ViewVisibilityContext.Consumer,{children:({isInView:e,isInCurrentView:c})=>{var g;let f=!0;f=!e||c,f||(this.alreadyActiveLoading=!1);const j=this.state.widgetRect;return(0,r.jsx)(b.Fragment,{children:f&&(0,r.jsx)("div",{ref:this.rootRefCallback.bind(this),className:h,css:xe({theme:s,config:t,id:i,appMode:d,widgetRect:j,configBookmarkNum:y,runtimeBookmarkNum:null===(g=this.state.runtimeBmArray)||void 0===g?void 0:g.length,isWebMap:x}),children:(0,r.jsxs)(b.Fragment,{children:[(n||p)&&m&&(0,r.jsx)(w.JimuMapViewComponent,{useMapWidgetId:null==o?void 0:o[0],onActiveViewChange:this.onActiveViewChange,onViewGroupCreate:this.handleViewGroupCreate}),(u||0!==v||0!==y)&&(null==o?void 0:o[0])?(0,r.jsx)("div",{className:"h-100 d-flex flex-wrap bookmark-view-auto",children:this.renderBookmarkList(t.bookmarks)}):(0,r.jsx)("div",{className:"h-100 d-flex flex-wrap bookmark-view-auto",children:this.renderBookmarkExample(k)}),(t.templateType===a.Card||t.templateType===a.Gallery)&&(0,r.jsx)(l.ReactResizeDetector,{targetRef:this.resizeConRef,handleWidth:!0,handleHeight:!0,onResize:this.debounceOnResize}),(0,r.jsx)("div",{css:l.css`
                      position: absolute;
                      left: 0;
                      right: 0;
                      top: 0;
                      bottom: 0;
                      background: transparent;
                      pointer-events: none;
                    `,ref:this.resizeConRef})]})})})}})}}Ie.mapExtraStateProps=(e,t)=>{var i,a,o,s,n;const r=null==e?void 0:e.appConfig,{layouts:d,layoutId:c,layoutItemId:m,builderSupportModules:p,id:u,useMapWidgetIds:h}=t,g=null===(i=null==e?void 0:e.appRuntimeInfo)||void 0===i?void 0:i.selection,y=g&&p&&p.widgetModules&&p.widgetModules.selectionInBookmark(g,u,r,!1),v=null==e?void 0:e.mapWidgetsInfo,k=h&&0!==h.length?h[0]:void 0,f=(null==e?void 0:e.browserSizeMode)||l.BrowserSizeMode.Large;return{appMode:null===(a=null==e?void 0:e.appRuntimeInfo)||void 0===a?void 0:a.appMode,appConfig:r,layouts:d,selectionIsSelf:g&&g.layoutId===c&&g.layoutItemId===m,selectionIsInSelf:y,autoplayActiveId:k?null===(o=v[k])||void 0===o?void 0:o.autoControlWidgetId:void 0,mapWidgetId:k,browserSizeMode:f,isPrintPreview:null!==(n=null===(s=null==e?void 0:e.appRuntimeInfo)||void 0===s?void 0:s.isPrintPreview)&&void 0!==n&&n}},Ie.getFullConfig=o=>(0,l.Immutable)({templateType:a.Card,isTemplateConfirm:!1,style:(0,l.Immutable)({id:"default"}),isInitialed:!1,bookmarks:[],initBookmark:!1,runtimeAddAllow:!1,ignoreLayerVisibility:!1,autoPlayAllow:!1,autoInterval:3,autoLoopAllow:!0,direction:e.Horizon,pageStyle:t.Paging,space:10,scrollBarOpen:!0,navigatorOpen:!1,transition:l.TransitionType.None,transitionDirection:l.TransitionDirection.Horizontal,displayType:i.Selected,itemHeight:240,itemWidth:240,transitionInfo:{transition:{type:l.TransitionType.None,direction:l.TransitionDirection.Horizontal},effect:{type:l.AnimationType.None,option:{direction:l.AnimationDirection.Top,configType:l.AnimationEffectType.Default}},oneByOneEffect:null,previewId:null},cardBackground:"",displayName:!0,hideIcon:!1,cardItemHeight:157.5,keepAspectRatio:!1,itemSizeType:n.Custom,cardNameStyle:{fontFamily:m.FontFamilyValue.AVENIRNEXT,fontStyles:{style:"normal",weight:"normal",strike:"none",underline:"none"},fontColor:"var(--sys-color-surface-paper-text)",fontSize:"13"},slidesNameStyle:{fontFamily:m.FontFamilyValue.AVENIRNEXT,fontStyles:{style:"normal",weight:"bold",strike:"none",underline:"none"},fontColor:"var(--sys-color-surface-paper-text)",fontSize:"16"},slidesDescriptionStyle:{fontFamily:m.FontFamilyValue.AVENIRNEXT,fontStyles:{style:"normal",weight:"normal",strike:"none",underline:"none"},fontColor:"var(--sys-color-surface-paper-text)",fontSize:"13"}}).merge(o,{deep:!0}),Ie.versionManager=ie;const Ce=Ie;function Me(e){d.p=e}})(),c})())}}});