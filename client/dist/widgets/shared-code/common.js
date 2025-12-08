System.register(["jimu-core/emotion","jimu-core","jimu-ui","jimu-theme"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_ui__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_theme__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_ui__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_theme__, "__esModule", { value: true });
	return {
		setters: [
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__[key] = module[key];
				});
			},
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_core__[key] = module[key];
				});
			},
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_ui__[key] = module[key];
				});
			},
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_theme__[key] = module[key];
				});
			}
		],
		execute: function() {
			__WEBPACK_DYNAMIC_EXPORT__(
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./jimu-icons/svg/outlined/editor/close.svg":
/*!**************************************************!*\
  !*** ./jimu-icons/svg/outlined/editor/close.svg ***!
  \**************************************************/
/***/ ((module) => {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 16 16\"><path fill=\"#000\" d=\"m8.745 8 6.1 6.1a.527.527 0 1 1-.745.746L8 8.746l-6.1 6.1a.527.527 0 1 1-.746-.746l6.1-6.1-6.1-6.1a.527.527 0 0 1 .746-.746l6.1 6.1 6.1-6.1a.527.527 0 0 1 .746.746z\"></path></svg>"

/***/ }),

/***/ "./jimu-icons/svg/outlined/suggested/error.svg":
/*!*****************************************************!*\
  !*** ./jimu-icons/svg/outlined/suggested/error.svg ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 16 16\"><path fill=\"#000\" fill-rule=\"evenodd\" d=\"M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16m0-1A7 7 0 1 0 8 1a7 7 0 0 0 0 14M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m1 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0\" clip-rule=\"evenodd\"></path></svg>"

/***/ }),

/***/ "./jimu-icons/svg/outlined/suggested/warning.svg":
/*!*******************************************************!*\
  !*** ./jimu-icons/svg/outlined/suggested/warning.svg ***!
  \*******************************************************/
/***/ ((module) => {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 16 16\"><path fill=\"#000\" fill-rule=\"evenodd\" d=\"M8 2.125 14.334 14H1.667zm-.882-.47a1 1 0 0 1 1.765 0l6.333 11.874A1 1 0 0 1 14.334 15H1.667a1 1 0 0 1-.882-1.47zM8 4.874a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0L8.9 5.87a.905.905 0 0 0-.9-.995m1 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0\" clip-rule=\"evenodd\"></path></svg>"

/***/ }),

/***/ "./your-extensions/widgets/shared-code/common/common-components.tsx":
/*!**************************************************************************!*\
  !*** ./your-extensions/widgets/shared-code/common/common-components.tsx ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DialogPanel: () => (/* binding */ DialogPanel),
/* harmony export */   EntityStatusType: () => (/* binding */ EntityStatusType),
/* harmony export */   ErrorMessage: () => (/* binding */ ErrorMessage),
/* harmony export */   StateHolder: () => (/* binding */ StateHolder),
/* harmony export */   StatusIndicator: () => (/* binding */ StatusIndicator)
/* harmony export */ });
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/react/jsx-runtime */ "@emotion/react/jsx-runtime");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jimu-ui */ "jimu-ui");
/* harmony import */ var jimu_theme__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jimu-theme */ "jimu-theme");
/* harmony import */ var jimu_icons_svg_outlined_suggested_error_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! jimu-icons/svg/outlined/suggested/error.svg */ "./jimu-icons/svg/outlined/suggested/error.svg");
/* harmony import */ var jimu_icons_svg_outlined_suggested_error_svg__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(jimu_icons_svg_outlined_suggested_error_svg__WEBPACK_IMPORTED_MODULE_4__);

/** @jsx jsx */




const { useState } = jimu_core__WEBPACK_IMPORTED_MODULE_1__.React;
/**
 * A simple Functional Component storing some States that are commonly used
 */
const StateHolder = (props) => {
    const { initState = {}, children } = props;
    const defaultStateMap = {
        visible: true,
        refContainer: null
    };
    const useStateMap = {
        visible: useState('visible' in initState ? initState.visible : defaultStateMap.visible),
        refContainer: useState('refContainer' in initState ? initState.refContainer : defaultStateMap.refContainer),
        customData: useState(Object.assign({}, initState.customData))
    };
    return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.Fragment, { children: children(useStateMap) });
};
/**
 * A dialog popup
 */
const DialogPanel = (0,jimu_theme__WEBPACK_IMPORTED_MODULE_3__.withTheme)((props) => {
    const { theme, panelVisible, setPanelVisible, getI18nMessage, isModal = true, title = getI18nMessage('queryMessage'), bodyContent = '', hasHeader = true, hasFooter = true } = props;
    const toggle = () => { setPanelVisible(false); };
    const getContent = () => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.Fragment, { children: [hasHeader &&
                (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.PanelHeader, { className: 'py-2', title: title, onClose: toggle }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.ModalBody, { children: bodyContent }), hasFooter &&
                (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.ModalFooter, { children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Button, { onClick: toggle, children: getI18nMessage('ok') }) })] });
    const generalClassName = 'ui-unit-dialog-panel';
    const renderModalContent = () => {
        return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Modal, { className: generalClassName, isOpen: panelVisible, toggle: toggle, backdrop: 'static', children: getContent() }));
    };
    const renderNonModalContent = () => {
        const getStyle = () => (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.css) `
      &.ui-unit-dialog-panel.modal-dialog {
        margin: 0;
        width: 100%;
        .modal-content {
          background-color: ${theme.ref.palette.neutral[600]};
          color: ${theme.ref.palette.black};
          font-size: .75rem;
          font-weight: 400;
          border: none;
          .panel-header {
            font-size: .8125rem;
            padding: .625rem;
          }
          .modal-body {
            padding: 0 .625rem .75rem;
            white-space: normal;
          }
        }
      }
    `;
        return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `${generalClassName} modal-dialog ${panelVisible ? '' : 'collapse'}`, css: getStyle(), children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: 'modal-content', children: getContent() }) }));
    };
    return isModal ? renderModalContent() : renderNonModalContent();
});
var EntityStatusType;
(function (EntityStatusType) {
    EntityStatusType["None"] = "";
    EntityStatusType["Init"] = "init";
    EntityStatusType["Loading"] = "loading";
    EntityStatusType["Loaded"] = "loaded";
    EntityStatusType["Warning"] = "warning";
    EntityStatusType["Error"] = "error";
})(EntityStatusType || (EntityStatusType = {}));
/**
 * An animatable icon representing status
 */
const StatusIndicator = (0,jimu_theme__WEBPACK_IMPORTED_MODULE_3__.withTheme)((props) => {
    const { theme, className, title, statusType } = props;
    const getStyle = () => {
        var _a, _b, _c, _d;
        return (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.css) `
    &.ui-unit-status-indicator {
      display: flex;
      &.ui-unit-status-indicator_status-type-loading {
        &:before {
          @keyframes loading {
            0% {transform: rotate(0deg); };
            100% {transform: rotate(360deg)};
          }
          content: '';
          width: 1rem;
          height: 1rem;
          display: block;
          border: 1px solid ${(_b = (_a = theme === null || theme === void 0 ? void 0 : theme.ref.palette) === null || _a === void 0 ? void 0 : _a.neutral) === null || _b === void 0 ? void 0 : _b[500]};
          border-radius: 50%;
          border-top: 1px solid ${(_d = (_c = theme === null || theme === void 0 ? void 0 : theme.sys.color) === null || _c === void 0 ? void 0 : _c.primary) === null || _d === void 0 ? void 0 : _d.main};
          box-sizing: border-box;
          animation: loading 2s infinite linear;
          margin-right: .25rem;
        }
      }
    }
  `;
    };
    return (statusType &&
        (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `${className !== null && className !== void 0 ? className : ''} ui-unit-status-indicator ui-unit-status-indicator_status-type-${statusType}`, title: title, css: getStyle() }));
});
/**
 * Simple error message component for displaying user-facing errors.
 * Use DataSourceTip for data source-related errors.
 */
