import type { ImmutableObject } from 'seamless-immutable';
import type { MessageDescription, MessageType } from '../message/message-base-types';
import type { Size, WidgetType } from './common';
import type { ExtensionPoints } from '../extension-spec/extension-spec';
import type { IconResult } from './app-config';
/** The base interface for both widgets and themes. */
export interface Manifest {
    /** The name must be unique and same as folder name. */
    name: string;
    /** This should be same as the `_widgetLabel` value in translation/default.ts */
    label: string;
    /** The widget/theme version. The format of the version must follow this pattern: MAJOR.MINOR.PATCH, see [semver](https://semver.org/) for details. */
    version: string;
    /**
     * A widget may only support certain framework versions due to breaking API changes, so
     * this property allows the widget/theme to define the framework version that it supports.
     * This version check is not currently enforced, but will be enforced in the future.
     * */
    exbVersion: string;
    /**
     * You don't need to add this property in your code, this property is added at runtime.
     *
     * Save the current locale only, but not the default locale.
     * The default string should be written in manifest.
     * There are some conventional keys:
     * _widgetLabel: the widget label.
     * _action_<action name>_label: the action label.
     * _ext_<extension name>_label: the extension label.
     * _layout_<layout name>_label: the layout label.
     *  */
    i18nMessages: any;
    author?: string;
    description?: string;
    copyright?: string;
    license?: string;
    /**
     * @ignore
     * Default value is false. If true, the widget will not be in ArcGIS Online (Code is not available in Online).
     * */
    notSupportAGOL?: boolean;
    /**
     * Whether the widget can be added to the app, default is false.
     * Widgets that will be deprecated can set this property to true. The code is still available, but the widget will not be shown in the widget list.
     */
    notAllowAdd?: boolean;
}
/** The common properties for both data action and message action. */
export interface BaseActionProperty {
    /** The action name. */
    name: string;
    /** The action class URI, relative to `src` folder. */
    uri: string;
    /**
     * The action setting class URI, relative to the `src` folder. Webpack uses this property to create an entry for the action.
     * In the builder settings, a message action may require settings or not, depending on the message or data source.
     * If the action does require settings, the action should define `getSettingComponentUri()` method to return the setting uri or return null.
     * */
    settingUri?: string;
    /** The default label for the action. To support i18n, please define this string key in the translations/default.ts: `_action_${actionName}_label`. */
    label: string;
}
/** The properties for message action declaration. */
export type MessageActionProperty = BaseActionProperty;
/** The properties for data action declaration. */
export interface DataActionProperty extends BaseActionProperty {
    /** The action icon, relative to `src` folder. */
    icon: IconResult | string;
}
/** The widget manifest */
export interface WidgetManifest extends Manifest {
    /** Widget manifest properties */
    properties?: WidgetManifestProperties;
    /** Extensions provided by the widget. */
    extensions?: ExtensionProperties[];
    /** The message types published by the widget. */
    publishMessages?: Array<MessageType | MessageDescription>;
    /** The message actions provided by the widget.  */
    messageActions?: MessageActionProperty[];
    /** The data actions provided by the widget */
    dataActions?: DataActionProperty[];
    /** Exclude those data actions in setting and runtime */
    excludeDataActions?: string[];
    /**
     * The translated locales the widget provides. Each entry should be a string representing the language version as defined in [BCP 47](https://tools.ietf.org/rfc/bcp/bcp47.txt). Examples of valid language codes include "en", "en-US", "fr", "fr-FR", "es-ES", etc.
     * By convention, the default locale is listed first.
     **/
    translatedLocales?: string[];
    /**
     * Use this property to load third-party libraries. Pass an absolute URL to a library.
     * See the Using third-party libraries guide for more information.
     *
     * Alternatively, a widget can define its own dependencies by providing a
     * `DependencyDefine` extension.
     *
     * Pre-defined dependencies:
     * - **jimu-arcgis**: will load the `jimu-arcgis` package that will load the ArcGIS Maps SDK for JavaScript.
     */
    dependency?: string | string[];
    /**
     * Dependency for setting component. See {@link WidgetManifest.dependency}
     */
    settingDependency?: string | string[];
    /** The initial size the widget will be when added into an app. */
    defaultSize?: Size & {
        autoWidth?: boolean;
        autoHeight?: boolean;
    };
    widgetType?: WidgetType;
    /** Valid only when the `hasEmbeddedLayout` is true. */
    layouts?: Array<{
        name: string;
        label: string;
        type?: string;
    }>;
    /** Declare the URL parameters that the widget supports */
    urlParameters?: Array<{
        name: string;
        label: string;
        tooltip?: string;
    }>;
    /** The license that the widget requires to work. An icon will be displayed on the widget card if this property is set.*/
    requireLicense?: License;
}
/**
 * The extension definition.
 */
