import { React, type Expression, type ExpressionPart, ExpressionFunctions, type ImmutableArray, type IMFieldSchema, type DataSource, type IntlShape, type UseDataSource, type ImmutableObject } from 'jimu-core';
import { type ExpSelection } from '../types';
interface Props {
    expression: Expression;
    useDataSources: ImmutableArray<UseDataSource>;
    externalId: string;
    expSelection: ExpSelection;
    inEditablePart: boolean;
    container: HTMLElement;
    intl: IntlShape;
    widgetId: string;
    /**
     * e: new expression
     * partId: id of added new part
     * isReplacing: if true, will replace a existed part with new part (only when is in editable part and the part is field or function)
     */
    onSelect: (e: Expression, partId: string, isReplacing: boolean) => void;
}
interface State {
    active: ExpEditorHelperTabs;
    FieldSelector: any;
}
declare enum ExpEditorHelperTabs {
    Fields = "FIELDS",
    Functions = "FUNCTIONS"
}
export default class ExpEditorHelper extends React.PureComponent<Props, State> {
    __unmount: boolean;
    ExpEditorHelperTabs: {
        FIELDS: string;
        FUNCTIONS: string;
    };
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    componentWillUnmount(): void;
    getSelectedFields: () => ImmutableObject<{
        [dataSourceId: string]: string[];
    }>;
    getSelectedFunction: (considerEditing?: boolean) => ExpressionFunctions;
    onFunctionSelect: (functionName: ExpressionFunctions) => void;
    onFieldSelect: (allSelectedFields: IMFieldSchema[], ds: DataSource, isFromRepeatedDataSourceContext: boolean) => void;
    onActiveTabChange: (tab: ExpEditorHelperTabs) => void;
    getSelectionPartId: () => string;
    changeExpression: (newParts: ExpressionPart[], expression: Expression) => void;
    getNewPartIndex: (newParts: ExpressionPart[], expression: Expression, isReplacing: boolean) => number;
    getEditingPartIndex: () => number;
    getIsReplacing: () => boolean;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
