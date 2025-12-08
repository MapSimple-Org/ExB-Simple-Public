import { React, type IMThemeVariables } from 'jimu-core';
export interface ThemeProviderProps {
    /**
     * Theme variable for the current iframe.
     */
    theme: IMThemeVariables;
    /**
     * The theme variable for another iframe.
     * In the app-in-builder env, this variable points to the builder.
     * In the builder env, this variable points to the app.
     * In a single app env, this variable is null.
     */
    theme2?: IMThemeVariables;
    /**
     * The children of this component
     */
    children: React.ReactNode;
}
export declare const UseTheme2Context: React.Context<boolean>;
export declare const Theme2Context: React.Context<IMThemeVariables>;
export declare const ThemeProvider: (props: ThemeProviderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * Whether to use theme2.
 * @internal
 */
export declare const useUseTheme2: () => boolean;
/**
 * A React hook that provides the current theme as its value.
 * If the theme is updated, the child component will be re-rendered accordingly.
 * @example
 * ```tsx
 * import { css } from 'jimu-core'
 * import { useTheme } from 'jimu-theme'
 *
 * const MyComponent = () => {
 *   const theme = useTheme()
 *
 *   return (
 *     <div css={css({ backgroundColor: theme.sys.color.surface.paper })}>
 *       Hello World
 *     </div>
 *   )
 * }
 * ```
 */
export declare const useTheme: (useDefaultTheme?: boolean) => IMThemeVariables;
/**
 * A React hook that provides the theme2 as its value.
 * If the theme is updated, the child component will be re-rendered accordingly.
 * @internal
 */
export declare const useTheme2: () => IMThemeVariables;
/**
 * A React hook that get all theme values.
 * @internal
 */
export declare const useMultiThemeValue: () => {
    theme: IMThemeVariables;
    theme2?: IMThemeVariables;
    useTheme2: boolean;
};
