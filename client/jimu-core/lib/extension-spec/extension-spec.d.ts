import type { AppConfig, IMAppConfig } from '../types/app-config';
import type { WidgetProps } from '../types/props';
import type { IMState } from '../types/state';
import type { Resource, DuplicateContext } from '../types/common';
import type { LayoutContextToolProps, LayoutTransformFunc, LayoutItemTransformFunc } from '../types/layout';
import type { WidgetManifest } from '../types/manifest';
import type { UnknownAction } from 'redux';
/**
 * Extension points allow a widget to run code at certain specific times of the Experience Builder application lifecycle.
 *
 * To add a extension in a widget, add the `extensions` in the widget's manifest.json file.
 *
 * The extension points supported by the Jimu framework are defined here.
 */
export declare enum ExtensionPoints {
    /**
     * This extension point gives widgets a opportunity to run code just after the app config is loaded.
     *
     * The extension for this extension point should implement the `AppConfigProcessorExtension` interface.
     * The `process()` method of the extension will be invoked with the loaded app config, and this method should return the processed app config.
     *
     */
    AppConfigProcessor = "APP_CONFIG_PROCESSOR",
    /**
     * @ignore
     * The extension for the `WidgetClassWrapper` extension point will be invoked after the widget class is loaded and core props have been injected.
     *
     * The class for this extension should implement the `IWidgetClassWrapperExtension` interface.
     */
    WidgetClassWrapper = "WIDGET_CLASS_WRAPPER",
    /**
     * @ignore
     * The `AppConfigService` extension point is used to get the config service, which is used to save and load the app config.
     *
     * The class for this extension should implement the `IAppConfigServiceExtension` interface.
     */
    AppConfigService = "APP_CONFIG_SERVICE",
    /**
     * A redux-based application has only one store. If a widget needs to use redux to manage its state, it can use the `ReduxStore` extension to extend the redux store.
     *
     * The extension for this extension point should implement the `ReduxStoreExtension` interface.
     */
    ReduxStore = "REDUX_STORE",
    /**
     * @ignore
     * The `ReduxActionInterceptor` extension point is used to intercept redux actions.
     * The extension for this extension point should implement the `ReduxActionInterceptorExtension` interface.
     * The `intercept()` method of the extension will be invoked with the action, and this method should return the action or null/undefined to stop the action.
     */
    ReduxActionInterceptor = "REDUX_ACTION_INTERCEPTOR",
    /**
     * This extension point is used to include third-party libraries.
     * Usually the `dependency` property of the widget manifest should be used to load third-party libraries instead of this extension point.
     * This extension point can be used as an alternative in case where the third-party library requires initialization.
     *
     * The extension for this extension point should implement the `DependencyDefineExtension` interface.
     */
    DependencyDefine = "DEPENDENCY_DEFINE",
    /**
     * @ignore
     * The `DataSourceFactoryUri` extension point is used to find the data source factory.
     * Because ds factory is heavy so app can't load all ds factories.
     * So, we define this extension and app will load all of these extensions and use this extension to load factory.
     */
    DataSourceFactoryUri = "DATA_SOURCE_FACTORY_URI",
    /**
     * This extension point allows the developer to add additional tools to the context toolbar that shows when the widget is selected in the builder interface.
     *
     * The extension for this extension point should implement the the `ContextToolExtension` interface.
     */
    ContextTool = "CONTEXT_TOOL",
    /**
     * Some widgets may need to know app config changes even when its setting panel is not loaded, such as data source will be removed, map widget will be removed, etc.
     * Widget can define the extensions for this extension point to listen to the changes.
     *
     * The extension for this extension point should implement the the `AppConfigOperationsExtension` interface.
     */
    AppConfigOperations = "APP_CONFIG_OPERATIONS",
    /**
     * The `BuilderOperations` extension point allows the developer to hook to the builder operations, such as save app, publish app, etc.
     */
    BuilderOperations = "BUILDER_OPERATIONS",
    /** @ignore */
    LayoutTransformer = "LAYOUT_TRANSFORMER"
}
/**
 * The extension points that support multiple extensions.
 */
export declare const EP_SUPPORT_MULTIPLE_EXTENSIONS: ExtensionPoints[];
/**
 * The extension points that are only used in builder.
 */
export declare const EP_BUILDER_ONLY_EXTENSIONS: ExtensionPoints[];
/**
 * Base extension interface
 */
export interface BaseExtension {
    /**
     * If an extension point supports multiple extensions, the index is used to determine the extension order.
     */
    index?: number;
    /**
     * The unique ID. For widget's provided extension, the id pattern is: widgetId + extensionName
     */
    id: string;
    /** The extension name. */
    name?: string;
    /**
     * The extension label.
     */
    label?: string;
    /**
     * The widget ID that provides the extension. No widget id means the extension is provided by Jimu.
     */
    widgetId?: string;
    destroy?: () => void;
}
/**
 * @ignore
 * A dummy extension class, for type checking.
 */
