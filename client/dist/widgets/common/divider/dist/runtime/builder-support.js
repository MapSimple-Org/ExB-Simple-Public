System.register(["jimu-core/emotion","jimu-core","jimu-ui","jimu-theme","jimu-for-builder"],function(t,e){var o={},i={},n={},l={},r={};return{setters:[function(t){o.jsx=t.jsx,o.jsxs=t.jsxs},function(t){i.Immutable=t.Immutable,i.ReactRedux=t.ReactRedux,i.classNames=t.classNames,i.css=t.css,i.hooks=t.hooks,i.injectIntl=t.injectIntl,i.polished=t.polished},function(t){n.Button=t.Button,n.defaultMessages=t.defaultMessages},function(t){l.ThemeSwitchComponent=t.ThemeSwitchComponent,l.getThemeModule=t.getThemeModule,l.mapping=t.mapping,l.useTheme=t.useTheme,l.useTheme2=t.useTheme2,l.useUseTheme2=t.useUseTheme2},function(t){r.appBuilderSync=t.appBuilderSync,r.getAppConfigAction=t.getAppConfigAction}],execute:function(){t((()=>{var t={1888:t=>{"use strict";t.exports=l},4108:t=>{"use strict";t.exports=r},14321:t=>{"use strict";t.exports=n},67386:t=>{"use strict";t.exports=o},79244:t=>{"use strict";t.exports=i}},e={};function s(o){var i=e[o];if(void 0!==i)return i.exports;var n=e[o]={exports:{}};return t[o](n,n.exports,s),n.exports}s.d=(t,e)=>{for(var o in e)s.o(e,o)&&!s.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},s.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),s.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.p="";var p={};return s.p=window.jimuConfig.baseUrl,(()=>{"use strict";s.r(p),s.d(p,{default:()=>P});var t,e,o,i,n,l=s(67386),r=s(79244);!function(t){t.Regular="REGULAR",t.Hover="HOVER"}(t||(t={})),function(t){t.Horizontal="Horizontal",t.Vertical="Vertical"}(e||(e={})),function(t){t.Style0="Style0",t.Style1="Style1",t.Style2="Style2",t.Style3="Style3",t.Style4="Style4",t.Style5="Style5",t.Style6="Style6",t.Style7="Style7",t.Style8="Style8",t.Style9="Style9",t.Style10="Style10"}(o||(o={})),function(t){t.None="None",t.Point0="Point0",t.Point1="Point1",t.Point2="Point2",t.Point3="Point3",t.Point4="Point4",t.Point5="Point5",t.Point6="Point6",t.Point7="Point7",t.Point8="Point8"}(i||(i={})),function(t){t.None="None",t.Default="Default",t.Style1="Style1",t.Style2="Style2",t.Style3="Style3",t.Style4="Style4",t.Style5="Style5",t.Style6="Style6",t.Style7="Style7",t.Style8="Style8",t.Style9="Style9",t.Style10="Style10",t.Style11="Style11",t.Style12="Style12",t.Style13="Style13",t.Style14="Style14",t.Style15="Style15",t.Style16="Style16",t.Style17="Style17",t.Style18="Style18",t.Style19="Style19"}(n||(n={}));const S="3px",y="6px";function a(){const t=e.Horizontal,l={Style0:S,Style1:S,Style2:S,Style3:S,Style4:S,Style5:S,Style6:S,Style7:y,Style8:y,Style9:y,Style10:"8px"};return{Default:{direction:t,template:"Default",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Default}},Style1:{direction:t,template:"Style1",strokeStyle:{type:o.Style2,color:"",size:l[o.Style2]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style1}},Style2:{direction:t,template:"Style2",strokeStyle:{type:o.Style3,color:"",size:l[o.Style3]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style2}},Style3:{direction:t,template:"Style3",strokeStyle:{type:o.Style6,color:"",size:l[o.Style6]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style3}},Style4:{direction:t,template:"Style4",strokeStyle:{type:o.Style1,color:"",size:l[o.Style1]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style4}},Style5:{direction:t,template:"Style5",strokeStyle:{type:o.Style7,color:"",size:l[o.Style7]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style5}},Style6:{direction:t,template:"Style6",strokeStyle:{type:o.Style8,color:"",size:l[o.Style8]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style6}},Style7:{direction:t,template:"Style7",strokeStyle:{type:o.Style9,color:"",size:l[o.Style9]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style7}},Style18:{direction:t,template:"Style18",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.Point7,pointSize:4},themeStyle:{quickStyleType:n.Style18}},Style19:{direction:t,template:"Style19",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point0,pointSize:2},pointEnd:{pointStyle:i.Point6,pointSize:4},themeStyle:{quickStyleType:n.Style19}},Style8:{direction:t,template:"Style8",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point3,pointSize:4},pointEnd:{pointStyle:i.Point3,pointSize:4},themeStyle:{quickStyleType:n.Style8}},Style9:{direction:t,template:"Style9",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point6,pointSize:4},pointEnd:{pointStyle:i.Point6,pointSize:4},themeStyle:{quickStyleType:n.Style9}},Style10:{direction:t,template:"Style10",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point4,pointSize:4},pointEnd:{pointStyle:i.Point4,pointSize:4},themeStyle:{quickStyleType:n.Style10}},Style11:{direction:t,template:"Style11",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point5,pointSize:4},pointEnd:{pointStyle:i.Point5,pointSize:4},themeStyle:{quickStyleType:n.Style11}},Style12:{direction:t,template:"Style12",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point2,pointSize:4},pointEnd:{pointStyle:i.Point2,pointSize:4},themeStyle:{quickStyleType:n.Style12}},Style13:{direction:t,template:"Style13",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point7,pointSize:4},pointEnd:{pointStyle:i.Point7,pointSize:4},themeStyle:{quickStyleType:n.Style13}},Style14:{direction:t,template:"Style14",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point0,pointSize:4},pointEnd:{pointStyle:i.Point0,pointSize:4},themeStyle:{quickStyleType:n.Style14}},Style15:{direction:t,template:"Style15",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point8,pointSize:4},pointEnd:{pointStyle:i.Point8,pointSize:4},themeStyle:{quickStyleType:n.Style15}},Style16:{direction:t,template:"Style16",strokeStyle:{type:o.Style10,color:"",size:l[o.Style10]},pointStart:{pointStyle:i.None,pointSize:4},pointEnd:{pointStyle:i.None,pointSize:4},themeStyle:{quickStyleType:n.Style16}},Style17:{direction:t,template:"Style17",strokeStyle:{type:o.Style0,color:"",size:l[o.Style0]},pointStart:{pointStyle:i.Point1,pointSize:4},pointEnd:{pointStyle:i.Point1,pointSize:4},themeStyle:{quickStyleType:n.Style17}}}}var d=s(14321),c=s(1888);function u(t,e=1.5,o=null){if(!t)return"0px";const i=o?Number(o.split("px")[0]):0;let n=Number(t.split("px")[0]);return n=i>n?i:n,n*e<1?"1px":`${Math.round(n*e)}px`}const $=(t,o)=>{const{direction:i}=t,{size:n,type:l}=t.strokeStyle;return function(t,o,i=e.Horizontal,n=!1){const l=i===e.Horizontal,s={},p={};return o=o||"transparent",s.Style0=r.css`
    & {
      border-bottom: ${t} solid ${o};
    }
  `,s.Style1=r.css`
    & {
      border-bottom: ${t} dashed ${o};
    }
  `,s.Style2=r.css`
    & {
      border-bottom: ${t} dotted ${o};
    }
  `,s.Style3=r.css`
    & {
      height: ${t};
      position: relative;
    }
    &:before {
      position: absolute;
      content: '';
      height: ${t};
      left: ${u(t,4)};
      right: 0;
      background-image: repeating-linear-gradient(
        to right,
        ${o} 0,
        ${o} ${u(t,1)},
        transparent 0,
        transparent ${u(t,6)}
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
        ${o} ${u(t,3)},
        transparent 0,
        transparent ${u(t,6)}
      );
    }
  `,s.Style6=r.css`
    & {
      height: ${t};
      background-image: repeating-linear-gradient(
        to right,
        ${o} 0,
        ${o} ${u(t,4)},
        transparent 0,
        transparent ${u(t,6)}
      );
    }
  `,s.Style7=r.css`
    & {
      border-color: ${o};
      border-bottom-style: double;
      border-bottom-width: ${n?"4px":t};
    }
  `,s.Style8=r.css`
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
      height: ${u(t,.2,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${u(t,.4,"4px")};
      background: ${o};
    }
  `,s.Style9=r.css`
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
      height: ${u(t,.4,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${u(t,.2,"4px")};
      background: ${o};
    }
  `,s.Style10=r.css`
    & {
      height: ${t};
      min-height: ${n?"8px":"unset"};
      position: relative;
      background-clip: content-box;
      border-top: ${u(t,.167)} solid ${o};
      border-bottom: ${u(t,.167)} solid ${o};
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: ${n?"2px":u(t,.3)};
      background: ${o};
      transform: translateY(-50%);
    }
  `,p.Style0=r.css`
    & {
      border-left: ${t} solid ${o};
    }
  `,p.Style1=r.css`
    & {
      border-left: ${t} dashed ${o};
    }
  `,p.Style2=r.css`
    & {
      border-left: ${t} dotted ${o};
    }
  `,p.Style3=r.css`
    & {
      width: ${t};
      position: relative;
    }
    &:before {
      position: absolute;
      content: '';
      width: ${t};
      top: ${u(t,3.8)};
      bottom: 0;
      background-image: repeating-linear-gradient(
        to bottom,
        ${o} 0,
        ${o} ${u(t,1)},
        transparent 0,
        transparent ${u(t,6)}
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
        ${o} ${u(t,2.5)},
        transparent 0,
        transparent ${u(t,6)}
      );
    }
  `,p.Style6=r.css`
    & {
      width: ${t};
      background-image: repeating-linear-gradient(
        to bottom,
        ${o} 0,
        ${o} ${u(t,4)},
        transparent 0,
        transparent ${u(t,6)}
      );
    }
  `,p.Style7=r.css`
    & {
      border-left: ${t} double ${o};
    }
  `,p.Style8=r.css`
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
      width: ${u(t,.2,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: ${u(t,.4,"4px")};
      background: ${o};
    }
  `,p.Style9=r.css`
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
      width: ${u(t,.4,"4px")};
      background: ${o};
    }
    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: ${u(t,.2,"4px")};
      background: ${o};
    }
  `,p.Style10=r.css`
    & {
      width: ${t};
      position: relative;
      background-clip: content-box;
      border-left: ${u(t,.167)} solid ${o};
      border-right: ${u(t,.167)} solid ${o};
    }
    &:before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: ${n?"2px":u(t,.3)};
      background: ${o};
      transform: translateX(-50%);
    }
  `,l?s:p}(n,h(t,o),i)[l]};function h(t,e){const o=(0,c.getThemeModule)(null==e?void 0:e.uri),i=c.mapping.whetherIsNewTheme(o),{strokeStyle:n}=t,l=function(t){const e={dark:{Default:"#C6C6C6",Style1:"#FF8A7B",Style2:"#E99A29",Style3:"#C6C6C6",Style4:"#C6C6C6",Style5:"#5EB2F1",Style6:"#6FBC76",Style7:"#C6C6C6",Style18:"#C6C6C6",Style19:"#5EB2F1",Style8:"#C6C6C6",Style9:"#E99A29",Style10:"#FF8A7B",Style11:"#C6C6C6",Style12:"#C6C6C6",Style13:"#6FBC76",Style14:"#5EB2F1",Style15:"#C6C6C6",Style16:"#C6C6C6",Style17:"#FF8A7B"},light:{Default:"#303030",Style1:"#B4271F",Style2:"#865300",Style3:"#303030",Style4:"#303030",Style5:"#006496",Style6:"#00531D",Style7:"#303030",Style18:"#303030",Style19:"#006496",Style8:"#303030",Style9:"#865300",Style10:"#B4271F",Style11:"#303030",Style12:"#303030",Style13:"#00531D",Style14:"#006496",Style15:"#303030",Style16:"#303030",Style17:"#B4271F"}};return"dark"===t?e.dark:e.light}(e.sys.color.mode),r=i?l.Default:"",s=(null==t?void 0:t.template)?l[t.template]:r;return(null==n?void 0:n.color)||s}const m=t=>{const{direction:o,pointEnd:n,pointStart:l,strokeStyle:s}=t,p=o===e.Horizontal,S=l.pointStyle,y=l.pointSize*g(null==s?void 0:s.size),a=n.pointStyle,d=n.pointSize*g(null==s?void 0:s.size);return function(t,e,o,i,n){const l=e?i/2+"px":0,s=e?i/2.5+"px":0,p=o?n/2+"px":0,S=o?n/2.5+"px":0,y=r.css`
    left: ${l};
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
      right: ${S};
    }
  `,a=r.css`
    top: ${l};
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
  `;return t?y:a}(p,S!==i.None,a!==i.None,y,d)},b=(t,o,i=!0)=>{const{pointEnd:n,pointStart:l,strokeStyle:s,direction:p}=t,S=Number(g(s.size)),y=(i?l.pointSize*S:n.pointSize*S)+"px",a=h(t,o),d=i?l.pointStyle:n.pointStyle,c=function(t,o,i=e.Horizontal,n=!0){const l=u(t,1),s=u(t,.5),p=u(t,.1),S=u(t,.3);o=o||"transparent";const y=i===e.Horizontal;let a={None:"None"},d={None:"None"};a.Point0=r.css`
    & {
      width: ${l};
      height: ${l};
      border-radius: 50%;
      background-color: ${o};
      left: ${n?0:"unset"};
      right: ${n?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,a.Point1=r.css`
    & {
      width: ${S};
      height: ${l};
      background-color: ${o};
      left: ${n?"4%":"unset"};
      right: ${n?"unset":"4%"};
      top: 50%;
      transform: translateY(-50%);
    }
  `,a.Point2=r.css`
    & {
      width: ${S};
      height: ${l};
      background-color: ${o};
      left: ${n?0:"unset"};
      right: ${n?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,a.Point3=r.css`
    & {
      width: ${l};
      height: ${l};
      background-color: ${o};
      left: ${n?0:"unset"};
      right: ${n?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,a.Point4=r.css`
    & {
      width: ${u(t,.71)};
      height: ${u(t,.71)};
      background-color: ${o};
      left: ${n?u(t,.2):"unset"};
      right: ${n?"unset":u(t,.2)};
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }
  `;const c=r.css`
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
      right: ${n?"unset":`-${u(t,.5)}`};
      top: 50%;
      transform: translateY(-50%);
    }
  `,$=r.css`
    .jimu-rtl & {
      border-color: transparent transparent transparent ${o};
    }
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: transparent ${o} transparent transparent;
      left: ${n?`-${u(t,.5)}`:"unset"};
      right: ${n?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,h=r.css`
    .jimu-rtl & {
      border-top: ${S} solid ${o};
      border-left: ${S} solid ${o};
    }
    .jimu-ltr & {
      border-bottom: ${S} solid ${o};
      border-left: ${S} solid ${o};
    }
    & {
      width: ${u(t,.8)};
      height: ${u(t,.8)};
      left: ${n?u(t,.2):"unset"};
      right: ${n?"unset":`-${u(t,.2)}`};
      top: 50%;
      border-radius: ${p};
      transform: translateY(-50%) rotate(45deg);
    }
  `,m=r.css`
    .jimu-rtl & {
      border-right: ${S} solid ${o};
      border-bottom: ${S} solid ${o};
    }
    .jimu-ltr & {
      border-top: ${S} solid ${o};
      border-right: ${S} solid ${o};
    }
    & {
      width: ${u(t,.8)};
      height: ${u(t,.8)};
      left: ${n?`-${u(t,.2)}`:"unset"};
      right: ${n?"unset":u(t,.2)};
      top: 50%;
      border-radius: ${p};
      transform: translateY(-50%) rotate(45deg);
    }
  `;d.Point0=r.css`
    & {
      width: ${l};
      height: ${l};
      border-radius: 50%;
      background-color: ${o};
      top: ${n?0:"unset"};
      bottom: ${n?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,d.Point1=r.css`
    & {
      width: ${l};
      height: ${S};
      background-color: ${o};
      top: ${n?"4%":"unset"};
      bottom: ${n?"unset":"4%"};
      left: 50%;
      transform: translateX(-50%);
    }
  `,d.Point2=r.css`
    & {
      width: ${l};
      height: ${S};
      background-color: ${o};
      top: ${n?0:"unset"};
      bottom: ${n?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,d.Point3=r.css`
    & {
      width: ${l};
      height: ${l};
      background-color: ${o};
      top: ${n?0:"unset"};
      bottom: ${n?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,d.Point4=r.css`
    & {
      width: ${u(t,.71)};
      height: ${u(t,.71)};
      background-color: ${o};
      top: ${n?u(t,.2):"unset"};
      bottom: ${n?"unset":u(t,.2)};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
    }
  `;const b=r.css`
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: transparent transparent ${o} transparent;
      top: ${n?`-${u(t,.5)}`:"unset"};
      bottom: ${n?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,g=r.css`
    & {
      width: 0;
      height: 0;
      border-width: ${s};
      border-style: solid;
      border-color: ${o} transparent transparent transparent;
      top: ${n?0:"unset"};
      bottom: ${n?"unset":`-${u(t,.5)}`};
      left: 50%;
      transform: translateX(-50%);
    }
  `,f=r.css`
    .jimu-rtl & {
      border-bottom: ${S} solid ${o};
      border-left: ${S} solid ${o};
    }
    .jimu-ltr & {
      border-bottom: ${S} solid ${o};
      border-right: ${S} solid ${o};
    }
    & {
      width: ${u(t,.8)};
      height: ${u(t,.8)};
      top: ${n?`-${u(t,.2)}`:"unset"};
      bottom: ${n?"unset":u(t,.2)};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-radius: ${p};
    }
  `,k=r.css`
    .jimu-rtl & {
      border-top: ${S} solid ${o};
      border-right: ${S} solid ${o};
    }
    .jimu-ltr & {
      border-top: ${S} solid ${o};
      border-left: ${S} solid ${o};
    }
    & {
      width: ${u(t,.8)};
      height: ${u(t,.8)};
      top: ${n?u(t,.2):"unset"};
      bottom: ${n?"unset":`-${u(t,.2)}`};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-radius: ${p};
    }
  `;let P,z;return n?(P={Point5:c,Point6:$,Point7:h,Point8:m},z={Point5:g,Point6:b,Point7:k,Point8:f}):(P={Point5:$,Point6:c,Point7:m,Point8:h},z={Point5:b,Point6:g,Point7:f,Point8:k}),a=Object.assign(Object.assign({},a),P),d=Object.assign(Object.assign({},d),z),y?a:d}(y,a,p,i);return c[d]},g=t=>{const e=t.split("px")[0];return Number(e)};var f=s(4108);const k=(0,r.injectIntl)(t=>{const{widgetId:o}=t,n=r.ReactRedux.useSelector(t=>{var e,i,n;const l=(null===(e=null==t?void 0:t.appStateInBuilder)||void 0===e?void 0:e.appConfig)||t.appConfig;return null===(n=null===(i=null==l?void 0:l.widgets)||void 0===i?void 0:i[o])||void 0===n?void 0:n.config}),s=r.hooks.useTranslation(d.defaultMessages),p=(0,c.useTheme)(),S=(0,c.useTheme2)(),y=(0,c.useUseTheme2)(),u=window.jimuConfig.isBuilder!==y?S:p,h=window.jimuConfig.isBuilder!==y?p:S,g=t=>{const e=["solidLine","dottedLine","dashedDotLine","dashedLine","dottedDashLine","doubleThinLine","lowerEmphasizedDoubleLine","upperEmphasizedDoubleLine","arrowEndLine","thinArrowLine","blockEndLine","doubleArrowLine","diamondEndLine","triangleEndLine","bracketEndLine","reverseDoubleArrowLine","circleEndLine","crossEndLine","tripleThinLine","thickCrossEndLine"][t];return e?s(e):""},k=r.hooks.useEventCallback(t=>{t.direction=n.direction||e.Horizontal,(0,f.getAppConfigAction)().editWidgetConfig(o,(0,r.Immutable)(t)).exec()});return(0,l.jsx)("div",{children:(0,l.jsx)("div",{css:r.css`
      width: ${r.polished.rem(360)};
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
          border: 2px solid ${h.sys.color.primary.light};
        }
        .quick-style-item-inner {
          background-color: ${"dark"===u.sys.color.mode?"#1B1B1B":"#F1F1F1"};
          cursor: pointer;
        }
      }
    `,children:(0,l.jsx)("div",{className:"row no-gutters",children:(0,l.jsx)(c.ThemeSwitchComponent,{useTheme2:!1,children:(()=>{var t;const e=null===(t=null==n?void 0:n.themeStyle)||void 0===t?void 0:t.quickStyleType,o=[],s=a();let p=-1;for(const t in s){p+=1;const n=s[t],{pointStart:S,pointEnd:y,themeStyle:a}=n,c=$(n,u),h=m(n),f=b(n,u,!0),P=b(n,u,!1),z=(0,r.classNames)("divider-line","position-absolute",`point-start-${S.pointStyle}`,`point-end-${y.pointStyle}`),x=(0,l.jsx)("div",{className:"col-6 quick-style-item-container",children:(0,l.jsx)("div",{className:(0,r.classNames)("quick-style-item",{"quick-style-item-selected":e===a.quickStyleType}),children:(0,l.jsx)(d.Button,{className:"quick-style-item-inner p-2 w-100",onClick:()=>{k(n)},disableHoverEffect:!0,disableRipple:!0,type:"tertiary",title:g(p),"aria-label":g(p),children:(0,l.jsxs)("div",{className:"quick-style-item-inner w-100 p-2 position-relative",children:[S.pointStyle!==i.None&&(0,l.jsx)("span",{className:"point-start position-absolute",css:f}),(0,l.jsx)("div",{className:z,css:[c,h]}),y.pointStyle!==i.None&&(0,l.jsx)("span",{className:"point-end position-absolute",css:P})]})})})},t);o.push(x)}return o})()})})})})}),P={appBuilderSync:f.appBuilderSync,QuickStyle:k}})(),p})())}}});