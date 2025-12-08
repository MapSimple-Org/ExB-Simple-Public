import type { CompRootStyle } from './type';
/**
 * Register the style function of the component, it will be used with `withStyles`.
 * @param name
 * @param style
 * @internal
 */
export declare const registerStyle: (name: string, style: CompRootStyle) => void;
/**
 * Register the style function of the components in one entry, it will be used with `withStyles`.
 * @param entry
 * @internal
 */
export declare const registerStyles: (entry: string, styles: {
    [component: string]: CompRootStyle;
}) => void;
/**
 * Get the basic style function of the specified component.
 * @param component
 * @param useTheme2
 * @internal
 */
export declare const getRegisteredStyle: (component: string, showWarning?: boolean) => CompRootStyle;
