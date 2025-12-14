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

/***/ "./your-extensions/widgets/shared-code/common/debug-logger.ts":
/*!********************************************************************!*\
  !*** ./your-extensions/widgets/shared-code/common/debug-logger.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createHelperSimpleDebugLogger: () => (/* binding */ createHelperSimpleDebugLogger),
/* harmony export */   createQuerySimpleDebugLogger: () => (/* binding */ createQuerySimpleDebugLogger)
/* harmony export */ });
/**
 * Configurable debug logging utility for Experience Builder widgets
 *
 * Usage:
 * - Add ?debug=all to URL to see all debug logs
 * - Add ?debug=HASH,FORM to see specific feature logs
 * - Add ?debug=false to disable all debug logs
 *
 * Features (QuerySimple):
 * - HASH: Hash parameter processing
 * - FORM: Query form interactions
 * - TASK: Query task management
 * - ZOOM: Zoom behavior
 * - MAP-EXTENT: Map extent changes
 * - DATA-ACTION: Data action execution (Add to Map, etc.)
 * - GROUP: Query grouping and dropdown selection
 * - SELECTION: Selection detection and identify popup tracking
 * - WIDGET-STATE: Widget lifecycle events (open/close handshake)
 * - RESTORE: Selection restoration when widget opens
 * - RESULTS-MODE: Results management mode selection (Create new, Add to, Remove from)
 * - EXPAND-COLLAPSE: Expand/collapse state management for result items
 *
 * Features (HelperSimple):
 * - HASH: Hash parameter monitoring and widget opening
 * - SELECTION: Selection tracking from QuerySimple
 * - WIDGET-STATE: Widget state handshake (open/close events)
 * - RESTORE: Selection restoration attempts and results
 */
class DebugLogger {
    constructor(options) {
        this.enabledFeatures = new Set();
        this.initialized = false;
        this.widgetName = options.widgetName;
        this.features = options.features;
    }
    initialize() {
        if (this.initialized)
            return;
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const debugValue = urlParams.get('debug');
        if (debugValue === 'false') {
            // Explicitly disabled
            this.initialized = true;
            return;
        }
        if (debugValue === 'all') {
            // Enable all features only if explicitly set to 'all'
            this.features.forEach(feature => {
                if (feature !== 'all' && feature !== 'false') {
                    this.enabledFeatures.add(feature);
                }
            });
        }
        else if (debugValue !== null) {
            // Parse comma-separated feature list
            const requestedFeatures = debugValue.split(',').map(f => f.trim().toUpperCase());
            requestedFeatures.forEach(feature => {
                if (feature.toUpperCase() === 'ALL') {
                    // Enable all features for this widget
                    this.features.forEach(f => {
                        if (f !== 'all' && f !== 'false') {
                            this.enabledFeatures.add(f);
                        }
                    });
                }
                else if (this.features.includes(feature)) {
                    this.enabledFeatures.add(feature);
                }
            });
        }
        this.initialized = true;
    }
    isEnabled(feature) {
        this.initialize();
        if (this.enabledFeatures.has('all')) {
            return true;
        }
        return this.enabledFeatures.has(feature);
    }
    log(feature, data) {
        if (!this.isEnabled(feature)) {
            return;
        }
        const logData = Object.assign({ feature, timestamp: new Date().toISOString() }, data);
        console.log(`[${this.widgetName.toUpperCase()}-${feature}]`, JSON.stringify(logData, null, 2));
    }
    getConfig() {
        this.initialize();
        const urlParams = new URLSearchParams(window.location.search);
        const debugValue = urlParams.get('debug');
        return {
            enabledFeatures: Array.from(this.enabledFeatures),
            debugValue
        };
    }
}
/**
 * Creates a debug logger instance for QuerySimple widget
 */
function createQuerySimpleDebugLogger() {
    return new DebugLogger({
        widgetName: 'QUERYSIMPLE',
        features: ['HASH', 'FORM', 'TASK', 'ZOOM', 'MAP-EXTENT', 'DATA-ACTION', 'GROUP', 'SELECTION', 'WIDGET-STATE', 'RESTORE', 'RESULTS-MODE', 'EXPAND-COLLAPSE']
    });
}
/**
 * Creates a debug logger instance for HelperSimple widget
 */
