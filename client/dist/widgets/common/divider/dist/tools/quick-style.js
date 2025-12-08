System.register(["jimu-core","jimu-for-builder","jimu-ui","jimu-core/emotion","jimu-theme"],function(t,e){var o={},i={},n={},l={},r={};return{setters:[function(t){o.BrowserSizeMode=t.BrowserSizeMode,o.Immutable=t.Immutable,o.ReactRedux=t.ReactRedux,o.appActions=t.appActions,o.classNames=t.classNames,o.css=t.css,o.getAppStore=t.getAppStore,o.hooks=t.hooks,o.i18n=t.i18n,o.injectIntl=t.injectIntl,o.polished=t.polished},function(t){i.appBuilderSync=t.appBuilderSync,i.builderAppSync=t.builderAppSync,i.getAppConfigAction=t.getAppConfigAction},function(t){n.Button=t.Button,n.defaultMessages=t.defaultMessages},function(t){l.jsx=t.jsx,l.jsxs=t.jsxs},function(t){r.ThemeSwitchComponent=t.ThemeSwitchComponent,r.getThemeModule=t.getThemeModule,r.mapping=t.mapping,r.useTheme=t.useTheme,r.useTheme2=t.useTheme2,r.useUseTheme2=t.useUseTheme2}],execute:function(){t((()=>{var t={1888:t=>{"use strict";t.exports=r},4108:t=>{"use strict";t.exports=i},14321:t=>{"use strict";t.exports=n},63655:t=>{t.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="#000" fill-rule="nonzero" d="m6.732 9.4 1.43 1.215a2.794 2.794 0 0 1-.507 4.602q-3.315 1.73-7.26-.362l-.293-.16a.2.2 0 0 1 .087-.374q2.77-.165 2.771-2.334c0-1.063.299-1.96 1.18-2.59.88-.631 1.832-.457 2.592.003m-1.945.761c-.56.472-.825 1.055-.825 1.826 0 1.22-1.19 2.713-1.987 2.713 1.3.517 3.745.799 5.212-.368.174-.139.383-.251.531-.425a1.793 1.793 0 0 0-.205-2.53l-1.43-1.214a1 1 0 0 0-1.296-.002M15.55.251c.45.355.58.988.307 1.495L11.696 9.49a1.967 1.967 0 0 1-2.958.622l-.996-.788a2.018 2.018 0 0 1-.12-3.054l6.42-5.959a1.16 1.16 0 0 1 1.509-.06m-.84.798-6.42 5.96a1.01 1.01 0 0 0 .06 1.527l.997.787a.984.984 0 0 0 1.479-.31l4.162-7.745a.18.18 0 0 0-.047-.229.18.18 0 0 0-.23.01"></path></svg>'},67386:t=>{"use strict";t.exports=l},79244:t=>{"use strict";t.exports=o}},e={};function s(o){var i=e[o];if(void 0!==i)return i.exports;var n=e[o]={exports:{}};return t[o](n,n.exports,s),n.exports}s.d=(t,e)=>{for(var o in e)s.o(e,o)&&!s.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},s.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),s.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.p="";var p={};return s.p=window.jimuConfig.baseUrl,(()=>{"use strict";s.r(p),s.d(p,{default:()=>P});var t,e,o,i,n,l=s(79244),r=s(4108),a=s(14321),S=s(67386);!function(t){t.Regular="REGULAR",t.Hover="HOVER"}(t||(t={})),function(t){t.Horizontal="Horizontal",t.Vertical="Vertical"}(e||(e={})),function(t){t.Style0="Style0",t.Style1="Style1",t.Style2="Style2",t.Style3="Style3",t.Style4="Style4",t.Style5="Style5",t.Style6="Style6",t.Style7="Style7",t.Style8="Style8",t.Style9="Style9",t.Style10="Style10"}(o||(o={})),function(t){t.None="None",t.Point0="Point0",t.Point1="Point1",t.Point2="Point2",t.Point3="Point3",t.Point4="Point4",t.Point5="Point5",t.Point6="Point6",t.Point7="Point7",t.Point8="Point8"}(i||(i={})),function(t){t.None="None",t.Default="Default",t.Style1="Style1",t.Style2="Style2",t.Style3="Style3",t.Style4="Style4",t.Style5="Style5",t.Style6="Style6",t.Style7="Style7",t.Style8="Style8",t.Style9="Style9",t.Style10="Style10",t.Style11="Style11",t.Style12="Style12",t.Style13="Style13",t.Style14="Style14",t.Style15="Style15",t.Style16="Style16",t.Style17="Style17",t.Style18="Style18",t.Style19="Style19"}(n||(n={}));const y="3px",d="6px";function c(){const t=e.Horizontal,l={Style0:y,Style1:y,Style2:y,Style3:y,Style4:y,Style5:y,Style6:y,Style7:d,Style8:d,Style9:d,Style10:"8px"};return{Default:{direction:t,template:"Default",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Default}},Style1:{direction:t,template:"Style1",strokeStyle:{type:o.Style2,color:"",size:l[o.Style2]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style1}},Style2:{direction:t,template:"Style2",strokeStyle:{type:o.Style3,color:"",size:l[o.Style3]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style2}},Style3:{direction:t,template:"Style3",strokeStyle:{type:o.Style6,color:"",size:l[o.Style6]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style3}},Style4:{direction:t,template:"Style4",strokeStyle:{type:o.Style1,color:"",size:l[o.Style1]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style4}},Style5:{direction:t,template:"Style5",strokeStyle:{type:o.Style7,color:"",size:l[o.Style7]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style5}},Style6:{direction:t,template:"Style6",strokeStyle:{type:o.Style8,color:"",size:l[o.Style8]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style6}},Style7:{direction:t,template:"Style7",strokeStyle:{type:o.Style9,color:"",size:l[o.Style9]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style7}},Style18:{direction:t,template:"Style18",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.Point7,pointSize:4},themeStyle:{quickStyleType:n.Style18}},Style19:{direction:t,template:"Style19",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point0,pointSize:2},pointEnd:{pointStyle:i.Point6,pointSize:4},themeStyle:{quickStyleType:n.Style19}},Style8:{direction:t,template:"Style8",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point3,pointSize:4},pointEnd:{pointStyle:i.Point3,pointSize:4},themeStyle:{quickStyleType:n.Style8}},Style9:{direction:t,template:"Style9",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point6,pointSize:4},pointEnd:{pointStyle:i.Point6,pointSize:4},themeStyle:{quickStyleType:n.Style9}},Style10:{direction:t,template:"Style10",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point4,pointSize:4},pointEnd:{pointStyle:i.Point4,pointSize:4},themeStyle:{quickStyleType:n.Style10}},Style11:{direction:t,template:"Style11",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point5,pointSize:4},pointEnd:{pointStyle:i.Point5,pointSize:4},themeStyle:{quickStyleType:n.Style11}},Style12:{direction:t,template:"Style12",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point2,pointSize:4},pointEnd:{pointStyle:i.Point2,pointSize:4},themeStyle:{quickStyleType:n.Style12}},Style13:{direction:t,template:"Style13",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point7,pointSize:4},pointEnd:{pointStyle:i.Point7,pointSize:4},themeStyle:{quickStyleType:n.Style13}},Style14:{direction:t,template:"Style14",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point0,pointSize:4},pointEnd:{pointStyle:i.Point0,pointSize:4},themeStyle:{quickStyleType:n.Style14}},Style15:{direction:t,template:"Style15",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point8,pointSize:4},pointEnd:{pointStyle:i.Point8,pointSize:4},themeStyle:{quickStyleType:n.Style15}},Style16:{direction:t,template:"Style16",strokeStyle:{type:o.Style10,color:"",size:l[o.Style10]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style16}},Style17:{direction:t,template:"Style17",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point1,pointSize:4},pointEnd:{pointStyle:i.Point1,pointSize:4},themeStyle:{quickStyleType:n.Style17}}}}var u=s(1888);function h(t,e=1.5,o=null){if(!t)return"0px";const i=o?Number(o.split("px")[0]):0;let n=Number(t.split("px")[0]);return n=i>n?i:n,n*e<1?"1px":`${Math.round(n*e)}px`}const $=(t,o)=>{const{direction:i}=t,{size:n,type:r}=t.strokeStyle;return function(t,o,i=e.Horizontal,n=!1){const r=i===e.Horizontal,s={},p={};return o=o||"transparent",s.Style0=l.css`
    & {
      border-bottom: ${t} solid ${o};
    }
  `,s.Style1=l.css`
    & {
      border-bottom: ${t} dashed ${o};
    }
  `,s.Style2=l.css`
    & {
      border-bottom: ${t} dotted ${o};
    }
  `,s.Style3=l.css`
    & {
      height: ${t};
      position: relative;
    }
    &:before {
      position: absolute;
      content: '';
      height: ${t};
      left: ${h(t,4)};
      right: 0;
      background-image: repeating-linear-gradient(
        to right,
        ${o} 0,
        ${o} ${h(t,1)},
        transparent 0,
        transparent ${h(t,6)}
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
        ${o} ${h(t,3)},
        transparent 0,
        transparent ${h(t,6)}
      );
    }
  `,s.Style6=l.css`
    & {
      height: ${t};
      background-image: repeating-linear-gradient(
        to right,
        ${o} 0,
        ${o} ${h(t,4)},
        transparent 0,
        transparent ${h(t,6)}
      );
    }
  `,s.Style7=l.css`
    & {
      border-color: ${o};
      border-bottom-style: double;
      border-bottom-width: ${n?"4px":t};
    }
  `,s.Style8=l.css`
    & {
      height: ${t};
      min-height: ${n?"6px":"unset"};
      position: relative;
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: ${h(t,.2,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${h(t,.4,"4px")};
      background: ${o};
    }
  `,s.Style9=l.css`
    & {
      height: ${t};
      min-height: ${n?"6px":"unset"};
      position: relative;
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: ${h(t,.4,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${h(t,.2,"4px")};
      background: ${o};
    }
  `,s.Style10=l.css`
    & {
      height: ${t};
      min-height: ${n?"8px":"unset"};
      position: relative;
      background-clip: content-box;
      border-top: ${h(t,.167)} solid ${o};
      border-bottom: ${h(t,.167)} solid ${o};
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: ${n?"2px":h(t,.3)};
      background: ${o};
      transform: translateY(-50%);
    }
  `,p.Style0=l.css`
    & {
      border-left: ${t} solid ${o};
    }
  `,p.Style1=l.css`
    & {
      border-left: ${t} dashed ${o};
    }
  `,p.Style2=l.css`
    & {
      border-left: ${t} dotted ${o};
    }
  `,p.Style3=l.css`
    & {
      width: ${t};
      position: relative;
    }
    &:before {
      position: absolute;
      content: '';
      width: ${t};
      top: ${h(t,3.8)};
      bottom: 0;
      background-image: repeating-linear-gradient(
        to bottom,
        ${o} 0,
        ${o} ${h(t,1)},
        transparent 0,
        transparent ${h(t,6)}
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
        ${o} ${h(t,2.5)},
        transparent 0,
        transparent ${h(t,6)}
      );
    }
  `,p.Style6=l.css`
    & {
      width: ${t};
      background-image: repeating-linear-gradient(
        to bottom,
        ${o} 0,
        ${o} ${h(t,4)},
        transparent 0,
        transparent ${h(t,6)}
      );
    }
  `,p.Style7=l.css`
    & {
      border-left: ${t} double ${o};
    }
  `,p.Style8=l.css`
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
      width: ${h(t,.2,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: ${h(t,.4,"4px")};
      background: ${o};
    }
  `,p.Style9=l.css`
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
      width: ${h(t,.4,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: ${h(t,.2,"4px")};
      background: ${o};
    }
  `,p.Style10=l.css`
    & {
      width: ${t};
      position: relative;
      background-clip: content-box;
      border-left: ${h(t,.167)} solid ${o};
      border-right: ${h(t,.167)} solid ${o};
    }
    &:before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: ${n?"2px":h(t,.3)};
      background: ${o};
      transform: translateX(-50%);
    }
  `,r?s:p}(n,m(t,o),i)[r]};function m(t,e){const o=(0,u.getThemeModule)(null==e?void 0:e.uri),i=u.mapping.whetherIsNewTheme(o),{strokeStyle:n}=t,l=function(t){const e={dark:{Default:"#C6C6C6",Style1:"#FF8A7B",Style2:"#E99A29",Style3:"#C6C6C6",Style4:"#C6C6C6",Style5:"#5EB2F1",Style6:"#6FBC76",Style7:"#C6C6C6",Style18:"#C6C6C6",Style19:"#5EB2F1",Style8:"#C6C6C6",Style9:"#E99A29",Style10:"#FF8A7B",Style11:"#C6C6C6",Style12:"#C6C6C6",Style13:"#6FBC76",Style14:"#5EB2F1",Style15:"#C6C6C6",Style16:"#C6C6C6",Style17:"#FF8A7B"},light:{Default:"#303030",Style1:"#B4271F",Style2:"#865300",Style3:"#303030",Style4:"#303030",Style5:"#006496",Style6:"#00531D",Style7:"#303030",Style18:"#303030",Style19:"#006496",Style8:"#303030",Style9:"#865300",Style10:"#B4271F",Style11:"#303030",Style12:"#303030",Style13:"#00531D",Style14:"#006496",Style15:"#303030",Style16:"#303030",Style17:"#B4271F"}};return"dark"===t?e.dark:e.light}(e.sys.color.mode),r=i?l.Default:"",s=(null==t?void 0:t.template)?l[t.template]:r;return(null==n?void 0:n.color)||s}const g=t=>{const{direction:o,pointEnd:n,pointStart:r,strokeStyle:s}=t,p=o===e.Horizontal,a=r.pointStyle,S=r.pointSize*f(null==s?void 0:s.size),y=n.pointStyle,d=n.pointSize*f(null==s?void 0:s.size);return function(t,e,o,i,n){const r=e?i/2+"px":0,s=e?i/2.5+"px":0,p=o?n/2+"px":0,a=o?n/2.5+"px":0,S=l.css`
    left: ${r};
    right: ${p};
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
      right: ${a};
    }
  `,y=l.css`
    top: ${r};
    bottom: ${p};
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
  `;return t?S:y}(p,a!==i.None,y!==i.None,S,d)},b=(t,o,i=!0)=>{const{pointEnd:n,pointStart:r,strokeStyle:s,direction:p}=t,a=Number(f(s.size)),S=(i?r.pointSize*a:n.pointSize*a)+"px",y=m(t,o),d=i?r.pointStyle:n.pointStyle,c=function(t,o,i=e.Horizontal,n=!0){const r=h(t,1),s=h(t,.5),p=h(t,.1),a=h(t,.3);o=o||"transparent";const S=i===e.Horizontal;let y={None:"None"},d={None:"None"};y.Point0=l.css`
    & {
      width: ${r};
      height: ${r};
      border-radius: 50%;
      background-color: ${o};
      left: ${n?0:"unset"};
      right: ${n?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,y.Point1=l.css`
    & {
      width: ${a};
      height: ${r};
      background-color: ${o};
      left: ${n?"4%":"unset"};
      right: ${n?"unset":"4%"};
      top: 50%;
      transform: translateY(-50%);
    }
  `,y.Point2=l.css`
    & {
      width: ${a};
      height: ${r};
      background-color: ${o};
      left: ${n?0:"unset"};
      right: ${n?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,y.Point3=l.css`
    & {
      width: ${r};
      height: ${r};
      background-color: ${o};
      left: ${n?0:"unset"};
      right: ${n?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,y.Point4=l.css`
    & {
      width: ${h(t,.71)};
      height: ${h(t,.71)};
      background-color: ${o};
      left: ${n?h(t,.2):"unset"};
      right: ${n?"unset":h(t,.2)};
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }
  `;const c=l.css`
    .jimu-rtl & {
      border-color: transparent ${o} transparent transparent;
    }
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: transparent transparent transparent ${o};
      left: ${n?0:"unset"};
      right: ${n?"unset":`-${h(t,.5)}`};
      top: 50%;
      transform: translateY(-50%);
    }
  `,u=l.css`
    .jimu-rtl & {
      border-color: transparent transparent transparent ${o};
    }
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: transparent ${o} transparent transparent;
      left: ${n?`-${h(t,.5)}`:"unset"};
      right: ${n?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,$=l.css`
    .jimu-rtl & {
      border-top: ${a} solid ${o};
      border-left: ${a} solid ${o};
    }
    .jimu-ltr & {
      border-bottom: ${a} solid ${o};
      border-left: ${a} solid ${o};
    }
    & {
      width: ${h(t,.8)};
      height: ${h(t,.8)};
      left: ${n?h(t,.2):"unset"};
      right: ${n?"unset":`-${h(t,.2)}`};
      top: 50%;
      border-radius: ${p};
      transform: translateY(-50%) rotate(45deg);
    }
  `,m=l.css`
    .jimu-rtl & {
      border-right: ${a} solid ${o};
      border-bottom: ${a} solid ${o};
    }
    .jimu-ltr & {
      border-top: ${a} solid ${o};
      border-right: ${a} solid ${o};
    }
    & {
      width: ${h(t,.8)};
      height: ${h(t,.8)};
      left: ${n?`-${h(t,.2)}`:"unset"};
      right: ${n?"unset":h(t,.2)};
      top: 50%;
      border-radius: ${p};
      transform: translateY(-50%) rotate(45deg);
    }
  `;d.Point0=l.css`
    & {
      width: ${r};
      height: ${r};
      border-radius: 50%;
      background-color: ${o};
      top: ${n?0:"unset"};
      bottom: ${n?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,d.Point1=l.css`
    & {
      width: ${r};
      height: ${a};
      background-color: ${o};
      top: ${n?"4%":"unset"};
      bottom: ${n?"unset":"4%"};
      left: 50%;
      transform: translateX(-50%);
    }
  `,d.Point2=l.css`
    & {
      width: ${r};
      height: ${a};
      background-color: ${o};
      top: ${n?0:"unset"};
      bottom: ${n?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,d.Point3=l.css`
    & {
      width: ${r};
      height: ${r};
      background-color: ${o};
      top: ${n?0:"unset"};
      bottom: ${n?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,d.Point4=l.css`
    & {
      width: ${h(t,.71)};
      height: ${h(t,.71)};
      background-color: ${o};
      top: ${n?h(t,.2):"unset"};
      bottom: ${n?"unset":h(t,.2)};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
    }
  `;const g=l.css`
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: transparent transparent ${o} transparent;
      top: ${n?`-${h(t,.5)}`:"unset"};
      bottom: ${n?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,b=l.css`
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: ${o} transparent transparent transparent;
      top: ${n?0:"unset"};
      bottom: ${n?"unset":`-${h(t,.5)}`};
      left: 50%;
      transform: translateX(-50%);
    }
  `,f=l.css`
    .jimu-rtl & {
      border-bottom: ${a} solid ${o};
      border-left: ${a} solid ${o};
    }
    .jimu-ltr & {
      border-bottom: ${a} solid ${o};
      border-right: ${a} solid ${o};
    }
    & {
      width: ${h(t,.8)};
      height: ${h(t,.8)};
      top: ${n?`-${h(t,.2)}`:"unset"};
      bottom: ${n?"unset":h(t,.2)};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-radius: ${p};
    }
  `,k=l.css`
    .jimu-rtl & {
      border-top: ${a} solid ${o};
      border-right: ${a} solid ${o};
    }
    .jimu-ltr & {
      border-top: ${a} solid ${o};
      border-left: ${a} solid ${o};
    }
    & {
      width: ${h(t,.8)};
      height: ${h(t,.8)};
      top: ${n?h(t,.2):"unset"};
      bottom: ${n?"unset":`-${h(t,.2)}`};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-radius: ${p};
    }
  `;let P,z;return n?(P={Point5:c,Point6:u,Point7:$,Point8:m},z={Point5:b,Point6:g,Point7:k,Point8:f}):(P={Point5:u,Point6:c,Point7:m,Point8:$},z={Point5:g,Point6:b,Point7:f,Point8:k}),y=Object.assign(Object.assign({},y),P),d=Object.assign(Object.assign({},d),z),S?y:d}(S,y,p,i);return c[d]},f=t=>{const e=t.split("px")[0];return Number(e)},k=(0,l.injectIntl)(t=>{const{widgetId:o}=t,n=l.ReactRedux.useSelector(t=>{var e,i,n;const l=(null===(e=null==t?void 0:t.appStateInBuilder)||void 0===e?void 0:e.appConfig)||t.appConfig;return null===(n=null===(i=null==l?void 0:l.widgets)||void 0===i?void 0:i[o])||void 0===n?void 0:n.config}),s=l.hooks.useTranslation(a.defaultMessages),p=(0,u.useTheme)(),y=(0,u.useTheme2)(),d=(0,u.useUseTheme2)(),h=window.jimuConfig.isBuilder!==d?y:p,m=window.jimuConfig.isBuilder!==d?p:y,f=t=>{const e=["solidLine","dottedLine","dashedDotLine","dashedLine","dottedDashLine","doubleThinLine","lowerEmphasizedDoubleLine","upperEmphasizedDoubleLine","arrowEndLine","thinArrowLine","blockEndLine","doubleArrowLine","diamondEndLine","triangleEndLine","bracketEndLine","reverseDoubleArrowLine","circleEndLine","crossEndLine","tripleThinLine","thickCrossEndLine"][t];return e?s(e):""},k=l.hooks.useEventCallback(t=>{t.direction=n.direction||e.Horizontal,(0,r.getAppConfigAction)().editWidgetConfig(o,(0,l.Immutable)(t)).exec()});return(0,S.jsx)("div",{children:(0,S.jsx)("div",{css:l.css`
      width: ${l.polished.rem(360)};
      padding: 16px 12px 8px 12px;
      z-index: 1001 !important;
      button {
        border-radius: 0;
      }
      .quick-style-item-container {
        padding-left: 4px;
        padding-right: 4px;
        padding-bottom: 8px;
      }
      .quick-style-item {
        border: 2px solid transparent;
        &.quick-style-item-selected {
          border: 2px solid ${m.sys.color.primary.light};
        }
        .quick-style-item-inner {
          background-color: ${"dark"===h.sys.color.mode?"#1B1B1B":"#F1F1F1"};
          cursor: pointer;
        }
      }
    `,children:(0,S.jsx)("div",{className:"row no-gutters",children:(0,S.jsx)(u.ThemeSwitchComponent,{useTheme2:!1,children:(()=>{var t;const e=null===(t=null==n?void 0:n.themeStyle)||void 0===t?void 0:t.quickStyleType,o=[],r=c();let s=-1;for(const t in r){s+=1;const n=r[t],{pointStart:p,pointEnd:y,themeStyle:d}=n,c=$(n,h),u=g(n),m=b(n,h,!0),P=b(n,h,!1),z=(0,l.classNames)("divider-line","position-absolute",`point-start-${p.pointStyle}`,`point-end-${y.pointStyle}`),w=(0,S.jsx)("div",{className:"col-6 quick-style-item-container",children:(0,S.jsx)("div",{className:(0,l.classNames)("quick-style-item",{"quick-style-item-selected":e===d.quickStyleType}),children:(0,S.jsx)(a.Button,{className:"quick-style-item-inner p-2 w-100",onClick:()=>{k(n)},disableHoverEffect:!0,disableRipple:!0,type:"tertiary",title:f(s),"aria-label":f(s),children:(0,S.jsxs)("div",{className:"quick-style-item-inner w-100 p-2 position-relative",children:[p.pointStyle!==i.None&&(0,S.jsx)("span",{className:"point-start position-absolute",css:m}),(0,S.jsx)("div",{className:z,css:[c,u]}),y.pointStyle!==i.None&&(0,S.jsx)("span",{className:"point-end position-absolute",css:P})]})})})},t);o.push(w)}return o})()})})})})});class P{constructor(){this.index=2,this.id="button-quick-style",this.openWhenAdded=!0}visible(t){return!0}getAppState(){const t=(0,l.getAppStore)().getState();return t.appStateInBuilder?t.appStateInBuilder:t}getGroupId(){return null}getTitle(){const t=l.i18n.getIntl("_jimu");return t?t.formatMessage({id:"quickStyle",defaultMessage:a.defaultMessages.quickStyle}):"Quick style"}getIcon(){return s(63655)}checked(){if(this.getAppState().browserSizeMode===l.BrowserSizeMode.Small)return this.isOpenInSidePanel}widgetToolbarStateChange(t){window.jimuConfig.isBuilder?r.builderAppSync.publishWidgetToolbarStateChangeToApp(t,["button-quick-style"]):(0,l.getAppStore)().dispatch(l.appActions.widgetToolbarStateChange(t,["button-quick-style"]))}onClick(t){const e=t.layoutItem.widgetId;if(this.getAppState().browserSizeMode===l.BrowserSizeMode.Small){this.isOpenInSidePanel=!this.isOpenInSidePanel;const t=()=>{this.isOpenInSidePanel=!1,this.widgetToolbarStateChange(e)};r.appBuilderSync.publishSidePanelToApp({type:"dividerQuickStyle",widgetId:e,uri:"widgets/common/divider/",onClose:t,active:this.isOpenInSidePanel})}}getSettingPanel(t){return this.getAppState().browserSizeMode===l.BrowserSizeMode.Small?null:k}}})(),p})())}}});