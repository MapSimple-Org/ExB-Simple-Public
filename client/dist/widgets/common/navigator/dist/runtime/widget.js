System.register(["jimu-core/emotion","jimu-core","jimu-ui","jimu-layouts/layout-runtime","jimu-theme"],function(e,o){var n={},t={},i={},l={},r={};return{setters:[function(e){n.jsx=e.jsx,n.jsxs=e.jsxs},function(e){t.AppMode=e.AppMode,t.BaseVersionManager=e.BaseVersionManager,t.BrowserSizeMode=e.BrowserSizeMode,t.ButtonClickMessage=e.ButtonClickMessage,t.Immutable=e.Immutable,t.LayoutItemType=e.LayoutItemType,t.LinkType=e.LinkType,t.MessageManager=e.MessageManager,t.React=e.React,t.ReactRedux=e.ReactRedux,t.ViewChangeMessage=e.ViewChangeMessage,t.appActions=e.appActions,t.classNames=e.classNames,t.css=e.css,t.getAppStore=e.getAppStore,t.getIndexFromProgress=e.getIndexFromProgress,t.hooks=e.hooks,t.jimuHistory=e.jimuHistory,t.lodash=e.lodash,t.polished=e.polished},function(e){i.NavButtonGroup=e.NavButtonGroup,i.Navigation=e.Navigation,i.PageNumber=e.PageNumber,i.Slider=e.Slider,i.WidgetPlaceholder=e.WidgetPlaceholder,i.defaultMessages=e.defaultMessages,i.utils=e.utils},function(e){l.searchUtils=e.searchUtils},function(e){r.getBoxStyles=e.getBoxStyles,r.getThemeModule=e.getThemeModule,r.mapping=e.mapping}],execute:function(){e((()=>{var e={1888:e=>{"use strict";e.exports=r},12907:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 6"><circle cx="1104" cy="1049" r="3" fill="#000" fill-rule="nonzero" transform="translate(-1101 -1046)"></circle></svg>'},14321:e=>{"use strict";e.exports=i},37568:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M11.347 2.146a.485.485 0 0 1 0 .708L5.76 8l5.587 5.146a.486.486 0 0 1 0 .708.54.54 0 0 1-.738 0l-5.956-5.5a.485.485 0 0 1 0-.708l5.956-5.5a.54.54 0 0 1 .738 0" clip-rule="evenodd"></path></svg>'},41496:e=>{"use strict";e.exports=l},52943:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M4.653 13.854a.485.485 0 0 1 0-.708L10.24 8 4.653 2.854a.485.485 0 0 1 0-.708.54.54 0 0 1 .738 0l5.956 5.5a.485.485 0 0 1 0 .708l-5.956 5.5a.54.54 0 0 1-.738 0" clip-rule="evenodd"></path></svg>'},67386:e=>{"use strict";e.exports=n},79244:e=>{"use strict";e.exports=t},82606:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#000" fill-rule="evenodd" d="M1.25 2.5h17.5v11.25H1.25zM0 2.5c0-.69.56-1.25 1.25-1.25h17.5c.69 0 1.25.56 1.25 1.25v11.25c0 .69-.56 1.25-1.25 1.25H1.25C.56 15 0 14.44 0 13.75zm3.75 16.25h2.5V17.5h-2.5zm7.5 0h-2.5V17.5h2.5zm2.5 0h2.5V17.5h-2.5z" clip-rule="evenodd"></path></svg>'},89768:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="nonzero" d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm0-1h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m6 12.9a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6M3.16 7l1.7 1.686a.474.474 0 0 1 0 .674.483.483 0 0 1-.68 0L2.14 7.337a.474.474 0 0 1 0-.674L4.18 4.64a.483.483 0 0 1 .68 0 .474.474 0 0 1 0 .674zm9.68 0-1.7-1.686a.474.474 0 0 1 0-.674.483.483 0 0 1 .68 0l2.04 2.023a.474.474 0 0 1 0 .674L11.82 9.36a.483.483 0 0 1-.68 0 .474.474 0 0 1 0-.674zM5.4 12.9a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6m5.2 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6"></path></svg>'}},o={};function a(n){var t=o[n];if(void 0!==t)return t.exports;var i=o[n]={exports:{}};return e[n](i,i.exports,a),i.exports}a.n=e=>{var o=e&&e.__esModule?()=>e.default:()=>e;return a.d(o,{a:o}),o},a.d=(e,o)=>{for(var n in o)a.o(o,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:o[n]})},a.o=(e,o)=>Object.prototype.hasOwnProperty.call(e,o),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.p="";var d={};return a.p=window.jimuConfig.baseUrl,(()=>{"use strict";a.r(d),a.d(d,{__set_webpack_public_path__:()=>F,default:()=>U});var e=a(67386),o=a(79244),n=a(14321);const t={_widgetLabel:"Views Navigation",widgetPlaceholder:"Please link to a Section to use this widget.",widgetPlaceholderWithNoView:"Please select a view to use this widget.",tabDefault:"Tab default",tabUnderline:"Tab underline",tabPills:"Tab pills",arrow1:"Arrow 1",arrow2:"Arrow 2",arrow3:"Arrow 3"};var i=function(e,o){var n={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&o.indexOf(t)<0&&(n[t]=e[t]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(t=Object.getOwnPropertySymbols(e);i<t.length;i++)o.indexOf(t[i])<0&&Object.prototype.propertyIsEnumerable.call(e,t[i])&&(n[t[i]]=e[t[i]])}return n};const l=a(89768),r=r=>{const{show:a,message:d}=r,s=i(r,["show","message"]),u=o.hooks.useTranslation(t);return a?(0,e.jsx)(n.WidgetPlaceholder,Object.assign({},s,{className:"px-4",icon:l,name:u("_widgetLabel"),message:u(d)})):null};var s;!function(e){e.Auto="AUTO",e.Custom="CUSTOM"}(s||(s={}));var u=a(41496),v=a(82606),c=a.n(v);const p=e=>{var o,n;return"nav"===(null==e?void 0:e.type)&&!(null===(o=null==e?void 0:e.standard)||void 0===o?void 0:o.alternateIcon)&&!(null===(n=null==e?void 0:e.standard)||void 0===n?void 0:n.activedIcon)},g=e=>{var o,n;return!("nav"!==(null==e?void 0:e.type)||!(null===(o=null==e?void 0:e.standard)||void 0===o?void 0:o.alternateIcon)||!(null===(n=null==e?void 0:e.standard)||void 0===n?void 0:n.activedIcon))};var m=a(1888);const{useEffect:b,useMemo:h,useCallback:f}=o.React,{useSelector:w,useDispatch:y}=o.ReactRedux,x=(a(12907),a(37568),a(52943),(e,o)=>(100*e+100*o)/100),$=e=>{if(!(null==e?void 0:e.value))return"";const o=e.value.split(",");return(null==o?void 0:o.length)?o[1]:""},I=(e,n)=>{const t=(e=>{const n=o.ReactRedux.useSelector(e=>{var o;return null===(o=null==e?void 0:e.appConfig)||void 0===o?void 0:o.layouts}),t=o.ReactRedux.useSelector(e=>{var o;return null===(o=null==e?void 0:e.appConfig)||void 0===o?void 0:o.sections}),i=o.ReactRedux.useSelector(e=>null==e?void 0:e.browserSizeMode),l=o.ReactRedux.useSelector(e=>null==e?void 0:e.appConfig.mainSizeMode);return o.React.useMemo(()=>{const n=(0,o.getAppStore)().getState().appConfig,t=u.searchUtils.getContentsInTheSameContainer(n,e,o.LayoutItemType.Widget,o.LayoutItemType.Section,i);return t&&t.length>0?t:u.searchUtils.getContentsInTheSameContainer(n,e,o.LayoutItemType.Widget,o.LayoutItemType.Section,l)||[]},[e,i,t,n])})(e),i=o.hooks.useLatest(n),{current:l}=o.React.useRef((0,o.getAppStore)().getState().appContext.isInBuilder);b(()=>{var e;l&&(null===(e=i.current)||void 0===e||e.call(i,t))},[t,l,i])},S=e=>{const n=y();return f((t,i)=>{var l,r,a,d,s,u,v,c,p,g,m,b,h;const f=null===(l=(0,o.getAppStore)())||void 0===l?void 0:l.getState(),w=null===(a=null===(r=f.appConfig.sections)||void 0===r?void 0:r[e])||void 0===a?void 0:a.views,y=null===(s=null===(d=null==f?void 0:f.appRuntimeInfo)||void 0===d?void 0:d.sectionNavInfos)||void 0===s?void 0:s[e],$=(null==y?void 0:y.currentViewId)||w[0],I=(null==y?void 0:y.visibleViews)||w,S=null!==(u=null==y?void 0:y.progress)&&void 0!==u?u:0;let j=null;if((null===(p=null===(c=null===(v=f.appConfig)||void 0===v?void 0:v.sections)||void 0===c?void 0:c[e])||void 0===p?void 0:p.transition)&&"None"!==(null===(h=null===(b=null===(m=null===(g=f.appConfig)||void 0===g?void 0:g.sections)||void 0===m?void 0:m[e])||void 0===b?void 0:b.transition)||void 0===h?void 0:h.type)||(i=Math.ceil(i)),1===i)j=((e,n,t,i=(0,o.Immutable)([]))=>{let l=i.indexOf(n);l=-1===l?0:l;const r=i[e?Math.max(0,l-1):Math.min(i.length-1,l+1)];return(0,o.Immutable)({visibleViews:t}).set("previousViewId",n).set("currentViewId",r).set("useProgress",!1).set("progress",i.indexOf(r)/(i.length-1))})(t,$,w,I);else{const e=t?Math.max(x(S,-i/(w.length-1)),0):Math.min(x(S,i/(w.length-1)),1);j=M(e,w,I)}return n(o.appActions.sectionNavInfoChanged(e,j)),o.jimuHistory.changeViewBySectionNavInfo(e,j),j},[n,e])},M=(e,n,t=(0,o.Immutable)([]))=>{const i=(0,o.getIndexFromProgress)(e,t.length);return(0,o.Immutable)({visibleViews:n}).set("previousViewId",t[i.previousIndex]).set("currentViewId",t[i.currentIndex]).set("useProgress",!0).set("progress",e)},j=e=>{var n,t,i,l;const{borderTop:r,borderBottom:a,borderLeft:d,borderRight:s}=e;return o.css`
    ${r&&`\n      border-top-width: ${r.width};\n      ${r.width&&`border-top-style: ${null!==(n=null==r?void 0:r.type)&&void 0!==n?n:"solid"};`}\n      border-top-color: ${r.color};\n    `}
    ${a&&`\n      border-bottom-width: ${a.width};\n      ${a.width&&`border-bottom-style: ${null!==(t=null==a?void 0:a.type)&&void 0!==t?t:"solid"};`}\n      border-bottom-color: ${a.color};\n    `}
    ${d&&`\n      border-left-width: ${d.width};\n      ${d.width&&`border-left-style: ${null!==(i=null==d?void 0:d.type)&&void 0!==i?i:"solid"};`}\n      border-left-color: ${d.color};\n    `}
    ${s&&`\n      border-right-width: ${s.width};\n      ${s.width&&`border-right-style: ${null!==(l=null==s?void 0:s.type)&&void 0!==l?l:"solid"};`}\n      border-right-color: ${s.color};\n    `}
  `},k=(e,n)=>{var t,i;const l=n?".jimu-nav-link-wrapper":"&.direction-button";return`\n    font-size: ${(null==e?void 0:e.size)?`${o.polished.rem(e.size)}!important`:""};\n    ${e.icon&&`${l} > .jimu-icon, .jimu-icon-img {\n      ${(null===(t=null==e?void 0:e.icon)||void 0===t?void 0:t.size)&&`\n        width: ${o.polished.rem(e.icon.size)};\n        height: ${o.polished.rem(e.icon.size)};\n      `};\n      ${(null===(i=null==e?void 0:e.icon)||void 0===i?void 0:i.color)&&`color: ${e.icon.color}`};\n    }`}\n `},C=(e,n)=>{var t,i,l,r,a,d;if(!e)return;const s=null===(t=null==e?void 0:e.item)||void 0===t?void 0:t.default,u=(null==s?void 0:s.merge((null===(i=null==e?void 0:e.item)||void 0===i?void 0:i.hover)||{},{deep:!0}))||(null===(l=null==e?void 0:e.item)||void 0===l?void 0:l.hover),v=(null==s?void 0:s.merge((null===(r=null==e?void 0:e.item)||void 0===r?void 0:r.active)||{},{deep:!0}))||(null===(a=null==e?void 0:e.item)||void 0===a?void 0:a.active),c=null===(d=null==e?void 0:e.item)||void 0===d?void 0:d.disabled;return o.css`
    .jimu-button {
      ${s&&`&:not(:hover):not(.active):not(:disabled):not(.disabled) {\n        ${k(s,n)}\n      }`}
      ${u&&`&:not(:disabled):not(.disabled):hover {\n        ${k(u,n)}\n      }`}
      ${v&&`\n        &:not(:disabled):not(.disabled).active,\n        &[aria-expanded="true"] {\n          ${k(v,n)}\n        }\n        &:not(:disabled):not(.disabled) {\n          cursor: pointer;\n        }\n      `}
      ${c&&`\n        &.disabled,\n        &:disabled {\n          ${k(c,n)}\n        }\n      `}
    }
  `},R=(e,n,t,i)=>{var l,r;return o.css`
    .jimu-nav{
      ${(null===(l=null==n?void 0:n.root)||void 0===l?void 0:l.bg)&&`background-color: ${n.root.bg};`}
      border-radius: ${(null===(r=null==n?void 0:n.root)||void 0===r?void 0:r.borderRadius)||"0px"};
      ${(e=>{if(!(null==e?void 0:e.item))return null;const{default:n,hover:t,active:i}=e.item,l=(null==n?void 0:n.merge(t||{},{deep:!0}))||t,r=(null==n?void 0:n.merge(i||{},{deep:!0}))||i;return o.css`
    .nav-item>.nav-link {
      ${n&&o.css`
        &:not(:hover):not(.active):not(:disabled):not(.disabled) {
          ${(0,m.getBoxStyles)(n)}
          ${j(n)}
        }
      `};
      ${l&&o.css`
        &:hover:not(.active),
        &[aria-expanded="true"] {
          ${(0,m.getBoxStyles)(l)};
          ${j(l)}
        }
      `}
      ${r&&o.css`
        &:not(:disabled):not(.disabled).active {
          ${(0,m.getBoxStyles)(r)}
          ${j(r)}
        }
      `}
    }
  `})(n)}
      ${((e,n)=>{const t=n?"right":"bottom",i=["top","bottom","left","right"].map(e=>t===e?"":`border-${e}-width: 0 !important;`).join("");return o.css`
    ${"underline"===e&&`\n      &.nav-underline {\n        ${i}\n        .nav-link {\n          ${i}\n        }\n        ${n&&`\n          .nav-item {\n            margin-right: -1px;\n          }\n          .nav-link {\n            ${i}\n          }\n        `}\n    `}
  `})(e,t)}
      ${C(n,!0)}
      ${(e=>{if(!e)return null;const{default:n,hover:t,disabled:i}=e;return o.css`
    .jimu-nav-button-group {
      .jimu-page-item {
        .direction-button {
          ${n&&`&:not(:hover):not(:disabled) {\n            color: ${n};\n          }`}
          ${t&&`&:hover {\n            color: ${t};\n          }`}
          ${i&&`&:disabled {\n            color: ${i};\n          }`}
        }
      }
    }
  `})(i)}
    }
`},P=e=>{var n;return o.css`
    .nav-button-group {
      ${(null===(n=null==e?void 0:e.root)||void 0===n?void 0:n.bg)&&`background-color: ${e.root.bg};`}
      .jimu-button {
        &.previous,
        &.next {
          ${(null==e?void 0:e.item)&&(e=>{if(!(null==e?void 0:e.item))return null;const{default:n,hover:t,disabled:i}=e.item,l=(null==n?void 0:n.merge(t||{},{deep:!0}))||t;return o.css`
    ${n&&o.css`
      &:not(:hover):not(:disabled):not(.disabled) {
        ${(0,m.getBoxStyles)(n)}
        ${j(n)}
      }
    `};
    ${l&&o.css`
      &:hover:not(:disabled):not(.disabled),
      &[aria-expanded="true"] {
        ${(0,m.getBoxStyles)(l)};
        ${j(l)}
      }
    `}
    ${i&&o.css`
      &.disabled,
      &:disabled {
        &,
        &:hover {
          ${(0,m.getBoxStyles)(i)}
          ${j(i)}
        }
      }`}
  `})(e)}
        }
      }
      ${C(e,!1)}
    }
 `},T=(e,n,t)=>{var i,l,r,a,d;const{track:s,thumb:u,progress:v}=e||{},c=(null==s?void 0:s.bg)||"var(--sys-color-divider-secondary)",p=(null===(i=null==u?void 0:u.default)||void 0===i?void 0:i.bg)||"var(--sys-color-primary-text)",g=(null===(r=null===(l=null==u?void 0:u.default)||void 0===l?void 0:l.border)||void 0===r?void 0:r.color)||"var(--sys-color-action-selected)",m=(null===(a=null==v?void 0:v.default)||void 0===a?void 0:a.bg)||"var(--sys-color-action-selected)",b=`\n    visibility: ${n?"hidden":"visible"};\n    background-color: ${p};\n    border-width: 2px;\n    border-style: solid;\n    border-color: ${g};\n    box-sizing: border-box;\n    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out; /* $btn-transition */\n    &:hover {\n      border-color: ${m};\n    }\n  `;return o.css`
    ${(null===(d=null==e?void 0:e.root)||void 0===d?void 0:d.bg)&&`background-color: ${e.root.bg};`}
    .jimu-slider {
      display: block;
      width: 100%;
      -webkit-appearance: none;
      -moz-appearance: none;
      &:focus,
      &:active {
        outline: none;
      }
      &::-moz-focus-outer {
        border: none;
        outline: none;
      }
      padding: 0;
      cursor: pointer;
      &.rtl {
        transform: rotate(180deg);
      }

      &[type="range"] {
      /* thumb - webkit */
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        ${b}
      }
      /* thumb - moz */
      &::-moz-range-thumb {
        -moz-appearance: none;
        ${b}
      }
      /* thumb - ms */
      &::-ms-thumb {
        margin-top: 0;
        ${b}
      }
      /* track - webkit */
      &::-webkit-slider-runnable-track {
        border-radius: 50rem;
        background: linear-gradient(to ${t?"left":"right"}, ${m}, ${m}) ${c} no-repeat left;
        background-size: 50% 100%, 100% 100%;
      }
      /* track - moz */
      &::-moz-range-track {
        border-radius: 50rem;
        background-color: ${c};
      }
      /* track - ms */
      &::-ms-track {
        border-radius: 50rem;
        background-color: ${c};
      }
      /* fill - moz */
      &::-moz-range-progress {
        border-radius: 50rem;
        background-color: ${m};
      }
      /* fill - ms */
      &::-ms-fill-lower {
        border-radius: 50rem;
        background-color: ${m};
      }
      &::-ms-fill-upper {
        display: none;
      }
      /* tooltip - ms */
      &::-ms-tooltip {
        display: none;
      }
      &:focus {
        &::-webkit-slider-thumb {
          box-shadow: 0 0 0 2px ${p}, 0 0 0 3px ${g};
        }
        &::-moz-range-thumb {
          box-shadow: 0 0 0 2px ${p}, 0 0 0 3px ${g};
        }
      }
    }
  }
 `},O=(e,t)=>{const i=w(e=>e.appConfig.views),l=w(e=>{const o=e.appConfig.pages,n=Object.keys(o).find(e=>{var n;return null===(n=null==o?void 0:o[e])||void 0===n?void 0:n.isDefault});return e.appRuntimeInfo.currentPageId||n});return o.React.useMemo(()=>{var r;return null!==(r=null==e?void 0:e.map(e=>{var r,a,d;const s=null===(r=null==i?void 0:i[e])||void 0===r?void 0:r.label,u=(null===(a=null==i?void 0:i[e])||void 0===a?void 0:a.icon)||n.utils.toIconResult(c(),"",16);return{name:s,linkType:o.LinkType.View,value:`${l},${e}`,icon:g(t)?void 0:u,navLinkAriaControls:`${null===(d=null==i?void 0:i[e])||void 0===d?void 0:d.parent}_${e}`}}))&&void 0!==r?r:(0,o.Immutable)([])},[t,l,i,e])};var B=function(e,o){var n={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&o.indexOf(t)<0&&(n[t]=e[t]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(t=Object.getOwnPropertySymbols(e);i<t.length;i++)o.indexOf(t[i])<0&&Object.prototype.propertyIsEnumerable.call(e,t[i])&&(n[t[i]]=e[t[i]])}return n};const z=o.css`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  .nav-button-group .jimu-page-number .page-span.current-page {
    color: inherit !important;
  }
  .nav-button-group {
    .jimu-page-link-outlined:disabled {
      &, &:hover {
        background-color: var(--sys-color-action-disabled);
        border-color: var(--sys-color-divider-secondary);
      }
    }
  }
`,N=t=>{const{className:i,data:l,progress:r=0,type:a,navStyle:d,vertical:s,advanced:u,variant:v,onChange:c,activeView:g,standard:b,paginationFontColor:f,navArrowColor:w,theme:y}=t,x=B(t,["className","data","progress","type","navStyle","vertical","advanced","variant","onChange","activeView","standard","paginationFontColor","navArrowColor","theme"]),{current:I,totalPage:S,showPageNumber:M,scrollable:j,disablePrevious:k,disableNext:C,previousText:O,previousIcon:N,nextText:V,nextIcon:A,showIcon:L,gap:_,alternateIcon:E,activedIcon:W,showText:U,showTitle:F,iconPosition:G,textAlign:H,hideThumb:D}=b||{},q=o.React.useRef(()=>0);o.React.useEffect(()=>(q.current=o.lodash.throttle(e=>{let o=+e.target.value;o=Number((o/100).toFixed(2)),null==c||c("slider",o)},100),()=>{q.current.cancel()}),[c]);const J=o.React.useCallback(e=>g===$(e),[g]),K=((e,n,t,i,l,r,a)=>h(()=>{var d,s,u;const v=null===(u=null===(s=null===(d=(0,o.getAppStore)())||void 0===d?void 0:d.getState())||void 0===s?void 0:s.appContext)||void 0===u?void 0:u.isRTL;return"slider"===e?T(i,r,v):t?"nav"===e?R(n,i,l,a):"navButtonGroup"===e?P(i):null:null},[t,i,e,n,l,a,r]))(a,d,u,v,s,D,w),Q=o.React.useMemo(()=>{var e,n,t,i,l,r,a;const s=(0,m.getThemeModule)(null==y?void 0:y.uri);if(m.mapping.whetherIsNewTheme(s))return null;const u=(null===(a=null===(r=null===(l=null===(i=null===(t=null===(n=null===(e=null==s?void 0:s.variables)||void 0===e?void 0:e.components)||void 0===n?void 0:n.nav)||void 0===t?void 0:t.variants)||void 0===i?void 0:i[d])||void 0===l?void 0:l.item)||void 0===r?void 0:r.default)||void 0===a?void 0:a.color)||"";return o.css`
      ${u?"":".nav-link:not(:hover):not(.active) {\n        color: var(--sys-color-action-text);\n      }"}
      .direction-button:not(:hover):not(.active):not(:disabled) {
        color: var(--sys-color-action-text);
      }
      ${f?"":".jimu-page-number {\n        color: var(--sys-color-action-text);\n      }"}
    `},[d,f,null==y?void 0:y.uri]),X=(e=>h(()=>o.css`
      ${"slider"===e&&"padding: 0.625rem 0.25rem;"}
      .nav-button-group >.direction-button {
        &:focus,
        &:focus-visible {
          outline-offset: -2px;
        }
      }
    `,[e]))(a),Y=o.hooks.useTranslation(n.defaultMessages);return(0,e.jsxs)("div",Object.assign({className:(0,o.classNames)("navigation",i),css:[z,K,X,Q]},x,{children:["nav"===a&&(0,e.jsx)(n.Navigation,{keepPaddingWhenOnlyIcon:p(t),onLinkClick:e=>{const o=$(e);null==c||c("nav",o)},role:"tablist",vertical:s,isActive:J,scrollable:j,data:l,gap:_,type:d,showIcon:L,alternateIcon:E,activedIcon:W,showText:U,showTitle:F||U||p(t)&&!U&&L,isUseNativeTitle:!0,iconPosition:G,textAlign:H}),"slider"===a&&(0,e.jsx)(n.Slider,{className:"h-100",value:100*r,hideThumb:D,onChange:e=>{var o;null===(o=e.persist)||void 0===o||o.call(e),q.current(e)},formatter:e=>{var o;const n=(null===(o=null==l?void 0:l.find(e=>$(e)===g))||void 0===o?void 0:o.name)||"";return`${Y("percentage")} ${Math.round(+e)}. ${n}`}}),"navButtonGroup"===a&&(0,e.jsx)(n.NavButtonGroup,{variant:"tertiary"===d?"text":"outlined",previousText:O,previousIcon:N,nextText:V,nextIcon:A,vertical:s,disablePrevious:k,disableNext:C,onChange:e=>{null==c||c("navButtonGroup",e)},children:M&&(0,e.jsx)(n.PageNumber,{current:I,totalPage:S,css:o.css`color: ${f}`})})]}))},V={data:{type:"AUTO",section:"",views:[]},display:{advanced:!1,vertical:!1,navType:"default",alignment:"center",showText:!0,showIcon:!1,iconPosition:"start"}};class A extends o.BaseVersionManager{constructor(){super(...arguments),this.versions=[{version:"1.0.0",description:"Version manager for release 1.0.0",upgrader:e=>{var o;if(!e)return V;let n=e;return(null===(o=null==e?void 0:e.display)||void 0===o?void 0:o.variants)&&(n=n.setIn(["display","advanced"],!0)),n}},{version:"1.1.0",description:"Version manager for release 1.1.0",upgrader:e=>(e=>{const n=e;if(!e)return;const t=n.display;if(!t)return e;let i=(0,o.Immutable)({});const l=((e,o)=>{if(!e)return;const n=null==e?void 0:e[o];if(!n)return;let t=n;return n.bg&&(t=t.setIn(["root","bg"],n.bg),t=t.without("bg")),t})(t.variants,t.navType);return i=i.set("type","nav").set("vertical",t.vertical).set("advanced",t.advanced).set("navStyle",t.navType).set("standard",{scrollable:!0,textAlign:t.alignment,showText:t.showText,showIcon:t.showIcon,iconPosition:t.iconPosition}).set("variant",l),n.set("display",i)})(e||V)},{version:"1.13.0",description:"Change borderRadius from 50rem to 6.25rem in pills style",upgrader:e=>{var o,n,t,i;if("pills"!==(null===(o=null==e?void 0:e.display)||void 0===o?void 0:o.navStyle)||!(null===(n=null==e?void 0:e.display)||void 0===n?void 0:n.advanced))return e;let l=e;return Object.keys((null===(i=null===(t=null==l?void 0:l.display)||void 0===t?void 0:t.variant)||void 0===i?void 0:i.item)||{}).forEach(e=>{var o,n,t,i;"50rem"===(null===(i=null===(t=null===(n=null===(o=null==l?void 0:l.display)||void 0===o?void 0:o.variant)||void 0===n?void 0:n.item)||void 0===t?void 0:t[e])||void 0===i?void 0:i.borderRadius)&&(l=l.setIn(["display","variant","item",e,"borderRadius"],"6.25rem"))}),l}}]}}const L=new A,{useRef:_}=o.React,{useSelector:E}=o.ReactRedux,W=n=>{var t,i,l;const{id:a,config:d,builderSupportModules:u,theme:v}=n,c=null===(t=null==u?void 0:u.jimuForBuilderLib)||void 0===t?void 0:t.getAppConfigAction,p=_(null),g=null==d?void 0:d.display,m=null==d?void 0:d.data,x=null==g?void 0:g.standard,$=null==m?void 0:m.type,j=null==m?void 0:m.section,k=null!==(i=null==x?void 0:x.step)&&void 0!==i?i:1,C=E(e=>{var o,n,t,i;return null===(i=null===(t=null===(n=null===(o=null==e?void 0:e.appConfig)||void 0===o?void 0:o.sections)||void 0===n?void 0:n[j])||void 0===t?void 0:t.views)||void 0===i?void 0:i[0]}),R=E(e=>{var o,n;return null===(n=null===(o=null==e?void 0:e.appRuntimeInfo)||void 0===o?void 0:o.sectionNavInfos)||void 0===n?void 0:n[j]}),P=((e,n,t)=>{const i=w(o=>{var n,t,i,l,r,a,d;return(null==o?void 0:o.appStateInBuilder)?null===(l=null===(i=null===(t=null===(n=null==o?void 0:o.appStateInBuilder)||void 0===n?void 0:n.appConfig)||void 0===t?void 0:t.sections)||void 0===i?void 0:i[e])||void 0===l?void 0:l.views:null===(d=null===(a=null===(r=null==o?void 0:o.appConfig)||void 0===r?void 0:r.sections)||void 0===a?void 0:a[e])||void 0===d?void 0:d.views});return o.React.useMemo(()=>{const e=((t===s.Custom?n:i)||(0,o.Immutable)([])).asMutable();return e.sort((e,o)=>(null==i?void 0:i.indexOf(e))-(null==i?void 0:i.indexOf(o))),(0,o.Immutable)(e)},[n,i,t])})(j,null==m?void 0:m.views,$),T=O(P,g),B=null==R?void 0:R.progress,z=null==R?void 0:R.useProgress,V=null!==(l=null==R?void 0:R.currentViewId)&&void 0!==l?l:C,A=(L=null==g?void 0:g.vertical,h(()=>o.css`
      overflow: hidden;
      min-height: ${L?o.polished.rem(16):"unset"};
      min-width: ${L?"unset":o.polished.rem(16)};
      max-width: 100vw;
      max-height: 100vh;
    `,[L]));var L;const W=o.React.useMemo(()=>{const e=((e,o,n,t)=>{var i,l;let r,a;const d=null!==(i=null==t?void 0:t.length)&&void 0!==i?i:0;let s=(null==t?void 0:t.includes(e))?null==t?void 0:t.indexOf(e):0;if(s+=1,n){let e=0;const n=null!==(l=null==t?void 0:t.length)&&void 0!==l?l:0;if(n>1){e=o*(n-1);const t=e%1;e=Math.floor(e),r=0===e&&0===t,a=e===d-1&&0===t}}else r=s<=1,a=s===d;return{current:s,totalPage:d,disableNext:a,disablePrevious:r}})(V,B,z,P);return(x||(0,o.Immutable)({})).merge(e).asMutable({deep:!0})},[V,B,x,z,P]),U=((e,n)=>f(t=>{var i;const l=(0,o.getAppStore)().getState().appConfig.widgets[e].config,r=null===(i=null==l?void 0:l.data)||void 0===i?void 0:i.section;if(!(null==t?void 0:t.includes(r))){if(!r&&!(null==t?void 0:t[0]))return;n().editWidgetProperty(e,"config",l.setIn(["data","section"],null==t?void 0:t[0])).exec(!1)}},[n,e]))(a,c);I(a,U);const F=((e,n)=>f(t=>{var i,l,r,a,d,u;const v=(0,o.getAppStore)().getState().appConfig.widgets[e].config;if((null===(i=null==v?void 0:v.data)||void 0===i?void 0:i.type)===s.Auto)return;const c=null===(r=null===(l=null==v?void 0:v.data)||void 0===l?void 0:l.views)||void 0===r?void 0:r.filter(e=>null==t?void 0:t.includes(e));((null==c?void 0:c.length)||(null===(d=null===(a=null==v?void 0:v.data)||void 0===a?void 0:a.views)||void 0===d?void 0:d.length))&&(o.lodash.isDeepEqual(c,null===(u=null==v?void 0:v.data)||void 0===u?void 0:u.views)||n().editWidgetProperty(e,"config",v.setIn(["data","views"],c)).exec(!1))},[n,e]))(a,c);((e,n)=>{const t=w(o=>{var n,t,i;return null===(i=null===(t=null===(n=null==o?void 0:o.appConfig)||void 0===n?void 0:n.sections)||void 0===t?void 0:t[e])||void 0===i?void 0:i.views}),{current:i}=o.React.useRef((0,o.getAppStore)().getState().appContext.isInBuilder),l=o.hooks.useLatest(n);b(()=>{var e;i&&(null===(e=l.current)||void 0===e||e.call(l,t))},[t,l,i])})(j,F);const G=S(j),H=(e=>{const n=y();return f(t=>{var i,l,r,a,d,s;const u=null===(i=(0,o.getAppStore)())||void 0===i?void 0:i.getState(),v=null===(r=null===(l=u.appConfig.sections)||void 0===l?void 0:l[e])||void 0===r?void 0:r.views,c=null===(s=null===(d=null===(a=u.appRuntimeInfo)||void 0===a?void 0:a.sectionNavInfos)||void 0===d?void 0:d[e])||void 0===s?void 0:s.visibleViews,p=M(t,v,c);return n(o.appActions.sectionNavInfoChanged(e,p)),p},[n,e])})(j),D=o.hooks.useEventCallback((e,n)=>{let t;"navButtonGroup"===e?t=G(n,k):"slider"===e&&(t=H(n));const i=V,l=t?t.currentViewId:n;((e,n)=>{if(e===n)return;const t=new o.ViewChangeMessage(a,e,n);o.MessageManager.getInstance().publishMessage(t)})(l,i),"nav"===e&&((e,n)=>{if(e===n){const e=new o.ButtonClickMessage(a);o.MessageManager.getInstance().publishMessage(e)}})(l,i)});return((e,n)=>{const t=w(e=>{var o;return null===(o=null==e?void 0:e.appConfig)||void 0===o?void 0:o.layouts}),i=w(o=>{var n,t,i;return null===(i=null===(t=null===(n=null==o?void 0:o.appConfig)||void 0===n?void 0:n.sections)||void 0===t?void 0:t[e])||void 0===i?void 0:i.views}),l=w(e=>{var o;return null===(o=null==e?void 0:e.appConfig)||void 0===o?void 0:o.views}),r=w(e=>{var o;return null===(o=null==e?void 0:e.appConfig)||void 0===o?void 0:o.widgets}),a=o.ReactRedux.useSelector(e=>e.appRuntimeInfo.appMode===o.AppMode.Express),d=o.React.useMemo(()=>a?i.map(e=>l[e]).filter(e=>{const{layout:n,label:i}=e,[l,a,d]=[o.BrowserSizeMode.Large,o.BrowserSizeMode.Medium,o.BrowserSizeMode.Small].map(e=>{var i;const l=Object.values((null===(i=t[n[e]])||void 0===i?void 0:i.content)||{});return!!l.length&&l.every(e=>e.type===o.LayoutItemType.Widget&&e.widgetId)});if(l&&a&&d){if(!e.icon)return!0;const o=Object.values(n||{});let l=!1;return o.forEach(o=>{var n;Object.values((null===(n=t[o])||void 0===n?void 0:n.content)||{}).filter(e=>e.widgetId).forEach(o=>{var n;const t=null===(n=r[o.widgetId])||void 0===n?void 0:n.label;i&&t&&e.icon&&i!==t&&(l=!0)})}),l}return!1}):[],[l,r,a,t,i]);o.React.useEffect(()=>{if(!d.length)return;const e=n();let i=!1;d.forEach(n=>{var l,r,a,d,s,u,v;const{layout:c,id:p,icon:g}=n,m=null===(l=t[c[Object.keys(c)[0]]])||void 0===l?void 0:l.content;if(m){const n=null===(a=null===(r=Object.values(m))||void 0===r?void 0:r[0])||void 0===a?void 0:a.id,l=null===(u=null===(s=null===(d=t[c[Object.keys(c)[0]]])||void 0===d?void 0:d.content)||void 0===s?void 0:s[n])||void 0===u?void 0:u.widgetId,{label:b,icon:h}=(null===(v=(0,o.getAppStore)().getState().appConfig.widgets)||void 0===v?void 0:v[l])||{};i=!0,g?e.editViewProperty(p,"label",b):e.editViewProperty(p,"icon",{svg:h,properties:{filename:b}}).editViewProperty(p,"label",b)}}),i&&e.exec()},[d])})(j,c),(0,e.jsxs)("div",{className:"widget-view-navigation jimu-widget",css:A,ref:p,children:[(0,e.jsx)(r,{widgetId:a,show:!T.length,message:j&&!T.length?"widgetPlaceholderWithNoView":"widgetPlaceholder",direction:(null==g?void 0:g.vertical)?"vertical":"horizontal"}),(0,e.jsx)(N,Object.assign({data:T,activeView:V,progress:B,onChange:D},g,{standard:W,theme:v}))]})};W.versionManager=L;const U=W;function F(e){a.p=e}})(),d})())}}});