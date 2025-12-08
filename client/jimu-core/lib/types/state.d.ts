import type { AppConfig, IMSizeModeLayoutJson } from './app-config';
import type { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import type { IMUrlHashParameters, UrlParameters } from './url-parameters';
import type { SelectOptions, DataSourceStatus, QueryParams } from '../data-sources';
import type { AppMode, WidgetState, LayoutItemConstructorProps, BrowserSizeMode, PagePart } from './common';
import type { Selection, ClipboardItem, LayoutInfo } from './layout';
import type { IUser } from '@esri/arcgis-rest-request';
import type { I18nMessages } from '../i18n';
import type JimuConfig from './jimu-config';
import type { AnimationPlayMode } from '../animation';
import type { AppInfo } from './app-info';
import type * as jimuUIModule from 'jimu-ui';
import type { ColorSchemeMode } from 'jimu-theme';
/**
 * Widget runtime info.
 */
export interface RuntimeInfo {
    /** Indicator as to whether or not a widget class is loaded. */
    isClassLoaded?: boolean;
    /** Indicator as to whether or not a widget is in inline editing state. */
    isInlineEditing?: boolean;
    /** The controller widget id that this widget belongs to. */
    controllerWidgetId?: string;
    shouldExpandContextTool?: boolean;
    /**
     * The widget's state.
     *
     * - The `OPENED` and `CLOSED` state are valid only when a widget is put into a widget controller.
     * When a widget is not put into the widget controller, for performance reason, the widget does not have any state by default.
     *
     * - For `ACTIVE` state, see {@link WidgetManifestProperties.needActiveState}
     * - For `HIDDEN` state, see {@link WidgetManifestProperties.needHiddenState}
     * */
    state?: WidgetState;
    /** The window's state. Possible values of `normal`, `minimized` or `maximized`. */
    windowState?: 'normal' | 'minimized' | 'maximized';
    layoutItemTools?: {
        [toolId: string]: WidgetLayoutItemToolInfo;
    };
}
export interface WidgetLayoutItemToolInfo {
    version: number;
}
export type IMRuntimeInfo = ImmutableObject<RuntimeInfo>;
export interface RuntimeInfos {
    [id: string]: RuntimeInfo;
}
export type IMRuntimeInfos = ImmutableObject<RuntimeInfos>;
/** @ignore */
export type IMLayoutState = ImmutableObject<{
    [clazz: string]: boolean;
}>;
/** This interface defines the properties that are not changed after the app loaded. */
export interface AppContext {
    /** @ignore */
    isInPortal: boolean;
    /** The locale that the experience will use. The user's profile is used for sign-in users, while the browser's locale is used for anonymous users. */
    locale: string;
    /** Whether the app is oriented right to left. */
    isRTL: boolean;
    /** The best match translation locale. All of the supported translations can be found this way:
     * ```
     * import {translatedLocales} from 'jimu-core'
     * ```
     * */
    translatedLocale: string;
    /** Indicates whether access is from a touch device.  */
    isTouchDevice: boolean;
    /** Indicates whether the app is builder. */
    /** @ignore */
    isBuilder: boolean;
    /** Indicates whether the app is loaded in builder. */
    isInBuilder: boolean;
    /** @ignore */
    isSite: boolean;
    jimuConfig: JimuConfig;
}
/**
 * The data source info which provides status, count, selected ids, widget queries and more.
 */
export interface DataSourceInfo {
    /** The `DataSourceInfo` `instanceStatus` property indicates the create status of the data source. The `instanceStatus`
     * is of type [`DataSourceStatus`](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/DataSourceStatus) enum.
     */
    instanceStatus: DataSourceStatus;
    status: DataSourceStatus;
    countStatus: DataSourceStatus;
    /** @ignore */
    saveStatus?: DataSourceStatus;
    /** An immutable array of selected `DataSource` ids. */
    selectedIds?: string[];
    /**
     * If widgets select records by `dataSource.selectRecords`, the data source will save the original select options here.
     * The data source will use `selectOptions` to query records and save IDs of the query result to `selectedIds`. So if widgets only need to highlight the selected records, please just watch changes of `selectedIds`.
     */
    selectOptions?: SelectOptions;
    /**
     * Whenever a data source is changed on the client side, the `version` is incremented +1. The `version` is 1 when the data is loaded for the first time.
     */
    version?: number;
    /**
     * Whenever the source of data source is changed, the `sourceVersion` is incremented +1. The `sourceVersion` is 1 when the data is loaded for the first time.
     */
    sourceVersion?: number;
    /**
     * The query parameters widgets applied to the `DataSource`.
     * The query does not have page info.
     */
    widgetQueries?: {
        [widgetId: string]: QueryParams;
    };
    /**
     * This property applies only to a `QueriableDataSource`.
     * For static data, the data does not need refresh.
     * For auto refresh data, the data requires a refresh on arrival of the refresh interval.
     */
    needRefresh?: boolean;
    /**
     * This property applies only to a `QueriableDataSource`.
     * Timestamp (in milliseconds) indicating when the data was last refreshed.
     */
    lastAutoRefreshCheckTime?: number;
    /**
     * This property applies only to  `FeatureLayerDataSource`.
     * The `gdbVersion` applies to the gdb version used when querying/adding/updating a feature layer.
     * For additional information, please see:
     *  [Query (Feature Service/Layer)](https://developers.arcgis.com/rest/services-reference/query-feature-service-layer-.htm)
     *  [Version Management Service](https://developers.arcgis.com/rest/services-reference/version-management-service.htm)
     */
    gdbVersion?: string;
}
/** The `JimuMapViewStatus` enum provides values available to the status of the `JimuMapView`. */
export declare enum JimuMapViewStatus {
    Loading = "LOADING",
    Loaded = "LOADED",
    Failed = "FAILED"
}
/** The `JimuMapViewInfo` interface provides properties relative to the `JimuMapView`. */
export interface JimuMapViewInfo {
    /** The `id` property provides the id of the `JimuMapView`. */
    id: string;
    /** The `mapWidgetId` property provides the id of the map widget that creates the `JimuMapView`. */
    mapWidgetId: string;
    /** The `isActive` property indicates whether the `JimuMapView` is active. */
    isActive?: boolean;
    /** The `dataSourceId` property provides the id related to the `DataSource` of the `JimuMapView`. */
    dataSourceId: string;
    /** The `status` property provides the `JimuMapViewStatus`. */
    status: JimuMapViewStatus;
}
export interface MapWidgetInfo {
    mapWidgetId?: string;
    /**
     * This value does not have to be the widget id.
     * For example, when the measure tool in the map widget controls the map, this value might be something like 'widget_1-measure-tool'.
     */
    autoControlWidgetId?: string;
}
export interface SectionNavInfo {
    visibleViews?: string[];
    currentViewId?: string;
    previousViewId?: string;
    progress?: number;
    useProgress?: boolean;
    useStep?: boolean;
    playId?: number;
    withOneByOne?: boolean;
}
export type IMJimuMapViewInfo = ImmutableObject<JimuMapViewInfo>;
export type IMMapWidgetInfo = ImmutableObject<MapWidgetInfo>;
export type IMDataSourceInfo = ImmutableObject<DataSourceInfo>;
export type IMUser = ImmutableObject<IUser>;
export type IMSelection = ImmutableObject<Selection>;
export type IMSectionNavInfo = ImmutableObject<SectionNavInfo>;
interface DialogInfo {
    canClose: boolean;
    checked?: boolean;
    isClosed: boolean;
    alertVersion?: number;
}
export interface DialogInfos {
    [dialogId: string]: DialogInfo;
}
export type IMDialogInfos = ImmutableObject<DialogInfos>;
export interface AppRuntimeInfo {
    appMode: AppMode;
    /** The current rendered page. */
    currentPageId: string;
    /** @ignore */
    currentDialogId: string;
    /** The dialogs that have been or are currently opened, including fixed and anchored. */
    openedDialogIds: string[];
    sectionNavInfos: {
        [sectionId: string]: IMSectionNavInfo;
    };
    /** active screen of each screenGroup */
    screenGroupNavInfos: {
        [screenGroupId: string]: {
            activeIndex: number;
            scrollIntoView: boolean;
        };
    };
    /** @ignore this is the layout being edited. */
    activeLayout?: IMSizeModeLayoutJson;
    /** @ignore the page part that is active, default value is 'body'. */
    activePagePart: PagePart;
    /** The current selection. */
    selection: IMSelection;
    clipboard: ClipboardItem;
    /** @ignore */
    draggingWidget?: LayoutItemConstructorProps;
    /** @ignore */
    dragoverLayoutId?: string;
    /** @ignore Show loading mask when isBusy is true. */
    isBusy?: boolean;
    loadingType?: jimuUIModule.LoadingType;
    loadingText?: string;
    /** @ignore */
    zoomScale?: number;
    /**
     * @ignore
     * Manage closed-related info of all closed dialogs.
     * Purpose:
     *  splash and page dialogs should display once only when builder/app loads unless it is triggered by TOC.
     *  Confirmation checkbox should control all linked widgets.
     */
    dialogInfos: DialogInfos;
    utilityStates?: {
        [utilityId: string]: UtilityState;
    };
    animationPreview?: {
        pageId?: string;
        dialogId?: string;
        controllerId?: string;
        layoutInfo?: LayoutInfo;
        playMode?: AnimationPlayMode;
        id: number;
    };
    hoverPreview?: {
        pageId?: string;
        dialogId?: string;
        layoutInfo?: LayoutInfo;
        id: number;
    };
    screenPanelStates?: {
        [key: string]: boolean;
    };
    /**
     * Indicate whether it's in print preview mode. User can use `?print_preview=true` or use a link to active to this mode.
     */
    isPrintPreview?: boolean;
    /**
     * @ignore
     * Store saved thumbnail url to prevent repeatedly saving the same image in builder
     */
    saveThumbnailUrl?: string;
    /**
     * @ignore
     * Runtime states used by the cookie banner
     */
    cookieBanner?: {
        /** Indicate whether the cookie banner's setting panel is opened, this is used by the dynamic-setting widget */
        isCookieBannerSettingOpen?: boolean;
        /** Indicate whether the cookie banner's preferences modal is opened, which has essential cookie, performance cookie, .etc */
        isCookieSettingsWindowOpen?: boolean;
        /** Indicate whether the cookie banner is opened by the app-setting -> privacy panel */
        isCookieBannerOpenByPrivacyPanel?: boolean;
        /** Indicate whether the cookie banner is opened by the url's cookie_banner param */
        isCookieBannerOpenByUrl?: boolean;
    };
    noPermissionPages?: Array<{
        id: string;
        label: string;
        isDefault: boolean;
    }>;
    /**
     * The theme mode of the app, either 'light' or 'dark'.
     */
    themeMode?: ColorSchemeMode;
}
export type IMAppRuntimeInfo = ImmutableObject<AppRuntimeInfo>;
export interface MutableStatePropsVersion {
    [propKey: string]: number;
}
export interface WidgetsMutableStateVersion {
    [widgetId: string]: MutableStatePropsVersion;
}
export interface PortalNeedToRegisterClientId {
    portalUrl: string;
    needToSignIn: boolean;
    serviceUrl?: string;
    forceLogin?: boolean;
}
export interface ResourceSessions {
    [key: string]: string;
}
export declare enum SystemErrorType {
    AppError = "APP_ERROR",
    PrivilegeError = "PRIVILEGE_ERROR",
    OAuthError = "OAUTH_ERROR"
}
export declare enum SystemErrorCode {
    AppNotPublished = "APP_NOT_PUBLISHED",
    AppNotExisted = "APP_NOT_EXISTED",
    AppPage404 = "APP_PAGE_404",
    PrivilegeNullInfo = "PRIVILEGE_NULL_INFO",
    PrivilegeInvalidUserLevel = "PRIVILEGE_INVALID_USER_LEVEL",
    PrivilegeInvalidPrivilege = "PRIVILEGE_INVALID_PRIVILEGE",
    PrivilegeInvalidLicense = "PRIVILEGE_INVALID_LICENSE",
    PrivilegeInvalidAppBlockedByOrg = "PRIVILEGE_INVALID_APP_BLOCK_BY_ORG",
    PrivilegeInvalidResourceExperience = "PRIVILEGE_INVALID_RESOURCE_EXPERIENCE",
    PrivilegeInvalidResourceItem = "PRIVILEGE_INVALID_RESOURCE_ITEM",
    PrivilegeInvalidResourcePermission = "PRIVILEGE_INVALID_RESOURCE_PERMISSION",
    PrivilegeInvalidResourcePermissionForReadOnly = "PRIVILEGE_INVALID_RESOURCE_PERMISSION_FOR_READ_ONLY",
    PrivilegeInvalidMainSession = "PRIVILEGE_INVALID_MAIN_SESSION",
    PrivilegeInvalidPagePermission = "PRIVILEGE_INVALID_PAGE_PERMISSION",
    OAuthPublicUserLimit = "OAUTH_PUBLIC_USER_LIMIT",
    OAuthAppLicenceLimit = "OAUTH_APP_LICENCE_LIMIT",
    OAuthOthers = "OAUTH_OTHERS"
}
export interface SystemError {
    type: SystemErrorType;
    code: SystemErrorCode;
    message?: string;
    name?: string;
}
export interface UtilityState {
    success: boolean;
    isSignInError?: boolean;
}
export interface DynamicStyleWidgetPreviewRepeatedRecordInfo {
    recordIndex: number;
    needUpdateRecordIndex?: boolean;
}
export interface DynamicStyleState {
    previewRepeatedRecordInfo?: {
        [widgetId: string]: DynamicStyleWidgetPreviewRepeatedRecordInfo;
    };
    previewConditionInfo?: {
        [widgetId: string]: {
            conditionId: number;
        };
    };
}
/** The redux store state. */
export interface State {
    /**
     * The portal url that the app will connect to, not ending in a slash. It will look like:
     *  `http://esridevbeijing.maps.arcgis.com`
     *
     * If the `appConfig` has a `portalUrl`, it will be copied to this property, or we'll
     * get the `portalUrl` through other logic, such as via the browser URL, user input, etc.
     *
     * The `portalUrl` can have a `null`value. However, the `portalUrl` in `appConfig` will always be set via the builder.
     */
    portalUrl?: string;
    /** The OAuth2 app ID from the Portal specified in the `portalUrl`. */
    clientId?: string;
    /** The response of the portal self call, used to return the view of the
     * portal as seen by the current user, whether anonymous or signed in. More information on the `portalSelf` call
     * can be viewed via the [ArcGIS REST API](https://developers.arcgis.com/rest/users-groups-and-items/portal-self.htm).  */
    portalSelf: any;
    /** Whether the portal is a Web-tier portal. */
    isWebTier?: boolean;
    /** Indicator as to whether network is offline. */
    isNetworkOffLine: boolean;
    browserSizeMode: BrowserSizeMode;
    /** The immutable `AppConfig` JSON object contains information about the app's configuration. For more information,
     * see the [AppConfig](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/AppConfig) Interface.
     */
    appConfig: AppConfig;
    /** The immutable `AppContext` JSON object contains information about the app's context. Form more information, see
     * [AppContext](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/AppContext) Interface.
     */
    appContext: AppContext;
    /** The immutable `AppRuntimeInfo` JSON object contains information about the app's mode ('Run'or 'Design'), the current rendered page, and others.  */
    appRuntimeInfo: AppRuntimeInfo;
    /** The immutable `AppInfo` JSON object contains information about the app including the name, a text description, a username, thumbnail, id, etc. */
    appInfo: AppInfo;
    /**
     * The current path in the URL, which includes the page(p1).
     */
    appPath: string;
    /**
     * For the Experience Builder ArcGIS Online and Portal editions, `appId` is the `itemId`.
     * For the Experience Builder Dev Edition, the `appId` is a value as a string such as 1 , 2, 3, etc.
     * When the app is downloaded and deployed, the `appId` is `null`.
     * When using `?config=<>` to load app, the `appId` is the config url.
     */
    appId: string;
    /**
     * @ignore
     * widgetsRuntimeInfo
     */
    widgetsRuntimeInfo: RuntimeInfos;
    widgetsClassStatus: {
        [widgetUri: string]: boolean;
    };
    /**
     * @ignore
     * The properties returned by getPreloadPros.
     * We put the properties in state because when widget is rendered in server, we need to pass these properties to client.
     */
    widgetsPreloadProps: {
        [widgetId: string]: any;
    };
    /**
     * @ignore
     * The data here use jimuFieldName as key.
     */
    dataSourcesPreloadData: {
        [dsId: string]: any[];
    };
    /** The parsed object of the location.search. The immutable `UrlParameters` interface JSON object. This includes the `locale`, the app id, the page id, etc.   */
    queryObject: UrlParameters;
    urlHashObject: IMUrlHashParameters;
    appI18nMessages: I18nMessages;
    /** `dataSourcesInfo` is an immutable object containing the immutable `DataSourceInfo` for each data source within an experience.
     * See [`DatSourceInfo`](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/DataSourceInfo) for more information.
     */
    dataSourcesInfo: {
        [dsId: string]: DataSourceInfo;
    };
    /** `jimuMapViewsInfo` is an immutable object containing the immutable `JimuMapViewInfo` for each map view within an experience.
     * See [`JimuMapViewInfo`](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/JimuMapViewInfo) for more information.
     */
    jimuMapViewsInfo: {
        [jimuMapViewId: string]: JimuMapViewInfo;
    };
    /**
     * @ignore
     */
    mapWidgetsInfo: {
        [mapWidgetId: string]: MapWidgetInfo;
    };
    /**
     * `widgetsState` is an immutable object containing the widget id and its state.
     * A widget can put any state here to preserve the state when the widget is destroyed.
     * */
    widgetsState: {
        [widgetId: string]: any;
    };
    /**
     * @ignore
     * Only the version is stored here, the actual state object is saved in MutableStoreManager.
     */
    widgetsMutableStateVersion: WidgetsMutableStateVersion;
    user?: IMUser;
    /** @ignore */
    overlays: string[];
    systemError: SystemError;
    portalsNeedToRegisterClientId: PortalNeedToRegisterClientId[];
    noPermissionResourceChangedFlag: string;
    resourceSessions: ResourceSessions;
    guideId: string;
    shouldCheckGuideDisplay: boolean;
    /**
     * @ignore
     * `dynamicStyleState` is used to save the state of dynamic style component.
     */
    dynamicStyleState: DynamicStyleState;
}
export type IMState = ImmutableObject<State>;
/** @ignore */
export interface HistoryStateItem {
    appConfig: AppConfig;
    appInfo: AppInfo;
}
/** @ignore */
export interface StateHistory {
    past: ImmutableArray<HistoryStateItem>;
    future: ImmutableArray<HistoryStateItem>;
}
/** @ignore */
export type IMHistoryState = ImmutableObject<StateHistory>;
export declare enum AppType {
    Experience = "Web Experience",
    Template = "Web Experience Template"
}
export {};
