import type { CapabilityItem } from './index';
export declare function getValueOfCapabilities(capabilities: {
    [locale: string]: string[];
}, index: any, locale: string): any[];
export declare function removeDuplicateCapabilities(arr: any): any[];
/**
 * This function checks if the template's tags include all the capabilities provided.
 * For App templates, the type of capabilities is CapabilityItem[].
 * For other templates, the type of capabilities is string[].
 */
export declare function filterTemplateWithCapabilities(itemInfo: any, capabilities?: CapabilityItem[] | string[]): boolean;
