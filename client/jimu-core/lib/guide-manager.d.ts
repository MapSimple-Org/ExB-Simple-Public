import type { Steps } from 'jimu-ui/basic/lib/guide';
import type * as React from 'react';
import { type I18nMessages } from './i18n';
import { GuideTypes, type WidgetManifest } from './types/manifest';
type GuideComponent = React.ComponentType<any>;
interface GuideComponentWithProps {
    guide?: GuideComponent;
    steps?: Steps;
    messages?: I18nMessages;
}
/**
 * The `guideLevel` property specifies the level of the guide that is being defined.
 * - 'COMMON': Indicates that the guide is generic and can be referenced or used by other guides.
 * - 'WIDGET': Indicates that the guide is specific to a widget.
 * - 'TEMPLATE': Indicates that the guide is specific to a template.
 * - 'APP': Indicates that the guide is specific to an app.
 * - 'BUILDER': Indicates that the guide is specific to the builder.
 */
export declare enum GuideLevels {
    Common = "COMMON",
    Widget = "WIDGET",
    Template = "TEMPLATE",
    App = "APP",
    Builder = "BUILDER"
}
export interface Guide {
    id: string;
    steps?: Steps;
    type?: GuideTypes;
    level?: GuideLevels;
    uri?: string;
    module?: GuideComponent;
    isInjected?: boolean;
    messages?: I18nMessages;
    ref?: React.RefObject<any>;
}
export declare const PRELOAD_GUIDES: {
    'insert-widget': string;
    'ds-selection': string;
    'guide-component': string;
    'opening-tour': string;
    'general-express-mode': string;
    'express-welcome-introduction': string;
    'express-add-data': string;
    'express-app-setting': string;
    'express-general-setting': string;
    'express-map-widget': string;
    'express-message-action': string;
    'express-placeholder': string;
    'express-section': string;
    'express-theme': string;
    'express-title': string;
    'express-widget-controller': string;
    'express-window': string;
    'express-sidebar': string;
    'express-grid': string;
};
export default class GuideManager {
    private readonly guides;
    private static instance;
    private guideTriggerRef;
    static getInstance(): GuideManager;
    protected getAppConfig(): import("seamless-immutable").ImmutableObject<import("jimu-core").AppConfig>;
    /**
     * Gets the URI for the guide module based on the provided configuration.
     *
     * @param {Guide} guide - The configuration object for the guide.
     * @returns {string} - The URI for the guide module.
     */
    getModuleUri(guide: Guide): string;
    /**
     * Loads the guide module with the provided configuration.
     *
     * @param {Guide} guide - The configuration object for the guide.
     * @returns {Promise<GuideComponentWithProps>} - The guide component with props.
     */
    loadGuideModule(guide: Guide): Promise<GuideComponentWithProps>;
    /**
     * Replaces the image source paths in the given steps with the provided assets path.
     *
     * @param {Steps} steps - The steps to process.
     * @param {string} assetsPath - The base path to prepend to the image source paths.
     * @returns {Steps} - The steps with updated image source paths.
     */
    replaceStepsAssetsPath(steps: Steps, assetsPath: string): Steps;
    /**
     * @ignore
     * Do not load the default string messages
     */
    loadGuideTranslation(uri: string, translatedLocales?: string[]): Promise<I18nMessages>;
    /**
     * Loads the widget translation based on the provided URI.
     * @param {string} uri - The URI of the widget.
     * @returns {Promise<any>} - The widget translation.
     */
    loadWidgetTranslationByUri(uri: string): Promise<I18nMessages>;
    /**
     * Loads the widget translation based on the provided URI and manifest.
     * @param uri string The URI of the widget.
     * @param manifest WidgetManifest The manifest of the widget.
     * @param locale string The locale to load.
     * @returns Promise<I18nMessages> The loaded translation messages.
     */
    loadWidgetTranslation(uri: string, manifest: WidgetManifest, locale?: string): Promise<I18nMessages>;
    /**
     * Registers a guide module with the configuration provided.
     * @param {GuideComponent} guideModule - The guide module to register.
     */
    registerGuide(guide: Guide): Promise<Guide>;
    /**
     * Gets the guide with the provided ID.
     *
     * @param {string} guideId - The ID of the guide to get.
     * @returns {Guide} - The guide with the provided ID.
     */
    getGuideById(guideId: any): Guide;
    /**
     * Destroys a guide.
     *
     * @param {string} guideId - The ID of the guide to be destroyed.
     */
    destroyGuide(guideId: string): void;
    /**
     * Starts a guide based on the provided configuration.
     *
     * @param guide - The configuration object for the guide.
     * @param shouldCheckGuideDisplay - A flag indicating whether the guide should be checked to determine if it needs to be displayed.
     * @param ref - The trigger element ref to focus after guide closes.
     */
    startGuide(guide: Guide, shouldCheckGuideDisplay?: boolean, ref?: React.RefObject<any>): Promise<void>;
    /**
     * Determines whether the guide needs to be displayed.
     *
     * @param {Guide} guide - The configuration object for the guide.
     * @returns {Promise<boolean>} - A boolean value indicating whether the guide should be displayed.
     */
    shouldShowGuide(guide: Guide): Promise<boolean>;
    /**
     * Stops the guide.
     */
    stopGuide(): void;
    /**
     * Shows the template guide based on the current app configuration.
     */
    showTemplateGuide(): Promise<void>;
    /**
     * Loads the guide for the provided template name and type.
     *
     * @param {string} templateName - The name of the template.
     * @param {string} templateType - The type of the template.
     * @returns {Promise<Guide>} - The guide for the provided template name and type.
     */
    loadTemplateGuide(templateName: string, templateType: string): Promise<Guide>;
    /**
     * Store whether the guide should be shown or not for the next time.
     * Store guide (exclude common guide modules) viewed in user resource (app) or local storage (others).
     * @param {Guide} guide - The guide to be stored.
     * @returns {Promise<void>}
     */
    updateGuideViewedStatus(guide: Guide, show?: boolean): Promise<void>;
}
export {};