const ErrorMessage = (props) => {
    const { error, className = '', onDismiss } = props;
    if (!error) {
        return null;
    }
    const errorStyle = (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.css) `
    display: flex;
    align-items: center;
    padding: 0.5rem;
    margin: 0.5rem 0;
    background-color: var(--sys-color-error-light);
    color: var(--sys-color-error-dark);
    border-radius: 4px;
    font-size: 0.875rem;
    gap: 0.5rem;
    
    .error-icon {
      flex-shrink: 0;
    }
    
    .error-text {
      flex: 1;
    }
    
    .error-dismiss {
      flex-shrink: 0;
      cursor: pointer;
      padding: 0.25rem;
      &:hover {
        opacity: 0.7;
      }
    }
  `;
    return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: `error-message ${className}`, css: errorStyle, role: "alert", children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Icon, { icon: (jimu_icons_svg_outlined_suggested_error_svg__WEBPACK_IMPORTED_MODULE_4___default()), className: "error-icon", size: "sm" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "error-text", children: error }), onDismiss && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Button, { size: "sm", type: "tertiary", icon: true, onClick: onDismiss, className: "error-dismiss", "aria-label": "Dismiss error", children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Icon, { icon: (__webpack_require__(/*! jimu-icons/svg/outlined/editor/close.svg */ "./jimu-icons/svg/outlined/editor/close.svg")["default"]), size: "sm" }) }))] }));
};


/***/ }),

/***/ "./your-extensions/widgets/shared-code/common/data-source-tip.tsx":
/*!************************************************************************!*\
  !*** ./your-extensions/widgets/shared-code/common/data-source-tip.tsx ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DataSourceTip: () => (/* binding */ DataSourceTip)
/* harmony export */ });
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/react/jsx-runtime */ "@emotion/react/jsx-runtime");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jimu-ui */ "jimu-ui");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common-components */ "./your-extensions/widgets/shared-code/common/common-components.tsx");
/* harmony import */ var jimu_icons_svg_outlined_suggested_warning_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! jimu-icons/svg/outlined/suggested/warning.svg */ "./jimu-icons/svg/outlined/suggested/warning.svg");
/* harmony import */ var jimu_icons_svg_outlined_suggested_warning_svg__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(jimu_icons_svg_outlined_suggested_warning_svg__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var jimu_icons_svg_outlined_suggested_error_svg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! jimu-icons/svg/outlined/suggested/error.svg */ "./jimu-icons/svg/outlined/suggested/error.svg");
/* harmony import */ var jimu_icons_svg_outlined_suggested_error_svg__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(jimu_icons_svg_outlined_suggested_error_svg__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _use_ds_exists__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./use-ds-exists */ "./your-extensions/widgets/shared-code/common/use-ds-exists.tsx");

/** @jsx jsx */






/**
 * Show icon and message if the data source doesn't work.
 * @param props
 * @returns
 */
function DataSourceTip(props) {
    var _a, _b, _c;
    const { widgetId, useDataSource, onStatusChange, onDataSourceCreated, showMessage = false } = props;
    const getI18nMessage = jimu_core__WEBPACK_IMPORTED_MODULE_1__.hooks.useTranslation(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.defaultMessages);
    const dsExists = (0,_use_ds_exists__WEBPACK_IMPORTED_MODULE_6__.useDataSourceExists)({ widgetId, useDataSourceId: useDataSource.dataSourceId });
    const [dsStatus, setDsStatus] = jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.useState(null);
    const [dataSource, setDataSource] = jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.useState(null);
    const handleDsInfoChange = jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.useCallback((info) => {
        if (info) {
            const { status, instanceStatus } = info;
            if (instanceStatus === jimu_core__WEBPACK_IMPORTED_MODULE_1__.DataSourceStatus.NotCreated) {
                setDsStatus('creating');
                onStatusChange === null || onStatusChange === void 0 ? void 0 : onStatusChange(false);
            }
            else if (instanceStatus === jimu_core__WEBPACK_IMPORTED_MODULE_1__.DataSourceStatus.CreateError || status === jimu_core__WEBPACK_IMPORTED_MODULE_1__.DataSourceStatus.LoadError) {
                setDsStatus('error');
                onStatusChange === null || onStatusChange === void 0 ? void 0 : onStatusChange(false);
            }
            else if (status === jimu_core__WEBPACK_IMPORTED_MODULE_1__.DataSourceStatus.NotReady) {
                setDsStatus('warning');
                onStatusChange === null || onStatusChange === void 0 ? void 0 : onStatusChange(false);
            }
            else {
                setDsStatus(null);
                onStatusChange === null || onStatusChange === void 0 ? void 0 : onStatusChange(true);
            }
        }
    }, [onStatusChange]);
    const handleDsCreated = jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.useCallback((ds) => {
        setDataSource(ds);
        onDataSourceCreated === null || onDataSourceCreated === void 0 ? void 0 : onDataSourceCreated(ds);
    }, [onDataSourceCreated]);
    const handleDsCreateFailed = jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.useCallback(() => {
        setDataSource(null);
        setDsStatus('error');
        onStatusChange === null || onStatusChange === void 0 ? void 0 : onStatusChange(false);
    }, [onStatusChange]);
    let statusIcon;
    let statusMsg;
    let color;
    if (dsStatus === 'creating') {
        statusIcon = (jimu_icons_svg_outlined_suggested_error_svg__WEBPACK_IMPORTED_MODULE_5___default());
        statusMsg = getI18nMessage('loading');
    }
    else if (!dsExists || dsStatus === 'error') {
        statusIcon = (jimu_icons_svg_outlined_suggested_error_svg__WEBPACK_IMPORTED_MODULE_5___default());
        statusMsg = getI18nMessage('dataSourceCreateError');
        color = 'var(--sys-color-error-main)';
    }
    else if (dsStatus === 'warning') {
        let label = '';
        const originDs = (_a = dataSource === null || dataSource === void 0 ? void 0 : dataSource.getOriginDataSources()) === null || _a === void 0 ? void 0 : _a[0];
        if (originDs) {
            label = originDs.getLabel() || originDs.getDataSourceJson().sourceLabel;
        }
        else if (dataSource) {
            label = dataSource.getLabel() || dataSource.getDataSourceJson().label;
        }
        const widgetId = jimu_core__WEBPACK_IMPORTED_MODULE_1__.appConfigUtils.getWidgetIdByOutputDataSource(useDataSource);
        const appState = ((_b = window === null || window === void 0 ? void 0 : window.jimuConfig) === null || _b === void 0 ? void 0 : _b.isBuilder)
            ? (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.getAppStore)().getState().appStateInBuilder
            : (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.getAppStore)().getState();
        const widgetLabel = (_c = appState.appConfig.widgets[widgetId]) === null || _c === void 0 ? void 0 : _c.label;
        color = 'var(--sys-color-warning-dark)';
        statusIcon = (jimu_icons_svg_outlined_suggested_warning_svg__WEBPACK_IMPORTED_MODULE_4___default());
        statusMsg = getI18nMessage('outputDataIsNotGenerated', {
            outputDsLabel: label !== null && label !== void 0 ? label : '',
            sourceWidgetName: widgetLabel !== null && widgetLabel !== void 0 ? widgetLabel : ''
        });
    }
    return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.Fragment, { children: [dsExists && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_core__WEBPACK_IMPORTED_MODULE_1__.DataSourceComponent, { useDataSource: useDataSource, onDataSourceInfoChange: handleDsInfoChange, onDataSourceCreated: handleDsCreated, onCreateDataSourceFailed: handleDsCreateFailed })), dsStatus === 'creating' && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_3__.StatusIndicator, { statusType: _common_components__WEBPACK_IMPORTED_MODULE_3__.EntityStatusType.Loading, title: statusMsg }), (!dsExists || dsStatus === 'error' || dsStatus === 'warning') && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: 'd-flex align-items-center', children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Tooltip, { title: statusMsg, children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Button, { size: 'sm', type: 'tertiary', icon: true, children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Icon, { icon: statusIcon, color: color }) }) }), showMessage && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: 'status-message', children: statusMsg })] }))] }));
}


