import type { ThemeNav, ThemePagination, ThemeNavButtonGroup, ThemeSlider, ThemePaper } from '../types/theme';
export declare const getButtonStyles: (props: any, vars: any) => {};
export declare const getNavStyles: (props: any, vars: ThemeNav) => any[];
export declare const getNavButtonGroupStyles: (props: any, vars: ThemeNavButtonGroup) => any[];
export declare const getPaginationStyles: (props: any, vars: ThemePagination) => any[];
export declare const getSliderStyles: (props: any, sliderVars: ThemeSlider, isRTL?: boolean) => any[];
export declare const getPaperStyles: (props: any, vars?: ThemePaper) => {
    boxShadow: string;
    paddingLeft: import("../types/theme").ThemeSize;
    paddingRight: import("../types/theme").ThemeSize;
    paddingTop: import("../types/theme").ThemeSize;
    paddingBottom: import("../types/theme").ThemeSize;
    border: string;
    color: string;
    background: string;
};
