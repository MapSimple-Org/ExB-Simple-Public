/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape, type DataSource, SqlExpressionMode, type SqlClause, ClauseLogic, type IMSqlExpression, type SqlClauseSet, QueryScope, type ImmutableArray, type IMSqlClause, type IMSqlClauseSet } from 'jimu-core';
import { SqlExpressionSizeMode } from 'jimu-ui/basic/sql-expression-runtime';
/**
 * The SqlExpressionBuilder component props.
 */
export interface SqlExpressionBuilderProps {
    /**
     * SQL expression mode.
     * @default ALL
     */
    mode?: SqlExpressionMode;
    /**
     * Immutable SQL expression.
     */
    expression: IMSqlExpression;
    /**
     * Selected data source.
     * Feature layers, feature layers inside web maps, and feature service URLs are supported.
     */
    dataSource: DataSource;
    /**
     * Callback fired when SQL expressions are changed.
     */
    onChange: (sqlExprObj: IMSqlExpression) => void;
    /**
     * Decide the scope of the data source's filters when source type is unique or multiple.
     * @default IN_CONFIG_VIEW
     */
    queryScope?: QueryScope;
    /**
     * It is used to exclude filters of the current widget, for the custom filter at runtime in the future.
     * Valid when queryScope is `IN_RUNTIME_VIEW`.
     * @ignore
     */
    widgetId?: string;
    /**
     * @ignore
     */
    noScrollForList?: boolean;
    /**
     * @ignore
     */
    style?: React.CSSProperties;
    /**
     * @ignore
     */
    className?: string;
    /**
     * Whether to update expression forcibly.
     * @default false
     * @ignore
     */
    forceUpdateExpression?: boolean;
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
    sizeMode: SqlExpressionSizeMode;
    isOpen: boolean;
    partsArray: ImmutableArray<SqlClause | SqlClauseSet>;
}
/**
 * A component allowing users to get `sql` and `displaySQL` to query and display a certain data source, respectively.
 * The user can configure multiple clauses and clause sets with the AND/OR logic operator.
 * Every clause includes:
 *   field selector, operator selector, (data) source type selector with the default input style.
 *   Additional options: case sensitive and more input settings, with the latter including no user input, display label and ask for values options.
 *
 * ```ts
 * import { SqlExpressionBuilder } from 'jimu-ui/advanced/sql-expression-builder'
 * ```
 */
export declare class _SqlExpressionBuilder extends React.PureComponent<SqlExpressionBuilderProps & ExtraProps & IntlProps, State> {
    isHosted: boolean;
    sqlExpressionListConRef: React.RefObject<HTMLDivElement>;
    constructor(props: any);
    componentDidUpdate(prevProps: SqlExpressionBuilderProps & ExtraProps & IntlProps): void;
    getDataSource: () => DataSource;
    i18nMessage: (id: string) => string;
    addClauseByType: (isSingle?: boolean, clause?: any) => void;
    changeAndOR: (logicalOperator: ClauseLogic) => void;
    onClauseChange: (clause: SqlClause | SqlClauseSet, id: string, isDuplicated: boolean) => void;
    onChange: (options: any) => void;
    /**
     * Handler ids for partsArray (clause, clause set)
     * Add:    add stable ids for every clause and clauseSet for state to render
     * Update: update ids for duplicated items.
     * Remove: remove all ids of every clause and clauseSet for saving config
     */
    getPartsArray: (partsArray: ImmutableArray<SqlClause | SqlClauseSet>, type: "add" | "update" | "remove") => any;
    _getNewClauseOrClauseSet: (clause: IMSqlClause | IMSqlClauseSet, type: "add" | "update" | "remove") => {
        clause: IMSqlClauseSet | IMSqlClause;
        isUpdated: boolean;
    };
    onResize: ({ width, height }: {
        width: any;
        height: any;
    }) => void;
    toggle: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * A component allowing users to get `sql` and `displaySQL` to query and display a certain data source, respectively.
 * The user can configure multiple clauses and clause sets with the AND/OR logic operator.
 * Every clause includes:
 *   field selector, operator selector, (data) source type selector with the default input style.
 *   Additional options: case sensitive and more input settings, with the latter including no user input, display label and ask for values options.
 *
 * ```ts
 * import { SqlExpressionBuilder } from 'jimu-ui/advanced/sql-expression-builder'
 * ```
 */
export declare const SqlExpressionBuilder: import("@emotion/styled").StyledComponent<Omit<SqlExpressionBuilderProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default SqlExpressionBuilder;
