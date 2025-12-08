import { type IconResult } from "jimu-core";
export declare const uploadedIconsWidgetId = "icon-picker-in-setting";
export declare function compareSvg(a: string, b: string): boolean;
export declare function compareIcons(a: IconResult, b: IconResult): boolean;
export declare function getInUseIconFilenames(cachedIcons: {
    [key: string]: IconResult;
}): string[];
export declare function isIconExist(icon: IconResult, cachedIcons: {
    [key: string]: IconResult;
}, customIcons: IconResult[]): boolean;
