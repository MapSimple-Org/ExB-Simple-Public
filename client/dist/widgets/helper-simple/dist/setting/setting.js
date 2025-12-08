System.register(["jimu-core/emotion","jimu-core","jimu-for-builder","jimu-ui","jimu-ui/advanced/setting-components"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_for_builder__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_ui__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_for_builder__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_ui__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__, "__esModule", { value: true });
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
					__WEBPACK_EXTERNAL_MODULE_jimu_for_builder__[key] = module[key];
				});
			},
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_ui__[key] = module[key];
				});
			},
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__[key] = module[key];
				});
			}
		],
		execute: function() {
			__WEBPACK_DYNAMIC_EXPORT__(
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./your-extensions/widgets/helper-simple/src/setting/translations/default.ts":
/*!***********************************************************************************!*\
  !*** ./your-extensions/widgets/helper-simple/src/setting/translations/default.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    managedWidget: 'Managed Widget',
    selectWidget: 'Select Widget',
    widgetDescription: 'Select a QuerySimple widget to manage. This widget will monitor URL hash parameters and open the selected widget when matching parameters are detected.',
    noWidgetsAvailable: 'No widgets with query items found. Please add a QuerySimple widget with query items first.'
});


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

/***/ "jimu-for-builder":
/*!***********************************!*\
  !*** external "jimu-for-builder" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_for_builder__;

/***/ }),

/***/ "jimu-ui":
/*!**************************!*\
  !*** external "jimu-ui" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_ui__;

/***/ }),

/***/ "jimu-ui/advanced/setting-components":
/*!******************************************************!*\
  !*** external "jimu-ui/advanced/setting-components" ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__;

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
/*!***********************************************************************!*\
  !*** ./your-extensions/widgets/helper-simple/src/setting/setting.tsx ***!
  \***********************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (/* binding */ Setting)
/* harmony export */ });
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/react/jsx-runtime */ "@emotion/react/jsx-runtime");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_for_builder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jimu-for-builder */ "jimu-for-builder");
/* harmony import */ var jimu_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jimu-ui */ "jimu-ui");
/* harmony import */ var jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! jimu-ui/advanced/setting-components */ "jimu-ui/advanced/setting-components");
/* harmony import */ var _translations_default__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./translations/default */ "./your-extensions/widgets/helper-simple/src/setting/translations/default.ts");

/** @jsx jsx */





