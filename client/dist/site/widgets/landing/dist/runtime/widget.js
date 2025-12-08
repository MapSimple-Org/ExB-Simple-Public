System.register(["jimu-core","jimu-core/emotion","jimu-ui"],function(e,t){var n={},s={},a={};return{setters:[function(e){n.React=e.React,n.SessionManager=e.SessionManager,n.classNames=e.classNames,n.css=e.css,n.focusElementInKeyboardMode=e.focusElementInKeyboardMode,n.getAppStore=e.getAppStore,n.hooks=e.hooks,n.moduleLoader=e.moduleLoader},function(e){s.jsx=e.jsx,s.jsxs=e.jsxs},function(e){a.defaultMessages=e.defaultMessages}],execute:function(){e((()=>{var e={244:e=>{"use strict";e.exports=n},321:e=>{"use strict";e.exports=a},386:e=>{"use strict";e.exports=s}},t={};function i(n){var s=t[n];if(void 0!==s)return s.exports;var a=t[n]={exports:{}};return e[n](a,a.exports,i),a.exports}i.d=(e,t)=>{for(var n in t)i.o(t,n)&&!i.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.p="";var r={};return i.p=window.jimuConfig.baseUrl,(()=>{"use strict";i.r(r),i.d(r,{__set_webpack_public_path__:()=>l,default:()=>o});var e=i(386),t=i(244);const n={landingOverView:"Overview",landingHelp:"Help",landingProductDiscribe:"Create web apps and pages visually with drag-and-drop. Choose the tools you need to interact with your 2D and 3D data. Build interactive, mobile adaptive experiences for your audiences.",landingLearnMore:"Learn more about ArcGIS Experience Builder",landingSignIn:"Sign in",landingTrustCenter:"Trust Center",landingLegal:"Legal",landingContact:"Contact Esri"};var s=i(321);const a=t.React.memo(a=>{const i=t.hooks.useTranslation(n,s.defaultMessages),r=t.React.useRef(null),o=t.React.useRef(null),[l,c]=t.React.useState(null),{onShowMenuChanged:d}=a;let p;t.React.useEffect(()=>(t.moduleLoader.loadModule("jimu-for-builder").then(e=>{e.helpUtils.getHomeHelpLink().then(e=>{c(e)})}),()=>{d(!1)}),[d]),function(e){e.firstNode="is508first",e.lastNode="is508last"}(p||(p={}));const h=t.React.useCallback(e=>{const n="first"===e?p.firstNode:p.lastNode,s=o.current.querySelector("[data-"+n+"]");(0,t.focusElementInKeyboardMode)(s)},[p]),x=e=>{const t=e.target,n=t.dataset[p.firstNode],s=t.dataset[p.lastNode];"Tab"===e.key&&(s&&!e.shiftKey?(e.stopPropagation(),e.nativeEvent.preventDefault(),e.nativeEvent.stopImmediatePropagation(),h("first")):n&&e.shiftKey&&(e.stopPropagation(),e.nativeEvent.preventDefault(),e.nativeEvent.stopImmediatePropagation(),h("last")))},m=t.React.useCallback(()=>{var e;a.isShowMenu?(o.current.style.display="block",o.current.setAttribute("aria-expanded","true"),(null===(e=a.maskerRef)||void 0===e?void 0:e.current)&&(a.maskerRef.current.style.opacity="1",a.maskerRef.current.style.zIndex="1"),h("first")):(o.current.style.display="none",o.current.setAttribute("aria-expanded","false"),a.maskerRef&&(a.maskerRef.current.style.opacity="0",a.maskerRef.current.style.zIndex="-1"),(0,t.focusElementInKeyboardMode)(r.current))},[a.isShowMenu,a.maskerRef,h]);t.hooks.useUpdateEffect(()=>{m()},[a.isShowMenu,m]);return(0,e.jsxs)("ul",{className:"exb-header-menus mt-2",css:(u=a.isRTL,t.css`
      &.exb-header-menus {
        display: flex;
        height: 100%;
        width: 100%;
        justify-content: space-between;
        align-items: center;

        margin-top: 0;
        margin-bottom: 0;
        padding-right: 0;
        padding-left: 0;

        list-style-type: none;
      }

      .exb-header-menus-item {
        display: flex;
        height: 100%;
        padding: 4px; /* for 508 focus border */

        position: relative;
      }
      .exb-header-menus-sub-item {
        list-style-type: none;
        .exb-header-menus-link {
          font-size: 14px;
        }
      }

      .exb-header-menus-link {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 100%;
        padding: 6px 8px;

        color: #ffffff !important;
        font-size: 18px;
        font-weight: 500;
        text-align: left;
        text-decoration: none;

        cursor: pointer;
        white-space: nowrap;
      }

      .exb-header-menus-link:hover {
        color: #ffffff !important;
        fill: currentColor;
        text-decoration: none;
        background: rgba(0, 0, 0, 0.30);
      }

      .exb-submenu-arrow {
        margin-left: 5px;
        width: 8px;
        height: 8px;
      }

      .exb-header-menus-submenu {
        width: 420px;
        left: 0;
        padding: 15px 35px 35px 35px;
        box-shadow: inset 0 0 0 1px #e0e0e0;
        top: 100%;
        position: absolute;
        transition: opacity .25s ease-in-out;
        background-color: #f8f8f8;
        display: none;

        list-style-type: none;
        margin-top: 0;
        margin-bottom: 0;
        font-size: 0.9375rem;
        line-height: 1.5;
      }

      .exb-header-menus-subitem {
        margin: 0;
      }

      .exb-header-menus-sublink{
        padding-right: 30px;
        background-image: linear-gradient(90deg,${u?"#e0e0e0 50%,#0079c1 0":"#0079c1 50%,#e0e0e0 0"});
        background-position: 100% 100%;
        background-repeat: no-repeat;
        background-size: 200% 1px;
        color: #595959;
        cursor: pointer;
        display: block;
        font-size: 15px;
        line-height: 20px;
        position: relative;
        transition: background-position .25s;
        padding-top: 15px;
        padding-bottom: 15px;
        text-decoration: none;
      }

      .exb-header-menus-sublink:hover{
        background-position-x: left;
        color: #000;
        text-decoration: none;
      }

      .exb-header-menus-sublink:after{
        right: 20px;
        opacity: 0;
        position: absolute;
        width: 16px;
        height: 16px;
        transition: opacity .25s,transform .25s;
        content: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='%230079c1'%3E%3Cpath d='M3 6.982h9.452L9.948 4.48l.707-.707L14.384 7.5l-3.729 3.729-.707-.707 2.54-2.54H3z'/%3E%3C/svg%3E");
        top: calc(50% - 16px / 2)
      }

      .exb-header-menus-sublink:hover:after{
        opacity: 1;
        transform: translateX(10px) ${u?"scaleX(-1)":null};
      }

      .icon-horizontal-revert {
        -moz-transform:scaleX(-1);
        -webkit-transform:scaleX(-1);
        -o-transform:scaleX(-1);
        transform:scaleX(-1);
    }
  `),children:[(0,e.jsxs)("li",{className:"exb-header-menus-item",children:[(0,e.jsxs)("button",{className:"exb-header-menus-link d-flex",id:"exb-header-menus-link-desktop",onClick:e=>{e.preventDefault(),e.stopPropagation(),m(),a.onShowMenuChanged(!a.isShowMenu)},type:"button","aria-owns":"exb-submenu","aria-controls":"exb-submenu",ref:r,children:["ArcGIS Experience Builder",(0,e.jsx)("img",{className:"exb-submenu-arrow",src:a.getImageUrl("assets/down.svg")})]}),(0,e.jsxs)("ul",{className:"exb-header-menus-submenu",id:"exb-submenu",ref:o,onClick:e=>{e.stopPropagation()},role:"listbox","aria-expanded":"false",children:[(0,e.jsx)("li",{className:"exb-header-menus-subitem",children:(0,e.jsx)("a",{className:"exb-header-menus-sublink",href:"https://www.esri.com/software/arcgis/arcgisonline","data-is508first":!0,onKeyDown:x,children:"ArcGIS Online"})}),(0,e.jsx)("li",{className:"exb-header-menus-subitem",children:(0,e.jsx)("a",{className:"exb-header-menus-sublink",href:"https://www.esri.com/arcgis/products/arcgis-pro/",children:"ArcGIS Pro"})}),(0,e.jsx)("li",{className:"exb-header-menus-subitem",children:(0,e.jsx)("a",{className:"exb-header-menus-sublink",href:"https://www.esri.com/arcgis/products/arcgis-enterprise/",children:"ArcGIS Enterprise"})}),(0,e.jsx)("li",{className:"exb-header-menus-subitem",children:(0,e.jsx)("a",{className:"exb-header-menus-sublink",href:"https://developers.arcgis.com/en/",children:"ArcGIS for Developers"})}),(0,e.jsx)("li",{className:"exb-header-menus-subitem",children:(0,e.jsx)("a",{className:"exb-header-menus-sublink",href:"http://links.esri.com/arcgis-solutions/",children:"ArcGIS Solutions"})}),(0,e.jsx)("li",{className:"exb-header-menus-subitem",children:(0,e.jsx)("a",{className:"exb-header-menus-sublink",href:"http://marketplace.arcgis.com/","data-is508last":!0,onKeyDown:x,children:"ArcGIS Marketplace"})})]})]}),(0,e.jsxs)("ul",{className:"d-inline-flex",children:[(0,e.jsx)("li",{className:"exb-header-menus-item exb-header-menus-sub-item",children:(0,e.jsx)("a",{className:"exb-header-menus-link",href:"https://www.esri.com/en-us/arcgis/products/arcgis-experience-builder/overview",target:"_blank",children:i("landingOverView")})}),(0,e.jsx)("li",{className:"exb-header-menus-item exb-header-menus-sub-item",children:(0,e.jsx)("a",{className:"exb-header-menus-link",href:"https://doc.arcgis.com/en/experience-builder/gallery",rel:"noopener noreferrer",target:"_blank",children:i("gallery")})}),(0,e.jsx)("li",{className:"exb-header-menus-item exb-header-menus-sub-item",children:(0,e.jsx)("a",{className:"exb-header-menus-link",href:l,rel:"noopener noreferrer",target:"_blank",children:i("landingHelp")})})]})]});var u});class o extends t.React.PureComponent{constructor(e){super(e),this.getImageUrl=e=>this.props.context.folderUrl+"./dist/runtime/"+e,this.toSignIn=()=>{const e=window.location.search?`/${window.location.search}`:"/";t.SessionManager.getInstance().signIn({fromUrl:e,popup:!1})},this.showExbContent=()=>{this.setState({isPageLoaded:!0})},this.initPage=()=>{const e=new Image;e.src=this.getImageUrl("assets/landing-page.webp"),e.onload=()=>{this.showExbContent()},e.onerror=()=>{this.showExbContent()}},this.onShowMenuChanged=e=>{this.setState({isShowHeadMenu:e})},this.onWapperEscKey=e=>{"Esc"!==e.key&&"Escape"!==e.key||this.onShowMenuChanged(!1)},this.maskerRef=t.React.createRef(),this.state={isPageLoaded:!1,isShowHeadMenu:!1}}componentDidMount(){this.initPage()}render(){const s=(0,t.getAppStore)().getState().appContext.isRTL,i=this.props.intl.formatMessage({id:"landingSignIn",defaultMessage:n.landingSignIn});return(0,e.jsx)("div",{className:"w-100 h-100",css:(r=this.props.context.folderUrl,t.css`
    hr {
      box-sizing: content-box;
      height: 0;
      overflow: visible;
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
    }
    button {
      background-color: transparent;
      border: none;
    }

    #landing-page {
      width: 100%;
      min-height: 100%;
      position: relative;

      align-items: center;
      overflow: auto;
    }

    /* 1.header */
    .exb-header-wrapper {
      position: relative;
      height: 56px;
      z-index: 101;

      animation: fadein 1s ease;
    }

    .exb-header {
      width: 1440px;
      max-width: 96vw;
      margin: 0 auto;
      height: 100%;
    }

    .exb-header * {
      box-sizing: border-box;
    }

    .exb-header-menus-masker {
      background-color: rgba(0,0,0,.5);
      opacity: 0;
      transition: opacity .25s ease-in-out;
      border-style: none;
      content: "";
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0;
      position: fixed;
      width: 100%;
      height: 100%;
      -webkit-tap-highlight-color: transparent;
      transition: opacity .25s ease-in-out,visibility 0ms .25s;
      z-index: -1;
      top: 56px;
    }

    .icon-horizontal-revert {
      -moz-transform:scaleX(-1);
      -webkit-transform:scaleX(-1);
      -o-transform:scaleX(-1);
      transform:scaleX(-1);
    }

    /* 2.main content */
    .exb-main-content-wrapper {
      position: relative;
      padding-bottom: 60px;
      min-height: calc(100% - 65px);
    }
    .exb-main-bg {
      position: absolute;
      width: 100%;
      height: calc(100% - 56px);
      min-height: 800px; /* ,#14889 */

      background-image: url(${r+"./dist/runtime/assets/landing-page.webp"});
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    }

    .exb-main-content {
      padding-top: 14vh;
      width: 100%;
    }

    .text-center {
      text-align: center;
    }

    .intro-transition {
      animation: fadeinAndUp .8s ease;
    }

    .intro-transition2 {
      animation: fadeinAndUp 1s ease;
    }

    .exb-logo {
      height: 90px;
      width: 90px;
    }

    .banner-title {
      color: #ffffff;
      font-size: 65px;
      letter-spacing: 1.35px;
      text-align: center;
      margin-top: 16px;
      margin-bottom: 10px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }

    .banner-title h1 {
      margin: 8px;
      font-size: 60px;
      text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      font-weight: 400;
    }

    .exb-line-break {
      margin: 0 auto;
      margin-bottom: 28px;
      margin-top: 15px;
      width: 120px;
      border-top: 2px solid #ffffff;
    }

    .exb-heading-description {
      color: #ffffff;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5rem;
      padding: 0 29%;
      margin-bottom: 35px;
    }

    .exb-learn-more-link {
      color: #ffffff;
      text-align: center;
      cursor: pointer;
      font-size: 16px;
      line-height: 22px;
      font-weight: 500;
      text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    }

    .exb-learn-more-link:hover {
      color: #ffffff !important;
      text-underline-offset: 5px;
    }

    .exb-sign-btn {
      display: flex;
      width: 180px;
      padding: 10px 24px;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      background-color: transparent;
      border-radius: 2px;
      border: 1px solid #ffffff;
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
    }

    .exb-sign-btn:hover {
      background: rgba(0, 0, 0, 0.30);
    }

    /* 3.footer */
    .exb-footer {
      position: absolute;
      width: 100%;
      height: 56px;
      text-align: center;
      color: #ffffff;
      bottom: 0;
      animation: fadein 1s ease;
      line-height: 1.5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .exb-footer-span {
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
    }

    .exb-footer-text {
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
    }

    .exb-footer-text:hover {
      color: #ffffff !important;
      text-decoration: underline;
    }

    /* 4.animation */
    @keyframes fadeinAndUp {
      0% {
        transform: translate(0, 40px);
        opacity: 0;
      }
      100% {
        transform: translate(0, 0);
        opacity: 1;
      }
    }

    @keyframes fadein {
      0% {
        opacity: 0;
      }
      20% {
        opacity: .30;
      }
      100% {
        opacity: 1;
      }
    }
  `),onClick:()=>{this.onShowMenuChanged(!1)},onKeyDown:this.onWapperEscKey,children:(0,e.jsxs)("div",{id:"landing-page",className:"exb-main-bg",children:[(0,e.jsx)("div",{className:"exb-header-wrapper",children:(0,e.jsx)("div",{className:"exb-header",children:(0,e.jsx)(a,{isShowMenu:this.state.isShowHeadMenu,onShowMenuChanged:this.onShowMenuChanged,maskerRef:this.maskerRef,isRTL:s,getImageUrl:this.getImageUrl})})}),(0,e.jsxs)("div",{className:"exb-main-content-wrapper",children:[(0,e.jsx)("div",{className:"exb-header-menus-masker",id:"exb-header-menus-masker",ref:this.maskerRef}),(0,e.jsxs)("div",{className:"exb-main-content text-center",children:[(0,e.jsx)("div",{className:"intro-transition",style:{display:this.state.isPageLoaded?"block":"none"},children:(0,e.jsx)("img",{className:"exb-logo",src:this.getImageUrl("assets/exb-logo.png"),alt:"ArcGIS Experience Builder"})}),(0,e.jsxs)("div",{className:"intro-transition2",style:{display:this.state.isPageLoaded?"block":"none"},children:[(0,e.jsxs)("div",{className:"banner-title",children:[s&&(0,e.jsxs)(t.React.Fragment,{children:[(0,e.jsx)("h1",{children:"Builder"}),(0,e.jsx)("h1",{children:"Experience"}),(0,e.jsx)("h1",{style:{position:"relative"},children:"ArcGIS"})]}),!s&&(0,e.jsxs)(t.React.Fragment,{children:[(0,e.jsx)("h1",{children:"ArcGIS"}),(0,e.jsx)("h1",{children:"Experience"}),(0,e.jsx)("h1",{style:{position:"relative"},children:"Builder"})]})]}),(0,e.jsx)("div",{className:"exb-line-break"}),(0,e.jsx)("p",{className:"exb-heading-description text-break",children:this.props.intl.formatMessage({id:"landingProductDiscribe",defaultMessage:n.landingProductDiscribe})}),(0,e.jsxs)("a",{className:"exb-learn-more-link",href:"https://www.esri.com/en-us/arcgis/products/arcgis-experience-builder/overview",children:[this.props.intl.formatMessage({id:"landingLearnMore",defaultMessage:n.landingLearnMore}),(0,e.jsx)("img",{className:(0,t.classNames)("ml-2 mb-1 ",{"icon-horizontal-revert":s}),src:this.getImageUrl("assets/arrow.svg")})]}),(0,e.jsx)("div",{className:"d-flex justify-content-center",style:{marginTop:"50px"},children:(0,e.jsx)("button",{type:"button",className:"exb-sign-btn d-flex align-items-center",onClick:this.toSignIn,"aria-label":i,children:i})})]})]}),(0,e.jsx)("div",{style:{position:"absolute",width:"100%",height:"56px",bottom:"0"},children:(0,e.jsx)("div",{className:"exb-footer",children:(0,e.jsxs)("span",{children:[(0,e.jsx)("a",{href:"https://trust.arcgis.com",className:"exb-footer-text",target:"_blank",children:this.props.intl.formatMessage({id:"landingTrustCenter",defaultMessage:n.landingTrustCenter})}),(0,e.jsx)("span",{className:"exb-footer-span",children:"\xa0\xa0|\xa0\xa0"}),(0,e.jsx)("a",{href:"https://www.esri.com/en-us/legal/overview",className:"exb-footer-text",target:"_blank",children:this.props.intl.formatMessage({id:"landingLegal",defaultMessage:n.landingLegal})}),(0,e.jsx)("span",{className:"exb-footer-text",children:"\xa0\xa0|\xa0\xa0"}),(0,e.jsx)("a",{href:"http://www.esri.com/about-esri/contact",className:"exb-footer-text",target:"_blank",children:this.props.intl.formatMessage({id:"landingContact",defaultMessage:n.landingContact})})]})})})]})]})});var r}}function l(e){i.p=e}})(),r})())}}});