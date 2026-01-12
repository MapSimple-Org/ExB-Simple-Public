System.register(["jimu-core/emotion","jimu-core","widgets/shared-code/common"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	var __WEBPACK_EXTERNAL_MODULE_widgets_shared_code_common__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_widgets_shared_code_common__, "__esModule", { value: true });
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
					__WEBPACK_EXTERNAL_MODULE_widgets_shared_code_common__[key] = module[key];
				});
			}
		],
		execute: function() {
			__WEBPACK_DYNAMIC_EXPORT__(
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./your-extensions/widgets/helper-simple/src/version-manager.ts":
/*!**********************************************************************!*\
  !*** ./your-extensions/widgets/helper-simple/src/version-manager.ts ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   versionManager: () => (/* binding */ versionManager)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");

class VersionManager extends jimu_core__WEBPACK_IMPORTED_MODULE_0__.BaseVersionManager {
    constructor() {
        super(...arguments);
        this.versions = [{
                version: '1.0.0',
                description: 'The first version.',
                upgrader: (oldConfig) => {
                    return oldConfig;
                }
            }];
    }
}
const versionManager = new VersionManager();


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

/***/ "widgets/shared-code/common":
/*!*********************************************!*\
  !*** external "widgets/shared-code/common" ***!
  \*********************************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_widgets_shared_code_common__;

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
/*!**********************************************************************!*\
  !*** ./your-extensions/widgets/helper-simple/src/runtime/widget.tsx ***!
  \**********************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/react/jsx-runtime */ "@emotion/react/jsx-runtime");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var _version_manager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../version-manager */ "./your-extensions/widgets/helper-simple/src/version-manager.ts");
/* harmony import */ var widgets_shared_code_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! widgets/shared-code/common */ "widgets/shared-code/common");

/** @jsx jsx */



const debugLogger = (0,widgets_shared_code_common__WEBPACK_IMPORTED_MODULE_3__.createHelperSimpleDebugLogger)();
/**
 * Custom event name for notifying managed widgets to process hash parameters.
 * This event is dispatched after a widget is opened in a controller.
 */
const OPEN_WIDGET_EVENT = 'helpersimple-open-widget';
/**
 * Custom event name for QuerySimple to notify HelperSimple of selection changes.
 */
const QUERYSIMPLE_SELECTION_EVENT = 'querysimple-selection-changed';
/**
 * Custom event name for QuerySimple to notify HelperSimple of widget open/close state.
 */
const QUERYSIMPLE_WIDGET_STATE_EVENT = 'querysimple-widget-state-changed';
/**
 * Custom event name for QuerySimple to notify HelperSimple that a hash-triggered query has completed execution.
 * This allows HelperSimple to track which hash parameters have been executed to prevent re-execution.
 */
const QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT = 'querysimple-hash-query-executed';
/**
 * Detects if an identify popup is currently visible in the DOM.
 * Uses verified selectors based on Experience Builder's identify popup structure.
 *
 * @returns true if identify popup is detected and visible, false otherwise
 */
function isIdentifyPopupOpen() {
    // Primary selector: .esri-popup with role="dialog"
    const popup = document.querySelector('.esri-popup[role="dialog"]');
    if (!popup) {
        return false;
    }
    // Verify it's visible (not hidden)
    const ariaHidden = popup.getAttribute('aria-hidden');
    if (ariaHidden === 'true') {
        return false;
    }
    // Additional check: verify computed style shows it's visible
    const style = window.getComputedStyle(popup);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }
    // Verify it contains esri-features (identify popup structure)
    const hasFeatures = popup.querySelector('.esri-features');
    if (!hasFeatures) {
        return false;
    }
    return true;
}
/**
 * HelperSimple Widget
 *
 * A helper widget that monitors URL hash parameters and automatically opens
 * managed widgets in controllers when matching shortIds are detected.
 *
 * This widget is always mounted but invisible, allowing it to listen for hash
 * changes even when other widgets are closed in controllers.
 *
 * @see https://developers.arcgis.com/experience-builder/sample-code/widgets/control-the-widget-state/
 */
