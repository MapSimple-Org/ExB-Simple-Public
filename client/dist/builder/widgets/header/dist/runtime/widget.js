/*! For license information please see widget.js.LICENSE.txt */
System.register(["jimu-core","jimu-core/emotion","jimu-core/react","jimu-for-builder","jimu-for-builder/service","jimu-for-builder/templates","jimu-layouts/layout-builder","jimu-layouts/layout-runtime","jimu-theme","jimu-ui","jimu-ui/advanced/data-source-selector","jimu-ui/advanced/setting-components","jimu-ui/advanced/site-components","jimu-ui/basic/qr-code"],function(e,t){var i={},o={},s={},n={},a={},l={},r={},d={},p={},c={},u={},h={},m={},g={};return Object.defineProperty(s,"__esModule",{value:!0}),{setters:[function(e){i.AppMode=e.AppMode,i.BrowserSizeMode=e.BrowserSizeMode,i.CONSTANTS=e.CONSTANTS,i.DialogMode=e.DialogMode,i.Immutable=e.Immutable,i.Keyboard=e.Keyboard,i.LayoutItemType=e.LayoutItemType,i.LayoutParentType=e.LayoutParentType,i.LayoutType=e.LayoutType,i.PageMode=e.PageMode,i.React=e.React,i.ReactDOM=e.ReactDOM,i.ReactRedux=e.ReactRedux,i.ReactResizeDetector=e.ReactResizeDetector,i.SessionManager=e.SessionManager,i.SystemErrorCode=e.SystemErrorCode,i.appActions=e.appActions,i.classNames=e.classNames,i.css=e.css,i.defaultMessages=e.defaultMessages,i.extensionSpec=e.extensionSpec,i.focusElementInKeyboardMode=e.focusElementInKeyboardMode,i.getAppStore=e.getAppStore,i.hooks=e.hooks,i.jimuHistory=e.jimuHistory,i.loadArcGISJSAPIModule=e.loadArcGISJSAPIModule,i.lodash=e.lodash,i.moduleLoader=e.moduleLoader,i.polished=e.polished,i.portalUrlUtils=e.portalUrlUtils,i.portalUtils=e.portalUtils,i.queryString=e.queryString,i.semver=e.semver,i.urlUtils=e.urlUtils,i.utils=e.utils,i.version=e.version},function(e){o.jsx=e.jsx,o.jsxs=e.jsxs},function(e){Object.keys(e).forEach(function(t){s[t]=e[t]})},function(e){n.builderActions=e.builderActions,n.builderAppSync=e.builderAppSync,n.getAppConfigAction=e.getAppConfigAction,n.helpUtils=e.helpUtils,n.utils=e.utils},function(e){a.AppType=e.AppType,a.appServices=e.appServices,a.getNewTypeKeywordsWhenSaveApp=e.getNewTypeKeywordsWhenSaveApp,a.getPublishStatus=e.getPublishStatus},function(e){l.getFixedModalWindowTemplates=e.getFixedModalWindowTemplates,l.getFixedNonModalWindowTemplates=e.getFixedNonModalWindowTemplates},function(e){r.canDeleteInExpressMode=e.canDeleteInExpressMode,r.splitGridCell=e.splitGridCell},function(e){d.defaultMessages=e.defaultMessages,d.searchUtils=e.searchUtils},function(e){p.styled=e.styled,p.useTheme=e.useTheme,p.withTheme=e.withTheme},function(e){c.AdvancedButtonGroup=e.AdvancedButtonGroup,c.Alert=e.Alert,c.AlertPopup=e.AlertPopup,c.Button=e.Button,c.ButtonGroup=e.ButtonGroup,c.Dropdown=e.Dropdown,c.DropdownButton=e.DropdownButton,c.DropdownItem=e.DropdownItem,c.DropdownMenu=e.DropdownMenu,c.FloatingPanel=e.FloatingPanel,c.Icon=e.Icon,c.Label=e.Label,c.Link=e.Link,c.Loading=e.Loading,c.LoadingType=e.LoadingType,c.Message=e.Message,c.Modal=e.Modal,c.ModalBody=e.ModalBody,c.ModalFooter=e.ModalFooter,c.ModalHeader=e.ModalHeader,c.Option=e.Option,c.Popper=e.Popper,c.Select=e.Select,c.Switch=e.Switch,c.TagInput=e.TagInput,c.TextArea=e.TextArea,c.TextInput=e.TextInput,c.Tooltip=e.Tooltip,c.UserProfile=e.UserProfile,c.defaultMessages=e.defaultMessages},function(e){u.dataComponentsUtils=e.dataComponentsUtils},function(e){h.ProxySettingPopup=e.ProxySettingPopup,h.TemplateSelector=e.TemplateSelector,h.changeCurrentDialog=e.changeCurrentDialog,h.changeCurrentPage=e.changeCurrentPage,h.proxySettingUtils=e.proxySettingUtils},function(e){m.DownloadAppModal=e.DownloadAppModal},function(e){g.QRCode=e.QRCode}],execute:function(){e((()=>{var e={63:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M14 2H2v2h12zM2 1H1v4h14V1H2m2 7H2v6h2zM2 7H1v8h4V7H2m6 1h6v6H8zM7 7h8v8H7V7" clip-rule="evenodd"></path></svg>'},505:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M2 4h12v7H2zM0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4 10a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z" clip-rule="evenodd"></path></svg>'},1496:e=>{"use strict";e.exports=d},1594:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="m2.556 4.75.297 9.75c0 .398.164.78.455 1.06.292.282.688.44 1.1.44h7.184c.412 0 .808-.158 1.1-.44.291-.28.455-.662.455-1.06l.297-9.75zm4.333 8.222a.778.778 0 1 1-1.556 0V7.778a.778.778 0 1 1 1.556 0zm3.667 0a.778.778 0 1 1-1.556 0V7.778a.778.778 0 1 1 1.556 0zM12.058 2.5a1 1 0 0 1-.766-.357l-.659-.786A1 1 0 0 0 9.867 1H6.133a1 1 0 0 0-.766.357l-.659.786a1 1 0 0 1-.766.357H2a1 1 0 0 0-1 1V4h14v-.5a1 1 0 0 0-1-1z"></path></svg>'},1625:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M2 2h3v9H2zm0-1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm4 5V2h8v4zm0 5V7h8v4zm-4.5 3a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1z" clip-rule="evenodd"></path></svg>'},1888:e=>{"use strict";e.exports=p},1972:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M1 3a2 2 0 0 1 2-2h8.086a1 1 0 0 1 .707.293l2.914 2.914a1 1 0 0 1 .293.707v1.982l-.612-.613c-.367-.366-.95-.379-1.302-.027L10.18 9.162a2.625 2.625 0 1 0-3.643 3.643l-.092.092L6.067 15H3a2 2 0 0 1-2-2zm1.75.75a1 1 0 0 1 1-1h5.875a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1H3.75a1 1 0 0 1-1-1zm10.92 4.455c.28-.282.747-.272 1.04.022l1.063 1.063c.294.293.304.76.022 1.04l-5.313 5.314-1.944.35a.463.463 0 0 1-.531-.532l.35-1.944z" clip-rule="evenodd"></path></svg>'},2046:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M11.227 1.312c-.404-.404-1.045-.417-1.432-.03L2.49 8.587l-.48 2.674a.637.637 0 0 0 .73.73l2.673-.48 7.305-7.306c.387-.387.374-1.028-.03-1.431zm-8.114 9.575.32-1.781 4.991-4.992 1.462 1.462-4.992 4.991zm7.473-6.012 1.402-1.4-1.462-1.463-1.401 1.402z" clip-rule="evenodd"></path><path fill="#000" d="M1.5 14a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1z"></path></svg>'},2075:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M1 3a2 2 0 0 1 2-2h8.086a1 1 0 0 1 .707.293l2.914 2.914a1 1 0 0 1 .293.707V13a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm1.75.75a1 1 0 0 1 1-1h5.875a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1H3.75a1 1 0 0 1-1-1zm7.875 6.875a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0" clip-rule="evenodd"></path></svg>'},2199:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M6.671 1c.449 0 .819.338.87.773l.005.102v1.78q7.317.616 7.432 8.277l.022.442v.64q-.002.326-.022.746l-.034.503c-.089.525-.433.757-.82.736-.305-.018-.532-.302-.607-.6l-.103-.398-.108-.388q-.184-.63-.325-.901c-1.298-2.504-3.343-3.685-5.435-3.824v1.38a.875.875 0 0 1-1.364.725l-.087-.067L1.299 6.73a.875.875 0 0 1-.078-1.24l.078-.077 4.796-4.197A.88.88 0 0 1 6.67 1" clip-rule="evenodd"></path></svg>'},2460:e=>{"use strict";e.exports=g},2965:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0yOS44OTgxIDEzLjMxM0wyNy4xMjA5IDE4LjIxMDRWMjUuNjY2OUMyNy4xMjA5IDI2LjEzMDggMjYuOTM5MiAyNi41NzU3IDI2LjYxNTkgMjYuOTAzN0MyNi4yOTI1IDI3LjIzMTcgMjUuODUzOSAyNy40MTYgMjUuMzk2NSAyNy40MTZIMjQuMjE2N1Y4LjI2ODM5QzI0LjIxNjcgOC4wNzMwOCAyNC4xNDAyIDcuODg1NzYgMjQuMDA0IDcuNzQ3NjVDMjMuODY3OCA3LjYwOTU0IDIzLjY4MzIgNy41MzE5NSAyMy40OTA2IDcuNTMxOTVIMTEuNTEwNVYyLjI3NzQyQzExLjUxMDMgMi4yMjg2NSAxMS41MjI4IDIuMTgwNyAxMS41NDY4IDIuMTM4NDNDMTEuNTcwOCAyLjA5NjE3IDExLjYwNTQgMi4wNjEwOSAxMS42NDcgMi4wMzY3OEMxMS42ODg3IDIuMDEyNDYgMTEuNzM2IDEuOTk5NzggMTEuNzg0MSAyQzExLjgzMjEgMi4wMDAyMyAxMS44NzkzIDIuMDEzMzcgMTEuOTIwNyAyLjAzODA3TDE2LjI3NzEgNC41ODYxN0gyNS4zOTY1QzI1Ljg1MzkgNC41ODYxNyAyNi4yOTI1IDQuNzcwNDUgMjYuNjE1OSA1LjA5ODQ2QzI2LjkzOTIgNS40MjY0NyAyNy4xMjA5IDUuODcxMzUgMjcuMTIwOSA2LjMzNTIzVjEwLjcyODFMMjkuNTk2OCAxMi4yMDFDMjkuNzgwMyAxMi4zMDk3IDI5LjkxNDYgMTIuNDg2OSAyOS45NzA5IDEyLjY5NDdDMzAuMDI3MiAxMi45MDI2IDMwLjAwMTEgMTMuMTI0NSAyOS44OTgxIDEzLjMxM1pNMTEuNTEwNSAxOC45NDY4SDE5LjQ5NzJWMTIuMzE4OEgxMS41MTA1VjE4Ljk0NjhaTTE5LjEzNDIgMjMuNzMzN0g3LjUxNzE2QzcuMzI0NTkgMjMuNzMzNyA3LjEzOTkxIDIzLjY1NjEgNy4wMDM3NSAyMy41MThDNi44Njc1OSAyMy4zNzk5IDYuNzkxMDkgMjMuMTkyNiA2Ljc5MTA5IDIyLjk5NzNWNC41ODYxN0g1LjYxMTIzQzUuMTUzODkgNC41ODYxNyA0LjcxNTI4IDQuNzcwNDUgNC4zOTE4OSA1LjA5ODQ2QzQuMDY4NTEgNS40MjY0NyAzLjg4NjgzIDUuODcxMzUgMy44ODY4MyA2LjMzNTIzVjEzLjc5MTdMMS4xMDk2MyAxOC42ODkxQzEuMDU1ODEgMTguNzgzMyAxLjAyMDkgMTguODg3MyAxLjAwNjkzIDE4Ljk5NTNDMC45OTI5NDggMTkuMTAzMiAxLjAwMDE3IDE5LjIxMjkgMS4wMjgxOCAxOS4zMThDMS4wNTYxOSAxOS40MjMgMS4xMDQ0NCAxOS41MjE1IDEuMTcwMTMgMTkuNjA3NkMxLjIzNTgyIDE5LjY5MzYgMS4zMTc2NyAxOS43NjU3IDEuNDEwOTQgMTkuODE5NUwzLjg4NjgzIDIxLjI3NFYyNS42NjY5QzMuODg2ODMgMjYuMTMwOCA0LjA2ODUxIDI2LjU3NTcgNC4zOTE4OSAyNi45MDM3QzQuNzE1MjggMjcuMjMxNyA1LjE1Mzg5IDI3LjQxNiA1LjYxMTIzIDI3LjQxNkgxNC43Mzc5TDE5LjA5NDMgMjkuOTY0MUMxOS4xMzU2IDI5Ljk4NzggMTkuMTgyNCAzMC4wMDAyIDE5LjIyOTkgMzBDMTkuMjc3NSAyOS45OTk4IDE5LjMyNDEgMjkuOTg2OSAxOS4zNjUzIDI5Ljk2MjdDMTkuNDA2NCAyOS45Mzg1IDE5LjQ0MDUgMjkuOTAzOCAxOS40NjQzIDI5Ljg2MkMxOS40ODgxIDI5LjgyMDMgMTkuNTAwNyAyOS43NzI5IDE5LjUwMDkgMjkuNzI0N1YyNC4xMDJDMTkuNTAwOSAyNC4wNTMzIDE5LjQ5MTQgMjQuMDA1MSAxOS40NzI5IDIzLjk2MDJDMTkuNDU0NCAyMy45MTUzIDE5LjQyNzQgMjMuODc0NSAxOS4zOTMzIDIzLjg0MDNDMTkuMzU5MiAyMy44MDYgMTkuMzE4NyAyMy43NzkgMTkuMjc0MiAyMy43NjA3QzE5LjIyOTggMjMuNzQyNCAxOS4xODIyIDIzLjczMzIgMTkuMTM0MiAyMy43MzM3WiIgZmlsbD0iIzQ4RDhFNyIvPg0KPC9zdmc+DQo="},3089:e=>{"use strict";e.exports=u},3317:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M9.329 1a.875.875 0 0 0-.87.773l-.005.102v1.78q-7.317.616-7.432 8.277L1 12.374v.64l.006.35q.006.186.016.396l.034.503c.089.525.433.757.82.736.305-.018.532-.302.607-.6l.103-.398.109-.388q.183-.63.324-.901c1.298-2.504 3.343-3.685 5.435-3.824v1.38a.875.875 0 0 0 1.364.725l.087-.067 4.796-4.196a.875.875 0 0 0 .078-1.24l-.078-.077-4.796-4.197A.88.88 0 0 0 9.33 1" clip-rule="evenodd"></path></svg>'},3600:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M8 2c3.314 0 6 2.574 6 5.75s-2.686 5.75-6 5.75c-.78 0-1.524-.142-2.207-.402Q5.2 12.873 2 14l.198-.52q.879-2.379.549-2.95A5.54 5.54 0 0 1 2 7.75C2 4.574 4.686 2 8 2m0 1C5.23 3 3 5.136 3 7.75c0 .809.212 1.587.613 2.28.282.49.294 1.153.068 2.09l-.08.304.155-.044c1.092-.306 1.81-.391 2.297-.248l.094.031A5.2 5.2 0 0 0 8 12.5c2.77 0 5-2.136 5-4.75S10.77 3 8 3M6 5H5v5h1V8h2v2h1V5H8v2H6zm4 2h1v3h-1zm1-2h-1v1h1z" clip-rule="evenodd"></path></svg>'},4108:e=>{"use strict";e.exports=n},4321:e=>{"use strict";e.exports=c},4324:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 10"><g id="draft"><g id="Union" fill="#000"><path d="M7.718 1.293a1 1 0 0 0-1.415 0L5.596 2l2.122 2.121.707-.707a1 1 0 0 0 0-1.414zM7.01 4.828l-2.12-2.12L1 6.595v2.122h2.121z"></path></g></g></svg>'},4939:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4M6 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0m0 6a2 2 0 1 1 4 0 2 2 0 0 1-4 0" clip-rule="evenodd"></path></svg>'},5160:(e,t,i)=>{"use strict";var o=i(8972);var s="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},n=o.useSyncExternalStore,a=o.useRef,l=o.useEffect,r=o.useMemo,d=o.useDebugValue;t.useSyncExternalStoreWithSelector=function(e,t,i,o,p){var c=a(null);if(null===c.current){var u={hasValue:!1,value:null};c.current=u}else u=c.current;c=r(function(){function e(e){if(!l){if(l=!0,n=e,e=o(e),void 0!==p&&u.hasValue){var t=u.value;if(p(t,e))return a=t}return a=e}if(t=a,s(n,e))return t;var i=o(e);return void 0!==p&&p(t,i)?(n=e,t):(n=e,a=i)}var n,a,l=!1,r=void 0===i?null:i;return[function(){return e(t())},null===r?void 0:function(){return e(r())}]},[t,i,o,p]);var h=n(e,c[0],c[1]);return l(function(){u.hasValue=!0,u.value=h},[h]),d(h),h}},5196:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M2 15a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1zm0-1V2h4v12zm5-7V2h4v5zm0 7V8h4v6z" clip-rule="evenodd"></path><path fill="#000" d="M14 14.5a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-1 0z"></path></svg>'},5531:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 10"><g id="published"><path id="Vector 39 (Stroke)" fill="#000" fill-rule="evenodd" d="M9.771 2.636 4.124 9.478.298 5.713l1.404-1.426 2.27 2.234 4.257-5.158z" clip-rule="evenodd"></path></g></svg>'},5545:e=>{"use strict";e.exports=m},5664:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><g id="EXB-icon-16" fill-rule="evenodd" clip-path="url(#clip0_5431_3865)" clip-rule="evenodd"><path id="Combined-Shape" fill="#00C9DD" d="m0 9 4 2v5l-4-2zm4-7 4 2v5L4 7zm4 7 4 2v5l-4-2z"></path><path id="Combined-Shape_2" fill="#70F2FF" d="m0 9 4-2 4 2-4 2zm4-7 4-2 4 2-4 2zm4 7 4-2 4 2-4 2z"></path><path id="Combined-Shape_3" fill="#008197" d="m4 11 4-2v5l-4 2zm4-7 4-2v5L8 9zm4 7 4-2v4.667L12 16z"></path></g><defs><clipPath id="clip0_5431_3865"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs></svg>'},5737:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="m14 4-6 8-6-8z"></path></svg>'},5762:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M8 11.577 4.461 8.039l.708-.72L7.5 9.65V1h1v8.65l2.33-2.33.709.719zM1 15v-4.038h1V14h12v-3.038h1V15z"></path></svg>'},6055:e=>{"use strict";e.exports=r},6572:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M15.29 6.208 8 1 .71 6.208a.5.5 0 1 0 .58.813L2 6.515V15h12V6.514l.71.507a.5.5 0 0 0 .58-.813M13 5.8 8 2.229 3 5.8V14h3v-4h4v4h3zM9 14H7v-3h2z" clip-rule="evenodd"></path></svg>'},6884:e=>{"use strict";e.exports=l},7386:e=>{"use strict";e.exports=o},7808:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0yOS44OTgxIDEzLjMxM0wyNy4xMjA5IDE4LjIxMDRWMjUuNjY2OUMyNy4xMjA5IDI2LjEzMDggMjYuOTM5MiAyNi41NzU3IDI2LjYxNTkgMjYuOTAzN0MyNi4yOTI1IDI3LjIzMTcgMjUuODUzOSAyNy40MTYgMjUuMzk2NSAyNy40MTZIMjQuMjE2N1Y4LjI2ODM5QzI0LjIxNjcgOC4wNzMwOCAyNC4xNDAyIDcuODg1NzYgMjQuMDA0IDcuNzQ3NjVDMjMuODY3OCA3LjYwOTU0IDIzLjY4MzIgNy41MzE5NSAyMy40OTA2IDcuNTMxOTVIMTEuNTEwNVYyLjI3NzQyQzExLjUxMDMgMi4yMjg2NSAxMS41MjI4IDIuMTgwNyAxMS41NDY4IDIuMTM4NDNDMTEuNTcwOCAyLjA5NjE3IDExLjYwNTQgMi4wNjEwOSAxMS42NDcgMi4wMzY3OEMxMS42ODg3IDIuMDEyNDYgMTEuNzM2IDEuOTk5NzggMTEuNzg0MSAyQzExLjgzMjEgMi4wMDAyMyAxMS44NzkzIDIuMDEzMzcgMTEuOTIwNyAyLjAzODA3TDE2LjI3NzEgNC41ODYxN0gyNS4zOTY1QzI1Ljg1MzkgNC41ODYxNyAyNi4yOTI1IDQuNzcwNDUgMjYuNjE1OSA1LjA5ODQ2QzI2LjkzOTIgNS40MjY0NyAyNy4xMjA5IDUuODcxMzUgMjcuMTIwOSA2LjMzNTIzVjEwLjcyODFMMjkuNTk2OCAxMi4yMDFDMjkuNzgwMyAxMi4zMDk3IDI5LjkxNDYgMTIuNDg2OSAyOS45NzA5IDEyLjY5NDdDMzAuMDI3MiAxMi45MDI2IDMwLjAwMTEgMTMuMTI0NSAyOS44OTgxIDEzLjMxM1pNMTEuNTEwNSAxOC45NDY4SDE5LjQ5NzJWMTIuMzE4OEgxMS41MTA1VjE4Ljk0NjhaTTE5LjEzNDIgMjMuNzMzN0g3LjUxNzE2QzcuMzI0NTkgMjMuNzMzNyA3LjEzOTkxIDIzLjY1NjEgNy4wMDM3NSAyMy41MThDNi44Njc1OSAyMy4zNzk5IDYuNzkxMDkgMjMuMTkyNiA2Ljc5MTA5IDIyLjk5NzNWNC41ODYxN0g1LjYxMTIzQzUuMTUzODkgNC41ODYxNyA0LjcxNTI4IDQuNzcwNDUgNC4zOTE4OSA1LjA5ODQ2QzQuMDY4NTEgNS40MjY0NyAzLjg4NjgzIDUuODcxMzUgMy44ODY4MyA2LjMzNTIzVjEzLjc5MTdMMS4xMDk2MyAxOC42ODkxQzEuMDU1ODEgMTguNzgzMyAxLjAyMDkgMTguODg3MyAxLjAwNjkzIDE4Ljk5NTNDMC45OTI5NDggMTkuMTAzMiAxLjAwMDE3IDE5LjIxMjkgMS4wMjgxOCAxOS4zMThDMS4wNTYxOSAxOS40MjMgMS4xMDQ0NCAxOS41MjE1IDEuMTcwMTMgMTkuNjA3NkMxLjIzNTgyIDE5LjY5MzYgMS4zMTc2NyAxOS43NjU3IDEuNDEwOTQgMTkuODE5NUwzLjg4NjgzIDIxLjI3NFYyNS42NjY5QzMuODg2ODMgMjYuMTMwOCA0LjA2ODUxIDI2LjU3NTcgNC4zOTE4OSAyNi45MDM3QzQuNzE1MjggMjcuMjMxNyA1LjE1Mzg5IDI3LjQxNiA1LjYxMTIzIDI3LjQxNkgxNC43Mzc5TDE5LjA5NDMgMjkuOTY0MUMxOS4xMzU2IDI5Ljk4NzggMTkuMTgyNCAzMC4wMDAyIDE5LjIyOTkgMzBDMTkuMjc3NSAyOS45OTk4IDE5LjMyNDEgMjkuOTg2OSAxOS4zNjUzIDI5Ljk2MjdDMTkuNDA2NCAyOS45Mzg1IDE5LjQ0MDUgMjkuOTAzOCAxOS40NjQzIDI5Ljg2MkMxOS40ODgxIDI5LjgyMDMgMTkuNTAwNyAyOS43NzI5IDE5LjUwMDkgMjkuNzI0N1YyNC4xMDJDMTkuNTAwOSAyNC4wNTMzIDE5LjQ5MTQgMjQuMDA1MSAxOS40NzI5IDIzLjk2MDJDMTkuNDU0NCAyMy45MTUzIDE5LjQyNzQgMjMuODc0NSAxOS4zOTMzIDIzLjg0MDNDMTkuMzU5MiAyMy44MDYgMTkuMzE4NyAyMy43NzkgMTkuMjc0MiAyMy43NjA3QzE5LjIyOTggMjMuNzQyNCAxOS4xODIyIDIzLjczMzIgMTkuMTM0MiAyMy43MzM3WiIgZmlsbD0iIzA5QjhDQSIvPg0KPC9zdmc+DQo="},8013:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"></path></svg>'},8243:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M12 3H4v11h8zM4 1a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z" clip-rule="evenodd"></path></svg>'},8418:(e,t,i)=>{"use strict";e.exports=i(5160)},8972:e=>{"use strict";e.exports=s},8996:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M8 2.125 14.334 14H1.667zm-.882-.47a1 1 0 0 1 1.765 0l6.333 11.874A1 1 0 0 1 14.334 15H1.667a1 1 0 0 1-.882-1.47zM8 4.874a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0L8.9 5.87a.905.905 0 0 0-.9-.995m1 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0" clip-rule="evenodd"></path></svg>'},9044:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M6 6.5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0zM9.5 6a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0v-6a.5.5 0 0 0-.5-.5"></path><path fill="#000" fill-rule="evenodd" d="M11 0H5a1 1 0 0 0-1 1v2H.5a.5.5 0 0 0 0 1h1.6l.81 11.1a1 1 0 0 0 .995.9h8.19a1 1 0 0 0 .995-.9L13.9 4h1.6a.5.5 0 0 0 0-1H12V1a1 1 0 0 0-1-1m0 3V1H5v2zm1.895 1h-9.79l.8 11h8.19z" clip-rule="evenodd"></path></svg>'},9165:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M10 5H6v9h4zM6 3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" clip-rule="evenodd"></path></svg>'},9244:e=>{"use strict";e.exports=i},9298:e=>{"use strict";e.exports=h},9507:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 10"><g id="unpublished-changes" clip-path="url(#clip0_465_2024)"><path id="Vector" fill="#000" d="M0 6h9v2H5v2zm5-4V0l5 4H1V2z"></path></g><defs><clipPath id="clip0_465_2024"><path fill="#fff" d="M0 0h10v10H0z"></path></clipPath></defs></svg>'},9703:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0M6.25 5.621a.6.6 0 0 1 .933-.5l3.568 2.38a.6.6 0 0 1 0 .998l-3.568 2.38a.6.6 0 0 1-.933-.5z" clip-rule="evenodd"></path></svg>'},9860:e=>{"use strict";e.exports=a}},t={};function v(i){var o=t[i];if(void 0!==o)return o.exports;var s=t[i]={exports:{}};return e[i](s,s.exports,v),s.exports}v.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return v.d(t,{a:t}),t},v.d=(e,t)=>{for(var i in t)v.o(t,i)&&!v.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},v.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),v.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},v.p="";var f={};return v.p=window.jimuConfig.baseUrl,(()=>{"use strict";v.r(f),v.d(f,{__set_webpack_public_path__:()=>Ci,default:()=>Di});var e=v(7386),t=v(9244),i=v(4321),o=v(4108),s=v(9860);const n="exb-site-express";var a,l,r;!function(e){e.Experience="Web Experience",e.Template="Web Experience Template"}(a||(a={})),function(e){e.Published="Published",e.Draft="Draft",e.Changed="Changed",e.Publishing="Publishing"}(l||(l={})),function(e){e.Save="Save",e.Saved="Saved",e.Saving="Saving",e.SaveError="Save Error",e.SaveSuccess="Save Success"}(r||(r={}));const d={createNew:"Create new",newExperience:"New experience",undo:"Undo",redo:"Redo",save:"Save",saving:"Saving",saved:"Saved",saveError:"Saving error",saveSuccess:"Saved successfully!",publishing:"Publishing",published:"Published",publishError:"Publishing error",publishSuccess:"Published successfully!",publishTo:"Publish to {portal}",saveAndPublishRemind:"You have unsaved changes. These will be automatically saved and published. Do you want to proceed?",saveAndPreviewRemind:"You have unsaved changes. These will be automatically saved and launched in preview. Do you want to proceed?",saveAndPreview:"Save and preview",publishOptions:"Publish options",copySuccess:"Copied successfully!",changeShareSettings:"Change share settings",viewPublishedItem:"View published item",copyPublishedItemLink:"Copy published item link",headerLeave:"Leave",headerLeaveSite:"Leave site?",headerLeaveDescription:"Changes you made may not be saved.",headerScreenSizes:"Screen sizes",editPageForLargeScreen:"Edit your page for large screen devices",editPageForMediumScreen:"Edit your page for medium screen devices",editPageForSmallScreen:"Edit your page for small screen devices",viewPageForMediumScreen:"View layout for medium screen devices",viewPageForSmallScreen:"View layout for small screen devices",appMode:"Live view",generateTemplate:"Generate template",generatingTemplate:"Generating template",moreOptionsForTool:"More",moreTools:"More tools",access:"Access",generateTemplateSuccess:"Generated template successfully!",generateTemplateError:"Generating error",headerLockLayout:"Lock layout",enableLayoutEditing:"Turn on layout lock to disable layout editing",disableLayoutEditing:"Turn off layout lock to enable layout editing",layoutIsEnabled:"Layout editing is enabled.",layoutIsDisabled:"Layout editing is disabled.",headerHome:"Home",renameExperience:"Rename experience",renameTemplate:"Rename template",turnOnLiveView:"Turn on live view",turnOffLiveView:"Turn off live view",resolution:"Resolution",changeScreenSize:"Change screen size",createNewExperience:"Create new experience",gotIt:"Got it",templateRemind:"You are now working on an experience template.",transferToFullMode:"Switch to full mode",transferToFullModeErrorRemind:"Failed to switch to full mode",transferAppTitle:"Do you want to move this app to full mode?",transferRemind:"You are about to move this app to Full Mode. This action is irreversible. Once moved, the app can only be edited in Full Mode and cannot be reverted to Express Mode. Proceed with caution.",transferDirectly:"Move directly",transferCopy:"Move a copy",scanQRCode:"Scan QR code to view",downloadQRCode:"Download the QR code"};var p=v(3089),c=v(1888),u=v(4939),h=v.n(u),m=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const g=i=>{const o=window.SVG,{className:s}=i,n=m(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:h()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var b=v(2199),y=v.n(b),x=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const w=i=>{const o=window.SVG,{className:s}=i,n=x(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:y()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var S=v(3317),j=v.n(S),M=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const I=i=>{const o=window.SVG,{className:s}=i,n=M(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:j()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var O=v(9044),T=v.n(O),N=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const A=i=>{const o=window.SVG,{className:s}=i,n=N(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:T()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var k=v(2075),z=v.n(k),D=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const C=i=>{const o=window.SVG,{className:s}=i,n=D(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:z()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var P=v(1972),E=v.n(P),L=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const R=i=>{const o=window.SVG,{className:s}=i,n=L(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:E()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};class $ extends t.React.PureComponent{getStyle(e){return t.css`
      .item-inner {
        width: 16px;
        height: 16px;
        position: relative;
      }

      .item-loader-container {
        width: 100%;
        height: 100%;
      }

      .la-ball-fall,
        .la-ball-fall>div {
          position:relative;
          -webkit-box-sizing:border-box;
          -moz-box-sizing:border-box;
          box-sizing:border-box
        }

      .la-ball-fall {
        display:block;
        font-size:0;
        color:${e.ref.palette.black}
      }

      .la-ball-fall>div {
        display:inline-block;
        float:none;
        background-color:currentColor;
        border:0 solid currentColor
      }

      .la-ball-fall {
        width:54px;
        height:18px
      }

      .la-ball-fall>div{
        width:10px;
        height:10px;
        margin:4px;
        border-radius:100%;
        opacity:0;
        -webkit-animation:ball-fall 1s ease-in-out infinite;
        -moz-animation:ball-fall 1s ease-in-out infinite;
        -o-animation:ball-fall 1s ease-in-out infinite;
        animation:ball-fall 1s ease-in-out infinite
      }

      .la-ball-fall>div:nth-of-type(1){
        -webkit-animation-delay:-200ms;
        -moz-animation-delay:-200ms;
        -o-animation-delay:-200ms;
        animation-delay:-200ms
      }

      .la-ball-fall>div:nth-of-type(2){
        -webkit-animation-delay:-100ms;
        -moz-animation-delay:-100ms;
        -o-animation-delay:-100ms;
        animation-delay:-100ms
      }

      .la-ball-fall>div:nth-of-type(3){
        -webkit-animation-delay:0ms;
        -moz-animation-delay:0ms;
        -o-animation-delay:0ms;
        animation-delay:0ms
      }

      .la-ball-fall.la-2x{
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
      }

      .la-ball-fall.la-2x>div{
        width:25%;
        height:25%;
        margin:3%;
      }

      @-webkit-keyframes ball-fall{
        0%{opacity:0;-webkit-transform:translateY(-145%);transform:translateY(-145%)}
        10%{opacity:.5}
        20%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}
        80%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}
        90%{opacity:.5}
        100%{opacity:0;-webkit-transform:translateY(145%);transform:translateY(145%)}
      }

      @-moz-keyframes ball-fall{
        0%{opacity:0;-moz-transform:translateY(-145%);transform:translateY(-145%)}
        10%{opacity:.5}20%{opacity:1;-moz-transform:translateY(0);transform:translateY(0)}
        80%{opacity:1;-moz-transform:translateY(0);transform:translateY(0)}90%{opacity:.5}
        100%{opacity:0;-moz-transform:translateY(145%);transform:translateY(145%)}
      }

      @-o-keyframes ball-fall{
        0%{opacity:0;-o-transform:translateY(-145%);transform:translateY(-145%)}
        10%{opacity:.5}20%{opacity:1;-o-transform:translateY(0);transform:translateY(0)}
        80%{opacity:1;-o-transform:translateY(0);transform:translateY(0)}90%{opacity:.5}
        100%{opacity:0;-o-transform:translateY(145%);transform:translateY(145%)}
      }

      @keyframes ball-fall{
        0%{opacity:0;-webkit-transform:translateY(-145%);
        -moz-transform:translateY(-145%);
        -o-transform:translateY(-145%);
        transform:translateY(-145%)}10%{opacity:.5}
        20%{opacity:1;-webkit-transform:translateY(0);
        -moz-transform:translateY(0);
        -o-transform:translateY(0);
        transform:translateY(0)}
        80%{opacity:1;-webkit-transform:translateY(0);
        -moz-transform:translateY(0);
        -o-transform:translateY(0);
        transform:translateY(0)}
        90%{opacity:.5}
        100%{opacity:0;
        -webkit-transform:translateY(145%);
        -moz-transform:translateY(145%);
        -o-transform:translateY(145%);
        transform:translateY(145%)}
      }
    `}render(){return(0,e.jsx)("div",{className:"w-100 h-100",css:this.getStyle(this.props.theme),children:(0,e.jsx)("div",{className:"item-inner",children:(0,e.jsx)("div",{className:"item-loader-container",children:(0,e.jsxs)("div",{className:"la-ball-fall la-2x",children:[(0,e.jsx)("div",{}),(0,e.jsx)("div",{}),(0,e.jsx)("div",{})]})})})})}}const U=$;var B=v(8972),F=v(8996),Y=v.n(F),H=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const V=i=>{const o=window.SVG,{className:s}=i,n=H(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Y()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var Q=v(2046),W=v.n(Q),_=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const G=i=>{const o=window.SVG,{className:s}=i,n=_(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:W()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var q,K=function(e,t,i,o){return new(i||(i=Promise))(function(s,n){function a(e){try{r(o.next(e))}catch(e){n(e)}}function l(e){try{r(o.throw(e))}catch(e){n(e)}}function r(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(a,l)}r((o=o.apply(e,t||[])).next())})};!function(e){e.AllFolder="AllFolder",e.OtherFolder="OtherFolder"}(q||(q={}));const Z={IMAGE:[".png",".jpg",".gif",".jpeg"]},J=n=>{const a=t.hooks.useTranslation(i.defaultMessages),r=(0,c.useTheme)(),d=(0,B.useRef)(null),p=(0,B.useRef)(null),u=t.css`
    &.modal-dialog{
      width: ${t.polished.rem(640)};
      max-width: ${t.polished.rem(640)};
    }
    & .edit-info-con {
      .info-content-otherinfo {
        width: ${t.polished.rem(346)};
      }
      .info-content-pic {
        width: ${t.polished.rem(240)};
        aspect-ratio: 200/133;
        background-size: 100% 100%;
        background-position: top center;
        margin-right: ${t.polished.rem(20)};
      }
      .edit-thumbnail-btn {
        width: ${t.polished.rem(240)};
        margin-top: ${t.polished.rem(11)};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
        display: block;
      }
      .edit-thumbnail-btn-con:hover .edit-thumbnail-btn {
      }
      .info-title-input {
        margin-bottom: ${t.polished.rem(16)};
      }
      .edit-thumbnail-inp {
        bottom: 0;
        left: 0;
        width: ${t.polished.rem(240)};
        height: ${t.polished.rem(34)};
        opacity: 0;
        cursor: pointer;
      }
      .info-content-label {
        font-size: ${t.polished.rem(14)};
        line-height: ${t.polished.rem(18)};
        color: ${r.ref.palette.neutral[900]};
        font-weight: 600;
        margin-bottom: ${t.polished.rem(10)} !important;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
      }
      .info-content-textarea {
        resize: none;
        box-sizing: border-box;
        font-size: ${t.polished.rem(14)};
        textarea {
          max-height: ${t.polished.rem(87)};
          min-height: ${t.polished.rem(32)};
        }
      }
      .link-button {
        text-decoration: underline;
      }
    }
    .modal-footer {
      .left-btn-container {
        flex: 1;
        .jimu-btn {
          min-width: 100px;
        }
      }
    }
  `,{folderUrl:h,templateHeaderText:m,experienceHeaderText:g,originalAppInfo:v,isOpen:f,toggle:b,changePublishStatus:y,onSaveSuccess:x,onSaveError:w,togglePublishOptionList:S,handleTokenInvalid:j,checkAndShowReadOnlyRemind:M}=n,[I,O]=(0,B.useState)(!1),[T,N]=(0,B.useState)(!1),[A,k]=(0,B.useState)(null),[z,D]=(0,B.useState)([]),[C,P]=(0,B.useState)((null==v?void 0:v.title)||""),[E,L]=(0,B.useState)([]),[R,$]=(0,B.useState)(v),[U,F]=(0,B.useState)((null==v?void 0:v.ownerFolder)||"/"),[Y,H]=(0,B.useState)([]),[Q,W]=(0,B.useState)((null==v?void 0:v.snippet)||""),[_,q]=(0,B.useState)(null);(0,B.useEffect)(()=>{f&&(ee(),te(),X(),J())},[f]);const J=()=>{var e,i;const o=(null===(i=null===(e=(0,t.getAppStore)().getState())||void 0===e?void 0:e.user)||void 0===i?void 0:i.username)||"",s=(null==v?void 0:v.owner)===o;F(s&&(null==v?void 0:v.ownerFolder)||"/")},X=()=>{var e,t;const i=(null==v?void 0:v.tags)?null===(e=null==v?void 0:v.tags)||void 0===e?void 0:e.asMutable({deep:!0}):[],o=null==i?void 0:i.filter(e=>e);P((null==v?void 0:v.title)||""),$(v),F((null==v?void 0:v.ownerFolder)||"/"),H(o),W((null==v?void 0:v.snippet)||""),ce(null===(t=null==v?void 0:v.classification)||void 0===t?void 0:t.asMutable({deep:!0}))},ee=()=>{var e,i;if(window.jimuConfig.isDevEdition)return!1;const o=(null===(i=null===(e=(0,t.getAppStore)().getState())||void 0===e?void 0:e.user)||void 0===i?void 0:i.username)||"";o&&s.appServices.getUserTags(o).then(e=>{var t;const i=null===(t=null==e?void 0:e.tags)||void 0===t?void 0:t.map(e=>e.tag);L(i||[])})},te=()=>!window.jimuConfig.isDevEdition&&s.appServices.getFolders({num:1}).then(e=>{ie(e||[])},e=>Promise.reject(new Error(e))),ie=e=>{const i=(0,t.getAppStore)().getState().user,o=(null==i?void 0:i.username)||"",s=[];o&&s.push({value:"/",text:o}),e.forEach(e=>{const t={value:e.id,text:e.title};s.push(t)}),D(s)},oe=()=>{N(!T)},se=(e,t=!1)=>{let i=e.target.value;i=i.length>250?i.slice(0,250):i;let o=R;window.jimuConfig.isDevEdition&&(o=o.set("text",""));t&&(i=/^[ ]*$/.test(i)?R.title:i,i=null==i?void 0:i.replace(/(^\s*)|(\s*$)/g,"")),o=o.set("name",i),o=o.set("title",i),$(o),P(i)},ne=(0,B.useRef)(null),ae=t.hooks.useEventCallback(()=>K(void 0,void 0,void 0,function*(){if(M())return void b();if(O(!0),(null==me?void 0:me.ClassificationConfigModalContent)&&!v.classification){yield ne.current.validateForm();if(!ne.current.valid)return ye||xe(!0),void O(!1)}const e=p.current||null,i=window.jimuConfig.isDevEdition?null:U,n=le(v);o.builderAppSync.publishChangeSelectionToApp(null);const a={title:R.title,name:R.name,tags:R.tags,snippet:R.snippet};ue&&(a.classification=R.classification),s.appServices.saveAsApp(null==n?void 0:n.asMutable({deep:!0}),a,i,e).then(e=>{const{id:i}=e;(0,t.getAppStore)().dispatch(o.builderActions.refreshAppListAction(!0));const s=R.set("id",i).set("thumbnailurl",null);$(s),o.builderAppSync.publishAppInfoChangeToApp(s),t.jimuHistory.changeQueryObject({id:i},!1),O(!1),b(),y(l.Draft),x(),S&&S()},e=>{O(!1),re(),j(e)})})),le=e=>{let i=e.typeKeywords||[];return i=i.map(e=>e.includes("version:")?`version:${t.version}`:e.includes("publishVersion:")?`publishVersion:${t.version}`:e.includes("status:")?`status: ${l.Draft}`:e),e.set("typeKeywords",i)},re=()=>{O(!1),b(),w()},de=()=>{var e;b(),w(!0),q(null),W(""),xe(!1),ce(null===(e=null==v?void 0:v.classification)||void 0===e?void 0:e.asMutable({deep:!0}))},[pe,ce]=(0,B.useState)(),[ue,he]=(0,B.useState)(!0),[me,ge]=t.React.useState(null),ve=t.ReactRedux.useSelector(e=>t.portalUtils.shouldShowClassificationConfig(e)),fe=(0,B.useRef)(null),be=`${t.React.useId()}-app-edit-info-classification-banner-text`,[ye,xe]=(0,B.useState)(!1),we=()=>{xe(!0),ve&&!me&&(0,t.loadArcGISJSAPIModule)("esri/kernel").then(e=>{e&&t.moduleLoader.loadModule("jimu-ui/advanced/portal-components").then(ge)}).catch(e=>{console.error("loadArcGISJSAPIModule error",e)})};return(0,e.jsxs)(i.Modal,{isOpen:null==n?void 0:n.isOpen,centered:!0,returnFocusAfterClose:!0,css:u,"aria-label":(null==n?void 0:n.isTemplate)?m:g,backdrop:"static",children:[(0,e.jsx)(i.ModalHeader,{toggle:de,children:(null==n?void 0:n.isTemplate)?m:g}),(0,e.jsx)(i.ModalBody,{children:(0,e.jsxs)("div",{className:"edit-info-con h-100","data-testid":"editInfo",children:[(0,e.jsxs)("div",{className:ye?"d-none":"d-flex justify-content-center w-100 h-100","aria-hidden":ye,children:[(0,e.jsxs)("div",{children:[(0,e.jsx)("div",{"data-testid":"thumbnailCon",className:"info-content-pic",style:{backgroundImage:`url(${_||(()=>{const e=null==R?void 0:R.thumbnail,i=(0,t.getAppStore)().getState().portalUrl,o=t.SessionManager.getInstance().getSessionByUrl(i);if(null==R?void 0:R.thumbnailurl)return R.thumbnailurl;let s=e;return s=s?`${i}/sharing/rest/content/items/${R.id}/info/${e}?token=${null==o?void 0:o.token}`:`${h}./dist/runtime/assets/defaultthumb.png`,e&&window.jimuConfig.isDevEdition&&(s=`${window.location.origin}${window.jimuConfig.mountPath}/apps/${R.id}/${e}`),s})()})`}}),(0,e.jsxs)("div",{className:"position-relative edit-thumbnail-btn-con",children:[(0,e.jsx)(i.Button,{className:"edit-thumbnail-btn",title:a("editThumbnail"),children:a("editThumbnail")}),(0,e.jsx)("input",{"data-testid":"thumbnailInput",title:a("editThumbnail"),ref:d,className:"position-absolute edit-thumbnail-inp",type:"file",accept:".png, .jpeg, .jpg, .gif, .bmp",onChange:()=>{const e=d.current.files;if(!e||!e[0])return!1;if(e[0].size>10485760)return k(a("fileSizeTips",{maxSize:"10M"})),N(!0),d.current.value=null,!1;const t=".png";if(!Z.IMAGE.includes(t.toLowerCase()))return k(a("editAppErrorMessage")),oe(),!1;const i=new File([e[0]],`thumbnail${(new Date).getTime()}${t}`,{type:"image/png"}),o=window.URL.createObjectURL(i);q(o),p.current=i}})]})]}),(0,e.jsxs)("div",{className:"info-content-otherinfo flex-grow-1",children:[(0,e.jsx)("div",{className:"info-content-label",title:a("name"),children:a("name")}),(0,e.jsx)(i.TextInput,{value:C,className:"info-title-input",onChange:e=>{let t=e.target.value;t.length>250&&(t=t.slice(0,250)),P(t)},onBlur:e=>{se(e,!0)},onPressEnter:e=>{se(e)}}),(0,e.jsx)("div",{className:"info-content-label",title:a("summaryField"),children:a("summaryField")}),(0,e.jsx)(i.TextArea,{placeholder:a("summaryPlaceholder"),defaultValue:Q,height:80,className:"info-content-textarea form-control mb-4",onAcceptValue:e=>{const t=R.set("snippet",e);$(t),W(e)}}),!window.jimuConfig.isDevEdition&&(0,e.jsxs)("div",{className:"select-choices-con mb-4",children:[(0,e.jsx)("div",{className:"info-content-label",title:a("tags"),children:a("tags")}),(0,e.jsx)(i.TagInput,{"aria-label":a("tags"),values:Y,suggestions:E,onChange:e=>{const t=R.setIn(["tags"],e);H(e),$(t)},name:a("tagsLowerCase"),maxListHeight:80})]}),!window.jimuConfig.isDevEdition&&(0,e.jsxs)("div",{children:[(0,e.jsx)("div",{className:"info-content-label",title:a("saveInFolder"),children:a("saveInFolder")}),(0,e.jsx)(i.Select,{value:U||"/",onChange:e=>{const t=e.target.value;F(t)},children:z.map(t=>(0,e.jsx)(i.Option,{value:t.value,children:t.text},t.value))})]}),ve&&(0,e.jsxs)("div",{children:[(0,e.jsxs)("div",{className:"info-content-label d-flex justify-content-between mt-5",role:"group","aria-label":a("classification"),children:[a("classification"),(0,e.jsx)(i.Button,{className:"jimu-outline-inside",icon:!0,type:"tertiary",size:"sm",ref:fe,onClick:we,"aria-label":a("edit"),"aria-describedby":be,children:(0,e.jsx)(G,{})})]}),(0,e.jsx)("div",{className:"text-truncate",title:null==pe?void 0:pe.banner,id:be,children:(null==pe?void 0:pe.banner)||(0,e.jsx)(i.Link,{className:"link-button p-0",type:"tertiary",onClick:we,children:a("classificationPlaceholder")})})]})]})]}),(null==me?void 0:me.ClassificationConfigModalContent)&&(0,e.jsx)("div",{className:(0,t.classNames)({"d-none":!ye}),"aria-hidden":!ye,children:(0,e.jsx)(me.ClassificationConfigModalContent,{className:"p-1",portalItemId:v.id,values:pe,onChange:(e,t)=>{he(e),$(R.set("classification",t))},ref:ne})}),I&&(0,e.jsx)("div",{style:{position:"absolute",left:"50%",top:"50%",zIndex:1e4},className:"jimu-primary-loading"}),(0,e.jsx)(i.AlertPopup,{isOpen:T,hideCancel:!0,toggle:()=>{N(!T)},children:(0,e.jsxs)("div",{className:"align-middle pt-2",style:{fontSize:"1rem"},children:[(0,e.jsx)(V,{className:"mr-2 align-middle",size:24,color:"var(--sys-color-warning-main)"}),(0,e.jsx)("span",{className:"align-middle",children:A})]})})]})}),(0,e.jsxs)(i.ModalFooter,{children:[ye&&(0,e.jsx)("div",{className:"left-btn-container d-flex justify-content-start",children:(0,e.jsx)(i.Button,{onClick:()=>{var e;xe(!1),ce(null===(e=null==R?void 0:R.classification)||void 0===e?void 0:e.asMutable({deep:!0})),setTimeout(()=>{(0,t.focusElementInKeyboardMode)(fe.current)})},children:a("back")})}),(0,e.jsx)(i.Button,{type:"primary",onClick:ae,disabled:!ue,children:a("commonModalOk")}),(0,e.jsx)(i.Button,{onClick:de,children:a("commonModalCancel")})]})]})},X=Object.assign({},d,i.defaultMessages),ee=o=>{const n=t.hooks.useTranslation(X),a=(0,c.useTheme)(),{originalAppInfo:l,folderUrl:d,appConfig:p,isSave:u,toolListWidth:h,isInDropdown:m,saveState:g,isOpenSaveAsPopper:v,handleTokenInvalid:f,togglePublishOptionList:b,onSaveSuccess:y,setIsOpenSaveAsPopper:x,onSaveError:w,changePublishStatus:S,onSaveClick:j,checkAndShowReadOnlyRemind:M,saveAsPrivileges:I}=o,O=t.React.useRef(u),[T,N]=t.React.useState(r.Saved),A=()=>{M()||(O.current=u,N(r.Saving),x(!0))},k=(null==l?void 0:l.type)===s.AppType.TemplateType;return(0,e.jsxs)("div",{children:[m?(0,e.jsxs)("div",{children:[h<114&&(0,e.jsxs)(i.DropdownItem,{onClick:u?void 0:e=>{j()},title:n("save"),className:"dropdown-more-save save-menu",disabled:u,toggle:!1,children:[g===r.Saving?(0,e.jsx)("div",{className:"d-inline-block toollist-dropdown-icon",style:{width:"16px",height:"16px"},children:(0,e.jsx)(U,{theme:a})}):(0,e.jsx)(C,{className:"toollist-item-icon d-inline-block toollist-dropdown-icon"}),n("save")]}),(0,e.jsxs)(i.DropdownItem,{className:"save-menu",onClick:A,title:n("saveAs"),toggle:!1,disabled:!I,children:[T===r.Saving?(0,e.jsx)("div",{className:"d-inline-block toollist-dropdown-icon",style:{width:"16px",height:"16px"},children:(0,e.jsx)(U,{theme:a})}):(0,e.jsx)(R,{className:"toollist-item-icon d-inline-block toollist-dropdown-icon"}),n("saveAs")]})]}):(()=>{const o=(()=>{switch(g){case r.Save:return n("save");case r.SaveError:return n("saveError");case r.SaveSuccess:return n("saveSuccess");case r.Saved:return n("saved");case r.Saving:return n("saving")}})();return(0,e.jsx)(i.Button,{id:"tooltip_save",className:(0,t.classNames)("toollist-item",{"toollist-item-click":!u,"tool-hidden":h<114}),type:"tertiary",icon:!0,size:"sm",title:o,disabled:u,onClick:e=>{j()},"aria-label":o,children:g===r.Saving?(0,e.jsx)("div",{style:{width:"16px",height:"16px"},children:(0,e.jsx)(U,{theme:a})}):(0,e.jsx)(C,{className:"toollist-item-icon"})})})(),(0,e.jsx)(J,{handleTokenInvalid:f,originalAppInfo:l,isOpen:v,folderUrl:d,appConfig:p,templateHeaderText:n("saveAsTemplateTitle"),experienceHeaderText:n(k?"saveAsNewTemplate":"saveAsAppTitle"),toggle:()=>{x(!v)},changePublishStatus:S,onSaveSuccess:y,onSaveError:(e=!1)=>{N(O.current?r.Saved:r.Save),!e&&w()},togglePublishOptionList:b,checkAndShowReadOnlyRemind:M})]})};var te=v(5664),ie=v.n(te),oe=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const se=i=>{const o=window.SVG,{className:s}=i,n=oe(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:ie()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))},ne=o=>{const s=t.hooks.useTranslation(i.defaultMessages),{itemId:n,isOpen:a,itemProtected:l,detailUrl:r,itemTitle:d,deleteToggle:p,deleteApp:c}=o,u=t.css`
    .icon-con {
      margin-right: ${t.polished.rem(12)};
      svg {
        color: var(--sys-color-error-main);
      }
    }
    .modal-title {
      color: var(--ref-palette-neutral-1000);
    }
    .can-not-delete-con {
      margin-bottom: ${t.polished.rem(16)};
      font-size: ${t.polished.rem(16)};
      font-weight: 500;
      line-height: ${t.polished.rem(24)};
      svg {
        margin: 0 ${t.polished.rem(6)} 0 ${t.polished.rem(6)};
      }
      &>div, div a {
        line-height: ${t.polished.rem(24)};
        display: inline-block;
        color: var(--ref-palette-neutral-1000);
      }
      div a {
        font-size: ${t.polished.rem(14)};
        text-decoration: underline;
        font-weight: 400;
      }
    }
    .delete-remind {
      font-size: ${t.polished.rem(13)};
      color: var(--ref-palette-neutral-1100);
    }
    .cancel-button {
      background: var(--ref-palette-neutral-500);
      color: var(--ref-palette-white);
      border: none;
      color: #fff;
    }
  `;return(0,e.jsxs)(i.Modal,{className:(0,t.classNames)("d-flex justify-content-center"),isOpen:a,centered:!0,returnFocusAfterClose:!0,autoFocus:!0,backdrop:"static",toggle:p,css:u,children:[(0,e.jsx)(i.ModalHeader,{tag:"h4",toggle:p,className:"item-delete-header",children:s("delete")}),(0,e.jsx)(i.ModalBody,{children:(()=>{const t=s(l?"cannotDeleteItemMessage":"itemDeleteRemind");return(0,e.jsxs)("div",{className:"w-100 h-100 d-flex",children:[l&&(0,e.jsx)("div",{className:"icon-con",children:(0,e.jsx)(V,{size:24})}),(0,e.jsxs)("div",{className:"flex-grow-1",children:[l&&(0,e.jsxs)("div",{className:"can-not-delete-con",children:[s("cannotDeleteItem",{title:""}),(0,e.jsxs)("div",{children:[(0,e.jsx)(se,{size:16}),(0,e.jsx)("a",{href:r,target:"view_window",children:d})]})]}),(0,e.jsx)("div",{className:"delete-remind",children:t})]})]})})()}),(0,e.jsxs)(i.ModalFooter,{children:[!l&&(0,e.jsx)(i.Button,{type:"danger",onClick:e=>{c(n),p()},children:s("delete")}),(0,e.jsx)(i.Button,{className:"cancel-button",onClick:p,children:s("cancel")})]})]})};var ae,le=function(e,t,i,o){return new(i||(i=Promise))(function(s,n){function a(e){try{r(o.next(e))}catch(e){n(e)}}function l(e){try{r(o.throw(e))}catch(e){n(e)}}function r(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(a,l)}r((o=o.apply(e,t||[])).next())})};!function(e){e.AllFolder="AllFolder",e.OtherFolder="OtherFolder"}(ae||(ae={}));const re=t.css`
  & .modal-content {
    border: none;
  }
  .header-con {
    & {
      border: none;
      padding: ${t.polished.rem(30)};
      padding-bottom: 0;
    }
    svg {
      color: var(--sys-color-warning-main);
      border-bottom: none;
      margin-right: ${t.polished.rem(12)} !important;
    }
  }
  .transfer-app-con {
    padding-left: ${t.polished.rem(36)};
  }
  .modal-body {
    padding: ${t.polished.rem(24)} ${t.polished.rem(30)};
  }
  .modal-footer {
    & {
      padding: ${t.polished.rem(30)};
      padding-top: 0;
    }
  }
`,de=a=>{const l=t.hooks.useTranslation(i.defaultMessages,d),{originalAppInfo:r,isOpen:p,isSave:c,toggle:u,handleTokenInvalid:h,checkAndShowReadOnlyRemind:m,toggleErrorAlertPopupTips:g}=a,[v,f]=(0,B.useState)(!1),[b,y]=(0,B.useState)(!1),[x,w]=(0,B.useState)(null);(0,B.useEffect)(()=>{!c&&p&&(y(!0),w(l("headerLeaveDescription")))},[c,p]);const S=()=>{if(m())return void u();f(!0);const e=T();s.appServices.transferAppToFullMode({appInfo:null==r?void 0:r.asMutable({deep:!0}),folderId:e,transferDirectly:!1}).then(e=>{const{id:t,appInfo:i}=e;I(i,t)},e=>{M(e)})},j=()=>{O().then(e=>{const{appInfo:t}=e;I(t,t.id)},e=>{M(e)})},M=e=>{f(!1),h(e),g(!0,l("transferToFullModeErrorRemind")),u()},I=(e,i)=>{f(!1),u(),setTimeout(()=>{o.builderAppSync.publishChangeSelectionToApp(null),t.utils.removeFromLocalStorage(n);const s=o.utils.getBuilderUrl(i);window.location.href=s,o.builderAppSync.publishAppInfoChangeToApp(e)},200)},O=()=>le(void 0,void 0,void 0,function*(){if(!m())return f(!0),o.builderAppSync.publishChangeSelectionToApp(null),s.appServices.transferAppToFullMode({appInfo:null==r?void 0:r.asMutable({deep:!0}),transferDirectly:!0});u()}),T=()=>{var e,i;if(window.jimuConfig.isDevEdition)return null;let o="/";const s=(null===(i=null===(e=(0,t.getAppStore)().getState())||void 0===e?void 0:e.user)||void 0===i?void 0:i.username)||"";return(null==r?void 0:r.username)===s&&(null==r?void 0:r.ownerFolder)&&(o=null==r?void 0:r.ownerFolder),o},N=()=>{u(),y(!1)},A=()=>{y(!1)};return(0,e.jsxs)("div",{children:[(0,e.jsxs)(i.Modal,{isOpen:p&&!b,centered:!0,returnFocusAfterClose:!0,css:re,backdrop:"static",children:[(0,e.jsxs)(i.ModalHeader,{className:"header-con",children:[(0,e.jsx)(V,{className:"mr-2",size:24}),l("transferAppTitle")]}),(0,e.jsx)(i.ModalBody,{children:(0,e.jsxs)("div",{className:"transfer-app-con h-100",children:[(0,e.jsx)("div",{children:l("transferRemind")}),v&&(0,e.jsx)("div",{style:{position:"absolute",left:"50%",top:"50%",zIndex:1e4},className:"jimu-primary-loading"})]})}),(0,e.jsxs)(i.ModalFooter,{children:[(0,e.jsx)(i.Button,{disabled:v,type:"primary",onClick:j,title:l("transferDirectly"),children:l("transferDirectly")}),(0,e.jsx)(i.Button,{disabled:v,onClick:S,title:l("transferCopy"),children:l("transferCopy")}),(0,e.jsx)(i.Button,{disabled:v,onClick:u,title:l("commonModalCancel"),children:l("commonModalCancel")})]})]}),p&&(0,e.jsx)(i.AlertPopup,{severity:"warning",withIcon:!0,isOpen:b,title:l("transferToFullMode"),description:x,closable:!0,onClickOk:A,onClickClose:N})]})},pe=t.css`
  & {
    left: 50%;
    transform: translateX(-50%);
    top: 54px;
  }
`,ce=o=>{const{open:s,message:n,type:a,toggle:l}=o,r=(0,e.jsx)("div",{className:"position-fixed alert-popup-con",css:pe,children:(0,e.jsx)(i.Alert,{"aria-live":"polite",closable:!0,banner:!0,form:"basic",onClose:()=>{l(!1)},open:s,shape:"none",text:n,type:a||"error",variant:"contained",withIcon:!0})});return t.ReactDOM.createPortal(r,document.body)};var ue=v(2460),he=v(5762),me=v.n(he),ge=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const ve=i=>{const o=window.SVG,{className:s}=i,n=ge(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:me()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var fe;!function(e){e.Draft="Draft",e.Published="Published"}(fe||(fe={}));const be=o=>{const s=t.hooks.useTranslation(i.defaultMessages,d),n=(0,c.useTheme)(),a=t.React.useRef(null),[r,p]=t.React.useState(fe.Draft),u=t.React.useCallback(()=>{var e,t;let i="";if(o.url){i=window.location.origin+o.url;const s=new URL(i);let n=null;o.publishStatus===l.Draft||o.publishStatus===l.Published?n=o.publishStatus:o.publishStatus===l.Changed&&(n=r),n===l.Published&&(null===(e=s.searchParams)||void 0===e?void 0:e.has("draft"))&&(null===(t=s.searchParams)||void 0===t||t.delete("draft"),i=s.toString())}return i},[o.publishStatus,r,o.url]),[h,m]=t.React.useState("");t.React.useEffect(()=>{m(u())},[o.url,r,o.publishStatus,u]);const g=s("scanQRCode"),v=s("itemStatusDraft"),f=s("published"),b=t.React.useCallback(()=>{let e="";return o.publishStatus===l.Draft?e=v:o.publishStatus===l.Published?e=f:o.publishStatus===l.Changed&&(r===fe.Draft?e=v:r===fe.Published&&(e=f)),e},[o.publishStatus,r,v,f]),y=s("downloadQRCode")+" "+b();return(0,e.jsxs)("div",{className:"qr-code-comp px-4 pt-2 pb-4 jimu-outline-inside",css:t.css`
    &.qr-code-comp {
      /*max-width: 222px;*/

      .jimu-qrcode {
        margin: 20px;
      }

      .tips-btns {
        .draft-published {
          max-width: calc(100% - 16px - 8px);
        }
      }
    }
  `,role:"menuitem",tabIndex:0,"aria-label":g,children:[(0,e.jsx)("div",{className:"pb-2 text-truncate",title:g,children:g}),(0,e.jsxs)("div",{children:[o.publishStatus===l.Publishing&&(0,e.jsx)("div",{style:{position:"relative",height:"216px",width:"190px"},children:(0,e.jsx)(i.Loading,{type:i.LoadingType.Secondary})}),o.publishStatus!==l.Publishing&&(0,e.jsx)("div",{style:{border:"1px solid var(--sys-color-divider-secondary)"},children:(0,e.jsx)(ue.QRCode,{level:"M",size:140,marginSize:1,hideDownloadBtn:!0,onRef:e=>a.current=e,value:h,downloadFileName:"Exb_QRCode",fgColor:n.ref.palette.neutral[1100],bgColor:n.ref.palette.neutral[500],id:"app-qr-code-content"})})]}),(0,e.jsxs)("div",{className:"tips-btns mt-3 justify-content-between align-items-center "+(o.publishStatus===l.Publishing?"d-none":"d-flex"),children:[o.publishStatus===l.Draft&&(0,e.jsx)(i.Label,{className:"draft-published text-truncate mb-0",title:v,"aria-label":v,children:v}),o.publishStatus===l.Published&&(0,e.jsx)(i.Label,{className:"draft-published text-truncate mb-0",title:f,"aria-label":f,children:f}),o.publishStatus===l.Changed&&(0,e.jsxs)(i.ButtonGroup,{className:"draft-published d-flex",color:"primary",size:"default",variant:"outlined",role:"radiogroup",children:[(0,e.jsx)(i.Button,{size:"sm",type:"tertiary",className:"draft",style:{maxWidth:80},title:v,"aria-label":v,role:"radio","aria-checked":r===fe.Draft,active:r===fe.Draft,onClick:()=>{p(fe.Draft)},children:(0,e.jsxs)("div",{className:"text-truncate",children:[" ",v," "]})}),(0,e.jsx)(i.Button,{size:"sm",type:"tertiary",className:"published",style:{maxWidth:80},title:f,"aria-label":f,role:"radio","aria-checked":r===fe.Published,active:r===fe.Published,onClick:()=>{p(fe.Published)},children:(0,e.jsxs)("div",{className:"text-truncate",children:[" ",f," "]})})]}),(0,e.jsx)("div",{className:"download d-flex",children:(0,e.jsx)(i.Button,{title:y,"aria-describedby":"app-qr-code-content","aria-label":y,icon:!0,size:"sm",type:"tertiary",onClick:()=>{var e;null===(e=a.current)||void 0===e||e.downloadImg()},children:(0,e.jsx)(ve,{})})})]})]})};var ye=v(5545),xe=function(e,t,i,o){return new(i||(i=Promise))(function(s,n){function a(e){try{r(o.next(e))}catch(e){n(e)}}function l(e){try{r(o.throw(e))}catch(e){n(e)}}function r(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(a,l)}r((o=o.apply(e,t||[])).next())})};function we(e){const{queryObject:i,isTemplate:o,isDraft:s}=e;let n=t.urlUtils.getAppUrl({id:i.id,type:o?"template":"app",isDraft:s});return i.locale&&(n=t.urlUtils.appendQueryParam(n,"locale",i.locale)),i.__env__&&(n=t.urlUtils.appendQueryParam(n,"__env__",i.__env__)),n}const Se=e=>{const i=(null==e?void 0:e.groups)||(0,t.Immutable)([]),o=[];return i.forEach(e=>{e.capabilities.indexOf("updateitemcontrol")>-1&&o.push(e.id)}),o};var je=v(9298),Me=function(e,t,i,o){return new(i||(i=Promise))(function(s,n){function a(e){try{r(o.next(e))}catch(e){n(e)}}function l(e){try{r(o.throw(e))}catch(e){n(e)}}function r(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(a,l)}r((o=o.apply(e,t||[])).next())})};const{useState:Ie,useEffect:Oe,useRef:Te,memo:Ne}=t.React,Ae=Ne(n=>{const a=Te(!1),p=t.hooks.useTranslation(d,i.defaultMessages),{publishStatus:c,isDataSourceHadInit:u,saveState:h,stateHistory:m,appItem:g,appConfig:v}=n,{isInOnLine:f,checkAndShowReadOnlyRemind:b,changePublishStatus:y,handleTokenInvalid:x,toastNote:w,onSaveClick:S,toggleErrorAlertPopupTips:j}=n,[M,I]=Ie(null),[O,T]=Ie(!1),[N,A]=Ie(!1);Oe(()=>{const e=f()?"ArcGIS Online":"Portal for ArcGIS",t=window.jimuConfig.isDevEdition?"":p("publishTo",{portal:e});I(t)},[]);const k=t.hooks.useEventCallback(()=>Me(void 0,void 0,void 0,function*(){const e=b();if(c===l.Publishing||e)return;if(E())z();else{(yield je.proxySettingUtils.needToConfigProxy())?z(!1):T(!0)}})),z=t.hooks.useEventCallback((...e)=>Me(void 0,[...e],void 0,function*(e=!0){(yield je.proxySettingUtils.needToConfigProxy())?A(!0):e?C():D(v)})),D=e=>(y(l.Publishing),a.current=!0,S(e,null,!0).then(()=>{C()},e=>{P(e)})),C=()=>{y(l.Publishing),a.current=!0,s.appServices.publishApp(g).then(e=>{o.builderAppSync.publishAppInfoChangeToApp(e),y(l.Published),w(p("publishSuccess")),a.current=!1},e=>{P(e)}).catch(e=>{P(e)})},P=e=>{e&&(console.error(e),x(e)),a.current=!1,j(!0,p("publishError")),y(l.Changed)},E=t.hooks.useEventCallback(()=>h===r.Saved||m.past.length<=1&&m.future.length<1);return(0,e.jsxs)("div",{children:[(0,e.jsx)(i.Button,{className:"ml-2 tool-list-publish",onClick:k,disabled:((e,t)=>!!a.current||(e===l.Published||e===l.Publishing||!t))(c,u),title:M,"aria-label":M,children:(0,e.jsx)("span",{children:(e=>{if(a.current)return p("publishing");switch(e){case l.Published:return p("published");case l.Publishing:return p("publishing");case l.Changed:case l.Draft:return p("publish")}})(c)})}),(0,e.jsx)(je.ProxySettingPopup,{isOpen:N,onToggle:()=>{A(!N)},onCancel:()=>{A(!1)},onFinish:e=>Me(void 0,void 0,void 0,function*(){return A(!1),D(e)}),appHasBeenSaved:E()}),(0,e.jsx)(i.AlertPopup,{severity:"warning",withIcon:!0,isOpen:O,title:p("publish"),description:p("saveAndPublishRemind"),toggle:e=>{T(!1),e&&z(!1)},okLabel:p("saveAndPublish"),closable:!0})]})});var ke=v(9703),ze=v.n(ke),De=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const Ce=i=>{const o=window.SVG,{className:s}=i,n=De(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:ze()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))},{memo:Pe,useState:Ee,useEffect:Le}=t.React,Re=Pe(o=>{const s=t.hooks.useTranslation(d,i.defaultMessages),{toolListWidth:n,queryObject:a,isTemplate:l,inDropdown:p,saveState:c,stateHistory:u}=o,{onSave:h,toggleErrorAlertPopupTips:m}=o,[g,v]=Ee(!1),[f,b]=Ee(!0);Le(()=>{const e=x(c,u);b(e)},[c,u]);const y=()=>{v(!0)},x=(e,t)=>e===r.Saved||t.past.length<=1&&t.future.length<1,w=t.hooks.useEventCallback(()=>we({queryObject:a,isTemplate:l,isDraft:!0})),S=()=>{v(!1)},j=n>=152;return(0,e.jsxs)(t.React.Fragment,{children:[p?!j&&(f?(0,e.jsx)(i.DropdownItem,{onClick:void 0,className:"dropdown-more-preview custom-dropdown-item",disabled:n>=184,tag:"a",href:w(),rel:"noreferrer",target:"_blank",title:s("preview"),children:(0,e.jsxs)("div",{id:"tooltip_preview",title:s("preview"),children:[(0,e.jsx)(Ce,{className:"toollist-dropdown-icon"}),s("preview")]})}):(0,e.jsx)(i.DropdownItem,{onClick:y,className:"dropdown-more-preview custom-dropdown-item",disabled:n>=184||c===r.Saving,toggle:!1,children:(0,e.jsxs)("div",{id:"tooltip_preview",title:s("preview"),children:[(0,e.jsx)(Ce,{className:"toollist-dropdown-icon"}),s("preview")]})})):f?(0,e.jsx)(i.Button,{className:(0,t.classNames)("toollist-item toollist-item-click",{"tool-hidden":n<152}),icon:!0,size:"sm",tag:"a",href:w(),rel:"noreferrer",target:"_blank",role:"button",title:s("preview"),type:"tertiary","aria-label":s("preview"),children:(0,e.jsx)(Ce,{className:"toollist-item-icon"})}):(0,e.jsx)(i.Button,{className:(0,t.classNames)("toollist-item toollist-item-click",{"tool-hidden":n<152}),icon:!0,size:"sm",id:"tooltip_preview",title:s("preview"),type:"tertiary",onClick:y,disabled:c===r.Saving,"aria-label":s("preview"),children:(0,e.jsx)(Ce,{className:"toollist-item-icon"})}),(0,e.jsx)(i.AlertPopup,{severity:"warning",withIcon:!0,isOpen:g,title:s("preview"),description:s("saveAndPreviewRemind"),toggle:S,okLabel:s("saveAndPreview"),closable:!0,onClickOk:()=>h(null,null,!0).then(()=>{const e=w();window.open(e,"_blank")},e=>{m(!0,s("saveError"))}),onClickClose:S})]})});var $e,Ue=function(e,t,i,o){return new(i||(i=Promise))(function(s,n){function a(e){try{r(o.next(e))}catch(e){n(e)}}function l(e){try{r(o.throw(e))}catch(e){n(e)}}function r(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(a,l)}r((o=o.apply(e,t||[])).next())})};!function(e){e.NewApp="NewApp",e.SaveAsTemplate="SaveAsTemplate"}($e||($e={}));const Be=Object.assign({},d,i.defaultMessages,t.defaultMessages);class Fe extends t.React.PureComponent{constructor(n){var p;super(n),this.fontSizeBase=14,this.panelWidth=210/this.fontSizeBase+"rem",this.save="save",this.saved="saved",this.saving="saving",this.saveError="saveError",this.saveSuccess="saveSuccess",this.translationMap={},this.hasUpdateAppconfigVersion=!1,this.moreButtonRef=null,this.updateSaveState=()=>{const{appConfig:e,appItem:i}=this.props,{savedAppConfig:o,savedAppItem:s,saveState:n}=this.state;if(n!==r.Saving)if(o||s){const n=this.checkIsAppInfoChange(Object.assign({},i),Object.assign({},s)),a=!t.lodash.isDeepEqual(null==e?void 0:e.asMutable({deep:!0}),null==o?void 0:o.asMutable({deep:!0}));n||a?this.onSaveStateChange(r.Save):this.onSaveStateChange(r.Saved)}else n===this.saveError&&this.onSaveStateChange(r.Save)},this.checkIsAppInfoChange=(e,i)=>(delete e.typeKeywords,delete i.typeKeywords,delete e.title,delete i.title,!t.lodash.isDeepEqual(e,i)),this.getDiffKey=(e,t)=>{const i=[],o=(e,t,s)=>{for(const n in e){const a=e[n],l=null==t?void 0:t[n],r=s?`${s}.${n}`:n;"object"==typeof a&&"object"==typeof l?o(a,l,r):a!==l&&i.push(r)}};return o(e,t,""),i},this.updateToollistWidth=()=>{var e,t;const{toolListWidth:i}=this.state,o=(null===(t=null===(e=this.toolContainer)||void 0===e?void 0:e.current)||void 0===t?void 0:t.clientWidth)||0;i!==o&&this.setState({toolListWidth:o})},this.checkIsSaved=()=>this.state.saveState===r.Saved||this.props.stateHistory.past.length<=1&&this.props.stateHistory.future.length<1,this.onUndo=()=>{this.props.stateHistory.past.length<=1||o.utils.undo()},this.onRedo=()=>{this.props.stateHistory.future.length<=0||o.utils.redo()},this._getTimeOffset=e=>{const t=e.getTimezoneOffset();return(t<0?1:-1)*(t<0?Math.abs(t)/60:t/60)*60*60*1e3},this.onSaveClick=(e,t,...i)=>Ue(this,[e,t,...i],void 0,function*(e,t,i=!1){if(this.props.checkAndShowReadOnlyRemind())return;const{titleText:o}=this.props,s=t||this.props.appItem;this.setState({saveState:r.Saving});let n=e||this.props.appConfig;return n=this.updateExbVersion(n),n=this.updateOriginExbVersion(n),s.title=o,this.toggleErrorAlertPopupTips(!1),yield this.saveRequest(s,n).then(e=>Ue(this,void 0,void 0,function*(){return this.onSaveSuccess(n,s,i),this.updateTypeKeywordsAfterSaveItem(s),yield Promise.resolve(null)}),e=>Ue(this,void 0,void 0,function*(){return console.error(e),this.onSaveError(i),this.props.handleTokenInvalid(e),yield Promise.reject(new Error(e))}))}),this.updateExbVersion=e=>{let i=e;return t.semver.lt(t.version,e.exbVersion)&&(i=s.appServices.replaceExbVersionInAppConfig(e),o.builderAppSync.publishAppConfigChangeToApp(i),this.hasUpdateAppconfigVersion=!0),i},this.updateOriginExbVersion=e=>{let i=e;return t.semver.eq(t.version,e.originExbVersion)||(i=e.set("originExbVersion",t.version),o.builderAppSync.publishAppConfigChangeToApp(i)),i},this.onSaveSuccess=(e,t,i=!1)=>{var o,s;!i&&this.props.toastNote(this.translationMap[this.saveSuccess]),this.setState({savedAppConfig:e||(null===(o=this.props)||void 0===o?void 0:o.appConfig),savedAppItem:t||(null===(s=this.props)||void 0===s?void 0:s.appItem),saveState:r.Saved})},this.onSaveError=(e=!1)=>{this.setState({saveState:r.SaveError}),e||this.toggleErrorAlertPopupTips(!0,this.translationMap[this.saveError])},this.saveRequest=(e,t)=>{const i=(new Date).getTime();return s.appServices.saveApp(e,t.set("timestamp",i),!0)},this.duplicateAppItem=e=>{const t=this.getFolderId();return s.appServices.duplicateApp(e,t).then(e=>Promise.resolve(e),e=>{console.log(e)})},this.updateTypeKeywordsAfterSaveItem=e=>{const t=e||this.props.appItem;t.title=this.props.titleText;const i=(0,s.getNewTypeKeywordsWhenSaveApp)(t);t.typeKeywords=i;const n=(0,s.getPublishStatus)(e);o.builderAppSync.publishAppInfoChangeToApp(t),this.props.changePublishStatus(n)},this.onToggleToolTipUndo=()=>{this.setState({toolTipUndoOpen:!this.state.toolTipUndoOpen,toolTipRedoOpen:!1,toolTipSaveOpen:!1,toolTipPreviewOpen:!1,toolTipPublishOpen:!1,toolTipPublishOptionsOpen:!1})},this.onToggleToolTipRedo=()=>{this.setState({toolTipUndoOpen:!1,toolTipRedoOpen:!this.state.toolTipRedoOpen,toolTipSaveOpen:!1,toolTipPreviewOpen:!1,toolTipPublishOpen:!1,toolTipPublishOptionsOpen:!1})},this.onToggleToolTipSave=()=>{this.setState({toolTipUndoOpen:!1,toolTipRedoOpen:!1,toolTipSaveOpen:!this.state.toolTipSaveOpen,toolTipPreviewOpen:!1,toolTipPublishOpen:!1,toolTipPublishOptionsOpen:!1})},this.onToggleToolTipPreview=()=>{this.setState({toolTipUndoOpen:!1,toolTipRedoOpen:!1,toolTipSaveOpen:!1,toolTipPreviewOpen:!this.state.toolTipPreviewOpen,toolTipPublishOpen:!1,toolTipPublishOptionsOpen:!1})},this.onToggleToolTipPublish=()=>{this.setState({toolTipUndoOpen:!1,toolTipRedoOpen:!1,toolTipSaveOpen:!1,toolTipPreviewOpen:!1,toolTipPublishOpen:!this.state.toolTipPublishOpen,toolTipPublishOptionsOpen:!1})},this.onToggleToolTipPublishOptions=()=>{this.setState({toolTipUndoOpen:!1,toolTipRedoOpen:!1,toolTipSaveOpen:!1,toolTipPreviewOpen:!1,toolTipPublishOpen:!1,toolTipPublishOptionsOpen:!this.state.toolTipPublishOptionsOpen})},this.togglePublishOptionList=()=>{this.setState({publishOptionsListOpen:!this.state.publishOptionsListOpen,toolTipPublishOptionsOpen:!1}),this.state.publishOptionsListOpen||this.props.onMoreOptionOpen()},this.handelTabEvent=e=>!0,this.toggleMoreToolList=()=>{this.setState({moreToolListOpen:!this.state.moreToolListOpen})},this.copyPublishUrlToClipBoard=()=>{const e=location.origin+window.jimuConfig.mountPath+(window.jimuConfig.useStructuralUrl?`experience/${this.props.queryObject.id}/`:`experience/?id=${this.props.queryObject.id}`),i=document.createElement("input");i.value=e,i.style.position="absolute",i.style.opacity="0",document.body.appendChild(i),(0,t.focusElementInKeyboardMode)(i,!0),i.select(),document.execCommand("copy"),document.body.removeChild(i),this.props.toastNote(this.copySuccess),this.setState({publishOptionsListOpen:!1})},this.isInOnLine=()=>t.portalUrlUtils.isAGOLDomain(this.props.portalUrl),this.saveForKeyBoard=()=>(this.state.saveState===r.Saved||this.props.stateHistory.past.length<=1&&this.props.stateHistory.future.length<1||this.state.saveState===r.Saving||this.onSaveClick(),!1),this.isMac=()=>{var e,t;return"macOS"===(null===(t=null===(e=window.jimuUA)||void 0===e?void 0:e.os)||void 0===t?void 0:t.name)},this.newApp=()=>{if(!this.checkIsSaved())return this.setState({isShowLeaveAlertPopup:!0}),this.clickEventType=$e.NewApp,!1;this.toNewApp()},this.toNewApp=()=>{const{locale:e}=this.props,i=e?{redirect:"back",locale:e}:{redirect:"back"},s=e?{page:"template",redirect:"back",locale:e}:{page:"template",redirect:"back"};o.builderAppSync.publishChangeSelectionToApp(null),this.props.itemType===a.Experience?(t.jimuHistory.changePage("template"),window.jimuConfig.useStructuralUrl?t.jimuHistory.changeQueryObject(i,!0):t.jimuHistory.changeQueryObject(s,!0)):this.createNewAppByTemplate(this.props.appItem)},this.createNewAppByTemplate=e=>{s.appServices.createAppByItemTemplateInfo(e).then(e=>{e&&(t.jimuHistory.changeQueryObject({id:e},!0),this.props.changePublishStatus(l.Draft))},()=>null)},this.isConfirmsaveAsTemplate=()=>{if(!this.props.checkAndShowReadOnlyRemind())return this.checkIsSaved()?void this.saveAsTemplate():(this.setState({isShowLeaveAlertPopup:!0}),this.clickEventType=$e.SaveAsTemplate,!1)},this.saveAsTemplate=()=>{var e;this.toggleLoading(!0),s.appServices.createTemplateByApp(null===(e=this.props)||void 0===e?void 0:e.appItem).then(e=>{this.toggleLoading(!1),e&&(this.props.toastNote(this.generateTemplateSuccess),t.jimuHistory.changeQueryObject({id:e},!0),this.props.changePublishStatus(l.Draft))},()=>{this.props.toastNote(this.generateTemplateError),this.toggleLoading(!1)})},this.toggleLoading=e=>{(0,t.getAppStore)().dispatch(t.appActions.setIsBusy(e,i.LoadingType.Skeleton,this.generatingTemplate))},this.deleteApp=(e,i)=>{s.appServices.deleteApp(e).then(()=>{i&&(t.jimuHistory.changeQueryObject({id:i},!0),this.props.changePublishStatus(l.Draft))},e=>{this.props.handleTokenInvalid(e)})},this.handleToggleForLeaveAlertPopup=e=>{if(this.setState({isShowLeaveAlertPopup:!this.state.isShowLeaveAlertPopup}),e)switch(this.clickEventType){case $e.NewApp:this.toNewApp();break;case $e.SaveAsTemplate:this.saveAsTemplate()}},this.nls=e=>this.props.intl?this.props.intl.formatMessage({id:e,defaultMessage:Be[e]}):e,this.getAlertPopTitle=()=>{switch(this.clickEventType){case $e.NewApp:case $e.SaveAsTemplate:return this.nls("headerLeaveSite")}},this.getAlertPopOkLabel=()=>{switch(this.clickEventType){case $e.NewApp:case $e.SaveAsTemplate:return this.nls("headerLeave")}},this.previewAlertPopStyle=()=>{var e,i,o,s,n,a;const l=null===(e=this.props)||void 0===e?void 0:e.theme;return t.css`
      .preview-alert-pop-content {
        font-size: 1rem;
        position: relative;
      }
      .modal-footer {
        padding: 0;
      }
      .modal-content {
        border: 1px solid ${null===(i=null==l?void 0:l.sys.color)||void 0===i?void 0:i.secondary.main};
      }
      .perview-pop-button-con {
        right:0;
        bottom: -20px;
        text-align: right;
        margin-top: ${t.polished.rem(32)};
      }
      .preview-alert-pop-btn {
        min-width: ${t.polished.rem(80)};
        border: none;
        box-sizing: border-box;
        display: inline-block;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        line-height: 1.375rem;
        border-radius: 2px;
        background: transparent;
      }
      .btn-primary {
        color: ${null===(o=l.ref.palette)||void 0===o?void 0:o.black};
        background: ${null===(s=null==l?void 0:l.sys.color)||void 0===s?void 0:s.primary.main};
      }
      .btn-cancle {
        color: ${null===(n=null==l?void 0:l.ref.palette)||void 0===n?void 0:n.neutral[1e3]};
        border-color: ${null===(a=null==l?void 0:l.sys.color)||void 0===a?void 0:a.secondary.dark};
        margin-left: ${t.polished.rem(10)};
        border-width: 1px;
        border-style: solid;
      }
    `},this.getFolderId=()=>{var e,i;const{appItem:o}=this.props;return(null===(i=null===(e=(0,t.getAppStore)().getState())||void 0===e?void 0:e.user)||void 0===i?void 0:i.username)===(null==o?void 0:o.owner)?null:(null==o?void 0:o.ownerFolder)||null},this.onSaveStateChange=e=>{this.setState({saveState:e})},this.setIsOpenSaveAsPopper=e=>{this.setState({isOpenSaveAsPopper:e})},this.handleToggle=()=>{if(this.props.checkAndShowReadOnlyRemind())return;const{appItem:e}=this.props;if(null==e?void 0:e.protected)return void this.setState({isOpenDeletePopper:!0,alertPopupMessage:this.nls("unableDelete")});const{isOpenDeletePopper:t}=this.state;this.setState({isOpenDeletePopper:!t})},this.handleConfirm=e=>{window.onbeforeunload=null,this.setState({loading:!0,isOpenDeletePopper:!1}),s.appServices.deleteApp(e).then(()=>{this.setState({loading:!1});const e=window.isExpressBuilder?"?express=true":"",t=`${window.jimuConfig.mountPath}${e}`;window.location.assign(t)},e=>{this.props.handleTokenInvalid(e),"CONT_0048"===(null==e?void 0:e.code)?this.setState({loading:!1,itemProtected:!0,isOpenDeletePopper:!0,alertPopupMessage:this.nls("unableDelete")}):this.setState({isShowAlertPopup:!0,alertPopupMessage:this.nls("deleteError"),loading:!1})})},this.toggleAlertPopup=()=>{const{isShowAlertPopup:e}=this.state;this.setState({isShowAlertPopup:!e,alertPopupMessage:""})},this.onDownloadAppModalOpen=()=>{this.setState({isOpenDownloadAppModal:!0})},this.onDownloadAppModalClose=()=>{this.setState({isOpenDownloadAppModal:!1}),(0,t.focusElementInKeyboardMode)(this.moreButtonRef)},this.toggleTransferToFullModePopper=()=>{this.setState({openTransferToFullModePopper:!this.state.openTransferToFullModePopper})},this.checkIsAppSaved=()=>{var e,t;const{stateHistory:i}=this.props,{saveState:o}=this.state;return o===r.Saved||(null===(e=null==i?void 0:i.past)||void 0===e?void 0:e.length)<=1&&(null===(t=null==i?void 0:i.future)||void 0===t?void 0:t.length)<1},this.renderMore=()=>{const o=window.jimuConfig.isDevEdition,s=window.isExpressBuilder,{itemType:n,publishStatus:r,stateHistory:p,theme:c,queryObject:u,appItem:h,appConfig:m,canEditItem:v,handleTokenInvalid:f}=this.props,{saveState:b,toolListWidth:y,isOpenSaveAsPopper:x}=this.state,S=n===a.Template,j=this.checkIsAppSaved(),M=we({queryObject:u,isTemplate:S,isDraft:!0}),O=we({queryObject:u,isTemplate:S});return(0,e.jsxs)("div",{className:"tool_more_con h-100",children:[(0,e.jsxs)(i.Dropdown,{size:"sm",toggle:this.togglePublishOptionList,isOpen:this.state.publishOptionsListOpen||x,handelTabEvent:this.handelTabEvent,children:[(0,e.jsx)(i.DropdownButton,{arrow:!1,icon:!0,size:"sm",type:"tertiary",className:"toollist-item-click",title:this.moreOptionsForTool,ref:e=>{this.moreButtonRef=e},children:(0,e.jsx)(g,{className:"toollist-dropdown-icon"})}),(0,e.jsxs)(i.DropdownMenu,{css:this.getDropdownStyle(c),children:[(0,e.jsx)(i.DropdownItem,{onClick:this.onUndo,className:"dropdown-more-undo",disabled:p.past.length<=1||y>=38,toggle:!1,children:(0,e.jsxs)("div",{title:this.undo,children:[(0,e.jsx)(w,{className:"toollist-dropdown-icon",autoFlip:!0}),this.undo]})}),(0,e.jsx)(i.DropdownItem,{onClick:this.onRedo,className:"dropdown-more-redo",disabled:this.props.stateHistory.future.length<1||y>=76,toggle:!1,children:(0,e.jsxs)("div",{title:this.redo,children:[(0,e.jsx)(I,{className:"toollist-dropdown-icon",autoFlip:!0}),this.redo]})}),(0,e.jsx)(ee,{handleTokenInvalid:f,originalAppInfo:(0,t.Immutable)(h),folderUrl:this.props.folderUrl,appConfig:m,isSave:j,toolListWidth:y,isInDropdown:!0,onSaveSuccess:this.onSaveSuccess,onSaveError:this.onSaveError,saveState:b,onSaveStateChange:this.onSaveStateChange,changePublishStatus:this.props.changePublishStatus,onSaveClick:this.onSaveClick,setIsOpenSaveAsPopper:this.setIsOpenSaveAsPopper,isOpenSaveAsPopper:x,togglePublishOptionList:this.togglePublishOptionList,checkAndShowReadOnlyRemind:this.props.checkAndShowReadOnlyRemind,saveAsPrivileges:v}),(0,e.jsx)(Re,{onSave:this.onSaveClick,toggleErrorAlertPopupTips:this.toggleErrorAlertPopupTips,toolListWidth:y,isTemplate:S,saveState:b,stateHistory:this.props.stateHistory,queryObject:this.props.queryObject,inDropdown:!0}),(0,e.jsx)(i.DropdownItem,{onClick:this.handleToggle,className:"dropdown-more-delete",disabled:!v,children:(0,e.jsxs)("div",{id:"tooltip_delete",title:this.delete,children:[(0,e.jsx)(A,{className:"toollist-dropdown-icon"}),this.delete]})}),(0,e.jsx)(i.DropdownItem,{divider:!0}),!o&&(0,e.jsx)(i.DropdownItem,{onClick:()=>{window.open(`${this.props.portalUrl}/home/item.html?id=${this.props.currentAppId}`)},children:this.changeShareSettings}),(0,e.jsx)(i.DropdownItem,{disabled:!this.state.isPublished,onClick:()=>{window.open(O,"_blank"),this.setState({publishOptionsListOpen:!1})},children:this.viewPublishedItem}),o&&r!==l.Draft&&(0,e.jsx)(i.DropdownItem,{onClick:this.onDownloadAppModalOpen,a11yFocusBack:!1,children:this.props.intl.formatMessage({id:"download",defaultMessage:i.defaultMessages.download})}),(0,e.jsx)(i.DropdownItem,{disabled:!this.state.isPublished,onClick:()=>{this.copyPublishUrlToClipBoard()},children:this.copyPublishedItemLink}),r!==l.Draft&&S&&(0,e.jsx)(i.DropdownItem,{onClick:()=>{this.newApp()},children:this.createNewExperience}),!S&&(0,e.jsxs)(t.React.Fragment,{children:[(0,e.jsx)(i.DropdownItem,{divider:!0}),(0,e.jsx)(i.DropdownItem,{onClick:()=>{this.newApp()},children:this.createNew})]}),n===a.Experience&&!s&&(0,e.jsx)(i.DropdownItem,{disabled:!v,onClick:()=>{this.isConfirmsaveAsTemplate()},children:this.generateTemplate}),s&&(0,e.jsx)(t.React.Fragment,{children:(0,e.jsx)(i.DropdownItem,{onClick:this.toggleTransferToFullModePopper,children:this.props.intl.formatMessage({id:"transferToFullMode",defaultMessage:d.transferToFullMode})})}),(0,e.jsx)(i.DropdownItem,{divider:!0}),(0,e.jsx)(be,{url:M,publishStatus:r,isTemplate:S})]})]}),o&&r!==l.Draft&&this.state.isOpenDownloadAppModal&&(0,e.jsx)(ye.DownloadAppModal,{appId:this.props.appItem.id,isOpen:this.state.isOpenDownloadAppModal,onClose:this.onDownloadAppModalClose})]})},this.toggleErrorAlertPopupTips=(e=!1,t)=>{this.setState({openAlertPopupTips:e,errorTipsMessage:t})},this.translationMap[this.save]=this.props.intl.formatMessage({id:"save",defaultMessage:d.save}),this.translationMap[this.saved]=this.props.intl.formatMessage({id:"saved",defaultMessage:d.saved}),this.translationMap[this.saving]=this.props.intl.formatMessage({id:"saving",defaultMessage:d.saving}),this.translationMap[this.saveError]=this.props.intl.formatMessage({id:"saveError",defaultMessage:d.saveError}),this.translationMap[this.saveSuccess]=this.props.intl.formatMessage({id:"saveSuccess",defaultMessage:d.saveSuccess}),this.undo=this.props.intl.formatMessage({id:"undo",defaultMessage:d.undo}),this.redo=this.props.intl.formatMessage({id:"redo",defaultMessage:d.redo}),this.delete=this.props.intl.formatMessage({id:"deleteOption",defaultMessage:i.defaultMessages.deleteOption}),this.publishOptions=this.props.intl.formatMessage({id:"publishOptions",defaultMessage:d.publishOptions}),this.copySuccess=this.props.intl.formatMessage({id:"copySuccess",defaultMessage:d.copySuccess}),this.changeShareSettings=this.props.intl.formatMessage({id:"changeShareSettings",defaultMessage:d.changeShareSettings}),this.viewPublishedItem=this.props.intl.formatMessage({id:"viewPublishedItem",defaultMessage:d.viewPublishedItem}),this.copyPublishedItemLink=this.props.intl.formatMessage({id:"copyPublishedItemLink",defaultMessage:d.copyPublishedItemLink}),this.createNew=this.props.intl.formatMessage({id:"createNew",defaultMessage:d.createNew}),this.createNewExperience=this.props.intl.formatMessage({id:"createNewExperience",defaultMessage:d.createNewExperience}),this.generateTemplate=this.props.intl.formatMessage({id:"generateTemplate",defaultMessage:d.generateTemplate}),this.generatingTemplate=this.props.intl.formatMessage({id:"generatingTemplate",defaultMessage:d.generatingTemplate}),this.moreOptionsForTool=this.props.intl.formatMessage({id:"moreOptionsForTool",defaultMessage:d.moreOptionsForTool}),this.moreTools=this.props.intl.formatMessage({id:"moreTools",defaultMessage:d.moreTools}),this.access=this.props.intl.formatMessage({id:"access",defaultMessage:d.access}),this.generateTemplateSuccess=this.props.intl.formatMessage({id:"generateTemplateSuccess",defaultMessage:d.generateTemplateSuccess}),this.generateTemplateError=this.props.intl.formatMessage({id:"generateTemplateError",defaultMessage:d.generateTemplateError}),this.clickEventType=$e.NewApp,this.state={saveState:r.Save,savedAppConfig:null,savedAppItem:null,toolTipUndoOpen:!1,toolTipRedoOpen:!1,toolTipSaveOpen:!1,toolTipPreviewOpen:!1,toolTipPublishOpen:!1,toolTipPublishOptionsOpen:!1,publishOptionsListOpen:!1,moreToolListOpen:!1,isPublished:!1,isShowLeaveAlertPopup:!1,toolListWidth:184,newAppId:null,isSaveStateSaved:!1,isOpenSaveAsPopper:!1,isOpenDeletePopper:!1,isShowAlertPopup:!1,alertPopupMessage:"",loading:!1,itemProtected:null===(p=n.appItem)||void 0===p?void 0:p.protected,isOpenDownloadAppModal:!1,openTransferToFullModePopper:!1,openAlertPopupTips:!1,errorTipsMessage:null},this.toolContainer=t.React.createRef()}getStyle(e){var i;return t.css`
      button:disabled:hover,button:disabled, .tool_more_con:disabled:hover, .tool_more_con:disabled{
        color:${e.ref.palette.neutral[700]};
      }
      button, .tool_more_con button{
        color:${e.ref.palette.neutral[900]}
      }
      .tool_more_con {
        margin: 0 6px;
      }
      .tool_more_con button:hover {
        color: ${e.ref.palette.black};
      }
      button:disabled:hover {
        border:none;
      }
      .toollist {
        .toollist-length-screen {
          width: ${t.polished.rem(0)};
          overflow: hidden;
          .tool-hidden {
            display: none;
          }
        }

        @media only screen and (max-width: 1025px) {
          .toollist-length-screen {
            width: ${t.polished.rem(0)};
          }
        }
        @media only screen and (min-width: 1025px) {
          .toollist-length-screen {
            width: ${t.polished.rem(38)};
          }
        }
        @media only screen and (min-width: 1071px) {
          .toollist-length-screen {
            width: ${t.polished.rem(76)};
          }
        }
        @media only screen and (min-width: 1117px) {
          .toollist-length-screen {
            width: ${t.polished.rem(114)};
          }
        }
        @media only screen and (min-width: 1163px) {
          .toollist-length-screen {
            width: ${t.polished.rem(152)};
          }
        }

        .tool_more_content {
          width: ${t.polished.rem(38)};
          height: 26px;
          .toollist-dropdown-icon{
            margin: 0
          }
        }
        .toollist-item {
          margin: 4px 6px;
          padding: 5px;
          border: 0;
        }
        .toollist-item-click:focus {
          box-shadow: none !important;
        }
        .tool-list-publish {
          border-radius: 2px;
          min-width: 4.25rem;
          height: ${t.polished.rem(26)};
          color: ${e.ref.palette.black};
          background: ${e.ref.palette.neutral[700]};
          font-size: ${t.polished.rem(13)};
          padding-top: 0;
          padding-bottom: 0;
          border:none;
          &:hover {
            background: ${e.sys.color.primary.main};
            border:none;
          }
          &.btn.disabled {
            background-color: ${e.ref.palette.neutral[700]};
            color: ${e.ref.palette.neutral[900]};
            border:none;
          }
        }
        .tool-list-publish:focus {
          box-shadow: none !important;
        }

        .btn {
          &.disabled,
          &:disabled {
            background-color: transparent;
          }
        }
        .btn:not(:disabled):not(.disabled):active,
        .btn:not(:disabled):not(.disabled).active,
        .show > .btn.dropdown-toggle {
          color: ${(null===(i=null==e?void 0:e.ref.palette)||void 0===i?void 0:i.black)||"black"};
        }
      }

      button:not(:disabled):not(.disabled):active, button:not(:disabled):not(.disabled).active{
        border:none;
      }

      .loading-con {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: ${t.polished.rgba(e.ref.palette.white,.2)};
      }
    `}getDropdownStyle(e){return t.css`
      & {
        background: ${e.ref.palette.neutral[500]};
        border: 1px solid ${e.ref.palette.neutral[400]};;
        box-shadow: 0 0 10px 2px ${t.polished.rgba(e.ref.palette.white,.2)};
        border-radius: 2px;
        border-radius: 2px;
        min-width:${t.polished.rem(220)};
        padding-top: ${t.polished.rem(8)};
        padding-bottom: 0;
      }
      button.save-menu, button.custom-dropdown-item, a.custom-dropdown-item {
        padding-left: ${t.polished.rem(16)};
        margin-bottom: ${t.polished.rem(8)};
      }
      .dropdown-menu--inner {
        max-height: calc(100vh - 50px);

        .toollist-dropdown-icon {
          margin-right: ${t.polished.rem(8)};
          margin-bottom: ${t.polished.rem(2)};
        }
        &>button, &>a {
          padding-left: ${t.polished.rem(16)};
          margin-bottom: ${t.polished.rem(8)};
        }
        button, a {
          box-sizing:border-box;
        }
        .dropdown-more-preview-a {
          color: inherit;
          text-decoration: none;
        }

        @media only screen and (min-width: 1162px) {
          .dropdown-more-preview {
            display: none;
          }
        }
        @media only screen and (max-width: 1162px) {
          .dropdown-more-preview {
            display: flex;
          }
        }
        @media only screen and (min-width: 1116px) {
          .dropdown-more-save {
            display: none;
          }
        }
        @media only screen and (max-width: 1116px) {
          .dropdown-more-save {
            display: flex;
          }
        }
        @media only screen and (min-width: 1070px) {
          .dropdown-more-redo {
            display: none;
          }
        }
        @media only screen and (max-width: 1070px) {
          .dropdown-more-redo {
            display: flex;
          }
        }
        @media only screen and (min-width: 1024px) {
          .dropdown-more-undo {
            display: none;
          }
        }
        @media only screen and (max-width: 1024px) {
          .dropdown-more-undo {
            display: flex;
          }
        }
      }
    `}componentDidMount(){window.onbeforeunload=()=>{if(!this.checkIsSaved())return!1},window.addEventListener("resize",this.updateToollistWidth)}componentWillUnmount(){window.onbeforeunload=null}componentDidUpdate(e,t){var i,o;const{appConfig:s,publishStatus:n,appItem:a}=this.props,{savedAppConfig:r}=this.state;if(this.updateToollistWidth(),this.props.onSaveStatusChanged&&this.props.onSaveStatusChanged(this.checkIsSaved()),(null==a?void 0:a.protected)===(null===(i=null==e?void 0:e.appItem)||void 0===i?void 0:i.protected)&&(null==a?void 0:a.id)===(null===(o=null==e?void 0:e.appItem)||void 0===o?void 0:o.id)||this.setState({itemProtected:null==a?void 0:a.protected}),n!==e.publishStatus&&(n===l.Draft?this.setState({isPublished:!1}):this.setState({isPublished:!0})),this.props!==e){if(this.hasUpdateAppconfigVersion){return void((null==s?void 0:s.exbVersion)===(null==r?void 0:r.exbVersion)&&(this.setState({savedAppConfig:s}),this.hasUpdateAppconfigVersion=!1))}s&&this.updateSaveState()}}render(){const{toolListWidth:o,saveState:s,isOpenDeletePopper:n,isShowAlertPopup:l,alertPopupMessage:r,loading:d,itemProtected:c,openTransferToFullModePopper:u,openAlertPopupTips:h,errorTipsMessage:m}=this.state,{itemType:g,publishStatus:v,appItem:f,appConfig:b,itemId:y,canEditItem:x,handleTokenInvalid:S}=this.props,j=this.checkIsAppSaved(),M=g===a.Template,O=this.props.appConfig&&p.dataComponentsUtils.getWhetherDataSourceIsInited(this.props.dataSources,this.props.dataSourcesInfo);return(0,e.jsxs)("div",{className:"float-right d-flex flex-row align-items-center",css:this.getStyle(this.props.theme),children:[this.isMac()&&(0,e.jsx)(t.Keyboard,{bindings:{"command+keys":()=>{this.saveForKeyBoard()}}}),!this.isMac()&&(0,e.jsx)(t.Keyboard,{bindings:{"ctrl+keys":()=>{this.saveForKeyBoard()}}}),(0,e.jsxs)("div",{className:"h-100 toollist d-flex flex-row align-items-center justify-content-end",children:[(0,e.jsxs)("div",{className:"toollist-length-screen d-flex align-items-center justify-content-starth-100 justify-content-start",ref:this.toolContainer,children:[(0,e.jsx)(i.Button,{id:"tooltip_undo",className:(0,t.classNames)("toollist-item",{"toollist-item-click":!(this.props.stateHistory.past.length<=1),"tool-hidden":o<38}),type:"tertiary",title:this.undo,icon:!0,size:"sm",disabled:this.props.stateHistory.past.length<=1,onClick:this.onUndo,"aria-label":this.undo,children:(0,e.jsx)(w,{className:"toollist-item-icon",autoFlip:!0})}),(0,e.jsx)(i.Button,{id:"tooltip_redo",className:(0,t.classNames)("toollist-item",{"toollist-item-click":!(this.props.stateHistory.future.length<1),"tool-hidden":o<76}),type:"tertiary",title:this.redo,icon:!0,size:"sm",disabled:this.props.stateHistory.future.length<1,onClick:this.onRedo,"aria-label":this.redo,children:(0,e.jsx)(I,{className:"toollist-item-icon",autoFlip:!0})}),o>=114&&(0,e.jsx)(ee,{originalAppInfo:(0,t.Immutable)(f),folderUrl:this.props.folderUrl,appConfig:b,isSave:j,toolListWidth:o,isInDropdown:!1,onSaveSuccess:this.onSaveSuccess,onSaveError:()=>null,saveState:s,onSaveStateChange:this.onSaveStateChange,changePublishStatus:this.props.changePublishStatus,onSaveClick:this.onSaveClick}),x&&window.isExpressBuilder&&(0,e.jsx)(de,{originalAppInfo:(0,t.Immutable)(f),isOpen:u,isSave:j,onSaveClick:this.onSaveClick,onSaveSuccess:this.onSaveSuccess,handleTokenInvalid:S,toggle:this.toggleTransferToFullModePopper,checkAndShowReadOnlyRemind:this.props.checkAndShowReadOnlyRemind,toggleErrorAlertPopupTips:this.toggleErrorAlertPopupTips}),(0,e.jsx)(Re,{onSave:this.onSaveClick,toggleErrorAlertPopupTips:this.toggleErrorAlertPopupTips,toolListWidth:o,isTemplate:M,saveState:s,stateHistory:this.props.stateHistory,queryObject:this.props.queryObject})]}),(0,e.jsx)("div",{className:"tool_more_content",children:this.renderMore()}),(0,e.jsx)(Ae,{publishStatus:v,isDataSourceHadInit:O,saveState:s,stateHistory:this.props.stateHistory,appItem:f,appConfig:b,isInOnLine:this.isInOnLine,checkAndShowReadOnlyRemind:this.props.checkAndShowReadOnlyRemind,changePublishStatus:this.props.changePublishStatus,handleTokenInvalid:this.props.handleTokenInvalid,toastNote:this.props.toastNote,toggleErrorAlertPopupTips:this.toggleErrorAlertPopupTips,onSaveClick:this.onSaveClick})]}),(0,e.jsx)(i.AlertPopup,{isOpen:this.state.isShowLeaveAlertPopup,okLabel:this.getAlertPopOkLabel(),title:this.getAlertPopTitle(),toggle:this.handleToggleForLeaveAlertPopup,children:(0,e.jsx)("div",{style:{fontSize:"1rem"},children:this.nls("headerLeaveDescription")})}),d&&(0,e.jsx)("div",{className:"loading-con",children:(0,e.jsx)("div",{style:{position:"absolute",left:"50%",top:"50%"},className:"jimu-primary-loading"})}),(0,e.jsx)(ne,{itemTitle:null==f?void 0:f.title,itemId:y,isOpen:n,itemProtected:c,deleteToggle:()=>{this.setState({isOpenDeletePopper:!1})},deleteApp:this.handleConfirm,detailUrl:`${this.props.portalUrl}/home/item.html?id=${this.props.currentAppId}`}),(0,e.jsx)(i.AlertPopup,{isOpen:l,title:this.nls("variableColorWarning"),hideCancel:!0,toggle:this.toggleAlertPopup,children:(0,e.jsx)("div",{style:{fontSize:"1rem"},children:r})}),(0,e.jsx)(ce,{open:h,message:m,toggle:this.toggleErrorAlertPopupTips})]})}}const Ye=(0,c.withTheme)(Fe),He=t.ReactRedux.connect(e=>({stateHistory:e.appStateHistory,queryObject:e.queryObject,appConfig:e.appStateInBuilder&&e.appStateInBuilder.appConfig,currentAppId:e.builder&&e.builder.currentAppId,portalUrl:e.portalUrl,dataSources:e.appStateInBuilder&&e.appStateInBuilder.appConfig&&e.appStateInBuilder.appConfig.dataSources,dataSourcesInfo:e.appStateInBuilder&&e.appStateInBuilder.dataSourcesInfo}))(Ye);class Ve extends t.React.PureComponent{constructor(e){super(e),this.onAppModeChange=()=>{this.props&&(this.props.appMode===t.AppMode.Run?o.builderAppSync.publishAppModeChangeToApp(t.AppMode.Design):o.builderAppSync.publishAppModeChangeToApp(t.AppMode.Run))},this.onLockLayoutChange=()=>{(0,o.getAppConfigAction)().setLockLayout(!this.props.lockLayout).exec()},this.nls=e=>this.props.intl.formatMessage({id:e,defaultMessage:d[e]}),this.appMode=this.props.intl.formatMessage({id:"appMode",defaultMessage:d.appMode}),this.lockLayout=this.props.intl.formatMessage({id:"headerLockLayout",defaultMessage:d.headerLockLayout})}getStyle(e){return t.css`
      .lock-layout-label {
        font-weight: 500;
        color: ${e.ref.palette.neutral[1e3]};
        margin-right: ${t.polished.rem(10)};
      }

      .live-view-icon {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: ${e.ref.palette.black};
      }

      .edit-view-icon {
        width: 7px;
        height: 7px;
        border: 1px solid ${e.ref.palette.neutral[1100]};
        border-radius: 50%;
      }
    `}render(){const{appMode:o,lockLayout:s}=this.props,n=o===t.AppMode.Run,a=this.props.intl.formatMessage({id:"headerLockLayout",defaultMessage:d.headerLockLayout});return(0,e.jsxs)("div",{className:"d-flex align-items-center",css:this.getStyle(this.props.theme),title:s?this.props.intl.formatMessage({id:"disableLayoutEditing",defaultMessage:d.disableLayoutEditing}):this.props.intl.formatMessage({id:"enableLayoutEditing",defaultMessage:d.enableLayoutEditing}),children:[!n&&(0,e.jsxs)("div",{className:"d-flex align-items-center",onClick:this.onLockLayoutChange,style:{cursor:"pointer"},children:[(0,e.jsx)("div",{className:"lock-layout-label",children:a}),(0,e.jsx)(i.Switch,{checked:s,"aria-label":a})]}),(0,e.jsx)("div",{className:"liveview-gap"}),(0,e.jsxs)(i.Button,{variant:n?"contained":"outlined",color:"primary",size:"sm",style:{whiteSpace:"nowrap"},className:"d-flex align-items-center","aria-pressed":n,title:n?this.nls("turnOffLiveView"):this.nls("turnOnLiveView"),onClick:this.onAppModeChange,children:[(0,e.jsx)("div",{className:(0,t.classNames)("mr-2",{"live-view-icon":n,"edit-view-icon":!n})}),(0,e.jsx)("div",{className:"d-flex align-items-center border-left-0 app-toolbar-mode",children:(0,e.jsx)("span",{children:this.appMode})})]})]})}}const Qe=(0,c.withTheme)(Ve),We=t.ReactRedux.connect(e=>{var t,i,o,s,n;return{appMode:null===(t=e.appStateInBuilder)||void 0===t?void 0:t.appRuntimeInfo.appMode,lockLayout:null!==(n=null===(s=null===(o=null===(i=e.appStateInBuilder)||void 0===i?void 0:i.appConfig)||void 0===o?void 0:o.forBuilderAttributes)||void 0===s?void 0:s.lockLayout)&&void 0!==n&&n}})(Qe);var _e=v(505),Ge=v.n(_e),qe=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const Ke=i=>{const o=window.SVG,{className:s}=i,n=qe(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Ge()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var Ze=v(9165),Je=v.n(Ze),Xe=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const et=i=>{const o=window.SVG,{className:s}=i,n=Xe(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Je()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var tt=v(8243),it=v.n(tt),ot=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const st=i=>{const o=window.SVG,{className:s}=i,n=ot(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:it()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};class nt extends t.React.PureComponent{constructor(e){super(e),this.headerScreenSizes=this.props.intl.formatMessage({id:"headerScreenSizes",defaultMessage:d.headerScreenSizes}),this.editPageForLargeScreen=this.props.intl.formatMessage({id:"editPageForLargeScreen",defaultMessage:d.editPageForLargeScreen}),this.editPageForMediumScreen=this.props.intl.formatMessage({id:"editPageForMediumScreen",defaultMessage:d.editPageForMediumScreen}),this.editPageForSmallScreen=this.props.intl.formatMessage({id:"editPageForSmallScreen",defaultMessage:d.editPageForSmallScreen}),this.viewPageForMediumScreen=this.props.intl.formatMessage({id:"viewPageForMediumScreen",defaultMessage:d.viewPageForMediumScreen}),this.viewPageForSmallScreen=this.props.intl.formatMessage({id:"viewPageForSmallScreen",defaultMessage:d.viewPageForSmallScreen})}getStyle(e){var i,o;return t.css`
      .device-switch-group {
        margin-right: ${t.polished.rem(10)};
      }

      .device-switch {
        width: ${t.polished.rem(26)};
        height: ${t.polished.rem(26)};
        border-radius: 2px !important;
        border: 0;
        margin-left: 1px;
        margin-right: 1px;
        transition: none;
        -webkit-transition: none;
        color: ${null===(i=null==e?void 0:e.ref.palette)||void 0===i?void 0:i.neutral[900]};

        &:focus {
          box-shadow: none !important;
        }

        &:hover {
          color: ${null===(o=null==e?void 0:e.ref.palette)||void 0===o?void 0:o.black};
        }
      }

      .device-switch-gap {
        margin-right: ${t.polished.rem(6)};
      }

      .device-active {
        background-color: ${e.sys.color.primary.main} !important;
        color: ${e.ref.palette.black} !important;
      }
    `}onBrowserSizeModeChange(e){o.builderAppSync.publishChangeBrowserSizeModeToApp(e),e!==this.props.browserSizeMode&&o.builderAppSync.publishChangeSelectionToApp(null),this.setState({isDeviceChooseShow:!1})}render(){const o=window.isExpressBuilder,{theme:s,browserSizeMode:n}=this.props,a=!n||n===t.BrowserSizeMode.Large,l=n===t.BrowserSizeMode.Medium,r=n===t.BrowserSizeMode.Small;return(0,e.jsx)("div",{css:this.getStyle(s),children:(0,e.jsxs)(i.AdvancedButtonGroup,{variant:"text",role:"radiogroup","aria-label":this.headerScreenSizes,className:"h-100 d-flex align-items-center device-switch-group",children:[(0,e.jsx)(i.Button,{icon:!0,role:"radio",title:this.editPageForLargeScreen,"aria-label":this.editPageForLargeScreen,onClick:()=>{this.onBrowserSizeModeChange(t.BrowserSizeMode.Large)},"aria-checked":a,active:a,className:(0,t.classNames)("device-switch d-flex align-items-center p-0 device-switch-gap",{"device-active":a,"device-disactive":!a}),children:(0,e.jsx)(Ke,{})}),(0,e.jsx)(i.Button,{icon:!0,role:"radio",title:o?this.viewPageForMediumScreen:this.editPageForMediumScreen,"aria-label":o?this.viewPageForMediumScreen:this.editPageForMediumScreen,onClick:()=>{this.onBrowserSizeModeChange(t.BrowserSizeMode.Medium)},"aria-checked":l,active:l,className:(0,t.classNames)("device-switch d-flex align-items-center p-0 device-switch-gap",{"device-active":l,"device-disactive":!l}),children:(0,e.jsx)(st,{})}),(0,e.jsx)(i.Button,{icon:!0,role:"radio",type:"tertiary",title:o?this.viewPageForSmallScreen:this.editPageForSmallScreen,"aria-label":o?this.viewPageForSmallScreen:this.editPageForSmallScreen,onClick:()=>{this.onBrowserSizeModeChange(t.BrowserSizeMode.Small)},"aria-checked":r,active:r,className:(0,t.classNames)("device-switch d-flex align-items-center p-0",{"device-active":r,"device-disactive":!r}),children:(0,e.jsx)(et,{})})]})})}}const at=(0,c.withTheme)(nt),lt=t.ReactRedux.connect(e=>({browserSizeMode:e.appStateInBuilder&&e.appStateInBuilder.browserSizeMode}))(at);var rt=v(5737),dt=v.n(rt),pt=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const ct=i=>{const o=window.SVG,{className:s}=i,n=pt(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:dt()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};class ut extends t.React.PureComponent{constructor(e){super(e),this.onToggleResolutionChoose=()=>{this.setState({isResolutionChooseShow:!this.state.isResolutionChooseShow})},this.setViewportSize=e=>{(0,o.getAppConfigAction)().setViewportSize(this.props.browserSizeMode,e).exec(),this.setState({isResolutionChooseShow:!1})},this.state={isResolutionChooseShow:!1}}getStyle(e){return t.css`
      .switch-resolution-toggle {
        width: auto;
        font-weight: 500;
        color: ${this.props.theme.ref.palette.neutral[1e3]};
        padding-top: 0;
        padding-bottom: 0;
        height: 26px;
        .switch-label {
          width: auto;
          display: inline-block;
        }
      }
      .dropdown-toggle-content svg {
        margin-right: 0;
        margin-top: ${t.polished.rem(-8)};
        vertical-align: center;
      }
      .no-user-select {
        -o-user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        -khtml-user-select :none;
        user-select: none;
      }
    `}getDropdownStyle(e){return t.css`
      & {
        background: ${e.ref.palette.neutral[500]};
        border: 1px solid ${e.ref.palette.neutral[400]};;
        box-shadow: 0 0 10px 2px ${t.polished.rgba(e.ref.palette.white,.2)};
        border-radius: 2px;
        border-radius: 2px;
        padding-top: ${t.polished.rem(8)};
        padding-bottom: ${t.polished.rem(8)};
      }
    `}render(){const{browserSizeMode:o,viewportSize:s,pageMode:n,appMode:a}=this.props,l=n===t.PageMode.FitWindow?"":this.props.nls("auto"),r=(null==s?void 0:s.width)>0?`${s.width} \xd7 ${n!==t.PageMode.FitWindow&&a===t.AppMode.Design?l:s.height}`:this.props.nls("auto");let d=t.CONSTANTS.SCREEN_RESOLUTIONS[o]||[];if(n!==t.PageMode.FitWindow){const e={},t=[];d.forEach(i=>{null==e[i.width]&&(t.push(i),e[i.width]=i)}),d=t}return(0,e.jsxs)("div",{css:this.getStyle(this.props.theme),children:[(0,e.jsx)("div",{className:"sr-only",id:"app-resolution-select",children:this.props.nls("changeScreenSize")}),(0,e.jsxs)(i.Dropdown,{size:"sm",toggle:this.onToggleResolutionChoose,isOpen:this.state.isResolutionChooseShow,className:"resolution-choose","aria-label":this.props.nls("resolution"),children:[(0,e.jsxs)(i.DropdownButton,{size:"sm",type:"tertiary",arrow:!1,role:"combobox",css:t.css`line-height: 1.5rem;`,className:"switch-resolution-toggle lin","aria-describedby":"app-resolution-select",title:this.props.nls("changeScreenSize"),children:[(0,e.jsx)("span",{className:"switch-label",children:r}),(0,e.jsx)(ct,{size:"s"})]}),(0,e.jsxs)(i.DropdownMenu,{css:this.getDropdownStyle(this.props.theme),children:[o===t.BrowserSizeMode.Large&&(0,e.jsx)(i.DropdownItem,{className:"no-user-select",onClick:()=>{this.setViewportSize(void 0)},children:this.props.nls("auto")},"auto-size"),d.map((o,s)=>(0,e.jsx)(i.DropdownItem,{className:"no-user-select",onClick:()=>{this.setViewportSize(o)},children:`${o.width} \xd7 ${n!==t.PageMode.FitWindow&&a===t.AppMode.Design?l:o.height}`},s))]})]})]})}}const ht=(0,c.withTheme)(ut),mt=t.ReactRedux.connect(e=>{var i,o,s,n,a,l;const r=e.appStateInBuilder&&e.appStateInBuilder.browserSizeMode;let d;e.appStateInBuilder&&(d=t.utils.findViewportSize(e.appStateInBuilder.appConfig,r));const p=e.appStateInBuilder&&e.appStateInBuilder.appRuntimeInfo.currentPageId;let c;return p&&(c=null===(n=null===(s=null===(o=null===(i=e.appStateInBuilder)||void 0===i?void 0:i.appConfig)||void 0===o?void 0:o.pages)||void 0===s?void 0:s[p])||void 0===n?void 0:n.mode),{viewportSize:d,pageMode:c,appMode:null===(l=null===(a=e.appStateInBuilder)||void 0===a?void 0:a.appRuntimeInfo)||void 0===l?void 0:l.appMode,browserSizeMode:e.appStateInBuilder&&e.appStateInBuilder.browserSizeMode}})(ht);var gt=v(8418);Object.defineProperty,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.prototype;var vt=Symbol.for("react-redux-context"),ft="undefined"!=typeof globalThis?globalThis:{};function bt(){if(!B.createContext)return{};const e=ft[vt]??=new Map;let t=e.get(B.createContext);return t||(t=B.createContext(null),e.set(B.createContext,t)),t}var yt=bt();function xt(e=yt){return function(){return B.useContext(e)}}var wt=xt();var St=(e,t)=>e===t;function jt(e=yt){const t=e===yt?wt:xt(e),i=(e,i={})=>{const{equalityFn:o=St}="function"==typeof i?{equalityFn:i}:i;const s=t(),{store:n,subscription:a,getServerState:l}=s,r=(B.useRef(!0),B.useCallback({[e.name]:t=>e(t)}[e.name],[e])),d=(0,gt.useSyncExternalStoreWithSelector)(a.addNestedSub,n.getState,l||n.getState,r,o);return B.useDebugValue(d),d};return Object.assign(i,{withTypes:()=>i}),i}var Mt=jt(),It=v(1496),Ot=v(3600),Tt=v.n(Ot),Nt=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const At=i=>{const o=window.SVG,{className:s}=i,n=Nt(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Tt()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var kt=v(6572),zt=v.n(kt),Dt=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const Ct=i=>{const o=window.SVG,{className:s}=i,n=Dt(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:zt()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var Pt=v(8013),Et=v.n(Pt),Lt=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const Rt=i=>{const o=window.SVG,{className:s}=i,n=Lt(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Et()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var $t=v(6884),Ut=v(63),Bt=v.n(Ut),Ft=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const Yt=i=>{const o=window.SVG,{className:s}=i,n=Ft(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Bt()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))},{useState:Ht}=t.React,Vt=Object.assign({},t.defaultMessages,It.defaultMessages),Qt=(0,c.styled)(i.DropdownMenu)`
  padding: unset;
  max-width: 240px;

  .jimu-dropdown-item-header {
    height: 2rem;
    background-color: var(--ref-palette-neutral-600);
    color: var(--ref-palette-neutral-1100) !important;
    font-size: 14px;
    line-height: 2rem;
    display: flex !important;
    align-items: center;
  }

  .dropdown-item {
    font-size: 13px;
    color: var(--ref-palette-black) !important;
    padding: 0 24px !important;
    height: 2rem;
    cursor: pointer;
    &:not(.active):hover {
      background: var(--ref-palette-neutral-600) !important;
    }
    &.active {
      background: var(--sys-color-primary-main);
    }

    .item-home-icon {
      &.item-home-true {
        color: var(--ref-palette-black);
      }
      &.item-home-false {
        display: none;
        &:hover {
          display: inline-flex;
          color: var(--ref-palette-black);
        }
      }
    }
    &:hover {
      .item-home-icon {
        &.item-home-false {
          display: inline-flex;
          color: var(--ref-palette-neutral-1000);
        }
        &.item-home-fake {
          display: none;
        }
      }
    }
    &:focus, &:focus-within {
      .item-home-icon {
        &.item-home-false {
          display: inline-flex;
        }
        &.item-home-fake {
          display: none;
        }
      }
    }

    &.has-dot {
      padding-left: 10px !important;
    }
  }
`;const Wt=function(){var s,n;const a=Mt(e=>{var t,i;return null===(i=null===(t=null==e?void 0:e.appStateInBuilder)||void 0===t?void 0:t.appConfig)||void 0===i?void 0:i.pageStructure}),l=Mt(e=>{var t,i;return null===(i=null===(t=null==e?void 0:e.appStateInBuilder)||void 0===t?void 0:t.appConfig)||void 0===i?void 0:i.pages}),r=Mt(e=>{var t,i;return null===(i=null===(t=null==e?void 0:e.appStateInBuilder)||void 0===t?void 0:t.appConfig)||void 0===i?void 0:i.dialogs}),d=Mt(e=>{var t;return null===(t=null==e?void 0:e.appStateInBuilder)||void 0===t?void 0:t.appRuntimeInfo.currentPageId}),p=Mt(e=>{var t;return null===(t=null==e?void 0:e.appStateInBuilder)||void 0===t?void 0:t.appRuntimeInfo.currentDialogId}),c=t.React.useRef(null),[u,h]=Ht(!1),m=t.React.useMemo(()=>(0,$t.getFixedModalWindowTemplates)(!1).concat((0,$t.getFixedNonModalWindowTemplates)()),[]),g=t.hooks.useTranslation(Vt),v=()=>{h(!u)};if((()=>{const e=l?Object.keys(l).length:0;return 0===e||1===e&&r&&0===Object.keys(r).length})())return null;const f=(null===(s=null==r?void 0:r[p])||void 0===s?void 0:s.label)||(null===(n=null==l?void 0:l[d])||void 0===n?void 0:n.label);return(0,e.jsxs)("div",{className:"page-window-select d-flex align-items-center",children:[(0,e.jsxs)(i.Dropdown,{menuRole:"listbox",supportInsideNodesAccessible:!0,"aria-label":g("pageWindowSelect"),children:[(0,e.jsx)(i.DropdownButton,{size:"sm",type:"tertiary",css:t.css`max-width: 240px;`,title:f,children:f}),(0,e.jsxs)(Qt,{alignment:"start",autoFocus:!1,children:[((s,n,a,l)=>{const r=Object.keys(s).length;return(n||[]).map(n=>{const d=Object.keys(n)[0],p=s[d],c=null==p?void 0:p.isDefault,u=a===d&&l&&r>1;return(0,e.jsxs)(i.DropdownItem,{tag:"div",tabIndex:0,className:"mt-1 mb-1 "+(u?"has-dot":""),active:a===d&&!l,onClick:()=>{var e;e=d,(0,je.changeCurrentPage)(e)},children:[(0,e.jsxs)("div",{className:"text-truncate w-100",title:p.label,children:[u&&(0,e.jsx)(Rt,{size:"6px",className:"mr-2"}),p.label]}),r>1&&(0,e.jsxs)(t.React.Fragment,{children:[(0,e.jsx)(i.Tooltip,{title:g("makeHome"),placement:"bottom",children:(0,e.jsx)(i.Button,{icon:!0,size:"sm",type:"tertiary",active:c,"aria-label":g("makeHome"),"aria-pressed":c,className:`item-home-icon ml-1 jimu-outline-inside item-home-${c} ${c?"":"visible-by-focus"}`,onClick:e=>{var t;e.stopPropagation(),t=d,(0,o.getAppConfigAction)().replaceHomePage(t).exec()},children:(0,e.jsx)(Ct,{})})}),!c&&(0,e.jsx)(i.Button,{icon:!0,disabled:!0,size:"sm",type:"tertiary",className:"item-home-icon item-home-true item-home-fake ml-1"})]})]},d)})})(l,a,d,p),r&&Object.keys(r).length>0&&(0,e.jsx)(t.React.Fragment,{children:(b=r,y=p,Object.keys(b).map(s=>{var n;const a=b[s],l=null==a?void 0:a.isSplash;return(null===(n=b[s])||void 0===n?void 0:n.mode)===t.DialogMode.Fixed&&(0,e.jsxs)(i.DropdownItem,{tag:"div",tabIndex:0,className:"mt-1 mb-1",active:y===s,onClick:()=>{var e;e=s,(0,je.changeCurrentDialog)(e)},children:[(0,e.jsx)("div",{className:"text-truncate w-100",title:b[s].label,children:b[s].label}),(0,e.jsx)(i.Tooltip,{title:g("makeSplash"),placement:"bottom",children:(0,e.jsx)(i.Button,{icon:!0,size:"sm",type:"tertiary",disableHoverEffect:!0,disableRipple:!0,active:l,"aria-pressed":l,className:`item-home-icon ml-1 jimu-outline-inside item-home-${l} ${l?"":"visible-by-focus"}`,onClick:e=>{e.stopPropagation(),(e=>{const t=(0,o.getAppConfigAction)().appConfig,i=Object.keys(r).filter(e=>t.dialogs[e].isSplash)[0];(0,o.getAppConfigAction)().replaceSplashDialog(e,i).exec(),i===e&&e===p&&(0,je.changeCurrentDialog)(e,!0)})(s)},children:(0,e.jsx)(At,{})})}),!l&&(0,e.jsx)(i.Button,{icon:!0,disabled:!0,size:"sm",type:"tertiary",className:"item-home-icon item-home-true item-home-fake ml-1"})]},s)}))})]})]}),p&&(0,e.jsxs)(t.React.Fragment,{children:[(0,e.jsx)(i.Tooltip,{title:g("chooseTemplate",{type:g("dialog").toLocaleLowerCase()}),children:(0,e.jsx)(i.Button,{icon:!0,size:"sm",onClick:v,ref:e=>{c.current=e},variant:"text",children:(0,e.jsx)(Yt,{autoFlip:!0,size:"m"})})}),u&&(0,e.jsx)(je.TemplateSelector,{templates:m,referenceElement:c.current,onItemSelect:e=>{const i=(0,o.getAppConfigAction)(),s=Object.keys(r[p].layout);if(s.forEach(e=>{i.removeLayout(r[p].layout[e])}),s.length>1){let e=r[p].layout,o=r[p].sizeMode;s.filter(e=>e!==t.BrowserSizeMode.Large).forEach(t=>{e=e.without(t),o=o.without(t)}),i.editDialogProperty(p,"layout",e).editDialogProperty(p,"sizeMode",o),i.exec()}i.applyDialogTemplate(p,e,t.BrowserSizeMode.Large).then(()=>{i.exec()}).catch(e=>{console.error(e)})},onClose:v})]})]});var b,y};var _t=v(1594),Gt=v.n(_t),qt=v(6055);const Kt=t.css`
  border: none;

  .tooltip {
    color: var(--ref-palette-black);
    background-color: var(--ref-palette-neutral-600);
    border-color: var(--ref-palette-neutral-400);
  }
`,Zt=t.css`
  width: ${t.polished.rem(26)};
  height: ${t.polished.rem(26)};
  border: none;
  color: var(--ref-palette-neutral-1100);

  &:hover {
    color: var(--ref-palette-black);
    background-color: transparent;
  }
 
  &.disabled, &.disabled:hover {
    color: var(--sys-color-action-disabled-text);
    background-color: transparent;
  }

  &:focus {
    box-shadow: none !important;
  }
`;function Jt(t){const{icon:o,tooltip:s,disabled:n,rotate:a,autoFlip:l,extName:r,onClick:d}=t,p=(0,e.jsx)(i.Button,{"aria-label":s,className:"p-0 d-flex align-items-center rounded-circle",type:"tertiary",icon:!0,role:"menuitem",title:n?s:void 0,onClick:d,disabled:n,"data-extname":r,css:Zt,children:(0,e.jsx)(i.Icon,{className:"tool-item-icon",icon:o,rotate:a,autoFlip:l})});return n?p:(0,e.jsx)(i.Tooltip,{placement:"bottom",title:s,css:Kt,children:p})}const Xt=t.css`
      cursor: pointer;
      display: flex;
      justify-content: flex-start;
      user-select: none;
      &:has( ~ div.toolbar-item:not(.d-none)) {
        margin-right: ${t.polished.rem(6)};
      }
      &.selected > .jimu-btn {
        color: var(--ref-palette-black);
        background: var(--sys-color-primary-main);
      }

      &.disabled,
      &.no-action {
        cursor: default;
      }
      &.disabled {
        .jimu-btn {
          cursor: default;
          pointer-events: auto;
        }
      }

      .popper {
        border: 1px solid var(--ref-palette-neutral-900);
      }
    `,ei=t.css`
  border: 1px solid var(--sys-color-divider-secondary);

  .panel-header {
    background: transparent;
    color: var(--sys-color-surface-paper-hint);
    border-bottom: 1px solid var(--sys-color-divider-secondary);

    .title {
      font-size: 1rem;
      font-weight: 600;
    }
    .jimu-btn svg {
      color: var(--sys-color-surface-paper-hint);
    }
  }

  .content {
    .content {
      display: flex;
      pointer-events: all;
      border-radius: 2px;
      box-shadow: 0 2px 8px 1px rgba(0, 0, 0, 0.2);
    }
  }
`;function ti(e,t){return"function"==typeof e?e(t):e}function ii(s){var n,a;const{extName:l,title:r,layoutId:d,layoutItemId:p,settingPanel:c,openWhenAdded:u,isActive:h=!1,isToggleOn:m=!1,onClick:g,onItemClick:v,onToggleChange:f}=s,b=t.React.useRef(null),y=t.hooks.useTranslation(),x=t.ReactRedux.useSelector(e=>{var t;const i=null===(t=e.appStateInBuilder)||void 0===t?void 0:t.appConfig;if(i)return It.searchUtils.findLayoutItem(i,{layoutId:d,layoutItemId:p})}),w=c&&h&&m,S=t.hooks.usePrevious(w),j=ti(s.checked,{layoutId:d,layoutItem:x}),M=ti(s.disabled,{layoutId:d,layoutItem:x}),I=ti(s.visible,{layoutId:d,layoutItem:x}),O=ti(s.icon,{layoutId:d,layoutItem:x}),T=t.ReactRedux.useSelector(e=>{if((null==x?void 0:x.type)===t.LayoutItemType.Widget&&x.widgetId)return x.widgetId}),N=t.ReactRedux.useSelector(e=>{var t,i,o;const s=null===(t=e.appStateInBuilder)||void 0===t?void 0:t.widgetsRuntimeInfo;return null!==(o=null===(i=null==s?void 0:s[T])||void 0===i?void 0:i.shouldExpandContextTool)&&void 0!==o&&o}),A=t.ReactRedux.useSelector(e=>{var t,i,o;if(T&&l){const s=e.appStateInBuilder.widgetsRuntimeInfo[T];return null!==(o=null===(i=null===(t=null==s?void 0:s.layoutItemTools)||void 0===t?void 0:t[l])||void 0===i?void 0:i.version)&&void 0!==o?o:0}return 0});t.React.useEffect(()=>{!S||I&&!M||f()},[M,I,f,S]),t.hooks.useEffectOnce(()=>{T&&l&&(u&&N&&k(),window.jimuConfig.isInBuilder?(0,t.getAppStore)().dispatch(t.appActions.widgetRuntimeInfoChange(T,"shouldExpandContextTool",!1)):o.builderAppSync.publishWidgetRuntimeInfoChangeToApp(T,"shouldExpandContextTool",!1))});const k=t.React.useCallback(e=>{null==e||e.stopPropagation(),g({layoutId:d,layoutItem:x,clientRect:null},e),v(l)},[g,l,d,x,v]),z=c;let D,C="";return"function"==typeof r?C=r({layoutId:d,layoutItem:x,formatMessage:y}):"string"==typeof r&&(C=r),w&&b.current&&(D=b.current.getBoundingClientRect()),(0,e.jsxs)("div",{className:(0,t.classNames)("toolbar-item",{selected:w||j,disabled:M,"d-none":null!=s.visible&&!I}),css:Xt,"data-toolstate":A,ref:b,children:[(0,e.jsx)(Jt,{icon:O,tooltip:C,disabled:M,rotate:s.rotate,extName:s.extName,autoFlip:s.autoFlipIcon,onClick:k}),w&&(0,e.jsx)(i.FloatingPanel,{css:ei,autoSize:!0,trapFocus:!0,autoFocus:!1,disableResize:!0,headerTitle:C,defaultPosition:{x:null!==(n=null==D?void 0:D.left)&&void 0!==n?n:0,y:null!==(a=null==D?void 0:D.bottom)&&void 0!==a?a:0},onHeaderClose:f,children:(0,e.jsx)("div",{className:"d-flex content",children:w&&(0,e.jsx)(z,{layoutId:d,layoutItemId:p,widgetId:T})})})]})}var oi=v(5196),si=v.n(oi),ni=v(1625),ai=v.n(ni);const li=t.css`
  .toolbar-container {
    background: var(--ref-palette-secondary-700);
    width: 0;
    &:has(div.toolbar-item:not(.d-none)) {
      border-radius: 26px;
      padding: 4px 11px;
      width: auto;
      + .sep-line { display: block; }
    }
  }
  .sep-line {
    height: 30px;
    width: 2px;
    border-right: 1px solid var(--ref-palette-neutral-700);
    display: none;
  }
`,ri={icon:Gt(),title:e=>e.formatMessage("delete"),visible:e=>{const{layoutId:t,layoutItem:i}=e,s=(0,o.getAppConfigAction)().appConfig;return(0,qt.canDeleteInExpressMode)({layoutId:t,layoutItemId:i.id},s)},onClick:e=>{const{layoutItem:i,layoutId:s}=e,n={layoutId:s,layoutItemId:i.id};(0,t.getAppStore)().dispatch(o.builderActions.confirmDeleteContentChanged(n))},extName:"delete"},di={icon:si(),rotate:180,autoFlipIcon:!0,title:e=>e.formatMessage("splitHorizontally2"),visible:e=>{var i;const{layoutId:s}=e,n=(0,o.getAppConfigAction)().appConfig,a=null===(i=null==n?void 0:n.layouts)||void 0===i?void 0:i[s];return(null==a?void 0:a.type)===t.LayoutType.GridLayout},onClick:e=>{const{layoutId:t,layoutItem:i}=e;(0,qt.splitGridCell)({layoutId:t,layoutItemId:i.id},"h",!0)},extName:"splitHorizontal2"},pi={icon:si(),autoFlipIcon:!0,title:e=>e.formatMessage("splitHorizontally"),visible:e=>{var i;const{layoutId:s}=e,n=(0,o.getAppConfigAction)().appConfig,a=null===(i=null==n?void 0:n.layouts)||void 0===i?void 0:i[s];return(null==a?void 0:a.type)===t.LayoutType.GridLayout},onClick:e=>{const{layoutId:t,layoutItem:i}=e;(0,qt.splitGridCell)({layoutId:t,layoutItemId:i.id},"h",!1)},extName:"splitHorizontal"},ci={icon:ai(),rotate:180,title:e=>e.formatMessage("splitVertically2"),visible:e=>{var i;const{layoutId:s}=e,n=(0,o.getAppConfigAction)().appConfig,a=null===(i=null==n?void 0:n.layouts)||void 0===i?void 0:i[s];return(null==a?void 0:a.type)===t.LayoutType.GridLayout},onClick:e=>{const{layoutId:t,layoutItem:i}=e;(0,qt.splitGridCell)({layoutId:t,layoutItemId:i.id},"v",!0)},extName:"splitVertical2"},ui={icon:ai(),title:e=>e.formatMessage("splitVertically"),visible:e=>{var i;const{layoutId:s}=e,n=(0,o.getAppConfigAction)().appConfig,a=null===(i=null==n?void 0:n.layouts)||void 0===i?void 0:i[s];return(null==a?void 0:a.type)===t.LayoutType.GridLayout},onClick:e=>{const{layoutId:t,layoutItem:i}=e;(0,qt.splitGridCell)({layoutId:t,layoutItemId:i.id},"v",!1)},extName:"splitVertical"};function hi(e,i){if(!i)return[];return window._extensionManager.getExtensions(t.extensionSpec.ExtensionPoints.ContextTool).filter(e=>e.widgetId===i).map(t=>{var o;return{widgetId:i,icon:t.getIcon(),title:t.getTitle.bind(t),onClick:t.onClick.bind(t),checked:t.checked&&t.checked.bind(t),disabled:t.disabled?"function"==typeof t.disabled?t.disabled.bind(t):t.disabled:null,visible:t.visible?"function"==typeof t.visible?t.visible.bind(t):t.visible:null,openWhenAdded:null!==(o=t.openWhenAdded)&&void 0!==o&&o,settingPanel:t.getSettingPanel({layoutId:e,layoutItem:{widgetId:i},clientRect:null}),index:t.index,extName:t.name}}).sort((e,t)=>e.index-t.index)}function mi(e){const i=(0,t.getAppStore)().getState().appStateInBuilder;if(!(null==i?void 0:i.appConfig))return Promise.resolve([]);const o=i.appConfig.widgets[e];return window._extensionManager.registerWidgetExtensions(o,!1)}function gi(){const i=t.React.useRef(null),[o,s]=t.React.useState(),[n,a]=t.React.useState(!1),[l,r]=t.React.useState(!1),[d,p]=t.React.useState(!1),c=t.ReactRedux.useSelector(e=>{var t,i;return null===(i=null===(t=e.appStateInBuilder)||void 0===t?void 0:t.appRuntimeInfo)||void 0===i?void 0:i.selection}),u=t.hooks.usePrevious(c),h=t.React.useMemo(()=>{if(c){const e=(0,t.getAppStore)().getState().appStateInBuilder,i=null==e?void 0:e.appConfig;if(i){const e=It.searchUtils.findLayoutItem(i,c);return null==e?void 0:e.widgetId}}return null},[c]),m=t.ReactRedux.useSelector(e=>{var i,o,s;if(c){const n=e.appStateInBuilder.appConfig,a=e.appStateInBuilder.browserSizeMode,{layoutId:l}=c,r=null===(i=n.layouts)||void 0===i?void 0:i[l];if((null===(o=r.parent)||void 0===o?void 0:o.type)===t.LayoutParentType.Widget){const e=r.parent.id;if("widgets/common/controller/"===(null===(s=n.widgets)||void 0===s?void 0:s[e]).uri){const i=It.searchUtils.getLayoutInfosHoldContent(n,t.LayoutItemType.Widget,e,a);return{layoutId:null==i?void 0:i[0].layoutId,layoutItemId:null==i?void 0:i[0].layoutItemId,widgetId:e}}}}return null},t.ReactRedux.shallowEqual);t.React.useEffect(()=>{h&&mi(h).then(e=>{if(e.length>0){r(!0);"widgets/common/controller/"===(0,t.getAppStore)().getState().appStateInBuilder.appConfig.widgets[h].uri&&p(!0)}})},[h]),t.React.useEffect(()=>{(null==m?void 0:m.widgetId)&&!d&&mi(m.widgetId).then(e=>{e.length>0&&p(!0)})},[null==m?void 0:m.widgetId,d]);const g=()=>{(o||n)&&(s(null),a(!1))},v=t.React.useMemo(()=>{if(l&&(null==c?void 0:c.layoutId))return hi(c.layoutId,h)},[null==c?void 0:c.layoutId,l,h]),f=t.React.useMemo(()=>{if(m&&d)return hi(m.layoutId,m.widgetId)},[d,m]),b=t.React.useCallback(e=>{a(e!==o||!n),s(e)},[n,o]),y=t.React.useCallback(e=>{b(e)},[b]),x=t.React.useCallback(()=>{a(!1)},[]);return c?((()=>{var e;if(!u||!m||u.layoutId!==m.layoutId||u.layoutItemId!==m.layoutItemId){if(c&&u){const i=(0,t.getAppStore)().getState().appStateInBuilder,o=It.searchUtils.findParentLayoutInfo(u,i.appConfig,i.browserSizeMode),s=null===(e=i.appConfig.widgets)||void 0===e?void 0:e[h];if(o&&"widgets/common/controller/"===(null==s?void 0:s.uri)&&o.layoutId===c.layoutId&&o.layoutItemId===c.layoutItemId)return;const n=It.searchUtils.findParentLayoutInfo(c,i.appConfig,i.browserSizeMode);if(m&&o&&n&&n.layoutId===o.layoutId&&n.layoutItemId===o.layoutItemId)return;c.layoutId===u.layoutId&&c.layoutItemId===u.layoutItemId||g()}c&&!u&&g()}})(),(0,e.jsxs)("div",{className:"d-flex align-items-center",css:li,ref:i,children:[(0,e.jsx)("div",{className:"toolbar-container d-flex align-items-center",children:c&&[...v||[],...null!=f?f:[],di,pi,ci,ui,ri].map(t=>(0,e.jsx)(ii,Object.assign({},t,{layoutId:(null==m?void 0:m.widgetId)&&t.widgetId===m.widgetId?m.layoutId:c.layoutId,layoutItemId:(null==m?void 0:m.widgetId)&&t.widgetId===m.widgetId?m.layoutItemId:c.layoutItemId,isActive:o===t.extName,isToggleOn:n,onToggleChange:x,onItemClick:y}),t.extName))}),(0,e.jsx)("div",{className:"sep-line mx-4"})]})):null}var vi=v(4324),fi=v.n(vi),bi=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const yi=i=>{const o=window.SVG,{className:s}=i,n=bi(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:fi()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var xi=v(5531),wi=v.n(xi),Si=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const ji=i=>{const o=window.SVG,{className:s}=i,n=Si(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:wi()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var Mi=v(9507),Ii=v.n(Mi),Oi=function(e,t){var i={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(i[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(e);s<o.length;s++)t.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(e,o[s])&&(i[o[s]]=e[o[s]])}return i};const Ti=i=>{const o=window.SVG,{className:s}=i,n=Oi(i,["className"]),a=(0,t.classNames)("jimu-icon jimu-icon-component",s);return o?(0,e.jsx)(o,Object.assign({className:a,src:Ii()},n)):(0,e.jsx)("svg",Object.assign({className:a},n))};var Ni=function(e,t,i,o){return new(i||(i=Promise))(function(s,n){function a(e){try{r(o.next(e))}catch(e){n(e)}}function l(e){try{r(o.throw(e))}catch(e){n(e)}}function r(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(a,l)}r((o=o.apply(e,t||[])).next())})};const Ai=Object.assign({},d,i.defaultMessages);var ki;!function(e){e.OrgAdmin="org_admin",e.OrgPublisher="org_publisher",e.OrgUser="org_user",e.CustomRoles="custom_roles"}(ki||(ki={}));class zi extends t.React.PureComponent{constructor(i){super(i),this.titleTextInput=t.React.createRef(),this.spanTextInput=t.React.createRef(),this.originTitleMaxWidth=236,this.currentToolContainerWidth=0,this.currentPublishStateContainerWidth=0,this.focusTitleInput=!1,this.headerContainerCon=t.React.createRef(),this.toolListConRef=t.React.createRef(),this.publishStatusConRef=t.React.createRef(),this.getHelpUrl=()=>{var e;null===(e=null===o.helpUtils||void 0===o.helpUtils?void 0:o.helpUtils.getHomeHelpLink())||void 0===e||e.then(e=>{e&&this.setState({helpUrl:e})})},this.checkIsItemInUpdateGroup=e=>Ni(this,void 0,void 0,function*(){const{user:t,appInfo:i,queryObject:o}=this.props;if((o.id!==e.queryObject.id||t!==(null==e?void 0:e.user))&&(null==i?void 0:i.id)&&t){const e=yield function(e,t){return xe(this,void 0,void 0,function*(){if(window.jimuConfig.isDevEdition)return!1;const i=Se(t),o={items:e,groups:i.join(",")};let n=!1;return s.appServices.getAppGroups(o).then(t=>{for(const i in t)i===e&&(n=!0);return Promise.resolve(n)},e=>Promise.resolve(n))})}(null==i?void 0:i.id,t);this.setState({isItemInUpdateGroup:e},()=>{this.checkEditPrivileges()})}}),this.editTitle=e=>{if(this.checkAndShowReadOnlyRemind())return;let t=e;this.focusTitleInput=!1;const{appItem:i}=this.state;if(t=t.replace(/(^\s*)|(\s*$)/g,""),0===t.length||/^[ ]*$/.test(t)||t===i.title)return t=i.title,this.setState({titleText:t}),!1;s.appServices.updateAppInfo({id:this.props.queryObject.id,title:t,owner:i.owner},i.owner).then(()=>{this.props.dispatch(o.builderActions.refreshAppListAction(!0)),o.builderAppSync.publishAppInfoChangeToApp(Object.assign(Object.assign({},i),{title:t})),i.title=t,this.setState({appItem:i,titleText:t})},e=>{console.error(e),this.handleTokenInvalid(e)})},this.checkAndShowReadOnlyRemind=()=>{const e=(0,t.getAppStore)().getState().portalSelf;return(null==e?void 0:e.isReadOnly)&&this.toastNote(this.nls("remindTextForReadonlyMode")),null==e?void 0:e.isReadOnly},this.handleTokenInvalid=e=>{498===Number(null==e?void 0:e.code)&&t.SessionManager.getInstance().gotoPrivilegeErrorPage(t.SystemErrorCode.PrivilegeInvalidMainSession)},this.refreshTitleByAppId=e=>{t.portalUtils.getAppInfo(e).then(e=>{this.refreshTitle(e,!0)},e=>{console.error(e)})},this.refreshTitle=(e,t=!1)=>{if(!e)return;const{titleText:i}=this.state,o=this.state.itemType,s=(null==e?void 0:e.type)===a.Template?a.Template:a.Experience,n=s===a.Template&&o!==s;this.getPublishStatusByTypeKeyword(e),i&&!t&&(e.title=i),this.setState({titleText:e.title||"",itemType:s,itemId:e.id,appItem:this.initAppInfo(e),isShowTemplateRemind:n})},this.resetTitle=e=>{this.setState({titleText:e})},this.initAppInfo=e=>(null==e?void 0:e.id)?(e.isLocalApp=window.jimuConfig.isDevEdition,e.portalUrl=this.props.portalUrl,e):null,this.getPublishStatusByTypeKeyword=e=>{const t=(0,s.getPublishStatus)(e);this.setState({publishStatus:t})},this.getAppPublishStatus=()=>{if(!this.state.publishStatus||this.state.publishStatus===l.Publishing)return"";const i=t.css`
      padding: 0.25rem 0.5rem;
      font-size: 12px;
      line-height: 150%;
      font-style: normal;
      border: 1px solid ${this.props.theme.sys.color.divider.tertiary};
      box-shadow: ${this.props.theme.sys.shadow.shadow2};
      border-radius: 2px;
      .name {
        font-weight: 600;
      }
      .desc {
        font-weight: 400;
      }
    `;let o="",s="";switch(this.state.publishStatus){case l.Draft:o="itemStatusDraft",s="draftStatusTitle";break;case l.Published:o="published",s="publishedTitle";break;case l.Changed:o="unpublishedChanges",s="publishedUnsaveTitle"}return(0,e.jsxs)("div",{css:i,children:[(0,e.jsx)("div",{className:"name",id:"app-status-label",children:this.nls(o)}),(0,e.jsx)("div",{className:"desc",id:"app-status-desc",children:this.nls(s)})]})},this.getPublishIcon=()=>{const{publishStatus:t}=this.state;let i;switch(t){case l.Draft:i=(0,e.jsx)(yi,{size:"s",color:"var(--ref-palette-white)"});break;case l.Published:i=(0,e.jsx)(ji,{size:"s",color:"var(--ref-palette-white)"});break;case l.Changed:i=(0,e.jsx)(Ti,{size:"s",color:"var(--ref-palette-white)"})}return i},this.changePublishStatus=e=>{this.setState({publishStatus:e})},this.titleTextChange=e=>{let t=e.target.value;t.length>250&&(t=t.slice(0,250)),this.setState({titleText:t})},this.nls=e=>this.props.intl?this.props.intl.formatMessage({id:e,defaultMessage:Ai[e]}):e,this.handleKeydown=e=>{"Enter"===e.key&&setTimeout(()=>{this.titleTextInput.current.blur()},0)},this.onToolContainerResize=({width:e,height:t})=>{this.currentToolContainerWidth=e,this.checkAndResizeTileMaxWidth()},this.onHeaderContainerResize=()=>{this.checkAndResizeTileMaxWidth()},this.onPublishStateContainerResized=({width:e,height:t})=>{this.currentPublishStateContainerWidth=e,this.checkAndResizeTileMaxWidth()},this.checkAndResizeTileMaxWidth=()=>{if(!this.currentToolContainerWidth||!this.currentPublishStateContainerWidth)return;const e=window.innerWidth-this.currentToolContainerWidth-52-this.currentPublishStateContainerWidth;e>=this.originTitleMaxWidth?this.setState({titleMaxWidth:this.originTitleMaxWidth}):e<=40?this.setState({titleMaxWidth:40}):this.setState({titleMaxWidth:e})},this.getTemplatePopperStyle=()=>{const{theme:e}=this.props;return t.css`
      &{
        background: ${e.ref.palette.neutral[600]};
        color: ${e.ref.palette.black};
        border: 1px solid ${e.ref.palette.neutral[400]};
        box-sizing: border-box;
        padding: ${t.polished.rem(10)} ${t.polished.rem(12)};
        border-radius: 2px;
        box-shadow: 0 0 10px 2px ${t.polished.rgba(e.ref.palette.white,.2)};
      }
      .template-remind-popper {
        div{
          white-space: nowrap;
          text-align: center;
          font-size: ${t.polished.rem(13)};
          line-height: ${t.polished.rem(13)};
          margin-bottom: ${t.polished.rem(14)};
        }
      }
      &[data-popper-placement^="right"] .jimu-popper--arrow::before{
        border-right-color: ${e.ref.palette.neutral[400]};
      }
      &[data-popper-placement^="right"] .jimu-popper--arrow::after {
        border-right-color: ${e.ref.palette.neutral[600]};
      }
    `},this.closeTemplateRemind=()=>{this.setState({isShowTemplateRemind:!1})},this.onSaveStatusChanged=e=>{this.setState({isAppSaved:e})},this.checkIsOwner=()=>{const{appInfo:e}=this.props,{user:t}=this.props;return(null==t?void 0:t.username)===(null==e?void 0:e.owner)},this.checkEditPrivileges=()=>{const{appInfo:e}=this.props,{user:t}=this.props,{isItemInUpdateGroup:i}=this.state,o=null==e?void 0:e.isOrgItem,s=this.checkIsOwner()||(null==t?void 0:t.role)===ki.OrgAdmin&&(o||window.jimuConfig.isDevEdition)||i;this.setState({canEditItem:s})},this.handleFocusTitleInput=e=>{this.focusTitleInput=!0},this.toastNote=e=>{this.setState({showToast:!0,toastText:e})},this.hideToastNote=()=>{this.setState({showToast:!1})},this.initExbExpressModeInLocalStorage=()=>{window.isExpressBuilder?t.utils.setLocalStorage(n,"true"):t.utils.removeFromLocalStorage(n)},this.state={titleText:"",accountPopoverOpen:!1,itemType:a.Experience,itemId:"",titleMaxWidth:this.originTitleMaxWidth,publishStatus:null,isShowTemplateRemind:!1,isAppSaved:!0,showTitle:!0,helpUrl:"#",canEditItem:!1,showToast:!1,toastText:null,isItemInUpdateGroup:!0,keyForExpressToolbar:0}}getStyle(){const e=this.props.theme,{publishStatus:i}=this.state;let o;switch(i){case l.Publishing:o="unset";break;case l.Draft:o="var(--sys-color-warning-light)";break;case l.Published:o="var(--sys-color-success-light)";break;case l.Changed:o="#D7B0FF"}return t.css`
      .widget-builder-header {
        background-color: ${e.ref.palette.neutral[500]};
        border: 1px solid ${e.ref.palette.neutral[700]};
        padding-left: ${t.polished.rem(12)};
        overflow: auto;

        .header-title-container {
          display: flex;
          .header-logo-title-state {
            display: flex;
            width: 310px;
          }
        }
        .header-logo {
          a {
            margin-right:${t.polished.rem(6)};
          }
          .header-logo-item {
            height: ${t.polished.rem(32)};
            width: ${t.polished.rem(32)};
            background: url(${v(7808)}) no-repeat center;
            background-size: 100%;
            &:hover {
              background: url(${v(2965)}) no-repeat center;
              background-size: 100%;
            }
          }
        }

        .app-type {
          background: ${e.sys.color.secondary.dark};
          color: ${e.sys.color.info.light};
          border-radius: 2px;
          font-size: ${t.polished.rem(10)};
          white-space: nowrap;
          width: ${t.polished.rem(24)};
          padding: ${t.polished.rem(2)} 0;
          text-align: center;
        }
        .publish-state {
          overflow: visible;
          margin-left: ${t.polished.rem(8)};
          // max-width: ${t.polished.rem(152)};
          height: ${t.polished.rem(16)};
          width: ${t.polished.rem(16)};
          border-radius: 50%;
          background: ${o};
          .jimu-icon {
            margin-right: 0;
          }
        }
        .publish-state div {
          background: ${e.sys.color.success.light};
          border-radius: 2px;
          font-size: ${t.polished.rem(10)};
          line-height: ${t.polished.rem(18)};
          position: relative;
          white-space: nowrap;
          padding: 0 ${t.polished.rem(6)};
          text-align: center;
          color: ${e.ref.palette.white};
          max-width: ${t.polished.rem(150)};
          font-weight: bold;
        }
        .publish-state .Draft{
          color: ${e.ref.palette.white};
          background: ${e.sys.color.warning.light};
        }
        .publish-state .Changed{
          color: ${e.ref.palette.white};
          background: ${e.sys.color.error.light};
        }

        .app-title-content {
          width: 100%;
          height: ${t.polished.rem(28)};
          min-width: ${t.polished.rem(40)};
          position: relative;
          .title-placeholder {
            width: auto;
            padding: 0 0.5rem;
            font-size: ${t.polished.rem(16)};
            visibility: hidden;
            pointer-events: none;
          }
        }
        .header-title-input {
          position: absolute;
          width: 100%;
          height: 100%;
          .input-wrapper {
            background-color: transparent;
            input {
              font-size: ${t.polished.rem(16)};
              color: var(--ref-palette-neutral-1100);
            }
          }
          min-width: ${t.polished.rem(40)};
        }
        .header-title-input {
          left: 0;
          top: 0;
          width: 100%;
        }
        .title-text-placeholder {
          display: block;
          opacity: 0;
          padding-left:${t.polished.rem(5)};
          padding-right:${t.polished.rem(7)};
          word-spacing: ${t.polished.rem(6)};
        }

        .header-account {
          float: left;
          color: ${e.ref.palette.black};

          div {
            background-color: initial;
          }

          &:hover {
            // background-color: ${e.ref.palette.white};
          }
        }

        .header-login {
          cursor: pointer;
          fill: ${e.ref.palette.black};
        }

        .header-login-username {
          color: ${e.ref.palette.black};
          margin-left: 5px;
          font-size: 14px;
        }

        .toollist-seperateline {
          margin-left: ${t.polished.rem(16)};
          height: 30px;
          border: 1px solid ${e.ref.palette.neutral[700]};
        }

        .liveview-gap {
          margin-right: ${t.polished.rem(20)};
        }

        .dropdown-toggle-content {
          margin-top: ${t.polished.rem(4)};
        }

        .user-container {
          margin: 10.5px 16px;
        }
      }

      .account-dropdown-toggle:focus {
        box-shadow: none !important;
      }`}componentDidMount(){this.props.queryObject.id&&this.refreshTitleByAppId(this.props.queryObject.id),this.getHelpUrl(),this.checkEditPrivileges()}getSnapshotBeforeUpdate(e,t){return!(!this.props.queryObject.id||e.queryObject.id===this.props.queryObject.id)}componentDidUpdate(e,t,i){const{currentPageId:o,appInfo:s,queryObject:n}=this.props;if(i&&this.setState({titleText:""}),n.id!==e.queryObject.id&&e.queryObject.id?this.refreshTitleByAppId(this.props.queryObject.id):s&&0!==Object.keys(s).length&&s!==(null==e?void 0:e.appInfo)&&!this.focusTitleInput&&this.refreshTitle(null==s?void 0:s.asMutable({deep:!0})),e.currentPageId!==o){let e=!0;"template"===o&&(e=!1),this.setState({showTitle:e})}this.checkEditPrivileges(),this.props.portalUrl===(null==e?void 0:e.portalUrl)&&this.props.portalSelf===(null==e?void 0:e.portalSelf)||this.getHelpUrl(),this.checkIsItemInUpdateGroup(e)}getQuery(e){return t.queryString.parse(window.location.search)[e]||""}render(){const s=o.utils.getHomePageUrl(window.isExpressBuilder),{itemType:n,titleText:l,titleMaxWidth:r,isShowTemplateRemind:d,showTitle:p,canEditItem:c}=this.state,u=window.isExpressBuilder;return(0,e.jsxs)("div",{css:this.getStyle(),ref:this.headerContainerCon,className:"h-100",children:[(0,e.jsxs)("div",{className:"widget-builder-header d-flex justify-content-between h-100 pr-0 border-left-0 border-right-0 border-top-0",style:{overflowX:"hidden"},children:[(0,e.jsxs)("div",{className:"header-title-container",children:[(0,e.jsxs)("div",{className:"header-logo-title-state",children:[(0,e.jsxs)("div",{className:"header-logo d-flex align-items-center",children:[(0,e.jsx)("a",{onClick:this.initExbExpressModeInLocalStorage,href:s,title:this.nls("headerHome"),"aria-label":this.nls("headerHome"),children:(0,e.jsx)("div",{className:"header-logo-item d-block"})}),p&&(0,e.jsx)("div",{className:"header-title d-flex align-items-center",style:{maxWidth:r},children:(0,e.jsxs)("div",{className:"app-title-content flex-grow-1",children:[(0,e.jsx)("span",{className:"title-placeholder text-truncate",children:l}),(0,e.jsx)(i.TextInput,{ref:this.titleTextInput,className:"header-title-input font-weight-normal",value:l,onAcceptValue:this.editTitle,onChange:this.titleTextChange,onKeyDown:this.handleKeydown,onFocus:this.handleFocusTitleInput,borderless:!0,"aria-label":this.nls("appTitle")})]})})]}),(0,e.jsxs)("div",{className:"d-flex align-items-center",ref:this.publishStatusConRef,children:[(0,e.jsx)("div",{ref:e=>{this.reference=e},children:n===a.Template&&(0,e.jsxs)("div",{title:this.nls("appTypeTemplate"),className:"app-type  position-relative",children:[(0,e.jsx)(Yt,{className:"toollist-item-icon",size:"l"}),(0,e.jsx)(i.Popper,{reference:this.reference,open:d,arrowOptions:!0,toggle:this.closeTemplateRemind,placement:"right-end",offsetOptions:[-8,0],css:this.getTemplatePopperStyle(),children:(0,e.jsxs)("div",{className:"template-remind-popper",children:[(0,e.jsx)("div",{children:this.nls("templateRemind")}),(0,e.jsx)(i.Button,{type:"primary",className:"float-right",size:"sm",onClick:this.closeTemplateRemind,children:this.nls("gotIt")}),(0,e.jsx)("span",{className:"position-absolute"})]})})]})}),(0,e.jsx)(i.Tooltip,{title:this.getAppPublishStatus(),describeChild:!0,enterDelay:0,"aria-live":"off",placement:"bottom-start",children:(0,e.jsx)(i.Button,{type:"tertiary",size:"sm",className:"publish-state position-relative p-0","aria-labelledby":"app-status-label","aria-describedby":"app-status-desc",children:this.getPublishIcon()})}),(0,e.jsx)(t.ReactResizeDetector,{targetRef:this.publishStatusConRef,handleWidth:!0,onResize:this.onPublishStateContainerResized})]})]}),u&&(0,e.jsx)(Wt,{})]}),(0,e.jsxs)("div",{className:"d-flex align-items-center justify-content-end",ref:this.toolListConRef,children:[!u&&(0,e.jsxs)(B.Fragment,{children:[(0,e.jsx)(We,{intl:this.props.intl}),(0,e.jsx)("div",{className:"liveview-gap"})]}),u&&(0,e.jsx)(gi,{},this.state.keyForExpressToolbar),(0,e.jsx)(lt,{intl:this.props.intl}),(0,e.jsx)(mt,{nls:this.nls}),(0,e.jsx)("div",{className:"toollist-seperateline border-bottom-0 border-top-0 border-left-0 mt-1 mb-1 ml-2 mr-2"}),(0,e.jsx)(He,{handleTokenInvalid:this.handleTokenInvalid,theme:this.props.theme,itemId:this.state.itemId,itemType:this.state.itemType,intl:this.props.intl,appItem:this.state.appItem,publishStatus:this.state.publishStatus,changePublishStatus:this.changePublishStatus,titleText:l,locale:this.getQuery("locale")||"",onSaveStatusChanged:this.onSaveStatusChanged,onMoreOptionOpen:()=>{this.setState({keyForExpressToolbar:this.state.keyForExpressToolbar+1})},folderUrl:this.props.context.folderUrl,resetTitle:this.resetTitle,canEditItem:c,toastNote:this.toastNote,checkAndShowReadOnlyRemind:this.checkAndShowReadOnlyRemind}),(0,e.jsx)("div",{className:"float-right d-flex user-container",children:this.props.user&&(0,e.jsx)(i.UserProfile,{user:this.props.user,portalUrl:this.props.portalUrl,isAppSaved:this.state.isAppSaved,helpUrl:this.state.helpUrl})}),(0,e.jsx)(t.ReactResizeDetector,{targetRef:this.toolListConRef,handleWidth:!0,onResize:this.onToolContainerResize})]})]}),(0,e.jsx)(i.Message,{open:this.state.showToast,autoHideDuration:2e3,elevation:"shadow1",withIcon:!0,severity:"success",message:this.state.toastText,onClose:this.hideToastNote}),(0,e.jsx)(t.ReactResizeDetector,{handleWidth:!0,onResize:this.onHeaderContainerResize,targetRef:this.headerContainerCon})]})}}zi.mapExtraStateProps=e=>{var t;return{currentPageId:e.appRuntimeInfo&&e.appRuntimeInfo.currentPageId,queryObject:e.queryObject,appInfo:null===(t=null==e?void 0:e.appStateInBuilder)||void 0===t?void 0:t.appInfo}};const Di=zi;function Ci(e){v.p=e}})(),f})())}}});