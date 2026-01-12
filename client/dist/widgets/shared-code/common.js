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
 * - BUG: Known bugs/issues (always logs, even if debug=false) - Use format: bugId, category, description
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
 * - GRAPHICS-LAYER: Graphics layer highlighting (independent of layer visibility)
 * - EVENTS: Event listener setup/cleanup and custom event dispatching
 *
 * Temporary Migration Features (will be removed after migration complete):
 * - CHUNK-1-COMPARE: Chunk 1 (URL Parameter) comparison logs
 * - CHUNK-1-MISMATCH: Chunk 1 mismatch warnings
 * - CHUNK-2-COMPARE: Chunk 2 (Visibility) comparison logs
 * - CHUNK-2-MISMATCH: Chunk 2 mismatch warnings
 * - CHUNK-3-COMPARE: Chunk 3 (Selection/Restoration) comparison logs
 * - CHUNK-3-DECISION: Chunk 3 decision point logs
 * - CHUNK-3-FALLBACK: Chunk 3 fallback logic logs
 * - CHUNK-4-COMPARE: Chunk 4 (Graphics Layer) comparison logs
 * - CHUNK-5-COMPARE: Chunk 5 (Accumulated Records) comparison logs
 * - CHUNK-6-COMPARE: Chunk 6 (Map View) comparison logs
 * - CHUNK-6-MISMATCH: Chunk 6 mismatch warnings
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
        // Check URL parameters (both current window and parent for iframes)
        let urlParams = new URLSearchParams(window.location.search);
        let debugValue = urlParams.get('debug');
        // If not found in current window, check parent (needed for ExB iframes)
        if (debugValue === null && window.parent !== window) {
            try {
                urlParams = new URLSearchParams(window.parent.location.search);
                debugValue = urlParams.get('debug');
            }
            catch (e) {
                // Cross-origin restriction might prevent access to parent location
            }
        }
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
            console.log(`[${this.widgetName}-DEBUG] Enabled ALL features:`, Array.from(this.enabledFeatures));
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
        // BUG level always enabled, regardless of debug switches (even if debug=false)
        if (feature === 'BUG') {
            return true;
        }
        if (this.enabledFeatures.has('all')) {
            return true;
        }
        return this.enabledFeatures.has(feature);
    }
    log(feature, data) {
        // BUG level always logs, even if debug=false
        if (feature === 'BUG') {
            const logData = Object.assign({ feature: 'BUG', bugId: data.bugId || 'UNKNOWN', category: data.category || 'GENERAL', timestamp: new Date().toISOString() }, data);
            // Use console.warn with emoji format to make bugs stand out
            console.warn(`[${this.widgetName.toUpperCase()} ⚠️ BUG]`, JSON.stringify(logData, null, 2));
            return;
        }
        // Regular feature logging (existing behavior)
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
        features: [
            'HASH', 'HASH-EXEC', 'HASH-FIRST-LOAD', 'FORM', 'TASK', 'ZOOM', 'MAP-EXTENT', 'DATA-ACTION', 'GROUP',
            'SELECTION', 'WIDGET-STATE', 'RESTORE', 'RESULTS-MODE', 'EXPAND-COLLAPSE', 'GRAPHICS-LAYER', 'EVENTS',
            // Temporary migration features (will be removed after migration complete)
            'CHUNK-1-COMPARE', 'CHUNK-1-MISMATCH', 'CHUNK-2-COMPARE', 'CHUNK-2-MISMATCH', 'CHUNK-3-COMPARE', 'CHUNK-3-DECISION', 'CHUNK-3-FALLBACK',
            'CHUNK-4-COMPARE', 'CHUNK-5-COMPARE', 'CHUNK-6-COMPARE', 'CHUNK-6-MISMATCH'
        ]
    });
}
/**
 * Creates a debug logger instance for HelperSimple widget
 */
