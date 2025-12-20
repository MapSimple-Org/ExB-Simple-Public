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
            this.loadWidgetClass(widgetId)
                .then(() => {
                (0,jimu_core__WEBPACK_IMPORTED_MODULE_1__.getAppStore)().dispatch(openAction);
            })
                .then(() => {
                // Give the widget a moment to mount, then notify it to process hash parameters
                setTimeout(() => {
                    const event = new CustomEvent(OPEN_WIDGET_EVENT, {
                        detail: { widgetId },
                        bubbles: true,
                        cancelable: true
                    });
                    window.dispatchEvent(event);
                }, 500);
            })
                .catch((error) => {
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
            if (!hash && !query) {
                return;
            }
            const hashParams = new URLSearchParams(hash);
            const queryParams = new URLSearchParams(query);
            // Check for special qsopen parameter (forces widget to open)
            if (hashParams.get('qsopen') === 'true' || queryParams.get('qsopen') === 'true') {
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
                if (hashParams.has(shortId) || queryParams.has(shortId)) {
                    // Open the widget using the proper API
                    this.openWidget(config.managedWidgetId);
                }
            });
        };
        /**
         * Handles hash change events from the browser.
         * Re-checks parameters when the URL hash changes.
         */
        this.handleHashChange = () => {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9oZWxwZXItc2ltcGxlL2Rpc3QvcnVudGltZS93aWRnZXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQThDO0FBRTlDLE1BQU0sY0FBZSxTQUFRLHlEQUFrQjtJQUEvQzs7UUFDRSxhQUFRLEdBQUcsQ0FBQztnQkFDVixPQUFPLEVBQUUsT0FBTztnQkFDaEIsV0FBVyxFQUFFLG9CQUFvQjtnQkFDakMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUU7b0JBQ3RCLE9BQU8sU0FBUztnQkFDbEIsQ0FBQzthQUNGLENBQUM7SUFDSixDQUFDO0NBQUE7QUFFTSxNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRTs7Ozs7Ozs7Ozs7O0FDWmxELHdFOzs7Ozs7Ozs7OztBQ0FBLHVEOzs7Ozs7Ozs7OztBQ0FBLHdFOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkEsMkI7Ozs7Ozs7Ozs7QUNBQTs7O0tBR0s7QUFDTCxxQkFBdUIsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSm5ELGVBQWU7QUFDd0s7QUFFcEk7QUFDdUI7QUFFMUUsTUFBTSxXQUFXLEdBQUcseUZBQTZCLEVBQUU7QUFFbkQ7OztHQUdHO0FBQ0gsTUFBTSxpQkFBaUIsR0FBRywwQkFBMEI7QUFFcEQ7O0dBRUc7QUFDSCxNQUFNLDJCQUEyQixHQUFHLCtCQUErQjtB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bkMsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJO2dCQUM3QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSTtZQUNsQyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFpZEQsTUFBTTtRQUNKLHVFQUF1RTtRQUN2RSxPQUFPLENBQ0wseUVBQ0UsR0FBRyxFQUFFLDhDQUFHOzs7Ozs7OztTQVFQLGlCQUNXLE1BQU0sR0FDbEIsQ0FDSDtJQUNILENBQUM7O0FBemhCTSxxQkFBYyxHQUFHLDREQUFjO2lFQURuQixNQUFNO0FBNmhCbkIsU0FBUywyQkFBMkIsQ0FBQyxHQUFHLElBQUkscUJBQXVCLEdBQUcsR0FBRyxFQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvaGVscGVyLXNpbXBsZS9zcmMvdmVyc2lvbi1tYW5hZ2VyLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlL2Vtb3Rpb25cIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZVwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwid2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb25cIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL2hlbHBlci1zaW1wbGUvc3JjL3J1bnRpbWUvd2lkZ2V0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCYXNlVmVyc2lvbk1hbmFnZXIgfSBmcm9tICdqaW11LWNvcmUnXG5cbmNsYXNzIFZlcnNpb25NYW5hZ2VyIGV4dGVuZHMgQmFzZVZlcnNpb25NYW5hZ2VyIHtcbiAgdmVyc2lvbnMgPSBbe1xuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgZGVzY3JpcHRpb246ICdUaGUgZmlyc3QgdmVyc2lvbi4nLFxuICAgIHVwZ3JhZGVyOiAob2xkQ29uZmlnKSA9PiB7XG4gICAgICByZXR1cm4gb2xkQ29uZmlnXG4gICAgfVxuICB9XVxufVxuXG5leHBvcnQgY29uc3QgdmVyc2lvbk1hbmFnZXIgPSBuZXcgVmVyc2lvbk1hbmFnZXIoKVxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9fZW1vdGlvbl9yZWFjdF9qc3hfcnVudGltZV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X2NvcmVfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfd2lkZ2V0c19zaGFyZWRfY29kZV9jb21tb25fXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCIvKiogQGpzeCBqc3ggKi9cbmltcG9ydCB7IFJlYWN0LCBqc3gsIGNzcywgdHlwZSBBbGxXaWRnZXRQcm9wcywgZ2V0QXBwU3RvcmUsIHR5cGUgSU1TdGF0ZSwgV2lkZ2V0TWFuYWdlciwgYXBwQWN0aW9ucywgRGF0YVNvdXJjZU1hbmFnZXIsIHR5cGUgRGF0YVNvdXJjZSwgdHlwZSBGZWF0dXJlTGF5ZXJEYXRhU291cmNlIH0gZnJvbSAnamltdS1jb3JlJ1xuaW1wb3J0IHsgdHlwZSBJTUNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZydcbmltcG9ydCB7IHZlcnNpb25NYW5hZ2VyIH0gZnJvbSAnLi4vdmVyc2lvbi1tYW5hZ2VyJ1xuaW1wb3J0IHsgY3JlYXRlSGVscGVyU2ltcGxlRGVidWdMb2dnZXIgfSBmcm9tICd3aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbidcblxuY29uc3QgZGVidWdMb2dnZXIgPSBjcmVhdGVIZWxwZXJTaW1wbGVEZWJ1Z0xvZ2dlcigpXG5cbi8qKlxuICogQ3VzdG9tIGV2ZW50IG5hbWUgZm9yIG5vdGlmeWluZyBtYW5hZ2VkIHdpZGdldHMgdG8gcHJvY2VzcyBoYXNoIHBhcmFtZXRlcnMuXG4gKiBUaGlzIGV2ZW50IGlzIGRpc3BhdGNoZWQgYWZ0ZXIgYSB3aWRnZXQgaXMgb3BlbmVkIGluIGEgY29udHJvbGxlci5cbiAqL1xuY29uc3QgT1BFTl9XSURHRVRfRVZFTlQgPSAnaGVscGVyc2ltcGxlLW9wZW4td2lkZ2V0J1xuXG4vKipcbiAqIEN1c3RvbSBldmVudCBuYW1lIGZvciBRdWVyeVNpbXBsZSB0byBub3RpZnkgSGVscGVyU2ltcGxlIG9mIHNlbGVjdGlvbiBjaGFuZ2VzLlxuICovXG5jb25zdCBRVUVSWVNJTVBMRV9TRUxFQ1RJT05fRVZFTlQgPSAncXVlcnlzaW1wbGUtc2VsZWN0aW9uLWNoYW5nZWQnXG5cbi8qKlxuICogQ3VzdG9tIGV2ZW50IG5hbWUgZm9yIFF1ZXJ5U2ltcGxlIHRvIG5vdGlmeSBIZWxwZXJTaW1wbGUgb2Ygd2lkZ2V0IG9wZW4vY2xvc2Ugc3RhdGUuXG4gKi9cbmNvbnN0IFFVRVJZU0lNUExFX1dJREdFVF9TVEFURV9FVkVOVCA9ICdxdWVyeXNpbXBsZS13aWRnZXQtc3RhdGUtY2hhbmdlZCdcblxuLyoqXG4gKiBEZXRlY3RzIGlmIGFuIGlkZW50aWZ5IHBvcHVwIGlzIGN1cnJlbnRseSB2aXNpYmxlIGluIHRoZSBET00uXG4gKiBVc2VzIHZlcmlmaWVkIHNlbGVjdG9ycyBiYXNlZCBvbiBFeHBlcmllbmNlIEJ1aWxkZXIncyBpZGVudGlmeSBwb3B1cCBzdHJ1Y3R1cmUuXG4gKiBcbiAqIEByZXR1cm5zIHRydWUgaWYgaWRlbnRpZnkgcG9wdXAgaXMgZGV0ZWN0ZWQgYW5kIHZpc2libGUsIGZhbHNlIG90aGVyd2lzZVxuICovXG5mdW5jdGlvbiBpc0lkZW50aWZ5UG9wdXBPcGVuKCk6IGJvb2xlYW4ge1xuICAvLyBQcmltYXJ5IHNlbGVjdG9yOiAuZXNyaS1wb3B1cCB3aXRoIHJvbGU9XCJkaWFsb2dcIlxuICBjb25zdCBwb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lc3JpLXBvcHVwW3JvbGU9XCJkaWFsb2dcIl0nKVxuICBcbiAgaWYgKCFwb3B1cCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIFxuICAvLyBWZXJpZnkgaXQncyB2aXNpYmxlIChub3QgaGlkZGVuKVxuICBjb25zdCBhcmlhSGlkZGVuID0gcG9wdXAuZ2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicpXG4gIGlmIChhcmlhSGlkZGVuID09PSAndHJ1ZScpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBcbiAgLy8gQWRkaXRpb25hbCBjaGVjazogdmVyaWZ5IGNvbXB1dGVkIHN0eWxlIHNob3dzIGl0J3MgdmlzaWJsZVxuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHBvcHVwKVxuICBpZiAoc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnIHx8IHN0eWxlLnZpc2liaWxpdHkgPT09ICdoaWRkZW4nIHx8IHN0eWxlLm9wYWNpdHkgPT09ICcwJykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIFxuICAvLyBWZXJpZnkgaXQgY29udGFpbnMgZXNyaS1mZWF0dXJlcyAoaWRlbnRpZnkgcG9wdXAgc3RydWN0dXJlKVxuICBjb25zdCBoYXNGZWF0dXJlcyA9IHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5lc3JpLWZlYXR1cmVzJylcbiAgaWYgKCFoYXNGZWF0dXJlcykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIFxuICByZXR1cm4gdHJ1ZVxufVxuXG4vKipcbiAqIEhlbHBlclNpbXBsZSBXaWRnZXRcbiAqIFxuICogQSBoZWxwZXIgd2lkZ2V0IHRoYXQgbW9uaXRvcnMgVVJMIGhhc2ggcGFyYW1ldGVycyBhbmQgYXV0b21hdGljYWxseSBvcGVuc1xuICogbWFuYWdlZCB3aWRnZXRzIGluIGNvbnRyb2xsZXJzIHdoZW4gbWF0Y2hpbmcgc2hvcnRJZHMgYXJlIGRldGVjdGVkLlxuICogXG4gKiBUaGlzIHdpZGdldCBpcyBhbHdheXMgbW91bnRlZCBidXQgaW52aXNpYmxlLCBhbGxvd2luZyBpdCB0byBsaXN0ZW4gZm9yIGhhc2hcbiAqIGNoYW5nZXMgZXZlbiB3aGVuIG90aGVyIHdpZGdldHMgYXJlIGNsb3NlZCBpbiBjb250cm9sbGVycy5cbiAqIFxuICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuYXJjZ2lzLmNvbS9leHBlcmllbmNlLWJ1aWxkZXIvc2FtcGxlLWNvZGUvd2lkZ2V0cy9jb250cm9sLXRoZS13aWRnZXQtc3RhdGUvXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdpZGdldCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8QWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+PiB7XG4gIHN0YXRpYyB2ZXJzaW9uTWFuYWdlciA9IHZlcnNpb25NYW5hZ2VyXG5cbiAgLy8gU2VsZWN0aW9uIHRyYWNraW5nIGZvciBsb2dnaW5nL2RlYnVnZ2luZyBwdXJwb3NlcyAobm90IHVzZWQgZm9yIHJlc3RvcmF0aW9uKVxuICBwcml2YXRlIHF1ZXJ5U2ltcGxlU2VsZWN0aW9uOiB7IHJlY29yZElkczogc3RyaW5nW10sIGRhdGFTb3VyY2VJZD86IHN0cmluZyB9IHwgbnVsbCA9IG51bGxcbiAgcHJpdmF0ZSBwcmV2aW91c0hhc2hFbnRyeTogeyBvdXRwdXREc0lkOiBzdHJpbmcsIHJlY29yZElkczogc3RyaW5nW10gfSB8IG51bGwgPSBudWxsXG4gIHByaXZhdGUgcXVlcnlTaW1wbGVXaWRnZXRJc09wZW46IGJvb2xlYW4gPSBmYWxzZVxuICBwcml2YXRlIHByZXZpb3VzV2lkZ2V0U3RhdGU6IGJvb2xlYW4gfCBudWxsID0gbnVsbFxuICBcbiAgLy8gSWRlbnRpZnkgcG9wdXAgZGV0ZWN0aW9uIGZvciBsb2dnaW5nIChubyByZXN0b3JhdGlvbilcbiAgcHJpdmF0ZSBpZGVudGlmeVBvcHVwT2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbFxuICBwcml2YXRlIGlkZW50aWZ5UG9wdXBXYXNPcGVuOiBib29sZWFuID0gZmFsc2VcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAvLyBMaXN0ZW4gZm9yIGhhc2ggY2hhbmdlcyB0byBkZXRlY3Qgd2hlbiBVUkwgaGFzaCBwYXJhbWV0ZXJzIGFyZSB1cGRhdGVkXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCB0aGlzLmhhbmRsZUhhc2hDaGFuZ2UpXG4gICAgLy8gQ2hlY2sgaGFzaCBvbiBpbml0aWFsIG1vdW50XG4gICAgdGhpcy5jaGVja1VybFBhcmFtZXRlcnMoKVxuICAgIFxuICAgIC8vIExpc3RlbiBmb3IgUXVlcnlTaW1wbGUgc2VsZWN0aW9uIGNoYW5nZXMgKGZvciBsb2dnaW5nL2RlYnVnZ2luZylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihRVUVSWVNJTVBMRV9TRUxFQ1RJT05fRVZFTlQsIHRoaXMuaGFuZGxlUXVlcnlTaW1wbGVTZWxlY3Rpb25DaGFuZ2UpXG4gICAgXG4gICAgLy8gTGlzdGVuIGZvciBRdWVyeVNpbXBsZSB3aWRnZXQgc3RhdGUgY2hhbmdlcyAob3Blbi9jbG9zZSlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihRVUVSWVNJTVBMRV9XSURHRVRfU1RBVEVfRVZFTlQsIHRoaXMuaGFuZGxlUXVlcnlTaW1wbGVXaWRnZXRTdGF0ZUNoYW5nZSlcbiAgICBcbiAgICAvLyBJbml0aWFsaXplIGhhc2ggZW50cnkgdHJhY2tpbmcgZm9yIGxvZ2dpbmcvZGVidWdnaW5nXG4gICAgaWYgKHRoaXMucHJvcHMuY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgdGhpcy5wcmV2aW91c0hhc2hFbnRyeSA9IHRoaXMucGFyc2VIYXNoRm9yV2lkZ2V0U2VsZWN0aW9uKHRoaXMucHJvcHMuY29uZmlnLm1hbmFnZWRXaWRnZXRJZClcbiAgICAgIC8vIFN0YXJ0IHdhdGNoaW5nIGZvciBpZGVudGlmeSBwb3B1cCAobG9nZ2luZyBvbmx5LCBubyByZXN0b3JhdGlvbilcbiAgICAgIHRoaXMuc3RhcnRJZGVudGlmeVBvcHVwV2F0Y2hpbmcoKVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy5oYW5kbGVIYXNoQ2hhbmdlKVxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFFVRVJZU0lNUExFX1NFTEVDVElPTl9FVkVOVCwgdGhpcy5oYW5kbGVRdWVyeVNpbXBsZVNlbGVjdGlvbkNoYW5nZSlcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihRVUVSWVNJTVBMRV9XSURHRVRfU1RBVEVfRVZFTlQsIHRoaXMuaGFuZGxlUXVlcnlTaW1wbGVXaWRnZXRTdGF0ZUNoYW5nZSlcbiAgICB0aGlzLnN0b3BJZGVudGlmeVBvcHVwV2F0Y2hpbmcoKVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogQWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+KSB7XG4gICAgLy8gUmUtY2hlY2sgcGFyYW1ldGVycyBpZiBtYW5hZ2VkIHdpZGdldCBjb25maWd1cmF0aW9uIGNoYW5nZWRcbiAgICBpZiAocHJldlByb3BzLmNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQgIT09IHRoaXMucHJvcHMuY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgdGhpcy5jaGVja1VybFBhcmFtZXRlcnMoKVxuICAgIH1cbiAgICBcbiAgICAvLyBSZS1pbml0aWFsaXplIGhhc2ggZW50cnkgdHJhY2tpbmcgYW5kIGlkZW50aWZ5IHBvcHVwIHdhdGNoaW5nIGlmIGNvbmZpZyBjaGFuZ2VkXG4gICAgaWYgKHByZXZQcm9wcy5jb25maWcubWFuYWdlZFdpZGdldElkICE9PSB0aGlzLnByb3BzLmNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpIHtcbiAgICAgIHRoaXMuc3RvcElkZW50aWZ5UG9wdXBXYXRjaGluZygpXG4gICAgICBpZiAodGhpcy5wcm9wcy5jb25maWcubWFuYWdlZFdpZGdldElkKSB7XG4gICAgICAgIHRoaXMucHJldmlvdXNIYXNoRW50cnkgPSB0aGlzLnBhcnNlSGFzaEZvcldpZGdldFNlbGVjdGlvbih0aGlzLnByb3BzLmNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpXG4gICAgICAgIHRoaXMuc3RhcnRJZGVudGlmeVBvcHVwV2F0Y2hpbmcoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcmV2aW91c0hhc2hFbnRyeSA9IG51bGxcbiAgICAgICAgdGhpcy5xdWVyeVNpbXBsZVNlbGVjdGlvbiA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdHMgYWxsIHNob3J0SWRzIGZyb20gdGhlIG1hbmFnZWQgd2lkZ2V0J3MgcXVlcnkgaXRlbXMuXG4gICAqIFxuICAgKiBAcGFyYW0gd2lkZ2V0SWQgLSBUaGUgSUQgb2YgdGhlIHdpZGdldCB0byBleHRyYWN0IHNob3J0SWRzIGZyb21cbiAgICogQHJldHVybnMgQXJyYXkgb2Ygc2hvcnRJZCBzdHJpbmdzIGZvdW5kIGluIHRoZSB3aWRnZXQncyBxdWVyeSBpdGVtc1xuICAgKi9cbiAgZ2V0V2lkZ2V0U2hvcnRJZHMgPSAod2lkZ2V0SWQ6IHN0cmluZyk6IHN0cmluZ1tdID0+IHtcbiAgICBjb25zdCBzdGF0ZTogSU1TdGF0ZSA9IGdldEFwcFN0b3JlKCkuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IGFwcENvbmZpZyA9IHdpbmRvdy5qaW11Q29uZmlnPy5pc0J1aWxkZXIgXG4gICAgICA/IHN0YXRlLmFwcFN0YXRlSW5CdWlsZGVyPy5hcHBDb25maWcgXG4gICAgICA6IHN0YXRlLmFwcENvbmZpZ1xuICAgIFxuICAgIGlmICghYXBwQ29uZmlnPy53aWRnZXRzPy5bd2lkZ2V0SWRdKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG4gICAgXG4gICAgaWYgKCFhcHBDb25maWcud2lkZ2V0c1t3aWRnZXRJZF0uY29uZmlnPy5xdWVyeUl0ZW1zKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG5cbiAgICBjb25zdCBxdWVyeUl0ZW1zID0gYXBwQ29uZmlnLndpZGdldHNbd2lkZ2V0SWRdLmNvbmZpZy5xdWVyeUl0ZW1zXG4gICAgY29uc3Qgc2hvcnRJZHM6IHN0cmluZ1tdID0gW11cbiAgICBcbiAgICBxdWVyeUl0ZW1zLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgaWYgKGl0ZW0uc2hvcnRJZCAmJiBpdGVtLnNob3J0SWQudHJpbSgpICE9PSAnJykge1xuICAgICAgICBzaG9ydElkcy5wdXNoKGl0ZW0uc2hvcnRJZClcbiAgICAgIH1cbiAgICB9KVxuICAgIFxuICAgIHJldHVybiBzaG9ydElkc1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIHRoZSB3aWRnZXQgY2xhc3MgcHJpb3IgdG8gZXhlY3V0aW5nIHRoZSBvcGVuIGFjdGlvbi5cbiAgICogVGhpcyBpcyByZXF1aXJlZCBieSB0aGUgRXhwZXJpZW5jZSBCdWlsZGVyIEFQSSBiZWZvcmUgb3BlbmluZyB3aWRnZXRzLlxuICAgKiBcbiAgICogQHBhcmFtIHdpZGdldElkIC0gVGhlIElEIG9mIHRoZSB3aWRnZXQgdG8gbG9hZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgd2lkZ2V0IGNsYXNzIGNvbXBvbmVudFxuICAgKiBcbiAgICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuYXJjZ2lzLmNvbS9leHBlcmllbmNlLWJ1aWxkZXIvc2FtcGxlLWNvZGUvd2lkZ2V0cy9jb250cm9sLXRoZS13aWRnZXQtc3RhdGUvXG4gICAqL1xuICBsb2FkV2lkZ2V0Q2xhc3MgPSAod2lkZ2V0SWQ6IHN0cmluZyk6IFByb21pc2U8UmVhY3QuQ29tcG9uZW50VHlwZTxhbnk+PiA9PiB7XG4gICAgaWYgKCF3aWRnZXRJZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKVxuICAgIH1cbiAgICBcbiAgICBjb25zdCBpc0NsYXNzTG9hZGVkID0gZ2V0QXBwU3RvcmUoKS5nZXRTdGF0ZSgpLndpZGdldHNSdW50aW1lSW5mbz8uW3dpZGdldElkXT8uaXNDbGFzc0xvYWRlZFxuICAgIFxuICAgIGlmICghaXNDbGFzc0xvYWRlZCkge1xuICAgICAgcmV0dXJuIFdpZGdldE1hbmFnZXIuZ2V0SW5zdGFuY2UoKS5sb2FkV2lkZ2V0Q2xhc3Mod2lkZ2V0SWQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoV2lkZ2V0TWFuYWdlci5nZXRJbnN0YW5jZSgpLmdldFdpZGdldENsYXNzKHdpZGdldElkKSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgYSB3aWRnZXQgaW4gYSBjb250cm9sbGVyIHVzaW5nIHRoZSBFeHBlcmllbmNlIEJ1aWxkZXIgQVBJLlxuICAgKiBcbiAgICogVGhpcyBtZXRob2Q6XG4gICAqIDEuIExvYWRzIHRoZSB3aWRnZXQgY2xhc3MgaWYgbm90IGFscmVhZHkgbG9hZGVkXG4gICAqIDIuIERpc3BhdGNoZXMgdGhlIG9wZW5XaWRnZXQgYWN0aW9uIHZpYSBSZWR1eFxuICAgKiAzLiBOb3RpZmllcyB0aGUgd2lkZ2V0IHRvIHByb2Nlc3MgaGFzaCBwYXJhbWV0ZXJzIGFmdGVyIG9wZW5pbmdcbiAgICogXG4gICAqIEBwYXJhbSB3aWRnZXRJZCAtIFRoZSBJRCBvZiB0aGUgd2lkZ2V0IHRvIG9wZW5cbiAgICogXG4gICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmFyY2dpcy5jb20vZXhwZXJpZW5jZS1idWlsZGVyL3NhbXBsZS1jb2RlL3dpZGdldHMvY29udHJvbC10aGUtd2lkZ2V0LXN0YXRlL1xuICAgKi9cbiAgb3BlbldpZGdldCA9ICh3aWRnZXRJZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgY29uc3Qgb3BlbkFjdGlvbiA9IGFwcEFjdGlvbnMub3BlbldpZGdldCh3aWRnZXRJZClcbiAgICBcbiAgICB0aGlzLmxvYWRXaWRnZXRDbGFzcyh3aWRnZXRJZClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgZ2V0QXBwU3RvcmUoKS5kaXNwYXRjaChvcGVuQWN0aW9uKVxuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gR2l2ZSB0aGUgd2lkZ2V0IGEgbW9tZW50IHRvIG1vdW50LCB0aGVuIG5vdGlmeSBpdCB0byBwcm9jZXNzIGhhc2ggcGFyYW1ldGVyc1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBDdXN0b21FdmVudChPUEVOX1dJREdFVF9FVkVOVCwge1xuICAgICAgICAgICAgZGV0YWlsOiB7IHdpZGdldElkIH0sXG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoZXZlbnQpXG4gICAgICAgIH0sIDUwMClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIFNpbGVudGx5IGhhbmRsZSBlcnJvcnMgLSB3aWRnZXQgbWF5IGFscmVhZHkgYmUgb3BlbiBvciBub3QgaW4gYSBjb250cm9sbGVyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tIZWxwZXJTaW1wbGVdIEVycm9yIG9wZW5pbmcgd2lkZ2V0OicsIGVycm9yKVxuICAgICAgICB9XG4gICAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBVUkwgaGFzaCBhbmQgcXVlcnkgc3RyaW5nIHBhcmFtZXRlcnMgZm9yIHNob3J0SWRzIHRoYXQgbWF0Y2ggdGhlIG1hbmFnZWQgd2lkZ2V0LlxuICAgKiBcbiAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgb3BlbnMgdGhlIHdpZGdldCB1c2luZyB0aGUgRXhwZXJpZW5jZSBCdWlsZGVyIEFQSS5cbiAgICogSGFzaCBmb3JtYXQ6ICNzaG9ydElkPXZhbHVlIChlLmcuLCAjcGluPTIyMjMwNTkwMTMpXG4gICAqIFF1ZXJ5IGZvcm1hdDogP3Nob3J0SWQ9dmFsdWUgKGUuZy4sID9waW49MjIyMzA1OTAxMylcbiAgICogXG4gICAqIFNwZWNpYWwgcGFyYW1ldGVyOiAjcXNvcGVuPXRydWUgb3IgP3Fzb3Blbj10cnVlXG4gICAqIEZvcmNlcyB3aWRnZXQgdG8gb3BlbiB3aXRob3V0IHJlcXVpcmluZyBhIHF1ZXJ5IHBhcmFtZXRlciBtYXRjaC5cbiAgICovXG4gIGNoZWNrVXJsUGFyYW1ldGVycyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGNvbmZpZyB9ID0gdGhpcy5wcm9wc1xuICAgIFxuICAgIGlmICghY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gUGFyc2UgVVJMIGhhc2ggZnJhZ21lbnQgYW5kIHF1ZXJ5IHN0cmluZ1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSlcbiAgICBjb25zdCBxdWVyeSA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpXG4gICAgXG4gICAgaWYgKCFoYXNoICYmICFxdWVyeSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGhhc2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGhhc2gpXG4gICAgY29uc3QgcXVlcnlQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJ5KVxuICAgIFxuICAgIC8vIENoZWNrIGZvciBzcGVjaWFsIHFzb3BlbiBwYXJhbWV0ZXIgKGZvcmNlcyB3aWRnZXQgdG8gb3BlbilcbiAgICBpZiAoaGFzaFBhcmFtcy5nZXQoJ3Fzb3BlbicpID09PSAndHJ1ZScgfHwgcXVlcnlQYXJhbXMuZ2V0KCdxc29wZW4nKSA9PT0gJ3RydWUnKSB7XG4gICAgICB0aGlzLm9wZW5XaWRnZXQoY29uZmlnLm1hbmFnZWRXaWRnZXRJZClcbiAgICAgIHJldHVybiBcbiAgICB9XG5cbiAgICAvLyBHZXQgYWxsIHNob3J0SWRzIGZyb20gdGhlIG1hbmFnZWQgd2lkZ2V0XG4gICAgY29uc3Qgc2hvcnRJZHMgPSB0aGlzLmdldFdpZGdldFNob3J0SWRzKGNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpXG4gICAgXG4gICAgaWYgKHNob3J0SWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIFxuICAgIC8vIENoZWNrIGlmIGFueSBzaG9ydElkIG1hdGNoZXMgaW4gZWl0aGVyIGhhc2ggb3IgcXVlcnkgc3RyaW5nXG4gICAgc2hvcnRJZHMuZm9yRWFjaChzaG9ydElkID0+IHtcbiAgICAgIGlmIChoYXNoUGFyYW1zLmhhcyhzaG9ydElkKSB8fCBxdWVyeVBhcmFtcy5oYXMoc2hvcnRJZCkpIHtcbiAgICAgICAgLy8gT3BlbiB0aGUgd2lkZ2V0IHVzaW5nIHRoZSBwcm9wZXIgQVBJXG4gICAgICAgIHRoaXMub3BlbldpZGdldChjb25maWcubWFuYWdlZFdpZGdldElkKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBoYXNoIGNoYW5nZSBldmVudHMgZnJvbSB0aGUgYnJvd3Nlci5cbiAgICogUmUtY2hlY2tzIHBhcmFtZXRlcnMgd2hlbiB0aGUgVVJMIGhhc2ggY2hhbmdlcy5cbiAgICovXG4gIGhhbmRsZUhhc2hDaGFuZ2UgPSAoKSA9PiB7XG4gICAgLy8gQ2hlY2sgcGFyYW1ldGVycyBmb3Igd2lkZ2V0IG9wZW5pbmdcbiAgICB0aGlzLmNoZWNrVXJsUGFyYW1ldGVycygpXG4gICAgXG4gICAgLy8gVXBkYXRlIGhhc2ggZW50cnkgdHJhY2tpbmcgZm9yIGxvZ2dpbmcvZGVidWdnaW5nXG4gICAgY29uc3QgeyBjb25maWcgfSA9IHRoaXMucHJvcHNcbiAgICBpZiAoY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgdGhpcy5wcmV2aW91c0hhc2hFbnRyeSA9IHRoaXMucGFyc2VIYXNoRm9yV2lkZ2V0U2VsZWN0aW9uKGNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgUXVlcnlTaW1wbGUgc2VsZWN0aW9uIGNoYW5nZSBldmVudHMuXG4gICAqIFN0b3JlcyB0aGUgc2VsZWN0aW9uIHN0YXRlIGFuZCBoYXNoIGVudHJ5IGltbWVkaWF0ZWx5IChldmVudC1kcml2ZW4pLlxuICAgKi9cbiAgaGFuZGxlUXVlcnlTaW1wbGVTZWxlY3Rpb25DaGFuZ2UgPSAoZXZlbnQ6IEN1c3RvbUV2ZW50PHsgd2lkZ2V0SWQ6IHN0cmluZywgcmVjb3JkSWRzOiBzdHJpbmdbXSwgZGF0YVNvdXJjZUlkPzogc3RyaW5nIH0+KSA9PiB7XG4gICAgY29uc3QgeyBjb25maWcgfSA9IHRoaXMucHJvcHNcbiAgICBcbiAgICAvLyBPbmx5IHRyYWNrIGlmIHRoaXMgaXMgb3VyIG1hbmFnZWQgd2lkZ2V0XG4gICAgaWYgKGV2ZW50LmRldGFpbC53aWRnZXRJZCA9PT0gY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgdGhpcy5xdWVyeVNpbXBsZVNlbGVjdGlvbiA9IHtcbiAgICAgICAgcmVjb3JkSWRzOiBldmVudC5kZXRhaWwucmVjb3JkSWRzLFxuICAgICAgICBkYXRhU291cmNlSWQ6IGV2ZW50LmRldGFpbC5kYXRhU291cmNlSWRcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gSW1tZWRpYXRlbHkgY2hlY2sgaGFzaCB0byBnZXQgb3V0cHV0IERTIElEIChldmVudC1kcml2ZW4sIG5vIHBvbGxpbmcpXG4gICAgICBjb25zdCBoYXNoRW50cnkgPSB0aGlzLnBhcnNlSGFzaEZvcldpZGdldFNlbGVjdGlvbihjb25maWcubWFuYWdlZFdpZGdldElkKVxuICAgICAgaWYgKGhhc2hFbnRyeSkge1xuICAgICAgICB0aGlzLnByZXZpb3VzSGFzaEVudHJ5ID0gaGFzaEVudHJ5XG4gICAgICB9XG4gICAgICBcbiAgICAgIGRlYnVnTG9nZ2VyLmxvZygnU0VMRUNUSU9OJywge1xuICAgICAgICBldmVudDogJ3NlbGVjdGlvbi10cmFja2VkLWZyb20tcXVlcnlzaW1wbGUnLFxuICAgICAgICB3aWRnZXRJZDogZXZlbnQuZGV0YWlsLndpZGdldElkLFxuICAgICAgICByZWNvcmRDb3VudDogZXZlbnQuZGV0YWlsLnJlY29yZElkcy5sZW5ndGgsXG4gICAgICAgIGRhdGFTb3VyY2VJZDogZXZlbnQuZGV0YWlsLmRhdGFTb3VyY2VJZCxcbiAgICAgICAgaGFzaEVudHJ5OiB0aGlzLnByZXZpb3VzSGFzaEVudHJ5ID8ge1xuICAgICAgICAgIG91dHB1dERzSWQ6IHRoaXMucHJldmlvdXNIYXNoRW50cnkub3V0cHV0RHNJZCxcbiAgICAgICAgICByZWNvcmRDb3VudDogdGhpcy5wcmV2aW91c0hhc2hFbnRyeS5yZWNvcmRJZHMubGVuZ3RoXG4gICAgICAgIH0gOiBudWxsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIFF1ZXJ5U2ltcGxlIHdpZGdldCBzdGF0ZSBjaGFuZ2VzIChvcGVuL2Nsb3NlKS5cbiAgICovXG4gIGhhbmRsZVF1ZXJ5U2ltcGxlV2lkZ2V0U3RhdGVDaGFuZ2UgPSAoZXZlbnQ6IEN1c3RvbUV2ZW50PHsgd2lkZ2V0SWQ6IHN0cmluZywgaXNPcGVuOiBib29sZWFuIH0+KSA9PiB7XG4gICAgY29uc3QgeyBjb25maWcgfSA9IHRoaXMucHJvcHNcbiAgICBcbiAgICAvLyBPbmx5IHRyYWNrIGlmIHRoaXMgaXMgb3VyIG1hbmFnZWQgd2lkZ2V0XG4gICAgaWYgKGV2ZW50LmRldGFpbC53aWRnZXRJZCA9PT0gY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgY29uc3Qgd2FzT3BlbiA9IHRoaXMucXVlcnlTaW1wbGVXaWRnZXRJc09wZW5cbiAgICAgIGNvbnN0IGlzTm93T3BlbiA9IGV2ZW50LmRldGFpbC5pc09wZW5cbiAgICAgIFxuICAgICAgdGhpcy5xdWVyeVNpbXBsZVdpZGdldElzT3BlbiA9IGlzTm93T3BlblxuICAgICAgXG4gICAgICBkZWJ1Z0xvZ2dlci5sb2coJ1dJREdFVC1TVEFURScsIHtcbiAgICAgICAgZXZlbnQ6ICdxdWVyeXNpbXBsZS13aWRnZXQtc3RhdGUtY2hhbmdlZCcsXG4gICAgICAgIHdpZGdldElkOiBldmVudC5kZXRhaWwud2lkZ2V0SWQsXG4gICAgICAgIGlzT3BlbjogZXZlbnQuZGV0YWlsLmlzT3BlbixcbiAgICAgICAgd2FzT3BlbixcbiAgICAgICAgdHJhbnNpdGlvbjogd2FzT3BlbiAhPT0gaXNOb3dPcGVuID8gKGlzTm93T3BlbiA/ICdjbG9zZWQtdG8tb3BlbicgOiAnb3Blbi10by1jbG9zZWQnKSA6ICduby1jaGFuZ2UnXG4gICAgICB9KVxuICAgICAgXG4gICAgICB0aGlzLnByZXZpb3VzV2lkZ2V0U3RhdGUgPSBpc05vd09wZW5cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSRU1PVkVEOiBQb2xsaW5nLWJhc2VkIHNlbGVjdGlvbiB0cmFja2luZy5cbiAgICogTm93IHVzaW5nIGV2ZW50LWRyaXZlbiBhcHByb2FjaCB2aWEgaGFzaGNoYW5nZSBhbmQgUVVFUllTSU1QTEVfU0VMRUNUSU9OX0VWRU5ULlxuICAgKi9cblxuICAvKipcbiAgICogUGFyc2VzIHRoZSBgZGF0YV9zYCBwYXJhbWV0ZXIgZnJvbSB0aGUgVVJMIGhhc2ggYW5kIGV4dHJhY3RzIHdpZGdldCBvdXRwdXQgZGF0YSBzb3VyY2UgSURzLlxuICAgKiBcbiAgICogSGFzaCBmb3JtYXQ6ICNkYXRhX3M9aWQ6d2lkZ2V0XzEyX291dHB1dF8yODYyODY4Mzk1NzMyNDQ5Nzo0NTEyMDQrNDUxMjA1Ky4uLixpZDouLi5cbiAgICogT1I6ICNkYXRhX3M9aWQ6ZGF0YVNvdXJjZV8xLUtpbmdDb19Qcm9wZXJ0eUluZm9fNjM4Nl81Mzc1LTJ+d2lkZ2V0XzE1X291dHB1dF80NTA0NDQwMzY3ODcwNTc5OjQ1MTMxN1xuICAgKiBcbiAgICogQHBhcmFtIHdpZGdldElkIC0gVGhlIHdpZGdldCBJRCB0byBtYXRjaCAoZS5nLiwgXCJ3aWRnZXRfMTJcIilcbiAgICogQHJldHVybnMgT2JqZWN0IHdpdGggb3V0cHV0RHNJZCBhbmQgcmVjb3JkSWRzLCBvciBudWxsIGlmIG5vdCBmb3VuZFxuICAgKi9cbiAgcGFyc2VIYXNoRm9yV2lkZ2V0U2VsZWN0aW9uID0gKHdpZGdldElkOiBzdHJpbmcpOiB7IG91dHB1dERzSWQ6IHN0cmluZywgcmVjb3JkSWRzOiBzdHJpbmdbXSB9IHwgbnVsbCA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKVxuICAgIGlmICghaGFzaCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGhhc2gpXG4gICAgY29uc3QgZGF0YVMgPSB1cmxQYXJhbXMuZ2V0KCdkYXRhX3MnKVxuICAgIGlmICghZGF0YVMpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgLy8gVVJMIGRlY29kZSB0aGUgZGF0YV9zIHBhcmFtZXRlclxuICAgIGNvbnN0IGRlY29kZWREYXRhUyA9IGRlY29kZVVSSUNvbXBvbmVudChkYXRhUylcbiAgICBcbiAgICAvLyBTcGxpdCBieSBjb21tYSB0byBnZXQgaW5kaXZpZHVhbCBzZWxlY3Rpb25zXG4gICAgY29uc3Qgc2VsZWN0aW9ucyA9IGRlY29kZWREYXRhUy5zcGxpdCgnLCcpXG4gICAgXG4gICAgLy8gUGF0dGVybiB0byBtYXRjaDogd2lkZ2V0X1hYX291dHB1dF8qICh3aGVyZSBYWCBpcyB0aGUgd2lkZ2V0IElEIG51bWJlcilcbiAgICAvLyBFeHRyYWN0IHdpZGdldCBudW1iZXIgZnJvbSB3aWRnZXRJZCAoZS5nLiwgXCJ3aWRnZXRfMTJcIiAtPiBcIjEyXCIpXG4gICAgY29uc3Qgd2lkZ2V0TWF0Y2ggPSB3aWRnZXRJZC5tYXRjaCgvd2lkZ2V0XyhcXGQrKS8pXG4gICAgaWYgKCF3aWRnZXRNYXRjaCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgY29uc3Qgd2lkZ2V0TnVtYmVyID0gd2lkZ2V0TWF0Y2hbMV1cbiAgICBjb25zdCB3aWRnZXRQYXR0ZXJuID0gbmV3IFJlZ0V4cChgd2lkZ2V0XyR7d2lkZ2V0TnVtYmVyfV9vdXRwdXRfXFxcXGQrYClcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHNlbGVjdGlvbnMpIHtcbiAgICAgIC8vIEZvcm1hdDogaWQ6V0lER0VUX09VVFBVVF9EU19JRDpSRUNPUkRfSURTXG4gICAgICAvLyBPUjogaWQ6REFUQV9TT1VSQ0VfSUR+V0lER0VUX09VVFBVVF9EU19JRDpSRUNPUkRfSURTXG4gICAgICBpZiAoIXNlbGVjdGlvbi5zdGFydHNXaXRoKCdpZDonKSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBpZFBhcnQgPSBzZWxlY3Rpb24uc3Vic3RyaW5nKDMpIC8vIFJlbW92ZSBcImlkOlwiXG4gICAgICBjb25zdCBjb2xvbkluZGV4ID0gaWRQYXJ0Lmxhc3RJbmRleE9mKCc6JylcbiAgICAgIGlmIChjb2xvbkluZGV4ID09PSAtMSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBkc0lkUGFydCA9IGlkUGFydC5zdWJzdHJpbmcoMCwgY29sb25JbmRleClcbiAgICAgIGNvbnN0IHJlY29yZElkc1BhcnQgPSBpZFBhcnQuc3Vic3RyaW5nKGNvbG9uSW5kZXggKyAxKVxuXG4gICAgICAvLyBDaGVjayBpZiB0aGlzIG1hdGNoZXMgb3VyIHdpZGdldCdzIG91dHB1dCBEUyBwYXR0ZXJuXG4gICAgICAvLyBIYW5kbGUgYm90aCBmb3JtYXRzOiB3aWRnZXRfWFhfb3V0cHV0Xyogb3IgZGF0YVNvdXJjZV8qfndpZGdldF9YWF9vdXRwdXRfKlxuICAgICAgLy8gSU1QT1JUQU5UOiBDaGVjayBmb3IgY29tcG91bmQgZm9ybWF0IEZJUlNUIChjb250YWlucyB+KVxuICAgICAgLy8gT3RoZXJ3aXNlIHRoZSByZWdleCB3aWxsIG1hdGNoIHRoZSBwYXR0ZXJuIHdpdGhpbiB0aGUgY29tcG91bmQgc3RyaW5nXG4gICAgICBsZXQgb3V0cHV0RHNJZDogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgICAgIGlmIChkc0lkUGFydC5pbmNsdWRlcygnficpKSB7XG4gICAgICAgIC8vIENvbXBvdW5kIGZvcm1hdDogZGF0YVNvdXJjZV8qfndpZGdldF9YWF9vdXRwdXRfKlxuICAgICAgICBjb25zdCBwYXJ0cyA9IGRzSWRQYXJ0LnNwbGl0KCd+JylcbiAgICAgICAgZGVidWdMb2dnZXIubG9nKCdIQVNIJywge1xuICAgICAgICAgIGV2ZW50OiAncGFyc2luZy1jb21wb3VuZC1oYXNoLWZvcm1hdCcsXG4gICAgICAgICAgd2lkZ2V0SWQsXG4gICAgICAgICAgZHNJZFBhcnQsXG4gICAgICAgICAgcGFydHMsXG4gICAgICAgICAgd2lkZ2V0UGF0dGVybjogd2lkZ2V0UGF0dGVybi50b1N0cmluZygpXG4gICAgICAgIH0pXG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgICAgICAgIGlmIChwYXJ0Lm1hdGNoKHdpZGdldFBhdHRlcm4pKSB7XG4gICAgICAgICAgICBvdXRwdXREc0lkID0gcGFydFxuICAgICAgICAgICAgZGVidWdMb2dnZXIubG9nKCdIQVNIJywge1xuICAgICAgICAgICAgICBldmVudDogJ2ZvdW5kLW1hdGNoaW5nLXdpZGdldC1vdXRwdXQtZHMtaWQtY29tcG91bmQtZm9ybWF0JyxcbiAgICAgICAgICAgICAgd2lkZ2V0SWQsXG4gICAgICAgICAgICAgIG91dHB1dERzSWQsXG4gICAgICAgICAgICAgIHBhcnQsXG4gICAgICAgICAgICAgIGFsbFBhcnRzOiBwYXJ0c1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghb3V0cHV0RHNJZCkge1xuICAgICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSCcsIHtcbiAgICAgICAgICAgIGV2ZW50OiAnbm8tbWF0Y2hpbmctd2lkZ2V0LW91dHB1dC1kcy1pZC1jb21wb3VuZC1mb3JtYXQnLFxuICAgICAgICAgICAgd2lkZ2V0SWQsXG4gICAgICAgICAgICBkc0lkUGFydCxcbiAgICAgICAgICAgIHBhcnRzLFxuICAgICAgICAgICAgd2lkZ2V0UGF0dGVybjogd2lkZ2V0UGF0dGVybi50b1N0cmluZygpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkc0lkUGFydC5tYXRjaCh3aWRnZXRQYXR0ZXJuKSkge1xuICAgICAgICAvLyBEaXJlY3QgZm9ybWF0OiB3aWRnZXRfWFhfb3V0cHV0XyogKG5vIH4gc2VwYXJhdG9yKVxuICAgICAgICBvdXRwdXREc0lkID0gZHNJZFBhcnRcbiAgICAgICAgZGVidWdMb2dnZXIubG9nKCdIQVNIJywge1xuICAgICAgICAgIGV2ZW50OiAnZm91bmQtZGlyZWN0LWZvcm1hdC13aWRnZXQtb3V0cHV0LWRzLWlkJyxcbiAgICAgICAgICB3aWRnZXRJZCxcbiAgICAgICAgICBkc0lkUGFydCxcbiAgICAgICAgICBvdXRwdXREc0lkXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmIChvdXRwdXREc0lkKSB7XG4gICAgICAgIC8vIFBhcnNlIHJlY29yZCBJRHMgKHNlcGFyYXRlZCBieSArKVxuICAgICAgICBjb25zdCByZWNvcmRJZHMgPSByZWNvcmRJZHNQYXJ0LnNwbGl0KCcrJykuZmlsdGVyKGlkID0+IGlkLmxlbmd0aCA+IDApXG4gICAgICAgIGRlYnVnTG9nZ2VyLmxvZygnSEFTSCcsIHtcbiAgICAgICAgICBldmVudDogJ3BhcnNlZC1oYXNoLWVudHJ5LXN1Y2Nlc3NmdWxseScsXG4gICAgICAgICAgd2lkZ2V0SWQsXG4gICAgICAgICAgb3V0cHV0RHNJZCxcbiAgICAgICAgICByZWNvcmRDb3VudDogcmVjb3JkSWRzLmxlbmd0aCxcbiAgICAgICAgICByZWNvcmRJZHM6IHJlY29yZElkcy5zbGljZSgwLCA1KVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4geyBvdXRwdXREc0lkLCByZWNvcmRJZHMgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVidWdMb2dnZXIubG9nKCdIQVNIJywge1xuICAgICAgICAgIGV2ZW50OiAnbm8td2lkZ2V0LW91dHB1dC1kcy1pZC1mb3VuZC1pbi1oYXNoJyxcbiAgICAgICAgICB3aWRnZXRJZCxcbiAgICAgICAgICBkc0lkUGFydCxcbiAgICAgICAgICB3aWRnZXRQYXR0ZXJuOiB3aWRnZXRQYXR0ZXJuLnRvU3RyaW5nKClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB3YXRjaGluZyBmb3IgaWRlbnRpZnkgcG9wdXAgb3BlbmluZy9jbG9zaW5nIHVzaW5nIE11dGF0aW9uT2JzZXJ2ZXIuXG4gICAqIExvZ3MgcG9wdXAgc3RhdGUgY2hhbmdlcyBmb3IgZGVidWdnaW5nIChubyByZXN0b3JhdGlvbiBsb2dpYykuXG4gICAqL1xuICBzdGFydElkZW50aWZ5UG9wdXBXYXRjaGluZyA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5pZGVudGlmeVBvcHVwT2JzZXJ2ZXIpIHtcbiAgICAgIHJldHVybiAvLyBBbHJlYWR5IHdhdGNoaW5nXG4gICAgfVxuXG4gICAgY29uc3QgeyBjb25maWcgfSA9IHRoaXMucHJvcHNcbiAgICBpZiAoIWNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFdhdGNoIGZvciBpZGVudGlmeSBwb3B1cCBhcHBlYXJpbmcvZGlzYXBwZWFyaW5nXG4gICAgdGhpcy5pZGVudGlmeVBvcHVwT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICBjb25zdCBpZGVudGlmeVBvcHVwSXNPcGVuID0gaXNJZGVudGlmeVBvcHVwT3BlbigpXG4gICAgICBjb25zdCBpZGVudGlmeVBvcHVwSnVzdE9wZW5lZCA9ICF0aGlzLmlkZW50aWZ5UG9wdXBXYXNPcGVuICYmIGlkZW50aWZ5UG9wdXBJc09wZW5cbiAgICAgIGNvbnN0IGlkZW50aWZ5UG9wdXBKdXN0Q2xvc2VkID0gdGhpcy5pZGVudGlmeVBvcHVwV2FzT3BlbiAmJiAhaWRlbnRpZnlQb3B1cElzT3BlblxuXG4gICAgICBpZiAoaWRlbnRpZnlQb3B1cEp1c3RPcGVuZWQpIHtcbiAgICAgICAgLy8gR2V0IGN1cnJlbnQgc2VsZWN0aW9uIHN0YXRlIGF0IG1vbWVudCBwb3B1cCBvcGVuc1xuICAgICAgICBjb25zdCBvcmlnaW5EU0lkID0gdGhpcy5xdWVyeVNpbXBsZVNlbGVjdGlvbj8uZGF0YVNvdXJjZUlkXG4gICAgICAgIGxldCBjdXJyZW50U2VsZWN0aW9uQXRPcGVuOiB7IGNvdW50OiBudW1iZXIsIGlkczogc3RyaW5nW10gfSB8IG51bGwgPSBudWxsXG4gICAgICAgIGlmIChvcmlnaW5EU0lkKSB7XG4gICAgICAgICAgY29uc3QgZHNNYW5hZ2VyID0gRGF0YVNvdXJjZU1hbmFnZXIuZ2V0SW5zdGFuY2UoKVxuICAgICAgICAgIGNvbnN0IG9yaWdpbkRTID0gZHNNYW5hZ2VyLmdldERhdGFTb3VyY2Uob3JpZ2luRFNJZCkgYXMgRmVhdHVyZUxheWVyRGF0YVNvdXJjZVxuICAgICAgICAgIGlmIChvcmlnaW5EUykge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRJZHMgPSBvcmlnaW5EUy5nZXRTZWxlY3RlZFJlY29yZElkcygpIHx8IFtdXG4gICAgICAgICAgICBjdXJyZW50U2VsZWN0aW9uQXRPcGVuID0ge1xuICAgICAgICAgICAgICBjb3VudDogc2VsZWN0ZWRJZHMubGVuZ3RoLFxuICAgICAgICAgICAgICBpZHM6IHNlbGVjdGVkSWRzLnNsaWNlKDAsIDUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGVidWdMb2dnZXIubG9nKCdTRUxFQ1RJT04nLCB7XG4gICAgICAgICAgZXZlbnQ6ICdpZGVudGlmeS1wb3B1cC1vcGVuZWQnLFxuICAgICAgICAgIHdpZGdldElkOiBjb25maWcubWFuYWdlZFdpZGdldElkLFxuICAgICAgICAgIGhhc1F1ZXJ5U2ltcGxlU2VsZWN0aW9uOiAhIXRoaXMucXVlcnlTaW1wbGVTZWxlY3Rpb24sXG4gICAgICAgICAgb3VyVHJhY2tlZFJlY29yZENvdW50OiB0aGlzLnF1ZXJ5U2ltcGxlU2VsZWN0aW9uPy5yZWNvcmRJZHMubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgb3VyVHJhY2tlZFJlY29yZElkczogdGhpcy5xdWVyeVNpbXBsZVNlbGVjdGlvbj8ucmVjb3JkSWRzLnNsaWNlKDAsIDUpIHx8IFtdLFxuICAgICAgICAgIGhhc1ByZXZpb3VzSGFzaEVudHJ5OiAhIXRoaXMucHJldmlvdXNIYXNoRW50cnksXG4gICAgICAgICAgcHJldmlvdXNIYXNoRW50cnlPdXRwdXREc0lkOiB0aGlzLnByZXZpb3VzSGFzaEVudHJ5Py5vdXRwdXREc0lkIHx8IG51bGwsXG4gICAgICAgICAgY3VycmVudFNlbGVjdGlvbkF0T3BlblxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAoaWRlbnRpZnlQb3B1cEp1c3RDbG9zZWQpIHtcbiAgICAgICAgLy8gR2V0IGN1cnJlbnQgc2VsZWN0aW9uIHN0YXRlIGF0IG1vbWVudCBwb3B1cCBjbG9zZXNcbiAgICAgICAgY29uc3Qgb3JpZ2luRFNJZCA9IHRoaXMucXVlcnlTaW1wbGVTZWxlY3Rpb24/LmRhdGFTb3VyY2VJZFxuICAgICAgICBsZXQgY3VycmVudFNlbGVjdGlvbkF0Q2xvc2U6IHsgY291bnQ6IG51bWJlciwgaWRzOiBzdHJpbmdbXSB9IHwgbnVsbCA9IG51bGxcbiAgICAgICAgaWYgKG9yaWdpbkRTSWQpIHtcbiAgICAgICAgICBjb25zdCBkc01hbmFnZXIgPSBEYXRhU291cmNlTWFuYWdlci5nZXRJbnN0YW5jZSgpXG4gICAgICAgICAgY29uc3Qgb3JpZ2luRFMgPSBkc01hbmFnZXIuZ2V0RGF0YVNvdXJjZShvcmlnaW5EU0lkKSBhcyBGZWF0dXJlTGF5ZXJEYXRhU291cmNlXG4gICAgICAgICAgaWYgKG9yaWdpbkRTKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZElkcyA9IG9yaWdpbkRTLmdldFNlbGVjdGVkUmVjb3JkSWRzKCkgfHwgW11cbiAgICAgICAgICAgIGN1cnJlbnRTZWxlY3Rpb25BdENsb3NlID0ge1xuICAgICAgICAgICAgICBjb3VudDogc2VsZWN0ZWRJZHMubGVuZ3RoLFxuICAgICAgICAgICAgICBpZHM6IHNlbGVjdGVkSWRzLnNsaWNlKDAsIDUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGVidWdMb2dnZXIubG9nKCdTRUxFQ1RJT04nLCB7XG4gICAgICAgICAgZXZlbnQ6ICdpZGVudGlmeS1wb3B1cC1jbG9zZWQnLFxuICAgICAgICAgIHdpZGdldElkOiBjb25maWcubWFuYWdlZFdpZGdldElkLFxuICAgICAgICAgIGhhc1F1ZXJ5U2ltcGxlU2VsZWN0aW9uOiAhIXRoaXMucXVlcnlTaW1wbGVTZWxlY3Rpb24sXG4gICAgICAgICAgb3VyVHJhY2tlZFJlY29yZENvdW50OiB0aGlzLnF1ZXJ5U2ltcGxlU2VsZWN0aW9uPy5yZWNvcmRJZHMubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgb3VyVHJhY2tlZFJlY29yZElkczogdGhpcy5xdWVyeVNpbXBsZVNlbGVjdGlvbj8ucmVjb3JkSWRzLnNsaWNlKDAsIDUpIHx8IFtdLFxuICAgICAgICAgIGhhc1ByZXZpb3VzSGFzaEVudHJ5OiAhIXRoaXMucHJldmlvdXNIYXNoRW50cnksXG4gICAgICAgICAgcHJldmlvdXNIYXNoRW50cnlPdXRwdXREc0lkOiB0aGlzLnByZXZpb3VzSGFzaEVudHJ5Py5vdXRwdXREc0lkIHx8IG51bGwsXG4gICAgICAgICAgY3VycmVudFNlbGVjdGlvbkF0Q2xvc2VcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5pZGVudGlmeVBvcHVwV2FzT3BlbiA9IGlkZW50aWZ5UG9wdXBJc09wZW5cbiAgICB9KVxuXG4gICAgLy8gT2JzZXJ2ZSB0aGUgZG9jdW1lbnQgYm9keSBmb3IgY2hhbmdlcyB0byBpZGVudGlmeSBwb3B1cFxuICAgIHRoaXMuaWRlbnRpZnlQb3B1cE9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnYXJpYS1oaWRkZW4nLCAnc3R5bGUnXVxuICAgIH0pXG5cbiAgICAvLyBJbml0aWFsIGNoZWNrXG4gICAgdGhpcy5pZGVudGlmeVBvcHVwV2FzT3BlbiA9IGlzSWRlbnRpZnlQb3B1cE9wZW4oKVxuICAgIFxuICAgIGRlYnVnTG9nZ2VyLmxvZygnU0VMRUNUSU9OJywge1xuICAgICAgZXZlbnQ6ICdpZGVudGlmeS1wb3B1cC13YXRjaGluZy1zdGFydGVkJyxcbiAgICAgIHdpZGdldElkOiBjb25maWcubWFuYWdlZFdpZGdldElkLFxuICAgICAgaW5pdGlhbFBvcHVwU3RhdGU6IHRoaXMuaWRlbnRpZnlQb3B1cFdhc09wZW5cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIHdhdGNoaW5nIGZvciBpZGVudGlmeSBwb3B1cCBvcGVuaW5nL2Nsb3NpbmcuXG4gICAqL1xuICBzdG9wSWRlbnRpZnlQb3B1cFdhdGNoaW5nID0gKCkgPT4ge1xuICAgIGlmICh0aGlzLmlkZW50aWZ5UG9wdXBPYnNlcnZlcikge1xuICAgICAgdGhpcy5pZGVudGlmeVBvcHVwT2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gICAgICB0aGlzLmlkZW50aWZ5UG9wdXBPYnNlcnZlciA9IG51bGxcbiAgICB9XG4gICAgdGhpcy5pZGVudGlmeVBvcHVwV2FzT3BlbiA9IGZhbHNlXG4gICAgXG4gICAgY29uc3QgeyBjb25maWcgfSA9IHRoaXMucHJvcHNcbiAgICBpZiAoY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgZGVidWdMb2dnZXIubG9nKCdTRUxFQ1RJT04nLCB7XG4gICAgICAgIGV2ZW50OiAnaWRlbnRpZnktcG9wdXAtd2F0Y2hpbmctc3RvcHBlZCcsXG4gICAgICAgIHdpZGdldElkOiBjb25maWcubWFuYWdlZFdpZGdldElkXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvLyBSZW5kZXIgbm90aGluZyB2aXNpYmxlIC0gdGhpcyB3aWRnZXQgaXMgYWx3YXlzIG1vdW50ZWQgYnV0IGludmlzaWJsZVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IFxuICAgICAgICBjc3M9e2Nzc2BcbiAgICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICB3aWR0aDogMXB4O1xuICAgICAgICAgIGhlaWdodDogMXB4O1xuICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgYH1cbiAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIC8+XG4gICAgKVxuICB9XG59XG5cbiBleHBvcnQgZnVuY3Rpb24gX19zZXRfd2VicGFja19wdWJsaWNfcGF0aF9fKHVybCkgeyBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHVybCB9Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9