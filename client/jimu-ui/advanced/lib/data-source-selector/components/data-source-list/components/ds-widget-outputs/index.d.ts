import { type DataSource, React, type IMWidgetJson, type ImmutableArray, type IntlShape, type UseDataSource, type IMDataSourceJson, type AllDataSourceTypes, type ImmutableObject, type DataSourceInfo } from 'jimu-core';
import { DataSourceTab } from '../../utils';
interface State {
    toUseRootDss: {
        [widgetId: string]: Array<DataSource | IMDataSourceJson>;
    };
    toUseChildDss: {
        [rootDsId: string]: DataSource[];
    };
    toUseWidgets: IMWidgetJson[];
}
interface Props {
    isDataSourceInited: boolean;
    dataSourcesInfo: ImmutableObject<{
        [dsId: string]: DataSourceInfo;
    }>;
    types: ImmutableArray<AllDataSourceTypes>;
    selectedTypes: ImmutableArray<AllDataSourceTypes>;
    intl: IntlShape;
    searchValue: string;
    widgetId: string;
    isMultiple: boolean;
    isBatched: boolean;
    hideTypeDropdown: boolean;
    hideAllOptionOfTypeDropdown: boolean;
    fromDsIds: ImmutableArray<string>;
    fromRootDsIds: ImmutableArray<string>;
    enableToSelectOutputDsFromSelf: boolean;
    showQueriableDataSourceWithoutFields: boolean;
    useDataSources: ImmutableArray<UseDataSource>;
    disableSelection: boolean;
    disableRemove: boolean;
    hideDs: (dsJson: IMDataSourceJson) => boolean;
    removeDataTab: (tab: DataSourceTab) => void;
    addDataTab: (tab: DataSourceTab) => void;
    onChange: (useDataSources: UseDataSource[]) => void;
}
export default class DataSourceWidgetOutputs extends React.PureComponent<Props, State> {
    __unmount: boolean;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    componentWillUnmount(): void;
    initData: () => void;
    setToUseDataSources: (usedTypes: ImmutableArray<AllDataSourceTypes>, fromRootDsIds: ImmutableArray<string>, fromDsIds: ImmutableArray<string>, hideDs: (dsJson: IMDataSourceJson) => boolean, searchValue: string, widgetId: string) => void;
    getRootDss: () => {
        [widgetId: string]: DataSource[];
    };
    getToUseWidgets: (toUseRootDss: {
        [widgetId: string]: Array<DataSource | IMDataSourceJson>;
    }, toUseChildDss: {
        [rootDsId: string]: DataSource[];
    }) => IMWidgetJson[];
    getToUseRootDss: (usedTypes: ImmutableArray<string>, fromRootDsIds: ImmutableArray<string>, fromDsIds: ImmutableArray<string>, hideDs: (dsJson: IMDataSourceJson) => boolean, searchValue: string, excludeWidgetId: string) => {
        [widgetId: string]: Array<DataSource | IMDataSourceJson>;
    };
    getToUseChildDss: (usedTypes: ImmutableArray<string>, fromRootDsIds: ImmutableArray<string>, fromDsIds: ImmutableArray<string>, hideDs: (dsJson: IMDataSourceJson) => boolean, searchValue: string) => Promise<{
        [rootDsId: string]: DataSource[];
    }>;
    getToUseChildDssByWidgetId: (wId: string) => {
        [rootDsId: string]: DataSource[];
    };
    isValid: (ds: DataSource, fromDsIds: ImmutableArray<string>, hideDs: (dsJson: IMDataSourceJson) => boolean, searchValue: string) => boolean;
    getWhetherShowList: () => boolean;
    getWhetherShowRootDss: () => boolean;
    getWhetherShowChildDss: () => boolean;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
