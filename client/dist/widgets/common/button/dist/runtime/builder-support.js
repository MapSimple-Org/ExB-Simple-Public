System.register(["jimu-core/emotion","jimu-core","jimu-theme","jimu-ui","jimu-for-builder"],function(e,t){var i={},o={},s={},n={},r={};return{setters:[function(e){i.jsx=e.jsx},function(e){o.ReactRedux=e.ReactRedux,o.classNames=e.classNames,o.css=e.css,o.hooks=e.hooks,o.polished=e.polished},function(e){s.ThemeSwitchComponent=e.ThemeSwitchComponent,s.useTheme=e.useTheme,s.useTheme2=e.useTheme2,s.useUseTheme2=e.useUseTheme2},function(e){n.Link=e.Link,n.Tooltip=e.Tooltip,n.defaultMessages=e.defaultMessages,n.hooks=e.hooks},function(e){r.getAppConfigAction=e.getAppConfigAction}],execute:function(){e((()=>{var e={1888:e=>{"use strict";e.exports=s},4108:e=>{"use strict";e.exports=r},14321:e=>{"use strict";e.exports=n},67386:e=>{"use strict";e.exports=i},79244:e=>{"use strict";e.exports=o}},t={};function u(i){var o=t[i];if(void 0!==o)return o.exports;var s=t[i]={exports:{}};return e[i](s,s.exports,u),s.exports}u.d=(e,t)=>{for(var i in t)u.o(t,i)&&!u.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},u.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),u.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},u.p="";var l={};return u.p=window.jimuConfig.baseUrl,(()=>{"use strict";u.r(l),u.d(l,{default:()=>c});var e=u(67386),t=u(79244),i=u(1888),o=u(14321),s=u(4108);const n=["default","primary","secondary","tertiary","danger","link"],r=(e,i,o,s)=>t.css`
    min-width: 360px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: ${e.sys.spacing[3]};
    padding: ${e.sys.spacing[5]};
    .button-item{
      width: 100%;
      font-size: ${t.polished.rem(13)};
    }
    .button-item.jimu-link-link {
      text-decoration: underline;
    }
    .quick-style-item{
      padding: ${e.sys.spacing[2]};
      margin: 2px;
      &.quick-style-item-selected{
        outline: 2px solid ${i.sys.color.primary.light};
      }
      ${o||"tertiary"!==s?"":"color: inherit;"}
      background-color: ${e.sys.color.surface.background};
      color: ${e.sys.color.surface.backgroundText};
      cursor: pointer;
    }
  `,c={QuickStyle:u=>{var l,c,a;const{widgetId:d}=u,m=o.hooks.useClassicTheme(),p=t.ReactRedux.useSelector(e=>{var t;return null===(t=(e.appStateInBuilder?e.appStateInBuilder:e).appConfig.widgets[d])||void 0===t?void 0:t.config}),g=!(null===(l=null==p?void 0:p.styleConfig)||void 0===l?void 0:l.useCustom)&&(null===(a=null===(c=null==p?void 0:p.styleConfig)||void 0===c?void 0:c.themeStyle)||void 0===a?void 0:a.quickStyleType)||"default",f=(0,i.useTheme)(),y=(0,i.useTheme2)(),h=(0,i.useUseTheme2)(),x=window.jimuConfig.isBuilder!==h?y:f,v=window.jimuConfig.isBuilder!==h?f:y,k=t.hooks.useTranslation(o.defaultMessages);return(0,e.jsx)("div",{css:r(x,v,m,g),children:(0,e.jsx)(i.ThemeSwitchComponent,{useTheme2:window.jimuConfig.isBuilder,children:n.map((i,n)=>(0,e.jsx)("div",{className:(0,t.classNames)("quick-style-item",{"quick-style-item-selected":g===i}),onClick:()=>{(e=>{let t=p.setIn(["styleConfig","useCustom"],!1);t=t.setIn(["styleConfig","themeStyle","quickStyleType"],e),t=t.set("styleConfig",t.styleConfig.without("customStyle")),(0,s.getAppConfigAction)().editWidgetConfig(d,t).exec()})(i)},children:(0,e.jsx)(o.Tooltip,{title:k(`${i}Button`),children:(0,e.jsx)(o.Link,{role:"button",color:m||"tertiary"!==i?null:"inherit",className:"button-item text-truncate",type:i,children:k("variableButton")})})},n))})})}}})(),l})())}}});