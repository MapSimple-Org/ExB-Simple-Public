"use strict";
(self["webpackChunkexb_client"] = self["webpackChunkexb_client"] || []).push([["your-extensions_widgets_query-simple_src_runtime_selection-utils_ts"],{

/***/ "./your-extensions/widgets/query-simple/src/runtime/selection-utils.ts":
/*!*****************************************************************************!*\
  !*** ./your-extensions/widgets/query-simple/src/runtime/selection-utils.ts ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   QUERYSIMPLE_SELECTION_EVENT: () => (/* binding */ QUERYSIMPLE_SELECTION_EVENT),
/* harmony export */   clearSelectionInDataSources: () => (/* binding */ clearSelectionInDataSources),
/* harmony export */   dispatchSelectionEvent: () => (/* binding */ dispatchSelectionEvent),
/* harmony export */   findClearResultsButton: () => (/* binding */ findClearResultsButton),
/* harmony export */   getOriginDataSource: () => (/* binding */ getOriginDataSource),
/* harmony export */   publishSelectionMessage: () => (/* binding */ publishSelectionMessage),
/* harmony export */   selectRecordsAndPublish: () => (/* binding */ selectRecordsAndPublish),
/* harmony export */   selectRecordsInDataSources: () => (/* binding */ selectRecordsInDataSources)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var _graphics_layer_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./graphics-layer-utils */ "./your-extensions/widgets/query-simple/src/runtime/graphics-layer-utils.ts");
/* harmony import */ var widgets_shared_code_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! widgets/shared-code/common */ "widgets/shared-code/common");
/**
 * Utility functions for managing feature selection in QuerySimple widget.
 * Consolidates repeated selection logic to follow DRY principles.
 */
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



const debugLogger = (0,widgets_shared_code_common__WEBPACK_IMPORTED_MODULE_2__.createQuerySimpleDebugLogger)();
/**
 * Custom event name for QuerySimple to notify Widget of selection changes.
 */
const QUERYSIMPLE_SELECTION_EVENT = 'querysimple-selection-changed';
/**
 * Dispatches a custom selection event to the window so the main Widget can track state.
 *
 * @param widgetId - The widget ID
 * @param recordIds - Array of selected record IDs
 * @param outputDS - The output data source
 * @param queryItemConfigId - The config ID of the query that produced these results
 * @param eventManager - Optional EventManager instance for comparison logging (Chunk 7.1)
 */
function dispatchSelectionEvent(widgetId, recordIds, outputDS, queryItemConfigId, eventManager) {
    const originDS = getOriginDataSource(outputDS);
    const dataSourceId = originDS === null || originDS === void 0 ? void 0 : originDS.id;
    debugLogger.log('TASK', {
        event: 'dispatchSelectionEvent',
        widgetId,
        recordCount: recordIds.length,
        outputDsId: outputDS.id,
        queryItemConfigId
    });
    // Chunk 7: Dispatch selection event via EventManager (r018.59)
    if (eventManager) {
        eventManager.dispatchSelectionEvent(widgetId, recordIds, dataSourceId, outputDS.id, queryItemConfigId);
    }
}
/**
 * Gets the origin data source from an output data source.
 * @param outputDS - The output data source
 * @returns The origin data source, or null if not available
 */
function getOriginDataSource(outputDS) {
    if (!outputDS)
        return null;
    // Try to get origin data sources
    const originDataSources = typeof outputDS.getOriginDataSources === 'function'
        ? outputDS.getOriginDataSources()
        : [];
    if (originDataSources && originDataSources.length > 0) {
        return originDataSources[0];
    }
    // If it doesn't have origin data sources, it might already be an origin data source
    // FeatureLayerDataSource should have a 'layer' property or 'getLayer' method
    if (outputDS.layer || outputDS.getLayer || outputDS.type === 'FeatureLayer') {
        return outputDS;
    }
    return null;
}
/**
 * Selects records in both the origin data source and output data source.
 * This is the standard pattern used throughout the widget for selection.
 * Optionally uses graphics layer for highlighting (independent of layer visibility).
 *
 * @param outputDS - The output data source
 * @param recordIds - Array of record IDs to select
 * @param records - Optional array of FeatureDataRecord objects for proper highlighting
 * @param useGraphicsLayer - Whether to use graphics layer for highlighting (default: false)
 * @param graphicsLayer - Graphics layer instance (required if useGraphicsLayer is true)
 * @param mapView - Map view instance (required if useGraphicsLayer is true)
 */
function selectRecordsInDataSources(outputDS_1, recordIds_1, records_1) {
    return __awaiter(this, arguments, void 0, function* (outputDS, recordIds, records, useGraphicsLayer = false, graphicsLayer, mapView) {
        var _a, _b, _c, _d, _e, _f;
        if (!outputDS)
            return;
        const originDS = getOriginDataSource(outputDS);
        // If using graphics layer, add graphics for highlighting
        if (useGraphicsLayer && graphicsLayer && mapView && records && records.length > 0) {
            debugLogger.log('GRAPHICS-LAYER', {
                event: 'selectRecordsInDataSources-using-graphics-layer',
                recordIdsCount: recordIds.length,
                recordsCount: records.length,
                graphicsLayerId: graphicsLayer.id,
                timestamp: Date.now()
            });
            yield (0,_graphics_layer_utils__WEBPACK_IMPORTED_MODULE_1__.addHighlightGraphics)(graphicsLayer, records, mapView);
            // Still select in data source for state management (but layer selection won't show if layer is off)
            if (originDS && typeof originDS.selectRecordsByIds === 'function') {
                originDS.selectRecordsByIds(recordIds, records);
            }
        }
        else {
            // Original behavior: use layer selection
            debugLogger.log('GRAPHICS-LAYER', {
                event: 'selectRecordsInDataSources-using-layer-selection',
                recordIdsCount: recordIds.length,
                useGraphicsLayer,
                hasGraphicsLayer: !!graphicsLayer,
                hasMapView: !!mapView,
                timestamp: Date.now()
            });
            // Select in origin data source (the actual layer)
            if (originDS && typeof originDS.selectRecordsByIds === 'function') {
                // Log layer state right before selection to see what's available when selection works
                const layer = originDS.layer || ((_b = (_a = originDS).getLayer) === null || _b === void 0 ? void 0 : _b.call(_a));
                if (layer) {
                    debugLogger.log('GRAPHICS-LAYER', {
                        event: 'selectRecordsByIds-layer-state',
                        originDSId: originDS.id,
                        layerId: layer.id,
                        hasLayerMap: !!layer.map,
                        hasLayerView: !!layer.view,
                        hasLayerParent: !!layer.parent,
                        parentType: ((_c = layer.parent) === null || _c === void 0 ? void 0 : _c.type) || 'none',
                        parentHasMap: !!((_d = layer.parent) === null || _d === void 0 ? void 0 : _d.map),
                        parentHasView: !!((_e = layer.parent) === null || _e === void 0 ? void 0 : _e.view),
                        parentHasViews: !!((_f = layer.parent) === null || _f === void 0 ? void 0 : _f.views),
                        timestamp: Date.now()
                    });
                }
                originDS.selectRecordsByIds(recordIds, records);
            }
        }
        // Always update outputDS for widget's internal state
        if (typeof outputDS.selectRecordsByIds === 'function') {
            outputDS.selectRecordsByIds(recordIds, records);
        }
    });
}
/**
 * Clears the `data_s` parameter from the URL hash.
 * Experience Builder automatically adds `data_s` when selections are made,
 * but doesn't remove it when selections are cleared, causing "dirty hash" issues.
 *
 * This function ensures the hash is clean when selections are cleared.
 */
