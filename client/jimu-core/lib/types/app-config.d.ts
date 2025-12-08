import type { ImmutableObject } from 'seamless-immutable';
import type { WidgetManifest } from './manifest';
import type { JimuFieldType, BoundingBox, Size, BrowserSizeMode, EsriFieldType } from './common';
import type { LayoutItemType, LayoutType, LayoutInfo } from './layout';
import type { Analytics } from './tracking-manager';
import type { GeometryType } from '@esri/arcgis-rest-request';
import type { SharedThemeVariables, ThemeVariables } from './theme';
import type { MessageType } from '../message/message-base-types';
import type { SqlExpression, OrderByOption } from './sql-expression';
import type { AnimationSetting } from '../animation';
import type { ImageParam, BackgroundStyle, BorderStyle, BoxShadowStyle, FourSidesUnit } from 'jimu-ui';
import type { ThemeOptions } from 'jimu-theme';
/**
 * @ignore
 * This is an internal concept. A container has a layout object (size mode layout) to hold widget/section.
 *
 * A widget has layout/layout widget is not a container, it's a parent widget of the widget in it's layout.
 *
 * Use lower case here to match the keys in app config.json.
 */
export declare enum ContainerType {
    /**
     * these four are root containers.
     * When manage multiple size mode, we manage the root container only.
     * Other containers will follow root container's setting
     */
    Page = "pages",
    Dialog = "dialogs",
    Header = "header",
    Footer = "footer",
    View = "views",
    ScreenPanel = "screens_panel",
    ScreenMain = "screens_main"
}
export interface ContainerInfo {
    type: ContainerType;
    id: string;
}
/**
 * @ignore
 * The plural of element will be the key in appConfig
 */
export type ElementType = 'page' | 'view' | 'section' | 'widget' | 'screen' | 'screenGroup' | 'layout' | 'dialog' | 'dataSource' | 'messageConfig' | 'appProxy' | 'utility';
/**
 * These elements can have layout. The layout will use its parent type to find the correct element.
 */
export declare enum LayoutParentType {
    Page = "pages",
    View = "view",
    Widget = "widget",
    Screen = "screen",
    Dialog = "dialog",
    Header = "header",
    Footer = "footer"
}
export interface WidgetContext {
    /**
    * Absolute URL points to widget folder, like this: http://.../widgets/abc/.
    *
    * If you need to use fetch to load something in widget, you can use this *folderUrl*.
    * If you need to use system.js to load some modules, please use *uri*.
    */
    folderUrl: string;
    /** @ignore */
    isRemote: boolean;
}
/**
 * Properties for icon.
 * There are three kinds of icons:
 * 1. Default icons (Icons provided by General group and Arrows group)
 * 2. Custom icons (Additional icons configured by developers, showed in My icons group)
 * 3. Uploaded icons (Additional icons uploaded by users, showed in My icons group)
 */
export interface IconProps {
    /**
     * Default icons and Custom icons use this property as icon button title. So Custom icons need to pass a nls string.
     * Uploaded icons save this property in appResourceUrl as portal filename, eg.'1678960963547.png'
     */
    filename: string;
    /**
     * Default icons and Custom icons use this property to tell icon button whether it is active. For Custom Icon that doesn't set originalName, will compare svg string.
     * Uploaded icons use this property as icon button title. eg.'apple.png'
     */
    originalName?: string;
    /**
     * Used to decide if the default icon exist and set the selected icon when opening the icon picker pane.
     * For Default icons, it is a string[] showing its group, eg. ['general', 'search'].
     * For Custom icons, it is a string that stands for a specific icon. The svg string will be compared when no path set.
     * For Uploaded icons, it is an appResourceUrl string from appConfig. eg.${appResourceUrl}/images/icon_picker_in_setting/1678960963547.png
     */
    path?: string[] | string;
    size?: number;
    color?: string;
    /**
     * For Default icons, this property is true.
     * For Custom icons, this property is true if the svg is a inline svg file string; this property is false if the svg is a url of an image.
     * For Uploaded icons, this property is false(Because we don't support to upload a svg file).
     * If this property is false, the icon cannot change color.
     */
    inlineSvg?: boolean;
    /**
     * Used to mark if the icon is uploaded by user.
     * For Default icons and Custom icons, don't need to set this property.
     * @ignore
     */
    isUploaded?: boolean;
}
export type IMIconProps = ImmutableObject<IconProps>;
export interface IconResult {
    svg: string;
    properties?: IconProps;
}
export type IMIconResult = ImmutableObject<IconResult>;
/** Layout item is used to hold widget and section in layout. */
export interface LayoutItemJson {
    id?: string;
    bbox?: BoundingBox;
    type?: LayoutItemType;
    setting?: any;
    widgetId?: string;
    sectionId?: string;
    screenGroupId?: string;
    isPlaceholder?: boolean;
    isPending?: boolean;
    parent?: string;
    children?: string[];
}
export type IMLayoutItemJson = ImmutableObject<LayoutItemJson>;
export declare enum GridItemType {
    Row = 0,
    Column = 1,
    Tab = 2,
    Plain = 3
}
export interface GridLayoutItemJson extends LayoutItemJson {
    label?: string;
    activeTab?: number;
    expandable?: boolean;
    gridType: GridItemType;
}
export type IMGridLayoutItemJson = ImmutableObject<GridLayoutItemJson>;
export interface LayoutJson {
    id: string;
    label?: string;
    order?: string[];
    type?: LayoutType;
    content?: {
        [layoutItemId: string]: LayoutItemJson;
    };
    setting?: any;
    parent?: {
        type: LayoutParentType;
        id: string;
    };
}
export interface FixedPositionSizeJson {
    position: FixedPosition;
    width?: string;
    height?: string;
    offsetX?: number;
    offsetY?: number;
    left?: string;
    top?: string;
    right?: string;
    bottom?: string;
    widthMode?: 'STRETCH' | 'CUSTOM';
    heightMode?: 'STRETCH' | 'CUSTOM';
}
export type IMFixedPositionSizeJson = ImmutableObject<FixedPositionSizeJson>;
export interface ControllerPanelJson extends FixedPositionSizeJson {
    effect?: AnimationSetting;
}
export interface AppLayouts {
    [layoutId: string]: LayoutJson;
}
export type IMAppLayouts = ImmutableObject<AppLayouts>;
export type IMLayoutJson = ImmutableObject<LayoutJson>;
export type IMControllerPanelJson = ImmutableObject<ControllerPanelJson>;
export interface LayoutsJson {
    [layoutId: string]: LayoutJson;
}
export type IMLayoutsJson = ImmutableObject<LayoutsJson>;
export interface ControllerPanelsJson {
    [controllerId: string]: ControllerPanelJson;
}
export type IMControllerPanelsJson = ImmutableObject<ControllerPanelsJson>;
export type IMWidgetContext = ImmutableObject<WidgetContext>;
/**
 * Data source used in widgets.
 */
