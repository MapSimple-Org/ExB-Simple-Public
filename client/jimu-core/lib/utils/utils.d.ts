import { isEqual as isDeepEqual, get as getValue } from 'lodash-es';
import { type Size, BrowserSizeMode } from '../types/common';
import type { IMAppConfig, IMFieldSchema } from '../types/app-config';
import type { ImmutableArray } from 'seamless-immutable';
import type { IntlShape } from 'react-intl';
import type { IMState } from '../types/state';
import type { AppInfo } from '../types/app-info';
import type * as jimuThemeModule from 'jimu-theme';
import type * as jimuUiModule from 'jimu-ui';
import type { IGeometry, GeometryType } from '@esri/arcgis-rest-request';
export { getValue, isDeepEqual };
type WidgetPanelCallBack = 'onOpen' | 'onClose' | 'onActive' | 'onDeActive';
export declare enum AppHigherVersionStateType {
    None = "None Version Heigher",
    Draft = "Draft Version Heigher",
    Published = "Published Version Heigher",
    Both = "Both Version Heigher"
}
export declare function getGeometryType(geom: IGeometry): GeometryType;
export declare function getGeometryService(): string;
export declare function getWidgetCallbackNamesFromWidgetState(widgetState: any, prevWidgetState: any): WidgetPanelCallBack[] | WidgetPanelCallBack;
export declare function getPanelCallbackNamesFromPanelState(panelState: any, prevPanelState: any): WidgetPanelCallBack[] | WidgetPanelCallBack;
export declare function isTouchDevice(): boolean;
export declare function isInIFrame(): boolean;
export declare function getBrowserSizeMode(size: Size): BrowserSizeMode;
export declare function findViewportSize(appConfig: IMAppConfig, browserSizeMode: BrowserSizeMode): Size;
export declare function getSizeModeWidth(sizeMode: BrowserSizeMode): number;
export declare function loadstyle(url: string, beforeId?: string): Promise<unknown>;
export declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
/**
 * check whether the two array contain the same items, don't consider the order
 * @param arr1
 * @param arr2
 */
export declare function isArrayContainSameItems(arr1: string[], arr2: string[]): boolean;
export declare function isArrayContainSameItems(arr1: number[], arr2: number[]): boolean;
/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 */
export declare function hyphenateStyleName(name: any): any;
export declare function styleObjectToString(styles: any): string;
export declare function tryGet<T>(getFn: () => T, waitTime?: number, tryInterval?: number): Promise<T>;
/**
 * Please use this as the first part of the local storage key if you need to save something in local storage.
 */
export declare function getLocalStorageAppKey(): string;
export declare const getUID: () => string;
export declare const getUUID: () => string;
export declare const calculateDigits: (n: number) => number;
export declare const getOverlayUniqueId: (type: "popper" | "modal", overlays?: ImmutableArray<string> | string[]) => string;
/**
 * the i18n string use this format: ${key}
 * @param obj
 * @param intl
 * @param defaultMessages
 */
export declare function replaceI18nPlaceholdersInObject(obj: any, intl: IntlShape, defaultMessages: any): any;
/** Hide loading and show app */
export declare function showApp(): void;
/**
 * Get intl options from field schema
 * @param fieldSchema
 */
export declare const getIntlOption: (fieldSchema: IMFieldSchema) => Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
type MemorizeFunc = (Object: any) => any;
export declare function memoize(func: MemorizeFunc): MemorizeFunc;
/**
 * Get local storage keys
 */
export declare function readLocalStorageKeys(): string[];
/**
 * Read info by key from local storage.
 * @param key
 */
export declare function readLocalStorage(key: string): any;
/**
 * Set info by key to local storage.
 * @param key
 * @param value
 */
export declare function setLocalStorage(key: string, value: string): void;
export declare function checkAppHigherVersionState(appItem: AppInfo): AppHigherVersionStateType;
/**
 * Get session storage keys
 */
