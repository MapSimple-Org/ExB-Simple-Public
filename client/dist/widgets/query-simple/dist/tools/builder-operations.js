System.register(["jimu-ui"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE_jimu_ui__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_ui__, "__esModule", { value: true });
	return {
		setters: [
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_ui__[key] = module[key];
				});
			}
		],
		execute: function() {
			__WEBPACK_DYNAMIC_EXPORT__(
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./your-extensions/widgets/query-simple/src/setting/translations/default.ts":
/*!**********************************************************************************!*\
  !*** ./your-extensions/widgets/query-simple/src/setting/translations/default.ts ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    queryItem: 'Query item',
    outputDsLabel: '{label} result',
    addNewQueryAndCustomOptions: 'Add new query and custom options.',
    newQuery: 'New query',
    newFilterLayer: 'Add filter layer',
    arrangementStyle: 'Arrangement style',
    wrapItems: 'Wrap items',
    setQuery: 'Set query',
    attributeFilter: 'Attribute filter',
    addSQLExpressionsToYourQuery: 'Add SQL expressions to your query',
    pleaseAddYourSQLExpressionsFirst: 'Please add your SQL expressions first.',
    spatialFilter: 'Spatial filter',
    mapRequirement_MapNotRequired: 'Map widget not required ',
    mapRequirement_MapIsRequired: 'Requires a Map widget',
    typesOfFilter: 'Filter by',
    featureFromDs: 'Selected features from data source',
    featureFromMap: 'Geometries from a map',
    selectionViewOnly: 'Support selected features view only',
    geometryTypes: 'Geometry types',
    spatialFilterType_CurrentMapExtent: 'Current map extent',
    spatialFilterType_InteractiveDrawMode: 'Drawn graphic',
    spatialFilterType_SpatialRelationship: 'Use other layers',
    results: 'Results',
    listDirection: 'List direction',
    pagingStyle_MultiPage: 'Multipage',
    pagingStyle_LazyLoad: 'Single-page',
    field_PopupSetting: 'Use webmap settings',
    field_SelectAttributes: 'Customize',
    selectDisplayFields: 'Select fields to display ',
    symbolType_DefaultSymbol: 'Default',
    symbolType_CustomSymbol: 'Custom',
    allowToChangeSymbolAtRuntime: 'Allow to change symbol at runtime',
    allowToExport: 'Allow to export',
    interactiveDrawMode: 'Interactive draw mode',
    chooseSelectionTools: 'Tools',
    sketchTool_point: 'Point',
    sketchTool_polyline: 'Line',
    sketchTool_polygon: 'Polygon',
    sketchTool_rectangle: 'Rectangle',
    sketchTool_circle: 'Circle',
    spatialRelationship: 'Spatial relationship',
    chooseSpatialRelationshipRules: 'Spatial relationship rules',
    enableSelectTool: 'Enable select tool',
    queryMessage: 'Message',
    atLeastOneItemIsRequired: 'At least one item is required.',
    configureQuery: 'Configure query',
    hintQueryArgumentsSetting: 'A query can have an attribute filter, spatial filter, or both.',
    noQueryTip: 'Click the "{newQuery}" button to add and configure queries.',
    openTip: 'Open tip',
    closeTip: 'Close tip',
    configTitle: 'Title',
    label: 'Label',
    description: 'Description',
    defaultPageSize: 'Default page size',
    lazyLoadInitialPageSize: 'Initial query page size (LazyLoad)',
    zoomToSelected: 'Zoom to selected',
    groupId: 'Group ID',
    shortIdDescription: 'The hash parameter used to execute a query using #shortid=value in the URL.',
    groupIdDescription: 'Used to group queries together. Example: if you have multiple queries on the parcel layer, one for Parcel number and one for Major number, you can use the Group ID to group these together.'
});


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
/*!******************************************************************************!*\
  !*** ./your-extensions/widgets/query-simple/src/tools/builder-operations.ts ***!
  \******************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BuilderOperations)
/* harmony export */ });
/* harmony import */ var jimu_ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-ui */ "jimu-ui");
/* harmony import */ var _setting_translations_default__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../setting/translations/default */ "./your-extensions/widgets/query-simple/src/setting/translations/default.ts");


