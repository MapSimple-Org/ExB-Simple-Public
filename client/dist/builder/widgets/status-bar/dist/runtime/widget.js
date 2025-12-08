System.register(["jimu-core","jimu-core/emotion","jimu-for-builder","jimu-layouts/layout-builder","jimu-ui","jimu-ui/advanced/setting-components"],function(e,t){var a={},o={},r={},n={},i={},l={};return{setters:[function(e){a.BrowserSizeMode=e.BrowserSizeMode,a.DialogMode=e.DialogMode,a.ErrorBoundary=e.ErrorBoundary,a.GridItemType=e.GridItemType,a.LayoutItemType=e.LayoutItemType,a.LayoutParentType=e.LayoutParentType,a.LayoutType=e.LayoutType,a.PagePart=e.PagePart,a.PageType=e.PageType,a.React=e.React,a.ReactRedux=e.ReactRedux,a.appActions=e.appActions,a.classNames=e.classNames,a.css=e.css,a.focusElementInKeyboardMode=e.focusElementInKeyboardMode,a.getAppStore=e.getAppStore,a.hooks=e.hooks,a.lodash=e.lodash,a.utils=e.utils},function(e){o.jsx=e.jsx,o.jsxs=e.jsxs},function(e){r.builderAppSync=e.builderAppSync,r.getAppConfigAction=e.getAppConfigAction},function(e){n.getLabelOfGridTab=e.getLabelOfGridTab},function(e){i.Button=e.Button,i.Dropdown=e.Dropdown,i.DropdownButton=e.DropdownButton,i.DropdownItem=e.DropdownItem,i.DropdownMenu=e.DropdownMenu,i.Icon=e.Icon,i.Label=e.Label,i.Popper=e.Popper,i.Switch=e.Switch,i.Tooltip=e.Tooltip,i.defaultMessages=e.defaultMessages,i.styleUtils=e.styleUtils},function(e){l.changeCurrentDialog=e.changeCurrentDialog,l.changeCurrentPage=e.changeCurrentPage}],execute:function(){e((()=>{var e={2221:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M14 1H8v3H7V1H1v6h3v1H1v6h6v-3h1v3h6V8h-3V7h3zM1 0a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1z" clip-rule="evenodd"></path></svg>'},2943:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M4.653 13.854a.485.485 0 0 1 0-.708L10.24 8 4.653 2.854a.485.485 0 0 1 0-.708.54.54 0 0 1 .738 0l5.956 5.5a.485.485 0 0 1 0 .708l-5.956 5.5a.54.54 0 0 1-.738 0" clip-rule="evenodd"></path></svg>'},3662:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M7.5 0a.5.5 0 0 0-.5.5V7H.5a.5.5 0 0 0 0 1H7v6.5a.5.5 0 0 0 1 0V8h6.5a.5.5 0 0 0 0-1H8V.5a.5.5 0 0 0-.5-.5"></path></svg>'},4072:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M14 1v13H1V7.46l2.138 2.348a.508.508 0 0 0 .752-.684L2.867 8H6V7H2.794l1.023-1.124a.508.508 0 0 0-.752-.685L1 7.46V1zm0-1a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1zm-1.867 7L11.11 5.876a.508.508 0 1 1 .752-.684L14 7.54l-2.065 2.268a.508.508 0 0 1-.751-.684L12.206 8H9V7z" clip-rule="evenodd"></path></svg>'},4108:e=>{"use strict";e.exports=r},4321:e=>{"use strict";e.exports=i},4502:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M0 7.5A.5.5 0 0 1 .5 7h14a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5"></path></svg>'},5508:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6.5 7.5A.5.5 0 0 1 7 7h1.5v4.5h1a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1h1V8H7a.5.5 0 0 1-.5-.5"></path><path fill="#000" fill-rule="evenodd" d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16m0-1A7 7 0 1 0 8 1a7 7 0 0 0 0 14" clip-rule="evenodd"></path></svg>'},6055:e=>{"use strict";e.exports=n},7386:e=>{"use strict";e.exports=o},9244:e=>{"use strict";e.exports=a},9298:e=>{"use strict";e.exports=l}},t={};function s(a){var o=t[a];if(void 0!==o)return o.exports;var r=t[a]={exports:{}};return e[a](r,r.exports,s),r.exports}s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},s.d=(e,t)=>{for(var a in t)s.o(t,a)&&!s.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.p="";var p={};return s.p=window.jimuConfig.baseUrl,(()=>{"use strict";s.r(p),s.d(p,{__set_webpack_public_path__:()=>Z,default:()=>W});var e=s(7386),t=s(9244),a=s(4321),o=s(4108);var r=s(9298);function n(o){const{pageId:r,label:n,isInFolder:i,isFolder:l,isActive:s,hasSubPage:p,onSelect:d}=o,c=t.React.useCallback(()=>{d(r)},[r,d]);return(0,e.jsx)(a.DropdownItem,{className:(0,t.classNames)({"page-item":!l||p,"in-folder":i,folder:l&&!p,"has-subpage":p,active:s}),active:s,header:l&&!p,onClick:c,children:(0,e.jsx)("div",{className:"text-truncate w-100",title:n,children:n})})}function i(e){(0,r.changeCurrentPage)(e)}function l(a){const r=t.ReactRedux.useSelector(e=>{var t,a;return null===(a=null===(t=e.appStateInBuilder)||void 0===t?void 0:t.appConfig)||void 0===a?void 0:a.pageStructure}),l=[];if(r){const e=(0,o.getAppConfigAction)().appConfig.pages;r.forEach(a=>{var o,r;const n=Object.keys(a)[0],i=e[n];if(i.type===t.PageType.Normal)if((null===(o=a[n])||void 0===o?void 0:o.length)>0){const o=[];a[n].forEach(a=>{const r=e[a];r.type===t.PageType.Normal&&o.push({pageId:a,label:r.label,isInFolder:!0})}),o.length>0?(l.push({pageId:n,label:i.label,isFolder:!0,hasSubPage:!0}),l.push(...o)):l.push({pageId:n,label:i.label})}else l.push({pageId:n,label:i.label});else if(i.type===t.PageType.Folder){const o=[];(null===(r=a[n])||void 0===r?void 0:r.length)>0&&a[n].forEach(a=>{const r=e[a];r.type===t.PageType.Normal&&o.push({pageId:a,label:r.label,isInFolder:!0})}),o.length>0&&(l.push({pageId:n,label:i.label,isFolder:!0}),l.push(...o))}})}return(0,e.jsx)(t.React.Fragment,{children:l.map(t=>(0,e.jsx)(n,Object.assign({onSelect:i,isActive:t.pageId===a.currentPageId},t),t.pageId))})}function d(e){(0,r.changeCurrentDialog)(e)}function c(o){const r=t.ReactRedux.useSelector(e=>{var t,a;return null===(a=null===(t=e.appStateInBuilder)||void 0===t?void 0:t.appConfig)||void 0===a?void 0:a.dialogs});if(!r||0===Object.keys(r).length)return null;const n=[],i=[];return Object.keys(r).forEach(e=>{var a,o;const l=r[e];l.mode===t.DialogMode.Fixed?n.push({id:e,label:l.label,index:null!==(a=l.index)&&void 0!==a?a:0}):l.mode===t.DialogMode.Anchored&&i.push({id:e,label:l.label,index:null!==(o=l.index)&&void 0!==o?o:0})}),n.sort((e,t)=>e.index-t.index),i.sort((e,t)=>e.index-t.index),(0,e.jsxs)(t.React.Fragment,{children:[(0,e.jsx)(a.DropdownItem,{header:!0,className:"page-header",children:o.formatMessage("dialog")}),(0,e.jsx)(a.DropdownItem,{className:"folder",header:!0,children:o.formatMessage("fixedWindows")}),n.map(r=>(0,e.jsx)(a.DropdownItem,{className:(0,t.classNames)("page-item in-folder",{active:o.currentDialogId===r.id}),active:o.currentDialogId===r.id,onClick:()=>{d(r.id)},children:(0,e.jsx)("div",{className:"text-truncate w-100",title:r.label,children:r.label})},r.id)),(0,e.jsx)(a.DropdownItem,{className:"folder",header:!0,children:o.formatMessage("anchoredWindows")}),i.map(r=>(0,e.jsx)(a.DropdownItem,{className:(0,t.classNames)("page-item in-folder",{active:o.currentDialogId===r.id}),active:o.currentDialogId===r.id,onClick:()=>{d(r.id)},children:(0,e.jsx)("div",{className:"text-truncate w-100",title:r.label,children:r.label})},r.id))]})}var u=s(4502),g=s.n(u),m=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const h=a=>{const o=window.SVG,{className:r}=a,n=m(a,["className"]),i=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:i,src:g()},n)):(0,e.jsx)("svg",Object.assign({className:i},n))};var f=s(3662),v=s.n(f),b=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const y=a=>{const o=window.SVG,{className:r}=a,n=b(a,["className"]),i=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:i,src:v()},n)):(0,e.jsx)("svg",Object.assign({className:i},n))};var x=s(4072),w=s.n(x),j=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const S=a=>{const o=window.SVG,{className:r}=a,n=j(a,["className"]),i=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:i,src:w()},n)):(0,e.jsx)("svg",Object.assign({className:i},n))};var I=s(2221),P=s.n(I),O=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const N=a=>{const o=window.SVG,{className:r}=a,n=O(a,["className"]),i=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:i,src:P()},n)):(0,e.jsx)("svg",Object.assign({className:i},n))};var T=s(5508),k=s.n(T),M=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const C=a=>{const o=window.SVG,{className:r}=a,n=M(a,["className"]),i=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:i,src:k()},n)):(0,e.jsx)("svg",Object.assign({className:i},n))},z={fixedLayoutTip:"Auto-calculate element tab orders in fixed layouts",fixedLayoutDesc:"For widgets in full-screen pages or fixed layouts (e.g., Fixed Panel, Card, List, etc.), turning on this option will automatically calculate their tab orders based on positions so that they sync up with the visual order for a better experience when it comes to accessibility support. This option will affect the overlay of widgets, so you may want to move certain elements forward or backward for desired results.",calTabOrder:"Calculate tab order for accessibility",a11yEnableWidgetSettings:"Enable accessibility settings for each widget"};function B(r){const{open:n,reference:i,enabledSettings:l,onToggle:s}=r,p=t.hooks.useTranslation(z,a.defaultMessages),d=t.ReactRedux.useSelector(e=>{var t,a;return null===(a=null===(t=e.appStateInBuilder)||void 0===t?void 0:t.appConfig)||void 0===a?void 0:a.useAutoSortInFixedLayout}),c=t.React.useCallback(e=>{(0,o.getAppConfigAction)().setUseAutoSortInFixedLayout(e.target.checked).exec()},[]),u=t.React.useCallback(e=>{let t=(0,o.getAppConfigAction)().appConfig;t.attributes||(t=t.set("attributes",{}));const a=t.attributes.set("enableA11yForWidgetSettings",!l);(0,o.getAppConfigAction)().editAttributes(a).exec()},[l]);return(0,e.jsx)(a.Popper,{open:n,reference:i,placement:"top-end",offsetOptions:10,toggle:s,"aria-label":p("calTabOrder"),css:t.css`
        width: 300px;
        padding: 16px;
        background-color: var(--ref-palette-neutral-500);
        color: var(--ref-palette-neutral-1100);
        font-size: 13px;
        font-weight: 500;
        line-height: 18px;
        border: 1px solid var(--ref-palette-neutral-600);;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
        border-radius: 3px;
      `,children:(0,e.jsxs)("div",{className:"builder-setting-content",children:[(0,e.jsxs)("div",{className:"d-flex align-items-center",children:[(0,e.jsx)("label",{className:"flex-grow-1",htmlFor:"fixed-tab-order-tip",children:p("fixedLayoutTip")}),(0,e.jsxs)("div",{className:"d-flex align-items-center ml-auto",children:[(0,e.jsx)(a.Tooltip,{title:p("fixedLayoutDesc"),children:(0,e.jsx)(a.Button,{icon:!0,disableRipple:!0,disableHoverEffect:!0,type:"tertiary",children:(0,e.jsx)(C,{})})}),(0,e.jsx)(a.Switch,{checked:d,onChange:c,id:"fixed-tab-order-tip"})]})]}),(0,e.jsx)("div",{children:(0,e.jsxs)(a.Label,{className:"d-flex align-items-center",children:[(0,e.jsx)("span",{className:"flex-grow-1",children:p("a11yEnableWidgetSettings")}),(0,e.jsx)(a.Switch,{checked:l,onChange:u})]})})]})})}var L=s(6055),R=s(2943),A=s.n(R),D=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const F=a=>{const o=window.SVG,{className:r}=a,n=D(a,["className"]),i=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:i,src:A()},n)):(0,e.jsx)("svg",Object.assign({className:i},n))};function E(r){const{layoutId:n,layoutItemId:i,label:l}=r,s=t.React.useCallback(()=>{o.builderAppSync.publishChangeSelectionToApp({layoutId:n,layoutItemId:i})},[n,i]);return(0,e.jsxs)(a.Button,{type:"tertiary",className:"h-100 bread-node text-truncate",onClick:s,children:[(0,e.jsx)("span",{className:"sep",children:(0,e.jsx)(F,{size:"s",autoFlip:!0})}),(0,e.jsx)("span",{className:"bread-label",children:l})]})}function G(){const r=t.hooks.useTranslation(a.defaultMessages),n=t.ReactRedux.useSelector(e=>{var t,a;return null===(a=null===(t=e.appStateInBuilder)||void 0===t?void 0:t.appRuntimeInfo)||void 0===a?void 0:a.selection},t.ReactRedux.shallowEqual),i=(t.ReactRedux.useSelector(e=>{var a;if(n){const{layoutId:o}=n,r=null===(a=e.appStateInBuilder)||void 0===a?void 0:a.appConfig.layouts[o];return r.type===t.LayoutType.GridLayout?r:null}return null},t.ReactRedux.shallowEqual),t.ReactRedux.useSelector(e=>{var t;return null===(t=e.appStateInBuilder)||void 0===t?void 0:t.browserSizeMode})),l=t.React.useCallback((e,a)=>{var o,r,n;if(!a.parent)return null;const{type:s,id:p}=a.parent,{mainSizeMode:d}=e;switch(s){case t.LayoutParentType.View:{const t=e.views[p],a=e.sections[t.parent],r=null!==(o=a.parent[i])&&void 0!==o?o:a.parent[d];if(1===r.length)return r[0];const n=r[0].layoutId,s=e.layouts[n];return l(e,s)}case t.LayoutParentType.Screen:{const t=e.screens[p],a=e.screenGroups[t.parent];return null!==(r=a.parent[i])&&void 0!==r?r:a.parent[d]}case t.LayoutParentType.Widget:{const t=e.widgets[p],a=null!==(n=t.parent[i])&&void 0!==n?n:t.parent[d];if(1===a.length)return a[0];const o=a[0].layoutId,r=e.layouts[o];return l(e,r)}default:return null}},[i]),s=t.React.useCallback((e,a)=>{const o=[];let r=e.content[a].parent;for(;null!=r;){const a=e.content[r];a.gridType===t.GridItemType.Row||(a.gridType,t.GridItemType.Column),o.push({layoutId:e.id,layoutItemId:r}),r=a.parent}return o},[]),p=t.css`
    margin-left: 32px;
    max-width: calc(100% - 550px);

    .nav {
      display: flex;
      white-space: nowrap;
      overflow: hidden;
    }

    .bread-node {
      flex: 0 auto;
      flex-shrink: 1000;
      display: inline-block;
      line-height: 16px;

      &:hover {
        flex: 1 0 auto;
        .sep svg {
          transform: translatex(4px);
          transition: transform ease-in-out .3s;
        }
      }

      &:first-of-type {
        flex: 0 0 auto;
        flex-shrink: 0.5;
        .sep {
          display: none;
        }
      }

      &:last-of-type {
        flex: 1 0 auto !important;
        &:hover {
          flex: 1 0 auto !important;
        }
      }

      .bread-label {
        font-size: 13px;
        flex: 0 1 auto;
      }

      .sep {
        padding-left: 4px;
        padding-right: 4px;
      }
    }
  `;return null==(null==n?void 0:n.layoutId)||null==n.layoutItemId?null:(0,e.jsx)("div",{className:"breadcrumb d-flex",css:p,children:(0,e.jsx)("nav",{className:"nav",children:(0,e.jsx)(t.ErrorBoundary,{children:(a=>{const{layoutId:n,layoutItemId:i}=a,p=(0,o.getAppConfigAction)().appConfig,d=[];let c=p.layouts[n];if(d.push(a),c.type===t.LayoutType.GridLayout){const e=s(c,i);e.length>0&&d.push(...e)}let u=l(p,c);for(;null!=u;){if(c=p.layouts[u.layoutId],d.push(u),c.type===t.LayoutType.GridLayout){const e=s(c,u.layoutItemId);e.length>0&&d.push(...e)}u=l(p,c)}return d.reverse().map((a,o)=>{const n=function(e,a,o,r){const n=e.layouts[a].content[o];switch(n.type){case t.LayoutItemType.Widget:{const t=n.widgetId;return t?e.widgets[t].label:r("placeholder")}case t.LayoutItemType.Section:const a=n.sectionId;return e.sections[a].label;case t.LayoutItemType.ScreenGroup:const o=n.screenGroupId;return e.screenGroups[o].label}const i=e.layouts[a];if(i.type===t.LayoutType.GridLayout){const a=n,l=i.content[n.parent];return(null==l?void 0:l.gridType)!==t.GridItemType.Tab||a.gridType!==t.GridItemType.Column&&a.gridType!==t.GridItemType.Row?a.gridType===t.GridItemType.Column?r("gridCol"):a.gridType===t.GridItemType.Row?r("gridRow"):r("tab"):(0,L.getLabelOfGridTab)(e,{layoutId:i.id,layoutItemId:o},r)}return r("none")}(p,a.layoutId,a.layoutItemId,r);return(0,e.jsx)(E,{layoutId:a.layoutId,layoutItemId:a.layoutItemId,label:n},o)})})(n)})})})}const V="right-sidebar",H=.5,$=100;class _ extends t.React.PureComponent{constructor(o){super(o),this.formatMessage=(e,t)=>this.props.intl.formatMessage({id:e,defaultMessage:z[e]},t),this.onPreviewScaleChange=e=>{e.stopPropagation();const t=this.fromRangeToZoomScale(Number(e.currentTarget.value));this.updateScale(t)},this.zoomOut=e=>{e.stopPropagation();const{zoomScale:t}=this.props,a=Math.round(100*t),o=10*Math.floor(a/10);let r;r=a===o?t-.1:o/100,r=Math.round(10*r)/10,r=Math.max(H,r),this.updateScale(r)},this.zoomIn=e=>{e.stopPropagation();const{zoomScale:t}=this.props,a=Math.round(100*t),o=10*Math.ceil(a/10);let r;r=a===o?t+.1:o/100,r=Math.round(10*r)/10,r=Math.min(2,r),this.updateScale(r)},this.zoomToFit=e=>{e.stopPropagation();const{viewportSize:t}=this.props,a=this.calAvailableWidth();let{width:o}=t;if(0===o){if(a>=1024)return void this.updateScale(1);o=1024}let r=a/o;r=Math.floor(100*r)/100,r=Math.max(.5,Math.min(2,r)),this.updateScale(r)},this.zoomToNormal=e=>{e.stopPropagation(),this.updateScale(1)},this.stopPropagation=e=>{e.stopPropagation()},this.toggleSettingPanel=()=>{(0,t.getAppStore)().dispatch(t.appActions.widgetStatePropChange(V,"collapse",!this.props.settingPanelVisible))},this.toggleTabConfigPopper=()=>{this.setState({isTabConfigPopperOpen:!this.state.isTabConfigPopperOpen}),t.lodash.defer(()=>{(0,t.focusElementInKeyboardMode)(this.a11yBtn)})},this.onDropDownToggle=e=>{const{isPageListOpen:t}=this.state;this.setState({isPageListOpen:!t}),null==e||e.stopPropagation()},this.getDropdownStyle=()=>t.css`
      padding: unset;
      max-width: 240px;

      .page-header {
        height: 2rem;
        background-color: var(--ref-palette-neutral-600);
        color: var(--ref-palette-neutral-1100) !important;
        font-size: 14px;
        line-height: 2rem;
        display: flex !important;
        align-items: center;
      }

      .page-item {
        font-size: 13px;
        color: var(--ref-palette-black) !important;
        padding: 0 24px !important;
        height: 2rem;

        &:not(.active):hover {
          background: var(--ref-palette-neutral-600) !important;
        }

        &.active {
          background: var(--sys-color-primary-main);
        }
      }

      .folder {
        font-size: 13px;
        color: var(--ref-palette-neutral-1000) !important;
        padding: 0 !important;
        margin: 0 24px;
        height: 2rem;
        line-height: 2rem;
      }

      .page-header,
      .folder {
        &:focus {
          outline: none;
        }
      }

      .in-folder {
        padding-left: 2.25rem !important;
      }
    `,this.renderPageList=()=>{var o;const{isPageListOpen:r}=this.state,{pages:n,currentPageId:i,currentDialogId:s,currentDialogLabel:p}=this.props,d=s?this.formatMessage("dialog"):this.formatMessage("page"),u=s?p:null===(o=null==n?void 0:n[i])||void 0===o?void 0:o.label;return(0,e.jsxs)("div",{className:"d-flex page-list align-items-center ml-4",children:[(0,e.jsxs)("div",{className:"page-label",children:[d,":"]}),(0,e.jsxs)(a.Dropdown,{direction:"up",size:"sm",toggle:this.onDropDownToggle,isOpen:r,menuItemCheckMode:"singleCheck","aria-label":d,children:[(0,e.jsx)(a.DropdownButton,{className:"page-select-btn text-truncate jimu-outline-inside",css:t.css`max-width: 240px; font-size: 12px;`,size:"sm",type:"tertiary",title:u,children:u}),(0,e.jsxs)(a.DropdownMenu,{css:this.getDropdownStyle(),children:[(0,e.jsx)(a.DropdownItem,{header:!0,className:"page-header",children:this.formatMessage("page")}),(0,e.jsx)(l,{currentPageId:s?null:i}),(0,e.jsx)(c,{currentDialogId:s,formatMessage:this.formatMessage})]})]})]})},this.state={isPageListOpen:!1,isTabConfigPopperOpen:!1}}calAvailableWidth(){const e=document.querySelector('div[data-widgetid="app-loader"]').getBoundingClientRect();let t=parseFloat(a.styleUtils.remToPixel("3rem"));isNaN(t)&&(t=48);return e.width-t-10}updateScale(e){o.builderAppSync.publishChangeZoomScaleToApp(e)}percentageZoomScale(){const{zoomScale:e}=this.props;return t.utils.formatPercentageNumber(`${Math.round(100*e)}%`)}mapStep(){return.1}fromZoomScaleToRange(e){return e<1?50*(e-H)/.5+0:e>1?50*(e-1)/1+50:50}fromRangeToZoomScale(e){return e<50?.5*(e-0)/50+H:e>50?1*(e-50)/50+1:1}calBackground(){const e=100*(this.fromZoomScaleToRange(this.props.zoomScale)-0)/100+"%",a=`linear-gradient(to right, var(--ref-palette-neutral-1000) 0%, var(--ref-palette-neutral-1000) ${e}, var(--ref-palette-neutral-700) ${e}, var(--ref-palette-neutral-600))`;return t.css`
      &::-webkit-slider-runnable-track {
        background: ${a} !important;
      }
      &::-moz-range-track {
        background: ${a} !important;
      }
      &::-ms-track {
        background: ${a} !important;
      }
    `}render(){const{zoomScale:o,settingPanelVisible:r,useAutoSortInFixedLayout:n,activePagePart:i,enabledA11ySettings:l}=this.props;return(0,e.jsxs)("div",{css:(s=this.props.theme,t.css`
    overflow: hidden;
    height: 100%;
    background-color: var(--sys-color-secondary-main);
    border-top: 1px solid var(--ref-palette-neutral-700);

    .zoom-section {
      .percentage-label {
        width: 4rem;
        color: var(--ref-palette-neutral-1100);
      }
      .form-control-range {
        margin: 0 8px 1px;
        &:focus {
          outline: 2px solid ${s.sys.color.action.focus};
        }
      }
    }

    .a11y-btn {
      font-size: 12px;
      height: 16px;
      line-height: 16px;
      &.active {
        background-color: var(--sys-color-primary-main) !important;
      }
    }

    .btn {
      padding: 0;
      &.page-select-btn, &.a11y-btn, &.page-zoom-select-btn {
        display: inline-block;
      }

      .jimu-icon {
        margin-right: 0;
        margin-left: 0;
      }
    }
    .jimu-dropdown-button {
      line-height: 16px;
      height: 18px;
    }

    .setting-panel-visible {
      background-color: var(--ref-palette-neutral-600);
      .btn {
        color: var(--ref-palette-black);
      }
    }

    .jimu-dropdown .jimu-icon {
      transform: rotate(180deg);
    }

    .page-list {
      .page-label {
        color: var(--ref-palette-neutral-1100);
        font-size: 12px;
        margin-right: 8px;
      }
      .icon-btn {
        color: var(--ref-palette-neutral-1100);
        &:hover {
          color: var(--ref-palette-black);
        }
        .jimu-icon {
          margin-left: 6px;
        }
      }
    }

    input[type='range'] {
      -webkit-appearance: none;
      background: transparent;
    }
    input[type='range']:focus {
      outline: none;
    }
    input[type='range']::-webkit-slider-runnable-track {
      width: 100%;
      height: 2px;
      cursor: pointer;
      background: var(--ref-palette-neutral-700);
      border-radius: 2px;
    }
    input[type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 12px;
      width: 12px;
      border-radius: 6px;
      cursor: pointer;
      background: var(--ref-palette-neutral-400);
      border: 2px solid var(--ref-palette-neutral-1000);
      margin-top: -5px;

      &:hover {
        border-color: var(--ref-palette-black);
      }
    }
    input[type='range']:focus::-webkit-slider-runnable-track {
      background: var(--ref-palette-neutral-700);
    }
    input[type='range']::-moz-range-track {
      width: 100%;
      height: 2px;
      cursor: pointer;
      background: var(--ref-palette-neutral-700);
      border-radius: 2px;
    }
    input[type='range']::-moz-range-thumb {
      height: 10px;
      width: 10px;
      border-radius: 8px;
      cursor: pointer;
      background: var(--ref-palette-neutral-400);
      border: 2px solid var(--ref-palette-neutral-1000);
      margin-top: -5px;
      &:hover {
        border-color: var(--ref-palette-black);
      }
    }
    input[type='range']::-ms-track {
      width: 100%;
      height: 2px;
      cursor: pointer;
      background: ${null===(p=null==s?void 0:s.ref.palette)||void 0===p?void 0:p.neutral[700]};
      border-radius: 2px;
    }
    input[type='range']::-ms-thumb {
      height: 10px;
      width: 10px;
      border-radius: 8px;
      cursor: pointer;
      background: ${null===(d=null==s?void 0:s.ref.palette)||void 0===d?void 0:d.neutral[400]};
      border: 2px solid ${null===(c=null==s?void 0:s.ref.palette)||void 0===c?void 0:c.neutral[1e3]};
      margin-top: 0px;
      &:hover {
        border-color: ${null===(u=null==s?void 0:s.ref.palette)||void 0===u?void 0:u.black};
      }
    }
  `),className:"jimu-widget widget-status-bar d-flex",children:[!window.isExpressBuilder&&i===t.PagePart.Body&&this.renderPageList(),!window.isExpressBuilder&&(0,e.jsx)(G,{}),(0,e.jsxs)("div",{className:"zoom-section flex-grow-1 d-flex justify-content-end align-items-center",children:[!window.isExpressBuilder&&(0,e.jsxs)(t.React.Fragment,{children:[(0,e.jsx)(a.Button,{type:"tertiary",onClick:this.toggleTabConfigPopper,className:(0,t.classNames)("a11y-btn mr-2 px-1 jimu-outline-inside",{active:n||l}),ref:e=>{this.a11yBtn=e},title:this.formatMessage("a11y"),"aria-label":this.formatMessage("a11y"),"aria-haspopup":"dialog","aria-expanded":this.state.isTabConfigPopperOpen,children:"A11Y"}),(0,e.jsx)(B,{open:this.state.isTabConfigPopperOpen,reference:this.a11yBtn,enabledSettings:l,onToggle:this.toggleTabConfigPopper})]}),(0,e.jsxs)("div",{className:"zoom-control d-flex h-100",role:"group","aria-label":this.formatMessage("pageZoom"),children:[(0,e.jsx)(a.Button,{type:"tertiary",disabled:o<=H,className:"jimu-outline-inside",title:this.formatMessage("zoomOut"),"aria-label":this.formatMessage("zoomOut"),onClick:this.zoomOut,children:(0,e.jsx)(h,{size:"s"})}),(0,e.jsx)("input",{css:this.calBackground(),type:"range",className:"form-control-range jimu-outline-inside","aria-label":this.formatMessage("zoomSlider"),min:0,max:$,step:this.mapStep(),value:this.fromZoomScaleToRange(o),onClick:this.stopPropagation,onChange:this.onPreviewScaleChange}),(0,e.jsx)(a.Button,{type:"tertiary",disabled:o>=2,className:"jimu-outline-inside",title:this.formatMessage("zoomIn"),"aria-label":this.formatMessage("zoomIn"),onClick:this.zoomIn,children:(0,e.jsx)(y,{size:"s"})})]}),(0,e.jsxs)(a.Dropdown,{direction:"up",size:"sm",className:"ml-2","aria-label":this.formatMessage("zoomScale"),children:[(0,e.jsx)(a.DropdownButton,{size:"sm",type:"tertiary",className:"page-zoom-select-btn jimu-outline-inside",children:this.percentageZoomScale()}),(0,e.jsx)(a.DropdownMenu,{css:t.css`min-width: 5rem;`,children:[200,175,150,125,100,75,50].map(o=>(0,e.jsx)(a.DropdownItem,{className:"justify-content-center",onClick:()=>{this.updateScale(o/100)},children:t.utils.formatPercentageNumber(`${o}%`)},o))})]}),(0,e.jsx)(a.Button,{type:"tertiary",className:"ml-2 jimu-outline-inside",onClick:this.zoomToNormal,title:this.formatMessage("zoomToNormal"),"aria-label":this.formatMessage("zoomToNormal"),children:(0,e.jsx)(N,{size:"s",className:"m-0"})}),(0,e.jsx)(a.Button,{type:"tertiary",className:"ml-2 jimu-outline-inside",onClick:this.zoomToFit,title:this.formatMessage("zoomToFit"),"aria-label":this.formatMessage("zoomToFit"),children:(0,e.jsx)(S,{size:"s",className:"m-0"})})]}),(0,e.jsx)("div",{className:(0,t.classNames)("setting-panel-section d-flex justify-content-center align-items-center ml-5 mr-2",{"setting-panel-visible":r}),children:(0,e.jsx)(a.Button,{type:"tertiary",title:r?this.formatMessage("closeSettingPanel"):this.formatMessage("openSettingPanel"),className:"px-2 jimu-outline-inside","aria-label":r?this.formatMessage("closeSettingPanel"):this.formatMessage("openSettingPanel"),"aria-haspopup":"dialog","aria-expanded":r,onClick:this.toggleSettingPanel,children:(0,e.jsx)(a.Icon,{icon:"./widgets/status-bar/dist/runtime/assets/setting-panel.svg",size:12,className:"m-0",autoFlip:!0})})})]});var s,p,d,c,u}}_.mapExtraStateProps=(e,a)=>{var o,r,n,i,l,s,p,d,c,u,g,m,h,f,v,b,y,x,w,j,S,I,P,O,N,T,k;const M=null!==(n=null===(r=null===(o=e.appStateInBuilder)||void 0===o?void 0:o.appRuntimeInfo)||void 0===r?void 0:r.zoomScale)&&void 0!==n?n:1,C=null!==(l=null===(i=e.appStateInBuilder)||void 0===i?void 0:i.browserSizeMode)&&void 0!==l?l:t.BrowserSizeMode.Large,z=t.utils.findViewportSize(null===(s=e.appStateInBuilder)||void 0===s?void 0:s.appConfig,C),B=null===(d=null===(p=null==e?void 0:e.appStateInBuilder)||void 0===p?void 0:p.appConfig)||void 0===d?void 0:d.pages,L=null===(u=null===(c=null==e?void 0:e.appStateInBuilder)||void 0===c?void 0:c.appConfig)||void 0===u?void 0:u.useAutoSortInFixedLayout,R=null===(m=null===(g=null==e?void 0:e.appStateInBuilder)||void 0===g?void 0:g.appConfig)||void 0===m?void 0:m.pageStructure,A=null===(f=null===(h=null==e?void 0:e.appStateInBuilder)||void 0===h?void 0:h.appRuntimeInfo)||void 0===f?void 0:f.currentPageId,D=null===(b=null===(v=null==e?void 0:e.appStateInBuilder)||void 0===v?void 0:v.appRuntimeInfo)||void 0===b?void 0:b.currentDialogId,F=D?null===(y=null==e?void 0:e.appStateInBuilder)||void 0===y?void 0:y.appConfig.dialogs[D].label:null,E=null!==(w=null===(x=null==e?void 0:e.appStateInBuilder)||void 0===x?void 0:x.appRuntimeInfo.activePagePart)&&void 0!==w?w:t.PagePart.Body,G=null!==(P=null===(I=null===(S=null===(j=null==e?void 0:e.appStateInBuilder)||void 0===j?void 0:j.appConfig)||void 0===S?void 0:S.attributes)||void 0===I?void 0:I.enableA11yForWidgetSettings)&&void 0!==P&&P;return{zoomScale:M,viewportSize:z,settingPanelVisible:null===(T=null===(N=null===(O=e.widgetsState)||void 0===O?void 0:O[V])||void 0===N?void 0:N.collapse)||void 0===T||T,pages:B,pageStructure:R,currentPageId:A,currentDialogId:D,currentDialogLabel:F,activePagePart:E,enabledA11ySettings:G,useAutoSortInFixedLayout:L,locale:null===(k=null==e?void 0:e.appContext)||void 0===k?void 0:k.locale}};const W=_;function Z(e){s.p=e}})(),p})())}}});