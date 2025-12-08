/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape, type DataSource, type IMGroupSqlExpression } from 'jimu-core';
/**
 * The GroupSqlExpressionBuilderPopup component props.
 */
export interface GroupSqlExpressionBuilderPopupProps {
    /**
     * Immutable group SQL expression.
     */
    expression: IMGroupSqlExpression;
    /**
     * Data source list.
     * Feature layers, feature layers inside web maps, and feature service URLs are supported.
     */
    dataSources: DataSource[];
    /**
     * Whether the popup is open.
     */
    isOpen: boolean;
    /**
     * Callback fired when when toggling the popup.
     */
    toggle: (isOpen?: boolean) => void;
    /**
     * Callback fired when the popup is closed and SQL expression is changed.
     */
    onChange: (expression: IMGroupSqlExpression) => void;
    /**
     * @ignore
     */
    className?: string;
}
interface State {
    isValid: boolean;
    isOpen: boolean;
    expression: IMGroupSqlExpression;
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
export declare class _GroupSqlExpressionBuilderPopup extends React.PureComponent<GroupSqlExpressionBuilderPopupProps & ExtraProps & IntlProps, State, {
    isOpen: boolean;
}> {
    headerRef: any;
    externalModalStyle: {
        maxWidth: string;
        minHeight: string;
    };
    constructor(props: any);
    componentDidUpdate(prevProps: GroupSqlExpressionBuilderPopupProps, prevState: State): void;
    handleToggle: (isDisplay: boolean | undefined) => void;
    handleOkBtn: () => void;
    handleCancelBtn: () => void;
    onModalClose: () => void;
    i18nMessage: (id: string) => string;
    onChange: (expression: IMGroupSqlExpression) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const GroupSqlExpressionBuilderPopup: React.ForwardRefExoticComponent<Pick<Omit<GroupSqlExpressionBuilderPopupProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof GroupSqlExpressionBuilderPopupProps> & {
    theme?: IMThemeVariables;
}>;
export default GroupSqlExpressionBuilderPopup;
