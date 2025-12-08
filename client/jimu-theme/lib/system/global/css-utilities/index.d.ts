import type { Theme } from '../../create-theme';
interface CssUtilitiesProviderProps {
    theme?: Theme;
}
export declare const CssUtilitiesProvider: (props: CssUtilitiesProviderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const classesUtils: {
    colorsUtilities: (colors: import("../..").ColorScheme) => {
        [x: string]: any;
    };
    borderColorUtilities: (theme: Theme) => {
        [x: string]: any;
    };
    spacingUtilities: (spacing: import("../..").Spacing) => {};
    shadowUtilities: (inputShadows: import("../..").Shadow) => {};
    shapeUtilities: <T extends object>(shape: T) => {
        '.rounded-0': {
            borderRadius: string;
        };
        '.rounded-circle': {
            borderRadius: string;
        };
        '.rounded-pill': {
            borderRadius: string;
        };
    };
    typographyUtilities: <T extends object>(typography: T) => {};
};
export {};