export declare class DummyExtension implements BaseExtension {
    index?: number;
    id: string;
    name?: string;
    widgetId?: string;
    label?: string;
}
/**
 * The extension interface for AppConfigProcessor extension point.
 */
export interface AppConfigProcessorExtension extends BaseExtension {
    /** The method to process the app config. */
    process: (appConfig: AppConfig) => Promise<AppConfig>;
}
export interface WidgetClassWrapperExtension extends BaseExtension {
    wrap: (WidgetClass: React.ComponentType<WidgetProps>, manifest: WidgetManifest) => React.ComponentClass<WidgetProps>;
}
export interface AppConfigServiceExtension extends BaseExtension {
    loadAppConfig: () => Promise<AppConfig>;
}
/**
 * The extension interface for ReduxStore extension point.
 */
export interface ReduxStoreExtension extends BaseExtension {
    /** The method that returns the redux actions. */
    getActions: () => string[];
    /**
     * The method that returns the redux store key. The key supports this format: a.b.c.
     */
    getStoreKey: () => string;
    /** The method that returns the redux initial store state. */
    getInitLocalState: () => any;
    /**
     * The method that returns the redux reducer. The reducer should return local state.
     */
    getReducer: () => (localState: any, action: any, state: IMState) => any;
}
export interface ReduxActionInterceptorExtension extends BaseExtension {
    /**
     * The method to intercept the redux action.
     * Return null/undefined to stop the action, or the modified action to continue.
     */
    intercept: (action: UnknownAction) => UnknownAction;
}
/**
 * The extension interface for DependencyDefine extension point.
 */
export interface DependencyDefineExtension extends BaseExtension {
    /** Return the dependency key. */
    getDependencyKey: () => string;
    /** Return the resources. */
    getResources: () => Resource[];
    /** This method will be invoked after the resources are loaded. You can put post initialization code in this method. */
    postInit?: () => Promise<void>;
}
export interface DataSourceFactoryUriExtension extends BaseExtension {
    getFactoryUri: (dataSourceType: any) => string;
}
/**
 * The extension interface for ContextTool extension point.
 */
export interface ContextToolExtension extends BaseExtension {
    /** Return group id. */
    getGroupId: () => string;
    /** Return the icon. */
    getIcon: () => React.ComponentClass<React.SVGAttributes<SVGElement>>;
    /** Return the title. */
    getTitle: (props: LayoutContextToolProps) => string;
    /** OnClick callback. */
    onClick?: (props: LayoutContextToolProps, evt?: React.MouseEvent<any>) => void;
    /** Check whether this tool is visible. */
    visible?: (props: LayoutContextToolProps) => boolean;
    /** Check whether this tool is checked. */
    checked?: (props: LayoutContextToolProps) => boolean;
    /** Check whether this tool is disabled. */
    disabled?: (props: LayoutContextToolProps) => boolean;
    /** Check whether this tool should be opened by default when the toolbar opened. */
    openWhenAdded?: boolean;
    /**
     * The setting panel of the tool. Returning null means there is no setting panel for the tool. If the returned value is not null, the setting panel will be rendered.
     */
    getSettingPanel: (props: LayoutContextToolProps) => React.ComponentClass<any> | React.FunctionComponent<any>;
}
/**
 * The extension interface for AppConfigOperations extension point.
 * The methods in this class must return the new appConfig
 */
