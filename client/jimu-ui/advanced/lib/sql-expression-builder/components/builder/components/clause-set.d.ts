/** @jsx jsx */
import { React, type IntlShape, type DataSource, type SqlClause, type IMSqlClause, ClauseLogic, type SqlClauseSet, type SqlExpressionMode } from 'jimu-core';
import { type SqlExpressionSizeMode } from 'jimu-ui/basic/sql-expression-runtime';
interface SqlExprClauseSet {
    mode: SqlExpressionMode;
    sizeMode: SqlExpressionSizeMode;
    clauseSet: SqlClauseSet;
    dataSource: DataSource;
    isHosted?: boolean;
    onChange: (clauseSet: SqlClauseSet, isDuplicated?: boolean) => void;
    className?: string;
}
interface IntlProps {
    intl: IntlShape;
}
export declare class _SqlExprClauseSet extends React.PureComponent<SqlExprClauseSet & IntlProps, unknown> {
    LogicalOperator: ClauseLogic;
    constructor(props: any);
    i18nMessage: (id: string) => string;
    addClause: (clause: SqlClause) => void;
    duplicateClauseSet: () => void;
    deleteClauseSet: () => void;
    changeAndOR: (logicalOperator: ClauseLogic) => void;
    onClauseChange: (clause: SqlClause | IMSqlClause, id: string, isDuplicated: boolean) => void;
    onChange: (options: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const SqlExpressionClauseSet: import("@emotion/styled").StyledComponent<Omit<SqlExprClauseSet & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default SqlExpressionClauseSet;
