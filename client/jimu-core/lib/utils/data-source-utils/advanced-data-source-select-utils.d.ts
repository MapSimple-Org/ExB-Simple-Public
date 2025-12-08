import type { QueryResult, QueriableDataSource, ArcGISQueryParams, QueryProgressCallback } from '../../data-sources';
import { DataSourceSelectionMode } from '../../data-sources';
import type { JimuFeatureLayerView, JimuSceneLayerView } from 'jimu-arcgis';
export interface SelectModeSelectOptions {
    widgetId: string;
    ds: QueriableDataSource;
    query: ArcGISQueryParams;
    selectionMode: DataSourceSelectionMode;
    signal?: AbortSignal;
    checkLayerVisibility?: boolean;
    jimuLayerView?: JimuFeatureLayerView | JimuSceneLayerView;
    progressCallback?: QueryProgressCallback;
    updateSelectionIfAborted: () => boolean;
}
/**
 * @ignore
 *
 * Select all records by current selection and `selectionMode`. `selectionMode` is to indicate how the new select operation affects the original selection.
 * If `selectionMode` is `DataSourceSelectionMode.New`, then the new selection records are the queried records by the `query` parameter.
 * If `selectionMode` is `DataSourceSelectionMode.AddToCurrent`, then the new selection records include the current selection records and the queried records by the `query` parameter.
 * If `selectionMode` is `DataSourceSelectionMode.RemoveFromCurrent`, then the new selection records are obtained via deleting the queried records by the `query` parameter from the current selection records.
 * If `selectionMode` is `DataSourceSelectionMode.SelectFromCurrent`, then the new selection records are the intersection of the current selection records and the queried records by the `query` parameter.
 *
 * This method will resolve null if the signal is aborted and the selection is not updated.
 * @param options
 */
export declare function selectBySelectionMode(options: SelectModeSelectOptions): Promise<QueryResult>;
