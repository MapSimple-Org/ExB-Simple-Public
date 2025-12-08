import * as React from 'react';
import { i18n } from 'jimu-core';
import type { WidgetItemSettingProps } from './props';
import type { RawWidgetSettingType, WrappedWidgetSettingType } from './base-widget-setting';
export declare class WidgetSettingManager {
    static instance: WidgetSettingManager;
    /** Return the singleton `WidgetSettingManager` instance. */
    static getInstance(): WidgetSettingManager;
    constructor();
    private settings;
    private getWidgetUri;
    private getWidgetManifestByUri;
    updateWidgetCache(uri: string, obj: any): void;
    getWidgetSettingClass(widgetId: string): WrappedWidgetSettingType;
    destroyWidgetSettingClass(widgetId: string): void;
    destroyWidgetSettingClassByUri(uri: string): void;
    getItemSettingClass(widgetId: string): React.ComponentClass<WidgetItemSettingProps, any>;
    getSettingI18nMessagesByUri(widgetUri: string): i18n.I18nMessages;
    destroyAllWidgetSettingClasses(): void;
    /** Load the widget setting class by widget id. A widget setting class is loaded only one time. */
    loadWidgetSettingClass(widgetId: string): Promise<WrappedWidgetSettingType>;
    private checkWidgetUriInConfig;
    private loadWidgetSettingClassByUri;
    loadRawSettingClass(uri: string): Promise<RawWidgetSettingType>;
    loadI18nMessagesForSetting(uri: string): Promise<i18n.I18nMessages>;
    loadWidgetSettingDependency(uri: string): Promise<void>;
    loadItemSettingClass(widgetId: string): Promise<React.ComponentClass<WidgetItemSettingProps>>;
    private loadItemSettingClassByUri;
    loadRawItemSettingClass(uri: any): Promise<React.ComponentClass<WidgetItemSettingProps>>;
    injectWidgetSettingProps(uri: string): WrappedWidgetSettingType;
    private onStoreChange;
}
/**
 * The `WidgetSettingManager` is used to manage the widget setting.
 */
export default WidgetSettingManager;
