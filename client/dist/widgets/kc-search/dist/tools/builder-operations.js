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

/***/ "./your-extensions/widgets/kc-search/src/setting/translations/default.ts":
/*!*******************************************************************************!*\
  !*** ./your-extensions/widgets/kc-search/src/setting/translations/default.ts ***!
  \*******************************************************************************/
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
    expressionBuilder: 'Expression Builder',
    chooseMode: 'Configure each record',
    configTitle: 'Heading',
    configFields: 'Display fields',
    resultStyle: 'Result style',
    sortRecords: 'Sort records',
    describeTheFilter: 'Please describe the filter.',
    expandByDefault: 'Expand by default',
    defaultPageSize: 'Number of records per page',
    includeRuntimeData: 'Include runtime data',
    label: 'Label',
    icon: 'Icon',
    data: 'Data',
    displayLabel: 'Display label',
    remove: 'Remove',
    vertical: 'Vertical',
    horizontal: 'Horizontal',
    icon: 'Icon',
    single: 'Single',
    multiple: 'Multiple'
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
/*!***************************************************************************!*\
  !*** ./your-extensions/widgets/kc-search/src/tools/builder-operations.ts ***!
  \***************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BuilderOperations)
/* harmony export */ });
/* harmony import */ var jimu_ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-ui */ "jimu-ui");
/* harmony import */ var _setting_translations_default__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../setting/translations/default */ "./your-extensions/widgets/kc-search/src/setting/translations/default.ts");