function createHelperSimpleDebugLogger() {
    return new DebugLogger({
        widgetName: 'HELPERSIMPLE',
        features: ['HASH', 'SELECTION', 'WIDGET-STATE', 'RESTORE']
    });
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
/* harmony export */   createHelperSimpleDebugLogger: () => (/* reexport safe */ _common_debug_logger__WEBPACK_IMPORTED_MODULE_4__.createHelperSimpleDebugLogger),
/* harmony export */   createQuerySimpleDebugLogger: () => (/* reexport safe */ _common_debug_logger__WEBPACK_IMPORTED_MODULE_4__.createQuerySimpleDebugLogger),
/* harmony export */   getFieldInfosInPopupContent: () => (/* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_1__.getFieldInfosInPopupContent),
/* harmony export */   toggleItemInArray: () => (/* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_1__.toggleItemInArray),
/* harmony export */   useDataSourceExists: () => (/* reexport safe */ _common_use_ds_exists__WEBPACK_IMPORTED_MODULE_2__.useDataSourceExists)
/* harmony export */ });
/* harmony import */ var _common_common_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common/common-components */ "./your-extensions/widgets/shared-code/common/common-components.tsx");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/utils */ "./your-extensions/widgets/shared-code/common/utils.tsx");
/* harmony import */ var _common_use_ds_exists__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./common/use-ds-exists */ "./your-extensions/widgets/shared-code/common/use-ds-exists.tsx");
/* harmony import */ var _common_data_source_tip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common/data-source-tip */ "./your-extensions/widgets/shared-code/common/data-source-tip.tsx");
/* harmony import */ var _common_debug_logger__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./common/debug-logger */ "./your-extensions/widgets/shared-code/common/debug-logger.ts");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsVUFBVSxDQUFDO1lBQ3BDLENBQUM7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0lBQ0QsT0FBTyxNQUFNO0FBQ2YsQ0FBQzs7Ozs7Ozs7Ozs7O0FDbkNELHdFOzs7Ozs7Ozs7OztBQ0FBLHVEOzs7Ozs7Ozs7OztBQ0FBLHdEOzs7Ozs7Ozs7OztBQ0FBLHFEOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQSxFOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7V0NOQSwyQjs7Ozs7Ozs7OztBQ0FBOzs7S0FHSztBQUNMLHFCQUF1QixHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSm5EOzs7Ozs7O0dBT0c7QUFFdUM7QUFDWjtBQUNRO0FBQ0U7QUFDSCIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWljb25zL3N2Zy9vdXRsaW5lZC9lZGl0b3IvY2xvc2Uuc3ZnIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWljb25zL3N2Zy9vdXRsaW5lZC9zdWdnZXN0ZWQvZXJyb3Iuc3ZnIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWljb25zL3N2Zy9vdXRsaW5lZC9zdWdnZXN0ZWQvd2FybmluZy5zdmciLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi9jb21tb24tY29tcG9uZW50cy50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi9kYXRhLXNvdXJjZS10aXAudHN4Iiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24vZGVidWctbG9nZ2VyLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24vdXNlLWRzLWV4aXN0cy50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi91dGlscy50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmUvZW1vdGlvblwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LXRoZW1lXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LXVpXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IFwiPHN2ZyB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxNiAxNlxcXCI+PHBhdGggZmlsbD1cXFwiIzAwMFxcXCIgZD1cXFwibTguNzQ1IDggNi4xIDYuMWEuNTI3LjUyNyAwIDEgMS0uNzQ1Ljc0Nkw4IDguNzQ2bC02LjEgNi4xYS41MjcuNTI3IDAgMSAxLS43NDYtLjc0Nmw2LjEtNi4xLTYuMS02LjFhLjUyNy41MjcgMCAwIDEgLjc0Ni0uNzQ2bDYuMSA2LjEgNi4xLTYuMWEuNTI3LjUyNyAwIDAgMSAuNzQ2Ljc0NnpcXFwiPjwvcGF0aD48L3N2Zz5cIiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgdmlld0JveD1cXFwiMCAwIDE2IDE2XFxcIj48cGF0aCBmaWxsPVxcXCIjMDAwXFxcIiBmaWxsLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04IDE2QTggOCAwIDEgMSA4IDBhOCA4IDAgMCAxIDAgMTZtMC0xQTcgNyAwIDEgMCA4IDFhNyA3IDAgMCAwIDAgMTRNOCA0YS45MDUuOTA1IDAgMCAwLS45Ljk5NWwuMzUgMy41MDdhLjU1Mi41NTIgMCAwIDAgMS4xIDBsLjM1LTMuNTA3QS45MDUuOTA1IDAgMCAwIDggNG0xIDdhMSAxIDAgMSAxLTIgMCAxIDEgMCAwIDEgMiAwXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiPjwvcGF0aD48L3N2Zz5cIiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgdmlld0JveD1cXFwiMCAwIDE2IDE2XFxcIj48cGF0aCBmaWxsPVxcXCIjMDAwXFxcIiBmaWxsLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04IDIuMTI1IDE0LjMzNCAxNEgxLjY2N3ptLS44ODItLjQ3YTEgMSAwIDAgMSAxLjc2NSAwbDYuMzMzIDExLjg3NEExIDEgMCAwIDEgMTQuMzM0IDE1SDEuNjY3YTEgMSAwIDAgMS0uODgyLTEuNDd6TTggNC44NzRhLjkwNS45MDUgMCAwIDAtLjkuOTk1bC4zNSAzLjUwN2EuNTUyLjU1MiAwIDAgMCAxLjEgMEw4LjkgNS44N2EuOTA1LjkwNSAwIDAgMC0uOS0uOTk1bTEgN2ExIDEgMCAxIDEtMiAwIDEgMSAwIDAgMSAyIDBcXFwiIGNsaXAtcnVsZT1cXFwiZXZlbm9kZFxcXCI+PC9wYXRoPjwvc3ZnPlwiIiwiLyoqIEBqc3gganN4ICovXG5pbXBvcnQgeyBSZWFjdCwganN4LCBjc3MgfSBmcm9tICdqaW11LWNvcmUnXG5pbXBvcnQgeyBCdXR0b24sIE1vZGFsLCBNb2RhbEJvZHksIE1vZGFsRm9vdGVyLCBQYW5lbEhlYWRlciwgSWNvbiwgdHlwZSBUaGVtZVByb3BzIH0gZnJvbSAnamltdS11aSdcbmltcG9ydCB7IHdpdGhUaGVtZSB9IGZyb20gJ2ppbXUtdGhlbWUnXG5pbXBvcnQgaWNvbkVycm9yIGZyb20gJ2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL3N1Z2dlc3RlZC9lcnJvci5zdmcnXG5jb25zdCB7IHVzZVN0YXRlIH0gPSBSZWFjdFxuXG4vKipcbiAqIEEgc2ltcGxlIEZ1bmN0aW9uYWwgQ29tcG9uZW50IHN0b3Jpbmcgc29tZSBTdGF0ZXMgdGhhdCBhcmUgY29tbW9ubHkgdXNlZFxuICovXG5leHBvcnQgY29uc3QgU3RhdGVIb2xkZXIgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyBpbml0U3RhdGUgPSB7fSwgY2hpbGRyZW4gfSA9IHByb3BzXG4gIGNvbnN0IGRlZmF1bHRTdGF0ZU1hcCA9IHtcbiAgICB2aXNpYmxlOiB0cnVlLFxuICAgIHJlZkNvbnRhaW5lcjogbnVsbFxuICB9XG4gIGNvbnN0IHVzZVN0YXRlTWFwID0ge1xuICAgIHZpc2libGU6IHVzZVN0YXRlKCd2aXNpYmxlJyBpbiBpbml0U3RhdGUgPyBpbml0U3RhdGUudmlzaWJsZSA6IGRlZmF1bHRTdGF0ZU1hcC52aXNpYmxlKSxcbiAgICByZWZDb250YWluZXI6IHVzZVN0YXRlKCdyZWZDb250YWluZXInIGluIGluaXRTdGF0ZSA/IGluaXRTdGF0ZS5yZWZDb250YWluZXIgOiBkZWZhdWx0U3RhdGVNYXAucmVmQ29udGFpbmVyKSxcbiAgICBjdXN0b21EYXRhOiB1c2VTdGF0ZSh7IC4uLmluaXRTdGF0ZS5jdXN0b21EYXRhIH0pXG4gIH1cbiAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD57Y2hpbGRyZW4odXNlU3RhdGVNYXApfTwvUmVhY3QuRnJhZ21lbnQ+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nUGFuZWxQcm9wcyB7XG4gIHBhbmVsVmlzaWJsZTogYm9vbGVhblxuICBzZXRQYW5lbFZpc2libGU6ICh2aXNpYmxlOiBib29sZWFuKSA9PiB2b2lkXG4gIGdldEkxOG5NZXNzYWdlOiAoaWQ6IHN0cmluZykgPT4gYW55XG4gIGlzTW9kYWw/OiBib29sZWFuXG4gIHRpdGxlPzogYW55XG4gIGJvZHlDb250ZW50PzogYW55XG4gIGhhc0hlYWRlcj86IGJvb2xlYW5cbiAgaGFzRm9vdGVyPzogYm9vbGVhblxufVxuXG4vKipcbiAqIEEgZGlhbG9nIHBvcHVwXG4gKi9cbmV4cG9ydCBjb25zdCBEaWFsb2dQYW5lbCA9IHdpdGhUaGVtZSgocHJvcHM6IERpYWxvZ1BhbmVsUHJvcHMgJiBUaGVtZVByb3BzKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWUsIHBhbmVsVmlzaWJsZSwgc2V0UGFuZWxWaXNpYmxlLCBnZXRJMThuTWVzc2FnZSwgaXNNb2RhbCA9IHRydWUsIHRpdGxlID0gZ2V0STE4bk1lc3NhZ2UoJ3F1ZXJ5TWVzc2FnZScpLCBib2R5Q29udGVudCA9ICcnLCBoYXNIZWFkZXIgPSB0cnVlLCBoYXNGb290ZXIgPSB0cnVlIH0gPSBwcm9wc1xuICBjb25zdCB0b2dnbGUgPSAoKSA9PiB7IHNldFBhbmVsVmlzaWJsZShmYWxzZSkgfVxuICBjb25zdCBnZXRDb250ZW50ID0gKCkgPT4gPFJlYWN0LkZyYWdtZW50PlxuICAgIHtcbiAgICAgIGhhc0hlYWRlciAmJlxuICAgICAgICA8UGFuZWxIZWFkZXIgY2xhc3NOYW1lPSdweS0yJyB0aXRsZT17dGl0bGV9IG9uQ2xvc2U9e3RvZ2dsZX0gLz5cbiAgICB9XG4gICAgPE1vZGFsQm9keT57Ym9keUNvbnRlbnR9PC9Nb2RhbEJvZHk+XG4gICAge1xuICAgICAgaGFzRm9vdGVyICYmXG4gICAgICAgIDxNb2RhbEZvb3Rlcj5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e3RvZ2dsZX0+e2dldEkxOG5NZXNzYWdlKCdvaycpfTwvQnV0dG9uPlxuICAgICAgICA8L01vZGFsRm9vdGVyPlxuICAgIH1cbiAgPC9SZWFjdC5GcmFnbWVudD5cbiAgY29uc3QgZ2VuZXJhbENsYXNzTmFtZSA9ICd1aS11bml0LWRpYWxvZy1wYW5lbCdcbiAgY29uc3QgcmVuZGVyTW9kYWxDb250ZW50ID0gKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICA8TW9kYWwgY2xhc3NOYW1lPXtnZW5lcmFsQ2xhc3NOYW1lfSBpc09wZW49e3BhbmVsVmlzaWJsZX0gdG9nZ2xlPXt0b2dnbGV9IGJhY2tkcm9wPSdzdGF0aWMnPlxuICAgICAgICB7Z2V0Q29udGVudCgpfVxuICAgICAgPC9Nb2RhbD5cbiAgICApXG4gIH1cbiAgY29uc3QgcmVuZGVyTm9uTW9kYWxDb250ZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IGdldFN0eWxlID0gKCkgPT4gY3NzYFxuICAgICAgJi51aS11bml0LWRpYWxvZy1wYW5lbC5tb2RhbC1kaWFsb2cge1xuICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAubW9kYWwtY29udGVudCB7XG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHt0aGVtZS5yZWYucGFsZXR0ZS5uZXV0cmFsWzYwMF19O1xuICAgICAgICAgIGNvbG9yOiAke3RoZW1lLnJlZi5wYWxldHRlLmJsYWNrfTtcbiAgICAgICAgICBmb250LXNpemU6IC43NXJlbTtcbiAgICAgICAgICBmb250LXdlaWdodDogNDAwO1xuICAgICAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgICAgICAucGFuZWwtaGVhZGVyIHtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogLjgxMjVyZW07XG4gICAgICAgICAgICBwYWRkaW5nOiAuNjI1cmVtO1xuICAgICAgICAgIH1cbiAgICAgICAgICAubW9kYWwtYm9keSB7XG4gICAgICAgICAgICBwYWRkaW5nOiAwIC42MjVyZW0gLjc1cmVtO1xuICAgICAgICAgICAgd2hpdGUtc3BhY2U6IG5vcm1hbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtnZW5lcmFsQ2xhc3NOYW1lfSBtb2RhbC1kaWFsb2cgJHtwYW5lbFZpc2libGUgPyAnJyA6ICdjb2xsYXBzZSd9YH0gY3NzPXtnZXRTdHlsZSgpfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J21vZGFsLWNvbnRlbnQnPlxuICAgICAgICAgIHtnZXRDb250ZW50KCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG4gIHJldHVybiBpc01vZGFsID8gcmVuZGVyTW9kYWxDb250ZW50KCkgOiByZW5kZXJOb25Nb2RhbENvbnRlbnQoKVxufSlcblxuZXhwb3J0IGVudW0gRW50aXR5U3RhdHVzVHlwZSB7XG4gIE5vbmUgPSAnJyxcbiAgSW5pdCA9ICdpbml0JyxcbiAgTG9hZGluZyA9ICdsb2FkaW5nJyxcbiAgTG9hZGVkID0gJ2xvYWRlZCcsXG4gIFdhcm5pbmcgPSAnd2FybmluZycsXG4gIEVycm9yID0gJ2Vycm9yJyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGF0dXNJbmRpY2F0b3JQcm9wcyB7XG4gIGNsYXNzTmFtZT86IHN0cmluZ1xuICBzdGF0dXNUeXBlPzogRW50aXR5U3RhdHVzVHlwZVxuICB0aXRsZT86IHN0cmluZ1xufVxuXG4vKipcbiAqIEFuIGFuaW1hdGFibGUgaWNvbiByZXByZXNlbnRpbmcgc3RhdHVzXG4gKi9cbmV4cG9ydCBjb25zdCBTdGF0dXNJbmRpY2F0b3IgPSB3aXRoVGhlbWUoKHByb3BzOiBTdGF0dXNJbmRpY2F0b3JQcm9wcyAmIFRoZW1lUHJvcHMpID0+IHtcbiAgY29uc3QgeyB0aGVtZSwgY2xhc3NOYW1lLCB0aXRsZSwgc3RhdHVzVHlwZSB9ID0gcHJvcHNcbiAgY29uc3QgZ2V0U3R5bGUgPSAoKSA9PiBjc3NgXG4gICAgJi51aS11bml0LXN0YXR1cy1pbmRpY2F0b3Ige1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICYudWktdW5pdC1zdGF0dXMtaW5kaWNhdG9yX3N0YXR1cy10eXBlLWxvYWRpbmcge1xuICAgICAgICAmOmJlZm9yZSB7XG4gICAgICAgICAgQGtleWZyYW1lcyBsb2FkaW5nIHtcbiAgICAgICAgICAgIDAlIHt0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfTtcbiAgICAgICAgICAgIDEwMCUge3RyYW5zZm9ybTogcm90YXRlKDM2MGRlZyl9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50OiAnJztcbiAgICAgICAgICB3aWR0aDogMXJlbTtcbiAgICAgICAgICBoZWlnaHQ6IDFyZW07XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgJHt0aGVtZT8ucmVmLnBhbGV0dGU/Lm5ldXRyYWw/Lls1MDBdfTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkICR7dGhlbWU/LnN5cy5jb2xvcj8ucHJpbWFyeT8ubWFpbn07XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgICBhbmltYXRpb246IGxvYWRpbmcgMnMgaW5maW5pdGUgbGluZWFyO1xuICAgICAgICAgIG1hcmdpbi1yaWdodDogLjI1cmVtO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBgXG4gIHJldHVybiAoXG4gICAgc3RhdHVzVHlwZSAmJlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2NsYXNzTmFtZSA/PyAnJ30gdWktdW5pdC1zdGF0dXMtaW5kaWNhdG9yIHVpLXVuaXQtc3RhdHVzLWluZGljYXRvcl9zdGF0dXMtdHlwZS0ke3N0YXR1c1R5cGV9YH0gdGl0bGU9e3RpdGxlfSBjc3M9e2dldFN0eWxlKCl9IC8+XG4gIClcbn0pXG5cbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JNZXNzYWdlUHJvcHMge1xuICBlcnJvcjogc3RyaW5nIHwgbnVsbFxuICBjbGFzc05hbWU/OiBzdHJpbmdcbiAgb25EaXNtaXNzPzogKCkgPT4gdm9pZFxufVxuXG4vKipcbiAqIFNpbXBsZSBlcnJvciBtZXNzYWdlIGNvbXBvbmVudCBmb3IgZGlzcGxheWluZyB1c2VyLWZhY2luZyBlcnJvcnMuXG4gKiBVc2UgRGF0YVNvdXJjZVRpcCBmb3IgZGF0YSBzb3VyY2UtcmVsYXRlZCBlcnJvcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBFcnJvck1lc3NhZ2UgPSAocHJvcHM6IEVycm9yTWVzc2FnZVByb3BzKSA9PiB7XG4gIGNvbnN0IHsgZXJyb3IsIGNsYXNzTmFtZSA9ICcnLCBvbkRpc21pc3MgfSA9IHByb3BzXG4gIFxuICBpZiAoIWVycm9yKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBcbiAgY29uc3QgZXJyb3JTdHlsZSA9IGNzc2BcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgcGFkZGluZzogMC41cmVtO1xuICAgIG1hcmdpbjogMC41cmVtIDA7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc3lzLWNvbG9yLWVycm9yLWxpZ2h0KTtcbiAgICBjb2xvcjogdmFyKC0tc3lzLWNvbG9yLWVycm9yLWRhcmspO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICBmb250LXNpemU6IDAuODc1cmVtO1xuICAgIGdhcDogMC41cmVtO1xuICAgIFxuICAgIC5lcnJvci1pY29uIHtcbiAgICAgIGZsZXgtc2hyaW5rOiAwO1xuICAgIH1cbiAgICBcbiAgICAuZXJyb3ItdGV4dCB7XG4gICAgICBmbGV4OiAxO1xuICAgIH1cbiAgICBcbiAgICAuZXJyb3ItZGlzbWlzcyB7XG4gICAgICBmbGV4LXNocmluazogMDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIHBhZGRpbmc6IDAuMjVyZW07XG4gICAgICAmOmhvdmVyIHtcbiAgICAgICAgb3BhY2l0eTogMC43O1xuICAgICAgfVxuICAgIH1cbiAgYFxuICBcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YGVycm9yLW1lc3NhZ2UgJHtjbGFzc05hbWV9YH0gY3NzPXtlcnJvclN0eWxlfSByb2xlPVwiYWxlcnRcIj5cbiAgICAgIDxJY29uIGljb249e2ljb25FcnJvcn0gY2xhc3NOYW1lPVwiZXJyb3ItaWNvblwiIHNpemU9XCJzbVwiIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJlcnJvci10ZXh0XCI+e2Vycm9yfTwvc3Bhbj5cbiAgICAgIHtvbkRpc21pc3MgJiYgKFxuICAgICAgICA8QnV0dG9uIFxuICAgICAgICAgIHNpemU9XCJzbVwiIFxuICAgICAgICAgIHR5cGU9XCJ0ZXJ0aWFyeVwiIFxuICAgICAgICAgIGljb24gXG4gICAgICAgICAgb25DbGljaz17b25EaXNtaXNzfVxuICAgICAgICAgIGNsYXNzTmFtZT1cImVycm9yLWRpc21pc3NcIlxuICAgICAgICAgIGFyaWEtbGFiZWw9XCJEaXNtaXNzIGVycm9yXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxJY29uIGljb249e3JlcXVpcmUoJ2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL2VkaXRvci9jbG9zZS5zdmcnKS5kZWZhdWx0fSBzaXplPVwic21cIiAvPlxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICl9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuXG5cbiIsIi8qKiBAanN4IGpzeCAqL1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIGpzeCxcbiAgZ2V0QXBwU3RvcmUsXG4gIERhdGFTb3VyY2VDb21wb25lbnQsXG4gIHR5cGUgRGF0YVNvdXJjZSxcbiAgdHlwZSBVc2VEYXRhU291cmNlLFxuICBhcHBDb25maWdVdGlscyxcbiAgdHlwZSBJTURhdGFTb3VyY2VJbmZvLFxuICBEYXRhU291cmNlU3RhdHVzLFxuICB0eXBlIEltbXV0YWJsZU9iamVjdCxcbiAgaG9va3Ncbn0gZnJvbSAnamltdS1jb3JlJ1xuaW1wb3J0IHsgSWNvbiwgVG9vbHRpcCwgQnV0dG9uLCBkZWZhdWx0TWVzc2FnZXMgfSBmcm9tICdqaW11LXVpJ1xuaW1wb3J0IHsgRW50aXR5U3RhdHVzVHlwZSwgU3RhdHVzSW5kaWNhdG9yIH0gZnJvbSAnLi9jb21tb24tY29tcG9uZW50cydcbmltcG9ydCBpY29uV2FybmluZyBmcm9tICdqaW11LWljb25zL3N2Zy9vdXRsaW5lZC9zdWdnZXN0ZWQvd2FybmluZy5zdmcnXG5pbXBvcnQgaWNvbkVycm9yIGZyb20gJ2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL3N1Z2dlc3RlZC9lcnJvci5zdmcnXG5pbXBvcnQgeyB1c2VEYXRhU291cmNlRXhpc3RzIH0gZnJvbSAnLi91c2UtZHMtZXhpc3RzJ1xuXG5pbnRlcmZhY2UgQ29udGVudFByb3BzIHtcbiAgd2lkZ2V0SWQ6IHN0cmluZ1xuICB1c2VEYXRhU291cmNlOiBJbW11dGFibGVPYmplY3Q8VXNlRGF0YVNvdXJjZT5cbiAgb25TdGF0dXNDaGFuZ2U/OiAoZW5hYmxlZDogYm9vbGVhbikgPT4gdm9pZFxuICBvbkRhdGFTb3VyY2VDcmVhdGVkPzogKGRzOiBEYXRhU291cmNlKSA9PiB2b2lkXG4gIHNob3dNZXNzYWdlPzogYm9vbGVhblxufVxuXG4vKipcbiAqIFNob3cgaWNvbiBhbmQgbWVzc2FnZSBpZiB0aGUgZGF0YSBzb3VyY2UgZG9lc24ndCB3b3JrLlxuICogQHBhcmFtIHByb3BzXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gRGF0YVNvdXJjZVRpcCAocHJvcHM6IENvbnRlbnRQcm9wcykge1xuICBjb25zdCB7IHdpZGdldElkLCB1c2VEYXRhU291cmNlLCBvblN0YXR1c0NoYW5nZSwgb25EYXRhU291cmNlQ3JlYXRlZCwgc2hvd01lc3NhZ2UgPSBmYWxzZSB9ID0gcHJvcHNcbiAgY29uc3QgZ2V0STE4bk1lc3NhZ2UgPSBob29rcy51c2VUcmFuc2xhdGlvbihkZWZhdWx0TWVzc2FnZXMpXG4gIGNvbnN0IGRzRXhpc3RzOiBib29sZWFuID0gdXNlRGF0YVNvdXJjZUV4aXN0cyh7IHdpZGdldElkLCB1c2VEYXRhU291cmNlSWQ6IHVzZURhdGFTb3VyY2UuZGF0YVNvdXJjZUlkIH0pXG4gIGNvbnN0IFtkc1N0YXR1cywgc2V0RHNTdGF0dXNdID0gUmVhY3QudXNlU3RhdGU8J2Vycm9yJyB8ICd3YXJuaW5nJyB8ICdjcmVhdGluZyc+KG51bGwpXG4gIGNvbnN0IFtkYXRhU291cmNlLCBzZXREYXRhU291cmNlXSA9IFJlYWN0LnVzZVN0YXRlPERhdGFTb3VyY2U+KG51bGwpXG5cbiAgY29uc3QgaGFuZGxlRHNJbmZvQ2hhbmdlID0gUmVhY3QudXNlQ2FsbGJhY2soKGluZm86IElNRGF0YVNvdXJjZUluZm8pID0+IHtcbiAgICBpZiAoaW5mbykge1xuICAgICAgY29uc3QgeyBzdGF0dXMsIGluc3RhbmNlU3RhdHVzIH0gPSBpbmZvXG4gICAgICBpZiAoaW5zdGFuY2VTdGF0dXMgPT09IERhdGFTb3VyY2VTdGF0dXMuTm90Q3JlYXRlZCkge1xuICAgICAgICBzZXREc1N0YXR1cygnY3JlYXRpbmcnKVxuICAgICAgICBvblN0YXR1c0NoYW5nZT8uKGZhbHNlKVxuICAgICAgfSBlbHNlIGlmIChpbnN0YW5jZVN0YXR1cyA9PT0gRGF0YVNvdXJjZVN0YXR1cy5DcmVhdGVFcnJvciB8fCBzdGF0dXMgPT09IERhdGFTb3VyY2VTdGF0dXMuTG9hZEVycm9yKSB7XG4gICAgICAgIHNldERzU3RhdHVzKCdlcnJvcicpXG4gICAgICAgIG9uU3RhdHVzQ2hhbmdlPy4oZmFsc2UpXG4gICAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gRGF0YVNvdXJjZVN0YXR1cy5Ob3RSZWFkeSkge1xuICAgICAgICBzZXREc1N0YXR1cygnd2FybmluZycpXG4gICAgICAgIG9uU3RhdHVzQ2hhbmdlPy4oZmFsc2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXREc1N0YXR1cyhudWxsKVxuICAgICAgICBvblN0YXR1c0NoYW5nZT8uKHRydWUpXG4gICAgICB9XG4gICAgfVxuICB9LCBbb25TdGF0dXNDaGFuZ2VdKVxuXG4gIGNvbnN0IGhhbmRsZURzQ3JlYXRlZCA9IFJlYWN0LnVzZUNhbGxiYWNrKChkczogRGF0YVNvdXJjZSkgPT4ge1xuICAgIHNldERhdGFTb3VyY2UoZHMpXG4gICAgb25EYXRhU291cmNlQ3JlYXRlZD8uKGRzKVxuICB9LCBbb25EYXRhU291cmNlQ3JlYXRlZF0pXG5cbiAgY29uc3QgaGFuZGxlRHNDcmVhdGVGYWlsZWQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0RGF0YVNvdXJjZShudWxsKVxuICAgIHNldERzU3RhdHVzKCdlcnJvcicpXG4gICAgb25TdGF0dXNDaGFuZ2U/LihmYWxzZSlcbiAgfSwgW29uU3RhdHVzQ2hhbmdlXSlcblxuICBsZXQgc3RhdHVzSWNvblxuICBsZXQgc3RhdHVzTXNnXG4gIGxldCBjb2xvclxuICBpZiAoZHNTdGF0dXMgPT09ICdjcmVhdGluZycpIHtcbiAgICBzdGF0dXNJY29uID0gaWNvbkVycm9yXG4gICAgc3RhdHVzTXNnID0gZ2V0STE4bk1lc3NhZ2UoJ2xvYWRpbmcnKVxuICB9IGVsc2UgaWYgKCFkc0V4aXN0cyB8fCBkc1N0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgIHN0YXR1c0ljb24gPSBpY29uRXJyb3JcbiAgICBzdGF0dXNNc2cgPSBnZXRJMThuTWVzc2FnZSgnZGF0YVNvdXJjZUNyZWF0ZUVycm9yJylcbiAgICBjb2xvciA9ICd2YXIoLS1zeXMtY29sb3ItZXJyb3ItbWFpbiknXG4gIH0gZWxzZSBpZiAoZHNTdGF0dXMgPT09ICd3YXJuaW5nJykge1xuICAgIGxldCBsYWJlbCA9ICcnXG4gICAgY29uc3Qgb3JpZ2luRHMgPSBkYXRhU291cmNlPy5nZXRPcmlnaW5EYXRhU291cmNlcygpPy5bMF1cbiAgICBpZiAob3JpZ2luRHMpIHtcbiAgICAgIGxhYmVsID0gb3JpZ2luRHMuZ2V0TGFiZWwoKSB8fCBvcmlnaW5Ecy5nZXREYXRhU291cmNlSnNvbigpLnNvdXJjZUxhYmVsXG4gICAgfSBlbHNlIGlmIChkYXRhU291cmNlKSB7XG4gICAgICBsYWJlbCA9IGRhdGFTb3VyY2UuZ2V0TGFiZWwoKSB8fCBkYXRhU291cmNlLmdldERhdGFTb3VyY2VKc29uKCkubGFiZWxcbiAgICB9XG5cbiAgICBjb25zdCB3aWRnZXRJZCA9IGFwcENvbmZpZ1V0aWxzLmdldFdpZGdldElkQnlPdXRwdXREYXRhU291cmNlKHVzZURhdGFTb3VyY2UpXG4gICAgY29uc3QgYXBwU3RhdGUgPSB3aW5kb3c/LmppbXVDb25maWc/LmlzQnVpbGRlclxuICAgICAgPyBnZXRBcHBTdG9yZSgpLmdldFN0YXRlKCkuYXBwU3RhdGVJbkJ1aWxkZXJcbiAgICAgIDogZ2V0QXBwU3RvcmUoKS5nZXRTdGF0ZSgpXG4gICAgY29uc3Qgd2lkZ2V0TGFiZWwgPSBhcHBTdGF0ZS5hcHBDb25maWcud2lkZ2V0c1t3aWRnZXRJZF0/LmxhYmVsXG5cbiAgICBjb2xvciA9ICd2YXIoLS1zeXMtY29sb3Itd2FybmluZy1kYXJrKSdcbiAgICBzdGF0dXNJY29uID0gaWNvbldhcm5pbmdcbiAgICBzdGF0dXNNc2cgPSBnZXRJMThuTWVzc2FnZSgnb3V0cHV0RGF0YUlzTm90R2VuZXJhdGVkJywge1xuICAgICAgb3V0cHV0RHNMYWJlbDogbGFiZWwgPz8gJycsXG4gICAgICBzb3VyY2VXaWRnZXROYW1lOiB3aWRnZXRMYWJlbCA/PyAnJ1xuICAgIH0pXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICB7ZHNFeGlzdHMgJiYgKFxuICAgICAgICA8RGF0YVNvdXJjZUNvbXBvbmVudFxuICAgICAgICAgIHVzZURhdGFTb3VyY2U9e3VzZURhdGFTb3VyY2V9XG4gICAgICAgICAgb25EYXRhU291cmNlSW5mb0NoYW5nZT17aGFuZGxlRHNJbmZvQ2hhbmdlfVxuICAgICAgICAgIG9uRGF0YVNvdXJjZUNyZWF0ZWQ9e2hhbmRsZURzQ3JlYXRlZH1cbiAgICAgICAgICBvbkNyZWF0ZURhdGFTb3VyY2VGYWlsZWQ9e2hhbmRsZURzQ3JlYXRlRmFpbGVkfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtkc1N0YXR1cyA9PT0gJ2NyZWF0aW5nJyAmJiA8U3RhdHVzSW5kaWNhdG9yIHN0YXR1c1R5cGU9e0VudGl0eVN0YXR1c1R5cGUuTG9hZGluZ30gdGl0bGU9e3N0YXR1c01zZ30gLz59XG4gICAgICB7KCFkc0V4aXN0cyB8fCBkc1N0YXR1cyA9PT0gJ2Vycm9yJyB8fCBkc1N0YXR1cyA9PT0gJ3dhcm5pbmcnKSAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyJz5cbiAgICAgICAgICA8VG9vbHRpcCB0aXRsZT17c3RhdHVzTXNnfT5cbiAgICAgICAgICAgIDxCdXR0b24gc2l6ZT0nc20nIHR5cGU9J3RlcnRpYXJ5JyBpY29uPjxJY29uIGljb249e3N0YXR1c0ljb259IGNvbG9yPXtjb2xvcn0gLz48L0J1dHRvbj5cbiAgICAgICAgICA8L1Rvb2x0aXA+XG4gICAgICAgICAge3Nob3dNZXNzYWdlICYmIDxkaXYgY2xhc3NOYW1lPSdzdGF0dXMtbWVzc2FnZSc+e3N0YXR1c01zZ308L2Rpdj59XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICA8L1JlYWN0LkZyYWdtZW50PlxuICApXG59XG5cblxuXG4iLCIvKipcbiAqIENvbmZpZ3VyYWJsZSBkZWJ1ZyBsb2dnaW5nIHV0aWxpdHkgZm9yIEV4cGVyaWVuY2UgQnVpbGRlciB3aWRnZXRzXG4gKiBcbiAqIFVzYWdlOlxuICogLSBBZGQgP2RlYnVnPWFsbCB0byBVUkwgdG8gc2VlIGFsbCBkZWJ1ZyBsb2dzXG4gKiAtIEFkZCA/ZGVidWc9SEFTSCxGT1JNIHRvIHNlZSBzcGVjaWZpYyBmZWF0dXJlIGxvZ3NcbiAqIC0gQWRkID9kZWJ1Zz1mYWxzZSB0byBkaXNhYmxlIGFsbCBkZWJ1ZyBsb2dzXG4gKiBcbiAqIEZlYXR1cmVzIChRdWVyeVNpbXBsZSk6XG4gKiAtIEhBU0g6IEhhc2ggcGFyYW1ldGVyIHByb2Nlc3NpbmdcbiAqIC0gRk9STTogUXVlcnkgZm9ybSBpbnRlcmFjdGlvbnNcbiAqIC0gVEFTSzogUXVlcnkgdGFzayBtYW5hZ2VtZW50XG4gKiAtIFpPT006IFpvb20gYmVoYXZpb3JcbiAqIC0gTUFQLUVYVEVOVDogTWFwIGV4dGVudCBjaGFuZ2VzXG4gKiAtIERBVEEtQUNUSU9OOiBEYXRhIGFjdGlvbiBleGVjdXRpb24gKEFkZCB0byBNYXAsIGV0Yy4pXG4gKiAtIEdST1VQOiBRdWVyeSBncm91cGluZyBhbmQgZHJvcGRvd24gc2VsZWN0aW9uXG4gKiAtIFNFTEVDVElPTjogU2VsZWN0aW9uIGRldGVjdGlvbiBhbmQgaWRlbnRpZnkgcG9wdXAgdHJhY2tpbmdcbiAqIC0gV0lER0VULVNUQVRFOiBXaWRnZXQgbGlmZWN5Y2xlIGV2ZW50cyAob3Blbi9jbG9zZSBoYW5kc2hha2UpXG4gKiAtIFJFU1RPUkU6IFNlbGVjdGlvbiByZXN0b3JhdGlvbiB3aGVuIHdpZGdldCBvcGVuc1xuICogLSBSRVNVTFRTLU1PREU6IFJlc3VsdHMgbWFuYWdlbWVudCBtb2RlIHNlbGVjdGlvbiAoQ3JlYXRlIG5ldywgQWRkIHRvLCBSZW1vdmUgZnJvbSlcbiAqIC0gRVhQQU5ELUNPTExBUFNFOiBFeHBhbmQvY29sbGFwc2Ugc3RhdGUgbWFuYWdlbWVudCBmb3IgcmVzdWx0IGl0ZW1zXG4gKiBcbiAqIEZlYXR1cmVzIChIZWxwZXJTaW1wbGUpOlxuICogLSBIQVNIOiBIYXNoIHBhcmFtZXRlciBtb25pdG9yaW5nIGFuZCB3aWRnZXQgb3BlbmluZ1xuICogLSBTRUxFQ1RJT046IFNlbGVjdGlvbiB0cmFja2luZyBmcm9tIFF1ZXJ5U2ltcGxlXG4gKiAtIFdJREdFVC1TVEFURTogV2lkZ2V0IHN0YXRlIGhhbmRzaGFrZSAob3Blbi9jbG9zZSBldmVudHMpXG4gKiAtIFJFU1RPUkU6IFNlbGVjdGlvbiByZXN0b3JhdGlvbiBhdHRlbXB0cyBhbmQgcmVzdWx0c1xuICovXG5cbnR5cGUgRGVidWdGZWF0dXJlID0gJ0hBU0gnIHwgJ0ZPUk0nIHwgJ1RBU0snIHwgJ1pPT00nIHwgJ01BUC1FWFRFTlQnIHwgJ0RBVEEtQUNUSU9OJyB8ICdHUk9VUCcgfCAnU0VMRUNUSU9OJyB8ICdXSURHRVQtU1RBVEUnIHwgJ1JFU1RPUkUnIHwgJ1JFU1VMVFMtTU9ERScgfCAnRVhQQU5ELUNPTExBUFNFJyB8ICdhbGwnIHwgJ2ZhbHNlJ1xuXG5pbnRlcmZhY2UgRGVidWdMb2dnZXJPcHRpb25zIHtcbiAgd2lkZ2V0TmFtZTogc3RyaW5nXG4gIGZlYXR1cmVzOiBEZWJ1Z0ZlYXR1cmVbXVxufVxuXG5jbGFzcyBEZWJ1Z0xvZ2dlciB7XG4gIHByaXZhdGUgZW5hYmxlZEZlYXR1cmVzOiBTZXQ8RGVidWdGZWF0dXJlPiA9IG5ldyBTZXQoKVxuICBwcml2YXRlIGluaXRpYWxpemVkID0gZmFsc2VcbiAgcHJpdmF0ZSB3aWRnZXROYW1lOiBzdHJpbmdcbiAgcHJpdmF0ZSBmZWF0dXJlczogRGVidWdGZWF0dXJlW11cblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBEZWJ1Z0xvZ2dlck9wdGlvbnMpIHtcbiAgICB0aGlzLndpZGdldE5hbWUgPSBvcHRpb25zLndpZGdldE5hbWVcbiAgICB0aGlzLmZlYXR1cmVzID0gb3B0aW9ucy5mZWF0dXJlc1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSByZXR1cm5cblxuICAgIC8vIENoZWNrIFVSTCBwYXJhbWV0ZXJzXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxuICAgIGNvbnN0IGRlYnVnVmFsdWUgPSB1cmxQYXJhbXMuZ2V0KCdkZWJ1ZycpXG5cbiAgICBpZiAoZGVidWdWYWx1ZSA9PT0gJ2ZhbHNlJykge1xuICAgICAgLy8gRXhwbGljaXRseSBkaXNhYmxlZFxuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChkZWJ1Z1ZhbHVlID09PSAnYWxsJykge1xuICAgICAgLy8gRW5hYmxlIGFsbCBmZWF0dXJlcyBvbmx5IGlmIGV4cGxpY2l0bHkgc2V0IHRvICdhbGwnXG4gICAgICB0aGlzLmZlYXR1cmVzLmZvckVhY2goZmVhdHVyZSA9PiB7XG4gICAgICAgIGlmIChmZWF0dXJlICE9PSAnYWxsJyAmJiBmZWF0dXJlICE9PSAnZmFsc2UnKSB7XG4gICAgICAgICAgdGhpcy5lbmFibGVkRmVhdHVyZXMuYWRkKGZlYXR1cmUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChkZWJ1Z1ZhbHVlICE9PSBudWxsKSB7XG4gICAgICAvLyBQYXJzZSBjb21tYS1zZXBhcmF0ZWQgZmVhdHVyZSBsaXN0XG4gICAgICBjb25zdCByZXF1ZXN0ZWRGZWF0dXJlcyA9IGRlYnVnVmFsdWUuc3BsaXQoJywnKS5tYXAoZiA9PiBmLnRyaW0oKS50b1VwcGVyQ2FzZSgpIGFzIERlYnVnRmVhdHVyZSlcbiAgICAgIHJlcXVlc3RlZEZlYXR1cmVzLmZvckVhY2goZmVhdHVyZSA9PiB7XG4gICAgICAgIGlmIChmZWF0dXJlLnRvVXBwZXJDYXNlKCkgPT09ICdBTEwnKSB7XG4gICAgICAgICAgLy8gRW5hYmxlIGFsbCBmZWF0dXJlcyBmb3IgdGhpcyB3aWRnZXRcbiAgICAgICAgICB0aGlzLmZlYXR1cmVzLmZvckVhY2goZiA9PiB7XG4gICAgICAgICAgICBpZiAoZiAhPT0gJ2FsbCcgJiYgZiAhPT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICB0aGlzLmVuYWJsZWRGZWF0dXJlcy5hZGQoZilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZmVhdHVyZXMuaW5jbHVkZXMoZmVhdHVyZSkpIHtcbiAgICAgICAgICB0aGlzLmVuYWJsZWRGZWF0dXJlcy5hZGQoZmVhdHVyZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuICB9XG5cbiAgcHJpdmF0ZSBpc0VuYWJsZWQoZmVhdHVyZTogRGVidWdGZWF0dXJlKTogYm9vbGVhbiB7XG4gICAgdGhpcy5pbml0aWFsaXplKClcbiAgICBcbiAgICBpZiAodGhpcy5lbmFibGVkRmVhdHVyZXMuaGFzKCdhbGwnKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRoaXMuZW5hYmxlZEZlYXR1cmVzLmhhcyhmZWF0dXJlKVxuICB9XG5cbiAgbG9nKGZlYXR1cmU6IERlYnVnRmVhdHVyZSwgZGF0YTogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlzRW5hYmxlZChmZWF0dXJlKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgbG9nRGF0YSA9IHtcbiAgICAgIGZlYXR1cmUsXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIC4uLmRhdGFcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgWyR7dGhpcy53aWRnZXROYW1lLnRvVXBwZXJDYXNlKCl9LSR7ZmVhdHVyZX1dYCwgSlNPTi5zdHJpbmdpZnkobG9nRGF0YSwgbnVsbCwgMikpXG4gIH1cblxuICBnZXRDb25maWcoKTogeyBlbmFibGVkRmVhdHVyZXM6IHN0cmluZ1tdLCBkZWJ1Z1ZhbHVlOiBzdHJpbmcgfCBudWxsIH0ge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpXG4gICAgXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxuICAgIGNvbnN0IGRlYnVnVmFsdWUgPSB1cmxQYXJhbXMuZ2V0KCdkZWJ1ZycpXG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIGVuYWJsZWRGZWF0dXJlczogQXJyYXkuZnJvbSh0aGlzLmVuYWJsZWRGZWF0dXJlcyksXG4gICAgICBkZWJ1Z1ZhbHVlXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYnVnIGxvZ2dlciBpbnN0YW5jZSBmb3IgUXVlcnlTaW1wbGUgd2lkZ2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVRdWVyeVNpbXBsZURlYnVnTG9nZ2VyKCkge1xuICByZXR1cm4gbmV3IERlYnVnTG9nZ2VyKHtcbiAgICB3aWRnZXROYW1lOiAnUVVFUllTSU1QTEUnLFxuICAgIGZlYXR1cmVzOiBbJ0hBU0gnLCAnRk9STScsICdUQVNLJywgJ1pPT00nLCAnTUFQLUVYVEVOVCcsICdEQVRBLUFDVElPTicsICdHUk9VUCcsICdTRUxFQ1RJT04nLCAnV0lER0VULVNUQVRFJywgJ1JFU1RPUkUnLCAnUkVTVUxUUy1NT0RFJywgJ0VYUEFORC1DT0xMQVBTRSddXG4gIH0pXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYnVnIGxvZ2dlciBpbnN0YW5jZSBmb3IgSGVscGVyU2ltcGxlIHdpZGdldFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSGVscGVyU2ltcGxlRGVidWdMb2dnZXIoKSB7XG4gIHJldHVybiBuZXcgRGVidWdMb2dnZXIoe1xuICAgIHdpZGdldE5hbWU6ICdIRUxQRVJTSU1QTEUnLFxuICAgIGZlYXR1cmVzOiBbJ0hBU0gnLCAnU0VMRUNUSU9OJywgJ1dJREdFVC1TVEFURScsICdSRVNUT1JFJ11cbiAgfSlcbn1cblxuIiwiaW1wb3J0IHtcbiAgUmVhY3RSZWR1eCxcbiAgdHlwZSBJTVN0YXRlLFxuICB0eXBlIElNQXBwQ29uZmlnXG59IGZyb20gJ2ppbXUtY29yZSdcbmludGVyZmFjZSBQcm9wcyB7XG4gIHdpZGdldElkOiBzdHJpbmdcbiAgdXNlRGF0YVNvdXJjZUlkOiBzdHJpbmdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZURhdGFTb3VyY2VFeGlzdHMgKHByb3BzOiBQcm9wcykge1xuICBjb25zdCB7IHdpZGdldElkLCB1c2VEYXRhU291cmNlSWQgfSA9IHByb3BzXG5cbiAgY29uc3QgZXhpc3RzOiBib29sZWFuID0gUmVhY3RSZWR1eC51c2VTZWxlY3Rvcigoc3RhdGU6IElNU3RhdGUpID0+IHtcbiAgICBsZXQgYXBwQ29uZmlnOiBJTUFwcENvbmZpZ1xuICAgIGlmICh3aW5kb3cuamltdUNvbmZpZy5pc0J1aWxkZXIpIHtcbiAgICAgIGFwcENvbmZpZyA9IHN0YXRlLmFwcFN0YXRlSW5CdWlsZGVyLmFwcENvbmZpZ1xuICAgIH0gZWxzZSB7XG4gICAgICBhcHBDb25maWcgPSBzdGF0ZS5hcHBDb25maWdcbiAgICB9XG4gICAgY29uc3QgdXNlRGF0YVNvdXJjZXMgPSBhcHBDb25maWcud2lkZ2V0c1t3aWRnZXRJZF0udXNlRGF0YVNvdXJjZXMgPz8gW11cbiAgICByZXR1cm4gdXNlRGF0YVNvdXJjZXMuc29tZSh1c2VEcyA9PiB1c2VEcy5kYXRhU291cmNlSWQgPT09IHVzZURhdGFTb3VyY2VJZClcbiAgfSlcblxuICByZXR1cm4gZXhpc3RzXG59XG5cblxuXG4iLCJpbXBvcnQgdHlwZSB7IElQb3B1cEluZm8gfSBmcm9tICdAZXNyaS9hcmNnaXMtcmVzdC1mZWF0dXJlLXNlcnZpY2UnXG5pbXBvcnQgdHlwZSB7IEludGxTaGFwZSwgRGF0YVNvdXJjZSB9IGZyb20gJ2ppbXUtY29yZSdcblxuLyoqXG4gKiBUb2dnbGUgaXRlbXMgaW4gYW4gYXJyYXlcbiAqL1xuZXhwb3J0IGNvbnN0IHRvZ2dsZUl0ZW1JbkFycmF5ID0gKGl0ZW0sIGl0ZW1zID0gW10pID0+IGl0ZW1zLmluY2x1ZGVzKGl0ZW0pID8gaXRlbXMuZmlsdGVyKGkgPT4gaSAhPT0gaXRlbSkgOiBbLi4uaXRlbXMsIGl0ZW1dXG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0YVNvdXJjZU1hcCB7XG4gIFtkYXRhU291cmNlSWQ6IHN0cmluZ106IERhdGFTb3VyY2Vcbn1cblxuZXhwb3J0IHR5cGUgR2V0STE4bk1lc3NhZ2VUeXBlID0gKGlkOiBzdHJpbmcsIG9wdGlvbnM/OiB7IG1lc3NhZ2VzPzogYW55LCB2YWx1ZXM/OiBhbnkgfSkgPT4gc3RyaW5nXG4vKipcbiAqIEEgZmFjdG9yeSB0byBjcmVhdGUgYSBmdW5jdGlvbiBvZiBnZXR0aW5nIGkxOG4gbWVzc2FnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2V0STE4bk1lc3NhZ2UgKG9wdGlvbnM6IHsgaW50bDogSW50bFNoYXBlLCBkZWZhdWx0TWVzc2FnZXM/OiBhbnkgfSkge1xuICBjb25zdCB7IGludGwsIGRlZmF1bHRNZXNzYWdlcyA9IHt9IH0gPSBvcHRpb25zIHx8IHt9XG4gIGNvbnN0IGdldEkxOG5NZXNzYWdlOiBHZXRJMThuTWVzc2FnZVR5cGUgPSAoaWQsIG9wdGlvbnMpID0+IHtcbiAgICBjb25zdCB7IG1lc3NhZ2VzLCB2YWx1ZXMgfSA9IG9wdGlvbnMgfHwge31cbiAgICByZXR1cm4gaW50bC5mb3JtYXRNZXNzYWdlKHsgaWQsIGRlZmF1bHRNZXNzYWdlOiAobWVzc2FnZXMgfHwgZGVmYXVsdE1lc3NhZ2VzKVtpZF0gfSwgdmFsdWVzKVxuICB9XG4gIHJldHVybiBnZXRJMThuTWVzc2FnZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmllbGRJbmZvc0luUG9wdXBDb250ZW50IChwb3B1cEluZm86IElQb3B1cEluZm8pIHtcbiAgY29uc3QgcmVzdWx0ID0gW11cbiAgaWYgKHBvcHVwSW5mbz8ucG9wdXBFbGVtZW50cz8ubGVuZ3RoID4gMCkge1xuICAgIHBvcHVwSW5mby5wb3B1cEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBpZiAoZWxlbWVudC50eXBlID09PSAnZmllbGRzJyAmJiBlbGVtZW50LmZpZWxkSW5mb3M/Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmVzdWx0LnB1c2goLi4uZWxlbWVudC5maWVsZEluZm9zKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX19lbW90aW9uX3JlYWN0X2pzeF9ydW50aW1lX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfY29yZV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X3RoZW1lX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfdWlfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCIvKipcclxuICogV2VicGFjayB3aWxsIHJlcGxhY2UgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gd2l0aCBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgdG8gc2V0IHRoZSBwdWJsaWMgcGF0aCBkeW5hbWljYWxseS5cclxuICogVGhlIHJlYXNvbiB3aHkgd2UgY2FuJ3Qgc2V0IHRoZSBwdWJsaWNQYXRoIGluIHdlYnBhY2sgY29uZmlnIGlzOiB3ZSBjaGFuZ2UgdGhlIHB1YmxpY1BhdGggd2hlbiBkb3dubG9hZC5cclxuICogKi9cclxuX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB3aW5kb3cuamltdUNvbmZpZy5iYXNlVXJsXHJcbiIsIi8qKlxuICogU2hhcmVkIGNvbW1vbiB1dGlsaXRpZXMgYW5kIGNvbXBvbmVudHMgZm9yIEV4cGVyaWVuY2UgQnVpbGRlciB3aWRnZXRzXG4gKiBcbiAqIFRoaXMgbW9kdWxlIGV4cG9ydHMgY29tbW9uIGZ1bmN0aW9uYWxpdHkgdGhhdCBjYW4gYmUgc2hhcmVkIGJldHdlZW5cbiAqIHF1ZXJ5LXNpbXBsZSwgaGVscGVyLXNpbXBsZSwgYW5kIG90aGVyIGN1c3RvbSB3aWRnZXRzLlxuICogXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgJ3dpZGdldHMvc2hhcmVkLWNvZGUvY29tbW9uJ1xuICovXG5cbmV4cG9ydCAqIGZyb20gJy4vY29tbW9uL2NvbW1vbi1jb21wb25lbnRzJ1xuZXhwb3J0ICogZnJvbSAnLi9jb21tb24vdXRpbHMnXG5leHBvcnQgKiBmcm9tICcuL2NvbW1vbi91c2UtZHMtZXhpc3RzJ1xuZXhwb3J0ICogZnJvbSAnLi9jb21tb24vZGF0YS1zb3VyY2UtdGlwJ1xuZXhwb3J0ICogZnJvbSAnLi9jb21tb24vZGVidWctbG9nZ2VyJ1xuXG5cblxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9