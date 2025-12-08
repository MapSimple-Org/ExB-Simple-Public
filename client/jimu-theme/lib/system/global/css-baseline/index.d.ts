import { type ArrayCSSInterpolation } from '../../../__emotion__';
import type { Theme } from '../../create-theme';
export declare const getThemeBaselineStyles: (theme: Theme) => ArrayCSSInterpolation;
interface CssBaselineProps {
    theme?: Theme;
}
export declare const CssBaseline: (props: CssBaselineProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
