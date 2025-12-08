System.register(["jimu-core","jimu-core/emotion","jimu-for-builder","jimu-ui"],function(e,t){var s={},i={},o={},n={};return{setters:[function(e){s.AppMode=e.AppMode,s.BrowserSizeMode=e.BrowserSizeMode,s.GuideLevels=e.GuideLevels,s.GuideManager=e.GuideManager,s.GuideTypes=e.GuideTypes,s.React=e.React,s.appActions=e.appActions,s.classNames=e.classNames,s.css=e.css,s.defaultMessages=e.defaultMessages,s.getAppStore=e.getAppStore,s.jimuHistory=e.jimuHistory,s.lodash=e.lodash,s.polished=e.polished},function(e){i.jsx=e.jsx,i.jsxs=e.jsxs},function(e){o.builderAppSync=e.builderAppSync,o.getAppConfigAction=e.getAppConfigAction,o.helpUtils=e.helpUtils},function(e){n.Button=e.Button,n.Dropdown=e.Dropdown,n.DropdownButton=e.DropdownButton,n.DropdownItem=e.DropdownItem,n.DropdownMenu=e.DropdownMenu,n.Icon=e.Icon,n.Nav=e.Nav,n.NavItem=e.NavItem,n.NavLink=e.NavLink,n.Popper=e.Popper,n.defaultMessages=e.defaultMessages}],execute:function(){e((()=>{var e={4108:e=>{"use strict";e.exports=o},4321:e=>{"use strict";e.exports=n},7386:e=>{"use strict";e.exports=i},9244:e=>{"use strict";e.exports=s}},t={};function r(s){var i=t[s];if(void 0!==i)return i.exports;var o=t[s]={exports:{}};return e[s](o,o.exports,r),o.exports}r.d=(e,t)=>{for(var s in t)r.o(t,s)&&!r.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.p="";var a={};return r.p=window.jimuConfig.baseUrl,(()=>{"use strict";r.r(a),r.d(a,{__set_webpack_public_path__:()=>f,default:()=>v});var e=r(7386),t=r(9244),s=r(4321),i=r(4108);const o="Show help guide",n="What's new",l="Live view",d="Unable to add widgets in {liveViewElement} mode.",p="You cannot insert a widget while the layout is locked.",u="Turn off live view",c="Unlock layout",h={page:"./widgets/setting-navigator/dist/runtime/assets/page.svg",data:"./widgets/setting-navigator/dist/runtime/assets/data.svg",utility:"./widgets/setting-navigator/dist/runtime/assets/utility.svg",theme:"./widgets/setting-navigator/dist/runtime/assets/theme.svg",insert:"./widgets/setting-navigator/dist/runtime/assets/insert.svg",appSetting:"./widgets/setting-navigator/dist/runtime/assets/setting.svg"},g="left-sidebar";class m extends t.React.PureComponent{constructor(e){super(e),this.viewLabel={page:this.props.intl.formatMessage({id:"page",defaultMessage:t.defaultMessages.page}),data:this.props.intl.formatMessage({id:"data",defaultMessage:s.defaultMessages.data}),theme:this.props.intl.formatMessage({id:"theme",defaultMessage:t.defaultMessages.theme}),utility:this.props.intl.formatMessage({id:"utility",defaultMessage:s.defaultMessages.utility}),insert:this.props.intl.formatMessage({id:"insert",defaultMessage:s.defaultMessages.insert}),appSetting:this.props.intl.formatMessage({id:"general",defaultMessage:s.defaultMessages.general})},this.onInsertMouseEnter=e=>{"insert"===e&&this.getWhetherViewDisabled("insert")&&this.setState({isInsertDisabledPopperShown:!0})},this.addMouseMoveListener=()=>{this.debouncedMouseMove&&document.addEventListener("mousemove",this.debouncedMouseMove)},this.removeMouseMoveListener=()=>{this.debouncedMouseMove&&document.removeEventListener("mousemove",this.debouncedMouseMove)},this.onDocumentMouseMove=e=>{const t=this.getInsertDisablePopperAndInsertNavUnionRect();if(!t)return;const{left:s,top:i,right:o,bottom:n}=t;e.clientX>=s&&e.clientX<=o&&e.clientY>=i&&e.clientY<=n?this.setState({isInsertDisabledPopperShown:!0}):this.setState({isInsertDisabledPopperShown:!1})},this.getHelpUrl=()=>{var e;null===(e=null===i.helpUtils||void 0===i.helpUtils?void 0:i.helpUtils.getHomeHelpLink())||void 0===e||e.then(e=>{e&&this.setState({helpHref:e})})},this.getWhatsNewUrl=()=>{var e;null===(e=null===i.helpUtils||void 0===i.helpUtils?void 0:i.helpUtils.getWhatsNewLink())||void 0===e||e.then(e=>{e&&this.setState({whatsNewHref:e})})},this.getStyle=e=>{const s=window.isExpressBuilder;return t.css`
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: ${e.sys.color.secondary.main};

      .jimu-nav-link-wrapper{
        > div{
          display: flex;
          justify-content: center;
        }
      }
      .nav.nav-underline {
        border: 0 !important;
        .nav-item{
          display: flex !important;
        }
        .nav-item:focus{
          border: 0;
          outline: none;
          box-shadow: 0 0 0;
        }
        .nav-item > .jimu-link{
          height: auto !important;
          padding-left: 0;
          padding-right: 0;
          position: relative;
          border-width: 0 !important;
          &::before {
            content: " ";
            display: block;
            position: absolute;
            width: 4px;
            height: 100%;
            top: 0;
            left: -4px;
            background-color: ${e.sys.color.primary.light};
            transition: left ease-in .2s .2s;
            z-index: 1;
          }
          > .jimu-icon {
            margin: 0;
          }
          &:active,
          &.active {
            border-left-width: 0 !important;
            &::before {
              left: 0;
            }
          }
        }
      }

      .top-sections {
        height: ${s?"110px":"330px"};
        .link-icon-color{
          svg{
            margin-right: 0 !important;
            margin-left: 0 !important;
          }
        }

        .link-icon-color:not(.disable-setting){
          &:hover{
            svg{
              color: ${e.ref.palette.neutral[1200]} !important;
            }
          }
        }
      }

      .nav-item:hover{
        background-color: ${e.sys.color.secondary.main};
      }

      .active-setting:not(.disable-setting){
        background-color: ${e.ref.palette.neutral[700]};
      }

      .disable-setting{
        &.nav-item:focus, &.nav-item button:focus, &.nav-item:active, &.nav-item button:active, &.nav-item:hover, &.nav-item button:hover{
          outline: none !important;
          cursor: default !important;
          border: 0 !important;
          box-shadow: 0 0 0 !important;
        }
        &.nav-item button:active::before{
          width: 0 !important;
        }
      }

      .link-focus{
        &:focus, button:focus{
          border: 0;
          box-shadow: 0 0 0;
        }
      }

      .bottom-sections{
        position: absolute;
        bottom: 0;
        .func-buttons{
          margin: 0.25rem;
          >span{
            display: inline-block;
            position: relative;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .cover-dropdown-button {
            min-height: 3rem;
          }
          .dropdown-button.cover-dropdown-button:hover{
            background-color: ${e.sys.color.secondary.main};
            svg{
              color: ${e.ref.palette.neutral[1200]} !important
            }
          }
        }
      }
    `},this.getDropdownMenuStyle=()=>t.css`
      .link-con {
        &, &:hover {
          color: var(--ref-palette-black);
          padding: ${t.polished.rem(4)} ${t.polished.rem(8)} !important;
          text-decoration: none;
        }
      }
    `,this.getBuilderUrl=()=>{const e=(0,t.getAppStore)().getState().queryObject;let s=`${window.jimuConfig.mountPath}builder/?id=${e.id}`;return e.locale&&(s+=`&locale=${e.locale}`),window.isExpressBuilder||(s+="&mode=express"),s},this.onSwitchModeClick=()=>{const e=this.getBuilderUrl();window.location.href=e},this.turnOffLiveView=()=>{i.builderAppSync.publishAppModeChangeToApp(t.AppMode.Design),setTimeout(()=>{this.props.lockLayoutLabel||(this.setState({isInsertDisabledPopperShown:!1}),this.changeView("insert",!0))})},this.turnOffLockLayout=()=>{(0,i.getAppConfigAction)().setLockLayout(!1).exec(),setTimeout(()=>{this.setState({isInsertDisabledPopperShown:!1}),this.changeView("insert",!0)})},this.debouncedMouseMove=t.lodash.debounce(this.onDocumentMouseMove,200),this.state={isInsertDisabledPopperShown:!1,helpHref:"#",whatsNewHref:"#"}}componentDidMount(){this.getHelpUrl(),this.getWhatsNewUrl(),this.getWhetherDisableInsert(this.props)&&"insert"===this.props.currentViewId&&(window.isExpressBuilder?t.jimuHistory.changeView("opts-section","theme"):t.jimuHistory.changeView("opts-section","page"))}componentDidUpdate(e,s){const i=this.getWhetherDisableInsert(this.props);!i&&this.state.isInsertDisabledPopperShown&&this.setState({isInsertDisabledPopperShown:!1}),i&&!this.getWhetherDisableInsert(e)&&"insert"===this.props.currentViewId&&(window.isExpressBuilder?t.jimuHistory.changeView("opts-section","theme"):t.jimuHistory.changeView("opts-section","page")),this.props.portalUrl===(null==e?void 0:e.portalUrl)&&this.props.portalSelf===(null==e?void 0:e.portalSelf)||(this.getHelpUrl(),this.getWhatsNewUrl()),s.isInsertDisabledPopperShown!==this.state.isInsertDisabledPopperShown&&(this.state.isInsertDisabledPopperShown?this.addMouseMoveListener():this.removeMouseMoveListener())}getInsertDisablePopperAndInsertNavUnionRect(){var e,t;const s=null===(e=this.insertDom)||void 0===e?void 0:e.getBoundingClientRect(),i=null===(t=this.insertDisablePopper)||void 0===t?void 0:t.getBoundingClientRect();if(!s||!i)return null;return{left:Math.min(s.left,i.left),top:Math.min(s.top,i.top),right:Math.max(s.right,i.right),bottom:Math.max(s.bottom,i.bottom)}}getWhetherDisableInsert(e){return e.lockLayoutLabel||e.appMode===t.AppMode.Run}changeView(e,s=!1){!s&&this.getWhetherViewDisabled(e)||(this.props.currentViewId===e?(0,t.getAppStore)().dispatch(t.appActions.widgetStatePropChange(g,"collapse",!this.props.sidebarVisible)):(t.jimuHistory.changeView("opts-section",e),this.props.sidebarVisible||(0,t.getAppStore)().dispatch(t.appActions.widgetStatePropChange(g,"collapse",!0))))}getWhetherViewDisabled(e){return this.getWhetherDisableInsert(this.props)&&"insert"===e}getWhetherViewActive(e){return e===this.props.currentViewId&&this.props.sidebarVisible}render(){const i="active-setting",r="disable-setting",{sectionJson:a,theme:g,browserSizeMode:m}=this.props,v=this.props.intl.formatMessage({id:"liveView",defaultMessage:l}),f=this.props.intl.formatMessage({id:"disableInsertDueToLiveViewTip",defaultMessage:d},{liveViewElement:(0,e.jsx)("strong",{children:v},"disableInsertDueToLiveViewTip")}),w=this.props.intl.formatMessage({id:"disableInsertDueToLockLayoutTip",defaultMessage:p}),b=this.props.intl.formatMessage({id:"help",defaultMessage:s.defaultMessages.help});return(0,e.jsxs)("div",{css:this.getStyle(g),className:"widget-builder-setting-navigator h-100",children:[(0,e.jsxs)(s.Popper,{ref:e=>{this.insertDisablePopper=e},open:this.state.isInsertDisabledPopperShown,arrowOptions:!0,reference:this.insertDom,placement:"right",autoFocus:!1,css:t.css`
            width: ${t.polished.rem(300)};
            padding: ${t.polished.rem(12)};
            background-color: ${g.sys.color.surface.overlay};
            color: ${g.sys.color.surface.overlayHint};
            font-size: ${t.polished.rem(12)};
            font-weight: 500;
            strong {
              font-size: ${t.polished.rem(16)};
              color: ${g.ref.palette.black};
            }
            .jimu-popper--arrow::after {
              border-right-color: ${g.sys.color.surface.overlay} !important;
            }
          `,children:[(0,e.jsx)("div",{className:"insert-disable-tooltip",children:this.props.appMode===t.AppMode.Run?(0,e.jsx)("div",{children:(0,e.jsx)("div",{children:f})}):(0,e.jsx)("div",{children:(0,e.jsx)("div",{children:w})})}),(0,e.jsx)("div",{className:"d-flex justify-content-end align-items-center mt-2",children:this.props.appMode===t.AppMode.Run?(0,e.jsx)(s.Button,{className:"py-0",type:"secondary",onClick:this.turnOffLiveView,children:this.props.intl.formatMessage({id:"turnOffLiveView",defaultMessage:u})}):(0,e.jsx)(s.Button,{className:"py-0",type:"secondary",onClick:this.turnOffLockLayout,children:this.props.intl.formatMessage({id:"turnOffLockLayout",defaultMessage:c})})})]}),(0,e.jsx)(s.Nav,{fill:!0,underline:!0,vertical:!0,right:!0,className:"top-sections",iconOnly:!0,children:a.views.map(o=>{const n=this.getWhetherViewDisabled(o),a=this.getWhetherViewActive(o);return(0,e.jsx)(s.NavItem,{className:(0,t.classNames)("link-icon-color",{[i]:a,[r]:n}),disabled:n,onMouseEnter:()=>{this.onInsertMouseEnter(o)},children:(0,e.jsx)(s.NavLink,{iconPosition:"above",tag:"button",active:a,onClick:e=>{this.changeView(o)},iconOnly:!0,title:this.viewLabel[o],"aria-label":this.viewLabel[o],"aria-pressed":a?"true":"false",children:(0,e.jsx)("div",{className:"w-100 h-100",ref:e=>{"insert"===o&&(this.insertDom=e)},children:(0,e.jsx)(s.Icon,{className:(0,t.classNames)({[i]:a,[r]:n}),icon:h[o],size:"20",color:n?this.props.theme.sys.color.action.disabled.text:a?this.props.theme.ref.palette.neutral[1200]:this.props.theme.ref.palette.neutral[1e3]})})})},o)})}),(0,e.jsx)("div",{className:"bottom-sections w-100",children:(0,e.jsx)("div",{className:"func-buttons",children:(0,e.jsxs)(s.Dropdown,{direction:"right","aria-label":b,className:"link-focus link-icon-color w-100 d-flex justify-content-center",children:[(0,e.jsx)(s.DropdownButton,{icon:!0,arrow:!1,className:"cover-dropdown-button",title:b,children:(0,e.jsx)(s.Icon,{autoFlip:"ar"===window.locale.split("-")[0],icon:"./widgets/setting-navigator/dist/runtime/assets/help.svg",color:this.props.theme.ref.palette.neutral[1e3]})}),(0,e.jsxs)(s.DropdownMenu,{css:this.getDropdownMenuStyle(),children:[(0,e.jsxs)(s.DropdownItem,{tag:"a",className:"link-con w-100 h-100 d-block",href:this.state.helpHref,target:"_blank",title:b,rel:"noopener noreferrer",role:"menuitem",children:[(0,e.jsx)(s.Icon,{autoFlip:!0,icon:"./widgets/setting-navigator/dist/runtime/assets/help-document.svg",className:"mr-2"}),b]}),m===t.BrowserSizeMode.Large&&(0,e.jsxs)(s.DropdownItem,{title:this.props.intl.formatMessage({id:"showGuide",defaultMessage:o}),onClick:()=>{window.isExpressBuilder?t.GuideManager.getInstance().startGuide({id:"general-express-mode",type:t.GuideTypes.Program,level:t.GuideLevels.Builder}):t.GuideManager.getInstance().startGuide({id:"opening-tour",type:t.GuideTypes.Program,level:t.GuideLevels.Builder})},children:[(0,e.jsx)(s.Icon,{icon:"./widgets/setting-navigator/dist/runtime/assets/launch.svg",className:"mr-2"}),this.props.intl.formatMessage({id:"showGuide",defaultMessage:o})]}),(0,e.jsxs)(s.DropdownItem,{title:this.props.intl.formatMessage({id:"whatsNew",defaultMessage:n}),tag:"a",className:"link-con w-100 h-100 d-block",href:this.state.whatsNewHref,target:"_blank",rel:"noopener noreferrer",role:"menuitem",children:[(0,e.jsx)(s.Icon,{icon:"./widgets/setting-navigator/dist/runtime/assets/whats-new.svg",className:"mr-2"}),this.props.intl.formatMessage({id:"whatsNew",defaultMessage:n})]})]})]})})})]})}}m.mapExtraStateProps=(e,t)=>{var s,i,o,n,r,a,l,d,p,u,c,h,m;const v=Object.keys(e.appRuntimeInfo.sectionNavInfos||{}).map(t=>e.appRuntimeInfo.sectionNavInfos[t].currentViewId),f=null===(i=null===(s=e.appConfig)||void 0===s?void 0:s.widgets)||void 0===i?void 0:i["left-sidebar"];let w=!0;return f&&(w=0!==f.config.defaultState),{sectionJson:null===(o=e.appConfig)||void 0===o?void 0:o.sections[t.config.sectionId],currentViewId:v[0]?v[0]:"insert",sidebarVisible:null!==(a=null===(r=null===(n=e.widgetsState)||void 0===n?void 0:n[g])||void 0===r?void 0:r.collapse)&&void 0!==a?a:w,lockLayoutLabel:null===(p=null===(d=null===(l=e.appStateInBuilder)||void 0===l?void 0:l.appConfig)||void 0===d?void 0:d.forBuilderAttributes)||void 0===p?void 0:p.lockLayout,appMode:null===(u=e.appStateInBuilder)||void 0===u?void 0:u.appRuntimeInfo.appMode,portalUrl:null===(c=e.appStateInBuilder)||void 0===c?void 0:c.portalUrl,portalSelf:null===(h=e.appStateInBuilder)||void 0===h?void 0:h.portalSelf,browserSizeMode:null===(m=e.appStateInBuilder)||void 0===m?void 0:m.browserSizeMode}};const v=m;function f(e){r.p=e}})(),a})())}}});