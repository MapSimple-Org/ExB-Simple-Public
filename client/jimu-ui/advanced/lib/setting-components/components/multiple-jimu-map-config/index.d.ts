import { React, type ImmutableArray } from 'jimu-core';
import { type TreeItemsType } from 'jimu-ui/basic/list-tree';
export interface MultipleJimuMapValidateResult {
    /**
     * The validation result of the data source.
     */
    isValid: boolean;
    /**
     * The tooltip that shows up when hovering on an invalid data source's warning icon.
     */
    invalidMessage?: string;
}
export interface MultipleJimuMapConfigProps {
    /** The map widget ID that is using this component. */
    mapWidgetId: string;
    /** The JSX content that you want to put in the `SidePopper` panel. DO NOT wrap it with the `SidePopper` component. */
    sidePopperContent?: React.JSX.Element;
    /**
     * Whether to disable the map-switch behavior when clicking on different `JimuMap` items. The default value is `false`.
     * @default false
     */
    disableSwitchMap?: boolean;
    /**
     * Whether to disable the whole list.
     * @default false
     */
    disabled?: boolean;
    /** The callback function of clicking an item in the list. */
    onClick?: (dataSourceId: string) => void;
    /**
     * Used for checking whether a specific `dataSourceId` is valid for configuration.
     * It will show a warning icon if the return value is `false`.
     */
    isDataSourceValid?: (dataSourceId: string) => MultipleJimuMapValidateResult;
    /**
     * Display a default `JimuMap` item when no web map is added to the map widget.
     * @default false
     */
    showDefaultMapWhenEmpty?: boolean;
    /**
     * ForwardRef to component outer div.
     * @ignore
     */
    forwardRef?: (ref: any) => void;
    /**
     * Keep the last time clicked `JimuMap` when closing the side popper
     * @default false
     */
    keepLastTimeMap?: boolean;
    /**
     * The id of the description element
     * @ignore
     */
    'aria-describedby'?: string;
    /**
     * Show selected layers for the `LayerSetting` component
     * @ignore
     * @default false
     */
    showSelectedLayers?: boolean;
    /**
     * The selected layers' jimuLayerViewIds
     * @ignore
     */
    selectedJimuLayerViewIds?: {
        [jmvId: string]: ImmutableArray<string>;
    };
    /**
     * The layer popper's content
     * @ignore
     */
    children?: React.ReactNode;
    /**
     * Enable reordering for the selected layers
     * @ignore
     */
    dndEnabled?: boolean;
    /**
     * Fires when the selected layers are reordered
     * @param jmvId Current JimuMapView's id
     * @param itemsJson The selected layers' itemsJson
     * @ignore
     */
    onLayerReorder?: (jmvId: string, itemsJson: TreeItemsType) => void;
    /**
     * Fires when the map item is clicked
     * @param dsId The clicked map's datasource id
     * @ignore
     */
    onMapItemClick?: (dsId: string) => void;
    /**
     * Fires when the layer item is clicked
     * @param jlvId The clicked layer's JimuLayerView id
     * @ignore
     */
    onLayerItemClick?: (jlvId: string, jmvId?: string) => void;
    emptyWarningMessage?: string | React.ReactElement;
    /**
     * @ignore
     */
    getLayerCustomIcon?: (jlvId: string, jmvId?: string) => any;
    /**
     * @ignore
     */
    isLayerDisabled?: (jlvId: string, jmvId?: string) => boolean;
}
declare function MultipleJimuMapConfigComponent(props: MultipleJimuMapConfigProps): import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * This component is used for configuring one or multiple `JimuMap`. If two data sources are selected in the connected map widget,
 * clicking on the list item of this component switches the map widget's active view to the corresponding one. The switch behavior
 * is on the fly (discarded when refreshing the page).
 * Use this component by `import { MultipleJimuMapConfig } from 'jimu-ui/advanced/setting-components'`.
 */
export declare const MultipleJimuMapConfig: typeof MultipleJimuMapConfigComponent;
export {};