export interface AppConfigOperationsExtension extends BaseExtension {
    /**
     * Process the widget's internal config after it is copied if necessary.
     * Only the original widget's extension should get invoked with the new copiedWidgetId.
     * @param sourceWidgetId Id of the widget that is copied.
     * @param sourceAppConfig The app config the sourceWidgetId comes from.
     * @param destWidgetId Id of the widget that is created in the destAppConfig.
     * @param destAppConfig The app config the destWidgetId is created in.
     * @param contentMap The map of content ids after copying. Provided when something (page, widget, section, etc.) is duplicated.
     * The key is the content id in the original app config, and the value is the content id in the new app config.
     * @returns The updated appConfig
     */
    afterWidgetCopied?: (sourceWidgetId: string, sourceAppConfig: IMAppConfig, destWidgetId: string, destAppConfig: IMAppConfig, contentMap?: DuplicateContext) => IMAppConfig;
    /**
     * Do some cleanup operations before current widget is removed.
     * This method is invoked after the widget has been removed from the layout.
     * @returns The updated appConfig
     */
    widgetWillRemove?: (appConfig: IMAppConfig) => IMAppConfig;
    /**
     * This method is invoked when a widget is going to be removed from the app config.
     * This method is invoked before the widget has been removed from the layout.
     * @param appConfig
     * @param widgetId the widget id that is going to be removed
     * @returns  The updated appConfig
     */
    anyWidgetWillRemove?: (appConfig: IMAppConfig, widgetId: string) => IMAppConfig;
    /**
     * If a widget saves the data source id in its internal config, it should override this method to do the clean ups.
     * Only the widgets that save the data source id in it's useDataSources will get invoked.
     * @param appConfig The app config.
     * @param dataSourceId The data source id that is going to be removed.
     * @returns The updated appConfig
     */
    dataSourceWillRemove?: (appConfig: IMAppConfig, dataSourceId: string) => IMAppConfig;
    /**
     * If a widget saves some config that is related to the data source in its internal config, it should override this method to do the clean ups.
     * In most cases, a widget can just do the clean ups in its setting panel.
     * However, when we remove a used data source from the list, the list internal widgets don't have the chance to do the clean ups.
     * These widgets (Text/Image/Button) should override this method to do the clean ups.
     * Another case is in Express mode, when the map widget de-selects a data source, all related widgets "useDataSources" are cleared.
     *
     * For config in the widget message action and data action, widget can clean up the config in the `useDataSourceWillChange` method.
     * For the framework actions, the action can provide the `useDataSourceWillChange` method to clean up the config.
     * @param appConfig The app config.
     * @param oldDataSourceId The use data source id that is going to be removed.
     * @param newDataSourceId The new use data source id that is going to be used.
     * @returns The updated appConfig
     */
    useDataSourceWillChange?: (appConfig: IMAppConfig, oldDataSourceId: string, newDataSourceId: string) => IMAppConfig;
    /**
     * If a widget saves the utility id in its internal config, it should override this method to do the clean ups.
     * Only the widgets that save the utility id in it's useUtilities will get invoked.
     * @param appConfig The app config.
     * @param utilityId The utility id that is going to be removed.
     * @returns The updated appConfig
     */
    utilityWillRemove?: (appConfig: IMAppConfig, utilityId: string) => IMAppConfig;
    /**
     * If a widget saves some map related data its internal config, it should override this method to do the clean ups.
     * Only the widgets that save the map widget id in it's useMapWidgets will get invoked.
     * @param appConfig The app config.
     * @param mapWidgetId The map widget id that is going to be removed.
     * @returns The updated appConfig
     */
    mapWidgetWillRemove?: (appConfig: IMAppConfig, mapWidgetId: string) => IMAppConfig;
    /**
     * This method is invoked before the app config is changed.
     * @param appConfig
     * @returns
     */
    appConfigWillChange?: (appConfig: IMAppConfig) => IMAppConfig;
}
/**
 * Represents an i18n label.
 * key: i18n key in translation resources.
 * enLabel: The English label, for the case that the en i18n file is packaged in the widget.
 * values: The values for each i18n key.
 */
export interface I18nLabel {
    key: string;
    enLabel: string;
    values?: {
        [key: string]: string;
    };
}
/**
 * The translation key interface used in the BuilderOperations extension point.
 */
export type TranslationKey = TranslationKeyBase | TranslationKeyValue | TranslationKeyGroup;
/**
 * Base translation key definition shared by value/group types.
 * keyType:
 *   - value: a concrete translatable field.
 *   - group: a logical grouping (container) holding children keys.
 * key: unique identifier used to correlate with config.
 * label: display label. Can be plain string or i18n descriptor.
 */
interface TranslationKeyBase {
    keyType: 'value' | 'group';
    key: string;
    label: string | I18nLabel;
}
/**
 * Translation key representing an editable value.
 * valueType: input control type (single line / multi line).
 * nav: optional navigation breadcrumb/path (string or i18n).
 * defaultValue: optional default value if can not get value from config by key.
 */
export interface TranslationKeyValue extends TranslationKeyBase {
    valueType?: 'text' | 'textarea';
    nav?: string | I18nLabel;
    defaultValue?: string;
}
/**
 * Translation key representing a grouping node (non-editable, structural).
 * Inherits everything from base; no extra fields now.
 */
export interface TranslationKeyGroup extends TranslationKeyBase {
}
/**
 * The extension interface for BuilderOperations extension point.
 */
export interface BuilderOperationsExtension extends BaseExtension {
    /**
     * Will be invoked before save app. A widget can use this method to check or update the config before saving the app.
     * All extensions must return the updated app config, the updated app config will be used by the next extension.
     *
     * @param appConfig The app config to be saved.
     */
    beforeSave?: (appConfig: IMAppConfig) => Promise<IMAppConfig>;
    /**
     * Will be invoked before publish app.
     * All extensions must return the updated app config, the updated app config will be used by the next extension.
     * @param appConfig The app config to be published.
     * @returns
     */
    beforePublish?: (appConfig: IMAppConfig) => Promise<string>;
    /**
     * Will be invoked when opening the multiple language setting panel.
     * All extensions must return the keys that need to be translated.
     * @returns
     */
    getTranslationKey?: (appConfig: IMAppConfig) => Promise<TranslationKey[]>;
}
export interface LayoutTransformerExtension extends BaseExtension {
    layoutType: string;
    transformLayout: LayoutTransformFunc;
    transformLayoutItem: LayoutItemTransformFunc;
}
export {};