export declare function readSessionStorageKeys(): string[];
/**
 * Read info by key from session storage.
 * @param key
 */
export declare function readSessionStorage(key: string): any;
/**
 * Set info by key to session storage.
 * @param key
 * @param value
 */
export declare function setSessionStorage(key: string, value: string): void;
/**
   * Remvoe info by key from local storage.
   * @param key
   */
export declare function removeFromLocalStorage(key: string): void;
/**
 * Remvoe info by key from session storage.
 * @param key
 */
export declare function removeFromSessionStorage(key: string): void;
/**
 *
 * @param num
 * @param useGrouping Whether to use grouping separators, such as thousands separators or thousand/lakh/crore separators.
 * @returns
 */
export declare function formatNumber(num: number, useGrouping?: boolean): [string, string];
/**
 * AR -%10
 * TR -%10
 * HE -10%
 */
export declare function formatPercentageNumber(percentage: string): string;
export declare function formatPixelNumber(pixel: string): string;
export declare const getJimuThemeModule: () => typeof jimuThemeModule;
export declare const getJimuUiModule: () => typeof jimuUiModule;
/**
 * Iterate through all keys and values in a deeply nested object or array
 * Inherited properties are not included
 * @param obj object or array to iterate
 * @param callback callback function to perform on each value/keyPath pair
 * @param options.isAsync if true, the callback can be async function, and the iterateDeepObject will return a Promise
 * @param options.detectCircular if true, circular references will be detected and skipped
 */
export declare function iterateDeepObject<T>(obj: T, callback: (value: any, keyPath: Array<string | number>, key?: string | number, parent?: any) => Promise<void> | void, options?: {
    isAsync?: boolean;
    skipCircular?: boolean;
}): (T & object) | Promise<T & object>;
export interface Replacer {
    matcher: (val: string) => boolean;
    handler: (val: string) => string;
}
export declare function replaceStringInObject<T>(obj: T, replacer: Replacer): T;
/**
 * Check if the specified widget is selected
 * @param widgetId
 */
export declare const isWidgetSelected: (widgetId: string, state?: IMState) => boolean;
/**
 * Set ref value for function or object ref.
 * @param ref
 * @param value
 */
export declare const setRef: (ref: any, value: any) => void;
interface DiffArraysResult {
    /**
     * true means the two arrays have same elements.
     */
    isEqual: boolean;
    /**
     * The added elements of the new array compared to the old array.
     */
    added: string[];
    /**
     * The deleted elements of the new array compared to the old array.
     */
    deleted: string[];
    /**
     * The intersection elments of the new array compared to the old array.
     */
    saved: string[];
}
/**
 * Get the added, deleted and intersection elments of the new array compared to the old array.
 * Note, the result only includes unique elements.
 * e.g.
 * The result of diffArrays(true, ['a', 'b', 'c', 'd'], ['a', 'd', 'e', 'f']) is { isEqual: false, added:['e', 'f'], deleted: ['b', 'c'], saved: ['a', 'd'] }
 * The result of diffArrays(false, ['a', 'a', 'b', 'c', 'c', 'd'], ['a', 'd', 'e', 'f', 'f']) is { isEqual: false, added:['e', 'f', 'f'], deleted: ['a', 'b', 'c', 'c'], saved: ['a', 'd'] }
 * @param isUnique If true, duplicate elements will first be removed from oldArray and newArray respectively, and then the two arrays after deduplication will be compared.
 * @param oldArray old array
 * @param newArray new array
 */
export declare function diffArrays(isUnique: boolean, oldArray: string[], newArray: string[]): DiffArraysResult;
export declare function getParentWindow(): Window;
export declare function isExpressMode(): boolean;
/**
 * If the app is in builder, change the app config in app may cause inconsistency state between app and builder.
 * So, widget should call this method to change the app config.
 * @param appConfig
 */
export declare function changeAppConfig(appConfig: IMAppConfig): void;
export declare function wait(time: number): Promise<void>;
export * from './component-style-func';
