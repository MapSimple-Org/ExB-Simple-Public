import type { Theme } from '../../create-theme';
interface CssVarsProviderProps {
    theme?: Theme;
    appliedClassName?: string;
}
export declare const CssVarsProvider: (props: CssVarsProviderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
