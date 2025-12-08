import type { SharedThemeVariables } from '../types/theme';
interface SharedThemeElementJson {
    text?: string;
    background?: string;
    link?: string;
}
export interface SharedThemeJson {
    logo?: {
        small?: string;
        link?: string;
    };
    fonts?: {
        base?: {
            url?: string;
            family?: string;
        };
        heading?: {
            url?: string;
            family?: string;
        };
    };
    header?: SharedThemeElementJson;
    body?: SharedThemeElementJson;
    button?: SharedThemeElementJson;
}
/**
 * Get mapped theme variables from an shared theme json.
 */
export declare const createSharedThemeVariables: (sharedThemeJson: SharedThemeJson) => SharedThemeVariables;
export {};
