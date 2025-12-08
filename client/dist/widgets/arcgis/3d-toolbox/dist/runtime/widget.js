System.register(["jimu-core/emotion","jimu-core","jimu-arcgis","jimu-theme","jimu-ui","esri/widgets/Daylight","esri/widgets/Daylight/DaylightViewModel","esri/widgets/Weather","esri/core/reactiveUtils","esri/widgets/ShadowCast","esri/widgets/ShadowCast/ShadowCastViewModel","esri/widgets/LineOfSight","esri/widgets/LineOfSight/LineOfSightViewModel","esri/widgets/Slice","esri/widgets/Slice/SliceViewModel","esri/analysis/SlicePlane","esri/analysis/SliceAnalysis","esri/Viewpoint"],function(e,t){var o={},a={},i={},n={},r={},l={},s={},c={},d={},u={},p={},m={},g={},f={},v={},h={},w={},y={};return{setters:[function(e){o.jsx=e.jsx,o.jsxs=e.jsxs},function(e){a.BaseVersionManager=e.BaseVersionManager,a.Immutable=e.Immutable,a.React=e.React,a.ReactRedux=e.ReactRedux,a.appActions=e.appActions,a.classNames=e.classNames,a.css=e.css,a.focusElementInKeyboardMode=e.focusElementInKeyboardMode,a.hooks=e.hooks,a.polished=e.polished},function(e){i.JimuMapViewComponent=e.JimuMapViewComponent},function(e){n.useTheme=e.useTheme},function(e){r.Button=e.Button,r.FOCUSABLE_CONTAINER_CLASS=e.FOCUSABLE_CONTAINER_CLASS,r.Label=e.Label,r.Loading=e.Loading,r.LoadingType=e.LoadingType,r.Popper=e.Popper,r.Tooltip=e.Tooltip,r.WidgetPlaceholder=e.WidgetPlaceholder,r.defaultMessages=e.defaultMessages,r.useTrapFocusByBoundaryNodes=e.useTrapFocusByBoundaryNodes},function(e){l.default=e.default},function(e){s.default=e.default},function(e){c.default=e.default},function(e){d.watch=e.watch,d.whenOnce=e.whenOnce},function(e){u.default=e.default},function(e){p.default=e.default},function(e){m.default=e.default},function(e){g.default=e.default},function(e){f.default=e.default},function(e){v.default=e.default},function(e){h.default=e.default},function(e){w.default=e.default},function(e){y.default=e.default}],execute:function(){e((()=>{var e={1194:e=>{"use strict";e.exports=v},1888:e=>{"use strict";e.exports=n},5338:e=>{"use strict";e.exports=h},11526:e=>{"use strict";e.exports=w},14321:e=>{"use strict";e.exports=r},21587:e=>{"use strict";e.exports=c},33893:e=>{"use strict";e.exports=f},36122:e=>{"use strict";e.exports=g},36786:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 17"><g clip-path="url(#clip0_34_602)"><path fill="#000" d="M8 6.5h1v1H8zm0 3h1v-1H8zm0 2h1v-1H8zm0 2h1v-1H8zm8 2v1H0v-1h6v-7H5v-1h1V5.072l5-3.57V15.5zm-6 0V3.444L7 5.587V15.5zm-6-4.605v-.842A3.37 3.37 0 0 1 .84 8.265a3.37 3.37 0 0 1 1.804-1.234c-.205.32-.317.692-.323 1.073a1.467 1.467 0 0 0 1.6 1.46c.027 0 .053-.005.08-.006v-3.45c-.04 0-.08-.008-.12-.008A5.27 5.27 0 0 0 .066 7.9a.37.37 0 0 0-.032.365A3.89 3.89 0 0 0 4 10.895M13 7.5h-1v1h1zm.354-2.288-.707.707 1.58 1.581H14v1h.27l-1.623 1.623.707.707L16 8.184v-.325z"></path></g><defs><clipPath id="clip0_34_602"><path fill="#fff" d="M0 .5h16v16H0z"></path></clipPath></defs></svg>'},41330:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 17"><path fill="#000" fill-rule="evenodd" d="M15 8.5a7 7 0 1 1-14 0 7 7 0 0 1 14 0m1 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0m-6-4H8v1h2zm2 7v-1H8v1zm-4 1h2v1H8zm4-6H8v1h4zm-4 2h5v1H8z" clip-rule="evenodd"></path></svg>'},47642:e=>{"use strict";e.exports=u},54948:e=>{"use strict";e.exports=y},59455:e=>{"use strict";e.exports=l},60154:e=>{"use strict";e.exports=p},61685:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 17"><path fill="#000" fill-rule="evenodd" d="M13.777 5.508C13.208 2.138 11.38 0 8.997 0l-.032.002a8 8 0 1 0 7.986 8.863A2 2 0 0 0 17 8.453c0-.048-.013-.092-.016-.139C16.988 8.21 17 8.105 17 8c0-1.137-1.084-1.974-3.223-2.491zm-4.81-4.506L8.999 1q.352.002.692.092c.081.022.156.06.235.089q.21.07.405.171.141.082.273.18.16.107.308.231.147.131.28.278.121.127.235.27.143.18.274.382.241.375.428.78c.04.087.076.18.113.27.082.2.162.404.23.622.022.07.04.145.06.216.072.25.142.505.196.777.064.316.121.638.159.98l-1.124.612c-.259-2.341-1.209-4.35-2.338-4.35-1.874 0-2.625 4.24-2.334 6.894l-1.977 1.077A20 20 0 0 1 5.03 9.48C5.01 9.097 5 8.732 5 8.456 5 4.02 6.776 1.03 8.967 1.002M8.332 8.82l-.093.05c-.15-1.033.329-4.27 1.295-4.27.583 0 1.111 1.976 1.244 2.887L8.247 8.865zM9 15A6.994 6.994 0 0 1 5.835 1.767 11.26 11.26 0 0 0 4 8.456c0 .545.038 1.475.12 2.225l.003.01v.01c.002.018.01.033.014.05a1 1 0 0 0 .06.208q.021.044.045.087c.094.16.226.295.383.394q.014.009.026.018.102.053.215.08l.012.005c1.35.312 2.73.466 4.116.457h.007a16 16 0 0 0 5.289-.809 7 7 0 0 0 1.197-.563A7.01 7.01 0 0 1 9 15m6.964-6.289zC15.604 9.994 12.619 10.998 9 11q-1.159 0-2.309-.148L8.813 9.7c.205.01.4.028.614.027 2.32 0 4.573-.662 4.573-1.505 0-.31-.385-.596-.925-.837l1.14-.62q.05.019.097.039a7 7 0 0 1 .553.269c.42.205.77.527 1.01.928h.011q.076.155.098.326l-.002.025a1 1 0 0 1 .018.101 1 1 0 0 1-.036.26z" clip-rule="evenodd"></path></svg>'},62243:e=>{"use strict";e.exports=d},62686:e=>{"use strict";e.exports=i},62838:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="m8.745 8 6.1 6.1a.527.527 0 1 1-.745.746L8 8.746l-6.1 6.1a.527.527 0 1 1-.746-.746l6.1-6.1-6.1-6.1a.527.527 0 0 1 .746-.746l6.1 6.1 6.1-6.1a.527.527 0 0 1 .746.746z"></path></svg>'},67386:e=>{"use strict";e.exports=o},73507:e=>{"use strict";e.exports=m},79244:e=>{"use strict";e.exports=a},82070:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 17"><g clip-path="url(#clip0_34_605)"><path fill="#000" d="M4.482 3.02 3.856.835l.96-.275.627 2.183a3.8 3.8 0 0 0-.961.275zM2.347 7.546a4 4 0 0 1-.09-.493l-2.196.63.275.96 2.196-.63a4 4 0 0 1-.185-.467m.33-2.89q.122-.219.272-.42l-1.79-.992-.484.875 1.802.999q.084-.237.2-.461zm5.166-1.48q.216.129.413.285l.999-1.803-.875-.483-.992 1.789q.234.09.455.213zM16 10a3.5 3.5 0 0 1-3.5 3.5h-9a2.492 2.492 0 0 1-.648-4.9c.065-.018.127-.042.194-.054.065-.338.199-.658.394-.941a2.765 2.765 0 0 1 4.23-3.337 3.97 3.97 0 0 1 6.26 2.544A3.5 3.5 0 0 1 16 10m-1 0a2.5 2.5 0 0 0-1.48-2.276l-.483-.218-.092-.522a2.99 2.99 0 0 0-5.857-.17l-.233.992-.987-.252A1.462 1.462 0 0 0 4.03 8.727l-.124.678-.678.124A1.498 1.498 0 0 0 3.5 12.5h9A2.503 2.503 0 0 0 15 10M4.241 6.84a2.42 2.42 0 0 1 1.874-.255c.143-.595.421-1.15.813-1.621-.02-.012-.035-.027-.055-.038a1.8 1.8 0 0 0-2.447.701c-.204.37-.27.8-.185 1.214z"></path></g><defs><clipPath id="clip0_34_605"><path fill="#fff" d="M0 .5h16v16H0z"></path></clipPath></defs></svg>'},89948:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 17"><g clip-path="url(#clip0_34_599)"><path fill="#000" d="m12.153 6.054-.707-.707 2.2-2.2.708.707zm-9.507 8.092.707.707 2.2-2.2-.706-.707zm8.8-1.493 2.2 2.2.707-.706-2.2-2.2zM5.554 5.347l-2.2-2.2-.707.706 2.2 2.2zM9 1.5H8v3h1zm-1 15h1v-3H8zm8-7v-1h-3v1zm-15 0h3v-1H1zM5 9a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0m1 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0"></path></g><defs><clipPath id="clip0_34_599"><path fill="#fff" d="M0 .5h16v16H0z"></path></clipPath></defs></svg>'},95060:e=>{"use strict";e.exports=s},95653:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#000" fill-rule="evenodd" d="M18 6.733 8.462.374 1 6.77v8.709l7.473 4.076L18 15.513zM8 2.087 2 7.23v7.655l6 3.273zm1 16.158 8-3.394V7.268L9 1.934z" clip-rule="evenodd"></path></svg>'},96300:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M15 7.5a.52.52 0 0 1-.516.527H2.976L6.473 11.6a.535.535 0 0 1 0 .746.51.51 0 0 1-.73 0L1 7.5l4.743-4.846a.51.51 0 0 1 .73 0 .535.535 0 0 1 0 .746L2.976 6.973h11.508c.285 0 .516.236.516.527"></path></svg>'}},t={};function x(o){var a=t[o];if(void 0!==a)return a.exports;var i=t[o]={exports:{}};return e[o](i,i.exports,x),i.exports}x.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return x.d(t,{a:t}),t},x.d=(e,t)=>{for(var o in t)x.o(t,o)&&!x.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},x.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),x.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},x.p="";var b={};return x.p=window.jimuConfig.baseUrl,(()=>{"use strict";x.r(b),x.d(b,{__set_webpack_public_path__:()=>ye,default:()=>we});var e,t,o,a,i,n,r,l=x(67386),s=x(79244),c=x(62686),d=x(1888);!function(e){e.Daylight="daylight",e.Weather="weather",e.ShadowCast="shadowcast",e.LineOfSight="lineofsight",e.Slice="slice"}(e||(e={})),function(e){e.Date="date",e.Season="season"}(t||(t={})),function(e){e.SyncedWithMap="syncedWithMap",e.Spring="spring",e.Summer="summer",e.Fall="fall",e.Winter="winter"}(o||(o={})),function(e){e.Sunny="sunny",e.Cloudy="cloudy",e.Rainy="rainy",e.Snowy="snowy",e.Foggy="foggy"}(a||(a={})),function(e){e.Threshold="threshold",e.Duration="duration",e.Discrete="discrete"}(i||(i={})),function(e){e.List="list",e.Icon="icon"}(n||(n={})),function(e){e.Horizontal="horizontal",e.Vertical="vertical"}(r||(r={}));var u=x(14321);const p={_widgetLabel:"3D Toolbox",select3DScene:"Please select a 3D scene to active this widget",clearEffect:"Clear effect",clearAnalysis:"Clear analysis",showDevelopmentLayer:"Show development layer",showDevLayer:"Show development layer",allowTiltOnSlice:"Allow tilt on slice plane",excludedLayer:"Excluded layer",resetSlice:"Reset slice plane",clearSlice:"Clear Slice"};function m(e){return s.css`
    /*min-width: 300px;*/
    .tool-header {
      color: var(--sys-color-surface-overlay-text);

      .label {
        font-weight: 600;
        font-size: 1rem;
      }
    }

    .api-loader {
      position: absolute;
      height: 50%;
      left: 50%;
      z-index: 1;
    }

    .tool-content {
      min-width: 270px;
      min-height: 36px;
      overflow: auto;
      height: calc(100% - 30px);

      .esri-widget__heading {
        display: none;
      }

      /* min-height of widgets, for popper placement ,#13159 */
      .daylight-container {
        min-height: 200px;
      }
      .weather-container {
        min-height: 124px;
      }
      .shadowcast-container {
        min-height: 341px;
      }
      .lineofsight-container {
        min-height: 56px;
      }
      .slice-container {
        min-height: 56px;
      }

      .tool-footer {
        button {
          /*color: var(--sys-color-action);
          border: 1px solid var(--sys-color-action);*/
        }
      }

      /* 3D Toolbox: replace widget runtime color variables with the new theme system variables ,#28085 */
      .esri-widget.esri-daylight,
      .esri-widget.esri-weather,
      .esri-widget.esri-shadow-cast {
        /* usually */
        background-color: var(--sys-color-surface-overlay);
        color: var(--sys-color-surface-overlay-text);
        --calcite-label-text-color: var(--sys-color-surface-overlay-text);

        --calcite-ui-brand: var(--sys-color-primary-main);
        /*--calcite-ui-text-inverse: var(--sys-color-action-text);*/
        --calcite-ui-text-inverse: var(--sys-color-surface-overlay);
        --calcite-internal-button-text-color: var(--sys-color-primary-text);

        /* hover */
        --calcite-ui-brand-hover: var(--sys-color-primary-main);

        /* selected */
        --calcite-color-brand: var(--sys-color-action-selected);
        --calcite-color-text-inverse: var(--sys-color-action-selected-text);

        /* slider */
        .esri-slider,
        .esri-shadow-cast__time-range {
          background-color: var(--sys-color-surface-overlay);
          color: var(--sys-color-surface-overlay-text);

          /* timezone-picker */
          .esri-timezone-picker {
            --calcite-color-text-1: var(--sys-color-surface-overlay-text);
          }

          .esri-slider__thumb {
            background-color: var(--sys-color-primary-text);
            border-color: var(--sys-color-primary-main);

            &:hover {
              background-color: var(--sys-color-primary-text) !important;
              border-color: var(--sys-color-primary-main) !important;
            }
          }

          .esri-slider__anchor:focus .esri-slider__thumb {
            outline: var(--sys-color-primary-main);
          }

          .esri-slider__segment--interactive,
          .esri-slider__segment-1 {
            background: var(--sys-color-primary-main);
          }
        }

        /* date-picker */
        --calcite-input-text-text-color: var(--sys-color-action-text);
        --calcite-input-text-text-color-focus: var(--sys-color-action-text);

        /* primary btn */
        /* https://www.figma.com/file/8EJ9ktTFkIZU3KmaMAz2lb/Design-System-ExB?node-id=287%3A5239&t=9kFu8ZNQiWmozlje-0 */
        .esri-button--primary.esri-button {
          color: var(--sys-color-primary-text) !important;

          background: var(--sys-color-primary-main);
          border-color: var(--sys-color-primary-main);

          &:hover {
            background: var(--sys-color-primary-main);
          }
        }
      }

      /* esri-shadow-cast's text-1 color CAN NOT be overwrite ,#29903 */
      .esri-widget.esri-daylight,
      .esri-widget.esri-weather {
        /* unselected */
        --calcite-color-text-1: var(--sys-color-action);
      }
      .esri-widget.esri-weather {
        --calcite-color-text-1: --sys-color-surface-overlay-text;
      }

      /* Line-of-sight & Slice */
      .esri-widget.esri-line-of-sight,
      .esri-widget.esri-slice {
        /* usually */
        background-color: var(--sys-color-surface-overlay);
        color: var(--sys-color-surface-overlay-text);
        --calcite-label-text-color: var(--sys-color-surface-overlay-text);

        --calcite-color-foreground-2: ${s.polished.rgba("#000",.2)+" !important"};
      }
      /* Slice */
      .esri-widget.esri-slice {
        /* unselected */
        --calcite-color-text-1: var(--sys-color-action-text);

        --calcite-color-text-3: var(--sys-color-action-text);
        --calcite-list-label-text-color: var(--sys-color-action-text);
      }

      /* Daylight */
      .esri-widget.esri-daylight {
        --calcite-ui-icon-color: var(--sys-color-surface-paper);

        /* enhanced UI for calcite popper, extensions#20437 */
        --calcite-icon-color: var(--sys-color-primary-text);
        --calcite-color-brand: ${s.polished.rgba(e.sys.color.primary.main,.95)+" !important"};
        --calcite-color-brand-hover: ${s.polished.rgba(e.sys.color.primary.main,.85)+" !important"};

        .esri-daylight__container__tick {
          border-color: transparent !important
        }
      }
    }
  `}var g=x(59455),f=x(95060);const v=()=>{const e=s.React.useRef(null),t=s.React.useCallback(t=>{if(!e.current){const o=t.environment.lighting.clone();e.current=o}},[]),o=s.React.useCallback(t=>{t&&e.current&&(t.environment.lighting=e.current),e.current=null},[]),a=s.React.useRef(null);return{cacheDefaultLighting:t,restoreDefaultLighting:o,cacheDefaultWeather:s.React.useCallback(e=>{if(!a.current){const t=e.environment.weather.clone();a.current=t}},[]),restoreDefaultWeather:s.React.useCallback(e=>{e&&a.current&&(e.environment.weather=a.current),a.current=null},[])}};var h=x(21587),w=x(62243);var y=x(47642),j=x(60154);var C=x(73507),M=x(36122);var S=x(33893),k=x(1194),R=x(5338),O=x(11526),V=x(54948),I=function(e,t,o,a){return new(o||(o=Promise))(function(i,n){function r(e){try{s(a.next(e))}catch(e){n(e)}}function l(e){try{s(a.throw(e))}catch(e){n(e)}}function s(e){var t;e.done?i(e.value):(t=e.value,t instanceof o?t:new o(function(e){e(t)})).then(r,l)}s((a=a.apply(e,t||[])).next())})};const B=e=>{const{onUpdated:t,onShowResetSliceBtn:o,onShowCancelSlicingBtn:a}=e,i=s.React.useRef(null),n=s.React.useRef(null),r=s.React.useRef(null),l=s.React.useRef(null),{hasPresetAnalysisForThisMap:c,getAnalysisFromConfig:d,addAnalysesToView:u,removeAnalysesFromView:p}=(e=>{var t,o,a,i;const n=s.React.useCallback(()=>{var t;let o=null===(t=e.sliceConfig.analyses)||void 0===t?void 0:t.find(t=>{var o;return t.mapViewId===(null===(o=e.jimuMapView)||void 0===o?void 0:o.dataSourceId)});return o||(o=null),o},[e.sliceConfig,e.jimuMapView]),r=s.React.useCallback(()=>{let t=!1;return t=!(!e.sliceConfig.analyses||!n()),t},[e.sliceConfig,n]),l=s.React.useCallback(()=>{var e;const t=null===(e=n())||void 0===e?void 0:e.mapViewId;return(null==t?void 0:t.startsWith("3d-toolbox-map-popper-"))?t.replace("3d-toolbox-map-popper-",""):t},[n]),c=s.React.useCallback(()=>{var e;const t=null===(e=n())||void 0===e?void 0:e.viewpoint;return V.default.fromJSON(t)},[n]),d=s.React.useCallback(t=>{let o=e.sliceConfig.analyses.filter(t=>t.mapViewId!==e.jimuMapView.dataSourceId);return o=o.concat(t),{analyses:o}},[null===(t=e.jimuMapView)||void 0===t?void 0:t.dataSourceId,e.sliceConfig.analyses]),u=s.React.useCallback(()=>({analyses:e.sliceConfig.analyses.filter(t=>t.mapViewId!==e.jimuMapView.dataSourceId)}),[null===(o=e.jimuMapView)||void 0===o?void 0:o.dataSourceId,e.sliceConfig.analyses]),p=s.React.useCallback(e=>{let t=!1;return t=e===l(),t},[l]),m=s.React.useCallback(e=>r()&&p(e),[r,p]),g=s.React.useCallback(()=>{var e;let t=r(),o={},a=null;if(t){try{o=JSON.parse(null===(e=n())||void 0===e?void 0:e.analysis)}catch(e){t=!1,console.error(o)}const i=R.default.fromJSON(o);a=new O.default({shape:i})}return a},[r,n]),f=s.React.useCallback((t,o,a)=>I(void 0,void 0,void 0,function*(){var i,n;const r=null===(i=e.jimuMapView)||void 0===i?void 0:i.view;yield w.whenOnce(()=>!r.updating);const s=a===l();if(r&&"3d"===(null==r?void 0:r.type)&&s&&t&&r.analyses.add(o),s&&t){const t=c();t&&(null===(n=e.jimuMapView)||void 0===n||n.view.goTo(t))}}),[null===(a=e.jimuMapView)||void 0===a?void 0:a.view,l,c]),v=s.React.useCallback(t=>{var o,a;const i=null===(o=e.jimuMapView)||void 0===o?void 0:o.view;i&&t&&(null===(a=i.analyses)||void 0===a||a.remove(t),t.destroy(),t=null)},[null===(i=e.jimuMapView)||void 0===i?void 0:i.view]);return{hasPresetAnalysisForThisMap:m,getPresetMapViewIdInConfig:l,getPresetViewpointInConfig:c,setPresetAnalysisInConfig:d,clearPresetAnalysisInConfig:u,getAnalysisFromConfig:g,addAnalysesToView:f,removeAnalysesFromView:v}})({jimuMapView:e.jimuMapView,sliceConfig:e.sliceConfig}),m=s.React.useCallback(e=>{const t=(e=>{let t=!1;return"exclude"===e?t=!0:"none"===e&&(t=!1),t})(e);o(!t)},[o]),g=s.React.useCallback(s=>{var p,g;const f=null===(p=e.jimuMapView)||void 0===p?void 0:p.view,v=c(null===(g=e.jimuMapView)||void 0===g?void 0:g.dataSourceId),h={view:f,tiltEnabled:e.sliceConfig.tiltEnabled,excludeGroundSurface:e.sliceConfig.excludeGroundSurface};return v&&(n.current=d(),h.analysis=n.current),i.current=new S.default({container:s,view:f,viewModel:new k.default(h)}),i.current.when(()=>{t(),v?(o(!0),r.current=w.watch(()=>(null==i?void 0:i.current.viewModel).layersMode,e=>{m(e)})):o(!1),l.current=w.watch(()=>(null==i?void 0:i.current.viewModel).active,e=>{const t=((e,t)=>{let o=!1;return"ready"===e&&t&&(o=!0),o})(null==i?void 0:i.current.viewModel.state,e);t?(a(!0),o(!1)):(a(!1),v&&m((null==i?void 0:i.current.viewModel).layersMode))}),u(v,n.current,e.jimuMapView.dataSourceId)}),i.current},[e.jimuMapView,e.sliceConfig,c,d,u,t,o,a,m]),f=s.React.useCallback(()=>{var e,t;p(n.current),o(!1),a(!1),n.current=null,null===(e=null==r?void 0:r.current)||void 0===e||e.remove(),null===(t=null==l?void 0:l.current)||void 0===t||t.remove()},[p,o,a]);return{sliceRef:i.current,updateSliceWidget:g,destroySliceWidget:f}};var N=x(96300),W=x.n(N),L=function(e,t){var o={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(o[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(o[a[i]]=e[a[i]])}return o};const T=e=>{const t=window.SVG,{className:o}=e,a=L(e,["className"]),i=(0,s.classNames)("jimu-icon jimu-icon-component",o);return t?(0,l.jsx)(t,Object.assign({className:i,src:W()},a)):(0,l.jsx)("svg",Object.assign({className:i},a))},P=s.React.memo(i=>{var r,c,x;const b=(0,d.useTheme)(),S=s.hooks.useTranslation(p,u.defaultMessages),k=s.React.useRef(null),R=s.React.useRef(null),O=s.React.useRef(i.toolConfig.activedOnLoad);s.React.useEffect(()=>{O.current=i.toolConfig.activedOnLoad},[i.toolConfig]);const[V,I]=s.React.useState(!0),{onPopperVersionUpdate:N}=i,W=s.React.useCallback(()=>{I(!1),"function"==typeof N&&N()},[N]),[L,P]=s.React.useState(!1),[z,_]=s.React.useState(!1),{updateDaylightWidget:E,destroyDaylightWidget:A}=(e=>{const{cacheDefaultLighting:a,restoreDefaultLighting:i}=v(),{onUpdated:n}=e,r=s.React.useRef(null);s.React.useEffect(()=>{var e,t;null===(e=null==r?void 0:r.current)||void 0===e||e.viewModel.set("dayPlaying",!1),null===(t=null==r?void 0:r.current)||void 0===t||t.viewModel.set("yearPlaying",!1)},[e.appMode]);const l=s.React.useCallback(i=>{var l,s;const c=null===(l=e.jimuMapView)||void 0===l?void 0:l.view;a(c);const d={view:c};return new f.default(d),r.current=new g.default({container:i,view:c,visibleElements:{timezone:e.daylightConfig.timezone,playButtons:e.daylightConfig.playButtons,datePicker:e.daylightConfig.datePicker,sunLightingToggle:e.daylightConfig.dateTimeToggle,shadowsToggle:e.daylightConfig.isShowShadows},timeSliderSteps:e.daylightConfig.timeSliderSteps,playSpeedMultiplier:e.daylightConfig.playSpeedMultiplier,dateOrSeason:null!==(s=e.daylightConfig.dateOrSeason)&&void 0!==s?s:t.Date}),r.current.when(()=>{n(),e.daylightConfig.dateOrSeason===t.Season&&e.daylightConfig.currentSeason!==o.SyncedWithMap&&r.current.viewModel.set("currentSeason",e.daylightConfig.currentSeason);const a=e.daylightConfig.dateTimeAutoPlay;e.daylightConfig.dateOrSeason===t.Season||r.current.viewModel.set("dayPlaying",a)}),r.current},[e.jimuMapView,e.daylightConfig,a,n]),c=s.React.useCallback(()=>{i(e.jimuMapView.view)},[e.jimuMapView,i]);return{daylightRef:r.current,updateDaylightWidget:l,destroyDaylightWidget:c}})({jimuMapView:i.jimuMapView,daylightConfig:i.toolConfig.config,onUpdated:W,appMode:i.appMode}),{updateWeatherWidget:D,destroyWeatherWidget:U}=(e=>{const{cacheDefaultWeather:t,restoreDefaultWeather:o}=v(),{onUpdated:i}=e,n=s.React.useRef(null),r=s.React.useMemo(()=>({cloudCover:.5,precipitation:.5,fogStrength:.5}),[]),l=s.React.useRef(null),c=s.React.useCallback((t,o)=>{var i,n,l,s,c,d,u;switch(t){case a.Sunny:{const a=e.weatherConfig.sunnyConfig;o.environment.weather={type:t,cloudCover:null!==(i=null==a?void 0:a.cloudCover)&&void 0!==i?i:r.cloudCover};break}case a.Cloudy:{const a=e.weatherConfig.cloudyConfig;o.environment.weather={type:t,cloudCover:null!==(n=null==a?void 0:a.cloudCover)&&void 0!==n?n:r.cloudCover};break}case a.Rainy:{const a=e.weatherConfig.rainyConfig;o.environment.weather={type:t,cloudCover:null!==(l=null==a?void 0:a.cloudCover)&&void 0!==l?l:r.cloudCover,precipitation:null!==(s=null==a?void 0:a.precipitation)&&void 0!==s?s:r.precipitation};break}case a.Snowy:{const a=e.weatherConfig.snowyConfig;o.environment.weather={type:t,cloudCover:null!==(c=null==a?void 0:a.cloudCover)&&void 0!==c?c:r.cloudCover,precipitation:null!==(d=null==a?void 0:a.precipitation)&&void 0!==d?d:r.precipitation};break}case a.Foggy:{const a=e.weatherConfig.foggyConfig;o.environment.weather={type:t,fogStrength:null!==(u=null==a?void 0:a.fogStrength)&&void 0!==u?u:r.fogStrength};break}}},[e.weatherConfig,r]),d=s.React.useCallback(o=>{var a;const r=null===(a=e.jimuMapView)||void 0===a?void 0:a.view;return t(r),c(e.weatherConfig.weatherType,r),n.current=new h.default({container:o,view:r}),n.current.when(()=>{i(),l.current=w.watch(()=>null==r?void 0:r.environment.weather.type,e=>{c(r.environment.weather.type,r)})}),n.current},[e.jimuMapView,e.weatherConfig.weatherType,c,t,i]),u=s.React.useCallback(()=>{var t;null===(t=null==l?void 0:l.current)||void 0===t||t.remove(),o(e.jimuMapView.view)},[e.jimuMapView,o]);return{weatherRef:n.current,updateWeatherWidget:d,destroyWeatherWidget:u}})({jimuMapView:i.jimuMapView,weatherConfig:i.toolConfig.config,onUpdated:W}),{updateShadowCastWidget:H,destroyShadowCastWidget:F}=(e=>{const{onUpdated:t}=e,o=s.React.useRef(null),a=s.React.useCallback(a=>{var i,n;return o.current=new y.default({container:a,view:null===(i=e.jimuMapView)||void 0===i?void 0:i.view,visibleElements:{timezone:e.shadowCastConfig.timezone,datePicker:e.shadowCastConfig.datePicker},viewModel:new j.default({view:null===(n=e.jimuMapView)||void 0===n?void 0:n.view,visualizationType:e.shadowCastConfig.visType})}),o.current.when(()=>{t()}),o.current},[e.jimuMapView,e.shadowCastConfig,t]),i=s.React.useCallback(()=>{},[]);return{shadowCastRef:o.current,updateShadowCastWidget:a,destroyShadowCastWidget:i}})({jimuMapView:i.jimuMapView,shadowCastConfig:i.toolConfig.config,onUpdated:W}),{updateLineOfSightWidget:q,destroyLineOfSightWidget:G}=(e=>{const{onUpdated:t}=e,o=s.React.useRef(null),a=s.React.useRef(null),[i,n]=s.React.useState(!1),[r,l]=s.React.useState(!1);s.React.useEffect(()=>{i&&r&&t()},[i,r,t]);const c=s.React.useCallback(t=>{var i,r;return o.current=new C.default({container:t,view:null===(i=e.jimuMapView)||void 0===i?void 0:i.view,viewModel:new M.default({view:null===(r=e.jimuMapView)||void 0===r?void 0:r.view})}),a.current=w.watch(()=>null==o?void 0:o.current.viewModel.state,e=>{"ready"===e&&l(!0)}),o.current.when(()=>{n(!0)}),o.current},[e.jimuMapView]),d=s.React.useCallback(()=>{var e;null===(e=null==a?void 0:a.current)||void 0===e||e.remove()},[]);return{lineOfSightRef:o.current,updateLineOfSightWidget:c,destroyLineOfSightWidget:d}})({jimuMapView:i.jimuMapView,lineOfSightConfig:i.toolConfig.config,onUpdated:W}),{updateSliceWidget:J,destroySliceWidget:K}=B({jimuMapView:i.jimuMapView,sliceConfig:i.toolConfig.config,onUpdated:W,onShowCancelSlicingBtn:P,onShowResetSliceBtn:_});function $(t){const o=document.createElement("div");return o.className=t+"-container w-100 ",t===e.Weather&&(o.className+="d-flex justify-content-center"),k.current.innerHTML="",k.current.appendChild(o),o}const Z=s.React.useCallback(()=>{var t,o,a;if(null===(o=null===(t=R.current)||void 0===t?void 0:t.view)||void 0===o?void 0:o.map)switch(i.mode){case e.Daylight:A();break;case e.Weather:U();break;case e.ShadowCast:F();break;case e.LineOfSight:G();break;case e.Slice:K()}null===(a=null==R?void 0:R.current)||void 0===a||a.destroy(),R.current=null,(null==k?void 0:k.current)&&(k.current.innerHTML="")},[i.mode,A,U,F,G,K]),Q=s.React.useCallback(()=>{Z();if(i.toolConfig.enable)switch(i.mode){case e.Daylight:R.current=E($(i.mode));break;case e.Weather:R.current=D($(i.mode));break;case e.ShadowCast:R.current=H($(i.mode));break;case e.LineOfSight:R.current=q($(i.mode));break;case e.Slice:R.current=J($(i.mode))}},[i.mode,i.toolConfig,Z,E,D,H,q,J]);s.React.useEffect(()=>(i.useMapWidgetId||Z(),()=>{Z()}),[null===(r=i.jimuMapView)||void 0===r?void 0:r.view,i.useMapWidgetId,i.toolConfig,Z,Q]);const{onBackBtnClick:X}=i;s.React.useEffect(()=>{var e,t;(null===(e=i.shownModeState)||void 0===e?void 0:e.id)===i.mode&&(O.current=!0),(null==O?void 0:O.current)?!R.current&&i.useMapWidgetId&&(null===(t=i.jimuMapView)||void 0===t?void 0:t.view)&&Q():R.current&&Z()},[i.mode,i.useMapWidgetId,null===(c=i.jimuMapView)||void 0===c?void 0:c.view,i.shownModeState,i.toolConfig,Z,Q]);const Y=s.React.useRef(null),ee=s.React.useRef(null);s.React.useEffect(()=>{var e;i.isShowBackBtn&&(null===(e=i.shownModeState)||void 0===e?void 0:e.id)===i.mode&&(0,s.focusElementInKeyboardMode)(null==Y?void 0:Y.current)},[i.shownModeState,i.isShowBackBtn,i.mode]);const[te,oe]=s.React.useState(0),ae=s.React.useRef(null),ie=s.React.useRef(null);s.React.useEffect(()=>{i.arrangementStyle===n.List&&(ae.current=Y.current,ie.current=ee.current),oe(e=>e+1)},[i.shownModeState,i.arrangementStyle,i.mode]),(0,u.useTrapFocusByBoundaryNodes)(ae,ie,te);const ne=(null===(x=i.shownModeState)||void 0===x?void 0:x.id)===i.mode,re=i.mode===e.Daylight||i.mode===e.Weather?S("clearEffect"):S("clearAnalysis");return(0,l.jsxs)("div",{className:"p-2 w-100 "+(ne?"d-block "+u.FOCUSABLE_CONTAINER_CLASS:"d-none"),css:m(b),children:[i.isShowBackBtn&&"function"==typeof X&&(0,l.jsxs)("div",{className:"tool-header d-flex align-items-center my-1",children:[(0,l.jsx)(u.Button,{className:"",variant:"text",color:"inherit",icon:!0,size:"sm",ref:e=>{Y.current=e},onClick:X,children:(0,l.jsx)(T,{size:16,autoFlip:!0})}),(0,l.jsx)(u.Label,{className:"label ml-1 my-0",children:S(i.mode)})]}),(0,l.jsxs)("div",{className:"tool-content",children:[V&&(0,l.jsx)("div",{className:"api-loader m-2",children:(0,l.jsx)(u.Loading,{type:u.LoadingType.Secondary})}),(0,l.jsx)("div",{ref:k}),(0,l.jsxs)("div",{className:"tool-footer w-100 px-4 mt-1 mb-2",children:[L&&(0,l.jsx)(u.Button,{type:"secondary",className:"w-100 mb-2",onClick:()=>{R.current.viewModel.clear()},children:S("commonModalCancel")}),z&&(0,l.jsx)(u.Button,{type:"secondary",className:"w-100 mb-2",onClick:()=>{Q()},children:S("resetSlice")}),(0,l.jsx)(u.Button,{type:"secondary",className:"w-100",ref:e=>{ee.current=e},onClick:()=>{O.current=!1,X()},children:re})]})]})]})});var z=x(89948),_=x.n(z),E=function(e,t){var o={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(o[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(o[a[i]]=e[a[i]])}return o};const A=e=>{const t=window.SVG,{className:o}=e,a=E(e,["className"]),i=(0,s.classNames)("jimu-icon jimu-icon-component",o);return t?(0,l.jsx)(t,Object.assign({className:i,src:_()},a)):(0,l.jsx)("svg",Object.assign({className:i},a))};var D=x(82070),U=x.n(D),H=function(e,t){var o={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(o[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(o[a[i]]=e[a[i]])}return o};const F=e=>{const t=window.SVG,{className:o}=e,a=H(e,["className"]),i=(0,s.classNames)("jimu-icon jimu-icon-component",o);return t?(0,l.jsx)(t,Object.assign({className:i,src:U()},a)):(0,l.jsx)("svg",Object.assign({className:i},a))};var q=x(41330),G=x.n(q),J=function(e,t){var o={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(o[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(o[a[i]]=e[a[i]])}return o};const K=e=>{const t=window.SVG,{className:o}=e,a=J(e,["className"]),i=(0,s.classNames)("jimu-icon jimu-icon-component",o);return t?(0,l.jsx)(t,Object.assign({className:i,src:G()},a)):(0,l.jsx)("svg",Object.assign({className:i},a))};var $=x(36786),Z=x.n($),Q=function(e,t){var o={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(o[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(o[a[i]]=e[a[i]])}return o};const X=e=>{const t=window.SVG,{className:o}=e,a=Q(e,["className"]),i=(0,s.classNames)("jimu-icon jimu-icon-component",o);return t?(0,l.jsx)(t,Object.assign({className:i,src:Z()},a)):(0,l.jsx)("svg",Object.assign({className:i},a))};var Y=x(61685),ee=x.n(Y),te=function(e,t){var o={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(o[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(o[a[i]]=e[a[i]])}return o};const oe=e=>{const t=window.SVG,{className:o}=e,a=te(e,["className"]),i=(0,s.classNames)("jimu-icon jimu-icon-component",o);return t?(0,l.jsx)(t,Object.assign({className:i,src:ee()},a)):(0,l.jsx)("svg",Object.assign({className:i},a))},ae=s.React.memo(t=>{const o=s.hooks.useTranslation(p,u.defaultMessages),[a,i]=s.React.useState(null),n=s.React.useRef(null),r=s.React.useCallback((e,t)=>{i(e);const o=t.currentTarget,a=o.dataset.id?o:o.parentElement;n.current=a},[]);s.hooks.useUpdateEffect(()=>{c()},[t.appMode]);const c=s.React.useCallback(()=>{i(null)},[]);s.React.useEffect(()=>{null===a&&(0,s.focusElementInKeyboardMode)(null==n?void 0:n.current)},[a]);const d=s.React.useCallback(t=>{if(!t.enable)return null;const a=o(""+t.id);let i=null;switch(t.id){case e.Daylight:i=(0,l.jsx)(A,{});break;case e.Weather:i=(0,l.jsx)(F,{});break;case e.ShadowCast:i=(0,l.jsx)(K,{});break;case e.LineOfSight:i=(0,l.jsx)(X,{});break;case e.Slice:i=(0,l.jsx)(oe,{})}return(0,l.jsxs)(u.Button,{className:"list-item d-flex align-items-center pl-2 py-1 my-4 w-100 jimu-outline-inside justify-content-start",type:"tertiary",title:a,role:"listitem","data-id":t.id,onClick:e=>{r(t,e)},children:[(0,l.jsx)("div",{className:"d-flex list-item-icon mx-2",children:i}),(0,l.jsx)("div",{className:"d-flex list-item-name",children:a})]},t.id)},[o,r]);return(0,l.jsx)(s.React.Fragment,{children:(0,l.jsxs)("div",{className:"list-item-container border-0 d-flex h-100",role:"list",children:[(0,l.jsx)("div",{className:(0,s.classNames)("main-list w-100 ",{hide:null!==a}),children:t.toolsConfig.map(e=>d(e))}),(0,l.jsx)(P,{mode:e.Daylight,toolConfig:t.findToolConfigById(e.Daylight),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:a,isShowBackBtn:!0,onBackBtnClick:c,appMode:t.appMode,arrangementStyle:t.arrangementStyle}),(0,l.jsx)(P,{mode:e.Weather,toolConfig:t.findToolConfigById(e.Weather),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:a,isShowBackBtn:!0,onBackBtnClick:c,appMode:t.appMode,arrangementStyle:t.arrangementStyle}),(0,l.jsx)(P,{mode:e.ShadowCast,toolConfig:t.findToolConfigById(e.ShadowCast),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:a,isShowBackBtn:!0,onBackBtnClick:c,appMode:t.appMode,arrangementStyle:t.arrangementStyle}),(0,l.jsx)(P,{mode:e.LineOfSight,toolConfig:t.findToolConfigById(e.LineOfSight),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:a,isShowBackBtn:!0,onBackBtnClick:c,appMode:t.appMode,arrangementStyle:t.arrangementStyle}),(0,l.jsx)(P,{mode:e.Slice,toolConfig:t.findToolConfigById(e.Slice),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:a,isShowBackBtn:!0,onBackBtnClick:c,appMode:t.appMode,arrangementStyle:t.arrangementStyle})]})})});function ie(e){return s.css`
    /* List mode */
    .list-item-container {
      background-color: ${e.sys.color.surface.paper};
      overflow: auto;

      .main-list {

      }

      .hide {
        display: none !important;
      }

      .list-item {
        height: 38px;
        min-width: 240px;
        color: var(--sys-color-surface-paper-text); /* item color */

        &:hover {
          background-color: ${e.sys.color.action.hover};

          .list-item-name {
            ${e.sys.color.surface.paperText};
          }
        }

        .list-item-icon {

        }
        .list-item-name {

        }
      }
    }

    /* Icon mode */
    .icon-item-container {
      background-color: var(--sys-color-surface-paper);

      .icon-item {
        color: var(--sys-color-surface-paper-text); /* item color */
        width: 32px;
        height: 32px;
      }

      .jimu-button.active {
        color: var(--sys-color-action-selected-text);
        background-color: var(--sys-color-action-selected);
      }
    }
  `}var ne=x(62838),re=x.n(ne),le=function(e,t){var o={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(o[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(a=Object.getOwnPropertySymbols(e);i<a.length;i++)t.indexOf(a[i])<0&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(o[a[i]]=e[a[i]])}return o};const se=e=>{const t=window.SVG,{className:o}=e,a=le(e,["className"]),i=(0,s.classNames)("jimu-icon jimu-icon-component",o);return t?(0,l.jsx)(t,Object.assign({className:i,src:re()},a)):(0,l.jsx)("svg",Object.assign({className:i},a))},ce=s.React.memo(t=>{(0,d.useTheme)();const o=s.hooks.useTranslation(p,u.defaultMessages),a=s.React.useRef(null),[i,n]=s.React.useState(null),[c,m]=s.React.useState(!1),g=s.React.useRef(null);s.hooks.useUpdateEffect(()=>{f()},[t.appMode]);const f=s.React.useCallback(()=>{n(null),(0,s.focusElementInKeyboardMode)(null==g?void 0:g.current),m(!1)},[]);s.React.useEffect(()=>(g.current=null,()=>{f()}),[t.toolsConfig,f]);const v=s.React.useCallback((e,t)=>{let o=!1;("pageOrSizeMode"===t||e&&e.key&&"Escape"===(null==e?void 0:e.key))&&(o=!0),o&&f()},[f]),[h,w]=s.React.useState(0),y=s.React.useCallback(()=>{w(e=>e+1)},[w]);s.React.useEffect(()=>{y()},[c,y]);const x=t.findToolConfigById,b=s.React.useCallback(t=>{if(!t.enable)return null;const r=o(""+t.id);let s=null;switch(t.id){case e.Daylight:s=(0,l.jsx)(A,{});break;case e.Weather:s=(0,l.jsx)(F,{});break;case e.ShadowCast:s=(0,l.jsx)(K,{});break;case e.LineOfSight:s=(0,l.jsx)(X,{});break;case e.Slice:s=(0,l.jsx)(oe,{})}return(0,l.jsx)("div",{className:"icon-item d-flex",children:(0,l.jsx)(u.Button,{variant:"text",color:"inherit",className:"w-100",size:"sm",icon:!0,active:(null==i?void 0:i.id)===t.id,title:r,"data-id":t.id,onClick:e=>{const t=e.currentTarget,o=t.dataset.id?t:t.parentElement;a.current=o;const i=a.current.dataset.id;n(x(i)),g.current=o,m(!!i)},children:s})},t.id)},[i,o,x]),j=s.React.useCallback(e=>{var t;null==e||e.stopPropagation(),null===(t=null==e?void 0:e.nativeEvent)||void 0===t||t.stopPropagation()},[]),C=t.direction===r.Horizontal?"flex-row":"flex-column";return(0,l.jsxs)(s.React.Fragment,{children:[(0,l.jsx)("div",{className:"icon-item-container border-0 d-flex p-1 "+C,onClick:j,children:t.toolsConfig.map(e=>b(e))}),(0,l.jsx)(u.Popper,{reference:a.current,placement:t.direction===r.Vertical?"right":"bottom",offsetOptions:12,arrowOptions:!0,open:c,keepMount:!0,version:h,toggle:v,autoFocus:!0,autoUpdate:!0,forceLatestFocusElements:!0,children:(0,l.jsxs)("div",{className:"content-container",css:s.css`
    .popper-header {
      .popper-title {
        margin-bottom: 0;
        font-weight: 600;
        font-size: 16px;
      }
    }
    .popper-content {
      width: 350px;
    }
  `,children:[(0,l.jsxs)("div",{className:"popper-header d-flex px-4 pt-2 align-items-center justify-content-between "+u.FOCUSABLE_CONTAINER_CLASS,children:[(0,l.jsx)(u.Label,{className:"popper-title mt-0 py-1",children:o((null==i?void 0:i.id)?i.id:"_widgetLabel")}),(0,l.jsx)(u.Button,{className:"print-button p-0",type:"tertiary",size:"sm",icon:!0,onClick:f,children:(0,l.jsx)(se,{})})]}),(0,l.jsxs)("div",{className:"popper-content",children:[(0,l.jsx)(P,{mode:e.Daylight,toolConfig:t.findToolConfigById(e.Daylight),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:i,onBackBtnClick:f,appMode:t.appMode,onPopperVersionUpdate:y}),(0,l.jsx)(P,{mode:e.Weather,toolConfig:t.findToolConfigById(e.Weather),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:i,onBackBtnClick:f,appMode:t.appMode,onPopperVersionUpdate:y}),(0,l.jsx)(P,{mode:e.ShadowCast,toolConfig:t.findToolConfigById(e.ShadowCast),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:i,onBackBtnClick:f,appMode:t.appMode,onPopperVersionUpdate:y}),(0,l.jsx)(P,{mode:e.LineOfSight,toolConfig:t.findToolConfigById(e.LineOfSight),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:i,onBackBtnClick:f,appMode:t.appMode,onPopperVersionUpdate:y}),(0,l.jsx)(P,{mode:e.Slice,toolConfig:t.findToolConfigById(e.Slice),useMapWidgetId:t.useMapWidgetId,jimuMapView:t.jimuMapView,shownModeState:i,onBackBtnClick:f,appMode:t.appMode,onPopperVersionUpdate:y})]})]})})]})}),de=s.React.memo(e=>{const t=(0,d.useTheme)(),o=s.ReactRedux.useSelector(e=>e.appRuntimeInfo.appMode);function a(t){return(0,s.Immutable)(e.config.tools.find(e=>e.id===t))}return(0,l.jsxs)("div",{className:"h-100",css:ie(t),children:[e.config.arrangement.style===n.List&&(0,l.jsx)(ae,{toolsConfig:e.config.tools,findToolConfigById:a,useMapWidgetId:e.useMapWidgetId,jimuMapView:e.jimuMapView,appMode:o,arrangementStyle:e.config.arrangement.style}),e.config.arrangement.style===n.Icon&&(0,l.jsx)(ce,{direction:e.config.arrangement.direction,toolsConfig:e.config.tools,findToolConfigById:a,useMapWidgetId:e.useMapWidgetId,jimuMapView:e.jimuMapView,appMode:o})]})});var ue=x(95653),pe=x.n(ue);const me={crossAxis:!0},ge=s.React.memo(e=>{const t=s.hooks.useTranslation(p,u.defaultMessages),o=((0,d.useTheme)(),t("select3DMapHint")),a=e.arrangement.style===n.List,i=e.arrangement.direction===r.Horizontal?"bottom":"right",c=t("_widgetLabel"),m=e.arrangement.style===n.Icon?"horizontal":"vertical";return(0,l.jsx)(s.React.Fragment,{children:(0,l.jsx)(u.Tooltip,{disableHoverListener:a,disableTouchListener:a,disableFocusListener:a,placement:i,shiftOptions:me,showArrow:!0,title:(0,l.jsx)("div",{className:"p-2",style:{background:"var(--ref-palette-neutral-300)",border:"1px solid var(--ref-palette-neutral-700)"},children:o}),arrowStyle:{background:"var(--ref-palette-neutral-300)",border:{color:"var(--ref-palette-neutral-700)",width:"1px"}},children:(0,l.jsx)("div",{className:(0,s.classNames)("h-100",{"hide-msg":!a,"in-controller":e.isInController}),css:s.css`
    &.hide-msg {
      .message-wrapper {
        display: none;
      }
    }
    &.in-controller {
      .thumbnail-wrapper {
        min-height: 42px;
        min-width: 170px;
      }
    }
  `,children:(0,l.jsx)(u.WidgetPlaceholder,{widgetId:e.widgetId,icon:pe(),title:o,name:c,direction:m,message:a?o:null})})})})});class fe extends s.BaseVersionManager{constructor(){super(...arguments),this.versions=[{version:"1.11.0",description:"support version manager for Slice ,#12467",upgrader:e=>{const t=e.tools.concat([{id:"slice",enable:!1,activedOnLoad:!1,config:{tiltEnabled:!1,excludeGroundSurface:!0,analyses:[]}}]);return e=e.setIn(["tools"],t)}}]}}const ve=new fe,he=e=>{var t,o;const a=null===(t=e.useMapWidgetIds)||void 0===t?void 0:t[0];s.hooks.useEffectOnce(()=>{const{layoutId:t,layoutItemId:o,id:a,dispatch:i}=e;i(s.appActions.widgetStatePropChange(a,"layoutInfo",{layoutId:t,layoutItemId:o}))});const[i,n]=s.React.useState(null),r=s.React.useCallback(e=>{var t;"3d"===(null===(t=null==e?void 0:e.view)||void 0===t?void 0:t.type)?n(e):n(null)},[]),d=!(a&&"3d"===(null===(o=null==i?void 0:i.view)||void 0===o?void 0:o.type));return(0,l.jsxs)("div",{className:"widget-3d-toolbox jimu-widget h-100",children:[d&&(0,l.jsx)(ge,{widgetId:e.id,arrangement:e.config.arrangement,isInController:!!e.controllerWidgetId}),!d&&i&&(0,l.jsx)(de,{config:e.config,useMapWidgetId:a,jimuMapView:i}),a&&(0,l.jsx)(c.JimuMapViewComponent,{useMapWidgetId:a,onActiveViewChange:r})]})};he.versionManager=ve;const we=he;function ye(e){x.p=e}})(),b})())}}});