function createHelperSimpleDebugLogger() {
    return new DebugLogger({
        widgetName: 'HELPERSIMPLE',
        features: ['HASH', 'HASH-EXEC', 'SELECTION', 'WIDGET-STATE', 'RESTORE']
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QztRQUN6QyxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTs7WUFDeEMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxjQUFPLENBQUMsVUFBVSwwQ0FBRSxNQUFNLElBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQ3BDLENBQUM7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0lBQ0QsT0FBTyxNQUFNO0FBQ2YsQ0FBQzs7Ozs7Ozs7Ozs7O0FDbkNELHdFOzs7Ozs7Ozs7OztBQ0FBLHVEOzs7Ozs7Ozs7OztBQ0FBLHdEOzs7Ozs7Ozs7OztBQ0FBLHFEOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQSxFOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7V0NOQSwyQjs7Ozs7Ozs7OztBQ0FBOzs7S0FHSztBQUNMLHFCQUF1QixHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSm5EOzs7Ozs7O0dBT0c7QUFFdUM7QUFDWjtBQUNRO0FBQ0U7QUFDSCIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWljb25zL3N2Zy9vdXRsaW5lZC9lZGl0b3IvY2xvc2Uuc3ZnIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWljb25zL3N2Zy9vdXRsaW5lZC9zdWdnZXN0ZWQvZXJyb3Iuc3ZnIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWljb25zL3N2Zy9vdXRsaW5lZC9zdWdnZXN0ZWQvd2FybmluZy5zdmciLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi9jb21tb24tY29tcG9uZW50cy50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi9kYXRhLXNvdXJjZS10aXAudHN4Iiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24vZGVidWctbG9nZ2VyLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24vdXNlLWRzLWV4aXN0cy50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi91dGlscy50c3giLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmUvZW1vdGlvblwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LXRoZW1lXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LXVpXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IFwiPHN2ZyB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxNiAxNlxcXCI+PHBhdGggZmlsbD1cXFwiIzAwMFxcXCIgZD1cXFwibTguNzQ1IDggNi4xIDYuMWEuNTI3LjUyNyAwIDEgMS0uNzQ1Ljc0Nkw4IDguNzQ2bC02LjEgNi4xYS41MjcuNTI3IDAgMSAxLS43NDYtLjc0Nmw2LjEtNi4xLTYuMS02LjFhLjUyNy41MjcgMCAwIDEgLjc0Ni0uNzQ2bDYuMSA2LjEgNi4xLTYuMWEuNTI3LjUyNyAwIDAgMSAuNzQ2Ljc0NnpcXFwiPjwvcGF0aD48L3N2Zz5cIiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgdmlld0JveD1cXFwiMCAwIDE2IDE2XFxcIj48cGF0aCBmaWxsPVxcXCIjMDAwXFxcIiBmaWxsLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04IDE2QTggOCAwIDEgMSA4IDBhOCA4IDAgMCAxIDAgMTZtMC0xQTcgNyAwIDEgMCA4IDFhNyA3IDAgMCAwIDAgMTRNOCA0YS45MDUuOTA1IDAgMCAwLS45Ljk5NWwuMzUgMy41MDdhLjU1Mi41NTIgMCAwIDAgMS4xIDBsLjM1LTMuNTA3QS45MDUuOTA1IDAgMCAwIDggNG0xIDdhMSAxIDAgMSAxLTIgMCAxIDEgMCAwIDEgMiAwXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiPjwvcGF0aD48L3N2Zz5cIiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgdmlld0JveD1cXFwiMCAwIDE2IDE2XFxcIj48cGF0aCBmaWxsPVxcXCIjMDAwXFxcIiBmaWxsLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04IDIuMTI1IDE0LjMzNCAxNEgxLjY2N3ptLS44ODItLjQ3YTEgMSAwIDAgMSAxLjc2NSAwbDYuMzMzIDExLjg3NEExIDEgMCAwIDEgMTQuMzM0IDE1SDEuNjY3YTEgMSAwIDAgMS0uODgyLTEuNDd6TTggNC44NzRhLjkwNS45MDUgMCAwIDAtLjkuOTk1bC4zNSAzLjUwN2EuNTUyLjU1MiAwIDAgMCAxLjEgMEw4LjkgNS44N2EuOTA1LjkwNSAwIDAgMC0uOS0uOTk1bTEgN2ExIDEgMCAxIDEtMiAwIDEgMSAwIDAgMSAyIDBcXFwiIGNsaXAtcnVsZT1cXFwiZXZlbm9kZFxcXCI+PC9wYXRoPjwvc3ZnPlwiIiwiLyoqIEBqc3gganN4ICovXG5pbXBvcnQgeyBSZWFjdCwganN4LCBjc3MgfSBmcm9tICdqaW11LWNvcmUnXG5pbXBvcnQgeyBCdXR0b24sIE1vZGFsLCBNb2RhbEJvZHksIE1vZGFsRm9vdGVyLCBQYW5lbEhlYWRlciwgSWNvbiwgdHlwZSBUaGVtZVByb3BzIH0gZnJvbSAnamltdS11aSdcbmltcG9ydCB7IHdpdGhUaGVtZSB9IGZyb20gJ2ppbXUtdGhlbWUnXG5pbXBvcnQgaWNvbkVycm9yIGZyb20gJ2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL3N1Z2dlc3RlZC9lcnJvci5zdmcnXG5jb25zdCB7IHVzZVN0YXRlIH0gPSBSZWFjdFxuXG4vKipcbiAqIEEgc2ltcGxlIEZ1bmN0aW9uYWwgQ29tcG9uZW50IHN0b3Jpbmcgc29tZSBTdGF0ZXMgdGhhdCBhcmUgY29tbW9ubHkgdXNlZFxuICovXG5leHBvcnQgY29uc3QgU3RhdGVIb2xkZXIgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyBpbml0U3RhdGUgPSB7fSwgY2hpbGRyZW4gfSA9IHByb3BzXG4gIGNvbnN0IGRlZmF1bHRTdGF0ZU1hcCA9IHtcbiAgICB2aXNpYmxlOiB0cnVlLFxuICAgIHJlZkNvbnRhaW5lcjogbnVsbFxuICB9XG4gIGNvbnN0IHVzZVN0YXRlTWFwID0ge1xuICAgIHZpc2libGU6IHVzZVN0YXRlKCd2aXNpYmxlJyBpbiBpbml0U3RhdGUgPyBpbml0U3RhdGUudmlzaWJsZSA6IGRlZmF1bHRTdGF0ZU1hcC52aXNpYmxlKSxcbiAgICByZWZDb250YWluZXI6IHVzZVN0YXRlKCdyZWZDb250YWluZXInIGluIGluaXRTdGF0ZSA/IGluaXRTdGF0ZS5yZWZDb250YWluZXIgOiBkZWZhdWx0U3RhdGVNYXAucmVmQ29udGFpbmVyKSxcbiAgICBjdXN0b21EYXRhOiB1c2VTdGF0ZSh7IC4uLmluaXRTdGF0ZS5jdXN0b21EYXRhIH0pXG4gIH1cbiAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD57Y2hpbGRyZW4odXNlU3RhdGVNYXApfTwvUmVhY3QuRnJhZ21lbnQ+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nUGFuZWxQcm9wcyB7XG4gIHBhbmVsVmlzaWJsZTogYm9vbGVhblxuICBzZXRQYW5lbFZpc2libGU6ICh2aXNpYmxlOiBib29sZWFuKSA9PiB2b2lkXG4gIGdldEkxOG5NZXNzYWdlOiAoaWQ6IHN0cmluZykgPT4gYW55XG4gIGlzTW9kYWw/OiBib29sZWFuXG4gIHRpdGxlPzogYW55XG4gIGJvZHlDb250ZW50PzogYW55XG4gIGhhc0hlYWRlcj86IGJvb2xlYW5cbiAgaGFzRm9vdGVyPzogYm9vbGVhblxufVxuXG4vKipcbiAqIEEgZGlhbG9nIHBvcHVwXG4gKi9cbmV4cG9ydCBjb25zdCBEaWFsb2dQYW5lbCA9IHdpdGhUaGVtZSgocHJvcHM6IERpYWxvZ1BhbmVsUHJvcHMgJiBUaGVtZVByb3BzKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWUsIHBhbmVsVmlzaWJsZSwgc2V0UGFuZWxWaXNpYmxlLCBnZXRJMThuTWVzc2FnZSwgaXNNb2RhbCA9IHRydWUsIHRpdGxlID0gZ2V0STE4bk1lc3NhZ2UoJ3F1ZXJ5TWVzc2FnZScpLCBib2R5Q29udGVudCA9ICcnLCBoYXNIZWFkZXIgPSB0cnVlLCBoYXNGb290ZXIgPSB0cnVlIH0gPSBwcm9wc1xuICBjb25zdCB0b2dnbGUgPSAoKSA9PiB7IHNldFBhbmVsVmlzaWJsZShmYWxzZSkgfVxuICBjb25zdCBnZXRDb250ZW50ID0gKCkgPT4gPFJlYWN0LkZyYWdtZW50PlxuICAgIHtcbiAgICAgIGhhc0hlYWRlciAmJlxuICAgICAgICA8UGFuZWxIZWFkZXIgY2xhc3NOYW1lPSdweS0yJyB0aXRsZT17dGl0bGV9IG9uQ2xvc2U9e3RvZ2dsZX0gLz5cbiAgICB9XG4gICAgPE1vZGFsQm9keT57Ym9keUNvbnRlbnR9PC9Nb2RhbEJvZHk+XG4gICAge1xuICAgICAgaGFzRm9vdGVyICYmXG4gICAgICAgIDxNb2RhbEZvb3Rlcj5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e3RvZ2dsZX0+e2dldEkxOG5NZXNzYWdlKCdvaycpfTwvQnV0dG9uPlxuICAgICAgICA8L01vZGFsRm9vdGVyPlxuICAgIH1cbiAgPC9SZWFjdC5GcmFnbWVudD5cbiAgY29uc3QgZ2VuZXJhbENsYXNzTmFtZSA9ICd1aS11bml0LWRpYWxvZy1wYW5lbCdcbiAgY29uc3QgcmVuZGVyTW9kYWxDb250ZW50ID0gKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICA8TW9kYWwgY2xhc3NOYW1lPXtnZW5lcmFsQ2xhc3NOYW1lfSBpc09wZW49e3BhbmVsVmlzaWJsZX0gdG9nZ2xlPXt0b2dnbGV9IGJhY2tkcm9wPSdzdGF0aWMnPlxuICAgICAgICB7Z2V0Q29udGVudCgpfVxuICAgICAgPC9Nb2RhbD5cbiAgICApXG4gIH1cbiAgY29uc3QgcmVuZGVyTm9uTW9kYWxDb250ZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IGdldFN0eWxlID0gKCkgPT4gY3NzYFxuICAgICAgJi51aS11bml0LWRpYWxvZy1wYW5lbC5tb2RhbC1kaWFsb2cge1xuICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAubW9kYWwtY29udGVudCB7XG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHt0aGVtZS5yZWYucGFsZXR0ZS5uZXV0cmFsWzYwMF19O1xuICAgICAgICAgIGNvbG9yOiAke3RoZW1lLnJlZi5wYWxldHRlLmJsYWNrfTtcbiAgICAgICAgICBmb250LXNpemU6IC43NXJlbTtcbiAgICAgICAgICBmb250LXdlaWdodDogNDAwO1xuICAgICAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgICAgICAucGFuZWwtaGVhZGVyIHtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogLjgxMjVyZW07XG4gICAgICAgICAgICBwYWRkaW5nOiAuNjI1cmVtO1xuICAgICAgICAgIH1cbiAgICAgICAgICAubW9kYWwtYm9keSB7XG4gICAgICAgICAgICBwYWRkaW5nOiAwIC42MjVyZW0gLjc1cmVtO1xuICAgICAgICAgICAgd2hpdGUtc3BhY2U6IG5vcm1hbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtnZW5lcmFsQ2xhc3NOYW1lfSBtb2RhbC1kaWFsb2cgJHtwYW5lbFZpc2libGUgPyAnJyA6ICdjb2xsYXBzZSd9YH0gY3NzPXtnZXRTdHlsZSgpfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J21vZGFsLWNvbnRlbnQnPlxuICAgICAgICAgIHtnZXRDb250ZW50KCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG4gIHJldHVybiBpc01vZGFsID8gcmVuZGVyTW9kYWxDb250ZW50KCkgOiByZW5kZXJOb25Nb2RhbENvbnRlbnQoKVxufSlcblxuZXhwb3J0IGVudW0gRW50aXR5U3RhdHVzVHlwZSB7XG4gIE5vbmUgPSAnJyxcbiAgSW5pdCA9ICdpbml0JyxcbiAgTG9hZGluZyA9ICdsb2FkaW5nJyxcbiAgTG9hZGVkID0gJ2xvYWRlZCcsXG4gIFdhcm5pbmcgPSAnd2FybmluZycsXG4gIEVycm9yID0gJ2Vycm9yJyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGF0dXNJbmRpY2F0b3JQcm9wcyB7XG4gIGNsYXNzTmFtZT86IHN0cmluZ1xuICBzdGF0dXNUeXBlPzogRW50aXR5U3RhdHVzVHlwZVxuICB0aXRsZT86IHN0cmluZ1xufVxuXG4vKipcbiAqIEFuIGFuaW1hdGFibGUgaWNvbiByZXByZXNlbnRpbmcgc3RhdHVzXG4gKi9cbmV4cG9ydCBjb25zdCBTdGF0dXNJbmRpY2F0b3IgPSB3aXRoVGhlbWUoKHByb3BzOiBTdGF0dXNJbmRpY2F0b3JQcm9wcyAmIFRoZW1lUHJvcHMpID0+IHtcbiAgY29uc3QgeyB0aGVtZSwgY2xhc3NOYW1lLCB0aXRsZSwgc3RhdHVzVHlwZSB9ID0gcHJvcHNcbiAgY29uc3QgZ2V0U3R5bGUgPSAoKSA9PiBjc3NgXG4gICAgJi51aS11bml0LXN0YXR1cy1pbmRpY2F0b3Ige1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICYudWktdW5pdC1zdGF0dXMtaW5kaWNhdG9yX3N0YXR1cy10eXBlLWxvYWRpbmcge1xuICAgICAgICAmOmJlZm9yZSB7XG4gICAgICAgICAgQGtleWZyYW1lcyBsb2FkaW5nIHtcbiAgICAgICAgICAgIDAlIHt0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfTtcbiAgICAgICAgICAgIDEwMCUge3RyYW5zZm9ybTogcm90YXRlKDM2MGRlZyl9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50OiAnJztcbiAgICAgICAgICB3aWR0aDogMXJlbTtcbiAgICAgICAgICBoZWlnaHQ6IDFyZW07XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgJHt0aGVtZT8ucmVmLnBhbGV0dGU/Lm5ldXRyYWw/Lls1MDBdfTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkICR7dGhlbWU/LnN5cy5jb2xvcj8ucHJpbWFyeT8ubWFpbn07XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgICBhbmltYXRpb246IGxvYWRpbmcgMnMgaW5maW5pdGUgbGluZWFyO1xuICAgICAgICAgIG1hcmdpbi1yaWdodDogLjI1cmVtO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBgXG4gIHJldHVybiAoXG4gICAgc3RhdHVzVHlwZSAmJlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2NsYXNzTmFtZSA/PyAnJ30gdWktdW5pdC1zdGF0dXMtaW5kaWNhdG9yIHVpLXVuaXQtc3RhdHVzLWluZGljYXRvcl9zdGF0dXMtdHlwZS0ke3N0YXR1c1R5cGV9YH0gdGl0bGU9e3RpdGxlfSBjc3M9e2dldFN0eWxlKCl9IC8+XG4gIClcbn0pXG5cbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JNZXNzYWdlUHJvcHMge1xuICBlcnJvcjogc3RyaW5nIHwgbnVsbFxuICBjbGFzc05hbWU/OiBzdHJpbmdcbiAgb25EaXNtaXNzPzogKCkgPT4gdm9pZFxufVxuXG4vKipcbiAqIFNpbXBsZSBlcnJvciBtZXNzYWdlIGNvbXBvbmVudCBmb3IgZGlzcGxheWluZyB1c2VyLWZhY2luZyBlcnJvcnMuXG4gKiBVc2UgRGF0YVNvdXJjZVRpcCBmb3IgZGF0YSBzb3VyY2UtcmVsYXRlZCBlcnJvcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBFcnJvck1lc3NhZ2UgPSAocHJvcHM6IEVycm9yTWVzc2FnZVByb3BzKSA9PiB7XG4gIGNvbnN0IHsgZXJyb3IsIGNsYXNzTmFtZSA9ICcnLCBvbkRpc21pc3MgfSA9IHByb3BzXG4gIFxuICBpZiAoIWVycm9yKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBcbiAgY29uc3QgZXJyb3JTdHlsZSA9IGNzc2BcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgcGFkZGluZzogMC41cmVtO1xuICAgIG1hcmdpbjogMC41cmVtIDA7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc3lzLWNvbG9yLWVycm9yLWxpZ2h0KTtcbiAgICBjb2xvcjogdmFyKC0tc3lzLWNvbG9yLWVycm9yLWRhcmspO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICBmb250LXNpemU6IDAuODc1cmVtO1xuICAgIGdhcDogMC41cmVtO1xuICAgIFxuICAgIC5lcnJvci1pY29uIHtcbiAgICAgIGZsZXgtc2hyaW5rOiAwO1xuICAgIH1cbiAgICBcbiAgICAuZXJyb3ItdGV4dCB7XG4gICAgICBmbGV4OiAxO1xuICAgIH1cbiAgICBcbiAgICAuZXJyb3ItZGlzbWlzcyB7XG4gICAgICBmbGV4LXNocmluazogMDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIHBhZGRpbmc6IDAuMjVyZW07XG4gICAgICAmOmhvdmVyIHtcbiAgICAgICAgb3BhY2l0eTogMC43O1xuICAgICAgfVxuICAgIH1cbiAgYFxuICBcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YGVycm9yLW1lc3NhZ2UgJHtjbGFzc05hbWV9YH0gY3NzPXtlcnJvclN0eWxlfSByb2xlPVwiYWxlcnRcIj5cbiAgICAgIDxJY29uIGljb249e2ljb25FcnJvcn0gY2xhc3NOYW1lPVwiZXJyb3ItaWNvblwiIHNpemU9XCJzbVwiIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJlcnJvci10ZXh0XCI+e2Vycm9yfTwvc3Bhbj5cbiAgICAgIHtvbkRpc21pc3MgJiYgKFxuICAgICAgICA8QnV0dG9uIFxuICAgICAgICAgIHNpemU9XCJzbVwiIFxuICAgICAgICAgIHR5cGU9XCJ0ZXJ0aWFyeVwiIFxuICAgICAgICAgIGljb24gXG4gICAgICAgICAgb25DbGljaz17b25EaXNtaXNzfVxuICAgICAgICAgIGNsYXNzTmFtZT1cImVycm9yLWRpc21pc3NcIlxuICAgICAgICAgIGFyaWEtbGFiZWw9XCJEaXNtaXNzIGVycm9yXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxJY29uIGljb249e3JlcXVpcmUoJ2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL2VkaXRvci9jbG9zZS5zdmcnKS5kZWZhdWx0fSBzaXplPVwic21cIiAvPlxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICl9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuXG5cbiIsIi8qKiBAanN4IGpzeCAqL1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIGpzeCxcbiAgZ2V0QXBwU3RvcmUsXG4gIERhdGFTb3VyY2VDb21wb25lbnQsXG4gIHR5cGUgRGF0YVNvdXJjZSxcbiAgdHlwZSBVc2VEYXRhU291cmNlLFxuICBhcHBDb25maWdVdGlscyxcbiAgdHlwZSBJTURhdGFTb3VyY2VJbmZvLFxuICBEYXRhU291cmNlU3RhdHVzLFxuICB0eXBlIEltbXV0YWJsZU9iamVjdCxcbiAgaG9va3Ncbn0gZnJvbSAnamltdS1jb3JlJ1xuaW1wb3J0IHsgSWNvbiwgVG9vbHRpcCwgQnV0dG9uLCBkZWZhdWx0TWVzc2FnZXMgfSBmcm9tICdqaW11LXVpJ1xuaW1wb3J0IHsgRW50aXR5U3RhdHVzVHlwZSwgU3RhdHVzSW5kaWNhdG9yIH0gZnJvbSAnLi9jb21tb24tY29tcG9uZW50cydcbmltcG9ydCBpY29uV2FybmluZyBmcm9tICdqaW11LWljb25zL3N2Zy9vdXRsaW5lZC9zdWdnZXN0ZWQvd2FybmluZy5zdmcnXG5pbXBvcnQgaWNvbkVycm9yIGZyb20gJ2ppbXUtaWNvbnMvc3ZnL291dGxpbmVkL3N1Z2dlc3RlZC9lcnJvci5zdmcnXG5pbXBvcnQgeyB1c2VEYXRhU291cmNlRXhpc3RzIH0gZnJvbSAnLi91c2UtZHMtZXhpc3RzJ1xuXG5pbnRlcmZhY2UgQ29udGVudFByb3BzIHtcbiAgd2lkZ2V0SWQ6IHN0cmluZ1xuICB1c2VEYXRhU291cmNlOiBJbW11dGFibGVPYmplY3Q8VXNlRGF0YVNvdXJjZT5cbiAgb25TdGF0dXNDaGFuZ2U/OiAoZW5hYmxlZDogYm9vbGVhbikgPT4gdm9pZFxuICBvbkRhdGFTb3VyY2VDcmVhdGVkPzogKGRzOiBEYXRhU291cmNlKSA9PiB2b2lkXG4gIHNob3dNZXNzYWdlPzogYm9vbGVhblxufVxuXG4vKipcbiAqIFNob3cgaWNvbiBhbmQgbWVzc2FnZSBpZiB0aGUgZGF0YSBzb3VyY2UgZG9lc24ndCB3b3JrLlxuICogQHBhcmFtIHByb3BzXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gRGF0YVNvdXJjZVRpcCAocHJvcHM6IENvbnRlbnRQcm9wcykge1xuICBjb25zdCB7IHdpZGdldElkLCB1c2VEYXRhU291cmNlLCBvblN0YXR1c0NoYW5nZSwgb25EYXRhU291cmNlQ3JlYXRlZCwgc2hvd01lc3NhZ2UgPSBmYWxzZSB9ID0gcHJvcHNcbiAgY29uc3QgZ2V0STE4bk1lc3NhZ2UgPSBob29rcy51c2VUcmFuc2xhdGlvbihkZWZhdWx0TWVzc2FnZXMpXG4gIGNvbnN0IGRzRXhpc3RzOiBib29sZWFuID0gdXNlRGF0YVNvdXJjZUV4aXN0cyh7IHdpZGdldElkLCB1c2VEYXRhU291cmNlSWQ6IHVzZURhdGFTb3VyY2UuZGF0YVNvdXJjZUlkIH0pXG4gIGNvbnN0IFtkc1N0YXR1cywgc2V0RHNTdGF0dXNdID0gUmVhY3QudXNlU3RhdGU8J2Vycm9yJyB8ICd3YXJuaW5nJyB8ICdjcmVhdGluZyc+KG51bGwpXG4gIGNvbnN0IFtkYXRhU291cmNlLCBzZXREYXRhU291cmNlXSA9IFJlYWN0LnVzZVN0YXRlPERhdGFTb3VyY2U+KG51bGwpXG5cbiAgY29uc3QgaGFuZGxlRHNJbmZvQ2hhbmdlID0gUmVhY3QudXNlQ2FsbGJhY2soKGluZm86IElNRGF0YVNvdXJjZUluZm8pID0+IHtcbiAgICBpZiAoaW5mbykge1xuICAgICAgY29uc3QgeyBzdGF0dXMsIGluc3RhbmNlU3RhdHVzIH0gPSBpbmZvXG4gICAgICBpZiAoaW5zdGFuY2VTdGF0dXMgPT09IERhdGFTb3VyY2VTdGF0dXMuTm90Q3JlYXRlZCkge1xuICAgICAgICBzZXREc1N0YXR1cygnY3JlYXRpbmcnKVxuICAgICAgICBvblN0YXR1c0NoYW5nZT8uKGZhbHNlKVxuICAgICAgfSBlbHNlIGlmIChpbnN0YW5jZVN0YXR1cyA9PT0gRGF0YVNvdXJjZVN0YXR1cy5DcmVhdGVFcnJvciB8fCBzdGF0dXMgPT09IERhdGFTb3VyY2VTdGF0dXMuTG9hZEVycm9yKSB7XG4gICAgICAgIHNldERzU3RhdHVzKCdlcnJvcicpXG4gICAgICAgIG9uU3RhdHVzQ2hhbmdlPy4oZmFsc2UpXG4gICAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gRGF0YVNvdXJjZVN0YXR1cy5Ob3RSZWFkeSkge1xuICAgICAgICBzZXREc1N0YXR1cygnd2FybmluZycpXG4gICAgICAgIG9uU3RhdHVzQ2hhbmdlPy4oZmFsc2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXREc1N0YXR1cyhudWxsKVxuICAgICAgICBvblN0YXR1c0NoYW5nZT8uKHRydWUpXG4gICAgICB9XG4gICAgfVxuICB9LCBbb25TdGF0dXNDaGFuZ2VdKVxuXG4gIGNvbnN0IGhhbmRsZURzQ3JlYXRlZCA9IFJlYWN0LnVzZUNhbGxiYWNrKChkczogRGF0YVNvdXJjZSkgPT4ge1xuICAgIHNldERhdGFTb3VyY2UoZHMpXG4gICAgb25EYXRhU291cmNlQ3JlYXRlZD8uKGRzKVxuICB9LCBbb25EYXRhU291cmNlQ3JlYXRlZF0pXG5cbiAgY29uc3QgaGFuZGxlRHNDcmVhdGVGYWlsZWQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0RGF0YVNvdXJjZShudWxsKVxuICAgIHNldERzU3RhdHVzKCdlcnJvcicpXG4gICAgb25TdGF0dXNDaGFuZ2U/LihmYWxzZSlcbiAgfSwgW29uU3RhdHVzQ2hhbmdlXSlcblxuICBsZXQgc3RhdHVzSWNvblxuICBsZXQgc3RhdHVzTXNnXG4gIGxldCBjb2xvclxuICBpZiAoZHNTdGF0dXMgPT09ICdjcmVhdGluZycpIHtcbiAgICBzdGF0dXNJY29uID0gaWNvbkVycm9yXG4gICAgc3RhdHVzTXNnID0gZ2V0STE4bk1lc3NhZ2UoJ2xvYWRpbmcnKVxuICB9IGVsc2UgaWYgKCFkc0V4aXN0cyB8fCBkc1N0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgIHN0YXR1c0ljb24gPSBpY29uRXJyb3JcbiAgICBzdGF0dXNNc2cgPSBnZXRJMThuTWVzc2FnZSgnZGF0YVNvdXJjZUNyZWF0ZUVycm9yJylcbiAgICBjb2xvciA9ICd2YXIoLS1zeXMtY29sb3ItZXJyb3ItbWFpbiknXG4gIH0gZWxzZSBpZiAoZHNTdGF0dXMgPT09ICd3YXJuaW5nJykge1xuICAgIGxldCBsYWJlbCA9ICcnXG4gICAgY29uc3Qgb3JpZ2luRHMgPSBkYXRhU291cmNlPy5nZXRPcmlnaW5EYXRhU291cmNlcygpPy5bMF1cbiAgICBpZiAob3JpZ2luRHMpIHtcbiAgICAgIGxhYmVsID0gb3JpZ2luRHMuZ2V0TGFiZWwoKSB8fCBvcmlnaW5Ecy5nZXREYXRhU291cmNlSnNvbigpLnNvdXJjZUxhYmVsXG4gICAgfSBlbHNlIGlmIChkYXRhU291cmNlKSB7XG4gICAgICBsYWJlbCA9IGRhdGFTb3VyY2UuZ2V0TGFiZWwoKSB8fCBkYXRhU291cmNlLmdldERhdGFTb3VyY2VKc29uKCkubGFiZWxcbiAgICB9XG5cbiAgICBjb25zdCB3aWRnZXRJZCA9IGFwcENvbmZpZ1V0aWxzLmdldFdpZGdldElkQnlPdXRwdXREYXRhU291cmNlKHVzZURhdGFTb3VyY2UpXG4gICAgY29uc3QgYXBwU3RhdGUgPSB3aW5kb3c/LmppbXVDb25maWc/LmlzQnVpbGRlclxuICAgICAgPyBnZXRBcHBTdG9yZSgpLmdldFN0YXRlKCkuYXBwU3RhdGVJbkJ1aWxkZXJcbiAgICAgIDogZ2V0QXBwU3RvcmUoKS5nZXRTdGF0ZSgpXG4gICAgY29uc3Qgd2lkZ2V0TGFiZWwgPSBhcHBTdGF0ZS5hcHBDb25maWcud2lkZ2V0c1t3aWRnZXRJZF0/LmxhYmVsXG5cbiAgICBjb2xvciA9ICd2YXIoLS1zeXMtY29sb3Itd2FybmluZy1kYXJrKSdcbiAgICBzdGF0dXNJY29uID0gaWNvbldhcm5pbmdcbiAgICBzdGF0dXNNc2cgPSBnZXRJMThuTWVzc2FnZSgnb3V0cHV0RGF0YUlzTm90R2VuZXJhdGVkJywge1xuICAgICAgb3V0cHV0RHNMYWJlbDogbGFiZWwgPz8gJycsXG4gICAgICBzb3VyY2VXaWRnZXROYW1lOiB3aWRnZXRMYWJlbCA/PyAnJ1xuICAgIH0pXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICB7ZHNFeGlzdHMgJiYgKFxuICAgICAgICA8RGF0YVNvdXJjZUNvbXBvbmVudFxuICAgICAgICAgIHVzZURhdGFTb3VyY2U9e3VzZURhdGFTb3VyY2V9XG4gICAgICAgICAgb25EYXRhU291cmNlSW5mb0NoYW5nZT17aGFuZGxlRHNJbmZvQ2hhbmdlfVxuICAgICAgICAgIG9uRGF0YVNvdXJjZUNyZWF0ZWQ9e2hhbmRsZURzQ3JlYXRlZH1cbiAgICAgICAgICBvbkNyZWF0ZURhdGFTb3VyY2VGYWlsZWQ9e2hhbmRsZURzQ3JlYXRlRmFpbGVkfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtkc1N0YXR1cyA9PT0gJ2NyZWF0aW5nJyAmJiA8U3RhdHVzSW5kaWNhdG9yIHN0YXR1c1R5cGU9e0VudGl0eVN0YXR1c1R5cGUuTG9hZGluZ30gdGl0bGU9e3N0YXR1c01zZ30gLz59XG4gICAgICB7KCFkc0V4aXN0cyB8fCBkc1N0YXR1cyA9PT0gJ2Vycm9yJyB8fCBkc1N0YXR1cyA9PT0gJ3dhcm5pbmcnKSAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyJz5cbiAgICAgICAgICA8VG9vbHRpcCB0aXRsZT17c3RhdHVzTXNnfT5cbiAgICAgICAgICAgIDxCdXR0b24gc2l6ZT0nc20nIHR5cGU9J3RlcnRpYXJ5JyBpY29uPjxJY29uIGljb249e3N0YXR1c0ljb259IGNvbG9yPXtjb2xvcn0gLz48L0J1dHRvbj5cbiAgICAgICAgICA8L1Rvb2x0aXA+XG4gICAgICAgICAge3Nob3dNZXNzYWdlICYmIDxkaXYgY2xhc3NOYW1lPSdzdGF0dXMtbWVzc2FnZSc+e3N0YXR1c01zZ308L2Rpdj59XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICA8L1JlYWN0LkZyYWdtZW50PlxuICApXG59XG5cblxuXG4iLCIvKipcbiAqIENvbmZpZ3VyYWJsZSBkZWJ1ZyBsb2dnaW5nIHV0aWxpdHkgZm9yIEV4cGVyaWVuY2UgQnVpbGRlciB3aWRnZXRzXG4gKiBcbiAqIFVzYWdlOlxuICogLSBBZGQgP2RlYnVnPWFsbCB0byBVUkwgdG8gc2VlIGFsbCBkZWJ1ZyBsb2dzXG4gKiAtIEFkZCA/ZGVidWc9SEFTSCxGT1JNIHRvIHNlZSBzcGVjaWZpYyBmZWF0dXJlIGxvZ3NcbiAqIC0gQWRkID9kZWJ1Zz1mYWxzZSB0byBkaXNhYmxlIGFsbCBkZWJ1ZyBsb2dzXG4gKiBcbiAqIEZlYXR1cmVzIChRdWVyeVNpbXBsZSk6XG4gKiAtIEJVRzogS25vd24gYnVncy9pc3N1ZXMgKGFsd2F5cyBsb2dzLCBldmVuIGlmIGRlYnVnPWZhbHNlKSAtIFVzZSBmb3JtYXQ6IGJ1Z0lkLCBjYXRlZ29yeSwgZGVzY3JpcHRpb25cbiAqIC0gSEFTSDogSGFzaCBwYXJhbWV0ZXIgcHJvY2Vzc2luZ1xuICogLSBGT1JNOiBRdWVyeSBmb3JtIGludGVyYWN0aW9uc1xuICogLSBUQVNLOiBRdWVyeSB0YXNrIG1hbmFnZW1lbnRcbiAqIC0gWk9PTTogWm9vbSBiZWhhdmlvclxuICogLSBNQVAtRVhURU5UOiBNYXAgZXh0ZW50IGNoYW5nZXNcbiAqIC0gREFUQS1BQ1RJT046IERhdGEgYWN0aW9uIGV4ZWN1dGlvbiAoQWRkIHRvIE1hcCwgZXRjLilcbiAqIC0gR1JPVVA6IFF1ZXJ5IGdyb3VwaW5nIGFuZCBkcm9wZG93biBzZWxlY3Rpb25cbiAqIC0gU0VMRUNUSU9OOiBTZWxlY3Rpb24gZGV0ZWN0aW9uIGFuZCBpZGVudGlmeSBwb3B1cCB0cmFja2luZ1xuICogLSBXSURHRVQtU1RBVEU6IFdpZGdldCBsaWZlY3ljbGUgZXZlbnRzIChvcGVuL2Nsb3NlIGhhbmRzaGFrZSlcbiAqIC0gUkVTVE9SRTogU2VsZWN0aW9uIHJlc3RvcmF0aW9uIHdoZW4gd2lkZ2V0IG9wZW5zXG4gKiAtIFJFU1VMVFMtTU9ERTogUmVzdWx0cyBtYW5hZ2VtZW50IG1vZGUgc2VsZWN0aW9uIChDcmVhdGUgbmV3LCBBZGQgdG8sIFJlbW92ZSBmcm9tKVxuICogLSBFWFBBTkQtQ09MTEFQU0U6IEV4cGFuZC9jb2xsYXBzZSBzdGF0ZSBtYW5hZ2VtZW50IGZvciByZXN1bHQgaXRlbXNcbiAqIC0gR1JBUEhJQ1MtTEFZRVI6IEdyYXBoaWNzIGxheWVyIGhpZ2hsaWdodGluZyAoaW5kZXBlbmRlbnQgb2YgbGF5ZXIgdmlzaWJpbGl0eSlcbiAqIC0gRVZFTlRTOiBFdmVudCBsaXN0ZW5lciBzZXR1cC9jbGVhbnVwIGFuZCBjdXN0b20gZXZlbnQgZGlzcGF0Y2hpbmdcbiAqIFxuICogVGVtcG9yYXJ5IE1pZ3JhdGlvbiBGZWF0dXJlcyAod2lsbCBiZSByZW1vdmVkIGFmdGVyIG1pZ3JhdGlvbiBjb21wbGV0ZSk6XG4gKiAtIENIVU5LLTEtQ09NUEFSRTogQ2h1bmsgMSAoVVJMIFBhcmFtZXRlcikgY29tcGFyaXNvbiBsb2dzXG4gKiAtIENIVU5LLTEtTUlTTUFUQ0g6IENodW5rIDEgbWlzbWF0Y2ggd2FybmluZ3NcbiAqIC0gQ0hVTkstMi1DT01QQVJFOiBDaHVuayAyIChWaXNpYmlsaXR5KSBjb21wYXJpc29uIGxvZ3NcbiAqIC0gQ0hVTkstMi1NSVNNQVRDSDogQ2h1bmsgMiBtaXNtYXRjaCB3YXJuaW5nc1xuICogLSBDSFVOSy0zLUNPTVBBUkU6IENodW5rIDMgKFNlbGVjdGlvbi9SZXN0b3JhdGlvbikgY29tcGFyaXNvbiBsb2dzXG4gKiAtIENIVU5LLTMtREVDSVNJT046IENodW5rIDMgZGVjaXNpb24gcG9pbnQgbG9nc1xuICogLSBDSFVOSy0zLUZBTExCQUNLOiBDaHVuayAzIGZhbGxiYWNrIGxvZ2ljIGxvZ3NcbiAqIC0gQ0hVTkstNC1DT01QQVJFOiBDaHVuayA0IChHcmFwaGljcyBMYXllcikgY29tcGFyaXNvbiBsb2dzXG4gKiAtIENIVU5LLTUtQ09NUEFSRTogQ2h1bmsgNSAoQWNjdW11bGF0ZWQgUmVjb3JkcykgY29tcGFyaXNvbiBsb2dzXG4gKiAtIENIVU5LLTYtQ09NUEFSRTogQ2h1bmsgNiAoTWFwIFZpZXcpIGNvbXBhcmlzb24gbG9nc1xuICogLSBDSFVOSy02LU1JU01BVENIOiBDaHVuayA2IG1pc21hdGNoIHdhcm5pbmdzXG4gKiBcbiAqIEZlYXR1cmVzIChIZWxwZXJTaW1wbGUpOlxuICogLSBIQVNIOiBIYXNoIHBhcmFtZXRlciBtb25pdG9yaW5nIGFuZCB3aWRnZXQgb3BlbmluZ1xuICogLSBTRUxFQ1RJT046IFNlbGVjdGlvbiB0cmFja2luZyBmcm9tIFF1ZXJ5U2ltcGxlXG4gKiAtIFdJREdFVC1TVEFURTogV2lkZ2V0IHN0YXRlIGhhbmRzaGFrZSAob3Blbi9jbG9zZSBldmVudHMpXG4gKiAtIFJFU1RPUkU6IFNlbGVjdGlvbiByZXN0b3JhdGlvbiBhdHRlbXB0cyBhbmQgcmVzdWx0c1xuICovXG5cbnR5cGUgRGVidWdGZWF0dXJlID0gJ0JVRycgfCAnSEFTSCcgfCAnSEFTSC1FWEVDJyB8ICdGT1JNJyB8ICdUQVNLJyB8ICdaT09NJyB8ICdNQVAtRVhURU5UJyB8ICdEQVRBLUFDVElPTicgfCAnR1JPVVAnIHwgJ1NFTEVDVElPTicgfCAnV0lER0VULVNUQVRFJyB8ICdSRVNUT1JFJyB8ICdSRVNUT1JFLUNPTVBBUkUnIHwgJ1JFU1VMVFMtTU9ERScgfCAnRVhQQU5ELUNPTExBUFNFJyB8ICdHUkFQSElDUy1MQVlFUicgfCAnRVZFTlRTJyB8ICdDSFVOSy0xLUNPTVBBUkUnIHwgJ0NIVU5LLTEtTUlTTUFUQ0gnIHwgJ0NIVU5LLTItQ09NUEFSRScgfCAnQ0hVTkstMi1NSVNNQVRDSCcgfCAnQ0hVTkstMy1DT01QQVJFJyB8ICdDSFVOSy0zLURFQ0lTSU9OJyB8ICdDSFVOSy0zLUZBTExCQUNLJyB8ICdDSFVOSy00LUNPTVBBUkUnIHwgJ0NIVU5LLTUtQ09NUEFSRScgfCAnQ0hVTkstNi1DT01QQVJFJyB8ICdDSFVOSy02LU1JU01BVENIJyB8ICdhbGwnIHwgJ2ZhbHNlJ1xuXG5pbnRlcmZhY2UgRGVidWdMb2dnZXJPcHRpb25zIHtcbiAgd2lkZ2V0TmFtZTogc3RyaW5nXG4gIGZlYXR1cmVzOiBEZWJ1Z0ZlYXR1cmVbXVxufVxuXG5jbGFzcyBEZWJ1Z0xvZ2dlciB7XG4gIHByaXZhdGUgZW5hYmxlZEZlYXR1cmVzOiBTZXQ8RGVidWdGZWF0dXJlPiA9IG5ldyBTZXQoKVxuICBwcml2YXRlIGluaXRpYWxpemVkID0gZmFsc2VcbiAgcHJpdmF0ZSB3aWRnZXROYW1lOiBzdHJpbmdcbiAgcHJpdmF0ZSBmZWF0dXJlczogRGVidWdGZWF0dXJlW11cblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBEZWJ1Z0xvZ2dlck9wdGlvbnMpIHtcbiAgICB0aGlzLndpZGdldE5hbWUgPSBvcHRpb25zLndpZGdldE5hbWVcbiAgICB0aGlzLmZlYXR1cmVzID0gb3B0aW9ucy5mZWF0dXJlc1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSByZXR1cm5cblxuICAgIC8vIENoZWNrIFVSTCBwYXJhbWV0ZXJzIChib3RoIGN1cnJlbnQgd2luZG93IGFuZCBwYXJlbnQgZm9yIGlmcmFtZXMpXG4gICAgbGV0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaClcbiAgICBsZXQgZGVidWdWYWx1ZSA9IHVybFBhcmFtcy5nZXQoJ2RlYnVnJylcblxuICAgIC8vIElmIG5vdCBmb3VuZCBpbiBjdXJyZW50IHdpbmRvdywgY2hlY2sgcGFyZW50IChuZWVkZWQgZm9yIEV4QiBpZnJhbWVzKVxuICAgIGlmIChkZWJ1Z1ZhbHVlID09PSBudWxsICYmIHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cucGFyZW50LmxvY2F0aW9uLnNlYXJjaClcbiAgICAgICAgZGVidWdWYWx1ZSA9IHVybFBhcmFtcy5nZXQoJ2RlYnVnJylcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gQ3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uIG1pZ2h0IHByZXZlbnQgYWNjZXNzIHRvIHBhcmVudCBsb2NhdGlvblxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkZWJ1Z1ZhbHVlID09PSAnZmFsc2UnKSB7XG4gICAgICAvLyBFeHBsaWNpdGx5IGRpc2FibGVkXG4gICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGRlYnVnVmFsdWUgPT09ICdhbGwnKSB7XG4gICAgICAvLyBFbmFibGUgYWxsIGZlYXR1cmVzIG9ubHkgaWYgZXhwbGljaXRseSBzZXQgdG8gJ2FsbCdcbiAgICAgIHRoaXMuZmVhdHVyZXMuZm9yRWFjaChmZWF0dXJlID0+IHtcbiAgICAgICAgaWYgKGZlYXR1cmUgIT09ICdhbGwnICYmIGZlYXR1cmUgIT09ICdmYWxzZScpIHtcbiAgICAgICAgICB0aGlzLmVuYWJsZWRGZWF0dXJlcy5hZGQoZmVhdHVyZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGNvbnNvbGUubG9nKGBbJHt0aGlzLndpZGdldE5hbWV9LURFQlVHXSBFbmFibGVkIEFMTCBmZWF0dXJlczpgLCBBcnJheS5mcm9tKHRoaXMuZW5hYmxlZEZlYXR1cmVzKSlcbiAgICB9IGVsc2UgaWYgKGRlYnVnVmFsdWUgIT09IG51bGwpIHtcbiAgICAgIC8vIFBhcnNlIGNvbW1hLXNlcGFyYXRlZCBmZWF0dXJlIGxpc3RcbiAgICAgIGNvbnN0IHJlcXVlc3RlZEZlYXR1cmVzID0gZGVidWdWYWx1ZS5zcGxpdCgnLCcpLm1hcChmID0+IGYudHJpbSgpLnRvVXBwZXJDYXNlKCkgYXMgRGVidWdGZWF0dXJlKVxuICAgICAgcmVxdWVzdGVkRmVhdHVyZXMuZm9yRWFjaChmZWF0dXJlID0+IHtcbiAgICAgICAgaWYgKGZlYXR1cmUudG9VcHBlckNhc2UoKSA9PT0gJ0FMTCcpIHtcbiAgICAgICAgICAvLyBFbmFibGUgYWxsIGZlYXR1cmVzIGZvciB0aGlzIHdpZGdldFxuICAgICAgICAgIHRoaXMuZmVhdHVyZXMuZm9yRWFjaChmID0+IHtcbiAgICAgICAgICAgIGlmIChmICE9PSAnYWxsJyAmJiBmICE9PSAnZmFsc2UnKSB7XG4gICAgICAgICAgICAgIHRoaXMuZW5hYmxlZEZlYXR1cmVzLmFkZChmKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5mZWF0dXJlcy5pbmNsdWRlcyhmZWF0dXJlKSkge1xuICAgICAgICAgIHRoaXMuZW5hYmxlZEZlYXR1cmVzLmFkZChmZWF0dXJlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG4gIH1cblxuICBwcml2YXRlIGlzRW5hYmxlZChmZWF0dXJlOiBEZWJ1Z0ZlYXR1cmUpOiBib29sZWFuIHtcbiAgICB0aGlzLmluaXRpYWxpemUoKVxuICAgIFxuICAgIC8vIEJVRyBsZXZlbCBhbHdheXMgZW5hYmxlZCwgcmVnYXJkbGVzcyBvZiBkZWJ1ZyBzd2l0Y2hlcyAoZXZlbiBpZiBkZWJ1Zz1mYWxzZSlcbiAgICBpZiAoZmVhdHVyZSA9PT0gJ0JVRycpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIFxuICAgIGlmICh0aGlzLmVuYWJsZWRGZWF0dXJlcy5oYXMoJ2FsbCcpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdGhpcy5lbmFibGVkRmVhdHVyZXMuaGFzKGZlYXR1cmUpXG4gIH1cblxuICBsb2coZmVhdHVyZTogRGVidWdGZWF0dXJlLCBkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBCVUcgbGV2ZWwgYWx3YXlzIGxvZ3MsIGV2ZW4gaWYgZGVidWc9ZmFsc2VcbiAgICBpZiAoZmVhdHVyZSA9PT0gJ0JVRycpIHtcbiAgICAgIGNvbnN0IGxvZ0RhdGEgPSB7XG4gICAgICAgIGZlYXR1cmU6ICdCVUcnLFxuICAgICAgICBidWdJZDogZGF0YS5idWdJZCB8fCAnVU5LTk9XTicsXG4gICAgICAgIGNhdGVnb3J5OiBkYXRhLmNhdGVnb3J5IHx8ICdHRU5FUkFMJyxcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIC4uLmRhdGFcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVXNlIGNvbnNvbGUud2FybiB3aXRoIGVtb2ppIGZvcm1hdCB0byBtYWtlIGJ1Z3Mgc3RhbmQgb3V0XG4gICAgICBjb25zb2xlLndhcm4oYFske3RoaXMud2lkZ2V0TmFtZS50b1VwcGVyQ2FzZSgpfSDimqDvuI8gQlVHXWAsIEpTT04uc3RyaW5naWZ5KGxvZ0RhdGEsIG51bGwsIDIpKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIFxuICAgIC8vIFJlZ3VsYXIgZmVhdHVyZSBsb2dnaW5nIChleGlzdGluZyBiZWhhdmlvcilcbiAgICBpZiAoIXRoaXMuaXNFbmFibGVkKGZlYXR1cmUpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBsb2dEYXRhID0ge1xuICAgICAgZmVhdHVyZSxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgLi4uZGF0YVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBbJHt0aGlzLndpZGdldE5hbWUudG9VcHBlckNhc2UoKX0tJHtmZWF0dXJlfV1gLCBKU09OLnN0cmluZ2lmeShsb2dEYXRhLCBudWxsLCAyKSlcbiAgfVxuXG4gIGdldENvbmZpZygpOiB7IGVuYWJsZWRGZWF0dXJlczogc3RyaW5nW10sIGRlYnVnVmFsdWU6IHN0cmluZyB8IG51bGwgfSB7XG4gICAgdGhpcy5pbml0aWFsaXplKClcbiAgICBcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpXG4gICAgY29uc3QgZGVidWdWYWx1ZSA9IHVybFBhcmFtcy5nZXQoJ2RlYnVnJylcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgZW5hYmxlZEZlYXR1cmVzOiBBcnJheS5mcm9tKHRoaXMuZW5hYmxlZEZlYXR1cmVzKSxcbiAgICAgIGRlYnVnVmFsdWVcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVidWcgbG9nZ2VyIGluc3RhbmNlIGZvciBRdWVyeVNpbXBsZSB3aWRnZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVF1ZXJ5U2ltcGxlRGVidWdMb2dnZXIoKSB7XG4gIHJldHVybiBuZXcgRGVidWdMb2dnZXIoe1xuICAgIHdpZGdldE5hbWU6ICdRVUVSWVNJTVBMRScsXG4gICAgZmVhdHVyZXM6IFtcbiAgICAgICdIQVNIJywgJ0hBU0gtRVhFQycsICdIQVNILUZJUlNULUxPQUQnLCAnRk9STScsICdUQVNLJywgJ1pPT00nLCAnTUFQLUVYVEVOVCcsICdEQVRBLUFDVElPTicsICdHUk9VUCcsIFxuICAgICAgJ1NFTEVDVElPTicsICdXSURHRVQtU1RBVEUnLCAnUkVTVE9SRScsICdSRVNVTFRTLU1PREUnLCAnRVhQQU5ELUNPTExBUFNFJywgJ0dSQVBISUNTLUxBWUVSJywgJ0VWRU5UUycsXG4gICAgICAvLyBUZW1wb3JhcnkgbWlncmF0aW9uIGZlYXR1cmVzICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgbWlncmF0aW9uIGNvbXBsZXRlKVxuICAgICAgJ0NIVU5LLTEtQ09NUEFSRScsICdDSFVOSy0xLU1JU01BVENIJywgJ0NIVU5LLTItQ09NUEFSRScsICdDSFVOSy0yLU1JU01BVENIJywgJ0NIVU5LLTMtQ09NUEFSRScsICdDSFVOSy0zLURFQ0lTSU9OJywgJ0NIVU5LLTMtRkFMTEJBQ0snLFxuICAgICAgJ0NIVU5LLTQtQ09NUEFSRScsICdDSFVOSy01LUNPTVBBUkUnLCAnQ0hVTkstNi1DT01QQVJFJywgJ0NIVU5LLTYtTUlTTUFUQ0gnXG4gICAgXVxuICB9KVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJ1ZyBsb2dnZXIgaW5zdGFuY2UgZm9yIEhlbHBlclNpbXBsZSB3aWRnZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhlbHBlclNpbXBsZURlYnVnTG9nZ2VyKCkge1xuICByZXR1cm4gbmV3IERlYnVnTG9nZ2VyKHtcbiAgICB3aWRnZXROYW1lOiAnSEVMUEVSU0lNUExFJyxcbiAgICBmZWF0dXJlczogWydIQVNIJywgJ0hBU0gtRVhFQycsICdTRUxFQ1RJT04nLCAnV0lER0VULVNUQVRFJywgJ1JFU1RPUkUnXVxuICB9KVxufVxuXG4iLCJpbXBvcnQge1xuICBSZWFjdFJlZHV4LFxuICB0eXBlIElNU3RhdGUsXG4gIHR5cGUgSU1BcHBDb25maWdcbn0gZnJvbSAnamltdS1jb3JlJ1xuaW50ZXJmYWNlIFByb3BzIHtcbiAgd2lkZ2V0SWQ6IHN0cmluZ1xuICB1c2VEYXRhU291cmNlSWQ6IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGF0YVNvdXJjZUV4aXN0cyAocHJvcHM6IFByb3BzKSB7XG4gIGNvbnN0IHsgd2lkZ2V0SWQsIHVzZURhdGFTb3VyY2VJZCB9ID0gcHJvcHNcblxuICBjb25zdCBleGlzdHM6IGJvb2xlYW4gPSBSZWFjdFJlZHV4LnVzZVNlbGVjdG9yKChzdGF0ZTogSU1TdGF0ZSkgPT4ge1xuICAgIGxldCBhcHBDb25maWc6IElNQXBwQ29uZmlnXG4gICAgaWYgKHdpbmRvdy5qaW11Q29uZmlnLmlzQnVpbGRlcikge1xuICAgICAgYXBwQ29uZmlnID0gc3RhdGUuYXBwU3RhdGVJbkJ1aWxkZXIuYXBwQ29uZmlnXG4gICAgfSBlbHNlIHtcbiAgICAgIGFwcENvbmZpZyA9IHN0YXRlLmFwcENvbmZpZ1xuICAgIH1cbiAgICBjb25zdCB1c2VEYXRhU291cmNlcyA9IGFwcENvbmZpZy53aWRnZXRzW3dpZGdldElkXS51c2VEYXRhU291cmNlcyA/PyBbXVxuICAgIHJldHVybiB1c2VEYXRhU291cmNlcy5zb21lKHVzZURzID0+IHVzZURzLmRhdGFTb3VyY2VJZCA9PT0gdXNlRGF0YVNvdXJjZUlkKVxuICB9KVxuXG4gIHJldHVybiBleGlzdHNcbn1cblxuXG5cbiIsImltcG9ydCB0eXBlIHsgSVBvcHVwSW5mbyB9IGZyb20gJ0Blc3JpL2FyY2dpcy1yZXN0LWZlYXR1cmUtc2VydmljZSdcbmltcG9ydCB0eXBlIHsgSW50bFNoYXBlLCBEYXRhU291cmNlIH0gZnJvbSAnamltdS1jb3JlJ1xuXG4vKipcbiAqIFRvZ2dsZSBpdGVtcyBpbiBhbiBhcnJheVxuICovXG5leHBvcnQgY29uc3QgdG9nZ2xlSXRlbUluQXJyYXkgPSAoaXRlbSwgaXRlbXMgPSBbXSkgPT4gaXRlbXMuaW5jbHVkZXMoaXRlbSkgPyBpdGVtcy5maWx0ZXIoaSA9PiBpICE9PSBpdGVtKSA6IFsuLi5pdGVtcywgaXRlbV1cblxuZXhwb3J0IGludGVyZmFjZSBEYXRhU291cmNlTWFwIHtcbiAgW2RhdGFTb3VyY2VJZDogc3RyaW5nXTogRGF0YVNvdXJjZVxufVxuXG5leHBvcnQgdHlwZSBHZXRJMThuTWVzc2FnZVR5cGUgPSAoaWQ6IHN0cmluZywgb3B0aW9ucz86IHsgbWVzc2FnZXM/OiBhbnksIHZhbHVlcz86IGFueSB9KSA9PiBzdHJpbmdcbi8qKlxuICogQSBmYWN0b3J5IHRvIGNyZWF0ZSBhIGZ1bmN0aW9uIG9mIGdldHRpbmcgaTE4biBtZXNzYWdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHZXRJMThuTWVzc2FnZSAob3B0aW9uczogeyBpbnRsOiBJbnRsU2hhcGUsIGRlZmF1bHRNZXNzYWdlcz86IGFueSB9KSB7XG4gIGNvbnN0IHsgaW50bCwgZGVmYXVsdE1lc3NhZ2VzID0ge30gfSA9IG9wdGlvbnMgfHwge31cbiAgY29uc3QgZ2V0STE4bk1lc3NhZ2U6IEdldEkxOG5NZXNzYWdlVHlwZSA9IChpZCwgb3B0aW9ucykgPT4ge1xuICAgIGNvbnN0IHsgbWVzc2FnZXMsIHZhbHVlcyB9ID0gb3B0aW9ucyB8fCB7fVxuICAgIHJldHVybiBpbnRsLmZvcm1hdE1lc3NhZ2UoeyBpZCwgZGVmYXVsdE1lc3NhZ2U6IChtZXNzYWdlcyB8fCBkZWZhdWx0TWVzc2FnZXMpW2lkXSB9LCB2YWx1ZXMpXG4gIH1cbiAgcmV0dXJuIGdldEkxOG5NZXNzYWdlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWVsZEluZm9zSW5Qb3B1cENvbnRlbnQgKHBvcHVwSW5mbzogSVBvcHVwSW5mbykge1xuICBjb25zdCByZXN1bHQgPSBbXVxuICBpZiAocG9wdXBJbmZvPy5wb3B1cEVsZW1lbnRzPy5sZW5ndGggPiAwKSB7XG4gICAgcG9wdXBJbmZvLnBvcHVwRWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdmaWVsZHMnICYmIGVsZW1lbnQuZmllbGRJbmZvcz8ubGVuZ3RoID4gMCkge1xuICAgICAgICByZXN1bHQucHVzaCguLi5lbGVtZW50LmZpZWxkSW5mb3MpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfX2Vtb3Rpb25fcmVhY3RfanN4X3J1bnRpbWVfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfdGhlbWVfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV91aV9fOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIi8qKlxyXG4gKiBXZWJwYWNrIHdpbGwgcmVwbGFjZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB3aXRoIF9fd2VicGFja19yZXF1aXJlX18ucCB0byBzZXQgdGhlIHB1YmxpYyBwYXRoIGR5bmFtaWNhbGx5LlxyXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBzZXQgdGhlIHB1YmxpY1BhdGggaW4gd2VicGFjayBjb25maWcgaXM6IHdlIGNoYW5nZSB0aGUgcHVibGljUGF0aCB3aGVuIGRvd25sb2FkLlxyXG4gKiAqL1xyXG5fX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHdpbmRvdy5qaW11Q29uZmlnLmJhc2VVcmxcclxuIiwiLyoqXG4gKiBTaGFyZWQgY29tbW9uIHV0aWxpdGllcyBhbmQgY29tcG9uZW50cyBmb3IgRXhwZXJpZW5jZSBCdWlsZGVyIHdpZGdldHNcbiAqIFxuICogVGhpcyBtb2R1bGUgZXhwb3J0cyBjb21tb24gZnVuY3Rpb25hbGl0eSB0aGF0IGNhbiBiZSBzaGFyZWQgYmV0d2VlblxuICogcXVlcnktc2ltcGxlLCBoZWxwZXItc2ltcGxlLCBhbmQgb3RoZXIgY3VzdG9tIHdpZGdldHMuXG4gKiBcbiAqIFRoaXMgaXMgdGhlIGVudHJ5IHBvaW50IGZvciAnd2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb24nXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9jb21tb24vY29tbW9uLWNvbXBvbmVudHMnXG5leHBvcnQgKiBmcm9tICcuL2NvbW1vbi91dGlscydcbmV4cG9ydCAqIGZyb20gJy4vY29tbW9uL3VzZS1kcy1leGlzdHMnXG5leHBvcnQgKiBmcm9tICcuL2NvbW1vbi9kYXRhLXNvdXJjZS10aXAnXG5leHBvcnQgKiBmcm9tICcuL2NvbW1vbi9kZWJ1Zy1sb2dnZXInXG5cblxuXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=