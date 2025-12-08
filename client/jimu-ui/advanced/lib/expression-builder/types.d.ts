import type { ImmutableArray, ImmutableObject, UseDataSource, Expression, JimuFieldType } from 'jimu-core';
export declare enum ExpressionBuilderType {
    Attribute = "ATTRIBUTE",
    Statistics = "STATISTICS",
    Expression = "EXPRESSION"
}
declare enum OtherExpressionInputType {
    Arcade = "ARCADE",
    Static = "STATIC"
}
export declare const ExpressionInputType: {
    Arcade: OtherExpressionInputType.Arcade;
    Static: OtherExpressionInputType.Static;
    Attribute: ExpressionBuilderType.Attribute;
    Statistics: ExpressionBuilderType.Statistics;
    Expression: ExpressionBuilderType.Expression;
};
export type ExpressionInputType = OtherExpressionInputType | ExpressionBuilderType;
/**
 * Props of expression builder component.
 */
export interface ExpressionBuilderProps {
    /**
     * Widget's `useDataSources`, which means data sources that widget is using.
     * Will use these data source to build expression.
     */
    useDataSources: ImmutableArray<UseDataSource>;
    /**
     * Expression you want to show in the builder.
     */
    expression: Expression | ImmutableObject<Expression>;
    /**
     * The builder contains three tabs, pass in `types` to show some of the tabs.
     * `ExpressionBuilderType` is enum type.
     *
     * ```ts
     * import { ExpressionBuilderType } from 'jimu-ui/advanced/expression-builder'
     * ```
     */
    types: ImmutableArray<ExpressionBuilderType>;
    /**
     * Id of widget.
     * Use widget id to get widget context, e.g. whether widget is in a repeated data source context.
     */
    widgetId?: string;
    /**
     * Field types in attribute tab.
     */
    fieldTypes?: ImmutableArray<JimuFieldType>;
    /**
     * @ignore
     */
    className?: string;
    /**
     * @ignore
     */
    style?: React.CSSProperties;
    /**
     * Will call the function when click a field or click insert button.
     */
    onChange: (expression: Expression) => void;
}
export {};
