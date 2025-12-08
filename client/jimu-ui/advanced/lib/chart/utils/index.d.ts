import { React, type IMThemeVariables } from 'jimu-core';
import type { WebChart, ActionModes } from 'arcgis-charts-components';
type TraverseConvertColorIdentifier = string | ((key: string) => boolean);
/**
 * Traverses and converts all string colors to symbol colors.
 * @param input
 * @param theme
 *
 * [symbol color](https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-Symbol.html#color)
 */
export declare const traverseConvertColor: <T>(input: T, theme: IMThemeVariables, identifier?: TraverseConvertColorIdentifier) => T;
export declare const traverseConvertWebChartColor: (input: WebChart, theme: IMThemeVariables) => WebChart;
export declare const traverseConvertSymbolColor: <T>(input: T, theme: IMThemeVariables) => T;
type TraverseCallbackHandle = (key: string, value: any) => any;
/**
 * Traverse an object and execute a callback function on the [primitive] value
 * @param input
 * @param callback
 * @param key
 * @returns input
 */
export declare const traverse: (input: any, callback: TraverseCallbackHandle, key?: string) => any;
/**
 * Normalize the chart object.
 * @param input
 */
export declare const useNormalizedChartObject: <T>(input: any) => T;
export interface UnprivilegedChart {
    /**
     * Resets the chart zoom to bring it back to full extent
     */
    resetZoom: () => Promise<void>;
    /**
     * Clears all selection on the chart.
     */
    clearSelection: () => Promise<void>;
    /**
     * Switches the selection on the chart.
     */
    switchSelection: () => Promise<void>;
    /**
     * Switches the `actionMode` on the chart.
     */
    setActionMode: (actionMode?: ActionModes) => void;
    /**
     * Re-render the chart.
     * @param props.updateData Indicates whether to fetch new data. Default: true.
     * @param props.updateExtent Indicates whether the view's extent is to update. Default: false.
     * @param props.resetAxesBounds Option to reset the axes bounds along with the refresh. Default: false;
     */
    refresh: (props?: {
        updateData?: boolean;
        resetAxesBounds?: boolean;
        updateExtent?: boolean;
    }) => Promise<void>;
    /**
     * Triggers an alert to display an error message.
    */
    errorAlert: (errorMessage?: string) => Promise<void>;
}
/**
 * Returns an weaker, unprivileged proxy object that only exposes methods of chart element.
 * @param chart
 * @returns {UnprivilegedChart}
 */
export declare const makeUnprivilegedChart: (chart: any) => UnprivilegedChart;
export declare const useForkChartRef: <T>(ref: React.MutableRefObject<T>, chartRef: React.Ref<UnprivilegedChart>) => (element: any) => void;
export declare const useUnprivilegedChartRef: <T>(chartRef: React.Ref<UnprivilegedChart>) => (element: T) => void;
export declare const useChartComponentDefined: () => boolean;
export * from './shared-utils';
