export declare const lowercaseFirstLetter: (string: any) => any;
export declare const uppercaseFirstLetter: (string: any) => any;
export declare const decamelize: (str: string, separator?: string) => string;
export declare const isEmptyObj: (obj: any) => boolean;
export declare function isPlainObject(item: unknown): boolean;
interface DeepmergeOptions {
    clone?: boolean;
}
export declare const deepmerge: <T>(target: any, source: unknown, options?: DeepmergeOptions) => T;
export declare function getPath(obj: any, path: any): any;
/**
 * Normalize the key of css vars and css classes.
 * @example normalizeKey('shape', 'shape-1') => '1'
 */
export declare const normalizeKey: (parentKey: string, key: string) => string;
export declare const normalizeFontFamily: (fontFamily: string) => string;
export declare const getMainFontFamily: (fontFamily: string) => string;
export {};
