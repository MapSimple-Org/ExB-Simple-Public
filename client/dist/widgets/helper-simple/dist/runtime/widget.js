System.register(["jimu-core/emotion","jimu-core"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
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

/** @jsx jsx */


/**
 * Custom event name for notifying managed widgets to process hash parameters.
 * This event is dispatched after a widget is opened in a controller.
 */
const OPEN_WIDGET_EVENT = 'helpersimple-open-widget';
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
         * Checks URL hash parameters for shortIds that match the managed widget.
         *
         * If a match is found, opens the widget using the Experience Builder API.
         * Hash format: #shortId=value (e.g., #pin=2223059013)
         *
         * Special parameter: #qsopen=true
         * Forces widget to open without requiring a query parameter match.
         * Useful for testing (e.g., Playwright E2E tests) or when you need the widget
         * open but don't have a query parameter to trigger it.
         * Can be combined with query parameters: #qsopen=true&pin=2223059013
         */
        this.checkHash = () => {
            const { config } = this.props;
            if (!config.managedWidgetId) {
                return;
            }
            // Parse URL hash fragment
            const hash = window.location.hash.substring(1);
            if (!hash) {
                return;
            }
            const urlParams = new URLSearchParams(hash);
            // Check for special qsopen parameter (forces widget to open)
            // This is useful for Playwright tests that need the widget open
            // but don't necessarily need to execute a query
            if (urlParams.get('qsopen') === 'true') {
                this.openWidget(config.managedWidgetId);
                return; // Open widget and return early (don't need to check shortIds)
            }
            // Get all shortIds from the managed widget
            const shortIds = this.getWidgetShortIds(config.managedWidgetId);
            if (shortIds.length === 0) {
                return;
            }
            // Check if any shortId matches a hash parameter key
            shortIds.forEach(shortId => {
                if (urlParams.has(shortId)) {
                    // Open the widget using the proper API
                    this.openWidget(config.managedWidgetId);
                }
            });
        };
        /**
         * Handles hash change events from the browser.
         * Re-checks hash parameters when the URL hash changes.
         */
        this.handleHashChange = () => {
            this.checkHash();
        };
    }
    componentDidMount() {
        // Listen for hash changes to detect when URL hash parameters are updated
        window.addEventListener('hashchange', this.handleHashChange);
        // Check hash on initial mount
        this.checkHash();
    }
    componentWillUnmount() {
        window.removeEventListener('hashchange', this.handleHashChange);
    }
    componentDidUpdate(prevProps) {
        // Re-check hash if managed widget configuration changed
        if (prevProps.config.managedWidgetId !== this.props.config.managedWidgetId) {
            this.checkHash();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9oZWxwZXItc2ltcGxlL2Rpc3QvcnVudGltZS93aWRnZXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBOEM7QUFFOUMsTUFBTSxjQUFlLFNBQVEseURBQWtCO0lBQS9DOztRQUNFLGFBQVEsR0FBRyxDQUFDO2dCQUNWLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixXQUFXLEVBQUUsb0JBQW9CO2dCQUNqQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRTtvQkFDdEIsT0FBTyxTQUFTO2dCQUNsQixDQUFDO2FBQ0YsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQUVNLE1BQU0sY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFOzs7Ozs7Ozs7Ozs7QUNabEQsd0U7Ozs7Ozs7Ozs7O0FDQUEsdUQ7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7V0NOQSwyQjs7Ozs7Ozs7OztBQ0FBOzs7S0FHSztBQUNMLHFCQUF1QixHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0puRCxlQUFlO0FBQ3VHO0FBRW5FO0FBRW5EOzs7R0FHRztBQUNILE1BQU0saUJBQWlCLEdBQUcsMEJBQTBCO0FBRXBEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixNQUFPLFNBQVEsNENBQUssQ0FBQyxhQUF1QztJQUFqRjs7UUFxQkU7Ozs7O1dBS0c7UUFDSCxzQkFBaUIsR0FBRyxDQUFDLFFBQWdC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O1FBRUQ7OztXQUdHO1FBQ0gscUJBQWdCLEdBQUcsR0FBRyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDbEIsQ0FBQztJQW1CSCxDQUFDO0lBN0xDLGlCQUFpQjtRQUNmLHlFQUF5RTtRQUN6RSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM1RCw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLFNBQVMsRUFBRTtJQUNsQixDQUFDO0lBRUQsb0JBQW9CO1FBQ2xCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ2pFLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxTQUFtQztRQUNwRCx3REFBd0Q7UUFDeEQsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMzRSxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQ2xCLENBQUM7SUFDSCxDQUFDO0lBNEpELE1BQU07UUFDSix1RUFBdUU7UUFDdkUsT0FBTyxDQUNMLHlFQUNFLEdBQUcsRUFBRSw4Q0FBRzs7Ozs7Ozs7U0FRUCxpQkFDVyxNQUFNLEdBQ2xCLENBQ0g7SUFDSCxDQUFDOztBQTlMTSxxQkFBYyxHQUFHLDREQUFjO2lFQURuQixNQUFNO0FBa01uQixTQUFTLDJCQUEyQixDQUFDLEdBQUcsSUFBSSxxQkFBdUIsR0FBRyxHQUFHLEVBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9oZWxwZXItc2ltcGxlL3NyYy92ZXJzaW9uLW1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmUvZW1vdGlvblwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9oZWxwZXItc2ltcGxlL3NyYy9ydW50aW1lL3dpZGdldC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZVZlcnNpb25NYW5hZ2VyIH0gZnJvbSAnamltdS1jb3JlJ1xuXG5jbGFzcyBWZXJzaW9uTWFuYWdlciBleHRlbmRzIEJhc2VWZXJzaW9uTWFuYWdlciB7XG4gIHZlcnNpb25zID0gW3tcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIGZpcnN0IHZlcnNpb24uJyxcbiAgICB1cGdyYWRlcjogKG9sZENvbmZpZykgPT4ge1xuICAgICAgcmV0dXJuIG9sZENvbmZpZ1xuICAgIH1cbiAgfV1cbn1cblxuZXhwb3J0IGNvbnN0IHZlcnNpb25NYW5hZ2VyID0gbmV3IFZlcnNpb25NYW5hZ2VyKClcblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfX2Vtb3Rpb25fcmVhY3RfanN4X3J1bnRpbWVfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIi8qKlxyXG4gKiBXZWJwYWNrIHdpbGwgcmVwbGFjZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB3aXRoIF9fd2VicGFja19yZXF1aXJlX18ucCB0byBzZXQgdGhlIHB1YmxpYyBwYXRoIGR5bmFtaWNhbGx5LlxyXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBzZXQgdGhlIHB1YmxpY1BhdGggaW4gd2VicGFjayBjb25maWcgaXM6IHdlIGNoYW5nZSB0aGUgcHVibGljUGF0aCB3aGVuIGRvd25sb2FkLlxyXG4gKiAqL1xyXG5fX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHdpbmRvdy5qaW11Q29uZmlnLmJhc2VVcmxcclxuIiwiLyoqIEBqc3gganN4ICovXG5pbXBvcnQgeyBSZWFjdCwganN4LCBjc3MsIHR5cGUgQWxsV2lkZ2V0UHJvcHMsIGdldEFwcFN0b3JlLCB0eXBlIElNU3RhdGUsIFdpZGdldE1hbmFnZXIsIGFwcEFjdGlvbnMgfSBmcm9tICdqaW11LWNvcmUnXG5pbXBvcnQgeyB0eXBlIElNQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJ1xuaW1wb3J0IHsgdmVyc2lvbk1hbmFnZXIgfSBmcm9tICcuLi92ZXJzaW9uLW1hbmFnZXInXG5cbi8qKlxuICogQ3VzdG9tIGV2ZW50IG5hbWUgZm9yIG5vdGlmeWluZyBtYW5hZ2VkIHdpZGdldHMgdG8gcHJvY2VzcyBoYXNoIHBhcmFtZXRlcnMuXG4gKiBUaGlzIGV2ZW50IGlzIGRpc3BhdGNoZWQgYWZ0ZXIgYSB3aWRnZXQgaXMgb3BlbmVkIGluIGEgY29udHJvbGxlci5cbiAqL1xuY29uc3QgT1BFTl9XSURHRVRfRVZFTlQgPSAnaGVscGVyc2ltcGxlLW9wZW4td2lkZ2V0J1xuXG4vKipcbiAqIEhlbHBlclNpbXBsZSBXaWRnZXRcbiAqIFxuICogQSBoZWxwZXIgd2lkZ2V0IHRoYXQgbW9uaXRvcnMgVVJMIGhhc2ggcGFyYW1ldGVycyBhbmQgYXV0b21hdGljYWxseSBvcGVuc1xuICogbWFuYWdlZCB3aWRnZXRzIGluIGNvbnRyb2xsZXJzIHdoZW4gbWF0Y2hpbmcgc2hvcnRJZHMgYXJlIGRldGVjdGVkLlxuICogXG4gKiBUaGlzIHdpZGdldCBpcyBhbHdheXMgbW91bnRlZCBidXQgaW52aXNpYmxlLCBhbGxvd2luZyBpdCB0byBsaXN0ZW4gZm9yIGhhc2hcbiAqIGNoYW5nZXMgZXZlbiB3aGVuIG90aGVyIHdpZGdldHMgYXJlIGNsb3NlZCBpbiBjb250cm9sbGVycy5cbiAqIFxuICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuYXJjZ2lzLmNvbS9leHBlcmllbmNlLWJ1aWxkZXIvc2FtcGxlLWNvZGUvd2lkZ2V0cy9jb250cm9sLXRoZS13aWRnZXQtc3RhdGUvXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdpZGdldCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8QWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+PiB7XG4gIHN0YXRpYyB2ZXJzaW9uTWFuYWdlciA9IHZlcnNpb25NYW5hZ2VyXG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgLy8gTGlzdGVuIGZvciBoYXNoIGNoYW5nZXMgdG8gZGV0ZWN0IHdoZW4gVVJMIGhhc2ggcGFyYW1ldGVycyBhcmUgdXBkYXRlZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy5oYW5kbGVIYXNoQ2hhbmdlKVxuICAgIC8vIENoZWNrIGhhc2ggb24gaW5pdGlhbCBtb3VudFxuICAgIHRoaXMuY2hlY2tIYXNoKClcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy5oYW5kbGVIYXNoQ2hhbmdlKVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogQWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+KSB7XG4gICAgLy8gUmUtY2hlY2sgaGFzaCBpZiBtYW5hZ2VkIHdpZGdldCBjb25maWd1cmF0aW9uIGNoYW5nZWRcbiAgICBpZiAocHJldlByb3BzLmNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQgIT09IHRoaXMucHJvcHMuY29uZmlnLm1hbmFnZWRXaWRnZXRJZCkge1xuICAgICAgdGhpcy5jaGVja0hhc2goKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0cyBhbGwgc2hvcnRJZHMgZnJvbSB0aGUgbWFuYWdlZCB3aWRnZXQncyBxdWVyeSBpdGVtcy5cbiAgICogXG4gICAqIEBwYXJhbSB3aWRnZXRJZCAtIFRoZSBJRCBvZiB0aGUgd2lkZ2V0IHRvIGV4dHJhY3Qgc2hvcnRJZHMgZnJvbVxuICAgKiBAcmV0dXJucyBBcnJheSBvZiBzaG9ydElkIHN0cmluZ3MgZm91bmQgaW4gdGhlIHdpZGdldCdzIHF1ZXJ5IGl0ZW1zXG4gICAqL1xuICBnZXRXaWRnZXRTaG9ydElkcyA9ICh3aWRnZXRJZDogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICAgIGNvbnN0IHN0YXRlOiBJTVN0YXRlID0gZ2V0QXBwU3RvcmUoKS5nZXRTdGF0ZSgpXG4gICAgY29uc3QgYXBwQ29uZmlnID0gd2luZG93LmppbXVDb25maWc/LmlzQnVpbGRlciBcbiAgICAgID8gc3RhdGUuYXBwU3RhdGVJbkJ1aWxkZXI/LmFwcENvbmZpZyBcbiAgICAgIDogc3RhdGUuYXBwQ29uZmlnXG4gICAgXG4gICAgaWYgKCFhcHBDb25maWc/LndpZGdldHM/Llt3aWRnZXRJZF0pIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICBcbiAgICBpZiAoIWFwcENvbmZpZy53aWRnZXRzW3dpZGdldElkXS5jb25maWc/LnF1ZXJ5SXRlbXMpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cblxuICAgIGNvbnN0IHF1ZXJ5SXRlbXMgPSBhcHBDb25maWcud2lkZ2V0c1t3aWRnZXRJZF0uY29uZmlnLnF1ZXJ5SXRlbXNcbiAgICBjb25zdCBzaG9ydElkczogc3RyaW5nW10gPSBbXVxuICAgIFxuICAgIHF1ZXJ5SXRlbXMuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICBpZiAoaXRlbS5zaG9ydElkICYmIGl0ZW0uc2hvcnRJZC50cmltKCkgIT09ICcnKSB7XG4gICAgICAgIHNob3J0SWRzLnB1c2goaXRlbS5zaG9ydElkKVxuICAgICAgfVxuICAgIH0pXG4gICAgXG4gICAgcmV0dXJuIHNob3J0SWRzXG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgdGhlIHdpZGdldCBjbGFzcyBwcmlvciB0byBleGVjdXRpbmcgdGhlIG9wZW4gYWN0aW9uLlxuICAgKiBUaGlzIGlzIHJlcXVpcmVkIGJ5IHRoZSBFeHBlcmllbmNlIEJ1aWxkZXIgQVBJIGJlZm9yZSBvcGVuaW5nIHdpZGdldHMuXG4gICAqIFxuICAgKiBAcGFyYW0gd2lkZ2V0SWQgLSBUaGUgSUQgb2YgdGhlIHdpZGdldCB0byBsb2FkXG4gICAqIEByZXR1cm5zIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSB3aWRnZXQgY2xhc3MgY29tcG9uZW50XG4gICAqIFxuICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5hcmNnaXMuY29tL2V4cGVyaWVuY2UtYnVpbGRlci9zYW1wbGUtY29kZS93aWRnZXRzL2NvbnRyb2wtdGhlLXdpZGdldC1zdGF0ZS9cbiAgICovXG4gIGxvYWRXaWRnZXRDbGFzcyA9ICh3aWRnZXRJZDogc3RyaW5nKTogUHJvbWlzZTxSZWFjdC5Db21wb25lbnRUeXBlPGFueT4+ID0+IHtcbiAgICBpZiAoIXdpZGdldElkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGlzQ2xhc3NMb2FkZWQgPSBnZXRBcHBTdG9yZSgpLmdldFN0YXRlKCkud2lkZ2V0c1J1bnRpbWVJbmZvPy5bd2lkZ2V0SWRdPy5pc0NsYXNzTG9hZGVkXG4gICAgXG4gICAgaWYgKCFpc0NsYXNzTG9hZGVkKSB7XG4gICAgICByZXR1cm4gV2lkZ2V0TWFuYWdlci5nZXRJbnN0YW5jZSgpLmxvYWRXaWRnZXRDbGFzcyh3aWRnZXRJZClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShXaWRnZXRNYW5hZ2VyLmdldEluc3RhbmNlKCkuZ2V0V2lkZ2V0Q2xhc3Mod2lkZ2V0SWQpKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyBhIHdpZGdldCBpbiBhIGNvbnRyb2xsZXIgdXNpbmcgdGhlIEV4cGVyaWVuY2UgQnVpbGRlciBBUEkuXG4gICAqIFxuICAgKiBUaGlzIG1ldGhvZDpcbiAgICogMS4gTG9hZHMgdGhlIHdpZGdldCBjbGFzcyBpZiBub3QgYWxyZWFkeSBsb2FkZWRcbiAgICogMi4gRGlzcGF0Y2hlcyB0aGUgb3BlbldpZGdldCBhY3Rpb24gdmlhIFJlZHV4XG4gICAqIDMuIE5vdGlmaWVzIHRoZSB3aWRnZXQgdG8gcHJvY2VzcyBoYXNoIHBhcmFtZXRlcnMgYWZ0ZXIgb3BlbmluZ1xuICAgKiBcbiAgICogQHBhcmFtIHdpZGdldElkIC0gVGhlIElEIG9mIHRoZSB3aWRnZXQgdG8gb3BlblxuICAgKiBcbiAgICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuYXJjZ2lzLmNvbS9leHBlcmllbmNlLWJ1aWxkZXIvc2FtcGxlLWNvZGUvd2lkZ2V0cy9jb250cm9sLXRoZS13aWRnZXQtc3RhdGUvXG4gICAqL1xuICBvcGVuV2lkZ2V0ID0gKHdpZGdldElkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBjb25zdCBvcGVuQWN0aW9uID0gYXBwQWN0aW9ucy5vcGVuV2lkZ2V0KHdpZGdldElkKVxuICAgIFxuICAgIHRoaXMubG9hZFdpZGdldENsYXNzKHdpZGdldElkKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBnZXRBcHBTdG9yZSgpLmRpc3BhdGNoKG9wZW5BY3Rpb24pXG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyBHaXZlIHRoZSB3aWRnZXQgYSBtb21lbnQgdG8gbW91bnQsIHRoZW4gbm90aWZ5IGl0IHRvIHByb2Nlc3MgaGFzaCBwYXJhbWV0ZXJzXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KE9QRU5fV0lER0VUX0VWRU5ULCB7XG4gICAgICAgICAgICBkZXRhaWw6IHsgd2lkZ2V0SWQgfSxcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChldmVudClcbiAgICAgICAgfSwgNTAwKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gU2lsZW50bHkgaGFuZGxlIGVycm9ycyAtIHdpZGdldCBtYXkgYWxyZWFkeSBiZSBvcGVuIG9yIG5vdCBpbiBhIGNvbnRyb2xsZXJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW0hlbHBlclNpbXBsZV0gRXJyb3Igb3BlbmluZyB3aWRnZXQ6JywgZXJyb3IpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIFVSTCBoYXNoIHBhcmFtZXRlcnMgZm9yIHNob3J0SWRzIHRoYXQgbWF0Y2ggdGhlIG1hbmFnZWQgd2lkZ2V0LlxuICAgKiBcbiAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgb3BlbnMgdGhlIHdpZGdldCB1c2luZyB0aGUgRXhwZXJpZW5jZSBCdWlsZGVyIEFQSS5cbiAgICogSGFzaCBmb3JtYXQ6ICNzaG9ydElkPXZhbHVlIChlLmcuLCAjcGluPTIyMjMwNTkwMTMpXG4gICAqIFxuICAgKiBTcGVjaWFsIHBhcmFtZXRlcjogI3Fzb3Blbj10cnVlXG4gICAqIEZvcmNlcyB3aWRnZXQgdG8gb3BlbiB3aXRob3V0IHJlcXVpcmluZyBhIHF1ZXJ5IHBhcmFtZXRlciBtYXRjaC5cbiAgICogVXNlZnVsIGZvciB0ZXN0aW5nIChlLmcuLCBQbGF5d3JpZ2h0IEUyRSB0ZXN0cykgb3Igd2hlbiB5b3UgbmVlZCB0aGUgd2lkZ2V0XG4gICAqIG9wZW4gYnV0IGRvbid0IGhhdmUgYSBxdWVyeSBwYXJhbWV0ZXIgdG8gdHJpZ2dlciBpdC5cbiAgICogQ2FuIGJlIGNvbWJpbmVkIHdpdGggcXVlcnkgcGFyYW1ldGVyczogI3Fzb3Blbj10cnVlJnBpbj0yMjIzMDU5MDEzXG4gICAqL1xuICBjaGVja0hhc2ggPSAoKSA9PiB7XG4gICAgY29uc3QgeyBjb25maWcgfSA9IHRoaXMucHJvcHNcbiAgICBcbiAgICBpZiAoIWNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFBhcnNlIFVSTCBoYXNoIGZyYWdtZW50XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKVxuICAgIFxuICAgIGlmICghaGFzaCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoaGFzaClcbiAgICBcbiAgICAvLyBDaGVjayBmb3Igc3BlY2lhbCBxc29wZW4gcGFyYW1ldGVyIChmb3JjZXMgd2lkZ2V0IHRvIG9wZW4pXG4gICAgLy8gVGhpcyBpcyB1c2VmdWwgZm9yIFBsYXl3cmlnaHQgdGVzdHMgdGhhdCBuZWVkIHRoZSB3aWRnZXQgb3BlblxuICAgIC8vIGJ1dCBkb24ndCBuZWNlc3NhcmlseSBuZWVkIHRvIGV4ZWN1dGUgYSBxdWVyeVxuICAgIGlmICh1cmxQYXJhbXMuZ2V0KCdxc29wZW4nKSA9PT0gJ3RydWUnKSB7XG4gICAgICB0aGlzLm9wZW5XaWRnZXQoY29uZmlnLm1hbmFnZWRXaWRnZXRJZClcbiAgICAgIHJldHVybiAvLyBPcGVuIHdpZGdldCBhbmQgcmV0dXJuIGVhcmx5IChkb24ndCBuZWVkIHRvIGNoZWNrIHNob3J0SWRzKVxuICAgIH1cblxuICAgIC8vIEdldCBhbGwgc2hvcnRJZHMgZnJvbSB0aGUgbWFuYWdlZCB3aWRnZXRcbiAgICBjb25zdCBzaG9ydElkcyA9IHRoaXMuZ2V0V2lkZ2V0U2hvcnRJZHMoY29uZmlnLm1hbmFnZWRXaWRnZXRJZClcbiAgICBcbiAgICBpZiAoc2hvcnRJZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgYW55IHNob3J0SWQgbWF0Y2hlcyBhIGhhc2ggcGFyYW1ldGVyIGtleVxuICAgIHNob3J0SWRzLmZvckVhY2goc2hvcnRJZCA9PiB7XG4gICAgICBpZiAodXJsUGFyYW1zLmhhcyhzaG9ydElkKSkge1xuICAgICAgICAvLyBPcGVuIHRoZSB3aWRnZXQgdXNpbmcgdGhlIHByb3BlciBBUElcbiAgICAgICAgdGhpcy5vcGVuV2lkZ2V0KGNvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGhhc2ggY2hhbmdlIGV2ZW50cyBmcm9tIHRoZSBicm93c2VyLlxuICAgKiBSZS1jaGVja3MgaGFzaCBwYXJhbWV0ZXJzIHdoZW4gdGhlIFVSTCBoYXNoIGNoYW5nZXMuXG4gICAqL1xuICBoYW5kbGVIYXNoQ2hhbmdlID0gKCkgPT4ge1xuICAgIHRoaXMuY2hlY2tIYXNoKClcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvLyBSZW5kZXIgbm90aGluZyB2aXNpYmxlIC0gdGhpcyB3aWRnZXQgaXMgYWx3YXlzIG1vdW50ZWQgYnV0IGludmlzaWJsZVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IFxuICAgICAgICBjc3M9e2Nzc2BcbiAgICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICB3aWR0aDogMXB4O1xuICAgICAgICAgIGhlaWdodDogMXB4O1xuICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgYH1cbiAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIC8+XG4gICAgKVxuICB9XG59XG5cbiBleHBvcnQgZnVuY3Rpb24gX19zZXRfd2VicGFja19wdWJsaWNfcGF0aF9fKHVybCkgeyBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHVybCB9Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9