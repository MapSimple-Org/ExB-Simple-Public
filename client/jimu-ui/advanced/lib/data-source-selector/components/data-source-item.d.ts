/** @jsx jsx */
import { React, type IMDataSourceJson, ReactRedux } from 'jimu-core';
export declare const DataSourceItem: ReactRedux.ConnectedComponent<React.FC<import("react-intl").WithIntlProps<any>> & {
    WrappedComponent: React.ComponentType<any>;
}, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    dataSourceJson: IMDataSourceJson;
    isMoreIconShown?: boolean;
    isCloseIconShown?: boolean;
    isRenameInputShown?: boolean;
    isRelatedWidgetsShown?: boolean;
    isMappingIconShown?: boolean;
    isErrorIconShown?: boolean;
    isCopyIdIconShown?: boolean;
    isSelected?: boolean;
    isHideable?: boolean;
    isLoadingShown?: boolean;
    errorTitle?: string;
    onDataSourceItemClick?: (dsJson: IMDataSourceJson) => void;
    onMappingIconClick?: (dsJson: IMDataSourceJson) => void;
    onCloseIconClick?: (dsJson: IMDataSourceJson) => void;
    onMoreIconClick?: (dsJson: IMDataSourceJson) => void;
    onRename?: (dsLabel: string) => void;
    onToggleHidden?: (dsJson: IMDataSourceJson) => void;
    onChildDataIconClick?: (dsJson: IMDataSourceJson) => void;
    onRelatedWidgetsIconClick?: (dsJson: IMDataSourceJson) => void;
    className?: string;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
