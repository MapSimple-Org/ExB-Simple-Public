/** @jsx jsx */
import { React, type ImmutableArray, type Expression, type IntlShape, type ImmutableObject, type UseDataSource } from 'jimu-core';
import type { ExpressionBuilderProps } from '../../types';
import { ExpressionBuilderType } from '../../types';
/**
 * Props of expression builder component.
 */
export type { ExpressionBuilderProps };
interface ExtraProps {
    /**
     * @ignore
     */
    intl: IntlShape;
}
interface State {
    activeTab: ExpressionBuilderType;
    content: React.ReactElement;
}
/**
 * The `ExpressionBuilder` component allows users to build an Expression.
 *
 * ```ts
 * import { ExpressionBuilder } from 'jimu-ui/advanced/expression-builder'
 * ```
 */
export declare class _ExpressionBuilder extends React.PureComponent<ExpressionBuilderProps & ExtraProps, State> {
    expressionFrom: {
        ATTRIBUTE: string;
        STATISTICS: string;
        EXPRESSION: string;
    };
    constructor(props: any);
    componentDidUpdate(prevProps: ExpressionBuilderProps & ExtraProps, prevState: State): void;
    onChange: (e: Expression) => void;
    getActiveExpressionFrom: (expression: Expression | ImmutableObject<Expression>, types: ImmutableArray<ExpressionBuilderType>) => ExpressionBuilderType;
    getTabsContent: (types: ImmutableArray<ExpressionBuilderType>, activeTab: ExpressionBuilderType, useDataSources: ImmutableArray<UseDataSource>, expression: Expression | ImmutableObject<Expression>) => import("@emotion/react/jsx-runtime").JSX.Element;
    getSingleTab: (tab: ExpressionBuilderType, isActive: boolean, useDataSources: ImmutableArray<UseDataSource>, expression: Expression | ImmutableObject<Expression>) => import("@emotion/react/jsx-runtime").JSX.Element;
    onActiveTabChange: (types: ExpressionBuilderType) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * This component is used to build an {@link Expression}.
 */
declare const ExpressionBuilder: React.FC<import("react-intl").WithIntlProps<ExpressionBuilderProps & {
    intl: IntlShape;
}>> & {
    WrappedComponent: React.ComponentType<ExpressionBuilderProps & {
        intl: IntlShape;
    }>;
};
export default ExpressionBuilder;