export interface UseDataSource {
    /**
     * This is the real data source id a widget is using, the id can be:
     *    * mainDataSourceId, when the widget uses main data source directly.
     *    * `${mainDataSourceId}-${dataViewId}`, when the widget uses a data view.
     * Please use this id to call `dataSourceManager.getDataSource()`.
     */
    dataSourceId: string;
    /**
     * Main data source is user configured data source or widget output data source.
     * If the data source is in a data source set, need to use rootDataSourceId to get dataSourceJson.
     */
    mainDataSourceId: string;
    dataViewId?: string;
    /**
     * The data source a widget uses may be a child data source of another data source,
     * so we save the root data source id here so we can create data source easily.
     */
    rootDataSourceId?: string;
    /**
     * jimu field name array.
     * If no fields, means the widget can work with any field.
     */
    fields?: string[];
    /**
     * If true, the widget will use popup info of a layer data source.
     * For example, widgets use fields configured in popup info as display fields.
     */
    useFieldsInPopupInfo?: boolean;
    /**
     * If true, the widget will use symbol of a layer data source.
     * For example, image widget can display symbol of records.
     */
    useFieldsInSymbol?: boolean;
}
/**
 * Immutable `UseDataSource`.
 */
export type IMUseDataSource = ImmutableObject<UseDataSource>;
export interface UseUtility {
    utilityId: string;
    /** Task name to use if the reference utility is an online item group */
    task?: string;
}
export type IMUseUtility = ImmutableObject<UseUtility>;
/**
 * Will be used in a widget that consumes data actions.
 * */
export interface WidgetDataActionConfig {
    [actionName: string]: {
        enabled: boolean;
        config?: any;
        actions: {
            [widgetId: string]: DataActionJson;
        };
    };
}
export type IMWidgetDataActionConfig = ImmutableObject<WidgetDataActionConfig>;
export interface WidgetJson {
    id: string;
    icon: IconResult | string;
    label: string;
    visible: boolean;
    index?: number;
    /** The widget's config is saved here */
    config: any;
    uri: string;
    itemId?: string;
    context: WidgetContext;
    /**
     * The manifest is added in runtime, will not be saved in the config json.
     */
    manifest: WidgetManifest;
    /**
     * When adding a widget, the version is the version in manifest.json.
     * When opening a widget in a new version, the widget will be upgraded to the new version,
     * and the origin version will be copied to the originVersion property.
     */
    version: string;
    originVersion: string;
    useDataSources?: UseDataSource[];
    useUtilities?: UseUtility[];
    useMapWidgetIds?: string[];
    useDataSourcesEnabled?: boolean;
    outputDataSources?: string[];
    /**
    * For widget that has an embedded layout, the name is declared in manifest.json.
    * If there is no layouts declared in manifest, the name is default.
    *
    * If the name starts with "_", the layout will not be displayed in TOC.
    */
    layouts?: {
        [name: string]: SizeModeLayoutJson;
    };
    /**
     * A widget can be contained in multiple layout under a certain size mode.
     * The key is the name of the size mode.
     */
    parent?: {
        [key: string]: LayoutInfo[];
    };
    style?: {
        background?: BackgroundStyle;
        border?: BorderStyle;
        borderRadius?: FourSidesUnit;
        boxShadow?: BoxShadowStyle;
    };
    enableDataAction?: boolean;
    /**
     * @default true
     * This property controls whether the data-action-list component queries the all data count in the Dropdown style.
     * When this option is set to false, the string will stay 'All data' instead of 'All data(COUNT_NUMBER)'
     * This option is for solving performance issue when there are too many features in the layer.
     */
    showAllDataCount?: boolean;
    dataActions?: WidgetDataActionConfig;
    /**
     * Default value is false, this property is valid only when a widget is rendered in a widget controller.
     * False means the widget controller will render the widget in controller's panel, and true means the controller widget will render the widget as it is.
     * A widget can update this property in it's setting so it can display well in the controller widget.
     */
    offPanel?: boolean;
    /**
     * Accessible label for the widget, used by screen readers.
     * When a value is set, it will be applied as an `aria-label` on the `widget-content` DOM element (with role='group') by framework.
     * If widget needs to handle the `a11yLabel` itself (such as iframe case), it can set `handleA11yLabelInWidget` to `true` in manifest's properties, then handle it within the widget.
     * @default ''
     */
    a11yLabel?: string;
    /**
     * Indicates whether the widget is added to `Skip To Content`, including root widget from body, header(enabled by default), and footer(enabled by default). If a widget is not at the root level, it's not included even if it has this property.
     * When set to `true`, the framework will add `tabIndex=-1`,`id`, `aria-label`, and `role=group` on the `widget-content` DOM element.
     * If widget needs to handle the `addToA11ySkip` itself (such as iframe case), it can set `handleA11yLabelInWidget` to `true` in manifest's properties, then add the `id` within the widget.
     * @default false
     */
    addToA11ySkip?: boolean;
}
export type IMWidgetJson = ImmutableObject<WidgetJson>;
export interface WidgetsJson {
    [widgetId: string]: WidgetJson;
}
export type IMWidgetsJson = ImmutableObject<WidgetsJson>;
export interface SizeModeLayoutJson {
    [sizeMode: string]: string;
}
export type IMSizeModeLayoutJson = ImmutableObject<SizeModeLayoutJson>;
/**
 * @ignore
 */
