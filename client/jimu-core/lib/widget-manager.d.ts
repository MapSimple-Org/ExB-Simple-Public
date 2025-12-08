import * as React from 'react';
import type { IMWidgetJson, WidgetJson, AppConfig } from './types/app-config';
import type { WidgetManifest } from './types/manifest';
import type { WidgetProps } from './types/props';
import type { RawWidgetType, WrappedWidgetType, WidgetUpgradeInfo } from './base-widget';
import DataSourceManager from './data-source-manager';
import { type I18nMessages } from './i18n';
import type { BaseVersionManager } from './version-manager';
export declare class WidgetManager {
    private static instance;
    /** Return the singleton `WidgetManager` instance. */
    static getInstance(): WidgetManager;
    dsManager: DataSourceManager;
    constructor();
    private widgets;
    updateWidgetCache(uri: string, obj: any): void;
    getWidgetClass(widgetId: string): React.ComponentType<WidgetProps>;
    getWidgetClassByUri(widgetUri: string): React.ComponentType<WidgetProps>;
    getWidgetI18nMessagesByUri(widgetUri: string): I18nMessages;
    destroyWidget(widgetId: string): void;
    destroyWidgetByUri(uri: string): void;
    destroyAllWidgets(): void;
    private checkWidgetUriInConfig;
    /** Load the widget class by widget id. A widget class is loaded only one time. */
    loadWidgetClass(widgetId: string): Promise<React.ComponentType<WidgetProps>>;
    upgradeWidgetByUri(widgetUri: string, versionManager?: BaseVersionManager): Promise<void>;
    upgradeWidget(widgetJson: IMWidgetJson, versionManager?: BaseVersionManager): Promise<WidgetUpgradeInfo>;
    loadWidgetClassByUri(widgetUri: string): Promise<React.ComponentType<WidgetProps>>;
    loadRawClass(uri: string): Promise<RawWidgetType>;
    /**
     * @ignore
     * Do not load the default string messages
     */
    loadWidgetTranslation(uri: string, locale?: string): Promise<I18nMessages>;
    resetWidgetI18nMessages(uri: string): void;
    openWidget(widgetId: string): void;
    closeWidget(widgetId: string): void;
    appWidgetClassWrapperExtension(WidgetClass: React.ComponentType<WidgetProps>, manifest: WidgetManifest): React.ComponentType<WidgetProps>;
    /**
     * @ignore
     * @param widgetJson Only `uri` is required
     */
    handleNewWidgetJson(widgetJson: WidgetJson): Promise<WidgetJson>;
    getWidgetUriByItemId(itemId: string): Promise<string>;
    /**
     * Load widget manifest is the first step to load a widget.
     * If a widget has an itemId instead of an uri, need to call `getWidgetUriByItemId` first.
     *
     * @param uri The uri used to load widget
     * @param checkUri If a widget has an itemId, the uri has been checked in `getWidgetUriByItemId`, so there is no need to check here.
     *                 If a widget has an uri, we need to check it here.
     */
    loadWidgetManifest(uri: string, checkUri: boolean): Promise<WidgetManifest>;
    processWidgetManifest(widgetJson: WidgetJson): Promise<WidgetManifest>;
    /**
     * @ignore
     * Register widget message actions, data actions and extensions declared in the widget manifest.
     * @param widgetJson
     * @param appConfig Pass appConfig only when the first time load.
     */
    registerManifestProps(widgetJson: IMWidgetJson, appConfig?: AppConfig): Promise<void>;
    unRegisterManifestProps(widgetId: string): void;
    loadWidgetDefaultConfig(uri: string): Promise<any>;
    loadWidgetDependency(uri: string): Promise<void>;
    injectWidgetProps(uri: string): Promise<WrappedWidgetType>;
    private loadWidgetBuilderSupportModules;
    private onStoreChange;
    private onStoreSectionChange;
    private onAppI18nMessagesChange;
}
/**
 * The `WidgetManager` is used to manage the widget.
 */
export default WidgetManager;
