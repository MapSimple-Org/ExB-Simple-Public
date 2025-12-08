System.register(["jimu-core/emotion","jimu-core","jimu-ui","jimu-ui/basic/item-selector","jimu-ui/basic/copy-button","jimu-theme"],function(e,t){var a={},o={},r={},i={},n={},s={};return{setters:[function(e){a.jsx=e.jsx,a.jsxs=e.jsxs},function(e){o.BaseVersionManager=e.BaseVersionManager,o.DataSourceManager=e.DataSourceManager,o.DataSourceStatus=e.DataSourceStatus,o.DataSourceTypes=e.DataSourceTypes,o.DataSourcesChangeMessage=e.DataSourcesChangeMessage,o.DataSourcesChangeType=e.DataSourcesChangeType,o.ExportFormat=e.ExportFormat,o.Immutable=e.Immutable,o.MessageManager=e.MessageManager,o.MutableStoreManager=e.MutableStoreManager,o.React=e.React,o.ReactRedux=e.ReactRedux,o.ServiceManager=e.ServiceManager,o.SupportedItemTypes=e.SupportedItemTypes,o.SupportedLayerServiceTypes=e.SupportedLayerServiceTypes,o.WidgetState=e.WidgetState,o.classNames=e.classNames,o.css=e.css,o.dataSourceUtils=e.dataSourceUtils,o.defaultMessages=e.defaultMessages,o.esri=e.esri,o.focusElementInKeyboardMode=e.focusElementInKeyboardMode,o.getAppStore=e.getAppStore,o.hooks=e.hooks,o.i18n=e.i18n,o.indexedDBUtils=e.indexedDBUtils,o.loadArcGISJSAPIModule=e.loadArcGISJSAPIModule,o.loadArcGISJSAPIModules=e.loadArcGISJSAPIModules,o.polished=e.polished,o.requestUtils=e.requestUtils,o.utils=e.utils,o.uuidv1=e.uuidv1},function(e){r.Alert=e.Alert,r.Button=e.Button,r.CollapsablePanel=e.CollapsablePanel,r.DataActionList=e.DataActionList,r.DataActionListStyle=e.DataActionListStyle,r.Dropdown=e.Dropdown,r.DropdownButton=e.DropdownButton,r.DropdownItem=e.DropdownItem,r.DropdownMenu=e.DropdownMenu,r.FOCUSABLE_CONTAINER_CLASS=e.FOCUSABLE_CONTAINER_CLASS,r.Icon=e.Icon,r.Input=e.Input,r.Label=e.Label,r.Loading=e.Loading,r.LoadingType=e.LoadingType,r.MobilePanel=e.MobilePanel,r.PanelHeader=e.PanelHeader,r.Paper=e.Paper,r.Popper=e.Popper,r.Resizable=e.Resizable,r.Select=e.Select,r.Tab=e.Tab,r.Tabs=e.Tabs,r.TextInput=e.TextInput,r.UrlInput=e.UrlInput,r.defaultMessages=e.defaultMessages,r.useTrapFocusLoop=e.useTrapFocusLoop},function(e){i.ItemCategory=e.ItemCategory,i.ItemSelector=e.ItemSelector,i.ItemSelectorMode=e.ItemSelectorMode},function(e){n.CopyButton=e.CopyButton},function(e){s.useTheme=e.useTheme}],execute:function(){e((()=>{var e={1888:e=>{"use strict";e.exports=s},9044:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M6 6.5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0zM9.5 6a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0v-6a.5.5 0 0 0-.5-.5"></path><path fill="#000" fill-rule="evenodd" d="M11 0H5a1 1 0 0 0-1 1v2H.5a.5.5 0 0 0 0 1h1.6l.81 11.1a1 1 0 0 0 .995.9h8.19a1 1 0 0 0 .995-.9L13.9 4h1.6a.5.5 0 0 0 0-1H12V1a1 1 0 0 0-1-1m0 3V1H5v2zm1.895 1h-9.79l.8 11h8.19z" clip-rule="evenodd"></path></svg>'},12046:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M11.227 1.312c-.404-.404-1.045-.417-1.432-.03L2.49 8.587l-.48 2.674a.637.637 0 0 0 .73.73l2.673-.48 7.305-7.306c.387-.387.374-1.028-.03-1.431zm-8.114 9.575.32-1.781 4.991-4.992 1.462 1.462-4.992 4.991zm7.473-6.012 1.402-1.4-1.462-1.463-1.401 1.402z" clip-rule="evenodd"></path><path fill="#000" d="M1.5 14a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1z"></path></svg>'},14321:e=>{"use strict";e.exports=r},23662:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M7.5 0a.5.5 0 0 0-.5.5V7H.5a.5.5 0 0 0 0 1H7v6.5a.5.5 0 0 0 1 0V8h6.5a.5.5 0 0 0 0-1H8V.5a.5.5 0 0 0-.5-.5"></path></svg>'},30655:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M2.146 4.653a.485.485 0 0 1 .708 0L8 10.24l5.146-5.587a.485.485 0 0 1 .708 0 .54.54 0 0 1 0 .738l-5.5 5.956a.485.485 0 0 1-.708 0l-5.5-5.956a.54.54 0 0 1 0-.738" clip-rule="evenodd"></path></svg>'},33e3:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 13 16"><path fill="#076FE5" d="M9.4 0H0v16h13V3.6zM12 15H1V1h7v4h4zm0-11H9V1h.31L12 3.69z" opacity=".6"></path></svg>'},39524:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M7.5 1.5a.5.5 0 0 1 1 0v2.8a.5.5 0 0 1-1 0zm6.028.874a.5.5 0 0 1 .062.705l-1.414 1.685a.5.5 0 1 1-.766-.643l1.414-1.685a.5.5 0 0 1 .704-.062m-10.352.062a.5.5 0 1 0-.766.643l1.414 1.685a.5.5 0 0 0 .766-.643zM6.244 10.6H5.43zM.961 9.8h4.88c.211 0 .359.19.359.4q0 .207.045.4a1.8 1.8 0 0 0 3.51 0h.814a2.6 2.6 0 0 1-5.139 0H.8v3.6h14.4v-3.6H9.755q.045-.194.045-.4c0-.21.148-.4.358-.4h4.881l-2.267-3.4H3.228zm11.81-4.2a.8.8 0 0 1 .666.356l2.429 3.642a.8.8 0 0 1 .134.444V14.2a.8.8 0 0 1-.8.8H.8a.8.8 0 0 1-.8-.8v-4.158a.8.8 0 0 1 .134-.444l2.429-3.642a.8.8 0 0 1 .665-.356z" clip-rule="evenodd"></path></svg>'},48091:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="#076FE5" d="M3 18H2v-7h1v4.293L5.293 13h1.414L4.85 14.857 7.006 18H5.793l-1.662-2.424L3 16.707zm13-7v7h1v-7zm-8 2v5h1v-3a1 1 0 1 1 2 0v3h1v-3a1 1 0 0 1 2 0v3h1v-3a1.991 1.991 0 0 0-3.5-1.309 1.96 1.96 0 0 0-2.5-.413V13zm13-6.291V23H3v-4h1v3h16V8h-6V2H4v8H3V1h12.29zM20 6.8 15.2 2H15v5h5z" opacity=".8"></path></svg>'},48407:e=>{"use strict";e.exports=n},56340:e=>{"use strict";e.exports=i},62838:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="m8.745 8 6.1 6.1a.527.527 0 1 1-.745.746L8 8.746l-6.1 6.1a.527.527 0 1 1-.746-.746l6.1-6.1-6.1-6.1a.527.527 0 0 1 .746-.746l6.1 6.1 6.1-6.1a.527.527 0 0 1 .746.746z"></path></svg>'},67386:e=>{"use strict";e.exports=a},79097:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="#076FE5" d="M15.29 1H3v22h18V6.709zM20 22H4V2h10v6h6zm0-15h-5V2h.2L20 6.8zm-6 4h-4v-1H7v3h1v4H7v3h3v-1h4v1h3v-3h-1v-4h1v-3h-3zm2 0v1h-1v-1zm-8 0h1v1H8zm1 8H8v-1h1zm7 0h-1v-1h1zm-1-2h-1v1h-4v-1H9v-4h1v-1h4v1h1z" opacity=".8"></path></svg>'},79244:e=>{"use strict";e.exports=o},87722:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32"><path fill="#076FE5" fill-rule="evenodd" d="M27 13.018V9.699L19.3 2H5v11.018H2.018v14.964H5V30h22v-2.018h2.982V13.018zM19 3l7 7h-7zM6 3h12v8h8v2.018H6zm20 26H6v-1.018h20zm3.018-1.982H2.982V13.982h26.036zM8.85 23.268a3.179 3.179 0 1 1 4.495-4.495l-.707.707a2.18 2.18 0 1 0-3.08 3.082 2.23 2.23 0 0 0 3.08 0l.707.707a3.177 3.177 0 0 1-4.495-.001m13.19.716L19.666 18h1.076l1.768 4.453L24.304 18h1.078l-2.412 5.986zm-4.074-1.523a.84.84 0 0 0-.04-.684 1.33 1.33 0 0 0-.947-.477c-1.289-.198-1.953-.784-1.974-1.743a1.66 1.66 0 0 1 .48-1.2c.34-.354.81-.555 1.3-.557a2.11 2.11 0 0 1 1.902 1.102l-.85.526a1.12 1.12 0 0 0-1.05-.628.8.8 0 0 0-.58.249.67.67 0 0 0-.202.476c.004.206.014.616 1.126.786a2.19 2.19 0 0 1 1.652.952c.265.467.31 1.026.126 1.53a2.13 2.13 0 0 1-2.104 1.307 2.32 2.32 0 0 1-2.146-1.24l.864-.505a1.34 1.34 0 0 0 1.282.745c.482.049.944-.206 1.16-.64zM4.5 23.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0" clip-rule="evenodd"></path></svg>'},94064:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M13.854 11.347a.486.486 0 0 1-.708 0L8 5.76l-5.146 5.587a.485.485 0 0 1-.708 0 .54.54 0 0 1 0-.738l5.5-5.956a.485.485 0 0 1 .708 0l5.5 5.956a.54.54 0 0 1 0 .738" clip-rule="evenodd"></path></svg>'}},t={};function l(a){var o=t[a];if(void 0!==o)return o.exports;var r=t[a]={exports:{}};return e[a](r,r.exports,l),r.exports}l.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return l.d(t,{a:t}),t},l.d=(e,t)=>{for(var a in t)l.o(t,a)&&!l.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},l.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),l.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.p="";var c={};return l.p=window.jimuConfig.baseUrl,(()=>{"use strict";l.r(c),l.d(c,{__set_webpack_public_path__:()=>ht,default:()=>vt});var e=l(67386),t=l(79244),a=l(14321),o=l(39524),r=l.n(o),i=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const n=a=>{const o=window.SVG,{className:n}=a,s=i(a,["className"]),l=(0,t.classNames)("jimu-icon jimu-icon-component",n);return o?(0,e.jsx)(o,Object.assign({className:l,src:r()},s)):(0,e.jsx)("svg",Object.assign({className:l},s))},s={_widgetLabel:"Add Data",urlType:"Type",arcgisUrl:"ArcGIS Server Web Service",csvUrl:"CSV Layer",geojsonUrl:"GeoJSON Layer",kmlUrl:"KML Layer",wfsUrl:"WFS OGC Web Service",wmsUrl:"WMS OGC Web Service",wmtsUrl:"WMTS OGC Web Service",dropOrBrowse:"Drop or browse",defaultPlaceholderText:"There is currently no added data.",dropOrBrowseToUpload:"Drop or browse to upload",upload:"Upload",notSupportedFileTypeError:"The file type of {fileName} is not supported.",failedToUploadError:"The file {fileName} cannot be successfully uploaded.",exceedMaxSizeError:"The file size of {fileName} exceeds the maximum limit.",exceedMaxRecordsError:"The number of records in {fileName} exceeds the maximum threshold.",exceedMaxFileNumberError:"The number of files exceeds the allowed limit.",cannotBeAddedError:"{layerName} cannot be added. Support for adding this type is not yet available.",supportedTypesHint:"Supported formats: Shapefile, CSV, KML, GeoJSON, GPX, FGDB.",fileIsUploading:"{fileName} is being uploaded",filesAreUploading:"{number} files are being uploaded",clickToAddData:"Click to add data",sampleUrl:"Sample URL",fileHasNoValidData:"The file {fileName} does not contain any valid data.",multiFilesNotSupportedFileTypeError:"Unsupported type: The file type for {number} file(s) is not supported.",multiFilesFailedToUploadError:"Upload failed: Unable to upload {number} file(s).",multiFilesExceedMaxRecordsError:"Too many records: The limit for {number} file(s) has been exceeded.",multiFilesExceedMaxSizeError:"File size too large: The limit of {number} file(s) has been exceeded.",multiFilesHasNoValidData:"Invalid data: No valid data found for {number} file(s).",confirmZipType:"Confirm data type for ZIP files",fileGeodatabase:"File geodatabase"};var d=function(e,t,a,o){return new(a||(a=Promise))(function(r,i){function n(e){try{l(o.next(e))}catch(e){i(e)}}function s(e){try{l(o.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?r(e.value):(t=e.value,t instanceof a?t:new a(function(e){e(t)})).then(n,s)}l((o=o.apply(e,t||[])).next())})};function u(e){return t.DataSourceManager.getInstance().getDataSource(e)}function p(e,a,o){const r=new t.DataSourcesChangeMessage(e,a,o);t.MessageManager.getInstance().publishMessage(r)}const m=(e,a)=>e.map(e=>{const o=Object.assign({},e.dataSourceJson);return o.disableExport=a.disableExport,o.disableExport||(o.exportOptions={formats:Object.values(t.ExportFormat).filter(e=>{var t;return!(null===(t=a.notAllowedExportFormat)||void 0===t?void 0:t.includes(e))})}),Object.assign(Object.assign({},e),{dataSourceJson:o})}),v=e=>{var a;const o=e.getDataSourceJson(),r=null===(a=e.getAllChildDataSources)||void 0===a?void 0:a.call(e);(null==r?void 0:r.length)>0&&r.forEach(e=>{t.DataSourceManager.getInstance().updateDataSourceByDataSourceJson(e,e.getDataSourceJson().set("disableExport",o.disableExport).set("exportOptions",o.exportOptions))})};function f(e,a,o){return d(this,arguments,void 0,function*(e,a,o,r=!0){if(!e||0===e.length)return Promise.resolve([]);let i,n,s,l;if(e.some(e=>e.restLayer)){const e=yield(0,t.loadArcGISJSAPIModules)(["esri/layers/FeatureLayer","esri/Graphic","esri/layers/support/Field","esri/renderers/support/jsonUtils"]);i=e[0],n=e[1],s=e[2],l=e[3]}const c=m(e,o).map(e=>{var a,o,r,c,d,u,p;if(e.restLayer&&i&&n&&s&&l){const m=null===(o=null===(a=e.restLayer.layerDefinition)||void 0===a?void 0:a.drawingInfo)||void 0===o?void 0:o.renderer;return{id:e.dataSourceJson.id,dataSourceJson:(0,t.Immutable)(e.dataSourceJson),layer:new i({source:(null===(c=null===(r=e.restLayer.featureSet)||void 0===r?void 0:r.features)||void 0===c?void 0:c.map(e=>n.fromJSON(e)))||[],objectIdField:null===(d=e.restLayer.layerDefinition)||void 0===d?void 0:d.objectIdField,fields:null===(p=null===(u=e.restLayer.layerDefinition)||void 0===u?void 0:u.fields)||void 0===p?void 0:p.map(e=>s.fromJSON(e)),sourceJSON:e.restLayer.layerDefinition,title:e.dataSourceJson.label||e.dataSourceJson.sourceLabel,renderer:m?l.fromJSON(m):void 0})}}return{id:e.dataSourceJson.id,dataSourceJson:(0,t.Immutable)(e.dataSourceJson)}});return yield Promise.allSettled(c.filter(e=>e.layer).map(e=>d(this,void 0,void 0,function*(){var t;const a=null===(t=e.layer.sourceJSON)||void 0===t?void 0:t.capabilities;a&&(yield e.layer.load(),e.layer.sourceJSON.capabilities=a)}))),Promise.allSettled(c.map(e=>t.DataSourceManager.getInstance().createDataSource(e).then(e=>e.isDataSourceSet()&&!e.areChildDataSourcesCreated()?e.childDataSourcesReady().then(()=>e):e))).then(e=>e.filter(e=>"fulfilled"===e.status).map(e=>e.value)).then(o=>(o.forEach(e=>{v(e)}),r&&o.length>0&&p(a,t.DataSourcesChangeType.Create,o),o.length<e.length?Promise.reject(new Error("Failed to create some data source.")):o))})}function h(e){return d(this,void 0,void 0,function*(){return e&&0!==e.length?Promise.resolve().then(()=>{e.forEach(e=>{const a=u(e.dataSourceJson.id);a&&(t.DataSourceManager.getInstance().updateDataSourceByDataSourceJson(a,(0,t.Immutable)(e.dataSourceJson)),v(a))})}):Promise.resolve()})}function g(e){var t;e.stopPropagation(),e.preventDefault(),null===(t=e.nativeEvent)||void 0===t||t.stopImmediatePropagation()}function y(e){const a=t.React.useRef(null),o=t.React.useRef(null);return Object.is(o.current,e)||(a.current=o.current,o.current=e),a.current}function x(e,t){return`add-data-${e}-${t}-${(new Date).getTime()}`}function b(e,a){return d(this,void 0,void 0,function*(){var o,r,i,n;if(1===((null==a?void 0:a.layers)||[]).concat((null==a?void 0:a.tables)||[]).length&&(1===(null===(o=null==a?void 0:a.layers)||void 0===o?void 0:o.length)&&(null===(i=null===(r=null==a?void 0:a.layers)||void 0===r?void 0:r[0])||void 0===i?void 0:i.type)===t.SupportedLayerServiceTypes.FeatureLayer||1===(null===(n=null==a?void 0:a.tables)||void 0===n?void 0:n.length))){const o=function(e,t){var a;return`${e}/${(null===(a=((null==t?void 0:t.layers)||[]).concat((null==t?void 0:t.tables)||[])[0])||void 0===a?void 0:a.id)||0}`}(e,a);return{url:o,layerDefinition:yield t.ServiceManager.getInstance().fetchServiceInfo(o).then(e=>e.definition)}}return null})}var S=l(23662),w=l.n(S),j=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const I=a=>{const o=window.SVG,{className:r}=a,i=j(a,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:n,src:w()},i)):(0,e.jsx)("svg",Object.assign({className:n},i))};var N=l(56340);const O=()=>[{type:N.ItemCategory.MyContent,customLabel:"",enabled:!0,id:N.ItemCategory.MyContent},{type:N.ItemCategory.MyGroup,customLabel:"",enabled:!0,id:N.ItemCategory.MyGroup},{type:N.ItemCategory.MyOrganization,customLabel:"",enabled:!0,id:N.ItemCategory.MyOrganization},{type:N.ItemCategory.Public,customLabel:"",enabled:!0,id:N.ItemCategory.Public},{type:N.ItemCategory.LivingAtlas,customLabel:"",enabled:!0,id:N.ItemCategory.LivingAtlas}],M=(e,t)=>((e,t)=>{var a;if(e.type!==N.ItemCategory.Curated)return t;const o=Number(null===(a=e.id.split("_"))||void 0===a?void 0:a.pop());return!o||o<2?t:`${t} ${o}`})(t,e((e=>{switch(e){case N.ItemCategory.MyContent:return"myContent";case N.ItemCategory.MyGroup:return"myGroup";case N.ItemCategory.MyOrganization:return"myOrganization";case N.ItemCategory.Public:return"public";case N.ItemCategory.LivingAtlas:return"livingAtlas";case N.ItemCategory.Curated:return"curated"}})(t.type)));var D=function(e,t,a,o){return new(a||(a=Promise))(function(r,i){function n(e){try{l(o.next(e))}catch(e){i(e)}}function s(e){try{l(o.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?r(e.value):(t=e.value,t instanceof a?t:new a(function(e){e(t)})).then(n,s)}l((o=o.apply(e,t||[])).next())})};const T=t.dataSourceUtils.dataSourceJsonCreator,{useMemo:C,useState:F}=t.React,{useSelector:E}=t.ReactRedux,z=(0,t.Immutable)([t.SupportedItemTypes.FeatureService,t.SupportedItemTypes.MapService,t.SupportedItemTypes.SceneService,t.SupportedItemTypes.FeatureCollection,t.SupportedItemTypes.ImageService,t.SupportedItemTypes.VectorTileService,t.SupportedItemTypes.CSV,t.SupportedItemTypes.GeoJSON,t.SupportedItemTypes.KML,t.SupportedItemTypes.WFS,t.SupportedItemTypes.WMS,t.SupportedItemTypes.WMTS,t.SupportedItemTypes.GroupLayer]),L=o=>{const{className:r="",widgetId:i,multiDataOptions:n,portalUrl:l,nextOrder:c,onChange:d,itemCategoriesInfo:u,displayedItemTypeCategories:p}=o,m=E(e=>e.dataSourcesInfo),[v,f]=F([]),h=C(()=>(0,t.Immutable)(n.filter(e=>{var a;const o=null===(a=null==m?void 0:m[e.dataSourceJson.id])||void 0===a?void 0:a.instanceStatus;return e.dataSourceJson.itemId&&(!o||o===t.DataSourceStatus.NotCreated)}).map(e=>e.dataSourceJson.itemId).concat(v)),[n,m,v]),g=C(()=>(0,t.Immutable)(n.map(e=>e.dataSourceJson.itemId).filter(e=>!h.some(t=>t===e))),[n,h]),y=t.hooks.useTranslation(a.defaultMessages,s),S=(()=>{const[e,a]=t.React.useState([]);return t.React.useEffect(()=>{"true"===t.utils.readLocalStorage("restrictEnterpriseOnly")&&a([N.ItemCategory.Public,N.ItemCategory.LivingAtlas])},[]),e})(),w=C(()=>u?u.filter(e=>e.enabled&&!S.includes(e.type)).map(e=>({id:e.id,type:e.type,customLabel:e.customLabel||M(y,e),curatedFilter:e.curatedFilter})).asMutable():void 0,[u,S,y]);return(0,e.jsx)("div",{className:`data-item-search w-100 h-100 ${r}`,css:P,children:(0,e.jsx)(N.ItemSelector,{mode:N.ItemSelectorMode.Simple,itemType:z,itemTypeCategory:p,portalUrl:l,isMultiple:!0,onSelect:(e,a)=>D(void 0,void 0,void 0,function*(){if(n.some(e=>{var t;return(null===(t=e.dataSourceJson)||void 0===t?void 0:t.itemId)===a.id}))return;f(v.concat(null==a?void 0:a.id));const e=yield function(e,a){return D(this,void 0,void 0,function*(){var o,r,i;try{if(!a)return Promise.resolve(null);if(a.type===t.SupportedItemTypes.FeatureService&&a.url&&/^(http(s)?:)?\/\//.test(a.url)){const n=a.url.split("?")[0].replace(/^http:/,"https:").replace(/\/$/,""),s=yield t.ServiceManager.getInstance().fetchServiceInfo(n).then(e=>e.definition);let l,c;const d={itemId:a.id,portalUrl:a.portalUrl};if(t.dataSourceUtils.isSupportedSingleArcGISLayerService(a.url))l=a.url,c=s;else{const e=((null==s?void 0:s.layers)||[]).concat((null==s?void 0:s.tables)||[]),t=yield b(n,s);t&&(l=t.url,c=t.layerDefinition,d.sourceLabel=a.title||(null===(o=e[0])||void 0===o?void 0:o.name))}if(l&&c)return null===(i=null===(r=T.createDataSourceJsonByLayerDefinition(e,c,l))||void 0===r?void 0:r.merge(d))||void 0===i?void 0:i.asMutable({deep:!0})}return Promise.resolve(T.createDataSourceJsonByItemInfo(e,a,a.portalUrl).asMutable({deep:!0}))}catch(e){return console.error("Failed to create data source",e),Promise.resolve(null)}})}(x(i,c),a);f(v.filter(e=>e!==(null==a?void 0:a.id))),d(n.concat({dataSourceJson:e,order:c}).filter(e=>!!e.dataSourceJson))}),onRemove:(e,t)=>{d(n.filter(e=>e.dataSourceJson.itemId!==t.id))},selectedItems:g,loadingItems:h,itemCategoriesInfo:w,disableDetailPopper:!0,allowAllSceneService:!0,showItemTypeCategoryFilter:!0,enableContentSortInSimpleMode:!0,disableDefaultSortSetting:!0})})};const P=t.css`
  position: relative;
`;var U=l(48407),k=function(e,t,a,o){return new(a||(a=Promise))(function(r,i){function n(e){try{l(o.next(e))}catch(e){i(e)}}function s(e){try{l(o.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?r(e.value):(t=e.value,t instanceof a?t:new a(function(e){e(t)})).then(n,s)}l((o=o.apply(e,t||[])).next())})};const A=t.dataSourceUtils.dataSourceJsonCreator;var R;!function(e){e.NotSupportedType="addDataErrorNotSupported",e.FailedToFetch="invalidResourceItem",e.CannotBeAdded="cannotBeAddedError"}(R||(R={}));const{useState:J,useMemo:B,useRef:V}=t.React;var G;!function(e){e.ArcGISWebService="arcgisUrl",e.WMS="wmsUrl",e.WMTS="wmtsUrl",e.WFS="wfsUrl",e.KML="kmlUrl",e.CSV="csvUrl",e.GeoJSON="geojsonUrl"}(G||(G={}));const H={[G.ArcGISWebService]:"https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Cities/FeatureServer/0",[G.WMS]:"https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?service=WMS&request=GetCapabilities",[G.WMTS]:"https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/45134/%7Blevel%7D/%7Brow%7D/%7Bcol%7D",[G.WFS]:"https://dservices.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/services/JapanPrefectures2018/WFSServer",[G.KML]:"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month_age_animated.kml",[G.CSV]:"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.csv",[G.GeoJSON]:"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"},$=["https"],W=o=>{const{className:r="",widgetId:i,onChange:n,setErrorMsg:l,nextOrder:c,multiDataOptions:d}=o,u=t.hooks.useTranslation(t.defaultMessages,a.defaultMessages,s),[p,m]=J(G.ArcGISWebService),[v,f]=J({value:"",valid:!0}),[h,g]=J(!1),y=V(null),S=B(()=>{const e={};return Object.values(G).forEach(t=>{e[t]=u(t)}),e},[u]),w=e=>{const a=function(e,a){if(!e||!a)return!0;return a!==G.ArcGISWebService?/^https:\/\//.test(e):t.dataSourceUtils.isSupportedArcGISService(e)||_(e)}(e,p);return{valid:a,msg:!a&&u("invalidUrlMessage")}},j=`add-data-${i}-sample-url-content`;return(0,e.jsxs)("div",{className:`data-url-input w-100 h-100 p-4 ${r}`,css:q,children:[(0,e.jsxs)("div",{children:[(0,e.jsx)("div",{className:"url-input-label",children:u("urlType")}),(0,e.jsxs)(a.Dropdown,{className:"w-100",activeIcon:!0,menuRole:"listbox","aria-label":u("urlType"),children:[(0,e.jsx)(a.DropdownButton,{size:"sm",className:"text-left",role:"combobox",children:S[p]}),(0,e.jsx)(a.DropdownMenu,{children:Object.keys(S).map((t,o)=>(0,e.jsx)(a.DropdownItem,{active:p===t,onClick:()=>{var e;(e=t)!==p&&(m(e),f({value:"",valid:v.valid}))},children:S[t]},o))})]})]}),(0,e.jsxs)("div",{className:"mt-4",children:[(0,e.jsx)("div",{className:"url-input-label",children:u("url")}),(0,e.jsx)(a.UrlInput,{className:(0,t.classNames)({"with-error":!v.valid}),height:80,schemes:$,value:v.value,checkValidityOnChange:w,checkValidityOnAccept:w,onChange:e=>{f(e)},"aria-label":u("url")})]}),(0,e.jsx)("div",{className:"mt-4",children:(0,e.jsx)(a.Button,{onClick:()=>k(void 0,void 0,void 0,function*(){var e;const a=null==v?void 0:v.value;if(a)try{g(!0);const e=yield function(e,a,o){return k(this,void 0,void 0,function*(){return a&&o?(a=a.replace(/^http:/,"https:"),Object.keys(K).some(e=>e===o)?{id:e,type:K[o],sourceLabel:a.split("?")[0].split("/").filter(e=>!!e).reverse()[0],url:a}:o===G.ArcGISWebService?_(a=a.split("?")[0])?function(e,a){return k(this,void 0,void 0,function*(){if(!e||!a)return Promise.reject(new Error(R.NotSupportedType));const o=e.match(new RegExp("(?<portalUrl>.+)content/items/.+/resources/styles/root.json")).groups.portalUrl,r=e.match(new RegExp(".+/content/items/(?<itemId>.+)/resources/styles/root.json")).groups.itemId,i=yield t.requestUtils.requestWrapper(o,e=>t.esri.restPortal.getItem(r,{portal:o,authentication:e}));return"Vector Tile Service"!==i.type?Promise.reject(new Error(R.NotSupportedType)):{id:a,type:t.DataSourceTypes.VectorTileService,sourceLabel:i.title,url:e,itemId:r,portalUrl:o.replace("/sharing/rest/","")}})}(a,e):function(e,a){return k(this,void 0,void 0,function*(){if(!e||!a)return Promise.reject(new Error(R.NotSupportedType));const o=yield t.ServiceManager.getInstance().fetchServiceInfo(e).then(e=>e.definition);let r=e,i=o;if(t.dataSourceUtils.isSupportedWholeArcGISService(e)&&A.getDataSourceTypeFromArcGISWholeServiceUrl(e)===t.DataSourceTypes.FeatureService){const t=e.split("?")[0].replace(/^http:/,"https:").replace(/\/$/,""),a=yield b(t,o);a&&(r=a.url,i=a.layerDefinition)}return function(e,t,a){var o;const r=null===(o=A.createDataSourceJsonByLayerDefinition(e,a,t))||void 0===o?void 0:o.asMutable({deep:!0});if(r)return r;throw new Error(R.FailedToFetch)}(a,r,i)})}(a,e):Promise.reject(new Error(R.NotSupportedType))):Promise.reject(new Error("Need URL."))})}(x(i,c),a,p);if(y.current=e,e.type===t.DataSourceTypes.GroupLayer)throw new Error(R.CannotBeAdded);e&&n(d.concat({dataSourceJson:e,order:c}))}catch(t){t.message===R.NotSupportedType?l(u(R.NotSupportedType)):t.message===R.CannotBeAdded?l(u(R.CannotBeAdded,{layerName:null===(e=y.current)||void 0===e?void 0:e.sourceLabel})):l(u(R.FailedToFetch))}finally{y.current=null,g(!1)}}),type:"primary",disabled:!v.value||!v.valid,className:"px-4 w-100",title:u("add"),"aria-label":u("add"),children:u("add")})}),(0,e.jsxs)("div",{className:"mt-4",children:[(0,e.jsxs)("div",{className:"url-input-label mb-1 d-flex align-items-center sample-url-title",role:"group","aria-label":u("sampleUrl"),children:[u("sampleUrl"),(0,e.jsx)(U.CopyButton,{text:H[p],"aria-describedby":j})]}),(0,e.jsx)("div",{className:"sample-url",id:j,children:H[p]})]}),h&&(0,e.jsx)("div",{className:"upload-loading-container",children:(0,e.jsx)("div",{className:"upload-loading-content",children:(0,e.jsx)(a.Loading,{className:"upload-loading",type:a.LoadingType.Primary,width:30,height:28})})})]})};function _(e){return!(!e||!/^https:\/\//.test(e))&&/\/content\/items\/.+\/resources\/styles\/root.json/.test(e)}const K={[G.CSV]:t.DataSourceTypes.CSV,[G.GeoJSON]:t.DataSourceTypes.GeoJSON,[G.KML]:t.DataSourceTypes.KML,[G.WFS]:t.DataSourceTypes.WFS,[G.WMS]:t.DataSourceTypes.WMS,[G.WMTS]:t.DataSourceTypes.WMTS};const q=t.css`
  position: relative;
  overflow: auto;

  .upload-loading-container {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }
  .upload-loading-content {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }

  .sample-url {
    font-style: italic;
    font-weight: 400;
    font-size: 13px;
    word-break: break-all;
    color: var(--sys-color-surface-overlay-text);
  }

  .url-input.with-error {
    margin-bottom: 60px;
  }
  .url-input-label {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--sys-color-surface-overlay-text);
  }
  .sample-url-title {
    justify-content: space-between;
  }
  .jimu-dropdown-button {
    color: var(--sys-color-surface-overlay-text);
  }
`;var Z,X=l(1888),Q=function(e,t,a,o){return new(a||(a=Promise))(function(r,i){function n(e){try{l(o.next(e))}catch(e){i(e)}}function s(e){try{l(o.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?r(e.value):(t=e.value,t instanceof a?t:new a(function(e){e(t)})).then(n,s)}l((o=o.apply(e,t||[])).next())})};!function(e){e.CSV="csv",e.GeoJson="geojson",e.Shapefile="shapefile",e.KML="kml",e.GPX="gpx",e.FileGeoDatabase="fileGeodatabase"}(Z||(Z={}));const Y=[Z.Shapefile,Z.FileGeoDatabase],ee={[Z.CSV]:10485760,[Z.GeoJson]:10485760,[Z.Shapefile]:2097152,[Z.FileGeoDatabase]:10485760,[Z.KML]:10485760,[Z.GPX]:10485760};var te;!function(e){e.NotSupportedType="notSupportedFileTypeError",e.FailedToUpload="failedToUploadError",e.ExceedMaxSize="exceedMaxSizeError",e.ExceedMaxRecords="exceedMaxRecordsError",e.NoValidData="fileHasNoValidData",e.ExceedMaxFileNumber="exceedMaxFileNumberError"}(te||(te={}));const ae=new Map([[te.NotSupportedType,"multiFilesNotSupportedFileTypeError"],[te.FailedToUpload,"multiFilesFailedToUploadError"],[te.ExceedMaxSize,"multiFilesExceedMaxSizeError"],[te.ExceedMaxRecords,"multiFilesExceedMaxRecordsError"],[te.NoValidData,"multiFilesHasNoValidData"]]),oe=4e3,{useState:re,useEffect:ie,useMemo:ne,useRef:se}=t.React,le=/iPad|iPhone|iPod/.test(window.navigator.userAgent)?void 0:Object.values(Z).map(e=>de(e)).join(","),ce=o=>{const{className:r="",onChange:i,setErrorMsg:n,nextOrder:c,portalUrl:d,widgetId:u,multiDataOptions:p,onlyOneTab:m}=o,v=t.hooks.useTranslation(t.defaultMessages,s),f=ne(()=>`${u}-drag-to-upload`,[u]),h=ne(()=>`${u}-click-to-upload`,[u]),[y,b]=re(!1),S=se(null),w=se([]);ie(()=>{i(p)},[p,i]);const j=se(null),N=e=>Q(void 0,void 0,void 0,function*(){var a;if(!e.type)throw new Error(te.NotSupportedType);if(e.size>ee[e.type])throw new Error(te.ExceedMaxSize);const o=yield function(e,a){return Q(this,void 0,void 0,function*(){var o,r,i,n,s,l,c,d,u,p,m;const v=yield(0,t.loadArcGISJSAPIModule)("esri/request");if(e.type===Z.KML){const a=function(){var e,a,o;const r=null===(a=null===(e=(0,t.getAppStore)().getState())||void 0===e?void 0:e.portalSelf)||void 0===a?void 0:a.isPortal;if(r){return`${null===(o=(0,t.getAppStore)().getState())||void 0===o?void 0:o.portalUrl}/sharing/kml`}const i=window.jimuConfig.hostEnv;return`https://utility${"dev"===i?"devext":"qa"===i?"qa":""}.arcgis.com/sharing/kml`}(),r=yield function(e){return new Promise(t=>{const a=new FileReader;a.onload=e=>{t(e.target.result)},a.readAsText(e.data.get("file"))})}(e),i=yield v(a,{query:{kmlString:encodeURIComponent(r),model:"simple",folders:""},responseType:"json"});return null===(o=null==i?void 0:i.data)||void 0===o?void 0:o.featureCollection}let f={};if(e.type!==Z.GPX){if((null===(i=null===(r=(0,t.getAppStore)().getState())||void 0===r?void 0:r.portalSelf)||void 0===i?void 0:i.isPortal)&&e.type===Z.GeoJson)f={targetSR:{wkid:102100,latestWkid:3857},type:e.type,maxRecordCount:oe};else{const o=`${a}/sharing/rest/content/features/analyze`;e.data.set("analyzeParameters",JSON.stringify({enableGlobalGeocoding:!0,sourceLocale:null!==(s=null===(n=(0,t.getAppStore)().getState().appContext)||void 0===n?void 0:n.locale)&&void 0!==s?s:"en"}));const r=yield v(o,{body:e.data,method:"post"});e.data.delete("analyzeParameters"),f=null===(l=null==r?void 0:r.data)||void 0===l?void 0:l.publishParameters}}const h=`${a}/sharing/rest/content/features/generate`;e.data.set("publishParameters",JSON.stringify(Object.assign(Object.assign({},f),{name:e.name,maxRecordCount:e.type===Z.CSV?f.maxRecordCount:oe})));const g=yield v(h,{body:e.data,method:"post"});return e.data.delete("publishParameters"),(null===(c=null==g?void 0:g.data)||void 0===c?void 0:c.featureCollection)&&(null===(p=null===(u=null===(d=null==g?void 0:g.data)||void 0===d?void 0:d.featureCollection)||void 0===u?void 0:u.layers)||void 0===p||p.forEach(t=>{var a,o,r,i;null===(o=null===(a=t.featureSet)||void 0===a?void 0:a.features)||void 0===o||o.forEach(e=>{var a,o;null===(o=null===(a=t.layerDefinition)||void 0===a?void 0:a.fields)||void 0===o||o.forEach(t=>{var a;const o=null===(a=e.attributes)||void 0===a?void 0:a[t.name];if("esriFieldTypeSmallInteger"===t.type){if("boolean"==typeof o)return void(e.attributes[t.name]=o?1:0);"number"!=typeof o&&(e.attributes[t.name]=null)}})}),(null===(i=null===(r=t.layerDefinition)||void 0===r?void 0:r.name)||void 0===i?void 0:i.includes(e.name))||(t.layerDefinition.name=`${e.name} - ${t.layerDefinition.name}`)})),null===(m=null==g?void 0:g.data)||void 0===m?void 0:m.featureCollection})}(e,d),r=null===(a=null==o?void 0:o.layers)||void 0===a?void 0:a.filter(e=>{var t,a;return(null===(a=null===(t=null==e?void 0:e.featureSet)||void 0===t?void 0:t.features)||void 0===a?void 0:a.length)>0});if((null==r?void 0:r.length)>0)return r.map((a,o)=>{var r;return{dataSourceJson:{id:x(u,c+o),type:t.DataSourceTypes.FeatureLayer,sourceLabel:(null===(r=a.layerDefinition)||void 0===r?void 0:r.name)||(0===o?e.name:`${e.name} ${o}`)},order:c+o,restLayer:Object.assign(Object.assign({},a),{layerDefinition:Object.assign(Object.assign({},a.layerDefinition),{capabilities:"Query, Editing, Create, Delete, Update, Extract"})})}});throw new Error(te.NoValidData)}),[O,M]=re(null),[D,T]=re([]),[C,F]=re(!1),E=e=>{if(!e.target.files)return;M(null);const a=new Map,o=Array.from(e.target.files);if(o.length>30)a.set(te.ExceedMaxFileNumber,[]),L(a);else{const e=o.map(e=>function(e){const a=function(e){return Object.values(Z).find(t=>null==e?void 0:e.endsWith(de(t)))}(e.name),o=e.name.replace(`.${a}`,""),r=new FormData;return r.set("file",e),r.set("filetype",a),r.set("f","json"),{id:(0,t.uuidv1)(),type:a,name:o,data:r,size:e.size}}(e));S.current=e;e.filter(e=>e.type===Z.Shapefile).length>0?(T(e),F(!0)):z(e)}},z=e=>Q(void 0,void 0,void 0,function*(){b(!0);let t=[];const a=new Map;yield Promise.allSettled(e.map(e=>N(e))).then(o=>{o.forEach((o,r)=>{var i;const n=e[r];if(w.current.some(e=>e.id===n.id))w.current=w.current.filter(e=>e.id!==n.id);else if("fulfilled"===o.status)(null===(i=o.value)||void 0===i?void 0:i.length)&&(t=t.concat(o.value));else{const e=(e=>{var t,a,o,r;return e.message===te.NotSupportedType?te.NotSupportedType:e.message===te.ExceedMaxSize||(null===(o=null===(a=null===(t=e.details)||void 0===t?void 0:t.messages)||void 0===a?void 0:a[0])||void 0===o?void 0:o.includes("max size"))?te.ExceedMaxSize:e.message===te.ExceedMaxRecords||(null===(r=e.message)||void 0===r?void 0:r.includes("maximum number"))?te.ExceedMaxRecords:e.message===te.NoValidData?te.NoValidData:te.FailedToUpload})(o.reason);a.set(e,a.has(e)?a.get(e).concat(n.name):[n.name])}})}),(null==t?void 0:t.length)>0&&i(p.concat(t)),b(!1),L(a)}),L=e=>{if(e.size>0){const t=Array.from(e.keys()).map(t=>{const a=e.get(t);return a.length?1===a.length&&1===e.size?{errStr:v(t,{fileName:a[0]})}:{errStr:v(ae.get(t),{number:a.length}),details:a}:{errStr:v(t)}});1!==t.length||t[0].details?M(t.map(e=>Object.assign(Object.assign({},e),{open:!0}))):n(t[0].errStr)}S.current=null,j.current.value=null},P=se(null);(0,a.useTrapFocusLoop)(P,!0,!0,!0,C);t.hooks.useUpdateEffect(()=>{!y&&j.current&&(0,t.focusElementInKeyboardMode)(j.current)},[y]);const[U,k]=re(!1),A=(0,X.useTheme)(),R=se(null);ie(()=>{if(null==O?void 0:O.length){const e=setTimeout(()=>{R.current===e&&(M(null),R.current=null)},5e3);R.current=e}},[O]);const J=(t=!1)=>{var a,o,r;const i=null===(a=S.current)||void 0===a?void 0:a.length,n=i>1,s=n?"filesAreUploading":"fileIsUploading",l=n?"number":"fileName",c=n?i:null===(r=null===(o=S.current)||void 0===o?void 0:o[0])||void 0===r?void 0:r.name;return v(s,{[l]:!n&&t?(0,e.jsx)("div",{className:"w-100 multiple-lines-truncate font-16",children:c}):c})},B=`add-data-${u}-supported-types-desc`,V=`add-data-${u}-upload-area-desc`,G=`add-data-${u}-uploading-text-container`;return(0,e.jsxs)("div",{className:`data-file-upload w-100 h-100 pb-4 pt-6 px-4 d-flex ${r}`,css:ue(m),children:[(0,e.jsxs)("div",{className:"supported-type-icons d-flex justify-content-around align-items-center px-6 mb-4",children:[(0,e.jsx)(a.Icon,{width:13,height:16,icon:l(33e3)}),(0,e.jsx)(a.Icon,{width:24,height:24,icon:l(79097)}),(0,e.jsx)(a.Icon,{width:32,height:32,icon:l(87722)}),(0,e.jsx)(a.Icon,{width:24,height:24,icon:l(48091)}),(0,e.jsx)(a.Icon,{width:13,height:16,icon:l(33e3)})]}),(0,e.jsx)("div",{className:"supported-types",id:B,children:v("supportedTypesHint")}),(0,e.jsxs)("div",{className:"mt-4 drag-area-container",children:[(0,e.jsxs)(a.Label,{for:f,className:"drag-area text-center d-flex",children:[(0,e.jsx)("div",{className:"font-14",id:V,children:v("dropOrBrowseToUpload")}),(0,e.jsxs)("div",{className:"upload-btn-container mt-4",title:v("upload"),"aria-live":"assertive",children:[(0,e.jsxs)(a.Label,{for:h,className:"upload-btn text-center mb-0 text-truncate",css:U?t.css`outline: ${t.polished.rem(2)} solid ${A.sys.color.primary.dark}`:"",children:[(0,e.jsx)(I,{size:15,className:"mr-2"}),(0,e.jsx)("span",{children:v("upload")})]}),(0,e.jsx)("input",{id:h,title:"",className:"upload-btn-file-input",type:"file",accept:le,onChange:E,tabIndex:y?-1:0,ref:j,multiple:!0,onFocus:()=>{k(!0)},onBlur:()=>{k(!1)},"aria-describedby":`${V} ${B}`})]})]}),(0,e.jsx)(a.Input,{id:f,onClick:g,title:"",className:"drag-area-file-input",type:"file",accept:le,onChange:E,tabIndex:-1})]}),y&&(0,e.jsx)("div",{className:"upload-loading-container",title:J(),"aria-live":"assertive",children:(0,e.jsxs)("div",{className:"upload-loading-content d-flex flex-column",children:[(0,e.jsx)("div",{className:"w-100 px-4 upload-loading-file-name d-flex justify-content-center align-items-center",children:(0,e.jsx)("div",{className:"w-100 font-14 text-center",id:G,children:J(!0)})}),(0,e.jsx)(a.Loading,{className:"upload-loading",type:a.LoadingType.Secondary,width:30,height:28}),(0,e.jsx)("div",{className:"upload-loading-btn",children:(0,e.jsx)(a.Button,{type:"danger",onClick:()=>{w.current=w.current.concat(S.current),S.current=null,b(!1)},ref:e=>{(0,t.focusElementInKeyboardMode)(e)},"aria-describedby":G,children:v("cancel")})})]})}),C&&(0,e.jsx)("div",{className:"confirm-zip-container p-3",ref:P,role:"dialog","aria-label":v("confirmZipType"),"aria-modal":"true",children:(0,e.jsxs)("div",{className:"confirm-zip-content h-100 d-flex flex-column pt-3 pb-4 px-4",role:"",children:[(0,e.jsx)("div",{className:"title mb-4",children:v("confirmZipType")}),(0,e.jsx)("div",{className:"zip-files-content",children:D.map((t,o)=>Y.includes(t.type)&&(0,e.jsxs)("div",{children:[(0,e.jsx)("div",{className:"file-name text-truncate",title:t.name,children:t.name}),(0,e.jsx)(a.Select,{className:"mb-3",size:"sm",value:t.type,onChange:(e,t)=>{((e,t)=>{const a=[...D];a[e].type=t,a[e].data.set("filetype",t),T(a)})(o,t)},"aria-label":t.name,children:Y.map(a=>(0,e.jsx)("option",{value:a,selected:a===t.type,children:a===Z.Shapefile?"Shapefile":v(a)},a))})]},t.id))}),(0,e.jsxs)("div",{className:"footer pt-4",children:[(0,e.jsx)(a.Button,{className:"w-100",type:"primary",size:"sm",onClick:()=>{z(D),F(!1),S.current=D},children:v("ok")}),(0,e.jsx)(a.Button,{className:"w-100",type:"default",size:"sm",onClick:()=>{const e=D.filter(e=>!Y.includes(e.type));z(e),F(!1),S.current=e},children:v("cancel")})]})]})}),(null==O?void 0:O.length)&&(0,e.jsx)("div",{className:"errors-container",children:O.map((t,o)=>{var r;return(0,e.jsx)(a.Alert,{className:"w-100 mb-2",closable:!0,withIcon:!0,form:"basic",type:"warning",title:t.errStr,open:t.open,onClose:()=>{(e=>{const t=[...O];t[e].open=!1,t.every(e=>!e.open)?M(null):M(t)})(o)},children:(null===(r=t.details)||void 0===r?void 0:r.length)&&(0,e.jsx)("div",{className:"collapse-panel-container mt-2",children:(0,e.jsx)(a.CollapsablePanel,{label:v("details"),children:t.details.map((t,a)=>(0,e.jsx)("p",{className:"mb-1",children:t},a))})})},t.errStr)})})]})};function de(e){return e===Z.Shapefile||e===Z.FileGeoDatabase?".zip":`.${e}`}const ue=e=>t.css`
  flex-direction: column;
  color: var(--sys-color-surface-overlay-hint);

  .font-14 {
    font-size: 14px;
  }

  .font-16 {
    font-size: 16px;
    font-weight: 500;
  }
  .confirm-zip-container {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.3);
    color: var(--sys-color-surface-overlay-text);
    z-index: 20;
    .confirm-zip-content {
      background-color: var(--sys-color-surface-overlay);
      .title {
        font-family: var(--sys-typography-title2-font-family);
        font-weight: var(--sys-typography-title2-font-weight);
        font-size: var(--sys-typography-title2-font-size);
        line-height: var(--sys-typography-title2-line-height);
      }
      .zip-files-content {
        flex: 1;
        overflow-y: auto;
        .file-name {
          margin-bottom: var(--sys-spacing-1);
          font-family: var(--sys-typography-title3-font-family);
          font-weight: var(--sys-typography-title3-font-weight);
          font-size: var(--sys-typography-title3-font-size);
          line-height: var(--sys-typography-title3-line-height);
        }

      }
      .footer {
        .jimu-btn:first-of-type {
          margin-bottom: 6px;
        }
      }
    }
  }

  .upload-loading-container {
    position: absolute;
    top: ${e?"56px":"89px"};
    bottom: 0;
    right: 0;
    left: 0;
    background-color: var(--sys-color-surface-overlay);
    z-index: 2;
    .upload-loading-content {
      height: calc(100% - 60px);
      padding-top: 80px;
      color: var(--sys-color-surface-overlay-text);
      .upload-loading-file-name {
        height: 100px;
        word-break: break-word;
        overflow: hidden;
      }
      .upload-loading {
        position: relative;
        height: 146px;
      }
      .upload-loading-btn {
        height: 32px;
        margin-top: 10px;
        text-align: center;
        button.btn-danger {
          background-color: var(--sys-color-error-main);
          border: 0;
        }
      }
    }
  }

  .supported-type-icons svg {
    color: var(--sys-color-primary-main);
  }

  .supported-types {
    font-size: 13px;
  }

  .drag-area-container {
    width: 100%;
    flex: 1
  }
  .drag-area {
    border: 1px dashed var(--sys-color-divider-secondary);
    width: 100%;
    height: 100%;
    user-select: none;
    flex-direction: column;
    justify-content: center;
  }
  .upload-btn {
    border: 1px solid var(--sys-color-divider-secondary);
    color: var(--sys-color-surface-overlay-text);
    background-color: var(--sys-color-primary-text);
    border-radius: 2px;
    line-height: 28px;
    padding-left: 16px;
    padding-right: 16px;
    height: 30px;
    user-select: none;
    max-width: 100%;
  }
  .upload-btn-container {
    line-height: 0;
    width: max-content;
    margin: 0 auto;
  }
  .upload-btn-container:hover {
    .upload-btn {
      background-color: var(--sys-color-action-hover) !important;
    }
  }
  .drag-area-container, .upload-btn-container {
    position: relative;
    display: inline-block;
    z-index: 1;
  }
  .upload-btn-file-input, .drag-area-file-input {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0;
  }
  .upload-btn-file-input {
    cursor: pointer;
  }

  .errors-container {
    position: absolute;
    top: ${e?"56px":"89px"};
    left: 0;
    right: 0;
    z-index: 2;
    max-height: 100%;
    overflow-y: auto;
    .jimu-alert-panel-title {
      font-size: 13px;
      font-weight: 400;
    }
    .jimu-alert-panel-left-part {
      flex: 1;
    }
    .jimu-alert-message {
      flex: 1;
      color: var(--sys-color-surface-overlay-text);
    }
    .jimu-alert-action {
      color: var(--sys-color-action-text);
    }
    .collapse-label {
      font-size: 13px;
      .title {
        color: var(--sys-color-surface-overlay-text) !important;
      }
    }
    .collapse-panel-container {
      margin: 0 -30px 0 -28px;
      border-top: 1px solid var(--sys-color-divider-tertiary);
      .jimu-collapsable-action .jimu-btn {
        color: var(--sys-color-action-text);
      }
    }
  }

`;var pe=l(30655),me=l.n(pe),ve=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const fe=a=>{const o=window.SVG,{className:r}=a,i=ve(a,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:n,src:me()},i)):(0,e.jsx)("svg",Object.assign({className:n},i))};var he=l(94064),ge=l.n(he),ye=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const xe=a=>{const o=window.SVG,{className:r}=a,i=ye(a,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:n,src:ge()},i)):(0,e.jsx)("svg",Object.assign({className:n},i))};var be=l(62838),Se=l.n(be),we=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const je=a=>{const o=window.SVG,{className:r}=a,i=we(a,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:n,src:Se()},i)):(0,e.jsx)("svg",Object.assign({className:n},i))},{useState:Ie,useEffect:Ne}=t.React,{useSelector:Oe}=t.ReactRedux,Me=o=>{const{multiDataOptions:r,widgetId:i,doneButtonRef:n,config:s,onFinish:l,onRemove:c,setErrorMsg:d}=o,m=t.hooks.useTranslation(a.defaultMessages),[v,h]=Ie(!1),[g,x]=Ie(!1),b=y(r);Ne(()=>{!function(e,a,o=!0){const r=e.map(e=>u(e)).filter(e=>!!e);o&&r.length>0&&p(a,t.DataSourcesChangeType.Remove,r),Promise.resolve().then(()=>{e.forEach(e=>{t.MutableStoreManager.getInstance().updateStateValue("setFilter",e,null),t.DataSourceManager.getInstance().destroyDataSource(e)})})}(((null==b?void 0:b.filter(e=>!r.some(t=>t.dataSourceJson.id===e.dataSourceJson.id)))||[]).map(e=>e.dataSourceJson.id),i,!1),x(!0);f(r.filter(e=>!(null==b?void 0:b.some(t=>e.dataSourceJson.id===t.dataSourceJson.id))),i,s,!1).catch(e=>{d(m("dataSourceCreateError"))}).finally(()=>{x(!1)})},[i,r,b,d,m,s]);const S=()=>{l(r)},w=m("numSelected",{number:r.length}),j=m(v?"collapse":"expand");return(0,e.jsx)("div",{className:"data-collapse",css:Te,children:r.length>0&&(0,e.jsxs)("div",{className:"data-container p-4",children:[(0,e.jsxs)("div",{className:"d-flex justify-content-between align-items-center",children:[(0,e.jsxs)("div",{className:"d-flex align-items-center n-selected",role:"group","aria-label":w,children:[(0,e.jsx)("span",{className:"text-truncate",title:w,children:w}),(0,e.jsx)(a.Button,{className:"jimu-outline-inside",type:"tertiary",size:"sm",icon:!0,onClick:()=>{h(!v)},title:j,"aria-label":j,"aria-expanded":v,children:v?(0,e.jsx)(fe,{size:"s",color:"var(--sys-color-surface-overlay-text)"}):(0,e.jsx)(xe,{size:"s",color:"var(--sys-color-surface-overlay-text)"})})]}),(0,e.jsx)("div",{className:"small-done-btn",children:!v&&(0,e.jsx)(a.Button,{onClick:S,disabled:g,type:"primary",className:"text-truncate w-100 px-2",title:m("done"),ref:n,children:m("done")})})]}),v&&(0,e.jsx)("div",{className:"data-items mt-4",role:"list",children:r.map((a,o)=>(0,e.jsx)(De,{widgetId:i,isLoading:g,onRemove:c,dsJson:(0,t.Immutable)(a.dataSourceJson)},o))}),v&&(0,e.jsx)("div",{className:"big-done-btn w-100",children:(0,e.jsx)(a.Button,{onClick:S,disabled:g,type:"primary",className:"text-truncate w-100",title:m("done"),"aria-label":m("done"),ref:n,children:m("done")})})]})})};function De({widgetId:o,dsJson:r,isLoading:i,onRemove:n}){const s=t.hooks.useTranslation(a.defaultMessages),l=t.i18n.getIntl(),c=u(r.id),d=Oe(e=>{var t;return null===(t=e.dataSourcesInfo)||void 0===t?void 0:t[r.id]}),p=d?d.instanceStatus===t.DataSourceStatus.CreateError:!c&&!i,m=d?d.instanceStatus===t.DataSourceStatus.NotCreated:!c&&i,v=`add-data-${o}-collapse-panel-list-item-${r.id}`;return(0,e.jsxs)("div",{className:"d-flex align-items-center justify-content-between w-100 data-item",role:"listitem",children:[(0,e.jsxs)("div",{className:"d-flex align-items-center flex-grow-1 text-truncate",title:t.dataSourceUtils.getDsTypeString(null==r?void 0:r.type,l),children:[p&&(0,e.jsx)("div",{className:"d-flex justify-content-center align-items-center flex-shrink-0 data-error",children:(0,e.jsx)(a.Alert,{className:"flex-shrink-0",css:t.css`padding-left: 0 !important; padding-right: 0 !important;`,buttonType:"tertiary",form:"tooltip",size:"small",type:"error",text:s("dataSourceCreateError")})}),m&&(0,e.jsx)("div",{className:"d-flex justify-content-center align-items-center flex-shrink-0 data-loading",children:(0,e.jsx)(a.Loading,{type:a.LoadingType.Donut,width:16,height:16})}),!p&&!m&&(0,e.jsx)("div",{className:"d-flex justify-content-center align-items-center flex-shrink-0 data-thumbnail",children:(0,e.jsx)(a.Icon,{icon:t.dataSourceUtils.getDsIcon(r),color:"var(--sys-color-primary-text)",size:"12"})}),(0,e.jsx)("div",{className:"flex-grow-1 text-truncate pl-2 data-label",title:r.label||r.sourceLabel,id:v,children:r.label||r.sourceLabel})]}),(0,e.jsx)("div",{className:"d-flex align-items-center flex-shrink-0",children:(0,e.jsx)(a.Button,{className:"jimu-outline-inside",type:"tertiary",size:"sm",icon:!0,onClick:()=>{n(r.id)},title:s("remove"),"aria-label":s("remove"),"aria-describedby":v,children:(0,e.jsx)(je,{size:14,color:"var(--sys-color-surface-overlay-text)"})})})]})}const Te=t.css`
  .data-container {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
    box-shadow: 0px -1px 4px rgba(0, 0, 0, 0.16) !important;
    border: 0 !important;
    background: var(--sys-color-surface-overlay);
    color: var(--sys-color-surface-overlay-text);
    z-index: 10;
    .n-selected {
      font-size: 14px;
      max-width: 130px;
    }
    .data-items {
      max-height: 500px;
      overflow-y: auto;
      overflow-x: hidden;
      .data-thumbnail {
        width:  26px;
        height:  26px;
        background-color: var(--sys-color-info-main);
      }
      .data-loading, .data-error {
        position: relative;
        width: 24px;
        height: 24px;
        border: 1px solid var(--sys-color-info-main);
      }
      .data-label {
        font-size: 13px;
      }
      .data-item {
        height: 26px;
        margin-bottom: 12px;
      }
    }
    .small-done-btn {
      max-width: 90px;
    }
  }
`,{useState:Ce,useMemo:Fe,useRef:Ee,useCallback:ze,useEffect:Le}=t.React,Pe=["search","url","file"],Ue={width:240,height:600},ke=o=>{const{portalUrl:r,widgetId:i,buttonSize:n,hiddenTabs:l,popperReference:c,nextOrder:d,config:u,onFinish:p,itemCategoriesInfo:m,hidePopper:v,buttonDescribedby:f,displayedItemTypeCategories:h}=o,[g,y]=Ce(!1),[x,b]=Ce(null),[S,w]=Ce([]),[j,N]=Ce([]),[O,M]=Ce([]),D=Fe(()=>S.concat(j).concat(O).sort((e,t)=>e.order-t.order),[S,j,O]),T=Fe(()=>D.length>0?Math.max(...D.map(e=>e.order))+1:d,[D,d]),C=Fe(()=>Pe.filter(e=>!(null==l?void 0:l.some(t=>e===t))),[l]),F=t.hooks.useTranslation(a.defaultMessages,t.defaultMessages,s),E=Ee(null),z=t.hooks.useCheckSmallBrowserSizeMode(),L=Ee(null);Le(()=>{"sm"===n&&(0,t.focusElementInKeyboardMode)(L.current)},[]),Le(()=>{x&&!E.current&&(E.current=setTimeout(()=>{b(null),E.current=null},5e3))},[x]);const P=e=>{S.some(t=>t.dataSourceJson.id===e)&&w(S.filter(t=>t.dataSourceJson.id!==e)),j.some(t=>t.dataSourceJson.id===e)&&N(j.filter(t=>t.dataSourceJson.id!==e)),O.some(t=>t.dataSourceJson.id===e)&&M(O.filter(t=>t.dataSourceJson.id!==e))},U=e=>{p(e),B()},[k,A]=Ce(),R=Ee(null),J=Ee(null),B=ze(()=>{const e=!g;y(e),e||(w([]),N([]),M([]),L.current&&(0,t.focusElementInKeyboardMode)(L.current)),e&&setTimeout(()=>{var e;const t=document.body.getBoundingClientRect(),a=null===(e=R.current)||void 0===e?void 0:e.getBoundingClientRect();t&&a&&A({left:-a.left,top:0,right:t.width-a.right+Ue.width,bottom:t.height-a.bottom+Ue.height})},500)},[g]);Le(()=>{!z&&v&&g&&B()},[v]);const V=t.ReactRedux.useSelector(e=>e.appRuntimeInfo.currentPageId);t.hooks.useUpdateEffect(()=>{g&&B()},[V]);const G=Ee(null),H=Ee(null),$=Ee(null),W=()=>(0,e.jsx)(Re,{mobile:z,errorMsg:x,translate:F,tabs:C,togglePopper:B,onFinish:U,onRemove:P,portalUrl:r,widgetId:i,nextOrder:T,multiDataOptions:D,multiDataOptionsFromSearch:S,multiDataOptionsFromUrl:j,multiDataOptionsFromFile:O,setErrorMsg:b,setMultiDataOptionsFromSearch:w,setMultiDataOptionsFromUrl:N,setMultiDataOptionsFromFile:M,itemCategoriesInfo:m,containerRef:G,closeButtonRef:H,doneButtonInCollapseRef:$,displayedItemTypeCategories:h,config:u});return(0,e.jsxs)("div",{className:"add-data-popper",css:Je,children:["lg"===n&&(0,e.jsx)(a.Button,{type:"primary",className:"flex-grow-1 text-center",onClick:B,"aria-label":F("clickToAddData"),ref:L,title:F("clickToAddData"),"aria-haspopup":"dialog","aria-describedby":f,children:(0,e.jsxs)("div",{className:"w-100 px-2 d-flex align-items-center justify-content-center",children:[(0,e.jsx)(I,{size:"m",className:"mr-2"}),(0,e.jsx)("div",{className:"text-truncate",children:F("clickToAddData")})]})}),"sm"===n&&(0,e.jsx)(a.Button,{type:"primary",className:"d-flex justify-content-center align-items-center small-add-btn",onClick:B,"aria-label":F("clickToAddData"),ref:L,title:F("clickToAddData"),"aria-haspopup":"dialog",children:(0,e.jsx)(I,{size:"m",className:"m-0"})}),z?(0,e.jsx)(a.MobilePanel,{open:g,onClose:B,title:F("addData"),children:W()}):(0,e.jsx)(a.Popper,{open:g,toggle:null,reference:c,placement:"right-start",ref:R,css:Be,"aria-label":F("addData"),forceLatestFocusElements:!0,onKeyDown:e=>{var a,o;if("Escape"===e.key){if(!(null===(a=G.current)||void 0===a?void 0:a.contains(e.target)))return;if(e.target===H.current)B();else{const a=!!(null===(o=e.target)||void 0===o?void 0:o.closest(".data-item-search")),r=D.length>0,i=a&&r&&$.current&&!$.current.disabled?$.current:H.current;(0,t.focusElementInKeyboardMode)(i)}}},children:(0,e.jsx)(a.Resizable,{className:a.FOCUSABLE_CONTAINER_CLASS,ref:J,defaultSize:Ue,minSize:Ue,handles:["bottom-left","bottom-right"],bounds:k,children:W()})})]})},Ae=({tab:t,portalUrl:a,widgetId:o,nextOrder:r,multiDataOptionsFromSearch:i,multiDataOptionsFromUrl:n,multiDataOptionsFromFile:s,setMultiDataOptionsFromSearch:l,setMultiDataOptionsFromUrl:c,setMultiDataOptionsFromFile:d,setErrorMsg:u,itemCategoriesInfo:p,className:m,displayedItemTypeCategories:v,onlyOneTab:f})=>"search"===t?(0,e.jsx)(L,{className:m,portalUrl:a,widgetId:o,onChange:l,nextOrder:r,multiDataOptions:i,itemCategoriesInfo:p,displayedItemTypeCategories:v}):"url"===t?(0,e.jsx)(W,{className:m,widgetId:o,onChange:c,nextOrder:r,multiDataOptions:n,setErrorMsg:u}):"file"===t?(0,e.jsx)(ce,{className:m,portalUrl:a,widgetId:o,nextOrder:r,onChange:d,multiDataOptions:s,setErrorMsg:u,onlyOneTab:f}):void 0,Re=({mobile:o,errorMsg:r,translate:i,tabs:n,togglePopper:s,onFinish:l,onRemove:c,portalUrl:d,widgetId:u,nextOrder:p,multiDataOptions:m,multiDataOptionsFromSearch:v,multiDataOptionsFromUrl:f,multiDataOptionsFromFile:h,setMultiDataOptionsFromSearch:g,setMultiDataOptionsFromUrl:y,setMultiDataOptionsFromFile:x,setErrorMsg:b,itemCategoriesInfo:S,containerRef:w,closeButtonRef:j,doneButtonInCollapseRef:I,displayedItemTypeCategories:N,config:O})=>(0,e.jsxs)("div",{ref:w,css:t.css`
    width: 100%;
    height: 100%;
    .panel-header {
      .title {
        color: var(--sys-color-surface-overlay-text);
      }
      .jimu-btn {
        color: var(--sys-color-action-text);
      }
    }
    .add-data-popper-content {
      height: ${m.length?o?"calc(100% - 64px)":"calc(100% - 120px)":o?"100%":"calc(100% - 56px)"};
    }
    .tab-content {
      overflow: hidden;
    }
    .jimu-nav {
      border-bottom: 1px solid var(--sys-color-divider-secondary);
      .jimu-nav-link {
        &.active, &:hover:not(.active) {
          color: var(--sys-color-primary-main);
        }
        &.active {
          border-color: var(--sys-color-primary-main);
        }
      }
    }
    .multiple-lines-truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      word-break: break-word;
      word-wrap: break-word;
    }
    .item-selector-search {
      .text-input-prefix {
        svg {
          margin-left: 0 !important;
          color: var(--sys-color-action-input-field-placeholder) !important;
        }
      }
    }
  `,children:[!o&&(0,e.jsx)(a.PanelHeader,{title:i("addData"),showClose:!0,onClose:s,level:1,className:"p-4",closeButtonRef:j}),(0,e.jsxs)("div",{className:"add-data-popper-content",children:[n.length>1&&(0,e.jsx)(a.Tabs,{type:"underline",className:"w-100 h-100",fill:!0,defaultValue:n[0],children:n.map((t,o)=>(0,e.jsx)(a.Tab,{id:t,title:i(t),children:(0,e.jsx)(Ae,{tab:t,portalUrl:d,widgetId:u,nextOrder:p,setErrorMsg:b,multiDataOptionsFromSearch:v,multiDataOptionsFromUrl:f,multiDataOptionsFromFile:h,setMultiDataOptionsFromSearch:g,setMultiDataOptionsFromUrl:y,setMultiDataOptionsFromFile:x,itemCategoriesInfo:S,displayedItemTypeCategories:N,onlyOneTab:!1})},o))}),1===n.length&&(0,e.jsx)("div",{className:"w-100 h-100",children:(0,e.jsx)(Ae,{tab:n[0],portalUrl:d,widgetId:u,nextOrder:p,setErrorMsg:b,multiDataOptionsFromSearch:v,multiDataOptionsFromUrl:f,multiDataOptionsFromFile:h,setMultiDataOptionsFromSearch:g,setMultiDataOptionsFromUrl:y,setMultiDataOptionsFromFile:x,itemCategoriesInfo:S,displayedItemTypeCategories:N,onlyOneTab:!0})}),r&&(0,e.jsx)(a.Alert,{className:"w-100",css:t.css`position: absolute; top: ${1===n.length?"56px":"89px"}; left: 0; right: 0; z-index: 1;`,closable:!0,form:"basic",onClose:()=>{b(null)},open:!0,text:r,type:"warning",withIcon:!0})]}),(0,e.jsx)(Me,{multiDataOptions:m,widgetId:u,doneButtonRef:I,config:O,onFinish:l,onRemove:c,setErrorMsg:b})]}),Je=t.css`
  .small-add-btn {
    border-radius: 16px;
    width: 32px;
    height: 32px;
    padding: 0;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  }
`,Be=t.css`
  width: ${Ue.width}px;
  height: ${Ue.height}px;
  border: none;
  box-shadow: none;
  background: none;
  overflow: visible;
  .resizable {
    background: var(--sys-color-surface-overlay);
    border-width: 1px;
    border-style: solid;
    border-color: var(--sys-color-divider-secondary);
    box-shadow: var(--sys-shadow-2);
  }
`;var Ve=l(9044),Ge=l.n(Ve),He=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const $e=a=>{const o=window.SVG,{className:r}=a,i=He(a,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:n,src:Ge()},i)):(0,e.jsx)("svg",Object.assign({className:n},i))};var We=l(12046),_e=l.n(We),Ke=function(e,t){var a={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(a[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(a[o[r]]=e[o[r]])}return a};const qe=a=>{const o=window.SVG,{className:r}=a,i=Ke(a,["className"]),n=(0,t.classNames)("jimu-icon jimu-icon-component",r);return o?(0,e.jsx)(o,Object.assign({className:n,src:_e()},i)):(0,e.jsx)("svg",Object.assign({className:n},i))},{useLayoutEffect:Ze,useState:Xe,useRef:Qe,useMemo:Ye}=t.React,{useSelector:et}=t.ReactRedux,tt=o=>{const{multiDataOptions:r,enableDataAction:i,isLoading:n,onRemoveData:s,onChangeData:l,widgetId:c,disableRenaming:d}=o,p=t.hooks.useTranslation(a.defaultMessages,t.defaultMessages),[m,v]=Xe(null),f=Qe(null),h=et(e=>e.dataSourcesInfo),g=y(f),x=t.i18n.getIntl(),b=(0,X.useTheme)(),S=ot(b);Ze(()=>{m&&f.current&&(null==g?void 0:g.current)!==f.current&&((0,t.focusElementInKeyboardMode)(f.current),f.current.select())},[f,g,m]);const w=e=>{v((null==m?void 0:m.dataSourceJson.id)===(null==e?void 0:e.dataSourceJson.id)?null:e)};return(0,e.jsx)("ul",{className:"data-list",css:S,children:r.map((o,r)=>{var v;const g=u(o.dataSourceJson.id),y=null==h?void 0:h[o.dataSourceJson.id],b=y?y.instanceStatus===t.DataSourceStatus.CreateError:!g&&!n,S=y?y.instanceStatus===t.DataSourceStatus.NotCreated:!g&&n,j=(null==m?void 0:m.dataSourceJson.id)===o.dataSourceJson.id,I=o.dataSourceJson.label||o.dataSourceJson.sourceLabel,N=t.dataSourceUtils.getDsTypeString(null===(v=o.dataSourceJson)||void 0===v?void 0:v.type,x),O=i&&g;return(0,e.jsxs)("li",{className:(0,t.classNames)("d-flex justify-content-between align-items-center data-item",{"pt-3":0!==r}),"aria-label":`${N} ${I}`,role:"group",children:[(0,e.jsxs)("div",{className:"flex-grow-1 text-truncate d-flex justify-content-start align-items-center",children:[S&&(0,e.jsx)("div",{className:"flex-shrink-0 d-flex justify-content-center align-items-center mr-1 data-item-loading",children:(0,e.jsx)(a.Loading,{type:a.LoadingType.Donut,width:16,height:16})}),(0,e.jsxs)("div",{className:"flex-grow-1 text-truncate d-flex align-items-center",title:N,children:[!S&&(0,e.jsx)("div",{className:"flex-shrink-0 d-flex justify-content-center align-items-center data-thumbnail",children:(0,e.jsx)(a.Icon,{icon:t.dataSourceUtils.getDsIcon((0,t.Immutable)(o.dataSourceJson)),color:"var(--sys-color-primary-text)",size:"12"})}),b&&(0,e.jsx)(a.Alert,{className:"flex-shrink-0 ml-2 mr-1",css:t.css`padding-left: 0 !important; padding-right: 0 !important;`,variant:"text",form:"tooltip",size:"small",type:"error",text:p("dataSourceCreateError")}),(0,e.jsx)("div",{className:(0,t.classNames)("flex-grow-1 text-truncate data-label",{"pl-2":!b}),title:m?"":I,children:j?(0,e.jsx)(a.TextInput,{className:"w-100",size:"sm",defaultValue:I,onAcceptValue:e=>{((e,t)=>{w(e),l(Object.assign(Object.assign({},e),{dataSourceJson:Object.assign(Object.assign({},e.dataSourceJson),{label:t})}))})(o,e)},ref:f}):I})]})]}),(0,e.jsxs)("div",{className:"flex-shrink-0 d-flex justify-content-end align-items-center data-item-operations",children:[!d&&!S&&!b&&(0,e.jsx)(a.Button,{className:"jimu-outline-inside",type:"tertiary",size:"sm",icon:!0,title:p("rename"),"aria-label":p("rename"),onClick:()=>{w(o)},onKeyDown:e=>{"Enter"===e.key&&e.preventDefault()},onKeyUp:e=>{var t;t=o,"Enter"===e.key&&w(t)},children:(0,e.jsx)(qe,{size:"m"})}),O&&(0,e.jsx)(a.DataActionList,{widgetId:c,dataSets:[{dataSource:g,records:[],name:g.getDataSourceJson().label||g.getDataSourceJson().sourceLabel}],listStyle:a.DataActionListStyle.Dropdown,buttonSize:"sm",buttonType:"tertiary",hideGroupTitle:!0,buttonClassName:"jimu-outline-inside"}),(0,e.jsx)(a.Button,{className:"jimu-outline-inside",type:"tertiary",size:"sm",icon:!0,onClick:()=>{s(o.dataSourceJson.id)},title:p("remove"),"aria-label":p("remove"),children:(0,e.jsx)($e,{size:"m"})})]})]},o.dataSourceJson.id)})})},at=t.css`
  max-height: calc(100% - 35px);
  overflow: auto;

  margin-bottom: 38px;
  padding-left: 0;

  .data-item {
    width: 100%;
    overflow: hidden;
  }
  .data-item-loading {
    position: relative;
    width: 24px;
    height: 24px;
    border: 1px solid var(--sys-color-info-main);
  }
  .data-thumbnail {
    width:  26px;
    height:  26px;
    background-color: var(--sys-color-info-main);
  }
  .data-label {
    font-size: 13px;
    color: var(--sys-color-surface-paper-text);
  }
  .jimu-button-color-error {
    color: var(--sys-color-error-main);
  }
  .data-item-operations {
    .jimu-btn svg {
      color: var(--sys-color-surface-paper-text);
    }
  }
  .jimu-input .input-wrapper {
    color: var(--sys-color-surface-paper-text);
  }
`,ot=e=>Ye(()=>t.css`
    ${at}
    .data-item-operations .data-action-dropdown .data-action-button{
      &:focus,
      &:focus-visible {
        outline-offset: -2px;
      }
      border: 0;
    }
  `,[]);class rt extends t.BaseVersionManager{constructor(){super(...arguments),this.versions=[{version:"1.12.0",description:"Allow to configure curated filter",upgrader:e=>e.disableAddBySearch||e.itemCategoriesInfo?e:e.set("itemCategoriesInfo",O())}]}}const it=new rt;var nt=function(e,t,a,o){return new(a||(a=Promise))(function(r,i){function n(e){try{l(o.next(e))}catch(e){i(e)}}function s(e){try{l(o.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?r(e.value):(t=e.value,t instanceof a?t:new a(function(e){e(t)})).then(n,s)}l((o=o.apply(e,t||[])).next())})};const{useState:st,useEffect:lt,useMemo:ct,useRef:dt,useCallback:ut}=t.React,pt=!window.jimuConfig.isInBuilder,mt=o=>{const{portalUrl:r,id:i,enableDataAction:l=!0,config:c,mutableStateProps:d}=o,v=(e=>t.React.useMemo(()=>e.disableAddBySearch||e.itemCategoriesInfo?e.itemCategoriesInfo:(0,t.Immutable)(O()),[e.disableAddBySearch,e.itemCategoriesInfo]))(c),g=ct(()=>(null==d?void 0:d.multiDataOptions)||[],[null==d?void 0:d.multiDataOptions]),y=ut(e=>{t.MutableStoreManager.getInstance().updateStateValue(i,"multiDataOptions",e)},[i]),x=t.hooks.useTranslation(a.defaultMessages,s),[b,S]=st(!1),w=ct(()=>{const e=[];return c.disableAddBySearch&&e.push("search"),c.disableAddByUrl&&e.push("url"),c.disableAddByFile&&e.push("file"),e},[c.disableAddBySearch,c.disableAddByUrl,c.disableAddByFile]),j=ct(()=>g.length>0?Math.max(...g.map(e=>e.order))+1:0,[g]),I=t.React.useRef(null),N=dt(null);lt(()=>(N.current=new t.indexedDBUtils.IndexedDBCache(i,"add-data","added-data"),pt&&N.current.init().then(()=>nt(void 0,void 0,void 0,function*(){const e=yield N.current.getAll();e.length>0&&(S(!0),f(e,i,c).catch(e=>{console.error("Failed to create data source",e)}).finally(()=>{S(!1)}),y(e.sort((e,t)=>e.order-t.order)))})).catch(e=>{console.error("Failed to read cache.",e)}),()=>{N.current.close()}),[i,y]);const M=e=>{N.current.initialized()&&N.current.putAll(e.map(e=>({key:e.dataSourceJson.id,value:e}))),S(!0),f(e,i,c).catch(e=>{console.error("Failed to create data source",e)}).finally(()=>{S(!1)}),y(g.concat(e))};t.hooks.useUpdateEffect(()=>{((e,t)=>{h(m(e,t))})(g,c)},[c.disableExport,c.notAllowedExportFormat]);const D=t.ReactRedux.useSelector(e=>{var t;const a=null==e?void 0:e.widgetsRuntimeInfo;return null===(t=null==a?void 0:a[i])||void 0===t?void 0:t.state}),T=ct(()=>D===t.WidgetState.Closed,[D]),C=`${i}-placeholder`;return(0,e.jsxs)(a.Paper,{className:"widget-add-data jimu-widget d-flex align-items-center justify-content-center",css:ft,ref:I,shape:"none",children:[0===g.length&&(0,e.jsxs)("div",{className:"no-data-placeholder w-100",children:[(0,e.jsx)("div",{className:"no-data-placeholder-icon",children:(0,e.jsx)(n,{size:32})}),(0,e.jsx)("div",{className:"no-data-placeholder-text",id:C,children:(0,e.jsx)("span",{children:c.placeholderText||x("defaultPlaceholderText")})}),(0,e.jsx)("div",{className:"no-data-placeholder-btn",children:(0,e.jsx)(ke,{buttonSize:"lg",portalUrl:r,widgetId:i,onFinish:M,hiddenTabs:w,popperReference:I,nextOrder:j,config:c,itemCategoriesInfo:v,hidePopper:T,buttonDescribedby:C,displayedItemTypeCategories:c.displayedItemTypeCategories})})]}),g.length>0&&(0,e.jsxs)("div",{className:"w-100 h-100 p-4",children:[(0,e.jsx)(tt,{multiDataOptions:g,enableDataAction:l,isLoading:b,widgetId:i,disableRenaming:c.disableRenaming,onRemoveData:e=>{N.current.initialized()&&N.current.deleteAll([e]),y(g.filter(t=>t.dataSourceJson.id!==e)),p(i,t.DataSourcesChangeType.Remove,[u(e)])},onChangeData:e=>{N.current.initialized()&&N.current.put(e.dataSourceJson.id,e),S(!0),h([e]).catch(e=>{console.error("Failed to update data source",e)}).finally(()=>{S(!1)}),y(g.map(t=>t.dataSourceJson.id===e.dataSourceJson.id?e:t))}}),(0,e.jsx)("div",{className:"w-100 d-flex justify-content-end add-by-search-samll",children:(0,e.jsx)(ke,{buttonSize:"sm",portalUrl:r,widgetId:i,onFinish:M,hiddenTabs:w,popperReference:I,nextOrder:j,config:c,itemCategoriesInfo:v,hidePopper:T,displayedItemTypeCategories:c.displayedItemTypeCategories})})]})]})};mt.versionManager=it;const vt=mt,ft=t.css`
  position: relative;

  .add-by-search-samll {
    position: absolute;
    bottom: 10px;
    right: 15px;
  }

  .no-data-placeholder {
    padding: 8px;
    .no-data-placeholder-text, .no-data-placeholder-icon, .no-data-placeholder-btn{
      display: table;
      margin: 0 auto;
    }
    .no-data-placeholder-text {
      color: var(--sys-color-surface-paper-hint);
      font-size: 0.8125rem;
      margin-top: 1rem;
      text-align: center;
    }
    .no-data-placeholder-icon {
      color: var(--sys-color-surface-paper-hint);
    }
    .no-data-placeholder-btn {
      margin-top: 1rem;
    }
  }
`;function ht(e){l.p=e}})(),c})())}}});