export interface AbstractContainerJson {
    layout: SizeModeLayoutJson;
    backgroundColor?: string;
    backgroundIMage?: string | ImageParam;
    backgroundPosition?: string;
    textColor?: string;
    oneByOneEffect?: AnimationSetting;
}
/** @ignore */
export type IMAbstractContainerJson = ImmutableObject<AbstractContainerJson>;
export interface SectionJson {
    id: string;
    visible?: boolean;
    label: string;
    icon: IconResult | string;
    views: string[];
    style?: {
        border?: BorderStyle;
        borderRadius?: FourSidesUnit;
        boxShadow?: BoxShadowStyle;
    };
    transition?: {
        type: string;
        direction?: string;
    };
    focusable?: boolean;
    autoPlay?: boolean;
    interval?: number;
    loop?: boolean;
    arrowsNav?: {
        visible: boolean;
        direction: 'v' | 'h';
        size: number;
        offset: number;
    };
    dotsNav?: {
        visible: boolean;
        position: 'l' | 'r' | 't' | 'b';
        size: number;
        offset: number;
        spacing: number;
    };
    parent?: {
        [key: string]: LayoutInfo[];
    };
    a11yLabel?: string;
    addToA11ySkip?: boolean;
}
export type IMSectionJson = ImmutableObject<SectionJson>;
export interface SectionsJson {
    [sectionId: string]: SectionJson;
}
export type IMSectionsJson = ImmutableObject<SectionsJson>;
export interface ViewJson extends AbstractContainerJson {
    id: string;
    label: string;
    icon?: IconResult;
    lazyLoad?: boolean;
    parent?: string;
    transition?: {
        type: string;
        direction?: string;
    };
}
export type IMViewJson = ImmutableObject<ViewJson>;
export interface ViewsJson {
    [viewId: string]: ViewJson;
}
export type IMViewsJson = ImmutableObject<ViewsJson>;
export declare enum ScreenTransitionType {
    Fade = "FADE",
    Cover = "COVER",
    Push = "PUSH"
}
export declare enum ScreenTriggerType {
    Top = "TOP",
    Upper = "UPPER",
    Lower = "LOWER",
    Bottom = "BOTTOM"
}
export interface ScreenGroupJson {
    id: string;
    label: string;
    icon: IconResult | string;
    transitionType?: ScreenTransitionType;
    panelTransitionType?: ScreenTransitionType;
    stretchPanel?: boolean;
    triggerType?: ScreenTriggerType;
    screens: string[];
    verticalSpace?: string;
    /**
     * A screen group can only be contained in one layout under certain size mode.
     * The key is the name of the size mode.
     */
    parent?: {
        [key: string]: LayoutInfo;
    };
    a11yLabel?: string;
    addToA11ySkip?: boolean;
}
export type IMScreenGroupJson = ImmutableObject<ScreenGroupJson>;
export interface ScreenGroupsJson {
    [screenGroupId: string]: ScreenGroupJson;
}
export type IMScreenGroupsJson = ImmutableObject<ScreenGroupsJson>;
export interface ScreenJson {
    id: string;
    label: string;
    parent?: string;
    panel?: {
        layout: SizeModeLayoutJson;
        side: 'left' | 'right' | 'center' | 'none';
        size?: string;
        offset?: string;
        overlay?: boolean;
        padding?: any;
        gap?: number;
        background?: BackgroundStyle;
        textColor?: string;
    };
    main: {
        layout: SizeModeLayoutJson;
        background?: BackgroundStyle;
        textColor?: string;
    };
}
export type IMScreenJson = ImmutableObject<ScreenJson>;
export interface ScreensJson {
    [screenId: string]: ScreenJson;
}
export type IMScreensJson = ImmutableObject<ScreensJson>;
export interface SizeModePageHeightInBuilder {
    [sizeMode: string]: number;
}
/**
 * The page type.
 */
export declare enum PageType {
    Normal = "NORMAL",
    Folder = "FOLDER",
    Link = "LINK"
}
/**
 * The page mode.
 */
