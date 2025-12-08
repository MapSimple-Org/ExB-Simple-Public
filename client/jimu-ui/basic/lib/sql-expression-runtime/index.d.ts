/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape, type DataSource, type SqlClause, type IMSqlExpression, type SqlClauseSet, QueryScope } from 'jimu-core';
import { InputEditorRender, type InputEditorProps } from './components/common/input-editor-render';
import { ClauseInputEditor } from './components/common/default';
export { InputEditorRender, type InputEditorProps, ClauseInputEditor };
/**
 * The SqlExpressionRuntime component props
 */
export interface SqlExpressionRuntimeProps {
    /**
     * Immutable SQL expression.
     */
    expression: IMSqlExpression;
    /**
     * The selected data source.
     * Feature layers, feature layers used in web maps, and feature service URLs are supported.
     */
    dataSource: DataSource;
    /**
     * Decide the scope of the data source's filters when source type is unique or multiple.
     * @default IN_RUNTIME_VIEW
     * @ignore
     */
    queryScope?: QueryScope;
    /**
     * This is used to exclude filters of the current widget.
     * Valid when queryScope is `IN_RUNTIME_VIEW`.
     */
    widgetId: string;
    /**
     * Callback fired when SQL expressions are changed.
     */
    onChange: (sqlExprObj: IMSqlExpression) => void;
    /**
     * @ignore
     */
    className?: string;
    /**
     * @ignore
     */
    style?: React.CSSProperties;
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
/**
 * A component for end users to execute filters at runtime.
 * It supports filter functionality in widgets to display and customize the ask-for-value filters configured by SQL expression builder in the setting.
 *
 * ```ts
 * import { SqlExpressionRuntime } from 'jimu-ui/basic/sql-expression-runtime'
 * ```
*/
export declare class _SqlExpressionRuntime extends React.PureComponent<SqlExpressionRuntimeProps & ExtraProps & IntlProps> {
    isHosted: boolean;
    constructor(props: any);
    i18nMessage: (id: string) => string;
    onChange: (clause: SqlClause | SqlClauseSet, id: string) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * A component for end users to execute filters at runtime.
 * It supports filter functionality in widgets to display and customize the ask-for-value filters configured by SQL expression builder in the setting.
 *
 * ```ts
 * import { SqlExpressionRuntime } from 'jimu-ui/basic/sql-expression-runtime'
 * ```
*/
export declare const SqlExpressionRuntime: React.ForwardRefExoticComponent<Pick<Omit<SqlExpressionRuntimeProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof SqlExpressionRuntimeProps> & {
    theme?: IMThemeVariables;
}>;
export default SqlExpressionRuntime;
