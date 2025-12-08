import { type DataSource, React, type ImmutableArray, type IntlShape, DataSourceManager, type UseDataSource, type IMDataSourceJson } from 'jimu-core';
interface State {
    isTypeDropdownOpen: boolean;
    selectedErrorDss: string[];
}
interface Props {
    intl: IntlShape;
    rootDss: Array<DataSource | IMDataSourceJson>;
    allToUseDss: Array<DataSource | IMDataSourceJson>;
    widgetId: string;
    showErrorDss: boolean;
    useDataSources: ImmutableArray<UseDataSource>;
    isMultiple: boolean;
    isBatched: boolean;
    isSearching: boolean;
    disableSelection: boolean;
    disableRemove: boolean;
    onChange: (useDataSources: UseDataSource[]) => void;
    onClickDisabledDsItem?: () => void;
    changeHasErrorSelectedDss: (hasErrorDss: boolean) => void;
}
export default class DsList extends React.PureComponent<Props, State> {
    dsManager: DataSourceManager;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    getWhetherShowSingleDss: () => boolean;
    getSelectedErrorDss: () => string[];
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
