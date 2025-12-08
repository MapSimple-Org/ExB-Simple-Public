import { SupportedUtilityType } from 'jimu-core';
export declare function getLabelOfUrl(url: string): string;
export declare function isGPServer(url: string): boolean;
export declare function isValidUtilityUrl(url: string): boolean;
export declare function checkServiceType(url: string, forceLogin?: boolean): Promise<{
    type: SupportedUtilityType;
    info: any;
}>;