export declare enum PageMode {
    /**
     * width, height = 100%
     */
    FitWindow = "FIT_WINDOW",
    /**
     * width = <>px | 100%,
     * height = auto
     */
    AutoScroll = "AUTO_SCROLL"
}
/**
 * The dialog mode.
 */
export declare enum DialogMode {
    /**
     * Dialog position is configured with these options: center, left, right, top, bottom.
     */
    Fixed = "FIXED",
    /**
     * Dialog position follows the opener that it links to.
     */
    Anchored = "ANCHORED"
}
/**
 * The dialog interaction type.
 */
export declare enum DialogInteractionType {
    NoButton = "NO_BUTTON",
    ButtonInline = "BUTTON_INLINE",
    ButtonBlock = "BUTTON_BLOCK"
}
export declare enum FixedPosition {
    TopLeft = "TOP_LEFT",
    TopRight = "TOP_RIGHT",
    BottomLeft = "BOTTOM_LEFT",
    BottomRight = "BOTTOM_RIGHT",
    TopCenter = "TOP_CENTER",
    BottomCenter = "BOTTOM_CENTER",
    MiddleLeft = "MIDDLE_LEFT",
    MiddleRight = "MIDDLE_RIGHT",
    MiddleCenter = "MIDDLE_CENTER"
}
/**
 * The page json.
 */
export interface PageJson extends AbstractContainerJson {
    /** The page id. */
    id: string;
    /** The page label. */
    label: string;
    /** The page type. */
    type: PageType;
    /** The page icon. */
    icon: IconResult | string;
    /** The page header. */
    header: boolean;
    /** The page footer. */
    footer: boolean;
    /** The page mode. */
    mode: PageMode;
    /**
     * The maximum width of a page.
     * Pixel width, only valid for the auto-scrolling page mode.
     */
    maxWidth?: number;
    /** @ignore */
    heightInBuilder?: SizeModePageHeightInBuilder;
    /** The link URL. */
    linkUrl?: string;
    /** The open target: _blank, _top.  */
    openTarget?: string;
    /** Whether the page is visible. */
    isVisible: boolean;
    /** Whether it is the home page. */
    isDefault: boolean;
    /** Open dialog when page starts. */
    autoOpenDialogId: string;
    /**
     * The body background color, only valid for fixed-width pages.
     */
    bodyBackgroundColor?: string;
    bodyTextColor?: string;
    /**
     * The body background image, only valid for fixed-width pages.
     */
    bodyBackgroundIMage?: string;
    /**
     * The body background position, only valid for fixed-width pages.
     */
    bodyBackgroundPosition?: string;
}
/** The type of immutable page json. */
export type IMPageJson = ImmutableObject<PageJson>;
export interface PagesJson {
    [pageId: string]: PageJson;
}
export type IMPagesJson = ImmutableObject<PagesJson>;
/**
 * The dialog json.
 * Dialog is the synonym of the Window in UI.
 *  */
export interface DialogJson extends AbstractContainerJson {
    /** The dialog id. */
    id: string;
    /** The dialog label. */
    label: string;
    /** The dialog icon. */
    icon: IconResult | string;
    /** The dialog mode. */
    mode: DialogMode;
    /**
     * To distinct the display order for dialog list.
     * Each mode, Fixed and Anchored, has its own order list starting with 0.
     */
    index?: number;
    /** The dialog size mode. */
    sizeMode: {
        [sizeMode in BrowserSizeMode]?: FixedPositionSizeJson;
    };
    /**
     * If a dialog is a splash, the dialog will open automatically when the app get loaded.
     * Only one fixed dialog can be set as splash.
     *
     * The splash dialog id is not put in the URL, and can't be set as page dialog or link dialog.
     */
    isSplash: boolean;
    /**
     * Interaction is valid when the dialog mode is FIXED.
     */
    interactionType: DialogInteractionType;
    /**
     * Details for interaction: checkbox text and font-size, button text and font-size.
     */
    interactionStyles: any;
    /**
     * Two interactions.
     * Confirmation: true. Users must check the confirmation box before closing the dialog.
     * "Don't show this again" option: false. It is optional. If checked, the window will not display again.
     * */
    confirmBeforeClose: boolean;
    /**
     * Valid when confirmBeforeClose is true.
     * Whether the confirmation window displays again or not after it is checked.
     */
    alwaysShowConfirmation: boolean;
    /**
     * The other interaction. Valid when dialog's mode is FIXED.
     * Users must check the checkbox box before closing the dialog. The window will never display again */
    preventDisplayAgain: boolean;
    /**
     * Close dialog when clicking outside.
     */
    closeWhenClickOverlay: boolean;
    /**
     * Whether to hide overlay and allow operation of functions behind the fixed window.
     * Only valid for fixed window mode.
     */
    blockPage?: boolean;
    /** The dialog overlay color. */
    overlayColor?: any;
    /** The dialog background. */
    dialogBackground?: BackgroundStyle;
    /** The dialog border style. */
    border?: BorderStyle;
    borderTop?: BorderStyle;
    borderBottom?: BorderStyle;
    borderLeft?: BorderStyle;
    borderRight?: BorderStyle;
    /** The dialog border radius. */
    borderRadius?: FourSidesUnit;
    /** The dialog box shadow. */
    boxShadow?: BoxShadowStyle;
    /**
     * The animation for the entire dialog.
     */
    effect?: AnimationSetting;
    /**
     * The animation for all widgets inside the dialog.
     */
    oneByOneEffect?: AnimationSetting;
}
/** Type of the immutable dialog json. */
export type IMDialogJson = ImmutableObject<DialogJson>;
export interface DialogsJson {
    [dialogId: string]: DialogJson;
}
export type IMDialogsJson = ImmutableObject<DialogsJson>;
export interface HeaderJson extends AbstractContainerJson {
    height: {
        [sizeMode: string]: number | string;
    };
    sticky?: boolean;
}
export type IMHeaderJson = ImmutableObject<HeaderJson>;
export interface FooterJson extends AbstractContainerJson {
    height: {
        [sizeMode: string]: number | string;
    };
}
export type IMFooterJson = ImmutableObject<FooterJson>;
/**
 * @ignore
 */