class BuilderOperations {
    constructor() {
        this.id = 'button-builder-operation';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9rYy1zZWFyY2gvZGlzdC90b29scy9idWlsZGVyLW9wZXJhdGlvbnMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUVBQWU7SUFDYixTQUFTLEVBQUUsWUFBWTtJQUN2QixhQUFhLEVBQUUsZ0JBQWdCO0lBQy9CLDJCQUEyQixFQUFFLG1DQUFtQztJQUNoRSxRQUFRLEVBQUUsV0FBVztJQUNyQixjQUFjLEVBQUUsa0JBQWtCO0lBQ2xDLGdCQUFnQixFQUFFLG1CQUFtQjtJQUNyQyxTQUFTLEVBQUUsWUFBWTtJQUN2QixRQUFRLEVBQUUsV0FBVztJQUNyQixlQUFlLEVBQUUsa0JBQWtCO0lBQ25DLDRCQUE0QixFQUFFLG1DQUFtQztJQUNqRSxnQ0FBZ0MsRUFBRSx3Q0FBd0M7SUFDMUUsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQiw2QkFBNkIsRUFBRSwwQkFBMEI7SUFDekQsNEJBQTRCLEVBQUUsdUJBQXVCO0lBQ3JELGFBQWEsRUFBRSxXQUFXO0lBQzFCLGFBQWEsRUFBRSxvQ0FBb0M7SUFDbkQsY0FBYyxFQUFFLHVCQUF1QjtJQUN2QyxpQkFBaUIsRUFBRSxxQ0FBcUM7SUFDeEQsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixrQ0FBa0MsRUFBRSxvQkFBb0I7SUFDeEQscUNBQXFDLEVBQUUsZUFBZTtJQUN0RCxxQ0FBcUMsRUFBRSxrQkFBa0I7SUFDekQsT0FBTyxFQUFFLFNBQVM7SUFDbEIsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixxQkFBcUIsRUFBRSxXQUFXO0lBQ2xDLG9CQUFvQixFQUFFLGFBQWE7SUFDbkMsa0JBQWtCLEVBQUUscUJBQXFCO0lBQ3pDLHNCQUFzQixFQUFFLFdBQVc7SUFDbkMsbUJBQW1CLEVBQUUsMkJBQTJCO0lBQ2hELHdCQUF3QixFQUFFLFNBQVM7SUFDbkMsdUJBQXVCLEVBQUUsUUFBUTtJQUNqQyw0QkFBNEIsRUFBRSxtQ0FBbUM7SUFDakUsYUFBYSxFQUFFLGlCQUFpQjtJQUNoQyxt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QUNELFNBQVMsRUFBRSxVQUFVO2lCQUN0QixDQUFDO1lBQ0osQ0FBQztZQUNELElBQUksU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNSLE9BQU8sRUFBRSxPQUFPO29CQUNoQixHQUFHLEVBQUUsR0FBRyxNQUFNLGVBQWU7b0JBQzdCLEtBQUssRUFBRTt3QkFDTCxHQUFHLEVBQUUsU0FBUzt3QkFDZCxPQUFPLEVBQUUscUVBQWUsQ0FBQyxPQUFPO3FCQUNqQztvQkFDRCxTQUFTLEVBQUUsTUFBTTtpQkFDbEIsQ0FBQztZQUNKLENBQUM7WUFDRCxJQUFJLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNSLE9BQU8sRUFBRSxPQUFPO29CQUNoQixHQUFHLEVBQUUsR0FBRyxNQUFNLHdCQUF3QjtvQkFDdEMsS0FBSyxFQUFFO3dCQUNMLEdBQUcsRUFBRSxhQUFhO3dCQUNsQixPQUFPLEVBQUUscUVBQWUsQ0FBQyxXQUFXO3FCQUNyQztvQkFDRCxTQUFTLEVBQUUsVUFBVTtpQkFDdEIsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDLENBQUM7UUFDRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7Q0FDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9rYy1zZWFyY2gvc3JjL3NldHRpbmcvdHJhbnNsYXRpb25zL2RlZmF1bHQudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LXVpXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9rYy1zZWFyY2gvc3JjL3Rvb2xzL2J1aWxkZXItb3BlcmF0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG4gIHF1ZXJ5SXRlbTogJ1F1ZXJ5IGl0ZW0nLFxuICBvdXRwdXREc0xhYmVsOiAne2xhYmVsfSByZXN1bHQnLFxuICBhZGROZXdRdWVyeUFuZEN1c3RvbU9wdGlvbnM6ICdBZGQgbmV3IHF1ZXJ5IGFuZCBjdXN0b20gb3B0aW9ucy4nLFxuICBuZXdRdWVyeTogJ05ldyBxdWVyeScsXG4gIG5ld0ZpbHRlckxheWVyOiAnQWRkIGZpbHRlciBsYXllcicsXG4gIGFycmFuZ2VtZW50U3R5bGU6ICdBcnJhbmdlbWVudCBzdHlsZScsXG4gIHdyYXBJdGVtczogJ1dyYXAgaXRlbXMnLFxuICBzZXRRdWVyeTogJ1NldCBxdWVyeScsXG4gIGF0dHJpYnV0ZUZpbHRlcjogJ0F0dHJpYnV0ZSBmaWx0ZXInLFxuICBhZGRTUUxFeHByZXNzaW9uc1RvWW91clF1ZXJ5OiAnQWRkIFNRTCBleHByZXNzaW9ucyB0byB5b3VyIHF1ZXJ5JyxcbiAgcGxlYXNlQWRkWW91clNRTEV4cHJlc3Npb25zRmlyc3Q6ICdQbGVhc2UgYWRkIHlvdXIgU1FMIGV4cHJlc3Npb25zIGZpcnN0LicsXG4gIHNwYXRpYWxGaWx0ZXI6ICdTcGF0aWFsIGZpbHRlcicsXG4gIG1hcFJlcXVpcmVtZW50X01hcE5vdFJlcXVpcmVkOiAnTWFwIHdpZGdldCBub3QgcmVxdWlyZWQgJyxcbiAgbWFwUmVxdWlyZW1lbnRfTWFwSXNSZXF1aXJlZDogJ1JlcXVpcmVzIGEgTWFwIHdpZGdldCcsXG4gIHR5cGVzT2ZGaWx0ZXI6ICdGaWx0ZXIgYnknLFxuICBmZWF0dXJlRnJvbURzOiAnU2VsZWN0ZWQgZmVhdHVyZXMgZnJvbSBkYXRhIHNvdXJjZScsXG4gIGZlYXR1cmVGcm9tTWFwOiAnR2VvbWV0cmllcyBmcm9tIGEgbWFwJyxcbiAgc2VsZWN0aW9uVmlld09ubHk6ICdTdXBwb3J0IHNlbGVjdGVkIGZlYXR1cmVzIHZpZXcgb25seScsXG4gIGdlb21ldHJ5VHlwZXM6ICdHZW9tZXRyeSB0eXBlcycsXG4gIHNwYXRpYWxGaWx0ZXJUeXBlX0N1cnJlbnRNYXBFeHRlbnQ6ICdDdXJyZW50IG1hcCBleHRlbnQnLFxuICBzcGF0aWFsRmlsdGVyVHlwZV9JbnRlcmFjdGl2ZURyYXdNb2RlOiAnRHJhd24gZ3JhcGhpYycsXG4gIHNwYXRpYWxGaWx0ZXJUeXBlX1NwYXRpYWxSZWxhdGlvbnNoaXA6ICdVc2Ugb3RoZXIgbGF5ZXJzJyxcbiAgcmVzdWx0czogJ1Jlc3VsdHMnLFxuICBsaXN0RGlyZWN0aW9uOiAnTGlzdCBkaXJlY3Rpb24nLFxuICBwYWdpbmdTdHlsZV9NdWx0aVBhZ2U6ICdNdWx0aXBhZ2UnLFxuICBwYWdpbmdTdHlsZV9MYXp5TG9hZDogJ1NpbmdsZS1wYWdlJyxcbiAgZmllbGRfUG9wdXBTZXR0aW5nOiAnVXNlIHdlYm1hcCBzZXR0aW5ncycsXG4gIGZpZWxkX1NlbGVjdEF0dHJpYnV0ZXM6ICdDdXN0b21pemUnLFxuICBzZWxlY3REaXNwbGF5RmllbGRzOiAnU2VsZWN0IGZpZWxkcyB0byBkaXNwbGF5ICcsXG4gIHN5bWJvbFR5cGVfRGVmYXVsdFN5bWJvbDogJ0RlZmF1bHQnLFxuICBzeW1ib2xUeXBlX0N1c3RvbVN5bWJvbDogJ0N1c3RvbScsXG4gIGFsbG93VG9DaGFuZ2VTeW1ib2xBdFJ1bnRpbWU6ICdBbGxvdyB0byBjaGFuZ2Ugc3ltYm9sIGF0IHJ1bnRpbWUnLFxuICBhbGxvd1RvRXhwb3J0OiAnQWxsb3cgdG8gZXhwb3J0JyxcbiAgaW50ZXJhY3RpdmVEcmF3TW9kZTogJ0ludGVyYWN0aXZlIGRyYXcgbW9kZScsXG4gIGNob29zZVNlbGVjdGlvblRvb2xzOiAnVG9vbHMnLFxuICBza2V0Y2hUb29sX3BvaW50OiAnUG9pbnQnLFxuICBza2V0Y2hUb29sX3BvbHlsaW5lOiAnTGluZScsXG4gIHNrZXRjaFRvb2xfcG9seWdvbjogJ1BvbHlnb24nLFxuICBza2V0Y2hUb29sX3JlY3RhbmdsZTogJ1JlY3RhbmdsZScsXG4gIHNrZXRjaFRvb2xfY2lyY2xlOiAnQ2lyY2xlJyxcbiAgc3BhdGlhbFJlbGF0aW9uc2hpcDogJ1NwYXRpYWwgcmVsYXRpb25zaGlwJyxcbiAgY2hvb3NlU3BhdGlhbFJlbGF0aW9uc2hpcFJ1bGVzOiAnU3BhdGlhbCByZWxhdGlvbnNoaXAgcnVsZXMnLFxuICBlbmFibGVTZWxlY3RUb29sOiAnRW5hYmxlIHNlbGVjdCB0b29sJyxcbiAgcXVlcnlNZXNzYWdlOiAnTWVzc2FnZScsXG4gIGF0TGVhc3RPbmVJdGVtSXNSZXF1aXJlZDogJ0F0IGxlYXN0IG9uZSBpdGVtIGlzIHJlcXVpcmVkLicsXG4gIGNvbmZpZ3VyZVF1ZXJ5OiAnQ29uZmlndXJlIHF1ZXJ5JyxcbiAgaGludFF1ZXJ5QXJndW1lbnRzU2V0dGluZzogJ0EgcXVlcnkgY2FuIGhhdmUgYW4gYXR0cmlidXRlIGZpbHRlciwgc3BhdGlhbCBmaWx0ZXIsIG9yIGJvdGguJyxcbiAgbm9RdWVyeVRpcDogJ0NsaWNrIHRoZSBcIntuZXdRdWVyeX1cIiBidXR0b24gdG8gYWRkIGFuZCBjb25maWd1cmUgcXVlcmllcy4nLFxuICBvcGVuVGlwOiAnT3BlbiB0aXAnLFxuICBleHByZXNzaW9uQnVpbGRlcjogJ0V4cHJlc3Npb24gQnVpbGRlcicsXG4gIGNob29zZU1vZGU6ICdDb25maWd1cmUgZWFjaCByZWNvcmQnLFxuICBjb25maWdUaXRsZTogJ0hlYWRpbmcnLFxuICBjb25maWdGaWVsZHM6ICdEaXNwbGF5IGZpZWxkcycsXG4gIHJlc3VsdFN0eWxlOiAnUmVzdWx0IHN0eWxlJyxcbiAgc29ydFJlY29yZHM6ICdTb3J0IHJlY29yZHMnLFxuICBkZXNjcmliZVRoZUZpbHRlcjogJ1BsZWFzZSBkZXNjcmliZSB0aGUgZmlsdGVyLicsXG4gIGV4cGFuZEJ5RGVmYXVsdDogJ0V4cGFuZCBieSBkZWZhdWx0JyxcbiAgZGVmYXVsdFBhZ2VTaXplOiAnTnVtYmVyIG9mIHJlY29yZHMgcGVyIHBhZ2UnLFxuICBpbmNsdWRlUnVudGltZURhdGE6ICdJbmNsdWRlIHJ1bnRpbWUgZGF0YScsXG4gIGxhYmVsOiAnTGFiZWwnLFxuICBpY29uOiAnSWNvbicsXG4gIGRhdGE6ICdEYXRhJyxcbiAgZGlzcGxheUxhYmVsOiAnRGlzcGxheSBsYWJlbCcsXG4gIHJlbW92ZTogJ1JlbW92ZScsXG4gIHZlcnRpY2FsOiAnVmVydGljYWwnLFxuICBob3Jpem9udGFsOiAnSG9yaXpvbnRhbCcsXG4gIGljb246ICdJY29uJyxcbiAgc2luZ2xlOiAnU2luZ2xlJyxcbiAgbXVsdGlwbGU6ICdNdWx0aXBsZSdcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X3VpX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIi8qKlxyXG4gKiBXZWJwYWNrIHdpbGwgcmVwbGFjZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB3aXRoIF9fd2VicGFja19yZXF1aXJlX18ucCB0byBzZXQgdGhlIHB1YmxpYyBwYXRoIGR5bmFtaWNhbGx5LlxyXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBzZXQgdGhlIHB1YmxpY1BhdGggaW4gd2VicGFjayBjb25maWcgaXM6IHdlIGNoYW5nZSB0aGUgcHVibGljUGF0aCB3aGVuIGRvd25sb2FkLlxyXG4gKiAqL1xyXG5fX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHdpbmRvdy5qaW11Q29uZmlnLmJhc2VVcmxcclxuIiwiaW1wb3J0IHR5cGUgeyBleHRlbnNpb25TcGVjLCBJTUFwcENvbmZpZywgSW1tdXRhYmxlT2JqZWN0IH0gZnJvbSAnamltdS1jb3JlJ1xyXG5pbXBvcnQgeyBkZWZhdWx0TWVzc2FnZXMgYXMgamltdVVJTWVzc2FnZXMgfSBmcm9tICdqaW11LXVpJ1xyXG5pbXBvcnQgdHlwZSB7IElNQ29uZmlnLCBRdWVyeUl0ZW1UeXBlIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgZGVmYXVsdE1lc3NhZ2VzIGZyb20gJy4uL3NldHRpbmcvdHJhbnNsYXRpb25zL2RlZmF1bHQnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCdWlsZGVyT3BlcmF0aW9ucyBpbXBsZW1lbnRzIGV4dGVuc2lvblNwZWMuQnVpbGRlck9wZXJhdGlvbnNFeHRlbnNpb24ge1xyXG4gIGlkID0gJ2J1dHRvbi1idWlsZGVyLW9wZXJhdGlvbidcclxuICB3aWRnZXRJZDogc3RyaW5nXHJcblxyXG4gIGdldFRyYW5zbGF0aW9uS2V5KGFwcENvbmZpZzogSU1BcHBDb25maWcpOiBQcm9taXNlPGV4dGVuc2lvblNwZWMuVHJhbnNsYXRpb25LZXlbXT4ge1xyXG4gICAgY29uc3QgY29uZmlnID0gYXBwQ29uZmlnLndpZGdldHNbdGhpcy53aWRnZXRJZF0uY29uZmlnIGFzIElNQ29uZmlnXHJcbiAgICBjb25zdCBrZXlzOiBleHRlbnNpb25TcGVjLlRyYW5zbGF0aW9uS2V5W10gPSBbXVxyXG4gICAgY29uc3QgcXVlcnlJdGVtcyA9IGNvbmZpZz8ucXVlcnlJdGVtcyB8fCBbXVxyXG4gICAgcXVlcnlJdGVtcy5mb3JFYWNoKChxdWVyeUl0ZW06IEltbXV0YWJsZU9iamVjdDxRdWVyeUl0ZW1UeXBlPikgPT4ge1xyXG4gICAgICBjb25zdCBwcmVmaXggPSBgd2lkZ2V0cy4ke3RoaXMud2lkZ2V0SWR9LiR7cXVlcnlJdGVtLmNvbmZpZ0lkfWBcclxuICAgICAgaWYgKHF1ZXJ5SXRlbS5uYW1lKSB7XHJcbiAgICAgICAga2V5cy5wdXNoKHtcclxuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXHJcbiAgICAgICAgICBrZXk6IGAke3ByZWZpeH0ubmFtZWAsXHJcbiAgICAgICAgICBsYWJlbDoge1xyXG4gICAgICAgICAgICBrZXk6ICdsYWJlbCcsXHJcbiAgICAgICAgICAgIGVuTGFiZWw6IGppbXVVSU1lc3NhZ2VzLmxhYmVsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdmFsdWVUeXBlOiBcInRleHRcIixcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChxdWVyeUl0ZW0uYXR0cmlidXRlRmlsdGVyTGFiZWwpIHtcclxuICAgICAgICBrZXlzLnB1c2goe1xyXG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcclxuICAgICAgICAgIGtleTogYCR7cHJlZml4fS5hdHRyaWJ1dGVGaWx0ZXJMYWJlbGAsXHJcbiAgICAgICAgICBsYWJlbDoge1xyXG4gICAgICAgICAgICBrZXk6ICdhdHRyaWJ1dGVGaWx0ZXInLFxyXG4gICAgICAgICAgICBlbkxhYmVsOiBkZWZhdWx0TWVzc2FnZXMuYXR0cmlidXRlRmlsdGVyXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dCdcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChxdWVyeUl0ZW0uYXR0cmlidXRlRmlsdGVyRGVzYykge1xyXG4gICAgICAgIGtleXMucHVzaCh7XHJcbiAgICAgICAgICBrZXlUeXBlOiAndmFsdWUnLFxyXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LmF0dHJpYnV0ZUZpbHRlckRlc2NgLFxyXG4gICAgICAgICAgbGFiZWw6IHtcclxuICAgICAgICAgICAga2V5OiAnZGVzY3JpcHRpb24nLFxyXG4gICAgICAgICAgICBlbkxhYmVsOiBqaW11VUlNZXNzYWdlcy5kZXNjcmlwdGlvblxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZhbHVlVHlwZTogJ3RleHRhcmVhJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHF1ZXJ5SXRlbS5zcGF0aWFsRmlsdGVyTGFiZWwpIHtcclxuICAgICAgICBrZXlzLnB1c2goe1xyXG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcclxuICAgICAgICAgIGtleTogYCR7cHJlZml4fS5zcGF0aWFsRmlsdGVyTGFiZWxgLFxyXG4gICAgICAgICAgbGFiZWw6IHtcclxuICAgICAgICAgICAga2V5OiAnc3BhdGlhbEZpbHRlcicsXHJcbiAgICAgICAgICAgIGVuTGFiZWw6IGRlZmF1bHRNZXNzYWdlcy5zcGF0aWFsRmlsdGVyXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dCdcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChxdWVyeUl0ZW0uc3BhdGlhbEZpbHRlckRlc2MpIHtcclxuICAgICAgICBrZXlzLnB1c2goe1xyXG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcclxuICAgICAgICAgIGtleTogYCR7cHJlZml4fS5zcGF0aWFsRmlsdGVyRGVzY2AsXHJcbiAgICAgICAgICBsYWJlbDoge1xyXG4gICAgICAgICAgICBrZXk6ICdkZXNjcmlwdGlvbicsXHJcbiAgICAgICAgICAgIGVuTGFiZWw6IGppbXVVSU1lc3NhZ2VzLmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dGFyZWEnXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICBpZiAocXVlcnlJdGVtLnJlc3VsdHNMYWJlbCkge1xyXG4gICAgICAgIGtleXMucHVzaCh7XHJcbiAgICAgICAgICBrZXlUeXBlOiAndmFsdWUnLFxyXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LnJlc3VsdHNMYWJlbGAsXHJcbiAgICAgICAgICBsYWJlbDoge1xyXG4gICAgICAgICAgICBrZXk6ICdyZXN1bHRzJyxcclxuICAgICAgICAgICAgZW5MYWJlbDogZGVmYXVsdE1lc3NhZ2VzLnJlc3VsdHNcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB2YWx1ZVR5cGU6ICd0ZXh0J1xyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHF1ZXJ5SXRlbS5yZXN1bHRUaXRsZUV4cHJlc3Npb24pIHtcclxuICAgICAgICBrZXlzLnB1c2goe1xyXG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcclxuICAgICAgICAgIGtleTogYCR7cHJlZml4fS5yZXN1bHRUaXRsZUV4cHJlc3Npb25gLFxyXG4gICAgICAgICAgbGFiZWw6IHtcclxuICAgICAgICAgICAga2V5OiAnY29uZmlnVGl0bGUnLFxyXG4gICAgICAgICAgICBlbkxhYmVsOiBkZWZhdWx0TWVzc2FnZXMuY29uZmlnVGl0bGVcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB2YWx1ZVR5cGU6ICd0ZXh0YXJlYSdcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShrZXlzKVxyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=