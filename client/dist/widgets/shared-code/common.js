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
        features: ['HASH', 'FORM', 'TASK', 'ZOOM', 'MAP-EXTENT', 'DATA-ACTION', 'GROUP', 'SELECTION', 'WIDGET-STATE', 'RESTORE', 'RESULTS-MODE']
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZTOzs7Ozs7Ozs7O0FDQUEsOFc7Ozs7Ozs7Ozs7QUNBQSxtYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBQSxlQUFlO0FBQzRCO0FBQ3dEO0FBQzdEO0FBQzZCO0FBQ25FLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyw0Q0FBSztBQUUxQjs7R0FFRztBQUNJLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDbkMsTUFBTSxFQUFFLFNBQVMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLEdBQUcsS0FBSztJQUMxQyxNQUFNLGVBQWUsR0FBRztRQUN0QixPQUFPLEVBQUUsSUFBSTtRQUNiLFlBQVksRUFBRSxJQUFJO0tBQ25CO0lBQ0QsTUFBTSxXQUFXLEdBQUc7UUFDbEIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDO1FBQ3ZGLFlBQVksRUFBRSxRQUFRLENBQUMsY0FBYyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQztRQUMzRyxVQUFVLEVBQUUsUUFBUSxtQkFBTSxTQUFTLENBQUMsVUFBVSxFQUFHO0tBQ2xEO0lBQ0QsT0FBTyxnRUFBQyw0Q0FBSyxDQUFDLFFBQVEsY0FBRSxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQWtCO0FBQ2pFLENBQUM7QUFhRDs7R0FFRztBQUNJLE1BQU0sV0FBVyxHQUFHLHFEQUFTLENBQUMsQ0FBQyxLQUFvQyxFQUFFLEVBQUU7SUFDNUUsTUFBTSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxPQUFPLEdBQUcsSUFBSSxFQUFFLEtBQUssR0FBRyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUUsV0FBVyxHQUFHLEVBQUUsRUFBRSxTQUFTLEdBQUcsSUFBSSxFQUFFLFNBQVMsR0FBRyxJQUFJLEVBQUUsR0FBRyxLQUFLO0lBQ3BMLE1BQU0sTUFBTSxHQUFHLEdBQUcsRUFBRSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDO0lBQy9DLE1BQU0sVUFBVSxHQUFHLEdBQUcsRUFBRSxDQUFDLGlFQUFDLDRDQUFLLENBQUMsUUFBUSxlQUVwQyxTQUFTO2dCQUNQLGdFQUFDLGdEQUFXLElBQUMsU0FBUyxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEdBQUksRUFFbkUsZ0VBQUMsOENBQVMsY0FBRSxXQUFXLEdBQWEsRUFFbEMsU0FBUztnQkFDUCxnRUFBQyxnREFBVyxjQUNWLGdFQUFDLDJDQUFNLElBQUMsT0FBTyxFQUFFLE1BQU0sWUFBRyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQVUsR0FDNUMsSUFFSDtJQUNqQixNQUFNLGdCQUFnQixHQUFHLHNCQUFzQjtJQUMvQyxNQUFNLGtCQUFrQixHQUFHLEdBQUcsRUFBRTtRQUM5QixPQUFPLENBQ0wsZ0VBQUMsMENBQUssSUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQyxRQUFRLFlBQ3hGLFVBQVUsRUFBRSxHQUNQLENBQ1Q7SUFDSCxDQUFDO0lBQ0QsTUFBTSxxQkFBcUIsR0FBRyxHQUFHLEVBQUU7UUFDakMsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMsOENBQUc7Ozs7OzhCQUtBLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7bUJBQ3pDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUs7Ozs7Ozs7Ozs7Ozs7O0tBY3JDO1FBQ0QsT0FBTyxDQUNMLHlFQUFLLFNBQVMsRUFBRSxHQUFHLGdCQUFnQixpQkFBaUIsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsWUFDbkcseUVBQUssU0FBUyxFQUFDLGVBQWUsWUFDM0IsVUFBVSxFQUFFLEdBQ1QsR0FDRixDQUNQO0lBQ0gsQ0FBQztJQUNELE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsRUFBRTtBQUNqRSxDQUFDLENBQUM7QUFFRixJQUFZLGdCQU9YO0FBUEQsV0FBWSxnQkFBZ0I7SUFDMUIsNkJBQVM7SUFDVCxpQ0FBYTtJQUNiLHVDQUFtQjtJQUNuQixxQ0FBaUI7SUFDakIsdUNBQW1CO0lBQ25CLG1DQUFlO0FBQ2pCLENBQUMsRUFQVyxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBTzNCO0FBUUQ7O0dBRUc7QUFDSSxNQUFNLGVBQWUsR0FBRyxxREFBUyxDQUFDLENBQUMsS0FBd0MsRUFBRSxFQUFFO0lBQ3BGLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsR0FBRyxLQUFLO0lBQ3JELE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRTs7UUFBQyxxREFBRzs7Ozs7Ozs7Ozs7Ozs4QkFhRSxpQkFBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLEdBQUcsQ0FBQyxPQUFPLDBDQUFFLE9BQU8sMENBQUcsR0FBRyxDQUFDOztrQ0FFOUIsaUJBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxHQUFHLENBQUMsS0FBSywwQ0FBRSxPQUFPLDBDQUFFLElBQUk7Ozs7Ozs7R0FPOUQ7S0FBQTtJQUNELE9BQU8sQ0FDTCxVQUFVO1FBQ1IseUVBQUssU0FBUyxFQUFFLEdBQUcsU0FBUyxhQUFULFNBQVMsY0FBVCxTQUFTLEdBQUksRUFBRSxrRUFBa0UsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUksQ0FDdEo7QUFDSCxDQUFDLENBQUM7QUFRRjs7O0dBR0c7QUFDSSxNQUFNLFlBQVksR0FBRyxDQUFDLEtBQXdCLEVBQUUsRUFBRTtJQUN2RCxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsS0FBSztJQUVsRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsTUFBTSxVQUFVLEdBQUcsOENBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCckI7SUFFRCxPQUFPLENBQ0wsMEVBQUssU0FBUyxFQUFFLGlCQUFpQixTQUFTLEVBQUUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBQyxPQUFPLGFBQ3pFLGdFQUFDLHlDQUFJLElBQUMsSUFBSSxFQUFFLG9GQUFTLEVBQUUsU0FBUyxFQUFDLFlBQVksRUFBQyxJQUFJLEVBQUMsSUFBSSxHQUFHLEVBQzFELDBFQUFNLFNBQVMsRUFBQyxZQUFZLFlBQUUsS0FBSyxHQUFRLEVBQzFDLFNBQVMsSUFBSSxDQUNaLGdFQUFDLDJDQUFNLElBQ0wsSUFBSSxFQUFDLElBQUksRUFDVCxJQUFJLEVBQUMsVUFBVSxFQUNmLElBQUksUUFDSixPQUFPLEVBQUUsU0FBUyxFQUNsQixTQUFTLEVBQUMsZUFBZSxnQkFDZCxlQUFlLFlBRTFCLGdFQUFDLHlDQUFJLElBQUMsSUFBSSxFQUFFLDhIQUEyRCxFQUFFLElBQUksRUFBQyxJQUFJLEdBQUcsR0FDOUUsQ0FDVixJQUNHLENBQ1A7QUFDSCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hORCxlQUFlO0FBYUc7QUFDOEM7QUFDTztBQUNBO0FBQ0o7QUFDZDtBQVVyRDs7OztHQUlHO0FBQ0ksU0FBUyxhQUFhLENBQUUsS0FBbUI7O0lBQ2hELE1BQU0sRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEdBQUcsS0FBSyxFQUFFLEdBQUcsS0FBSztJQUNuRyxNQUFNLGNBQWMsR0FBRyw0Q0FBSyxDQUFDLGNBQWMsQ0FBQyxvREFBZSxDQUFDO0lBQzVELE1BQU0sUUFBUSxHQUFZLG1FQUFtQixDQUFDLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEcsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsR0FBRyw0Q0FBSyxDQUFDLFFBQVEsQ0FBbUMsSUFBSSxDQUFDO0lBQ3RGLE1BQU0sQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLEdBQUcsNENBQUssQ0FBQyxRQUFRLENBQWEsSUFBSSxDQUFDO0lBRXBFLE1BQU0sa0JBQWtCLEdBQUcsNENBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFzQixFQUFFLEVBQUU7UUFDdEUsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNULE1BQU0sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSTtZQUN2QyxJQUFJLGNBQWMsS0FBSyx1REFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDbkQsV0FBVyxDQUFDLFVBQVUsQ0FBQztnQkFDdkIsY0FBYyxhQUFkLGNBQWMsdUJBQWQsY0FBYyxDQUFHLEtBQUssQ0FBQztZQUN6QixDQUFDO2lCQUFNLElBQUksY0FBYyxLQUFLLHVEQUFnQixDQUFDLFdBQVcsSUFBSSxNQUFNLEtBQUssdURBQWdCLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3BHLFdBQVcsQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLGNBQWMsYUFBZCxjQUFjLHVCQUFkLGNBQWMsQ0FBRyxLQUFLLENBQUM7WUFDekIsQ0FBQztpQkFBTSxJQUFJLE1BQU0sS0FBSyx1REFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEQsV0FBVyxDQUFDLFNBQVMsQ0FBQztnQkFDdEIsY0FBYyxhQUFkLGNBQWMsdUJBQWQsY0FBYyxDQUFHLEtBQUssQ0FBQztZQUN6QixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sV0FBVyxDQUFDLElBQUksQ0FBQztnQkFDakIsY0FBYyxhQUFkLGNBQWMsdUJBQWQsY0FBYyxDQUFHLElBQUksQ0FBQztZQUN4QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRXBCLE1BQU0sZUFBZSxHQUFHLDRDQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBYyxFQUFFLEVBQUU7UUFDM0QsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUNqQixtQkFBbUIsYUFBbkIsbUJBQW1CLHVCQUFuQixtQkFBbUIsQ0FBRyxFQUFFLENBQUM7SUFDM0IsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUV6QixNQUFNLG9CQUFvQixHQUFHLDRDQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtRQUNsRCxhQUFhLENBQUMsSUFBSSxDQUFDO1FBQ25CLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEIsY0FBYyxhQUFkLGNBQWMsdUJBQWQsY0FBYyxDQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVwQixJQUFJLFVBQVU7SUFDZCxJQUFJLFNBQVM7SUFDYixJQUFJLEtBQUs7SUFDVCxJQUFJLFFBQVEsS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUM1QixVQUFVLEdBQUcsb0ZBQVM7UUFDdEIsU0FBUyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7SUFDdkMsQ0FBQztTQUFNLElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDO1FBQzdDLFVBQVUsR0FBRyxvRkFBUztRQUN0QixTQUFTLEdBQUcsY0FBYyxDQUFDLHVCQUF1QixDQUFDO1FBQ25ELEtBQUssR0FBRyw2QkFBNkI7SUFDdkMsQ0FBQztTQUFNLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ2xDLElBQUksS0FBSyxHQUFHLEVBQUU7UUFDZCxNQUFNLFFBQVEsR0FBRyxnQkFBVSxhQUFWLFVBQVUsdUJBQVYsVUFBVSxDQUFFLG9CQUFvQixFQUFFLDBDQUFHLENBQUMsQ0FBQztRQUN4RCxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxXQUFXO1FBQ3pFLENBQUM7YUFBTSxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3RCLEtBQUssR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUMsS0FBSztRQUN2RSxDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcscURBQWMsQ0FBQyw2QkFBNkIsQ0FBQyxhQUFhLENBQUM7UUFDNUUsTUFBTSxRQUFRLEdBQUcsYUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLFVBQVUsMENBQUUsU0FBUztZQUM1QyxDQUFDLENBQUMsc0RBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLGlCQUFpQjtZQUM1QyxDQUFDLENBQUMsc0RBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRTtRQUM1QixNQUFNLFdBQVcsR0FBRyxjQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsMENBQUUsS0FBSztRQUUvRCxLQUFLLEdBQUcsK0JBQStCO1FBQ3ZDLFVBQVUsR0FBRyxzRkFBVztRQUN4QixTQUFTLEdBQUcsY0FBYyxDQUFDLDBCQUEwQixFQUFFO1lBQ3JELGFBQWEsRUFBRSxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FBSSxFQUFFO1lBQzFCLGdCQUFnQixFQUFFLFdBQVcsYUFBWCxXQUFXLGNBQVgsV0FBVyxHQUFJLEVBQUU7U0FDcEMsQ0FBQztJQUNKLENBQUM7SUFDRCxPQUFPLENBQ0wsaUVBQUMsNENBQUssQ0FBQyxRQUFRLGVBQ1osUUFBUSxJQUFJLENBQ1gsZ0VBQUMsMERBQW1CLElBQ2xCLGFBQWEsRUFBRSxhQUFhLEVBQzVCLHNCQUFzQixFQUFFLGtCQUFrQixFQUMxQyxtQkFBbUIsRUFBRSxlQUFlLEVBQ3BDLHdCQUF3QixFQUFFLG9CQUFvQixHQUM5QyxDQUNILEVBQ0EsUUFBUSxLQUFLLFVBQVUsSUFBSSxnRUFBQywrREFBZSxJQUFDLFVBQVUsRUFBRSxnRUFBZ0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsR0FBSSxFQUN0RyxDQUFDLENBQUMsUUFBUSxJQUFJLFFBQVEsS0FBSyxPQUFPLElBQUksUUFBUSxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQ2hFLDBFQUFLLFNBQVMsRUFBQywyQkFBMkIsYUFDeEMsZ0VBQUMsNENBQU8sSUFBQyxLQUFLLEVBQUUsU0FBUyxZQUN2QixnRUFBQywyQ0FBTSxJQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLFVBQVUsRUFBQyxJQUFJLGtCQUFDLGdFQUFDLHlDQUFJLElBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxHQUFJLEdBQVMsR0FDaEYsRUFDVCxXQUFXLElBQUkseUVBQUssU0FBUyxFQUFDLGdCQUFnQixZQUFFLFNBQVMsR0FBTyxJQUM3RCxDQUNQLElBQ2MsQ0FDbEI7QUFDSCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQzNIRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7QUFTSCxNQUFNLFdBQVc7SUFNZixZQUFZLE9BQTJCO1FBTC9CLG9CQUFlLEdBQXNCLElBQUksR0FBRyxFQUFFO1FBQzlDLGdCQUFXLEdBQUcsS0FBSztRQUt6QixJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVE7SUFDbEMsQ0FBQztJQUVPLFVBQVU7UUFDaEIsSUFBSSxJQUFJLENBQUMsV0FBVztZQUFFLE9BQU07UUFFNUIsdUJBQXVCO1FBQ3ZCLE1BQU0sU0FBUyxHQUFHLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQzdELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBRXpDLElBQUksVUFBVSxLQUFLLE9BQU8sRUFBRSxDQUFDO1lBQzNCLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUk7WUFDdkIsT0FBTTtRQUNSLENBQUM7UUFFRCxJQUFJLFVBQVUsS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUN6QixzREFBc0Q7WUFDdEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzlCLElBQUksT0FBTyxLQUFLLEtBQUssSUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFLENBQUM7b0JBQzdDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztnQkFDbkMsQ0FBQztZQUNILENBQUMsQ0FBQztRQUNKLENBQUM7YUFBTSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUMvQixxQ0FBcUM7WUFDckMsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQWtCLENBQUM7WUFDaEcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNsQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxLQUFLLEVBQUUsQ0FBQztvQkFDcEMsc0NBQXNDO29CQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDeEIsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxPQUFPLEVBQUUsQ0FBQzs0QkFDakMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUM3QixDQUFDO29CQUNILENBQUMsQ0FBQztnQkFDSixDQUFDO3FCQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDM0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO2dCQUNuQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSTtJQUN6QixDQUFDO0lBRU8sU0FBUyxDQUFDLE9BQXFCO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFFakIsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3BDLE9BQU8sSUFBSTtRQUNiLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztJQUMxQyxDQUFDO0lBRUQsR0FBRyxDQUFDLE9BQXFCLEVBQUUsSUFBUztRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzdCLE9BQU07UUFDUixDQUFDO1FBRUQsTUFBTSxPQUFPLG1CQUNYLE9BQU8sRUFDUCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFDaEMsSUFBSSxDQUNSO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLElBQUksT0FBTyxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRCxTQUFTO1FBQ1AsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUVqQixNQUFNLFNBQVMsR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUM3RCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUV6QyxPQUFPO1lBQ0wsZUFBZSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUNqRCxVQUFVO1NBQ1g7SUFDSCxDQUFDO0NBQ0Y7QUFFRDs7R0FFRztBQUNJLFNBQVMsNEJBQTRCO0lBQzFDLE9BQU8sSUFBSSxXQUFXLENBQUM7UUFDckIsVUFBVSxFQUFFLGFBQWE7UUFDekIsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQztLQUN6SSxDQUFDO0FBQ0osQ0FBQztBQUVEOztHQUVHO0FBQ0ksU0FBUyw2QkFBNkI7SUFDM0MsT0FBTyxJQUFJLFdBQVcsQ0FBQztRQUNyQixVQUFVLEVBQUUsY0FBYztRQUMxQixRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxTQUFTLENBQUM7S0FDM0QsQ0FBQztBQUNKLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeklpQjtBQU1YLFNBQVMsbUJBQW1CLENBQUUsS0FBWTtJQUMvQyxNQUFNLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxHQUFHLEtBQUs7SUFFM0MsTUFBTSxNQUFNLEdBQVksaURBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFjLEVBQUUsRUFBRTs7UUFDaEUsSUFBSSxTQUFzQjtRQUMxQixJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDaEMsU0FBUyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1FBQy9DLENBQUM7YUFBTSxDQUFDO1lBQ04sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTO1FBQzdCLENBQUM7UUFDRCxNQUFNLGNBQWMsR0FBRyxlQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsbUNBQUksRUFBRTtRQUN2RSxPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBWSxLQUFLLGVBQWUsQ0FBQztJQUM3RSxDQUFDLENBQUM7SUFFRixPQUFPLE1BQU07QUFDZixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0QkQ7O0dBRUc7QUFDSSxNQUFNLGlCQUFpQixHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDO0FBTzlIOztHQUVHO0FBQ0ksU0FBUyxvQkFBb0IsQ0FBRSxPQUFtRDtJQUN2RixNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQWUsR0FBRyxFQUFFLEVBQUUsR0FBRyxPQUFPLElBQUksRUFBRTtJQUNwRCxNQUFNLGNBQWMsR0FBdUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDekQsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLElBQUksRUFBRTtRQUMxQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsUUFBUSxJQUFJLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDO0lBQzlGLENBQUM7SUFDRCxPQUFPLGNBQWM7QUFDdkIsQ0FBQztBQUVNLFNBQVMsMkJBQTJCLENBQUUsU0FBcUI7O0lBQ2hFLE1BQU0sTUFBTSxHQUFHLEVBQUU7SUFDakIsSUFBSSxnQkFBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLGFBQWEsMENBQUUsTUFBTSxJQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3pDLFNBQVMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFOztZQUN4QyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLGNBQU8sQ0FBQyxVQUFVLDBDQUFFLE1BQU0sSUFBRyxDQUFDLEVBQUUsQ0FBQztnQkFDaEUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDcEMsQ0FBQztRQUNILENBQUMsQ0FBQztJQUNKLENBQUM7SUFDRCxPQUFPLE1BQU07QUFDZixDQUFDOzs7Ozs7Ozs7Ozs7QUNuQ0Qsd0U7Ozs7Ozs7Ozs7O0FDQUEsdUQ7Ozs7Ozs7Ozs7O0FDQUEsd0Q7Ozs7Ozs7Ozs7O0FDQUEscUQ7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7OztXQ05BLDJCOzs7Ozs7Ozs7O0FDQUE7OztLQUdLO0FBQ0wscUJBQXVCLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNKbkQ7Ozs7Ozs7R0FPRztBQUV1QztBQUNaO0FBQ1E7QUFDRTtBQUNIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL2VkaXRvci9jbG9zZS5zdmciLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL3N1Z2dlc3RlZC9lcnJvci5zdmciLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL3N1Z2dlc3RlZC93YXJuaW5nLnN2ZyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvc2hhcmVkLWNvZGUvY29tbW9uL2NvbW1vbi1jb21wb25lbnRzLnRzeCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvc2hhcmVkLWNvZGUvY29tbW9uL2RhdGEtc291cmNlLXRpcC50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi9kZWJ1Zy1sb2dnZXIudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi91c2UtZHMtZXhpc3RzLnRzeCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvc2hhcmVkLWNvZGUvY29tbW9uL3V0aWxzLnRzeCIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZS9lbW90aW9uXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmVcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtdGhlbWVcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtdWlcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWNvcmUvbGliL3NldC1wdWJsaWMtcGF0aC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvc2hhcmVkLWNvZGUvY29tbW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgdmlld0JveD1cXFwiMCAwIDE2IDE2XFxcIj48cGF0aCBmaWxsPVxcXCIjMDAwXFxcIiBkPVxcXCJtOC43NDUgOCA2LjEgNi4xYS41MjcuNTI3IDAgMSAxLS43NDUuNzQ2TDggOC43NDZsLTYuMSA2LjFhLjUyNy41MjcgMCAxIDEtLjc0Ni0uNzQ2bDYuMS02LjEtNi4xLTYuMWEuNTI3LjUyNyAwIDAgMSAuNzQ2LS43NDZsNi4xIDYuMSA2LjEtNi4xYS41MjcuNTI3IDAgMCAxIC43NDYuNzQ2elxcXCI+PC9wYXRoPjwvc3ZnPlwiIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzdmcgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiBmaWxsPVxcXCJub25lXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTYgMTZcXFwiPjxwYXRoIGZpbGw9XFxcIiMwMDBcXFwiIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgZD1cXFwiTTggMTZBOCA4IDAgMSAxIDggMGE4IDggMCAwIDEgMCAxNm0wLTFBNyA3IDAgMSAwIDggMWE3IDcgMCAwIDAgMCAxNE04IDRhLjkwNS45MDUgMCAwIDAtLjkuOTk1bC4zNSAzLjUwN2EuNTUyLjU1MiAwIDAgMCAxLjEgMGwuMzUtMy41MDdBLjkwNS45MDUgMCAwIDAgOCA0bTEgN2ExIDEgMCAxIDEtMiAwIDEgMSAwIDAgMSAyIDBcXFwiIGNsaXAtcnVsZT1cXFwiZXZlbm9kZFxcXCI+PC9wYXRoPjwvc3ZnPlwiIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzdmcgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiBmaWxsPVxcXCJub25lXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTYgMTZcXFwiPjxwYXRoIGZpbGw9XFxcIiMwMDBcXFwiIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgZD1cXFwiTTggMi4xMjUgMTQuMzM0IDE0SDEuNjY3em0tLjg4Mi0uNDdhMSAxIDAgMCAxIDEuNzY1IDBsNi4zMzMgMTEuODc0QTEgMSAwIDAgMSAxNC4zMzQgMTVIMS42NjdhMSAxIDAgMCAxLS44ODItMS40N3pNOCA0Ljg3NGEuOTA1LjkwNSAwIDAgMC0uOS45OTVsLjM1IDMuNTA3YS41NTIuNTUyIDAgMCAwIDEuMSAwTDguOSA1Ljg3YS45MDUuOTA1IDAgMCAwLS45LS45OTVtMSA3YTEgMSAwIDEgMS0yIDAgMSAxIDAgMCAxIDIgMFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIj48L3BhdGg+PC9zdmc+XCIiLCIvKiogQGpzeCBqc3ggKi9cbmltcG9ydCB7IFJlYWN0LCBqc3gsIGNzcyB9IGZyb20gJ2ppbXUtY29yZSdcbmltcG9ydCB7IEJ1dHRvbiwgTW9kYWwsIE1vZGFsQm9keSwgTW9kYWxGb290ZXIsIFBhbmVsSGVhZGVyLCBJY29uLCB0eXBlIFRoZW1lUHJvcHMgfSBmcm9tICdqaW11LXVpJ1xuaW1wb3J0IHsgd2l0aFRoZW1lIH0gZnJvbSAnamltdS10aGVtZSdcbmltcG9ydCBpY29uRXJyb3IgZnJvbSAnamltdS1pY29ucy9zdmcvb3V0bGluZWQvc3VnZ2VzdGVkL2Vycm9yLnN2ZydcbmNvbnN0IHsgdXNlU3RhdGUgfSA9IFJlYWN0XG5cbi8qKlxuICogQSBzaW1wbGUgRnVuY3Rpb25hbCBDb21wb25lbnQgc3RvcmluZyBzb21lIFN0YXRlcyB0aGF0IGFyZSBjb21tb25seSB1c2VkXG4gKi9cbmV4cG9ydCBjb25zdCBTdGF0ZUhvbGRlciA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IGluaXRTdGF0ZSA9IHt9LCBjaGlsZHJlbiB9ID0gcHJvcHNcbiAgY29uc3QgZGVmYXVsdFN0YXRlTWFwID0ge1xuICAgIHZpc2libGU6IHRydWUsXG4gICAgcmVmQ29udGFpbmVyOiBudWxsXG4gIH1cbiAgY29uc3QgdXNlU3RhdGVNYXAgPSB7XG4gICAgdmlzaWJsZTogdXNlU3RhdGUoJ3Zpc2libGUnIGluIGluaXRTdGF0ZSA/IGluaXRTdGF0ZS52aXNpYmxlIDogZGVmYXVsdFN0YXRlTWFwLnZpc2libGUpLFxuICAgIHJlZkNvbnRhaW5lcjogdXNlU3RhdGUoJ3JlZkNvbnRhaW5lcicgaW4gaW5pdFN0YXRlID8gaW5pdFN0YXRlLnJlZkNvbnRhaW5lciA6IGRlZmF1bHRTdGF0ZU1hcC5yZWZDb250YWluZXIpLFxuICAgIGN1c3RvbURhdGE6IHVzZVN0YXRlKHsgLi4uaW5pdFN0YXRlLmN1c3RvbURhdGEgfSlcbiAgfVxuICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PntjaGlsZHJlbih1c2VTdGF0ZU1hcCl9PC9SZWFjdC5GcmFnbWVudD5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaWFsb2dQYW5lbFByb3BzIHtcbiAgcGFuZWxWaXNpYmxlOiBib29sZWFuXG4gIHNldFBhbmVsVmlzaWJsZTogKHZpc2libGU6IGJvb2xlYW4pID0+IHZvaWRcbiAgZ2V0STE4bk1lc3NhZ2U6IChpZDogc3RyaW5nKSA9PiBhbnlcbiAgaXNNb2RhbD86IGJvb2xlYW5cbiAgdGl0bGU/OiBhbnlcbiAgYm9keUNvbnRlbnQ/OiBhbnlcbiAgaGFzSGVhZGVyPzogYm9vbGVhblxuICBoYXNGb290ZXI/OiBib29sZWFuXG59XG5cbi8qKlxuICogQSBkaWFsb2cgcG9wdXBcbiAqL1xuZXhwb3J0IGNvbnN0IERpYWxvZ1BhbmVsID0gd2l0aFRoZW1lKChwcm9wczogRGlhbG9nUGFuZWxQcm9wcyAmIFRoZW1lUHJvcHMpID0+IHtcbiAgY29uc3QgeyB0aGVtZSwgcGFuZWxWaXNpYmxlLCBzZXRQYW5lbFZpc2libGUsIGdldEkxOG5NZXNzYWdlLCBpc01vZGFsID0gdHJ1ZSwgdGl0bGUgPSBnZXRJMThuTWVzc2FnZSgncXVlcnlNZXNzYWdlJyksIGJvZHlDb250ZW50ID0gJycsIGhhc0hlYWRlciA9IHRydWUsIGhhc0Zvb3RlciA9IHRydWUgfSA9IHByb3BzXG4gIGNvbnN0IHRvZ2dsZSA9ICgpID0+IHsgc2V0UGFuZWxWaXNpYmxlKGZhbHNlKSB9XG4gIGNvbnN0IGdldENvbnRlbnQgPSAoKSA9PiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAge1xuICAgICAgaGFzSGVhZGVyICYmXG4gICAgICAgIDxQYW5lbEhlYWRlciBjbGFzc05hbWU9J3B5LTInIHRpdGxlPXt0aXRsZX0gb25DbG9zZT17dG9nZ2xlfSAvPlxuICAgIH1cbiAgICA8TW9kYWxCb2R5Pntib2R5Q29udGVudH08L01vZGFsQm9keT5cbiAgICB7XG4gICAgICBoYXNGb290ZXIgJiZcbiAgICAgICAgPE1vZGFsRm9vdGVyPlxuICAgICAgICAgIDxCdXR0b24gb25DbGljaz17dG9nZ2xlfT57Z2V0STE4bk1lc3NhZ2UoJ29rJyl9PC9CdXR0b24+XG4gICAgICAgIDwvTW9kYWxGb290ZXI+XG4gICAgfVxuICA8L1JlYWN0LkZyYWdtZW50PlxuICBjb25zdCBnZW5lcmFsQ2xhc3NOYW1lID0gJ3VpLXVuaXQtZGlhbG9nLXBhbmVsJ1xuICBjb25zdCByZW5kZXJNb2RhbENvbnRlbnQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxNb2RhbCBjbGFzc05hbWU9e2dlbmVyYWxDbGFzc05hbWV9IGlzT3Blbj17cGFuZWxWaXNpYmxlfSB0b2dnbGU9e3RvZ2dsZX0gYmFja2Ryb3A9J3N0YXRpYyc+XG4gICAgICAgIHtnZXRDb250ZW50KCl9XG4gICAgICA8L01vZGFsPlxuICAgIClcbiAgfVxuICBjb25zdCByZW5kZXJOb25Nb2RhbENvbnRlbnQgPSAoKSA9PiB7XG4gICAgY29uc3QgZ2V0U3R5bGUgPSAoKSA9PiBjc3NgXG4gICAgICAmLnVpLXVuaXQtZGlhbG9nLXBhbmVsLm1vZGFsLWRpYWxvZyB7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIC5tb2RhbC1jb250ZW50IHtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke3RoZW1lLnJlZi5wYWxldHRlLm5ldXRyYWxbNjAwXX07XG4gICAgICAgICAgY29sb3I6ICR7dGhlbWUucmVmLnBhbGV0dGUuYmxhY2t9O1xuICAgICAgICAgIGZvbnQtc2l6ZTogLjc1cmVtO1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgICAgIC5wYW5lbC1oZWFkZXIge1xuICAgICAgICAgICAgZm9udC1zaXplOiAuODEyNXJlbTtcbiAgICAgICAgICAgIHBhZGRpbmc6IC42MjVyZW07XG4gICAgICAgICAgfVxuICAgICAgICAgIC5tb2RhbC1ib2R5IHtcbiAgICAgICAgICAgIHBhZGRpbmc6IDAgLjYyNXJlbSAuNzVyZW07XG4gICAgICAgICAgICB3aGl0ZS1zcGFjZTogbm9ybWFsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGBcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2dlbmVyYWxDbGFzc05hbWV9IG1vZGFsLWRpYWxvZyAke3BhbmVsVmlzaWJsZSA/ICcnIDogJ2NvbGxhcHNlJ31gfSBjc3M9e2dldFN0eWxlKCl9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbW9kYWwtY29udGVudCc+XG4gICAgICAgICAge2dldENvbnRlbnQoKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbiAgcmV0dXJuIGlzTW9kYWwgPyByZW5kZXJNb2RhbENvbnRlbnQoKSA6IHJlbmRlck5vbk1vZGFsQ29udGVudCgpXG59KVxuXG5leHBvcnQgZW51bSBFbnRpdHlTdGF0dXNUeXBlIHtcbiAgTm9uZSA9ICcnLFxuICBJbml0ID0gJ2luaXQnLFxuICBMb2FkaW5nID0gJ2xvYWRpbmcnLFxuICBMb2FkZWQgPSAnbG9hZGVkJyxcbiAgV2FybmluZyA9ICd3YXJuaW5nJyxcbiAgRXJyb3IgPSAnZXJyb3InLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXR1c0luZGljYXRvclByb3BzIHtcbiAgY2xhc3NOYW1lPzogc3RyaW5nXG4gIHN0YXR1c1R5cGU/OiBFbnRpdHlTdGF0dXNUeXBlXG4gIHRpdGxlPzogc3RyaW5nXG59XG5cbi8qKlxuICogQW4gYW5pbWF0YWJsZSBpY29uIHJlcHJlc2VudGluZyBzdGF0dXNcbiAqL1xuZXhwb3J0IGNvbnN0IFN0YXR1c0luZGljYXRvciA9IHdpdGhUaGVtZSgocHJvcHM6IFN0YXR1c0luZGljYXRvclByb3BzICYgVGhlbWVQcm9wcykgPT4ge1xuICBjb25zdCB7IHRoZW1lLCBjbGFzc05hbWUsIHRpdGxlLCBzdGF0dXNUeXBlIH0gPSBwcm9wc1xuICBjb25zdCBnZXRTdHlsZSA9ICgpID0+IGNzc2BcbiAgICAmLnVpLXVuaXQtc3RhdHVzLWluZGljYXRvciB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgJi51aS11bml0LXN0YXR1cy1pbmRpY2F0b3Jfc3RhdHVzLXR5cGUtbG9hZGluZyB7XG4gICAgICAgICY6YmVmb3JlIHtcbiAgICAgICAgICBAa2V5ZnJhbWVzIGxvYWRpbmcge1xuICAgICAgICAgICAgMCUge3RyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9O1xuICAgICAgICAgICAgMTAwJSB7dHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKX07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgICAgIHdpZHRoOiAxcmVtO1xuICAgICAgICAgIGhlaWdodDogMXJlbTtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAke3RoZW1lPy5yZWYucGFsZXR0ZT8ubmV1dHJhbD8uWzUwMF19O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBib3JkZXItdG9wOiAxcHggc29saWQgJHt0aGVtZT8uc3lzLmNvbG9yPy5wcmltYXJ5Py5tYWlufTtcbiAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICAgIGFuaW1hdGlvbjogbG9hZGluZyAycyBpbmZpbml0ZSBsaW5lYXI7XG4gICAgICAgICAgbWFyZ2luLXJpZ2h0OiAuMjVyZW07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIGBcbiAgcmV0dXJuIChcbiAgICBzdGF0dXNUeXBlICYmXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7Y2xhc3NOYW1lID8/ICcnfSB1aS11bml0LXN0YXR1cy1pbmRpY2F0b3IgdWktdW5pdC1zdGF0dXMtaW5kaWNhdG9yX3N0YXR1cy10eXBlLSR7c3RhdHVzVHlwZX1gfSB0aXRsZT17dGl0bGV9IGNzcz17Z2V0U3R5bGUoKX0gLz5cbiAgKVxufSlcblxuZXhwb3J0IGludGVyZmFjZSBFcnJvck1lc3NhZ2VQcm9wcyB7XG4gIGVycm9yOiBzdHJpbmcgfCBudWxsXG4gIGNsYXNzTmFtZT86IHN0cmluZ1xuICBvbkRpc21pc3M/OiAoKSA9PiB2b2lkXG59XG5cbi8qKlxuICogU2ltcGxlIGVycm9yIG1lc3NhZ2UgY29tcG9uZW50IGZvciBkaXNwbGF5aW5nIHVzZXItZmFjaW5nIGVycm9ycy5cbiAqIFVzZSBEYXRhU291cmNlVGlwIGZvciBkYXRhIHNvdXJjZS1yZWxhdGVkIGVycm9ycy5cbiAqL1xuZXhwb3J0IGNvbnN0IEVycm9yTWVzc2FnZSA9IChwcm9wczogRXJyb3JNZXNzYWdlUHJvcHMpID0+IHtcbiAgY29uc3QgeyBlcnJvciwgY2xhc3NOYW1lID0gJycsIG9uRGlzbWlzcyB9ID0gcHJvcHNcbiAgXG4gIGlmICghZXJyb3IpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIFxuICBjb25zdCBlcnJvclN0eWxlID0gY3NzYFxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBwYWRkaW5nOiAwLjVyZW07XG4gICAgbWFyZ2luOiAwLjVyZW0gMDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zeXMtY29sb3ItZXJyb3ItbGlnaHQpO1xuICAgIGNvbG9yOiB2YXIoLS1zeXMtY29sb3ItZXJyb3ItZGFyayk7XG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gICAgZ2FwOiAwLjVyZW07XG4gICAgXG4gICAgLmVycm9yLWljb24ge1xuICAgICAgZmxleC1zaHJpbms6IDA7XG4gICAgfVxuICAgIFxuICAgIC5lcnJvci10ZXh0IHtcbiAgICAgIGZsZXg6IDE7XG4gICAgfVxuICAgIFxuICAgIC5lcnJvci1kaXNtaXNzIHtcbiAgICAgIGZsZXgtc2hyaW5rOiAwO1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgcGFkZGluZzogMC4yNXJlbTtcbiAgICAgICY6aG92ZXIge1xuICAgICAgICBvcGFjaXR5OiAwLjc7XG4gICAgICB9XG4gICAgfVxuICBgXG4gIFxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgZXJyb3ItbWVzc2FnZSAke2NsYXNzTmFtZX1gfSBjc3M9e2Vycm9yU3R5bGV9IHJvbGU9XCJhbGVydFwiPlxuICAgICAgPEljb24gaWNvbj17aWNvbkVycm9yfSBjbGFzc05hbWU9XCJlcnJvci1pY29uXCIgc2l6ZT1cInNtXCIgLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImVycm9yLXRleHRcIj57ZXJyb3J9PC9zcGFuPlxuICAgICAge29uRGlzbWlzcyAmJiAoXG4gICAgICAgIDxCdXR0b24gXG4gICAgICAgICAgc2l6ZT1cInNtXCIgXG4gICAgICAgICAgdHlwZT1cInRlcnRpYXJ5XCIgXG4gICAgICAgICAgaWNvbiBcbiAgICAgICAgICBvbkNsaWNrPXtvbkRpc21pc3N9XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZXJyb3ItZGlzbWlzc1wiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIkRpc21pc3MgZXJyb3JcIlxuICAgICAgICA+XG4gICAgICAgICAgPEljb24gaWNvbj17cmVxdWlyZSgnamltdS1pY29ucy9zdmcvb3V0bGluZWQvZWRpdG9yL2Nsb3NlLnN2ZycpLmRlZmF1bHR9IHNpemU9XCJzbVwiIC8+XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5cblxuIiwiLyoqIEBqc3gganN4ICovXG5pbXBvcnQge1xuICBSZWFjdCxcbiAganN4LFxuICBnZXRBcHBTdG9yZSxcbiAgRGF0YVNvdXJjZUNvbXBvbmVudCxcbiAgdHlwZSBEYXRhU291cmNlLFxuICB0eXBlIFVzZURhdGFTb3VyY2UsXG4gIGFwcENvbmZpZ1V0aWxzLFxuICB0eXBlIElNRGF0YVNvdXJjZUluZm8sXG4gIERhdGFTb3VyY2VTdGF0dXMsXG4gIHR5cGUgSW1tdXRhYmxlT2JqZWN0LFxuICBob29rc1xufSBmcm9tICdqaW11LWNvcmUnXG5pbXBvcnQgeyBJY29uLCBUb29sdGlwLCBCdXR0b24sIGRlZmF1bHRNZXNzYWdlcyB9IGZyb20gJ2ppbXUtdWknXG5pbXBvcnQgeyBFbnRpdHlTdGF0dXNUeXBlLCBTdGF0dXNJbmRpY2F0b3IgfSBmcm9tICcuL2NvbW1vbi1jb21wb25lbnRzJ1xuaW1wb3J0IGljb25XYXJuaW5nIGZyb20gJ2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL3N1Z2dlc3RlZC93YXJuaW5nLnN2ZydcbmltcG9ydCBpY29uRXJyb3IgZnJvbSAnamltdS1pY29ucy9zdmcvb3V0bGluZWQvc3VnZ2VzdGVkL2Vycm9yLnN2ZydcbmltcG9ydCB7IHVzZURhdGFTb3VyY2VFeGlzdHMgfSBmcm9tICcuL3VzZS1kcy1leGlzdHMnXG5cbmludGVyZmFjZSBDb250ZW50UHJvcHMge1xuICB3aWRnZXRJZDogc3RyaW5nXG4gIHVzZURhdGFTb3VyY2U6IEltbXV0YWJsZU9iamVjdDxVc2VEYXRhU291cmNlPlxuICBvblN0YXR1c0NoYW5nZT86IChlbmFibGVkOiBib29sZWFuKSA9PiB2b2lkXG4gIG9uRGF0YVNvdXJjZUNyZWF0ZWQ/OiAoZHM6IERhdGFTb3VyY2UpID0+IHZvaWRcbiAgc2hvd01lc3NhZ2U/OiBib29sZWFuXG59XG5cbi8qKlxuICogU2hvdyBpY29uIGFuZCBtZXNzYWdlIGlmIHRoZSBkYXRhIHNvdXJjZSBkb2Vzbid0IHdvcmsuXG4gKiBAcGFyYW0gcHJvcHNcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEYXRhU291cmNlVGlwIChwcm9wczogQ29udGVudFByb3BzKSB7XG4gIGNvbnN0IHsgd2lkZ2V0SWQsIHVzZURhdGFTb3VyY2UsIG9uU3RhdHVzQ2hhbmdlLCBvbkRhdGFTb3VyY2VDcmVhdGVkLCBzaG93TWVzc2FnZSA9IGZhbHNlIH0gPSBwcm9wc1xuICBjb25zdCBnZXRJMThuTWVzc2FnZSA9IGhvb2tzLnVzZVRyYW5zbGF0aW9uKGRlZmF1bHRNZXNzYWdlcylcbiAgY29uc3QgZHNFeGlzdHM6IGJvb2xlYW4gPSB1c2VEYXRhU291cmNlRXhpc3RzKHsgd2lkZ2V0SWQsIHVzZURhdGFTb3VyY2VJZDogdXNlRGF0YVNvdXJjZS5kYXRhU291cmNlSWQgfSlcbiAgY29uc3QgW2RzU3RhdHVzLCBzZXREc1N0YXR1c10gPSBSZWFjdC51c2VTdGF0ZTwnZXJyb3InIHwgJ3dhcm5pbmcnIHwgJ2NyZWF0aW5nJz4obnVsbClcbiAgY29uc3QgW2RhdGFTb3VyY2UsIHNldERhdGFTb3VyY2VdID0gUmVhY3QudXNlU3RhdGU8RGF0YVNvdXJjZT4obnVsbClcblxuICBjb25zdCBoYW5kbGVEc0luZm9DaGFuZ2UgPSBSZWFjdC51c2VDYWxsYmFjaygoaW5mbzogSU1EYXRhU291cmNlSW5mbykgPT4ge1xuICAgIGlmIChpbmZvKSB7XG4gICAgICBjb25zdCB7IHN0YXR1cywgaW5zdGFuY2VTdGF0dXMgfSA9IGluZm9cbiAgICAgIGlmIChpbnN0YW5jZVN0YXR1cyA9PT0gRGF0YVNvdXJjZVN0YXR1cy5Ob3RDcmVhdGVkKSB7XG4gICAgICAgIHNldERzU3RhdHVzKCdjcmVhdGluZycpXG4gICAgICAgIG9uU3RhdHVzQ2hhbmdlPy4oZmFsc2UpXG4gICAgICB9IGVsc2UgaWYgKGluc3RhbmNlU3RhdHVzID09PSBEYXRhU291cmNlU3RhdHVzLkNyZWF0ZUVycm9yIHx8IHN0YXR1cyA9PT0gRGF0YVNvdXJjZVN0YXR1cy5Mb2FkRXJyb3IpIHtcbiAgICAgICAgc2V0RHNTdGF0dXMoJ2Vycm9yJylcbiAgICAgICAgb25TdGF0dXNDaGFuZ2U/LihmYWxzZSlcbiAgICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBEYXRhU291cmNlU3RhdHVzLk5vdFJlYWR5KSB7XG4gICAgICAgIHNldERzU3RhdHVzKCd3YXJuaW5nJylcbiAgICAgICAgb25TdGF0dXNDaGFuZ2U/LihmYWxzZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldERzU3RhdHVzKG51bGwpXG4gICAgICAgIG9uU3RhdHVzQ2hhbmdlPy4odHJ1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtvblN0YXR1c0NoYW5nZV0pXG5cbiAgY29uc3QgaGFuZGxlRHNDcmVhdGVkID0gUmVhY3QudXNlQ2FsbGJhY2soKGRzOiBEYXRhU291cmNlKSA9PiB7XG4gICAgc2V0RGF0YVNvdXJjZShkcylcbiAgICBvbkRhdGFTb3VyY2VDcmVhdGVkPy4oZHMpXG4gIH0sIFtvbkRhdGFTb3VyY2VDcmVhdGVkXSlcblxuICBjb25zdCBoYW5kbGVEc0NyZWF0ZUZhaWxlZCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXREYXRhU291cmNlKG51bGwpXG4gICAgc2V0RHNTdGF0dXMoJ2Vycm9yJylcbiAgICBvblN0YXR1c0NoYW5nZT8uKGZhbHNlKVxuICB9LCBbb25TdGF0dXNDaGFuZ2VdKVxuXG4gIGxldCBzdGF0dXNJY29uXG4gIGxldCBzdGF0dXNNc2dcbiAgbGV0IGNvbG9yXG4gIGlmIChkc1N0YXR1cyA9PT0gJ2NyZWF0aW5nJykge1xuICAgIHN0YXR1c0ljb24gPSBpY29uRXJyb3JcbiAgICBzdGF0dXNNc2cgPSBnZXRJMThuTWVzc2FnZSgnbG9hZGluZycpXG4gIH0gZWxzZSBpZiAoIWRzRXhpc3RzIHx8IGRzU3RhdHVzID09PSAnZXJyb3InKSB7XG4gICAgc3RhdHVzSWNvbiA9IGljb25FcnJvclxuICAgIHN0YXR1c01zZyA9IGdldEkxOG5NZXNzYWdlKCdkYXRhU291cmNlQ3JlYXRlRXJyb3InKVxuICAgIGNvbG9yID0gJ3ZhcigtLXN5cy1jb2xvci1lcnJvci1tYWluKSdcbiAgfSBlbHNlIGlmIChkc1N0YXR1cyA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgbGV0IGxhYmVsID0gJydcbiAgICBjb25zdCBvcmlnaW5EcyA9IGRhdGFTb3VyY2U/LmdldE9yaWdpbkRhdGFTb3VyY2VzKCk/LlswXVxuICAgIGlmIChvcmlnaW5Ecykge1xuICAgICAgbGFiZWwgPSBvcmlnaW5Ecy5nZXRMYWJlbCgpIHx8IG9yaWdpbkRzLmdldERhdGFTb3VyY2VKc29uKCkuc291cmNlTGFiZWxcbiAgICB9IGVsc2UgaWYgKGRhdGFTb3VyY2UpIHtcbiAgICAgIGxhYmVsID0gZGF0YVNvdXJjZS5nZXRMYWJlbCgpIHx8IGRhdGFTb3VyY2UuZ2V0RGF0YVNvdXJjZUpzb24oKS5sYWJlbFxuICAgIH1cblxuICAgIGNvbnN0IHdpZGdldElkID0gYXBwQ29uZmlnVXRpbHMuZ2V0V2lkZ2V0SWRCeU91dHB1dERhdGFTb3VyY2UodXNlRGF0YVNvdXJjZSlcbiAgICBjb25zdCBhcHBTdGF0ZSA9IHdpbmRvdz8uamltdUNvbmZpZz8uaXNCdWlsZGVyXG4gICAgICA/IGdldEFwcFN0b3JlKCkuZ2V0U3RhdGUoKS5hcHBTdGF0ZUluQnVpbGRlclxuICAgICAgOiBnZXRBcHBTdG9yZSgpLmdldFN0YXRlKClcbiAgICBjb25zdCB3aWRnZXRMYWJlbCA9IGFwcFN0YXRlLmFwcENvbmZpZy53aWRnZXRzW3dpZGdldElkXT8ubGFiZWxcblxuICAgIGNvbG9yID0gJ3ZhcigtLXN5cy1jb2xvci13YXJuaW5nLWRhcmspJ1xuICAgIHN0YXR1c0ljb24gPSBpY29uV2FybmluZ1xuICAgIHN0YXR1c01zZyA9IGdldEkxOG5NZXNzYWdlKCdvdXRwdXREYXRhSXNOb3RHZW5lcmF0ZWQnLCB7XG4gICAgICBvdXRwdXREc0xhYmVsOiBsYWJlbCA/PyAnJyxcbiAgICAgIHNvdXJjZVdpZGdldE5hbWU6IHdpZGdldExhYmVsID8/ICcnXG4gICAgfSlcbiAgfVxuICByZXR1cm4gKFxuICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgIHtkc0V4aXN0cyAmJiAoXG4gICAgICAgIDxEYXRhU291cmNlQ29tcG9uZW50XG4gICAgICAgICAgdXNlRGF0YVNvdXJjZT17dXNlRGF0YVNvdXJjZX1cbiAgICAgICAgICBvbkRhdGFTb3VyY2VJbmZvQ2hhbmdlPXtoYW5kbGVEc0luZm9DaGFuZ2V9XG4gICAgICAgICAgb25EYXRhU291cmNlQ3JlYXRlZD17aGFuZGxlRHNDcmVhdGVkfVxuICAgICAgICAgIG9uQ3JlYXRlRGF0YVNvdXJjZUZhaWxlZD17aGFuZGxlRHNDcmVhdGVGYWlsZWR9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAge2RzU3RhdHVzID09PSAnY3JlYXRpbmcnICYmIDxTdGF0dXNJbmRpY2F0b3Igc3RhdHVzVHlwZT17RW50aXR5U3RhdHVzVHlwZS5Mb2FkaW5nfSB0aXRsZT17c3RhdHVzTXNnfSAvPn1cbiAgICAgIHsoIWRzRXhpc3RzIHx8IGRzU3RhdHVzID09PSAnZXJyb3InIHx8IGRzU3RhdHVzID09PSAnd2FybmluZycpICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J2QtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXInPlxuICAgICAgICAgIDxUb29sdGlwIHRpdGxlPXtzdGF0dXNNc2d9PlxuICAgICAgICAgICAgPEJ1dHRvbiBzaXplPSdzbScgdHlwZT0ndGVydGlhcnknIGljb24+PEljb24gaWNvbj17c3RhdHVzSWNvbn0gY29sb3I9e2NvbG9yfSAvPjwvQnV0dG9uPlxuICAgICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICAgICB7c2hvd01lc3NhZ2UgJiYgPGRpdiBjbGFzc05hbWU9J3N0YXR1cy1tZXNzYWdlJz57c3RhdHVzTXNnfTwvZGl2Pn1cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gIClcbn1cblxuXG5cbiIsIi8qKlxuICogQ29uZmlndXJhYmxlIGRlYnVnIGxvZ2dpbmcgdXRpbGl0eSBmb3IgRXhwZXJpZW5jZSBCdWlsZGVyIHdpZGdldHNcbiAqIFxuICogVXNhZ2U6XG4gKiAtIEFkZCA/ZGVidWc9YWxsIHRvIFVSTCB0byBzZWUgYWxsIGRlYnVnIGxvZ3NcbiAqIC0gQWRkID9kZWJ1Zz1IQVNILEZPUk0gdG8gc2VlIHNwZWNpZmljIGZlYXR1cmUgbG9nc1xuICogLSBBZGQgP2RlYnVnPWZhbHNlIHRvIGRpc2FibGUgYWxsIGRlYnVnIGxvZ3NcbiAqIFxuICogRmVhdHVyZXMgKFF1ZXJ5U2ltcGxlKTpcbiAqIC0gSEFTSDogSGFzaCBwYXJhbWV0ZXIgcHJvY2Vzc2luZ1xuICogLSBGT1JNOiBRdWVyeSBmb3JtIGludGVyYWN0aW9uc1xuICogLSBUQVNLOiBRdWVyeSB0YXNrIG1hbmFnZW1lbnRcbiAqIC0gWk9PTTogWm9vbSBiZWhhdmlvclxuICogLSBNQVAtRVhURU5UOiBNYXAgZXh0ZW50IGNoYW5nZXNcbiAqIC0gREFUQS1BQ1RJT046IERhdGEgYWN0aW9uIGV4ZWN1dGlvbiAoQWRkIHRvIE1hcCwgZXRjLilcbiAqIC0gR1JPVVA6IFF1ZXJ5IGdyb3VwaW5nIGFuZCBkcm9wZG93biBzZWxlY3Rpb25cbiAqIC0gU0VMRUNUSU9OOiBTZWxlY3Rpb24gZGV0ZWN0aW9uIGFuZCBpZGVudGlmeSBwb3B1cCB0cmFja2luZ1xuICogLSBXSURHRVQtU1RBVEU6IFdpZGdldCBsaWZlY3ljbGUgZXZlbnRzIChvcGVuL2Nsb3NlIGhhbmRzaGFrZSlcbiAqIC0gUkVTVE9SRTogU2VsZWN0aW9uIHJlc3RvcmF0aW9uIHdoZW4gd2lkZ2V0IG9wZW5zXG4gKiAtIFJFU1VMVFMtTU9ERTogUmVzdWx0cyBtYW5hZ2VtZW50IG1vZGUgc2VsZWN0aW9uIChDcmVhdGUgbmV3LCBBZGQgdG8sIFJlbW92ZSBmcm9tKVxuICogXG4gKiBGZWF0dXJlcyAoSGVscGVyU2ltcGxlKTpcbiAqIC0gSEFTSDogSGFzaCBwYXJhbWV0ZXIgbW9uaXRvcmluZyBhbmQgd2lkZ2V0IG9wZW5pbmdcbiAqIC0gU0VMRUNUSU9OOiBTZWxlY3Rpb24gdHJhY2tpbmcgZnJvbSBRdWVyeVNpbXBsZVxuICogLSBXSURHRVQtU1RBVEU6IFdpZGdldCBzdGF0ZSBoYW5kc2hha2UgKG9wZW4vY2xvc2UgZXZlbnRzKVxuICogLSBSRVNUT1JFOiBTZWxlY3Rpb24gcmVzdG9yYXRpb24gYXR0ZW1wdHMgYW5kIHJlc3VsdHNcbiAqL1xuXG50eXBlIERlYnVnRmVhdHVyZSA9ICdIQVNIJyB8ICdGT1JNJyB8ICdUQVNLJyB8ICdaT09NJyB8ICdNQVAtRVhURU5UJyB8ICdEQVRBLUFDVElPTicgfCAnR1JPVVAnIHwgJ1NFTEVDVElPTicgfCAnV0lER0VULVNUQVRFJyB8ICdSRVNUT1JFJyB8ICdSRVNVTFRTLU1PREUnIHwgJ2FsbCcgfCAnZmFsc2UnXG5cbmludGVyZmFjZSBEZWJ1Z0xvZ2dlck9wdGlvbnMge1xuICB3aWRnZXROYW1lOiBzdHJpbmdcbiAgZmVhdHVyZXM6IERlYnVnRmVhdHVyZVtdXG59XG5cbmNsYXNzIERlYnVnTG9nZ2VyIHtcbiAgcHJpdmF0ZSBlbmFibGVkRmVhdHVyZXM6IFNldDxEZWJ1Z0ZlYXR1cmU+ID0gbmV3IFNldCgpXG4gIHByaXZhdGUgaW5pdGlhbGl6ZWQgPSBmYWxzZVxuICBwcml2YXRlIHdpZGdldE5hbWU6IHN0cmluZ1xuICBwcml2YXRlIGZlYXR1cmVzOiBEZWJ1Z0ZlYXR1cmVbXVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IERlYnVnTG9nZ2VyT3B0aW9ucykge1xuICAgIHRoaXMud2lkZ2V0TmFtZSA9IG9wdGlvbnMud2lkZ2V0TmFtZVxuICAgIHRoaXMuZmVhdHVyZXMgPSBvcHRpb25zLmZlYXR1cmVzXG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHJldHVyblxuXG4gICAgLy8gQ2hlY2sgVVJMIHBhcmFtZXRlcnNcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpXG4gICAgY29uc3QgZGVidWdWYWx1ZSA9IHVybFBhcmFtcy5nZXQoJ2RlYnVnJylcblxuICAgIGlmIChkZWJ1Z1ZhbHVlID09PSAnZmFsc2UnKSB7XG4gICAgICAvLyBFeHBsaWNpdGx5IGRpc2FibGVkXG4gICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGRlYnVnVmFsdWUgPT09ICdhbGwnKSB7XG4gICAgICAvLyBFbmFibGUgYWxsIGZlYXR1cmVzIG9ubHkgaWYgZXhwbGljaXRseSBzZXQgdG8gJ2FsbCdcbiAgICAgIHRoaXMuZmVhdHVyZXMuZm9yRWFjaChmZWF0dXJlID0+IHtcbiAgICAgICAgaWYgKGZlYXR1cmUgIT09ICdhbGwnICYmIGZlYXR1cmUgIT09ICdmYWxzZScpIHtcbiAgICAgICAgICB0aGlzLmVuYWJsZWRGZWF0dXJlcy5hZGQoZmVhdHVyZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKGRlYnVnVmFsdWUgIT09IG51bGwpIHtcbiAgICAgIC8vIFBhcnNlIGNvbW1hLXNlcGFyYXRlZCBmZWF0dXJlIGxpc3RcbiAgICAgIGNvbnN0IHJlcXVlc3RlZEZlYXR1cmVzID0gZGVidWdWYWx1ZS5zcGxpdCgnLCcpLm1hcChmID0+IGYudHJpbSgpLnRvVXBwZXJDYXNlKCkgYXMgRGVidWdGZWF0dXJlKVxuICAgICAgcmVxdWVzdGVkRmVhdHVyZXMuZm9yRWFjaChmZWF0dXJlID0+IHtcbiAgICAgICAgaWYgKGZlYXR1cmUudG9VcHBlckNhc2UoKSA9PT0gJ0FMTCcpIHtcbiAgICAgICAgICAvLyBFbmFibGUgYWxsIGZlYXR1cmVzIGZvciB0aGlzIHdpZGdldFxuICAgICAgICAgIHRoaXMuZmVhdHVyZXMuZm9yRWFjaChmID0+IHtcbiAgICAgICAgICAgIGlmIChmICE9PSAnYWxsJyAmJiBmICE9PSAnZmFsc2UnKSB7XG4gICAgICAgICAgICAgIHRoaXMuZW5hYmxlZEZlYXR1cmVzLmFkZChmKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5mZWF0dXJlcy5pbmNsdWRlcyhmZWF0dXJlKSkge1xuICAgICAgICAgIHRoaXMuZW5hYmxlZEZlYXR1cmVzLmFkZChmZWF0dXJlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG4gIH1cblxuICBwcml2YXRlIGlzRW5hYmxlZChmZWF0dXJlOiBEZWJ1Z0ZlYXR1cmUpOiBib29sZWFuIHtcbiAgICB0aGlzLmluaXRpYWxpemUoKVxuICAgIFxuICAgIGlmICh0aGlzLmVuYWJsZWRGZWF0dXJlcy5oYXMoJ2FsbCcpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdGhpcy5lbmFibGVkRmVhdHVyZXMuaGFzKGZlYXR1cmUpXG4gIH1cblxuICBsb2coZmVhdHVyZTogRGVidWdGZWF0dXJlLCBkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNFbmFibGVkKGZlYXR1cmUpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBsb2dEYXRhID0ge1xuICAgICAgZmVhdHVyZSxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgLi4uZGF0YVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBbJHt0aGlzLndpZGdldE5hbWUudG9VcHBlckNhc2UoKX0tJHtmZWF0dXJlfV1gLCBKU09OLnN0cmluZ2lmeShsb2dEYXRhLCBudWxsLCAyKSlcbiAgfVxuXG4gIGdldENvbmZpZygpOiB7IGVuYWJsZWRGZWF0dXJlczogc3RyaW5nW10sIGRlYnVnVmFsdWU6IHN0cmluZyB8IG51bGwgfSB7XG4gICAgdGhpcy5pbml0aWFsaXplKClcbiAgICBcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpXG4gICAgY29uc3QgZGVidWdWYWx1ZSA9IHVybFBhcmFtcy5nZXQoJ2RlYnVnJylcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgZW5hYmxlZEZlYXR1cmVzOiBBcnJheS5mcm9tKHRoaXMuZW5hYmxlZEZlYXR1cmVzKSxcbiAgICAgIGRlYnVnVmFsdWVcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVidWcgbG9nZ2VyIGluc3RhbmNlIGZvciBRdWVyeVNpbXBsZSB3aWRnZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVF1ZXJ5U2ltcGxlRGVidWdMb2dnZXIoKSB7XG4gIHJldHVybiBuZXcgRGVidWdMb2dnZXIoe1xuICAgIHdpZGdldE5hbWU6ICdRVUVSWVNJTVBMRScsXG4gICAgZmVhdHVyZXM6IFsnSEFTSCcsICdGT1JNJywgJ1RBU0snLCAnWk9PTScsICdNQVAtRVhURU5UJywgJ0RBVEEtQUNUSU9OJywgJ0dST1VQJywgJ1NFTEVDVElPTicsICdXSURHRVQtU1RBVEUnLCAnUkVTVE9SRScsICdSRVNVTFRTLU1PREUnXVxuICB9KVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJ1ZyBsb2dnZXIgaW5zdGFuY2UgZm9yIEhlbHBlclNpbXBsZSB3aWRnZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhlbHBlclNpbXBsZURlYnVnTG9nZ2VyKCkge1xuICByZXR1cm4gbmV3IERlYnVnTG9nZ2VyKHtcbiAgICB3aWRnZXROYW1lOiAnSEVMUEVSU0lNUExFJyxcbiAgICBmZWF0dXJlczogWydIQVNIJywgJ1NFTEVDVElPTicsICdXSURHRVQtU1RBVEUnLCAnUkVTVE9SRSddXG4gIH0pXG59XG5cbiIsImltcG9ydCB7XG4gIFJlYWN0UmVkdXgsXG4gIHR5cGUgSU1TdGF0ZSxcbiAgdHlwZSBJTUFwcENvbmZpZ1xufSBmcm9tICdqaW11LWNvcmUnXG5pbnRlcmZhY2UgUHJvcHMge1xuICB3aWRnZXRJZDogc3RyaW5nXG4gIHVzZURhdGFTb3VyY2VJZDogc3RyaW5nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VEYXRhU291cmNlRXhpc3RzIChwcm9wczogUHJvcHMpIHtcbiAgY29uc3QgeyB3aWRnZXRJZCwgdXNlRGF0YVNvdXJjZUlkIH0gPSBwcm9wc1xuXG4gIGNvbnN0IGV4aXN0czogYm9vbGVhbiA9IFJlYWN0UmVkdXgudXNlU2VsZWN0b3IoKHN0YXRlOiBJTVN0YXRlKSA9PiB7XG4gICAgbGV0IGFwcENvbmZpZzogSU1BcHBDb25maWdcbiAgICBpZiAod2luZG93LmppbXVDb25maWcuaXNCdWlsZGVyKSB7XG4gICAgICBhcHBDb25maWcgPSBzdGF0ZS5hcHBTdGF0ZUluQnVpbGRlci5hcHBDb25maWdcbiAgICB9IGVsc2Uge1xuICAgICAgYXBwQ29uZmlnID0gc3RhdGUuYXBwQ29uZmlnXG4gICAgfVxuICAgIGNvbnN0IHVzZURhdGFTb3VyY2VzID0gYXBwQ29uZmlnLndpZGdldHNbd2lkZ2V0SWRdLnVzZURhdGFTb3VyY2VzID8/IFtdXG4gICAgcmV0dXJuIHVzZURhdGFTb3VyY2VzLnNvbWUodXNlRHMgPT4gdXNlRHMuZGF0YVNvdXJjZUlkID09PSB1c2VEYXRhU291cmNlSWQpXG4gIH0pXG5cbiAgcmV0dXJuIGV4aXN0c1xufVxuXG5cblxuIiwiaW1wb3J0IHR5cGUgeyBJUG9wdXBJbmZvIH0gZnJvbSAnQGVzcmkvYXJjZ2lzLXJlc3QtZmVhdHVyZS1zZXJ2aWNlJ1xuaW1wb3J0IHR5cGUgeyBJbnRsU2hhcGUsIERhdGFTb3VyY2UgfSBmcm9tICdqaW11LWNvcmUnXG5cbi8qKlxuICogVG9nZ2xlIGl0ZW1zIGluIGFuIGFycmF5XG4gKi9cbmV4cG9ydCBjb25zdCB0b2dnbGVJdGVtSW5BcnJheSA9IChpdGVtLCBpdGVtcyA9IFtdKSA9PiBpdGVtcy5pbmNsdWRlcyhpdGVtKSA/IGl0ZW1zLmZpbHRlcihpID0+IGkgIT09IGl0ZW0pIDogWy4uLml0ZW1zLCBpdGVtXVxuXG5leHBvcnQgaW50ZXJmYWNlIERhdGFTb3VyY2VNYXAge1xuICBbZGF0YVNvdXJjZUlkOiBzdHJpbmddOiBEYXRhU291cmNlXG59XG5cbmV4cG9ydCB0eXBlIEdldEkxOG5NZXNzYWdlVHlwZSA9IChpZDogc3RyaW5nLCBvcHRpb25zPzogeyBtZXNzYWdlcz86IGFueSwgdmFsdWVzPzogYW55IH0pID0+IHN0cmluZ1xuLyoqXG4gKiBBIGZhY3RvcnkgdG8gY3JlYXRlIGEgZnVuY3Rpb24gb2YgZ2V0dGluZyBpMThuIG1lc3NhZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdldEkxOG5NZXNzYWdlIChvcHRpb25zOiB7IGludGw6IEludGxTaGFwZSwgZGVmYXVsdE1lc3NhZ2VzPzogYW55IH0pIHtcbiAgY29uc3QgeyBpbnRsLCBkZWZhdWx0TWVzc2FnZXMgPSB7fSB9ID0gb3B0aW9ucyB8fCB7fVxuICBjb25zdCBnZXRJMThuTWVzc2FnZTogR2V0STE4bk1lc3NhZ2VUeXBlID0gKGlkLCBvcHRpb25zKSA9PiB7XG4gICAgY29uc3QgeyBtZXNzYWdlcywgdmFsdWVzIH0gPSBvcHRpb25zIHx8IHt9XG4gICAgcmV0dXJuIGludGwuZm9ybWF0TWVzc2FnZSh7IGlkLCBkZWZhdWx0TWVzc2FnZTogKG1lc3NhZ2VzIHx8IGRlZmF1bHRNZXNzYWdlcylbaWRdIH0sIHZhbHVlcylcbiAgfVxuICByZXR1cm4gZ2V0STE4bk1lc3NhZ2Vcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpZWxkSW5mb3NJblBvcHVwQ29udGVudCAocG9wdXBJbmZvOiBJUG9wdXBJbmZvKSB7XG4gIGNvbnN0IHJlc3VsdCA9IFtdXG4gIGlmIChwb3B1cEluZm8/LnBvcHVwRWxlbWVudHM/Lmxlbmd0aCA+IDApIHtcbiAgICBwb3B1cEluZm8ucG9wdXBFbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gJ2ZpZWxkcycgJiYgZWxlbWVudC5maWVsZEluZm9zPy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKC4uLmVsZW1lbnQuZmllbGRJbmZvcylcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9fZW1vdGlvbl9yZWFjdF9qc3hfcnVudGltZV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X2NvcmVfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV90aGVtZV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X3VpX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCIvKipcbiAqIFNoYXJlZCBjb21tb24gdXRpbGl0aWVzIGFuZCBjb21wb25lbnRzIGZvciBFeHBlcmllbmNlIEJ1aWxkZXIgd2lkZ2V0c1xuICogXG4gKiBUaGlzIG1vZHVsZSBleHBvcnRzIGNvbW1vbiBmdW5jdGlvbmFsaXR5IHRoYXQgY2FuIGJlIHNoYXJlZCBiZXR3ZWVuXG4gKiBxdWVyeS1zaW1wbGUsIGhlbHBlci1zaW1wbGUsIGFuZCBvdGhlciBjdXN0b20gd2lkZ2V0cy5cbiAqIFxuICogVGhpcyBpcyB0aGUgZW50cnkgcG9pbnQgZm9yICd3aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbidcbiAqL1xuXG5leHBvcnQgKiBmcm9tICcuL2NvbW1vbi9jb21tb24tY29tcG9uZW50cydcbmV4cG9ydCAqIGZyb20gJy4vY29tbW9uL3V0aWxzJ1xuZXhwb3J0ICogZnJvbSAnLi9jb21tb24vdXNlLWRzLWV4aXN0cydcbmV4cG9ydCAqIGZyb20gJy4vY29tbW9uL2RhdGEtc291cmNlLXRpcCdcbmV4cG9ydCAqIGZyb20gJy4vY29tbW9uL2RlYnVnLWxvZ2dlcidcblxuXG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==