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
    displayOrderDescription: 'Lower numbers appear first. Leave empty to maintain default order.',
    highlightOptions: 'Highlight Options',
    useGraphicsLayerForHighlight: 'Use graphics layer for highlighting',
    useGraphicsLayerForHighlightDescription: 'When enabled, highlights will display even when the layer is turned off. Uses the map\'s default highlight color.',
    selectMapForHighlight: 'Select map widget'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9xdWVyeS1zaW1wbGUvZGlzdC90b29scy9idWlsZGVyLW9wZXJhdGlvbnMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUVBQWU7SUFDYixTQUFTLEVBQUUsWUFBWTtJQUN2QixhQUFhLEVBQUUsZ0JBQWdCO0lBQy9CLDJCQUEyQixFQUFFLG1DQUFtQztJQUNoRSxRQUFRLEVBQUUsV0FBVztJQUNyQixjQUFjLEVBQUUsa0JBQWtCO0lBQ2xDLGdCQUFnQixFQUFFLG1CQUFtQjtJQUNyQyxTQUFTLEVBQUUsWUFBWTtJQUN2QixRQUFRLEVBQUUsV0FBVztJQUNyQixlQUFlLEVBQUUsa0JBQWtCO0lBQ25DLDRCQUE0QixFQUFFLG1DQUFtQztJQUNqRSxnQ0FBZ0MsRUFBRSx3Q0FBd0M7SUFDMUUsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQiw2QkFBNkIsRUFBRSwwQkFBMEI7SUFDekQsNEJBQTRCLEVBQUUsdUJBQXVCO0lBQ3JELGFBQWEsRUFBRSxXQUFXO0lBQzFCLGFBQWEsRUFBRSxvQ0FBb0M7SUFDbkQsY0FBYyxFQUFFLHVCQUF1QjtJQUN2QyxpQkFBaUIsRUFBRSxxQ0FBcUM7SUFDeEQsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixrQ0FBa0MsRUFBRSxvQkFBb0I7SUFDeEQscUNBQXFDLEVBQUUsZUFBZTtJQUN0RCxxQ0FBcUMsRUFBRSxrQkFBa0I7SUFDekQsT0FBTyxFQUFFLFNBQVM7SUFDbEIsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixxQkFBcUIsRUFBRSxXQUFXO0lBQ2xDLG9CQUFvQixFQUFFLGFBQWE7SUFDbkMsa0JBQWtCLEVBQUUscUJBQXFCO0lBQ3pDLHNCQUFzQixFQUFFLFdBQVc7SUFDbkMsbUJBQW1CLEVBQUUsMkJBQTJCO0lBQ2hELHdCQUF3QixFQUFFLFNBQVM7SUFDbkMsdUJBQXVCLEVBQUUsUUFBUTtJQUNqQyw0QkFBNEIsRUFBRSxtQ0FBbUM7SUFDakUsYUFBYSxFQUFFLGlCQUFpQjtJQUNo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QUFZLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDUixPQUFPLEVBQUUsT0FBTztvQkFDaEIsR0FBRyxFQUFFLEdBQUcsTUFBTSxlQUFlO29CQUM3QixLQUFLLEVBQUU7d0JBQ0wsR0FBRyxFQUFFLFNBQVM7d0JBQ2QsT0FBTyxFQUFFLHFFQUFlLENBQUMsT0FBTztxQkFDakM7b0JBQ0QsU0FBUyxFQUFFLE1BQU07aUJBQ2xCLENBQUM7WUFDSixDQUFDO1lBQ0QsSUFBSSxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDUixPQUFPLEVBQUUsT0FBTztvQkFDaEIsR0FBRyxFQUFFLEdBQUcsTUFBTSx3QkFBd0I7b0JBQ3RDLEtBQUssRUFBRTt3QkFDTCxHQUFHLEVBQUUsYUFBYTt3QkFDbEIsT0FBTyxFQUFFLHFFQUFlLENBQUMsV0FBVztxQkFDckM7b0JBQ0QsU0FBUyxFQUFFLFVBQVU7aUJBQ3RCLENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUM5QixDQUFDO0NBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvcXVlcnktc2ltcGxlL3NyYy9zZXR0aW5nL3RyYW5zbGF0aW9ucy9kZWZhdWx0LnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS11aVwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWNvcmUvbGliL3NldC1wdWJsaWMtcGF0aC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvcXVlcnktc2ltcGxlL3NyYy90b29scy9idWlsZGVyLW9wZXJhdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuICBxdWVyeUl0ZW06ICdRdWVyeSBpdGVtJyxcbiAgb3V0cHV0RHNMYWJlbDogJ3tsYWJlbH0gcmVzdWx0JyxcbiAgYWRkTmV3UXVlcnlBbmRDdXN0b21PcHRpb25zOiAnQWRkIG5ldyBxdWVyeSBhbmQgY3VzdG9tIG9wdGlvbnMuJyxcbiAgbmV3UXVlcnk6ICdOZXcgcXVlcnknLFxuICBuZXdGaWx0ZXJMYXllcjogJ0FkZCBmaWx0ZXIgbGF5ZXInLFxuICBhcnJhbmdlbWVudFN0eWxlOiAnQXJyYW5nZW1lbnQgc3R5bGUnLFxuICB3cmFwSXRlbXM6ICdXcmFwIGl0ZW1zJyxcbiAgc2V0UXVlcnk6ICdTZXQgcXVlcnknLFxuICBhdHRyaWJ1dGVGaWx0ZXI6ICdBdHRyaWJ1dGUgZmlsdGVyJyxcbiAgYWRkU1FMRXhwcmVzc2lvbnNUb1lvdXJRdWVyeTogJ0FkZCBTUUwgZXhwcmVzc2lvbnMgdG8geW91ciBxdWVyeScsXG4gIHBsZWFzZUFkZFlvdXJTUUxFeHByZXNzaW9uc0ZpcnN0OiAnUGxlYXNlIGFkZCB5b3VyIFNRTCBleHByZXNzaW9ucyBmaXJzdC4nLFxuICBzcGF0aWFsRmlsdGVyOiAnU3BhdGlhbCBmaWx0ZXInLFxuICBtYXBSZXF1aXJlbWVudF9NYXBOb3RSZXF1aXJlZDogJ01hcCB3aWRnZXQgbm90IHJlcXVpcmVkICcsXG4gIG1hcFJlcXVpcmVtZW50X01hcElzUmVxdWlyZWQ6ICdSZXF1aXJlcyBhIE1hcCB3aWRnZXQnLFxuICB0eXBlc09mRmlsdGVyOiAnRmlsdGVyIGJ5JyxcbiAgZmVhdHVyZUZyb21EczogJ1NlbGVjdGVkIGZlYXR1cmVzIGZyb20gZGF0YSBzb3VyY2UnLFxuICBmZWF0dXJlRnJvbU1hcDogJ0dlb21ldHJpZXMgZnJvbSBhIG1hcCcsXG4gIHNlbGVjdGlvblZpZXdPbmx5OiAnU3VwcG9ydCBzZWxlY3RlZCBmZWF0dXJlcyB2aWV3IG9ubHknLFxuICBnZW9tZXRyeVR5cGVzOiAnR2VvbWV0cnkgdHlwZXMnLFxuICBzcGF0aWFsRmlsdGVyVHlwZV9DdXJyZW50TWFwRXh0ZW50OiAnQ3VycmVudCBtYXAgZXh0ZW50JyxcbiAgc3BhdGlhbEZpbHRlclR5cGVfSW50ZXJhY3RpdmVEcmF3TW9kZTogJ0RyYXduIGdyYXBoaWMnLFxuICBzcGF0aWFsRmlsdGVyVHlwZV9TcGF0aWFsUmVsYXRpb25zaGlwOiAnVXNlIG90aGVyIGxheWVycycsXG4gIHJlc3VsdHM6ICdSZXN1bHRzJyxcbiAgbGlzdERpcmVjdGlvbjogJ0xpc3QgZGlyZWN0aW9uJyxcbiAgcGFnaW5nU3R5bGVfTXVsdGlQYWdlOiAnTXVsdGlwYWdlJyxcbiAgcGFnaW5nU3R5bGVfTGF6eUxvYWQ6ICdTaW5nbGUtcGFnZScsXG4gIGZpZWxkX1BvcHVwU2V0dGluZzogJ1VzZSB3ZWJtYXAgc2V0dGluZ3MnLFxuICBmaWVsZF9TZWxlY3RBdHRyaWJ1dGVzOiAnQ3VzdG9taXplJyxcbiAgc2VsZWN0RGlzcGxheUZpZWxkczogJ1NlbGVjdCBmaWVsZHMgdG8gZGlzcGxheSAnLFxuICBzeW1ib2xUeXBlX0RlZmF1bHRTeW1ib2w6ICdEZWZhdWx0JyxcbiAgc3ltYm9sVHlwZV9DdXN0b21TeW1ib2w6ICdDdXN0b20nLFxuICBhbGxvd1RvQ2hhbmdlU3ltYm9sQXRSdW50aW1lOiAnQWxsb3cgdG8gY2hhbmdlIHN5bWJvbCBhdCBydW50aW1lJyxcbiAgYWxsb3dUb0V4cG9ydDogJ0FsbG93IHRvIGV4cG9ydCcsXG4gIGludGVyYWN0aXZlRHJhd01vZGU6ICdJbnRlcmFjdGl2ZSBkcmF3IG1vZGUnLFxuICBjaG9vc2VTZWxlY3Rpb25Ub29sczogJ1Rvb2xzJyxcbiAgc2tldGNoVG9vbF9wb2ludDogJ1BvaW50JyxcbiAgc2tldGNoVG9vbF9wb2x5bGluZTogJ0xpbmUnLFxuICBza2V0Y2hUb29sX3BvbHlnb246ICdQb2x5Z29uJyxcbiAgc2tldGNoVG9vbF9yZWN0YW5nbGU6ICdSZWN0YW5nbGUnLFxuICBza2V0Y2hUb29sX2NpcmNsZTogJ0NpcmNsZScsXG4gIHNwYXRpYWxSZWxhdGlvbnNoaXA6ICdTcGF0aWFsIHJlbGF0aW9uc2hpcCcsXG4gIGNob29zZVNwYXRpYWxSZWxhdGlvbnNoaXBSdWxlczogJ1NwYXRpYWwgcmVsYXRpb25zaGlwIHJ1bGVzJyxcbiAgZW5hYmxlU2VsZWN0VG9vbDogJ0VuYWJsZSBzZWxlY3QgdG9vbCcsXG4gIHF1ZXJ5TWVzc2FnZTogJ01lc3NhZ2UnLFxuICBhdExlYXN0T25lSXRlbUlzUmVxdWlyZWQ6ICdBdCBsZWFzdCBvbmUgaXRlbSBpcyByZXF1aXJlZC4nLFxuICBjb25maWd1cmVRdWVyeTogJ0NvbmZpZ3VyZSBxdWVyeScsXG4gIGhpbnRRdWVyeUFyZ3VtZW50c1NldHRpbmc6ICdBIHF1ZXJ5IGNhbiBoYXZlIGFuIGF0dHJpYnV0ZSBmaWx0ZXIsIHNwYXRpYWwgZmlsdGVyLCBvciBib3RoLicsXG4gIG5vUXVlcnlUaXA6ICdDbGljayB0aGUgXCJ7bmV3UXVlcnl9XCIgYnV0dG9uIHRvIGFkZCBhbmQgY29uZmlndXJlIHF1ZXJpZXMuJyxcbiAgb3BlblRpcDogJ09wZW4gdGlwJyxcbiAgY2xvc2VUaXA6ICdDbG9zZSB0aXAnLFxuICBjb25maWdUaXRsZTogJ1RpdGxlJyxcbiAgbGFiZWw6ICdMYWJlbCcsXG4gIGRlc2NyaXB0aW9uOiAnRGVzY3JpcHRpb24nLFxuICBkZWZhdWx0UGFnZVNpemU6ICdEZWZhdWx0IHBhZ2Ugc2l6ZScsXG4gIGxhenlMb2FkSW5pdGlhbFBhZ2VTaXplOiAnSW5pdGlhbCBxdWVyeSBwYWdlIHNpemUgKExhenlMb2FkKScsXG4gIHpvb21Ub1NlbGVjdGVkOiAnWm9vbSB0byBzZWxlY3RlZCcsXG4gIGdyb3VwSWQ6ICdHcm91cCBJRCcsXG4gIHNob3J0SWREZXNjcmlwdGlvbjogJ1RoZSBoYXNoIHBhcmFtZXRlciB1c2VkIHRvIGV4ZWN1dGUgYSBxdWVyeSB1c2luZyAjc2hvcnRpZD12YWx1ZSBpbiB0aGUgVVJMLicsXG4gIGdyb3VwSWREZXNjcmlwdGlvbjogJ1VzZWQgdG8gZ3JvdXAgcXVlcmllcyB0b2dldGhlci4gRXhhbXBsZTogaWYgeW91IGhhdmUgbXVsdGlwbGUgcXVlcmllcyBvbiB0aGUgcGFyY2VsIGxheWVyLCBvbmUgZm9yIFBhcmNlbCBudW1iZXIgYW5kIG9uZSBmb3IgTWFqb3IgbnVtYmVyLCB5b3UgY2FuIHVzZSB0aGUgR3JvdXAgSUQgdG8gZ3JvdXAgdGhlc2UgdG9nZXRoZXIuJyxcbiAgZGlzcGxheU9yZGVyOiAnRGlzcGxheSBPcmRlcicsXG4gIGRpc3BsYXlPcmRlckRlc2NyaXB0aW9uOiAnTG93ZXIgbnVtYmVycyBhcHBlYXIgZmlyc3QuIExlYXZlIGVtcHR5IHRvIG1haW50YWluIGRlZmF1bHQgb3JkZXIuJyxcbiAgaGlnaGxpZ2h0T3B0aW9uczogJ0hpZ2hsaWdodCBPcHRpb25zJyxcbiAgdXNlR3JhcGhpY3NMYXllckZvckhpZ2hsaWdodDogJ1VzZSBncmFwaGljcyBsYXllciBmb3IgaGlnaGxpZ2h0aW5nJyxcbiAgdXNlR3JhcGhpY3NMYXllckZvckhpZ2hsaWdodERlc2NyaXB0aW9uOiAnV2hlbiBlbmFibGVkLCBoaWdobGlnaHRzIHdpbGwgZGlzcGxheSBldmVuIHdoZW4gdGhlIGxheWVyIGlzIHR1cm5lZCBvZmYuIFVzZXMgdGhlIG1hcFxcJ3MgZGVmYXVsdCBoaWdobGlnaHQgY29sb3IuJyxcbiAgc2VsZWN0TWFwRm9ySGlnaGxpZ2h0OiAnU2VsZWN0IG1hcCB3aWRnZXQnXG59XG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfdWlfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCJpbXBvcnQgdHlwZSB7IGV4dGVuc2lvblNwZWMsIElNQXBwQ29uZmlnLCBJbW11dGFibGVPYmplY3QgfSBmcm9tICdqaW11LWNvcmUnXG5pbXBvcnQgeyBkZWZhdWx0TWVzc2FnZXMgYXMgamltdVVJTWVzc2FnZXMgfSBmcm9tICdqaW11LXVpJ1xuaW1wb3J0IHR5cGUgeyBJTUNvbmZpZywgUXVlcnlJdGVtVHlwZSB9IGZyb20gJy4uL2NvbmZpZydcbmltcG9ydCBkZWZhdWx0TWVzc2FnZXMgZnJvbSAnLi4vc2V0dGluZy90cmFuc2xhdGlvbnMvZGVmYXVsdCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnVpbGRlck9wZXJhdGlvbnMgaW1wbGVtZW50cyBleHRlbnNpb25TcGVjLkJ1aWxkZXJPcGVyYXRpb25zRXh0ZW5zaW9uIHtcbiAgaWQgPSAncXVlcnktc2ltcGxlLWJ1aWxkZXItb3BlcmF0aW9uJ1xuICB3aWRnZXRJZDogc3RyaW5nXG5cbiAgZ2V0VHJhbnNsYXRpb25LZXkoYXBwQ29uZmlnOiBJTUFwcENvbmZpZyk6IFByb21pc2U8ZXh0ZW5zaW9uU3BlYy5UcmFuc2xhdGlvbktleVtdPiB7XG4gICAgY29uc3QgY29uZmlnID0gYXBwQ29uZmlnLndpZGdldHNbdGhpcy53aWRnZXRJZF0uY29uZmlnIGFzIElNQ29uZmlnXG4gICAgY29uc3Qga2V5czogZXh0ZW5zaW9uU3BlYy5UcmFuc2xhdGlvbktleVtdID0gW11cbiAgICBjb25zdCBxdWVyeUl0ZW1zID0gY29uZmlnPy5xdWVyeUl0ZW1zIHx8IFtdXG4gICAgcXVlcnlJdGVtcy5mb3JFYWNoKChxdWVyeUl0ZW06IEltbXV0YWJsZU9iamVjdDxRdWVyeUl0ZW1UeXBlPikgPT4ge1xuICAgICAgY29uc3QgcHJlZml4ID0gYHdpZGdldHMuJHt0aGlzLndpZGdldElkfS4ke3F1ZXJ5SXRlbS5jb25maWdJZH1gXG4gICAgICBpZiAocXVlcnlJdGVtLm5hbWUpIHtcbiAgICAgICAga2V5cy5wdXNoKHtcbiAgICAgICAgICBrZXlUeXBlOiAndmFsdWUnLFxuICAgICAgICAgIGtleTogYCR7cHJlZml4fS5uYW1lYCxcbiAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAga2V5OiAnbGFiZWwnLFxuICAgICAgICAgICAgZW5MYWJlbDogamltdVVJTWVzc2FnZXMubGFiZWxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlVHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLmF0dHJpYnV0ZUZpbHRlckxhYmVsKSB7XG4gICAgICAgIGtleXMucHVzaCh7XG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcbiAgICAgICAgICBrZXk6IGAke3ByZWZpeH0uYXR0cmlidXRlRmlsdGVyTGFiZWxgLFxuICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBrZXk6ICdhdHRyaWJ1dGVGaWx0ZXInLFxuICAgICAgICAgICAgZW5MYWJlbDogZGVmYXVsdE1lc3NhZ2VzLmF0dHJpYnV0ZUZpbHRlclxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dCdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChxdWVyeUl0ZW0uYXR0cmlidXRlRmlsdGVyRGVzYykge1xuICAgICAgICBrZXlzLnB1c2goe1xuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LmF0dHJpYnV0ZUZpbHRlckRlc2NgLFxuICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBrZXk6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBlbkxhYmVsOiBqaW11VUlNZXNzYWdlcy5kZXNjcmlwdGlvblxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dGFyZWEnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLnNwYXRpYWxGaWx0ZXJMYWJlbCkge1xuICAgICAgICBrZXlzLnB1c2goe1xuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LnNwYXRpYWxGaWx0ZXJMYWJlbGAsXG4gICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGtleTogJ3NwYXRpYWxGaWx0ZXInLFxuICAgICAgICAgICAgZW5MYWJlbDogZGVmYXVsdE1lc3NhZ2VzLnNwYXRpYWxGaWx0ZXJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlVHlwZTogJ3RleHQnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLnNwYXRpYWxGaWx0ZXJEZXNjKSB7XG4gICAgICAgIGtleXMucHVzaCh7XG4gICAgICAgICAga2V5VHlwZTogJ3ZhbHVlJyxcbiAgICAgICAgICBrZXk6IGAke3ByZWZpeH0uc3BhdGlhbEZpbHRlckRlc2NgLFxuICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICBrZXk6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBlbkxhYmVsOiBqaW11VUlNZXNzYWdlcy5kZXNjcmlwdGlvblxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dGFyZWEnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLnJlc3VsdHNMYWJlbCkge1xuICAgICAgICBrZXlzLnB1c2goe1xuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LnJlc3VsdHNMYWJlbGAsXG4gICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGtleTogJ3Jlc3VsdHMnLFxuICAgICAgICAgICAgZW5MYWJlbDogZGVmYXVsdE1lc3NhZ2VzLnJlc3VsdHNcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlVHlwZTogJ3RleHQnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAocXVlcnlJdGVtLnJlc3VsdFRpdGxlRXhwcmVzc2lvbikge1xuICAgICAgICBrZXlzLnB1c2goe1xuICAgICAgICAgIGtleVR5cGU6ICd2YWx1ZScsXG4gICAgICAgICAga2V5OiBgJHtwcmVmaXh9LnJlc3VsdFRpdGxlRXhwcmVzc2lvbmAsXG4gICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgIGtleTogJ2NvbmZpZ1RpdGxlJyxcbiAgICAgICAgICAgIGVuTGFiZWw6IGRlZmF1bHRNZXNzYWdlcy5jb25maWdUaXRsZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWVUeXBlOiAndGV4dGFyZWEnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGtleXMpXG4gIH1cbn1cblxuXG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==