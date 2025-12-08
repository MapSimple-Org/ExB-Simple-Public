System.register(["jimu-core/emotion","jimu-core","jimu-ui","jimu-ui/basic/sql-expression-runtime"],function(e,t){var s={},i={},r={},a={};return{setters:[function(e){s.jsx=e.jsx,s.jsxs=e.jsxs},function(e){i.AppMode=e.AppMode,i.ClauseDisplayType=e.ClauseDisplayType,i.ClauseOperator=e.ClauseOperator,i.ClauseSourceType=e.ClauseSourceType,i.ClauseType=e.ClauseType,i.DataSourceComponent=e.DataSourceComponent,i.DataSourceFilterChangeMessage=e.DataSourceFilterChangeMessage,i.DataSourceManager=e.DataSourceManager,i.DataSourceStatus=e.DataSourceStatus,i.Immutable=e.Immutable,i.MessageManager=e.MessageManager,i.React=e.React,i.SqlExpressionMode=e.SqlExpressionMode,i.UrlManager=e.UrlManager,i.WidgetVersionManager=e.WidgetVersionManager,i.appConfigUtils=e.appConfigUtils,i.classNames=e.classNames,i.css=e.css,i.dataSourceUtils=e.dataSourceUtils,i.defaultMessages=e.defaultMessages,i.focusElementInKeyboardMode=e.focusElementInKeyboardMode,i.getAppStore=e.getAppStore,i.lodash=e.lodash,i.moduleLoader=e.moduleLoader,i.polished=e.polished,i.utils=e.utils},function(e){r.Alert=e.Alert,r.Badge=e.Badge,r.Button=e.Button,r.Card=e.Card,r.Icon=e.Icon,r.Label=e.Label,r.Option=e.Option,r.Paper=e.Paper,r.Popper=e.Popper,r.Select=e.Select,r.Switch=e.Switch,r.WidgetPlaceholder=e.WidgetPlaceholder,r.defaultMessages=e.defaultMessages},function(e){a.SqlExpressionRuntime=e.SqlExpressionRuntime,a.getShownClauseNumberByExpression=e.getShownClauseNumberByExpression,a.getTotalClauseNumberByExpression=e.getTotalClauseNumberByExpression,a.updateSQLExpressionByVersion=e.updateSQLExpressionByVersion}],execute:function(){e((()=>{var e={14321:e=>{"use strict";e.exports=r},29435:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M14.938 8A7 7 0 0 1 1.01 9H0a8.001 8.001 0 0 0 15.938-1A8 8 0 0 0 1.02 3.98L1 .702a.5.5 0 1 0-1 .006L.031 5.9l5.128-.826a.5.5 0 0 0-.16-.987L1.819 4.6A7 7 0 0 1 14.938 8"></path></svg>'},35737:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="m14 4-6 8-6-8z"></path></svg>'},39895:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M6 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0-1a3 3 0 0 0 2.057-5.184L4.775 10.74c.374.168.789.261 1.225.261m-2.057-.816L7.225 5.26a3 3 0 0 0-3.282 4.923" clip-rule="evenodd"></path><path fill="#000" fill-rule="evenodd" d="M6 2a6 6 0 1 0 0 12h4a6 6 0 0 0 0-12zm4 1H6a5 5 0 0 0 0 10h4a5 5 0 0 0 0-10" clip-rule="evenodd"></path></svg>'},52214:e=>{e.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#000" fill-rule="evenodd" d="M18.5.995c0-.55-.43-.995-.96-.995H2.46a.94.94 0 0 0-.605.223 1.02 1.02 0 0 0-.14 1.4L6.5 7.72c.122.156.196.347.212.548l.835 10.815q.011.139.058.27a.95.95 0 0 0 1.237.582l2.112-.82a.99.99 0 0 0 .615-.797l1.325-10.062c.025-.193.105-.374.228-.52l5.141-6.087c.154-.181.238-.414.238-.655M2.5 1h14.999l-5.141 6.09-.117.153a2 2 0 0 0-.34.883l-1.325 10.062-2.035.792-.833-10.788-.02-.169a2 2 0 0 0-.402-.92L2.502 1.006z" clip-rule="evenodd"></path></svg>'},67386:e=>{"use strict";e.exports=s},76117:e=>{"use strict";e.exports=a},79244:e=>{"use strict";e.exports=i}},t={};function l(s){var i=t[s];if(void 0!==i)return i.exports;var r=t[s]={exports:{}};return e[s](r,r.exports,l),r.exports}l.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return l.d(t,{a:t}),t},l.d=(e,t)=>{for(var s in t)l.o(t,s)&&!l.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},l.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),l.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.p="";var o={};return l.p=window.jimuConfig.baseUrl,(()=>{"use strict";l.r(o),l.d(o,{__set_webpack_public_path__:()=>V,default:()=>_});var e,t,s,i=l(67386),r=l(79244),a=l(14321),n=l(76117);!function(e){e.Block="BLOCK",e.Inline="INLINE",e.Popper="POPPER"}(e||(e={})),function(e){e.Toggle="TOGGLE",e.Button="BUTTON"}(t||(t={})),function(e){e.Single="SINGLE",e.Group="GROUP",e.Custom="CUSTOM"}(s||(s={}));const p=350;function u(e,t=!1){return t?r.css`
      ${e&&"\n        width: 350px;\n        height: 54px;\n      "}
    `:e?r.css`
        width: ${p}px;
        min-height: 54px;
        max-height: 300px;
        overflow-y: auto;
        padding: 0.5rem;
        background-color: var(--sys-color-surface-paper);
        .filter-item-custom .sql-expression-builder .sql-expression-container .sql-expression-list {
          max-height: unset;
        }
      `:r.css`
        width: 100% !important;
        height: 100% !important;
        max-height: 100vh;
      `}function d(t,s){var i;const a=(0,r.getAppStore)().getState().appContext.isRTL,l="200px",o="300px",n="350px",p=(null==s?void 0:s.arrangeType)===e.Inline&&(null===(i=null==s?void 0:s.filterItems)||void 0===i?void 0:i.length)>=2;return r.css`
    .filter-items-container, &.filter-items-container {
      overflow: auto;

      .filter-item {
        /* skip case: horizontal pill items */
        padding-bottom: ${p?0:"0.5rem"};

        &.filter-item-popper{
          margin: 0.5rem;
          min-width: ${o};
          max-width: ${n};
        }

        /** custom filter - start */
        &.filter-item-custom {
          &:has(.small-mode) {
            .filter-layer-select {
              width: 100%;
              min-width: 240px;
              .layer-select {
                margin-top: 4px;
              }
            }
          }
          &:has(.medium-mode), &:has(.large-mode) {
            .filter-layer-select {
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-left: 6px;
              padding-right: 6px;
              .layer-label {
                width: 178px;
              }
              .layer-select {
                width: calc(100% - 186px);
              }
            }
          }
          .sql-expression-builder {
            .sql-expression-container {
              min-height: 110px;
              min-width: 240px;
              display: block !important;
              .sql-expression-list { /** not show scrolling bar for expr list inside widget */
                max-height: unset;
                height: unset;
                overflow-y: visible;
                .sql-expression-set {
                  display: block !important;
                }
              }
            }
          }
        }
        /** custom filter - end */

        .filter-item-inline {
          padding-bottom: 0.5rem;
          padding-top: 0.5rem;

          .filter-item-arrow{
            transform: rotate(${a?90:270}deg);
          }
          .filter-item-icon{
            margin-right: 0.5rem;

            &.no-arrow{
              margin-left: 0.5rem;
            }
          }
          .filter-item-name{
            font-size: ${r.polished.rem(13)};
            word-break: break-word;
            &.no-icons{
              margin-left: 0.5rem;
            }
            &.toggle-name{
              white-space: nowrap;
              margin-right: 0.5rem;
            }
          }

          /* sql-expression-styles - start */
          .sql-expression-inline{
            align-items: center;

            &.sql-expression-wrap{
              display: block !important;

              .sql-expression-builder{
                overflow-x: hidden;
                .sql-expression-container{
                  flex-wrap: wrap;
                  align-content: flex-start;
                  .sql-expression-set{
                    flex-wrap: wrap;
                  }
                }
              }

            }

            .sql-expression-builder{
              overflow-x: auto;
              .sql-expression-container{
                display: flex;
                .sql-expression-single{
                  margin-right: 0.5rem;
                  &:last-of-type{
                    margin-right: 0;
                  }
                  /* .clause-inline{
                    min-width: ${l};
                  }
                  .clause-block{
                    .sql-expression-input{
                      min-width: ${l};
                    }
                  }
                  .sql-expression-display-label{
                    min-width: ${l};
                  } */
                }
                .sql-expression-set{
                  display: flex;
                }
              }
            }

          }
          /* sql-expression-styles - end */

        }
      }

      .filter-item:last-child{
        padding-bottom: 0 !important;
      }

      &.filter-items-inline{
        max-width: 100vw;
        display: flex;
        .sql-expression-builder .sql-expression-container .sql-expression-single .sql-expression-input .pill-btn-container{
          .jimu-button-group {
            flex-wrap: nowrap;
            .pill-btn{
              overflow: visible;
            }
          }
        }

        &.filter-items-wrap{
          flex-wrap: wrap;
          align-content: flex-start;

          .sql-expression-builder .sql-expression-container .sql-expression-single .sql-expression-input .pill-btn-container{
            .jimu-button-group {
              flex-wrap: wrap;
            }
          }
        }
        .filter-item{
          /* padding: 0; */
          &.filter-item-popper{
            min-width: 300px;
            padding-bottom: 0.5rem;
            .filter-item-inline {
              padding-bottom: 0.5rem;
              padding-top: 0.5rem;
            }
          }
          .filter-item-inline{
            padding: 0;
            /* height: 100%; */
            overflow-y: auto;
            background-color: unset !important;
            border: none !important;

            .filter-expanded-container{
              width: ${o};
              padding-top: 0.5rem;
            }

            /* .filter-item-clause-pill{
              margin: 10px 5px;
              white-space: nowrap;
            } */

            /* .filter-popper-container{ */
              .filter-item-pill{
                margin: 10px 4px;
                white-space: nowrap;

                .sql-expression-single{
                  margin: 0;
                }

                &.filter-item-toggle-pill{
                  display: flex;
                  flex-direction: row;
                  height: 32px;
                  align-items: center;
                  padding: 0 0.5rem;
                }
              /* } */
              /* .pill-display-label{
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
              } */
            }

            /*input editor width*/
            .sql-expression-builder{
              .sql-expression-container{
                .sql-expression-single{
                  .clause-inline{
                    .sql-expression-label{
                      margin-right: 0.5rem;
                      width: auto;
                      overflow: visible;
                    }
                    .sql-expression-input{
                      width: auto;
                    }

                  }
                  /* .clause-block{ */
                    .sql-expression-input{
                      min-width: ${l};
                      .double-number-picker{
                        min-width: ${o};
                      }
                      .double-datetime-picker{
                        min-width: ${n};
                      }
                    }
                  /* } */
                  .sql-expression-display-label{
                    white-space: nowrap;
                    padding-right: 0.5rem;
                    font-size: 13px;
                  }
                }
              }
            }

          }
        }
      }

      &.filter-items-popup{
        min-width: ${o};
        max-width: ${n};
      }

      .apply-cancel-group{
        white-space: nowrap;
        overflow: visible;
      }


    }

    .filter-reset-container{
      display: flex;
      &.bottom-reset {
        margin-top: 0.5rem;
        justify-content: flex-end;
      }
      &.right-reset {
        height: fit-content;
        margin-top: 10px;
        margin-left: 0.5rem;
        margin-right: 0.25rem;
      }
    }
  `}var c=l(35737),h=l.n(c),g=function(e,t){var s={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.indexOf(i)<0&&(s[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(i=Object.getOwnPropertySymbols(e);r<i.length;r++)t.indexOf(i[r])<0&&Object.prototype.propertyIsEnumerable.call(e,i[r])&&(s[i[r]]=e[i[r]])}return s};const m=e=>{const t=window.SVG,{className:s}=e,a=g(e,["className"]),l=(0,r.classNames)("jimu-icon jimu-icon-component",s);return t?(0,i.jsx)(t,Object.assign({className:l,src:h()},a)):(0,i.jsx)("svg",Object.assign({className:l},a))},f={fallbackPlacements:["bottom-start","bottom-end","top","left","right"],fallbackStrategy:"bestFit"},x=(e,t)=>e.map((e,s)=>{var i,a,l,o,n;const p=t.find(e=>e.index===s+1);if(p){if(p.clauses)return Object.assign(Object.assign({},e),{parts:x(e.parts,p.clauses)});if(e.displayType!==r.ClauseDisplayType.UseAskForValue)return e;{let t=null;const s=null===(i=e.valueOptions)||void 0===i?void 0:i.sourceType;return s===r.ClauseSourceType.SingleSelectFromPredefined?t=null===(l=null===(a=e.valueOptions)||void 0===a?void 0:a.value)||void 0===l?void 0:l.map(e=>Object.assign({},e,{selected:e.value===p.values})):s===r.ClauseSourceType.MultipleSelectFromPredefined?t=null===(n=null===(o=e.valueOptions)||void 0===o?void 0:o.value)||void 0===n?void 0:n.map(e=>Object.assign({},e,{selected:p.values.includes(e.value)})):(p.values||"number"==typeof p.values)&&(t=Array.isArray(p.values)?b(e.operator)?[{value:p.values[0],label:p.values[1]}]:p.values.map(t=>O(e.operator)?t?{value:t,label:t+""}:null:{value:t,label:t+""}):[{value:p.values,label:p.label||p.values+""}]),Object.assign(Object.assign({},e),{valueOptions:Object.assign(Object.assign({},e.valueOptions),{value:t})})}}return e}),S=(e,t,i=!1)=>{if(e.type===s.Custom)return null;if(!t.autoApplyWhenWidgetOpen&&e.autoApplyWhenWidgetOpen||i){let i,a;return e.type===s.Single?(i=e.sqlExprObj.parts,a=t.sqlExprObj.parts):(i=[e.sqlExprObjForGroup[0].clause],a=[t.sqlExprObjForGroup[0].clause]),{name:e.name,clauses:i.map((e,t)=>{const s=a[t];if(e.type===r.ClauseType.Set){const i=e.parts.map((e,t)=>y(e,s.parts[t],t)).filter(e=>null!==e);return i.length>0?{index:t+1,clauses:i}:null}return y(e,s,t)}).filter(e=>null!==e)}}return null},v=e=>null==e?void 0:e.map(e=>{var t;return!1!==(null==e?void 0:e.selected)&&null!==(t=null==e?void 0:e.value)&&void 0!==t?t:null}),y=(e,t,s)=>{var i,a,l,o,n,p,u,d,c,h,g,m,f,x;const S=v(null===(i=e.valueOptions)||void 0===i?void 0:i.value),y=v(null===(a=t.valueOptions)||void 0===a?void 0:a.value),{isEqual:O}=r.utils.diffArrays(!0,S,y);if(O)return null;{let t=S;t&&0!==t.length?1===t.length&&(t=t[0]):t=null,b(e.operator)&&(t=[t,null===(n=null===(o=null===(l=e.valueOptions)||void 0===l?void 0:l.value)||void 0===o?void 0:o[0])||void 0===n?void 0:n.label]);const i={index:s+1,values:t};return(null===(p=e.valueOptions)||void 0===p?void 0:p.sourceType)===r.ClauseSourceType.SingleSelectFromUnique?i.label=null===(c=null===(d=null===(u=e.valueOptions)||void 0===u?void 0:u.value)||void 0===d?void 0:d.find(e=>e.value===t))||void 0===c?void 0:c.label:(null===(h=e.valueOptions)||void 0===h?void 0:h.sourceType)===r.ClauseSourceType.SingleSelectFromPredefined?(i.values=t.filter(e=>null!==e)[0],i.label=null===(f=null===(m=null===(g=e.valueOptions)||void 0===g?void 0:g.value)||void 0===m?void 0:m.find(e=>e.value===i.values))||void 0===f?void 0:f.alias):(null===(x=e.valueOptions)||void 0===x?void 0:x.sourceType)===r.ClauseSourceType.MultipleSelectFromPredefined&&(i.values=t.filter(e=>null!==e)),i}},b=e=>e===r.ClauseOperator.DateOperatorIsInTheLast||e===r.ClauseOperator.DateOperatorIsNotInTheLast||e===r.ClauseOperator.DateOperatorIsInTheNext||e===r.ClauseOperator.DateOperatorIsNotInTheNext,O=e=>e===r.ClauseOperator.DateOperatorIsBetween||e===r.ClauseOperator.DateOperatorIsNotBetween,j=e=>e.length>0?JSON.stringify(e):null,w=Object.assign({},r.defaultMessages,a.defaultMessages);class I extends r.React.PureComponent{constructor(l){super(l),this.loadSqlExpressionBuilder=()=>{this.props.config.type!==s.Custom||this.state.SqlExpressionBuilder||r.moduleLoader.loadModule("jimu-ui/advanced/sql-expression-builder").then(e=>{this.setState({SqlExpressionBuilder:null==e?void 0:e.SqlExpressionBuilder})})},this.getSqlExprObjFromItem=()=>{const{selectedDs:e,config:t}=this.props;let i=t.sqlExprObj;return t.type===s.Group&&(i=r.dataSourceUtils.getDisplayedSQLExpressionFromGroupSQLExpression(t.sqlExprObjForGroup,e,this.formatMessage)),i},this.formatMessage=(e,t)=>this.props.intl.formatMessage({id:e,defaultMessage:w[e]},t),this.getOutPutWidgetLabel=()=>{var e;return null===(e=(0,r.getAppStore)().getState().appConfig.widgets[r.appConfigUtils.getWidgetIdByOutputDataSource(this.props.useDataSource)])||void 0===e?void 0:e.label},this.getAppliedState=()=>{let e=this.props.config.autoApplyWhenWidgetOpen||!1;return this.props.omitInternalStyle&&1===this.endUserClausesNum&&1===this.clausesNumConfigured&&(e=!0),e},this.onCollapsedChange=()=>{this.setState({collapsed:!this.state.collapsed}),this.props.onFilterItemCollapseChange(this.props.id,!this.state.collapsed)},this.onApplyChange=e=>{this.setState({sqlChanged:!1}),this.props.onChange(this.props.id,this.props.selectedDs,this.state.sqlExprObj,e)},this.onToggleChange=e=>{this.setState({applied:e}),this.onApplyChange(e)},this.onPillClick=(e,t)=>{if(e)this.setState({popperVersion:this.state.isOpen?this.state.popperVersion:this.state.popperVersion+1}),this.onTogglePopper();else{const e=t.className.indexOf("active")<0;this.onToggleChange(!!e)}},this.onSqlExpressionChange=(e,s)=>{var i;const{omitInternalStyle:r,id:a,selectedDs:l,triggerType:o,onChange:n}=this.props;let p=l,u=(null===(i=this.getSqlExprObjFromItem())||void 0===i?void 0:i.sql)!==(null==e?void 0:e.sql);s&&(p=s,u=!0),this.setState({sqlExprObj:e,sqlChanged:!(o!==t.Button||r||!u)}),(s||o===t.Toggle||r)&&n(a,p,e,this.state.applied)},this.onTogglePopper=()=>{this.state.isOpen&&r.lodash.defer(()=>{(0,r.focusElementInKeyboardMode)(this.pillButton)}),this.setState({isOpen:!this.state.isOpen})},this.getFilterItem=(l,o=!1)=>{const{config:n,triggerType:p,arrangeType:u,filterNum:d,omitInternalStyle:c,wrap:h}=this.props,{icon:g,name:f,type:x}=n;return(0,i.jsxs)("div",{className:"h-100",children:[(0,i.jsxs)("div",{className:(0,r.classNames)("d-flex justify-content-between w-100 pr-2 align-items-center",o?"flex-row-reverse":""),children:[!o&&l&&(0,i.jsx)(a.Button,{"aria-label":this.formatMessage(this.state.collapsed?"expand":"collapse"),"aria-expanded":!this.state.collapsed,size:"sm",icon:!0,variant:"text",color:"inherit",className:"filter-item-expand-icon jimu-outline-inside",onClick:this.onCollapsedChange,children:(0,i.jsx)(m,{className:this.state.collapsed?"filter-item-arrow":"",size:"s"})}),!o&&g&&(0,i.jsx)("div",{className:(0,r.classNames)("filter-item-icon",l?"":"no-arrow"),children:(0,i.jsx)(a.Icon,{icon:g.svg,size:g.properties.size,"aria-hidden":"true"})}),(0,i.jsxs)(a.Label,{check:!0,className:(0,r.classNames)("d-flex",{"flex-grow-1":!o}),children:[!o&&(0,i.jsx)("div",{className:(0,r.classNames)("filter-item-name flex-grow-1",l||g?"":"no-icons"),children:f}),p===t.Toggle&&(0,i.jsx)("div",{className:"ml-1 d-flex align-items-center",children:this.getToggle()})]})]}),(this.state.sqlExprObj||x===s.Custom)&&(0,i.jsx)("div",{className:(0,r.classNames)("w-100 pl-6 pr-6",{"d-none":this.state.collapsed,"sql-expression-inline":u===e.Inline&&1===d&&c,"sql-expression-wrap":u===e.Inline&&1===d&&h}),children:this.getSqlExpression()}),p===t.Button&&(0,i.jsx)("div",{className:"d-flex justify-content-end pl-5 pr-5 pt-2 pb-2",children:this.getApplyButtons()})]})},this.isDataSourceError=()=>null===this.props.selectedDs,this.isOutputFromWidget=()=>{var e;return null===(e=this.props.selectedDs)||void 0===e?void 0:e.getDataSourceJson().isOutputFromWidget},this.isOutputDataSourceValid=()=>this.isOutputFromWidget()&&!this.props.isNotReadyFromWidget,this.isOutputDataSourceInvalid=()=>this.isOutputFromWidget()&&this.props.isNotReadyFromWidget,this.isDataSourceValid=()=>this.props.selectedDs&&(this.isOutputFromWidget()&&!this.props.isNotReadyFromWidget||!this.isOutputDataSourceInvalid()),this.isDataSourceLoadingOrInvalid=()=>!this.isDataSourceValid(),this.getErrorIcon=()=>{if(this.isDataSourceError())return(0,i.jsx)(a.Alert,{variant:"text",form:"tooltip",size:"small",type:"error",text:this.formatMessage("dataSourceCreateError"),className:"mr-2"});if(this.isOutputDataSourceInvalid()){const e=this.formatMessage("outputDataIsNotGenerated",{outputDsLabel:this.props.selectedDs.getLabel(),sourceWidgetName:this.state.outputWidgetLabel});return(0,i.jsx)(a.Alert,{variant:"text",form:"tooltip",size:"small",type:"warning",text:e,className:"mr-2"})}return null},this.getToggle=()=>(0,i.jsxs)(r.React.Fragment,{children:[this.getErrorIcon(),(0,i.jsx)(a.Switch,{checked:this.state.applied,disabled:this.isDataSourceLoadingOrInvalid(),"aria-label":this.props.config.name,onChange:e=>{this.onToggleChange(e.target.checked)}})]}),this.getApplyButtons=()=>(0,i.jsxs)("div",{className:"w-100 d-flex justify-content-end apply-cancel-group",children:[this.getErrorIcon(),(0,i.jsx)(a.Button,{type:"primary",className:"filter-apply-button wrap",disabled:this.isDataSourceLoadingOrInvalid()||!(!this.state.applied||this.state.sqlChanged),onClick:()=>{this.onApplyChange(!0)},children:this.formatMessage("apply")}),(0,i.jsx)(a.Button,{type:"default",className:"filter-cancel-button ml-2",disabled:this.isDataSourceLoadingOrInvalid()||!this.state.applied,onClick:()=>{this.onApplyChange(!1)},children:this.formatMessage("cancel")})]}),this.getTriggerNodeForClauses=(e=this.props.triggerType)=>{let s=null;switch(e){case t.Toggle:s=this.getToggle();break;case t.Button:s=this.getApplyButtons()}return s},this.getSqlExpression=()=>this.isDataSourceValid()?this.props.config.type===s.Custom?this.getCustomSqlExpressionBuilder():(0,i.jsx)(n.SqlExpressionRuntime,{widgetId:this.props.widgetId,dataSource:this.props.selectedDs,expression:this.state.sqlExprObj,onChange:this.onSqlExpressionChange}):null,this.getCustomSqlExpressionBuilder=()=>{const{widgetId:e,config:s,triggerType:l,dataSources:o,selectedDs:n}=this.props;return(0,i.jsxs)("div",{children:[(0,i.jsxs)("div",{className:"filter-layer-select mt-3 mb-3",children:[(0,i.jsx)("div",{className:"layer-label",children:this.formatMessage("selectLayer")}),(0,i.jsx)(a.Select,{className:"layer-select","aria-label":this.formatMessage("selectLayer"),title:(null==n?void 0:n.getLabel())||"",value:n.id,onChange:e=>{this.state.applied&&s.sqlExprObj&&this.onSqlExpressionChange(null,n),setTimeout(()=>{this.setState({applied:l!==t.Button&&this.state.applied},()=>{this.onSqlExpressionChange(null,o[e.target.value])})},0)},children:s.useDataSources.map(e=>{var t;const s=null===(t=o[e.dataSourceId])||void 0===t?void 0:t.getLabel();return(0,i.jsx)(a.Option,{value:e.dataSourceId,active:n.id===e.dataSourceId,children:s},e.dataSourceId)})})]}),n&&this.state.SqlExpressionBuilder&&(0,i.jsx)(this.state.SqlExpressionBuilder,{mode:r.SqlExpressionMode.Simple,widgetId:e,dataSource:n,forceUpdateExpression:!this.state.sqlExprObj,expression:this.state.sqlExprObj,onChange:this.onSqlExpressionChange})]})},this.getTriggerNodeForWrapClauses=e=>e===this.props.triggerType&&this.isSingleFilterAndMultipleClauses()&&this.props.wrap&&(0,i.jsx)("div",{className:"d-flex flex-row-reverse",children:this.getTriggerNodeForClauses(e)}),this.getTriggerNodeForNoWrapClause=()=>this.isSingleFilterAndMultipleClauses()&&!this.props.wrap&&(0,i.jsx)("div",{className:"ml-4",children:this.getTriggerNodeForClauses()});const{collapseFilterExprs:o}=this.props.config,p=this.getSqlExprObjFromItem();this.endUserClausesNum=(0,n.getShownClauseNumberByExpression)(p),this.clausesNumConfigured=(0,n.getTotalClauseNumberByExpression)(p),this.state={isOpen:!1,applied:this.getAppliedState(),collapsed:o,sqlExprObj:p,sqlChanged:!1,outputWidgetLabel:this.getOutPutWidgetLabel(),popperVersion:1,SqlExpressionBuilder:null}}componentDidMount(){this.loadSqlExpressionBuilder()}componentDidUpdate(e,t){const{config:s,logicalOperator:i,omitInternalStyle:r,useDataSource:a,selectedDs:l}=this.props,o=this.getSqlExprObjFromItem();this.endUserClausesNum=(0,n.getShownClauseNumberByExpression)(o),this.clausesNumConfigured=(0,n.getTotalClauseNumberByExpression)(o),e.config!==s||e.selectedDs!==l?(this.setState({applied:this.getAppliedState(),collapsed:e.config.collapseFilterExprs!==s.collapseFilterExprs?s.collapseFilterExprs:this.state.collapsed,sqlExprObj:l?o:null,outputWidgetLabel:a.dataSourceId===e.useDataSource.dataSourceId?this.state.outputWidgetLabel:this.getOutPutWidgetLabel()}),this.loadSqlExpressionBuilder()):e.logicalOperator===i&&e.omitInternalStyle===r||this.setState({applied:this.getAppliedState()})}isSingleFilterAndMultipleClauses(){return 1===this.props.filterNum&&this.clausesNumConfigured>1&&this.endUserClausesNum>=1}isSingleFilterAndSingleShownClause(){return 1===this.props.filterNum&&1===this.clausesNumConfigured&&1===this.endUserClausesNum}isMultipleFiltersAndSingleShownClause(){return this.props.filterNum>1&&1===this.clausesNumConfigured&&1===this.endUserClausesNum}render(){const{config:l,arrangeType:o,triggerType:n,omitInternalStyle:u,wrap:c,isInPopup:h,theme:g,id:m,a11yLabel:x}=this.props,{name:S,icon:v,type:y}=l,b=y===s.Custom,O=b||this.endUserClausesNum>=1;return(0,i.jsx)("div",{className:(0,r.classNames)("filter-item",{"filter-item-custom":b}),role:"group","aria-label":`${0===m?x:""}. ${S}`,children:(0,i.jsx)(a.Paper,{variant:"outlined",shape:"shape2",transparent:h,className:"filter-item-inline",children:o===e.Block?(0,i.jsx)("div",{className:"w-100",children:u&&(this.isSingleFilterAndSingleShownClause()||this.isMultipleFiltersAndSingleShownClause())?(0,i.jsx)("div",{className:"w-100 pl-6 pr-6",children:this.getSqlExpression()}):(0,i.jsx)("div",{className:"filter-expanded-container",children:this.getFilterItem(O)})}):(0,i.jsx)(r.React.Fragment,{children:this.isSingleFilterAndSingleShownClause()?(0,i.jsxs)("div",{className:"sql-expression-inline d-flex",children:[this.getSqlExpression(),!u&&(0,i.jsx)("div",{className:"ml-4",children:this.getTriggerNodeForClauses()})]}):(0,i.jsx)(r.React.Fragment,{children:this.isSingleFilterAndMultipleClauses()||this.isMultipleFiltersAndSingleShownClause()&&u?(0,i.jsxs)("div",{className:(0,r.classNames)("sql-expression-inline d-flex",{"sql-expression-wrap":c,"filter-item-pill":this.isMultipleFiltersAndSingleShownClause()}),children:[this.getTriggerNodeForWrapClauses(t.Toggle),this.getSqlExpression(),this.getTriggerNodeForWrapClauses(t.Button),this.getTriggerNodeForNoWrapClause()]}):(0,i.jsxs)("div",{className:"filter-popper-container",children:[n!==t.Toggle||0!==this.endUserClausesNum||b?(0,i.jsx)("div",{className:"filter-item-pill h-100 nowrap",children:(0,i.jsxs)(a.Button,{className:(0,r.classNames)("",{"frame-active":this.state.applied}),title:S,ref:e=>{this.pillButton=e},type:"default","aria-pressed":this.state.applied,onClick:e=>{this.onPillClick(O,this.pillButton)},children:[v&&(0,i.jsx)(a.Icon,{icon:v.svg,size:v.properties.size}),S]})}):(0,i.jsxs)(a.Card,{className:"filter-item-pill filter-item-toggle-pill",children:[v&&(0,i.jsx)(a.Icon,{icon:v.svg,size:v.properties.size,className:"mr-1"}),(0,i.jsxs)(a.Label,{check:!0,children:[(0,i.jsx)("span",{className:"filter-item-name toggle-name",children:S}),this.getToggle()]})]}),O&&(0,i.jsx)(a.Popper,{open:this.state.isOpen,toggle:this.onTogglePopper,sizeOptions:!0,autoUpdate:!0,flipOptions:f,arrowOptions:!0,reference:this.pillButton,autoFocus:this.state.popperVersion>1,forceLatestFocusElements:n===t.Button,children:(0,i.jsx)("div",{className:"filter-items-container",css:d(),style:{width:p},children:(0,i.jsx)("div",{className:(0,r.classNames)("filter-item filter-item-popper",{"filter-item-custom":b}),children:(0,i.jsxs)(a.Paper,{variant:"outlined",shape:"shape2",className:"filter-item-inline",children:[this.getFilterItem(O,o!==e.Popper),n===t.Button&&(0,i.jsx)(a.Button,{className:"sr-only","aria-label":this.formatMessage("pressTabToContinue")})]})})})})]})})})})})}}class C extends r.React.PureComponent{constructor(){super(...arguments),this.onDataSourceCreated=e=>{this.props.onCreateDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId,e)},this.onDataSourceInfoChange=e=>{this.props.onIsDataSourceNotReady(this.props.useDataSource.dataSourceId,null==e?void 0:e.status)},this.onCreateDataSourceFailed=()=>{this.props.onCreateDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId,null)}}componentWillUnmount(){this.props.onCreateDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId,null),this.props.onIsDataSourceNotReady(this.props.useDataSource.dataSourceId,r.DataSourceStatus.NotReady)}render(){const{useDataSource:e}=this.props;return(0,i.jsx)(r.DataSourceComponent,{useDataSource:e,onDataSourceCreated:this.onDataSourceCreated,onCreateDataSourceFailed:this.onCreateDataSourceFailed,onDataSourceInfoChange:this.onDataSourceInfoChange})}}const N="Filter",q=(e,t)=>{let s=[];return e.forEach(e=>{e.useDataSources.some(e=>!(e.dataSourceId!==t||!e.fields)&&(s=s.concat(e.fields),!0))}),s=Array.from(new Set(s)).sort(),s};var E=function(e,t,s,i){return new(s||(s=Promise))(function(r,a){function l(e){try{n(i.next(e))}catch(e){a(e)}}function o(e){try{n(i.throw(e))}catch(e){a(e)}}function n(e){var t;e.done?r(e.value):(t=e.value,t instanceof s?t:new s(function(e){e(t)})).then(l,o)}n((i=i.apply(e,t||[])).next())})};class D extends r.WidgetVersionManager{constructor(){super(...arguments),this.versions=[{version:"1.1.0",description:"",upgrader:s=>E(this,void 0,void 0,function*(){return yield function(e){return E(this,void 0,void 0,function*(){const t=[],s=r.DataSourceManager.getInstance();return e&&e.forEach(e=>{e.sqlExprObj&&t.push(s.createDataSourceByUseDataSource(Object.assign({},e.dataSource,{mainDataSourceId:e.dataSource.dataSourceId})))}),Promise.all(t)})}(s.filterItems).then(i=>{let r=s;r=r.set("arrangeType",e.Block),r=r.set("triggerType",t.Toggle),r=r.set("wrap",!1),r=r.set("omitInternalStyle",!1);const a=i.map((e,t)=>{const s=r.filterItems[t];return Object.assign({},s,{sqlExprObj:s.sqlExprObj?(0,n.updateSQLExpressionByVersion)(s.sqlExprObj,"1.1.0",e):null,icon:s.icon.setIn(["properties","color"],null),useDataSource:Object.assign({},s.dataSource,{mainDataSourceId:s.dataSource.dataSourceId})})});return r=r.set("filterItems",a),r})})},{version:"1.14.0",description:"",upgrader:e=>{const t=e.filterItems.map(e=>e=e.set("isGroup",!1).set("useDataSources",[e.useDataSource]).without("useDataSource"));return e.set("filterItems",t)}},{version:"1.16.0",description:"",upgrader:e=>{const t=e.filterItems.map(e=>e.set("type",e.isGroup?"GROUP":"SINGLE").without("isGroup"));return e.set("filterItems",t)}},{version:"1.17.0",description:"Remove custom and groupByLayer from config, update widget useDss fields from group filter items",upgradeFullInfo:!0,upgrader:e=>{var t;const i=e.widgetJson.config.without("custom").without("groupByLayer");let r=e.widgetJson.set("config",i);if((null===(t=i.filterItems)||void 0===t?void 0:t.length)&&i.filterItems.filter(e=>e.type===s.Group).length){const t=e.widgetJson.useDataSources.asMutable({deep:!0});t.forEach(e=>{const t=q(i.filterItems,e.dataSourceId);e.fields=t}),r=r.set("useDataSources",t)}return Object.assign(Object.assign({},e),{widgetJson:r})}}]}}const F=new D;var T=l(39895),M=l.n(T),A=function(e,t){var s={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.indexOf(i)<0&&(s[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(i=Object.getOwnPropertySymbols(e);r<i.length;r++)t.indexOf(i[r])<0&&Object.prototype.propertyIsEnumerable.call(e,i[r])&&(s[i[r]]=e[i[r]])}return s};const P=e=>{const t=window.SVG,{className:s}=e,a=A(e,["className"]),l=(0,r.classNames)("jimu-icon jimu-icon-component",s);return t?(0,i.jsx)(t,Object.assign({className:l,src:M()},a)):(0,i.jsx)("svg",Object.assign({className:l},a))};var B=l(29435),L=l.n(B),R=function(e,t){var s={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.indexOf(i)<0&&(s[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(i=Object.getOwnPropertySymbols(e);r<i.length;r++)t.indexOf(i[r])<0&&Object.prototype.propertyIsEnumerable.call(e,i[r])&&(s[i[r]]=e[i[r]])}return s};const U=e=>{const t=window.SVG,{className:s}=e,a=R(e,["className"]),l=(0,r.classNames)("jimu-icon jimu-icon-component",s);return t?(0,i.jsx)(t,Object.assign({className:l,src:L()},a)):(0,i.jsx)("svg",Object.assign({className:l},a))};var W;const k=l(52214);class G extends r.React.PureComponent{constructor(l){super(l),this.getFilterItemsByURLParameters=()=>{const{config:e,urlParams:t}=this.props;if(!t)return e.filterItems;const i=((e,t)=>e.asMutable({deep:!0}).map(e=>{const i=t.find(t=>t.name===e.name);if(!i)return e;const r={};return e.type===s.Single?r.sqlExprObj=Object.assign(Object.assign({},e.sqlExprObj),{parts:x(e.sqlExprObj.parts,i.clauses)}):r.sqlExprObjForGroup=[Object.assign(Object.assign({},e.sqlExprObjForGroup[0]),{clause:x([e.sqlExprObjForGroup[0].clause],i.clauses)[0]}),...e.sqlExprObjForGroup.slice(1)],Object.assign(Object.assign(Object.assign({},e),{autoApplyWhenWidgetOpen:!0}),r)}))(e.filterItems,t);return(0,r.Immutable)(i)},this.setURLParametersByWidget=(e,t=this.state.filterItems)=>{const{id:s,config:i}=this.props,r=((e,t,s,i)=>(t.forEach((r,a)=>{if(i[r.name]&&a!==e)return;let l=null;a===e?l=S(t[a],s[a],t[a].autoApplyWhenWidgetOpen):r.autoApplyWhenWidgetOpen&&(l=S(t[a],s[a],!0)),l?i[r.name]=l:delete i[r.name]}),i))(e,t,i.filterItems,this.cachedURLParams);this.cachedURLParams=r;const a=Object.keys(this.cachedURLParams).map(e=>this.cachedURLParams[e]),l=j(a);this.urlManager.setWidgetUrlParams(s,{filters:l})},this.onFilterItemCollapseChange=(e,t)=>{if(this.__unmount)return;const s=this.state.filterItems,i=s.set(e,s[e].set("collapseFilterExprs",t));this.setState({filterItems:i})},this.onFilterItemChange=(e,t,i,r)=>{if(this.__unmount)return;const a=this.state.filterItems;let l=a[e].set("autoApplyWhenWidgetOpen",r);if(l.type===s.Single)l=l.set("sqlExprObj",i);else if(l.type===s.Custom){const e=l.useDataSources.map(e=>Object.assign({},e,{checked:e.dataSourceId===t.id}));l=l.set("sqlExprObj",i).set("useDataSources",e)}else l.sqlExprObjForGroup&&(l=l.setIn(["sqlExprObjForGroup","0","clause","valueOptions","value"],i.parts[0].valueOptions.value));const o=a.set(e,l);this.setState({filterItems:o});if(!(!r&&!a[e].autoApplyWhenWidgetOpen)){const i={};if(i[t.id]=t,l.type===s.Group&&l.sqlExprObjForGroup){l.useDataSources.map(e=>e.dataSourceId).forEach(e=>{i[e]=this.state.dataSources[e]})}this.setSqlToAllDs(i,o),this.setURLParametersByWidget(e,o)}},this.setSqlToAllDs=(e=this.state.dataSources,t=this.props.config.filterItems)=>{const s=[];Object.keys(e).forEach(i=>{var r,a;const l=e[i];if(l){const e=(null===(a=null===(r=l.getInfo().widgetQueries)||void 0===r?void 0:r[this.props.id])||void 0===a?void 0:a.where)||"",i=this.getQuerySqlFromDs(l,t);this.setSqlToDs(l,i),e!==i.sql&&s.push(l.id)}}),s.length>0&&this.publishFilterMessage(s)},this.setSqlToDs=(e,t)=>{var s,i;if((!this._autoApplyInit||""!==t.sql)&&e){const r={where:t.sql,sqlExpression:t.sqlExpression};null===(i=(s=e).updateQueryParams)||void 0===i||i.call(s,r,this.props.id)}},this.publishFilterMessage=e=>{r.MessageManager.getInstance().publishMessage(new r.DataSourceFilterChangeMessage(this.props.id,e))},this.getQuerySqlFromDs=(e,t=this.props.config.filterItems)=>{const i=[];t.forEach(t=>{if(t.autoApplyWhenWidgetOpen||this.props.config.omitInternalStyle&&1===(0,n.getShownClauseNumberByExpression)(t.sqlExprObj)){const a=t.type===s.Group?r.dataSourceUtils.getSQLExpressionFromGroupSQLExpression(t.sqlExprObjForGroup,e):t.useDataSources.filter(t=>t.dataSourceId===(null==e?void 0:e.id)).length&&t.sqlExprObj;if(a){const t=r.dataSourceUtils.getArcGISSQL(a,e);t.sql&&i.push(t.sqlExpression)}}});let a=i[0]||null;return i.length>1&&(a=r.dataSourceUtils.getMergedSQLExpressions(i,e,this.props.config.logicalOperator)),{sql:(null==a?void 0:a.sql)||"",sqlExpression:a}},this.getDataSourceById=e=>{const t=this.props.useDataSources.asMutable({deep:!0}).filter(t=>t.dataSourceId===e);return(0,r.Immutable)(t[0])},this.isDataSourceRemoved=e=>{var t;return 0===(null===(t=this.props.useDataSources)||void 0===t?void 0:t.filter(t=>e===t.dataSourceId).length)},this.onTurnOffAllChange=()=>{const e=this.state.filterItems.map(e=>e.set("autoApplyWhenWidgetOpen",!1).asMutable({deep:!0}));this.setState({filterItems:e}),this.setSqlToAllDs(this.state.dataSources,e),this.clearURLParameters()},this.onResetChange=()=>{if(this.props.urlParams){const e=this.getFilterItemsByURLParameters();this.setState({filterItems:e}),this.setSqlToAllDs(this.state.dataSources,e),this.resetURLParameters()}else this.setState({filterItems:this.props.config.filterItems}),this.setSqlToAllDs(),this.clearURLParameters()},this.clearURLParameters=()=>{this.cachedURLParams={},this.urlManager.setWidgetUrlParams(this.props.id,null)},this.resetURLParameters=()=>{this.cachedURLParams={};const e=j(this.props.urlParams);this.urlManager.setWidgetUrlParams(this.props.id,{filters:e})},this.showToolsAtBottom=(t,s,i,r)=>{let a=!0;return t&&s===e.Inline&&!i&&(r.length>1||1===r.length&&0===(0,n.getShownClauseNumberByExpression)(r[0].sqlExprObj))&&(a=!1),a},this.getItemUseDs=e=>{let t=e.useDataSources[0];return e.type===s.Custom?t=e.useDataSources.filter(e=>e.checked)[0]||t:e.type===s.Group&&e.sqlExprObjForGroup&&(t=e.useDataSources.filter(t=>t.dataSourceId===e.sqlExprObjForGroup[0].dataSourceId)[0]),t},this.getFilterItems=(l,o=e.Block,n=!1,p=!1)=>{const u=this.showToolsAtBottom(l.resetAll||l.turnOffAll,o,n,l.filterItems);return(0,i.jsxs)("div",{className:(0,r.classNames)("w-100 h-100 d-flex justify-content-between",u?"flex-column":"flex-row"),css:d(this.props.theme,this.props.config),children:[(0,i.jsx)("div",{className:(0,r.classNames)("w-100 filter-items-container",o&&l.arrangeType===e.Inline?"filter-items-inline":"",n?"filter-items-wrap":"",p?"filter-items-popup":""),children:this.state.filterItems.map((e,t)=>{const r=this.getItemUseDs(e),a=this.isDataSourceRemoved(r.dataSourceId)?null:this.state.dataSources[r.dataSourceId],u=this.state.outputDataSourceIsNotReady[r.dataSourceId];return(0,i.jsx)(I,{id:t,a11yLabel:this.props.a11yLabel,widgetId:this.props.id,intl:this.props.intl,selectedDs:a,useDataSource:r,isInPopup:p,dataSources:e.type===s.Custom&&this.state.dataSources,isNotReadyFromWidget:u,logicalOperator:l.logicalOperator,config:e,arrangeType:o,triggerType:l.triggerType,wrap:n,omitInternalStyle:l.omitInternalStyle,filterNum:this.state.filterItems.length,onChange:this.onFilterItemChange,onFilterItemCollapseChange:this.onFilterItemCollapseChange,theme:this.props.theme},t)})}),(l.resetAll||l.turnOffAll)&&(0,i.jsxs)("div",{className:(0,r.classNames)("filter-reset-container",u?"bottom-reset":"right-reset"),children:[l.turnOffAll&&(0,i.jsx)(a.Button,{icon:!0,type:"default",size:"default",className:"turnoff-button jimu-outline-inside"+(l.resetAll?" mr-1":""),style:{borderRadius:l.triggerType===t.Toggle?"16px":null},title:this.props.intl.formatMessage({id:"turnOffAllFilters",defaultMessage:a.defaultMessages.turnOffAllFilters}),"aria-label":this.props.intl.formatMessage({id:"turnOffAllFilters",defaultMessage:a.defaultMessages.turnOffAllFilters}),onClick:this.onTurnOffAllChange,children:(0,i.jsx)(P,{})}),l.resetAll&&(0,i.jsx)(a.Button,{icon:!0,type:"default",size:"default",className:"reset-button jimu-outline-inside",style:{borderRadius:l.triggerType===t.Toggle?"16px":null},title:this.props.intl.formatMessage({id:"resetAllFilters",defaultMessage:a.defaultMessages.resetAllFilters}),"aria-label":this.props.intl.formatMessage({id:"resetAllFilters",defaultMessage:a.defaultMessages.resetAllFilters}),onClick:this.onResetChange,children:(0,i.jsx)(U,{})})]})]})},this.onShowPopper=()=>{this.setState({isOpen:!this.state.isOpen,popperVersion:this.state.isOpen?this.state.popperVersion:this.state.popperVersion+1})},this.onTogglePopper=()=>{this.setState({isOpen:!1}),(0,r.focusElementInKeyboardMode)(this.widgetIconRef)},this.checkIfAnyFiltersApplied=()=>{var e;const{omitInternalStyle:t}=this.props.config,i=((null===(e=this.state)||void 0===e?void 0:e.filterItems)||this.props.config.filterItems).some(e=>{var i,a,l;const o=e.type===s.Group?r.dataSourceUtils.getSQLExpressionFromGroupSQLExpression(e.sqlExprObjForGroup,this.state.dataSources[null===(i=e.sqlExprObjForGroup)||void 0===i?void 0:i[0].dataSourceId]):e.sqlExprObj;if(e.type!==s.Custom&&t&&1===(0,n.getTotalClauseNumberByExpression)(o)&&1===(0,n.getShownClauseNumberByExpression)(o)){const t=e.type===s.Group?null===(l=this.state.dataSources[null===(a=e.sqlExprObjForGroup)||void 0===a?void 0:a[0].dataSourceId])||void 0===l?void 0:l.id:e.useDataSources[0].dataSourceId;return""!==(this.state.dataSources[t]?r.dataSourceUtils.getArcGISSQL(o,this.state.dataSources[t]).sql:o.sql)}return e.autoApplyWhenWidgetOpen});return i},this.onIsDataSourceNotReady=(e,t)=>{this.setState(s=>{var i;if(!(null===(i=s.dataSources[e])||void 0===i?void 0:i.getDataSourceJson().isOutputFromWidget))return;const a=Object.assign({},s.outputDataSourceIsNotReady);return a[e]=t===r.DataSourceStatus.NotReady,{outputDataSourceIsNotReady:a}})},this.onCreateDataSourceCreatedOrFailed=(e,t)=>{this.setState(s=>{const i=Object.assign({},s.dataSources);return i[e]=t,{dataSources:i}})},this.applyAutoFiltersAtStart=()=>{var e;if(this._autoApplyInit){Object.keys(this.state.dataSources).map(()=>!0).length===(null===(e=this.props.useDataSources)||void 0===e?void 0:e.length)&&setTimeout(()=>{this.setSqlToAllDs(void 0,this.props.urlParams?this.state.filterItems:void 0),this._autoApplyInit=!1},0)}},this.__unmount=!1,this.index=0,this._autoApplyInit=!0,this.urlManager=r.UrlManager.getInstance(),this.cachedURLParams={},this.state={popperVersion:1,isOpen:!1,filterItems:this.getFilterItemsByURLParameters(),dataSources:{},outputDataSourceIsNotReady:{}}}componentWillUnmount(){this.__unmount=!0;const e=[];Object.keys(this.state.dataSources).forEach(t=>{var s,i;const r=this.state.dataSources[t];r&&(null===(i=null===(s=r.getInfo().widgetQueries)||void 0===s?void 0:s[this.props.id])||void 0===i?void 0:i.where)&&(null==r||r.updateQueryParams(null,this.props.id),e.push(r.id))}),e.length>0&&this.publishFilterMessage(e)}componentDidUpdate(e,t){this.__unmount||(this._autoApplyInit=!1,e.config!==this.props.config?(this.setState({filterItems:this.props.config.filterItems}),this.setSqlToAllDs()):this.state.dataSources!==t.dataSources&&(this._autoApplyInit=!0,this.applyAutoFiltersAtStart()))}render(){var s;const{config:r,icon:l,label:o}=this.props,n=this.props.controllerWidgetId&&this.props.offPanel;return 0===this.state.filterItems.length?(0,i.jsx)(a.WidgetPlaceholder,{icon:k,widgetId:this.props.id,css:u(n),name:this.props.intl.formatMessage({id:"_widgetLabel",defaultMessage:N})}):(0,i.jsxs)("div",{className:"jimu-widget widget-filter overflow-auto",children:[null===(s=this.props.useDataSources)||void 0===s?void 0:s.map(e=>(0,i.jsx)(C,{useDataSource:e,onIsDataSourceNotReady:this.onIsDataSourceNotReady,onCreateDataSourceCreatedOrFailed:this.onCreateDataSourceCreatedOrFailed},e.dataSourceId)),r.arrangeType!==e.Popper||n?(0,i.jsx)("div",{css:u(n),children:this.getFilterItems(r,n?e.Block:r.arrangeType,r.wrap)}):(0,i.jsxs)("div",{className:"filter-widget-popper",children:[(0,i.jsx)(a.Badge,{dot:!0,className:"m-1",hideBadge:!this.checkIfAnyFiltersApplied(),color:"primary",children:(0,i.jsx)(a.Button,{icon:!0,size:"sm",className:"filter-widget-pill h-100",ref:e=>{this.widgetIconRef=e},title:o,variant:"text",color:"inherit",onClick:this.onShowPopper,"aria-pressed":this.checkIfAnyFiltersApplied(),"aria-haspopup":"dialog",children:(0,i.jsx)(a.Icon,{icon:"string"==typeof l?l:l.svg,size:16,color:"string"==typeof l?"inherit":l.properties.color})})}),this.state.popperVersion>1&&(0,i.jsx)(a.Popper,{open:this.state.isOpen,autoUpdate:!0,keepMount:!0,toggle:this.onTogglePopper,arrowOptions:!0,sizeOptions:!0,flipOptions:f,forceLatestFocusElements:!0,reference:this.widgetIconRef,children:(0,i.jsxs)("div",{className:"p-2",style:{width:p},children:[this.getFilterItems(r,e.Block,!1,!0),!r.resetAll&&r.triggerType===t.Button&&(0,i.jsx)(a.Button,{className:"sr-only","aria-label":this.props.intl.formatMessage({id:"pressTabToContinue",defaultMessage:a.defaultMessages.pressTabToContinue})})]})})]})]})}}W=G,G.versionManager=F,G.cachedInitFilterURL={},G.mapExtraStateProps=(e,t)=>{var s;W.cachedInitFilterURL||(W.cachedInitFilterURL={});let i=W.cachedInitFilterURL[t.id];if(!(t.id in W.cachedInitFilterURL)){(e&&e.appRuntimeInfo&&e.appRuntimeInfo.appMode)===r.AppMode.Run&&(null===(s=e.urlHashObject)||void 0===s?void 0:s[t.id])&&(i=JSON.parse(e.urlHashObject[t.id].filters)),W.cachedInitFilterURL[t.id]=i}return{urlParams:i}};const _=G;function V(e){l.p=e}})(),o})())}}});