export type DateFormat = 'shortDate' | 'shortDateLE' | 'longMonthDayYear' | 'dayShortMonthYear' | 'longDate' | 'shortDateShortTime' | 'shortDateLEShortTime' | 'shortDateShortTime24' | 'shortDateLEShortTime24' | 'shortDateLongTime' | 'shortDateLELongTime' | 'shortDateLongTime24' | 'shortDateLELongTime24' | 'longMonthYear' | 'shortMonthYear' | 'year';
export interface FieldFormatSchema {
    dateFormat?: DateFormat;
    digitSeparator?: boolean;
    places?: number;
}
export type IMFieldFormatSchema = ImmutableObject<FieldFormatSchema>;
export interface FieldSchema {
    /**
     * Widget should use this name to read data.
     * In fact, the jimuName is the field name when the first mapping is configured.
     */
    jimuName: string;
    type: JimuFieldType;
    esriType?: EsriFieldType;
    /**
     * this is the actual field name of the current data service.
     */
    name: string;
    alias?: string;
    description?: string;
    format?: FieldFormatSchema;
    /**
     * @ignore
     * valid for output data source only. We'll use this info to refer to the original data source when mapping. The field name in the array is jimuFieldName.
     *    * If the data source has only one original data source, the array contains field names.
     *    * If the data source has more than one original data sources, the array contains "dsId.fieldName".
     */
    originFields?: string[];
}
export type IMFieldSchema = ImmutableObject<FieldSchema>;
/**
 * Data source schema.
 */
export interface DataSourceSchema {
    label?: string;
    childId?: string;
    jimuChildId?: string;
    idField?: string;
    fields?: {
        [jimuName: string]: FieldSchema;
    };
    filter?: string;
    refreshInterval?: number;
    /**
     * For dataset data source.
     * In fact, the jimuChildId is the child id when the first mapping is configured.
     */
    childSchemas?: {
        [jimuChildId: string]: DataSourceSchema;
    };
}
/**
 * Immutable `DataSourceSchema`.
 */
export type IMDataSourceSchema = ImmutableObject<DataSourceSchema>;
/** @ignore */
export interface ReversedDataSourceSchema {
    label?: string;
    childId?: string;
    jimuChildId?: string;
    fields?: {
        [fieldName: string]: FieldSchema[];
    };
    childSchemas?: {
        [childId: string]: ReversedDataSourceSchema[];
    };
}
/** @ignore */
export type IMReversedDataSourceSchema = ImmutableObject<ReversedDataSourceSchema>;
export interface DataSourceJson {
    id: string;
    /**
     * If user renamed the data source, will save the new name here.
     */
    label?: string;
    /**
     * Label of source (e.g. AGOL/portal item or a remote database) of the data source.
     * For root data source, will keep `sourceLabel` newest.
     * For example, if the AGOL/portal item is renamed, `sourceLabel` will be updated next time the app is saved.
     *
     * If data source instance is not created, will use `label` (if user renamed the data source) or `sourceLabel` as data source label.
     * If data source instance is created, should call `ds.getLabel` to get data source label.
     */
    sourceLabel?: string;
    type?: string;
    url?: string;
    arcadeScript?: string;
    /**
    * @ignore
    * For statistic data source, we must save the schema in the configuration.
    */
    isStatistic?: boolean;
    portalUrl?: string;
    itemId?: string;
    layerId?: string;
    layers?: DataSourceLayerJson[];
    /**
     * Whether the data source is hidden by user.
     */
    isHidden?: boolean;
    /**
     * Valid for widget output data source only. We don't use fields here.
     */
    originDataSources?: UseDataSource[];
    /**
     * @ignore
     * For configured data source:
     *    * If no mapping is configured, we don't save DS schema here, the reason is: we can fetch the updated schema when schema is changed in other place, such as mapViewer, server.
     *    * After mapping is configured:
     *      * For data source, we save the mapped fields info only, which means for non-mapped fields, we can still fetch updating.
     *      * for data source set, we save the mapped layers only, which means for non-mapped layers, we can still fetch updating.
     * For output data source:
     *    * If the schema is the same with the original data source, we don't need to save it. The widgets that use this data source will be referenced to the original data source
     *    * If the schema is not the same, we must save the full schema, and use the schema mapping to find the original data source's fields.
    */
    schema?: DataSourceSchema;
    /** @ignore */
    data?: Array<{
        [key: string]: unknown;
    }>;
    /**
     * @ignore
     * The fields used by the data source itself, such as in filter, in sort.
     */
    useFields?: string[];
    isOutputFromWidget?: boolean;
    /**
     * Indicate whether source data is saved in data source instance.
     * If it is true, the source data will be saved in `dataSource.sourceRecords`.
     */
    isDataInDataSourceInstance?: boolean;
    /** The query criteria for the data source itself. */
    query?: DataViewJson;
    dataViews?: {
        [dvId: string]: DataViewJson;
    };
    childDataSourceJsons?: {
        [jimuChildId: string]: DataSourceJson;
    };
    geometryType?: GeometryType;
    /**
     * Whether to disable export data.
     * For subscriber data, do not allow to export data by default.
     * For other data, allow to export data by default.
     */
    disableExport?: boolean;
    /**
     * Export options for the data source.
     */
    exportOptions?: ExportOptions;
}
/**
 * Export options for the data source.
 */
