/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
interface DataSourceUpdateWarningProps {
    /**
     * If `dataSourceId` is passed in, will list all widgets related to the data source and ignore `widgetId`.
     * Must pass in one of `dataSourceId` and `widgetId`.
     */
    dataSourceId?: string;
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
     * Will call this function if cancel button is clicked.
     */
    onCancel?: () => void;
}
interface ExtraProps {
    intl: IntlShape;
}
export declare const DataSourceUpdateWarningPopup: import("@emotion/styled").StyledComponent<Omit<DataSourceUpdateWarningProps & ExtraProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export {};