function clearDataSParameterFromHash() {
    const hash = window.location.hash.substring(1);
    if (!hash)
        return;
    const urlParams = new URLSearchParams(hash);
    if (urlParams.has('data_s')) {
        urlParams.delete('data_s');
        const newHash = urlParams.toString();
        debugLogger.log('HASH', {
            event: 'clearDataSParameterFromHash',
            hadDataS: true,
            newHash: newHash ? `#${newHash}` : '(empty)',
            timestamp: Date.now()
        });
        // Update the URL without triggering a reload
        // Always preserve pathname and query string, only update hash
        window.history.replaceState(null, '', window.location.pathname + window.location.search + (newHash ? `#${newHash}` : ''));
    }
}
/**
 * Clears selection in both the origin data source and output data source.
 * Optionally clears graphics layer if using graphics layer mode.
 * Also clears the `data_s` parameter from the URL hash to prevent "dirty hash" issues.
 *
 * @param widgetId - The widget ID (needed to publish message)
 * @param outputDS - The output data source
 * @param useGraphicsLayer - Whether to clear graphics layer (default: false)
 * @param graphicsLayer - Graphics layer instance (required if useGraphicsLayer is true)
 */
function clearSelectionInDataSources(widgetId_1, outputDS_1) {
    return __awaiter(this, arguments, void 0, function* (widgetId, outputDS, useGraphicsLayer = false, graphicsLayer) {
        // Clear graphics layer if using graphics layer mode
        if (useGraphicsLayer && graphicsLayer) {
            debugLogger.log('GRAPHICS-LAYER', {
                event: 'clearSelectionInDataSources-clearing-graphics-layer',
                graphicsLayerId: graphicsLayer.id,
                timestamp: Date.now()
            });
            (0,_graphics_layer_utils__WEBPACK_IMPORTED_MODULE_1__.clearGraphicsLayer)(graphicsLayer);
        }
        // Clear data source selection for state management
        yield selectRecordsInDataSources(outputDS, [], undefined, false);
        // Publish the empty selection message so the Map selection (blue boxes) clears
        if (outputDS) {
            publishSelectionMessage(widgetId, [], outputDS, true);
        }
        // Clear data_s parameter from hash to prevent dirty hash
        // Experience Builder adds data_s when selections are made but doesn't remove it when cleared
        clearDataSParameterFromHash();
    });
}
/**
 * Publishes a selection change message for the given records and data sources.
 *
 * @param widgetId - The widget ID
 * @param records - Array of FeatureDataRecord objects (empty array to clear)
 * @param outputDS - The output data source
 * @param alsoPublishToOutputDS - Whether to also publish a message for outputDS (default: false)
 */
function publishSelectionMessage(widgetId, records, outputDS, alsoPublishToOutputDS = false) {
    if (!outputDS)
        return;
    const originDS = getOriginDataSource(outputDS);
    if (originDS) {
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.MessageManager.getInstance().publishMessage(new jimu_core__WEBPACK_IMPORTED_MODULE_0__.DataRecordsSelectionChangeMessage(widgetId, records, [originDS.id]));
    }
    else if (alsoPublishToOutputDS) {
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.MessageManager.getInstance().publishMessage(new jimu_core__WEBPACK_IMPORTED_MODULE_0__.DataRecordsSelectionChangeMessage(widgetId, records, [outputDS.id]));
    }
    // Optionally publish to outputDS as well (for some edge cases)
    if (alsoPublishToOutputDS && originDS) {
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.MessageManager.getInstance().publishMessage(new jimu_core__WEBPACK_IMPORTED_MODULE_0__.DataRecordsSelectionChangeMessage(widgetId, records, [outputDS.id]));
    }
}
/**
 * Selects records and publishes the selection message in one call.
 * This is the most common pattern - selecting records and notifying the map.
 * Optionally uses graphics layer for highlighting (independent of layer visibility).
 *
 * @param widgetId - The widget ID
 * @param outputDS - The output data source
 * @param recordIds - Array of record IDs to select
 * @param records - Array of FeatureDataRecord objects for proper highlighting
 * @param alsoPublishToOutputDS - Whether to also publish a message for outputDS (default: false)
 * @param useGraphicsLayer - Whether to use graphics layer for highlighting (default: false)
 * @param graphicsLayer - Graphics layer instance (required if useGraphicsLayer is true)
 * @param mapView - Map view instance (required if useGraphicsLayer is true)
 */
function selectRecordsAndPublish(widgetId_1, outputDS_1, recordIds_1, records_1) {
    return __awaiter(this, arguments, void 0, function* (widgetId, outputDS, recordIds, records, alsoPublishToOutputDS = false, useGraphicsLayer = false, graphicsLayer, mapView) {
        yield selectRecordsInDataSources(outputDS, recordIds, records, useGraphicsLayer, graphicsLayer, mapView);
        publishSelectionMessage(widgetId, records, outputDS, alsoPublishToOutputDS);
    });
}
/**
 * Finds the "Clear results" button in the DOM.
 * Used when programmatically triggering the clear action.
 *
 * @returns The clear button element, or null if not found
 */
