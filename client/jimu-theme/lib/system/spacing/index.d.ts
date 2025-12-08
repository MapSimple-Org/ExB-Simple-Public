type ThemeSpacingVariant = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export declare const ThemeSpacingVariants: ThemeSpacingVariant[];
/**
 * The options for the spacing of the jimu-theme.
 */
export type SpacingOptions = number | Spacing | ((abs: number) => number | string) | ((abs: number | string) => number | string) | ReadonlyArray<string | number>;
export type SpacingArgument = number | string;
type SpacingObj = {
    [variant in ThemeSpacingVariant]: string;
};
/**
 * The spacing function and variables.
 */
export interface Spacing extends SpacingObj {
    (): string;
    (value: number): string;
    (topBottom: SpacingArgument, rightLeft: SpacingArgument): string;
    (top: SpacingArgument, rightLeft: SpacingArgument, bottom: SpacingArgument): string;
    (top: SpacingArgument, right: SpacingArgument, bottom: SpacingArgument, left: SpacingArgument): string;
}
export declare function createUnarySpacing(theme: any): any;
declare const createSpacing: (spacingInput?: SpacingOptions) => Spacing;
export default createSpacing;