export interface ExportOptions {
    /** The export formats supported by the data source. */
    formats?: ExportFormat[];
    /** The maximum number of records that can be exported. */
    maximum?: number;
}
export type IMExportOptions = ImmutableObject<ExportOptions>;
/**
 * Enum of the export format.
 */
export declare enum ExportFormat {
    CSV = "CSV",
    JSON = "JSON",
    GeoJSON = "GeoJSON",
    Item = "Item",
    Shapefile = "Shapefile",
    FileGDB = "FGDB",
    KML = "KML"
}
export type IMDataSourceJson = ImmutableObject<DataSourceJson>;
export declare enum SupportedUtilityType {
    GeoEnrichment = "GEOENRICH",
    Geometry = "GEOMETRY",
    GeoCoding = "GEOCODING",
    Printing = "PRINTING",
    Routing = "ROUTING",
    GPServer = "GPSERVER",
    GPTask = "GPTask"
}
export interface OrgGeocodeSetting {
    name: string;
    placeholder: string;
    batch?: boolean;
    geosearch?: boolean;
}
export interface OrgPrintSetting {
    templates: any;
}
export interface GPTaskInfo {
    name: string;
    label?: string;
    visible?: boolean;
    isPrintingTask?: boolean;
}
export interface UtilityJson {
    id: string;
    source: 'custom' | 'org';
    type: SupportedUtilityType;
    /**
     * If user renamed the utility, will save the new name here.
     */
    label?: string;
    /** The title of the item */
    sourceLabel?: string;
    /** Service name if it is from org utility */
    name?: string;
    /** name of a utility if it is in a org utility group */
    taskName?: string;
    /** Sequence of a utility if it is in a org utility group */
    index?: number;
    url?: string;
    /** tasks of a gp server */
    tasks?: GPTaskInfo[];
    itemId?: string;
    portalUrl?: string;
    orgSetting?: OrgGeocodeSetting | OrgPrintSetting;
}
export type IMUtilityJson = ImmutableObject<UtilityJson>;
export interface DataSourcesJson {
    [dsId: string]: DataSourceJson;
}
export interface UtilitiesJson {
    [utilityId: string]: UtilityJson;
}
export type IMDataSourcesJson = ImmutableObject<DataSourcesJson>;
export type IMUtilitiesJson = ImmutableObject<UtilitiesJson>;
export interface DataViewJson {
    /**
     * "selection" and "no_selection" are special data views.
     * For "selection" data view, we'll not create a JSON for it, its instance will be created in runtime.
     * If user configure a view for "when no selection", the view id should be "no_selection".
     */
    id: string;
    label: string;
    /**
     * By default, data view will use its data source type, but can override it.
     */
    type?: string;
    where?: SqlExpression;
    orderBy?: OrderByOption[];
    /** If return all fields, please don't set this property. */
    outFields?: string[];
    /** The page size used to do query. */
    pageSize?: number;
    /** Maximum number of records, records exceeds this number will not be returned. */
    maximum?: number;
    /**
     * Seconds.
     * null or undefined means honor layer's setting.
     * 0 means does not enable auto refresh.
     * > 0 means use custom refresh interval setting.
     */
    refreshInterval?: number;
}
export type IMDataViewJson = ImmutableObject<DataViewJson>;
export interface DataSourceLayerJson {
    id: string;
    title: string;
    url: string;
}
export type IMDataSourceLayerJson = ImmutableObject<DataSourceLayerJson>;
export interface MessageActionJson {
    actionId: string;
    description: string;
    widgetId?: string;
    sectionId?: string;
    messageWidgetId: string;
    actionName: string;
    config: any;
    /**
     * Data sources used in the action are saved here.
     */
    useDataSources?: UseDataSource[];
    version: string;
}
export type IMMessageActionJson = ImmutableObject<MessageActionJson>;
/**
 * The DataAction config JSON.
 */
