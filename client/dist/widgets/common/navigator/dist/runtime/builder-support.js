System.register(["jimu-core/emotion","jimu-core","jimu-for-builder","jimu-ui","jimu-layouts/layout-runtime","jimu-theme","jimu-ui/basic/list-tree"],function(e,o){var t={},n={},i={},l={},r={},a={},s={};return{setters:[function(e){t.jsx=e.jsx,t.jsxs=e.jsxs},function(e){n.AppMode=e.AppMode,n.Immutable=e.Immutable,n.LayoutType=e.LayoutType,n.React=e.React,n.ReactRedux=e.ReactRedux,n.classNames=e.classNames,n.css=e.css,n.getAppStore=e.getAppStore,n.hooks=e.hooks,n.i18n=e.i18n,n.lodash=e.lodash,n.polished=e.polished},function(e){i.getAppConfigAction=e.getAppConfigAction},function(e){l.Button=e.Button,l.NavButtonGroup=e.NavButtonGroup,l.Navigation=e.Navigation,l.PageNumber=e.PageNumber,l.Slider=e.Slider,l.TextAlignValue=e.TextAlignValue,l.Tooltip=e.Tooltip,l.defaultMessages=e.defaultMessages,l.utils=e.utils},function(e){r.LayoutItemSizeModes=e.LayoutItemSizeModes},function(e){a.ThemeSwitchComponent=e.ThemeSwitchComponent,a.getBoxStyles=e.getBoxStyles,a.getTheme=e.getTheme,a.getThemeModule=e.getThemeModule,a.mapping=e.mapping,a.useTheme=e.useTheme,a.useTheme2=e.useTheme2,a.useUseTheme2=e.useUseTheme2},function(e){s.List=e.List}],execute:function(){e((()=>{var e={1888:e=>{"use strict";e.exports=a},4108:e=>{"use strict";e.exports=i},12907:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 6"><circle cx="1104" cy="1049" r="3" fill="#000" fill-rule="nonzero" transform="translate(-1101 -1046)"></circle></svg>'},14321:e=>{"use strict";e.exports=l},37568:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M11.347 2.146a.485.485 0 0 1 0 .708L5.76 8l5.587 5.146a.486.486 0 0 1 0 .708.54.54 0 0 1-.738 0l-5.956-5.5a.485.485 0 0 1 0-.708l5.956-5.5a.54.54 0 0 1 .738 0" clip-rule="evenodd"></path></svg>'},41496:e=>{"use strict";e.exports=r},52943:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M4.653 13.854a.485.485 0 0 1 0-.708L10.24 8 4.653 2.854a.485.485 0 0 1 0-.708.54.54 0 0 1 .738 0l5.956 5.5a.485.485 0 0 1 0 .708l-5.956 5.5a.54.54 0 0 1-.738 0" clip-rule="evenodd"></path></svg>'},62838:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="m8.745 8 6.1 6.1a.527.527 0 1 1-.745.746L8 8.746l-6.1 6.1a.527.527 0 1 1-.746-.746l6.1-6.1-6.1-6.1a.527.527 0 0 1 .746-.746l6.1 6.1 6.1-6.1a.527.527 0 0 1 .746.746z"></path></svg>'},67386:e=>{"use strict";e.exports=t},79244:e=>{"use strict";e.exports=n},82606:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#000" fill-rule="evenodd" d="M1.25 2.5h17.5v11.25H1.25zM0 2.5c0-.69.56-1.25 1.25-1.25h17.5c.69 0 1.25.56 1.25 1.25v11.25c0 .69-.56 1.25-1.25 1.25H1.25C.56 15 0 14.44 0 13.75zm3.75 16.25h2.5V17.5h-2.5zm7.5 0h-2.5V17.5h2.5zm2.5 0h2.5V17.5h-2.5z" clip-rule="evenodd"></path></svg>'},98640:e=>{"use strict";e.exports=s}},o={};function d(t){var n=o[t];if(void 0!==n)return n.exports;var i=o[t]={exports:{}};return e[t](i,i.exports,d),i.exports}d.n=e=>{var o=e&&e.__esModule?()=>e.default:()=>e;return d.d(o,{a:o}),o},d.d=(e,o)=>{for(var t in o)d.o(o,t)&&!d.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:o[t]})},d.o=(e,o)=>Object.prototype.hasOwnProperty.call(e,o),d.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},d.p="";var u={};return d.p=window.jimuConfig.baseUrl,(()=>{"use strict";d.r(u),d.d(u,{default:()=>G});var e,o=d(67386),t=d(79244),n=d(4108);!function(e){e.Auto="AUTO",e.Custom="CUSTOM"}(e||(e={}));var i=d(14321),l=d(41496);d(82606);const r=e=>{var o,t;return"nav"===(null==e?void 0:e.type)&&!(null===(o=null==e?void 0:e.standard)||void 0===o?void 0:o.alternateIcon)&&!(null===(t=null==e?void 0:e.standard)||void 0===t?void 0:t.activedIcon)};var a=d(1888);const s={_widgetLabel:"Views Navigation",widgetPlaceholder:"Please link to a Section to use this widget.",widgetPlaceholderWithNoView:"Please select a view to use this widget.",tabDefault:"Tab default",tabUnderline:"Tab underline",tabPills:"Tab pills",arrow1:"Arrow 1",arrow2:"Arrow 2",arrow3:"Arrow 3"},{useEffect:c,useMemo:v,useCallback:p}=t.React,{useSelector:m,useDispatch:g}=t.ReactRedux,b=d(12907),h=d(37568),x=d(52943),f=e=>{if(!(null==e?void 0:e.value))return"";const o=e.value.split(",");return(null==o?void 0:o.length)?o[1]:""},y=e=>{var o,n,i,l;const{borderTop:r,borderBottom:a,borderLeft:s,borderRight:d}=e;return t.css`
    ${r&&`\n      border-top-width: ${r.width};\n      ${r.width&&`border-top-style: ${null!==(o=null==r?void 0:r.type)&&void 0!==o?o:"solid"};`}\n      border-top-color: ${r.color};\n    `}
    ${a&&`\n      border-bottom-width: ${a.width};\n      ${a.width&&`border-bottom-style: ${null!==(n=null==a?void 0:a.type)&&void 0!==n?n:"solid"};`}\n      border-bottom-color: ${a.color};\n    `}
    ${s&&`\n      border-left-width: ${s.width};\n      ${s.width&&`border-left-style: ${null!==(i=null==s?void 0:s.type)&&void 0!==i?i:"solid"};`}\n      border-left-color: ${s.color};\n    `}
    ${d&&`\n      border-right-width: ${d.width};\n      ${d.width&&`border-right-style: ${null!==(l=null==d?void 0:d.type)&&void 0!==l?l:"solid"};`}\n      border-right-color: ${d.color};\n    `}
  `},w=(e,o)=>{var n,i;const l=o?".jimu-nav-link-wrapper":"&.direction-button";return`\n    font-size: ${(null==e?void 0:e.size)?`${t.polished.rem(e.size)}!important`:""};\n    ${e.icon&&`${l} > .jimu-icon, .jimu-icon-img {\n      ${(null===(n=null==e?void 0:e.icon)||void 0===n?void 0:n.size)&&`\n        width: ${t.polished.rem(e.icon.size)};\n        height: ${t.polished.rem(e.icon.size)};\n      `};\n      ${(null===(i=null==e?void 0:e.icon)||void 0===i?void 0:i.color)&&`color: ${e.icon.color}`};\n    }`}\n `},$=(e,o)=>{var n,i,l,r,a,s;if(!e)return;const d=null===(n=null==e?void 0:e.item)||void 0===n?void 0:n.default,u=(null==d?void 0:d.merge((null===(i=null==e?void 0:e.item)||void 0===i?void 0:i.hover)||{},{deep:!0}))||(null===(l=null==e?void 0:e.item)||void 0===l?void 0:l.hover),c=(null==d?void 0:d.merge((null===(r=null==e?void 0:e.item)||void 0===r?void 0:r.active)||{},{deep:!0}))||(null===(a=null==e?void 0:e.item)||void 0===a?void 0:a.active),v=null===(s=null==e?void 0:e.item)||void 0===s?void 0:s.disabled;return t.css`
    .jimu-button {
      ${d&&`&:not(:hover):not(.active):not(:disabled):not(.disabled) {\n        ${w(d,o)}\n      }`}
      ${u&&`&:not(:disabled):not(.disabled):hover {\n        ${w(u,o)}\n      }`}
      ${c&&`\n        &:not(:disabled):not(.disabled).active,\n        &[aria-expanded="true"] {\n          ${w(c,o)}\n        }\n        &:not(:disabled):not(.disabled) {\n          cursor: pointer;\n        }\n      `}
      ${v&&`\n        &.disabled,\n        &:disabled {\n          ${w(v,o)}\n        }\n      `}
    }
  `},T=(e,o,n,i)=>{var l,r;return t.css`
    .jimu-nav{
      ${(null===(l=null==o?void 0:o.root)||void 0===l?void 0:l.bg)&&`background-color: ${o.root.bg};`}
      border-radius: ${(null===(r=null==o?void 0:o.root)||void 0===r?void 0:r.borderRadius)||"0px"};
      ${(e=>{if(!(null==e?void 0:e.item))return null;const{default:o,hover:n,active:i}=e.item,l=(null==o?void 0:o.merge(n||{},{deep:!0}))||n,r=(null==o?void 0:o.merge(i||{},{deep:!0}))||i;return t.css`
    .nav-item>.nav-link {
      ${o&&t.css`
        &:not(:hover):not(.active):not(:disabled):not(.disabled) {
          ${(0,a.getBoxStyles)(o)}
          ${y(o)}
        }
      `};
      ${l&&t.css`
        &:hover:not(.active),
        &[aria-expanded="true"] {
          ${(0,a.getBoxStyles)(l)};
          ${y(l)}
        }
      `}
      ${r&&t.css`
        &:not(:disabled):not(.disabled).active {
          ${(0,a.getBoxStyles)(r)}
          ${y(r)}
        }
      `}
    }
  `})(o)}
      ${((e,o)=>{const n=o?"right":"bottom",i=["top","bottom","left","right"].map(e=>n===e?"":`border-${e}-width: 0 !important;`).join("");return t.css`
    ${"underline"===e&&`\n      &.nav-underline {\n        ${i}\n        .nav-link {\n          ${i}\n        }\n        ${o&&`\n          .nav-item {\n            margin-right: -1px;\n          }\n          .nav-link {\n            ${i}\n          }\n        `}\n    `}
  `})(e,n)}
      ${$(o,!0)}
      ${(e=>{if(!e)return null;const{default:o,hover:n,disabled:i}=e;return t.css`
    .jimu-nav-button-group {
      .jimu-page-item {
        .direction-button {
          ${o&&`&:not(:hover):not(:disabled) {\n            color: ${o};\n          }`}
          ${n&&`&:hover {\n            color: ${n};\n          }`}
          ${i&&`&:disabled {\n            color: ${i};\n          }`}
        }
      }
    }
  `})(i)}
    }
`},j=e=>{var o;return t.css`
    .nav-button-group {
      ${(null===(o=null==e?void 0:e.root)||void 0===o?void 0:o.bg)&&`background-color: ${e.root.bg};`}
      .jimu-button {
        &.previous,
        &.next {
          ${(null==e?void 0:e.item)&&(e=>{if(!(null==e?void 0:e.item))return null;const{default:o,hover:n,disabled:i}=e.item,l=(null==o?void 0:o.merge(n||{},{deep:!0}))||n;return t.css`
    ${o&&t.css`
      &:not(:hover):not(:disabled):not(.disabled) {
        ${(0,a.getBoxStyles)(o)}
        ${y(o)}
      }
    `};
    ${l&&t.css`
      &:hover:not(:disabled):not(.disabled),
      &[aria-expanded="true"] {
        ${(0,a.getBoxStyles)(l)};
        ${y(l)}
      }
    `}
    ${i&&t.css`
      &.disabled,
      &:disabled {
        &,
        &:hover {
          ${(0,a.getBoxStyles)(i)}
          ${y(i)}
        }
      }`}
  `})(e)}
        }
      }
      ${$(e,!1)}
    }
 `},S=(e,o,n)=>{var i,l,r,a,s;const{track:d,thumb:u,progress:c}=e||{},v=(null==d?void 0:d.bg)||"var(--sys-color-divider-secondary)",p=(null===(i=null==u?void 0:u.default)||void 0===i?void 0:i.bg)||"var(--sys-color-primary-text)",m=(null===(r=null===(l=null==u?void 0:u.default)||void 0===l?void 0:l.border)||void 0===r?void 0:r.color)||"var(--sys-color-action-selected)",g=(null===(a=null==c?void 0:c.default)||void 0===a?void 0:a.bg)||"var(--sys-color-action-selected)",b=`\n    visibility: ${o?"hidden":"visible"};\n    background-color: ${p};\n    border-width: 2px;\n    border-style: solid;\n    border-color: ${m};\n    box-sizing: border-box;\n    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out; /* $btn-transition */\n    &:hover {\n      border-color: ${g};\n    }\n  `;return t.css`
    ${(null===(s=null==e?void 0:e.root)||void 0===s?void 0:s.bg)&&`background-color: ${e.root.bg};`}
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
        background: linear-gradient(to ${n?"left":"right"}, ${g}, ${g}) ${v} no-repeat left;
        background-size: 50% 100%, 100% 100%;
      }
      /* track - moz */
      &::-moz-range-track {
        border-radius: 50rem;
        background-color: ${v};
      }
      /* track - ms */
      &::-ms-track {
        border-radius: 50rem;
        background-color: ${v};
      }
      /* fill - moz */
      &::-moz-range-progress {
        border-radius: 50rem;
        background-color: ${g};
      }
      /* fill - ms */
      &::-ms-fill-lower {
        border-radius: 50rem;
        background-color: ${g};
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
          box-shadow: 0 0 0 2px ${p}, 0 0 0 3px ${m};
        }
        &::-moz-range-thumb {
          box-shadow: 0 0 0 2px ${p}, 0 0 0 3px ${m};
        }
      }
    }
  }
 `},I=e=>{var o,t;const{type:n,navStyle:i}=e||{},{showIcon:l,showText:r,alternateIcon:a,showPageNumber:s}=null!==(o=null==e?void 0:e.standard)&&void 0!==o?o:{};if("nav"===n){const{filename:e}=null!==(t=null==a?void 0:a.properties)&&void 0!==t?t:{};return`${n}-${i}-${l?"showIcon":"hideIcon"}-${r?"showText":"hideText"}-icon-${e}`}if("navButtonGroup"===n)return`${n}-${i}-${s?"showPageNumber":""}`};var k=function(e,o){var t={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&o.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(n=Object.getOwnPropertySymbols(e);i<n.length;i++)o.indexOf(n[i])<0&&Object.prototype.propertyIsEnumerable.call(e,n[i])&&(t[n[i]]=e[n[i]])}return t};const C=t.css`
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
`,N=e=>{const{className:n,data:l,progress:s=0,type:d,navStyle:u,vertical:c,advanced:p,variant:m,onChange:g,activeView:b,standard:h,paginationFontColor:x,navArrowColor:y,theme:w}=e,$=k(e,["className","data","progress","type","navStyle","vertical","advanced","variant","onChange","activeView","standard","paginationFontColor","navArrowColor","theme"]),{current:I,totalPage:N,showPageNumber:A,scrollable:B,disablePrevious:P,disableNext:M,previousText:R,previousIcon:z,nextText:O,nextIcon:L,showIcon:V,gap:E,alternateIcon:G,activedIcon:U,showText:_,showTitle:D,iconPosition:F,textAlign:J,hideThumb:K}=h||{},W=t.React.useRef(()=>0);t.React.useEffect(()=>(W.current=t.lodash.throttle(e=>{let o=+e.target.value;o=Number((o/100).toFixed(2)),null==g||g("slider",o)},100),()=>{W.current.cancel()}),[g]);const q=t.React.useCallback(e=>b===f(e),[b]),H=((e,o,n,i,l,r,a)=>v(()=>{var s,d,u;const c=null===(u=null===(d=null===(s=(0,t.getAppStore)())||void 0===s?void 0:s.getState())||void 0===d?void 0:d.appContext)||void 0===u?void 0:u.isRTL;return"slider"===e?S(i,r,c):n?"nav"===e?T(o,i,l,a):"navButtonGroup"===e?j(i):null:null},[n,i,e,o,l,a,r]))(d,u,p,m,c,K,y),Q=t.React.useMemo(()=>{var e,o,n,i,l,r,s;const d=(0,a.getThemeModule)(null==w?void 0:w.uri);if(a.mapping.whetherIsNewTheme(d))return null;const c=(null===(s=null===(r=null===(l=null===(i=null===(n=null===(o=null===(e=null==d?void 0:d.variables)||void 0===e?void 0:e.components)||void 0===o?void 0:o.nav)||void 0===n?void 0:n.variants)||void 0===i?void 0:i[u])||void 0===l?void 0:l.item)||void 0===r?void 0:r.default)||void 0===s?void 0:s.color)||"";return t.css`
      ${c?"":".nav-link:not(:hover):not(.active) {\n        color: var(--sys-color-action-text);\n      }"}
      .direction-button:not(:hover):not(.active):not(:disabled) {
        color: var(--sys-color-action-text);
      }
      ${x?"":".jimu-page-number {\n        color: var(--sys-color-action-text);\n      }"}
    `},[u,x,null==w?void 0:w.uri]),X=(e=>v(()=>t.css`
      ${"slider"===e&&"padding: 0.625rem 0.25rem;"}
      .nav-button-group >.direction-button {
        &:focus,
        &:focus-visible {
          outline-offset: -2px;
        }
      }
    `,[e]))(d),Y=t.hooks.useTranslation(i.defaultMessages);return(0,o.jsxs)("div",Object.assign({className:(0,t.classNames)("navigation",n),css:[C,H,X,Q]},$,{children:["nav"===d&&(0,o.jsx)(i.Navigation,{keepPaddingWhenOnlyIcon:r(e),onLinkClick:e=>{const o=f(e);null==g||g("nav",o)},role:"tablist",vertical:c,isActive:q,scrollable:B,data:l,gap:E,type:u,showIcon:V,alternateIcon:G,activedIcon:U,showText:_,showTitle:D||_||r(e)&&!_&&V,isUseNativeTitle:!0,iconPosition:F,textAlign:J}),"slider"===d&&(0,o.jsx)(i.Slider,{className:"h-100",value:100*s,hideThumb:K,onChange:e=>{var o;null===(o=e.persist)||void 0===o||o.call(e),W.current(e)},formatter:e=>{var o;const t=(null===(o=null==l?void 0:l.find(e=>f(e)===b))||void 0===o?void 0:o.name)||"";return`${Y("percentage")} ${Math.round(+e)}. ${t}`}}),"navButtonGroup"===d&&(0,o.jsx)(i.NavButtonGroup,{variant:"tertiary"===u?"text":"outlined",previousText:R,previousIcon:z,nextText:O,nextIcon:L,vertical:c,disablePrevious:P,disableNext:M,onChange:e=>{null==g||g("navButtonGroup",e)},children:A&&(0,o.jsx)(i.PageNumber,{current:I,totalPage:N,css:t.css`color: ${x}`})})]}))},A=e=>{const{title:n,children:i,selected:l,onClick:r}=e,s=(()=>{const e=(0,a.useTheme)(),o=(0,a.useTheme2)(),n=(0,a.useUseTheme2)(),i=window.jimuConfig.isBuilder!==n?o:e,l=(window.jimuConfig.isBuilder!==n?e:o).sys.color.primary.light,r=i?i.sys.color.surface.background:"transparent",s=i?i.sys.color.surface.backgroundText:"inherit";return t.React.useMemo(()=>t.css`
      width: 100%;
      height:  ${t.polished.rem(50)};
      padding: ${t.polished.rem(8)}  ${t.polished.rem(12)};
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${r};
      position: relative;
      color: ${s};
      &.selected {
        outline: 3px solid ${l};
      }
      >.overlay {
        z-index: 1;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
  `,[l,r,s])})();return(0,o.jsxs)("div",{css:s,title:n,className:(0,t.classNames)("quick-style-item",{selected:l}),onClick:r,children:[(0,o.jsx)("div",{className:"overlay"}),i]})},B=(0,t.Immutable)([{name:"v1",value:"p1,v1"},{name:"v2"},{name:"v3"},{name:"v4"}]),P=t.css`
  &.body {
    display: flex;
    padding: var(--sys-spacing-5);
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    .quick-style-item:not(:last-of-type) {
      margin-bottom: 10px;
    }
  }
`,M=d=>{const{widgetId:u}=d,c=t.ReactRedux.useSelector(e=>{var o;return null===(o=(e.appStateInBuilder?e.appStateInBuilder:e).appConfig.widgets[u])||void 0===o?void 0:o.config}),p=(e=>{const o=t.i18n.getIntl(e,"runtime"),n=t.React.useCallback(e=>o.formatMessage({id:e,defaultMessage:i.defaultMessages[e]||s[e]}),[o]),l=i.utils.toIconResult(h,n("arrowLeft"),16);l.properties.originalName="outlined/directional/left.svg";const r=i.utils.toIconResult(x,n("arrowRight"),16);r.properties.originalName="outlined/directional/right.svg";const a=i.utils.toIconResult(b,n("drawToolDot"),8);return v(()=>[{label:n("tabDefault"),type:"nav",navStyle:"default",standard:{gap:"0px",scrollable:!0,showIcon:!1,showText:!0,iconPosition:"start",textAlign:i.TextAlignValue.CENTER}},{label:n("tabUnderline"),type:"nav",navStyle:"underline",standard:{gap:"0px",scrollable:!0,showIcon:!1,showText:!0,iconPosition:"start",textAlign:i.TextAlignValue.CENTER}},{label:n("tabPills"),type:"nav",navStyle:"pills",standard:{gap:"0px",scrollable:!0,showIcon:!1,showText:!0,iconPosition:"start",textAlign:i.TextAlignValue.CENTER}},{label:n("symbol"),type:"nav",navStyle:"default",standard:{scrollable:!1,gap:"10px",showIcon:!0,alternateIcon:a,activedIcon:a,showText:!1,iconPosition:"start",textAlign:i.TextAlignValue.CENTER}},{label:n("slider"),type:"slider",navStyle:"default"},{label:n("arrow1"),type:"navButtonGroup",navStyle:"default",standard:{showPageNumber:!0,previousText:"",previousIcon:l,nextText:"",nextIcon:r}},{label:n("arrow2"),type:"navButtonGroup",navStyle:"tertiary",standard:{previousText:n("prev"),previousIcon:l,nextText:n("next"),nextIcon:r}},{label:n("arrow3"),type:"navButtonGroup",navStyle:"tertiary",standard:{showPageNumber:!0,previousText:"",previousIcon:l,nextText:"",nextIcon:r}}],[n,a,l,r])})(u),m=null==c?void 0:c.display,g=t.ReactRedux.useSelector(e=>e.appRuntimeInfo.appMode),f=o=>{const i=(0,t.Immutable)(o).set("vertical",g===t.AppMode.Express).set("advanced",!1).without("variant");(0,n.getAppConfigAction)().editWidgetProperty(u,"config",c.setIn(["data","type"],e.Auto).set("display",i)).exec(),((e,o)=>{var n,i;if(!o)return;let a;const s=(0,t.getAppStore)().getState();a=window.jimuConfig.isBuilder?null==s?void 0:s.appStateInBuilder:s;const d=null===(n=null==a?void 0:a.appRuntimeInfo)||void 0===n?void 0:n.selection,u=null===(i=a.appConfig.layouts)||void 0===i?void 0:i[null==d?void 0:d.layoutId];if(u&&(null==u?void 0:u.type)===t.LayoutType.FixedLayout){const t=r(e),n=null==e?void 0:e.vertical;o().editLayoutItemSize(d,n?60:380,n?380:60).exec(),o().editLayoutItemProperty(d,"setting.autoProps",{width:t||n?l.LayoutItemSizeModes.Auto:l.LayoutItemSizeModes.Custom,height:t||!n?l.LayoutItemSizeModes.Auto:l.LayoutItemSizeModes.Custom}).exec()}})(o,n.getAppConfigAction)},y=(0,a.getTheme)();return(0,o.jsx)(a.ThemeSwitchComponent,{useTheme2:window.jimuConfig.isBuilder,children:(0,o.jsx)("div",{className:"body",css:P,children:p.map((e,n)=>{const i=Object.assign({},e),l=i.label;delete i.label;const r="navButtonGroup"===e.type?{current:1,totalPage:4,disablePrevious:!0,disableNext:!1}:{},a="nav"===e.type?{scrollable:!1}:{},s=t.lodash.assign({},i.standard,r,a);return(0,o.jsx)(A,{title:l,selected:!(null==m?void 0:m.advanced)&&I(i)===I(m),onClick:()=>{f(i)},children:(0,o.jsx)(N,{type:i.type,data:B,navStyle:i.navStyle,activeView:"v1",standard:s,theme:y})},n)})})})};var R=d(98640),z=d(62838),O=d.n(z),L=function(e,o){var t={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&o.indexOf(n)<0&&(t[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(n=Object.getOwnPropertySymbols(e);i<n.length;i++)o.indexOf(n[i])<0&&Object.prototype.propertyIsEnumerable.call(e,n[i])&&(t[n[i]]=e[n[i]])}return t};const V=e=>{const n=window.SVG,{className:i}=e,l=L(e,["className"]),r=(0,t.classNames)("jimu-icon jimu-icon-component",i);return n?(0,o.jsx)(n,Object.assign({className:r,src:O()},l)):(0,o.jsx)("svg",Object.assign({className:r},l))},E=e=>t.css`
  width: 300px;
  height: 350px;
  overflow-y: auto;
  .jimu-tree-main {
    padding: 4px;
  }
  .jimu-tree-item__main-line {
    height: 32px;
    background-color: ${e.ref.palette.neutral[500]};
    &:hover {
      background-color: ${e.ref.palette.neutral[600]};
    }
    color: ${e.ref.palette.neutral[1100]};
  }
  .jimu-tree-item__body {
    border: none !important;
  }
`,G={NavQuickStyle:M,ManageViews:l=>{const{widgetId:r}=l,s=t.hooks.useTranslation(i.defaultMessages),d=(0,a.useTheme)(),u=t.ReactRedux.useSelector(e=>{var o;return null===(o=(e.appStateInBuilder?e.appStateInBuilder:e).appConfig.widgets[r])||void 0===o?void 0:o.config}),c=null==u?void 0:u.data,v=((o,n,i)=>{const l=m(e=>{var t,n,i,l,r,a,s;return(null==e?void 0:e.appStateInBuilder)?null===(l=null===(i=null===(n=null===(t=null==e?void 0:e.appStateInBuilder)||void 0===t?void 0:t.appConfig)||void 0===n?void 0:n.sections)||void 0===i?void 0:i[o])||void 0===l?void 0:l.views:null===(s=null===(a=null===(r=null==e?void 0:e.appConfig)||void 0===r?void 0:r.sections)||void 0===a?void 0:a[o])||void 0===s?void 0:s.views});return t.React.useMemo(()=>{const o=((i===e.Custom?n:l)||(0,t.Immutable)([])).asMutable();return o.sort((e,o)=>(null==l?void 0:l.indexOf(e))-(null==l?void 0:l.indexOf(o))),(0,t.Immutable)(o)},[n,l,i])})(null==c?void 0:c.section,null==c?void 0:c.views,null==c?void 0:c.type),p=(e=>{const o=m(e=>{var o,t,n;return(null==e?void 0:e.appStateInBuilder)?null===(t=null===(o=null==e?void 0:e.appStateInBuilder)||void 0===o?void 0:o.appConfig)||void 0===t?void 0:t.views:null===(n=null==e?void 0:e.appConfig)||void 0===n?void 0:n.views});return t.React.useMemo(()=>e.asMutable({deep:!0}).map(e=>{var t;return{id:e,label:null===(t=o[e])||void 0===t?void 0:t.label}}),[e,o])})(v),g=(null==c?void 0:c.type)===e.Auto;return(0,o.jsx)("div",{className:"p-3",css:E(d),children:(0,o.jsx)(R.List,{size:"default",itemsJson:p.map(e=>({itemKey:e.id,itemStateTitle:e.label,itemStateDisabled:1===(null==p?void 0:p.length)})),dndEnabled:g,isMultiSelection:!1,renderOverrideItemCommands:(e,t)=>{const l=t.props.itemJsons[0];return!(null==l?void 0:l.itemStateDisabled)?(0,o.jsx)(i.Tooltip,{title:s("deleteOption"),children:(0,o.jsx)(i.Button,{className:"p-0",onClick:()=>{(e=>{(0,n.getAppConfigAction)().removeView(e.itemKey,null==c?void 0:c.section).exec()})(l)},type:"tertiary",icon:!0,children:(0,o.jsx)(V,{size:"s"})})}):null},onDidDrop:(e,o)=>{const{itemJsons:t}=o.props,[,i]=t,l=i.map(e=>e.itemKey);var r;l.join(",")!==v.join(",")&&(r=l,(0,n.getAppConfigAction)().editSectionProperty(null==c?void 0:c.section,"views",r).exec())}})})}}})(),u})())}}});