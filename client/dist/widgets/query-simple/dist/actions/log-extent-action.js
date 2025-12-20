System.register(["jimu-core","widgets/shared-code/common"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	var __WEBPACK_EXTERNAL_MODULE_widgets_shared_code_common__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_widgets_shared_code_common__, "__esModule", { value: true });
	return {
		setters: [
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
/*!*******************************************************************************!*\
  !*** ./your-extensions/widgets/query-simple/src/actions/log-extent-action.ts ***!
  \*******************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LogExtentAction)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var widgets_shared_code_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! widgets/shared-code/common */ "widgets/shared-code/common");


const debugLogger = (0,widgets_shared_code_common__WEBPACK_IMPORTED_MODULE_1__.createQuerySimpleDebugLogger)();
class LogExtentAction extends jimu_core__WEBPACK_IMPORTED_MODULE_0__.AbstractMessageAction {
    filterMessageType(messageType) {
        return messageType === jimu_core__WEBPACK_IMPORTED_MODULE_0__.MessageType.MapViewExtentChange;
    }
    filterMessage(message) {
        return true;
    }
    filterMessageDescription(messageType) {
        // This action only works with EXTENT_CHANGE messages
        if (messageType === jimu_core__WEBPACK_IMPORTED_MODULE_0__.MessageType.MapViewExtentChange) {
            return 'Log Map Extent to Console';
        }
        // Return null for unsupported message types (like DATA_RECORDS_SELECTION_CHANGE)
        return null;
    }
    getSettingComponentUri(messageType, messageWidgetId) {
        return null;
    }
    onExecute(message, actionConfig) {
        const extent = message === null || message === void 0 ? void 0 : message.extent;
        const viewPoint = message === null || message === void 0 ? void 0 : message.viewPoint;
        /*
        debugLogger.log('MAP-EXTENT', {
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
        })
        */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9xdWVyeS1zaW1wbGUvZGlzdC9hY3Rpb25zL2xvZy1leHRlbnQtYWN0aW9uLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEOzs7Ozs7Ozs7OztBQ0FBLHdFOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkEsMkI7Ozs7Ozs7Ozs7QUNBQTs7O0tBR0s7QUFDTCxxQkFBdUIsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7QUNKb0I7QUFDRTtBQUV6RSxNQUFNLFdBQVcsR0FBRyx3RkFBNEIsRUFBRTtBQUVuQyxNQUFNLGVBQWdCLFNBQVEsNERBQXFCO0lBQ2hFLGlCQUFpQixDQUFFLFdBQXdCO1FBQ3pDLE9BQU8sV0FBVyxLQUFLLGtEQUFXLENBQUMsbUJBQW1CO0lBQ3hELENBQUM7SUFFRCxhQUFhLENBQUUsT0FBZ0I7UUFDN0IsT0FBTyxJQUFJO0lBQ2IsQ0FBQztJQUVELHdCQUF3QixDQUFFLFdBQXdCO1FBQ2hELHFEQUFxRDtRQUNyRCxJQUFJLFdBQVcsS0FBSyxrREFBVyxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDcEQsT0FBTywyQkFBMkI7UUFDcEMsQ0FBQztRQUNELGlGQUFpRjtRQUNqRixPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsc0JBQXNCLENBQUUsV0FBd0IsRUFBRSxlQUF3QjtRQUN4RSxPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsU0FBUyxDQUFFLE9BQWdCLEVBQUUsWUFBa0I7UUFDN0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE1BQU07UUFDOUIsTUFBTSxTQUFTLEdBQUcsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFNBQVM7UUFFcEM7Ozs7Ozs7Ozs7Ozs7Ozs7VUFnQkU7UUFFRixPQUFPLElBQUk7SUFDYixDQUFDO0NBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZVwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwid2lkZ2V0cy9zaGFyZWQtY29kZS9jb21tb25cIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3F1ZXJ5LXNpbXBsZS9zcmMvYWN0aW9ucy9sb2ctZXh0ZW50LWFjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3dpZGdldHNfc2hhcmVkX2NvZGVfY29tbW9uX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIi8qKlxyXG4gKiBXZWJwYWNrIHdpbGwgcmVwbGFjZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB3aXRoIF9fd2VicGFja19yZXF1aXJlX18ucCB0byBzZXQgdGhlIHB1YmxpYyBwYXRoIGR5bmFtaWNhbGx5LlxyXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBzZXQgdGhlIHB1YmxpY1BhdGggaW4gd2VicGFjayBjb25maWcgaXM6IHdlIGNoYW5nZSB0aGUgcHVibGljUGF0aCB3aGVuIGRvd25sb2FkLlxyXG4gKiAqL1xyXG5fX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHdpbmRvdy5qaW11Q29uZmlnLmJhc2VVcmxcclxuIiwiaW1wb3J0IHsgQWJzdHJhY3RNZXNzYWdlQWN0aW9uLCBNZXNzYWdlVHlwZSwgTWVzc2FnZSB9IGZyb20gJ2ppbXUtY29yZSdcbmltcG9ydCB7IGNyZWF0ZVF1ZXJ5U2ltcGxlRGVidWdMb2dnZXIgfSBmcm9tICd3aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbidcblxuY29uc3QgZGVidWdMb2dnZXIgPSBjcmVhdGVRdWVyeVNpbXBsZURlYnVnTG9nZ2VyKClcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9nRXh0ZW50QWN0aW9uIGV4dGVuZHMgQWJzdHJhY3RNZXNzYWdlQWN0aW9uIHtcbiAgZmlsdGVyTWVzc2FnZVR5cGUgKG1lc3NhZ2VUeXBlOiBNZXNzYWdlVHlwZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBtZXNzYWdlVHlwZSA9PT0gTWVzc2FnZVR5cGUuTWFwVmlld0V4dGVudENoYW5nZVxuICB9XG5cbiAgZmlsdGVyTWVzc2FnZSAobWVzc2FnZTogTWVzc2FnZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmaWx0ZXJNZXNzYWdlRGVzY3JpcHRpb24gKG1lc3NhZ2VUeXBlOiBNZXNzYWdlVHlwZSk6IHN0cmluZyB7XG4gICAgLy8gVGhpcyBhY3Rpb24gb25seSB3b3JrcyB3aXRoIEVYVEVOVF9DSEFOR0UgbWVzc2FnZXNcbiAgICBpZiAobWVzc2FnZVR5cGUgPT09IE1lc3NhZ2VUeXBlLk1hcFZpZXdFeHRlbnRDaGFuZ2UpIHtcbiAgICAgIHJldHVybiAnTG9nIE1hcCBFeHRlbnQgdG8gQ29uc29sZSdcbiAgICB9XG4gICAgLy8gUmV0dXJuIG51bGwgZm9yIHVuc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZXMgKGxpa2UgREFUQV9SRUNPUkRTX1NFTEVDVElPTl9DSEFOR0UpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGdldFNldHRpbmdDb21wb25lbnRVcmkgKG1lc3NhZ2VUeXBlOiBNZXNzYWdlVHlwZSwgbWVzc2FnZVdpZGdldElkPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgb25FeGVjdXRlIChtZXNzYWdlOiBNZXNzYWdlLCBhY3Rpb25Db25maWc/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHwgYm9vbGVhbiB7XG4gICAgY29uc3QgZXh0ZW50ID0gbWVzc2FnZT8uZXh0ZW50XG4gICAgY29uc3Qgdmlld1BvaW50ID0gbWVzc2FnZT8udmlld1BvaW50XG4gICAgXG4gICAgLyogXG4gICAgZGVidWdMb2dnZXIubG9nKCdNQVAtRVhURU5UJywge1xuICAgICAgZXh0ZW50OiBleHRlbnQgPyB7XG4gICAgICAgIHhtaW46IGV4dGVudC54bWluLFxuICAgICAgICB5bWluOiBleHRlbnQueW1pbixcbiAgICAgICAgeG1heDogZXh0ZW50LnhtYXgsXG4gICAgICAgIHltYXg6IGV4dGVudC55bWF4LFxuICAgICAgICBzcGF0aWFsUmVmZXJlbmNlOiBleHRlbnQuc3BhdGlhbFJlZmVyZW5jZVxuICAgICAgfSA6IG51bGwsXG4gICAgICB2aWV3UG9pbnQ6IHZpZXdQb2ludCA/IHtcbiAgICAgICAgc2NhbGU6IHZpZXdQb2ludC5zY2FsZSxcbiAgICAgICAgcm90YXRpb246IHZpZXdQb2ludC5yb3RhdGlvbixcbiAgICAgICAgdGFyZ2V0R2VvbWV0cnk6IHZpZXdQb2ludC50YXJnZXRHZW9tZXRyeVxuICAgICAgfSA6IG51bGwsXG4gICAgICB3aWRnZXRJZDogdGhpcy53aWRnZXRJZFxuICAgIH0pXG4gICAgKi9cbiAgICBcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==