function findClearResultsButton() {
    // Hardened: Prioritize the one in the results header, fallback to any
    return (document.querySelector('.query-result__header button[aria-label="Clear results"]') ||
        document.querySelector('button[aria-label="Clear results"]'));
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jaHVua3MvcXVlcnktc2ltcGxlX3NyY19ydW50aW1lX3NlbGVjdGlvbi11dGlsc190cy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRzs7Ozs7Ozs7OztBQUcwRTtBQUNnQztBQUNwQztBQUd6RSxNQUFNLFdBQVcsR0FBRyx3RkFBNEIsRUFBRTtBQUVsRDs7R0FFRztBQUNJLE1BQU0sMkJBQTJCLEdBQUcsK0JBQStCO0FBRTFFOzs7Ozs7OztHQVFHO0FBQ0ksU0FBUyxzQkFBc0IsQ0FDcEMsUUFBZ0IsRUFDaEIsU0FBbUIsRUFDbkIsUUFBb0IsRUFDcEIsaUJBQXlCLEVBQ3pCLFlBQTJCO0lBRTNCLE1BQU0sUUFBUSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQztJQUM5QyxNQUFNLFlBQVksR0FBRyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsRUFBRTtJQUVqQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtRQUN0QixLQUFLLEVBQUUsd0JBQXdCO1FBQy9CLFFBQVE7UUFDUixXQUFXLEVBQUUsU0FBUyxDQUFDLE1BQU07UUFDN0IsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFFO1FBQ3ZCLGlCQUFpQjtLQUNsQixDQUFDO0lBRUYsK0RBQStEO0lBQy9ELElBQUksWUFBWSxFQUFFLENBQUM7UUFDakIsWUFBWSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLENBQUM7SUFDeEcsQ0FBQztBQUNILENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksU0FBUyxtQkFBbUIsQ0FDakMsUUFBdUM7SUFFdkMsSUFBSSxDQUFDLFFBQVE7UUFBRSxPQUFPLElBQUk7SUFFMUIsaUNBQWlDO0lBQ2pDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxRQUFRLENBQUMsb0JBQW9CLEtBQUssVUFBVTtRQUMzRSxDQUFDLENBQUMsUUFBUSxD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LENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQywwREFBMEQsQ0FBQztRQUNsRixRQUFRLENBQUMsYUFBYSxDQUFDLG9DQUFvQyxDQUFDLENBQTZCO0FBQ25HLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvcXVlcnktc2ltcGxlL3NyYy9ydW50aW1lL3NlbGVjdGlvbi11dGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb25zIGZvciBtYW5hZ2luZyBmZWF0dXJlIHNlbGVjdGlvbiBpbiBRdWVyeVNpbXBsZSB3aWRnZXQuXG4gKiBDb25zb2xpZGF0ZXMgcmVwZWF0ZWQgc2VsZWN0aW9uIGxvZ2ljIHRvIGZvbGxvdyBEUlkgcHJpbmNpcGxlcy5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IERhdGFTb3VyY2UsIEZlYXR1cmVMYXllckRhdGFTb3VyY2UsIEZlYXR1cmVEYXRhUmVjb3JkIH0gZnJvbSAnamltdS1jb3JlJ1xuaW1wb3J0IHsgTWVzc2FnZU1hbmFnZXIsIERhdGFSZWNvcmRzU2VsZWN0aW9uQ2hhbmdlTWVzc2FnZSB9IGZyb20gJ2ppbXUtY29yZSdcbmltcG9ydCB7IGFkZEhpZ2hsaWdodEdyYXBoaWNzIGFzIGFkZEdyYXBoaWNzTGF5ZXJHcmFwaGljcywgY2xlYXJHcmFwaGljc0xheWVyIH0gZnJvbSAnLi9ncmFwaGljcy1sYXllci11dGlscydcbmltcG9ydCB7IGNyZWF0ZVF1ZXJ5U2ltcGxlRGVidWdMb2dnZXIgfSBmcm9tICd3aWRnZXRzL3NoYXJlZC1jb2RlL2NvbW1vbidcbmltcG9ydCB0eXBlIHsgRXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi9ob29rcy91c2UtZXZlbnQtaGFuZGxpbmcnXG5cbmNvbnN0IGRlYnVnTG9nZ2VyID0gY3JlYXRlUXVlcnlTaW1wbGVEZWJ1Z0xvZ2dlcigpXG5cbi8qKlxuICogQ3VzdG9tIGV2ZW50IG5hbWUgZm9yIFF1ZXJ5U2ltcGxlIHRvIG5vdGlmeSBXaWRnZXQgb2Ygc2VsZWN0aW9uIGNoYW5nZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBRVUVSWVNJTVBMRV9TRUxFQ1RJT05fRVZFTlQgPSAncXVlcnlzaW1wbGUtc2VsZWN0aW9uLWNoYW5nZWQnXG5cbi8qKlxuICogRGlzcGF0Y2hlcyBhIGN1c3RvbSBzZWxlY3Rpb24gZXZlbnQgdG8gdGhlIHdpbmRvdyBzbyB0aGUgbWFpbiBXaWRnZXQgY2FuIHRyYWNrIHN0YXRlLlxuICogXG4gKiBAcGFyYW0gd2lkZ2V0SWQgLSBUaGUgd2lkZ2V0IElEXG4gKiBAcGFyYW0gcmVjb3JkSWRzIC0gQXJyYXkgb2Ygc2VsZWN0ZWQgcmVjb3JkIElEc1xuICogQHBhcmFtIG91dHB1dERTIC0gVGhlIG91dHB1dCBkYXRhIHNvdXJjZVxuICogQHBhcmFtIHF1ZXJ5SXRlbUNvbmZpZ0lkIC0gVGhlIGNvbmZpZyBJRCBvZiB0aGUgcXVlcnkgdGhhdCBwcm9kdWNlZCB0aGVzZSByZXN1bHRzXG4gKiBAcGFyYW0gZXZlbnRNYW5hZ2VyIC0gT3B0aW9uYWwgRXZlbnRNYW5hZ2VyIGluc3RhbmNlIGZvciBjb21wYXJpc29uIGxvZ2dpbmcgKENodW5rIDcuMSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoU2VsZWN0aW9uRXZlbnQoXG4gIHdpZGdldElkOiBzdHJpbmcsXG4gIHJlY29yZElkczogc3RyaW5nW10sXG4gIG91dHB1dERTOiBEYXRhU291cmNlLFxuICBxdWVyeUl0ZW1Db25maWdJZDogc3RyaW5nLFxuICBldmVudE1hbmFnZXI/OiBFdmVudE1hbmFnZXJcbik6IHZvaWQge1xuICBjb25zdCBvcmlnaW5EUyA9IGdldE9yaWdpbkRhdGFTb3VyY2Uob3V0cHV0RFMpXG4gIGNvbnN0IGRhdGFTb3VyY2VJZCA9IG9yaWdpbkRTPy5pZFxuICBcbiAgZGVidWdMb2dnZXIubG9nKCdUQVNLJywge1xuICAgIGV2ZW50OiAnZGlzcGF0Y2hTZWxlY3Rpb25FdmVudCcsXG4gICAgd2lkZ2V0SWQsXG4gICAgcmVjb3JkQ291bnQ6IHJlY29yZElkcy5sZW5ndGgsXG4gICAgb3V0cHV0RHNJZDogb3V0cHV0RFMuaWQsXG4gICAgcXVlcnlJdGVtQ29uZmlnSWRcbiAgfSlcblxuICAvLyBDaHVuayA3OiBEaXNwYXRjaCBzZWxlY3Rpb24gZXZlbnQgdmlhIEV2ZW50TWFuYWdlciAocjAxOC41OSlcbiAgaWYgKGV2ZW50TWFuYWdlcikge1xuICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaFNlbGVjdGlvbkV2ZW50KHdpZGdldElkLCByZWNvcmRJZHMsIGRhdGFTb3VyY2VJZCwgb3V0cHV0RFMuaWQsIHF1ZXJ5SXRlbUNvbmZpZ0lkKVxuICB9XG59XG5cbi8qKlxuICogR2V0cyB0aGUgb3JpZ2luIGRhdGEgc291cmNlIGZyb20gYW4gb3V0cHV0IGRhdGEgc291cmNlLlxuICogQHBhcmFtIG91dHB1dERTIC0gVGhlIG91dHB1dCBkYXRhIHNvdXJjZVxuICogQHJldHVybnMgVGhlIG9yaWdpbiBkYXRhIHNvdXJjZSwgb3IgbnVsbCBpZiBub3QgYXZhaWxhYmxlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcmlnaW5EYXRhU291cmNlKFxuICBvdXRwdXREUzogRGF0YVNvdXJjZSB8IG51bGwgfCB1bmRlZmluZWRcbik6IEZlYXR1cmVMYXllckRhdGFTb3VyY2UgfCBudWxsIHtcbiAgaWYgKCFvdXRwdXREUykgcmV0dXJuIG51bGxcbiAgXG4gIC8vIFRyeSB0byBnZXQgb3JpZ2luIGRhdGEgc291cmNlc1xuICBjb25zdCBvcmlnaW5EYXRhU291cmNlcyA9IHR5cGVvZiBvdXRwdXREUy5nZXRPcmlnaW5EYXRhU291cmNlcyA9PT0gJ2Z1bmN0aW9uJyBcbiAgICA/IG91dHB1dERTLmdldE9yaWdpbkRhdGFTb3VyY2VzKCkgXG4gICAgOiBbXVxuICAgIFxuICBpZiAob3JpZ2luRGF0YVNvdXJjZXMgJiYgb3JpZ2luRGF0YVNvdXJjZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBvcmlnaW5EYXRhU291cmNlc1swXSBhcyBGZWF0dXJlTGF5ZXJEYXRhU291cmNlXG4gIH1cbiAgXG4gIC8vIElmIGl0IGRvZXNuJ3QgaGF2ZSBvcmlnaW4gZGF0YSBzb3VyY2VzLCBpdCBtaWdodCBhbHJlYWR5IGJlIGFuIG9yaWdpbiBkYXRhIHNvdXJjZVxuICAvLyBGZWF0dXJlTGF5ZXJEYXRhU291cmNlIHNob3VsZCBoYXZlIGEgJ2xheWVyJyBwcm9wZXJ0eSBvciAnZ2V0TGF5ZXInIG1ldGhvZFxuICBpZiAoKG91dHB1dERTIGFzIGFueSkubGF5ZXIgfHwgKG91dHB1dERTIGFzIGFueSkuZ2V0TGF5ZXIgfHwgKG91dHB1dERTIGFzIGFueSkudHlwZSA9PT0gJ0ZlYXR1cmVMYXllcicpIHtcbiAgICByZXR1cm4gb3V0cHV0RFMgYXMgRmVhdHVyZUxheWVyRGF0YVNvdXJjZVxuICB9XG4gIFxuICByZXR1cm4gbnVsbFxufVxuXG4vKipcbiAqIFNlbGVjdHMgcmVjb3JkcyBpbiBib3RoIHRoZSBvcmlnaW4gZGF0YSBzb3VyY2UgYW5kIG91dHB1dCBkYXRhIHNvdXJjZS5cbiAqIFRoaXMgaXMgdGhlIHN0YW5kYXJkIHBhdHRlcm4gdXNlZCB0aHJvdWdob3V0IHRoZSB3aWRnZXQgZm9yIHNlbGVjdGlvbi5cbiAqIE9wdGlvbmFsbHkgdXNlcyBncmFwaGljcyBsYXllciBmb3IgaGlnaGxpZ2h0aW5nIChpbmRlcGVuZGVudCBvZiBsYXllciB2aXNpYmlsaXR5KS5cbiAqIFxuICogQHBhcmFtIG91dHB1dERTIC0gVGhlIG91dHB1dCBkYXRhIHNvdXJjZVxuICogQHBhcmFtIHJlY29yZElkcyAtIEFycmF5IG9mIHJlY29yZCBJRHMgdG8gc2VsZWN0XG4gKiBAcGFyYW0gcmVjb3JkcyAtIE9wdGlvbmFsIGFycmF5IG9mIEZlYXR1cmVEYXRhUmVjb3JkIG9iamVjdHMgZm9yIHByb3BlciBoaWdobGlnaHRpbmdcbiAqIEBwYXJhbSB1c2VHcmFwaGljc0xheWVyIC0gV2hldGhlciB0byB1c2UgZ3JhcGhpY3MgbGF5ZXIgZm9yIGhpZ2hsaWdodGluZyAoZGVmYXVsdDogZmFsc2UpXG4gKiBAcGFyYW0gZ3JhcGhpY3NMYXllciAtIEdyYXBoaWNzIGxheWVyIGluc3RhbmNlIChyZXF1aXJlZCBpZiB1c2VHcmFwaGljc0xheWVyIGlzIHRydWUpXG4gKiBAcGFyYW0gbWFwVmlldyAtIE1hcCB2aWV3IGluc3RhbmNlIChyZXF1aXJlZCBpZiB1c2VHcmFwaGljc0xheWVyIGlzIHRydWUpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxlY3RSZWNvcmRzSW5EYXRhU291cmNlcyhcbiAgb3V0cHV0RFM6IERhdGFTb3VyY2UgfCBudWxsIHwgdW5kZWZpbmVkLFxuICByZWNvcmRJZHM6IHN0cmluZ1tdLFxuICByZWNvcmRzPzogRmVhdHVyZURhdGFSZWNvcmRbXSxcbiAgdXNlR3JhcGhpY3NMYXllcjogYm9vbGVhbiA9IGZhbHNlLFxuICBncmFwaGljc0xheWVyPzogX19lc3JpLkdyYXBoaWNzTGF5ZXIsXG4gIG1hcFZpZXc/OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXdcbik6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoIW91dHB1dERTKSByZXR1cm5cbiAgXG4gIGNvbnN0IG9yaWdpbkRTID0gZ2V0T3JpZ2luRGF0YVNvdXJjZShvdXRwdXREUylcbiAgXG4gIC8vIElmIHVzaW5nIGdyYXBoaWNzIGxheWVyLCBhZGQgZ3JhcGhpY3MgZm9yIGhpZ2hsaWdodGluZ1xuICBpZiAodXNlR3JhcGhpY3NMYXllciAmJiBncmFwaGljc0xheWVyICYmIG1hcFZpZXcgJiYgcmVjb3JkcyAmJiByZWNvcmRzLmxlbmd0aCA+IDApIHtcbiAgICBkZWJ1Z0xvZ2dlci5sb2coJ0dSQVBISUNTLUxBWUVSJywge1xuICAgICAgZXZlbnQ6ICdzZWxlY3RSZWNvcmRzSW5EYXRhU291cmNlcy11c2luZy1ncmFwaGljcy1sYXllcicsXG4gICAgICByZWNvcmRJZHNDb3VudDogcmVjb3JkSWRzLmxlbmd0aCxcbiAgICAgIHJlY29yZHNDb3VudDogcmVjb3Jkcy5sZW5ndGgsXG4gICAgICBncmFwaGljc0xheWVySWQ6IGdyYXBoaWNzTGF5ZXIuaWQsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICB9KVxuICAgIFxuICAgIGF3YWl0IGFkZEdyYXBoaWNzTGF5ZXJHcmFwaGljcyhncmFwaGljc0xheWVyLCByZWNvcmRzLCBtYXBWaWV3KVxuICAgIFxuICAgIC8vIFN0aWxsIHNlbGVjdCBpbiBkYXRhIHNvdXJjZSBmb3Igc3RhdGUgbWFuYWdlbWVudCAoYnV0IGxheWVyIHNlbGVjdGlvbiB3b24ndCBzaG93IGlmIGxheWVyIGlzIG9mZilcbiAgICBpZiAob3JpZ2luRFMgJiYgdHlwZW9mIG9yaWdpbkRTLnNlbGVjdFJlY29yZHNCeUlkcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb3JpZ2luRFMuc2VsZWN0UmVjb3Jkc0J5SWRzKHJlY29yZElkcywgcmVjb3JkcylcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gT3JpZ2luYWwgYmVoYXZpb3I6IHVzZSBsYXllciBzZWxlY3Rpb25cbiAgICBkZWJ1Z0xvZ2dlci5sb2coJ0dSQVBISUNTLUxBWUVSJywge1xuICAgICAgZXZlbnQ6ICdzZWxlY3RSZWNvcmRzSW5EYXRhU291cmNlcy11c2luZy1sYXllci1zZWxlY3Rpb24nLFxuICAgICAgcmVjb3JkSWRzQ291bnQ6IHJlY29yZElkcy5sZW5ndGgsXG4gICAgICB1c2VHcmFwaGljc0xheWVyLFxuICAgICAgaGFzR3JhcGhpY3NMYXllcjogISFncmFwaGljc0xheWVyLFxuICAgICAgaGFzTWFwVmlldzogISFtYXBWaWV3LFxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgfSlcbiAgICBcbiAgICAvLyBTZWxlY3QgaW4gb3JpZ2luIGRhdGEgc291cmNlICh0aGUgYWN0dWFsIGxheWVyKVxuICAgIGlmIChvcmlnaW5EUyAmJiB0eXBlb2Ygb3JpZ2luRFMuc2VsZWN0UmVjb3Jkc0J5SWRzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBMb2cgbGF5ZXIgc3RhdGUgcmlnaHQgYmVmb3JlIHNlbGVjdGlvbiB0byBzZWUgd2hhdCdzIGF2YWlsYWJsZSB3aGVuIHNlbGVjdGlvbiB3b3Jrc1xuICAgICAgY29uc3QgbGF5ZXIgPSAob3JpZ2luRFMgYXMgYW55KS5sYXllciB8fCAob3JpZ2luRFMgYXMgYW55KS5nZXRMYXllcj8uKClcbiAgICAgIGlmIChsYXllcikge1xuICAgICAgICBkZWJ1Z0xvZ2dlci5sb2coJ0dSQVBISUNTLUxBWUVSJywge1xuICAgICAgICAgIGV2ZW50OiAnc2VsZWN0UmVjb3Jkc0J5SWRzLWxheWVyLXN0YXRlJyxcbiAgICAgICAgICBvcmlnaW5EU0lkOiBvcmlnaW5EUy5pZCxcbiAgICAgICAgICBsYXllcklkOiBsYXllci5pZCxcbiAgICAgICAgICBoYXNMYXllck1hcDogISEobGF5ZXIgYXMgYW55KS5tYXAsXG4gICAgICAgICAgaGFzTGF5ZXJWaWV3OiAhIShsYXllciBhcyBhbnkpLnZpZXcsXG4gICAgICAgICAgaGFzTGF5ZXJQYXJlbnQ6ICEhKGxheWVyIGFzIGFueSkucGFyZW50LFxuICAgICAgICAgIHBhcmVudFR5cGU6IChsYXllciBhcyBhbnkpLnBhcmVudD8udHlwZSB8fCAnbm9uZScsXG4gICAgICAgICAgcGFyZW50SGFzTWFwOiAhIShsYXllciBhcyBhbnkpLnBhcmVudD8ubWFwLFxuICAgICAgICAgIHBhcmVudEhhc1ZpZXc6ICEhKGxheWVyIGFzIGFueSkucGFyZW50Py52aWV3LFxuICAgICAgICAgIHBhcmVudEhhc1ZpZXdzOiAhIShsYXllciBhcyBhbnkpLnBhcmVudD8udmlld3MsXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBcbiAgICAgIG9yaWdpbkRTLnNlbGVjdFJlY29yZHNCeUlkcyhyZWNvcmRJZHMsIHJlY29yZHMpXG4gICAgfVxuICB9XG4gIFxuICAvLyBBbHdheXMgdXBkYXRlIG91dHB1dERTIGZvciB3aWRnZXQncyBpbnRlcm5hbCBzdGF0ZVxuICBpZiAodHlwZW9mIG91dHB1dERTLnNlbGVjdFJlY29yZHNCeUlkcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG91dHB1dERTLnNlbGVjdFJlY29yZHNCeUlkcyhyZWNvcmRJZHMsIHJlY29yZHMpXG4gIH1cbn1cblxuLyoqXG4gKiBDbGVhcnMgdGhlIGBkYXRhX3NgIHBhcmFtZXRlciBmcm9tIHRoZSBVUkwgaGFzaC5cbiAqIEV4cGVyaWVuY2UgQnVpbGRlciBhdXRvbWF0aWNhbGx5IGFkZHMgYGRhdGFfc2Agd2hlbiBzZWxlY3Rpb25zIGFyZSBtYWRlLFxuICogYnV0IGRvZXNuJ3QgcmVtb3ZlIGl0IHdoZW4gc2VsZWN0aW9ucyBhcmUgY2xlYXJlZCwgY2F1c2luZyBcImRpcnR5IGhhc2hcIiBpc3N1ZXMuXG4gKiBcbiAqIFRoaXMgZnVuY3Rpb24gZW5zdXJlcyB0aGUgaGFzaCBpcyBjbGVhbiB3aGVuIHNlbGVjdGlvbnMgYXJlIGNsZWFyZWQuXG4gKi9cbmZ1bmN0aW9uIGNsZWFyRGF0YVNQYXJhbWV0ZXJGcm9tSGFzaCgpOiB2b2lkIHtcbiAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKVxuICBpZiAoIWhhc2gpIHJldHVyblxuICBcbiAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhoYXNoKVxuICBcbiAgaWYgKHVybFBhcmFtcy5oYXMoJ2RhdGFfcycpKSB7XG4gICAgdXJsUGFyYW1zLmRlbGV0ZSgnZGF0YV9zJylcbiAgICBjb25zdCBuZXdIYXNoID0gdXJsUGFyYW1zLnRvU3RyaW5nKClcbiAgICBcbiAgICBkZWJ1Z0xvZ2dlci5sb2coJ0hBU0gnLCB7XG4gICAgICBldmVudDogJ2NsZWFyRGF0YVNQYXJhbWV0ZXJGcm9tSGFzaCcsXG4gICAgICBoYWREYXRhUzogdHJ1ZSxcbiAgICAgIG5ld0hhc2g6IG5ld0hhc2ggPyBgIyR7bmV3SGFzaH1gIDogJyhlbXB0eSknLFxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgfSlcbiAgICBcbiAgICAvLyBVcGRhdGUgdGhlIFVSTCB3aXRob3V0IHRyaWdnZXJpbmcgYSByZWxvYWRcbiAgICAvLyBBbHdheXMgcHJlc2VydmUgcGF0aG5hbWUgYW5kIHF1ZXJ5IHN0cmluZywgb25seSB1cGRhdGUgaGFzaFxuICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCAnJywgXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoICsgKG5ld0hhc2ggPyBgIyR7bmV3SGFzaH1gIDogJycpXG4gICAgKVxuICB9XG59XG5cbi8qKlxuICogQ2xlYXJzIHNlbGVjdGlvbiBpbiBib3RoIHRoZSBvcmlnaW4gZGF0YSBzb3VyY2UgYW5kIG91dHB1dCBkYXRhIHNvdXJjZS5cbiAqIE9wdGlvbmFsbHkgY2xlYXJzIGdyYXBoaWNzIGxheWVyIGlmIHVzaW5nIGdyYXBoaWNzIGxheWVyIG1vZGUuXG4gKiBBbHNvIGNsZWFycyB0aGUgYGRhdGFfc2AgcGFyYW1ldGVyIGZyb20gdGhlIFVSTCBoYXNoIHRvIHByZXZlbnQgXCJkaXJ0eSBoYXNoXCIgaXNzdWVzLlxuICogXG4gKiBAcGFyYW0gd2lkZ2V0SWQgLSBUaGUgd2lkZ2V0IElEIChuZWVkZWQgdG8gcHVibGlzaCBtZXNzYWdlKVxuICogQHBhcmFtIG91dHB1dERTIC0gVGhlIG91dHB1dCBkYXRhIHNvdXJjZVxuICogQHBhcmFtIHVzZUdyYXBoaWNzTGF5ZXIgLSBXaGV0aGVyIHRvIGNsZWFyIGdyYXBoaWNzIGxheWVyIChkZWZhdWx0OiBmYWxzZSlcbiAqIEBwYXJhbSBncmFwaGljc0xheWVyIC0gR3JhcGhpY3MgbGF5ZXIgaW5zdGFuY2UgKHJlcXVpcmVkIGlmIHVzZUdyYXBoaWNzTGF5ZXIgaXMgdHJ1ZSlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uSW5EYXRhU291cmNlcyAoXG4gIHdpZGdldElkOiBzdHJpbmcsXG4gIG91dHB1dERTOiBEYXRhU291cmNlIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgdXNlR3JhcGhpY3NMYXllcjogYm9vbGVhbiA9IGZhbHNlLFxuICBncmFwaGljc0xheWVyPzogX19lc3JpLkdyYXBoaWNzTGF5ZXJcbik6IFByb21pc2U8dm9pZD4ge1xuICAvLyBDbGVhciBncmFwaGljcyBsYXllciBpZiB1c2luZyBncmFwaGljcyBsYXllciBtb2RlXG4gIGlmICh1c2VHcmFwaGljc0xheWVyICYmIGdyYXBoaWNzTGF5ZXIpIHtcbiAgICBkZWJ1Z0xvZ2dlci5sb2coJ0dSQVBISUNTLUxBWUVSJywge1xuICAgICAgZXZlbnQ6ICdjbGVhclNlbGVjdGlvbkluRGF0YVNvdXJjZXMtY2xlYXJpbmctZ3JhcGhpY3MtbGF5ZXInLFxuICAgICAgZ3JhcGhpY3NMYXllcklkOiBncmFwaGljc0xheWVyLmlkLFxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgfSlcbiAgICBjbGVhckdyYXBoaWNzTGF5ZXIoZ3JhcGhpY3NMYXllcilcbiAgfVxuXG4gIC8vIENsZWFyIGRhdGEgc291cmNlIHNlbGVjdGlvbiBmb3Igc3RhdGUgbWFuYWdlbWVudFxuICBhd2FpdCBzZWxlY3RSZWNvcmRzSW5EYXRhU291cmNlcyhvdXRwdXREUywgW10sIHVuZGVmaW5lZCwgZmFsc2UpXG5cbiAgLy8gUHVibGlzaCB0aGUgZW1wdHkgc2VsZWN0aW9uIG1lc3NhZ2Ugc28gdGhlIE1hcCBzZWxlY3Rpb24gKGJsdWUgYm94ZXMpIGNsZWFyc1xuICBpZiAob3V0cHV0RFMpIHtcbiAgICBwdWJsaXNoU2VsZWN0aW9uTWVzc2FnZSh3aWRnZXRJZCwgW10sIG91dHB1dERTLCB0cnVlKVxuICB9XG4gIFxuICAvLyBDbGVhciBkYXRhX3MgcGFyYW1ldGVyIGZyb20gaGFzaCB0byBwcmV2ZW50IGRpcnR5IGhhc2hcbiAgLy8gRXhwZXJpZW5jZSBCdWlsZGVyIGFkZHMgZGF0YV9zIHdoZW4gc2VsZWN0aW9ucyBhcmUgbWFkZSBidXQgZG9lc24ndCByZW1vdmUgaXQgd2hlbiBjbGVhcmVkXG4gIGNsZWFyRGF0YVNQYXJhbWV0ZXJGcm9tSGFzaCgpXG59XG5cbi8qKlxuICogUHVibGlzaGVzIGEgc2VsZWN0aW9uIGNoYW5nZSBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gcmVjb3JkcyBhbmQgZGF0YSBzb3VyY2VzLlxuICogXG4gKiBAcGFyYW0gd2lkZ2V0SWQgLSBUaGUgd2lkZ2V0IElEXG4gKiBAcGFyYW0gcmVjb3JkcyAtIEFycmF5IG9mIEZlYXR1cmVEYXRhUmVjb3JkIG9iamVjdHMgKGVtcHR5IGFycmF5IHRvIGNsZWFyKVxuICogQHBhcmFtIG91dHB1dERTIC0gVGhlIG91dHB1dCBkYXRhIHNvdXJjZVxuICogQHBhcmFtIGFsc29QdWJsaXNoVG9PdXRwdXREUyAtIFdoZXRoZXIgdG8gYWxzbyBwdWJsaXNoIGEgbWVzc2FnZSBmb3Igb3V0cHV0RFMgKGRlZmF1bHQ6IGZhbHNlKVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaFNlbGVjdGlvbk1lc3NhZ2UoXG4gIHdpZGdldElkOiBzdHJpbmcsXG4gIHJlY29yZHM6IEZlYXR1cmVEYXRhUmVjb3JkW10sXG4gIG91dHB1dERTOiBEYXRhU291cmNlIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgYWxzb1B1Ymxpc2hUb091dHB1dERTOiBib29sZWFuID0gZmFsc2Vcbik6IHZvaWQge1xuICBpZiAoIW91dHB1dERTKSByZXR1cm5cbiAgXG4gIGNvbnN0IG9yaWdpbkRTID0gZ2V0T3JpZ2luRGF0YVNvdXJjZShvdXRwdXREUylcbiAgXG4gIGlmIChvcmlnaW5EUykge1xuICAgIE1lc3NhZ2VNYW5hZ2VyLmdldEluc3RhbmNlKCkucHVibGlzaE1lc3NhZ2UoXG4gICAgICBuZXcgRGF0YVJlY29yZHNTZWxlY3Rpb25DaGFuZ2VNZXNzYWdlKHdpZGdldElkLCByZWNvcmRzLCBbb3JpZ2luRFMuaWRdKVxuICAgIClcbiAgfSBlbHNlIGlmIChhbHNvUHVibGlzaFRvT3V0cHV0RFMpIHtcbiAgICBNZXNzYWdlTWFuYWdlci5nZXRJbnN0YW5jZSgpLnB1Ymxpc2hNZXNzYWdlKFxuICAgICAgbmV3IERhdGFSZWNvcmRzU2VsZWN0aW9uQ2hhbmdlTWVzc2FnZSh3aWRnZXRJZCwgcmVjb3JkcywgW291dHB1dERTLmlkXSlcbiAgICApXG4gIH1cbiAgXG4gIC8vIE9wdGlvbmFsbHkgcHVibGlzaCB0byBvdXRwdXREUyBhcyB3ZWxsIChmb3Igc29tZSBlZGdlIGNhc2VzKVxuICBpZiAoYWxzb1B1Ymxpc2hUb091dHB1dERTICYmIG9yaWdpbkRTKSB7XG4gICAgTWVzc2FnZU1hbmFnZXIuZ2V0SW5zdGFuY2UoKS5wdWJsaXNoTWVzc2FnZShcbiAgICAgIG5ldyBEYXRhUmVjb3Jkc1NlbGVjdGlvbkNoYW5nZU1lc3NhZ2Uod2lkZ2V0SWQsIHJlY29yZHMsIFtvdXRwdXREUy5pZF0pXG4gICAgKVxuICB9XG59XG5cbi8qKlxuICogU2VsZWN0cyByZWNvcmRzIGFuZCBwdWJsaXNoZXMgdGhlIHNlbGVjdGlvbiBtZXNzYWdlIGluIG9uZSBjYWxsLlxuICogVGhpcyBpcyB0aGUgbW9zdCBjb21tb24gcGF0dGVybiAtIHNlbGVjdGluZyByZWNvcmRzIGFuZCBub3RpZnlpbmcgdGhlIG1hcC5cbiAqIE9wdGlvbmFsbHkgdXNlcyBncmFwaGljcyBsYXllciBmb3IgaGlnaGxpZ2h0aW5nIChpbmRlcGVuZGVudCBvZiBsYXllciB2aXNpYmlsaXR5KS5cbiAqIFxuICogQHBhcmFtIHdpZGdldElkIC0gVGhlIHdpZGdldCBJRFxuICogQHBhcmFtIG91dHB1dERTIC0gVGhlIG91dHB1dCBkYXRhIHNvdXJjZVxuICogQHBhcmFtIHJlY29yZElkcyAtIEFycmF5IG9mIHJlY29yZCBJRHMgdG8gc2VsZWN0XG4gKiBAcGFyYW0gcmVjb3JkcyAtIEFycmF5IG9mIEZlYXR1cmVEYXRhUmVjb3JkIG9iamVjdHMgZm9yIHByb3BlciBoaWdobGlnaHRpbmdcbiAqIEBwYXJhbSBhbHNvUHVibGlzaFRvT3V0cHV0RFMgLSBXaGV0aGVyIHRvIGFsc28gcHVibGlzaCBhIG1lc3NhZ2UgZm9yIG91dHB1dERTIChkZWZhdWx0OiBmYWxzZSlcbiAqIEBwYXJhbSB1c2VHcmFwaGljc0xheWVyIC0gV2hldGhlciB0byB1c2UgZ3JhcGhpY3MgbGF5ZXIgZm9yIGhpZ2hsaWdodGluZyAoZGVmYXVsdDogZmFsc2UpXG4gKiBAcGFyYW0gZ3JhcGhpY3NMYXllciAtIEdyYXBoaWNzIGxheWVyIGluc3RhbmNlIChyZXF1aXJlZCBpZiB1c2VHcmFwaGljc0xheWVyIGlzIHRydWUpXG4gKiBAcGFyYW0gbWFwVmlldyAtIE1hcCB2aWV3IGluc3RhbmNlIChyZXF1aXJlZCBpZiB1c2VHcmFwaGljc0xheWVyIGlzIHRydWUpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxlY3RSZWNvcmRzQW5kUHVibGlzaChcbiAgd2lkZ2V0SWQ6IHN0cmluZyxcbiAgb3V0cHV0RFM6IERhdGFTb3VyY2UgfCBudWxsIHwgdW5kZWZpbmVkLFxuICByZWNvcmRJZHM6IHN0cmluZ1tdLFxuICByZWNvcmRzOiBGZWF0dXJlRGF0YVJlY29yZFtdLFxuICBhbHNvUHVibGlzaFRvT3V0cHV0RFM6IGJvb2xlYW4gPSBmYWxzZSxcbiAgdXNlR3JhcGhpY3NMYXllcjogYm9vbGVhbiA9IGZhbHNlLFxuICBncmFwaGljc0xheWVyPzogX19lc3JpLkdyYXBoaWNzTGF5ZXIsXG4gIG1hcFZpZXc/OiBfX2VzcmkuTWFwVmlldyB8IF9fZXNyaS5TY2VuZVZpZXdcbik6IFByb21pc2U8dm9pZD4ge1xuICBhd2FpdCBzZWxlY3RSZWNvcmRzSW5EYXRhU291cmNlcyhvdXRwdXREUywgcmVjb3JkSWRzLCByZWNvcmRzLCB1c2VHcmFwaGljc0xheWVyLCBncmFwaGljc0xheWVyLCBtYXBWaWV3KVxuICBwdWJsaXNoU2VsZWN0aW9uTWVzc2FnZSh3aWRnZXRJZCwgcmVjb3Jkcywgb3V0cHV0RFMsIGFsc29QdWJsaXNoVG9PdXRwdXREUylcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgXCJDbGVhciByZXN1bHRzXCIgYnV0dG9uIGluIHRoZSBET00uXG4gKiBVc2VkIHdoZW4gcHJvZ3JhbW1hdGljYWxseSB0cmlnZ2VyaW5nIHRoZSBjbGVhciBhY3Rpb24uXG4gKiBcbiAqIEByZXR1cm5zIFRoZSBjbGVhciBidXR0b24gZWxlbWVudCwgb3IgbnVsbCBpZiBub3QgZm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRDbGVhclJlc3VsdHNCdXR0b24oKTogSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsIHtcbiAgLy8gSGFyZGVuZWQ6IFByaW9yaXRpemUgdGhlIG9uZSBpbiB0aGUgcmVzdWx0cyBoZWFkZXIsIGZhbGxiYWNrIHRvIGFueVxuICByZXR1cm4gKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5xdWVyeS1yZXN1bHRfX2hlYWRlciBidXR0b25bYXJpYS1sYWJlbD1cIkNsZWFyIHJlc3VsdHNcIl0nKSB8fCBcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b25bYXJpYS1sYWJlbD1cIkNsZWFyIHJlc3VsdHNcIl0nKSkgYXMgSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsXG59XG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==