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
    groupIdDescription: 'Used to group queries together. Example: if you have multiple queries on the parcel layer, one for Parcel number and one for Major number, you can use the Group ID to group these together.',
    displayOrder: 'Display Order',
    displayOrderDescription: 'Lower numbers appear first. Leave empty to maintain default order.'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9xdWVyeS1zaW1wbGUvZGlzdC90b29scy9idWlsZGVyLW9wZXJhdGlvbnMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUVBQWU7SUFDYixTQUFTLEVBQUUsWUFBWTtJQUN2QixhQUFhLEVBQUUsZ0JBQWdCO0lBQy9CLDJCQUEyQixFQUFFLG1DQUFtQztJQUNoRSxRQUFRLEVBQUUsV0FBVztJQUNyQixjQUFjLEVBQUUsa0JBQWtCO0lBQ2xDLGdCQUFnQixFQUFFLG1CQUFtQjtJQUNyQyxTQUFTLEVBQUUsWUFBWTtJQUN2QixRQUFRLEVBQUUsV0FBVztJQUNyQixlQUFlLEVBQUUsa0JBQWtCO0lBQ25DLDRCQUE0QixFQUFFLG1DQUFtQztJQUNqRSxnQ0FBZ0MsRUFBRSx3Q0FBd0M7SUFDMUUsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQiw2QkFBNkIsRUFBRSwwQkFBMEI7SUFDekQsNEJBQTRCLEVBQUUsdUJBQXVCO0lBQ3JELGFBQWEsRUFBRSxXQUFXO0lBQzFCLGFBQWEsRUFBRSxvQ0FBb0M7SUFDbkQsY0FBYyxFQUFFLHVCQUF1QjtJQUN2QyxpQkFBaUIsRUFBRSxxQ0FBcUM7SUFDeEQsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixrQ0FBa0MsRUFBRSxvQkFBb0I7SUFDeEQscUNBQXFDLEVBQUUsZUFBZTtJQUN0RCxxQ0FBcUMsRUFBRSxrQkFBa0I7SUFDekQsT0FBTyxFQUFFLFNBQVM7SUFDbEIsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixxQkFBcUIsRUFBRSxXQUFXO0lBQ2xDLG9CQUFvQixFQUFFLGFBQWE7SUFDbkMsa0JBQWtCLEVBQUUscUJBQXFCO0lBQ3pDLHNCQUFzQixFQUFFLFdBQVc7SUFDbkMsbUJBQW1CLEVBQUUsMkJBQTJCO0lBQ2hELHdCQUF3QixFQUFFLFNBQVM7SUFDbkMsdUJBQXVCLEVBQUUsUUFBUTtJQUNqQyw0QkFBNEIsRUFBRSxtQ0FBbUM7SUFDakUsYUFBYSxFQUFFLGlCQUFpQjtJQUNo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LEtBQUssRUFBRTt3QkFDTCxHQUFHLEVBQUUsU0FBUzt3QkFDZCxPQUFPLEVBQUUscUVBQWUsQ0FBQyxPQUFPO3FCQUNqQztvQkFDRCxTQUFTLEVBQUUsTUFBTTtpQkFDbEIsQ0FBQztZQUNKLENBQUM7WUFDRCxJQUFJLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNSLE9BQU8sRUFBRSxPQUFPO29CQUNoQixHQUFHLEVBQUUsR0FBRyxNQUFNLHdCQUF3QjtvQkFDdEMsS0FBSyxFQUFFO3dCQUNMLEdBQUcsRUFBRSxhQUFhO3dCQUNsQixPQUFPLEVBQUUscUVBQWUsQ0FBQyxXQUFXO3FCQUNyQztvQkFDRCxTQUFTLEVBQUUsVUFBVTtpQkFDdEIsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDLENBQUM7UUFDRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7Q0FDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9xdWVyeS1zaW1wbGUvc3JjL3NldHRpbmcvdHJhbnNsYXRpb25zL2RlZmF1bHQudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LXVpXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9xdWVyeS1zaW1wbGUvc3JjL3Rvb2xzL2J1aWxkZXItb3BlcmF0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG4gIHF1ZXJ5SXRlbTogJ1F1ZXJ5IGl0ZW0nLFxuICBvdXRwdXREc0xhYmVsOiAne2xhYmVsfSByZXN1bHQnLFxuICBhZGROZXdRdWVyeUFuZEN1c3RvbU9wdGlvbnM6ICdBZGQgbmV3IHF1ZXJ5IGFuZCBjdXN0b20gb3B0aW9ucy4nLFxuICBuZXdRdWVyeTogJ05ldyBxdWVyeScsXG4gIG5ld0ZpbHRlckxheWVyOiAnQWRkIGZpbHRlciBsYXllcicsXG4gIGFycmFuZ2VtZW50U3R5bGU6ICdBcnJhbmdlbWVudCBzdHlsZScsXG4gIHdyYXBJdGVtczogJ1dyYXAgaXRlbXMnLFxuICBzZXRRdWVyeTogJ1NldCBxdWVyeScsXG4gIGF0dHJpYnV0ZUZpbHRlcjogJ0F0dHJpYnV0ZSBmaWx0ZXInLFxuICBhZGRTUUxFeHByZXNzaW9uc1RvWW91clF1ZXJ5OiAnQWRkIFNRTCBleHByZXNzaW9ucyB0byB5b3VyIHF1ZXJ5JyxcbiAgcGxlYXNlQWRkWW91clNRTEV4cHJlc3Npb25zRmlyc3Q6ICdQbGVhc2UgYWRkIHlvdXIgU1FMIGV4cHJlc3Npb25zIGZpcnN0LicsXG4gIHNwYXRpYWxGaWx0ZXI6ICdTcGF0aWFsIGZpbHRlcicsXG4gIG1hcFJlcXVpcmVtZW50X01hcE5vdFJlcXVpcmVkOiAnTWFwIHdpZGdldCBub3QgcmVxdWlyZWQgJyxcbiAgbWFwUmVxdWlyZW1lbnRfTWFwSXNSZXF1aXJlZDogJ1JlcXVpcmVzIGEgTWFwIHdpZGdldCcsXG4gIHR5cGVzT2ZGaWx0ZXI6ICdGaWx0ZXIgYnknLFxuICBmZWF0dXJlRnJvbURzOiAnU2VsZWN0ZWQgZmVhdHVyZXMgZnJvbSBkYXRhIHNvdXJjZScsXG4gIGZlYXR1cmVGcm9tTWFwOiAnR2VvbWV0cmllcyBmcm9tIGEgbWFwJyxcbiAgc2VsZWN0aW9uVmlld09ubHk6ICdTdXBwb3J0IHNlbGVjdGVkIGZlYXR1cmVzIHZpZXcgb25seScsXG4gIGdlb21ldHJ5VHlwZXM6ICdHZW9tZXRyeSB0eXBlcycsXG4gIHNwYXRpYWxGaWx0ZXJUeXBlX0N1cnJlbnRNYXBFeHRlbnQ6ICdDdXJyZW50IG1hcCBleHRlbnQnLFxuICBzcGF0aWFsRmlsdGVyVHlwZV9JbnRlcmFjdGl2ZURyYXdNb2RlOiAnRHJhd24gZ3JhcGhpYycsXG4gIHNwYXRpYWxGaWx0ZXJUeXBlX1NwYXRpYWxSZWxhdGlvbnNoaXA6ICdVc2Ugb3RoZXIgbGF5ZXJzJyxcbiAgcmVzdWx0czogJ1Jlc3VsdHMnLFxuICBsaXN0RGlyZWN0aW9uOiAnTGlzdCBkaXJlY3Rpb24nLFxuICBwYWdpbmdTdHlsZV9NdWx0aVBhZ2U6ICdNdWx0aXBhZ2UnLFxuICBwYWdpbmdTdHlsZV9MYXp5TG9hZDogJ1NpbmdsZS1wYWdlJyxcbiAgZmllbGRfUG9wdXBTZXR0aW5nOiAnVXNlIHdlYm1hcCBzZXR0aW5ncycsXG4gIGZpZWxkX1NlbGVjdEF0dHJpYnV0ZXM6ICdDdXN0b21pemUnLFxuICBzZWxlY3REaXNwbGF5RmllbGRzOiAnU2VsZWN0IGZpZWxkcyB0byBkaXNwbGF5ICcsXG4gIHN5bWJvbFR5cGVfRGVmYXVsdFN5bWJvbDogJ0RlZmF1bHQnLFxuICBzeW1ib2xUeXBlX0N1c3RvbVN5bWJvbDogJ0N1c3RvbScsXG4gIGFsbG93VG9DaGFuZ2VTeW1ib2xBdFJ1bnRpbWU6ICdBbGxvdyB0byBjaGFuZ2Ugc3ltYm9sIGF0IHJ1bnRpbWUnLFxuICBhbGxvd1RvRXhwb3J0OiAnQWxsb3cgdG8gZXhwb3J0JyxcbiAgaW50ZXJhY3RpdmVEcmF3TW9kZTogJ0ludGVyYWN0aXZlIGRyYXcgbW9kZScsXG4gIGNob29zZVNlbGVjdGlvblRvb2xzOiAnVG9vbHMnLFxuICBza2V0Y2hUb29sX3BvaW50OiAnUG9pbnQnLFxuICBza2V0Y2hUb29sX3BvbHlsaW5lOiAnTGluZScsXG4gIHNrZXRjaFRvb2xfcG9seWdvbjogJ1BvbHlnb24nLFxuICBza2V0Y2hUb29sX3JlY3RhbmdsZTogJ1JlY3RhbmdsZScsXG4gIHNrZXRjaFRvb2xfY2lyY2xlOiAnQ2lyY2xlJyxcbiAgc3BhdGlhbFJlbGF0aW9uc2hpcDogJ1NwYXRpYWwgcmVsYXRpb25zaGlwJyxcbiAgY2hvb3NlU3BhdGlhbFJlbGF0aW9uc2hpcFJ1bGVzOiAnU3BhdGlhbCByZWxhdGlvbnNoaXAgcnVsZXMnLFxuICBlbmFibGVTZWxlY3RUb29sOiAnRW5hYmxlIHNlbGVjdCB0b29sJyxcbiAgcXVlcnlNZXNzYWdlOiAnTWVzc2FnZScsXG4gIGF0TGVhc3RPbmVJdGVtSXNSZXF1aXJlZDogJ0F0IGxlYXN0IG9uZSBpdGVtIGlzIHJlcXVpcmVkLicsXG4gIGNvbmZpZ3VyZVF1ZXJ5OiAnQ29uZmlndXJlIHF1ZXJ5JyxcbiAgaGludFF1ZXJ5QXJndW1lbnRzU2V0dGluZzogJ0EgcXVlcnkgY2FuIGhhdmUgYW4gYXR0cmlidXRlIGZpbHRlciwgc3BhdGlhbCBmaWx0ZXIsIG9yIGJvdGguJyxcbiAgbm9RdWVyeVRpcDogJ0NsaWNrIHRoZSBcIntuZXdRdWVyeX1cIiBidXR0b24gdG8gYWRkIGFuZCBjb25maWd1cmUgcXVlcmllcy4nLFxuICBvcGVuVGlwOiAnT3BlbiB0aXAnLFxuICBjbG9zZVRpcDogJ0Nsb3NlIHRpcCcsXG4gIGNvbmZpZ1RpdGxlOiAnVGl0bGUnLFxuICBsYWJlbDogJ0xhYmVsJyxcbiAgZGVzY3JpcHRpb246ICdEZXNjcmlwdGlvbicsXG4gIGRlZmF1bHRQYWdlU2l6ZTogJ0RlZmF1bHQgcGFnZSBzaXplJyxcbiAgbGF6eUxvYWRJbml0aWFsUGFnZVNpemU6ICdJbml0aWFsIHF1ZXJ5IHBhZ2Ugc2l6ZSAoTGF6eUxvYWQpJyxcbiAgem9vbVRvU2VsZWN0ZWQ6ICdab29tIHRvIHNlbGVjdGVkJyxcbiAgZ3JvdXBJZDogJ0dyb3VwIElEJyxcbiAgc2hvcnRJZERlc2NyaXB0aW9uOiAnVGhlIGhhc2ggcGFyYW1ldGVyIHVzZWQgdG8gZXhlY3V0ZSBhIHF1ZXJ5IHVzaW5nICNzaG9ydGlkPXZhbHVlIGluIHRoZSBVUkwuJyxcbiAgZ3JvdXBJZERlc2NyaXB0aW9uOiAnVXNlZCB0byBncm91cCBxdWVyaWVzIHRvZ2V0aGVyLiBFeGFtcGxlOiBpZiB5b3UgaGF2ZSBtdWx0aXBsZSBxdWVyaWVzIG9uIHRoZSBwYXJjZWwgbGF5ZXIsIG9uZSBmb3IgUGFyY2VsIG51bWJlciBhbmQgb25lIGZvciBNYWpvciBudW1iZXIsIHlvdSBjYW4gdXNlIHRoZSBHcm91cCBJRCB0byBncm91cCB0aGVzZSB0b2dldGhlci4nLFxuICBkaXNwbGF5T3JkZXI6ICdEaXNwbGF5IE9yZGVyJyxcbiAgZGlzcGxheU9yZGVyRGVzY3JpcHRpb246ICdMb3dlciBudW1iZXJzIGFwcGVhciBmaXJzdC4gTGVhdmUgZW1wdHkgdG8gbWFpbnRhaW4gZGVmYXVsdCBvcmRlci4nXG59XG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfdWlfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCJpbXBvcnQgdHlwZSB7IGV4dGVuc2lvblNwZWMsIElNQXBwQ29uZmlnLCBJbW11dGFibGVPYmplY3QgfSBmcm9tICdqaW11LWNvcmUnXG5pbXBvcnQgeyBkZWZhdWx0TWVzc2FnZXMgYXMgamltdVVJTWVzc2FnZXMgfSBmcm9tICdqaW11LXVpJ1xuaW1wb3J0IHR5cGUgeyBJTUNvbmZpZywgUXVlcnlJdGVtVHlwZSB9IGZyb20gJy4uL2NvbmZpZydcbmltcG9ydCBkZWZhdWx0TWVzc2FnZXMgZnJvbSAnLi4vc2V0dGluZy90cmFuc2xhdGlvbnMvZGVmYXVsdCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnVpbGRlck9wZXJhdGlvbnMgaW1wbGVtZW50cyBleHRlbnNpb25TcGVjLkJ1aWxkZXJPcGVyYXRpb25zRXh0ZW5zaW9uIHtcbiAgaWQgPSAncXVlcnktc2ltcGxlLWJ1aWxkZXItb3BlcmF0aW9uJ1xuICB3aWRnZXRJZDogc3RyaW5nXG5cbiAgZ2V0VHJhbnNsYXRpb25LZXkoYXBwQ29uZmlnOiBJTUFwcENvbmZpZyk6IFByb21pc2U8ZXh0ZW5zaW9uU3BlYy5UcmFuc2xhdGlvbktleVtdPiB7XG4gICAgY29uc3QgY29uZmlnID0gYXBwQ29uZmlnLndpZGdldHNbdGhpcy53aWRnZXRJZF0uY29uZmlnIGFzIElNQ29uZmlnXG4gICAgY29uc3Qga2V5czogZXh0ZW5zaW9uU3BlYy5UcmFuc2xhdGlvbktleVtdID0gW11cbiAgICBjb25zdCBxdWVyeUl0ZW1zID0gY29uZmlnPy5xdWVyeUl0ZW1zIHx8IFtdXG4gICAgcXVlcnlJdGVtcy5mb3JFYWNoKChxdWVyeUl0ZW06IEltbXV0YWJsZU9iamVjdDxRdWVyeUl0ZW1UeXBlPikgPT4ge1xuICAgICAgY29uc3QgcHJlZml4ID0gYHdpZGdldHMuJHt0aGlzLndpZGdldElkfS4ke3F1ZXJ5SXRlbS5jb25maWdJZH1gXG4gICAgICBpZiAocXVlcnlJdGVtLm5hbWUpIHtcbiAgICAgICAga2V5cy5wdXNoKHtcbiAgICAgICAgICBrZXlUeXBlOiAndmFsdWUnLFxuICAgICAgICAgIGtleTogYCR7cHJlZml4fS5uYW1lYCxcbiAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAga2V5OiAnbGFiZWwnLFxuICAgICAgICAgICAgZW5MYWJlbDogamltdVVJTWVzc2FnZXMubGFiZWxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlVHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLmF0dHJpYnV0ZUZpbHRlckxhYmVsKSB7XG4gICAgICAgIGtleXMucHVzaCh7XG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcbiAgICAgICAgICBrZXk6IGAke3ByZWZpeH0uYXR0cmlidXRlRmlsdGVyTGFiZWxgLFxuICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBrZXk6ICdhdHRyaWJ1dGVGaWx0ZXInLFxuICAgICAgICAgICAgZW5MYWJlbDogZGVmYXVsdE1lc3NhZ2VzLmF0dHJpYnV0ZUZpbHRlclxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dCdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChxdWVyeUl0ZW0uYXR0cmlidXRlRmlsdGVyRGVzYykge1xuICAgICAgICBrZXlzLnB1c2goe1xuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LmF0dHJpYnV0ZUZpbHRlckRlc2NgLFxuICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBrZXk6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBlbkxhYmVsOiBqaW11VUlNZXNzYWdlcy5kZXNjcmlwdGlvblxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dGFyZWEnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLnNwYXRpYWxGaWx0ZXJMYWJlbCkge1xuICAgICAgICBrZXlzLnB1c2goe1xuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LnNwYXRpYWxGaWx0ZXJMYWJlbGAsXG4gICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGtleTogJ3NwYXRpYWxGaWx0ZXInLFxuICAgICAgICAgICAgZW5MYWJlbDogZGVmYXVsdE1lc3NhZ2VzLnNwYXRpYWxGaWx0ZXJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlVHlwZTogJ3RleHQnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLnNwYXRpYWxGaWx0ZXJEZXNjKSB7XG4gICAgICAgIGtleXMucHVzaCh7XG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcbiAgICAgICAgICBrZXk6IGAke3ByZWZpeH0uc3BhdGlhbEZpbHRlckRlc2NgLFxuICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBrZXk6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBlbkxhYmVsOiBqaW11VUlNZXNzYWdlcy5kZXNjcmlwdGlvblxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dGFyZWEnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLnJlc3VsdHNMYWJlbCkge1xuICAgICAgICBrZXlzLnB1c2goe1xuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LnJlc3VsdHNMYWJlbGAsXG4gICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGtleTogJ3Jlc3VsdHMnLFxuICAgICAgICAgICAgZW5MYWJlbDogZGVmYXVsdE1lc3NhZ2VzLnJlc3VsdHNcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlVHlwZTogJ3RleHQnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLnJlc3VsdFRpdGxlRXhwcmVzc2lvbikge1xuICAgICAgICBrZXlzLnB1c2goe1xuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LnJlc3VsdFRpdGxlRXhwcmVzc2lvbmAsXG4gICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGtleTogJ2NvbmZpZ1RpdGxlJyxcbiAgICAgICAgICAgIGVuTGFiZWw6IGRlZmF1bHRNZXNzYWdlcy5jb25maWdUaXRsZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dGFyZWEnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGtleXMpXG4gIH1cbn1cblxuXG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==