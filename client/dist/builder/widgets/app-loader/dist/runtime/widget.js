System.register(["jimu-core","jimu-core/emotion","jimu-for-builder","jimu-for-builder/templates","jimu-layouts/layout-builder","jimu-layouts/layout-runtime","jimu-theme","jimu-ui","jimu-ui/advanced/data-source-selector","jimu-ui/advanced/rich-text-editor","jimu-ui/advanced/setting-components"],function(e,t){var o={},i={},s={},r={},n={},a={},l={},d={},c={},u={},p={};return Object.defineProperty(r,"__esModule",{value:!0}),{setters:[function(e){o.APP_FRAME_NAME_IN_BUILDER=e.APP_FRAME_NAME_IN_BUILDER,o.AppMode=e.AppMode,o.BrowserSizeMode=e.BrowserSizeMode,o.IntlProvider=e.IntlProvider,o.LayoutItemType=e.LayoutItemType,o.LayoutParentType=e.LayoutParentType,o.LayoutType=e.LayoutType,o.PageMode=e.PageMode,o.React=e.React,o.ReactDOM=e.ReactDOM,o.ReactRedux=e.ReactRedux,o.SystemErrorCode=e.SystemErrorCode,o.WidgetType=e.WidgetType,o.classNames=e.classNames,o.css=e.css,o.getAppStore=e.getAppStore,o.hooks=e.hooks,o.lodash=e.lodash,o.moduleLoader=e.moduleLoader,o.polished=e.polished,o.queryString=e.queryString,o.urlUtils=e.urlUtils,o.utils=e.utils},function(e){i.Fragment=e.Fragment,i.jsx=e.jsx,i.jsxs=e.jsxs},function(e){s.AppResourceManager=e.AppResourceManager,s.LayoutServiceProvider=e.LayoutServiceProvider,s.ToBuilderMessage=e.ToBuilderMessage,s.WidgetSettingManager=e.WidgetSettingManager,s.appStateActions=e.appStateActions,s.builderActions=e.builderActions,s.builderAppSync=e.builderAppSync,s.getAppConfigAction=e.getAppConfigAction},function(e){Object.keys(e).forEach(function(t){r[t]=e[t]})},function(e){n.ColumnLayoutService=e.ColumnLayoutService,n.FixedLayoutService=e.FixedLayoutService,n.FlowLayoutService=e.FlowLayoutService,n.GridLayoutService=e.GridLayoutService,n.RowLayoutService=e.RowLayoutService},function(e){a.searchUtils=e.searchUtils,a.utils=e.utils},function(e){l.ThemeSwitchComponent=e.ThemeSwitchComponent,l.styled=e.styled},function(e){d.AlertPopup=e.AlertPopup,d.Loading=e.Loading,d.LoadingType=e.LoadingType,d.PanelHeader=e.PanelHeader,d.defaultMessages=e.defaultMessages,d.styleUtils=e.styleUtils},function(e){c.DataSourceRemoveWaringReason=e.DataSourceRemoveWaringReason,c.DataSourceRemoveWarningPopup=e.DataSourceRemoveWarningPopup,c.dataComponentsUtils=e.dataComponentsUtils},function(e){u.RichArcadeContentBuilder=e.RichArcadeContentBuilder,u.RichExpressionBuilder=e.RichExpressionBuilder},function(e){p.TemplateList=e.TemplateList,p.WidgetList=e.WidgetList}],execute:function(){e((()=>{var e={1496:e=>{"use strict";e.exports=a},1888:e=>{"use strict";e.exports=l},3089:e=>{"use strict";e.exports=c},3949:e=>{"use strict";e.exports=u},4108:e=>{"use strict";e.exports=s},4321:e=>{"use strict";e.exports=d},6055:e=>{"use strict";e.exports=n},6884:e=>{"use strict";e.exports=r},7386:e=>{"use strict";e.exports=i},9244:e=>{"use strict";e.exports=o},9298:e=>{"use strict";e.exports=p}},t={};function g(o){var i=t[o];if(void 0!==i)return i.exports;var s=t[o]={exports:{}};return e[o](s,s.exports,g),s.exports}g.d=(e,t)=>{for(var o in t)g.o(t,o)&&!g.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},g.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),g.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},g.p="";var h={};return g.p=window.jimuConfig.baseUrl,(()=>{"use strict";g.r(h),g.d(h,{__set_webpack_public_path__:()=>O,default:()=>B});var e=g(7386),t=g(9244),o=g(4108),i=g(4321);const s=t.css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;function r(e,o,i){return t.css`
    ${e?s:""};
    overflow: auto;

    .content-section {
      height: 100%;
      width: 100%;
      overflow: auto;
    }

    .content {
      padding: 1.5rem;
      margin: 0 auto;
    }

    .top-section {
      margin-top: 5px;
    }

    .page-name {
      color: ${i.ref.palette.neutral[800]};
    }

    .body-section {
      width: 100%;
      display: flex;
      margin-top: 5px;
      overflow: visible;
      position: relative;
      align-items: center;
      // box-shadow: 0 2px 5px 1px rgba(0,0,0,0.15);

      .device-frame {
        position: relative;
        overflow: hidden;
        height: ${o>0?`${o}px`:"auto"};
        flex-grow: 0;
        flex-shrink: 0;

        &.center-origin {
          transform-origin: top center;
          align-self: center;
        }
        &.left-origin {
          transform-origin: top left;
          align-self: flex-start;
        }

        iframe {
          width: 100%;
          // height: 100%;
          border: none;
          position: relative;
          overflow: visible;
        }
      }
    }
  `}class n extends t.React.PureComponent{constructor(e){super(e),this.formatMessage=(e,t)=>this.props.formatMessage(e,t),this.toggleLayoutMode=()=>{const{isAuto:e}=this.props;e?this.handleToggleCustomConfirm():this.handleToggleAutoConfirm()},this.handleToggleAutoConfirm=()=>{this.setState({showAutoConfirm:!this.state.showAutoConfirm})},this.autoConfirmClosed=()=>{this.props.isHeader?this.resetHeader():this.props.isFooter?this.resetFooter():this.props.isDialog?this.resetDialog():this.resetPageBody()},this.handleToggleCustomConfirm=()=>{this.setState({showCustomConfirm:!this.state.showCustomConfirm})},this.customConfirmClosed=()=>{this.props.isHeader?this.unLockHeaderLayout():this.props.isFooter?this.unLockFooterLayout():this.props.isDialog?this.unLockDialogLayout():this.unLockPageBodyLayout()},this.unLockFooterLayout=()=>{const{browserSizeMode:e,mainSizeMode:i}=this.props,s=(0,o.getAppConfigAction)(),r=s.appConfig.footer.layout,n=s.createLayoutForSizeMode(e,i,r,t.LayoutParentType.Footer,"footer");n&&s.editFooterProperty("layout",n).exec()},this.unLockHeaderLayout=()=>{const{browserSizeMode:e,mainSizeMode:i}=this.props,s=(0,o.getAppConfigAction)(),r=s.appConfig.header.layout,n=s.createLayoutForSizeMode(e,i,r,t.LayoutParentType.Header,"header");n&&s.editHeaderProperty("layout",n).exec()},this.unLockPageBodyLayout=()=>{const{browserSizeMode:e,mainSizeMode:i,pageId:s}=this.props,r=(0,o.getAppConfigAction)(),n=r.appConfig.pages[s],a=r.createLayoutForSizeMode(e,i,n.layout,t.LayoutParentType.Page,s);a&&r.editPageProperty(s,"layout",a).exec()},this.unLockDialogLayout=()=>{var e;const{browserSizeMode:i,mainSizeMode:s,dialogId:r}=this.props,n=(0,o.getAppConfigAction)(),a=n.appConfig.dialogs[r],l=n.createLayoutForSizeMode(i,s,a.layout,t.LayoutParentType.Dialog,r);l&&(n.editDialogProperty(r,"layout",l),(null===(e=a.sizeMode)||void 0===e?void 0:e.LARGE)&&n.editDialogProperty(r,"sizeMode",a.sizeMode.set(i,a.sizeMode.LARGE)),n.exec())},this.resetHeader=()=>{const{browserSizeMode:e}=this.props,t=(0,o.getAppConfigAction)(),i=t.appConfig.header.layout;t.removeSizeModeLayout(i[e],e).editHeaderProperty("layout",i.without(e)).exec()},this.resetFooter=()=>{const{browserSizeMode:e}=this.props,t=(0,o.getAppConfigAction)(),i=t.appConfig.footer.layout;t.removeSizeModeLayout(i[e],e).editFooterProperty("layout",i.without(e)).exec()},this.resetPageBody=()=>{const{browserSizeMode:e,pageId:t}=this.props,i=(0,o.getAppConfigAction)(),s=i.appConfig.pages[t].layout;i.removeSizeModeLayout(s[e],e).editPageProperty(t,"layout",s.without(e)).exec()},this.resetDialog=()=>{var e;const{browserSizeMode:t,dialogId:i}=this.props,s=(0,o.getAppConfigAction)(),r=s.appConfig.dialogs[i],n=r.layout;s.removeSizeModeLayout(n[t],t).editDialogProperty(i,"layout",n.without(t)),(null===(e=r.sizeMode)||void 0===e?void 0:e[t])&&s.editDialogProperty(i,"sizeMode",r.sizeMode.without(t)),s.exec()},this.state={showAutoConfirm:!1,showCustomConfirm:!1}}getStyle(){const{isAuto:e,isHeader:o,isFooter:i}=this.props;let s;return i?s=t.css`position: absolute;`:o||i||(s=t.css`
        position: sticky;
        transform: translateZ(1px);
      `),t.css`
      ${s};
      .state-toggle-btn{
        cursor: pointer;
        position: relative;
        padding: 0 1rem;
        overflow: hidden;
        background: var(--ref-palette-neutral-500);
        border-radius: 2px;
      }
      .toggle-part {
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1;
      }
      .toggle-highlight {
        position: absolute;
        height: 30px;
        left: 0;
        right: 0;
        background-color: var(--sys-color-primary-main);
        transition: 0.2s;
        top: ${e?0:30}px;
      }
    `}getSizeModeNls(e){switch(e){case t.BrowserSizeMode.Small:return this.formatMessage("smallScreen");case t.BrowserSizeMode.Medium:return this.formatMessage("mediumScreen");default:return this.formatMessage("largeScreen")}}render(){const{isAuto:o,mainSizeMode:s}=this.props,r=this.getSizeModeNls(s);return(0,e.jsxs)("div",{style:this.props.style,css:this.getStyle(),children:[(0,e.jsxs)("div",{className:"d-flex flex-column state-toggle-btn",onClick:this.toggleLayoutMode,title:o?`${this.formatMessage("autoEnabledTip",{label:r})} ${this.formatMessage("customDisabledTip")}`:`${this.formatMessage("customEnabledTip")} ${this.formatMessage("autoDisabledTip")}`,children:[(0,e.jsx)("div",{className:"toggle-part text-nowrap",children:this.formatMessage("auto")}),(0,e.jsx)("div",{className:"toggle-part text-nowrap",children:this.formatMessage("custom")}),(0,e.jsx)("div",{className:"toggle-highlight"})]}),(0,e.jsx)(i.AlertPopup,{toggle:this.handleToggleAutoConfirm,onClickClose:this.handleToggleAutoConfirm,onClickOk:this.autoConfirmClosed,title:this.formatMessage("enableConfirm"),isOpen:this.state.showAutoConfirm,severity:"warning",withIcon:!0,children:(0,e.jsx)("div",{children:(0,e.jsx)("div",{children:this.formatMessage("autoConfirmMsg",{label:r,auto:this.formatMessage("auto").toLocaleLowerCase()})})})}),(0,e.jsx)(i.AlertPopup,{toggle:this.handleToggleCustomConfirm,onClickClose:this.handleToggleCustomConfirm,onClickOk:this.customConfirmClosed,title:this.formatMessage("enableConfirm"),isOpen:this.state.showCustomConfirm,severity:"warning",withIcon:!0,children:(0,e.jsxs)("div",{children:[(0,e.jsx)("div",{children:this.formatMessage("customConfirmMsg1",{custom:this.formatMessage("custom").toLocaleLowerCase()})}),(0,e.jsx)("div",{css:t.css`margin-top: 1rem;`,children:this.formatMessage("customConfirmMsg2")})]})})]})}}const a={certainly:"OK",autoEnabledTip:"Auto layout is enabled. Widgets are synced with those on the {label} and arranged automatically.",autoDisabledTip:"Click to enable auto layout.",customEnabledTip:"Custom layout is enabled. Widgets added in other device modes will not be automatically added here. Alternatively, you can manually add them from the pending list on the Insert panel.",customDisabledTip:"Click to enable custom layout.",confirm:"Confirm",enableConfirm:"Are you sure you want to enable it?",autoConfirmMsg:"By enabling {auto}, the widgets will be synced with those on the {label} and arranged automatically.",customConfirmMsg1:"By enabling {custom}, you can manually arrange widgets for this device mode.",customConfirmMsg2:"However, widgets added in other device modes will not be automatically added here. Alternatively, you can manually add them from the pending list on the Insert panel.",dragToResize:"Drag to resize",largeScreen:"Large screen device",mediumScreen:"Medium screen device",smallScreen:"Small screen device",deleteWarning:'Deleting a widget will remove it from all device views. Linked widgets in other states of the same list or card will also be deleted. Use "Move to the pending list" button to remove it from current device view and state and preserve it in the others.',confirmDelete:"Are you sure you want to delete this widget from all devices and states?",quickStyleItem:"Quick style {index}",chooseWidget:"Choose widget",canvasTitle:"Experience Builder Canvas"};var l=g(1496);function d(){return`${t.utils.getLocalStorageAppKey()}-confirm-delete-widget`}function c(){return"false"!==t.utils.readLocalStorage(d())}function u(e){return!(!e||window.isExpressBuilder)&&(!!c()&&(!!function(e){var i;if(!e)return!1;const s=(0,o.getAppConfigAction)().appConfig,{layoutId:r,layoutItemId:n}=e,a=s.layouts[r].content[n];if(!a)return!1;if(a.type===t.LayoutItemType.Section||a.type===t.LayoutItemType.ScreenGroup)return!0;if(a.type===t.LayoutItemType.Widget&&a.widgetId)return(null===(i=s.widgets[a.widgetId].manifest)||void 0===i?void 0:i.widgetType)!==t.WidgetType.Layout;return!1}(e)&&function(e){const{layoutId:i,layoutItemId:s}=e,r=(0,o.getAppConfigAction)().appConfig,n=r.layouts[i].content[s],a=n.type,d=l.utils.getCurrentSizeMode();if(a===t.LayoutItemType.Widget){const e=n.widgetId,t=r.widgets[e];let o=!1;return Object.keys(t.parent).length>1&&(o=p(r,d,t.parent)),o||t.parent[d].length>1}if(a===t.LayoutItemType.Section){const e=n.sectionId,t=r.sections[e];let o=!1;return Object.keys(t.parent).length>1&&(o=p(r,d,t.parent)),o||t.parent[d].length>1}return!1}(e)))}function p(e,t,o){let i=!1;return Object.keys(o).length>1&&(i=Object.keys(o).some(i=>i!==t&&(o[i].length>0&&o[i].some(t=>!l.searchUtils.findLayoutItem(e,t).isPending)))),i}function m(o){const{formatMessage:s,onConfirmDelete:r,onCancelDelete:n}=o,a=t.ReactRedux.useSelector(e=>{var t;return null===(t=e.builder)||void 0===t?void 0:t.contentToDelete},t.ReactRedux.shallowEqual),l=t.React.useMemo(()=>u(a),[a]),c=t.React.useCallback(()=>{r(a)},[a,r]);t.React.useEffect(()=>{a&&!l&&c()},[a,l,c]);const p=t.React.useCallback(e=>{var o;o=!e,t.utils.setLocalStorage(d(),`${o}`),c()},[c]);return l?(0,e.jsx)(i.AlertPopup,{onClickClose:n,onClickOk:p,title:s("confirmDelete"),severity:"warning",hasNotShowAgainOption:!0,withIcon:!0,isOpen:!0,children:(0,e.jsx)("div",{className:"message",css:t.css`
    font-weight: 400;
    font-size: 0.8125rem;
    line-height: normal;
  `,children:(0,e.jsx)("div",{"data-testid":"confirmDeleteMessage",className:"text-paper",css:t.css`
          color: var(--ref-palette-neutral-1100);
        `,children:s("deleteWarning")})})}):null}var f=g(3089);function v(i){var s,r,n;const a=t.ReactRedux.useSelector(e=>{var t;return null===(t=e.builder)||void 0===t?void 0:t.contentToDelete},t.ReactRedux.shallowEqual),l=t.React.useMemo(()=>function(e){var i,s,r,n,a;if(!e||window.isExpressBuilder)return!1;let l=!1;const{layoutId:d,layoutItemId:c}=e,u=(0,o.getAppConfigAction)().appConfig,p=null===(r=null===(s=null===(i=u.layouts)||void 0===i?void 0:i[d])||void 0===s?void 0:s.content)||void 0===r?void 0:r[c];if((null==p?void 0:p.type)===t.LayoutItemType.Widget&&p.widgetId){const e=null===(n=u.widgets)||void 0===n?void 0:n[p.widgetId];(null===(a=null==e?void 0:e.outputDataSources)||void 0===a?void 0:a.length)>0&&(l=e.outputDataSources.some(e=>f.dataComponentsUtils.getWidgetsUsingDsOrItsDescendantDss(e,u.widgets).length>0))}return l}(a),[a]),d=t.React.useCallback(()=>{i.onConfirmDelete(a)},[a]);t.React.useEffect(()=>{a&&!l&&d()},[a,l]);const c=t.React.useCallback(()=>{i.onCancelDelete()},[]);if(!l)return null;const u=(0,o.getAppConfigAction)().appConfig,p=null===(n=null===(r=null===(s=null==u?void 0:u.layouts)||void 0===s?void 0:s[null==a?void 0:a.layoutId])||void 0===r?void 0:r.content)||void 0===n?void 0:n[null==a?void 0:a.layoutItemId];return(0,e.jsx)(f.DataSourceRemoveWarningPopup,{isOpen:!0,toggle:c,widgetId:null==p?void 0:p.widgetId,reason:f.DataSourceRemoveWaringReason.SourceWidgetRemoved,afterRemove:d})}var y=g(6055),w=g(9298),S=g(6884);function b(o){const{data:i}=o,{templateMethod:s,onSelect:r}=null!=i?i:{},n=t.hooks.useEventCallback(e=>{r(e)});return null==i?null:(0,e.jsx)(w.TemplateList,{templates:S[s](!1),onItemSelect:n})}function x(o){const{data:i}=o,{isPlaceholder:s,isItemAccepted:r,onSelect:n}=null!=i?i:{},a=t.hooks.useEventCallback(e=>{n(e)});return null==i?null:(0,e.jsx)(w.WidgetList,{isPlaceholder:s,isAccepted:r,onSelect:a})}var C=g(1888),M=g(3949),I=function(e,t,o,i){return new(o||(o=Promise))(function(s,r){function n(e){try{l(i.next(e))}catch(e){r(e)}}function a(e){try{l(i.throw(e))}catch(e){r(e)}}function l(e){var t;e.done?s(e.value):(t=e.value,t instanceof o?t:new o(function(e){e(t)})).then(n,a)}l((i=i.apply(e,t||[])).next())})};const{useState:L,useRef:A,useEffect:R}=t.React,k=(0,C.styled)(M.RichExpressionBuilder)(({theme:e})=>{var o,i;const s=e.ref.palette.neutral[400],r=null===(i=null===(o=null==e?void 0:e.ref.palette)||void 0===o?void 0:o.neutral)||void 0===i?void 0:i[1e3],n=e.ref.palette.black;return t.css`
    > * {
      user-select: none;
    }
    width: 285px;
    height: 500px;
    color: ${n};
    background: ${s};
    .panel-header {
      background: ${s};
      color: ${r};
    }
    .expression-body {
      height: 100%;
    }
  `});function j(s){const{theme:r,intl:n,locale:a,isFullScreenPage:l}=s,d=t.hooks.useTranslation(i.defaultMessages),[c,u]=L(null),[p,g]=L({}),[h,m]=L({}),f=t.ReactRedux.useSelector(e=>{var t,o,i,s;const r=null==e?void 0:e.appStateInBuilder,n=null===(t=null==r?void 0:r.appConfig)||void 0===t?void 0:t.layouts,a=null===(o=null==r?void 0:r.appRuntimeInfo)||void 0===o?void 0:o.selection,l=n[null==a?void 0:a.layoutId];return null===(s=null===(i=null==l?void 0:l.content)||void 0===i?void 0:i[null==a?void 0:a.layoutItemId])||void 0===s?void 0:s.widgetId}),v=t.ReactRedux.useSelector(e=>{var t;const o=null==e?void 0:e.appStateInBuilder;return null===(t=null==o?void 0:o.appRuntimeInfo)||void 0===t?void 0:t.currentPageId}),y=A(null),w=A(null),S=A(null),M=A(null),j=A(null),P=A(null),D=A(null),z=t.hooks.usePrevious(f),T=t.hooks.usePrevious(v);let B;R(()=>{const e=e=>I(this,void 0,void 0,function*(){if(!h[e]&&e){const o=`${e}dist/runtime/builder-support`;t.moduleLoader.loadModule(o).then(t=>{switch(m(Object.assign(Object.assign({},h),{[e]:!0})),e){case"widgets/common/button/":y.current=t.default.QuickStyle;break;case"widgets/common/divider/":w.current=t.default.QuickStyle;break;case"widgets/common/navigator/":S.current=t.default.NavQuickStyle,M.current=t.default.ManageViews;break;case"widgets/common/controller/":j.current=t.default.ManageWidgetsComponent;break;case"widgets/layout/accordion/":P.current=t.default.QuickStyle;break;case"widgets/common/login/":D.current=t.default.QuickStyle}})}yield Promise.resolve()});window._builderPubsub.subscribe(`to_builder.${o.ToBuilderMessage.SetSidePanel}`,(t,o)=>{const i=e=>{var t;null===(t=null==o?void 0:o.onSelect)||void 0===t||t.call(o,e),!(null==o?void 0:o.keepPanel)&&g(e=>{const t=Object.assign({},e);return Object.keys(t).forEach(e=>{t[e]=!1}),t})};e(null==o?void 0:o.uri).then(()=>{!1!==(null==o?void 0:o.active)&&u(Object.assign(Object.assign({},o),{onSelect:i}));const e=void 0===(null==o?void 0:o.active)||(null==o?void 0:o.active);g(e?t=>{const i=Object.assign({},t);return Object.keys(i).forEach(e=>{i[e]=!1}),i[(null==o?void 0:o.widgetId)||"other"]=e,i}:t=>{const i=Object.assign({},t);return i[(null==o?void 0:o.widgetId)||"other"]=e,i})})});((null==c?void 0:c.widgetId)!==f&&z!==f||T!==v)&&g(e=>{const t=Object.assign({},e);return Object.keys(t).forEach(e=>{t[e]=!1}),t})},[h,c,z,f,T,v]),B="template"===(null==c?void 0:c.type)||"templateBlock"===(null==c?void 0:c.type)?d("selectTemplate"):"widget"===(null==c?void 0:c.type)?d("addWidget"):"manageWidgets"===(null==c?void 0:c.type)?d("manageWidgets"):"textExpression"===(null==c?void 0:c.type)?d("dynamicContent"):"navigatorManageViews"===(null==c?void 0:c.type)?d("manageViews"):d("quickStyle");const O=t.hooks.useEventCallback(()=>{g(e=>{const t=Object.assign({},e);return Object.keys(t).forEach(e=>{t[e]=!1}),t}),"function"==typeof(null==c?void 0:c.onClose)&&c.onClose()}),E=Object.keys(p).some(e=>p[e]),W=n.messages,$=["buttonQuickStyle","dividerQuickStyle","navigatorQuickStyle"].includes(null==c?void 0:c.type);return(0,e.jsx)(t.IntlProvider,{locale:a,defaultLocale:a,messages:W,children:E&&(0,e.jsxs)("div",{className:"mobile-tool-container",css:((e,o)=>{const i="dark"===e.sys.color.mode;let s=360;switch(o){case"template":s=370;break;case"templateBlock":s=450;break;case"widget":s=405;break;case"manageWidgets":case"navigatorManageViews":s=300;break;case"buttonQuickStyle":s=470;break;case"textExpression":case"navigatorQuickStyle":s=260;break;case"dividerQuickStyle":case"loginQuickStyle":s=360;break;case"accordionQuickStyle":s=310}return t.css`
      width: ${t.polished.rem(s)};
      ${l?"max-height: 100%;":`max-height: ${t.polished.rem(640)};`}
      ${"textExpression"===o&&"height: 640px;"}
      color: ${i?e.sys.color.surface.overlayText:e.sys.color.surface.paperText};
      background-color: ${i?e.sys.color.surface.header:e.sys.color.surface.headerHint};
      border: 1px solid ${i?e.sys.color.divider.tertiary:e.sys.color.surface.paperHint};
      // box-shadow: 0 4px 20px 4px ${t.polished.rgba(i?e.sys.color.action.default:e.sys.color.action.text,.5)};

      position: sticky;
      top: 20px;
      .panel-header{
        color: ${i?e.sys.color.surface.paperHint:e.sys.color.divider.tertiary} !important;
        .action-btn{
          color: ${i?e.sys.color.surface.paperHint:e.sys.color.divider.tertiary} !important;
          &:hover{
            color: ${i?e.sys.color.surface.background:e.sys.color.surface.backgroundText} !important;
          }
        }
      }
      .mobile-tool-board{
        height: calc(100% - 40px);
        ${"widget"!==o?"overflow-y: auto;":"overflow-y: hidden;"}
        overflow-x: hidden;
        .content{
          height: 100%;
          margin: 0 auto;
          padding: 0px;
        }
        .fixed-at-bottom{
          position: absolute !important;
        }
        .list-container{
          height: calc(100% - 100px);
        }
      }
      .quick-style-item-container{
        padding-left: 4px;
        padding-right: 4px;
        padding-bottom: 8px;
      }
      .quick-style-item{
        border: 2px solid transparent;
        &.quick-style-item-selected{
          border: 2px solid ${e.sys.color.primary.main};
        }
        ${"buttonQuickStyle"===o&&`.quick-style-item-inner{\n          background-color: ${i?e.ref.palette.neutral[500]:e.ref.palette.neutral[1e3]};\n        }`}
      }
    `})(r,null==c?void 0:c.type),onClick:e=>{e.stopPropagation()},children:[(0,e.jsx)(i.PanelHeader,{showClose:!0,onClose:O,title:B}),(0,e.jsx)(C.ThemeSwitchComponent,{useTheme2:$,children:(0,e.jsx)("div",{className:"mobile-tool-board",children:(t=>{if(!t||!c)return;let o;switch(t){case"template":case"templateBlock":o=(0,e.jsx)(b,{data:c});break;case"widget":o=(0,e.jsx)(x,{data:c});break;case"manageWidgets":const t=j.current;o=t?(0,e.jsx)(t,{widgetId:c.widgetId}):null;break;case"buttonQuickStyle":const i=y.current;o=i?(0,e.jsx)(i,{widgetId:c.widgetId}):null;break;case"textExpression":o=(0,e.jsx)(k,{widgetId:c.widgetId,useDataSources:c.useDataSources,editor:c.editor,formats:c.formats,selection:c.selection});break;case"dividerQuickStyle":const s=w.current;o=s?(0,e.jsx)(s,{widgetId:c.widgetId}):null;break;case"navigatorQuickStyle":const r=S.current;o=r?(0,e.jsx)(r,{widgetId:c.widgetId}):null;break;case"navigatorManageViews":const n=M.current;o=n?(0,e.jsx)(n,{widgetId:c.widgetId}):null;break;case"accordionQuickStyle":const a=P.current;o=a?(0,e.jsx)(a,{widgetId:c.widgetId}):null;break;case"loginQuickStyle":const l=D.current;o=l?(0,e.jsx)(l,{widgetId:c.widgetId}):null}return o})(null==c?void 0:c.type)})})]})})}const{useState:P,useEffect:D}=t.React;function z(){const[t,i]=P(null);return D(()=>{window._builderPubsub.subscribe(`to_builder.${o.ToBuilderMessage.ShowTextArcadePanel}`,(e,t)=>{i(t)})},[]),(0,e.jsx)(e.Fragment,{children:t&&(0,e.jsx)(M.RichArcadeContentBuilder,Object.assign({},t,{onModalClose:null==t?void 0:t.onModalClose}))})}o.LayoutServiceProvider.getInstance().registerService(t.LayoutType.RowLayout,new y.RowLayoutService),o.LayoutServiceProvider.getInstance().registerService(t.LayoutType.GridLayout,new y.GridLayoutService),o.LayoutServiceProvider.getInstance().registerService(t.LayoutType.FixedLayout,new y.FixedLayoutService),o.LayoutServiceProvider.getInstance().registerService(t.LayoutType.FlowLayout,new y.FlowLayoutService),o.LayoutServiceProvider.getInstance().registerService(t.LayoutType.ColumnLayout,new y.ColumnLayoutService);class T extends t.React.PureComponent{constructor(i){super(i),this.resizeIframe=()=>{const{viewportSize:e,pageMode:o,appMode:i,currentDialogId:s,isCookieBannerOpenByPrivacyPanel:r}=this.props;if(i!==t.AppMode.Design||s||r)return void(e.height>0?this.deviceRef.current.style.height=`${e.height}px`:this.deviceRef.current.style.height="100%");if(o!==t.PageMode.AutoScroll){return void(!(e.width>0)&&i===t.AppMode.Design&&(this.deviceRef.current.style.height="100%"))}const n=this.appIframe.contentWindow.document.documentElement.querySelector("div#app > div.page-renderer");if(n){const t=n.getBoundingClientRect(),o=Math.round(Math.max(t.height,e.height>0?e.height:768));this.deviceRef.current.style.height=`${o}px`,e.width>0?this.deviceRef.current.style.minHeight="100%":this.deviceRef.current.style.minHeight=null}},this.formatMessage=(e,t)=>this.props.intl.formatMessage({id:e,defaultMessage:a[e]},t),this.mobileToolsHandler=()=>{var o,i;const{theme2:s,intl:r,locale:n,appMode:a,pageMode:l,viewportSize:d}=this.props;if(a===t.AppMode.Run)return null;const c=l===t.PageMode.FitWindow;let u;return u=d.width>0?(null===(i=null===(o=this.deviceRef)||void 0===o?void 0:o.current)||void 0===i?void 0:i.classList.contains("center-origin"))?`calc(50% + ${d.width/2+10}px)`:`${d.width+10}px`:`calc(50% + ${this.contentRef.current.clientWidth/2+10}px)`,(0,e.jsx)("div",{css:t.css`
          position: absolute;
          top: 0;
          bottom: 0;
          left: ${u};
        `,className:"d-flex flex-column",children:(0,e.jsx)(j,{locale:n,intl:r,theme:s,isFullScreenPage:c})})},this.clearSelectionInApp=()=>{o.builderAppSync.publishChangeSelectionToApp(null)},this.showConfirmDeleteDsDialog=()=>{this.setState({shouldShowDeleteDsDialog:!0})},this.hideConfirmDeleteDsDialog=()=>{this.setState({shouldShowDeleteDsDialog:!1})},this.removeLayoutItem=e=>{this.resetConfirmDeleteContent();const i=(0,o.getAppConfigAction)();i.removeLayoutItem(e,!0,!0),i.exec(),window.isExpressBuilder||t.lodash.defer(()=>{const t=l.searchUtils.findParentLayoutInfo(e,i.appConfig,l.utils.getCurrentSizeMode());o.builderAppSync.publishChangeSelectionToApp(t)})},this.resetConfirmDeleteContent=()=>{this.hideConfirmDeleteDsDialog(),(0,t.getAppStore)().dispatch(o.builderActions.confirmDeleteContentChanged(null))},this.state={appUrl:null,isPortrait:!0,shouldShowDeleteDsDialog:!1},this.resizeRef=t.React.createRef(),this.deviceRef=t.React.createRef(),this.contentRef=t.React.createRef(),this.debounceResizeIframe=t.lodash.debounce(this.resizeIframe,200)}componentDidMount(){this.setAppUrl(),t.lodash.defer(()=>{this.resizeIframe()}),window._builderPubsub.subscribe(`to_builder.${o.ToBuilderMessage.ClassificationBannerReady}`,()=>{this.debounceResizeIframe()})}componentDidUpdate(e){this.setAppUrl();const{viewportSize:i,zoomScale:s,appMode:r}=this.props;if(this.viewportWidth===i.width&&Math.round(10*this.zoomScale)===Math.round(10*s)||(this.viewportWidth=i.width,this.zoomScale=s,this.applyZoomScale(this.props.zoomScale)),r!==e.appMode&&r===t.AppMode.Run&&this.contentRef.current&&(this.contentRef.current.scrollTop=0),!e.appConfig&&this.props.appConfig){o.AppResourceManager.getInstance().clearResources(this.props.currentAppId,this.props.appConfig)}this.debounceResizeIframe()}setAppUrl(){const e=t.urlUtils.getAppIdPageIdFromUrl().pageId;if(e&&"default"!==e)return;let i=`${window.jimuConfig.mountPath}experience/`;const s=this.props.queryObject;let r,n={draft:"true"};s.id?(r=s.id,r.startsWith("/")&&(r=r.substring(1)),r.endsWith("/")&&(r=r.substring(0,r.length-1)),window.jimuConfig.useStructuralUrl?i+=this.props.queryObject.id+"/":n.id=this.props.queryObject.id):s.app_config&&(r=s.app_config,n.config=s.app_config),n=Object.assign(n,s.without("id","config","views","theme")),i+="?"+t.queryString.stringify(n);const a=this.props.urlHashObject;if(i+="#"+t.queryString.stringify(a),this.state.appUrl!==i){if(this.props.currentAppId!==r){if(this.props.currentAppId&&this.props.appConfig){o.AppResourceManager.getInstance().clearResources(this.props.currentAppId,this.props.appConfig)}o.WidgetSettingManager.getInstance().destroyAllWidgetSettingClasses()}this.setState({appUrl:i})}this.props.currentAppId!==r&&this.props.dispatch(o.appStateActions.inAppAppStateChanged(null))}calAvailableWidth(){const e=this.contentRef.current.getBoundingClientRect();let t=parseFloat(i.styleUtils.remToPixel("3rem"));return isNaN(t)&&(t=48),e.width-t}applyZoomScale(e,o){const{viewportSize:i,browserSizeMode:s}=this.props,r=null!=o?o:this.calAvailableWidth();i.width>0?r<i.width?(this.deviceRef.current.classList.add("left-origin"),this.deviceRef.current.classList.remove("center-origin")):(this.deviceRef.current.classList.add("center-origin"),this.deviceRef.current.classList.remove("left-origin")):s!==t.BrowserSizeMode.Large||e<1?(this.deviceRef.current.classList.add("center-origin"),this.deviceRef.current.classList.remove("left-origin")):(this.deviceRef.current.classList.add("left-origin"),this.deviceRef.current.classList.remove("center-origin")),this.deviceRef.current.style.transform=`scale(${e})`}getButtonGroupStyle(){return t.css`
      position: absolute !important;
      right: 20px;
      top: 15px;
      box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.2);
      button {
        background: white !important;
        border: none !important;
      }

      button:focus {
        box-shadow: none !important;
      }

      button.active {
        background: #00a6b6 !important;
      }
    `}syncLayoutHandler(){var o,i;const{appConfig:s,appMode:r,currentPageId:a,browserSizeMode:l,currentDialogId:d,isRTL:c,isCookieBannerOpenByPrivacyPanel:u}=this.props;if(!s||r!==t.AppMode.Design)return null;const p=s.mainSizeMode;if(l===p)return null;if(u)return null;const g=null===(o=s.pages)||void 0===o?void 0:o[a],h=null===(i=s.dialogs)||void 0===i?void 0:i[d],m=s.header&&g.header&&(s.header.height[l]||s.header.height[p])||0,f=c?{left:"calc( 100% + 12px )"}:{right:"calc( 100% + 12px )"},v=Object.assign({top:"calc( 50% - 30px)",position:"fixed"},f);return(0,e.jsxs)("div",{css:t.css`
          position: absolute;
          top: 0;
          bottom: 0;
          right: calc(100% + 12px);
        `,className:"d-flex flex-column sync-layout-handler",children:[g.header&&!d&&(0,e.jsx)(n,{isAuto:!s.header.layout[l],formatMessage:this.formatMessage,theme:this.props.theme,pageId:a,browserSizeMode:l,mainSizeMode:s.mainSizeMode,isHeader:!0}),!d&&(0,e.jsx)(n,{isAuto:!g.layout[l],formatMessage:this.formatMessage,theme:this.props.theme,browserSizeMode:l,mainSizeMode:s.mainSizeMode,pageId:a,style:{marginTop:`${Math.max(+m-60,20)}px`,top:20}}),g.footer&&!d&&(0,e.jsx)(n,{isAuto:!s.footer.layout[l],formatMessage:this.formatMessage,theme:this.props.theme,browserSizeMode:l,mainSizeMode:s.mainSizeMode,pageId:a,isFooter:!0,style:{bottom:30}}),d&&(0,e.jsx)(n,{isAuto:!h.layout[l],formatMessage:this.formatMessage,theme:this.props.theme,browserSizeMode:l,mainSizeMode:s.mainSizeMode,dialogId:d,isDialog:!0,style:v})]})}render(){var o;const{appConfig:s,theme:n,appMode:a,pageMode:l,viewportSize:d,systemError:c,browserSizeMode:u}=this.props,p=!(d.width>0),g=l===t.PageMode.FitWindow,h=this.getScaledViewportSize(),f=null!==(o=null==d?void 0:d.height)&&void 0!==o?o:0,y=s||(null==c?void 0:c.code)===t.SystemErrorCode.AppNotExisted||(null==c?void 0:c.code)===t.SystemErrorCode.AppNotPublished;return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)("div",{css:r(g,f,n),onClick:this.clearSelectionInApp,className:"jimu-widget widget-builder-app-loader",children:[!y&&t.ReactDOM.createPortal((0,e.jsx)(i.Loading,{type:i.LoadingType.Primary}),document.body),(0,e.jsx)("div",{className:"content-section",ref:this.contentRef,children:(0,e.jsx)("div",{className:(0,t.classNames)("content",{"d-flex":p}),style:{minHeight:g&&!p?h.height+100:"100%",minWidth:"100%",width:p?"100%":`calc(${h.width}px + 3rem)`,height:g&&p||a!==t.AppMode.Design?"100%":"auto"},children:(0,e.jsx)("div",{ref:this.resizeRef,className:(0,t.classNames)("body-section d-flex flex-column justify-content-start"),children:(0,e.jsxs)("div",{ref:this.deviceRef,className:(0,t.classNames)("device-frame shadow d-flex flex-grow-1",{invisible:!y}),style:Object.assign(Object.assign({},this.getDeviceSize()),{overflow:"visible"}),children:[(0,e.jsx)("iframe",{allowFullScreen:!0,name:t.APP_FRAME_NAME_IN_BUILDER,src:this.state.appUrl,className:"config-preview",title:this.formatMessage("canvasTitle"),ref:e=>{this.appIframe=e}}),this.syncLayoutHandler(),u===t.BrowserSizeMode.Small&&this.mobileToolsHandler()]})})})}),(0,e.jsx)(m,{formatMessage:this.formatMessage,onConfirmDelete:this.showConfirmDeleteDsDialog,onCancelDelete:this.resetConfirmDeleteContent}),this.state.shouldShowDeleteDsDialog&&(0,e.jsx)(v,{onConfirmDelete:this.removeLayoutItem,onCancelDelete:this.resetConfirmDeleteContent})]}),(0,e.jsx)(z,{})]})}getDeviceSize(){const{pageMode:e,viewportSize:o,appMode:i,currentDialogId:s,isCookieBannerOpenByPrivacyPanel:r}=this.props;return o.width>0?e===t.PageMode.FitWindow||i!==t.AppMode.Design||e===t.PageMode.AutoScroll&&s||e===t.PageMode.AutoScroll&&r?o:{width:o.width}:{width:"100%",height:"100%",minWidth:1024}}getScaledViewportSize(){const{viewportSize:e,zoomScale:t}=this.props;return e.width>0?{width:e.width*t,height:e.height*t}:{}}}T.mapExtraStateProps=(e,o)=>{var i,s,r,n,a,l,d,c,u,p,g,h,m,f,v,y,w,S,b,x,C,M,I,L;const A=null===(s=null===(i=e.appStateInBuilder)||void 0===i?void 0:i.appRuntimeInfo)||void 0===s?void 0:s.currentPageId,R=(null===(r=e.appStateInBuilder)||void 0===r?void 0:r.browserSizeMode)||t.BrowserSizeMode.Large;let k;A&&(k=null===(d=null===(l=null===(a=null===(n=e.appStateInBuilder)||void 0===n?void 0:n.appConfig)||void 0===a?void 0:a.pages)||void 0===l?void 0:l[A])||void 0===d?void 0:d.mode);const j=t.utils.findViewportSize(null===(c=e.appStateInBuilder)||void 0===c?void 0:c.appConfig,R);return{currentDialogId:null===(p=null===(u=e.appStateInBuilder)||void 0===u?void 0:u.appRuntimeInfo)||void 0===p?void 0:p.currentDialogId,isCookieBannerOpenByPrivacyPanel:null===(m=null===(h=null===(g=e.appStateInBuilder)||void 0===g?void 0:g.appRuntimeInfo)||void 0===h?void 0:h.cookieBanner)||void 0===m?void 0:m.isCookieBannerOpenByPrivacyPanel,currentPageId:A,pageMode:k,viewportSize:j,appConfig:null===(f=e.appStateInBuilder)||void 0===f?void 0:f.appConfig,systemError:null===(v=e.appStateInBuilder)||void 0===v?void 0:v.systemError,currentAppId:e.builder.currentAppId,activePagePart:null===(w=null===(y=e.appStateInBuilder)||void 0===y?void 0:y.appRuntimeInfo)||void 0===w?void 0:w.activePagePart,browserSizeMode:R,appMode:null===(b=null===(S=e.appStateInBuilder)||void 0===S?void 0:S.appRuntimeInfo)||void 0===b?void 0:b.appMode,zoomScale:null!==(M=null===(C=null===(x=e.appStateInBuilder)||void 0===x?void 0:x.appRuntimeInfo)||void 0===C?void 0:C.zoomScale)&&void 0!==M?M:1,widgetsRuntimeInfo:null===(I=e.appStateInBuilder)||void 0===I?void 0:I.widgetsRuntimeInfo,isRTL:null===(L=e.appContext)||void 0===L?void 0:L.isRTL,queryObject:e.queryObject,urlHashObject:e.urlHashObject,locale:e.appContext.locale,defaultLocale:e.appContext.locale}};const B=T;function O(e){g.p=e}})(),h})())}}});