class BuilderOperations {
    constructor() {
        this.id = 'query-simple-builder-operation';
    }
    getTranslationKey(appConfig) {
        const config = appConfig.widgets[this.widgetId].config;
        const keys = [];
        const queryItems = (config === null || config === void 0 ? void 0 : config.queryItems) || [];
        queryItems.forEach((queryItem) => {
            const prefix = `widgets.${this.widgetId}.${queryItem.configId}`;
            if (queryItem.name) {
                keys.push({
                    keyType: 'value',
                    key: `${prefix}.name`,
                    label: {
                        key: 'label',
                        enLabel: jimu_ui__WEBPACK_IMPORTED_MODULE_0__.defaultMessages.label
                    },
                    valueType: "text",
                });
            }
            if (queryItem.attributeFilterLabel) {
                keys.push({
                    keyType: 'value',
                    key: `${prefix}.attributeFilterLabel`,
                    label: {
                        key: 'attributeFilter',
                        enLabel: _setting_translations_default__WEBPACK_IMPORTED_MODULE_1__["default"].attributeFilter
                    },
                    valueType: 'text'
                });
            }
            if (queryItem.attributeFilterDesc) {
                keys.push({
                    keyType: 'value',
                    key: `${prefix}.attributeFilterDesc`,
                    label: {
                        key: 'description',
                        enLabel: jimu_ui__WEBPACK_IMPORTED_MODULE_0__.defaultMessages.description
                    },
                    valueType: 'textarea'
                });
            }
            if (queryItem.spatialFilterLabel) {
                keys.push({
                    keyType: 'value',
                    key: `${prefix}.spatialFilterLabel`,
                    label: {
                        key: 'spatialFilter',
                        enLabel: _setting_translations_default__WEBPACK_IMPORTED_MODULE_1__["default"].spatialFilter
                    },
                    valueType: 'text'
                });
            }
            if (queryItem.spatialFilterDesc) {
                keys.push({
                    keyType: 'value',
                    key: `${prefix}.spatialFilterDesc`,
                    label: {
                        key: 'description',
                        enLabel: jimu_ui__WEBPACK_IMPORTED_MODULE_0__.defaultMessages.description
                    },
                    valueType: 'textarea'
                });
            }
            if (queryItem.resultsLabel) {
                keys.push({
                    keyType: 'value',
                    key: `${prefix}.resultsLabel`,
                    label: {
                        key: 'results',
                        enLabel: _setting_translations_default__WEBPACK_IMPORTED_MODULE_1__["default"].results
                    },
                    valueType: 'text'
                });
            }
            if (queryItem.resultTitleExpression) {
                keys.push({
                    keyType: 'value',
                    key: `${prefix}.resultTitleExpression`,
                    label: {
                        key: 'configTitle',
                        enLabel: _setting_translations_default__WEBPACK_IMPORTED_MODULE_1__["default"].configTitle
                    },
                    valueType: 'textarea'
                });
            }
        });
        return Promise.resolve(keys);
    }
}

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9xdWVyeS1zaW1wbGUvZGlzdC90b29scy9idWlsZGVyLW9wZXJhdGlvbnMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUVBQWU7SUFDYixTQUFTLEVBQUUsWUFBWTtJQUN2QixhQUFhLEVBQUUsZ0JBQWdCO0lBQy9CLDJCQUEyQixFQUFFLG1DQUFtQztJQUNoRSxRQUFRLEVBQUUsV0FBVztJQUNyQixjQUFjLEVBQUUsa0JBQWtCO0lBQ2xDLGdCQUFnQixFQUFFLG1CQUFtQjtJQUNyQyxTQUFTLEVBQUUsWUFBWTtJQUN2QixRQUFRLEVBQUUsV0FBVztJQUNyQixlQUFlLEVBQUUsa0JBQWtCO0lBQ25DLDRCQUE0QixFQUFFLG1DQUFtQztJQUNqRSxnQ0FBZ0MsRUFBRSx3Q0FBd0M7SUFDMUUsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQiw2QkFBNkIsRUFBRSwwQkFBMEI7SUFDekQsNEJBQTRCLEVBQUUsdUJBQXVCO0lBQ3JELGFBQWEsRUFBRSxXQUFXO0lBQzFCLGFBQWEsRUFBRSxvQ0FBb0M7SUFDbkQsY0FBYyxFQUFFLHVCQUF1QjtJQUN2QyxpQkFBaUIsRUFBRSxxQ0FBcUM7SUFDeEQsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixrQ0FBa0MsRUFBRSxvQkFBb0I7SUFDeEQscUNBQXFDLEVBQUUsZUFBZTtJQUN0RCxxQ0FBcUMsRUFBRSxrQkFBa0I7SUFDekQsT0FBTyxFQUFFLFNBQVM7SUFDbEIsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixxQkFBcUIsRUFBRSxXQUFXO0lBQ2xDLG9CQUFvQixFQUFFLGFBQWE7SUFDbkMsa0JBQWtCLEVBQUUscUJBQXFCO0lBQ3pDLHNCQUFzQixFQUFFLFdBQVc7SUFDbkMsbUJBQW1CLEVBQUUsMkJBQTJCO0lBQ2hELHdCQUF3QixFQUFFLFNBQVM7SUFDbkMsdUJBQXVCLEVBQUUsUUFBUTtJQUNqQyw0QkFBNEIsRUFBRSxtQ0FBbUM7SUFDakUsYUFBYSxFQUFFLGlCQUFpQjtJQUNo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RSxxRUFBZSxDQUFDLE9BQU87cUJBQ2pDO29CQUNELFNBQVMsRUFBRSxNQUFNO2lCQUNsQixDQUFDO1lBQ0osQ0FBQztZQUNELElBQUksU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ1IsT0FBTyxFQUFFLE9BQU87b0JBQ2hCLEdBQUcsRUFBRSxHQUFHLE1BQU0sd0JBQXdCO29CQUN0QyxLQUFLLEVBQUU7d0JBQ0wsR0FBRyxFQUFFLGFBQWE7d0JBQ2xCLE9BQU8sRUFBRSxxRUFBZSxDQUFDLFdBQVc7cUJBQ3JDO29CQUNELFNBQVMsRUFBRSxVQUFVO2lCQUN0QixDQUFDO1lBQ0osQ0FBQztRQUNILENBQUMsQ0FBQztRQUNGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztDQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3F1ZXJ5LXNpbXBsZS9zcmMvc2V0dGluZy90cmFuc2xhdGlvbnMvZGVmYXVsdC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtdWlcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3F1ZXJ5LXNpbXBsZS9zcmMvdG9vbHMvYnVpbGRlci1vcGVyYXRpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IHtcbiAgcXVlcnlJdGVtOiAnUXVlcnkgaXRlbScsXG4gIG91dHB1dERzTGFiZWw6ICd7bGFiZWx9IHJlc3VsdCcsXG4gIGFkZE5ld1F1ZXJ5QW5kQ3VzdG9tT3B0aW9uczogJ0FkZCBuZXcgcXVlcnkgYW5kIGN1c3RvbSBvcHRpb25zLicsXG4gIG5ld1F1ZXJ5OiAnTmV3IHF1ZXJ5JyxcbiAgbmV3RmlsdGVyTGF5ZXI6ICdBZGQgZmlsdGVyIGxheWVyJyxcbiAgYXJyYW5nZW1lbnRTdHlsZTogJ0FycmFuZ2VtZW50IHN0eWxlJyxcbiAgd3JhcEl0ZW1zOiAnV3JhcCBpdGVtcycsXG4gIHNldFF1ZXJ5OiAnU2V0IHF1ZXJ5JyxcbiAgYXR0cmlidXRlRmlsdGVyOiAnQXR0cmlidXRlIGZpbHRlcicsXG4gIGFkZFNRTEV4cHJlc3Npb25zVG9Zb3VyUXVlcnk6ICdBZGQgU1FMIGV4cHJlc3Npb25zIHRvIHlvdXIgcXVlcnknLFxuICBwbGVhc2VBZGRZb3VyU1FMRXhwcmVzc2lvbnNGaXJzdDogJ1BsZWFzZSBhZGQgeW91ciBTUUwgZXhwcmVzc2lvbnMgZmlyc3QuJyxcbiAgc3BhdGlhbEZpbHRlcjogJ1NwYXRpYWwgZmlsdGVyJyxcbiAgbWFwUmVxdWlyZW1lbnRfTWFwTm90UmVxdWlyZWQ6ICdNYXAgd2lkZ2V0IG5vdCByZXF1aXJlZCAnLFxuICBtYXBSZXF1aXJlbWVudF9NYXBJc1JlcXVpcmVkOiAnUmVxdWlyZXMgYSBNYXAgd2lkZ2V0JyxcbiAgdHlwZXNPZkZpbHRlcjogJ0ZpbHRlciBieScsXG4gIGZlYXR1cmVGcm9tRHM6ICdTZWxlY3RlZCBmZWF0dXJlcyBmcm9tIGRhdGEgc291cmNlJyxcbiAgZmVhdHVyZUZyb21NYXA6ICdHZW9tZXRyaWVzIGZyb20gYSBtYXAnLFxuICBzZWxlY3Rpb25WaWV3T25seTogJ1N1cHBvcnQgc2VsZWN0ZWQgZmVhdHVyZXMgdmlldyBvbmx5JyxcbiAgZ2VvbWV0cnlUeXBlczogJ0dlb21ldHJ5IHR5cGVzJyxcbiAgc3BhdGlhbEZpbHRlclR5cGVfQ3VycmVudE1hcEV4dGVudDogJ0N1cnJlbnQgbWFwIGV4dGVudCcsXG4gIHNwYXRpYWxGaWx0ZXJUeXBlX0ludGVyYWN0aXZlRHJhd01vZGU6ICdEcmF3biBncmFwaGljJyxcbiAgc3BhdGlhbEZpbHRlclR5cGVfU3BhdGlhbFJlbGF0aW9uc2hpcDogJ1VzZSBvdGhlciBsYXllcnMnLFxuICByZXN1bHRzOiAnUmVzdWx0cycsXG4gIGxpc3REaXJlY3Rpb246ICdMaXN0IGRpcmVjdGlvbicsXG4gIHBhZ2luZ1N0eWxlX011bHRpUGFnZTogJ011bHRpcGFnZScsXG4gIHBhZ2luZ1N0eWxlX0xhenlMb2FkOiAnU2luZ2xlLXBhZ2UnLFxuICBmaWVsZF9Qb3B1cFNldHRpbmc6ICdVc2Ugd2VibWFwIHNldHRpbmdzJyxcbiAgZmllbGRfU2VsZWN0QXR0cmlidXRlczogJ0N1c3RvbWl6ZScsXG4gIHNlbGVjdERpc3BsYXlGaWVsZHM6ICdTZWxlY3QgZmllbGRzIHRvIGRpc3BsYXkgJyxcbiAgc3ltYm9sVHlwZV9EZWZhdWx0U3ltYm9sOiAnRGVmYXVsdCcsXG4gIHN5bWJvbFR5cGVfQ3VzdG9tU3ltYm9sOiAnQ3VzdG9tJyxcbiAgYWxsb3dUb0NoYW5nZVN5bWJvbEF0UnVudGltZTogJ0FsbG93IHRvIGNoYW5nZSBzeW1ib2wgYXQgcnVudGltZScsXG4gIGFsbG93VG9FeHBvcnQ6ICdBbGxvdyB0byBleHBvcnQnLFxuICBpbnRlcmFjdGl2ZURyYXdNb2RlOiAnSW50ZXJhY3RpdmUgZHJhdyBtb2RlJyxcbiAgY2hvb3NlU2VsZWN0aW9uVG9vbHM6ICdUb29scycsXG4gIHNrZXRjaFRvb2xfcG9pbnQ6ICdQb2ludCcsXG4gIHNrZXRjaFRvb2xfcG9seWxpbmU6ICdMaW5lJyxcbiAgc2tldGNoVG9vbF9wb2x5Z29uOiAnUG9seWdvbicsXG4gIHNrZXRjaFRvb2xfcmVjdGFuZ2xlOiAnUmVjdGFuZ2xlJyxcbiAgc2tldGNoVG9vbF9jaXJjbGU6ICdDaXJjbGUnLFxuICBzcGF0aWFsUmVsYXRpb25zaGlwOiAnU3BhdGlhbCByZWxhdGlvbnNoaXAnLFxuICBjaG9vc2VTcGF0aWFsUmVsYXRpb25zaGlwUnVsZXM6ICdTcGF0aWFsIHJlbGF0aW9uc2hpcCBydWxlcycsXG4gIGVuYWJsZVNlbGVjdFRvb2w6ICdFbmFibGUgc2VsZWN0IHRvb2wnLFxuICBxdWVyeU1lc3NhZ2U6ICdNZXNzYWdlJyxcbiAgYXRMZWFzdE9uZUl0ZW1Jc1JlcXVpcmVkOiAnQXQgbGVhc3Qgb25lIGl0ZW0gaXMgcmVxdWlyZWQuJyxcbiAgY29uZmlndXJlUXVlcnk6ICdDb25maWd1cmUgcXVlcnknLFxuICBoaW50UXVlcnlBcmd1bWVudHNTZXR0aW5nOiAnQSBxdWVyeSBjYW4gaGF2ZSBhbiBhdHRyaWJ1dGUgZmlsdGVyLCBzcGF0aWFsIGZpbHRlciwgb3IgYm90aC4nLFxuICBub1F1ZXJ5VGlwOiAnQ2xpY2sgdGhlIFwie25ld1F1ZXJ5fVwiIGJ1dHRvbiB0byBhZGQgYW5kIGNvbmZpZ3VyZSBxdWVyaWVzLicsXG4gIG9wZW5UaXA6ICdPcGVuIHRpcCcsXG4gIGNsb3NlVGlwOiAnQ2xvc2UgdGlwJyxcbiAgY29uZmlnVGl0bGU6ICdUaXRsZScsXG4gIGxhYmVsOiAnTGFiZWwnLFxuICBkZXNjcmlwdGlvbjogJ0Rlc2NyaXB0aW9uJyxcbiAgZGVmYXVsdFBhZ2VTaXplOiAnRGVmYXVsdCBwYWdlIHNpemUnLFxuICBsYXp5TG9hZEluaXRpYWxQYWdlU2l6ZTogJ0luaXRpYWwgcXVlcnkgcGFnZSBzaXplIChMYXp5TG9hZCknLFxuICB6b29tVG9TZWxlY3RlZDogJ1pvb20gdG8gc2VsZWN0ZWQnLFxuICBncm91cElkOiAnR3JvdXAgSUQnLFxuICBzaG9ydElkRGVzY3JpcHRpb246ICdUaGUgaGFzaCBwYXJhbWV0ZXIgdXNlZCB0byBleGVjdXRlIGEgcXVlcnkgdXNpbmcgI3Nob3J0aWQ9dmFsdWUgaW4gdGhlIFVSTC4nLFxuICBncm91cElkRGVzY3JpcHRpb246ICdVc2VkIHRvIGdyb3VwIHF1ZXJpZXMgdG9nZXRoZXIuIEV4YW1wbGU6IGlmIHlvdSBoYXZlIG11bHRpcGxlIHF1ZXJpZXMgb24gdGhlIHBhcmNlbCBsYXllciwgb25lIGZvciBQYXJjZWwgbnVtYmVyIGFuZCBvbmUgZm9yIE1ham9yIG51bWJlciwgeW91IGNhbiB1c2UgdGhlIEdyb3VwIElEIHRvIGdyb3VwIHRoZXNlIHRvZ2V0aGVyLidcbn1cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV91aV9fOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCIvKipcclxuICogV2VicGFjayB3aWxsIHJlcGxhY2UgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gd2l0aCBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgdG8gc2V0IHRoZSBwdWJsaWMgcGF0aCBkeW5hbWljYWxseS5cclxuICogVGhlIHJlYXNvbiB3aHkgd2UgY2FuJ3Qgc2V0IHRoZSBwdWJsaWNQYXRoIGluIHdlYnBhY2sgY29uZmlnIGlzOiB3ZSBjaGFuZ2UgdGhlIHB1YmxpY1BhdGggd2hlbiBkb3dubG9hZC5cclxuICogKi9cclxuX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB3aW5kb3cuamltdUNvbmZpZy5iYXNlVXJsXHJcbiIsImltcG9ydCB0eXBlIHsgZXh0ZW5zaW9uU3BlYywgSU1BcHBDb25maWcsIEltbXV0YWJsZU9iamVjdCB9IGZyb20gJ2ppbXUtY29yZSdcbmltcG9ydCB7IGRlZmF1bHRNZXNzYWdlcyBhcyBqaW11VUlNZXNzYWdlcyB9IGZyb20gJ2ppbXUtdWknXG5pbXBvcnQgdHlwZSB7IElNQ29uZmlnLCBRdWVyeUl0ZW1UeXBlIH0gZnJvbSAnLi4vY29uZmlnJ1xuaW1wb3J0IGRlZmF1bHRNZXNzYWdlcyBmcm9tICcuLi9zZXR0aW5nL3RyYW5zbGF0aW9ucy9kZWZhdWx0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCdWlsZGVyT3BlcmF0aW9ucyBpbXBsZW1lbnRzIGV4dGVuc2lvblNwZWMuQnVpbGRlck9wZXJhdGlvbnNFeHRlbnNpb24ge1xuICBpZCA9ICdxdWVyeS1zaW1wbGUtYnVpbGRlci1vcGVyYXRpb24nXG4gIHdpZGdldElkOiBzdHJpbmdcblxuICBnZXRUcmFuc2xhdGlvbktleShhcHBDb25maWc6IElNQXBwQ29uZmlnKTogUHJvbWlzZTxleHRlbnNpb25TcGVjLlRyYW5zbGF0aW9uS2V5W10+IHtcbiAgICBjb25zdCBjb25maWcgPSBhcHBDb25maWcud2lkZ2V0c1t0aGlzLndpZGdldElkXS5jb25maWcgYXMgSU1Db25maWdcbiAgICBjb25zdCBrZXlzOiBleHRlbnNpb25TcGVjLlRyYW5zbGF0aW9uS2V5W10gPSBbXVxuICAgIGNvbnN0IHF1ZXJ5SXRlbXMgPSBjb25maWc/LnF1ZXJ5SXRlbXMgfHwgW11cbiAgICBxdWVyeUl0ZW1zLmZvckVhY2goKHF1ZXJ5SXRlbTogSW1tdXRhYmxlT2JqZWN0PFF1ZXJ5SXRlbVR5cGU+KSA9PiB7XG4gICAgICBjb25zdCBwcmVmaXggPSBgd2lkZ2V0cy4ke3RoaXMud2lkZ2V0SWR9LiR7cXVlcnlJdGVtLmNvbmZpZ0lkfWBcbiAgICAgIGlmIChxdWVyeUl0ZW0ubmFtZSkge1xuICAgICAgICBrZXlzLnB1c2goe1xuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9Lm5hbWVgLFxuICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBrZXk6ICdsYWJlbCcsXG4gICAgICAgICAgICBlbkxhYmVsOiBqaW11VUlNZXNzYWdlcy5sYWJlbFxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiBcInRleHRcIixcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChxdWVyeUl0ZW0uYXR0cmlidXRlRmlsdGVyTGFiZWwpIHtcbiAgICAgICAga2V5cy5wdXNoKHtcbiAgICAgICAgICBrZXlUeXBlOiAndmFsdWUnLFxuICAgICAgICAgIGtleTogYCR7cHJlZml4fS5hdHRyaWJ1dGVGaWx0ZXJMYWJlbGAsXG4gICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGtleTogJ2F0dHJpYnV0ZUZpbHRlcicsXG4gICAgICAgICAgICBlbkxhYmVsOiBkZWZhdWx0TWVzc2FnZXMuYXR0cmlidXRlRmlsdGVyXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZVR5cGU6ICd0ZXh0J1xuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgaWYgKHF1ZXJ5SXRlbS5hdHRyaWJ1dGVGaWx0ZXJEZXNjKSB7XG4gICAgICAgIGtleXMucHVzaCh7XG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcbiAgICAgICAgICBrZXk6IGAke3ByZWZpeH0uYXR0cmlidXRlRmlsdGVyRGVzY2AsXG4gICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGtleTogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIGVuTGFiZWw6IGppbXVVSU1lc3NhZ2VzLmRlc2NyaXB0aW9uXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZVR5cGU6ICd0ZXh0YXJlYSdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChxdWVyeUl0ZW0uc3BhdGlhbEZpbHRlckxhYmVsKSB7XG4gICAgICAgIGtleXMucHVzaCh7XG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcbiAgICAgICAgICBrZXk6IGAke3ByZWZpeH0uc3BhdGlhbEZpbHRlckxhYmVsYCxcbiAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAga2V5OiAnc3BhdGlhbEZpbHRlcicsXG4gICAgICAgICAgICBlbkxhYmVsOiBkZWZhdWx0TWVzc2FnZXMuc3BhdGlhbEZpbHRlclxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dCdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChxdWVyeUl0ZW0uc3BhdGlhbEZpbHRlckRlc2MpIHtcbiAgICAgICAga2V5cy5wdXNoKHtcbiAgICAgICAgICBrZXlUeXBlOiAndmFsdWUnLFxuICAgICAgICAgIGtleTogYCR7cHJlZml4fS5zcGF0aWFsRmlsdGVyRGVzY2AsXG4gICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGtleTogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIGVuTGFiZWw6IGppbXVVSU1lc3NhZ2VzLmRlc2NyaXB0aW9uXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZVR5cGU6ICd0ZXh0YXJlYSdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChxdWVyeUl0ZW0ucmVzdWx0c0xhYmVsKSB7XG4gICAgICAgIGtleXMucHVzaCh7XG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcbiAgICAgICAgICBrZXk6IGAke3ByZWZpeH0ucmVzdWx0c0xhYmVsYCxcbiAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAga2V5OiAncmVzdWx0cycsXG4gICAgICAgICAgICBlbkxhYmVsOiBkZWZhdWx0TWVzc2FnZXMucmVzdWx0c1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dCdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChxdWVyeUl0ZW0ucmVzdWx0VGl0bGVFeHByZXNzaW9uKSB7XG4gICAgICAgIGtleXMucHVzaCh7XG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcbiAgICAgICAgICBrZXk6IGAke3ByZWZpeH0ucmVzdWx0VGl0bGVFeHByZXNzaW9uYCxcbiAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAga2V5OiAnY29uZmlnVGl0bGUnLFxuICAgICAgICAgICAgZW5MYWJlbDogZGVmYXVsdE1lc3NhZ2VzLmNvbmZpZ1RpdGxlXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZVR5cGU6ICd0ZXh0YXJlYSdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoa2V5cylcbiAgfVxufVxuXG5cblxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9