class Widget extends jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.PureComponent {
    constructor() {
        super(...arguments);
        // Selection tracking for logging/debugging purposes (not used for restoration)
        this.querySimpleSelection = null;
        this.previousHashEntry = null;
        this.querySimpleWidgetIsOpen = false;
        this.previousWidgetState = null;
        // Track last executed hash parameter to prevent re-execution when switching queries
        // Format: "shortId=value" (e.g., "pin=2223059013")
        this.lastExecutedHash = null;
        // Identify popup detection for logging (no restoration)
        this.identifyPopupObserver = null;
        this.identifyPopupWasOpen = false;
        /**
         * Extracts all shortIds from the managed widget's query items.
         *
         * @param widgetId - The ID of the widget to extract shortIds from
         * @returns Array of shortId strings found in the widget's query items
         */
        this.getWidgetShortIds = (widgetId) => {
            var _a, _b, _c, _d;
            const state = (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.getAppStore)().getState();
            const appConfig = ((_a = window.jimuConfig) === null || _a === void 0 ? void 0 : _a.isBuilder)
                ? (_b = state.appStateInBuilder) === null || _b === void 0 ? void 0 : _b.appConfig
                : state.appConfig;
            if (!((_c = appConfig === null || appConfig === void 0 ? void 0 : appConfig.widgets) === null || _c === void 0 ? void 0 : _c[widgetId])) {
                return [];
            }
            if (!((_d = appConfig.widgets[widgetId].config) === null || _d === void 0 ? void 0 : _d.queryItems)) {
                return [];
            }
            const queryItems = appConfig.widgets[widgetId].config.queryItems;
            const shortIds = [];
            queryItems.forEach((item) => {
                if (item.shortId && item.shortId.trim() !== '') {
                    shortIds.push(item.shortId);
                }
            });
            return shortIds;
        };
        /**
         * Loads the widget class prior to executing the open action.
         * This is required by the Experience Builder API before opening widgets.
         *
         * @param widgetId - The ID of the widget to load
         * @returns Promise that resolves with the widget class component
         *
         * @see https://developers.arcgis.com/experience-builder/sample-code/widgets/control-the-widget-state/
         */
        this.loadWidgetClass = (widgetId) => {
            var _a, _b;
            if (!widgetId) {
                return Promise.resolve(null);
            }
            const isClassLoaded = (_b = (_a = (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.getAppStore)().getState().widgetsRuntimeInfo) === null || _a === void 0 ? void 0 : _a[widgetId]) === null || _b === void 0 ? void 0 : _b.isClassLoaded;
            if (!isClassLoaded) {
                return jimu_core__WEBPACK_IMPORTED_MODULE_1__.WidgetManager.getInstance().loadWidgetClass(widgetId);
            }
            else {
                return Promise.resolve(jimu_core__WEBPACK_IMPORTED_MODULE_1__.WidgetManager.getInstance().getWidgetClass(widgetId));
            }
        };
        /**
         * Opens a widget in a controller using the Experience Builder API.
         *
         * This method:
         * 1. Loads the widget class if not already loaded
         * 2. Dispatches the openWidget action via Redux
         * 3. Notifies the widget to process hash parameters after opening
         *
         * @param widgetId - The ID of the widget to open
         *
         * @see https://developers.arcgis.com/experience-builder/sample-code/widgets/control-the-widget-state/
         */
        this.openWidget = (widgetId) => {
            const openAction = jimu_core__WEBPACK_IMPORTED_MODULE_1__.appActions.openWidget(widgetId);
            debugLogger.log('HASH-EXEC', {
                event: 'helpersimple-openwidget-starting',
                widgetId,
                timestamp: Date.now()
            });
            this.loadWidgetClass(widgetId)
                .then(() => {
                (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.getAppStore)().dispatch(openAction);
                debugLogger.log('HASH-EXEC', {
                    event: 'helpersimple-openwidget-action-dispatched',
                    widgetId,
                    timestamp: Date.now()
                });
            })
                .then(() => {
                // Give the widget a moment to mount, then notify it to process hash parameters
                setTimeout(() => {
                    debugLogger.log('HASH-EXEC', {
                        event: 'helpersimple-openwidget-dispatching-event',
                        widgetId,
                        timestamp: Date.now()
                    });
                    const event = new CustomEvent(OPEN_WIDGET_EVENT, {
                        detail: { widgetId },
                        bubbles: true,
                        cancelable: true
                    });
                    window.dispatchEvent(event);
                    debugLogger.log('HASH-EXEC', {
                        event: 'helpersimple-openwidget-event-dispatched',
                        widgetId,
                        timestamp: Date.now()
                    });
                }, 500);
            })
                .catch((error) => {
                debugLogger.log('HASH-EXEC', {
                    event: 'helpersimple-openwidget-error',
                    widgetId,
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: Date.now()
                });
                // Silently handle errors - widget may already be open or not in a controller
                // eslint-disable-next-line no-console
                if (true) {
                    console.error('[HelperSimple] Error opening widget:', error);
                }
            });
        };
        /**
         * Checks URL hash and query string parameters for shortIds that match the managed widget.
         *
         * If a match is found, opens the widget using the Experience Builder API.
         * Hash format: #shortId=value (e.g., #pin=2223059013)
         * Query format: ?shortId=value (e.g., ?pin=2223059013)
         *
         * Special parameter: #qsopen=true or ?qsopen=true
         * Forces widget to open without requiring a query parameter match.
         */
        this.checkUrlParameters = () => {
            const { config } = this.props;
            if (!config.managedWidgetId) {
                return;
            }
            // Parse URL hash fragment and query string
            const hash = window.location.hash.substring(1);
            const query = window.location.search.substring(1);
            debugLogger.log('HASH-EXEC', {
                event: 'helpersimple-checkurlparameters-called',
                widgetId: config.managedWidgetId,
                currentUrlHash: hash,
                currentUrlQuery: query,
                hasHash: !!hash,
                hasQuery: !!query,
                timestamp: Date.now()
            });
            if (!hash && !query) {
                return;
            }
            const hashParams = new URLSearchParams(hash);
            const queryParams = new URLSearchParams(query);
            // Check for special qsopen parameter (forces widget to open)
            if (hashParams.get('qsopen') === 'true' || queryParams.get('qsopen') === 'true') {
                debugLogger.log('HASH-EXEC', {
                    event: 'helpersimple-checkurl-opening-widget-qsopen',
                    widgetId: config.managedWidgetId,
                    timestamp: Date.now()
                });
                this.openWidget(config.managedWidgetId);
                return;
            }
            // Get all shortIds from the managed widget
            const shortIds = this.getWidgetShortIds(config.managedWidgetId);
            if (shortIds.length === 0) {
                return;
            }
            // Check if any shortId matches in either hash or query string
            shortIds.forEach(shortId => {
                const hashValue = hashParams.get(shortId) || queryParams.get(shortId);
                if (hashValue) {
                    const currentHash = `${shortId}=${hashValue}`;
                    debugLogger.log('HASH-EXEC', {
                        event: 'helpersimple-checkurl-shortid-match-detected',
                        widgetId: config.managedWidgetId,
                        shortId,
                        hashValue,
                        currentHash,
                        lastExecutedHash: this.lastExecutedHash,
                        willOpenWidget: currentHash !== this.lastExecutedHash,
                        timestamp: Date.now()
                    });
                    // Only open widget if hash has changed (not already executed)
                    if (currentHash !== this.lastExecutedHash) {
                        debugLogger.log('HASH-EXEC', {
                            event: 'helpersimple-checkurl-opening-widget-shortid-match',
                            widgetId: config.managedWidgetId,
                            shortId,
                            hashValue,
                            timestamp: Date.now()
                        });
                        // Open the widget using the proper API
                        this.openWidget(config.managedWidgetId);
                    }
                    else {
                        debugLogger.log('HASH-EXEC', {
                            event: 'helpersimple-checkurl-skipping-already-executed-hash',
                            widgetId: config.managedWidgetId,
                            shortId,
                            hashValue,
                            lastExecutedHash: this.lastExecutedHash,
                            timestamp: Date.now()
                        });
                    }
                }
            });
        };
        /**
         * Handles hash change events from the browser.
         * Re-checks parameters when the URL hash changes.
         */
        this.handleHashChange = () => {
            const hash = window.location.hash.substring(1);
            const query = window.location.search.substring(1);
            debugLogger.log('HASH-EXEC', {
                event: 'helpersimple-handlehashchange-fired',
                widgetId: this.props.config.managedWidgetId,
                currentUrlHash: hash,
                currentUrlQuery: query,
                lastExecutedHash: this.lastExecutedHash,
                timestamp: Date.now()
            });
            // Check parameters for widget opening
            this.checkUrlParameters();
            // Update hash entry tracking for logging/debugging
            const { config } = this.props;
            if (config.managedWidgetId) {
                this.previousHashEntry = this.parseHashForWidgetSelection(config.managedWidgetId);
            }
        };
        /**
         * Handles QuerySimple selection change events.
         * Stores the selection state and hash entry immediately (event-driven).
         */
        this.handleQuerySimpleSelectionChange = (event) => {
            const { config } = this.props;
            // Only track if this is our managed widget
            if (event.detail.widgetId === config.managedWidgetId) {
                this.querySimpleSelection = {
                    recordIds: event.detail.recordIds,
                    dataSourceId: event.detail.dataSourceId
                };
                // Immediately check hash to get output DS ID (event-driven, no polling)
                const hashEntry = this.parseHashForWidgetSelection(config.managedWidgetId);
                if (hashEntry) {
                    this.previousHashEntry = hashEntry;
                }
                debugLogger.log('SELECTION', {
                    event: 'selection-tracked-from-querysimple',
                    widgetId: event.detail.widgetId,
                    recordCount: event.detail.recordIds.length,
                    dataSourceId: event.detail.dataSourceId,
                    hashEntry: this.previousHashEntry ? {
                        outputDsId: this.previousHashEntry.outputDsId,
                        recordCount: this.previousHashEntry.recordIds.length
                    } : null
                });
            }
        };
        /**
         * Handles QuerySimple widget state changes (open/close).
         */
        this.handleQuerySimpleWidgetStateChange = (event) => {
            const { config } = this.props;
            // Only track if this is our managed widget
            if (event.detail.widgetId === config.managedWidgetId) {
                const wasOpen = this.querySimpleWidgetIsOpen;
                const isNowOpen = event.detail.isOpen;
                this.querySimpleWidgetIsOpen = isNowOpen;
                debugLogger.log('WIDGET-STATE', {
                    event: 'querysimple-widget-state-changed',
                    widgetId: event.detail.widgetId,
                    isOpen: event.detail.isOpen,
                    wasOpen,
                    transition: wasOpen !== isNowOpen ? (isNowOpen ? 'closed-to-open' : 'open-to-closed') : 'no-change'
                });
                this.previousWidgetState = isNowOpen;
            }
        };
        /**
         * Handles QuerySimple hash query execution completion event.
         * Tracks the last executed hash parameter to prevent re-execution when switching queries.
         */
        this.handleHashQueryExecuted = (event) => {
            const { widgetId, shortId, value, hashParam } = event.detail || {};
            const { config } = this.props;
            // Only track if this is for our managed widget
            if (widgetId !== config.managedWidgetId) {
                debugLogger.log('HASH-EXEC', {
                    event: 'helpersimple-hash-query-executed-ignored-wrong-widget',
                    eventWidgetId: widgetId,
                    managedWidgetId: config.managedWidgetId,
                    timestamp: Date.now()
                });
                return;
            }
            debugLogger.log('HASH-EXEC', {
                event: 'helpersimple-hash-query-executed-received',
                widgetId,
                shortId,
                value,
                hashParam,
                previousLastExecutedHash: this.lastExecutedHash,
                timestamp: Date.now()
            });
            // Track the last executed hash parameter
            // Format: "shortId=value" (e.g., "pin=2223059013")
            this.lastExecutedHash = hashParam;
            debugLogger.log('HASH-EXEC', {
                event: 'helpersimple-last-executed-hash-updated',
                widgetId,
                lastExecutedHash: this.lastExecutedHash,
                timestamp: Date.now()
            });
        };
        /**
         * REMOVED: Polling-based selection tracking.
         * Now using event-driven approach via hashchange and QUERYSIMPLE_SELECTION_EVENT.
         */
        /**
         * Parses the `data_s` parameter from the URL hash and extracts widget output data source IDs.
         *
         * Hash format: #data_s=id:widget_12_output_28628683957324497:451204+451205+...,id:...
         * OR: #data_s=id:dataSource_1-KingCo_PropertyInfo_6386_5375-2~widget_15_output_4504440367870579:451317
         *
         * @param widgetId - The widget ID to match (e.g., "widget_12")
         * @returns Object with outputDsId and recordIds, or null if not found
         */
        this.parseHashForWidgetSelection = (widgetId) => {
            const hash = window.location.hash.substring(1);
            if (!hash) {
                return null;
            }
            const urlParams = new URLSearchParams(hash);
            const dataS = urlParams.get('data_s');
            if (!dataS) {
                return null;
            }
            // URL decode the data_s parameter
            const decodedDataS = decodeURIComponent(dataS);
            // Split by comma to get individual selections
            const selections = decodedDataS.split(',');
            // Pattern to match: widget_XX_output_* (where XX is the widget ID number)
            // Extract widget number from widgetId (e.g., "widget_12" -> "12")
            const widgetMatch = widgetId.match(/widget_(\d+)/);
            if (!widgetMatch) {
                return null;
            }
            const widgetNumber = widgetMatch[1];
            const widgetPattern = new RegExp(`widget_${widgetNumber}_output_\\d+`);
            for (const selection of selections) {
                // Format: id:WIDGET_OUTPUT_DS_ID:RECORD_IDS
                // OR: id:DATA_SOURCE_ID~WIDGET_OUTPUT_DS_ID:RECORD_IDS
                if (!selection.startsWith('id:')) {
                    continue;
                }
                const idPart = selection.substring(3); // Remove "id:"
                const colonIndex = idPart.lastIndexOf(':');
                if (colonIndex === -1) {
                    continue;
                }
                const dsIdPart = idPart.substring(0, colonIndex);
                const recordIdsPart = idPart.substring(colonIndex + 1);
                // Check if this matches our widget's output DS pattern
                // Handle both formats: widget_XX_output_* or dataSource_*~widget_XX_output_*
                // IMPORTANT: Check for compound format FIRST (contains ~)
                // Otherwise the regex will match the pattern within the compound string
                let outputDsId = null;
                if (dsIdPart.includes('~')) {
                    // Compound format: dataSource_*~widget_XX_output_*
                    const parts = dsIdPart.split('~');
                    debugLogger.log('HASH', {
                        event: 'parsing-compound-hash-format',
                        widgetId,
                        dsIdPart,
                        parts,
                        widgetPattern: widgetPattern.toString()
                    });
                    for (const part of parts) {
                        if (part.match(widgetPattern)) {
                            outputDsId = part;
                            debugLogger.log('HASH', {
                                event: 'found-matching-widget-output-ds-id-compound-format',
                                widgetId,
                                outputDsId,
                                part,
                                allParts: parts
                            });
                            break;
                        }
                    }
                    if (!outputDsId) {
                        debugLogger.log('HASH', {
                            event: 'no-matching-widget-output-ds-id-compound-format',
                            widgetId,
                            dsIdPart,
                            parts,
                            widgetPattern: widgetPattern.toString()
                        });
                    }
                }
                else if (dsIdPart.match(widgetPattern)) {
                    // Direct format: widget_XX_output_* (no ~ separator)
                    outputDsId = dsIdPart;
                    debugLogger.log('HASH', {
                        event: 'found-direct-format-widget-output-ds-id',
                        widgetId,
                        dsIdPart,
                        outputDsId
                    });
                }
                if (outputDsId) {
                    // Parse record IDs (separated by +)
                    const recordIds = recordIdsPart.split('+').filter(id => id.length > 0);
                    debugLogger.log('HASH', {
                        event: 'parsed-hash-entry-successfully',
                        widgetId,
                        outputDsId,
                        recordCount: recordIds.length,
                        recordIds: recordIds.slice(0, 5)
                    });
                    return { outputDsId, recordIds };
                }
                else {
                    debugLogger.log('HASH', {
                        event: 'no-widget-output-ds-id-found-in-hash',
                        widgetId,
                        dsIdPart,
                        widgetPattern: widgetPattern.toString()
                    });
                }
            }
            return null;
        };
        /**
         * Starts watching for identify popup opening/closing using MutationObserver.
         * Logs popup state changes for debugging (no restoration logic).
         */
        this.startIdentifyPopupWatching = () => {
            if (this.identifyPopupObserver) {
                return; // Already watching
            }
            const { config } = this.props;
            if (!config.managedWidgetId) {
                return;
            }
            // Watch for identify popup appearing/disappearing
            this.identifyPopupObserver = new MutationObserver(() => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const identifyPopupIsOpen = isIdentifyPopupOpen();
                const identifyPopupJustOpened = !this.identifyPopupWasOpen && identifyPopupIsOpen;
                const identifyPopupJustClosed = this.identifyPopupWasOpen && !identifyPopupIsOpen;
                if (identifyPopupJustOpened) {
                    // Get current selection state at moment popup opens
                    const originDSId = (_a = this.querySimpleSelection) === null || _a === void 0 ? void 0 : _a.dataSourceId;
                    let currentSelectionAtOpen = null;
                    if (originDSId) {
                        const dsManager = jimu_core__WEBPACK_IMPORTED_MODULE_1__.DataSourceManager.getInstance();
                        const originDS = dsManager.getDataSource(originDSId);
                        if (originDS) {
                            const selectedIds = originDS.getSelectedRecordIds() || [];
                            currentSelectionAtOpen = {
                                count: selectedIds.length,
                                ids: selectedIds.slice(0, 5)
                            };
                        }
                    }
                    debugLogger.log('SELECTION', {
                        event: 'identify-popup-opened',
                        widgetId: config.managedWidgetId,
                        hasQuerySimpleSelection: !!this.querySimpleSelection,
                        ourTrackedRecordCount: ((_b = this.querySimpleSelection) === null || _b === void 0 ? void 0 : _b.recordIds.length) || 0,
                        ourTrackedRecordIds: ((_c = this.querySimpleSelection) === null || _c === void 0 ? void 0 : _c.recordIds.slice(0, 5)) || [],
                        hasPreviousHashEntry: !!this.previousHashEntry,
                        previousHashEntryOutputDsId: ((_d = this.previousHashEntry) === null || _d === void 0 ? void 0 : _d.outputDsId) || null,
                        currentSelectionAtOpen
                    });
                }
                if (identifyPopupJustClosed) {
                    // Get current selection state at moment popup closes
                    const originDSId = (_e = this.querySimpleSelection) === null || _e === void 0 ? void 0 : _e.dataSourceId;
                    let currentSelectionAtClose = null;
                    if (originDSId) {
                        const dsManager = jimu_core__WEBPACK_IMPORTED_MODULE_1__.DataSourceManager.getInstance();
                        const originDS = dsManager.getDataSource(originDSId);
                        if (originDS) {
                            const selectedIds = originDS.getSelectedRecordIds() || [];
                            currentSelectionAtClose = {
                                count: selectedIds.length,
                                ids: selectedIds.slice(0, 5)
                            };
                        }
                    }
                    debugLogger.log('SELECTION', {
                        event: 'identify-popup-closed',
                        widgetId: config.managedWidgetId,
                        hasQuerySimpleSelection: !!this.querySimpleSelection,
                        ourTrackedRecordCount: ((_f = this.querySimpleSelection) === null || _f === void 0 ? void 0 : _f.recordIds.length) || 0,
                        ourTrackedRecordIds: ((_g = this.querySimpleSelection) === null || _g === void 0 ? void 0 : _g.recordIds.slice(0, 5)) || [],
                        hasPreviousHashEntry: !!this.previousHashEntry,
                        previousHashEntryOutputDsId: ((_h = this.previousHashEntry) === null || _h === void 0 ? void 0 : _h.outputDsId) || null,
                        currentSelectionAtClose
                    });
                }
                this.identifyPopupWasOpen = identifyPopupIsOpen;
            });
            // Observe the document body for changes to identify popup
            this.identifyPopupObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['aria-hidden', 'style']
            });
            // Initial check
            this.identifyPopupWasOpen = isIdentifyPopupOpen();
            debugLogger.log('SELECTION', {
                event: 'identify-popup-watching-started',
                widgetId: config.managedWidgetId,
                initialPopupState: this.identifyPopupWasOpen
            });
        };
        /**
         * Stops watching for identify popup opening/closing.
         */
        this.stopIdentifyPopupWatching = () => {
            if (this.identifyPopupObserver) {
                this.identifyPopupObserver.disconnect();
                this.identifyPopupObserver = null;
            }
            this.identifyPopupWasOpen = false;
            const { config } = this.props;
            if (config.managedWidgetId) {
                debugLogger.log('SELECTION', {
                    event: 'identify-popup-watching-stopped',
                    widgetId: config.managedWidgetId
                });
            }
        };
    }
    componentDidMount() {
        // Listen for hash changes to detect when URL hash parameters are updated
        window.addEventListener('hashchange', this.handleHashChange);
        // Check hash on initial mount
        this.checkUrlParameters();
        // Listen for QuerySimple selection changes (for logging/debugging)
        window.addEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleQuerySimpleSelectionChange);
        // Listen for QuerySimple widget state changes (open/close)
        window.addEventListener(QUERYSIMPLE_WIDGET_STATE_EVENT, this.handleQuerySimpleWidgetStateChange);
        // Listen for QuerySimple hash query execution completion
        window.addEventListener(QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT, this.handleHashQueryExecuted);
        // Initialize hash entry tracking for logging/debugging
        if (this.props.config.managedWidgetId) {
            this.previousHashEntry = this.parseHashForWidgetSelection(this.props.config.managedWidgetId);
            // Start watching for identify popup (logging only, no restoration)
            this.startIdentifyPopupWatching();
        }
    }
    componentWillUnmount() {
        window.removeEventListener('hashchange', this.handleHashChange);
        window.removeEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleQuerySimpleSelectionChange);
        window.removeEventListener(QUERYSIMPLE_WIDGET_STATE_EVENT, this.handleQuerySimpleWidgetStateChange);
        window.removeEventListener(QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT, this.handleHashQueryExecuted);
        this.stopIdentifyPopupWatching();
    }
    componentDidUpdate(prevProps) {
        // Re-check parameters if managed widget configuration changed
        if (prevProps.config.managedWidgetId !== this.props.config.managedWidgetId) {
            this.checkUrlParameters();
        }
        // Re-initialize hash entry tracking and identify popup watching if config changed
        if (prevProps.config.managedWidgetId !== this.props.config.managedWidgetId) {
            this.stopIdentifyPopupWatching();
            if (this.props.config.managedWidgetId) {
                this.previousHashEntry = this.parseHashForWidgetSelection(this.props.config.managedWidgetId);
                this.startIdentifyPopupWatching();
            }
            else {
                this.previousHashEntry = null;
                this.querySimpleSelection = null;
            }
        }
    }
    render() {
        // Render nothing visible - this widget is always mounted but invisible
        return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { css: (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.css) `
          display: none;
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
        `, "aria-hidden": "true" }));
    }
}
Widget.versionManager = _version_manager__WEBPACK_IMPORTED_MODULE_2__.versionManager;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Widget);
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9oZWxwZXItc2ltcGxlL2Rpc3QvcnVudGltZS93aWRnZXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQThDO0FBRTlDLE1BQU0sY0FBZSxTQUFRLHlEQUFrQjtJQUEvQzs7UUFDRSxhQUFRLEdBQUcsQ0FBQztnQkFDVixPQUFPLEVBQUUsT0FBTztnQkFDaEIsV0FBVyxFQUFFLG9CQUFvQjtnQkFDakMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUU7b0JBQ3RCLE9BQU8sU0FBUztnQkFDbEIsQ0FBQzthQUNGLENBQUM7SUFDSixDQUFDO0NBQUE7QUFFTSxNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRTs7Ozs7Ozs7Ozs7O0FDWmxELHdFOzs7Ozs7Ozs7OztBQ0FBLHVEOzs7Ozs7Ozs7OztBQ0FBLHdFOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkEsMkI7Ozs7Ozs7Ozs7QUNBQTs7O0tBR0s7QUFDTCxxQkFBdUIsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSm5ELGVBQWU7QUFDd0s7QUFFcEk7QUFDdUI7QUFFMUUsTUFBTSxXQUFXLEdBQUcseUZBQTZCLEVBQUU7QUFFbkQ7OztHQUdHO0FBQ0gsTUFBTSxpQkFBaUIsR0FBRywwQkFBMEI7QUFFcEQ7O0dBRUc7QUFDSCxNQUFNLDJCQUEyQixHQUFHLCtCQUErQjtB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QUcsSUFBSSxxQkFBdUIsR0FBRyxHQUFHLEVBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9oZWxwZXItc2ltcGxlL3NyYy92ZXJzaW9uLW1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmUvZW1vdGlvblwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJ3aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vblwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWNvcmUvbGliL3NldC1wdWJsaWMtcGF0aC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvaGVscGVyLXNpbXBsZS9zcmMvcnVudGltZS93aWRnZXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhc2VWZXJzaW9uTWFuYWdlciB9IGZyb20gJ2ppbXUtY29yZSdcblxuY2xhc3MgVmVyc2lvbk1hbmFnZXIgZXh0ZW5kcyBCYXNlVmVyc2lvbk1hbmFnZXIge1xuICB2ZXJzaW9ucyA9IFt7XG4gICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBmaXJzdCB2ZXJzaW9uLicsXG4gICAgdXBncmFkZXI6IChvbGRDb25maWcpID0+IHtcbiAgICAgIHJldHVybiBvbGRDb25maWdcbiAgICB9XG4gIH1dXG59XG5cbmV4cG9ydCBjb25zdCB2ZXJzaW9uTWFuYWdlciA9IG5ldyBWZXJzaW9uTWFuYWdlcigpXG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX19lbW90aW9uX3JlYWN0X2pzeF9ydW50aW1lX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfY29yZV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV93aWRnZXRzX3NoYXJlZF9jb2RlX2NvbW1vbl9fOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCIvKipcclxuICogV2VicGFjayB3aWxsIHJlcGxhY2UgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gd2l0aCBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgdG8gc2V0IHRoZSBwdWJsaWMgcGF0aCBkeW5hbWljYWxseS5cclxuICogVGhlIHJlYXNvbiB3aHkgd2UgY2FuJ3Qgc2V0IHRoZSBwdWJsaWNQYXRoIGluIHdlYnBhY2sgY29uZmlnIGlzOiB3ZSBjaGFuZ2UgdGhlIHB1YmxpY1BhdGggd2hlbiBkb3dubG9hZC5cclxuICogKi9cclxuX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB3aW5kb3cuamltdUNvbmZpZy5iYXNlVXJsXHJcbiIsIi8qKiBAanN4IGpzeCAqL1xuaW1wb3J0IHsgUmVhY3QsIGpzeCwgY3NzLCB0eXBlIEFsbFdpZGdldFByb3BzLCBnZXRBcHBTdG9yZSwgdHlwZSBJTVN0YXRlLCBXaWRnZXRNYW5hZ2VyLCBhcHBBY3Rpb25zLCBEYXRhU291cmNlTWFuYWdlciwgdHlwZSBEYXRhU291cmNlLCB0eXBlIEZlYXR1cmVMYXllckRhdGFTb3VyY2UgfSBmcm9tICdqaW11LWNvcmUnXG5pbXBvcnQgeyB0eXBlIElNQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJ1xuaW1wb3J0IHsgdmVyc2lvbk1hbmFnZXIgfSBmcm9tICcuLi92ZXJzaW9uLW1hbmFnZXInXG5pbXBvcnQgeyBjcmVhdGVIZWxwZXJTaW1wbGVEZWJ1Z0xvZ2dlciB9IGZyb20gJ3dpZGdldHMvc2hhcmVkLWNvZGUvY29tbW9uJ1xuXG5jb25zdCBkZWJ1Z0xvZ2dlciA9IGNyZWF0ZUhlbHBlclNpbXBsZURlYnVnTG9nZ2VyKClcblxuLyoqXG4gKiBDdXN0b20gZXZlbnQgbmFtZSBmb3Igbm90aWZ5aW5nIG1hbmFnZWQgd2lkZ2V0cyB0byBwcm9jZXNzIGhhc2ggcGFyYW1ldGVycy5cbiAqIFRoaXMgZXZlbnQgaXMgZGlzcGF0Y2hlZCBhZnRlciBhIHdpZGdldCBpcyBvcGVuZWQgaW4gYSBjb250cm9sbGVyLlxuICovXG5jb25zdCBPUEVOX1dJREdFVF9FVkVOVCA9ICdoZWxwZXJzaW1wbGUtb3Blbi13aWRnZXQnXG5cbi8qKlxuICogQ3VzdG9tIGV2ZW50IG5hbWUgZm9yIFF1ZXJ5U2ltcGxlIHRvIG5vdGlmeSBIZWxwZXJTaW1wbGUgb2Ygc2VsZWN0aW9uIGNoYW5nZXMuXG4gKi9cbmNvbnN0IFFVRVJZU0lNUExFX1NFTEVDVElPTl9FVkVOVCA9ICdxdWVyeXNpbXBsZS1zZWxlY3Rpb24tY2hhbmdlZCdcblxuLyoqXG4gKiBDdXN0b20gZXZlbnQgbmFtZSBmb3IgUXVlcnlTaW1wbGUgdG8gbm90aWZ5IEhlbHBlclNpbXBsZSBvZiB3aWRnZXQgb3Blbi9jbG9zZSBzdGF0ZS5cbiAqL1xuY29uc3QgUVVFUllTSU1QTEVfV0lER0VUX1NUQVRFX0VWRU5UID0gJ3F1ZXJ5c2ltcGxlLXdpZGdldC1zdGF0ZS1jaGFuZ2VkJ1xuXG4vKipcbiAqIEN1c3RvbSBldmVudCBuYW1lIGZvciBRdWVyeVNpbXBsZSB0byBub3RpZnkgSGVscGVyU2ltcGxlIHRoYXQgYSBoYXNoLXRyaWdnZXJlZCBxdWVyeSBoYXMgY29tcGxldGVkIGV4ZWN1dGlvbi5cbiAqIFRoaXMgYWxsb3dzIEhlbHBlclNpbXBsZSB0byB0cmFjayB3aGljaCBoYXNoIHBhcmFtZXRlcnMgaGF2ZSBiZWVuIGV4ZWN1dGVkIHRvIHByZXZlbnQgcmUtZXhlY3V0aW9uLlxuICovXG5jb25zdCBRVUVSWVNJTVBMRV9IQVNIX1FVRVJZX0VYRUNVVEVEX0VWRU5UID0gJ3F1ZXJ5c2ltcGxlLWhhc2gtcXVlcnktZXhlY3V0ZWQnXG5cbi8qKlxuICogRGV0ZWN0cyBpZiBhbiBpZGVudGlmeSBwb3B1cCBpcyBjdXJyZW50bHkgdmlzaWJsZSBpbiB0aGUgRE9NLlxuICogVXNlcyB2ZXJpZmllZCBzZWxlY3RvcnMgYmFzZWQgb24gRXhwZXJpZW5jZSBCdWlsZGVyJ3MgaWRlbnRpZnkgcG9wdXAgc3RydWN0dXJlLlxuICogXG4gKiBAcmV0dXJucyB0cnVlIGlmIGlkZW50aWZ5IHBvcHVwIGlzIGRldGVjdGVkIGFuZCB2aXNpYmxlLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZnVuY3Rpb24gaXNJZGVudGlmeVBvcHVwT3BlbigpOiBib29sZWFuIHtcbiAgLy8gUHJpbWFyeSBzZWxlY3RvcjogLmVzcmktcG9wdXAgd2l0aCByb2xlPVwiZGlhbG9nXCJcbiAgY29uc3QgcG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZXNyaS1wb3B1cFtyb2xlPVwiZGlhbG9nXCJdJylcbiAgXG4gIGlmICghcG9wdXApIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBcbiAgLy8gVmVyaWZ5IGl0J3MgdmlzaWJsZSAobm90IGhpZGRlbilcbiAgY29uc3QgYXJpYUhpZGRlbiA9IHBvcHVwLmdldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKVxuICBpZiAoYXJpYUhpZGRlbiA9PT0gJ3RydWUnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgXG4gIC8vIEFkZGl0aW9uYWwgY2hlY2s6IHZlcmlmeSBjb21wdXRlZCBzdHlsZSBzaG93cyBpdCdzIHZpc2libGVcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShwb3B1cClcbiAgaWYgKHN0eWxlLmRpc3BsYXkgPT09ICdub25lJyB8fCBzdHlsZS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJyB8fCBzdHlsZS5vcGFjaXR5ID09PSAnMCcpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBcbiAgLy8gVmVyaWZ5IGl0IGNvbnRhaW5zIGVzcmktZmVhdHVyZXMgKGlkZW50aWZ5IHBvcHVwIHN0cnVjdHVyZSlcbiAgY29uc3QgaGFzRmVhdHVyZXMgPSBwb3B1cC5xdWVyeVNlbGVjdG9yKCcuZXNyaS1mZWF0dXJlcycpXG4gIGlmICghaGFzRmVhdHVyZXMpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBcbiAgcmV0dXJuIHRydWVcbn1cblxuLyoqXG4gKiBIZWxwZXJTaW1wbGUgV2lkZ2V0XG4gKiBcbiAqIEEgaGVscGVyIHdpZGdldCB0aGF0IG1vbml0b3JzIFVSTCBoYXNoIHBhcmFtZXRlcnMgYW5kIGF1dG9tYXRpY2FsbHkgb3BlbnNcbiAqIG1hbmFnZWQgd2lkZ2V0cyBpbiBjb250cm9sbGVycyB3aGVuIG1hdGNoaW5nIHNob3J0SWRzIGFyZSBkZXRlY3RlZC5cbiAqIFxuICogVGhpcyB3aWRnZXQgaXMgYWx3YXlzIG1vdW50ZWQgYnV0IGludmlzaWJsZSwgYWxsb3dpbmcgaXQgdG8gbGlzdGVuIGZvciBoYXNoXG4gKiBjaGFuZ2VzIGV2ZW4gd2hlbiBvdGhlciB3aWRnZXRzIGFyZSBjbG9zZWQgaW4gY29udHJvbGxlcnMuXG4gKiBcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmFyY2dpcy5jb20vZXhwZXJpZW5jZS1idWlsZGVyL3NhbXBsZS1jb2RlL3dpZGdldHMvY29udHJvbC10aGUtd2lkZ2V0LXN0YXRlL1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaWRnZXQgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PEFsbFdpZGdldFByb3BzPElNQ29uZmlnPj4ge1xuICBzdGF0aWMgdmVyc2lvbk1hbmFnZXIgPSB2ZXJzaW9uTWFuYWdlclxuXG4gIC8vIFNlbGVjdGlvbiB0cmFja2luZyBmb3IgbG9nZ2luZy9kZWJ1Z2dpbmcgcHVycG9zZXMgKG5vdCB1c2VkIGZvciByZXN0b3JhdGlvbilcbiAgcHJpdmF0ZSBxdWVyeVNpbXBsZVNlbGVjdGlvbjogeyByZWNvcmRJZHM6IHN0cmluZ1tdLCBkYXRhU291cmNlSWQ/OiBzdHJpbmcgfSB8IG51bGwgPSBudWxsXG4gIHByaXZhdGUgcHJldmlvdXNIYXNoRW50cnk6IHsgb3V0cHV0RHNJZDogc3RyaW5nLCByZWNvcmRJZHM6IHN0cmluZ1tdIH0gfCBudWxsID0gbnVsbFxuICBwcml2YXRlIHF1ZXJ5U2ltcGxlV2lkZ2V0SXNPcGVuOiBib29sZWFuID0gZmFsc2VcbiAgcHJpdmF0ZSBwcmV2aW91c1dpZGdldFN0YXRlOiBib29sZWFuIHwgbnVsbCA9IG51bGxcbiAgXG4gIC8vIFRyYWNrIGxhc3QgZXhlY3V0ZWQgaGFzaCBwYXJhbWV0ZXIgdG8gcHJldmVudCByZS1leGVjdXRpb24gd2hlbiBzd2l0Y2hpbmcgcXVlcmllc1xuICAvLyBGb3JtYXQ6IFwic2hvcnRJZD12YWx1ZVwiIChlLmcuLCBcInBpbj0yMjIzMDU5MDEzXCIpXG4gIHByaXZhdGUgbGFzdEV4ZWN1dGVkSGFzaDogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgXG4gIC8vIElkZW50aWZ5IHBvcHVwIGRldGVjdGlvbiBmb3IgbG9nZ2luZyAobm8gcmVzdG9yYXRpb24pXG4gIHByaXZhdGUgaWRlbnRpZnlQb3B1cE9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyIHwgbnVsbCA9IG51bGxcbiAgcHJpdmF0ZSBpZGVudGlmeVBvcHVwV2FzT3BlbjogYm9vbGVhbiA9IGZhbHNlXG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgLy8gTGlzdGVuIGZvciBoYXNoIGNoYW5nZXMgdG8gZGV0ZWN0IHdoZW4gVVJMIGhhc2ggcGFyYW1ldGVycyBhcmUgdXBkYXRlZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy5oYW5kbGVIYXNoQ2hhbmdlKVxuICAgIC8vIENoZWNrIGhhc2ggb24gaW5pdGlhbCBtb3VudFxuICAgIHRoaXMuY2hlY2tVcmxQYXJhbWV0ZXJzKClcbiAgICBcbiAgICAvLyBMaXN0ZW4gZm9yIFF1ZXJ5U2ltcGxlIHNlbGVjdGlvbiBjaGFuZ2VzIChmb3IgbG9nZ2luZy9kZWJ1Z2dpbmcpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoUVVFUllTSU1QTEVfU0VMRUNUSU9OX0VWRU5ULCB0aGlzLmhhbmRsZVF1ZXJ5U2ltcGxlU2VsZWN0aW9uQ2hhbmdlKVxuICAgIFxuICAgIC8vIExpc3RlbiBmb3IgUXVlcnlTaW1wbGUgd2lkZ2V0IHN0YXRlIGNoYW5nZXMgKG9wZW4vY2xvc2UpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoUVVFUllTSU1QTEVfV0lER0VUX1NUQVRFX0VWRU5ULCB0aGlzLmhhbmRsZVF1ZXJ5U2ltcGxlV2lkZ2V0U3RhdGVDaGFuZ2UpXG4gICAgXG4gICAgLy8gTGlzdGVuIGZvciBRdWVyeVNpbXBsZSBoYXNoIHF1ZXJ5IGV4ZWN1dGlvbiBjb21wbGV0aW9uXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoUVVFUllTSU1QTEVfSEFTSF9RVUVSWV9FWEVDVVRFRF9FVkVOVCwgdGhpcy5oYW5kbGVIYXNoUXVlcnlFeGVjdXRlZClcbiAgICBcbiAgICAvLyBJbml0aWFsaXplIGhhc2ggZW50cnkgdHJhY2tpbmcgZm9yIGxvZ2dpbmcvZGVidWdnaW5nXG4gICAgaWYgKHRoaXMucHJvcHMuY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgdGhpcy5wcmV2aW91c0hhc2hFbnRyeSA9IHRoaXMucGFyc2VIYXNoRm9yV2lkZ2V0U2VsZWN0aW9uKHRoaXMucHJvcHMuY29uZmlnLm1hbmFnZWRXaWRnZXRJZClcbiAgICAgIC8vIFN0YXJ0IHdhdGNoaW5nIGZvciBpZGVudGlmeSBwb3B1cCAobG9nZ2luZyBvbmx5LCBubyByZXN0b3JhdGlvbilcbiAgICAgIHRoaXMuc3RhcnRJZGVudGlmeVBvcHVwV2F0Y2hpbmcoKVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy5oYW5kbGVIYXNoQ2hhbmdlKVxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFFVRVJZU0lNUExFX1NFTEVDVElPTl9FVkVOVCwgdGhpcy5oYW5kbGVRdWVyeVNpbXBsZVNlbGVjdGlvbkNoYW5nZSlcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihRVUVSWVNJTVBMRV9XSURHRVRfU1RBVEVfRVZFTlQsIHRoaXMuaGFuZGxlUXVlcnlTaW1wbGVXaWRnZXRTdGF0ZUNoYW5nZSlcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihRVUVSWVNJTVBMRV9IQVNIX1FVRVJZX0VYRUNVVEVEX0VWRU5ULCB0aGlzLmhhbmRsZUhhc2hRdWVyeUV4ZWN1dGVkKVxuICAgIHRoaXMuc3RvcElkZW50aWZ5UG9wdXBXYXRjaGluZygpXG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBBbGxXaWRnZXRQcm9wczxJTUNvbmZpZz4pIHtcbiAgICAvLyBSZS1jaGVjayBwYXJhbWV0ZXJzIGlmIG1hbmFnZWQgd2lkZ2V0IGNvbmZpZ3VyYXRpb24gY2hhbmdlZFxuICAgIGlmIChwcmV2UHJvcHMuY29uZmlnLm1hbmFnZWRXaWRnZXRJZCAhPT0gdGhpcy5wcm9wcy5jb25maWcubWFuYWdlZFdpZGdldElkKSB7XG4gICAgICB0aGlzLmNoZWNrVXJsUGFyYW1ldGVycygpXG4gICAgfVxuICAgIFxuICAgIC8vIFJlLWluaXRpYWxpemUgaGFzaCBlbnRyeSB0cmFja2luZyBhbmQgaWRlbnRpZnkgcG9wdXAgd2F0Y2hpbmcgaWYgY29uZmlnIGNoYW5nZWRcbiAgICBpZiAocHJldlByb3BzLmNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQgIT09IHRoaXMucHJvcHMuY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgdGhpcy5zdG9wSWRlbnRpZnlQb3B1cFdhdGNoaW5nKClcbiAgICAgIGlmICh0aGlzLnByb3BzLmNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpIHtcbiAgICAgICAgdGhpcy5wcmV2aW91c0hhc2hFbnRyeSA9IHRoaXMucGFyc2VIYXNoRm9yV2lkZ2V0U2VsZWN0aW9uKHRoaXMucHJvcHMuY29uZmlnLm1hbmFnZWRXaWRnZXRJZClcbiAgICAgICAgdGhpcy5zdGFydElkZW50aWZ5UG9wdXBXYXRjaGluZygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByZXZpb3VzSGFzaEVudHJ5ID0gbnVsbFxuICAgICAgICB0aGlzLnF1ZXJ5U2ltcGxlU2VsZWN0aW9uID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0cyBhbGwgc2hvcnRJZHMgZnJvbSB0aGUgbWFuYWdlZCB3aWRnZXQncyBxdWVyeSBpdGVtcy5cbiAgICogXG4gICAqIEBwYXJhbSB3aWRnZXRJZCAtIFRoZSBJRCBvZiB0aGUgd2lkZ2V0IHRvIGV4dHJhY3Qgc2hvcnRJZHMgZnJvbVxuICAgKiBAcmV0dXJucyBBcnJheSBvZiBzaG9ydElkIHN0cmluZ3MgZm91bmQgaW4gdGhlIHdpZGdldCdzIHF1ZXJ5IGl0ZW1zXG4gICAqL1xuICBnZXRXaWRnZXRTaG9ydElkcyA9ICh3aWRnZXRJZDogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICAgIGNvbnN0IHN0YXRlOiBJTVN0YXRlID0gZ2V0QXBwU3RvcmUoKS5nZXRTdGF0ZSgpXG4gICAgY29uc3QgYXBwQ29uZmlnID0gd2luZG93LmppbXVDb25maWc/LmlzQnVpbGRlciBcbiAgICAgID8gc3RhdGUuYXBwU3RhdGVJbkJ1aWxkZXI/LmFwcENvbmZpZyBcbiAgICAgIDogc3RhdGUuYXBwQ29uZmlnXG4gICAgXG4gICAgaWYgKCFhcHBDb25maWc/LndpZGdldHM/Llt3aWRnZXRJZF0pIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICBcbiAgICBpZiAoIWFwcENvbmZpZy53aWRnZXRzW3dpZGdldElkXS5jb25maWc/LnF1ZXJ5SXRlbXMpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cblxuICAgIGNvbnN0IHF1ZXJ5SXRlbXMgPSBhcHBDb25maWcud2lkZ2V0c1t3aWRnZXRJZF0uY29uZmlnLnF1ZXJ5SXRlbXNcbiAgICBjb25zdCBzaG9ydElkczogc3RyaW5nW10gPSBbXVxuICAgIFxuICAgIHF1ZXJ5SXRlbXMuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICBpZiAoaXRlbS5zaG9ydElkICYmIGl0ZW0uc2hvcnRJZC50cmltKCkgIT09ICcnKSB7XG4gICAgICAgIHNob3J0SWRzLnB1c2goaXRlbS5zaG9ydElkKVxuICAgICAgfVxuICAgIH0pXG4gICAgXG4gICAgcmV0dXJuIHNob3J0SWRzXG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgdGhlIHdpZGdldCBjbGFzcyBwcmlvciB0byBleGVjdXRpbmcgdGhlIG9wZW4gYWN0aW9uLlxuICAgKiBUaGlzIGlzIHJlcXVpcmVkIGJ5IHRoZSBFeHBlcmllbmNlIEJ1aWxkZXIgQVBJIGJlZm9yZSBvcGVuaW5nIHdpZGdldHMuXG4gICAqIFxuICAgKiBAcGFyYW0gd2lkZ2V0SWQgLSBUaGUgSUQgb2YgdGhlIHdpZGdldCB0byBsb2FkXG4gICAqIEByZXR1cm5zIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSB3aWRnZXQgY2xhc3MgY29tcG9uZW50XG4gICAqIFxuICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5hcmNnaXMuY29tL2V4cGVyaWVuY2UtYnVpbGRlci9zYW1wbGUtY29kZS93aWRnZXRzL2NvbnRyb2wtdGhlLXdpZGdldC1zdGF0ZS9cbiAgICovXG4gIGxvYWRXaWRnZXRDbGFzcyA9ICh3aWRnZXRJZDogc3RyaW5nKTogUHJvbWlzZTxSZWFjdC5Db21wb25lbnRUeXBlPGFueT4+ID0+IHtcbiAgICBpZiAoIXdpZGdldElkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGlzQ2xhc3NMb2FkZWQgPSBnZXRBcHBTdG9yZSgpLmdldFN0YXRlKCkud2lkZ2V0c1J1bnRpbWVJbmZvPy5bd2lkZ2V0SWRdPy5pc0NsYXNzTG9hZGVkXG4gICAgXG4gICAgaWYgKCFpc0NsYXNzTG9hZGVkKSB7XG4gICAgICByZXR1cm4gV2lkZ2V0TWFuYWdlci5nZXRJbnN0YW5jZSgpLmxvYWRXaWRnZXRDbGFzcyh3aWRnZXRJZClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShXaWRnZXRNYW5hZ2VyLmdldEluc3RhbmNlKCkuZ2V0V2lkZ2V0Q2xhc3Mod2lkZ2V0SWQpKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyBhIHdpZGdldCBpbiBhIGNvbnRyb2xsZXIgdXNpbmcgdGhlIEV4cGVyaWVuY2UgQnVpbGRlciBBUEkuXG4gICAqIFxuICAgKiBUaGlzIG1ldGhvZDpcbiAgICogMS4gTG9hZHMgdGhlIHdpZGdldCBjbGFzcyBpZiBub3QgYWxyZWFkeSBsb2FkZWRcbiAgICogMi4gRGlzcGF0Y2hlcyB0aGUgb3BlbldpZGdldCBhY3Rpb24gdmlhIFJlZHV4XG4gICAqIDMuIE5vdGlmaWVzIHRoZSB3aWRnZXQgdG8gcHJvY2VzcyBoYXNoIHBhcmFtZXRlcnMgYWZ0ZXIgb3BlbmluZ1xuICAgKiBcbiAgICogQHBhcmFtIHdpZGdldElkIC0gVGhlIElEIG9mIHRoZSB3aWRnZXQgdG8gb3BlblxuICAgKiBcbiAgICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuYXJjZ2lzLmNvbS9leHBlcmllbmNlLWJ1aWxkZXIvc2FtcGxlLWNvZGUvd2lkZ2V0cy9jb250cm9sLXRoZS13aWRnZXQtc3RhdGUvXG4gICAqL1xuICBvcGVuV2lkZ2V0ID0gKHdpZGdldElkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBjb25zdCBvcGVuQWN0aW9uID0gYXBwQWN0aW9ucy5vcGVuV2lkZ2V0KHdpZGdldElkKVxuICAgIFxuICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSC1FWEVDJywge1xuICAgICAgZXZlbnQ6ICdoZWxwZXJzaW1wbGUtb3BlbndpZGdldC1zdGFydGluZycsXG4gICAgICB3aWRnZXRJZCxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgIH0pXG4gICAgXG4gICAgdGhpcy5sb2FkV2lkZ2V0Q2xhc3Mod2lkZ2V0SWQpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGdldEFwcFN0b3JlKCkuZGlzcGF0Y2gob3BlbkFjdGlvbilcbiAgICAgICAgZGVidWdMb2dnZXIubG9nKCdIQVNILUVYRUMnLCB7XG4gICAgICAgICAgZXZlbnQ6ICdoZWxwZXJzaW1wbGUtb3BlbndpZGdldC1hY3Rpb24tZGlzcGF0Y2hlZCcsXG4gICAgICAgICAgd2lkZ2V0SWQsXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyBHaXZlIHRoZSB3aWRnZXQgYSBtb21lbnQgdG8gbW91bnQsIHRoZW4gbm90aWZ5IGl0IHRvIHByb2Nlc3MgaGFzaCBwYXJhbWV0ZXJzXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSC1FWEVDJywge1xuICAgICAgICAgICAgZXZlbnQ6ICdoZWxwZXJzaW1wbGUtb3BlbndpZGdldC1kaXNwYXRjaGluZy1ldmVudCcsXG4gICAgICAgICAgICB3aWRnZXRJZCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoT1BFTl9XSURHRVRfRVZFTlQsIHtcbiAgICAgICAgICAgIGRldGFpbDogeyB3aWRnZXRJZCB9LFxuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KGV2ZW50KVxuICAgICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSC1FWEVDJywge1xuICAgICAgICAgICAgZXZlbnQ6ICdoZWxwZXJzaW1wbGUtb3BlbndpZGdldC1ldmVudC1kaXNwYXRjaGVkJyxcbiAgICAgICAgICAgIHdpZGdldElkLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgNTAwKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgZGVidWdMb2dnZXIubG9nKCdIQVNILUVYRUMnLCB7XG4gICAgICAgICAgZXZlbnQ6ICdoZWxwZXJzaW1wbGUtb3BlbndpZGdldC1lcnJvcicsXG4gICAgICAgICAgd2lkZ2V0SWQsXG4gICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgfSlcbiAgICAgICAgLy8gU2lsZW50bHkgaGFuZGxlIGVycm9ycyAtIHdpZGdldCBtYXkgYWxyZWFkeSBiZSBvcGVuIG9yIG5vdCBpbiBhIGNvbnRyb2xsZXJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW0hlbHBlclNpbXBsZV0gRXJyb3Igb3BlbmluZyB3aWRnZXQ6JywgZXJyb3IpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIFVSTCBoYXNoIGFuZCBxdWVyeSBzdHJpbmcgcGFyYW1ldGVycyBmb3Igc2hvcnRJZHMgdGhhdCBtYXRjaCB0aGUgbWFuYWdlZCB3aWRnZXQuXG4gICAqIFxuICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBvcGVucyB0aGUgd2lkZ2V0IHVzaW5nIHRoZSBFeHBlcmllbmNlIEJ1aWxkZXIgQVBJLlxuICAgKiBIYXNoIGZvcm1hdDogI3Nob3J0SWQ9dmFsdWUgKGUuZy4sICNwaW49MjIyMzA1OTAxMylcbiAgICogUXVlcnkgZm9ybWF0OiA/c2hvcnRJZD12YWx1ZSAoZS5nLiwgP3Bpbj0yMjIzMDU5MDEzKVxuICAgKiBcbiAgICogU3BlY2lhbCBwYXJhbWV0ZXI6ICNxc29wZW49dHJ1ZSBvciA/cXNvcGVuPXRydWVcbiAgICogRm9yY2VzIHdpZGdldCB0byBvcGVuIHdpdGhvdXQgcmVxdWlyaW5nIGEgcXVlcnkgcGFyYW1ldGVyIG1hdGNoLlxuICAgKi9cbiAgY2hlY2tVcmxQYXJhbWV0ZXJzID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgY29uZmlnIH0gPSB0aGlzLnByb3BzXG4gICAgXG4gICAgaWYgKCFjb25maWcubWFuYWdlZFdpZGdldElkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBQYXJzZSBVUkwgaGFzaCBmcmFnbWVudCBhbmQgcXVlcnkgc3RyaW5nXG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKVxuICAgIGNvbnN0IHF1ZXJ5ID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSlcbiAgICBcbiAgICBkZWJ1Z0xvZ2dlci5sb2coJ0hBU0gtRVhFQycsIHtcbiAgICAgIGV2ZW50OiAnaGVscGVyc2ltcGxlLWNoZWNrdXJscGFyYW1ldGVycy1jYWxsZWQnLFxuICAgICAgd2lkZ2V0SWQ6IGNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQsXG4gICAgICBjdXJyZW50VXJsSGFzaDogaGFzaCxcbiAgICAgIGN1cnJlbnRVcmxRdWVyeTogcXVlcnksXG4gICAgICBoYXNIYXNoOiAhIWhhc2gsXG4gICAgICBoYXNRdWVyeTogISFxdWVyeSxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgIH0pXG4gICAgXG4gICAgaWYgKCFoYXNoICYmICFxdWVyeSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGhhc2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGhhc2gpXG4gICAgY29uc3QgcXVlcnlQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJ5KVxuICAgIFxuICAgIC8vIENoZWNrIGZvciBzcGVjaWFsIHFzb3BlbiBwYXJhbWV0ZXIgKGZvcmNlcyB3aWRnZXQgdG8gb3BlbilcbiAgICBpZiAoaGFzaFBhcmFtcy5nZXQoJ3Fzb3BlbicpID09PSAndHJ1ZScgfHwgcXVlcnlQYXJhbXMuZ2V0KCdxc29wZW4nKSA9PT0gJ3RydWUnKSB7XG4gICAgICBkZWJ1Z0xvZ2dlci5sb2coJ0hBU0gtRVhFQycsIHtcbiAgICAgICAgZXZlbnQ6ICdoZWxwZXJzaW1wbGUtY2hlY2t1cmwtb3BlbmluZy13aWRnZXQtcXNvcGVuJyxcbiAgICAgICAgd2lkZ2V0SWQ6IGNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQsXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgfSlcbiAgICAgIHRoaXMub3BlbldpZGdldChjb25maWcubWFuYWdlZFdpZGdldElkKVxuICAgICAgcmV0dXJuIFxuICAgIH1cblxuICAgIC8vIEdldCBhbGwgc2hvcnRJZHMgZnJvbSB0aGUgbWFuYWdlZCB3aWRnZXRcbiAgICBjb25zdCBzaG9ydElkcyA9IHRoaXMuZ2V0V2lkZ2V0U2hvcnRJZHMoY29uZmlnLm1hbmFnZWRXaWRnZXRJZClcbiAgICBcbiAgICBpZiAoc2hvcnRJZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgYW55IHNob3J0SWQgbWF0Y2hlcyBpbiBlaXRoZXIgaGFzaCBvciBxdWVyeSBzdHJpbmdcbiAgICBzaG9ydElkcy5mb3JFYWNoKHNob3J0SWQgPT4ge1xuICAgICAgY29uc3QgaGFzaFZhbHVlID0gaGFzaFBhcmFtcy5nZXQoc2hvcnRJZCkgfHwgcXVlcnlQYXJhbXMuZ2V0KHNob3J0SWQpXG4gICAgICBcbiAgICAgIGlmIChoYXNoVmFsdWUpIHtcbiAgICAgICAgY29uc3QgY3VycmVudEhhc2ggPSBgJHtzaG9ydElkfT0ke2hhc2hWYWx1ZX1gXG4gICAgICAgIFxuICAgICAgICBkZWJ1Z0xvZ2dlci5sb2coJ0hBU0gtRVhFQycsIHtcbiAgICAgICAgICBldmVudDogJ2hlbHBlcnNpbXBsZS1jaGVja3VybC1zaG9ydGlkLW1hdGNoLWRldGVjdGVkJyxcbiAgICAgICAgICB3aWRnZXRJZDogY29uZmlnLm1hbmFnZWRXaWRnZXRJZCxcbiAgICAgICAgICBzaG9ydElkLFxuICAgICAgICAgIGhhc2hWYWx1ZSxcbiAgICAgICAgICBjdXJyZW50SGFzaCxcbiAgICAgICAgICBsYXN0RXhlY3V0ZWRIYXNoOiB0aGlzLmxhc3RFeGVjdXRlZEhhc2gsXG4gICAgICAgICAgd2lsbE9wZW5XaWRnZXQ6IGN1cnJlbnRIYXNoICE9PSB0aGlzLmxhc3RFeGVjdXRlZEhhc2gsXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICAvLyBPbmx5IG9wZW4gd2lkZ2V0IGlmIGhhc2ggaGFzIGNoYW5nZWQgKG5vdCBhbHJlYWR5IGV4ZWN1dGVkKVxuICAgICAgICBpZiAoY3VycmVudEhhc2ggIT09IHRoaXMubGFzdEV4ZWN1dGVkSGFzaCkge1xuICAgICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSC1FWEVDJywge1xuICAgICAgICAgICAgZXZlbnQ6ICdoZWxwZXJzaW1wbGUtY2hlY2t1cmwtb3BlbmluZy13aWRnZXQtc2hvcnRpZC1tYXRjaCcsXG4gICAgICAgICAgICB3aWRnZXRJZDogY29uZmlnLm1hbmFnZWRXaWRnZXRJZCxcbiAgICAgICAgICAgIHNob3J0SWQsXG4gICAgICAgICAgICBoYXNoVmFsdWUsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vIE9wZW4gdGhlIHdpZGdldCB1c2luZyB0aGUgcHJvcGVyIEFQSVxuICAgICAgICAgIHRoaXMub3BlbldpZGdldChjb25maWcubWFuYWdlZFdpZGdldElkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSC1FWEVDJywge1xuICAgICAgICAgICAgZXZlbnQ6ICdoZWxwZXJzaW1wbGUtY2hlY2t1cmwtc2tpcHBpbmctYWxyZWFkeS1leGVjdXRlZC1oYXNoJyxcbiAgICAgICAgICAgIHdpZGdldElkOiBjb25maWcubWFuYWdlZFdpZGdldElkLFxuICAgICAgICAgICAgc2hvcnRJZCxcbiAgICAgICAgICAgIGhhc2hWYWx1ZSxcbiAgICAgICAgICAgIGxhc3RFeGVjdXRlZEhhc2g6IHRoaXMubGFzdEV4ZWN1dGVkSGFzaCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgaGFzaCBjaGFuZ2UgZXZlbnRzIGZyb20gdGhlIGJyb3dzZXIuXG4gICAqIFJlLWNoZWNrcyBwYXJhbWV0ZXJzIHdoZW4gdGhlIFVSTCBoYXNoIGNoYW5nZXMuXG4gICAqL1xuICBoYW5kbGVIYXNoQ2hhbmdlID0gKCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSlcbiAgICBjb25zdCBxdWVyeSA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpXG4gICAgXG4gICAgZGVidWdMb2dnZXIubG9nKCdIQVNILUVYRUMnLCB7XG4gICAgICBldmVudDogJ2hlbHBlcnNpbXBsZS1oYW5kbGVoYXNoY2hhbmdlLWZpcmVkJyxcbiAgICAgIHdpZGdldElkOiB0aGlzLnByb3BzLmNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQsXG4gICAgICBjdXJyZW50VXJsSGFzaDogaGFzaCxcbiAgICAgIGN1cnJlbnRVcmxRdWVyeTogcXVlcnksXG4gICAgICBsYXN0RXhlY3V0ZWRIYXNoOiB0aGlzLmxhc3RFeGVjdXRlZEhhc2gsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICB9KVxuICAgIFxuICAgIC8vIENoZWNrIHBhcmFtZXRlcnMgZm9yIHdpZGdldCBvcGVuaW5nXG4gICAgdGhpcy5jaGVja1VybFBhcmFtZXRlcnMoKVxuICAgIFxuICAgIC8vIFVwZGF0ZSBoYXNoIGVudHJ5IHRyYWNraW5nIGZvciBsb2dnaW5nL2RlYnVnZ2luZ1xuICAgIGNvbnN0IHsgY29uZmlnIH0gPSB0aGlzLnByb3BzXG4gICAgaWYgKGNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpIHtcbiAgICAgIHRoaXMucHJldmlvdXNIYXNoRW50cnkgPSB0aGlzLnBhcnNlSGFzaEZvcldpZGdldFNlbGVjdGlvbihjb25maWcubWFuYWdlZFdpZGdldElkKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIFF1ZXJ5U2ltcGxlIHNlbGVjdGlvbiBjaGFuZ2UgZXZlbnRzLlxuICAgKiBTdG9yZXMgdGhlIHNlbGVjdGlvbiBzdGF0ZSBhbmQgaGFzaCBlbnRyeSBpbW1lZGlhdGVseSAoZXZlbnQtZHJpdmVuKS5cbiAgICovXG4gIGhhbmRsZVF1ZXJ5U2ltcGxlU2VsZWN0aW9uQ2hhbmdlID0gKGV2ZW50OiBDdXN0b21FdmVudDx7IHdpZGdldElkOiBzdHJpbmcsIHJlY29yZElkczogc3RyaW5nW10sIGRhdGFTb3VyY2VJZD86IHN0cmluZyB9PikgPT4ge1xuICAgIGNvbnN0IHsgY29uZmlnIH0gPSB0aGlzLnByb3BzXG4gICAgXG4gICAgLy8gT25seSB0cmFjayBpZiB0aGlzIGlzIG91ciBtYW5hZ2VkIHdpZGdldFxuICAgIGlmIChldmVudC5kZXRhaWwud2lkZ2V0SWQgPT09IGNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpIHtcbiAgICAgIHRoaXMucXVlcnlTaW1wbGVTZWxlY3Rpb24gPSB7XG4gICAgICAgIHJlY29yZElkczogZXZlbnQuZGV0YWlsLnJlY29yZElkcyxcbiAgICAgICAgZGF0YVNvdXJjZUlkOiBldmVudC5kZXRhaWwuZGF0YVNvdXJjZUlkXG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEltbWVkaWF0ZWx5IGNoZWNrIGhhc2ggdG8gZ2V0IG91dHB1dCBEUyBJRCAoZXZlbnQtZHJpdmVuLCBubyBwb2xsaW5nKVxuICAgICAgY29uc3QgaGFzaEVudHJ5ID0gdGhpcy5wYXJzZUhhc2hGb3JXaWRnZXRTZWxlY3Rpb24oY29uZmlnLm1hbmFnZWRXaWRnZXRJZClcbiAgICAgIGlmIChoYXNoRW50cnkpIHtcbiAgICAgICAgdGhpcy5wcmV2aW91c0hhc2hFbnRyeSA9IGhhc2hFbnRyeVxuICAgICAgfVxuICAgICAgXG4gICAgICBkZWJ1Z0xvZ2dlci5sb2coJ1NFTEVDVElPTicsIHtcbiAgICAgICAgZXZlbnQ6ICdzZWxlY3Rpb24tdHJhY2tlZC1mcm9tLXF1ZXJ5c2ltcGxlJyxcbiAgICAgICAgd2lkZ2V0SWQ6IGV2ZW50LmRldGFpbC53aWRnZXRJZCxcbiAgICAgICAgcmVjb3JkQ291bnQ6IGV2ZW50LmRldGFpbC5yZWNvcmRJZHMubGVuZ3RoLFxuICAgICAgICBkYXRhU291cmNlSWQ6IGV2ZW50LmRldGFpbC5kYXRhU291cmNlSWQsXG4gICAgICAgIGhhc2hFbnRyeTogdGhpcy5wcmV2aW91c0hhc2hFbnRyeSA/IHtcbiAgICAgICAgICBvdXRwdXREc0lkOiB0aGlzLnByZXZpb3VzSGFzaEVudHJ5Lm91dHB1dERzSWQsXG4gICAgICAgICAgcmVjb3JkQ291bnQ6IHRoaXMucHJldmlvdXNIYXNoRW50cnkucmVjb3JkSWRzLmxlbmd0aFxuICAgICAgICB9IDogbnVsbFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBRdWVyeVNpbXBsZSB3aWRnZXQgc3RhdGUgY2hhbmdlcyAob3Blbi9jbG9zZSkuXG4gICAqL1xuICBoYW5kbGVRdWVyeVNpbXBsZVdpZGdldFN0YXRlQ2hhbmdlID0gKGV2ZW50OiBDdXN0b21FdmVudDx7IHdpZGdldElkOiBzdHJpbmcsIGlzT3BlbjogYm9vbGVhbiB9PikgPT4ge1xuICAgIGNvbnN0IHsgY29uZmlnIH0gPSB0aGlzLnByb3BzXG4gICAgXG4gICAgLy8gT25seSB0cmFjayBpZiB0aGlzIGlzIG91ciBtYW5hZ2VkIHdpZGdldFxuICAgIGlmIChldmVudC5kZXRhaWwud2lkZ2V0SWQgPT09IGNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpIHtcbiAgICAgIGNvbnN0IHdhc09wZW4gPSB0aGlzLnF1ZXJ5U2ltcGxlV2lkZ2V0SXNPcGVuXG4gICAgICBjb25zdCBpc05vd09wZW4gPSBldmVudC5kZXRhaWwuaXNPcGVuXG4gICAgICBcbiAgICAgIHRoaXMucXVlcnlTaW1wbGVXaWRnZXRJc09wZW4gPSBpc05vd09wZW5cbiAgICAgIFxuICAgICAgZGVidWdMb2dnZXIubG9nKCdXSURHRVQtU1RBVEUnLCB7XG4gICAgICAgIGV2ZW50OiAncXVlcnlzaW1wbGUtd2lkZ2V0LXN0YXRlLWNoYW5nZWQnLFxuICAgICAgICB3aWRnZXRJZDogZXZlbnQuZGV0YWlsLndpZGdldElkLFxuICAgICAgICBpc09wZW46IGV2ZW50LmRldGFpbC5pc09wZW4sXG4gICAgICAgIHdhc09wZW4sXG4gICAgICAgIHRyYW5zaXRpb246IHdhc09wZW4gIT09IGlzTm93T3BlbiA/IChpc05vd09wZW4gPyAnY2xvc2VkLXRvLW9wZW4nIDogJ29wZW4tdG8tY2xvc2VkJykgOiAnbm8tY2hhbmdlJ1xuICAgICAgfSlcbiAgICAgIFxuICAgICAgdGhpcy5wcmV2aW91c1dpZGdldFN0YXRlID0gaXNOb3dPcGVuXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgUXVlcnlTaW1wbGUgaGFzaCBxdWVyeSBleGVjdXRpb24gY29tcGxldGlvbiBldmVudC5cbiAgICogVHJhY2tzIHRoZSBsYXN0IGV4ZWN1dGVkIGhhc2ggcGFyYW1ldGVyIHRvIHByZXZlbnQgcmUtZXhlY3V0aW9uIHdoZW4gc3dpdGNoaW5nIHF1ZXJpZXMuXG4gICAqL1xuICBoYW5kbGVIYXNoUXVlcnlFeGVjdXRlZCA9IChldmVudDogQ3VzdG9tRXZlbnQ8eyB3aWRnZXRJZDogc3RyaW5nLCBzaG9ydElkOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGhhc2hQYXJhbTogc3RyaW5nIH0+KSA9PiB7XG4gICAgY29uc3QgeyB3aWRnZXRJZCwgc2hvcnRJZCwgdmFsdWUsIGhhc2hQYXJhbSB9ID0gZXZlbnQuZGV0YWlsIHx8IHt9XG4gICAgY29uc3QgeyBjb25maWcgfSA9IHRoaXMucHJvcHNcbiAgICBcbiAgICAvLyBPbmx5IHRyYWNrIGlmIHRoaXMgaXMgZm9yIG91ciBtYW5hZ2VkIHdpZGdldFxuICAgIGlmICh3aWRnZXRJZCAhPT0gY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgZGVidWdMb2dnZXIubG9nKCdIQVNILUVYRUMnLCB7XG4gICAgICAgIGV2ZW50OiAnaGVscGVyc2ltcGxlLWhhc2gtcXVlcnktZXhlY3V0ZWQtaWdub3JlZC13cm9uZy13aWRnZXQnLFxuICAgICAgICBldmVudFdpZGdldElkOiB3aWRnZXRJZCxcbiAgICAgICAgbWFuYWdlZFdpZGdldElkOiBjb25maWcubWFuYWdlZFdpZGdldElkLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgXG4gICAgZGVidWdMb2dnZXIubG9nKCdIQVNILUVYRUMnLCB7XG4gICAgICBldmVudDogJ2hlbHBlcnNpbXBsZS1oYXNoLXF1ZXJ5LWV4ZWN1dGVkLXJlY2VpdmVkJyxcbiAgICAgIHdpZGdldElkLFxuICAgICAgc2hvcnRJZCxcbiAgICAgIHZhbHVlLFxuICAgICAgaGFzaFBhcmFtLFxuICAgICAgcHJldmlvdXNMYXN0RXhlY3V0ZWRIYXNoOiB0aGlzLmxhc3RFeGVjdXRlZEhhc2gsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICB9KVxuICAgIFxuICAgIC8vIFRyYWNrIHRoZSBsYXN0IGV4ZWN1dGVkIGhhc2ggcGFyYW1ldGVyXG4gICAgLy8gRm9ybWF0OiBcInNob3J0SWQ9dmFsdWVcIiAoZS5nLiwgXCJwaW49MjIyMzA1OTAxM1wiKVxuICAgIHRoaXMubGFzdEV4ZWN1dGVkSGFzaCA9IGhhc2hQYXJhbVxuICAgIFxuICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSC1FWEVDJywge1xuICAgICAgZXZlbnQ6ICdoZWxwZXJzaW1wbGUtbGFzdC1leGVjdXRlZC1oYXNoLXVwZGF0ZWQnLFxuICAgICAgd2lkZ2V0SWQsXG4gICAgICBsYXN0RXhlY3V0ZWRIYXNoOiB0aGlzLmxhc3RFeGVjdXRlZEhhc2gsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICB9KVxuICB9XG5cblxuICAvKipcbiAgICogUkVNT1ZFRDogUG9sbGluZy1iYXNlZCBzZWxlY3Rpb24gdHJhY2tpbmcuXG4gICAqIE5vdyB1c2luZyBldmVudC1kcml2ZW4gYXBwcm9hY2ggdmlhIGhhc2hjaGFuZ2UgYW5kIFFVRVJZU0lNUExFX1NFTEVDVElPTl9FVkVOVC5cbiAgICovXG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgYGRhdGFfc2AgcGFyYW1ldGVyIGZyb20gdGhlIFVSTCBoYXNoIGFuZCBleHRyYWN0cyB3aWRnZXQgb3V0cHV0IGRhdGEgc291cmNlIElEcy5cbiAgICogXG4gICAqIEhhc2ggZm9ybWF0OiAjZGF0YV9zPWlkOndpZGdldF8xMl9vdXRwdXRfMjg2Mjg2ODM5NTczMjQ0OTc6NDUxMjA0KzQ1MTIwNSsuLi4saWQ6Li4uXG4gICAqIE9SOiAjZGF0YV9zPWlkOmRhdGFTb3VyY2VfMS1LaW5nQ29fUHJvcGVydHlJbmZvXzYzODZfNTM3NS0yfndpZGdldF8xNV9vdXRwdXRfNDUwNDQ0MDM2Nzg3MDU3OTo0NTEzMTdcbiAgICogXG4gICAqIEBwYXJhbSB3aWRnZXRJZCAtIFRoZSB3aWRnZXQgSUQgdG8gbWF0Y2ggKGUuZy4sIFwid2lkZ2V0XzEyXCIpXG4gICAqIEByZXR1cm5zIE9iamVjdCB3aXRoIG91dHB1dERzSWQgYW5kIHJlY29yZElkcywgb3IgbnVsbCBpZiBub3QgZm91bmRcbiAgICovXG4gIHBhcnNlSGFzaEZvcldpZGdldFNlbGVjdGlvbiA9ICh3aWRnZXRJZDogc3RyaW5nKTogeyBvdXRwdXREc0lkOiBzdHJpbmcsIHJlY29yZElkczogc3RyaW5nW10gfSB8IG51bGwgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSlcbiAgICBpZiAoIWhhc2gpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhoYXNoKVxuICAgIGNvbnN0IGRhdGFTID0gdXJsUGFyYW1zLmdldCgnZGF0YV9zJylcbiAgICBpZiAoIWRhdGFTKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIC8vIFVSTCBkZWNvZGUgdGhlIGRhdGFfcyBwYXJhbWV0ZXJcbiAgICBjb25zdCBkZWNvZGVkRGF0YVMgPSBkZWNvZGVVUklDb21wb25lbnQoZGF0YVMpXG4gICAgXG4gICAgLy8gU3BsaXQgYnkgY29tbWEgdG8gZ2V0IGluZGl2aWR1YWwgc2VsZWN0aW9uc1xuICAgIGNvbnN0IHNlbGVjdGlvbnMgPSBkZWNvZGVkRGF0YVMuc3BsaXQoJywnKVxuICAgIFxuICAgIC8vIFBhdHRlcm4gdG8gbWF0Y2g6IHdpZGdldF9YWF9vdXRwdXRfKiAod2hlcmUgWFggaXMgdGhlIHdpZGdldCBJRCBudW1iZXIpXG4gICAgLy8gRXh0cmFjdCB3aWRnZXQgbnVtYmVyIGZyb20gd2lkZ2V0SWQgKGUuZy4sIFwid2lkZ2V0XzEyXCIgLT4gXCIxMlwiKVxuICAgIGNvbnN0IHdpZGdldE1hdGNoID0gd2lkZ2V0SWQubWF0Y2goL3dpZGdldF8oXFxkKykvKVxuICAgIGlmICghd2lkZ2V0TWF0Y2gpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIGNvbnN0IHdpZGdldE51bWJlciA9IHdpZGdldE1hdGNoWzFdXG4gICAgY29uc3Qgd2lkZ2V0UGF0dGVybiA9IG5ldyBSZWdFeHAoYHdpZGdldF8ke3dpZGdldE51bWJlcn1fb3V0cHV0X1xcXFxkK2ApXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiBzZWxlY3Rpb25zKSB7XG4gICAgICAvLyBGb3JtYXQ6IGlkOldJREdFVF9PVVRQVVRfRFNfSUQ6UkVDT1JEX0lEU1xuICAgICAgLy8gT1I6IGlkOkRBVEFfU09VUkNFX0lEfldJREdFVF9PVVRQVVRfRFNfSUQ6UkVDT1JEX0lEU1xuICAgICAgaWYgKCFzZWxlY3Rpb24uc3RhcnRzV2l0aCgnaWQ6JykpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgaWRQYXJ0ID0gc2VsZWN0aW9uLnN1YnN0cmluZygzKSAvLyBSZW1vdmUgXCJpZDpcIlxuICAgICAgY29uc3QgY29sb25JbmRleCA9IGlkUGFydC5sYXN0SW5kZXhPZignOicpXG4gICAgICBpZiAoY29sb25JbmRleCA9PT0gLTEpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgZHNJZFBhcnQgPSBpZFBhcnQuc3Vic3RyaW5nKDAsIGNvbG9uSW5kZXgpXG4gICAgICBjb25zdCByZWNvcmRJZHNQYXJ0ID0gaWRQYXJ0LnN1YnN0cmluZyhjb2xvbkluZGV4ICsgMSlcblxuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBtYXRjaGVzIG91ciB3aWRnZXQncyBvdXRwdXQgRFMgcGF0dGVyblxuICAgICAgLy8gSGFuZGxlIGJvdGggZm9ybWF0czogd2lkZ2V0X1hYX291dHB1dF8qIG9yIGRhdGFTb3VyY2VfKn53aWRnZXRfWFhfb3V0cHV0XypcbiAgICAgIC8vIElNUE9SVEFOVDogQ2hlY2sgZm9yIGNvbXBvdW5kIGZvcm1hdCBGSVJTVCAoY29udGFpbnMgfilcbiAgICAgIC8vIE90aGVyd2lzZSB0aGUgcmVnZXggd2lsbCBtYXRjaCB0aGUgcGF0dGVybiB3aXRoaW4gdGhlIGNvbXBvdW5kIHN0cmluZ1xuICAgICAgbGV0IG91dHB1dERzSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsXG4gICAgICBpZiAoZHNJZFBhcnQuaW5jbHVkZXMoJ34nKSkge1xuICAgICAgICAvLyBDb21wb3VuZCBmb3JtYXQ6IGRhdGFTb3VyY2VfKn53aWRnZXRfWFhfb3V0cHV0XypcbiAgICAgICAgY29uc3QgcGFydHMgPSBkc0lkUGFydC5zcGxpdCgnficpXG4gICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSCcsIHtcbiAgICAgICAgICBldmVudDogJ3BhcnNpbmctY29tcG91bmQtaGFzaC1mb3JtYXQnLFxuICAgICAgICAgIHdpZGdldElkLFxuICAgICAgICAgIGRzSWRQYXJ0LFxuICAgICAgICAgIHBhcnRzLFxuICAgICAgICAgIHdpZGdldFBhdHRlcm46IHdpZGdldFBhdHRlcm4udG9TdHJpbmcoKVxuICAgICAgICB9KVxuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICAgICAgICBpZiAocGFydC5tYXRjaCh3aWRnZXRQYXR0ZXJuKSkge1xuICAgICAgICAgICAgb3V0cHV0RHNJZCA9IHBhcnRcbiAgICAgICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSCcsIHtcbiAgICAgICAgICAgICAgZXZlbnQ6ICdmb3VuZC1tYXRjaGluZy13aWRnZXQtb3V0cHV0LWRzLWlkLWNvbXBvdW5kLWZvcm1hdCcsXG4gICAgICAgICAgICAgIHdpZGdldElkLFxuICAgICAgICAgICAgICBvdXRwdXREc0lkLFxuICAgICAgICAgICAgICBwYXJ0LFxuICAgICAgICAgICAgICBhbGxQYXJ0czogcGFydHNcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIW91dHB1dERzSWQpIHtcbiAgICAgICAgICBkZWJ1Z0xvZ2dlci5sb2coJ0hBU0gnLCB7XG4gICAgICAgICAgICBldmVudDogJ25vLW1hdGNoaW5nLXdpZGdldC1vdXRwdXQtZHMtaWQtY29tcG91bmQtZm9ybWF0JyxcbiAgICAgICAgICAgIHdpZGdldElkLFxuICAgICAgICAgICAgZHNJZFBhcnQsXG4gICAgICAgICAgICBwYXJ0cyxcbiAgICAgICAgICAgIHdpZGdldFBhdHRlcm46IHdpZGdldFBhdHRlcm4udG9TdHJpbmcoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZHNJZFBhcnQubWF0Y2god2lkZ2V0UGF0dGVybikpIHtcbiAgICAgICAgLy8gRGlyZWN0IGZvcm1hdDogd2lkZ2V0X1hYX291dHB1dF8qIChubyB+IHNlcGFyYXRvcilcbiAgICAgICAgb3V0cHV0RHNJZCA9IGRzSWRQYXJ0XG4gICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSCcsIHtcbiAgICAgICAgICBldmVudDogJ2ZvdW5kLWRpcmVjdC1mb3JtYXQtd2lkZ2V0LW91dHB1dC1kcy1pZCcsXG4gICAgICAgICAgd2lkZ2V0SWQsXG4gICAgICAgICAgZHNJZFBhcnQsXG4gICAgICAgICAgb3V0cHV0RHNJZFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAob3V0cHV0RHNJZCkge1xuICAgICAgICAvLyBQYXJzZSByZWNvcmQgSURzIChzZXBhcmF0ZWQgYnkgKylcbiAgICAgICAgY29uc3QgcmVjb3JkSWRzID0gcmVjb3JkSWRzUGFydC5zcGxpdCgnKycpLmZpbHRlcihpZCA9PiBpZC5sZW5ndGggPiAwKVxuICAgICAgICBkZWJ1Z0xvZ2dlci5sb2coJ0hBU0gnLCB7XG4gICAgICAgICAgZXZlbnQ6ICdwYXJzZWQtaGFzaC1lbnRyeS1zdWNjZXNzZnVsbHknLFxuICAgICAgICAgIHdpZGdldElkLFxuICAgICAgICAgIG91dHB1dERzSWQsXG4gICAgICAgICAgcmVjb3JkQ291bnQ6IHJlY29yZElkcy5sZW5ndGgsXG4gICAgICAgICAgcmVjb3JkSWRzOiByZWNvcmRJZHMuc2xpY2UoMCwgNSlcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHsgb3V0cHV0RHNJZCwgcmVjb3JkSWRzIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSCcsIHtcbiAgICAgICAgICBldmVudDogJ25vLXdpZGdldC1vdXRwdXQtZHMtaWQtZm91bmQtaW4taGFzaCcsXG4gICAgICAgICAgd2lkZ2V0SWQsXG4gICAgICAgICAgZHNJZFBhcnQsXG4gICAgICAgICAgd2lkZ2V0UGF0dGVybjogd2lkZ2V0UGF0dGVybi50b1N0cmluZygpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgd2F0Y2hpbmcgZm9yIGlkZW50aWZ5IHBvcHVwIG9wZW5pbmcvY2xvc2luZyB1c2luZyBNdXRhdGlvbk9ic2VydmVyLlxuICAgKiBMb2dzIHBvcHVwIHN0YXRlIGNoYW5nZXMgZm9yIGRlYnVnZ2luZyAobm8gcmVzdG9yYXRpb24gbG9naWMpLlxuICAgKi9cbiAgc3RhcnRJZGVudGlmeVBvcHVwV2F0Y2hpbmcgPSAoKSA9PiB7XG4gICAgaWYgKHRoaXMuaWRlbnRpZnlQb3B1cE9ic2VydmVyKSB7XG4gICAgICByZXR1cm4gLy8gQWxyZWFkeSB3YXRjaGluZ1xuICAgIH1cblxuICAgIGNvbnN0IHsgY29uZmlnIH0gPSB0aGlzLnByb3BzXG4gICAgaWYgKCFjb25maWcubWFuYWdlZFdpZGdldElkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBXYXRjaCBmb3IgaWRlbnRpZnkgcG9wdXAgYXBwZWFyaW5nL2Rpc2FwcGVhcmluZ1xuICAgIHRoaXMuaWRlbnRpZnlQb3B1cE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgY29uc3QgaWRlbnRpZnlQb3B1cElzT3BlbiA9IGlzSWRlbnRpZnlQb3B1cE9wZW4oKVxuICAgICAgY29uc3QgaWRlbnRpZnlQb3B1cEp1c3RPcGVuZWQgPSAhdGhpcy5pZGVudGlmeVBvcHVwV2FzT3BlbiAmJiBpZGVudGlmeVBvcHVwSXNPcGVuXG4gICAgICBjb25zdCBpZGVudGlmeVBvcHVwSnVzdENsb3NlZCA9IHRoaXMuaWRlbnRpZnlQb3B1cFdhc09wZW4gJiYgIWlkZW50aWZ5UG9wdXBJc09wZW5cblxuICAgICAgaWYgKGlkZW50aWZ5UG9wdXBKdXN0T3BlbmVkKSB7XG4gICAgICAgIC8vIEdldCBjdXJyZW50IHNlbGVjdGlvbiBzdGF0ZSBhdCBtb21lbnQgcG9wdXAgb3BlbnNcbiAgICAgICAgY29uc3Qgb3JpZ2luRFNJZCA9IHRoaXMucXVlcnlTaW1wbGVTZWxlY3Rpb24/LmRhdGFTb3VyY2VJZFxuICAgICAgICBsZXQgY3VycmVudFNlbGVjdGlvbkF0T3BlbjogeyBjb3VudDogbnVtYmVyLCBpZHM6IHN0cmluZ1tdIH0gfCBudWxsID0gbnVsbFxuICAgICAgICBpZiAob3JpZ2luRFNJZCkge1xuICAgICAgICAgIGNvbnN0IGRzTWFuYWdlciA9IERhdGFTb3VyY2VNYW5hZ2VyLmdldEluc3RhbmNlKClcbiAgICAgICAgICBjb25zdCBvcmlnaW5EUyA9IGRzTWFuYWdlci5nZXREYXRhU291cmNlKG9yaWdpbkRTSWQpIGFzIEZlYXR1cmVMYXllckRhdGFTb3VyY2VcbiAgICAgICAgICBpZiAob3JpZ2luRFMpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkSWRzID0gb3JpZ2luRFMuZ2V0U2VsZWN0ZWRSZWNvcmRJZHMoKSB8fCBbXVxuICAgICAgICAgICAgY3VycmVudFNlbGVjdGlvbkF0T3BlbiA9IHtcbiAgICAgICAgICAgICAgY291bnQ6IHNlbGVjdGVkSWRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgaWRzOiBzZWxlY3RlZElkcy5zbGljZSgwLCA1KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnU0VMRUNUSU9OJywge1xuICAgICAgICAgIGV2ZW50OiAnaWRlbnRpZnktcG9wdXAtb3BlbmVkJyxcbiAgICAgICAgICB3aWRnZXRJZDogY29uZmlnLm1hbmFnZWRXaWRnZXRJZCxcbiAgICAgICAgICBoYXNRdWVyeVNpbXBsZVNlbGVjdGlvbjogISF0aGlzLnF1ZXJ5U2ltcGxlU2VsZWN0aW9uLFxuICAgICAgICAgIG91clRyYWNrZWRSZWNvcmRDb3VudDogdGhpcy5xdWVyeVNpbXBsZVNlbGVjdGlvbj8ucmVjb3JkSWRzLmxlbmd0aCB8fCAwLFxuICAgICAgICAgIG91clRyYWNrZWRSZWNvcmRJZHM6IHRoaXMucXVlcnlTaW1wbGVTZWxlY3Rpb24/LnJlY29yZElkcy5zbGljZSgwLCA1KSB8fCBbXSxcbiAgICAgICAgICBoYXNQcmV2aW91c0hhc2hFbnRyeTogISF0aGlzLnByZXZpb3VzSGFzaEVudHJ5LFxuICAgICAgICAgIHByZXZpb3VzSGFzaEVudHJ5T3V0cHV0RHNJZDogdGhpcy5wcmV2aW91c0hhc2hFbnRyeT8ub3V0cHV0RHNJZCB8fCBudWxsLFxuICAgICAgICAgIGN1cnJlbnRTZWxlY3Rpb25BdE9wZW5cbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYgKGlkZW50aWZ5UG9wdXBKdXN0Q2xvc2VkKSB7XG4gICAgICAgIC8vIEdldCBjdXJyZW50IHNlbGVjdGlvbiBzdGF0ZSBhdCBtb21lbnQgcG9wdXAgY2xvc2VzXG4gICAgICAgIGNvbnN0IG9yaWdpbkRTSWQgPSB0aGlzLnF1ZXJ5U2ltcGxlU2VsZWN0aW9uPy5kYXRhU291cmNlSWRcbiAgICAgICAgbGV0IGN1cnJlbnRTZWxlY3Rpb25BdENsb3NlOiB7IGNvdW50OiBudW1iZXIsIGlkczogc3RyaW5nW10gfSB8IG51bGwgPSBudWxsXG4gICAgICAgIGlmIChvcmlnaW5EU0lkKSB7XG4gICAgICAgICAgY29uc3QgZHNNYW5hZ2VyID0gRGF0YVNvdXJjZU1hbmFnZXIuZ2V0SW5zdGFuY2UoKVxuICAgICAgICAgIGNvbnN0IG9yaWdpbkRTID0gZHNNYW5hZ2VyLmdldERhdGFTb3VyY2Uob3JpZ2luRFNJZCkgYXMgRmVhdHVyZUxheWVyRGF0YVNvdXJjZVxuICAgICAgICAgIGlmIChvcmlnaW5EUykge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRJZHMgPSBvcmlnaW5EUy5nZXRTZWxlY3RlZFJlY29yZElkcygpIHx8IFtdXG4gICAgICAgICAgICBjdXJyZW50U2VsZWN0aW9uQXRDbG9zZSA9IHtcbiAgICAgICAgICAgICAgY291bnQ6IHNlbGVjdGVkSWRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgaWRzOiBzZWxlY3RlZElkcy5zbGljZSgwLCA1KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnU0VMRUNUSU9OJywge1xuICAgICAgICAgIGV2ZW50OiAnaWRlbnRpZnktcG9wdXAtY2xvc2VkJyxcbiAgICAgICAgICB3aWRnZXRJZDogY29uZmlnLm1hbmFnZWRXaWRnZXRJZCxcbiAgICAgICAgICBoYXNRdWVyeVNpbXBsZVNlbGVjdGlvbjogISF0aGlzLnF1ZXJ5U2ltcGxlU2VsZWN0aW9uLFxuICAgICAgICAgIG91clRyYWNrZWRSZWNvcmRDb3VudDogdGhpcy5xdWVyeVNpbXBsZVNlbGVjdGlvbj8ucmVjb3JkSWRzLmxlbmd0aCB8fCAwLFxuICAgICAgICAgIG91clRyYWNrZWRSZWNvcmRJZHM6IHRoaXMucXVlcnlTaW1wbGVTZWxlY3Rpb24/LnJlY29yZElkcy5zbGljZSgwLCA1KSB8fCBbXSxcbiAgICAgICAgICBoYXNQcmV2aW91c0hhc2hFbnRyeTogISF0aGlzLnByZXZpb3VzSGFzaEVudHJ5LFxuICAgICAgICAgIHByZXZpb3VzSGFzaEVudHJ5T3V0cHV0RHNJZDogdGhpcy5wcmV2aW91c0hhc2hFbnRyeT8ub3V0cHV0RHNJZCB8fCBudWxsLFxuICAgICAgICAgIGN1cnJlbnRTZWxlY3Rpb25BdENsb3NlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaWRlbnRpZnlQb3B1cFdhc09wZW4gPSBpZGVudGlmeVBvcHVwSXNPcGVuXG4gICAgfSlcblxuICAgIC8vIE9ic2VydmUgdGhlIGRvY3VtZW50IGJvZHkgZm9yIGNoYW5nZXMgdG8gaWRlbnRpZnkgcG9wdXBcbiAgICB0aGlzLmlkZW50aWZ5UG9wdXBPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2FyaWEtaGlkZGVuJywgJ3N0eWxlJ11cbiAgICB9KVxuXG4gICAgLy8gSW5pdGlhbCBjaGVja1xuICAgIHRoaXMuaWRlbnRpZnlQb3B1cFdhc09wZW4gPSBpc0lkZW50aWZ5UG9wdXBPcGVuKClcbiAgICBcbiAgICBkZWJ1Z0xvZ2dlci5sb2coJ1NFTEVDVElPTicsIHtcbiAgICAgIGV2ZW50OiAnaWRlbnRpZnktcG9wdXAtd2F0Y2hpbmctc3RhcnRlZCcsXG4gICAgICB3aWRnZXRJZDogY29uZmlnLm1hbmFnZWRXaWRnZXRJZCxcbiAgICAgIGluaXRpYWxQb3B1cFN0YXRlOiB0aGlzLmlkZW50aWZ5UG9wdXBXYXNPcGVuXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyB3YXRjaGluZyBmb3IgaWRlbnRpZnkgcG9wdXAgb3BlbmluZy9jbG9zaW5nLlxuICAgKi9cbiAgc3RvcElkZW50aWZ5UG9wdXBXYXRjaGluZyA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5pZGVudGlmeVBvcHVwT2JzZXJ2ZXIpIHtcbiAgICAgIHRoaXMuaWRlbnRpZnlQb3B1cE9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICAgICAgdGhpcy5pZGVudGlmeVBvcHVwT2JzZXJ2ZXIgPSBudWxsXG4gICAgfVxuICAgIHRoaXMuaWRlbnRpZnlQb3B1cFdhc09wZW4gPSBmYWxzZVxuICAgIFxuICAgIGNvbnN0IHsgY29uZmlnIH0gPSB0aGlzLnByb3BzXG4gICAgaWYgKGNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpIHtcbiAgICAgIGRlYnVnTG9nZ2VyLmxvZygnU0VMRUNUSU9OJywge1xuICAgICAgICBldmVudDogJ2lkZW50aWZ5LXBvcHVwLXdhdGNoaW5nLXN0b3BwZWQnLFxuICAgICAgICB3aWRnZXRJZDogY29uZmlnLm1hbmFnZWRXaWRnZXRJZFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgLy8gUmVuZGVyIG5vdGhpbmcgdmlzaWJsZSAtIHRoaXMgd2lkZ2V0IGlzIGFsd2F5cyBtb3VudGVkIGJ1dCBpbnZpc2libGVcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBcbiAgICAgICAgY3NzPXtjc3NgXG4gICAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgd2lkdGg6IDFweDtcbiAgICAgICAgICBoZWlnaHQ6IDFweDtcbiAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICAgIG9wYWNpdHk6IDA7XG4gICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgICAgIGB9XG4gICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAvPlxuICAgIClcbiAgfVxufVxuXG4gZXhwb3J0IGZ1bmN0aW9uIF9fc2V0X3dlYnBhY2tfcHVibGljX3BhdGhfXyh1cmwpIHsgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB1cmwgfSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==