System.register(["jimu-core","jimu-for-builder","jimu-ui","jimu-core/emotion","jimu-layouts/layout-runtime","jimu-theme"],function(e,t){var o={},n={},i={},l={},r={},a={};return{setters:[function(e){o.AppMode=e.AppMode,o.BrowserSizeMode=e.BrowserSizeMode,o.Immutable=e.Immutable,o.LayoutType=e.LayoutType,o.React=e.React,o.ReactRedux=e.ReactRedux,o.appActions=e.appActions,o.classNames=e.classNames,o.css=e.css,o.getAppStore=e.getAppStore,o.hooks=e.hooks,o.i18n=e.i18n,o.lodash=e.lodash,o.polished=e.polished},function(e){n.appBuilderSync=e.appBuilderSync,n.builderAppSync=e.builderAppSync,n.getAppConfigAction=e.getAppConfigAction},function(e){i.NavButtonGroup=e.NavButtonGroup,i.Navigation=e.Navigation,i.PageNumber=e.PageNumber,i.Slider=e.Slider,i.TextAlignValue=e.TextAlignValue,i.defaultMessages=e.defaultMessages,i.utils=e.utils},function(e){l.jsx=e.jsx,l.jsxs=e.jsxs},function(e){r.LayoutItemSizeModes=e.LayoutItemSizeModes},function(e){a.ThemeSwitchComponent=e.ThemeSwitchComponent,a.getBoxStyles=e.getBoxStyles,a.getTheme=e.getTheme,a.getThemeModule=e.getThemeModule,a.mapping=e.mapping,a.useTheme=e.useTheme,a.useTheme2=e.useTheme2,a.useUseTheme2=e.useUseTheme2}],execute:function(){e((()=>{var e={1888:e=>{"use strict";e.exports=a},4108:e=>{"use strict";e.exports=n},12907:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 6"><circle cx="1104" cy="1049" r="3" fill="#000" fill-rule="nonzero" transform="translate(-1101 -1046)"></circle></svg>'},14321:e=>{"use strict";e.exports=i},37568:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M11.347 2.146a.485.485 0 0 1 0 .708L5.76 8l5.587 5.146a.486.486 0 0 1 0 .708.54.54 0 0 1-.738 0l-5.956-5.5a.485.485 0 0 1 0-.708l5.956-5.5a.54.54 0 0 1 .738 0" clip-rule="evenodd"></path></svg>'},41496:e=>{"use strict";e.exports=r},52943:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M4.653 13.854a.485.485 0 0 1 0-.708L10.24 8 4.653 2.854a.485.485 0 0 1 0-.708.54.54 0 0 1 .738 0l5.956 5.5a.485.485 0 0 1 0 .708l-5.956 5.5a.54.54 0 0 1-.738 0" clip-rule="evenodd"></path></svg>'},63655:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="#000" fill-rule="nonzero" d="m6.732 9.4 1.43 1.215a2.794 2.794 0 0 1-.507 4.602q-3.315 1.73-7.26-.362l-.293-.16a.2.2 0 0 1 .087-.374q2.77-.165 2.771-2.334c0-1.063.299-1.96 1.18-2.59.88-.631 1.832-.457 2.592.003m-1.945.761c-.56.472-.825 1.055-.825 1.826 0 1.22-1.19 2.713-1.987 2.713 1.3.517 3.745.799 5.212-.368.174-.139.383-.251.531-.425a1.793 1.793 0 0 0-.205-2.53l-1.43-1.214a1 1 0 0 0-1.296-.002M15.55.251c.45.355.58.988.307 1.495L11.696 9.49a1.967 1.967 0 0 1-2.958.622l-.996-.788a2.018 2.018 0 0 1-.12-3.054l6.42-5.959a1.16 1.16 0 0 1 1.509-.06m-.84.798-6.42 5.96a1.01 1.01 0 0 0 .06 1.527l.997.787a.984.984 0 0 0 1.479-.31l4.162-7.745a.18.18 0 0 0-.047-.229.18.18 0 0 0-.23.01"></path></svg>'},67386:e=>{"use strict";e.exports=l},79244:e=>{"use strict";e.exports=o},82606:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#000" fill-rule="evenodd" d="M1.25 2.5h17.5v11.25H1.25zM0 2.5c0-.69.56-1.25 1.25-1.25h17.5c.69 0 1.25.56 1.25 1.25v11.25c0 .69-.56 1.25-1.25 1.25H1.25C.56 15 0 14.44 0 13.75zm3.75 16.25h2.5V17.5h-2.5zm7.5 0h-2.5V17.5h2.5zm2.5 0h2.5V17.5h-2.5z" clip-rule="evenodd"></path></svg>'}},t={};function s(o){var n=t[o];if(void 0!==n)return n.exports;var i=t[o]={exports:{}};return e[o](i,i.exports,s),i.exports}s.d=(e,t)=>{for(var o in t)s.o(t,o)&&!s.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.p="";var d={};return s.p=window.jimuConfig.baseUrl,(()=>{"use strict";s.r(d),s.d(d,{default:()=>N});var e,t=s(79244),o=s(4108),n=s(14321),i=s(67386);!function(e){e.Auto="AUTO",e.Custom="CUSTOM"}(e||(e={}));var l=s(41496);s(82606);const r=e=>{var t,o;return"nav"===(null==e?void 0:e.type)&&!(null===(t=null==e?void 0:e.standard)||void 0===t?void 0:t.alternateIcon)&&!(null===(o=null==e?void 0:e.standard)||void 0===o?void 0:o.activedIcon)};var a=s(1888);const u={_widgetLabel:"Views Navigation",widgetPlaceholder:"Please link to a Section to use this widget.",widgetPlaceholderWithNoView:"Please select a view to use this widget.",tabDefault:"Tab default",tabUnderline:"Tab underline",tabPills:"Tab pills",arrow1:"Arrow 1",arrow2:"Arrow 2",arrow3:"Arrow 3"},{useEffect:c,useMemo:v,useCallback:p}=t.React,{useSelector:g,useDispatch:m}=t.ReactRedux,b=s(12907),h=s(37568),y=s(52943),x=e=>{if(!(null==e?void 0:e.value))return"";const t=e.value.split(",");return(null==t?void 0:t.length)?t[1]:""},w=e=>{var o,n,i,l;const{borderTop:r,borderBottom:a,borderLeft:s,borderRight:d}=e;return t.css`
    ${r&&`\n      border-top-width: ${r.width};\n      ${r.width&&`border-top-style: ${null!==(o=null==r?void 0:r.type)&&void 0!==o?o:"solid"};`}\n      border-top-color: ${r.color};\n    `}
    ${a&&`\n      border-bottom-width: ${a.width};\n      ${a.width&&`border-bottom-style: ${null!==(n=null==a?void 0:a.type)&&void 0!==n?n:"solid"};`}\n      border-bottom-color: ${a.color};\n    `}
    ${s&&`\n      border-left-width: ${s.width};\n      ${s.width&&`border-left-style: ${null!==(i=null==s?void 0:s.type)&&void 0!==i?i:"solid"};`}\n      border-left-color: ${s.color};\n    `}
    ${d&&`\n      border-right-width: ${d.width};\n      ${d.width&&`border-right-style: ${null!==(l=null==d?void 0:d.type)&&void 0!==l?l:"solid"};`}\n      border-right-color: ${d.color};\n    `}
  `},f=(e,o)=>{var n,i;const l=o?".jimu-nav-link-wrapper":"&.direction-button";return`\n    font-size: ${(null==e?void 0:e.size)?`${t.polished.rem(e.size)}!important`:""};\n    ${e.icon&&`${l} > .jimu-icon, .jimu-icon-img {\n      ${(null===(n=null==e?void 0:e.icon)||void 0===n?void 0:n.size)&&`\n        width: ${t.polished.rem(e.icon.size)};\n        height: ${t.polished.rem(e.icon.size)};\n      `};\n      ${(null===(i=null==e?void 0:e.icon)||void 0===i?void 0:i.color)&&`color: ${e.icon.color}`};\n    }`}\n `},$=(e,o)=>{var n,i,l,r,a,s;if(!e)return;const d=null===(n=null==e?void 0:e.item)||void 0===n?void 0:n.default,u=(null==d?void 0:d.merge((null===(i=null==e?void 0:e.item)||void 0===i?void 0:i.hover)||{},{deep:!0}))||(null===(l=null==e?void 0:e.item)||void 0===l?void 0:l.hover),c=(null==d?void 0:d.merge((null===(r=null==e?void 0:e.item)||void 0===r?void 0:r.active)||{},{deep:!0}))||(null===(a=null==e?void 0:e.item)||void 0===a?void 0:a.active),v=null===(s=null==e?void 0:e.item)||void 0===s?void 0:s.disabled;return t.css`
    .jimu-button {
      ${d&&`&:not(:hover):not(.active):not(:disabled):not(.disabled) {\n        ${f(d,o)}\n      }`}
      ${u&&`&:not(:disabled):not(.disabled):hover {\n        ${f(u,o)}\n      }`}
      ${c&&`\n        &:not(:disabled):not(.disabled).active,\n        &[aria-expanded="true"] {\n          ${f(c,o)}\n        }\n        &:not(:disabled):not(.disabled) {\n          cursor: pointer;\n        }\n      `}
      ${v&&`\n        &.disabled,\n        &:disabled {\n          ${f(v,o)}\n        }\n      `}
    }
  `},S=(e,o,n,i)=>{var l,r;return t.css`
    .jimu-nav{
      ${(null===(l=null==o?void 0:o.root)||void 0===l?void 0:l.bg)&&`background-color: ${o.root.bg};`}
      border-radius: ${(null===(r=null==o?void 0:o.root)||void 0===r?void 0:r.borderRadius)||"0px"};
      ${(e=>{if(!(null==e?void 0:e.item))return null;const{default:o,hover:n,active:i}=e.item,l=(null==o?void 0:o.merge(n||{},{deep:!0}))||n,r=(null==o?void 0:o.merge(i||{},{deep:!0}))||i;return t.css`
    .nav-item>.nav-link {
      ${o&&t.css`
        &:not(:hover):not(.active):not(:disabled):not(.disabled) {
          ${(0,a.getBoxStyles)(o)}
          ${w(o)}
        }
      `};
      ${l&&t.css`
        &:hover:not(.active),
        &[aria-expanded="true"] {
          ${(0,a.getBoxStyles)(l)};
          ${w(l)}
        }
      `}
      ${r&&t.css`
        &:not(:disabled):not(.disabled).active {
          ${(0,a.getBoxStyles)(r)}
          ${w(r)}
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
`},T=e=>{var o;return t.css`
    .nav-button-group {
      ${(null===(o=null==e?void 0:e.root)||void 0===o?void 0:o.bg)&&`background-color: ${e.root.bg};`}
      .jimu-button {
        &.previous,
        &.next {
          ${(null==e?void 0:e.item)&&(e=>{if(!(null==e?void 0:e.item))return null;const{default:o,hover:n,disabled:i}=e.item,l=(null==o?void 0:o.merge(n||{},{deep:!0}))||n;return t.css`
    ${o&&t.css`
      &:not(:hover):not(:disabled):not(.disabled) {
        ${(0,a.getBoxStyles)(o)}
        ${w(o)}
      }
    `};
    ${l&&t.css`
      &:hover:not(:disabled):not(.disabled),
      &[aria-expanded="true"] {
        ${(0,a.getBoxStyles)(l)};
        ${w(l)}
      }
    `}
    ${i&&t.css`
      &.disabled,
      &:disabled {
        &,
        &:hover {
          ${(0,a.getBoxStyles)(i)}
          ${w(i)}
        }
      }`}
  `})(e)}
        }
      }
      ${$(e,!1)}
    }
 `},I=(e,o,n)=>{var i,l,r,a,s;const{track:d,thumb:u,progress:c}=e||{},v=(null==d?void 0:d.bg)||"var(--sys-color-divider-secondary)",p=(null===(i=null==u?void 0:u.default)||void 0===i?void 0:i.bg)||"var(--sys-color-primary-text)",g=(null===(r=null===(l=null==u?void 0:u.default)||void 0===l?void 0:l.border)||void 0===r?void 0:r.color)||"var(--sys-color-action-selected)",m=(null===(a=null==c?void 0:c.default)||void 0===a?void 0:a.bg)||"var(--sys-color-action-selected)",b=`\n    visibility: ${o?"hidden":"visible"};\n    background-color: ${p};\n    border-width: 2px;\n    border-style: solid;\n    border-color: ${g};\n    box-sizing: border-box;\n    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out; /* $btn-transition */\n    &:hover {\n      border-color: ${m};\n    }\n  `;return t.css`
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
        background: linear-gradient(to ${n?"left":"right"}, ${m}, ${m}) ${v} no-repeat left;
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
 `},k=e=>{var t,o;const{type:n,navStyle:i}=e||{},{showIcon:l,showText:r,alternateIcon:a,showPageNumber:s}=null!==(t=null==e?void 0:e.standard)&&void 0!==t?t:{};if("nav"===n){const{filename:e}=null!==(o=null==a?void 0:a.properties)&&void 0!==o?o:{};return`${n}-${i}-${l?"showIcon":"hideIcon"}-${r?"showText":"hideText"}-icon-${e}`}if("navButtonGroup"===n)return`${n}-${i}-${s?"showPageNumber":""}`};var A=function(e,t){var o={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(o[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(n=Object.getOwnPropertySymbols(e);i<n.length;i++)t.indexOf(n[i])<0&&Object.prototype.propertyIsEnumerable.call(e,n[i])&&(o[n[i]]=e[n[i]])}return o};const j=t.css`
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
`,C=e=>{const{className:o,data:l,progress:s=0,type:d,navStyle:u,vertical:c,advanced:p,variant:g,onChange:m,activeView:b,standard:h,paginationFontColor:y,navArrowColor:w,theme:f}=e,$=A(e,["className","data","progress","type","navStyle","vertical","advanced","variant","onChange","activeView","standard","paginationFontColor","navArrowColor","theme"]),{current:k,totalPage:C,showPageNumber:M,scrollable:P,disablePrevious:B,disableNext:z,previousText:N,previousIcon:R,nextText:O,nextIcon:L,showIcon:V,gap:E,alternateIcon:G,activedIcon:q,showText:U,showTitle:W,iconPosition:D,textAlign:F,hideThumb:_}=h||{},H=t.React.useRef(()=>0);t.React.useEffect(()=>(H.current=t.lodash.throttle(e=>{let t=+e.target.value;t=Number((t/100).toFixed(2)),null==m||m("slider",t)},100),()=>{H.current.cancel()}),[m]);const Q=t.React.useCallback(e=>b===x(e),[b]),J=((e,o,n,i,l,r,a)=>v(()=>{var s,d,u;const c=null===(u=null===(d=null===(s=(0,t.getAppStore)())||void 0===s?void 0:s.getState())||void 0===d?void 0:d.appContext)||void 0===u?void 0:u.isRTL;return"slider"===e?I(i,r,c):n?"nav"===e?S(o,i,l,a):"navButtonGroup"===e?T(i):null:null},[n,i,e,o,l,a,r]))(d,u,p,g,c,_,w),K=t.React.useMemo(()=>{var e,o,n,i,l,r,s;const d=(0,a.getThemeModule)(null==f?void 0:f.uri);if(a.mapping.whetherIsNewTheme(d))return null;const c=(null===(s=null===(r=null===(l=null===(i=null===(n=null===(o=null===(e=null==d?void 0:d.variables)||void 0===e?void 0:e.components)||void 0===o?void 0:o.nav)||void 0===n?void 0:n.variants)||void 0===i?void 0:i[u])||void 0===l?void 0:l.item)||void 0===r?void 0:r.default)||void 0===s?void 0:s.color)||"";return t.css`
      ${c?"":".nav-link:not(:hover):not(.active) {\n        color: var(--sys-color-action-text);\n      }"}
      .direction-button:not(:hover):not(.active):not(:disabled) {
        color: var(--sys-color-action-text);
      }
      ${y?"":".jimu-page-number {\n        color: var(--sys-color-action-text);\n      }"}
    `},[u,y,null==f?void 0:f.uri]),X=(e=>v(()=>t.css`
      ${"slider"===e&&"padding: 0.625rem 0.25rem;"}
      .nav-button-group >.direction-button {
        &:focus,
        &:focus-visible {
          outline-offset: -2px;
        }
      }
    `,[e]))(d),Y=t.hooks.useTranslation(n.defaultMessages);return(0,i.jsxs)("div",Object.assign({className:(0,t.classNames)("navigation",o),css:[j,J,X,K]},$,{children:["nav"===d&&(0,i.jsx)(n.Navigation,{keepPaddingWhenOnlyIcon:r(e),onLinkClick:e=>{const t=x(e);null==m||m("nav",t)},role:"tablist",vertical:c,isActive:Q,scrollable:P,data:l,gap:E,type:u,showIcon:V,alternateIcon:G,activedIcon:q,showText:U,showTitle:W||U||r(e)&&!U&&V,isUseNativeTitle:!0,iconPosition:D,textAlign:F}),"slider"===d&&(0,i.jsx)(n.Slider,{className:"h-100",value:100*s,hideThumb:_,onChange:e=>{var t;null===(t=e.persist)||void 0===t||t.call(e),H.current(e)},formatter:e=>{var t;const o=(null===(t=null==l?void 0:l.find(e=>x(e)===b))||void 0===t?void 0:t.name)||"";return`${Y("percentage")} ${Math.round(+e)}. ${o}`}}),"navButtonGroup"===d&&(0,i.jsx)(n.NavButtonGroup,{variant:"tertiary"===u?"text":"outlined",previousText:N,previousIcon:R,nextText:O,nextIcon:L,vertical:c,disablePrevious:B,disableNext:z,onChange:e=>{null==m||m("navButtonGroup",e)},children:M&&(0,i.jsx)(n.PageNumber,{current:k,totalPage:C,css:t.css`color: ${y}`})})]}))},M=e=>{const{title:o,children:n,selected:l,onClick:r}=e,s=(()=>{const e=(0,a.useTheme)(),o=(0,a.useTheme2)(),n=(0,a.useUseTheme2)(),i=window.jimuConfig.isBuilder!==n?o:e,l=(window.jimuConfig.isBuilder!==n?e:o).sys.color.primary.light,r=i?i.sys.color.surface.background:"transparent",s=i?i.sys.color.surface.backgroundText:"inherit";return t.React.useMemo(()=>t.css`
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
  `,[l,r,s])})();return(0,i.jsxs)("div",{css:s,title:o,className:(0,t.classNames)("quick-style-item",{selected:l}),onClick:r,children:[(0,i.jsx)("div",{className:"overlay"}),n]})},P=(0,t.Immutable)([{name:"v1",value:"p1,v1"},{name:"v2"},{name:"v3"},{name:"v4"}]),B=t.css`
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
`,z=s=>{const{widgetId:d}=s,c=t.ReactRedux.useSelector(e=>{var t;return null===(t=(e.appStateInBuilder?e.appStateInBuilder:e).appConfig.widgets[d])||void 0===t?void 0:t.config}),p=(e=>{const o=t.i18n.getIntl(e,"runtime"),i=t.React.useCallback(e=>o.formatMessage({id:e,defaultMessage:n.defaultMessages[e]||u[e]}),[o]),l=n.utils.toIconResult(h,i("arrowLeft"),16);l.properties.originalName="outlined/directional/left.svg";const r=n.utils.toIconResult(y,i("arrowRight"),16);r.properties.originalName="outlined/directional/right.svg";const a=n.utils.toIconResult(b,i("drawToolDot"),8);return v(()=>[{label:i("tabDefault"),type:"nav",navStyle:"default",standard:{gap:"0px",scrollable:!0,showIcon:!1,showText:!0,iconPosition:"start",textAlign:n.TextAlignValue.CENTER}},{label:i("tabUnderline"),type:"nav",navStyle:"underline",standard:{gap:"0px",scrollable:!0,showIcon:!1,showText:!0,iconPosition:"start",textAlign:n.TextAlignValue.CENTER}},{label:i("tabPills"),type:"nav",navStyle:"pills",standard:{gap:"0px",scrollable:!0,showIcon:!1,showText:!0,iconPosition:"start",textAlign:n.TextAlignValue.CENTER}},{label:i("symbol"),type:"nav",navStyle:"default",standard:{scrollable:!1,gap:"10px",showIcon:!0,alternateIcon:a,activedIcon:a,showText:!1,iconPosition:"start",textAlign:n.TextAlignValue.CENTER}},{label:i("slider"),type:"slider",navStyle:"default"},{label:i("arrow1"),type:"navButtonGroup",navStyle:"default",standard:{showPageNumber:!0,previousText:"",previousIcon:l,nextText:"",nextIcon:r}},{label:i("arrow2"),type:"navButtonGroup",navStyle:"tertiary",standard:{previousText:i("prev"),previousIcon:l,nextText:i("next"),nextIcon:r}},{label:i("arrow3"),type:"navButtonGroup",navStyle:"tertiary",standard:{showPageNumber:!0,previousText:"",previousIcon:l,nextText:"",nextIcon:r}}],[i,a,l,r])})(d),g=null==c?void 0:c.display,m=t.ReactRedux.useSelector(e=>e.appRuntimeInfo.appMode),x=n=>{const i=(0,t.Immutable)(n).set("vertical",m===t.AppMode.Express).set("advanced",!1).without("variant");(0,o.getAppConfigAction)().editWidgetProperty(d,"config",c.setIn(["data","type"],e.Auto).set("display",i)).exec(),((e,o)=>{var n,i;if(!o)return;let a;const s=(0,t.getAppStore)().getState();a=window.jimuConfig.isBuilder?null==s?void 0:s.appStateInBuilder:s;const d=null===(n=null==a?void 0:a.appRuntimeInfo)||void 0===n?void 0:n.selection,u=null===(i=a.appConfig.layouts)||void 0===i?void 0:i[null==d?void 0:d.layoutId];if(u&&(null==u?void 0:u.type)===t.LayoutType.FixedLayout){const t=r(e),n=null==e?void 0:e.vertical;o().editLayoutItemSize(d,n?60:380,n?380:60).exec(),o().editLayoutItemProperty(d,"setting.autoProps",{width:t||n?l.LayoutItemSizeModes.Auto:l.LayoutItemSizeModes.Custom,height:t||!n?l.LayoutItemSizeModes.Auto:l.LayoutItemSizeModes.Custom}).exec()}})(n,o.getAppConfigAction)},w=(0,a.getTheme)();return(0,i.jsx)(a.ThemeSwitchComponent,{useTheme2:window.jimuConfig.isBuilder,children:(0,i.jsx)("div",{className:"body",css:B,children:p.map((e,o)=>{const n=Object.assign({},e),l=n.label;delete n.label;const r="navButtonGroup"===e.type?{current:1,totalPage:4,disablePrevious:!0,disableNext:!1}:{},a="nav"===e.type?{scrollable:!1}:{},s=t.lodash.assign({},n.standard,r,a);return(0,i.jsx)(M,{title:l,selected:!(null==g?void 0:g.advanced)&&k(n)===k(g),onClick:()=>{x(n)},children:(0,i.jsx)(C,{type:n.type,data:P,navStyle:n.navStyle,activeView:"v1",standard:s,theme:w})},o)})})})};class N{constructor(){this.index=0,this.id="navigator-quick-style",this.openWhenAdded=!0}visible(){var e,o;return(null===(o=null===(e=this.getAppState())||void 0===e?void 0:e.appRuntimeInfo)||void 0===o?void 0:o.appMode)!==t.AppMode.Express}getAppState(){const e=(0,t.getAppStore)().getState();return e.appStateInBuilder?e.appStateInBuilder:e}getGroupId(){return null}getTitle(){const e=t.i18n.getIntl("_jimu");return e?e.formatMessage({id:"quickStyle",defaultMessage:n.defaultMessages.quickStyle}):"Quick style"}getIcon(){return s(63655)}checked(){if(this.getAppState().browserSizeMode===t.BrowserSizeMode.Small)return this.isOpenInSidePanel}widgetToolbarStateChange(e){window.jimuConfig.isBuilder?o.builderAppSync.publishWidgetToolbarStateChangeToApp(e,["navigator-quick-style"]):(0,t.getAppStore)().dispatch(t.appActions.widgetToolbarStateChange(e,["navigator-quick-style"]))}onClick(e){const n=e.layoutItem.widgetId;if(this.getAppState().browserSizeMode===t.BrowserSizeMode.Small){this.isOpenInSidePanel=!this.isOpenInSidePanel;const e=()=>{this.isOpenInSidePanel=!1,this.widgetToolbarStateChange(n)};o.appBuilderSync.publishSidePanelToApp({type:"navigatorQuickStyle",widgetId:n,uri:"widgets/common/navigator/",onClose:e,active:this.isOpenInSidePanel})}}getSettingPanel(e){return this.getAppState().browserSizeMode===t.BrowserSizeMode.Small?null:z}}})(),d})())}}});