import { React, ReactRedux, BrowserSizeMode } from 'jimu-core';
import type { DataSource, IMFieldSchema, CodedValue, ClauseValueOptions, ClauseValuePair, SqlExpression, SqlQuerySortOrder } from 'jimu-core';
interface Props {
    'aria-label?': string;
    'aria-describedby'?: string;
    value: ClauseValueOptions;
    dataSource: DataSource;
    runtime: boolean;
    onChange: (valueObj: ClauseValueOptions) => void;
    isSmallSize?: boolean;
    isMultiple?: boolean;
    codedValues?: CodedValue[];
    fieldObj?: IMFieldSchema;
    sqlExpression?: SqlExpression;
    style?: React.CSSProperties;
    className?: string;
    isEmptyOptionHidden?: boolean;
    sortType?: 'VALUE' | 'LABEL';
    sortOrder?: SqlQuerySortOrder;
}
interface AppStateProps {
    browserSizeMode: BrowserSizeMode;
}
export declare class _VIAdvancedSelect extends React.PureComponent<Props & AppStateProps> {
    onValueChange: (valuePairs: ClauseValuePair[]) => void;
    useDynamicValues: () => boolean;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const VIAdvancedSelect: ReactRedux.ConnectedComponent<typeof _VIAdvancedSelect, {
    style?: React.CSSProperties;
    className?: string;
    ref?: React.Ref<_VIAdvancedSelect>;
    key?: React.Key | null | undefined;
    'aria-describedby'?: string;
    onChange: (valueObj: ClauseValueOptions) => void;
    value: ClauseValueOptions;
    dataSource: DataSource;
    sortOrder?: SqlQuerySortOrder;
    runtime: boolean;
    isMultiple?: boolean;
    sqlExpression?: SqlExpression;
    sortType?: "VALUE" | "LABEL";
    isEmptyOptionHidden?: boolean;
    isSmallSize?: boolean;
    fieldObj?: import("seamless-immutable").ImmutableObjectMixin<import("jimu-core").FieldSchema> & {
        readonly jimuName: string;
        readonly type: import("jimu-core").JimuFieldType;
        readonly esriType?: import("jimu-core").EsriFieldType;
        readonly name: string;
        readonly alias?: string;
        readonly description?: string;
        readonly format?: import("seamless-immutable").ImmutableObject<import("jimu-core").FieldFormatSchema>;
        readonly originFields?: import("seamless-immutable").ImmutableArray<string>;
    };
    'aria-label?': string;
    codedValues?: CodedValue[];
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default VIAdvancedSelect;
