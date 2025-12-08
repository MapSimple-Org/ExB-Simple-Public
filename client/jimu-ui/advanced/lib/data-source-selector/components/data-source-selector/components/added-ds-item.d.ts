/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape, type ImmutableArray, type DataViewJson, type IMDataViewJson, type ImmutableObject, type DataSource } from 'jimu-core';
interface Props {
    mainDataSourceId: string;
    /**
     * Selected data views.
     */
    dataViews: ImmutableArray<DataViewJson>;
    intl: IntlShape;
    DefaultDataView: IMDataViewJson;
    rootDataSourceId: string;
    widgetId: string;
    innerRef?: React.RefObject<HTMLDivElement>;
    isMultiple?: boolean;
    isMultipleDataView?: boolean;
    disableDataSourceList?: boolean;
    disableDataView?: boolean;
    hideCreateViewButton?: boolean;
    hideDataView?: boolean | ((dataViewJson: IMDataViewJson, mainDataSourceId: string) => boolean);
    hideRemove?: boolean;
    className?: string;
    onChange?: (mainDataSourceId: string, dataViews: ImmutableArray<DataViewJson>) => void;
    onRemove?: (mainDataSourceId: string) => void;
    onClick?: (mainDataSourceId: string) => void;
}
interface State {
    isViewSettingOpen: boolean;
    isViewSelectOpen: boolean;
    settingDataView: IMDataViewJson;
    getAppConfigAction: any;
}
/**
 * @ignore
 */
export default class DsItem extends React.PureComponent<Props & {
    theme: IMThemeVariables;
}, State> {
    __unmount: boolean;
    widthForDropdownItem: {
        width: string;
    };
    widthForDropdownItemLabel: {
        width: string;
    };
    widthForMultiDropdownItemLabel: {
        width: string;
    };
    dropdownNode: React.RefObject<HTMLButtonElement>;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props & {
        theme: IMThemeVariables;
    }, prevState: State): void;
    componentWillUnmount(): void;
    onRemove: (e: any) => void;
    onDataViewChange: (dataViewId: string) => void;
    onDataViewKeyDown: (dataViewId: string, evt: any) => void;
    onMultiDataViewChange: (value: string | number) => void;
    onChange: (mainDataSourceId: string, dataViews: ImmutableArray<DataViewJson>) => void;
    formatMessage: (id: string, values?: {
        [key: string]: any;
    }) => string;
    getDsLabel: (dataSourceId: string) => string;
    getWhetherItemError: (dataSourceId: string, rootDataSourceId: string) => boolean;
    getAllDataViews: () => ImmutableObject<{
        [dvId: string]: DataViewJson;
    }>;
    getCreateViewButton: () => import("@emotion/react/jsx-runtime").JSX.Element;
    getSelectedValueForSingleSelect: () => string;
    getSelectedValueForMultiSelect: () => ImmutableArray<string>;
    getMultiSelectSelectedString: (values: Array<string | number>) => string;
    onDataViewClick: (e: any, dataView: IMDataViewJson) => void;
    onCreateViewClick: () => void;
    onCreateViewKeyDown: (evt: any) => void;
    toggleViewSetting: () => void;
    toggleViewSelect: () => void;
    stopPropagation: (e: any) => void;
    onDataViewSettingApply: (dataView: IMDataViewJson) => void;
    editQuery: (dataView: IMDataViewJson) => void;
    editDataView: (dataView: IMDataViewJson) => void;
    getWhetherAllowToCreateView: () => boolean;
    getWhetherAllowToChangeViewSetting: (vId: string) => boolean;
    onClick: () => void;
    onKeyDown: (evt: any) => void;
    afterRemoveDataView: (dataView: IMDataViewJson) => void;
    getDsObj: (mainDsId: string) => DataSource;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