const messages = Object.assign({}, _translations_default__WEBPACK_IMPORTED_MODULE_5__["default"], jimu_ui__WEBPACK_IMPORTED_MODULE_3__.defaultMessages);
class Setting extends jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.PureComponent {
    constructor() {
        super(...arguments);
        this.getI18nMessage = (id) => {
            return this.props.intl.formatMessage({ id, defaultMessage: messages[id] });
        };
        this.onSettingChange = (key, value) => {
            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set(key, value)
            });
        };
        /**
         * Scans app config for widgets that have queryItems with shortIds
         */
        this.getWidgetsWithShortIds = () => {
            const appConfig = (0,jimu_for_builder__WEBPACK_IMPORTED_MODULE_2__.getAppConfigAction)().appConfig;
            const widgets = [];
            if (!(appConfig === null || appConfig === void 0 ? void 0 : appConfig.widgets)) {
                return widgets;
            }
            Object.keys(appConfig.widgets).forEach(widgetId => {
                var _a;
                const widget = appConfig.widgets[widgetId];
                // Check if widget has queryItems with shortIds
                if ((_a = widget.config) === null || _a === void 0 ? void 0 : _a.queryItems) {
                    const queryItems = widget.config.queryItems;
                    const shortIds = [];
                    queryItems.forEach((item) => {
                        if (item.shortId && item.shortId.trim() !== '') {
                            shortIds.push(item.shortId);
                        }
                    });
                    if (shortIds.length > 0) {
                        widgets.push({
                            id: widgetId,
                            label: widget.label || widgetId,
                            shortIds
                        });
                    }
                }
            });
            return widgets;
        };
    }
    render() {
        const { config } = this.props;
        const availableWidgets = this.getWidgetsWithShortIds();
        return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: 'jimu-widget-setting setting-helper-simple__setting-content h-100', children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingSection, { title: this.getI18nMessage('managedWidget'), children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingRow, { flow: 'wrap', label: "", children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { style: {
                                fontSize: '0.875rem',
                                color: 'var(--sys-color-text-primary)',
                                marginBottom: '12px',
                                lineHeight: '1.5'
                            }, children: this.getI18nMessage('widgetDescription') }) }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingRow, { flow: 'wrap', label: this.getI18nMessage('selectWidget'), children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_3__.Select, { size: 'sm', className: 'w-100', value: config.managedWidgetId || '', onChange: (e) => {
                                const value = e.target.value || undefined;
                                this.onSettingChange('managedWidgetId', value);
                            }, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "", children: this.getI18nMessage('selectWidget') }), availableWidgets.map(widget => ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("option", { value: widget.id, children: [widget.label, " (", widget.shortIds.join(', '), ")"] }, widget.id)))] }) }), availableWidgets.length === 0 && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: 'text-muted mt-2', style: { fontSize: '0.875rem' }, children: this.getI18nMessage('noWidgetsAvailable') }))] }) }));
    }
}
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9oZWxwZXItc2ltcGxlL2Rpc3Qvc2V0dGluZy9zZXR0aW5nLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpRUFBZTtJQUNiLGFBQWEsRUFBRSxnQkFBZ0I7SUFDL0IsWUFBWSxFQUFFLGVBQWU7SUFDN0IsaUJBQWlCLEVBQUUseUpBQXlKO0lBQzVLLGtCQUFrQixFQUFFLDRGQUE0RjtDQUNqSDs7Ozs7Ozs7Ozs7O0FDTEQsd0U7Ozs7Ozs7Ozs7O0FDQUEsdUQ7Ozs7Ozs7Ozs7O0FDQUEsOEQ7Ozs7Ozs7Ozs7O0FDQUEscUQ7Ozs7Ozs7Ozs7O0FDQUEsaUY7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7V0NOQSwyQjs7Ozs7Ozs7OztBQ0FBOzs7S0FHSztBQUNMLHFCQUF1QixHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0puRCxlQUFlO0FBSUc7QUFLTztBQUNpRDtBQUNNO0FBRTVCO0FBRXBELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLDZEQUFlLEVBQUUsb0RBQXFCLENBQUM7QUFRM0QsTUFBTSxPQUFRLFNBQVEsNENBQUssQ0FBQyxhQUE4QztJQUF6Rjs7UUFDRSxtQkFBYyxHQUFHLENBQUMsRUFBVSxFQUFFLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsS0FB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QU0sQ0FBQyxlQUFlLElBQUksRUFBRSxFQUNuQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQ0FDZCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxTQUFTO2dDQUN6QyxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQzs0QkFDaEQsQ0FBQyxhQUVELDRFQUFRLEtBQUssRUFBQyxFQUFFLFlBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsR0FBVSxFQUM5RCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUM5Qiw2RUFBd0IsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLGFBQ3JDLE1BQU0sQ0FBQyxLQUFLLFFBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBRGhDLE1BQU0sQ0FBQyxFQUFFLENBRWIsQ0FDVixDQUFDLElBQ0ssR0FDRSxFQUNaLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FDaEMseUVBQUssU0FBUyxFQUFDLGlCQUFpQixFQUFDLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsWUFDN0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUN0QyxDQUNQLElBQ2MsR0FDYixDQUNQO0lBQ0gsQ0FBQztDQUNGO0FBRU8sU0FBUywyQkFBMkIsQ0FBQyxHQUFHLElBQUkscUJBQXVCLEdBQUcsR0FBRyxFQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvaGVscGVyLXNpbXBsZS9zcmMvc2V0dGluZy90cmFuc2xhdGlvbnMvZGVmYXVsdC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZS9lbW90aW9uXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmVcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtZm9yLWJ1aWxkZXJcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtdWlcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtdWkvYWR2YW5jZWQvc2V0dGluZy1jb21wb25lbnRzXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9oZWxwZXItc2ltcGxlL3NyYy9zZXR0aW5nL3NldHRpbmcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IHtcbiAgbWFuYWdlZFdpZGdldDogJ01hbmFnZWQgV2lkZ2V0JyxcbiAgc2VsZWN0V2lkZ2V0OiAnU2VsZWN0IFdpZGdldCcsXG4gIHdpZGdldERlc2NyaXB0aW9uOiAnU2VsZWN0IGEgUXVlcnlTaW1wbGUgd2lkZ2V0IHRvIG1hbmFnZS4gVGhpcyB3aWRnZXQgd2lsbCBtb25pdG9yIFVSTCBoYXNoIHBhcmFtZXRlcnMgYW5kIG9wZW4gdGhlIHNlbGVjdGVkIHdpZGdldCB3aGVuIG1hdGNoaW5nIHBhcmFtZXRlcnMgYXJlIGRldGVjdGVkLicsXG4gIG5vV2lkZ2V0c0F2YWlsYWJsZTogJ05vIHdpZGdldHMgd2l0aCBxdWVyeSBpdGVtcyBmb3VuZC4gUGxlYXNlIGFkZCBhIFF1ZXJ5U2ltcGxlIHdpZGdldCB3aXRoIHF1ZXJ5IGl0ZW1zIGZpcnN0Lidcbn1cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfX2Vtb3Rpb25fcmVhY3RfanN4X3J1bnRpbWVfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfZm9yX2J1aWxkZXJfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV91aV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X3VpX2FkdmFuY2VkX3NldHRpbmdfY29tcG9uZW50c19fOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCIvKipcclxuICogV2VicGFjayB3aWxsIHJlcGxhY2UgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gd2l0aCBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgdG8gc2V0IHRoZSBwdWJsaWMgcGF0aCBkeW5hbWljYWxseS5cclxuICogVGhlIHJlYXNvbiB3aHkgd2UgY2FuJ3Qgc2V0IHRoZSBwdWJsaWNQYXRoIGluIHdlYnBhY2sgY29uZmlnIGlzOiB3ZSBjaGFuZ2UgdGhlIHB1YmxpY1BhdGggd2hlbiBkb3dubG9hZC5cclxuICogKi9cclxuX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB3aW5kb3cuamltdUNvbmZpZy5iYXNlVXJsXHJcbiIsIi8qKiBAanN4IGpzeCAqL1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIGpzeFxufSBmcm9tICdqaW11LWNvcmUnXG5pbXBvcnQge1xuICB0eXBlIEFsbFdpZGdldFNldHRpbmdQcm9wcyxcbiAgdHlwZSBTZXR0aW5nQ2hhbmdlRnVuY3Rpb24sXG4gIGdldEFwcENvbmZpZ0FjdGlvblxufSBmcm9tICdqaW11LWZvci1idWlsZGVyJ1xuaW1wb3J0IHsgU2VsZWN0LCBkZWZhdWx0TWVzc2FnZXMgYXMgamltdVVJRGVmYXVsdE1lc3NhZ2VzIH0gZnJvbSAnamltdS11aSdcbmltcG9ydCB7IFNldHRpbmdSb3csIFNldHRpbmdTZWN0aW9uIH0gZnJvbSAnamltdS11aS9hZHZhbmNlZC9zZXR0aW5nLWNvbXBvbmVudHMnXG5pbXBvcnQgeyB0eXBlIElNQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJ1xuaW1wb3J0IGRlZmF1bHRNZXNzYWdlcyBmcm9tICcuL3RyYW5zbGF0aW9ucy9kZWZhdWx0J1xuXG5jb25zdCBtZXNzYWdlcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRNZXNzYWdlcywgamltdVVJRGVmYXVsdE1lc3NhZ2VzKVxuXG5pbnRlcmZhY2UgV2lkZ2V0T3B0aW9uIHtcbiAgaWQ6IHN0cmluZ1xuICBsYWJlbDogc3RyaW5nXG4gIHNob3J0SWRzOiBzdHJpbmdbXVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXR0aW5nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxBbGxXaWRnZXRTZXR0aW5nUHJvcHM8SU1Db25maWc+PiB7XG4gIGdldEkxOG5NZXNzYWdlID0gKGlkOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5pbnRsLmZvcm1hdE1lc3NhZ2UoeyBpZCwgZGVmYXVsdE1lc3NhZ2U6IG1lc3NhZ2VzW2lkXSB9KVxuICB9XG5cbiAgb25TZXR0aW5nQ2hhbmdlOiBTZXR0aW5nQ2hhbmdlRnVuY3Rpb24gPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgIHRoaXMucHJvcHMub25TZXR0aW5nQ2hhbmdlKHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgY29uZmlnOiB0aGlzLnByb3BzLmNvbmZpZy5zZXQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFNjYW5zIGFwcCBjb25maWcgZm9yIHdpZGdldHMgdGhhdCBoYXZlIHF1ZXJ5SXRlbXMgd2l0aCBzaG9ydElkc1xuICAgKi9cbiAgZ2V0V2lkZ2V0c1dpdGhTaG9ydElkcyA9ICgpOiBXaWRnZXRPcHRpb25bXSA9PiB7XG4gICAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnQWN0aW9uKCkuYXBwQ29uZmlnXG4gICAgY29uc3Qgd2lkZ2V0czogV2lkZ2V0T3B0aW9uW10gPSBbXVxuXG4gICAgaWYgKCFhcHBDb25maWc/LndpZGdldHMpIHtcbiAgICAgIHJldHVybiB3aWRnZXRzXG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoYXBwQ29uZmlnLndpZGdldHMpLmZvckVhY2god2lkZ2V0SWQgPT4ge1xuICAgICAgY29uc3Qgd2lkZ2V0ID0gYXBwQ29uZmlnLndpZGdldHNbd2lkZ2V0SWRdXG4gICAgICBcbiAgICAgIC8vIENoZWNrIGlmIHdpZGdldCBoYXMgcXVlcnlJdGVtcyB3aXRoIHNob3J0SWRzXG4gICAgICBpZiAod2lkZ2V0LmNvbmZpZz8ucXVlcnlJdGVtcykge1xuICAgICAgICBjb25zdCBxdWVyeUl0ZW1zID0gd2lkZ2V0LmNvbmZpZy5xdWVyeUl0ZW1zXG4gICAgICAgIGNvbnN0IHNob3J0SWRzOiBzdHJpbmdbXSA9IFtdXG4gICAgICAgIFxuICAgICAgICBxdWVyeUl0ZW1zLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChpdGVtLnNob3J0SWQgJiYgaXRlbS5zaG9ydElkLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgIHNob3J0SWRzLnB1c2goaXRlbS5zaG9ydElkKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIGlmIChzaG9ydElkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgd2lkZ2V0cy5wdXNoKHtcbiAgICAgICAgICAgIGlkOiB3aWRnZXRJZCxcbiAgICAgICAgICAgIGxhYmVsOiB3aWRnZXQubGFiZWwgfHwgd2lkZ2V0SWQsXG4gICAgICAgICAgICBzaG9ydElkc1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHdpZGdldHNcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGNvbmZpZyB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IGF2YWlsYWJsZVdpZGdldHMgPSB0aGlzLmdldFdpZGdldHNXaXRoU2hvcnRJZHMoKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdqaW11LXdpZGdldC1zZXR0aW5nIHNldHRpbmctaGVscGVyLXNpbXBsZV9fc2V0dGluZy1jb250ZW50IGgtMTAwJz5cbiAgICAgICAgPFNldHRpbmdTZWN0aW9uIHRpdGxlPXt0aGlzLmdldEkxOG5NZXNzYWdlKCdtYW5hZ2VkV2lkZ2V0Jyl9PlxuICAgICAgICAgIDxTZXR0aW5nUm93IGZsb3c9J3dyYXAnIGxhYmVsPVwiXCI+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxuICAgICAgICAgICAgICBmb250U2l6ZTogJzAuODc1cmVtJywgXG4gICAgICAgICAgICAgIGNvbG9yOiAndmFyKC0tc3lzLWNvbG9yLXRleHQtcHJpbWFyeSknLFxuICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICcxMnB4JyxcbiAgICAgICAgICAgICAgbGluZUhlaWdodDogJzEuNSdcbiAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICB7dGhpcy5nZXRJMThuTWVzc2FnZSgnd2lkZ2V0RGVzY3JpcHRpb24nKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvU2V0dGluZ1Jvdz5cbiAgICAgICAgICA8U2V0dGluZ1JvdyBmbG93PSd3cmFwJyBsYWJlbD17dGhpcy5nZXRJMThuTWVzc2FnZSgnc2VsZWN0V2lkZ2V0Jyl9PlxuICAgICAgICAgICAgPFNlbGVjdFxuICAgICAgICAgICAgICBzaXplPSdzbSdcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPSd3LTEwMCdcbiAgICAgICAgICAgICAgdmFsdWU9e2NvbmZpZy5tYW5hZ2VkV2lkZ2V0SWQgfHwgJyd9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZS50YXJnZXQudmFsdWUgfHwgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgdGhpcy5vblNldHRpbmdDaGFuZ2UoJ21hbmFnZWRXaWRnZXRJZCcsIHZhbHVlKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+e3RoaXMuZ2V0STE4bk1lc3NhZ2UoJ3NlbGVjdFdpZGdldCcpfTwvb3B0aW9uPlxuICAgICAgICAgICAgICB7YXZhaWxhYmxlV2lkZ2V0cy5tYXAod2lkZ2V0ID0+IChcbiAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17d2lkZ2V0LmlkfSB2YWx1ZT17d2lkZ2V0LmlkfT5cbiAgICAgICAgICAgICAgICAgIHt3aWRnZXQubGFiZWx9ICh7d2lkZ2V0LnNob3J0SWRzLmpvaW4oJywgJyl9KVxuICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgIDwvU2V0dGluZ1Jvdz5cbiAgICAgICAgICB7YXZhaWxhYmxlV2lkZ2V0cy5sZW5ndGggPT09IDAgJiYgKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3RleHQtbXV0ZWQgbXQtMicgc3R5bGU9e3sgZm9udFNpemU6ICcwLjg3NXJlbScgfX0+XG4gICAgICAgICAgICAgIHt0aGlzLmdldEkxOG5NZXNzYWdlKCdub1dpZGdldHNBdmFpbGFibGUnKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvU2V0dGluZ1NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cblxuIGV4cG9ydCBmdW5jdGlvbiBfX3NldF93ZWJwYWNrX3B1YmxpY19wYXRoX18odXJsKSB7IF9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gdXJsIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=