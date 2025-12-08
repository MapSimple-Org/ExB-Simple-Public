System.register(["jimu-core/emotion","jimu-core","jimu-arcgis","jimu-ui","esri/widgets/Directions","esri/layers/RouteLayer","esri/rest/support/PointBarrier","esri/rest/support/PolylineBarrier","esri/rest/support/PolygonBarrier","esri/core/reactiveUtils","jimu-core/react","jimu-theme"],function(e,t){var o={},r={},i={},a={},n={},c={},l={},s={},u={},d={},v={},p={};return{setters:[function(e){o.jsx=e.jsx,o.jsxs=e.jsxs},function(e){r.DataSourceManager=e.DataSourceManager,r.DataSourceStatus=e.DataSourceStatus,r.MutableStoreManager=e.MutableStoreManager,r.React=e.React,r.ReactRedux=e.ReactRedux,r.ServiceManager=e.ServiceManager,r.UtilityManager=e.UtilityManager,r.css=e.css,r.dataSourceUtils=e.dataSourceUtils,r.getAppStore=e.getAppStore,r.hooks=e.hooks,r.loadArcGISJSAPIModule=e.loadArcGISJSAPIModule},function(e){i.JimuMapViewComponent=e.JimuMapViewComponent},function(e){a.Alert=e.Alert,a.Paper=e.Paper,a.WidgetPlaceholder=e.WidgetPlaceholder,a.defaultMessages=e.defaultMessages},function(e){n.default=e.default},function(e){c.default=e.default},function(e){l.default=e.default},function(e){s.default=e.default},function(e){u.default=e.default},function(e){d.watch=e.watch},function(e){v.useEffect=e.useEffect},function(e){p.styled=e.styled,p.useTheme=e.useTheme}],execute:function(){e((()=>{var e={1888:e=>{"use strict";e.exports=p},10037:e=>{"use strict";e.exports=s},14321:e=>{"use strict";e.exports=a},17183:e=>{"use strict";e.exports=u},41556:e=>{"use strict";e.exports=c},62243:e=>{"use strict";e.exports=d},62686:e=>{"use strict";e.exports=i},67386:e=>{"use strict";e.exports=o},68972:e=>{"use strict";e.exports=v},70326:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#000" fill-rule="evenodd" d="M1.414 10 10 1.414 18.586 10 10 18.586zm-.707.707a1 1 0 0 1 0-1.414L9.293.707a1 1 0 0 1 1.414 0l8.586 8.586a1 1 0 0 1 0 1.414l-8.586 8.586a1 1 0 0 1-1.414 0zm14.19-2.041-3.314 3.352a9 9 0 0 0-.398-1.126l2.918-2.832zM7.71 8H10V7H6v4h1V8.706l1.33 1.325C9.483 11.3 10 11.987 10 14.5v.5h1v-.5c.16-2.227-.537-3.43-1.948-5.16z" clip-rule="evenodd"></path></svg>'},77375:e=>{"use strict";e.exports=l},79244:e=>{"use strict";e.exports=r},92491:e=>{"use strict";e.exports=n}},t={};function y(o){var r=t[o];if(void 0!==r)return r.exports;var i=t[o]={exports:{}};return e[o](i,i.exports,y),i.exports}y.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return y.d(t,{a:t}),t},y.d=(e,t)=>{for(var o in t)y.o(t,o)&&!y.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},y.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),y.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},y.p="";var f={};return y.p=window.jimuConfig.baseUrl,(()=>{"use strict";y.r(f),y.d(f,{__set_webpack_public_path__:()=>N,default:()=>F});var e,t=y(67386),o=y(79244),r=y(62686),i=y(14321),a=y(92491),n=y(41556),c=y(77375),l=y(10037),s=y(17183),u=y(62243);!function(e){e.Imperial="imperial",e.Metric="metric"}(e||(e={}));const d={includeDefaultSources:!1,locationEnabled:!1,maxSuggestions:6};var v=function(e,t,o,r){return new(o||(o=Promise))(function(i,a){function n(e){try{l(r.next(e))}catch(e){a(e)}}function c(e){try{l(r.throw(e))}catch(e){a(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof o?t:new o(function(e){e(t)})).then(n,c)}l((r=r.apply(e,t||[])).next())})};function p(e){return`${e}_output_stop`}function g(e){return`${e}_output_direction_point`}function m(e){return`${e}_output_direction_line`}function h(e){return`${e}_output_route`}function S(){var t;return"english"===(null===(t=(0,o.getAppStore)().getState().user)||void 0===t?void 0:t.units)?e.Imperial:e.Metric}function x(e){var t;return e?null===(t=o.UtilityManager.getInstance().getUtilityJson(e.utilityId))||void 0===t?void 0:t.url:null}function b(e,t){return v(this,void 0,void 0,function*(){const r=yield(0,o.loadArcGISJSAPIModule)("esri/rest/locator"),i=t.dataConfig.map(e=>x(e.useUtility)).asMutable().map(t=>r.locationToAddress(t,{location:e}));let a=null;for(const e of i)try{const{address:t}=yield e;if(t){a=t;break}}catch(e){console.error(e)}if(!a){const{address:t}=yield r.locationToAddress("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",{location:e});a=t}return a})}const w={_widgetLabel:"Directions",_action_DirectionsFrom_label:"Directions from",_action_DirectionsTo_label:"Directions to",_action_PlanRoute_label:"Plan route",outOfCredit:"Cannot load route service. This may be due to the service not being accessible.",namedInvalidUtilMsg:"{label} not available.",namedNeedLoginUtilMsg:"Sorry, you don't have permission to access {label}."};var M=y(70326),_=y.n(M),I=y(68972),D=y(1888),P=function(e,t,o,r){return new(o||(o=Promise))(function(i,a){function n(e){try{l(r.next(e))}catch(e){a(e)}}function c(e){try{l(r.throw(e))}catch(e){a(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof o?t:new o(function(e){e(t)})).then(n,c)}l((r=r.apply(e,t||[])).next())})};const U=o.UtilityManager.getInstance(),C=D.styled.div`
  display: flex;
  .jimu-alert-panel {
    flex: 1;
    margin: 2px;
  }
`;function R(e){const{useUtilities:r}=e,[a,n]=o.React.useState(null),[c,l]=o.React.useState(null),s=o.hooks.useTranslation(w,i.defaultMessages),[u,d]=o.React.useState(!0),[v,p]=o.React.useState(!0),y=o.ReactRedux.useSelector(e=>e.resourceSessions);return(0,I.useEffect)(()=>{!function(){P(this,void 0,void 0,function*(){const e=[],t=[];if(r)for(let o=0;o<r.length;o++){const i=U.getLabelOfUseUtility(r[o]),a=U.getUtilityJson(r[o].utilityId),{success:n,isSignInError:c}=yield U.checkUtilityStatus(a);n||(c?t.push(i):e.push(i))}const o=t.length>0?s("namedNeedLoginUtilMsg",{label:t.join(", ")}):null;o!==c&&l(o);const i=e.length>0?s("namedInvalidUtilMsg",{label:e.join(", ")}):null;i!==a&&n(i)})}()},[a,c,s,r,y,null==e?void 0:e.useUtilities]),(0,t.jsxs)("div",{className:"util-alert-wrapper d-flex flex-column position-absolute w-100",style:{bottom:0},children:[a&&(0,t.jsx)(C,{children:(0,t.jsx)(i.Alert,{closable:!0,form:"basic",onClose:()=>{p(!1)},open:v,text:a,withIcon:!0})}),c&&(0,t.jsx)(C,{children:(0,t.jsx)(i.Alert,{closable:!0,form:"basic",onClose:()=>{d(!1)},open:u,text:c,withIcon:!0})})]})}var j=function(e,t,o,r){return new(o||(o=Promise))(function(i,a){function n(e){try{l(r.next(e))}catch(e){a(e)}}function c(e){try{l(r.throw(e))}catch(e){a(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof o?t:new o(function(e){e(t)})).then(n,c)}l((r=r.apply(e,t||[])).next())})};const{useEffect:k,useState:A,useRef:L,useCallback:E,useMemo:T}=o.React,F=e=>{var y,f;const{config:M,id:I}=e,{searchConfig:P,routeConfig:U}=M,C="dark"===(null===(y=e.theme)||void 0===y?void 0:y.sys.color.mode),F=null===(f=e.useMapWidgetIds)||void 0===f?void 0:f[0],[O,N]=A(null),H=L(null),[z,W]=A(Math.random()),q=L(null),K=L(null),Q=L(null),X=o.hooks.useTranslation(w,i.defaultMessages),Y=T(()=>X("findAddressOrPlace"),[X]),[Z,ee]=A(!1),te=(0,D.useTheme)(),oe=o.ReactRedux.useSelector(e=>e.resourceSessions),re=E(e=>{N(e)},[]),ie=E(()=>j(void 0,void 0,void 0,function*(){if(Z&&K.current&&e.mutableStateProps){const{directionsFromPoint:t,directionsToPoint:r,routeStops:i}=e.mutableStateProps;if(t){const r=yield b(t,P);return K.current.layer.stops.at(0).geometry=t,K.current.layer.stops.at(0).name=r,void o.MutableStoreManager.getInstance().updateStateValue(e.widgetId,"directionsFromPoint",null)}if(r){const t=yield b(r,P),i=K.current.layer.stops.length;return K.current.layer.stops.at(i-1).geometry=r,K.current.layer.stops.at(i-1).name=t,void o.MutableStoreManager.getInstance().updateStateValue(e.widgetId,"directionsToPoint",null)}if(i){const t=i,r=yield Promise.all(t.map(e=>j(void 0,void 0,void 0,function*(){const t=yield b(e,P);return{geometry:e,name:t}})));return K.current.layer.stops.removeAll(),K.current.layer.stops.addMany(r),void o.MutableStoreManager.getInstance().updateStateValue(e.widgetId,"routeStops",null)}yield K.current.viewModel.load(),K.current.viewModel.layer.stops.filter(e=>null!==e.geometry).length>=2&&(yield K.current.viewModel.getDirections())}}),[Z,e.mutableStateProps,e.widgetId,P]);return k(()=>{!function(){var e,t;if(F&&(null==U?void 0:U.useUtility)&&(null===(e=null==P?void 0:P.dataConfig)||void 0===e?void 0:e.length)>0){const e=null===(t=(0,o.getAppStore)().getState().appConfig)||void 0===t?void 0:t.utilities,r=P.dataConfig.some(t=>!!t.useDataSource||e[t.useUtility.utilityId]),i=!!(e&&e[U.useUtility.utilityId]&&r);ee(!(!U||!i))}else ee(!1)}()},[F,null==U?void 0:U.useUtility,null==P?void 0:P.dataConfig,U,null==e?void 0:e.useUtilities]),k(()=>{ie()}),k(()=>{!function(){j(this,void 0,void 0,function*(){var t,r;if(H.current===oe||!(null==e?void 0:e.useUtilities))return;const i=H.current;H.current=oe;const a=null===(t=null==e?void 0:e.useUtilities)||void 0===t?void 0:t.map(e=>{var t;return null===(t=o.UtilityManager.getInstance().getUtilityJson(e.utilityId))||void 0===t?void 0:t.url}),n=yield Promise.all(a.map(e=>o.ServiceManager.getInstance().fetchArcGISServerInfo(e))),c=new Set;for(let e=0;e<a.length;e++)c.add((null===(r=n[e])||void 0===r?void 0:r.owningSystemUrl)||a[e]);const l=[...c],s=Object.keys(oe||{});for(const e of l){if(oe[e]&&oe[e]!==(null==i?void 0:i[e]))return void W(Math.random());for(const t of s)if(e.includes(t)&&oe[t]!==(null==i?void 0:i[t]))return void W(Math.random())}})}()},[null==e?void 0:e.useUtilities,oe]),k(()=>{function t(){var e,t,o;if(null===(t=null===(e=K.current)||void 0===e?void 0:e.view)||void 0===t?void 0:t.map){const e=K.current.view.map.findLayerById(I);e&&O&&O.view.map.remove(e),K.current.destroy()}q.current&&(q.current.innerHTML="");try{const e=null===(o=document.querySelector("calcite-panel.esri-save-layer"))||void 0===o?void 0:o.parentElement;e&&"CALCITE-POPOVER"===e.tagName.toUpperCase()&&document.body.removeChild(e)}catch(e){}}return Z&&(null==O?void 0:O.view)&&q.current?function r(i){return j(this,void 0,void 0,function*(){var y,f,b,w,_,D;t();const R=x(null==U?void 0:U.useUtility),k=yield function(e,t){return v(this,void 0,void 0,function*(){var r,i,a;const n=Object.assign({},d),c=(null===(r=null==e?void 0:e.generalConfig)||void 0===r?void 0:r.hint)||t;if(c&&(n.allPlaceholder=c),"number"==typeof(null===(i=null==e?void 0:e.suggestionConfig)||void 0===i?void 0:i.maxSuggestions)&&(n.maxSuggestions=e.suggestionConfig.maxSuggestions),"boolean"==typeof(null===(a=null==e?void 0:e.suggestionConfig)||void 0===a?void 0:a.isUseCurrentLoation)&&(n.locationEnabled=e.suggestionConfig.isUseCurrentLoation),Array.isArray(null==e?void 0:e.dataConfig)){const r=null==e?void 0:e.dataConfig.asMutable({deep:!0}).map(e=>v(this,void 0,void 0,function*(){var r,i;if(e.useUtility){const o={url:x(e.useUtility),name:e.label,placeholder:e.hint||t,withinViewEnabled:null!==(r=e.searchInCurrentMapExtent)&&void 0!==r&&r};return e.enableCountryCode&&(o.countryCode=e.countryCode),Promise.resolve(o)}if(e.useDataSource){const r=yield o.DataSourceManager.getInstance().createDataSourceByUseDataSource(e.useDataSource),a=o.dataSourceUtils.getJSAPILayer(r);if(!a)return null;const n={layer:a,searchFields:e.searchFields.map(e=>e.name),outFields:e.displayFields.map(e=>e.name),suggestionTemplate:e.displayFields.map(e=>`{${e.name}}`).join(", "),searchTemplate:e.displayFields.map(e=>`{${e.name}}`).join(", "),name:e.label,placeholder:e.hint||t,withinViewEnabled:null!==(i=e.searchInCurrentMapExtent)&&void 0!==i&&i};return Promise.resolve(n)}}));yield Promise.all(r).then(e=>{n.sources=e.filter(e=>!!e)})}return Promise.resolve(n)})}(P,Y),A=yield function(){return j(this,void 0,void 0,function*(){var e;if(!O)return null;const t=null===(e=null==U?void 0:U.barrierLayers)||void 0===e?void 0:e[O.id];if(!t)return null;const o={points:[],polylines:[],polygons:[]};for(const e of t){const t=yield O.whenJimuLayerViewLoaded(e);let r=t.getLayerDataSource();const i=t.layerDataSourceId;r||(r=yield O.getMapDataSource().createDataSourceById(i));const{records:a}=yield r.query({where:"1=1",returnGeometry:!0});switch(r.getGeometryType()){case"esriGeometryPoint":{const e=a.map(e=>new c.default({geometry:e.getGeometry()}));o.points.push(...e);break}case"esriGeometryPolyline":{const e=a.map(e=>new l.default({geometry:e.getGeometry()}));o.polylines.push(...e);break}case"esriGeometryPolygon":{const e=a.map(e=>new s.default({geometry:e.getGeometry()}));o.polygons.push(...e);break}}}return o})}(),L=document.createElement("div");L.className="directions-container",C&&(L.className+=" dark-theme"),q.current&&(q.current.innerHTML="",q.current.appendChild(L));const E=`${e.label} - ${X("route")}`,T=new n.default({id:I,url:R,title:E,pointBarriers:null==A?void 0:A.points,polylineBarriers:null==A?void 0:A.polylines,polygonBarriers:null==A?void 0:A.polygons});"boolean"!=typeof M.showRuntimeLayers||M.showRuntimeLayers||(T.listMode="hide"),K.current=new a.default({id:I,layer:T,container:L,view:null==O?void 0:O.view,searchProperties:k,unit:null!==(y=null==M?void 0:M.unit)&&void 0!==y?y:S(),visibleElements:{printButton:!1}});const F=K.current.view.map.findLayerById(I);F&&(null===(b=null===(f=null==O?void 0:O.view)||void 0===f?void 0:f.map)||void 0===b||b.remove(F)),null===(_=null===(w=null==O?void 0:O.view)||void 0===w?void 0:w.map)||void 0===_||_.add(T),null===(D=null==M?void 0:M.enableRouteSaving)||void 0===D||D||(K.current.visibleElements={printButton:!1,saveAsButton:!1,saveButton:!1,layerDetails:!1}),K.current.viewModel.routeParameters.returnRoutes=!0,K.current.viewModel.routeParameters.returnDirections=!0,K.current.viewModel.routeParameters.returnStops=!0,K.current.viewModel.reset=()=>{r(!0)},ie(),G(I),Q.current=u.watch(()=>K.current.lastRoute,()=>{e.autoHeight&&(q.current.style.maxHeight="750px"),K.current.lastRoute?function(e,t){j(this,void 0,void 0,function*(){var r,i,a;try{const n=yield o.DataSourceManager.getInstance().createDataSource(p(e)),c=yield o.DataSourceManager.getInstance().createDataSource(h(e)),l=yield o.DataSourceManager.getInstance().createDataSource(g(e)),s=yield o.DataSourceManager.getInstance().createDataSource(m(e));yield $(n,"point",J(null===(r=t.stops)||void 0===r?void 0:r.toArray())),yield $(c,"polyline",J(t.routeInfo?[t.routeInfo]:[])),yield $(l,"point",J(null===(i=t.directionPoints)||void 0===i?void 0:i.toArray())),yield $(s,"polyline",J(null===(a=t.directionLines)||void 0===a?void 0:a.toArray())),V(n),V(c),V(l),V(s)}catch(e){console.log("Failed to create directions output data sources. ",e)}})}(I,K.current.lastRoute):G(I)}),function(e){j(this,void 0,void 0,function*(){!e&&U&&(U.presetStart||U.presetEnd)&&(U.presetStart&&(K.current.layer.stops.at(0).name=U.presetStart.name,K.current.layer.stops.at(0).geometry=U.presetStart.geometry),U.presetEnd&&(K.current.layer.stops.at(1).name=U.presetEnd.name,K.current.layer.stops.at(1).geometry=U.presetEnd.geometry),yield K.current.viewModel.load(),U.presetStart&&U.presetEnd&&K.current.getDirections())})}(i)})}():t(),()=>{var e;null===(e=Q.current)||void 0===e||e.remove(),t()}},[I,null==O?void 0:O.view,P,Y,Z,C,e.autoHeight,ie,z,e.label,X,null==M?void 0:M.showRuntimeLayers,null==M?void 0:M.unit,O,U,null==M?void 0:M.enableRouteSaving]),(0,t.jsx)(i.Paper,{className:"widget-directions jimu-widget",variant:"flat",shape:"none",children:Z?(0,t.jsxs)(o.React.Fragment,{children:[(0,t.jsx)(r.JimuMapViewComponent,{useMapWidgetId:F,onActiveViewChange:re}),(0,t.jsx)("div",{className:"directions-ref",ref:q,css:B(te)}),(0,t.jsx)(R,{useUtilities:e.useUtilities})]}):(0,t.jsx)(i.WidgetPlaceholder,{widgetId:I,icon:_(),name:X("_widgetLabel")})})},B=e=>{var t,r,i,a;return o.css`
  width: 100% !important;
  height: 100% !important;
  .directions-container{
    width: 100% !important;
    height: 100% !important;
    overflow: auto;
    background-color: transparent!important;

    // Drag handler
    --calcite-action-text-color: var(--sys-color-action-text);
    --calcite-dropdown-background-color: var(--sys-color-surface-overlay);
    --calcite-dropdown-group-title-text-color: var(--sys-color-surface-overlay-text);
    --calcite-dropdown-item-text-color: var(--sys-color-surface-overlay-text);

    // Focus ring
    --calcite-color-focus: var(--sys-color-action-selected);

    // Background
    calcite-flow {
      // First calcite-flow-item is the direction main panel
      calcite-flow-item:first-of-type {
        --calcite-color-foreground-1: transparent;
        // Search input background
        --calcite-list-background-color: transparent;

        calcite-panel {
          --calcite-action-background-color-hover: var(--sys-color-action-hover);
          .esri-directions__stop-container {
            // Switch button
            calcite-action {
              // --calcite-action-corner-radius: var(--sys-shape-input-field);
              --calcite-action-corner-radius: ${null===(a=null===(i=null===(r=null===(t=null==e?void 0:e.comp)||void 0===t?void 0:t.Button)||void 0===r?void 0:r.root)||void 0===i?void 0:i.vars)||void 0===a?void 0:a.shape};
              margin-right: 8px;
            }
          }
          calcite-action {
            --calcite-color-foreground-1: var(--sys-color-action);
          }
          // Divider
          .esri-directions__separator {
            --calcite-color-border-3: var(--sys-color-divider-secondary);
          }
          // Mode & Departure time panel
          .esri-directions__margin-inline-medium {
            --calcite-color-text-1: var(--sys-color-surface-paper-text);
            // Dropdown item hover color
            --calcite-combobox-item-background-color-hover: rgba(0, 0, 0, 0.2);
            // Optimize order
            .esri-directions__optimize-section {
              --calcite-font-family: ${e.sys.typography.body.fontFamily};
            }
            // Calender date picker bg
            .esri-directions__departure-time-options {
              --calcite-color-foreground-1: var(--sys-color-surface-overlay);
            }
          }
        }

        calcite-list {
          calcite-list-item {
            // Locate button
            --calcite-color-text-2: var(--sys-color-surface-overlay-text);
            calcite-action {
              --calcite-color-foreground-1: var(--sys-color-action);
              border: 1px solid var(--sys-color-divider-secondary);
            }
          }
        }

        // Add stop, edit stop
        .esri-directions__action-container {
          calcite-button {
            background: var(--sys-color-action);
            --calcite-color-text-1: var(--sys-color-action-text);
          }
        }

        // Result list
        .esri-directions__primary-footer {
          --calcite-color-border-3: var(--sys-color-divider-secondary);
        }

        // Notice message
        .esri-directions__primary-footer {
          --calcite-color-brand: var(--sys-color-info-main);
          --calcite-color-text-1: var(--sys-color-surface-overlay-text);
          --calcite-label-text-color: var(--sys-color-surface-overlay-text);
        }

        // Route result
        .esri-directions__route-item {
          // Border
          --calcite-color-border-3: var(--sys-color-divider-secondary);
          calcite-action:not(:first-of-type) {
            --calcite-color-foreground-1: var(--sys-color-surface-overlay);
            --calcite-action-text-color: var(--sys-color-surface-overlay-text);
            --calcite-font-family: ${e.sys.typography.body.fontFamily};
            // For the popper's disabled action
            background: var(--sys-color-surface-overlay);
            opacity: 1;
          }
          calcite-action:first-of-type {
            --calcite-color-foreground-1: transparent;
            --calcite-action-text-color: var(--sys-color-surface-paper-text);
          }
          // Route result item button
          .esri-directions__route-item-button {
            font-family: ${e.sys.typography.body.fontFamily};
            --calcite-color-text-1: var(--sys-color-surface-paper-text);

            // Time info
            .esri-directions__route-item-description {
              --calcite-color-text-3: var(--sys-color-surface-paper-hint);
            }

            // Result expand icon
            calcite-icon {
              --calcite-icon-color: var(--sys-color-surface-paper-text);
            }
          }
        }

        // Result popper
        calcite-accordion {
          calcite-accordion-item {
            calcite-list {
              --calcite-color-text-2: var(--sys-color-surface-paper-text);
              --calcite-label-text-color: var(--sys-color-surface-paper-text);
            }
          }
        }
      }

      // The route result panel
      calcite-flow-item {
        --calcite-color-foreground-1: transparent;
        --calcite-list-background-color: transparent;
        --calcite-list-background-color-hover: var(--sys-color-action-hover);
        --calcite-action-text-color: var(--sys-color-surface-paper-text);
        --calcite-color-text-1: var(--sys-color-surface-paper-text);
        --calcite-color-text-3: var(--sys-color-surface-paper-text);
        --calcite-accordion-item-heading-text-color: var(--sys-color-surface-paper-text);

        calcite-action[slot="header-menu-actions"] {
          --calcite-color-foreground-1: var(--sys-color-surface-overlay);
          --calcite-font-family: ${e.sys.typography.body.fontFamily};
          --calcite-action-text-color: var(--sys-color-surface-overlay-text);
          opacity: 1;
          background: var(--sys-color-surface-overlay);
        }

        calcite-accordion {
          --calcite-accordion-item-expand-icon-color: var(--sys-color-surface-paper-text);
          calcite-accordion-item {
            calcite-action {
              --calcite-color-foreground-1: transparent;
            }
          }
        }
      }
    }

    .esri-search{
      background: transparent;
      .esri-search__container{
        --calcite-corner-radius-sharp: var(--sys-shape-input-field);
        // Search source dropdown button
        .esri-search__dropdown {
          --calcite-color-foreground-1: var(--sys-color-action);
          --calcite-color-text-1: var(--sys-color-action-text);
          --calcite-color-foreground-2: var(--sys-color-action-hover);
          --calcite-color-border-1: var(--sys-color-divider-secondary);
          calcite-dropdown-group {
            background: var(--sys-color-surface-overlay);
            --calcite-color-text-1: var(--sys-color-action-selected);
            --calcite-color-text-2: var(--sys-color-surface-overlay-hint);
            --calcite-color-text-3: var(--sys-color-surface-overlay-text);
          }
        }
        // Search input box
        .esri-search__form {
          --calcite-color-foreground-1: var(--sys-color-action-input-field);
          --calcite-color-text-3: var(--sys-color-action-input-field-placeholder);
          --calcite-input-actions-background-color-hover: var(--sys-color-action-hover);

          // Align with the source dropdown icon
          padding-top: 1px;

          // For the clear button
          .esri-search__autocomplete {
            --calcite-color-text-1: var(--sys-color-action-input-field-text);
            --calcite-color-foreground-2: var(--sys-color-action-hover);
          }
        }
      }
    }
    .esri-directions__panel-content{
      padding: 0 0 20px 0;
      div[role='button'] {
        cursor: unset;
      }
    }
    .esri-directions__add-stop-button{
      --calcite-ui-text-1: var(--ref-palette-neutral-1200);
    }
    &.dark-theme img.esri-directions__maneuver-icon{
      filter: invert(100%);
    }
  }
`};function G(e){return j(this,void 0,void 0,function*(){try{const t=yield o.DataSourceManager.getInstance().createDataSource(p(e)),r=yield o.DataSourceManager.getInstance().createDataSource(h(e)),i=yield o.DataSourceManager.getInstance().createDataSource(g(e)),a=yield o.DataSourceManager.getInstance().createDataSource(m(e));O(t),O(r),O(i),O(a)}catch(e){console.log("Failed to create directions output data sources. ",e)}})}function O(e){e&&(e.setStatus(o.DataSourceStatus.NotReady),e.setCountStatus(o.DataSourceStatus.NotReady))}function V(e){e&&(e.setStatus(o.DataSourceStatus.Unloaded),e.setCountStatus(o.DataSourceStatus.Unloaded))}function $(e,t,o){return j(this,void 0,void 0,function*(){e&&(yield e.setSourceFeatures(o,{id:e.id,geometryType:t}))})}function J(e){return e?e.map(e=>null==e?void 0:e.toGraphic()).filter(e=>!!e):[]}function N(e){y.p=e}})(),f})())}}});