export interface ExtensionProperties {
    /** The extension point that the extension extends. */
    point: ExtensionPoints;
    /** The extension class URI, relative to `src` folder. */
    uri: string;
    /** The extension name. */
    name: string;
    label: string;
}
export type License = 'Enterprise' | 'Autodesk';
/**
 * Properties that declare the widget capability.
 * Some properties are automatically generated on compilation, and some need to be set in the `manifest.json`.
 */
export interface WidgetManifestProperties {
    /** This property is automatically set. If `runtime/widget.tsx` exists, this property is true. */
    hasMainClass: boolean;
    /** This property is automatically set. If `config.json` exists, this property is true. */
    hasConfig: boolean;
    /** This property is automatically set. If `setting/setting.tsx` exists, this property is true. */
    hasSettingPage: boolean;
    /** @ignore */
    hasLayoutItemSettingPage: boolean;
    /** This property is automatically set. If `runtime/builder-support.tsx` exists, this property is true. */
    hasBuilderSupportModule: boolean;
    /**
     * Default value is true.
     * If false, the builder will not load the setting page.
     * One use case of setting the value to `false` is when a widget supports inline editing, as it does not need to show the setting page even though it has config.
     */
    hasConfigInSettingPage: boolean;
    /** Default value is false. If true, an edit button will show when widget is selected. */
    supportInlineEditing: boolean;
    /** Default value is false. If true, the widget can be put in a list. */
    supportRepeat: boolean;
    /** Default value is true. If true, the height/width of the widget can be set to auto. */
    supportAutoSize: boolean;
    /** Default value is false. If true, the layout widget can not have one by one animation. */
    forbidOneByOneEffect: boolean;
    /** Default value is false. If true, the framework will create the layouts for the widget, see `layouts` property. */
    hasEmbeddedLayout: boolean;
    /** Default value is true. If true, the children layout items are constrained in the widget. */
    lockChildren: boolean;
    /** @ignore */
    passDataSourceToChildren: boolean;
    /** Default value is false. If true, the widget will be shown in the `MapWidgetSelector`. */
    canCreateMapView: boolean;
    /** Default value is false. By default, a widget is constrained in the layout. Setting this property to true will make the widget overflow out of the layout. */
    canCrossLayoutBoundary?: boolean;
    /** Default value is false. If true, the widget can provide a data set to the data action. */
    canConsumeDataAction?: boolean;
    /** Default value is false. If true, the widget can provide a repeat data source. */
    canProvideRepeatDataSource?: boolean;
    /** Default value is false. If true, the widget can generate multiple output data sources. */
    canGenerateMultipleOutputDataSources?: boolean;
    /** Default value is false. By default, a widget does not have background and the background set in the layout style will take effect.
     *  If it is true, the background setting in the layout style will be hidden.
     */
    coverLayoutBackground?: boolean;
    /** Default value is false. If true, flips the icon on RTL. */
    flipIcon?: boolean;
    /**
     * Default value is false.
     *
     * When user click a widget, we can activate the widget (change the widget state to active), but not all widget needs this active state.
     * So, for performance reason, we do not activate a widget by default.
     *
     * When this property is true, and when a widget is activated, we'll use `deactivateOtherWidgets` to check whether deactivate other widgets.
     */
    needActiveState?: boolean;
    /**
     * Default value is false.
     *
     * When a widget is put in the page/window/view/sidebar/accordion, the widget can be hidden. When a widget is scrolled out of view or is put in the screen group, we don't change the widget state to hidden.
     * For performance reason, a widget does not get a state value when it's rendered.
     * When this property is true, we change the widget state to hidden when it's layout container is hidden.
     * When it's layout container is shown, we change the widget state to undefined.
     *
     * For example, when this property is true and the widget is added to a view.
     * When the view is hidden, the widget state will be changed to hidden.
     * When the view is shown, the widget state will be changed to undefined.
     */
    needHiddenState?: boolean;
    /**
     * Default value is true.
     *
     * For map widget, we can set this as false to enable other widgets to interact with map.
     * True, means when this widget is activated, all other widgets will be deactivated.
     * False, means when this widget is activated, will not change other widget's state.
     *
     * This means there may be more than one active widgets.
     */
    deactivateOtherWidgets?: boolean;
    /**
     * @ignore
     * This indicates whether a guide is available for the widget.
     * If true, the help tooltip for the widget will include a button to start the guide.
     */
    hasGuide?: boolean;
    guideType?: GuideTypes;
    /**
     * Default value is false.
     * Set this property to true, the widget can use `<ViewportVisibilityContext.Consumer>` to get whether the widget is in the browser viewport.
     */
    watchViewportVisibility?: boolean;
    /**
     * Default value is false.
     * A widget controller widget is used to control (open/close) other widgets.
     */
    isWidgetController?: boolean;
    /**
     * Default value is false.
     * Will the builder provider a drag handler for this widget.
     */
    useDragHandler?: boolean;
    /**
     * Default value is false.
     * Set this property to true, won't load the used fields of the widget.
     *
     * Some widgets use fields but do not use these fields for display or not use data source to load these fields. For example, table widget uses fields but doesn't use data source to load these fields, chart widget uses fields but doesn't use these fields for display (it for statistic).
     * In this case, we do not need to load these fields. After enable client-side query, the more fields we load, the slower the interaction with the map will be.
     */
    notAutoLoadUsedFieldsData?: boolean;
    /**
     * This is the default value of the WidgetJson.offPanel.
     * If true, the newly added widgets will have be off panel by default.
     */
    defaultOffPanel?: boolean;
    /**
     * By default, the widget will share dynamic modules (load by import()) with other widgets, which means these modules will be compiled into the `widgets/chunks` folder.
     * If this property is true, the dynamic modules will be compiled into the `chunks` folder of the widget.
     */
    notShareDynamicModules?: boolean;
    /**
     * Default value is false.
     * If true, the description of the widget will be shown in the widget list.
     * To support i18n, please define this string key in the translations/default.ts: `_widgetDescription`.
     * */
    showDescription?: boolean;
    /**
     * Whether to handle the accessible label by widget itself. If false, the accessible label will be handled by framework.
     * @default false
     */
    handleA11yLabelInWidget?: boolean;
    /**
     * Whether the widget uses its own border.
     * @default false
     */
    useOwnBorder?: boolean;
}
export type IMWidgetManifest = ImmutableObject<WidgetManifest>;
/**
 * The `guideType` property specifies the type of guide that is being defined.
 *
 *- 'PROGRAM': Indicates that the guide is defined by a TypeScript (ts) file.
 *- 'CONFIG': Indicates that the guide is defined by a JSON file.
 */
export declare enum GuideTypes {
    Config = "CONFIG",
    Program = "PROGRAM"
}
