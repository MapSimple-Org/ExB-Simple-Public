System.register(["jimu-core"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	return {
		setters: [
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

/***/ "./your-extensions/widgets/query-simple/src/runtime/debug-logger.ts":
/*!**************************************************************************!*\
  !*** ./your-extensions/widgets/query-simple/src/runtime/debug-logger.ts ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debugLogger: () => (/* binding */ debugLogger)
/* harmony export */ });
/**
 * Configurable debug logging utility for QuerySimple widget
 *
 * Usage:
 * - Add ?debug=all to URL to see all debug logs
 * - Add ?debug=HASH,FORM to see specific feature logs
 * - Add ?debug=false to disable all debug logs
 *
 * Features:
 * - HASH: Hash parameter processing
 * - FORM: Query form interactions
 * - TASK: Query task management
 * - ZOOM: Zoom behavior
 * - MAP-EXTENT: Map extent changes
 * - DATA-ACTION: Data action execution (Add to Map, etc.)
 * - GROUP: Query grouping and dropdown selection
 */
class DebugLogger {
    constructor() {
        this.enabledFeatures = new Set();
        this.initialized = false;
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
            this.enabledFeatures.add('HASH');
            this.enabledFeatures.add('FORM');
            this.enabledFeatures.add('TASK');
            this.enabledFeatures.add('ZOOM');
            this.enabledFeatures.add('MAP-EXTENT');
            this.enabledFeatures.add('DATA-ACTION');
            this.enabledFeatures.add('GROUP');
        }
        else if (debugValue !== null) {
            // Parse comma-separated feature list
            const features = debugValue.split(',').map(f => f.trim().toUpperCase());
            features.forEach(feature => {
                if (feature === 'ALL') {
                    this.enabledFeatures.add('HASH');
                    this.enabledFeatures.add('FORM');
                    this.enabledFeatures.add('TASK');
                    this.enabledFeatures.add('ZOOM');
                    this.enabledFeatures.add('MAP-EXTENT');
                    this.enabledFeatures.add('DATA-ACTION');
                    this.enabledFeatures.add('GROUP');
                }
                else if (['HASH', 'FORM', 'TASK', 'ZOOM', 'MAP-EXTENT', 'DATA-ACTION', 'GROUP'].includes(feature)) {
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
        console.log(`[QUERYSIMPLE-${feature}]`, JSON.stringify(logData, null, 2));
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
const debugLogger = new DebugLogger();


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
/*!*******************************************************************************!*\
  !*** ./your-extensions/widgets/query-simple/src/actions/log-extent-action.ts ***!
  \*******************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LogExtentAction)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var _runtime_debug_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/debug-logger */ "./your-extensions/widgets/query-simple/src/runtime/debug-logger.ts");


class LogExtentAction extends jimu_core__WEBPACK_IMPORTED_MODULE_0__.AbstractMessageAction {
    filterMessageType(messageType) {
        return messageType === jimu_core__WEBPACK_IMPORTED_MODULE_0__.MessageType.MapViewExtentChange;
    }
    filterMessage(message) {
        return true;
    }
    getSettingComponentUri(messageType, messageWidgetId) {
        return null;
    }
    onExecute(message, actionConfig) {
        const extent = message === null || message === void 0 ? void 0 : message.extent;
        const viewPoint = message === null || message === void 0 ? void 0 : message.viewPoint;
        _runtime_debug_logger__WEBPACK_IMPORTED_MODULE_1__.debugLogger.log('MAP-EXTENT', {
            extent: extent ? {
                xmin: extent.xmin,
                ymin: extent.ymin,
                xmax: extent.xmax,
                ymax: extent.ymax,
                spatialReference: extent.spatialReference
            } : null,
            viewPoint: viewPoint ? {
                scale: viewPoint.scale,
                rotation: viewPoint.rotation,
                targetGeometry: viewPoint.targetGeometry
            } : null,
            widgetId: this.widgetId
        });
        return true;
    }
}

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9xdWVyeS1zaW1wbGUvZGlzdC9hY3Rpb25zL2xvZy1leHRlbnQtYWN0aW9uLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBSUgsTUFBTSxXQUFXO0lBQWpCO1FBQ1Usb0JBQWUsR0FBc0IsSUFBSSxHQUFHLEVBQUU7UUFDOUMsZ0JBQVcsR0FBRyxLQUFLO0lBZ0Y3QixDQUFDO0lBOUVTLFVBQVU7UUFDaEIsSUFBSSxJQUFJLENBQUMsV0FBVztZQUFFLE9BQU07UUFFNUIsdUJBQXVCO1FBQ3ZCLE1BQU0sU0FBUyxHQUFHLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQzdELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBRXpDLElBQUksVUFBVSxLQUFLLE9BQU8sRUFBRSxDQUFDO1lBQzNCLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUk7WUFDdkIsT0FBTTtRQUNSLENBQUM7UUFFRCxJQUFJLFVBQVUsS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUN6QixzREFBc0Q7WUFDdEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztZQUN0QyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7WUFDdkMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ25DLENBQUM7YUFBTSxJQUFJLFVB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LFFBQVE7Z0JBQzVCLGNBQWMsRUFBRSxTQUFTLENBQUMsY0FBYzthQUN6QyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ1IsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3hCLENBQUM7UUFFRixPQUFPLElBQUk7SUFDYixDQUFDO0NBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvcXVlcnktc2ltcGxlL3NyYy9ydW50aW1lL2RlYnVnLWxvZ2dlci50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZVwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWNvcmUvbGliL3NldC1wdWJsaWMtcGF0aC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvcXVlcnktc2ltcGxlL3NyYy9hY3Rpb25zL2xvZy1leHRlbnQtYWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29uZmlndXJhYmxlIGRlYnVnIGxvZ2dpbmcgdXRpbGl0eSBmb3IgUXVlcnlTaW1wbGUgd2lkZ2V0XG4gKiBcbiAqIFVzYWdlOlxuICogLSBBZGQgP2RlYnVnPWFsbCB0byBVUkwgdG8gc2VlIGFsbCBkZWJ1ZyBsb2dzXG4gKiAtIEFkZCA/ZGVidWc9SEFTSCxGT1JNIHRvIHNlZSBzcGVjaWZpYyBmZWF0dXJlIGxvZ3NcbiAqIC0gQWRkID9kZWJ1Zz1mYWxzZSB0byBkaXNhYmxlIGFsbCBkZWJ1ZyBsb2dzXG4gKiBcbiAqIEZlYXR1cmVzOlxuICogLSBIQVNIOiBIYXNoIHBhcmFtZXRlciBwcm9jZXNzaW5nXG4gKiAtIEZPUk06IFF1ZXJ5IGZvcm0gaW50ZXJhY3Rpb25zXG4gKiAtIFRBU0s6IFF1ZXJ5IHRhc2sgbWFuYWdlbWVudFxuICogLSBaT09NOiBab29tIGJlaGF2aW9yXG4gKiAtIE1BUC1FWFRFTlQ6IE1hcCBleHRlbnQgY2hhbmdlc1xuICogLSBEQVRBLUFDVElPTjogRGF0YSBhY3Rpb24gZXhlY3V0aW9uIChBZGQgdG8gTWFwLCBldGMuKVxuICogLSBHUk9VUDogUXVlcnkgZ3JvdXBpbmcgYW5kIGRyb3Bkb3duIHNlbGVjdGlvblxuICovXG5cbnR5cGUgRGVidWdGZWF0dXJlID0gJ0hBU0gnIHwgJ0ZPUk0nIHwgJ1RBU0snIHwgJ1pPT00nIHwgJ01BUC1FWFRFTlQnIHwgJ0RBVEEtQUNUSU9OJyB8ICdHUk9VUCcgfCAnYWxsJyB8ICdmYWxzZSdcblxuY2xhc3MgRGVidWdMb2dnZXIge1xuICBwcml2YXRlIGVuYWJsZWRGZWF0dXJlczogU2V0PERlYnVnRmVhdHVyZT4gPSBuZXcgU2V0KClcbiAgcHJpdmF0ZSBpbml0aWFsaXplZCA9IGZhbHNlXG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSByZXR1cm5cblxuICAgIC8vIENoZWNrIFVSTCBwYXJhbWV0ZXJzXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxuICAgIGNvbnN0IGRlYnVnVmFsdWUgPSB1cmxQYXJhbXMuZ2V0KCdkZWJ1ZycpXG5cbiAgICBpZiAoZGVidWdWYWx1ZSA9PT0gJ2ZhbHNlJykge1xuICAgICAgLy8gRXhwbGljaXRseSBkaXNhYmxlZFxuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChkZWJ1Z1ZhbHVlID09PSAnYWxsJykge1xuICAgICAgLy8gRW5hYmxlIGFsbCBmZWF0dXJlcyBvbmx5IGlmIGV4cGxpY2l0bHkgc2V0IHRvICdhbGwnXG4gICAgICB0aGlzLmVuYWJsZWRGZWF0dXJlcy5hZGQoJ0hBU0gnKVxuICAgICAgdGhpcy5lbmFibGVkRmVhdHVyZXMuYWRkKCdGT1JNJylcbiAgICAgIHRoaXMuZW5hYmxlZEZlYXR1cmVzLmFkZCgnVEFTSycpXG4gICAgICB0aGlzLmVuYWJsZWRGZWF0dXJlcy5hZGQoJ1pPT00nKVxuICAgICAgdGhpcy5lbmFibGVkRmVhdHVyZXMuYWRkKCdNQVAtRVhURU5UJylcbiAgICAgIHRoaXMuZW5hYmxlZEZlYXR1cmVzLmFkZCgnREFUQS1BQ1RJT04nKVxuICAgICAgdGhpcy5lbmFibGVkRmVhdHVyZXMuYWRkKCdHUk9VUCcpXG4gICAgfSBlbHNlIGlmIChkZWJ1Z1ZhbHVlICE9PSBudWxsKSB7XG4gICAgICAvLyBQYXJzZSBjb21tYS1zZXBhcmF0ZWQgZmVhdHVyZSBsaXN0XG4gICAgICBjb25zdCBmZWF0dXJlcyA9IGRlYnVnVmFsdWUuc3BsaXQoJywnKS5tYXAoZiA9PiBmLnRyaW0oKS50b1VwcGVyQ2FzZSgpIGFzIERlYnVnRmVhdHVyZSlcbiAgICAgIGZlYXR1cmVzLmZvckVhY2goZmVhdHVyZSA9PiB7XG4gICAgICAgIGlmIChmZWF0dXJlID09PSAnQUxMJykge1xuICAgICAgICAgIHRoaXMuZW5hYmxlZEZlYXR1cmVzLmFkZCgnSEFTSCcpXG4gICAgICAgICAgdGhpcy5lbmFibGVkRmVhdHVyZXMuYWRkKCdGT1JNJylcbiAgICAgICAgICB0aGlzLmVuYWJsZWRGZWF0dXJlcy5hZGQoJ1RBU0snKVxuICAgICAgICAgIHRoaXMuZW5hYmxlZEZlYXR1cmVzLmFkZCgnWk9PTScpXG4gICAgICAgICAgdGhpcy5lbmFibGVkRmVhdHVyZXMuYWRkKCdNQVAtRVhURU5UJylcbiAgICAgICAgICB0aGlzLmVuYWJsZWRGZWF0dXJlcy5hZGQoJ0RBVEEtQUNUSU9OJylcbiAgICAgICAgICB0aGlzLmVuYWJsZWRGZWF0dXJlcy5hZGQoJ0dST1VQJylcbiAgICAgICAgfSBlbHNlIGlmIChbJ0hBU0gnLCAnRk9STScsICdUQVNLJywgJ1pPT00nLCAnTUFQLUVYVEVOVCcsICdEQVRBLUFDVElPTicsICdHUk9VUCddLmluY2x1ZGVzKGZlYXR1cmUpKSB7XG4gICAgICAgICAgdGhpcy5lbmFibGVkRmVhdHVyZXMuYWRkKGZlYXR1cmUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcbiAgfVxuXG4gIHByaXZhdGUgaXNFbmFibGVkKGZlYXR1cmU6IERlYnVnRmVhdHVyZSk6IGJvb2xlYW4ge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpXG4gICAgXG4gICAgaWYgKHRoaXMuZW5hYmxlZEZlYXR1cmVzLmhhcygnYWxsJykpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIFxuICAgIHJldHVybiB0aGlzLmVuYWJsZWRGZWF0dXJlcy5oYXMoZmVhdHVyZSlcbiAgfVxuXG4gIGxvZyhmZWF0dXJlOiBEZWJ1Z0ZlYXR1cmUsIGRhdGE6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc0VuYWJsZWQoZmVhdHVyZSkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGxvZ0RhdGEgPSB7XG4gICAgICBmZWF0dXJlLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAuLi5kYXRhXG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYFtRVUVSWVNJTVBMRS0ke2ZlYXR1cmV9XWAsIEpTT04uc3RyaW5naWZ5KGxvZ0RhdGEsIG51bGwsIDIpKVxuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IHsgZW5hYmxlZEZlYXR1cmVzOiBzdHJpbmdbXSwgZGVidWdWYWx1ZTogc3RyaW5nIHwgbnVsbCB9IHtcbiAgICB0aGlzLmluaXRpYWxpemUoKVxuICAgIFxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaClcbiAgICBjb25zdCBkZWJ1Z1ZhbHVlID0gdXJsUGFyYW1zLmdldCgnZGVidWcnKVxuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBlbmFibGVkRmVhdHVyZXM6IEFycmF5LmZyb20odGhpcy5lbmFibGVkRmVhdHVyZXMpLFxuICAgICAgZGVidWdWYWx1ZVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGVidWdMb2dnZXIgPSBuZXcgRGVidWdMb2dnZXIoKVxuXG5cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIi8qKlxyXG4gKiBXZWJwYWNrIHdpbGwgcmVwbGFjZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB3aXRoIF9fd2VicGFja19yZXF1aXJlX18ucCB0byBzZXQgdGhlIHB1YmxpYyBwYXRoIGR5bmFtaWNhbGx5LlxyXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBzZXQgdGhlIHB1YmxpY1BhdGggaW4gd2VicGFjayBjb25maWcgaXM6IHdlIGNoYW5nZSB0aGUgcHVibGljUGF0aCB3aGVuIGRvd25sb2FkLlxyXG4gKiAqL1xyXG5fX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHdpbmRvdy5qaW11Q29uZmlnLmJhc2VVcmxcclxuIiwiaW1wb3J0IHsgQWJzdHJhY3RNZXNzYWdlQWN0aW9uLCBNZXNzYWdlVHlwZSwgTWVzc2FnZSB9IGZyb20gJ2ppbXUtY29yZSdcbmltcG9ydCB7IGRlYnVnTG9nZ2VyIH0gZnJvbSAnLi4vcnVudGltZS9kZWJ1Zy1sb2dnZXInXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvZ0V4dGVudEFjdGlvbiBleHRlbmRzIEFic3RyYWN0TWVzc2FnZUFjdGlvbiB7XG4gIGZpbHRlck1lc3NhZ2VUeXBlIChtZXNzYWdlVHlwZTogTWVzc2FnZVR5cGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbWVzc2FnZVR5cGUgPT09IE1lc3NhZ2VUeXBlLk1hcFZpZXdFeHRlbnRDaGFuZ2VcbiAgfVxuXG4gIGZpbHRlck1lc3NhZ2UgKG1lc3NhZ2U6IE1lc3NhZ2UpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZ2V0U2V0dGluZ0NvbXBvbmVudFVyaSAobWVzc2FnZVR5cGU6IE1lc3NhZ2VUeXBlLCBtZXNzYWdlV2lkZ2V0SWQ/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBvbkV4ZWN1dGUgKG1lc3NhZ2U6IE1lc3NhZ2UsIGFjdGlvbkNvbmZpZz86IGFueSk6IFByb21pc2U8Ym9vbGVhbj4gfCBib29sZWFuIHtcbiAgICBjb25zdCBleHRlbnQgPSBtZXNzYWdlPy5leHRlbnRcbiAgICBjb25zdCB2aWV3UG9pbnQgPSBtZXNzYWdlPy52aWV3UG9pbnRcbiAgICBcbiAgICBkZWJ1Z0xvZ2dlci5sb2coJ01BUC1FWFRFTlQnLCB7XG4gICAgICBleHRlbnQ6IGV4dGVudCA/IHtcbiAgICAgICAgeG1pbjogZXh0ZW50LnhtaW4sXG4gICAgICAgIHltaW46IGV4dGVudC55bWluLFxuICAgICAgICB4bWF4OiBleHRlbnQueG1heCxcbiAgICAgICAgeW1heDogZXh0ZW50LnltYXgsXG4gICAgICAgIHNwYXRpYWxSZWZlcmVuY2U6IGV4dGVudC5zcGF0aWFsUmVmZXJlbmNlXG4gICAgICB9IDogbnVsbCxcbiAgICAgIHZpZXdQb2ludDogdmlld1BvaW50ID8ge1xuICAgICAgICBzY2FsZTogdmlld1BvaW50LnNjYWxlLFxuICAgICAgICByb3RhdGlvbjogdmlld1BvaW50LnJvdGF0aW9uLFxuICAgICAgICB0YXJnZXRHZW9tZXRyeTogdmlld1BvaW50LnRhcmdldEdlb21ldHJ5XG4gICAgICB9IDogbnVsbCxcbiAgICAgIHdpZGdldElkOiB0aGlzLndpZGdldElkXG4gICAgfSlcbiAgICBcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==