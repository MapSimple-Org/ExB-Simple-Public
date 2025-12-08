/** @jsx jsx */
import { React, type IntlShape, type DataSource, type SqlClause, type SqlClauseSet, type IMSqlExpression } from 'jimu-core';
interface SqlExpressionClauseSetRuntimeProps {
    id: string;
    /**
     * The complete sql expression. It's used to get cascade sql for specific clause
     */
    expression: IMSqlExpression;
    clauseSet: SqlClauseSet;
    dataSource: DataSource;
    isHosted?: boolean;
    onChange: (clause: SqlClauseSet, id: string) => void;
    className?: string;
}
interface IntlProps {
    intl: IntlShape;
}
interface State {
    partsArray: Array<SqlClause | SqlClauseSet>;
}
export declare class _SqlExprClauseSetRuntime extends React.PureComponent<SqlExpressionClauseSetRuntimeProps & IntlProps, State> {
    constructor(props: any);
    componentDidUpdate(prevProps: SqlExpressionClauseSetRuntimeProps, prevState: State): void;
    i18nMessage: (id: string) => string;
    onClauseChange: (clause: SqlClause, id: string) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const SqlExpressionClauseSetRuntime: React.ForwardRefExoticComponent<Pick<Omit<SqlExpressionClauseSetRuntimeProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof SqlExpressionClauseSetRuntimeProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export default SqlExpressionClauseSetRuntime;