/***/ }),

/***/ "./your-extensions/widgets/shared-code/common/use-ds-exists.tsx":
/*!**********************************************************************!*\
  !*** ./your-extensions/widgets/shared-code/common/use-ds-exists.tsx ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useDataSourceExists: () => (/* binding */ useDataSourceExists)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");

function useDataSourceExists(props) {
    const { widgetId, useDataSourceId } = props;
    const exists = jimu_core__WEBPACK_IMPORTED_MODULE_0__.ReactRedux.useSelector((state) => {
        var _a;
        let appConfig;
        if (window.jimuConfig.isBuilder) {
            appConfig = state.appStateInBuilder.appConfig;
        }
        else {
            appConfig = state.appConfig;
        }
        const useDataSources = (_a = appConfig.widgets[widgetId].useDataSources) !== null && _a !== void 0 ? _a : [];
        return useDataSources.some(useDs => useDs.dataSourceId === useDataSourceId);
    });
    return exists;
}


/***/ }),

/***/ "./your-extensions/widgets/shared-code/common/utils.tsx":
/*!**************************************************************!*\
  !*** ./your-extensions/widgets/shared-code/common/utils.tsx ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createGetI18nMessage: () => (/* binding */ createGetI18nMessage),
/* harmony export */   getFieldInfosInPopupContent: () => (/* binding */ getFieldInfosInPopupContent),
/* harmony export */   toggleItemInArray: () => (/* binding */ toggleItemInArray)
/* harmony export */ });
/**
 * Toggle items in an array
 */
const toggleItemInArray = (item, items = []) => items.includes(item) ? items.filter(i => i !== item) : [...items, item];
/**
 * A factory to create a function of getting i18n message
 */
function createGetI18nMessage(options) {
    const { intl, defaultMessages = {} } = options || {};
    const getI18nMessage = (id, options) => {
        const { messages, values } = options || {};
        return intl.formatMessage({ id, defaultMessage: (messages || defaultMessages)[id] }, values);
    };
    return getI18nMessage;
}
function getFieldInfosInPopupContent(popupInfo) {
    var _a;
    const result = [];
    if (((_a = popupInfo === null || popupInfo === void 0 ? void 0 : popupInfo.popupElements) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        popupInfo.popupElements.forEach(element => {
            var _a;
            if (element.type === 'fields' && ((_a = element.fieldInfos) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                result.push(...element.fieldInfos);
            }
        });
    }
    return result;
}


/***/ }),

/***/ "@emotion/react/jsx-runtime":
/*!************************************!*\
  !*** external "jimu-core/emotion" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__;

/***/ }),

/***/ "jimu-core":
/*!****************************!*\
  !*** external "jimu-core" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_core__;

/***/ }),

/***/ "jimu-theme":
/*!*****************************!*\
  !*** external "jimu-theme" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_theme__;

/***/ }),

/***/ "jimu-ui":
/*!**************************!*\
  !*** external "jimu-ui" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_ui__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!******************************************!*\
  !*** ./jimu-core/lib/set-public-path.ts ***!
  \******************************************/
/**
 * Webpack will replace __webpack_public_path__ with __webpack_require__.p to set the public path dynamically.
 * The reason why we can't set the publicPath in webpack config is: we change the publicPath when download.
 * */
__webpack_require__.p = window.jimuConfig.baseUrl;

})();

// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*******************************************************!*\
  !*** ./your-extensions/widgets/shared-code/common.ts ***!
  \*******************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DataSourceTip: () => (/* reexport safe */ _common_data_source_tip__WEBPACK_IMPORTED_MODULE_3__.DataSourceTip),
