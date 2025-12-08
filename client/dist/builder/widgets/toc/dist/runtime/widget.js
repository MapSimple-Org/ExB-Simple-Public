System.register(["jimu-core","jimu-core/dnd","jimu-core/emotion","jimu-for-builder","jimu-layouts/layout-runtime","jimu-theme","jimu-ui","jimu-ui/advanced/resource-selector","jimu-ui/advanced/setting-components"],function(e,t){var i={},o={},s={},n={},a={},r={},l={},d={},c={};return{setters:[function(e){i.APP_FRAME_NAME_IN_BUILDER=e.APP_FRAME_NAME_IN_BUILDER,i.AppMode=e.AppMode,i.ContainerType=e.ContainerType,i.DialogMode=e.DialogMode,i.GridItemType=e.GridItemType,i.Immutable=e.Immutable,i.LayoutItemType=e.LayoutItemType,i.LayoutType=e.LayoutType,i.LinkType=e.LinkType,i.OpenTypes=e.OpenTypes,i.PageMode=e.PageMode,i.PagePart=e.PagePart,i.PageType=e.PageType,i.React=e.React,i.ReactDOM=e.ReactDOM,i.ReactRedux=e.ReactRedux,i.appActions=e.appActions,i.appConfigUtils=e.appConfigUtils,i.classNames=e.classNames,i.css=e.css,i.defaultMessages=e.defaultMessages,i.focusElementInKeyboardMode=e.focusElementInKeyboardMode,i.getAppStore=e.getAppStore,i.isKeyboardMode=e.isKeyboardMode,i.lodash=e.lodash,i.polished=e.polished,i.urlUtils=e.urlUtils},function(e){o.interact=e.interact},function(e){s.Fragment=e.Fragment,s.jsx=e.jsx,s.jsxs=e.jsxs},function(e){n.LayoutServiceProvider=e.LayoutServiceProvider,n.appConfigUtils=e.appConfigUtils,n.builderAppSync=e.builderAppSync,n.getAppConfigAction=e.getAppConfigAction,n.utils=e.utils},function(e){a.defaultMessages=e.defaultMessages,a.searchUtils=e.searchUtils},function(e){r.withTheme=e.withTheme},function(e){l.Alert=e.Alert,l.Button=e.Button,l.Collapse=e.Collapse,l.Dropdown=e.Dropdown,l.DropdownButton=e.DropdownButton,l.DropdownItem=e.DropdownItem,l.DropdownMenu=e.DropdownMenu,l.Icon=e.Icon,l.Label=e.Label,l.ListGroupItem=e.ListGroupItem,l.LoadingType=e.LoadingType,l.Modal=e.Modal,l.ModalBody=e.ModalBody,l.ModalFooter=e.ModalFooter,l.ModalHeader=e.ModalHeader,l.Tab=e.Tab,l.Tabs=e.Tabs,l.TextInput=e.TextInput,l.Tooltip=e.Tooltip,l.defaultMessages=e.defaultMessages},function(e){d.IconPicker=e.IconPicker},function(e){c.LinkSelectorSidePopper=e.LinkSelectorSidePopper,c.PageTemplatePopper=e.PageTemplatePopper,c.WindowTemplatePopper=e.WindowTemplatePopper,c.changeCurrentDialog=e.changeCurrentDialog,c.changeCurrentPage=e.changeCurrentPage,c.handelDialogInfos=e.handelDialogInfos}],execute:function(){e((()=>{var e={170:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0m-1.27 4.936a6.5 6.5 0 1 1 .707-.707l4.136 4.137a.5.5 0 1 1-.707.707z" clip-rule="evenodd"></path></svg>'},655:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M2.146 4.653a.485.485 0 0 1 .708 0L8 10.24l5.146-5.587a.485.485 0 0 1 .708 0 .54.54 0 0 1 0 .738l-5.5 5.956a.485.485 0 0 1-.708 0l-5.5-5.956a.54.54 0 0 1 0-.738" clip-rule="evenodd"></path></svg>'},1496:e=>{"use strict";e.exports=a},1888:e=>{"use strict";e.exports=r},2943:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M4.653 13.854a.485.485 0 0 1 0-.708L10.24 8 4.653 2.854a.485.485 0 0 1 0-.708.54.54 0 0 1 .738 0l5.956 5.5a.485.485 0 0 1 0 .708l-5.956 5.5a.54.54 0 0 1-.738 0" clip-rule="evenodd"></path></svg>'},3529:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M8 12c-2.667 0-5.667-1.333-7-4 1.333-2.667 4.333-4 7-4s5.667 1.333 7 4c-1.333 2.667-4.333 4-7 4m0-7c-2.618 0-4.578.967-6 3 1.422 2.033 3.382 3 6 3s4.578-.967 6-3c-1.422-2.033-3.382-3-6-3m0 5.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0-1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" clip-rule="evenodd"></path></svg>'},3600:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M8 2c3.314 0 6 2.574 6 5.75s-2.686 5.75-6 5.75c-.78 0-1.524-.142-2.207-.402Q5.2 12.873 2 14l.198-.52q.879-2.379.549-2.95A5.54 5.54 0 0 1 2 7.75C2 4.574 4.686 2 8 2m0 1C5.23 3 3 5.136 3 7.75c0 .809.212 1.587.613 2.28.282.49.294 1.153.068 2.09l-.08.304.155-.044c1.092-.306 1.81-.391 2.297-.248l.094.031A5.2 5.2 0 0 0 8 12.5c2.77 0 5-2.136 5-4.75S10.77 3 8 3M6 5H5v5h1V8h2v2h1V5H8v2H6zm4 2h1v3h-1zm1-2h-1v1h1z" clip-rule="evenodd"></path></svg>'},3662:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M7.5 0a.5.5 0 0 0-.5.5V7H.5a.5.5 0 0 0 0 1H7v6.5a.5.5 0 0 0 1 0V8h6.5a.5.5 0 0 0 0-1H8V.5a.5.5 0 0 0-.5-.5"></path></svg>'},3839:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgOCA4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzU5NjZfNjY5KSI+DQo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMuNDcwNzkgNi4yODMwNEwwLjE2MTIzMyAyLjkyODk4Qy0wLjA1Mzc0NDQgMi43MTY0NiAtMC4wNTM3NDQ0IDIuMzcxOTEgMC4xNjEyMzMgMi4xNTkzOUMwLjM3NjIxMSAxLjk0Njg3IDAuNzI0NzU4IDEuOTQ2ODcgMC45Mzk3MzUgMi4xNTkzOUw0IDUuMjY3TDcuMDYwMjYgMi4xNTkzOUM3LjI3NTI0IDEuOTQ2ODcgNy42MjM3OSAxLjk0Njg3IDcuODM4NzcgMi4xNTkzOUM4LjA1Mzc0IDIuMzcxOTEgOC4wNTM3NCAyLjcxNjQ2IDcuODM4NzcgMi45Mjg5OEw0LjUyOTIxIDYuMjgzMDRDNC4yMzY1OCA2LjU3MjMyIDMuNzYzNDIgNi41NzIzMiAzLjQ3MDc5IDYuMjgzMDRaIiBmaWxsPSIjQzVDNUM1Ii8+DQo8L2c+DQo8ZGVmcz4NCjxjbGlwUGF0aCBpZD0iY2xpcDBfNTk2Nl82NjkiPg0KPHJlY3Qgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0id2hpdGUiLz4NCjwvY2xpcFBhdGg+DQo8L2RlZnM+DQo8L3N2Zz4NCg=="},4064:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M13.854 11.347a.486.486 0 0 1-.708 0L8 5.76l-5.146 5.587a.485.485 0 0 1-.708 0 .54.54 0 0 1 0-.738l5.5-5.956a.485.485 0 0 1 .708 0l5.5 5.956a.54.54 0 0 1 0 .738" clip-rule="evenodd"></path></svg>'},4108:e=>{"use strict";e.exports=n},4109:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M3.154 3.154a.527.527 0 0 1 .746 0l1.317 1.317A8.6 8.6 0 0 1 8 4c2.667 0 5.667 1.333 7 4-.696 1.393-1.847 2.422-3.168 3.087l1.014 1.013a.527.527 0 1 1-.746.746l-1.317-1.317A8.6 8.6 0 0 1 8 12c-2.667 0-5.667-1.333-7-4 .696-1.393 1.847-2.422 3.168-3.087L3.154 3.9a.527.527 0 0 1 0-.746m1.698 2.443C3.726 6.087 2.782 6.882 2 8c1.422 2.033 3.382 3 6 3a8.7 8.7 0 0 0 2.03-.225l-.675-.674A2.5 2.5 0 0 1 5.9 6.644zm6.296 4.805C12.275 9.913 13.218 9.119 14 8c-1.422-2.033-3.382-3-6-3q-1.088 0-2.03.225l.675.674a2.5 2.5 0 0 1 3.457 3.456zM6.5 8c0-.221.048-.431.134-.62l1.987 1.986A1.5 1.5 0 0 1 6.5 8m.88-1.366 1.986 1.987a1.5 1.5 0 0 0-1.987-1.987" clip-rule="evenodd"></path></svg>'},4321:e=>{"use strict";e.exports=l},4651:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M2 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2m5 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0m6 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0" clip-rule="evenodd"></path></svg>'},5809:e=>{"use strict";e.exports=d},5886:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 12"><path fill="#000" fill-rule="evenodd" d="M10.167 0H1.833A.845.845 0 0 0 1 .857v10.286c0 .473.373.857.833.857h8.334c.46 0 .833-.384.833-.857V.857A.845.845 0 0 0 10.167 0M2 11V1h8v10zm1.6-8h4.8c.331 0 .6.224.6.5s-.269.5-.6.5H3.6c-.331 0-.6-.224-.6-.5s.269-.5.6-.5m4.8 3H3.6c-.331 0-.6.224-.6.5s.269.5.6.5h4.8c.331 0 .6-.224.6-.5S8.731 6 8.4 6" clip-rule="evenodd"></path></svg>'},6245:e=>{"use strict";e.exports=o},6572:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M15.29 6.208 8 1 .71 6.208a.5.5 0 1 0 .58.813L2 6.515V15h12V6.514l.71.507a.5.5 0 0 0 .58-.813M13 5.8 8 2.229 3 5.8V14h3v-4h4v4h3zM9 14H7v-3h2z" clip-rule="evenodd"></path></svg>'},7386:e=>{"use strict";e.exports=s},8116:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M.5 6a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1z" clip-rule="evenodd"></path></svg>'},8893:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 12"><path fill="#000" d="M4.147 2.147a.5.5 0 0 1 .629-.065l.078.065 3.5 3.5a.5.5 0 0 1 0 .707l-3.5 3.5a.5.5 0 1 1-.707-.707L7.293 6 4.147 2.854l-.065-.078a.5.5 0 0 1 .065-.63"></path></svg>'},9244:e=>{"use strict";e.exports=i},9298:e=>{"use strict";e.exports=c}},t={};function p(i){var o=t[i];if(void 0!==o)return o.exports;var s=t[i]={exports:{}};return e[i](s,s.exports,p),s.exports}p.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return p.d(t,{a:t}),t},p.d=(e,t)=>{for(var i in t)p.o(t,i)&&!p.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},p.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),p.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},p.p="";var h={};return p.p=window.jimuConfig.baseUrl,(()=>{"use strict";p.r(h),p.d(h,{__set_webpack_public_path__:()=>ot,default:()=>it});var e=p(7386),t=p(9244),i=p(4108),o=p(4321),s=p(1496),n=p(9298),a=p(6245);const r={tocChooseTemplate:"Select a page template",newPage:"New page",addPage:"Add page",addingPage:"Adding page",addLink:"Add link",addFolder:"Add folder",addLinkOrFolder:"Add links or folders",addDialog:"Add window",addingDialog:"Adding window",openedWithPages:"Opened with {pages}.",hideFromMenu:"Hide from menu",showFromMenu:"Show in menu",outline:"Outline",removePageTip:"There is(are) {subCount} subpage(s) in {label}, do you really want to remove it?",fullScreenApp:"Fullscreen app",fullScreenAppTip:"Best for creating a web app that takes the full area of the browser window.",scrollingPage:"Scrolling page",scrollingPageTip:"Best for creating a web page that scrolls in the browser window.",fixedModalWindow:"Fixed blocker",fixedNonModalWindow:"Fixed passthrough",anchoredWindow:"Anchored"},l="-toc-";class d extends t.React.Component{constructor(e){super(e),this.formatMessage=e=>this.props.intl.formatMessage({id:e,defaultMessage:r[e]}),this.handleArrowClick=e=>{const{onArrowClick:t,itemJson:i}=this.props;t&&t(i),e.stopPropagation()},this.handleClick=e=>{const{itemJson:t,editable:i}=this.props;t.allowEditable&&i&&e.stopPropagation()},this.handleRowOrColumnInGrid=(e,o,n)=>{const{itemJson:a}=this.props,r=s.searchUtils.findLayoutItem((0,i.getAppConfigAction)().appConfig,{layoutId:e,layoutItemId:o});if("layoutItem"===a.type&&r&&r.gridType!==t.GridItemType.Tab){const i=document.querySelector(`iframe[name="${t.APP_FRAME_NAME_IN_BUILDER}"]`),s=((null==i?void 0:i.contentDocument)||(null==i?void 0:i.contentWindow.document)).querySelector(`div.grid-layout[data-layoutid="${e}"]`).querySelector(`div[data-layoutid="${e}"][data-layoutitemid="${o}"]`);return n?s.classList.add("menu-active"):s.classList.remove("menu-active"),!0}return!1},this.handleMouseEnter=e=>{e.stopPropagation();const{itemJson:t}=this.props,o=t.id.split(l);o[0]&&o[1]&&(this.handleRowOrColumnInGrid(o[0],o[1],!0)||i.builderAppSync.publishTocHoverInfoToApp({layoutId:o[0],layoutItemId:o[1]},!0))},this.handleMouseLeave=e=>{e.stopPropagation();const{itemJson:t}=this.props,o=t.id.split(l);o[0]&&o[1]&&(this.handleRowOrColumnInGrid(o[0],o[1],!1)||i.builderAppSync.publishTocHoverInfoToApp({layoutId:o[0],layoutItemId:o[1]},!1))},this.handleDoubleClickItem=e=>{const{itemJson:t,onDoubleClick:i}=this.props;i&&i(t,e),e.stopPropagation()},this.renameItemClick=e=>{e&&e.stopPropagation(),this.editor&&t.lodash.defer(()=>{(0,t.focusElementInKeyboardMode)(this.editor,!0),this.editor.select()})},this._checkLabel=(e,t,o)=>{if("view"===e&&o.includes(","))return{valid:!1,msg:this.formatMessage("noCommaInLabel")};const s=(0,i.getAppConfigAction)().appConfig;return i.appConfigUtils.isLabelDuplicated(s,e,t,o)?{valid:!1,msg:this.formatMessage("duplicatedLabel")}:{valid:!0}},this.onRenameAccept=e=>{t.lodash.defer(()=>{var t,i;null===(i=(t=this.props).renameItem)||void 0===i||i.call(t,this.props.itemJson,e)})},this.editor=null}componentDidMount(){const{editable:e}=this.props;e&&this.renameItemClick()}componentDidUpdate(e){const{itemJson:t,editable:i}=this.props;t.label!==e.itemJson.label?this.setState({currentLabel:t.label}):t.icon!==e.itemJson.icon&&this.setState({currentIcon:t.icon}),t.allowEditable&&i!==e.editable&&i&&this.renameItemClick()}}var c=p(2943),g=p.n(c),u=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const m=i=>{const o=window.SVG,{className:s}=i,n=u(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:g()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var f=p(8893),v=p.n(f),b=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const y=i=>{const o=window.SVG,{className:s}=i,n=b(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:v()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};class x extends d{constructor(e){super(e),this.onDropHover=e=>{this.state.dropType!==e&&this.setState({dropType:e})},this.labelChanged=e=>{this.setState({currentLabel:e})},this.handleLabelBlur=(e,t)=>{var i,o;let s=""!==e.trim();s&&(s=this._checkLabel("page",t,e).valid),s||(e=this.props.itemJson.label,null===(o=(i=this.props).renameItem)||void 0===o||o.call(i,this.props.itemJson,e)),this.labelChanged(e)},this.handleLabelEnter=(e,t)=>{"Enter"===e.key&&""===this.state.currentLabel&&this.handleLabelBlur("",t)},this.getStyle=()=>{var e,i,o;const s=(0,t.getAppStore)().getState(),n=null===(e=null==s?void 0:s.appContext)||void 0===e?void 0:e.isRTL,{theme:a,editable:r,itemJson:l,isTocDragging:d}=this.props,{mustShowArrow:c,children:p,level:h,isActive:g,isExpand:u}=l,{isDragging:m,isHovering:f}=this.state;return t.css`
      min-height: ${30}px;
      width: auto;
      min-width: 100%;
      align-items: center;
      cursor: pointer;
      ${m?"z-index: 100;":""}

      &.drag-move-into {
        border: 1px solid ${a.sys.color.primary.dark};
      }

      .page-item-home-btn {
        display: ${l.showDefault&&(null===(i=null==l?void 0:l.data)||void 0===i?void 0:i.isDefault)&&!r?"inline-flex":"none"};
      }

      :hover {
        ${g||d?"":`background-color: ${a.ref.palette.neutral[500]};`}
        .dropDown {
          .btn {
            display: ${d||r?"none":"inline-flex"};
          }
          z-index: 2;
        }
        .page-item-visible-btn {
          display: ${d||r?"none":"inline-flex"};
          z-index: 2;
        }
        .page-item-home-btn {
          display: ${l.showDefault?d&&!(null===(o=null==l?void 0:l.data)||void 0===o?void 0:o.isDefault)||r?"none":"inline-flex":"none"};
          z-index: 2;
        }
      }

      &.active {
        ${d?"":`background-color: ${a.sys.color.primary.main};`}
        border: 0;
      }

      .toc-item-dropzone {
        touch-action: none;
        position: relative;

        .toc-item-drag:hover {
          cursor: pointer !important;
        }

        .toc-item-drag {
          pointer-events: ${f?"all":"none"};
          visibility: ${l.allowEditable&&r?"hidden":"visible"};
          z-index: 1;
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          background-color: ${m?t.polished.rgba(a.ref.palette.neutral[500],.6):"transparent"};
          box-shadow: ${m?a.sys.shadow.shadow3:"none"};
        }

        .toc-item {
          padding: 0;
          border: 0;
          position: relative;
          .toc-item-content {
            margin-left: ${10*h}px;
            position: relative;
            .toc-arrow {
              z-index: 2;
              padding-right: ${t.polished.rem(1)};
              visibility: ${c||p&&p.length>0?"visible":"hidden"};
              .toc-arrow-icon {
                fill: ${a.ref.palette.black};
                transform-origin: center;
                transform: ${`rotate(${u?90:n?180:0}deg)`};
              }
            }

            .left-and-right {
              overflow-x: hidden;
              margin-left: -5px;
              .left-content {
                align-items: center;
                overflow-x: hidden;
                flex: auto;
                .editor {
                  overflow: hidden;
                  text-overflow: ${r?"clip":"ellipsis"};
                  white-space: nowrap;
                  font-size: ${.875}rem;
                  user-select: none;
                  flex: auto;
                  text-align: start;
                }
                [contenteditable="true"] {
                  user-select: text;
                  -webkit-user-select: text;
                  background-color: ${a.ref.palette.white};
                }
                .header-icon {
                  margin-right: 0.3rem;
                  flex: none;
                }
              }
            }
          }

          &.toc-drag-move-last {
            :after{
              content: '';
              position: absolute;
              left: 0;
              top: auto;
              bottom: 0;
              right: auto;
              height: 2px;
              width: 100%;
              background-color: ${a.sys.color.primary.dark};
            }
          }

          &.toc-drag-move-first {
            :before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: auto;
              right: auto;
              height: 2px;
              width: 100%;
              background-color: ${a.sys.color.primary.dark};
            }
          }

          .drag-move-out-order-bottom {
            :after{
              content: '';
              position: absolute;
              left: 0;
              top: auto;
              bottom: 0;
              right: auto;
              height: 2px;
              width: 100%;
              background-color: ${a.sys.color.primary.dark};
            }
          }

          .drag-move-out-order-top {
            :before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: auto;
              right: auto;
              height: 2px;
              width: 100%;
              background-color: ${a.sys.color.primary.dark};
            }
          }
        }
      }
    `},this.state={dropType:"none",isDragging:!1,isHovering:!1,currentLabel:this.props.itemJson.label},this.dropZoneRef=t.React.createRef(),this.dragRef=t.React.createRef()}componentWillUnmount(){this.dragInteractable&&(this.dragInteractable.unset(),this.dragInteractable=null),this.dropZoneInteractable&&(this.dropZoneInteractable.unset(),this.dropZoneInteractable=null)}componentDidMount(){super.componentDidMount();const{canDnd:e,canDragFunc:t,canDropFunc:i,onDidDrop:o,canOrderFunc:s,canDropIntoFunc:n,itemJson:r}=this.props,{index:l}=r;if(e&&this.dropZoneRef.current&&this.dragRef.current){let e=null;this.dropZoneInteractable=(0,a.interact)(this.dropZoneRef.current).dropzone({accept:".toc-item-drag",overlap:"pointer",ondropmove:e=>{const t=e.relatedTarget,o=e.target,a=JSON.parse(t.getAttribute("data-itemJson"));if(!i||!i(r.data,a.data))return;const d=o.getBoundingClientRect(),c=d.bottom-d.top,p=2*c/3,h=1*c/3,g=c/2,u=e.dragEvent.client.y-d.top;let m=this.state.dropType;m=s&&s(a.data,r.data)?n&&n(a.data,r.data)?u>p?"bottom":u<h?"top":"moveInto":0===l?u>g?"bottom":"top":"bottom":n&&n(a.data,r.data)?"moveInto":"none",this.onDropHover(m)},ondragleave:e=>{this.onDropHover("none")},ondropactivate:e=>{this.dragRef.current.setAttribute("data-itemJson",JSON.stringify(r))},ondrop:e=>{const t=this.state.dropType;if("none"===t)return;const i=e.relatedTarget,s=JSON.parse(i.getAttribute("data-itemJson"));o&&o(s,r,t),this.onDropHover("none")}}),t&&t(r.data)&&(this.dragInteractable=(0,a.interact)(this.dragRef.current).draggable({inertia:!1,modifiers:[],autoScroll:!0,onstart:e=>{this.setState({isDragging:!0});const{onTocDragStatusChange:t}=this.props;t&&t(!0)},onmove:t=>{const{clientX:i,clientY:o,clientX0:s,clientY0:n,target:a}=t,r=parseFloat(a.getAttribute("start-x"))||0,l=parseFloat(a.getAttribute("start-y"))||0;let d=i-s+r,c=o-n+l;const p=-a.clientWidth/2,h=a.clientWidth/2;d<p?d=p:d>h&&(d=h);const{parentBoundBottom:g,parentBoundTop:u}=this.props;if(g>-1&&u>-1){const e=u-n,t=g-n;c<=e?c=e:c>=t&&(c=t)}e&&cancelAnimationFrame(e),e=requestAnimationFrame(()=>{a.style.webkitTransform=a.style.transform="translate("+d+"px, "+c+"px)",e=null})},onend:t=>{const{target:i}=t;e&&cancelAnimationFrame(e),i.style.webkitTransform=i.style.transform="translate(0px, 0px)",this.setState({isDragging:!1});const{onTocDragStatusChange:o}=this.props;o&&o(!1)}}))}}componentDidUpdate(e){super.componentDidUpdate(e)}render(){const{itemJson:i,renderRightContent:s,editable:n,canDnd:a,theme:r,formatMessage:l,isFirstItem:d,isLastItem:c,tocDraggingStatus:p,isTocDragging:h}=this.props,{icon:g}=i,{dropType:u,isDragging:f}=this.state;let v;v=g&&g.svg?g:{svg:g};const b="moveInto"===u?"drag-move-into":"",x="drag-move-out-order-"+u;let I="";return h&&"on"!==p&&("bottom"===p&&c?I="toc-drag-move-last":"top"===p&&d&&(I="toc-drag-move-first")),(0,e.jsx)("div",{className:`d-flex ${i.isActive?"active":""}   ${b}`,css:this.getStyle(),onMouseEnter:e=>{this.setState({isHovering:!0})},onMouseLeave:e=>{this.setState({isHovering:!1})},children:(0,e.jsx)("div",{ref:this.dropZoneRef,className:"toc-item-dropzone h-100 w-100",children:(0,e.jsxs)("div",{className:"d-flex w-100 h-100",onDoubleClick:this.handleDoubleClickItem,onClick:this.handleClick,children:[(0,e.jsx)("div",{className:`d-flex justify-content-between w-100 toc-item ${I}`,children:(0,e.jsxs)("div",{className:`d-flex toc-item-content ${x} w-100`,children:[(0,e.jsx)(o.Button,{disableHoverEffect:!0,disableRipple:!0,className:"toc-arrow jimu-outline-inside pl-0 pr-0 mr-1",icon:!0,type:"tertiary",title:l(i.isExpand?"collapse":"expand"),"aria-label":l(i.isExpand?"collapse":"expand"),"aria-expanded":i.isExpand,onClick:this.handleArrowClick,onKeyUp:e=>{("Enter"===e.key||" "===e.key)&&this.handleArrowClick(e)},children:(0,e.jsx)(y,{className:"toc-arrow-icon",size:"s"})}),(0,e.jsxs)("div",{className:"left-and-right d-flex justify-content-between w-100",children:[(0,e.jsxs)("div",{className:"d-flex left-content "+(s?"pr-0":"pr-2"),children:[g&&(0,e.jsx)(o.Icon,{autoFlip:i.needFlip,className:"header-icon",color:r.ref.palette.neutral[1e3],size:12,icon:v.svg,"aria-hidden":"true"}),(0,e.jsx)("div",{className:"item-label editor",children:i.allowEditable&&n?(0,e.jsx)(o.TextInput,{size:"sm",ref:e=>{this.editor=e},value:this.state.currentLabel,onChange:e=>{this.labelChanged(e.target.value)},onAcceptValue:this.onRenameAccept,checkValidityOnChange:e=>this._checkLabel("page",i.id,e),checkValidityOnAccept:e=>this._checkLabel("page",i.id,e),onBlur:e=>{this.handleLabelBlur(e.target.value,i.id)},onPressEnter:e=>{this.handleLabelEnter(e,i.id)}}):(0,e.jsx)(t.React.Fragment,{children:this.state.currentLabel})})]}),s&&s(i)]})]})}),a&&(0,e.jsx)("div",{className:"toc-item-drag",ref:this.dragRef,title:this.state.currentLabel,children:f&&(0,e.jsx)("div",{className:"d-flex justify-content-between w-100 toc-item",children:(0,e.jsxs)("div",{className:"d-flex toc-item-content w-100",children:[(0,e.jsx)(o.Button,{icon:!0,type:"tertiary",className:"toc-arrow",children:(0,e.jsx)(m,{className:"toc-arrow-icon",size:"s"})}),(0,e.jsxs)("div",{className:"left-and-right d-flex justify-content-between w-100",children:[(0,e.jsxs)("div",{className:"d-flex left-content "+(s?"pr-0":"pr-2"),children:[g&&(0,e.jsx)(o.Icon,{className:"header-icon",size:12,icon:v.svg,"aria-hidden":"true"}),(0,e.jsx)("div",{title:this.state.currentLabel,className:"item-label editor",children:this.state.currentLabel})]}),s&&s(i)]})]})})})]})})})}}var I=p(4651),w=p.n(I),S=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const C=i=>{const o=window.SVG,{className:s}=i,n=S(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:w()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};class j extends t.React.PureComponent{constructor(e){super(e),this.onDropDownToggle=e=>{const{isOpen:i}=this.state;null==e||e.stopPropagation(),!this.dontDismiss&&this.setState({isOpen:!i}),this.dontDismiss=!1,i&&(0,t.isKeyboardMode)()&&(this.buttonRef.style.visibility="visible",this.buttonRef.style.display="block",setTimeout(()=>{this.buttonRef.style.display=null,this.buttonRef.style.visibility=null},300))},this.onItemClick=(e,t)=>{t.autoHide||void 0===t.autoHide?this.setState({isOpen:!1}):this.dontDismiss=!0,t.event(e)},this.getInteractiveNodeStyle=e=>"div"!==e?t.css``:t.css`
      padding : 0 !important;
      .set-icon-dropdown-item {
        padding: 0.25rem 0.5rem;
      }
    `,this.state={isOpen:!1}}render(){const{items:i,toggleContent:s,direction:n,disabled:a,title:r,icon:l,caret:d,insideOutline:c=!1,supportInsideNodesAccessible:p=!1,avoidNestedToggle:h,delayToggle:g}=this.props,u=this.props["aria-label"]||"",{isOpen:m}=this.state;return(0,e.jsx)("div",{className:"d-flex align-items-center",children:(0,e.jsxs)(o.Dropdown,{direction:n||"down",size:"sm",toggle:this.onDropDownToggle,isOpen:m,useKeyUpEvent:!0,supportInsideNodesAccessible:p,avoidNestedToggle:h,"aria-label":u,children:[(0,e.jsx)(o.DropdownButton,{ref:e=>{this.buttonRef=e},arrow:d,icon:l||void 0===l,disabled:a,size:"sm",type:"tertiary",title:r,className:(0,t.classNames)("item-inside-button",{"jimu-outline-inside":c}),children:s||(0,e.jsx)(C,{})}),(0,e.jsx)(o.DropdownMenu,{delayToggle:g,offsetOptions:8,children:i.map((i,s)=>{var n;const{tag:a="button"}=i;return(i.visible||void 0===i.visible)&&(i.isBtn?(0,e.jsx)(t.React.Fragment,{children:i.label},s):(0,e.jsx)(o.DropdownItem,{tag:a,a11yFocusBack:i.a11yFocusBack,title:null!==(n=i.title)&&void 0!==n?n:"",className:"no-user-select",css:this.getInteractiveNodeStyle(a),onClick:e=>{this.onItemClick(e,i)},divider:i.divider,children:i.label},s))})})]})})}}j.defaultProps={caret:!1};class D extends t.React.PureComponent{constructor(e){super(e),this.onItemClick=(e,t)=>{t.event(e)},this.state={}}render(){const{items:t,toggleContent:i,direction:s,disabled:n,title:a,icon:r,caret:l}=this.props;return(0,e.jsxs)(o.Dropdown,{direction:s||"right",useKeyUpEvent:!0,isSubMenuItem:!0,fluid:!0,openMode:"hover",children:[(0,e.jsx)(o.DropdownButton,{title:a,arrow:l,arrowRight:!0,icon:r||void 0===r,disabled:n,size:"sm",type:"tertiary",children:i||(0,e.jsx)(C,{})}),(0,e.jsx)(o.DropdownMenu,{children:t.map((t,i)=>{var s;const{settingPanel:n,settingPanelProps:a}=t,r=n;return r?(0,e.jsx)(r,Object.assign({},a),i):(t.visible||void 0===t.visible)&&(0,e.jsx)(o.DropdownItem,{title:null!==(s=t.title)&&void 0!==s?s:"",className:"no-user-select",onClick:e=>{this.onItemClick(e,t)},children:t.label},i)})})]})}}var P=p(1888);class T extends t.React.PureComponent{constructor(){super(...arguments),this.handleArrowClick=e=>{e.stopPropagation();const{handleExpand:t}=this.props;t&&t()},this.getStyle=()=>{const{theme:e,itemJson:i,level:o}=this.props,{mustShowArrow:s,children:n,isActive:a,isExpand:r}=i;return t.css`
      height: ${30}px;
      width: 100%;
      align-items: center;
      border: 0;
      cursor: pointer;

      &.active {
        background-color: ${e.sys.color.primary.light};
        border: 0;
      }

      :hover {
        ${a?"":`background-color: ${t.polished.rgba(e.ref.palette.neutral[500],.4)};`}
      }

      .tree-item-content {
        padding: 0;
        padding-left: ${30*o}px;
        border: 0;

        .tree-arrow {
          visibility: ${s||n&&n.length>0?"visible":"hidden"};
          height: 24px;
          padding-right: 5px;
          padding-left: 5px;
          width: auto;
          display: flex;
          align-self: center;
          align-items: center;
          justify-content: center;
          transform-origin: center;
          transform: ${`rotate(${r?90:0}deg)`};
          transition: transform .5s;
          .tree-arrow-icon {
            fill: ${e.ref.palette.black};
          }
        }

        .left-and-right {
          overflow-x: hidden;
          .left-content {
            align-items: center;
            overflow-x: hidden;
            flex: auto;
            .item-label{
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: ${.875}rem;
              text-align: start;
            }
            .header-icon {
              margin-right: 0.5rem;
              fill: ${e.ref.palette.black};
            }
          }
        }
      }
    `}}render(){const{itemJson:t,renderRightContent:i,renderHeaderContent:s,arrowIcon:n}=this.props,{icon:a,isActive:r}=t;return(0,e.jsx)("div",{className:`d-flex ${r?"active":""} tree-item-common`,css:this.getStyle(),children:(0,e.jsxs)("div",{className:"d-flex tree-item-content w-100",children:[(0,e.jsx)("div",{className:"tree-arrow",onClick:this.handleArrowClick,children:n?n(t):(0,e.jsx)(m,{className:"tree-arrow-icon",size:"s"})}),(0,e.jsxs)("div",{className:"left-and-right d-flex justify-content-between w-100",children:[s?s(t):(0,e.jsxs)("div",{className:"d-flex left-content "+(i?"pr-0":"pr-2"),children:[a&&(0,e.jsx)(o.Icon,{className:"header-icon",size:12,icon:a}),(0,e.jsx)("div",{title:t.label,className:"item-label",children:t.label})]}),i&&i(t)]})]})})}}class k extends t.React.PureComponent{constructor(e){super(e),this.handleClickItem=(e,t=!1)=>{this.setState({isKeyboardMode:t});const{onClickItem:i,itemJson:o}=this.props;i&&i(o,e)},this.shouldHandleKeyEvent=e=>"INPUT"!==e.target.tagName&&("Enter"===e.key||" "===e.key),this.handleKeydownItem=e=>{this.shouldHandleKeyEvent(e)?e.preventDefault():"Tab"===e.key&&this.setState({isKeyboardMode:!0})},this.handleKeyUpItem=e=>{this.shouldHandleKeyEvent(e)&&(e.preventDefault(),this.handleClickItem(e,!0))},this.getStyle=e=>this.state.isKeyboardMode?t.css`
        &.jimu-tree-item{
          padding: 0;
          margin: 0;
          border: 0;
          &:focus,
          &:focus-within {
            .item-inside-button {
              display: inline-flex;

              &.page-item-home-btn {
                display: ${e===t.PageType.Normal?"inline-flex":"none"}
              }
            }

            .item-action-button {
              display: block;
              .dropDown .btn {
                visibility: visible;
              }
            }
          }
        }
      `:t.css`
        &.jimu-tree-item{
          padding: 0;
          margin: 0;
          border: 0;
        }
      `,this.state={isFocus:!1,isKeyboardMode:!1}}render(){var i;const{itemJson:s,theme:n,level:a,handleExpand:r}=this.props,{renderItem:l,renderHeaderContent:d,renderRightContent:c,arrowIcon:p,className:h}=s;return(0,e.jsx)(o.ListGroupItem,{css:this.getStyle(null===(i=null==s?void 0:s.data)||void 0===i?void 0:i.type),role:"option",tabIndex:0,"aria-checked":s.isActive,"aria-label":s.label,onClick:this.handleClickItem,onKeyDown:this.handleKeydownItem,onKeyUp:this.handleKeyUpItem,className:(0,t.classNames)("jimu-tree-item","d-flex","jimu-outline-inside",h||""),children:(0,e.jsx)("div",{className:"w-100",ref:e=>{this.itemRef=e},children:l?l(s):(0,e.jsx)(T,{itemJson:s,level:a,renderHeaderContent:d,renderRightContent:c,arrowIcon:p,theme:n,handleExpand:r})})})}}class O extends t.React.PureComponent{constructor(t){var i;super(t),this.handleSingleClick=(e,t)=>{const{onClickItem:i}=this.props;i&&i(e,t)},this.handleExpand=()=>{const{handleExpand:e}=this.props;let{itemJson:t}=this.props;t=t.set("isExpand",!t.isExpand),e&&e(t)},this.renderSubItemsTimeout=void 0,this.SingleTreeItem=({itemJson:t,level:i})=>(0,e.jsx)(k,{itemJson:t,level:i,handleExpand:this.handleExpand,onClickItem:this.handleSingleClick,theme:this.props.theme},t.id),this.state={renderSubItems:null===(i=t.itemJson)||void 0===i?void 0:i.isExpand}}componentDidUpdate(e){const{itemJson:t}=this.props,{itemJson:i}=e;(null==t?void 0:t.isExpand)!==(null==i?void 0:i.isExpand)&&(this.renderSubItemsTimeout&&(clearTimeout(this.renderSubItemsTimeout),this.renderSubItemsTimeout=void 0),(null==t?void 0:t.isExpand)?this.setState({renderSubItems:!0}):this.renderSubItemsTimeout=setTimeout(()=>{this.setState({renderSubItems:!1})},1e3))}render(){const{itemJson:t,level:i}=this.props,{SingleTreeItem:s}=this,{renderSubItems:n}=this.state;return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)(s,{itemJson:t,level:i},t.id),t.children&&t.children.length>0&&(0,e.jsx)("div",{className:"out-container",children:(0,e.jsx)("div",{className:"in-container",children:(0,e.jsx)(o.Collapse,{isOpen:t.isExpand,role:"group",children:n&&this.props.children})})})]})}}const A=(e,t)=>t.label.toLocaleLowerCase().includes(e.toLocaleLowerCase()),M=(e,t,i)=>i(t,e)||e.children&&e.children.length&&!!e.children.find(e=>M(e,t,i)),N=(e,i,o=A)=>{if(o(i,e)||!e.children)return e;const s=e.children.filter(e=>M(e,i,o)).map(e=>N(e,i,o));return(0,t.Immutable)(Object.assign({},e,{children:s}))},R=(e,i,o=A)=>{let s=e.children;if(!s||0===s.length)return(0,t.Immutable)(Object.assign({},e,{isExpand:!1}));const n=s.filter(e=>M(e,i,o)),a=n.length>0;return a&&(s=n.map(e=>R(e,i,o))),(0,t.Immutable)(Object.assign({},e,{children:s,isExpand:a}))},E=(e,t)=>{const i=e.children;i&&i.length>0&&i.forEach((i,o)=>{e=e.setIn(["children",o],E(i,t))});const o=t.includes(e.id);return e.set("isExpand",o)},L=(e,t)=>{const i=e.children;i&&i.length>0&&i.forEach((i,o)=>{e=e.setIn(["children",o],L(i,t))});const o=t.includes(e.id);return e.set("isActive",o)},B=(e,t)=>{if(!e)return null;let i=null==e?void 0:e.children;i&&i.length>0&&i.forEach((i,o)=>{e=e.setIn(["children",o],B(i,t))}),i=null==e?void 0:e.children;const o=t.includes(null==e?void 0:e.id),s=(null==e?void 0:e.isExpand)||z(i);return e.set("isActive",o).set("isExpand",s)},J=e=>{if(!e)return[];const t=[],i=null==e?void 0:e.children;return i&&i.length>0&&i.forEach(e=>t.push(...J(e))),(null==e?void 0:e.isExpand)&&t.push(null==e?void 0:e.id),t},z=e=>!!e&&!!e.find(e=>e.isActive||z(e.children));class F extends t.React.PureComponent{constructor(t){super(t),this.handleSingleClick=(e,t)=>{const{onClickItem:i}=this.props;i&&i(e,t)},this.handleExpand=e=>{const{handleExpand:t}=this.props;t&&t(e)},this.renderItemJson=t=>(0,e.jsx)(O,{handleExpand:this.handleExpand,itemJson:t,onClickItem:this.handleSingleClick,theme:this.props.theme,children:t.children&&t.children.map(e=>this.renderItemJson(e))},t.id),this.state={itemJsons:t.itemJsons}}render(){const{itemJson:i,className:o,hideRoot:s,forwardRef:n}=this.props;return(0,e.jsx)("div",{className:(0,t.classNames)("jimu-tree",o),ref:n,role:"listbox",children:s?i&&i.children&&i.children.map(e=>this.renderItemJson(e)):this.renderItemJson(i)})}}const $=(0,P.withTheme)(F);class U extends t.React.PureComponent{constructor(e){super(e),this.handleCloseBtn=()=>{this.isActionClick=!1,this.setState({isOpen:!1});const{toggle:e,isOpen:t}=this.props;void 0!==t&&e&&e()},this.handleActionClick=()=>{this.isActionClick=!0,this.setState({isOpen:!1});const{toggle:e,isOpen:t}=this.props;void 0!==t&&e&&e()},this.handleToggle=()=>{const{isOpen:e,tapBlankClose:t}=this.props;if(!t)return;this.setState({isOpen:!e});const{toggle:i,isOpen:o}=this.props;void 0!==o&&i&&i()},this.onModalClosed=()=>{const{onClosed:e}=this.props;e&&e(this.isActionClick),this.isActionClick=!1},this.getStyle=()=>{const e=this.props.theme;return t.css`
      .modal-header {
        .close {
          color: ${e.ref.palette.neutral[1e3]};
          opacity: 1;
          transition: color .15s ease-in-out;
          &:not(:disabled):not(.disabled):hover,
          &:not(:disabled):not(.disabled):focus {
            opacity: 1;
          }
        }
      }
      .modal-body{
        overflow-y: auto;
        max-height: 360px;
      }
      .modal-content{
        width: auto;
      }
      .modal-footer{
        .btn {
          min-width: 80px;
          + .btn {
            margin-left: 10px;
          }
        }
      }
      &.modal-dialog{
        width: auto;
      }
      .choose-template-description{
        width: 100%;
        font-size: ${14/17}rem;
        user-select:none;
      }
    `},this.state={isOpen:!!e.isOpen}}componentDidUpdate(e){const{isOpen:t}=e;void 0!==t&&void 0===this.props.isOpen&&this.setState({isOpen:t})}render(){let{isOpen:t}=this.props;const{isRemove:i}=this.props;return t=void 0===t?this.state.isOpen:t,(0,e.jsxs)(o.Modal,{css:this.getStyle(),isOpen:t,onClosed:this.onModalClosed,toggle:this.handleToggle,centered:!0,children:[(0,e.jsx)(o.ModalHeader,{tag:"h4",toggle:this.handleCloseBtn,children:this.props.title}),(0,e.jsx)(o.ModalBody,{children:(0,e.jsx)("div",{style:{marginLeft:"10px"},children:this.props.children})}),(0,e.jsxs)(o.ModalFooter,{children:[(0,e.jsx)(o.Button,{type:i?"danger":"primary",onClick:this.handleActionClick,children:i?this.props.formatMessage("delete"):this.props.formatMessage("ok")}),(0,e.jsx)(o.Button,{onClick:this.handleCloseBtn,children:this.props.formatMessage("cancel")})]})]})}}var H=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const G=t.React.forwardRef((t,i)=>{const{onKeyDown:s,onClick:n}=t,a=H(t,["onKeyDown","onClick"]);return(0,e.jsx)(o.Button,Object.assign({ref:i},a,{onClick:n,onKeyDown:e=>{!n||"Enter"!==e.key&&" "!==e.key||e.preventDefault()},onKeyUp:e=>{!n||"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),n(e))}}))});var W=p(5809),V=p(6572),Z=p.n(V),K=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const _=i=>{const o=window.SVG,{className:s}=i,n=K(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Z()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var q=p(3529),Y=p.n(q),Q=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const X=i=>{const o=window.SVG,{className:s}=i,n=Q(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Y()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var ee=p(4109),te=p.n(ee),ie=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const oe=i=>{const o=window.SVG,{className:s}=i,n=ie(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:te()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var se=p(3662),ne=p.n(se),ae=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const re=i=>{const o=window.SVG,{className:s}=i,n=ae(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:ne()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))},le={value:"",openType:t.OpenTypes.NewWindow,linkType:t.LinkType.WebAddress};let de;const ce=[{name:"offset",options:{offset:[0,10]}}];class pe extends t.React.PureComponent{constructor(s){super(s),this.linkSettingTrigger=t.React.createRef(),this.warningRef=t.React.createRef(),this.getTotalLines=()=>{const{itemJson:e}=this.state;let t=0;return e.children&&e.children.forEach(e=>{var i,o;t++,e.isExpand&&(t+=null!==(o=null===(i=e.children)||void 0===i?void 0:i.length)&&void 0!==o?o:0)}),t},this.getTreeContentHeight=()=>30*this.getTotalLines(),this.handleOnTocDragStatusChange=e=>{this.setState({isTocDragging:e,itemJson:this.getItemJsonByPages()})},this.handleOnTocDraggingStatusChange=e=>{this.setState({tocDraggingStatus:e,itemJson:this.getItemJsonByPages()})},this.handleChooseTemplate=e=>{this.setState({isTemplatePopoverOpen:!1}),this.props.addPageWithType("page",e)},this.handleToggleTemplatePopover=()=>{const{isTemplatePopoverOpen:e}=this.state;this.setState({isTemplatePopoverOpen:!e})},this.closeTemplatePopover=()=>{this.state.isTemplatePopoverOpen&&((0,t.focusElementInKeyboardMode)(this.templateBtn),this.setState({isTemplatePopoverOpen:!1}))},this.handleRemovePage=e=>{(0,i.getAppConfigAction)().appConfig.pageStructure.find(t=>t[e.id]&&t[e.id].length>0)?(this.setState({willRemovePage:e}),this.handleToggleRemovePopover()):(de===e.id&&this.setState({isShowLinkSetting:!1}),this.props.removePage(e.id))},this.handleToggleRemovePopover=()=>{const{isRemovePopoverOpen:e}=this.state;this.setState({isRemovePopoverOpen:!e})},this.singleAndDoubleClickTimeout=void 0,this.handleClickItem=e=>{e.data.type!==t.PageType.Folder&&e.data.type!==t.PageType.Link&&(this.singleAndDoubleClickTimeout&&(clearTimeout(this.singleAndDoubleClickTimeout),this.singleAndDoubleClickTimeout=void 0),this.singleAndDoubleClickTimeout=setTimeout(()=>{this.setState({currentSelectedItemId:e.id,itemJson:B(this.state.itemJson,[e.id])},()=>{this.props.onClickPage(e.data.id)})},200))},this.handleOnTocDoubleClick=(e,t)=>{this.singleAndDoubleClickTimeout&&(clearTimeout(this.singleAndDoubleClickTimeout),this.singleAndDoubleClickTimeout=void 0),this.props.changeEditablePageItemId(e.id),t.stopPropagation()},this.handleOnSetLinkClick=(e,t)=>{de&&e.data.id===de&&this.state.isShowLinkSetting||(de=e.data.id,this.resetLinkParam(de),this.state.isShowLinkSetting?this.setState({isShowLinkSetting:!1},()=>{this.setState({isShowLinkSetting:!0})}):this.setState({isShowLinkSetting:!0}),t.stopPropagation())},this.handleExpand=e=>{if((!e.children||e.children.length<1)&&!e.mustShowArrow)return;const{expandIds:t}=this;e.isExpand?t.includes(e.id)&&t.splice(t.indexOf(e.id),1):t.includes(e.id)||t.push(e.id),this.setState({itemJson:E(this.state.itemJson,t)})},this.handleArrowClick=e=>{this.handleExpand(e)},this.handleSearchTextChange=e=>{this.setState({filterText:e},()=>{this.setState({itemJson:this.getItemJsonByPages()})})},this.handleSearchSubmit=e=>{this.setState({filterText:e},()=>{this.setState({itemJson:this.getItemJsonByPages()})})},this.handleSearchBtnClick=e=>{e.stopPropagation();const{showSearch:t}=this.state;t?this.handleSearchTextChange(""):this.searchInput&&(this.searchInput.focus(),this.searchInput.select()),this.setState({showSearch:!t})},this.handleSettingLinkConfirm=e=>{this.setState({isShowLinkSetting:!1}),this.changeUrl(e.value,e.openType)},this.changeUrl=(e,t)=>{const{pages:o}=this.props,s=o[de];(0,i.getAppConfigAction)().editPageProperty(s.id,"linkUrl",e||"#").editPageProperty(s.id,"openTarget",t).exec(),le.value=e,le.openType=t},this.renamePage=(e,t)=>(this.props.changeEditablePageItemId(""),!!(null==t?void 0:t.trim())&&this.props.renamePage(e.data.id,t)),this.getFirstItemJson=()=>{const{itemJson:e}=this.state;return e.children[0]},this.getLastItemJson=()=>{const{itemJson:e}=this.state;let t=e.children[e.children.length-1];return t.isExpand&&t.children&&t.children.length>0&&(t=t.children[t.children.length-1]),t},this.getLastParentItemJson=()=>{const{itemJson:e}=this.state;return e.children[e.children.length-1]},this.onDidDrop=(e,i,o)=>{t.lodash.defer(()=>{if(this.treeRef.querySelectorAll(".toc-item-drag").forEach(e=>{e.setAttribute("data-itemJson",null)}),"moveInto"===o){this.props.movePageIntoPage(e.data.id,i.data.id);const{expandIds:t}=this;t.includes(i.id)||(t.push(i.id),this.setState({itemJson:E(this.state.itemJson,t)}))}else this.props.reOrderPage(e.data.id,i.data.id,o)})},this.canDragFunc=e=>!0,this.canDropFunc=(e,t)=>e.id!==t.id,this.canDropIntoFunc=(e,o)=>{const s=(0,i.getAppConfigAction)().appConfig;return i.appConfigUtils.isFirstLevelPage(s,o.id)&&!i.appConfigUtils.isPageHasSubPage(s,e.id)&&e.type!==t.PageType.Folder},this.canOrderFunc=(e,o)=>{const s=(0,i.getAppConfigAction)().appConfig;return!(e.type===t.PageType.Folder&&!i.appConfigUtils.isFirstLevelPage(s,o.id))},this.getItemJsonByPageJson=(e,o,s)=>{const n=e.id,{expandIds:a}=this,{currentPageItemId:r,formatMessage:l}=this.props,d=a.includes(n),c={id:n,data:e,label:e.label,index:o,level:s,isActive:r===n,isExpand:d,mustShowArrow:e.type===t.PageType.Folder,showDefault:e.type===t.PageType.Normal,allowEditable:!0,renderItem:this.renderPageContent};return c.icon=e.icon,c.icon||(c.icon=i.utils.getDefaultTocPageIcon(e,l)),c},this.getItemJsonByPages=(e,o)=>{e||(e=this.props.pages),o||(o=this.props.pageStructure);const s={id:"ROOT",children:[],label:""};if(!e||!o)return(0,t.Immutable)(s);let n=o.map((t,i)=>{const o=Object.keys(t)[0],s=e[o],n=this.getItemJsonByPageJson(s,i,0),a=t[o];return n.children=[],a.forEach((t,i)=>{const o=e[t],s=this.getItemJsonByPageJson(o,i,1);n.children.push(s)}),n});if(this.props.isPageTemplateLoading){const e=(0,i.getAppConfigAction)().appConfig,s={id:i.appConfigUtils.getUniqueId("page"),label:i.appConfigUtils.getUniqueLabel(e,"page",this.props.formatMessage("page")),type:t.PageType.Normal},a=this.getItemJsonByPageJson(s,o.length,0);a.children=[],n=n.asMutable({deep:!0}),n.push(a)}s.children=n;let a=(0,t.Immutable)(s);const{filterText:r}=this.state;if(r&&""!==r){const e=N(a,r.trim());a=R(e,r.trim())}return a},this.getMoreDropDownItems=o=>{const s=o.data,n=[],a=(0,t.Immutable)({a11yFocusBack:!1,label:this.props.formatMessage("rename"),event:e=>{this.handleOnTocDoubleClick(o,e)},visible:!0});n.push(a);const r=(0,t.Immutable)({a11yFocusBack:!1,label:this.props.formatMessage("setLink"),event:e=>{this.handleOnSetLinkClick(o,e)},visible:s.type===t.PageType.Link});n.push(r);const l="string"==typeof o.icon?{svg:o.icon}:o.icon,d=(0,t.Immutable)({label:(0,e.jsx)(W.IconPicker,{icon:l,showIcon:!1,showLabel:!0,hideRemove:!0,customLabel:this.props.formatMessage("setIcon"),customIcons:[i.utils.getDefaultTocPageIcon({type:t.PageType.Normal},this.props.formatMessage)],configurableOption:"none",useKeyUpEvent:!0,buttonOptions:{type:"tertiary",variant:"text",size:"sm",className:"set-icon-dropdown-item text-left",style:{color:this.props.theme.ref.palette.black,minWidth:"110px"}},onChange:e=>{(0,i.getAppConfigAction)().editPageProperty(o.id,"icon",e).exec()}}),tag:"div",event:e=>{e.stopPropagation()},autoHide:!1,visible:!0});n.push(d);const c=(0,t.Immutable)({label:this.props.formatMessage("duplicate"),event:e=>{e.stopPropagation(),this.props.duplicatePage(s.id)},visible:!0});n.push(c);const p=(0,i.getAppConfigAction)().appConfig,h=(p?i.appConfigUtils.getRealPageCountExcludeOnePage(p,s.id):0)<1,g=(0,t.Immutable)({label:this.props.formatMessage("delete"),event:e=>{this.handleRemovePage(s),e.stopPropagation()},visible:!h});return n.push(g),n},this.getAddPageDropDownItems=()=>{const{addPageWithType:e}=this.props,i=[],o=(0,t.Immutable)({label:this.props.formatMessage("addLink"),a11yFocusBack:!1,event:i=>{de=e("link").id,this.resetLinkParam(de),this.setState({isShowLinkSetting:!0}),i.stopPropagation(),"Enter"!==i.key&&" "!==i.key||setTimeout(()=>{const e=document.querySelector('div[role="dialog"] .jimu-btn');(0,t.focusElementInKeyboardMode)(e,!0)},100)},visible:!0});i.push(o);const s=(0,t.Immutable)({label:this.props.formatMessage("addFolder"),a11yFocusBack:!1,event:t=>{e("folder"),t.stopPropagation()},visible:!0});return i.push(s),i},this.renderPageItemRightContent=s=>{const{theme:n,onDefaultClick:a}=this.props,{data:r}=s,l=this.getMoreDropDownItems(s),d=t.css`
      margin-right: 10px;
      .page-item-visible-btn {
        display: ${r.isVisible?"none":"inline-flex"};
      }

      .page-item-home-btn {
        color: ${s.showDefault&&r.isDefault?n.ref.palette.black:n.ref.palette.neutral[1e3]};
        &:hover {
          color: ${n.ref.palette.black};
        }
      }

      .dropDown {
        display: inline-flex;
        .btn {
          display: none;
        }
      }

    `;return(0,e.jsxs)("div",{className:"d-flex align-items-center",css:d,children:[(0,e.jsx)(o.Tooltip,{placement:"bottom",title:this.props.formatMessage("makeHome"),children:(0,e.jsx)(G,{size:"sm",icon:!0,type:"tertiary",disableHoverEffect:!0,"aria-label":this.props.formatMessage("makeHome"),className:"page-item-home-btn page-item-icon item-inside-button jimu-outline-inside",onClick:e=>{e.stopPropagation(),r.isDefault||a(r.id)},children:(0,e.jsx)(_,{})})}),(0,e.jsx)(o.Tooltip,{placement:"bottom",title:r.isVisible?this.props.formatMessage("hideFromMenu"):this.props.formatMessage("showFromMenu"),children:(0,e.jsx)(G,{size:"sm",type:"tertiary",icon:!0,disableHoverEffect:!0,"aria-label":r.isVisible?this.props.formatMessage("hideFromMenu"):this.props.formatMessage("showFromMenu"),className:"page-item-visible-btn page-item-icon item-inside-button jimu-outline-inside",onClick:e=>{e.stopPropagation(),(0,i.getAppConfigAction)().editPageProperty(r.id,"isVisible",!s.data.isVisible).exec()},children:r.isVisible?(0,e.jsx)(X,{}):(0,e.jsx)(oe,{})})}),(0,e.jsx)("div",{title:this.props.formatMessage("more"),className:"dropDown page-item-icon",ref:this.linkSettingTrigger,children:(0,e.jsx)(j,{modifiers:ce,direction:"down",theme:n,items:l,insideOutline:!0,supportInsideNodesAccessible:!0})})]})},this.renderPageContent=t=>{var i,o,s;const{intl:n,formatMessage:a,theme:r,editablePageItemId:l}=this.props,{isTocDragging:d,tocDraggingStatus:c}=this.state,p=null===(i=this.treeRef)||void 0===i?void 0:i.getBoundingClientRect();return(0,e.jsx)(x,{intl:n,itemJson:t,formatMessage:a,theme:r,canDnd:!0,isFirstItem:this.getFirstItemJson().id===t.id,editable:l===t.id,onArrowClick:this.handleArrowClick,isLastItem:this.getLastItemJson().id===t.id,isTocDragging:d,onTocDragStatusChange:this.handleOnTocDragStatusChange,tocDraggingStatus:c,parentBoundTop:null!==(o=null==p?void 0:p.top)&&void 0!==o?o:-1,renderRightContent:this.renderPageItemRightContent,renameItem:this.renamePage,parentBoundBottom:null!==(s=null==p?void 0:p.bottom)&&void 0!==s?s:-1,canDropIntoFunc:this.canDropIntoFunc,onDidDrop:this.onDidDrop,canDragFunc:this.canDragFunc,canDropFunc:this.canDropFunc,canOrderFunc:this.canOrderFunc,onDoubleClick:this.handleOnTocDoubleClick})},this.getLinkSettingPopup=(i,o,s)=>{var a,r,l,d,c,p;return i&&(null===(a=null==s?void 0:s.pages)||void 0===a?void 0:a[de])&&!(null===(r=t.urlUtils.getAppIdPageIdFromUrl())||void 0===r?void 0:r.pageId)&&o?(0,e.jsx)(n.LinkSelectorSidePopper,{isOpen:i&&!(null===(l=t.urlUtils.getAppIdPageIdFromUrl())||void 0===l?void 0:l.pageId),isLinkPageSetting:!0,title:null===(c=null===(d=null==s?void 0:s.pages)||void 0===d?void 0:d[de])||void 0===c?void 0:c.label,position:"left",hiddenLinks:(0,t.Immutable)([t.LinkType.None]),linkParam:(0,t.Immutable)(le),onSettingCancel:()=>{this.setState({isShowLinkSetting:!1})},onSettingConfirm:this.handleSettingLinkConfirm,trigger:null===(p=this.linkSettingTrigger)||void 0===p?void 0:p.current}):(!o&&i&&setTimeout(()=>{this.setState({isShowLinkSetting:!1})}),null)},this.getWillRemovePageSubCount=()=>{const e=(0,i.getAppConfigAction)().appConfig,{willRemovePage:t}=this.state;if(!e||!t)return 0;const o=e.pageStructure.find(e=>Object.keys(e)[0]===t.id);return o?o[t.id].length:0},this.onExportClick=e=>{const{currentPageItemId:t}=this.props,o=(0,i.getAppConfigAction)().appConfig,s=[{layout:o.pages[t].layout,layouts:o.layouts,widgets:o.widgets,views:o.views,sections:o.sections,name:"Column layout",description:"Align widgets by columns",thumbnail:"./thumbnails/image2.png"}],n=s[0];n.layouts&&Object.keys(n.layouts).forEach(e=>{let t=n.layouts[e].without("id");t.content&&Object.keys(t.content).forEach(e=>{const i=t.content[e].without("id");t=t.setIn(["content",e],i)}),n.layouts=n.layouts.set(e,t)}),n.widgets&&Object.keys(n.widgets).forEach((e,t)=>{const i=n.widgets[e];n.widgets=n.widgets.set(e,i.without("context","icon","label","manifest","version","useDataSources","useDataSourcesEnabled"))}),n.sections&&Object.keys(n.sections).forEach((e,t)=>{const i=n.sections[e];n.sections=n.sections.set(e,i.without("id","label"))}),n.views&&Object.keys(n.views).forEach((e,t)=>{const i=n.views[e];n.views=n.views.set(e,i.without("id","label"))}),console.log(JSON.stringify({pages:s}))},this.expandIds=[],this.state={currentSelectedItemId:s.currentPageItemId,filterText:"",itemJson:void 0,showSearch:!1,isTemplatePopoverOpen:!1,isTocDragging:!1,isRemovePopoverOpen:!1,willRemovePage:void 0,tocDraggingStatus:"on",isShowLinkSetting:!1,showWarning:!1},this.addPageDropdownItems=this.getAddPageDropDownItems()}componentWillUnmount(){this.dropZoneInteractable&&(this.dropZoneInteractable.unset(),this.dropZoneInteractable=null)}componentDidUpdate(e,i){const o=this.props;let s=!1,n={};const{pages:a,pageStructure:r,currentPageItemId:l,editablePageItemId:d,isPageTemplateLoading:c}=e;if(i.isShowLinkSetting&&!this.state.isShowLinkSetting&&setTimeout(()=>{const e=document.querySelector("div.add-page-more-container .jimu-btn");(0,t.focusElementInKeyboardMode)(e)},100),o.currentPageItemId!==l||o.pages!==a||o.pageStructure!==r||o.editablePageItemId!==d||o.isPageTemplateLoading!==c)if(s=!0,o.pages===a&&r===o.pageStructure&&o.editablePageItemId===d||o.currentPageItemId===l)if(o.currentPageItemId!==l){const e=B(this.state.itemJson,[o.currentPageItemId]);n={currentSelectedItemId:o.currentPageItemId,itemJson:B(this.state.itemJson,[o.currentPageItemId])},this.expandIds=J(e)}else n={itemJson:this.getItemJsonByPages(o.pages,o.pageStructure)};else{const e=B(this.getItemJsonByPages(o.pages,o.pageStructure),[o.currentPageItemId]);n={currentSelectedItemId:o.currentPageItemId,itemJson:e},this.expandIds=J(e)}o.refreshWarning&&(o.showWarning?(n.showWarning=!0,clearTimeout(this.warningRef.current),this.warningRef.current=setTimeout(()=>{this.setState({showWarning:!1})},5e3)):(n.showWarning=!1,clearTimeout(this.warningRef.current))),s&&this.setState(n)}componentDidMount(){this.setState({itemJson:this.getItemJsonByPages()}),this.dropZoneRef&&(this.dropZoneInteractable=(0,a.interact)(this.dropZoneRef).dropzone({accept:".toc-item-drag",overlap:"pointer",ondragenter:e=>{const{itemJson:t}=this.state;if(t&&this.treeRef){const{relatedTarget:t,dragEvent:i}=e,o=this.treeRef.getBoundingClientRect().top,s=this.getTreeContentHeight(),n=JSON.parse(t.getAttribute("data-itemJson")),a=i.client;if(a.y<=o){this.getFirstItemJson().data.id!==n.data.id&&this.handleOnTocDraggingStatusChange("top")}else if(a.y<=s+o)this.handleOnTocDraggingStatusChange("on");else{this.getLastParentItemJson().data.id!==n.data.id&&this.handleOnTocDraggingStatusChange("bottom")}}},ondragleave:e=>{this.handleOnTocDraggingStatusChange("on")},ondrop:e=>{const t=this.state.tocDraggingStatus;if("on"===t)return;let i;if("bottom"===t){i=this.getLastParentItemJson()}else i=this.getFirstItemJson();const o=e.relatedTarget,s=JSON.parse(o.getAttribute("data-itemJson"));this.onDidDrop(s,i,t),this.handleOnTocDraggingStatusChange("on")}}))}resetLinkParam(e){const{pages:i}=this.props;le.value="",le.openType=t.OpenTypes.NewWindow;const o=i[e];o&&o.linkUrl&&"#"!==o.linkUrl&&(le.value=o.linkUrl),o&&o.openTarget&&(le.openType=o.openTarget)}render(){const{itemJson:s,willRemovePage:a,isShowLinkSetting:r}=this.state,{theme:l,isPageSectionNav:d}=this.props,c=(0,i.getAppConfigAction)().appConfig,h=t.css`
      height: 100%;
      position: relative;
      .toc-dropzone {
        position: absolute;
        pointer-events: none;
      }
      .text-data-600{
        color: ${l.ref.palette.neutral[1e3]};
      }
      .page-list-top {
        position: absolute;
        right: 15px;
        top: -46px;
        .page-top-buttons {
          margin-right: -6px;
          .my-dropdown {
            margin-left: -5px;
            margin-right: 5px;
          }
        }
      }
      .page-tree {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        .toc-item-dropzone {
          .toc-item {
            /* padding-left: ${t.polished.rem(4)}; */
          }
        }
      }
      .warning-container {
        position: absolute;
        bottom: 0;
        width: 100%;
        .jimu-alert {
          margin: 0 auto;
          margin-bottom: 8px;
        }
      }
    `;return(0,e.jsxs)("div",{css:h,children:[(0,e.jsx)("div",{ref:e=>{this.dropZoneRef=e},className:"toc-dropzone h-100 w-100"}),(0,e.jsx)("div",{className:"page-list-top",children:(0,e.jsx)("div",{className:"d-flex justify-content-between w-100 align-items-center",children:(0,e.jsxs)("div",{className:"d-flex page-top-buttons align-items-center",children:[(0,e.jsx)("div",{ref:e=>{this.addPageRef=e},css:t.css`z-index: 11;`,children:(0,e.jsx)(o.Tooltip,{placement:"bottom",title:this.props.formatMessage("addPage"),children:(0,e.jsx)(o.Button,{icon:!0,disabled:!s,type:"tertiary","aria-label":this.props.formatMessage("addPage"),ref:e=>{this.templateBtn=e},onClick:this.handleToggleTemplatePopover,size:"sm",className:"add-page-btn",children:(0,e.jsx)(re,{className:"add-page-icon"})})})}),this.state.isTemplatePopoverOpen&&(0,e.jsx)(n.PageTemplatePopper,{theme:l,referenceElement:this.addPageRef,formatMessage:this.props.formatMessage,onItemSelect:this.handleChooseTemplate,onClose:this.closeTemplatePopover}),(0,e.jsx)("div",{title:this.props.formatMessage("addLinkOrFolder"),className:"dropDown page-item-icon add-page-more-container",children:(0,e.jsx)(j,{"aria-label":this.props.formatMessage("addLinkOrFolder"),items:this.addPageDropdownItems,theme:l,disabled:!s,direction:"down",toggleContent:(0,e.jsx)(o.Icon,{icon:p(3839),size:8})})})]})})}),(0,e.jsx)($,{forwardRef:e=>{this.treeRef=e},className:"page-tree mt-2",hideRoot:true,itemJson:s,onClickItem:this.handleClickItem,handleExpand:this.handleExpand}),this.state.showWarning&&(0,e.jsx)("div",{className:"warning-container",children:(0,e.jsx)(o.Alert,{form:"basic",type:"warning",text:this.props.formatMessage("homepageRestrictionWarning"),shape:"none",withIcon:!0,open:!0,closable:!0,onClose:()=>{this.setState({showWarning:!1})}})}),a&&(0,e.jsx)(U,{formatMessage:this.props.formatMessage,isRemove:!0,theme:l,tapBlankClose:!1,toggle:this.handleToggleRemovePopover,onClosed:e=>{de===a.id&&this.setState({isShowLinkSetting:!1}),e&&a&&this.props.removePage(a.id)},title:this.props.formatMessage("delete"),isOpen:this.state.isRemovePopoverOpen,intl:this.props.intl,children:this.props.formatMessage("removePageTip",{subCount:this.getWillRemovePageSubCount(),label:a.label})}),this.getLinkSettingPopup(r,d,c)]})}}const he=t.ReactRedux.connect(e=>{var t,i,o;const s=e.appStateInBuilder&&e.appStateInBuilder.appConfig;return{pages:s&&s.pages,pageStructure:s&&s.pageStructure,isPageSectionNav:"page"===(null===(o=null===(i=null===(t=e.appRuntimeInfo)||void 0===t?void 0:t.sectionNavInfos)||void 0===i?void 0:i["opts-section"])||void 0===o?void 0:o.currentViewId)}})(pe);class ge extends d{constructor(e){super(e),this.onDropHover=e=>{this.state.dropType!==e&&this.setState({dropType:e})},this.labelChanged=e=>{this.setState({currentLabel:e})},this.handleLabelBlur=(e,t)=>{var i,o;let s=""!==e.trim();s&&(s=this._checkLabel("dialog",t,e).valid),s||(e=this.props.itemJson.label,null===(o=(i=this.props).renameItem)||void 0===o||o.call(i,this.props.itemJson,e)),this.labelChanged(e)},this.getStyle=()=>{var e;const i=(0,t.getAppStore)().getState(),o=null===(e=null==i?void 0:i.appContext)||void 0===e?void 0:e.isRTL,{theme:s,editable:n,itemJson:a,isTocDragging:r}=this.props,{mustShowArrow:l,children:d,level:c,isActive:p,isExpand:h}=a,{isDragging:g,isHovering:u}=this.state;return t.css`
      min-height: ${30}px;
      width: auto;
      min-width: 100%;
      align-items: center;
      cursor: pointer;
      ${g?"z-index: 100;":""}

      &.drag-move-into {
        border: 1px solid ${s.sys.color.primary.dark};
      }

      .dialog-item-splash-btn {
        display: ${a.isSplash&&!n?"inline-flex":"none"};
      }

      :hover {
        ${p||r?"":`background-color: ${s.ref.palette.neutral[500]};`}
        .dialog-item-page-btn {
          display: ${n?"none":"inline-flex"};
          z-index: 2;
        }
        .dialog-item-splash-btn {
          display: ${n||!a.isSplash&&r?"none":"inline-flex"};
          z-index: 2;
        }
        .dropDown {
          .btn {
            display: ${r||n?"none":"inline-flex"};
          }
          z-index: 2;
        }
      }

      &.active {
        ${r?"":`background-color: ${s.sys.color.primary.main};`}
        border: 0;
      }

      .toc-dialog-dropzone {
        touch-action: none;
        position: relative;

        .toc-dialog-drag:hover {
          cursor: pointer !important;
        }

        .toc-dialog-drag {
          pointer-events: ${u?"all":"none"};
          visibility: ${a.allowEditable&&n?"hidden":"visible"};
          z-index: 1;
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          background-color: ${g?t.polished.rgba(s.ref.palette.neutral[500],.6):"transparent"};
          box-shadow: ${g?s.sys.shadow.shadow3:"none"};
        }

        .toc-item {
          padding: 0;
          border: 0;
          position: relative;
          .toc-item-content {
            margin-left: ${10*c}px;
            position: relative;
            .toc-arrow {
              z-index: 2;
              padding-right: ${t.polished.rem(1)};
              visibility: hidden;
               /* ${l||d&&d.length>0?"visible":"hidden"}; */

              .toc-arrow-icon {
                fill: ${s.ref.palette.black};
                transform-origin: center;
                transform: ${`rotate(${h?90:o?180:0}deg)`};
                transition: transform .5s;
              }
            }

            .left-and-right {
              overflow-x: hidden;
              margin-left: -5px;
              .left-content {
                align-items: center;
                overflow-x: hidden;
                flex: auto;
                .editor {
                  overflow: hidden;
                  text-overflow: ${n?"clip":"ellipsis"};
                  white-space: nowrap;
                  font-size: ${.875}rem;
                  user-select: none;
                  flex: auto;
                  text-align: start;
                }
                [contenteditable="true"] {
                  user-select: text;
                  -webkit-user-select: text;
                  background-color: ${s.ref.palette.white};
                }
                .header-icon {
                  margin-right: 0.3rem;
                  flex: none;
                }
              }
            }
          }

          &.toc-drag-move-last {
            :after{
              content: '';
              position: absolute;
              left: 0;
              top: auto;
              bottom: 0;
              right: auto;
              height: 2px;
              width: 100%;
              background-color: ${s.sys.color.primary.dark};
            }
          }

          &.toc-drag-move-first {
            :before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: auto;
              right: auto;
              height: 2px;
              width: 100%;
              background-color: red;
              /* ${s.sys.color.primary.dark}; */
            }
          }

          .drag-move-out-order-bottom {
            :after{
              content: '';
              position: absolute;
              left: 0;
              top: auto;
              bottom: 0;
              right: auto;
              height: 2px;
              width: 100%;
              background-color: ${s.sys.color.primary.dark};
            }
          }

          .drag-move-out-order-top {
            :before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: auto;
              right: auto;
              height: 2px;
              width: 100%;
              background-color: ${s.sys.color.primary.dark};
            }
          }
        }
      }
    `},this.state={dropType:"none",isDragging:!1,isHovering:!1,currentLabel:this.props.itemJson.label},this.dropZoneRef=t.React.createRef(),this.dragRef=t.React.createRef()}componentWillUnmount(){this.dragInteractable&&(this.dragInteractable.unset(),this.dragInteractable=null),this.dropZoneInteractable&&(this.dropZoneInteractable.unset(),this.dropZoneInteractable=null)}componentDidMount(){super.componentDidMount(),this.initDragEvent()}componentDidUpdate(e){super.componentDidUpdate(e)}initDragEvent(){var e;const{canDnd:i,canDropFunc:o,onDidDrop:s,itemJson:n}=this.props;if(i&&this.dropZoneRef.current&&this.dragRef.current){let i=null;this.dragRef.current.setAttribute("itemJson",JSON.stringify(n));const r=(null===(e=n.data)||void 0===e?void 0:e.mode)===t.DialogMode.Fixed?".toc-fixed-dialog-drag":".toc-anchored-dialog-drag";this.dropZoneInteractable=(0,a.interact)(this.dropZoneRef.current).dropzone({accept:r,overlap:"pointer",ondropmove:e=>{const t=e.relatedTarget,i=e.target,s=JSON.parse(t.getAttribute("itemJson"));if(!o||!o(n.data,s.data))return;const a=i.getBoundingClientRect(),r=a.bottom-a.top,l=2*r/3,d=1*r/3,c=e.dragEvent.client.y-a.top;let p=this.state.dropType;c>l?p="bottom":c<d&&(p="top"),this.onDropHover(p)},ondragleave:e=>{this.onDropHover("none")},ondrop:e=>{const t=this.state.dropType;if("none"===t)return;const i=e.relatedTarget,o=JSON.parse(i.getAttribute("itemJson"));s&&s(o,n,t),this.onDropHover("none")}}),this.dragInteractable=(0,a.interact)(this.dragRef.current).draggable({inertia:!1,modifiers:[],autoScroll:!0,onstart:e=>{this.setState({isDragging:!0});const{onTocDragStatusChange:t}=this.props;t&&t(!0)},onmove:e=>{const{clientX:t,clientY:o,clientX0:s,clientY0:n,target:a}=e,r=parseFloat(a.getAttribute("start-x"))||0,l=parseFloat(a.getAttribute("start-y"))||0;let d=t-s+r,c=o-n+l;const p=-a.clientWidth/2,h=a.clientWidth/2;d<p?d=p:d>h&&(d=h);const{parentBoundBottom:g,parentBoundTop:u}=this.props;if(g>-1&&u>-1){const e=u-n,t=g-n;c<=e?c=e:c>=t&&(c=t)}i&&cancelAnimationFrame(i),i=requestAnimationFrame(()=>{a.style.webkitTransform=a.style.transform="translate("+d+"px, "+c+"px)",i=null})},onend:e=>{const{target:t}=e;i&&cancelAnimationFrame(i),t.style.webkitTransform=t.style.transform="translate(0px, 0px)",this.setState({isDragging:!1});const{onTocDragStatusChange:o}=this.props;o&&o(!1)}})}}render(){const{itemJson:i,renderRightContent:s,editable:n,canDnd:a,theme:r,isFirstItem:l,isLastItem:d,tocDraggingStatus:c,isTocDragging:p,tocDraggingMode:h}=this.props,{icon:g,isActive:u}=i,{dropType:f,isDragging:v}=this.state;let b;b=g&&g.svg?g:{svg:g};const y="moveInto"===f?"drag-move-into":"",x="drag-move-out-order-"+f;let I="";return p&&"on"!==c&&h===i.data.mode&&("bottom"===c&&d?I="toc-drag-move-last":"top"===c&&l&&(I="toc-drag-move-first")),(0,e.jsx)("div",{className:`d-flex ${u?"active":""}   ${y}`,css:this.getStyle(),onMouseEnter:e=>{this.setState({isHovering:!0})},onMouseLeave:e=>{this.setState({isHovering:!1})},children:(0,e.jsx)("div",{ref:this.dropZoneRef,className:"toc-dialog-dropzone h-100 w-100",children:(0,e.jsxs)("div",{className:"d-flex w-100 h-100",onDoubleClick:this.handleDoubleClickItem,onClick:this.handleClick,children:[(0,e.jsx)("div",{className:`d-flex justify-content-between w-100 toc-item ${I}`,children:(0,e.jsxs)("div",{className:`d-flex toc-item-content ${x} w-100`,children:[(0,e.jsx)(o.Button,{className:"toc-arrow",icon:!0,type:"tertiary",onClick:this.handleArrowClick,children:(0,e.jsx)(m,{className:"toc-arrow-icon",size:"s"})}),(0,e.jsxs)("div",{className:"left-and-right d-flex justify-content-between w-100",children:[(0,e.jsxs)("div",{className:"d-flex left-content "+(s?"pr-0":"pr-2"),children:[g&&(0,e.jsx)(o.Icon,{autoFlip:i.needFlip,className:"header-icon",color:r.ref.palette.neutral[1e3],size:12,icon:b.svg,"aria-hidden":"true"}),(0,e.jsx)("div",{className:"item-label editor",children:i.allowEditable&&n?(0,e.jsx)(o.TextInput,{size:"sm",ref:e=>{this.editor=e},value:this.state.currentLabel,onChange:e=>{this.labelChanged(e.target.value)},onAcceptValue:this.onRenameAccept,checkValidityOnChange:e=>this._checkLabel("dialog",i.id,e),checkValidityOnAccept:e=>this._checkLabel("dialog",i.id,e),onBlur:e=>{this.handleLabelBlur(e.target.value,i.id)}}):(0,e.jsx)(t.React.Fragment,{children:this.state.currentLabel})})]}),s&&s(i)]})]})}),a&&(0,e.jsx)("div",{className:(0,t.classNames)("toc-dialog-drag",{"toc-fixed-dialog-drag":i.data.mode===t.DialogMode.Fixed,"toc-anchored-dialog-drag":i.data.mode===t.DialogMode.Anchored}),ref:this.dragRef,title:this.state.currentLabel,children:v&&(0,e.jsx)("div",{className:"d-flex justify-content-between w-100 toc-item",children:(0,e.jsxs)("div",{className:"d-flex toc-item-content w-100",children:[(0,e.jsx)(o.Button,{icon:!0,type:"tertiary",className:"toc-arrow",children:(0,e.jsx)(m,{className:"toc-arrow-icon",size:"s"})}),(0,e.jsxs)("div",{className:"left-and-right d-flex justify-content-between w-100",children:[(0,e.jsxs)("div",{className:"d-flex left-content "+(s?"pr-0":"pr-2"),children:[g&&(0,e.jsx)(o.Icon,{className:"header-icon",size:12,icon:b.svg,"aria-hidden":"true"}),(0,e.jsx)("div",{title:this.state.currentLabel,className:"item-label editor",children:this.state.currentLabel})]}),s&&s(i)]})]})})})]})})})}}var ue=p(4064),me=p.n(ue),fe=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const ve=i=>{const o=window.SVG,{className:s}=i,n=fe(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:me()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var be=p(655),ye=p.n(be),xe=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const Ie=i=>{const o=window.SVG,{className:s}=i,n=xe(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:ye()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var we=p(5886),Se=p.n(we),Ce=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const je=i=>{const o=window.SVG,{className:s}=i,n=Ce(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Se()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var De=p(3600),Pe=p.n(De),Te=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const ke=i=>{const o=window.SVG,{className:s}=i,n=Te(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Pe()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))},Oe=!0,Ae=[{name:"offset",options:{offset:[0,10]}}];class Me extends t.React.PureComponent{constructor(s){super(s),this.getTotalLines=()=>{const{itemJson:e}=this.state;let t=0;return e.children&&e.children.forEach(e=>{var i,o;t++,e.isExpand&&(t+=null!==(o=null===(i=e.children)||void 0===i?void 0:i.length)&&void 0!==o?o:0)}),t},this.getTreeContentHeight=()=>30*this.getTotalLines(),this.handleOnTocDragStatusChange=e=>{var t;const i=this.getItemJsonByDialogs();this.setState({isTocDragging:e,tocDraggingMode:null===(t=i.data)||void 0===t?void 0:t.mode,itemJson:i})},this.getFirstItemJson=e=>{const{itemJson:t}=this.state;return t.children.filter(t=>t.data.mode===e&&0===t.data.index)[0]},this.getLastItemJson=e=>{const{itemJson:t}=this.state,i=t.children.filter(t=>t.data.mode===e);return i.filter(e=>e.data.index===i.length-1)[0]},this.getLastParentItemJson=()=>{const{itemJson:e}=this.state;return e.children[e.children.length-1]},this.handleOnTocDraggingStatusChange=e=>{this.setState({tocDraggingStatus:e,itemJson:this.getItemJsonByDialogs()})},this.onDidDrop=(e,t,i)=>{"moveInto"!==i&&this.props.reOrderDialog(e.data.id,t.data.id,i)},this.canDropFunc=(e,t)=>e.id!==t.id,this.handleChooseTemplate=e=>{this.setState({isTemplatePopoverOpen:!1}),this.props.addDialog(e)},this.handleToggleTemplatePopover=()=>{const{isTemplatePopoverOpen:e}=this.state;this.setState({isTemplatePopoverOpen:!e})},this.closeTemplatePopover=()=>{this.state.isTemplatePopoverOpen&&((0,t.focusElementInKeyboardMode)(this.templateBtn),this.setState({isTemplatePopoverOpen:!1}))},this.singleAndDoubleClickTimeout=void 0,this.handleClickItem=e=>{this.singleAndDoubleClickTimeout&&(clearTimeout(this.singleAndDoubleClickTimeout),this.singleAndDoubleClickTimeout=void 0),this.singleAndDoubleClickTimeout=setTimeout(()=>{this.setState({currentSelectedItemId:e.id,itemJson:B(this.state.itemJson,[e.id])},()=>{this.props.onClickDialog(e.data.id)})},200)},this.handleOnTocDoubleClick=(e,t)=>{this.singleAndDoubleClickTimeout&&(clearTimeout(this.singleAndDoubleClickTimeout),this.singleAndDoubleClickTimeout=void 0),this.props.changeEditableDialogItemId(e.id),t.stopPropagation()},this.renameDialog=(e,t)=>(this.props.changeEditableDialogItemId(""),!!(null==t?void 0:t.trim())&&this.props.renameDialog(e.data.id,t)),this.getItemJsonByDialogJson=e=>{const t=e.id,{currentDialogItemId:o}=this.props,s={id:t,isSplash:!!e.isSplash,data:e,label:e.label,index:e.index,level:0,isActive:o===t,allowEditable:!0,renderItem:this.renderDialogContent};return s.icon=e.icon,s.icon||(s.icon=i.utils.getDefaultTocDialogIcon()),s},this.getItemJsonByDialogs=e=>{e||(e=this.props.dialogs);const i={id:"ROOT",children:[],label:""};if(!e)return(0,t.Immutable)(i);const o=Object.keys(e).map((t,i)=>{const o=this.getItemJsonByDialogJson(e[t]);return o.children=[],o});i.children=o;return(0,t.Immutable)(i)},this.getMoreDropDownItems=e=>{const i=e.data,o=[],s=(0,t.Immutable)({a11yFocusBack:!1,label:this.props.formatMessage("rename"),event:t=>{this.handleOnTocDoubleClick(e,t)},visible:!0});o.push(s);const n=(0,t.Immutable)({label:this.props.formatMessage("duplicate"),event:e=>{e.stopPropagation(),this.props.duplicateDialog(i.id)},visible:!0});o.push(n);const a=(0,t.Immutable)({label:this.props.formatMessage("delete"),event:e=>{this.props.removeDialog(i.id),e.stopPropagation()},visible:!0});return o.push(a),o},this.renderDialogItemRightContent=s=>{const{theme:n,onSplashClick:a}=this.props,{data:r}=s,l=this.getMoreDropDownItems(s),d=t.css`
      margin-right: 10px;
      .dialog-item-splash-btn {
        color: ${s.isSplash?n.ref.palette.black:n.ref.palette.neutral[1e3]};
        &:hover {
          color: ${n.ref.palette.black};
        }
      }
      .dropDown {
        display: inline-flex;
        .btn {
          display: none;
        }
      }
    `;let c=null;if(r.mode===t.DialogMode.Fixed){const e=i.utils.getPageListByDialogId(this.props.pages,r.id);e.length&&(c=this.props.formatMessage("openedWithPages",{pages:e.map(e=>e.label).join(", ")}))}return(0,e.jsxs)("div",{className:"d-flex",css:d,children:[c?(0,e.jsx)(o.Tooltip,{placement:"bottom",title:c,children:(0,e.jsx)(o.Button,{icon:!0,size:"sm",type:"tertiary",tag:"div",style:{cursor:"inherit"},className:"dialog-item-page-btn dialog-item-icon d-flex align-items-center",children:(0,e.jsx)(je,{size:12})})}):r.mode===t.DialogMode.Fixed&&(0,e.jsx)(o.Tooltip,{placement:"bottom",title:this.props.formatMessage("makeSplash"),children:(0,e.jsx)(G,{size:"sm",icon:!0,type:"tertiary",disableHoverEffect:!0,"aria-label":this.props.formatMessage("makeSplash"),className:"dialog-item-splash-btn dialog-item-icon item-inside-button jimu-outline-inside",onClick:e=>{e.stopPropagation(),a(r.id)},children:(0,e.jsx)(ke,{})})}),(0,e.jsx)("div",{title:this.props.formatMessage("more"),className:"dropDown dialog-item-icon",children:(0,e.jsx)(j,{modifiers:Ae,direction:"down",theme:n,items:l,insideOutline:!0})})]})},this.renderDialogContent=i=>{var o,s,n;const{intl:a,theme:r,editableDialogItemId:l}=this.props,{isTocDragging:d,tocDraggingStatus:c,tocDraggingMode:p}=this.state,h=null===(o=i.data.mode===t.DialogMode.Fixed?this.treeRefForFixed:this.treeRefForAnchored)||void 0===o?void 0:o.getBoundingClientRect();return(0,e.jsx)(ge,{intl:a,itemJson:i,theme:r,canDnd:!0,tocDraggingMode:p,isFirstItem:0===i.data.index,isLastItem:this.getLastItemJson(i.data.mode).id===i.id,isTocDragging:d,onTocDragStatusChange:this.handleOnTocDragStatusChange,tocDraggingStatus:c,parentBoundTop:null!==(s=null==h?void 0:h.top)&&void 0!==s?s:-1,parentBoundBottom:null!==(n=null==h?void 0:h.bottom)&&void 0!==n?n:-1,editable:l===i.id,renderRightContent:this.renderDialogItemRightContent,onDidDrop:this.onDidDrop,canDropFunc:this.canDropFunc,renameItem:this.renameDialog,onDoubleClick:this.handleOnTocDoubleClick})},this.getItemJsonByMode=e=>{const{itemJson:t}=this.state,i=t?{id:t.id,isActive:t.isActive,isExpand:t.isExpand,label:"",children:[]}:null;if(i){const o={};t.children.forEach(t=>{var i;(null===(i=t.data)||void 0===i?void 0:i.mode)===e&&(o[t.index]=t)}),Object.keys(o).forEach(e=>{i.children.push(o[e])})}return i},this.preventDefault=e=>{["BUTTON","A","INPUT"].includes(e.target.tagName)||e.preventDefault()},this.state={currentSelectedItemId:s.currentDialogItemId,itemJson:void 0,isTemplatePopoverOpen:!1,isFixedGroupShown:!0,isAnchoredGroupShown:!0,isTocDragging:!1,tocDraggingMode:null,tocDraggingStatus:"on"}}componentWillUnmount(){this.dropZoneInteractable&&(this.dropZoneInteractable.unset(),this.dropZoneInteractable=null)}componentDidUpdate(e){const t=this.props;let i=!1,o={};const{dialogs:s,currentDialogItemId:n,editableDialogItemId:a,forceRefresh:r}=e;if(t.forceRefresh&&!r||t.currentDialogItemId!==n||t.dialogs!==s||t.editableDialogItemId!==a)if(i=!0,t.dialogs===s&&t.editableDialogItemId===a||t.currentDialogItemId===n)o=t.currentDialogItemId!==n?{currentSelectedItemId:t.currentDialogItemId,itemJson:B(this.state.itemJson,[t.currentDialogItemId])}:{itemJson:this.getItemJsonByDialogs(t.dialogs)};else{const e=B(this.getItemJsonByDialogs(t.dialogs),[t.currentDialogItemId]);o={currentSelectedItemId:t.currentDialogItemId,itemJson:e}}i&&this.setState(o)}componentDidMount(){this.setState({itemJson:this.getItemJsonByDialogs()}),this.initDragEvent(t.DialogMode.Fixed),this.initDragEvent(t.DialogMode.Anchored)}initDragEvent(e){const i=e===t.DialogMode.Fixed?".toc-fixed-dialog-drag":".toc-anchored-dialog-drag",o=e===t.DialogMode.Fixed?this.dropZoneRefForFixed:this.dropZoneRefForAnchored,s=e===t.DialogMode.Fixed?this.treeRefForFixed:this.treeRefForAnchored;o&&(this.dropZoneInteractable=(0,a.interact)(o).dropzone({accept:i,overlap:"pointer",ondragenter:t=>{const{itemJson:i}=this.state;if(i&&s){const{relatedTarget:i,dragEvent:o}=t,n=s.getBoundingClientRect().top,a=this.getTreeContentHeight(),r=JSON.parse(i.getAttribute("itemJson")),l=o.client;if(l.y<=n){this.getFirstItemJson(e).data.id!==r.data.id&&this.handleOnTocDraggingStatusChange("top")}else l.y<=a+n&&this.handleOnTocDraggingStatusChange("on")}},ondragleave:e=>{this.handleOnTocDraggingStatusChange("on")},ondrop:e=>{const t=e.relatedTarget,i=JSON.parse(t.getAttribute("itemJson")),o=this.state.tocDraggingStatus;if("on"===o)return;const s="bottom"===o?this.getLastParentItemJson():this.getFirstItemJson(i.data.mode);this.onDidDrop(i,s,o),this.handleOnTocDraggingStatusChange("on")}}))}render(){const{itemJson:i}=this.state,{theme:s}=this.props,a=t.css`
      height: 100%;
      position: relative;
      .toc-dropzone {
        position: absolute;
        pointer-events: none;
      }
      .text-data-600{
        color: ${s.ref.palette.neutral[1e3]};
      }
      .dialog-list-top {
        position: absolute;
        right: 16px;
        top: -38px;
        .dialog-top-buttons {
          margin-right: -6px;
          .my-dropdown {
            margin-left: -5px;
            margin-right: 5px;
          }
        }
      }
      .dialog-list-content{
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;

        .dialog-group{
          display: flex;
          align-items: center;
          padding: 0.25rem 0.575rem 0.25rem 1rem;
          .dialog-group-title{
            font-size: 14px;
            color: ${s.ref.palette.neutral[1e3]};
            flex-grow: 1;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
        }

        .dialog-tree {
          overflow: hidden;
        }
      }
    `,r=this.getItemJsonByMode(t.DialogMode.Fixed),l=this.getItemJsonByMode(t.DialogMode.Anchored);return(0,e.jsxs)("div",{css:a,children:[(0,e.jsx)("div",{className:"dialog-list-top",children:(0,e.jsx)("div",{className:"d-flex justify-content-between w-100 align-items-center",children:(0,e.jsxs)("div",{className:"d-flex dialog-top-buttons align-items-center",children:[(0,e.jsx)("div",{ref:e=>{this.addDialogRef=e},css:t.css`z-index: 11;`,children:(0,e.jsx)(o.Tooltip,{placement:"bottom",title:this.props.formatMessage("addDialog"),children:(0,e.jsx)(o.Button,{icon:!0,disabled:!i,type:"tertiary","aria-label":this.props.formatMessage("addDialog"),ref:e=>{this.templateBtn=e},onClick:this.handleToggleTemplatePopover,size:"sm",className:"add-dialog-btn",children:(0,e.jsx)(re,{className:"add-dialog-icon"})})})}),this.state.isTemplatePopoverOpen&&(0,e.jsx)(n.WindowTemplatePopper,{theme:this.props.theme,referenceElement:this.addDialogRef,formatMessage:this.props.formatMessage,onItemSelect:this.handleChooseTemplate,onClose:this.closeTemplatePopover})]})})}),(0,e.jsx)("div",{className:"dialog-list-content",children:(0,e.jsxs)("div",{children:[(0,e.jsxs)(o.Label,{check:!0,className:"dialog-group",children:[(0,e.jsx)("div",{className:"dialog-group-title",children:this.props.formatMessage("fixedWindows")}),(0,e.jsx)(o.Button,{disableHoverEffect:!0,disableRipple:!0,icon:!0,size:"sm",type:"tertiary",disabled:!((null==r?void 0:r.children.length)>0),title:this.props.formatMessage(this.state.isFixedGroupShown?"collapse":"expand"),"aria-label":this.props.formatMessage(this.state.isFixedGroupShown?"collapse":"expand"),"aria-expanded":this.state.isFixedGroupShown,onClick:e=>{this.preventDefault(e),this.setState({isFixedGroupShown:!this.state.isFixedGroupShown})},children:this.state.isFixedGroupShown&&(null==r?void 0:r.children.length)?(0,e.jsx)(ve,{}):(0,e.jsx)(Ie,{})})]}),(0,e.jsxs)(o.Collapse,{isOpen:this.state.isFixedGroupShown,children:[(0,e.jsx)("div",{ref:e=>{this.dropZoneRefForFixed=e},className:"toc-dropzone toc-dialog-dropzone w-100",style:{height:30*(null==r?void 0:r.children.length)+"px"}}),(0,e.jsx)($,{forwardRef:e=>{this.treeRefForFixed=e},className:"dialog-tree",hideRoot:Oe,itemJson:(0,t.Immutable)(r),onClickItem:this.handleClickItem})]}),(0,e.jsxs)(o.Label,{check:!0,className:"dialog-group",children:[(0,e.jsx)("div",{className:"dialog-group-title",children:this.props.formatMessage("anchoredWindows")}),(0,e.jsx)(o.Button,{disableHoverEffect:!0,disableRipple:!0,icon:!0,size:"sm",type:"tertiary",disabled:!((null==l?void 0:l.children.length)>0),title:this.props.formatMessage(this.state.isAnchoredGroupShown?"collapse":"expand"),"aria-label":this.props.formatMessage(this.state.isAnchoredGroupShown?"collapse":"expand"),"aria-expanded":this.state.isAnchoredGroupShown,onClick:e=>{this.preventDefault(e),this.setState({isAnchoredGroupShown:!this.state.isAnchoredGroupShown})},children:this.state.isAnchoredGroupShown&&(null==l?void 0:l.children.length)?(0,e.jsx)(ve,{}):(0,e.jsx)(Ie,{})})]}),(0,e.jsxs)(o.Collapse,{isOpen:this.state.isAnchoredGroupShown,children:[(0,e.jsx)("div",{ref:e=>{this.dropZoneRefForAnchored=e},className:"toc-dropzone toc-dialog-dropzone w-100",style:{height:30*(null==l?void 0:l.children.length)+"px"}}),(0,e.jsx)($,{forwardRef:e=>{this.treeRefForAnchored=e},className:"dialog-tree",hideRoot:Oe,itemJson:(0,t.Immutable)(l),onClickItem:this.handleClickItem})]})]})})]})}}const Ne=t.ReactRedux.connect(e=>{const t=e.appStateInBuilder&&e.appStateInBuilder.appConfig;return{pages:t&&t.pages,dialogs:t&&t.dialogs}})(Me);const Re=t.ReactRedux.connect((e,i)=>{var o,s,n,a,r;return{updateRightContentByAppMode:!!i.itemJson.isActive&&(null===(s=null===(o=null==e?void 0:e.appStateInBuilder)||void 0===o?void 0:o.appRuntimeInfo)||void 0===s?void 0:s.appMode)===t.AppMode.Run,updateRightContentByLockLayout:!!i.itemJson.isActive&&(null===(r=null===(a=null===(n=e.appStateInBuilder)||void 0===n?void 0:n.appConfig)||void 0===a?void 0:a.forBuilderAttributes)||void 0===r?void 0:r.lockLayout)}})(class extends d{constructor(e){super(e),this.checkValidity=e=>{const{itemJson:t}=this.props;let i={valid:!0};if("view"===(null==t?void 0:t.type)){const o=t.id.split(l);i=this._checkLabel("view",o[o.length-1],e)}return i},this.labelChanged=e=>{this.setState({currentLabel:e})},this.handleLabelBlur=e=>{var t,i;const{itemJson:o}=this.props;let s=""!==e.trim();s&&"view"===(null==o?void 0:o.type)&&(s=this._checkLabel("view",o.id,e).valid),s||(e=this.props.itemJson.label,null===(i=(t=this.props).renameItem)||void 0===i||i.call(t,this.props.itemJson,e)),this.labelChanged(e)},this.getStyle=()=>{var e;const i=(0,t.getAppStore)().getState(),o=null===(e=null==i?void 0:i.appContext)||void 0===e?void 0:e.isRTL,{theme:s,editable:n,itemJson:a}=this.props,{mustShowArrow:r,children:l,level:d,isActive:c,isExpand:p}=a;return t.css`
      min-height: ${30}px;
      width: auto;
      min-width: 100%;
      align-items: center;
      cursor: pointer;
      .dropDown {
        display: inline-flex;
      }

      :hover {
        ${c?"":`background-color: ${s.ref.palette.neutral[500]};`}
        .dropDown {
          z-index: 2;
          .btn {
            visibility: visible;
          }
        }
        .editor {
          color: ${s.ref.palette.black};
        }
      }

      .item-action-button {
        display: none;
      }

      &.active {
        background-color: ${s.sys.color.primary.main};
        border: 0;
        .editor {
          color: ${s.ref.palette.black};
        }

        &:hover {
          .item-action-button {
            display: block;
          }
        }
      }

      &.insideActive {
        background-color: ${s.ref.palette.neutral[500]};
      }

      .toc-item {
        padding: 0;
        border: 0;
        .toc-item-content {
          margin-left: ${10*d}px;
          position: relative;
          .toc-arrow {
            z-index: 2;
            padding-right: ${t.polished.rem(1)};
            visibility: ${r||l&&l.length>0?"visible":"hidden"};
            .jimu-icon {
              fill: ${s.ref.palette.black};
              transform-origin: center;
              transform: ${`rotate(${p?90:o?180:0}deg)`};
            }
          }

          .left-and-right {
            overflow-x: hidden;
            margin-left: -5px;
            /* margin-left: calc(8px - 6px - 0.6875rem + ${t.polished.rem(4)}); */
            .left-content {
              align-items: center;
              overflow-x: hidden;
              flex: auto;
              .editor {
                overflow: hidden;
                text-overflow: ${n?"clip":"ellipsis"};
                white-space: nowrap;
                font-size: ${.875}rem;
                user-select: none;
                flex: auto;
                text-align: start;
              }
              [contenteditable="true"] {
                user-select: text;
                -webkit-user-select: text;
                background-color: ${s.ref.palette.white};
              }
              .header-icon {
                margin-right: 0.3rem;
                flex: none;
              }
            }
          }
        }
      }
    `},this.registerMouseEvent=e=>{e.addEventListener("mouseenter",e=>{this.handleMouseEnter(e)}),e.addEventListener("mouseleave",e=>{this.handleMouseLeave(e)})},this.state={currentLabel:this.props.itemJson.label,currentIcon:this.props.itemJson.icon}}componentDidMount(){super.componentDidMount()}componentDidUpdate(e){super.componentDidUpdate(e)}render(){const{itemJson:i,renderRightContent:s,editable:n,theme:a,formatMessage:r,className:l}=this.props,{currentLabel:d,currentIcon:c}=this.state;let p;return p=c&&c.svg?c:{svg:c},(0,e.jsx)("div",{className:(0,t.classNames)("d-flex",l,{active:i.isActive}),css:this.getStyle(),children:(0,e.jsx)("div",{className:"d-flex w-100 h-100",onDoubleClick:this.handleDoubleClickItem,onClick:this.handleClick,ref:e=>{e&&this.registerMouseEvent(e)},children:(0,e.jsx)("div",{className:"d-flex justify-content-between w-100 toc-item",children:(0,e.jsxs)("div",{className:"d-flex toc-item-content w-100",children:[(0,e.jsx)(G,{className:"toc-arrow jimu-outline-inside pl-0 pr-0 mr-1",icon:!0,type:"tertiary",disableHoverEffect:!0,disableRipple:!0,title:r(i.isExpand?"collapse":"expand"),"aria-label":r(i.isExpand?"collapse":"expand"),"aria-expanded":i.isExpand,onClick:this.handleArrowClick,onKeyUp:e=>{("Enter"===e.key||" "===e.key)&&this.handleArrowClick(e)},children:(0,e.jsx)(y,{size:"s"})}),(0,e.jsxs)("div",{className:"left-and-right d-flex justify-content-between w-100",children:[(0,e.jsxs)("div",{className:"d-flex left-content "+(s?"pr-0":"pr-2"),children:[c&&(0,e.jsx)(o.Icon,{autoFlip:i.needFlip,className:"header-icon",color:a.ref.palette.neutral[1e3],size:12,icon:p.svg,"aria-hidden":"true"}),(0,e.jsx)("div",{title:d,className:"item-label editor",children:i.allowEditable&&n?(0,e.jsx)(o.TextInput,{size:"sm",ref:e=>{this.editor=e},value:d,onChange:e=>{this.labelChanged(e.target.value)},onAcceptValue:this.onRenameAccept,checkValidityOnChange:this.checkValidity,checkValidityOnAccept:this.checkValidity,onBlur:e=>{this.handleLabelBlur(e.target.value)}}):(0,e.jsx)(t.React.Fragment,{children:d})})]}),s&&s(i)]})]})})})})}});class Ee extends t.React.PureComponent{constructor(e){super(e),this.handleChange=e=>{const t=(null==e?void 0:e.target.value)||"";this.setState({searchText:t},()=>{const{onSearchTextChange:e}=this.props;e&&e(t)})},this.handleSubmit=e=>{const{onSubmit:t}=this.props;t&&t(e)},this.onKeyUp=e=>{e&&e.target&&"Enter"===e.key&&this.handleSubmit(e.target.value)},this.handleClear=e=>{this.setState({searchText:""}),e.stopPropagation()},this.getStyle=()=>t.css`
      position: relative;
      .toc-search-input {
        .search-close-icon {
          padding: 0.125rem;
        }
      }
    `,this.state={searchText:e.searchText||""}}componentDidUpdate(e){if(this.props.searchText!==e.searchText&&this.props.searchText!==this.state.searchText){const{searchText:e}=this.props;this.setState({searchText:e})}}render(){const{placeholder:t,className:i,inputRef:s,onFocus:n,onBlur:a}=this.props,{searchText:r}=this.state;return(0,e.jsx)("div",{css:this.getStyle(),className:i,children:(0,e.jsx)(o.TextInput,{className:"toc-search-input",ref:s,"aria-label":t,placeholder:t,allowClear:!0,onChange:this.handleChange,onBlur:a,onFocus:n,value:r,onKeyDown:e=>{this.onKeyUp(e)}})})}}function Le(e,t){let i=e.id;return"widget"===t||"layoutItem"===t?i=e.layoutId+l+e.layoutItemId+l+(e.id||t):"section"===t||"screenGroup"===t?i=e.layoutId+l+e.layoutItemId+l+e.id:"view"!==t&&"screen"!==t&&"layout"!==t||(i=e.layoutId+l+e.layoutItemId+l+e.sectionOrScreenGroupId+l+e.id),i}function Be(e){var t;return(null===(t=null==e?void 0:e.children)||void 0===t?void 0:t.length)>0}function Je(e,i){const{theme:o}=e,{showSearch:s}=i;return t.css`
    height: 100%;
    padding-bottom: 10px;
    position: relative;
    .toc-dropzone {
      position: absolute;
      pointer-events: none;
    }
    .outline-list-top {
      height: ${s?82:44}px;
      padding: 10px ${16}px;
      padding-top: 0;
      .outline-title {
        user-select: none;
        color: ${o.ref.palette.neutral[1e3]};
        font-weight: ${o.ref.typeface.fontWeightBold};
      }
      .outline-top-buttons {
        margin-right: -6px;
        // .btn:hover {
        //   svg {
        //     color: ${o.ref.palette.black};
        //   }
        // }
      }
      .toc-search-input {
        margin-top: 8px;
      }
    }
    .outline-tree-container {
      color: ${o.ref.palette.neutral[1e3]};
      height: calc(100% - ${s?82:44}px);
      overflow-y: auto;
      .outline-tree {
        >div {
          overflow: hidden;
          >div {
            overflow-x: auto;
            >.collapse {
              min-width: fit-content;
            }
          }
        }
        .tree-item-common {
          padding-left: ${16}px;
          .tree-arrow {
            display: none;
          }
        }
        .outline-title-item {
          margin-top: ${t.polished.rem(6)};
          .tree-item-common {
            .left-content {
              font-weight: ${o.ref.typeface.fontWeightBold};
              color: ${o.ref.palette.neutral[1e3]};
            }
          }
          .tree-item-common:hover {
            background-color:${t.polished.rgba(o.ref.palette.neutral[500],.6)};
          }
        }
        .toc-item-dropzone {
          .toc-item {
            padding-left: ${t.polished.rem(4)};
          }
        }
      }
    }

  `}let ze;function Fe(e,t,i,o,s,n=0){return e.map((e,a)=>{var r,l,d,c,p,h;let g=e;s&&(g=Object.assign({},e,{layoutId:s.layoutId,layoutItemId:s.layoutItemId,sectionOrScreenGroupId:s.id}));const u=Le(g,e.type),{currentSelectedItemId:m}=o,{expandIds:f,renderOutlineContent:v,renderTitleRightContent:b}=ze,y=f.includes(u),x={id:u,label:e.label,icon:e.icon,index:a,level:n,data:e,allowEditable:$e(t,i),allowRename:!e.isLabelReadOnly,type:e.type,pagePart:t,mustShowArrow:(null===(r=e.children)||void 0===r?void 0:r.length)>0,isActive:m===u,isExpand:y,renderItem:v,renderRightContent:b,needFlip:"widget"===e.type&&(null===(p=null===(c=null===(d=null===(l=i.appConfig.widgets[e.id])||void 0===l?void 0:l.data)||void 0===d?void 0:d.manifest)||void 0===c?void 0:c.properties)||void 0===p?void 0:p.flipIcon)};if(e.children){const a=(null===(h=e.children[0])||void 0===h?void 0:h.layoutId)?null:e.layoutId?e:s;x.children=Fe(e.children,t,i,o,a,n+1)}return x})}function $e(e,i){let o;return o=e===t.PagePart.Header?i.allowEditableForHeader:e===t.PagePart.Footer?i.allowEditableForFooter:e===t.PagePart.Body?i.allowEditable:i.allowEditableForDialog,o}var Ue=p(170),He=p.n(Ue),Ge=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const We=i=>{const o=window.SVG,{className:s}=i,n=Ge(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:He()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var Ve=p(8116),Ze=p.n(Ve),Ke=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const _e=i=>{const o=window.SVG,{className:s}=i,n=Ke(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Ze()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))},qe=[{name:"offset",options:{offset:[0,10]}}];class Ye extends t.React.Component{constructor(n){var a,r;super(n),this.singleAndDoubleClickTimeout=void 0,this.isViewOrScreenSelected=e=>{const t=null==e?void 0:e.split(l);return t&&["view","screen"].includes(t[t.length-1].split("_")[0])},this.handleOnTocDoubleClick=(e,t)=>{e.allowRename&&(this.singleAndDoubleClickTimeout&&(clearTimeout(this.singleAndDoubleClickTimeout),this.singleAndDoubleClickTimeout=void 0),this.checkIfReadOnly(e)||this.setState({editableItemId:e.id}))},this.handleRename=(e,t)=>((null==t?void 0:t.trim())||(t=e.label),this.setState({editableItemId:""}),function(e,t){return!(!t||""===t||""===t.replace(/(\r\n|\n|\r)/g,"")||((0,i.getAppConfigAction)().editLabelOfTocNode(e.data,""!==t?t:void 0).exec(),0))}(e,t)),this.checkIfReadOnly=e=>{var t,i;const o=e.id.split(l);let s;return s="screenGroup"===e.type||"section"===e.type?o[0]===(null===(t=this.props.selection)||void 0===t?void 0:t.layoutId)&&o[1]===(null===(i=this.props.selection)||void 0===i?void 0:i.layoutItemId):this.state.currentSelectedItemId===e.id,!(s&&e.allowEditable&&e.pagePart===this.props.activePagePart)},this.handleClickItem=(e,t)=>{this.singleAndDoubleClickTimeout&&(clearTimeout(this.singleAndDoubleClickTimeout),this.singleAndDoubleClickTimeout=void 0),e.allowEditable&&(this.singleAndDoubleClickTimeout=setTimeout(()=>{if(!e.type||"layout"===e.type)return void this.handleExpand(e);const{currentSelectedItemId:t,itemJson:i}=this.state;t!==e.id?e.type&&"layout"!==e.type?(this.setState({currentSelectedItemId:e.id,itemJson:L(i,[e.id])}),this.props.onClickItem(e)):(this.setState({itemJson:Object.assign({},i)}),this.props.onClickItem(e)):this.handleExpand(e)},200))},this.handleExpand=e=>{const{expandIds:t}=this;e.isExpand?t.includes(e.id)&&t.splice(t.indexOf(e.id),1):t.includes(e.id)||t.push(e.id),this.setState({itemJson:E(this.state.itemJson,t)})},this.handleExpandIdsByInsideLayouts=(e,t,i)=>{Be(e)&&(i?t[e.id]=!0:delete t[e.id],e.children.forEach(e=>{this.handleExpandIdsByInsideLayouts(e,t,i)}))},this.handleExpandOrCollapseAll=(e,t,i)=>{i.stopPropagation();const o={};this.expandIds.forEach(e=>{o[e]=!0}),this.handleExpandIdsByInsideLayouts(t,o,e),this.expandIds=Object.keys(o).map(e=>e),this.setState({itemJson:E(this.state.itemJson,this.expandIds)})},this.handleArrowClick=e=>{this.handleExpand(e)},this.handleSearchTextChange=(e,t=!0)=>{this.setState({filterText:e},()=>{this.setState({itemJson:this.getItemJsonByAppConfig(this.props,this.state,t)})})},this.handleSearchSubmit=e=>{this.handleSearchTextChange(e,!1)},this.handleSearchBtnClick=e=>{null==e||e.stopPropagation();this.state.showSearch&&this.handleSearchTextChange(""),this.setState({showSearch:!this.state.showSearch})},this.handleSearchOpened=()=>{this.searchInput&&(this.searchInput.select(),(0,t.focusElementInKeyboardMode)(this.searchInput,!0))},this.getItemJsonByAppConfig=(o,n,a=!1)=>function(o,n,a,r=!1){const l=[],{appConfig:d,currentPageId:c,currentDialogId:p,activePagePart:h}=o,{filterText:g,currentSelectedItemId:u}=n,m=[o.formatMessage("variableHeader"),o.formatMessage("variableFooter"),o.formatMessage("variableBody")],f=[t.PagePart.Header,t.PagePart.Footer,t.PagePart.Body];ze=a;const{expandIds:v,renderTitleRightContent:b,lastPageId:y}=ze,x={id:"ROOT",children:l,label:""};if(!d)return(0,t.Immutable)(x);if(p){const e=d.dialogs[p],t=e&&s.searchUtils.findLayoutId(e.layout,o.browserSizeMode,d.mainSizeMode),a=Fe(i.LayoutServiceProvider.getInstance().getServiceByType(d.layouts[t].type).getTocStructure(d,t),null,o,n);x.children=a}else for(let a=0;a<3;a++){if(0===a&&!o.enableHeader||1===a&&!o.enableFooter)continue;const r=a+"-"+m[a],p=u===r;p&&(v.includes(r)||v.push(r));const x=v.includes(r),I={label:m[a],pagePart:f[a],id:r,index:a,level:0,mustShowArrow:!0,isActive:p,isExpand:x,className:"outline-title-item",allowEditable:!0,renderRightContent:b,arrowIcon:t=>(0,e.jsx)("div",{})};let w,S,C=!0;if(I.label===o.formatMessage("variableHeader")?(w=t.ContainerType.Header,S="header",o.enableHeader||(C=!1)):I.label===o.formatMessage("variableBody")?(w=t.ContainerType.Page,S=c,i.appConfigUtils.isRealPage(d,c)?ze.lastPageId=c:S=y):(w=t.ContainerType.Footer,S="footer",o.enableFooter||(C=!1)),C){const e=w===t.ContainerType.Page?d.pages[S]:d[w],a=e&&s.searchUtils.findLayoutId(e.layout,o.browserSizeMode,d.mainSizeMode),r=d.layouts[a],l=Fe(i.LayoutServiceProvider.getInstance().getServiceByType(r.type).getTocStructure(d,a),I.pagePart,o,n);I.children=l,(g&&""!==g||h===I.pagePart)&&I.children&&I.children.length>0&&(I.isExpand=!0,v.includes(I.id)||v.push(I.id))}l.push(I)}let I=(0,t.Immutable)(x);if(g&&""!==g){const e=N(I,g.trim());I=R(e,g.trim()),ze.expandIds=J(I),r&&i.builderAppSync.publishChangeSelectionToApp(null)}return I}(null!=o?o:this.props,null!=n?n:this.state,this,a),this.isSupportDropDown=e=>"section"===e||"view"===e||"screenGroup"===e||"screen"===e||"widget"===e||"layoutItem"===e,this.showExpandCollapseItems=e=>Be(e),this.getDropdownItemsFromTools=(t,o,s,n,a)=>{const{theme:r}=this.props,l=i.LayoutServiceProvider.getInstance().getServiceByType(s.type).getToolItems(t,o,a),d=[];return l.forEach(t=>{if(Array.isArray(t)){if(this.isToolVisible(t[0],s,n)){const i=[];t.forEach((e,t)=>{0!==t&&i.push({label:this.getToolTitle(e,n),event:t=>{e.onClick({layoutId:s.id,layoutItem:n},t)}})}),d.push({label:(0,e.jsx)(D,{toggleContent:this.getToolTitle(t[0],n),modifiers:qe,direction:"right",theme:r,items:i,icon:!1}),isBtn:!0})}}else if(t.separator&&d.length>0)d.push({divider:!0});else if(this.isToolVisible(t,s,n)){const i=this.getToolTitle(t,n);t.settingPanel?d.push({label:(0,e.jsx)(D,{toggleContent:i,modifiers:qe,direction:"right",theme:r,items:[{label:"",settingPanel:t.settingPanel,settingPanelProps:{layoutId:s.id,layoutItem:n,layoutItemId:n.id}}],icon:!1}),isBtn:!0}):d.push({label:i,event:e=>{t.onClick({layoutId:s.id,layoutItem:n},e)}})}}),d},this.isToolVisible=(e,t,i)=>e.visible&&("boolean"==typeof e.visible?e.visible:e.visible({layoutItem:i,layoutId:t.id})),this.getToolTitle=(e,t)=>e.title&&("string"==typeof e.title?e.title:e.title({layoutItem:t,formatMessage:this.props.formatMessage})),this.getDropDownItems=e=>{const{appConfig:t,formatMessage:i}=this.props,o=[];if(!this.isSupportDropDown(e.type))return o;const n=function(e){var t;const i=null===(t=null==e?void 0:e.id)||void 0===t?void 0:t.split(l);return!i||i.length<2?null:{layoutId:i[0],layoutItemId:i[1]}}(e),a=t.layouts[n.layoutId],r=s.searchUtils.findLayoutItem(t,n);e.allowRename&&o.push({a11yFocusBack:!1,label:i("rename"),event:t=>{this.handleOnTocDoubleClick(e,t)}});const d=this.getDropdownItemsFromTools(t,n,a,r,e.type);return o.push(...d),this.showExpandCollapseItems(e)&&(o.length>0&&o.push({divider:!0}),o.push({label:this.props.formatMessage("expandAll"),event:t=>{this.handleExpandOrCollapseAll(!0,e,t)}}),o.push({label:this.props.formatMessage("collapseAll"),event:t=>{this.handleExpandOrCollapseAll(!1,e,t)}})),o},this.renderTitleRightContent=i=>{const s=function(e){var i;return t.css`
    margin-right: 8px;
    .title-arrow .jimu-icon {
      transform-origin: center;
      transform: ${`rotate(${e.isExpand&&(null===(i=e.children)||void 0===i?void 0:i.length)?180:0}deg)`};
    }

  `}(i,this.props),n=this.props.formatMessage(i.isExpand?"collapse":"expand");return(0,e.jsx)("div",{css:s,children:(0,e.jsx)(o.Button,{icon:!0,type:"tertiary",size:"sm",className:"title-arrow jimu-outline-inside",title:n,"aria-label":n,"aria-expanded":i.isExpand,disabled:!((null==i?void 0:i.children.length)>0),disableHoverEffect:!0,disableRipple:!0,children:(0,e.jsx)(Ie,{})})})},this.renderCommonRightContent=i=>{const{theme:o,runMode:s}=this.props,n=this.getDropDownItems(i);if(n.length<1)return(0,e.jsx)("div",{});const a=function(e){const{theme:i}=e;return t.css`
    margin-right: 10px;
    .dropDown {
      visibility: visible;
      .btn {
        visibility: hidden;
        color: ${i.ref.palette.neutral[1e3]};
      }
      .btn:hover {
        color: ${i.ref.palette.black};
      }
    }
  `}(this.props);return(0,e.jsx)("div",{className:"d-flex item-action-button",css:a,onClick:e=>{e.stopPropagation()},onDoubleClick:e=>{e.stopPropagation()},children:(0,e.jsx)("div",{title:this.props.formatMessage("more"),className:"dropDown",children:(0,e.jsx)(j,{modifiers:qe,direction:"down",theme:o,items:n,insideOutline:!0,avoidNestedToggle:s,delayToggle:s?0:150})})})},this.renderOutlineContent=t=>{var i;const{intl:o,theme:s,formatMessage:n}=this.props,a=!this.checkIfReadOnly(t),{editableItemId:r}=this.state,{type:l}=t,d=["section","view","screenGroup","screen","widget","layout","layoutItem"];"layoutItem"===t.type&&d.push(l);const c=("section"===t.type||"screenGroup"===t.type)&&(null===(i=this.state.currentSelectedItemId)||void 0===i?void 0:i.includes(t.id));return(0,e.jsx)(Re,{className:c?"insideActive":"",intl:o,formatMessage:n,itemJson:t,onArrowClick:this.handleArrowClick,editable:r===t.id,onDoubleClick:a&&this.handleOnTocDoubleClick,renderRightContent:a&&d.includes(l)&&this.renderCommonRightContent,renameItem:this.handleRename,theme:s})},this.state={editableItemId:n.editableItemId,currentSelectedItemId:n.currentSelectedItemId,filterText:"",itemJson:void 0,showSearch:!1,showAlign:!1,showArrange:!1},this.expandIds=[],this.isRTL=null===(r=null===(a=(0,t.getAppStore)().getState())||void 0===a?void 0:a.appContext)||void 0===r?void 0:r.isRTL,this.alignRef=t.React.createRef(),this.arrangeRef=t.React.createRef(),this.tocItemCss=function(e){const{theme:i}=e;return t.css`
    :hover {
      .dropDown {
        z-index: 2;
        .btn {
          display: inline-flex;
        }
      }
      .editor {
        color: ${i.ref.palette.black};
      }
    }
    &.active {
      .editor {
        color: ${i.ref.palette.black};
      }
    }
  `}(n)}componentDidMount(){this.setState({itemJson:this.getItemJsonByAppConfig()})}shouldComponentUpdate(e,i){var o,s,n,a,r,l;const{appConfig:d}=this.props;let c=!1;if(e&&Object.keys(e).some(t=>this.props?"appConfig"!==t&&e[t]!==this.props[t]?(c=!0,!0):void 0:(c=!0,!0)),c)return!0;if(i&&Object.keys(i).some(e=>this.state?i[e]!==this.state[e]?(c=!0,!0):void 0:(c=!0,!0)),c)return!0;if(e.appConfig&&d&&e.appConfig!==d){const i=null==d?void 0:d.layouts,c=null===(o=e.appConfig)||void 0===o?void 0:o.layouts;if(i&&c&&i!==c&&function(e,i){let o=!1;return Object.keys(e).length!==Object.keys(i).length?o=!0:e&&Object.keys(e).some(s=>{const n=e[s],a=i[s];if(n!==a){if(n&&!a||!n&&a)return o=!0,!0;const e=n.content,i=a.content,s=n.order,r=a.order;if(e!==i||s!==r){if(s!==r||e&&!i||Object.keys(e||{}).length!==Object.keys(i||{}).length)return o=!0,!0;if(a.type===t.LayoutType.GridLayout){const t=Object.keys(e).join(",")!==Object.keys(i).join(",");return o=t||Object.keys(i).some(t=>i[t].label!==e[t].label),!0}}if(e&&Object.keys(e).some(t=>{var s,n;const a=e[t],r=i[t];if(a&&!r||(null===(s=null==a?void 0:a.setting)||void 0===s?void 0:s.lockLayout)!==(null===(n=null==r?void 0:r.setting)||void 0===n?void 0:n.lockLayout)||(null==a?void 0:a.isPending)!==(null==r?void 0:r.isPending))return o=!0,!0}),o)return!0}}),o}(i,c))return!0;const p=null==d?void 0:d.widgets,h=null===(s=e.appConfig)||void 0===s?void 0:s.widgets;if(p&&h&&p!==h&&function(e,t){let i=!1;return Object.keys(e).length!==Object.keys(t).length?i=!0:Object.keys(e).some(o=>{const s=e[o],n=t[o];return n?s.label!==n.label||s.icon!==n.icon?(i=!0,!0):void 0:(i=!0,!0)}),i}(p,h))return!0;const g=null==d?void 0:d.sections,u=null===(n=e.appConfig)||void 0===n?void 0:n.sections;if(g&&u&&g!==u&&function(e,t){let i=!1;return Object.keys(e).length!==Object.keys(t).length?i=!0:Object.keys(e).some(o=>{const s=e[o],n=t[o];return n?s.label!==n.label||s.icon!==n.icon||n.views!==s.views?(i=!0,!0):void 0:(i=!0,!0)}),i}(g,u))return!0;const m=null==d?void 0:d.views,f=null===(a=e.appConfig)||void 0===a?void 0:a.views;if(m&&f&&m!==f&&function(e,t){let i=!1;return Object.keys(e).length!==Object.keys(t).length?i=!0:Object.keys(e).some(o=>{const s=e[o],n=t[o];return n?s.label!==n.label||s.icon!==n.icon?(i=!0,!0):void 0:(i=!0,!0)}),i}(m,f))return!0;const v=null==d?void 0:d.screenGroups,b=null===(r=e.appConfig)||void 0===r?void 0:r.screenGroups;if(v&&b&&v!==b&&function(e,t){let i=!1;return Object.keys(e).length!==Object.keys(t).length?i=!0:Object.keys(e).some(o=>{const s=e[o],n=t[o];return n?s.label!==n.label||s.icon!==n.icon||n.screens!==s.screens?(i=!0,!0):void 0:(i=!0,!0)}),i}(v,b))return!0;const y=null==d?void 0:d.screens,x=null===(l=e.appConfig)||void 0===l?void 0:l.screens;if(y&&x&&y!==x&&function(e,t){let i=!1;return Object.keys(e).length!==Object.keys(t).length?i=!0:Object.keys(e).some(o=>{const s=e[o],n=t[o];return n?s.label!==n.label?(i=!0,!0):void 0:(i=!0,!0)}),i}(y,x))return!0}return!1}componentDidUpdate(e,t){const i=this.props,{itemJson:o,currentSelectedItemId:s,editableItemId:n}=this.state;let a,r=!1;if(i.currentSelectedItemId!==this.state.currentSelectedItemId||n!==t.editableItemId||i.enableFooter!==e.enableFooter||i.enableHeader!==e.enableHeader||i.appConfig!==e.appConfig||i.currentPageId!==e.currentPageId||i.currentDialogId!==e.currentDialogId||i.browserSizeMode!==e.browserSizeMode||e.runMode!==this.props.runMode){if(r=!0,i.appConfig===e.appConfig&&i.currentPageId===e.currentPageId&&i.currentDialogId===e.currentDialogId&&i.browserSizeMode===e.browserSizeMode||i.currentSelectedItemId===this.state.currentSelectedItemId)if(i.currentSelectedItemId!==s){const e=B(o,[i.currentSelectedItemId]);a={currentSelectedItemId:i.currentSelectedItemId,itemJson:e},this.expandIds=J(e)}else{if(void 0!==e.lockLayout&&this.props.lockLayout!==e.lockLayout&&!this.isViewOrScreenSelected(s))return;if(i.currentPageId!==e.currentPageId&&this.state.filterText)return void this.handleSearchBtnClick();if(e.runMode!==this.props.runMode&&i.currentDialogId===e.currentDialogId&&!this.isViewOrScreenSelected(s))return;a={itemJson:this.getItemJsonByAppConfig(i)}}else{const t=B(this.getItemJsonByAppConfig(i),[i.currentSelectedItemId]);a={currentSelectedItemId:i.currentSelectedItemId,itemJson:t},i.currentPageId!==e.currentPageId&&this.state.showSearch&&this.handleSearchBtnClick(),this.expandIds=J(t)}r&&this.setState(a)}}render(){const{itemJson:i,showSearch:s}=this.state,{theme:n}=this.props;return(0,e.jsxs)("div",{css:Je(this.props,this.state),children:[(0,e.jsxs)("div",{className:"outline-list-top",children:[(0,e.jsx)(o.Button,{className:"d-block justify-content-center pt-0 pb-0 border-0","aria-label":this.props.formatMessage("dragHandler"),css:t.css`line-height: 0%; margin: 0 auto; cursor: ns-resize !important;`,icon:!0,variant:"text",size:"sm",disableHoverEffect:!0,disableRipple:!0,ref:this.props.resizeIcon,children:(0,e.jsx)(_e,{color:n.ref.palette.neutral[900],"aria-hidden":!0})}),(0,e.jsxs)("div",{className:"d-flex justify-content-between align-items-end",children:[(0,e.jsx)("div",{className:"outline-title mb-0 text-truncate",children:this.props.formatMessage("outline")}),(0,e.jsx)("div",{className:"d-flex outline-top-buttons",children:(0,e.jsx)(o.Button,{icon:!0,size:"sm",type:"tertiary",title:this.props.formatMessage("search"),"aria-label":this.props.formatMessage("search"),"aria-pressed":s,className:"search-btn",onClick:this.handleSearchBtnClick,children:(0,e.jsx)(We,{className:"search-icon"})})})]}),(0,e.jsx)(o.Collapse,{isOpen:s,onEntered:this.handleSearchOpened,children:(0,e.jsx)(Ee,{theme:n,placeholder:this.props.formatMessage("search"),searchText:this.state.filterText,onSearchTextChange:this.handleSearchTextChange,onSubmit:this.handleSearchSubmit,inputRef:e=>{this.searchInput=e}})})]}),(0,e.jsx)("div",{className:"w-100 outline-tree-container",children:(0,e.jsx)($,{hideRoot:true,className:"outline-tree",itemJson:i,onClickItem:this.handleClickItem,handleExpand:this.handleExpand})})]})}}const Qe=t.ReactRedux.connect((e,i)=>{var o,n,a,r,l,d,c,p,h,g,u,m,f,v,b,y,x,I,w,S,C,j,D,P,T,k,O,A,M,N,R,E,L,B,J;const z=i.currentPageId,F=e.appStateInBuilder&&e.appStateInBuilder.appRuntimeInfo&&e.appStateInBuilder.appRuntimeInfo.selection,$=e.appStateInBuilder&&e.appStateInBuilder.appConfig,U=F&&s.searchUtils.findLayoutItem($,F);let H,G,W;if(U)if(U.type===t.LayoutItemType.Section){const t=null===(a=null===(n=null===(o=e.appStateInBuilder)||void 0===o?void 0:o.appRuntimeInfo)||void 0===n?void 0:n.sectionNavInfos)||void 0===a?void 0:a[U.sectionId],i=null===(r=e.appStateInBuilder)||void 0===r?void 0:r.appConfig.sections[U.sectionId];G=null!==(l=null==t?void 0:t.currentViewId)&&void 0!==l?l:null==i?void 0:i.views[0],H=G?Le(Object.assign(Object.assign({},F),{id:G,sectionOrScreenGroupId:U.sectionId}),"view"):Le(Object.assign({id:U.sectionId},F),"section")}else if(U.type===t.LayoutItemType.ScreenGroup){const t=null===(p=null===(c=null===(d=e.appStateInBuilder)||void 0===d?void 0:d.appRuntimeInfo)||void 0===c?void 0:c.screenGroupNavInfos)||void 0===p?void 0:p[U.screenGroupId],i=e.appStateInBuilder.appConfig.screenGroups[U.screenGroupId].screens[null!==(h=null==t?void 0:t.activeIndex)&&void 0!==h?h:0],o=null===(g=e.appStateInBuilder)||void 0===g?void 0:g.appConfig.screens[i];W=null==o?void 0:o.id,H=W?Le(Object.assign(Object.assign({},F),{id:W,sectionOrScreenGroupId:U.screenGroupId}),"screen"):Le(Object.assign({id:U.screenGroupId},F),"screenGroup")}else void 0!==U.gridType?H=U.type===t.LayoutItemType.Widget?Le(Object.assign({id:U.widgetId||"placeholder"},F),"widget"):Le(Object.assign({id:null},F),"layoutItem"):U.type===t.LayoutItemType.Widget&&(H=Le(Object.assign({id:U.widgetId},F),"widget"));const V=!!(null===(m=null===(u=null==$?void 0:$.pages)||void 0===u?void 0:u[z])||void 0===m?void 0:m.header),Z=!!(null===(v=null===(f=null==$?void 0:$.pages)||void 0===f?void 0:f[z])||void 0===v?void 0:v.footer);return{currentSelectedItemId:H,selection:F,activePagePart:null===(y=null===(b=null==e?void 0:e.appStateInBuilder)||void 0===b?void 0:b.appRuntimeInfo)||void 0===y?void 0:y.activePagePart,allowEditableForDialog:!!(null===(S=null===(w=null===(I=null===(x=null==e?void 0:e.appStateInBuilder)||void 0===x?void 0:x.appConfig)||void 0===I?void 0:I.dialogs)||void 0===w?void 0:w[i.currentDialogId])||void 0===S?void 0:S.layout[i.browserSizeMode]),allowEditableForHeader:!(!V||!(null===(D=null===(j=null===(C=null==e?void 0:e.appStateInBuilder)||void 0===C?void 0:C.appConfig)||void 0===j?void 0:j.header)||void 0===D?void 0:D.layout[i.browserSizeMode])),allowEditableForFooter:!(!Z||!(null===(k=null===(T=null===(P=null==e?void 0:e.appStateInBuilder)||void 0===P?void 0:P.appConfig)||void 0===T?void 0:T.footer)||void 0===k?void 0:k.layout[i.browserSizeMode])),allowEditable:!!(null===(N=null===(M=null===(A=null===(O=null==e?void 0:e.appStateInBuilder)||void 0===O?void 0:O.appConfig)||void 0===A?void 0:A.pages)||void 0===M?void 0:M[z])||void 0===N?void 0:N.layout[i.browserSizeMode]),appConfig:$,lockLayout:null===(L=null===(E=null===(R=null==e?void 0:e.appStateInBuilder)||void 0===R?void 0:R.appConfig)||void 0===E?void 0:E.forBuilderAttributes)||void 0===L?void 0:L.lockLayout,enableHeader:V,enableFooter:Z,runMode:(null===(J=null===(B=null==e?void 0:e.appStateInBuilder)||void 0===B?void 0:B.appRuntimeInfo)||void 0===J?void 0:J.appMode)===t.AppMode.Run}})(Ye);var Xe=function(e,t,i,o){return new(i||(i=Promise))(function(s,n){function a(e){try{l(o.next(e))}catch(e){n(e)}}function r(e){try{l(o.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(a,r)}l((o=o.apply(e,t||[])).next())})};const et=Object.assign({},r,t.defaultMessages,s.defaultMessages,o.defaultMessages);class tt extends t.React.PureComponent{constructor(s){super(s),this.lastResizeCall=null,this.registerKeyboardEvents=e=>{e&&!this.bindResizeEvent&&(this.bindResizeEvent=!0,e.addEventListener("keydown",e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){let t=this.pageTocRef.current.offsetHeight+("ArrowUp"===e.key?-1:1);t=Math.max(t,100),t=Math.min(t,this.pageTocRef.current.parentElement.offsetHeight-100),this.setState({pageTocH:t})}}))},this.emptyLayout={},this.handleOutlineItemClick=e=>{e.type&&("screenGroup"===e.type||"section"===e.type||"widget"===e.type?this.changeContent(e):"view"===e.type?this.changeView(e):"screen"===e.type?this.changeScreen(e):"layout"===e.type?this.changeLayout(e):"layoutItem"===e.type&&this.changeContent(e),e.pagePart&&i.builderAppSync.publishActivePagePartChangeToApp(e.pagePart))},this.changeCurrentPage=e=>{(0,n.changeCurrentPage)(e)},this.changeEditablePageId=e=>{e!==this.state.editablePageItemId&&this.setState({editablePageItemId:e})},this.movePageIntoPage=(e,o)=>{if(e===o)return;const s=(0,i.getAppConfigAction)().appConfig;(0,i.getAppConfigAction)().movePageIntoPage(e,o).exec();s.pages[e].type===t.PageType.Normal&&this.changeCurrentPage(e)},this.removePage=e=>{const t=(0,i.getAppConfigAction)().appConfig,o=t.pages[e];let s;if(t.pageStructure.some((o,n)=>{const a=Object.keys(o)[0];return a!==e&&(i.appConfigUtils.isRealPage(t,a)?(s=a,!0):void 0)}),s||t.pageStructure.some((o,n)=>{const a=Object.keys(o)[0];if(a===e)return!1;return!!o[a].some(o=>o!==e&&(i.appConfigUtils.isRealPage(t,o)?(s=o,!0):void 0))}),!s)return;let n=o.isDefault;n||t.pageStructure.some((i,o)=>{if(Object.keys(i)[0]===e){return t.pageStructure[o][e].some(e=>{if(t.pages[e].isDefault)return n=!0,!0}),!0}}),i.builderAppSync.publishPageChangeToApp(s),(0,i.getAppConfigAction)().removePage(e,n?s:null).exec()},this.setHomePage=(e,t)=>{var o;(0,i.getAppConfigAction)().replaceHomePage(e).exec();(null===(o=null==t?void 0:t.restrictions)||void 0===o?void 0:o.find(t=>t.pageIds.find(t=>t===e)))?(this.setState({refreshWarning:!0,showWarning:!0}),setTimeout(()=>{this.setState({refreshWarning:!1})},300)):this.setState({refreshWarning:!0,showWarning:!1})},this.duplicatePage=e=>{const o=(0,i.getAppConfigAction)().appConfig,s=(0,i.getAppConfigAction)(),n=s.duplicatePage(e);s.exec();const a=o.pages[e];a.type!==t.PageType.Folder&&a.type!==t.PageType.Link&&this.changeCurrentPage(n.id)},this.duplicateDialog=e=>{const t=(0,i.getAppConfigAction)(),o=t.duplicateDialog(e);t.exec(),this.changeCurrentDialog(o.id)},this.renamePage=(e,t)=>!(!t||""===t)&&((0,i.getAppConfigAction)().editPageProperty(e,"label",t).exec(),this.changeEditablePageId(""),!0),this.orderPageBelowPage=(e,t,o)=>{(0,i.getAppConfigAction)().orderPageToPage(e,t,o).exec()},this.formatMessage=(e,t)=>this.props.intl.formatMessage({id:e,defaultMessage:et[e]},t),this.addPageWithType=(e,o)=>{let s;const n=(0,i.getAppConfigAction)().appConfig;switch(e){case"page":t.ReactDOM.flushSync(()=>{this.setState({isPageTemplateLoading:!0})}),this.loadPageTemplate(o).then(e=>{t.ReactDOM.flushSync(()=>{this.setState({isPageTemplateLoading:!1})}),s=e,s&&(i.builderAppSync.publishChangeBrowserSizeModeToApp((0,i.getAppConfigAction)().appConfig.mainSizeMode),this.changeEditablePageId(s.id))});break;case"link":s=(0,t.Immutable)({}).merge({id:t.appConfigUtils.getUniqueId("page"),type:t.PageType.Link,label:t.appConfigUtils.getUniqueLabel(n,"page",this.formatMessage("link")),linkUrl:"#",isVisible:!0}),(0,i.getAppConfigAction)().addPage(s).exec();break;case"folder":s=(0,t.Immutable)({}).merge({id:t.appConfigUtils.getUniqueId("page"),type:t.PageType.Folder,label:t.appConfigUtils.getUniqueLabel(n,"page",this.formatMessage("folder")),isVisible:!0}),(0,i.getAppConfigAction)().addPage(s).exec()}return s&&this.changeEditablePageId(s.id),s},this.changeCurrentDialog=(e,t=!1)=>{(0,n.changeCurrentDialog)(e,t)},this.changeEditableDialogId=e=>{e!==this.state.editableDialogItemId&&this.setState({editableDialogItemId:e})},this.removeDialog=e=>{let o=null;const s=(0,i.getAppConfigAction)().appConfig,a=s.dialogs,r=a[e],{currentDialogId:l}=this.props;if(e===l){let t=null;Object.keys(a).some((e,i)=>{const s=a[e];if(s.mode===r.mode){if(s.index===r.index-1)return o=s.id,!0;s.index===r.index+1&&(t=s.id)}}),o||(o=t||Object.keys(a).filter(t=>a[t].mode===r.mode&&0===a[t].index&&a[t].id!==e)[0]||Object.keys(a).filter(e=>a[e].mode!==r.mode&&0===a[e].index)[0]);const s=(0,n.handelDialogInfos)(o);i.builderAppSync.publishDialogInfosChangeToApp(s),i.builderAppSync.publishDialogChangeToApp(o)}if((0,i.getAppConfigAction)().removeDialog(e).exec(),!r.isSplash&&r.mode===t.DialogMode.Fixed){i.utils.getPageListByDialogId(s.pages,e).map(e=>{(0,i.getAppConfigAction)().editPageProperty(e.id,"autoOpenDialogId","").exec()})}},this.setSplashDialog=e=>{const o=(0,i.getAppConfigAction)().appConfig,s=Object.keys(o.dialogs).filter(e=>o.dialogs[e].isSplash)[0],n=(0,t.getAppStore)().getState().appStateInBuilder.appRuntimeInfo.currentDialogId;(0,i.getAppConfigAction)().replaceSplashDialog(e,s).exec(),s===e&&e===n&&this.changeCurrentDialog(e,!0)},this.renameDialog=(e,t)=>!(!t||""===t)&&((0,i.getAppConfigAction)().editDialogProperty(e,"label",t).exec(),this.changeEditableDialogId(""),!0),this.orderDialogBelowDialog=(e,t,o)=>{(0,i.getAppConfigAction)().orderDialogToDialog(e,t,o).exec()},this.addDialog=e=>{this.loadDialogTemplate(e),i.builderAppSync.publishChangeBrowserSizeModeToApp((0,i.getAppConfigAction)().appConfig.mainSizeMode)},this.getUniqueIds=(e,i,o)=>{const s=[];for(let n=0;n<o;n++){const o=t.appConfigUtils.getUniqueId(i);s.push(o),e=e.setIn([i+"s",o],{id:o})}return s},this.getUniqueLabels=(e,i,o)=>{const s=[];for(let n=0;n<o;n++){const o=t.appConfigUtils.getUniqueId(i),n=t.appConfigUtils.getUniqueLabel(e,i,i);s.push(n),e=e.setIn([i+"s",o],{id:o,label:n})}return s},this.changeSelection=e=>{i.builderAppSync.publishChangeSelectionToApp(e)},this.changeContent=e=>{const t=e.id.split(l);this.changeSelection({layoutId:t[0],layoutItemId:t[1],autoScroll:this.props.isScrollingPage})},this.changeView=e=>{const t=e.id.split(l);this.changeSelection({layoutId:t[0],layoutItemId:t[1],autoScroll:this.props.isScrollingPage}),i.builderAppSync.publishSectionNavInfoToApp(t[2],{currentViewId:t[3],useProgress:!1})},this.changeScreen=e=>{const t=e.id.split(l);this.changeSelection({layoutId:t[0],layoutItemId:t[1],autoScroll:this.props.isScrollingPage}),i.builderAppSync.publishScreenGroupNavInfoToApp(t[2],e.index)},this.changeLayout=e=>null,this.getCurrentPageId=()=>{let e;const t=(0,i.getAppConfigAction)().appConfig;return t.pageStructure.some((o,s)=>{const n=Object.keys(o)[0];if(i.appConfigUtils.isRealPage(t,n))return e=n,!0}),e||t.pageStructure.some((o,s)=>o[Object.keys(o)[0]].some(o=>{if(i.appConfigUtils.isRealPage(t,o))return e=o,!0})),i.builderAppSync.publishPageChangeToApp(e),e},this.renderActionBtn=(t,i,s)=>(0,e.jsx)(o.Button,{title:t,size:"sm",className:" rounded-1 icon page-action-btn",onClick:s,children:(0,e.jsx)(o.Icon,{size:12,icon:i})}),this.PageListWrapper=()=>(0,e.jsx)(he,{formatMessage:this.formatMessage,onDefaultClick:e=>{this.setHomePage(e,this.props.permissions)},showWarning:this.state.showWarning,refreshWarning:this.state.refreshWarning,addPageWithType:this.addPageWithType,isPageTemplateLoading:this.state.isPageTemplateLoading,editablePageItemId:this.state.editablePageItemId,theme:this.props.theme,changeEditablePageItemId:this.changeEditablePageId,currentPageItemId:this.props.currentDialogId?null:this.props.currentPageId,removePage:this.removePage,intl:this.props.intl,duplicatePage:this.duplicatePage,renamePage:this.renamePage,reOrderPage:this.orderPageBelowPage,onClickPage:this.changeCurrentPage,movePageIntoPage:this.movePageIntoPage,browserSizeMode:this.props.browserSizeMode}),this.DialogListWrapper=()=>(0,e.jsx)(Ne,{formatMessage:this.formatMessage,forceRefresh:"dialog"===this.state.selectedTabId,onSplashClick:this.setSplashDialog,theme:this.props.theme,intl:this.props.intl,currentDialogItemId:this.props.currentDialogId,addDialog:this.addDialog,removeDialog:this.removeDialog,duplicateDialog:this.duplicateDialog,renameDialog:this.renameDialog,editableDialogItemId:this.state.editableDialogItemId,changeEditableDialogItemId:this.changeEditableDialogId,reOrderDialog:this.orderDialogBelowDialog,onClickDialog:this.changeCurrentDialog}),this.getStyle=e=>{const{pageTocH:i}=this.state;return t.css`
      overflow: hidden;

      .page-toc {
        background-color: ${e.ref.palette.neutral[400]};
        height: ${i>0?`${i}px`:"33%"};

        .page-list,
        .dialog-list{
          height: calc(100% - 10px);
        }
      }

      .outline-toc {
        background-color: ${e.ref.palette.neutral[400]};
        border: 0;
        border-top: 2px solid ${e.ref.palette.neutral[700]};
        height: calc(100% - ${i>0?`${i}px`:"33%"});
      }

    `},this.onTabSelect=e=>{"page"===e&&(0,n.changeCurrentPage)(this.props.currentPageId),this.setState({selectedTabId:e})},this.state={editablePageItemId:"",editableDialogItemId:"",editableOutlineItemId:"",isTemplatePopoverOpen:!1,pageTocH:-1,selectedTabId:null,isPageTemplateLoading:!1,showWarning:!1,refreshWarning:!1},this.resizeRef=t.React.createRef(),this.bindResizeEvent=!1,this.pageTocRef=t.React.createRef(),this.popoverRef=t.React.createRef()}componentDidMount(){this.resizeRef&&this.resizeRef.current&&(this.interactable=(0,a.interact)(this.resizeRef.current).resizable({edges:{top:!0,left:!1,bottom:!1,right:!1},modifiers:[a.interact.modifiers.restrictEdges({outer:"parent",endOnly:!0}),a.interact.modifiers.restrictSize({min:{width:20,height:100}})],inertia:!1,onstart:e=>{e.stopPropagation()},onmove:e=>{e.stopPropagation(),this.lastResizeCall&&cancelAnimationFrame(this.lastResizeCall);const t=e.rect;let i=0;this.pageTocRef.current&&(i=this.pageTocRef.current.getBoundingClientRect().top);const o=t.top-i;o<100||(this.lastResizeCall=requestAnimationFrame(()=>{this.setState({pageTocH:o})}))},onend:e=>{e.stopPropagation(),this.lastResizeCall&&cancelAnimationFrame(this.lastResizeCall),this.lastResizeCall=requestAnimationFrame(()=>{const t=e.rect;let i=0;this.pageTocRef.current&&(i=this.pageTocRef.current.getBoundingClientRect().top),this.lastResizeCall=requestAnimationFrame(()=>{this.setState({pageTocH:t.top-i})})})}}))}componentWillUnmount(){this.lastResizeCall&&cancelAnimationFrame(this.lastResizeCall),this.interactable&&(this.interactable.unset(),this.interactable=null)}loadPageTemplate(e){return Xe(this,void 0,void 0,function*(){const t=(0,i.getAppConfigAction)().appConfig;return yield this.parsePageTemplate(e,t)})}parsePageTemplate(e,s){return Xe(this,void 0,void 0,function*(){if(!e)return yield Promise.resolve(null);(0,t.getAppStore)().dispatch(t.appActions.setIsBusy(!0,o.LoadingType.Skeleton,this.formatMessage("addingPage")));let n=(0,i.getAppConfigAction)(s);try{const t=yield n.createPageFromTemplate(e),o=n.appConfig.pages[t];if(!o)return;const s=n.appConfig.set("pageStructure",n.appConfig.pageStructure.concat([{[o.id]:[]}]));return n=(0,i.getAppConfigAction)(s),n.exec(),this.changeCurrentPage(o.id),this.changeEditablePageId(o.id),o}finally{(0,t.getAppStore)().dispatch(t.appActions.setIsBusy(!1))}})}loadDialogTemplate(e){const t=(0,i.getAppConfigAction)().appConfig;this.parseDialogTemplate(e,t)}parseDialogTemplate(e,s){return Xe(this,void 0,void 0,function*(){if(e){(0,t.getAppStore)().dispatch(t.appActions.setIsBusy(!0,o.LoadingType.Skeleton,this.formatMessage("addingDialog")));try{const t=(0,i.getAppConfigAction)(s),o=yield t.createDialogFromTemplate(e),n=t.appConfig.dialogs[o];return t.exec(),this.changeCurrentDialog(n.id),this.changeEditableDialogId(n.id),n}finally{(0,t.getAppStore)().dispatch(t.appActions.setIsBusy(!1))}}})}render(){const{PageListWrapper:i,DialogListWrapper:s}=this,{currentPageId:n,currentDialogId:a,browserSizeMode:r}=this.props;let l;return l=a||"dialog"===this.state.selectedTabId?"dialog":"page",(0,e.jsxs)("div",{css:this.getStyle(this.props.theme),className:"jimu-widget widget-builder-toc bg-overlay w-100 h-100",children:[(0,e.jsx)("div",{className:"page-toc",ref:this.pageTocRef,children:(0,e.jsxs)(o.Tabs,{value:l,type:"underline",css:t.css`
          height: 100%;
          .jimu-nav {
            border-bottom: none;
            padding: 12px 1px 5px 1px;
            width: calc(100% - 60px);
            overflow: hidden;
          }
          .tab-content{
            height: calc(100% - 56px);
            overflow-y: inherit !important;
            .tab-pane{
              width: 100%;
            }
          }
          .nav-item {
            margin: 0 1rem;
            &:last-of-type{
              margin-right: 0;
            }
            .nav-link{
              padding: 0.5rem 0.25rem;
            }
          }
        `,onChange:this.onTabSelect,children:[(0,e.jsx)(o.Tab,{id:"page",title:this.formatMessage("page"),children:(0,e.jsx)("div",{className:"page-list",children:(0,e.jsx)(i,{})})}),(0,e.jsx)(o.Tab,{id:"dialog",title:this.formatMessage("dialog"),children:(0,e.jsx)("div",{className:"dialog-list",children:(0,e.jsx)(s,{})})})]})}),(0,e.jsx)("div",{className:"outline-toc",ref:this.resizeRef,role:"group","aria-label":this.formatMessage("outline"),children:(0,e.jsx)(Qe,{resizeIcon:e=>{this.registerKeyboardEvents(e)},formatMessage:this.formatMessage,currentPageId:n,currentDialogId:a,browserSizeMode:r,onClickItem:this.handleOutlineItemClick,editableOutlineItemId:this.state.editableOutlineItemId,theme:this.props.theme,intl:this.props.intl})})]})}}tt.mapExtraStateProps=e=>{var i,o,s,n,a,r,l,d,c,p,h;const g=null===(o=null===(i=null==e?void 0:e.appStateInBuilder)||void 0===i?void 0:i.appRuntimeInfo)||void 0===o?void 0:o.currentPageId;return{isScrollingPage:(null===(n=null===(s=null==e?void 0:e.appStateInBuilder)||void 0===s?void 0:s.appConfig)||void 0===n?void 0:n.pages[g].mode)===t.PageMode.AutoScroll,currentPageId:g,currentDialogId:null===(r=null===(a=null==e?void 0:e.appStateInBuilder)||void 0===a?void 0:a.appRuntimeInfo)||void 0===r?void 0:r.currentDialogId,browserSizeMode:null===(l=null==e?void 0:e.appStateInBuilder)||void 0===l?void 0:l.browserSizeMode,dialogInfos:null===(c=null===(d=null==e?void 0:e.appStateInBuilder)||void 0===d?void 0:d.appRuntimeInfo)||void 0===c?void 0:c.dialogInfos,permissions:null===(h=null===(p=null==e?void 0:e.appStateInBuilder)||void 0===p?void 0:p.appConfig)||void 0===h?void 0:h.permission}};const it=tt;function ot(e){p.p=e}})(),h})())}}});