/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
export declare enum DataSourceRemoveWaringReason {
    /**
     * Data source is removed.
     */
    DataSourceRemoved = "DATA_SOURCE_REMOVED",
    /**
     * Source widget of output data source is removed.
     */
    SourceWidgetRemoved = "SOURCE_WIDGET_REMOVED",
    /**
     * In express mode, widgets can only select the child data sources of the map widget's data sources.
     * If change the map widget's data source, will affect other widgets.
     */
    MapChanged = "MAP_CHANGED"
}
interface DataSourceRemoveWarningProps {
    /**
     * Reasons why need to show the warning popup.
     */
    reason: DataSourceRemoveWaringReason;
    /**
     * If `dataSourceId` is passed in, will list all widgets related to the data source and ignore `widgetId`.
     * Must pass in one of `dataSourceId` and `widgetId`.
     */
    dataSourceId?: string;
    /**
     * If `widgetId` is passed in, will list all widgets related to output data sources of the widget.
     * Please note that this props can be superseded by `dataSourceId`.
     * Must pass in one of `dataSourceId` and `widgetId`.
     */
    widgetId?: string;
    /**
     * Label of the removed data source/source widget.
     * If do not pass in the props, will use data source label or widget label.
     */
    label?: string;
    isOpen: boolean;
    className?: string;
    toggle: () => void;
    /**
     * Will call this function after removing data source/source widget and related widgets.
     */
    afterRemove?: () => void;
    /**
     * Will call this function before removing data source/source widget and related widgets.
     */
    beforeRemove?: () => void;
    /**
     * Will call this function if cancel button is clicked.
     */
    onCancel?: () => void;
}
interface ExtraProps {
    intl: IntlShape;
}
export declare const DataSourceRemoveWarningPopup: import("@emotion/styled").StyledComponent<Omit<DataSourceRemoveWarningProps & ExtraProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export {};
