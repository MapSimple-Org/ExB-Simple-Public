import { React, type ImmutableArray } from 'jimu-core';
import type { JimuLayerView, JimuLayerViews } from 'jimu-arcgis';
export interface CustomizeLayerPanelProps {
    mapViewId: string;
    isCustomizeEnabled: boolean;
    isShowRuntimeAddedLayerEnabled: boolean;
    showRuntimeAddedLayerOption?: boolean;
    selectedValues: {
        [mapViewId: string]: ImmutableArray<string>;
    };
    showTable?: boolean;
    /**
     * Fires when the selected layers changes
     * @param jlvIds Selected JimuLayerViews' ids
     */
    onSelectedLayerIdChange?: (jlvIds: string[]) => void;
    /**
     * Fires when the customization option changes
     * @param enable Whether the option is enabled
     * @param allJimuLayerViewIds All JimuLayerView ids in the JimuMapView
     */
    onToggleCustomize?: (enable: boolean, allJimuLayerViewIds?: string[]) => void;
    /**
     * Fires when the 'Show runtime added layer' option changes
     * @param enable Whether the option is enabled
     */
    onShowRuntimeAddedLayersChange?: (enable: boolean) => void;
    extraSettingOptions?: React.JSX.Element;
    hideLayers?: (jimuLayerView: JimuLayerView, jimuLayerViews: JimuLayerViews) => boolean;
    disableLayers?: (jimuLayerView: JimuLayerView, jimuLayerViews: JimuLayerViews) => boolean;
    /**
     * @default false
     * Whether the customize panel is waiting for the JimuLayerView to load
     */
    isJlvLoading?: boolean;
}
export declare function CustomizeLayerPanel(props: CustomizeLayerPanelProps): import("@emotion/react/jsx-runtime").JSX.Element;
