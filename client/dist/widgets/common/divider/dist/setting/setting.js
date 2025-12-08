System.register(["jimu-core/emotion","jimu-core","jimu-for-builder","jimu-ui/advanced/setting-components","jimu-ui/advanced/style-setting-components","jimu-ui/basic/color-picker","jimu-ui"],function(t,e){var i={},n={},o={},s={},r={},l={},a={};return{setters:[function(t){i.jsx=t.jsx,i.jsxs=t.jsxs},function(t){n.React=t.React,n.classNames=t.classNames,n.css=t.css,n.polished=t.polished},function(t){o.getAppConfigAction=t.getAppConfigAction},function(t){s.DirectionSelector=t.DirectionSelector,s.SettingRow=t.SettingRow,s.SettingSection=t.SettingSection},function(t){r.InputUnit=t.InputUnit},function(t){l.ThemeColorPicker=t.ThemeColorPicker},function(t){a.Button=t.Button,a.DistanceUnits=t.DistanceUnits,a.Option=t.Option,a.Select=t.Select,a.Slider=t.Slider,a.TextInput=t.TextInput,a.defaultMessages=t.defaultMessages}],execute:function(){t((()=>{var t={4108:t=>{"use strict";t.exports=o},14321:t=>{"use strict";t.exports=a},15562:t=>{"use strict";t.exports=r},54337:t=>{"use strict";t.exports=l},67386:t=>{"use strict";t.exports=i},79244:t=>{"use strict";t.exports=n},79298:t=>{"use strict";t.exports=s}},e={};function d(i){var n=e[i];if(void 0!==n)return n.exports;var o=e[i]={exports:{}};return t[i](o,o.exports,d),o.exports}d.d=(t,e)=>{for(var i in e)d.o(e,i)&&!d.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:e[i]})},d.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),d.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},d.p="";var h={};return d.p=window.jimuConfig.baseUrl,(()=>{"use strict";d.r(h),d.d(h,{__set_webpack_public_path__:()=>P,default:()=>x});var t=d(67386),e=d(79244),i=d(4108),n=d(79298),o=d(15562),s=d(54337);const r="3px",l="6px";var a,p,c,u,g,S=d(14321);!function(t){t.Regular="REGULAR",t.Hover="HOVER"}(a||(a={})),function(t){t.Horizontal="Horizontal",t.Vertical="Vertical"}(p||(p={})),function(t){t.Style0="Style0",t.Style1="Style1",t.Style2="Style2",t.Style3="Style3",t.Style4="Style4",t.Style5="Style5",t.Style6="Style6",t.Style7="Style7",t.Style8="Style8",t.Style9="Style9",t.Style10="Style10"}(c||(c={})),function(t){t.None="None",t.Point0="Point0",t.Point1="Point1",t.Point2="Point2",t.Point3="Point3",t.Point4="Point4",t.Point5="Point5",t.Point6="Point6",t.Point7="Point7",t.Point8="Point8"}(u||(u={})),function(t){t.None="None",t.Default="Default",t.Style1="Style1",t.Style2="Style2",t.Style3="Style3",t.Style4="Style4",t.Style5="Style5",t.Style6="Style6",t.Style7="Style7",t.Style8="Style8",t.Style9="Style9",t.Style10="Style10",t.Style11="Style11",t.Style12="Style12",t.Style13="Style13",t.Style14="Style14",t.Style15="Style15",t.Style16="Style16",t.Style17="Style17",t.Style18="Style18",t.Style19="Style19"}(g||(g={}));const $={stroke:"Stroke",endpoints:"End point",startpoints:"Start point",nonePoint:"None",dividerSize:"Size",strokeSolid:"Solid",strokeDashed:"Dashed",strokeDotted:"Dotted",strokeDashdotted:"Dashdotted",strokeLongDashed:"Long dashed",strokeDouble:"Double",strokeThinThick:"Thin thick",strokeThickThin:"Thick thin",strokeTriple:"Triple",pointCircle:"Circle",pointCross:"Cross",pointLine:"Line",pointSquare:"Square",pointDiamond:"Diamond",pointInverted:"Inverted arrow",pointArrow:"Arrow",pointOpenArrow:"Open arrow",pointInvertedArrow:"Inverted open arrow"};class m extends e.React.PureComponent{constructor(i){super(i),this.getStyle=()=>{var t;const{theme:i}=this.props;return e.css`
      .scale-con {
        & {
          width: 100%;
          top: ${e.polished.rem(-2)};
        }
        span {
          height: ${e.polished.rem(3)};
          width: 1px;
          background: ${null===(t=null==i?void 0:i.ref.palette)||void 0===t?void 0:t.neutral[700]};
        }
      }
      .range-number-inp {
        width: ${e.polished.rem(46)};
      }
      .style-setting--unit-selector {
        height: 26px;
        min-width: 0;
        padding: 0;
        margin-left: 0;
        font-size: 12px;

        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;

        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;

        width: 26px;
      }
    `},this.getScale=()=>{const e=[];for(let i=0;i<99;i++)e.push((0,t.jsx)("span",{className:"position-absolute",style:{left:1*(i+1)+"%"}},i));return(0,t.jsx)("div",{className:"scale-con position-absolute left-0 right-0",children:e})},this.onChange=t=>{const e=t.target.value;if(!this.checkNumber(e)||e===this.preRangeValue)return!1;if(Number(e)<0||Number(e)>100)return!1;const i=2*(e/100)+3,n=this.getRangeValue(i);this.setState({value:i,rangeValue:n}),this.preRangeValue=e,clearTimeout(this.updateConfigTimeout),this.updateConfigTimeout=setTimeout(()=>{var t;null===(t=null==this?void 0:this.props)||void 0===t||t.onChange(i)},100)},this.getRangeValue=t=>{const e=100*(t-3)/2;return e>0?e:0},this.checkNumber=(t,e=0)=>{if(0===(null==t?void 0:t.length))return!0;if(isNaN(Number(t)))return!1;{const i=Number(t);return Number.isInteger(i)&&i>=e}},this.state={value:(null==i?void 0:i.value)||0,rangeValue:this.getRangeValue((null==i?void 0:i.value)||0)}}componentWillUnmount(){clearTimeout(this.updateConfigTimeout)}componentDidUpdate(t,e){this.getRangeValue(this.props.value||0)!==this.state.rangeValue&&e.rangeValue===this.state.rangeValue&&this.setState({value:this.props.value,rangeValue:this.getRangeValue(this.props.value)})}render(){const{intl:e}=this.props,{rangeValue:i}=this.state;return(0,t.jsxs)("div",{className:"range-input w-100 position-relative d-flex align-items-center",css:this.getStyle(),children:[(0,t.jsx)("div",{className:"flex-grow-1",children:(0,t.jsx)(S.Slider,{title:e("dividerSize"),value:i,min:0,max:100,step:1,"aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":i,className:"slider mr-2",onChange:this.onChange})}),(0,t.jsxs)("div",{className:"d-flex align-items-center",children:[(0,t.jsx)(S.TextInput,{size:"sm",className:"ml-4 range-number-inp flex-grow-1",value:i.toFixed(),onChange:this.onChange}),(0,t.jsx)(S.Button,{disabled:!0,className:"d-flex align-items-center justify-content-center style-setting--unit-selector",children:"%"})]})]})}}function b(t,e=1.5,i=null){if(!t)return"0px";const n=i?Number(i.split("px")[0]):0;let o=Number(t.split("px")[0]);return o=n>o?n:o,o*e<1?"1px":`${Math.round(o*e)}px`}class y extends e.React.PureComponent{constructor(t){super(t),this.nls=t=>this.props.intl?this.props.intl.formatMessage({id:t,defaultMessage:$[t]}):t,this.getLineStyles=()=>{const{isPointStart:t}=this.props,i=[],n=function(t,i,n=p.Horizontal,o=!0){const s=b(t,1),r=b(t,.5),l=b(t,.1),a=b(t,.3);i=i||"transparent";const d=n===p.Horizontal;let h={None:"None"},c={None:"None"};h.Point0=e.css`
    & {
      width: ${s};
      height: ${s};
      border-radius: 50%;
      background-color: ${i};
      left: ${o?0:"unset"};
      right: ${o?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,h.Point1=e.css`
    & {
      width: ${a};
      height: ${s};
      background-color: ${i};
      left: ${o?"4%":"unset"};
      right: ${o?"unset":"4%"};
      top: 50%;
      transform: translateY(-50%);
    }
  `,h.Point2=e.css`
    & {
      width: ${a};
      height: ${s};
      background-color: ${i};
      left: ${o?0:"unset"};
      right: ${o?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,h.Point3=e.css`
    & {
      width: ${s};
      height: ${s};
      background-color: ${i};
      left: ${o?0:"unset"};
      right: ${o?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,h.Point4=e.css`
    & {
      width: ${b(t,.71)};
      height: ${b(t,.71)};
      background-color: ${i};
      left: ${o?b(t,.2):"unset"};
      right: ${o?"unset":b(t,.2)};
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }
  `;const u=e.css`
    .jimu-rtl & {
      border-color: transparent ${i} transparent transparent;
    }
    & {
      width: 0;
      height: 0;
      border-width: ${r};
      border-style: solid;
      border-color: transparent transparent transparent ${i};
      left: ${o?0:"unset"};
      right: ${o?"unset":`-${b(t,.5)}`};
      top: 50%;
      transform: translateY(-50%);
    }
  `,g=e.css`
    .jimu-rtl & {
      border-color: transparent transparent transparent ${i};
    }
    & {
      width: 0;
      height: 0;
      border-width: ${r};
      border-style: solid;
      border-color: transparent ${i} transparent transparent;
      left: ${o?`-${b(t,.5)}`:"unset"};
      right: ${o?"unset":0};
      top: 50%;
      transform: translateY(-50%);
    }
  `,S=e.css`
    .jimu-rtl & {
      border-top: ${a} solid ${i};
      border-left: ${a} solid ${i};
    }
    .jimu-ltr & {
      border-bottom: ${a} solid ${i};
      border-left: ${a} solid ${i};
    }
    & {
      width: ${b(t,.8)};
      height: ${b(t,.8)};
      left: ${o?b(t,.2):"unset"};
      right: ${o?"unset":`-${b(t,.2)}`};
      top: 50%;
      border-radius: ${l};
      transform: translateY(-50%) rotate(45deg);
    }
  `,$=e.css`
    .jimu-rtl & {
      border-right: ${a} solid ${i};
      border-bottom: ${a} solid ${i};
    }
    .jimu-ltr & {
      border-top: ${a} solid ${i};
      border-right: ${a} solid ${i};
    }
    & {
      width: ${b(t,.8)};
      height: ${b(t,.8)};
      left: ${o?`-${b(t,.2)}`:"unset"};
      right: ${o?"unset":b(t,.2)};
      top: 50%;
      border-radius: ${l};
      transform: translateY(-50%) rotate(45deg);
    }
  `;c.Point0=e.css`
    & {
      width: ${s};
      height: ${s};
      border-radius: 50%;
      background-color: ${i};
      top: ${o?0:"unset"};
      bottom: ${o?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,c.Point1=e.css`
    & {
      width: ${s};
      height: ${a};
      background-color: ${i};
      top: ${o?"4%":"unset"};
      bottom: ${o?"unset":"4%"};
      left: 50%;
      transform: translateX(-50%);
    }
  `,c.Point2=e.css`
    & {
      width: ${s};
      height: ${a};
      background-color: ${i};
      top: ${o?0:"unset"};
      bottom: ${o?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,c.Point3=e.css`
    & {
      width: ${s};
      height: ${s};
      background-color: ${i};
      top: ${o?0:"unset"};
      bottom: ${o?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,c.Point4=e.css`
    & {
      width: ${b(t,.71)};
      height: ${b(t,.71)};
      background-color: ${i};
      top: ${o?b(t,.2):"unset"};
      bottom: ${o?"unset":b(t,.2)};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
    }
  `;const m=e.css`
    & {
      width: 0;
      height: 0;
      border-width: ${r};
      border-style: solid;
      border-color: transparent transparent ${i} transparent;
      top: ${o?`-${b(t,.5)}`:"unset"};
      bottom: ${o?"unset":0};
      left: 50%;
      transform: translateX(-50%);
    }
  `,y=e.css`
    & {
      width: 0;
      height: 0;
      border-width: ${r};
      border-style: solid;
      border-color: ${i} transparent transparent transparent;
      top: ${o?0:"unset"};
      bottom: ${o?"unset":`-${b(t,.5)}`};
      left: 50%;
      transform: translateX(-50%);
    }
  `,f=e.css`
    .jimu-rtl & {
      border-bottom: ${a} solid ${i};
      border-left: ${a} solid ${i};
    }
    .jimu-ltr & {
      border-bottom: ${a} solid ${i};
      border-right: ${a} solid ${i};
    }
    & {
      width: ${b(t,.8)};
      height: ${b(t,.8)};
      top: ${o?`-${b(t,.2)}`:"unset"};
      bottom: ${o?"unset":b(t,.2)};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-radius: ${l};
    }
  `,v=e.css`
    .jimu-rtl & {
      border-top: ${a} solid ${i};
      border-right: ${a} solid ${i};
    }
    .jimu-ltr & {
      border-top: ${a} solid ${i};
      border-left: ${a} solid ${i};
    }
    & {
      width: ${b(t,.8)};
      height: ${b(t,.8)};
      top: ${o?b(t,.2):"unset"};
      bottom: ${o?"unset":`-${b(t,.2)}`};
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-radius: ${l};
    }
  `;let x,P;return o?(x={Point5:u,Point6:g,Point7:S,Point8:$},P={Point5:y,Point6:m,Point7:v,Point8:f}):(x={Point5:g,Point6:u,Point7:$,Point8:S},P={Point5:m,Point6:y,Point7:f,Point8:v}),h=Object.assign(Object.assign({},h),x),c=Object.assign(Object.assign({},c),P),d?h:c}("11px","#fff",p.Horizontal,t);for(const t in n){const e=n[t],o=t===u.None?{value:t}:{style:e,value:t};i.push(o)}return i},this.getStyle=()=>e.css`
      & {
        width: ${e.polished.rem(84)};
      }
      & > div {
        width: 100%;
      }
    `,this.getOptionStyle=()=>e.css`
      & {
        display: block;
        width: 100%;
      }
      &.divider-line-con {
        margin: ${e.polished.rem(8)} 0 ${e.polished.rem(8)} ${e.polished.rem(2)};
        height: ${e.polished.rem(2)};
      }
      .points {
        /* left: 0;
        top: 50%;
        transform: translateY(-50%); */
      }
    `,this.getSelectStyle=()=>e.css`
      .dropdown-menu--inner {
        width: ${e.polished.rem(94)};
      }
      & {
        width: ${e.polished.rem(94)};
      }
    `,this.getDividerLineStyle=()=>{const{isPointStart:t}=this.props;return function(t,i,n,o,s){const r=i?o/2+"px":0,l=i?o/2.5+"px":0,a=n?s/2+"px":0,d=n?s/2.5+"px":0,h=e.css`
    left: ${r};
    right: ${a};
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
      left: ${l};
    }
    &.point-end-Point7 {
      right: ${d};
    }
  `,p=e.css`
    top: ${r};
    bottom: ${a};
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
  `;return t?h:p}(!0,t,!t,11,11)},this.pointTitle={None:this.nls("nonePoint"),Point0:this.nls("pointCircle"),Point1:this.nls("pointCross"),Point2:this.nls("pointLine"),Point3:this.nls("pointSquare"),Point4:this.nls("pointDiamond"),Point5:this.nls("pointInverted"),Point6:this.nls("pointArrow"),Point7:this.nls("pointOpenArrow"),Point8:this.nls("pointInvertedArrow")}}_onLineStyleChange(t){const e=t.target.value;this.props.onChange(e)}render(){const{value:i,className:n,style:o,isPointStart:s}=this.props,r=s?"point-start-":"point-end-";return(0,t.jsx)("div",{className:(0,e.classNames)(n,"style-setting--line-style-selector"),style:o,css:this.getStyle(),children:(0,t.jsx)(S.Select,{size:"sm",name:"lineType",value:i,title:this.pointTitle[i],onChange:this._onLineStyleChange.bind(this),css:this.getSelectStyle(),"aria-label":this.pointTitle[i],children:this.getLineStyles().map((i,n)=>(0,t.jsx)(S.Option,{"aria-label":this.pointTitle[i.value],role:"option",tabIndex:n,value:i.value,title:this.pointTitle[i.value],children:(0,t.jsxs)("div",{className:"w-100 pl-1 pr-1",children:[i.value===u.None&&(0,t.jsx)("div",{className:"position-relative",css:this.getOptionStyle(),children:(0,t.jsx)("span",{children:this.nls("nonePoint")})}),i.value!==u.None&&(0,t.jsxs)("div",{className:"position-relative divider-line-con",css:this.getOptionStyle(),children:[(0,t.jsx)("div",{className:(0,e.classNames)("position-absolute divider-line",`${r}${i.value}`),css:this.getDividerLineStyle(),style:{border:"1px solid #fff"}}),(0,t.jsx)("span",{className:"position-absolute points",css:i.style})]})]})},n))})})}}y.defaultProps={value:u.None,onChange:()=>null};class f extends e.React.PureComponent{constructor(t){super(t),this.nls=t=>this.props.intl?this.props.intl.formatMessage({id:t,defaultMessage:$[t]}):t,this.getLineStyles=()=>{const t=[],i=function(t,i,n=p.Horizontal,o=!1){const s=n===p.Horizontal,r={},l={};return i=i||"transparent",r.Style0=e.css`
    & {
      border-bottom: ${t} solid ${i};
    }
  `,r.Style1=e.css`
    & {
      border-bottom: ${t} dashed ${i};
    }
  `,r.Style2=e.css`
    & {
      border-bottom: ${t} dotted ${i};
    }
  `,r.Style3=e.css`
    & {
      height: ${t};
      position: relative;
    }
    &:before {
      position: absolute;
      content: '';
      height: ${t};
      left: ${b(t,4)};
      right: 0;
      background-image: repeating-linear-gradient(
        to right,
        ${i} 0,
        ${i} ${b(t,1)},
        transparent 0,
        transparent ${b(t,6)}
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
        ${i} 0,
        ${i} ${b(t,3)},
        transparent 0,
        transparent ${b(t,6)}
      );
    }
  `,r.Style6=e.css`
    & {
      height: ${t};
      background-image: repeating-linear-gradient(
        to right,
        ${i} 0,
        ${i} ${b(t,4)},
        transparent 0,
        transparent ${b(t,6)}
      );
    }
  `,r.Style7=e.css`
    & {
      border-color: ${i};
      border-bottom-style: double;
      border-bottom-width: ${o?"4px":t};
    }
  `,r.Style8=e.css`
    & {
      height: ${t};
      min-height: ${o?"6px":"unset"};
      position: relative;
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: ${b(t,.2,"4px")};
      background: ${i};
    }
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${b(t,.4,"4px")};
      background: ${i};
    }
  `,r.Style9=e.css`
    & {
      height: ${t};
      min-height: ${o?"6px":"unset"};
      position: relative;
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: ${b(t,.4,"4px")};
      background: ${i};
    }
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${b(t,.2,"4px")};
      background: ${i};
    }
  `,r.Style10=e.css`
    & {
      height: ${t};
      min-height: ${o?"8px":"unset"};
      position: relative;
      background-clip: content-box;
      border-top: ${b(t,.167)} solid ${i};
      border-bottom: ${b(t,.167)} solid ${i};
    }
    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: ${o?"2px":b(t,.3)};
      background: ${i};
      transform: translateY(-50%);
    }
  `,l.Style0=e.css`
    & {
      border-left: ${t} solid ${i};
    }
  `,l.Style1=e.css`
    & {
      border-left: ${t} dashed ${i};
    }
  `,l.Style2=e.css`
    & {
      border-left: ${t} dotted ${i};
    }
  `,l.Style3=e.css`
    & {
      width: ${t};
      position: relative;
    }
    &:before {
      position: absolute;
      content: '';
      width: ${t};
      top: ${b(t,3.8)};
      bottom: 0;
      background-image: repeating-linear-gradient(
        to bottom,
        ${i} 0,
        ${i} ${b(t,1)},
        transparent 0,
        transparent ${b(t,6)}
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
        ${i} 0,
        ${i} ${b(t,2.5)},
        transparent 0,
        transparent ${b(t,6)}
      );
    }
  `,l.Style6=e.css`
    & {
      width: ${t};
      background-image: repeating-linear-gradient(
        to bottom,
        ${i} 0,
        ${i} ${b(t,4)},
        transparent 0,
        transparent ${b(t,6)}
      );
    }
  `,l.Style7=e.css`
    & {
      border-left: ${t} double ${i};
    }
  `,l.Style8=e.css`
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
      width: ${b(t,.2,"4px")};
      background: ${i};
    }
    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: ${b(t,.4,"4px")};
      background: ${i};
    }
  `,l.Style9=e.css`
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
      width: ${b(t,.4,"4px")};
      background: ${i};
    }
    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: ${b(t,.2,"4px")};
      background: ${i};
    }
  `,l.Style10=e.css`
    & {
      width: ${t};
      position: relative;
      background-clip: content-box;
      border-left: ${b(t,.167)} solid ${i};
      border-right: ${b(t,.167)} solid ${i};
    }
    &:before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: ${o?"2px":b(t,.3)};
      background: ${i};
      transform: translateX(-50%);
    }
  `,s?r:l}("2px","#fff",p.Horizontal,!0);for(const e in i)t.push({style:i[e],value:e});return t},this.getStyle=()=>e.css`
      & {
        width: ${e.polished.rem(84)};
      }
    `,this.lineTitle={Style0:this.nls("strokeSolid"),Style1:this.nls("strokeDashed"),Style2:this.nls("strokeDotted"),Style3:this.nls("strokeDashdotted"),Style6:this.nls("strokeLongDashed"),Style7:this.nls("strokeDouble"),Style8:this.nls("strokeThinThick"),Style9:this.nls("strokeThickThin"),Style10:this.nls("strokeTriple")}}_onLineStyleChange(t){const e=t.target.value;this.props.onChange(e)}render(){const{value:i,className:n,style:o}=this.props,s=e.css`
      width: 100%;
      margin: 6px 0;
    `;return(0,t.jsx)("div",{className:(0,e.classNames)(n,"style-setting--line-style-selector"),style:o,css:this.getStyle(),children:(0,t.jsx)(S.Select,{size:"sm",name:"lineType",value:i,title:this.lineTitle[i],onChange:this._onLineStyleChange.bind(this),"aria-label":this.lineTitle[i],children:this.getLineStyles().map((e,i)=>(0,t.jsx)(S.Option,{"aria-label":e.value,tabIndex:i,role:"option",value:e.value,title:this.lineTitle[e.value],children:(0,t.jsx)("div",{css:[e.style,s]})},i))})})}}f.defaultProps={value:c.Style0,onChange:()=>null};const v="jimu-widget-";class x extends e.React.PureComponent{constructor(t){var n,o;super(t),this.hasSetLineSize=!1,this.units=[S.DistanceUnits.PIXEL],this.getStyle=t=>{var i;return e.css`
      .padding-top-0 {
        padding-top: 0;
      }
      .unit-width {
        width: ${e.polished.rem(60)};
        min-width: ${e.polished.rem(60)};
      }
      .start-end-point .jimu-widget-setting--section-header h6 {
        font-size: ${e.polished.rem(13)};
        color: ${null===(i=null==t?void 0:t.ref.palette)||void 0===i?void 0:i.neutral[900]};
      }
      .divider-setting-label-con {
        .jimu-widget-setting--row-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    `},this.onSettingChange=(t,e)=>{let i=this.props.config;i=Array.isArray(t)?i.setIn(t,e):i.set(t,e),i.themeStyle.quickStyleType!==g.None&&(i=i.setIn(["themeStyle","quickStyleType"],g.None)),this.props.onSettingChange({id:this.props.id,config:i})},this.onRadioChange=(t,e,n)=>{t.currentTarget.checked&&(this.onSettingChange(e,n),(0,i.getAppConfigAction)().exchangeWidthAndHeight().exec())},this.onDirectionChange=t=>{const e=t?p.Vertical:p.Horizontal,{direction:n}=this.props.config;if(e===n)return!1;this.onSettingChange("direction",e),(0,i.getAppConfigAction)().exchangeWidthAndHeight().exec()},this.translate=(t,e,i)=>{const n=e?S.defaultMessages:$;return this.props.intl.formatMessage({id:t,defaultMessage:n[t]},i)},this.onDividerLineStyleChange=(t,e)=>{this.onSettingChange(["dividerStyle",t],e)},this.onLineStyleChange=t=>{var e,i,n;const{config:o,id:s}=this.props;if(t===(null===(n=null===(i=null===(e=null==this?void 0:this.props)||void 0===e?void 0:e.config)||void 0===i?void 0:i.strokeStyle)||void 0===n?void 0:n.type))return!1;let a=o.setIn(["strokeStyle","type"],t);if(!this.hasSetLineSize){const e={Style0:r,Style1:r,Style2:r,Style3:r,Style4:r,Style5:r,Style6:r,Style7:l,Style8:l,Style9:l,Style10:"8px"}[t];a=a.setIn(["strokeStyle","size"],e)}this.props.onSettingChange({id:s,config:a})},this.onStrokeSizeChange=t=>{var e,i,n;const o=`${t.distance}${t.unit}`;if(o===(null===(n=null===(i=null===(e=null==this?void 0:this.props)||void 0===e?void 0:e.config)||void 0===i?void 0:i.strokeStyle)||void 0===n?void 0:n.size)||t.distance<1)return!1;this.onSettingChange(["strokeStyle","size"],o),this.hasSetLineSize=!0},this.onStrokeSizeAccept=t=>{var e,i,n;const o=`${t.distance}${t.unit}`;if(o===(null===(n=null===(i=null===(e=null==this?void 0:this.props)||void 0===e?void 0:e.config)||void 0===i?void 0:i.strokeStyle)||void 0===n?void 0:n.size)||t.distance<1)return!1;this.onSettingChange(["strokeStyle","size"],o),this.hasSetLineSize=!0},this.onColorChange=t=>{var e,i,n;if(t===(null===(n=null===(i=null===(e=null==this?void 0:this.props)||void 0===e?void 0:e.config)||void 0===i?void 0:i.strokeStyle)||void 0===n?void 0:n.color))return!1;this.onSettingChange(["strokeStyle","color"],t)},this.onPointStyleChange=(t,e)=>{var i,n;if(e===(null===(n=null===(i=null==this?void 0:this.props)||void 0===i?void 0:i.config[t])||void 0===n?void 0:n.pointStyle))return!1;this.onSettingChange([t,"pointStyle"],e)},this.onPointSizeChange=(t,e)=>{var i,n;if(e===(null===(n=null===(i=null==this?void 0:this.props)||void 0===i?void 0:i.config[t])||void 0===n?void 0:n.pointSize))return!1;this.onSettingChange([t,"pointSize"],e)},this.state={isLinkSettingShown:!1,isAdvance:!1,strokeSize:null===(o=null===(n=null==t?void 0:t.config)||void 0===n?void 0:n.strokeStyle)||void 0===o?void 0:o.size}}render(){const{config:i,theme:r,theme2:l,intl:a}=this.props,{direction:d,strokeStyle:h,pointEnd:c,pointStart:g}=i;return(0,t.jsxs)("div",{className:(0,e.classNames)(`${v}card-setting`,`${v}setting`),css:this.getStyle(this.props.theme),children:[(0,t.jsx)(n.SettingSection,{children:(0,t.jsx)(n.SettingRow,{role:"group",label:this.translate("direction",!0),"aria-label":this.translate("direction",!0),children:(0,t.jsx)(n.DirectionSelector,{vertical:d===p.Vertical,onChange:this.onDirectionChange,"aria-pressed":!0})})}),(0,t.jsxs)(n.SettingSection,{title:this.translate("style",!0),className:"border-bottom-0",role:"group","aria-label":this.translate("style",!0),children:[(0,t.jsx)(n.SettingRow,{label:this.translate("color"),"aria-label":this.translate("color"),children:(0,t.jsx)(s.ThemeColorPicker,{value:null==h?void 0:h.color,specificTheme:l,onChange:this.onColorChange})}),(0,t.jsxs)(n.SettingRow,{role:"group",className:"divider-setting-label-con",label:this.translate("stroke"),"aria-label":this.translate("stroke"),children:[(0,t.jsx)(f,{intl:a,value:(null==h?void 0:h.type)||null,onChange:this.onLineStyleChange,className:"mr-2 f-grow-1"}),(0,t.jsx)("div",{className:"unit-width",children:(0,t.jsx)(o.InputUnit,{units:this.units,value:null==h?void 0:h.size,onChange:this.onStrokeSizeChange,className:"item"})})]})]}),(0,t.jsxs)(n.SettingSection,{className:"pt-0 start-end-point",role:"group","aria-label":this.translate("style",!0),children:[(0,t.jsx)(n.SettingRow,{role:"group",className:"divider-setting-label-con",label:this.translate("startpoints"),"aria-label":this.translate("startpoints"),children:(0,t.jsx)("div",{className:"d-flex align-items-center",children:(0,t.jsx)(y,{intl:a,value:null==g?void 0:g.pointStyle,isPointStart:!0,onChange:t=>{this.onPointStyleChange("pointStart",t)}})})}),(null==g?void 0:g.pointStyle)!==u.None&&(0,t.jsx)(n.SettingRow,{className:"divider-setting-label-con",role:"group","aria-label":this.translate("startpoints"),children:(0,t.jsx)(m,{theme:r,pointStyle:null==g?void 0:g.pointStyle,value:null==g?void 0:g.pointSize,intl:this.translate,onChange:t=>{this.onPointSizeChange("pointStart",t)}})}),(0,t.jsx)(n.SettingRow,{role:"group",label:this.translate("endpoints"),className:"divider-setting-label-con","aria-label":this.translate("endpoints"),children:(0,t.jsx)("div",{className:"d-flex align-items-center",children:(0,t.jsx)(y,{intl:a,value:null==c?void 0:c.pointStyle,isPointStart:!1,onChange:t=>{this.onPointStyleChange("pointEnd",t)}})})}),(null==c?void 0:c.pointStyle)!==u.None&&(0,t.jsx)(n.SettingRow,{className:"divider-setting-label-con",role:"group","aria-label":this.translate("endpoints"),children:(0,t.jsx)(m,{theme:r,pointStyle:null==c?void 0:c.pointStyle,value:null==c?void 0:c.pointSize,intl:this.translate,onChange:t=>{this.onPointSizeChange("pointEnd",t)}})})]})]})}}function P(t){d.p=t}})(),h})())}}});