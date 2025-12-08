/** @jsx jsx */
import { React, type IMDataViewJson, type DataSource, type IntlShape } from 'jimu-core';
export interface DataViewSettingPopupProps {
    mainDataSource: DataSource;
    dataView: IMDataViewJson;
    isOpen: boolean;
    /**
     * Whether is setting main data source or data view.
     */
    isSettingMainDataSource?: boolean;
    disableRename?: boolean;
    disableDuplicate?: boolean;
    disableRemove?: boolean;
    /**
     * If there is no data view, will create a new data view using this value as data view id.
     */
    newDataViewId?: string;
    /**
     * If there is no data view, will create a new data view using this value as data view label.
     */
    newDataViewLabel?: string;
    className?: string;
    toggle: () => void;
    onApply: (dataView: IMDataViewJson) => void;
    onDuplicate?: (dataView: IMDataViewJson) => void;
    /**
     * Will call this function after removing data view.
     */
    afterRemove?: (dataView: IMDataViewJson) => void;
}
interface ExtraProps {
    intl: IntlShape;
}
export declare const DataViewSettingPopup: import("@emotion/styled").StyledComponent<Omit<DataViewSettingPopupProps & ExtraProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export {};
