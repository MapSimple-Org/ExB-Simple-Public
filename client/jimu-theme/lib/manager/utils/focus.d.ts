import type { CSSObject } from '../../__emotion__';
interface FocusStyles {
    color: string;
    width: string | number;
    offset: string | number;
}
export declare const getFocusStyles: (focusedStyles: FocusStyles, prefix?: string) => CSSObject;
export {};
