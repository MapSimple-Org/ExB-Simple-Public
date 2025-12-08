System.register(["jimu-core/emotion","jimu-core","jimu-theme"],function(t,e){var o={},n={},r={};return{setters:[function(t){o.jsx=t.jsx,o.jsxs=t.jsxs},function(t){n.Immutable=t.Immutable,n.React=t.React,n.classNames=t.classNames,n.css=t.css},function(t){r.getThemeModule=t.getThemeModule,r.mapping=t.mapping}],execute:function(){t((()=>{var t={1888:t=>{"use strict";t.exports=r},67386:t=>{"use strict";t.exports=o},79244:t=>{"use strict";t.exports=n}},e={};function i(o){var n=e[o];if(void 0!==n)return n.exports;var r=e[o]={exports:{}};return t[o](r,r.exports,i),r.exports}i.d=(t,e)=>{for(var o in e)i.o(e,o)&&!i.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),i.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.p="";var s={};return i.p=window.jimuConfig.baseUrl,(()=>{"use strict";i.r(s),i.d(s,{Widget:()=>g,__set_webpack_public_path__:()=>S,default:()=>y});var t,e,o,n,r,l=i(67386),a=i(79244);function d(t,e=1.5,o=null){if(!t)return"0px";const n=o?Number(o.split("px")[0]):0;let r=Number(t.split("px")[0]);return r=n>r?n:r,r*e<1?"1px":`${Math.round(r*e)}px`}!function(t){t.Regular="REGULAR",t.Hover="HOVER"}(t||(t={})),function(t){t.Horizontal="Horizontal",t.Vertical="Vertical"}(e||(e={})),function(t){t.Style0="Style0",t.Style1="Style1",t.Style2="Style2",t.Style3="Style3",t.Style4="Style4",t.Style5="Style5",t.Style6="Style6",t.Style7="Style7",t.Style8="Style8",t.Style9="Style9",t.Style10="Style10"}(o||(o={})),function(t){t.None="None",t.Point0="Point0",t.Point1="Point1",t.Point2="Point2",t.Point3="Point3",t.Point4="Point4",t.Point5="Point5",t.Point6="Point6",t.Point7="Point7",t.Point8="Point8"}(n||(n={})),function(t){t.None="None",t.Default="Default",t.Style1="Style1",t.Style2="Style2",t.Style3="Style3",t.Style4="Style4",t.Style5="Style5",t.Style6="Style6",t.Style7="Style7",t.Style8="Style8",t.Style9="Style9",t.Style10="Style10",t.Style11="Style11",t.Style12="Style12",t.Style13="Style13",t.Style14="Style14",t.Style15="Style15",t.Style16="Style16",t.Style17="Style17",t.Style18="Style18",t.Style19="Style19"}(r||(r={}));var p=i(1888);const $=(t,o)=>{const{direction:n}=t,{size:r,type:i}=t.strokeStyle;return function(t,o,n=e.Horizontal,r=!1){const i=n===e.Horizontal,s={},l={};return o=o||"transparent",s.Style0=a.css`
    & {
      border-bottom: ${t} solid ${o};
    }
  `,s.Style1=a.css`
    & {
      border-bottom: ${t} dashed ${o};
    }
  `,s.Style2=a.css`
    & {
      border-bottom: ${t} dotted ${o};
    }
  `,s.Style3=a.css`
    & {
      height: ${t};
      position: relative;
    }
    &:before {
      position: absolute;
      content: '';
      height: ${t};
      left: ${d(t,4)};
      right: 0;
      background-image: repeating-linear-gradient(
        to right,
        ${o} 0,
        ${o} ${d(t,1)},
        transparent 0,
        transparent ${d(t,6)}
      );
    }
    &:after {
      position: absolute;
      content: '';
      height: ${t};
      left: 0;
      right: 0;
      background-image: repeating-linear-gradient(
        to right,
        ${o} 0,
        ${o} ${d(t,3)},
        transparent 0,
        transparent ${d(t,6)}
      );
    }
  `,s.Style6=a.css`
    & {
      height: ${t};
      background-image: repeating-linear-gradient(
        to right,
        ${o} 0,
        ${o} ${d(t,4)},
        transparent 0,
        transparent ${d(t,6)}
      );
    }
  `,s.Style7=a.css`
    & {
      border-color: ${o};
      border-bottom-style: double;
      border-bottom-width: ${r?"4px":t};
    }
  `,s.Style8=a.css`
    & {
      height: ${t};
      min-height: ${r?"6px":"unset"};
      position: relative;
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: ${d(t,.2,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${d(t,.4,"4px")};
      background: ${o};
    }
  `,s.Style9=a.css`
    & {
      height: ${t};
      min-height: ${r?"6px":"unset"};
      position: relative;
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: ${d(t,.4,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${d(t,.2,"4px")};
      background: ${o};
    }
  `,s.Style10=a.css`
    & {
      height: ${t};
      min-height: ${r?"8px":"unset"};
      position: relative;
      background-clip: content-box;
      border-top: ${d(t,.167)} solid ${o};
      border-bottom: ${d(t,.167)} solid ${o};
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: ${r?"2px":d(t,.3)};
      background: ${o};
      transform: translateY(-50%);
    }
  `,l.Style0=a.css`
    & {
      border-left: ${t} solid ${o};
    }
  `,l.Style1=a.css`
    & {
      border-left: ${t} dashed ${o};
    }
  `,l.Style2=a.css`
    & {
      border-left: ${t} dotted ${o};
    }
  `,l.Style3=a.css`
    & {
      width: ${t};
      position: relative;
    }
    &:before {
      position: absolute;
      content: '';
      width: ${t};
      top: ${d(t,3.8)};
      bottom: 0;
      background-image: repeating-linear-gradient(
        to bottom,
        ${o} 0,
        ${o} ${d(t,1)},
        transparent 0,
        transparent ${d(t,6)}
      );
    }
    &:after {
      position: absolute;
      content: '';
      width: ${t};
      top: 0;
      bottom: 0;
      background-image: repeating-linear-gradient(
        to bottom,
        ${o} 0,
        ${o} ${d(t,2.5)},
        transparent 0,
        transparent ${d(t,6)}
      );
    }
  `,l.Style6=a.css`
    & {
      width: ${t};
      background-image: repeating-linear-gradient(
        to bottom,
        ${o} 0,
        ${o} ${d(t,4)},
        transparent 0,
        transparent ${d(t,6)}
      );
    }
  `,l.Style7=a.css`
    & {
      border-left: ${t} double ${o};
    }
  `,l.Style8=a.css`
    & {
      width: ${t};
      position: relative;
    }
    &:before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: ${d(t,.2,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: ${d(t,.4,"4px")};
      background: ${o};
    }
  `,l.Style9=a.css`
    & {
      width: ${t};
      position: relative;
    }
    &:before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: ${d(t,.4,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: ${d(t,.2,"4px")};
      background: ${o};
    }
  `,l.Style10=a.css`
    & {
      width: ${t};
      position: relative;
      background-clip: content-box;
      border-left: ${d(t,.167)} solid ${o};
      border-right: ${d(t,.167)} solid ${o};
    }
    &:before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: ${r?"2px":d(t,.3)};
      background: ${o};
      transform: translateX(-50%);
    }
  `,i?s:l}(r,u(t,o),n)[i]};function u(t,e){const o=(0,p.getThemeModule)(null==e?void 0:e.uri),n=p.mapping.whetherIsNewTheme(o),{strokeStyle:r}=t,i=function(t){const e={dark:{Default:"#C6C6C6",Style1:"#FF8A7B",Style2:"#E99A29",Style3:"#C6C6C6",Style4:"#C6C6C6",Style5:"#5EB2F1",Style6:"#6FBC76",Style7:"#C6C6C6",Style18:"#C6C6C6",Style19:"#5EB2F1",Style8:"#C6C6C6",Style9:"#E99A29",Style10:"#FF8A7B",Style11:"#C6C6C6",Style12:"#C6C6C6",Style13:"#6FBC76",Style14:"#5EB2F1",Style15:"#C6C6C6",Style16:"#C6C6C6",Style17:"#FF8A7B"},light:{Default:"#303030",Style1:"#B4271F",Style2:"#865300",Style3:"#303030",Style4:"#303030",Style5:"#006496",Style6:"#00531D",Style7:"#303030",Style18:"#303030",Style19:"#006496",Style8:"#303030",Style9:"#865300",Style10:"#B4271F",Style11:"#303030",Style12:"#303030",Style13:"#00531D",Style14:"#006496",Style15:"#303030",Style16:"#303030",Style17:"#B4271F"}};return"dark"===t?e.dark:e.light}(e.sys.color.mode),s=n?i.Default:"",l=(null==t?void 0:t.template)?i[t.template]:s;return(null==r?void 0:r.color)||l}const c=t=>{const{direction:o,pointEnd:r,pointStart:i,strokeStyle:s}=t,l=o===e.Horizontal,d=i.pointStyle,p=i.pointSize*h(null==s?void 0:s.size),$=r.pointStyle,u=r.pointSize*h(null==s?void 0:s.size);return function(t,e,o,n,r){const i=e?n/2+"px":0,s=e?n/2.5+"px":0,l=o?r/2+"px":0,d=o?r/2.5+"px":0,p=a.css`
    left: ${i};
    right: ${l};
    top: 50%;
    transform: translateY(-50%);
    &.point-start-Point1,
    &.point-start-Point2,
    &.point-start-Point5 {
      left: 0;
    }
    &.point-end-Point1,
    &.point-end-Point2,
    &.point-end-Point5 {
      right: 0;
    }
    &.point-start-Point7 {
      left: ${s};
    }
    &.point-end-Point7 {
      right: ${d};
    }
  `,$=a.css`
    top: ${i};
    bottom: ${l};
    left: 50%;
    transform: translateX(-50%);
    &.point-start-Point1,
    &.point-start-Point2,
    &.point-start-Point5 {
      top: 0;
    }
    &.point-end-Point1,
    &.point-end-Point2,
    &.point-end-Point5 {
      bottom: 0;
    }
  `;return t?p:$}(l,d!==n.None,$!==n.None,p,u)},b=(t,o,n=!0)=>{const{pointEnd:r,pointStart:i,strokeStyle:s,direction:l}=t,p=Number(h(s.size)),$=(n?i.pointSize*p:r.pointSize*p)+"px",c=u(t,o),b=n?i.pointStyle:r.pointStyle,g=function(t,o,n=e.Horizontal,r=!0){const i=d(t,1),s=d(t,.5),l=d(t,.1),p=d(t,.3);o=o||"transparent";const $=n===e.Horizontal;let u={None:"None"},c={None:"None"};u.Point0=a.css`
    & {
      width: ${i};
      height: ${i};
      border-radius: 50%;
      background-color: ${o};
      left: ${r?0:"unset"};
      right: ${r?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,u.Point1=a.css`
    & {
      width: ${p};
      height: ${i};
      background-color: ${o};
      left: ${r?"4%":"unset"};
      right: ${r?"unset":"4%"};
      top: 50%;
      transform: translateY(-50%);
    }
  `,u.Point2=a.css`
    & {
      width: ${p};
      height: ${i};
      background-color: ${o};
      left: ${r?0:"unset"};
      right: ${r?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,u.Point3=a.css`
    & {
      width: ${i};
      height: ${i};
      background-color: ${o};
      left: ${r?0:"unset"};
      right: ${r?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,u.Point4=a.css`
    & {
      width: ${d(t,.71)};
      height: ${d(t,.71)};
      background-color: ${o};
      left: ${r?d(t,.2):"unset"};
      right: ${r?"unset":d(t,.2)};
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }
  `;const b=a.css`
    .jimu-rtl & {
      border-color: transparent ${o} transparent transparent;
    }
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: transparent transparent transparent ${o};
      left: ${r?0:"unset"};
      right: ${r?"unset":`-${d(t,.5)}`};
      top: 50%;
      transform: translateY(-50%);
    }
  `,h=a.css`
    .jimu-rtl & {
      border-color: transparent transparent transparent ${o};
    }
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: transparent ${o} transparent transparent;
      left: ${r?`-${d(t,.5)}`:"unset"};
      right: ${r?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,g=a.css`
    .jimu-rtl & {
      border-top: ${p} solid ${o};
      border-left: ${p} solid ${o};
    }
    .jimu-ltr & {
      border-bottom: ${p} solid ${o};
      border-left: ${p} solid ${o};
    }
    & {
      width: ${d(t,.8)};
      height: ${d(t,.8)};
      left: ${r?d(t,.2):"unset"};
      right: ${r?"unset":`-${d(t,.2)}`};
      top: 50%;
      border-radius: ${l};
      transform: translateY(-50%) rotate(45deg);
    }
  `,y=a.css`
    .jimu-rtl & {
      border-right: ${p} solid ${o};
      border-bottom: ${p} solid ${o};
    }
    .jimu-ltr & {
      border-top: ${p} solid ${o};
      border-right: ${p} solid ${o};
    }
    & {
      width: ${d(t,.8)};
      height: ${d(t,.8)};
      left: ${r?`-${d(t,.2)}`:"unset"};
      right: ${r?"unset":d(t,.2)};
      top: 50%;
      border-radius: ${l};
      transform: translateY(-50%) rotate(45deg);
    }
  `;c.Point0=a.css`
    & {
      width: ${i};
      height: ${i};
      border-radius: 50%;
      background-color: ${o};
      top: ${r?0:"unset"};
      bottom: ${r?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,c.Point1=a.css`
    & {
      width: ${i};
      height: ${p};
      background-color: ${o};
      top: ${r?"4%":"unset"};
      bottom: ${r?"unset":"4%"};
      left: 50%;
      transform: translateX(-50%);
    }
  `,c.Point2=a.css`
    & {
      width: ${i};
      height: ${p};
      background-color: ${o};
      top: ${r?0:"unset"};
      bottom: ${r?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,c.Point3=a.css`
    & {
      width: ${i};
      height: ${i};
      background-color: ${o};
      top: ${r?0:"unset"};
      bottom: ${r?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,c.Point4=a.css`
    & {
      width: ${d(t,.71)};
      height: ${d(t,.71)};
      background-color: ${o};
      top: ${r?d(t,.2):"unset"};
      bottom: ${r?"unset":d(t,.2)};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
    }
  `;const S=a.css`
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: transparent transparent ${o} transparent;
      top: ${r?`-${d(t,.5)}`:"unset"};
      bottom: ${r?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,m=a.css`
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: ${o} transparent transparent transparent;
      top: ${r?0:"unset"};
      bottom: ${r?"unset":`-${d(t,.5)}`};
      left: 50%;
      transform: translateX(-50%);
    }
  `,f=a.css`
    .jimu-rtl & {
      border-bottom: ${p} solid ${o};
      border-left: ${p} solid ${o};
    }
    .jimu-ltr & {
      border-bottom: ${p} solid ${o};
      border-right: ${p} solid ${o};
    }
    & {
      width: ${d(t,.8)};
      height: ${d(t,.8)};
      top: ${r?`-${d(t,.2)}`:"unset"};
      bottom: ${r?"unset":d(t,.2)};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-radius: ${l};
    }
  `,P=a.css`
    .jimu-rtl & {
      border-top: ${p} solid ${o};
      border-right: ${p} solid ${o};
    }
    .jimu-ltr & {
      border-top: ${p} solid ${o};
      border-left: ${p} solid ${o};
    }
    & {
      width: ${d(t,.8)};
      height: ${d(t,.8)};
      top: ${r?d(t,.2):"unset"};
      bottom: ${r?"unset":`-${d(t,.2)}`};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-radius: ${l};
    }
  `;let w,v;return r?(w={Point5:b,Point6:h,Point7:g,Point8:y},v={Point5:m,Point6:S,Point7:P,Point8:f}):(w={Point5:h,Point6:b,Point7:y,Point8:g},v={Point5:S,Point6:m,Point7:f,Point8:P}),u=Object.assign(Object.assign({},u),w),c=Object.assign(Object.assign({},c),v),$?u:c}($,c,l,n);return g[b]},h=t=>{const e=t.split("px")[0];return Number(e)};class g extends a.React.PureComponent{constructor(){super(...arguments),this.editWidgetConfig=t=>{if(!window.jimuConfig.isInBuilder)return;this.props.builderSupportModules.jimuForBuilderLib.getAppConfigAction().editWidgetConfig(this.props.id,t).exec()},this.getStyle=()=>a.css`
      & {
        height: 100%;
        width: 100%;
        box-sizing: border-box;
      }
      .divider-con {
        height: 100%;
        width: 100%;
      }
    `}render(){const{config:t,id:o,theme:r}=this.props,{direction:i,pointEnd:s,pointStart:d}=t,p=(0,a.classNames)("jimu-widget","widget-divider","position-relative","divider-widget-"+o),u=i===e.Horizontal?"horizontal":"vertical",h=$(t,r),g=c(t),y=b(t,r,!0),S=b(t,r,!1),m=(0,a.classNames)("divider-line","position-absolute",u,`point-start-${d.pointStyle}`,`point-end-${s.pointStyle}`);return(0,l.jsx)("div",{className:p,css:this.getStyle(),ref:t=>{this.domNode=t},children:(0,l.jsxs)("div",{className:"position-relative divider-con",children:[(0,l.jsxs)("div",{className:"point-con",children:[d.pointStyle!==n.None&&(0,l.jsx)("span",{"data-testid":"divider-point-start",className:"point-start position-absolute",css:y}),s.pointStyle!==n.None&&(0,l.jsx)("span",{"data-testid":"divider-point-end",className:"point-end position-absolute",css:S})]}),(0,l.jsx)("div",{"data-testid":"divider-line",className:m,css:[h,g]})]})})}}g.mapExtraStateProps=(t,e)=>{var o,n,r;let i=!1;const s=t.appRuntimeInfo.selection;if(s&&t.appConfig.layouts[s.layoutId]){const o=t.appConfig.layouts[s.layoutId].content[s.layoutItemId];i=o&&o.widgetId===e.id}const l=t.appContext.isInBuilder&&i,d=t.widgetsState[e.id]||(0,a.Immutable)({});return{appMode:s?null===(o=null==t?void 0:t.appRuntimeInfo)||void 0===o?void 0:o.appMode:null,browserSizeMode:null==t?void 0:t.browserSizeMode,active:l,hasEverMount:d.hasEverMount,uri:null===(r=null===(n=t.appConfig.widgets)||void 0===n?void 0:n[e.id])||void 0===r?void 0:r.uri}};const y=g;function S(t){i.p=t}})(),s})())}}});