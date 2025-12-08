/** @jsx jsx */
import { React, type IMFieldSchema, type IntlShape, type DataSource, type CodedValue, type SqlClause, type ClauseOperator, ClauseSourceType, ClauseCascade, type ClauseValueOptions, ClauseLabelDisplay, ClauseDisplayType, SqlExpressionMode } from 'jimu-core';
import { ClauseInputEditor, type ClauseDisplayFormat, SqlExpressionSizeMode } from 'jimu-ui/basic/sql-expression-runtime';
interface SqlExprClauseProps {
    mode: SqlExpressionMode;
    sizeMode: SqlExpressionSizeMode;
    clause: SqlClause;
    dataSource: DataSource;
    isHosted?: boolean;
    onChange: (clause: SqlClause, isDuplicated?: boolean) => void;
    /**
     * Custom the styles for Group filter.
     * @default false
     */
    isForGroupFilter?: boolean;
    className?: string;
}
interface IntlProps {
    intl: IntlShape;
}
interface State {
    rerender: boolean;
    displayLabel: string;
    supportCaseSensitive: boolean;
    supportAskForValue: boolean;
    isValueLabelPanelShown: boolean;
}
export declare class _SqlExprClause extends React.PureComponent<SqlExprClauseProps & IntlProps, State> {
    _isMounted: boolean;
    operatorList: ClauseOperator[];
    displayTypeList: ClauseDisplayFormat;
    displayTypeListAtRuntime: ClauseDisplayFormat;
    codedValues: CodedValue[];
    fieldObj: IMFieldSchema;
    constructor(props: any);
    getFieldObj: () => void;
    getCodedValues(): CodedValue[];
    _updateTwoStates: (operator: ClauseOperator, sourceType: ClauseSourceType, rerender?: boolean) => void;
    componentDidMount(): void;
    componentDidUpdate(prevProps: SqlExprClauseProps, prevState: State): void;
    componentWillMount(): void;
    i18nMessage: (id: string) => string;
    isCascadeSupported: () => boolean;
    isSortSupported: () => true | CodedValue[];
    _updateCaseSensitiveState(operator: ClauseOperator, sourceType: ClauseSourceType): void;
    _updateAskForValueState(operator: ClauseOperator, sourceType: ClauseSourceType): void;
    getOperatorsByField: (field: IMFieldSchema) => ClauseOperator[];
    deleteClause: () => void;
    toggleCaseSensitive: () => void;
    duplicateClause: () => void;
    toggleValueLabelPanel: () => void;
    getLabel: (clause?: SqlClause) => string;
    onAskForValueOptsChange: (options: {
        [key: string]: any;
    }) => void;
    onLabelAccept: (value: string, isDisplayLabel?: boolean) => void;
    onLabelChange: (evt: any) => void;
    setValueLabelStatus: (type: ClauseDisplayType) => void;
    setDisplayLabelCheckbox: (checked: boolean) => void;
    getAskForValueOptions: (OpenAskForValueByAuto?: boolean) => {
        label: any;
        display: ClauseLabelDisplay;
        hint: string;
        cascade: ClauseCascade;
    };
    /** * field ***/
    onFieldChange: (allSelectedFields: IMFieldSchema[]) => void;
    _updateOptionsByField: (field: IMFieldSchema, operator?: ClauseOperator) => ClauseValueOptions;
    /** * operator ***/
    onOperatorChange: (operator: ClauseOperator) => void;
    _updateOptionsByOperator: (field: IMFieldSchema, operator: ClauseOperator, jimuFieldName: string) => ClauseValueOptions;
    /** * value ***/
    onValueOptsChange: (valueOptions: ClauseValueOptions) => void;
    isUniqueOrMultipleOnOutputDS: (sourceType: any) => boolean;
    isOutputDsAndNoCodedValuesWhenUniqueOrMultiple: (sourceType: any) => boolean;
    isPredefinedClause: (sourceType: ClauseSourceType) => sourceType is ClauseSourceType.SingleSelectFromPredefined | ClauseSourceType.MultipleSelectFromPredefined;
    shouldOpenAskForValueAutomatically: (sourceType: any) => boolean;
    _resetToDefaultDateInputEditor: (sType: ClauseSourceType) => boolean;
    /** * source type ***/
    onSourceTypeSelect: (sourceType: ClauseSourceType) => void;
    /** Input type selector - start */
    showInputEditorTypeSelector: (clause: any) => boolean;
    getInputTypeValue: (clause: any) => any;
    getInputTypeList: (clause: any) => any;
    getInputTypeCodedValues: (clause: SqlClause) => CodedValue[] | import("jimu-core").ClauseValuePair[];
    onInputTypeSelect: (inputEditor: ClauseInputEditor) => void;
    getValueOptions: () => ClauseValueOptions;
    /** Input type selector - end */
    getControllers: (clause: any, normalOperators: any) => import("@emotion/react/jsx-runtime").JSX.Element;
    isPredefinedWithNoValues: (clause: any) => boolean;
    onChanged: (options: {
        [key: string]: any;
    }) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const SqlExpressionClause: import("@emotion/styled").StyledComponent<Omit<SqlExprClauseProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default SqlExpressionClause;
