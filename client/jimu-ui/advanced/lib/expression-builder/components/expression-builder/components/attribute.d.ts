import { React, type ImmutableArray, type Expression, type IMFieldSchema, type DataSource, type ImmutableObject, type JimuFieldType, type UseDataSource, type IntlShape } from 'jimu-core';
export interface Props {
    useDataSources: ImmutableArray<UseDataSource>;
    expression: Expression | ImmutableObject<Expression>;
    intl: IntlShape;
    widgetId?: string;
    types?: ImmutableArray<JimuFieldType>;
    className?: string;
    onChange: (expression: Expression) => void;
}
interface State {
    FieldSelector: any;
}
export declare const DEFAULT_DATA_VIEW_ID = "USE_MAIN_DATA_SOURCE";
export default class AttributeTab extends React.PureComponent<Props, State> {
    __unmount: boolean;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    getSelectedFields: () => {
        fields: ImmutableArray<string> | ImmutableObject<{
            [dataSourceId: string]: string[];
        }>;
        isSelectedFromRepeatedDataSourceContext: boolean;
    };
    onSelectedFieldsChange: (allSelectedFields: IMFieldSchema[], ds: DataSource, isFromRepeatedDataSourceContext: boolean) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
