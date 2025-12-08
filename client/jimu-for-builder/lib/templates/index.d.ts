import { type AppConfig } from 'jimu-core';
import type { Template, TemplatesInfo, TemplateTagType } from './type';
import { TemplateType } from './type';
export interface CapabilityItem {
    label: string;
    value: string[];
}
export declare function init(): Promise<TemplatesInfo>;
export declare function getAppTemplates(searchText?: string, categoriesTags?: TemplateTagType[], capabilities?: CapabilityItem[]): Template[];
export declare function getTemplateCapabilities(templateType: TemplateType): CapabilityItem[];
export declare function getTemplateCapabilitiesOnlyInCurrentLocale(templateType: TemplateType): string[];
export declare function getTemplatesByCapabilityTags(templates: Template[], capabilities: string[]): Template[];
export declare function getFullScreenPageTemplates(includeBlankTemplate?: boolean): Template[];
export declare function getFullScreenGridPageTemplates(includeBlankTemplate?: boolean): Template[];
export declare function getScrollingPageTemplates(includeBlankTemplate?: boolean): Template[];
export declare function getFixedModalWindowTemplates(includeBlankTemplate?: boolean): Template[];
export declare function getFixedNonModalWindowTemplates(): Template[];
export declare function getAnchoredWindowTemplates(): Template[];
export declare function getWindowTemplates(includeBlankTemplate?: boolean): Template[];
export declare function getHeaderTemplates(): Template[];
export declare function getFooterTemplates(): Template[];
export declare function getBlockTemplates(): Template[];
export declare function getGridTemplates(): Template[];
export declare function getScreenGroupTemplates(): Template[];
export declare function getScreenTemplates(): Template[];
export * from './type';
export declare function getTemplateConfig(templateType: TemplateType, templateName: string): Promise<AppConfig>;
export declare function loadI18nMessage(): Promise<any>;
