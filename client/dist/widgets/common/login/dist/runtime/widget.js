System.register(["jimu-core/emotion","jimu-core","jimu-ui","jimu-theme"],function(e,t){var i={},n={},o={},s={};return{setters:[function(e){i.jsx=e.jsx,i.jsxs=e.jsxs},function(e){n.AppMode=e.AppMode,n.Immutable=e.Immutable,n.PermissionList=e.PermissionList,n.React=e.React,n.ReactRedux=e.ReactRedux,n.SessionManager=e.SessionManager,n.SignInErrorCode=e.SignInErrorCode,n.css=e.css,n.getAppStore=e.getAppStore,n.urlUtils=e.urlUtils,n.utils=e.utils},function(e){o.Button=e.Button,o.DistanceUnits=e.DistanceUnits,o.DropdownItem=e.DropdownItem,o.Icon=e.Icon,o.Paper=e.Paper,o.Popper=e.Popper,o.defaultMessages=e.defaultMessages,o.styleUtils=e.styleUtils},function(e){s.styled=e.styled}],execute:function(){e((()=>{var e={137:e=>{e.exports="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjI2cHgiIGhlaWdodD0iMjZweCIgdmlld0JveD0iMCAwIDI2IDI2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNTkuMSAoODYxNDQpIC0gaHR0cHM6Ly9za2V0Y2guY29tIC0tPg0KICAgIDx0aXRsZT5EZWZhdWx0IHVzZXI8L3RpdGxlPg0KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPg0KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM5OC4wMDAwMDAsIC0xMi4wMDAwMDApIj4NCiAgICAgICAgICAgIDxnPg0KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzOTguMDAwMDAwLCAxMi4wMDAwMDApIj4NCiAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBmaWxsPSIjNkE2QTZBIiBjeD0iMTMiIGN5PSIxMyIgcj0iMTMiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTMsMTcgQzE2Ljg4OTExNTEsMTcgMjAuMjU5NjkyMywxOS4yMjAxMjQ4IDIxLjkxMzQ5NywyMi40NjIxMzk3IEMxOS41ODU3NjIyLDI0LjY1NjIzODggMTYuNDQ5ODA3MiwyNiAxMywyNiBDOS41NDk4NzgzMSwyNiA2LjQxMzY2NjA4LDI0LjY1NTk5MzggNC4wODYzNjQyMywyMi40NjI5ODI0IEM1Ljc0MDMwNzY4LDE5LjIyMDEyNDggOS4xMTA4ODQ4OCwxNyAxMywxNyBaIE0xMyw1IEMxNS43NjE0MjM3LDUgMTgsNy4yMzg1NzYyNSAxOCwxMCBDMTgsMTIuNzYxNDIzNyAxNS43NjE0MjM3LDE1IDEzLDE1IEMxMC4yMzg1NzYzLDE1IDgsMTIuNzYxNDIzNyA4LDEwIEM4LDcuMjM4NTc2MjUgMTAuMjM4NTc2Myw1IDEzLDUgWiIgZmlsbD0iI0E4QThBOCI+PC9wYXRoPg0KICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgIDwvZz4NCiAgICAgICAgPC9nPg0KICAgIDwvZz4NCjwvc3ZnPg=="},1888:e=>{"use strict";e.exports=s},14321:e=>{"use strict";e.exports=o},67386:e=>{"use strict";e.exports=i},79244:e=>{"use strict";e.exports=n}},t={};function r(i){var n=t[i];if(void 0!==n)return n.exports;var o=t[i]={exports:{}};return e[i](o,o.exports,r),o.exports}r.d=(e,t)=>{for(var i in t)r.o(t,i)&&!r.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.p="";var l={};return r.p=window.jimuConfig.baseUrl,(()=>{"use strict";r.r(l),r.d(l,{__set_webpack_public_path__:()=>L,default:()=>O});var e=r(67386),t=r(79244),i=r(14321);function n(e){return t.css`

    .login-button-box {
      .login-button {
        width: 100%;
        height: 100%;
        // padding for default auto style
        padding: 12px 24px;
        //border-radius: ${e.sys.shape.shape2};
      }
      .avatar-icon {
        margin: 0 4px;
      }
      .user-name {
        margin: 0 4px;
      }
    }

    .login-dropdown-box {
      width: 250px;
      color: unset;
      background: unset;
      .login-dropdown-item {
        &:hover {
          background: none;
          color: unset;
          text-decoration: none;
        }
      }

      .login-dropdown-item.header-item {
        .header-portrait {
          width: 48px;
          min-height: 48px;
          margin-right: 8px;
        }
        .user-info-content {
          align-items: center;
        }
        .user-name-content {
          //line-height: 22px;
          justify-content: flex-end;
          padding: 0 8px;
          .user-name {
            margin: 2px 0;
            max-width: 130px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .main-title {
            font-weight: 600;
          }
          .sub-title {
          }
        }
      }

      .login-dropdown-item.link-item {
        min-height: 40px;
        &:hover {
          color: ${e.sys.color.primary.text};
          background: ${e.sys.color.primary.main};
        }
      }
      .login-dropdown-item.link-item.disabled {
        color: unset;
        &:hover {
          color: ${e.sys.color.primary.text};
          background: ${e.sys.color.primary.main};
        }
      }

      .login-dropdown-item.jimu-dropdown-item-divider {
        border-top-color : ${e.sys.color.divider.tertiary};
      }

      .permission-list-title {
        padding: 0 12px;
      }
      .permission-list {
         max-height: 250px;
        .banner-list-item-content {
          display: block;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1px;
          position: relative;
          font-size: 12px;
          .item-info {
            flex-grow: 2;
            .fold-btn {
              .directional {
                width: 8px;
                height: 8px;
              }
            }
          }
          .item-info{
            display: flex;
            align-items: center;
          }
          .item-link {
            display: block;
            max-width: 160px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .item-link.sub-item-link {
            max-width: 240px;
            padding-left: 26px;
          }
          .item-operation {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            .item-operation-btn {
              height: 20px;
              font-size: 12px;
            }
          }
          .button-separator {
            height: 18px;
            border-right-width: 1px;
            border-right-style: solid;
            border-right-color: var(--sys-color-divider-secondary)
          }
        }
        .user-name-content {
          justify-content: flex-end;
          padding: 0 16px;
          .user-name {
            font-size: 12px;
            font-style: italic;
          }
        }
      }

    }
  `}function o(e,n,o,r,l){let a,d;const g=e.regular,c=i.styleUtils.toCSSStyle(g&&g.without("iconProps").asMutable({deep:!0})),u=e.hover,p=i.styleUtils.toCSSStyle(u&&u.without("iconProps").asMutable({deep:!0})),m=Object.assign(Object.assign({},c),p),f=e.dropdownRegular,I=i.styleUtils.toCSSStyle(f&&f.without("iconProps").asMutable({deep:!0})),y=e.dropdownHover,h=i.styleUtils.toCSSStyle(y&&y.without("iconProps").asMutable({deep:!0})),x=Object.assign(Object.assign({},I),h);o&&r!==t.AppMode.Run?(a=l?Object.assign(Object.assign({},s(c)),s(m)):c,d=l?Object.assign(Object.assign({},s(I)),s(x)):I):(a=c,d=I);const M=function(e,n,o,s,r){const l=null==e?void 0:e.regular,a=null==e?void 0:e.hover;let d,g;o&&s!==t.AppMode.Run?(d=r?Object.assign(Object.assign({},null==l?void 0:l.iconProps),null==a?void 0:a.iconProps):null==l?void 0:l.iconProps,g=null==a?void 0:a.iconProps):(d=null==l?void 0:l.iconProps,g=null==a?void 0:a.iconProps);const c=d||{},u=g||{};return{regularStyle:{color:c.color,fill:c.color,width:`${c.size}${i.DistanceUnits.PIXEL}`,height:`${c.size}${i.DistanceUnits.PIXEL}`},hoverStyle:{color:u.color,fill:u.color,width:`${u.size}${i.DistanceUnits.PIXEL}`,height:`${u.size}${i.DistanceUnits.PIXEL}`}}}(e,0,o,r,l);return{isConfiguringHover:l,regularStyle:a,hoverStyle:m,dropdownRegularStyle:d,dropdownHoverStyle:x,iconStyle:M}}const s=e=>{if(!e)return e;const t={};return Object.keys(e).forEach(i=>{("string"==typeof e[i]&&!e[i].includes("undefined")||"number"==typeof e[i])&&(t[i]=e[i])}),t};var a,d;function g(){return!!t.SessionManager.getInstance().getMainSession()}function c(e=!1,i){if(window.jimuConfig.isInBuilder||g())return;t.utils.isInIFrame()&&(e=!0);const n=window.location.href,o=(0,t.getAppStore)().getState().queryObject,s=i&&t.urlUtils.getHrefFromLinkTo(i,o),r=(null==i?void 0:i.openType)||"_self",l="_self"===r&&s?s:e?null:n,a="_blank"===r&&s?s:null,d="_top"===r&&s?s:null;t.SessionManager.getInstance().signIn({popup:e,fromUrl:l,redirectUrlInNewWindow:a,redirectUrlInTopWindow:d,forceLogin:!0})}function u(e){if(window.jimuConfig.isInBuilder||!g())return;const i=window.location.href,n=(0,t.getAppStore)().getState().queryObject;let o=e&&t.urlUtils.getHrefFromLinkTo(e,n);o&&0!==o.indexOf("https://")&&(o=`https://${window.location.host}${o}`),o=o||i,t.SessionManager.getInstance().signOut({redirectUrl:o})}function p(){let e;const i=t.SessionManager.getInstance().getMainSession(),n=(0,t.getAppStore)().getState().user,o=(0,t.getAppStore)().getState().portalUrl;return n&&n.thumbnail&&(e=`${o}/sharing/rest/community/users/${n.username}/info/${n.thumbnail}?token=${null==i?void 0:i.token}`),e}!function(e){e.default="DEFAULT",e.iconOnly="ICON_ONLY",e.labelOnly="LABEL_ONLY",e.linkLabelOnly="LINK_LABEL_ONLY"}(a||(a={})),function(e){e.Left="LEFT",e.Right="RIGHT"}(d||(d={}));var m=r(1888);const f="Restricted resources",I=r(137),y=({config:n})=>{const{useMemo:o}=t.React,s=t.SessionManager.getInstance().getMainSession(),r=(0,t.getAppStore)().getState().user,l=n.functionConfig.loginOptions,a=p(),d=o(()=>a?(0,e.jsx)("img",{src:a,width:50,height:50,style:{borderRadius:"50%"},className:"d-block float-left header-login"}):(0,e.jsx)(i.Icon,{icon:I,width:50,height:50,className:"d-block float-left header-login"}),[a]);return(l.userAvatar||l.username)&&(0,e.jsxs)("div",{children:[(0,e.jsx)(i.DropdownItem,{className:"login-dropdown-item header-item p-4",tag:"div",children:(0,e.jsxs)("div",{className:"d-flex user-info-content",children:[l.userAvatar&&(0,e.jsx)("div",{className:"header-portrait",children:d}),(0,e.jsxs)("div",{className:"user-name-content flex-grow-1",children:[l.username&&s&&(0,e.jsx)("div",{className:"user-name main-title",title:null==r?void 0:r.firstName,children:null==r?void 0:r.firstName}),l.username&&s&&(0,e.jsx)("div",{className:"user-name sub-title",title:null==r?void 0:r.username,children:null==r?void 0:r.username})]})]})}),(0,e.jsx)(i.DropdownItem,{className:"login-dropdown-item divider-item",divider:!0,tag:"div"})]})},h=({intl:n,config:o,appMode:s})=>{const{useCallback:r}=t.React,l=r(()=>{!window.jimuConfig.isInBuilder&&g()&&t.SessionManager.getInstance().switchAccount()},[]),a=r(()=>{u(o.functionConfig.afterLogoutLinkParam)},[o.functionConfig.afterLogoutLinkParam]),d=n.formatMessage({id:"switchAccount",defaultMessage:i.defaultMessages.switchAccount}),c=n.formatMessage({id:"signOut",defaultMessage:i.defaultMessages.signOut});return(0,e.jsxs)("div",{children:[(0,e.jsx)(i.DropdownItem,{title:d,className:"login-dropdown-item link-item w-100 h-100 d-flex",onClick:l,tag:"button",role:"menuitem",disabled:s===t.AppMode.Design,children:(0,e.jsx)("div",{className:"text-truncate",children:d})}),(0,e.jsx)(i.DropdownItem,{title:c,className:"login-dropdown-item link-item w-100 h-100 d-flex",onClick:a,tag:"button",role:"menuitem",disabled:s===t.AppMode.Design,children:(0,e.jsx)("div",{className:"text-truncate",children:c})})]})},x=({title:n,url:o,appMode:s})=>(0,e.jsx)(i.DropdownItem,{title:n,tag:"a",className:"login-dropdown-item link-item link-con w-100 h-100 d-flex",href:o,target:"_blank",role:"menuitem",disabled:s===t.AppMode.Design,children:(0,e.jsx)("div",{className:"text-truncate",children:n})}),M=(0,m.styled)(i.Popper)(({theme:e,styleState:t})=>{var i;const n={fontSize:"var(--sys-typography-label1-font-size)",".main-title":{fontSize:(null===(i=null==t?void 0:t.dropdownRegularStyle)||void 0===i?void 0:i.fontSize)||"var(--sys-typography-title1-font-size)"}},o=null==t?void 0:t.dropdownRegularStyle,s=null==t?void 0:t.dropdownHoverStyle,r={fontWeight:(null==o?void 0:o.fontWeight)?o.fontWeight:"",fontStyle:(null==o?void 0:o.fontStyle)?o.fontStyle:""},l={fontWeight:(null==s?void 0:s.fontWeight)?s.fontWeight:"",fontStyle:(null==s?void 0:s.fontStyle)?s.fontStyle:""},a=Object.assign(Object.assign(Object.assign({},n),null==t?void 0:t.dropdownRegularStyle),{button:r}),d=Object.assign(Object.assign({},(null==t?void 0:t.dropdownHoverStyle)||{}),{button:l});return Object.assign(Object.assign({},a),{"&:hover":d})}),w=s=>{const{useMemo:r,useState:l,useEffect:a,useCallback:d}=t.React,{config:g,theme:c,intl:u,widgetId:p,active:m,appMode:I,noPermissionResourceChangedFlag:w,buttonRef:v}=s,j=g.styleConfig,b=g.functionConfig.loginOptions,S=b.useAdvanceLogin,C=(0,t.getAppStore)().getState(),A=(C.widgetsState[p]||(0,t.Immutable)({})).isConfiguringHover,[N,O]=l(!1),L=r(()=>{let t=[];return b.userProfile&&t.push({id:"my_profile",label:u.formatMessage({id:"myProfile",defaultMessage:i.defaultMessages.myProfile}),url:`${C.portalUrl}/home/user.html`}),b.userSetting&&t.push({id:"user_setting",label:u.formatMessage({id:"mySettings",defaultMessage:i.defaultMessages.mySettings}),url:`${C.portalUrl}/home/user.html#settings`}),t=t.concat(b.links),(0,e.jsxs)("div",{children:[t.map(t=>(0,e.jsx)(x,{title:t.label,url:t.url,appMode:I},t.id)),t.length>0&&(0,e.jsx)(i.DropdownItem,{className:"login-dropdown-item divider-item",divider:!0,tag:"div"})]})},[b,I,u,C.portalUrl]),D=r(()=>j.customStyle&&o(j.customStyle,0,m,I,A)||{},[j.customStyle,p,m,I,A]);a(()=>{S&&window.jimuConfig.isInBuilder?O(!0):O(!1)},[S]),a(()=>{null!==s.open&&O(e=>!e)},[s.open]);const P=d(()=>{(0,t.getAppStore)().getState().appRuntimeInfo.appMode===t.AppMode.Run&&O(!1)},[]);return(0,e.jsx)(M,{autoUpdate:!0,open:N,reference:v,css:n(c),styleState:D,toggle:P,flipOptions:!0,placement:"bottom-end",children:(0,e.jsxs)(i.Paper,{className:"login-dropdown-box",children:[(0,e.jsx)(y,{config:g}),L,(()=>{const n=Object.assign({},t.SessionManager.getInstance().getNoPermissionResourceInfoList());window.jimuConfig.isInBuilder&&0===Object.entries(n).length&&(n["https://sample.server.com/arcgis/rest/services/service1/FeatureServer"]={signInErrorCode:t.SignInErrorCode.SignInCanceled});const o=u.formatMessage({id:"restrictedResources",defaultMessage:f});return Object.entries(n).length>0&&b.resourceCredentialList&&(0,e.jsxs)("div",{className:"p-1",children:[(0,e.jsx)("div",{className:"permission-list-title text-truncate","aria-label":o,children:o}),(0,e.jsx)(t.PermissionList,{noPermissionResourceChangedFlag:w,noPermissionResourceInfoList:n,disableOperation:window.jimuConfig.isInBuilder,theme:c,intl:u,allowLogout:!0}),(0,e.jsx)(i.DropdownItem,{className:"login-dropdown-item divider-item",divider:!0,tag:"div"})]})})(),(0,e.jsx)(h,{intl:u,config:g,appMode:I})]})})},v=r(137),{useState:j,useCallback:b,useMemo:S}=t.React,C=(0,m.styled)(i.Button)(({theme:e,styleState:t,className:i})=>{var n,o;const s=Object.assign(Object.assign(Object.assign({},{fontSize:"var(--sys-typography-label1-font-size)"}),null==t?void 0:t.regularStyle),{"& img, & svg":(null===(n=null==t?void 0:t.iconStyle)||void 0===n?void 0:n.regularStyle)||{}}),r=Object.assign(Object.assign({},null==t?void 0:t.hoverStyle),{"img, svg":(null===(o=null==t?void 0:t.iconStyle)||void 0===o?void 0:o.hoverStyle)||{}});return Object.assign(Object.assign({},s),{"&:hover":r})}),A=n=>{const[s,r]=j(null),{config:l,widgetId:d,active:m,appMode:f,intl:I}=n,y=l.functionConfig,h=null==y?void 0:y.icon,x=t.React.useRef(null),M=l.styleConfig,A=y.loginOptions.useAdvanceLogin,N=(0,t.getAppStore)().getState().user,O=y.usePopupLogin,L=(0,t.getAppStore)().getState().widgetsState[d]||(0,t.Immutable)({}),D=L.isConfiguringHover,P=p(),k=!(window.jimuConfig.isInBuilder&&L.isLogoutMode)&&g(),z=b(()=>{A?(k&&r(!s),!k&&c(O,y.afterLoginLinkParam)):k?u(y.afterLogoutLinkParam):c(O,y.afterLoginLinkParam)},[s,k,A,O,y.afterLoginLinkParam,y.afterLogoutLinkParam]),R=S(()=>M.customStyle&&o(M.customStyle,0,m,f,D)||{},[M.customStyle,d,m,f,D]),E=S(()=>{const e=I.formatMessage({id:"signIn",defaultMessage:i.defaultMessages.signIn}),t=I.formatMessage({id:"signOut",defaultMessage:i.defaultMessages.signOut});return A?k?null==N?void 0:N.username:e:k?t:e},[k,N,A,I]),T=S(()=>{const t=(0,e.jsx)(i.Icon,{className:"d-block avatar-icon",icon:v,width:24,height:24});return k?P?(0,e.jsx)("img",{src:P,width:24,height:24,style:{borderRadius:"50%"},className:"d-block float-left avatar-icon"}):t:h?(0,e.jsx)(i.Icon,{className:"avatar-icon",icon:h.data.svg,"aria-hidden":!0}):t},[h,P,k]);return(0,e.jsxs)("div",{className:"login-button-box w-100 h-100",children:[(0,e.jsxs)(C,{ref:x,styleState:R,className:`login-button ${y.quickStyleMode}`,type:"default",size:"sm",icon:!1,onClick:z,children:[y.quickStyleMode!==a.labelOnly&&y.quickStyleMode!==a.linkLabelOnly&&T,y.quickStyleMode!==a.iconOnly&&(0,e.jsx)("div",{className:"user-name text-truncate",children:E})]}),k&&(0,e.jsx)(w,Object.assign({},n,{open:s,buttonRef:x.current}))]})},{useSelector:N}=t.ReactRedux,O=i=>{const o=(0,t.Immutable)({functionConfig:{usePopupLogin:!0,quickStyleMode:a.default,loginOptions:{useAdvanceLogin:!1,username:!0,userAvatar:!0,userProfile:!0,userSetting:!0,resourceCredentialList:!1,links:[]}},styleConfig:{themeStyle:{quickStyleType:"default"}}}).merge(i.config,{deep:!0}),s=N(e=>((e,t)=>{let i=!1;const n=e.appRuntimeInfo.selection;if(n&&e.appConfig.layouts[n.layoutId]){const o=e.appConfig.layouts[n.layoutId].content[n.layoutItemId];i=o&&o.widgetId===t.id}return{active:e.appContext.isInBuilder&&i,appMode:e.appRuntimeInfo.appMode,noPermissionResourceChangedFlag:e.noPermissionResourceChangedFlag}})(e,i)),{id:r,intl:l,theme:d}=i;return(0,e.jsx)("div",{className:"jimu-widget",css:n(i.theme),children:(0,e.jsx)(A,Object.assign({config:o,widgetId:r,intl:l,theme:d},s))})};function L(e){r.p=e}})(),l})())}}});