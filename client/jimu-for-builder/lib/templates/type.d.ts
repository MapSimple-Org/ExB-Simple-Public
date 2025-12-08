import type { GuideTypes, AppConfig } from 'jimu-core';
export declare enum TemplateType {
    Block = "block",
    Grid = "grid-widget",
    Header = "header",
    Footer = "footer",
    FullScreenPage = "full-screen-page",
    FullScreenGridPage = "full-screen-grid-page",
    ScrollingPage = "scrolling-page",
    Window = "window",
    ScreenGroup = "screen-group",
    Screen = "screen",
    App = "app"
}
export type TemplateTagType = 'Blank' | 'WAB classic' | 'Map centric' | 'Dashboard' | 'Web page' | 'Website' | 'Fullscreen' | 'Fullscreen grid' | 'Scrolling' | 'Multipage';
export interface Template {
    name: string;
    type: TemplateType;
    /**
     * A template config is a sub-set of app config.
     * For example, a page template must have one page only, and a header template must have header config only.
     */
    config?: Partial<AppConfig>;
    configUrl: string;
    /** the thumbnail file name  */
    thumbnail: string;
    gifThumbnail: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    flipThumbnail: boolean;
    notSupportAGOL: boolean;
    label?: string;
    description?: string;
    i18nLabel: {
        [locale: string]: string;
    };
    i18nDescription: {
        [locale: string]: string;
    };
    /** the guide props
     * @ignore
     * This indicates whether a guide is available for the template.
     * If true, the guide will be displayed upon rendering if the app is created from the template.
     */
    hasGuide: boolean;
    guideType: GuideTypes;
    isMultiplePage: boolean;
    isMapAware: boolean;
    tags: TemplateTagType[];
    categoriesTags: TemplateTagType[];
    capabilities: {
        [locale: string]: string[];
    };
    widgetId?: string;
    sectionId?: string;
    pageId?: string;
    screenGroupId?: string;
    templateCreateVersion?: string;
}
export type TemplatesInfo = {
    [templateType in TemplateType]: Template[];
};
