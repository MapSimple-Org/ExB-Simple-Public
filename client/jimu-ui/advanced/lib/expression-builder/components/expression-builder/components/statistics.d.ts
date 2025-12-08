import { React, type ImmutableArray, ExpressionFunctions, type Expression, DataSourceManager, type FieldSchema, type ExpressionPart, type IntlShape, type ImmutableObject, type ExpressionPartGroup, type UseDataSource, type IMUseDataSource, type PercentileParams } from 'jimu-core';
export interface Props {
    useDataSources: ImmutableArray<UseDataSource>;
    expression: Expression | ImmutableObject<Expression>;
    intl: IntlShape;
    widgetId?: string;
    onChange: (expression: Expression) => void;
}
interface State {
    customExpName?: string;
    selectedDsId: string;
    selectedJimuFieldName: string;
    percentileValue: number;
    percentileOrder: 'ASC' | 'DESC';
    selectedFunction: ExpressionFunctions;
    MainDataAndViewSelector: any;
    DataViewPriority: any;
}
export default class StatisticsTab extends React.PureComponent<Props, State> {
    dsManager: DataSourceManager;
    __unmount: boolean;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    componentWillUnmount(): void;
    getWhetherExpressionIsFuncAndHasOnePart: (groupedParts: ExpressionPartGroup[]) => boolean;
    hasNoParamAndDsEnabled: (part: ExpressionPartGroup) => boolean;
    hasParamsAndDsEnabled: (part: ExpressionPartGroup) => boolean;
    getWhetherUseSelectedDs: (part: ExpressionPart) => boolean;
    getDefaultDsId: () => string;
    getDefaultFunc: () => ExpressionFunctions;
    getDefaultPercentileParams: () => PercentileParams;
    getDefaultJimuFieldName: (dsId: string) => string;
    getDefaultExpName: (fieldName: string, func: ExpressionFunctions, percentileValue: number, percentileOrder: "ASC" | "DESC") => string;
    getCustomExpName: (fieldName: string, func: ExpressionFunctions, percentileValue: number, percentileOrder: "ASC" | "DESC", previousExpName: string) => string;
    getSelectedFieldName: (fields: {
        [jimuName: string]: FieldSchema;
    }, fieldJimuName: string) => string;
    /**
     * If function is count, will return all fields, else, will return number fields.
     */
    getFieldsByFunc: (dsId: string, func: ExpressionFunctions) => {
        [jimuName: string]: FieldSchema;
    };
    getSelectedUseDataSource: () => IMUseDataSource;
    onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFunctionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPercentileValueChange: (value: number) => void;
    onPercentileOrderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCustomExpNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChange: () => void;
    onSelectedUseDsChange: (useDataSource: IMUseDataSource) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
