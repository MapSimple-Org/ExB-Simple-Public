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
/*!*********************************************************************************!*\
  !*** ./your-extensions/widgets/query-simple/src/tools/app-config-operations.ts ***!
  \*********************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AppConfigOperation)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");

class AppConfigOperation {
    constructor() {
        this.id = 'query-simple-app-config-operation';
    }
    afterWidgetCopied(sourceWidgetId, sourceAppConfig, destWidgetId, destAppConfig, contentMap) {
        var _a;
        if (!contentMap) { // no need to change widget linkage if it is not performed during a page copying
            return destAppConfig;
        }
        const widgetJson = sourceAppConfig.widgets[sourceWidgetId];
        const config = widgetJson === null || widgetJson === void 0 ? void 0 : widgetJson.config;
        let newAppConfig = destAppConfig;
        (_a = config.queryItems) === null || _a === void 0 ? void 0 : _a.forEach((queryItem, index) => {
            var _a, _b;
            if (((_a = queryItem.spatialMapWidgetIds) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                const newWidgetIds = queryItem.spatialMapWidgetIds.map(wId => contentMap[wId]);
                newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'queryItems', `${index}`, 'spatialMapWidgetIds'], newWidgetIds);
            }
            if (queryItem.outputDataSourceId && contentMap[queryItem.outputDataSourceId]) {
                newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'queryItems', `${index}`, 'outputDataSourceId'], contentMap[queryItem.outputDataSourceId]);
            }
            if (queryItem.useDataSource) {
                const { isChanged, useDataSource: newUseDataSource } = jimu_core__WEBPACK_IMPORTED_MODULE_0__.dataSourceUtils.mapUseDataSource(contentMap, queryItem.useDataSource);
                if (isChanged) {
                    newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'queryItems', `${index}`, 'useDataSource'], newUseDataSource);
                }
            }
            if (((_b = queryItem.spatialMapWidgetIds) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                const newList = [];
                queryItem.spatialMapWidgetIds.forEach((mapId) => {
                    if (contentMap[mapId]) {
                        newList.push(contentMap[mapId]);
                    }
                    else {
                        newList.push(mapId);
                    }
                });
                newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'queryItems', `${index}`, 'spatialMapWidgetIds'], newList);
            }
        });
        return newAppConfig;
    }
    /**
     * Do some cleanup operations before current widget is removed.
     * @returns The updated appConfig
     */
    widgetWillRemove(appConfig) {
        return appConfig;
    }
}

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9xdWVyeS1zaW1wbGUvZGlzdC90b29scy9hcHAtY29uZmlnLW9wZXJhdGlvbnMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1RDs7Ozs7O1VDQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7OztXQ05BLDJCOzs7Ozs7Ozs7O0FDQUE7OztLQUdLO0FBQ0wscUJBQXVCLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPOzs7Ozs7Ozs7Ozs7Ozs7QUNKcUQ7QUFHekYsTUFBTSxrQkFBa0I7SUFBdkM7UUFDRSxPQUFFLEdBQUcsbUNBQW1DO0lBc0QxQyxDQUFDO0lBcERDLGlCQUFpQixDQUNmLGNBQXNCLEVBQ3RCLGVBQTRCLEVBQzVCLFlBQW9CLEVBQ3BCLGFBQTBCLEVBQzFCLFVBQTZCOztRQUU3QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxnRkFBZ0Y7WUFDakcsT0FBTyxhQUFhO1FBQ3RCLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztRQUMxRCxNQUFNLE1BQU0sR0FBYSxVQUFVLGFBQVYsVUFBVSx1QkFBVixVQUFVLENBQUUsTUFBTTtRQUMzQyxJQUFJLFlBQVksR0FBRyxhQUFhO1FBRWhDLFlBQU0sQ0FBQyxVQUFVLDBDQUFFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBRTs7WUFDOUMsSUFBSSxnQkFBUyxDQUFDLG1CQUFtQiwwQ0FBRSxNQUFNLElBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzlDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzlFLFlBQVksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEdBQUcsS0FBSyxFQUFFLEVBQUUscUJBQXFCLENBQUMsRUFBRSxZQUFZLENBQUM7WUFDdkksQ0FBQztZQUNELElBQUksU0FBUyxDQUFDLGtCQUFrQixJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO2dCQUM3RSxZQUFZLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBRSxFQUFFLG9CQUFvQixDQUFDLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2xLLENBQUM7WUFDRCxJQUFJLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxzREFBZSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDO2dCQUM1SCxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNkLFlBQVksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEdBQUcsS0FBSyxFQUFFLEVBQUUsZUFBZSxDQUFDLEVBQUUsZ0JBQWdCLENBQUM7Z0JBQ3JJLENBQUM7WUFDSCxDQUFDO1lBQ0QsSUFBSSxnQkFBUyxDQUFDLG1CQUFtQiwwQ0FBRSxNQUFNLElBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzlDLE1BQU0sT0FBTyxHQUFHLEVBQUU7Z0JBQ2xCLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtvQkFDOUMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2pDLENBQUM7eUJBQU0sQ0FBQzt3QkFDTixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDckIsQ0FBQztnQkFDSCxDQUFDLENBQUM7Z0JBQ0YsWUFBWSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsR0FBRyxLQUFLLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFLE9BQU8sQ0FBQztZQUNsSSxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsT0FBTyxZQUFZO0lBQ3JCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxnQkFBZ0IsQ0FBRSxTQUFzQjtRQUN0QyxPQUFPLFNBQVM7SUFDbEIsQ0FBQztDQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmVcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3F1ZXJ5LXNpbXBsZS9zcmMvdG9vbHMvYXBwLWNvbmZpZy1vcGVyYXRpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X2NvcmVfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCJpbXBvcnQgeyBkYXRhU291cmNlVXRpbHMsIHR5cGUgRHVwbGljYXRlQ29udGV4dCwgdHlwZSBleHRlbnNpb25TcGVjLCB0eXBlIElNQXBwQ29uZmlnIH0gZnJvbSAnamltdS1jb3JlJ1xuaW1wb3J0IHR5cGUgeyBJTUNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwQ29uZmlnT3BlcmF0aW9uIGltcGxlbWVudHMgZXh0ZW5zaW9uU3BlYy5BcHBDb25maWdPcGVyYXRpb25zRXh0ZW5zaW9uIHtcbiAgaWQgPSAncXVlcnktc2ltcGxlLWFwcC1jb25maWctb3BlcmF0aW9uJ1xuXG4gIGFmdGVyV2lkZ2V0Q29waWVkIChcbiAgICBzb3VyY2VXaWRnZXRJZDogc3RyaW5nLFxuICAgIHNvdXJjZUFwcENvbmZpZzogSU1BcHBDb25maWcsXG4gICAgZGVzdFdpZGdldElkOiBzdHJpbmcsXG4gICAgZGVzdEFwcENvbmZpZzogSU1BcHBDb25maWcsXG4gICAgY29udGVudE1hcD86IER1cGxpY2F0ZUNvbnRleHRcbiAgKTogSU1BcHBDb25maWcge1xuICAgIGlmICghY29udGVudE1hcCkgeyAvLyBubyBuZWVkIHRvIGNoYW5nZSB3aWRnZXQgbGlua2FnZSBpZiBpdCBpcyBub3QgcGVyZm9ybWVkIGR1cmluZyBhIHBhZ2UgY29weWluZ1xuICAgICAgcmV0dXJuIGRlc3RBcHBDb25maWdcbiAgICB9XG5cbiAgICBjb25zdCB3aWRnZXRKc29uID0gc291cmNlQXBwQ29uZmlnLndpZGdldHNbc291cmNlV2lkZ2V0SWRdXG4gICAgY29uc3QgY29uZmlnOiBJTUNvbmZpZyA9IHdpZGdldEpzb24/LmNvbmZpZ1xuICAgIGxldCBuZXdBcHBDb25maWcgPSBkZXN0QXBwQ29uZmlnXG5cbiAgICBjb25maWcucXVlcnlJdGVtcz8uZm9yRWFjaCgocXVlcnlJdGVtLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKHF1ZXJ5SXRlbS5zcGF0aWFsTWFwV2lkZ2V0SWRzPy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IG5ld1dpZGdldElkcyA9IHF1ZXJ5SXRlbS5zcGF0aWFsTWFwV2lkZ2V0SWRzLm1hcCh3SWQgPT4gY29udGVudE1hcFt3SWRdKVxuICAgICAgICBuZXdBcHBDb25maWcgPSBuZXdBcHBDb25maWcuc2V0SW4oWyd3aWRnZXRzJywgZGVzdFdpZGdldElkLCAnY29uZmlnJywgJ3F1ZXJ5SXRlbXMnLCBgJHtpbmRleH1gLCAnc3BhdGlhbE1hcFdpZGdldElkcyddLCBuZXdXaWRnZXRJZHMpXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLm91dHB1dERhdGFTb3VyY2VJZCAmJiBjb250ZW50TWFwW3F1ZXJ5SXRlbS5vdXRwdXREYXRhU291cmNlSWRdKSB7XG4gICAgICAgIG5ld0FwcENvbmZpZyA9IG5ld0FwcENvbmZpZy5zZXRJbihbJ3dpZGdldHMnLCBkZXN0V2lkZ2V0SWQsICdjb25maWcnLCAncXVlcnlJdGVtcycsIGAke2luZGV4fWAsICdvdXRwdXREYXRhU291cmNlSWQnXSwgY29udGVudE1hcFtxdWVyeUl0ZW0ub3V0cHV0RGF0YVNvdXJjZUlkXSlcbiAgICAgIH1cbiAgICAgIGlmIChxdWVyeUl0ZW0udXNlRGF0YVNvdXJjZSkge1xuICAgICAgICBjb25zdCB7IGlzQ2hhbmdlZCwgdXNlRGF0YVNvdXJjZTogbmV3VXNlRGF0YVNvdXJjZSB9ID0gZGF0YVNvdXJjZVV0aWxzLm1hcFVzZURhdGFTb3VyY2UoY29udGVudE1hcCwgcXVlcnlJdGVtLnVzZURhdGFTb3VyY2UpXG4gICAgICAgIGlmIChpc0NoYW5nZWQpIHtcbiAgICAgICAgICBuZXdBcHBDb25maWcgPSBuZXdBcHBDb25maWcuc2V0SW4oWyd3aWRnZXRzJywgZGVzdFdpZGdldElkLCAnY29uZmlnJywgJ3F1ZXJ5SXRlbXMnLCBgJHtpbmRleH1gLCAndXNlRGF0YVNvdXJjZSddLCBuZXdVc2VEYXRhU291cmNlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLnNwYXRpYWxNYXBXaWRnZXRJZHM/Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbmV3TGlzdCA9IFtdXG4gICAgICAgIHF1ZXJ5SXRlbS5zcGF0aWFsTWFwV2lkZ2V0SWRzLmZvckVhY2goKG1hcElkKSA9PiB7XG4gICAgICAgICAgaWYgKGNvbnRlbnRNYXBbbWFwSWRdKSB7XG4gICAgICAgICAgICBuZXdMaXN0LnB1c2goY29udGVudE1hcFttYXBJZF0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld0xpc3QucHVzaChtYXBJZClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIG5ld0FwcENvbmZpZyA9IG5ld0FwcENvbmZpZy5zZXRJbihbJ3dpZGdldHMnLCBkZXN0V2lkZ2V0SWQsICdjb25maWcnLCAncXVlcnlJdGVtcycsIGAke2luZGV4fWAsICdzcGF0aWFsTWFwV2lkZ2V0SWRzJ10sIG5ld0xpc3QpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBuZXdBcHBDb25maWdcbiAgfVxuXG4gIC8qKlxuICAgKiBEbyBzb21lIGNsZWFudXAgb3BlcmF0aW9ucyBiZWZvcmUgY3VycmVudCB3aWRnZXQgaXMgcmVtb3ZlZC5cbiAgICogQHJldHVybnMgVGhlIHVwZGF0ZWQgYXBwQ29uZmlnXG4gICAqL1xuICB3aWRnZXRXaWxsUmVtb3ZlIChhcHBDb25maWc6IElNQXBwQ29uZmlnKTogSU1BcHBDb25maWcge1xuICAgIHJldHVybiBhcHBDb25maWdcbiAgfVxufVxuXG5cblxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9