export interface DataActionJson {
    actionId: string;
    widgetId: string;
    config?: any;
    enabled: boolean;
}
export type IMDataActionJson = ImmutableObject<DataActionJson>;
export interface MessageJson {
    id: string;
    widgetId: string;
    messageType: MessageType;
    actions: MessageActionJson[];
}
export type IMMessageJson = ImmutableObject<MessageJson>;
export interface MessagesJson {
    [messageConfigId: string]: MessageJson;
}
export type IMMessagesJson = ImmutableObject<MessagesJson>;
export declare enum TimezoneConfig {
    Device = "DEVICE",
    Specific = "SPECIFIC",
    Data = "DATA"
}
export interface Timezone {
    type: TimezoneConfig;
    value?: string;
}
export interface AttributesJson {
    /**
     * These properties will be set when app is downloaded.
     */
    title?: string;
    description?: string;
    tags?: string[];
    thumbnail?: string;
    /** The portal an experience connects to. */
    portalUrl?: string;
    /** The oauth2 client id. */
    clientId?: string;
    /** Indicate if the portal is webTier or not. */
    isWebTier?: boolean;
    /** @ignore */
    geometryService?: string;
    favicon?: IconResult;
    /**
     * Indicate which timezone is used for all data sources.
     */
    timezone?: Timezone;
    /**
     * Indicate if the app is express app or not.
     * Only the appConfig of the downloaded app has this property
    */
    express?: boolean;
    /**
     * Whether show accessibility settings for each widget.
     * @default false
    */
    enableA11yForWidgetSettings?: boolean;
}
export type IMAttributesJson = ImmutableObject<AttributesJson>;
/**
 * @ignore
 */
export interface HubJson {
    community: {
        portalUrl: string;
        orgId?: string;
    };
    initiative?: string;
}
/**
 * @ignore
 */
export type IMHubJson = ImmutableObject<HubJson>;
export type CustomThemeJson = Partial<ThemeVariables>;
export type IMCustomThemeJson = ImmutableObject<Partial<CustomThemeJson>>;
export interface ForBuilderAttributes {
    viewPortSize: {
        [browserSizeMode: string]: Size;
    };
    lockLayout: boolean;
}
export type IMForBuilderAttributes = ImmutableObject<ForBuilderAttributes>;
export interface ProxyJson {
    id: string;
    sourceUrl: string;
    proxyUrl: string;
    proxyId: string;
    hitsPerInterval?: number;
    intervalSeconds?: number;
}
export type IMProxyJson = ImmutableObject<ProxyJson>;
export interface HistoryLabels {
    pages?: {
        [pageId: string]: string[];
    };
    views?: {
        [viewId: string]: string[];
    };
    dialogs?: {
        [dlgId: string]: string[];
    };
}
export type IMHistoryLabels = ImmutableObject<HistoryLabels>;
export interface ProxiesJson {
    [proxyId: string]: ProxyJson;
}
export type IMProxiesJson = ImmutableObject<ProxiesJson>;
export interface Connection {
    type?: 'portal';
    portalUrl: string;
    clientId: string;
    portalVersion: number;
}
export type IMConnection = ImmutableObject<Connection>;
export interface PermissionRestriction {
    id: string;
    orgId: string;
    pageIds: string[];
    roleIds?: string[];
    groupIds?: string[];
}
export interface Permission {
    blockSignInPrompt: boolean;
    blockPermissionBanner: boolean;
    /***
    If this property exists, it means the page access control is enabled, only the allowed pages are accessible.
    Implement details:
    * In builder, we don't check the permission, this means users can edit the app can always see all the content of the app. Owner and admin can edit the permission, and the users in a shared-update-group can edit app but can not edit the permission.
    * When app is launched, we'll check the permission. The pages (and their content) that the user doesn't have permission will be removed from the app config.
    **/
    restrictions?: PermissionRestriction[];
}
export type IMPermission = ImmutableObject<Permission>;
export interface AppStateConfig {
    allowRestoreState?: boolean;
}
export interface UrlParamsConfig {
    general: {
        dataSelection: {
            isEnable: boolean;
            zoomToSelection?: boolean;
        };
    };
    widgets: {
        [key: `widget_${string}`]: UrlParamsWidgetsConfig;
    };
}
export interface UrlParamsWidgetsConfig {
    isEnable: boolean;
    params?: {
        [key: string]: boolean;
    };
}
export declare enum EConsentMode {
    Required = "REQUIRED",
    Optional = "OPTIONAL"
}
export declare enum ECookieBannerLayout {
    Horizontal = "HORIZONTAL",
    Vertical = "VERTICAL"
}
export interface CookieBannerJson {
    enable?: boolean;
    /** When certain fields of the cookie banner are changed, we need to reopen the banner, use uid to achieve it. */
    uid: string;
    refreshPeriodically?: boolean;
    refreshPeriod?: number;
    displayRichText?: string;
    consentMode?: EConsentMode;
    layout?: ECookieBannerLayout;
    positionSize?: {
        [sizeMode in BrowserSizeMode]?: FixedPositionSizeJson;
    };
    acceptAllButton: {
        label?: string;
        icon?: IMIconResult;
    };
    declineAllButton: {
        enable?: boolean;
        label?: string;
        icon?: IMIconResult;
    };
    cookieSettingsButton: {
        enable?: boolean;
        label?: string;
        icon?: IMIconResult;
    };
    closeButton: {
        label?: string;
        icon?: IMIconResult;
    };
    settings?: {
        performance?: {
            enable?: boolean;
            description?: string;
        };
    };
    effect?: AnimationSetting;
    backgroundStyle?: BackgroundStyle;
    border?: BorderStyle;
    borderRadius?: FourSidesUnit | ImmutableObject<FourSidesUnit>;
    boxShadow?: BoxShadowStyle;
    renewTime?: number;
}
export type IMCookieBannerJson = ImmutableObject<CookieBannerJson>;
export interface PlaceholderInfo {
    id: number;
    rootContainer: ContainerInfo;
    layoutInfo: LayoutInfo;
    syncs?: {
        [sizeMode: string]: LayoutInfo;
    };
}
export type IMPlaceholderInfo = ImmutableObject<PlaceholderInfo>;
/**
 * The translation json, which is used to save the translation of the config, including the config of widgets, pages, dialogs, etc.
 * The translation key is the path that can identify the string that needs to be translated, separated by dot. If it's an array, use [] to identify the index.
 * This is the same path rule of the `lodash.set()` method.
 * Here are some examples:
 * - pages.page_1.label // page label
 * - widgets.widget_1.config.functionConfig.text // button text
 * - widgets.widget_1.config.queryItems[0].name // query item name
 *
 * If the JSON key does not match a config property, it will be ignored.
 *
 * We need to create one translation file for each language, the file name is the language code, such as `en.json`, `zh.json`, etc.
 * The file content is this JSON object. Instead of saving the translation in the config, we save the language code in the `appConfig.languages` only.
 *
 * The translation files are saved the item resources, under the `translations` folder.
 * For for published version, they are under the `resources/translations` folder.
 * For the draft version, they are under the `resources/draft/translations` folder.
 */
