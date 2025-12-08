import { SupportedUtilityType } from 'jimu-core';
import type { UtilityTreeItem } from 'jimu-ui/advanced/utility-selector';
export declare const predefinedOrgUtilities: ({
    name: string;
    type: SupportedUtilityType;
    dynamic?: undefined;
} | {
    name: string;
    dynamic: boolean;
    type: SupportedUtilityType;
})[];
export declare function extractService(helperServices: any, serviceTypes: any, keyword: any, pattern: any, translate: any): UtilityTreeItem[];
export declare function isUtilityMatch(item: {
    url: string;
    label: string;
    type: SupportedUtilityType;
}, serviceTypes: SupportedUtilityType[], keyword?: string, pattern?: RegExp): boolean;
