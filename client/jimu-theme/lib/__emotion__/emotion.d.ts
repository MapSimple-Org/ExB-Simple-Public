import { React, type IMThemeVariables } from 'jimu-core';
export { CacheProvider, EmotionThemeContext, styled as emotionStyled } from 'jimu-core/emotion';
/**
 * The Global component used to apply global styles.
 */
export { Global } from 'jimu-core/emotion';
export interface ThemeProviderProps {
    theme: IMThemeVariables | ((outerTheme: IMThemeVariables) => IMThemeVariables);
    children: React.ReactNode;
}
export declare const EmotionThemeProvider: (props: ThemeProviderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