export interface TranslationJson {
    [key: string]: string;
}
export interface Translation {
    value: string;
    label: string;
}
export type IMTranslation = ImmutableObject<Translation>;
/**
 * This interface defines the experience config structure.
 */
export interface AppConfig {
    /** Because one app can have multiple config.json, we add a name to identify the config. */
    name: string;
    /** The template that an experience created from. */
    template: string;
    /** User can configure an experience for multiple size modes, and the default size mode is saved here. The config user interface is not available yet. */
    mainSizeMode: BrowserSizeMode;
    /** Pages within an experience */
    pages: PagesJson;
    /** The structure of pages */
    pageStructure: Array<{
        [pageId: string]: string[];
    }>;
    /** Windows (dialogs) within an experience */
    dialogs: DialogsJson;
    /** Layouts within an experience */
    layouts: LayoutsJson;
    /** Floating panels for controller widget */
    controllerPanels: ControllerPanelsJson;
    /** Sections within an experience */
    sections?: SectionsJson;
    /** Views within an experience */
    views?: ViewsJson;
    /** Widgets within an experience */
    widgets: WidgetsJson;
    /** Screen groups within an experience */
    screenGroups: ScreenGroupsJson;
    /** Screens within an experience */
    screens: ScreensJson;
    /** The header of an experience */
    header: HeaderJson;
    /** The footer of an experience */
    footer: FooterJson;
    /** The theme uri, should end with "/". */
    theme: string;
    sharedThemeVariables?: SharedThemeVariables;
    customTheme?: CustomThemeJson;
    customThemeOptions?: ThemeOptions;
    /** Data sources within an experience */
    dataSources?: DataSourcesJson;
    utilities?: UtilitiesJson;
    appProxies?: ProxiesJson;
    /** The message configs of an experience */
    messageConfigs?: MessagesJson;
    attributes: AttributesJson;
    /** @ignore */
    analytics: Analytics;
    cookieBanner: CookieBannerJson;
    /**
     * If true, will read widget's manifest from `widgetsManifest`.
     * This value is false by default
     */
    useCachedManifest?: boolean;
    /**
     * The manifest here are raw manifest, need to be processed before use.
     * We save raw manifest here to save some network requests.
     *
     * When add a widget in builder, the manifest is not saved here because we need to fetch the latest manifest to check version info.
     * However, we can do this manually.
     */
    widgetsManifest: {
        [widgetUri: string]: WidgetManifest;
    };
    /** The widgets uri in this array will be loaded when the app loads, rather than dynamically loading the widget. */
    preloadWidgets?: string[];
    /**
     * The framework version when the experience is created/updated.
     *
     * When an old experience is opened in a new version code, this version will be set as the new code version.
     * */
    exbVersion: string;
    /**
     * As the `exbVersion` will be replaced with the code version when app is launched, we save the origin version
     * in config here.
     */
    originExbVersion: string;
    /** Only newly created experience (unpublished) configurations have this property. */
    __not_publish: boolean;
    /** These attributes are used by builder only. */
    forBuilderAttributes: ForBuilderAttributes;
    /** UTC timestamp for specific app config version. It's used for app's update. */
    timestamp: string;
    /**
     * This property will be set when publishing.
    */
    publishTimestamp?: string;
    /**
     * History labels are saved here because the labels may be used in URL.
     * This can avoid link broken.
     * This is done while publishing, which means all labels in the published app will be saved here.
     */
    historyLabels: HistoryLabels;
    /** Configure multiple portal connection information */
    connections?: Connection[];
    /** Permissions information */
    permission?: Permission;
    /** Whether adjust tab order automatically in the fixed layout. */
    useAutoSortInFixedLayout?: boolean;
    urlParams?: UrlParamsConfig;
    placeholderInfos?: {
        [placeholderId: string]: PlaceholderInfo;
    };
    appStateConfig?: AppStateConfig;
    /** The locale array. */
    translations?: Translation[];
    /** The locale when the app is created. */
    mainLocale?: string;
    /**
     * Translations for the multi-lang setting panel.
     * When open the multi-lang setting panel, the translations will be loaded from en.json, zh.json, etc.
     * The translation files are saved in the item resources, under the `translations` folder.
     * Multi-lang setting panel will update this property.
     * When save the app config, the translations will be saved into the en.json, zh.json, etc.
     * This property will be deleted in the saved config.
     */
    translationJsons?: {
        [locale: string]: TranslationJson;
    };
}
export type IMAppConfig = ImmutableObject<AppConfig>;
