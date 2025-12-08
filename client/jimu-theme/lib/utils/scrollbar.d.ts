import type { CSSObject } from '../__emotion__';
interface ScrollbarStyle {
    thumb: string;
    thumbHover?: string;
    track: string;
}
/**
 * get the scrollbar styles based on the theme
 */
export declare const getScrollbarStyles: (props: ScrollbarStyle, prefix?: string) => CSSObject;
export {};