/* harmony export */   DialogPanel: () => (/* reexport safe */ _common_common_components__WEBPACK_IMPORTED_MODULE_0__.DialogPanel),
/* harmony export */   EntityStatusType: () => (/* reexport safe */ _common_common_components__WEBPACK_IMPORTED_MODULE_0__.EntityStatusType),
/* harmony export */   ErrorMessage: () => (/* reexport safe */ _common_common_components__WEBPACK_IMPORTED_MODULE_0__.ErrorMessage),
/* harmony export */   StateHolder: () => (/* reexport safe */ _common_common_components__WEBPACK_IMPORTED_MODULE_0__.StateHolder),
/* harmony export */   StatusIndicator: () => (/* reexport safe */ _common_common_components__WEBPACK_IMPORTED_MODULE_0__.StatusIndicator),
/* harmony export */   createGetI18nMessage: () => (/* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_1__.createGetI18nMessage),
/* harmony export */   getFieldInfosInPopupContent: () => (/* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_1__.getFieldInfosInPopupContent),
/* harmony export */   toggleItemInArray: () => (/* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_1__.toggleItemInArray),
/* harmony export */   useDataSourceExists: () => (/* reexport safe */ _common_use_ds_exists__WEBPACK_IMPORTED_MODULE_2__.useDataSourceExists)
/* harmony export */ });
/* harmony import */ var _common_common_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common/common-components */ "./your-extensions/widgets/shared-code/common/common-components.tsx");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/utils */ "./your-extensions/widgets/shared-code/common/utils.tsx");
/* harmony import */ var _common_use_ds_exists__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./common/use-ds-exists */ "./your-extensions/widgets/shared-code/common/use-ds-exists.tsx");
/* harmony import */ var _common_data_source_tip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common/data-source-tip */ "./your-extensions/widgets/shared-code/common/data-source-tip.tsx");
/**
 * Shared common utilities and components for Experience Builder widgets
 *
 * This module exports common functionality that can be shared between
 * query-simple, helper-simple, and other custom widgets.
 *
 * This is the entry point for 'widgets/shared-code/common'
 */





})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFBSSxLQUFLLFFBQVEsSUFBSSxjQUFPLENBQUMsVUFBVSwwQ0FBRSxNQUFNLElBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQ3BDLENBQUM7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0lBQ0QsT0FBTyxNQUFNO0FBQ2YsQ0FBQzs7Ozs7Ozs7Ozs7O0FDbkNELHdFOzs7Ozs7Ozs7OztBQ0FBLHVEOzs7Ozs7Ozs7OztBQ0FBLHdEOzs7Ozs7Ozs7OztBQ0FBLHFEOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQSxFOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7V0NOQSwyQjs7Ozs7Ozs7OztBQ0FBOzs7S0FHSztBQUNMLHFCQUF1QixHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSm5EOzs7Ozs7O0dBT0c7QUFFdUM7QUFDWjtBQUNRO0FBQ0UiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1pY29ucy9zdmcvb3V0bGluZWQvZWRpdG9yL2Nsb3NlLnN2ZyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1pY29ucy9zdmcvb3V0bGluZWQvc3VnZ2VzdGVkL2Vycm9yLnN2ZyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1pY29ucy9zdmcvb3V0bGluZWQvc3VnZ2VzdGVkL3dhcm5pbmcuc3ZnIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24vY29tbW9uLWNvbXBvbmVudHMudHN4Iiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24vZGF0YS1zb3VyY2UtdGlwLnRzeCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvc2hhcmVkLWNvZGUvY29tbW9uL3VzZS1kcy1leGlzdHMudHN4Iiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24vdXRpbHMudHN4Iiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlL2Vtb3Rpb25cIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZVwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS10aGVtZVwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS11aVwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBcIjxzdmcgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiBmaWxsPVxcXCJub25lXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTYgMTZcXFwiPjxwYXRoIGZpbGw9XFxcIiMwMDBcXFwiIGQ9XFxcIm04Ljc0NSA4IDYuMSA2LjFhLjUyNy41MjcgMCAxIDEtLjc0NS43NDZMOCA4Ljc0NmwtNi4xIDYuMWEuNTI3LjUyNyAwIDEgMS0uNzQ2LS43NDZsNi4xLTYuMS02LjEtNi4xYS41MjcuNTI3IDAgMCAxIC43NDYtLjc0Nmw2LjEgNi4xIDYuMS02LjFhLjUyNy41MjcgMCAwIDEgLjc0Ni43NDZ6XFxcIj48L3BhdGg+PC9zdmc+XCIiLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHN2ZyB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxNiAxNlxcXCI+PHBhdGggZmlsbD1cXFwiIzAwMFxcXCIgZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNOCAxNkE4IDggMCAxIDEgOCAwYTggOCAwIDAgMSAwIDE2bTAtMUE3IDcgMCAxIDAgOCAxYTcgNyAwIDAgMCAwIDE0TTggNGEuOTA1LjkwNSAwIDAgMC0uOS45OTVsLjM1IDMuNTA3YS41NTIuNTUyIDAgMCAwIDEuMSAwbC4zNS0zLjUwN0EuOTA1LjkwNSAwIDAgMCA4IDRtMSA3YTEgMSAwIDEgMS0yIDAgMSAxIDAgMCAxIDIgMFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIj48L3BhdGg+PC9zdmc+XCIiLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHN2ZyB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxNiAxNlxcXCI+PHBhdGggZmlsbD1cXFwiIzAwMFxcXCIgZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNOCAyLjEyNSAxNC4zMzQgMTRIMS42Njd6bS0uODgyLS40N2ExIDEgMCAwIDEgMS43NjUgMGw2LjMzMyAxMS44NzRBMSAxIDAgMCAxIDE0LjMzNCAxNUgxLjY2N2ExIDEgMCAwIDEtLjg4Mi0xLjQ3ek04IDQuODc0YS45MDUuOTA1IDAgMCAwLS45Ljk5NWwuMzUgMy41MDdhLjU1Mi41NTIgMCAwIDAgMS4xIDBMOC45IDUuODdhLjkwNS45MDUgMCAwIDAtLjktLjk5NW0xIDdhMSAxIDAgMSAxLTIgMCAxIDEgMCAwIDEgMiAwXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiPjwvcGF0aD48L3N2Zz5cIiIsIi8qKiBAanN4IGpzeCAqL1xuaW1wb3J0IHsgUmVhY3QsIGpzeCwgY3NzIH0gZnJvbSAnamltdS1jb3JlJ1xuaW1wb3J0IHsgQnV0dG9uLCBNb2RhbCwgTW9kYWxCb2R5LCBNb2RhbEZvb3RlciwgUGFuZWxIZWFkZXIsIEljb24sIHR5cGUgVGhlbWVQcm9wcyB9IGZyb20gJ2ppbXUtdWknXG5pbXBvcnQgeyB3aXRoVGhlbWUgfSBmcm9tICdqaW11LXRoZW1lJ1xuaW1wb3J0IGljb25FcnJvciBmcm9tICdqaW11LWljb25zL3N2Zy9vdXRsaW5lZC9zdWdnZXN0ZWQvZXJyb3Iuc3ZnJ1xuY29uc3QgeyB1c2VTdGF0ZSB9ID0gUmVhY3RcblxuLyoqXG4gKiBBIHNpbXBsZSBGdW5jdGlvbmFsIENvbXBvbmVudCBzdG9yaW5nIHNvbWUgU3RhdGVzIHRoYXQgYXJlIGNvbW1vbmx5IHVzZWRcbiAqL1xuZXhwb3J0IGNvbnN0IFN0YXRlSG9sZGVyID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgaW5pdFN0YXRlID0ge30sIGNoaWxkcmVuIH0gPSBwcm9wc1xuICBjb25zdCBkZWZhdWx0U3RhdGVNYXAgPSB7XG4gICAgdmlzaWJsZTogdHJ1ZSxcbiAgICByZWZDb250YWluZXI6IG51bGxcbiAgfVxuICBjb25zdCB1c2VTdGF0ZU1hcCA9IHtcbiAgICB2aXNpYmxlOiB1c2VTdGF0ZSgndmlzaWJsZScgaW4gaW5pdFN0YXRlID8gaW5pdFN0YXRlLnZpc2libGUgOiBkZWZhdWx0U3RhdGVNYXAudmlzaWJsZSksXG4gICAgcmVmQ29udGFpbmVyOiB1c2VTdGF0ZSgncmVmQ29udGFpbmVyJyBpbiBpbml0U3RhdGUgPyBpbml0U3RhdGUucmVmQ29udGFpbmVyIDogZGVmYXVsdFN0YXRlTWFwLnJlZkNvbnRhaW5lciksXG4gICAgY3VzdG9tRGF0YTogdXNlU3RhdGUoeyAuLi5pbml0U3RhdGUuY3VzdG9tRGF0YSB9KVxuICB9XG4gIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+e2NoaWxkcmVuKHVzZVN0YXRlTWFwKX08L1JlYWN0LkZyYWdtZW50PlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpYWxvZ1BhbmVsUHJvcHMge1xuICBwYW5lbFZpc2libGU6IGJvb2xlYW5cbiAgc2V0UGFuZWxWaXNpYmxlOiAodmlzaWJsZTogYm9vbGVhbikgPT4gdm9pZFxuICBnZXRJMThuTWVzc2FnZTogKGlkOiBzdHJpbmcpID0+IGFueVxuICBpc01vZGFsPzogYm9vbGVhblxuICB0aXRsZT86IGFueVxuICBib2R5Q29udGVudD86IGFueVxuICBoYXNIZWFkZXI/OiBib29sZWFuXG4gIGhhc0Zvb3Rlcj86IGJvb2xlYW5cbn1cblxuLyoqXG4gKiBBIGRpYWxvZyBwb3B1cFxuICovXG5leHBvcnQgY29uc3QgRGlhbG9nUGFuZWwgPSB3aXRoVGhlbWUoKHByb3BzOiBEaWFsb2dQYW5lbFByb3BzICYgVGhlbWVQcm9wcykgPT4ge1xuICBjb25zdCB7IHRoZW1lLCBwYW5lbFZpc2libGUsIHNldFBhbmVsVmlzaWJsZSwgZ2V0STE4bk1lc3NhZ2UsIGlzTW9kYWwgPSB0cnVlLCB0aXRsZSA9IGdldEkxOG5NZXNzYWdlKCdxdWVyeU1lc3NhZ2UnKSwgYm9keUNvbnRlbnQgPSAnJywgaGFzSGVhZGVyID0gdHJ1ZSwgaGFzRm9vdGVyID0gdHJ1ZSB9ID0gcHJvcHNcbiAgY29uc3QgdG9nZ2xlID0gKCkgPT4geyBzZXRQYW5lbFZpc2libGUoZmFsc2UpIH1cbiAgY29uc3QgZ2V0Q29udGVudCA9ICgpID0+IDxSZWFjdC5GcmFnbWVudD5cbiAgICB7XG4gICAgICBoYXNIZWFkZXIgJiZcbiAgICAgICAgPFBhbmVsSGVhZGVyIGNsYXNzTmFtZT0ncHktMicgdGl0bGU9e3RpdGxlfSBvbkNsb3NlPXt0b2dnbGV9IC8+XG4gICAgfVxuICAgIDxNb2RhbEJvZHk+e2JvZHlDb250ZW50fTwvTW9kYWxCb2R5PlxuICAgIHtcbiAgICAgIGhhc0Zvb3RlciAmJlxuICAgICAgICA8TW9kYWxGb290ZXI+XG4gICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXt0b2dnbGV9PntnZXRJMThuTWVzc2FnZSgnb2snKX08L0J1dHRvbj5cbiAgICAgICAgPC9Nb2RhbEZvb3Rlcj5cbiAgICB9XG4gIDwvUmVhY3QuRnJhZ21lbnQ+XG4gIGNvbnN0IGdlbmVyYWxDbGFzc05hbWUgPSAndWktdW5pdC1kaWFsb2ctcGFuZWwnXG4gIGNvbnN0IHJlbmRlck1vZGFsQ29udGVudCA9ICgpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgPE1vZGFsIGNsYXNzTmFtZT17Z2VuZXJhbENsYXNzTmFtZX0gaXNPcGVuPXtwYW5lbFZpc2libGV9IHRvZ2dsZT17dG9nZ2xlfSBiYWNrZHJvcD0nc3RhdGljJz5cbiAgICAgICAge2dldENvbnRlbnQoKX1cbiAgICAgIDwvTW9kYWw+XG4gICAgKVxuICB9XG4gIGNvbnN0IHJlbmRlck5vbk1vZGFsQ29udGVudCA9ICgpID0+IHtcbiAgICBjb25zdCBnZXRTdHlsZSA9ICgpID0+IGNzc2BcbiAgICAgICYudWktdW5pdC1kaWFsb2ctcGFuZWwubW9kYWwtZGlhbG9nIHtcbiAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgLm1vZGFsLWNvbnRlbnQge1xuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7dGhlbWUucmVmLnBhbGV0dGUubmV1dHJhbFs2MDBdfTtcbiAgICAgICAgICBjb2xvcjogJHt0aGVtZS5yZWYucGFsZXR0ZS5ibGFja307XG4gICAgICAgICAgZm9udC1zaXplOiAuNzVyZW07XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICAgICAgICBib3JkZXI6IG5vbmU7XG4gICAgICAgICAgLnBhbmVsLWhlYWRlciB7XG4gICAgICAgICAgICBmb250LXNpemU6IC44MTI1cmVtO1xuICAgICAgICAgICAgcGFkZGluZzogLjYyNXJlbTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLm1vZGFsLWJvZHkge1xuICAgICAgICAgICAgcGFkZGluZzogMCAuNjI1cmVtIC43NXJlbTtcbiAgICAgICAgICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7Z2VuZXJhbENsYXNzTmFtZX0gbW9kYWwtZGlhbG9nICR7cGFuZWxWaXNpYmxlID8gJycgOiAnY29sbGFwc2UnfWB9IGNzcz17Z2V0U3R5bGUoKX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdtb2RhbC1jb250ZW50Jz5cbiAgICAgICAgICB7Z2V0Q29udGVudCgpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuICByZXR1cm4gaXNNb2RhbCA/IHJlbmRlck1vZGFsQ29udGVudCgpIDogcmVuZGVyTm9uTW9kYWxDb250ZW50KClcbn0pXG5cbmV4cG9ydCBlbnVtIEVudGl0eVN0YXR1c1R5cGUge1xuICBOb25lID0gJycsXG4gIEluaXQgPSAnaW5pdCcsXG4gIExvYWRpbmcgPSAnbG9hZGluZycsXG4gIExvYWRlZCA9ICdsb2FkZWQnLFxuICBXYXJuaW5nID0gJ3dhcm5pbmcnLFxuICBFcnJvciA9ICdlcnJvcicsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdHVzSW5kaWNhdG9yUHJvcHMge1xuICBjbGFzc05hbWU/OiBzdHJpbmdcbiAgc3RhdHVzVHlwZT86IEVudGl0eVN0YXR1c1R5cGVcbiAgdGl0bGU/OiBzdHJpbmdcbn1cblxuLyoqXG4gKiBBbiBhbmltYXRhYmxlIGljb24gcmVwcmVzZW50aW5nIHN0YXR1c1xuICovXG5leHBvcnQgY29uc3QgU3RhdHVzSW5kaWNhdG9yID0gd2l0aFRoZW1lKChwcm9wczogU3RhdHVzSW5kaWNhdG9yUHJvcHMgJiBUaGVtZVByb3BzKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWUsIGNsYXNzTmFtZSwgdGl0bGUsIHN0YXR1c1R5cGUgfSA9IHByb3BzXG4gIGNvbnN0IGdldFN0eWxlID0gKCkgPT4gY3NzYFxuICAgICYudWktdW5pdC1zdGF0dXMtaW5kaWNhdG9yIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAmLnVpLXVuaXQtc3RhdHVzLWluZGljYXRvcl9zdGF0dXMtdHlwZS1sb2FkaW5nIHtcbiAgICAgICAgJjpiZWZvcmUge1xuICAgICAgICAgIEBrZXlmcmFtZXMgbG9hZGluZyB7XG4gICAgICAgICAgICAwJSB7dHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH07XG4gICAgICAgICAgICAxMDAlIHt0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGVudDogJyc7XG4gICAgICAgICAgd2lkdGg6IDFyZW07XG4gICAgICAgICAgaGVpZ2h0OiAxcmVtO1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICR7dGhlbWU/LnJlZi5wYWxldHRlPy5uZXV0cmFsPy5bNTAwXX07XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCAke3RoZW1lPy5zeXMuY29sb3I/LnByaW1hcnk/Lm1haW59O1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgICAgYW5pbWF0aW9uOiBsb2FkaW5nIDJzIGluZmluaXRlIGxpbmVhcjtcbiAgICAgICAgICBtYXJnaW4tcmlnaHQ6IC4yNXJlbTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgYFxuICByZXR1cm4gKFxuICAgIHN0YXR1c1R5cGUgJiZcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtjbGFzc05hbWUgPz8gJyd9IHVpLXVuaXQtc3RhdHVzLWluZGljYXRvciB1aS11bml0LXN0YXR1cy1pbmRpY2F0b3Jfc3RhdHVzLXR5cGUtJHtzdGF0dXNUeXBlfWB9IHRpdGxlPXt0aXRsZX0gY3NzPXtnZXRTdHlsZSgpfSAvPlxuICApXG59KVxuXG5leHBvcnQgaW50ZXJmYWNlIEVycm9yTWVzc2FnZVByb3BzIHtcbiAgZXJyb3I6IHN0cmluZyB8IG51bGxcbiAgY2xhc3NOYW1lPzogc3RyaW5nXG4gIG9uRGlzbWlzcz86ICgpID0+IHZvaWRcbn1cblxuLyoqXG4gKiBTaW1wbGUgZXJyb3IgbWVzc2FnZSBjb21wb25lbnQgZm9yIGRpc3BsYXlpbmcgdXNlci1mYWNpbmcgZXJyb3JzLlxuICogVXNlIERhdGFTb3VyY2VUaXAgZm9yIGRhdGEgc291cmNlLXJlbGF0ZWQgZXJyb3JzLlxuICovXG5leHBvcnQgY29uc3QgRXJyb3JNZXNzYWdlID0gKHByb3BzOiBFcnJvck1lc3NhZ2VQcm9wcykgPT4ge1xuICBjb25zdCB7IGVycm9yLCBjbGFzc05hbWUgPSAnJywgb25EaXNtaXNzIH0gPSBwcm9wc1xuICBcbiAgaWYgKCFlcnJvcikge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgXG4gIGNvbnN0IGVycm9yU3R5bGUgPSBjc3NgXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIHBhZGRpbmc6IDAuNXJlbTtcbiAgICBtYXJnaW46IDAuNXJlbSAwO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXN5cy1jb2xvci1lcnJvci1saWdodCk7XG4gICAgY29sb3I6IHZhcigtLXN5cy1jb2xvci1lcnJvci1kYXJrKTtcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICBnYXA6IDAuNXJlbTtcbiAgICBcbiAgICAuZXJyb3ItaWNvbiB7XG4gICAgICBmbGV4LXNocmluazogMDtcbiAgICB9XG4gICAgXG4gICAgLmVycm9yLXRleHQge1xuICAgICAgZmxleDogMTtcbiAgICB9XG4gICAgXG4gICAgLmVycm9yLWRpc21pc3Mge1xuICAgICAgZmxleC1zaHJpbms6IDA7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBwYWRkaW5nOiAwLjI1cmVtO1xuICAgICAgJjpob3ZlciB7XG4gICAgICAgIG9wYWNpdHk6IDAuNztcbiAgICAgIH1cbiAgICB9XG4gIGBcbiAgXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2BlcnJvci1tZXNzYWdlICR7Y2xhc3NOYW1lfWB9IGNzcz17ZXJyb3JTdHlsZX0gcm9sZT1cImFsZXJ0XCI+XG4gICAgICA8SWNvbiBpY29uPXtpY29uRXJyb3J9IGNsYXNzTmFtZT1cImVycm9yLWljb25cIiBzaXplPVwic21cIiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZXJyb3ItdGV4dFwiPntlcnJvcn08L3NwYW4+XG4gICAgICB7b25EaXNtaXNzICYmIChcbiAgICAgICAgPEJ1dHRvbiBcbiAgICAgICAgICBzaXplPVwic21cIiBcbiAgICAgICAgICB0eXBlPVwidGVydGlhcnlcIiBcbiAgICAgICAgICBpY29uIFxuICAgICAgICAgIG9uQ2xpY2s9e29uRGlzbWlzc31cbiAgICAgICAgICBjbGFzc05hbWU9XCJlcnJvci1kaXNtaXNzXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPVwiRGlzbWlzcyBlcnJvclwiXG4gICAgICAgID5cbiAgICAgICAgICA8SWNvbiBpY29uPXtyZXF1aXJlKCdqaW11LWljb25zL3N2Zy9vdXRsaW5lZC9lZGl0b3IvY2xvc2Uuc3ZnJykuZGVmYXVsdH0gc2l6ZT1cInNtXCIgLz5cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApXG59XG5cblxuXG4iLCIvKiogQGpzeCBqc3ggKi9cbmltcG9ydCB7XG4gIFJlYWN0LFxuICBqc3gsXG4gIGdldEFwcFN0b3JlLFxuICBEYXRhU291cmNlQ29tcG9uZW50LFxuICB0eXBlIERhdGFTb3VyY2UsXG4gIHR5cGUgVXNlRGF0YVNvdXJjZSxcbiAgYXBwQ29uZmlnVXRpbHMsXG4gIHR5cGUgSU1EYXRhU291cmNlSW5mbyxcbiAgRGF0YVNvdXJjZVN0YXR1cyxcbiAgdHlwZSBJbW11dGFibGVPYmplY3QsXG4gIGhvb2tzXG59IGZyb20gJ2ppbXUtY29yZSdcbmltcG9ydCB7IEljb24sIFRvb2x0aXAsIEJ1dHRvbiwgZGVmYXVsdE1lc3NhZ2VzIH0gZnJvbSAnamltdS11aSdcbmltcG9ydCB7IEVudGl0eVN0YXR1c1R5cGUsIFN0YXR1c0luZGljYXRvciB9IGZyb20gJy4vY29tbW9uLWNvbXBvbmVudHMnXG5pbXBvcnQgaWNvbldhcm5pbmcgZnJvbSAnamltdS1pY29ucy9zdmcvb3V0bGluZWQvc3VnZ2VzdGVkL3dhcm5pbmcuc3ZnJ1xuaW1wb3J0IGljb25FcnJvciBmcm9tICdqaW11LWljb25zL3N2Zy9vdXRsaW5lZC9zdWdnZXN0ZWQvZXJyb3Iuc3ZnJ1xuaW1wb3J0IHsgdXNlRGF0YVNvdXJjZUV4aXN0cyB9IGZyb20gJy4vdXNlLWRzLWV4aXN0cydcblxuaW50ZXJmYWNlIENvbnRlbnRQcm9wcyB7XG4gIHdpZGdldElkOiBzdHJpbmdcbiAgdXNlRGF0YVNvdXJjZTogSW1tdXRhYmxlT2JqZWN0PFVzZURhdGFTb3VyY2U+XG4gIG9uU3RhdHVzQ2hhbmdlPzogKGVuYWJsZWQ6IGJvb2xlYW4pID0+IHZvaWRcbiAgb25EYXRhU291cmNlQ3JlYXRlZD86IChkczogRGF0YVNvdXJjZSkgPT4gdm9pZFxuICBzaG93TWVzc2FnZT86IGJvb2xlYW5cbn1cblxuLyoqXG4gKiBTaG93IGljb24gYW5kIG1lc3NhZ2UgaWYgdGhlIGRhdGEgc291cmNlIGRvZXNuJ3Qgd29yay5cbiAqIEBwYXJhbSBwcm9wc1xuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERhdGFTb3VyY2VUaXAgKHByb3BzOiBDb250ZW50UHJvcHMpIHtcbiAgY29uc3QgeyB3aWRnZXRJZCwgdXNlRGF0YVNvdXJjZSwgb25TdGF0dXNDaGFuZ2UsIG9uRGF0YVNvdXJjZUNyZWF0ZWQsIHNob3dNZXNzYWdlID0gZmFsc2UgfSA9IHByb3BzXG4gIGNvbnN0IGdldEkxOG5NZXNzYWdlID0gaG9va3MudXNlVHJhbnNsYXRpb24oZGVmYXVsdE1lc3NhZ2VzKVxuICBjb25zdCBkc0V4aXN0czogYm9vbGVhbiA9IHVzZURhdGFTb3VyY2VFeGlzdHMoeyB3aWRnZXRJZCwgdXNlRGF0YVNvdXJjZUlkOiB1c2VEYXRhU291cmNlLmRhdGFTb3VyY2VJZCB9KVxuICBjb25zdCBbZHNTdGF0dXMsIHNldERzU3RhdHVzXSA9IFJlYWN0LnVzZVN0YXRlPCdlcnJvcicgfCAnd2FybmluZycgfCAnY3JlYXRpbmcnPihudWxsKVxuICBjb25zdCBbZGF0YVNvdXJjZSwgc2V0RGF0YVNvdXJjZV0gPSBSZWFjdC51c2VTdGF0ZTxEYXRhU291cmNlPihudWxsKVxuXG4gIGNvbnN0IGhhbmRsZURzSW5mb0NoYW5nZSA9IFJlYWN0LnVzZUNhbGxiYWNrKChpbmZvOiBJTURhdGFTb3VyY2VJbmZvKSA9PiB7XG4gICAgaWYgKGluZm8pIHtcbiAgICAgIGNvbnN0IHsgc3RhdHVzLCBpbnN0YW5jZVN0YXR1cyB9ID0gaW5mb1xuICAgICAgaWYgKGluc3RhbmNlU3RhdHVzID09PSBEYXRhU291cmNlU3RhdHVzLk5vdENyZWF0ZWQpIHtcbiAgICAgICAgc2V0RHNTdGF0dXMoJ2NyZWF0aW5nJylcbiAgICAgICAgb25TdGF0dXNDaGFuZ2U/LihmYWxzZSlcbiAgICAgIH0gZWxzZSBpZiAoaW5zdGFuY2VTdGF0dXMgPT09IERhdGFTb3VyY2VTdGF0dXMuQ3JlYXRlRXJyb3IgfHwgc3RhdHVzID09PSBEYXRhU291cmNlU3RhdHVzLkxvYWRFcnJvcikge1xuICAgICAgICBzZXREc1N0YXR1cygnZXJyb3InKVxuICAgICAgICBvblN0YXR1c0NoYW5nZT8uKGZhbHNlKVxuICAgICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IERhdGFTb3VyY2VTdGF0dXMuTm90UmVhZHkpIHtcbiAgICAgICAgc2V0RHNTdGF0dXMoJ3dhcm5pbmcnKVxuICAgICAgICBvblN0YXR1c0NoYW5nZT8uKGZhbHNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0RHNTdGF0dXMobnVsbClcbiAgICAgICAgb25TdGF0dXNDaGFuZ2U/Lih0cnVlKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW29uU3RhdHVzQ2hhbmdlXSlcblxuICBjb25zdCBoYW5kbGVEc0NyZWF0ZWQgPSBSZWFjdC51c2VDYWxsYmFjaygoZHM6IERhdGFTb3VyY2UpID0+IHtcbiAgICBzZXREYXRhU291cmNlKGRzKVxuICAgIG9uRGF0YVNvdXJjZUNyZWF0ZWQ/LihkcylcbiAgfSwgW29uRGF0YVNvdXJjZUNyZWF0ZWRdKVxuXG4gIGNvbnN0IGhhbmRsZURzQ3JlYXRlRmFpbGVkID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldERhdGFTb3VyY2UobnVsbClcbiAgICBzZXREc1N0YXR1cygnZXJyb3InKVxuICAgIG9uU3RhdHVzQ2hhbmdlPy4oZmFsc2UpXG4gIH0sIFtvblN0YXR1c0NoYW5nZV0pXG5cbiAgbGV0IHN0YXR1c0ljb25cbiAgbGV0IHN0YXR1c01zZ1xuICBsZXQgY29sb3JcbiAgaWYgKGRzU3RhdHVzID09PSAnY3JlYXRpbmcnKSB7XG4gICAgc3RhdHVzSWNvbiA9IGljb25FcnJvclxuICAgIHN0YXR1c01zZyA9IGdldEkxOG5NZXNzYWdlKCdsb2FkaW5nJylcbiAgfSBlbHNlIGlmICghZHNFeGlzdHMgfHwgZHNTdGF0dXMgPT09ICdlcnJvcicpIHtcbiAgICBzdGF0dXNJY29uID0gaWNvbkVycm9yXG4gICAgc3RhdHVzTXNnID0gZ2V0STE4bk1lc3NhZ2UoJ2RhdGFTb3VyY2VDcmVhdGVFcnJvcicpXG4gICAgY29sb3IgPSAndmFyKC0tc3lzLWNvbG9yLWVycm9yLW1haW4pJ1xuICB9IGVsc2UgaWYgKGRzU3RhdHVzID09PSAnd2FybmluZycpIHtcbiAgICBsZXQgbGFiZWwgPSAnJ1xuICAgIGNvbnN0IG9yaWdpbkRzID0gZGF0YVNvdXJjZT8uZ2V0T3JpZ2luRGF0YVNvdXJjZXMoKT8uWzBdXG4gICAgaWYgKG9yaWdpbkRzKSB7XG4gICAgICBsYWJlbCA9IG9yaWdpbkRzLmdldExhYmVsKCkgfHwgb3JpZ2luRHMuZ2V0RGF0YVNvdXJjZUpzb24oKS5zb3VyY2VMYWJlbFxuICAgIH0gZWxzZSBpZiAoZGF0YVNvdXJjZSkge1xuICAgICAgbGFiZWwgPSBkYXRhU291cmNlLmdldExhYmVsKCkgfHwgZGF0YVNvdXJjZS5nZXREYXRhU291cmNlSnNvbigpLmxhYmVsXG4gICAgfVxuXG4gICAgY29uc3Qgd2lkZ2V0SWQgPSBhcHBDb25maWdVdGlscy5nZXRXaWRnZXRJZEJ5T3V0cHV0RGF0YVNvdXJjZSh1c2VEYXRhU291cmNlKVxuICAgIGNvbnN0IGFwcFN0YXRlID0gd2luZG93Py5qaW11Q29uZmlnPy5pc0J1aWxkZXJcbiAgICAgID8gZ2V0QXBwU3RvcmUoKS5nZXRTdGF0ZSgpLmFwcFN0YXRlSW5CdWlsZGVyXG4gICAgICA6IGdldEFwcFN0b3JlKCkuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IHdpZGdldExhYmVsID0gYXBwU3RhdGUuYXBwQ29uZmlnLndpZGdldHNbd2lkZ2V0SWRdPy5sYWJlbFxuXG4gICAgY29sb3IgPSAndmFyKC0tc3lzLWNvbG9yLXdhcm5pbmctZGFyayknXG4gICAgc3RhdHVzSWNvbiA9IGljb25XYXJuaW5nXG4gICAgc3RhdHVzTXNnID0gZ2V0STE4bk1lc3NhZ2UoJ291dHB1dERhdGFJc05vdEdlbmVyYXRlZCcsIHtcbiAgICAgIG91dHB1dERzTGFiZWw6IGxhYmVsID8/ICcnLFxuICAgICAgc291cmNlV2lkZ2V0TmFtZTogd2lkZ2V0TGFiZWwgPz8gJydcbiAgICB9KVxuICB9XG4gIHJldHVybiAoXG4gICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAge2RzRXhpc3RzICYmIChcbiAgICAgICAgPERhdGFTb3VyY2VDb21wb25lbnRcbiAgICAgICAgICB1c2VEYXRhU291cmNlPXt1c2VEYXRhU291cmNlfVxuICAgICAgICAgIG9uRGF0YVNvdXJjZUluZm9DaGFuZ2U9e2hhbmRsZURzSW5mb0NoYW5nZX1cbiAgICAgICAgICBvbkRhdGFTb3VyY2VDcmVhdGVkPXtoYW5kbGVEc0NyZWF0ZWR9XG4gICAgICAgICAgb25DcmVhdGVEYXRhU291cmNlRmFpbGVkPXtoYW5kbGVEc0NyZWF0ZUZhaWxlZH1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICB7ZHNTdGF0dXMgPT09ICdjcmVhdGluZycgJiYgPFN0YXR1c0luZGljYXRvciBzdGF0dXNUeXBlPXtFbnRpdHlTdGF0dXNUeXBlLkxvYWRpbmd9IHRpdGxlPXtzdGF0dXNNc2d9IC8+fVxuICAgICAgeyghZHNFeGlzdHMgfHwgZHNTdGF0dXMgPT09ICdlcnJvcicgfHwgZHNTdGF0dXMgPT09ICd3YXJuaW5nJykgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlcic+XG4gICAgICAgICAgPFRvb2x0aXAgdGl0bGU9e3N0YXR1c01zZ30+XG4gICAgICAgICAgICA8QnV0dG9uIHNpemU9J3NtJyB0eXBlPSd0ZXJ0aWFyeScgaWNvbj48SWNvbiBpY29uPXtzdGF0dXNJY29ufSBjb2xvcj17Y29sb3J9IC8+PC9CdXR0b24+XG4gICAgICAgICAgPC9Ub29sdGlwPlxuICAgICAgICAgIHtzaG93TWVzc2FnZSAmJiA8ZGl2IGNsYXNzTmFtZT0nc3RhdHVzLW1lc3NhZ2UnPntzdGF0dXNNc2d9PC9kaXY+fVxuICAgICAgICA8L2Rpdj5cbiAgICAgICl9XG4gICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgKVxufVxuXG5cblxuIiwiaW1wb3J0IHtcbiAgUmVhY3RSZWR1eCxcbiAgdHlwZSBJTVN0YXRlLFxuICB0eXBlIElNQXBwQ29uZmlnXG59IGZyb20gJ2ppbXUtY29yZSdcbmludGVyZmFjZSBQcm9wcyB7XG4gIHdpZGdldElkOiBzdHJpbmdcbiAgdXNlRGF0YVNvdXJjZUlkOiBzdHJpbmdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZURhdGFTb3VyY2VFeGlzdHMgKHByb3BzOiBQcm9wcykge1xuICBjb25zdCB7IHdpZGdldElkLCB1c2VEYXRhU291cmNlSWQgfSA9IHByb3BzXG5cbiAgY29uc3QgZXhpc3RzOiBib29sZWFuID0gUmVhY3RSZWR1eC51c2VTZWxlY3Rvcigoc3RhdGU6IElNU3RhdGUpID0+IHtcbiAgICBsZXQgYXBwQ29uZmlnOiBJTUFwcENvbmZpZ1xuICAgIGlmICh3aW5kb3cuamltdUNvbmZpZy5pc0J1aWxkZXIpIHtcbiAgICAgIGFwcENvbmZpZyA9IHN0YXRlLmFwcFN0YXRlSW5CdWlsZGVyLmFwcENvbmZpZ1xuICAgIH0gZWxzZSB7XG4gICAgICBhcHBDb25maWcgPSBzdGF0ZS5hcHBDb25maWdcbiAgICB9XG4gICAgY29uc3QgdXNlRGF0YVNvdXJjZXMgPSBhcHBDb25maWcud2lkZ2V0c1t3aWRnZXRJZF0udXNlRGF0YVNvdXJjZXMgPz8gW11cbiAgICByZXR1cm4gdXNlRGF0YVNvdXJjZXMuc29tZSh1c2VEcyA9PiB1c2VEcy5kYXRhU291cmNlSWQgPT09IHVzZURhdGFTb3VyY2VJZClcbiAgfSlcblxuICByZXR1cm4gZXhpc3RzXG59XG5cblxuXG4iLCJpbXBvcnQgdHlwZSB7IElQb3B1cEluZm8gfSBmcm9tICdAZXNyaS9hcmNnaXMtcmVzdC1mZWF0dXJlLXNlcnZpY2UnXG5pbXBvcnQgdHlwZSB7IEludGxTaGFwZSwgRGF0YVNvdXJjZSB9IGZyb20gJ2ppbXUtY29yZSdcblxuLyoqXG4gKiBUb2dnbGUgaXRlbXMgaW4gYW4gYXJyYXlcbiAqL1xuZXhwb3J0IGNvbnN0IHRvZ2dsZUl0ZW1JbkFycmF5ID0gKGl0ZW0sIGl0ZW1zID0gW10pID0+IGl0ZW1zLmluY2x1ZGVzKGl0ZW0pID8gaXRlbXMuZmlsdGVyKGkgPT4gaSAhPT0gaXRlbSkgOiBbLi4uaXRlbXMsIGl0ZW1dXG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0YVNvdXJjZU1hcCB7XG4gIFtkYXRhU291cmNlSWQ6IHN0cmluZ106IERhdGFTb3VyY2Vcbn1cblxuZXhwb3J0IHR5cGUgR2V0STE4bk1lc3NhZ2VUeXBlID0gKGlkOiBzdHJpbmcsIG9wdGlvbnM/OiB7IG1lc3NhZ2VzPzogYW55LCB2YWx1ZXM/OiBhbnkgfSkgPT4gc3RyaW5nXG4vKipcbiAqIEEgZmFjdG9yeSB0byBjcmVhdGUgYSBmdW5jdGlvbiBvZiBnZXR0aW5nIGkxOG4gbWVzc2FnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2V0STE4bk1lc3NhZ2UgKG9wdGlvbnM6IHsgaW50bDogSW50bFNoYXBlLCBkZWZhdWx0TWVzc2FnZXM/OiBhbnkgfSkge1xuICBjb25zdCB7IGludGwsIGRlZmF1bHRNZXNzYWdlcyA9IHt9IH0gPSBvcHRpb25zIHx8IHt9XG4gIGNvbnN0IGdldEkxOG5NZXNzYWdlOiBHZXRJMThuTWVzc2FnZVR5cGUgPSAoaWQsIG9wdGlvbnMpID0+IHtcbiAgICBjb25zdCB7IG1lc3NhZ2VzLCB2YWx1ZXMgfSA9IG9wdGlvbnMgfHwge31cbiAgICByZXR1cm4gaW50bC5mb3JtYXRNZXNzYWdlKHsgaWQsIGRlZmF1bHRNZXNzYWdlOiAobWVzc2FnZXMgfHwgZGVmYXVsdE1lc3NhZ2VzKVtpZF0gfSwgdmFsdWVzKVxuICB9XG4gIHJldHVybiBnZXRJMThuTWVzc2FnZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmllbGRJbmZvc0luUG9wdXBDb250ZW50IChwb3B1cEluZm86IElQb3B1cEluZm8pIHtcbiAgY29uc3QgcmVzdWx0ID0gW11cbiAgaWYgKHBvcHVwSW5mbz8ucG9wdXBFbGVtZW50cz8ubGVuZ3RoID4gMCkge1xuICAgIHBvcHVwSW5mby5wb3B1cEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBpZiAoZWxlbWVudC50eXBlID09PSAnZmllbGRzJyAmJiBlbGVtZW50LmZpZWxkSW5mb3M/Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmVzdWx0LnB1c2goLi4uZWxlbWVudC5maWVsZEluZm9zKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX19lbW90aW9uX3JlYWN0X2pzeF9ydW50aW1lX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfY29yZV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X3RoZW1lX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfdWlfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCIvKipcclxuICogV2VicGFjayB3aWxsIHJlcGxhY2UgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gd2l0aCBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgdG8gc2V0IHRoZSBwdWJsaWMgcGF0aCBkeW5hbWljYWxseS5cclxuICogVGhlIHJlYXNvbiB3aHkgd2UgY2FuJ3Qgc2V0IHRoZSBwdWJsaWNQYXRoIGluIHdlYnBhY2sgY29uZmlnIGlzOiB3ZSBjaGFuZ2UgdGhlIHB1YmxpY1BhdGggd2hlbiBkb3dubG9hZC5cclxuICogKi9cclxuX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB3aW5kb3cuamltdUNvbmZpZy5iYXNlVXJsXHJcbiIsIi8qKlxuICogU2hhcmVkIGNvbW1vbiB1dGlsaXRpZXMgYW5kIGNvbXBvbmVudHMgZm9yIEV4cGVyaWVuY2UgQnVpbGRlciB3aWRnZXRzXG4gKiBcbiAqIFRoaXMgbW9kdWxlIGV4cG9ydHMgY29tbW9uIGZ1bmN0aW9uYWxpdHkgdGhhdCBjYW4gYmUgc2hhcmVkIGJldHdlZW5cbiAqIHF1ZXJ5LXNpbXBsZSwgaGVscGVyLXNpbXBsZSwgYW5kIG90aGVyIGN1c3RvbSB3aWRnZXRzLlxuICogXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgJ3dpZGdldHMvc2hhcmVkLWNvZGUvY29tbW9uJ1xuICovXG5cbmV4cG9ydCAqIGZyb20gJy4vY29tbW9uL2NvbW1vbi1jb21wb25lbnRzJ1xuZXhwb3J0ICogZnJvbSAnLi9jb21tb24vdXRpbHMnXG5leHBvcnQgKiBmcm9tICcuL2NvbW1vbi91c2UtZHMtZXhpc3RzJ1xuZXhwb3J0ICogZnJvbSAnLi9jb21tb24vZGF0YS1zb3VyY2UtdGlwJ1xuXG5cblxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9