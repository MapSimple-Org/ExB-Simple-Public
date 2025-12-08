/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape, type IMSqlExpression, type DataSource, type SqlExpressionMode } from 'jimu-core';
/**
 * The SqlExpressionBuilderPopup component props.
 */
export interface SqlExpressionBuilderPopupProps {
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
     * Whether the popup is open.
     */
    isOpen: boolean;
    /**
     * Callback fired when when toggling the popup.
     */
    toggle: (isOpen?: boolean) => void;
    /**
     * Callback fired when the popup is closed and SQL expressions are changed.
     */
    onChange: (expression: IMSqlExpression) => void;
    /**
     * @ignore
     */
    className?: string;
}
interface State {
    isValid: boolean;
    isOpen: boolean;
    expression: IMSqlExpression;
}
/**
 * @ignore
 */
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
 * A component that provides a modal to get `sql` and `displaySQL` to query and display a certain data source, respectively.
 * The user can configure multiple clauses and clause sets with the AND/OR logic operator.
 * Every clause includes:
 *   field selector, operator selector, (data) source type selector with the default input style.
 *   Additional options: case sensitive and more input settings, with the latter including no user input, display label and ask for values options.
 *
 * ```ts
 * import { SqlExpressionBuilderPopup } from 'jimu-ui/advanced/sql-expression-builder'
 * ```
 */
export declare class _SqlExpressionBuilderPopup extends React.PureComponent<SqlExpressionBuilderPopupProps & ExtraProps & IntlProps, State, {
    isOpen: boolean;
}> {
    headerRef: any;
    externalDsStyle: {
        maxWidth: string;
    };
    constructor(props: any);
    componentDidUpdate(prevProps: SqlExpressionBuilderPopupProps, prevState: State): void;
    handleToggle: (isDisplay: boolean | undefined) => void;
    handleOkBtn: () => void;
    handleCancelBtn: () => void;
    onModalClose: () => void;
    i18nMessage: (id: string) => string;
    onChange: (expression: IMSqlExpression) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * A component that provides a modal to get `sql` and `displaySQL` to query and display a certain data source, respectively.
 * The user can configure multiple clauses and clause sets with the AND/OR logic operator.
 * Every clause includes:
 *   field selector, operator selector, (data) source type selector with the default input style.
 *   Additional options: case sensitive and more input settings, with the latter including no user input, display label and ask for values options.
 *
 * ```ts
 * import { SqlExpressionBuilderPopup } from 'jimu-ui/advanced/sql-expression-builder'
 * ```
 */
export declare const SqlExpressionBuilderPopup: React.ForwardRefExoticComponent<Pick<Omit<SqlExpressionBuilderPopupProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof SqlExpressionBuilderPopupProps> & {
    theme?: IMThemeVariables;
}>;
export default SqlExpressionBuilderPopup;
