/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape, type DataSource, type IMGroupSqlExpression, type IMFieldSchema } from 'jimu-core';
/**
 * The GroupSqlExpressionBuilder component props.
 */
export interface GroupSqlExpressionBuilderProps {
    /**
     * Immutable group SQL expression.
     */
    expression: IMGroupSqlExpression;
    /**
     * Selected data source.
     * Feature layers, feature layers inside web maps, and feature service URLs are supported.
     */
    dataSources: DataSource[];
    /**
     * Callback fired when SQL expression is changed.
     */
    onChange: (expression: IMGroupSqlExpression) => void;
    /**
     * @ignore
     */
    style?: React.CSSProperties;
    /**
     * @ignore
     */
    className?: string;
}
interface ExtraProps {
    /**
     * @ignore
     */
    theme: IMThemeVariables;
}
interface IntlProps {
    /**
     * @ignore
     */
    intl: IntlShape;
}
interface State {
    expression: IMGroupSqlExpression;
}
export declare class _GroupSqlExpressionBuilder extends React.PureComponent<GroupSqlExpressionBuilderProps & ExtraProps & IntlProps, State> {
    mainField: IMFieldSchema;
    dataSources: DataSource[];
    constructor(props: any);
    i18nMessage: (id: string) => string;
    componentDidUpdate(prevProps: GroupSqlExpressionBuilderProps & ExtraProps & IntlProps, prevState: State): void;
    getDataSources: () => DataSource[];
    getGroupExpression: (dataSources: any) => IMGroupSqlExpression;
    getMainFieldObject: (clause: any) => IMFieldSchema;
    onMainFieldItemChange: (expr: any) => void;
    onFieldItemChange: (expr: any, index: any) => void;
    onClauseChange: (clause: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const GroupSqlExpressionBuilder: import("@emotion/styled").StyledComponent<Omit<GroupSqlExpressionBuilderProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default GroupSqlExpressionBuilder;
