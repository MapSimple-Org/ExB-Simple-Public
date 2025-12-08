System.register(["jimu-core","jimu-core/emotion","jimu-for-builder","jimu-for-builder/service","jimu-for-builder/templates","jimu-theme","jimu-ui","jimu-ui/advanced/site-components"],function(e,t){var i={},s={},a={},r={},n={},o={},l={},c={};return{setters:[function(e){i.BrowserSizeMode=e.BrowserSizeMode,i.React=e.React,i.ReactRedux=e.ReactRedux,i.appActions=e.appActions,i.appConfigUtils=e.appConfigUtils,i.classNames=e.classNames,i.css=e.css,i.defaultMessages=e.defaultMessages,i.getAppStore=e.getAppStore,i.hooks=e.hooks,i.i18n=e.i18n,i.jimuHistory=e.jimuHistory,i.lodash=e.lodash,i.privilegeUtils=e.privilegeUtils,i.queryString=e.queryString,i.semver=e.semver,i.urlUtils=e.urlUtils,i.utils=e.utils,i.version=e.version},function(e){s.jsx=e.jsx,s.jsxs=e.jsxs},function(e){a.builderActions=e.builderActions,a.defaultMessages=e.defaultMessages,a.utils=e.utils},function(e){r.appServices=e.appServices},function(e){n.getAppTemplates=e.getAppTemplates},function(e){o.utils=e.utils},function(e){l.AlertPopup=e.AlertPopup,l.Button=e.Button,l.Card=e.Card,l.Loading=e.Loading,l.LoadingType=e.LoadingType,l.defaultMessages=e.defaultMessages},function(e){c.ExpressModeSwitch=e.ExpressModeSwitch,c.PRE_VERSION=e.PRE_VERSION,c.Template=e.Template,c.TemplateList=e.TemplateList}],execute:function(){e((()=>{var e={505:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M2 4h12v7H2zM0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4 10a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z" clip-rule="evenodd"></path></svg>'},1888:e=>{"use strict";e.exports=o},2838:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="m8.745 8 6.1 6.1a.527.527 0 1 1-.745.746L8 8.746l-6.1 6.1a.527.527 0 1 1-.746-.746l6.1-6.1-6.1-6.1a.527.527 0 0 1 .746-.746l6.1 6.1 6.1-6.1a.527.527 0 0 1 .746.746z"></path></svg>'},4108:e=>{"use strict";e.exports=a},4321:e=>{"use strict";e.exports=l},5545:e=>{"use strict";e.exports=c},6884:e=>{"use strict";e.exports=n},7213:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M16 2.443 5.851 14 0 8.115l1.45-1.538 4.31 4.334L14.463 1z" clip-rule="evenodd"></path></svg>'},7386:e=>{"use strict";e.exports=s},8243:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M12 3H4v11h8zM4 1a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z" clip-rule="evenodd"></path></svg>'},9165:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M10 5H6v9h4zM6 3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" clip-rule="evenodd"></path></svg>'},9244:e=>{"use strict";e.exports=i},9860:e=>{"use strict";e.exports=r}},t={};function p(i){var s=t[i];if(void 0!==s)return s.exports;var a=t[i]={exports:{}};return e[i](a,a.exports,p),a.exports}p.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return p.d(t,{a:t}),t},p.d=(e,t)=>{for(var i in t)p.o(t,i)&&!p.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},p.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),p.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},p.p="";var d={};return p.p=window.jimuConfig.baseUrl,(()=>{"use strict";p.r(d),p.d(d,{__set_webpack_public_path__:()=>_,default:()=>U});var e=p(7386),t=p(9244),i=p(2838),s=p.n(i),a=function(e,t){var i={};for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.indexOf(s)<0&&(i[s]=e[s]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(s=Object.getOwnPropertySymbols(e);a<s.length;a++)t.indexOf(s[a])<0&&Object.prototype.propertyIsEnumerable.call(e,s[a])&&(i[s[a]]=e[s[a]])}return i};const r=i=>{const r=window.SVG,{className:n}=i,o=a(i,["className"]),l=(0,t.classNames)("jimu-icon jimu-icon-component",n);return r?(0,e.jsx)(r,Object.assign({className:l,src:s()},o)):(0,e.jsx)("svg",Object.assign({className:l},o))};var n=p(4321);const o={_widgetLabel:"Create a new experience",createNewApp:"Create new app",largeDevices:"Large screen devices",mediumDevices:"Medium screen devices",smallDevices:"Small screen devices"};var l=p(4108),c=p(6884),u=p(5545),m=p(9860),g=p(505),f=p.n(g),h=function(e,t){var i={};for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.indexOf(s)<0&&(i[s]=e[s]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(s=Object.getOwnPropertySymbols(e);a<s.length;a++)t.indexOf(s[a])<0&&Object.prototype.propertyIsEnumerable.call(e,s[a])&&(i[s[a]]=e[s[a]])}return i};const x=i=>{const s=window.SVG,{className:a}=i,r=h(i,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",a);return s?(0,e.jsx)(s,Object.assign({className:n,src:f()},r)):(0,e.jsx)("svg",Object.assign({className:n},r))};var v=p(8243),w=p.n(v),b=function(e,t){var i={};for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.indexOf(s)<0&&(i[s]=e[s]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(s=Object.getOwnPropertySymbols(e);a<s.length;a++)t.indexOf(s[a])<0&&Object.prototype.propertyIsEnumerable.call(e,s[a])&&(i[s[a]]=e[s[a]])}return i};const y=i=>{const s=window.SVG,{className:a}=i,r=b(i,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",a);return s?(0,e.jsx)(s,Object.assign({className:n,src:w()},r)):(0,e.jsx)("svg",Object.assign({className:n},r))};var j=p(9165),O=p.n(j),S=function(e,t){var i={};for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.indexOf(s)<0&&(i[s]=e[s]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(s=Object.getOwnPropertySymbols(e);a<s.length;a++)t.indexOf(s[a])<0&&Object.prototype.propertyIsEnumerable.call(e,s[a])&&(i[s[a]]=e[s[a]])}return i};const N=i=>{const s=window.SVG,{className:a}=i,r=S(i,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",a);return s?(0,e.jsx)(s,Object.assign({className:n,src:O()},r)):(0,e.jsx)("svg",Object.assign({className:n},r))};var M=p(7213),E=p.n(M),R=function(e,t){var i={};for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.indexOf(s)<0&&(i[s]=e[s]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(s=Object.getOwnPropertySymbols(e);a<s.length;a++)t.indexOf(s[a])<0&&Object.prototype.propertyIsEnumerable.call(e,s[a])&&(i[s[a]]=e[s[a]])}return i};const P=i=>{const s=window.SVG,{className:a}=i,r=R(i,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",a);return s?(0,e.jsx)(s,Object.assign({className:n,src:E()},r)):(0,e.jsx)("svg",Object.assign({className:n},r))};var k=function(e,t,i,s){return new(i||(i=Promise))(function(a,r){function n(e){try{l(s.next(e))}catch(e){r(e)}}function o(e){try{l(s.throw(e))}catch(e){r(e)}}function l(e){var t;e.done?a(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(n,o)}l((s=s.apply(e,t||[])).next())})};const A=t.css`
  flex-direction: column;
  .header-bar {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    font-size: 20px;
    border-bottom: 1px solid var(--sys-color-secondary-main);
    color: var(--ref-palette-neutral-1000);
    font-weight:500;
    background: var(--ref-palette-neutral-500);
    svg {
      margin-right: 0;
    }
    &>div {
      color: var(--ref-palette-neutral-1000);
    }
    &>div:hover {
      color: var(--ref-palette-black);
    }
    .jimu-icon {
      cursor: pointer;
    }
  }
  .homescreen {
    flex: 1;
    min-height: 0;
    .left {
      width: 401px;
      box-sizing: border-box;
      padding: 30px 0 30px 21px;
      flex-direction: column;
      flex-shrink: 0;
      border-right: 1px solid var(--sys-color-divider-primary);
      .list-title {
        margin-left: 9px;
        margin-bottom: 20px;
        line-height: 27px;
        font-size: 20px;
        font-weight: 500;
        color: var(--ref-palette-custom2-600);
      }
      .list-container {
        flex: 1;
        min-height: 0;
        padding-top: 4px;
        overflow: auto;
        .list {
          flex-wrap: wrap;
          align-items: center;
        }
        .card {
          margin: 0 9px 18px;
          .template {
            margin: 0;
            width: 160px;
            height: 146px;
          }
          .image-container {
            width: 100%;
            height: 108px;
            &:hover .description {
              display: none;
            }
          }
          .template-info-con {
            &:focus .description {
              display: none;
            }
            .title {
              padding: 8px 8px 0;
              font-size: 0.875rem;
            }
          }
          &.card-active {
            border-color: var(--sys-color-primary-light);
            box-shadow: 0 0 0 1px var(--sys-color-primary-light);
            .card-checkmark {
              display: none;
            }
            .custom-card-checkmark {
              position: absolute;
              right: 0;
              z-index: 1;
              padding: 3px 3px 5px 5px;
              line-height: 1;
              border-radius: 0 0 0 2px;
              color: #000;
              text-decoration: none;
              font-style: normal;
              background-color: var(--sys-color-primary-light);
            }
          }
        }
        .info {
          display: none;
        }
      }
      .create-btn {
        margin: 30px 27px 0 9px;
        height: 48px;
      }
    }
    .right {
      flex: 1;
      flex-direction: column;
      overflow: auto;
      .iframe-container {
        flex: 1;
        justify-content: center;
        align-items: center;
        min-width: fit-content;
        overflow: auto;
        text-align: center;
        &.preview-size-mode-LARGE {
          padding: clamp(20px, calc(50% - 510px), 60px);
          padding-bottom: 0;
          .outer-iframe {
            min-width: 1020px;
            width: 100%;
            height: calc(100% - 20px);
          }
        }
        &.preview-size-mode-MEDIUM {
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          flex-flow: wrap;
          align-items: center;
          justify-content: center;
          .outer-iframe {
            width: 606px;
            height: 923px;
            min-height: 923px;
          }
        }
        &.preview-size-mode-SMALL {
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          flex-flow: wrap;
          align-items: center;
          justify-content: center;
          .outer-iframe {
            width: 395px;
            height: 687px;
            min-height: 687px;
          }
        }
      }
      .outer-iframe {
        padding: 10px;
        border: none;
        background: var(--sys-color-surface-paper);
        box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.20);
      }
      .switch-device {
        margin: 30px;
        min-width: max-content;
        text-align: center;
        .btn {
          height: 40px;
          width: 40px;
          border-radius: 20px;
        }
      }
    }
  }
`,T=i=>{const{theme:s,intl:a,dispatch:p}=i,d=t.hooks.useTranslation(Object.assign(Object.assign({},o),l.defaultMessages),n.defaultMessages,t.defaultMessages),g=e=>t.queryString.parse(window.location.search)[e]||"",[f,h]=t.React.useState({canCreateExperience:!1,canDeleteExperience:!1,canShareExperience:!1,canUpdateExperience:!1,canViewExperience:!1});t.React.useEffect(()=>{(()=>{const{CheckTarget:e}=t.privilegeUtils;t.privilegeUtils.checkExbAccess(e.AppList).then(e=>{(null==e?void 0:e.capabilities)&&h(e.capabilities)})})()},[]);const[v,w]=t.React.useState([]),b=t.React.useRef(new Map),[j,O]=t.React.useState([]),[S,M]=t.React.useState(!1);t.React.useEffect(()=>{const e=(0,c.getAppTemplates)(null,["WAB classic"]);w(e.map(e=>{const i=!!(s=e.templateCreateVersion)&&(window.jimuConfig.isInPortal?t.semver.satisfies(s,`${u.PRE_VERSION} - ${t.version}`):t.semver.eq(t.version,s));var s;return{isExperiencesTemplate:!1,name:e.name,title:e.label,image:{src:e.thumbnail,gifSrc:null==e?void 0:e.gifThumbnail},tags:(null==e?void 0:e.tags)||[],description:e.description,isMapAware:e.isMapAware,snippet:e.description,flipThumbnail:e.flipThumbnail,isNewTemplate:i,isMultiplePage:e.isMultiplePage}}));let i=!1;Promise.allSettled(e.map(e=>fetch(e.configUrl).then(e=>e.json()).then(t=>{b.current.set(e.name,t),"foldable"===e.name&&(i=!0,M(!0))}).catch(t=>{console.error("get template config error",t),O(t=>[...t,e.name])}))).then(()=>{i||M(!0)})},[]);const[E,R]=t.React.useState(),T=e=>new Promise(t=>{setTimeout(t,e)}),[z,C]=t.React.useState(t.BrowserSizeMode.Large),B=[{value:t.BrowserSizeMode.Large,icon:(0,e.jsx)(x,{}),title:d("largeDevices")},{value:t.BrowserSizeMode.Medium,icon:(0,e.jsx)(y,{}),title:d("mediumDevices")},{value:t.BrowserSizeMode.Small,icon:(0,e.jsx)(N,{}),title:d("smallDevices")}];t.React.useEffect(()=>{E&&k(void 0,void 0,void 0,function*(){var e,i,s,a,r;const n=((o=t.lodash.cloneDeep(b.current.get(E.name))).attributes||(o.attributes={}),o.widgets||(o.widgets={}),o.widgetsManifest||(o.widgetsManifest={}),o.views||(o.views={}),o.sections||(o.sections={}),o.dialogs||(o.dialogs={}),o.pages||(o.pages={}),o.layouts||(o.layouts={}),o.dataSources||(o.dataSources={}),o.messageConfigs||(o.messageConfigs={}),o);var o;const c=I.current.contentDocument.getElementById("express-template-preview");if(n&&c){const o=(0,t.getAppStore)().getState().queryObject;if(((null==o?void 0:o.webmap)||(null==o?void 0:o.webscene))&&t.appConfigUtils.addWebmapOrWebsceneToAppConfig(n,null==o?void 0:o.webmap,null==o?void 0:o.webscene,!0),t.utils.replaceI18nPlaceholdersInObject(n,t.i18n.getIntl(),l.defaultMessages),!(null===(e=c.contentWindow)||void 0===e?void 0:e._configManager)){for(;!(null===(i=c.contentWindow)||void 0===i?void 0:i._configManager);)yield T(100);for(;!(null===(a=null===(s=c.contentWindow._appStore)||void 0===s?void 0:s.getState)||void 0===a?void 0:a.call(s)).appConfig;)yield T(100)}null===(r=c.contentWindow._configManager)||void 0===r||r.setAppConfig(n)}})},[E]);const[L,U]=t.React.useState(!1),[_,H]=t.React.useState(""),I=t.React.useRef(null),[D,V]=t.React.useState(!1),q=t.React.useMemo(()=>(0,e.jsx)("iframe",{src:"",className:"outer-iframe",ref:e=>{if(e){I.current=e;const t=e.contentDocument.body;t.style.margin="0";const i=document.createElement("iframe");i.style.width="100%",i.style.height="100%",i.style.border="none",i.id="express-template-preview",i.src=`${window.jimuConfig.mountPath}template/index.html`,i.addEventListener("load",()=>{V(!0)}),e.contentWindow.addEventListener("load",()=>{const t=e.contentDocument.body;t.style.margin="0",t.replaceChildren(i)}),t.replaceChildren(i)}}}),[]);t.React.useEffect(()=>{if(S&&D&&v.length){const e=v.find(e=>"foldable"===e.name)||v[0];R(e)}},[S,D,v]);const W=!(!g("webmap")&&!g("webscene"));return(0,e.jsxs)("div",{css:A,className:"widget-choose-template d-flex h-100","data-testid":"widget-choose-template",children:[!W&&(0,e.jsxs)("div",{className:"header-bar",children:[d("template"),(0,e.jsx)(n.Button,{type:"tertiary",icon:!0,"data-testid":"close-button",onClick:()=>{if("back"===g("redirect")){let e=t.urlUtils.getPageLinkUrl("default",(0,t.getAppStore)().getState().queryObject.without("redirect"));e=window.jimuConfig.useStructuralUrl?e.replace("page/config-page",""):e.replace("&page=config-page","").replace("page=config-page&",""),t.jimuHistory.browserHistory.push(e)}else{const e=l.utils.getHomePageUrl(window.isExpressBuilder);window.location.href=e}},title:d("back"),children:(0,e.jsx)(r,{"aria-hidden":"true",size:20})})]}),(0,e.jsxs)("div",{className:"homescreen d-flex",children:[(0,e.jsxs)("div",{className:"left d-flex",children:[!W&&(0,e.jsx)("div",{className:"list-title",children:d("choseTemplate")}),(0,e.jsx)("div",{className:"list-container",children:(0,e.jsx)("div",{className:"d-flex list",children:v.map((t,i)=>{const r=j.includes(t.name),o=(null==E?void 0:E.name)===t.name;return(0,e.jsxs)(n.Card,{active:o,onClick:()=>{r||R(t)},style:{opacity:r?.6:1},children:[o&&(0,e.jsx)("span",{className:"custom-card-checkmark",role:"presentation",children:(0,e.jsx)(P,{size:16})}),(0,e.jsx)(u.Template,{theme:s,info:t,intl:a,disabled:r,capabilities:f})]},i)})})}),(0,e.jsx)(n.Button,{className:"create-btn",size:"lg",type:"primary",disabled:!E,onClick:()=>{const e=E.name;if((()=>{const e=(0,t.getAppStore)().getState().portalSelf;return(null==e?void 0:e.isReadOnly)&&H(d("remindTextForReadonlyMode")),null==e?void 0:e.isReadOnly})())return;U(!0);const i=d("untitledExperience"),s=g("folderId"),a=(0,t.getAppStore)().getState().queryObject;m.appServices.createAppByDefaultTemplate(i,e,s,null==a?void 0:a.webmap,null==a?void 0:a.webscene).then(e=>{U(!1),p(l.builderActions.refreshAppListAction(!0)),(null==a?void 0:a.webmap)||(null==a?void 0:a.webscene)?window.location.href=l.utils.getBuilderUrl(e.id,!0):t.jimuHistory.browserHistory.push(l.utils.getBuilderUrl(e.id,!0))}).catch(e=>{U(!1),H(d("createApplicationError"))})},children:d("createNewApp")})]}),(0,e.jsxs)("div",{className:"right d-flex",children:[(0,e.jsx)("div",{className:`iframe-container preview-size-mode-${z}`,children:q}),(0,e.jsx)("div",{className:"switch-device",children:B.map(t=>(0,e.jsx)(n.Button,{className:"mx-2",icon:!0,title:t.title,type:t.value===z?"primary":"default",onClick:()=>{C(t.value)},children:t.icon},t.value))})]})]}),L&&(0,e.jsx)(n.Loading,{type:n.LoadingType.Skeleton,text:d("creatingExperience")}),(0,e.jsx)(n.AlertPopup,{isOpen:!!_,title:d("warningPopUpTitle"),hideCancel:!0,toggle:()=>{_&&H("")},children:(0,e.jsx)("div",{style:{fontSize:"1rem"},children:_})})]})},z=t.css`
  flex-direction: column;
  .header-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    border-bottom: 1px solid var(--sys-color-secondary-main);
    color: var(--ref-palette-neutral-1000);
    font-weight:500;
    background: var(--ref-palette-neutral-500);
    svg {
      margin-right: 0;
    }
    &>div {
      color: var(--ref-palette-neutral-1000);
    }
    &>div:hover {
      color: var(--ref-palette-black);
    }
    .jimu-icon {
      cursor: pointer;
    }
  }
  .top-hint {
    font-size: 30px;
    line-height: 30px;
    font-weight: 500;
    color: var(--ref-palette-neutral-1000);
  }
`,C=i=>{const s=t.hooks.useTranslation(Object.assign(Object.assign({},o),l.defaultMessages),n.defaultMessages,t.defaultMessages),a=e=>t.queryString.parse(window.location.search)[e]||"",c=!(!a("webmap")&&!a("webscene"));return(0,e.jsxs)("div",{css:z,className:"widget-choose-template d-flex h-100","data-testid":"widget-choose-template",children:[!c&&(0,e.jsxs)("div",{className:"header-bar mb-8 py-4 px-7",children:[s("template"),(0,e.jsx)(n.Button,{type:"tertiary",icon:!0,"data-testid":"close-button","aria-label":s("back"),onClick:()=>{if("back"===a("redirect"))t.jimuHistory.browserHistory.back();else{const e=l.utils.getHomePageUrl(window.isExpressBuilder);window.location.href=e}},title:s("back"),children:(0,e.jsx)(r,{"aria-hidden":"true",size:20})})]}),!c&&(0,e.jsx)("div",{className:"top-hint",children:(0,e.jsx)("div",{className:"w-responsive",children:s("choseTemplate")})}),(0,e.jsx)("div",{className:"w-100 template-cont",style:{height:c?"calc(100% - 40px)":"calc(100% - 140px)"},children:(0,e.jsx)(u.TemplateList,Object.assign({},i,{createOnly:!0,searchMyPortalTemplates:!0}))})]})};var B=p(1888);const L=t.css`
  .header-bar {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    font-size: 20px;
    border-bottom: 1px solid var(--sys-color-secondary-main);
    color: var(--ref-palette-neutral-1000);
    font-weight:500;
    background: var(--ref-palette-neutral-500);
  }
  .header-bar.header-bar-simple {
    height: 88px;
    border-bottom: 1px solid var(--sys-color-divider-primary);
    background: transparent;
    .switch-label {
      font-size: 14px;
    }
  }
  &.has-common-header {
    .choose-template-content {
      height: calc(100% - 88px);
    }
  }
  .choose-template-content {
    height: 100%;
  }
  .w-responsive {
    width: 792px;
    margin: 0 auto;
    padding-left: 12px;
    padding-right: 12px;
  }

  @media (min-width: 1280px) {
    .w-responsive {
      width: 1056px;
    }
  }
  @media (min-width: 1400px) {
    .w-responsive {
        width: 1320px;
    }
  }
  @media (min-width: 1680px) {
    .w-responsive {
        width: 1585px;
    }
  }
`,U=i=>{const s=t.ReactRedux.useSelector(e=>{var t,i;return(null===(t=e.queryObject)||void 0===t?void 0:t.webmap)||(null===(i=e.queryObject)||void 0===i?void 0:i.webscene)}),a=t.ReactRedux.useSelector(e=>{var t;return"express"===(null===(t=e.queryObject)||void 0===t?void 0:t.mode)}),r=t.hooks.useTranslation(o),[n,l]=t.React.useState(!1),c="exb-site-express";t.React.useEffect(()=>{if(s)if(a)p(!0);else{t.utils.readLocalStorage(c)&&p(!0)}else p(window.isExpressBuilder)},[]);const p=e=>{l(e),window.isExpressBuilder!==e&&t.jimuHistory.changeQueryObject({mode:e?"express":null}),window.isExpressBuilder=e;const i=(0,t.getAppStore)().getState().appConfig,s=e?B.utils.getCustomThemeOfExpressMode():null,a=i.set("customTheme",s);(0,t.getAppStore)().dispatch(t.appActions.appConfigChanged(a)),e?t.utils.setLocalStorage(c,`${e}`):t.utils.removeFromLocalStorage(c)};return(0,e.jsxs)("div",{className:(0,t.classNames)("w-100 h-100",{"has-common-header":s}),css:L,children:[s&&(0,e.jsxs)("div",{className:"header-bar header-bar-simple header",children:[r("choseTemplate"),(0,e.jsx)(u.ExpressModeSwitch,{checked:n,onChange:()=>{p(!n)}})]}),(0,e.jsxs)("div",{className:(0,t.classNames)("choose-template-content",{"mt-6":s&&!n}),children:[!n&&(0,e.jsx)(C,Object.assign({},i)),n&&(0,e.jsx)(T,Object.assign({},i))]})]})};function _(e){p.p=e}})(),d})())}}});