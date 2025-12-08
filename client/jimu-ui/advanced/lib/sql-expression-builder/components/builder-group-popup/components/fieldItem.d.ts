/** @jsx jsx */
import { React, type IMFieldSchema, type IntlShape, type DataSource, ClauseLogic, type IMSqlClause, type ImmutableArray, type JimuFieldType } from 'jimu-core';
interface FieldItemProps {
    dataSource: DataSource;
    mainField: IMFieldSchema;
    isMainDsHosted: boolean;
    selectedFieldList: ImmutableArray<string>;
    logicalOperator?: ClauseLogic;
    clause: IMSqlClause;
    fieldTypes?: ImmutableArray<JimuFieldType>;
    disabledFields?: ImmutableArray<string>;
    dataSources?: DataSource[];
    onChange: (fieldItem: any) => void;
    className?: string;
}
interface IntlProps {
    intl: IntlShape;
}
interface State {
    supportCaseSensitive: boolean;
}
export declare class _FieldItem extends React.PureComponent<FieldItemProps & IntlProps, State> {
    _isMounted: boolean;
    isHosted: boolean;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: FieldItemProps, prevState: State): void;
    componentWillMount(): void;
    i18nMessage: (id: string) => string;
    supportCaseSensitive(): boolean;
    toggleCaseSensitive: () => void;
    /** * field ***/
    onFieldChange: (allSelectedFields: IMFieldSchema[]) => void;
    changeAndOR: (logicalOperator: ClauseLogic) => void;
    onDataSourceChanged: (evt: any) => void;
    onChanged: (options: {
        [key: string]: any;
    }) => void;
    showClauseLogic: (selectedFieldList: any) => boolean;
    getDsLabels: (ds: DataSource) => {
        main: string;
        view: string;
    };
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const FieldItem: React.FC<import("react-intl").WithIntlProps<FieldItemProps & IntlProps>> & {
    WrappedComponent: React.ComponentType<FieldItemProps & IntlProps>;
};
export default FieldItem;
