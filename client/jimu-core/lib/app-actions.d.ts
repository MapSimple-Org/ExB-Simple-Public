/**
 * The redux actions to update redux app store.
 * @module
 */
import type { AppConfig, IMAppConfig } from './types/app-config';
import type { IMState, AppContext, AppRuntimeInfo, IMJimuMapViewInfo, SectionNavInfo, IMDataSourceInfo, IMMapWidgetInfo, DialogInfos, DataSourceInfo, DynamicStyleWidgetPreviewRepeatedRecordInfo, SystemError, SystemErrorType } from './types/state';
import type { Selection, ClipboardItem, LayoutInfo } from './types/layout';
import { type AppMode, BrowserSizeMode, type PagePart, type PortalInfo } from './types/common';
import type { UrlParameters, UrlHashParameters } from './types/url-parameters';
import { DataSourceStatus, type SelectOptions, type QueryParams } from './data-sources';
import type { IUser } from '@esri/arcgis-rest-request';
import type { I18nMessages } from './i18n';
import type { IMThemeVariables } from './types/theme';
import type { AppInfo } from './types/app-info';
import type { AnimationPlayMode } from './animation';
import type { ImmutableObject } from 'seamless-immutable';
import type { WidgetUpgradeInfo } from './base-widget';
import type { UnknownAction } from 'redux';
import type * as jimuUIModule from 'jimu-ui';
import type { ColorSchemeMode } from 'jimu-theme';
export declare enum ActionKeys {
    InitStoreExtensionState = "INIT_STORE_EXTENSION_STATE",
    AppConfigLoaded = "APP_CONFIG_LOADED",
    AppConfigChanged = "APP_CONFIG_CHANGED",
    ThemeVariablesChanged = "THEME_VARIABLES_CHANGED",
    SetPortalInfo = "SET_PORTAL_INFO",
    SetPortalSelf = "SET_PORTAL_SELF",
    WidgetClassLoaded = "WIDGET_CLASS_LOADED",
    WidgetConfigLoaded = "WIDGET_CONFIG_LOADED",
    WidgetsUpgraded = "WIDGETS_UPGRADED",
    WidgetUpgraded = "WIDGET_UPGRADED",
    OpenWidget = "OPEN_WIDGET",
    OpenWidgets = "OPEN_WIDGETS",
    CloseWidget = "CLOSE_WIDGET",
    CloseWidgets = "CLOSE_WIDGETS",
    ResetWidgetsState = "RESET_WIDGETS_STATE",
    SetWidgetIsInlineEditingState = "SET_WIDGET_IS_INLINE_EDITING_STATE",
    SetWidgetPreloadProps = "SET_WIDGET_PRELOAD_PROPS",
    ActivateWidget = "ACTIVATE_WIDGET",
    SetAppInBuilder = "SET_APP_IN_BUILDER",
    LayoutClassLoaded = "LAYOUT_CLASS_LOADED",
    AppContextInit = "APP_CONTEXT_INIT",
    I18nMessagesLoaded = "I18N_MESSAGES_LOADED",
    QueryObjectChanged = "QUERY_OBJECT_CHANGED",
    UrlHashObjectChanged = "URL_HASH_OBJECT_CHANGED",
    AppModeChanged = "APP_MODE_CHANGED",
    SelectionChanged = "SELECTION_CHANGED",
    AppRuntimeInfoInit = "APP_RUNTIME_INFO_INIT",
    CurrentPageChanged = "CURRENT_PAGE_CHANGED",
    CurrentDialogChanged = "CURRENT_DIALOG_CHANGED",
    DialogInfosChanged = "DIALOG_INFOS_CHANGED",
    ClipboardChanged = "CLIPBOARD_CHANGED",
    AppPathChanged = "APP_PATH_CHANGED",
    AppIdChanged = "APP_ID_CHANGED",
    AppInfoChanged = "APP_INFO_CHANGED",
    NetworkStatusChanged = "NETWORK_STATUS_CHANGED",
    DataSourceStatusChanged = "DATA_SOURCE_STATUS_CHANGED",
    DataSourceCountStatusChanged = "DATA_SOURCE_COUNT_STATUS_CHANGED",
    DataSourceInstanceStatusChanged = "DATA_SOURCE_INSTANCE_STATUS_CHANGED",
    DataSourceSaveStatusChanged = "DATA_SOURCE_SAVE_STATUS_CHANGED",
    DataSourceVersionAdded = "DATA_SOURCE_VERSION_ADDED",
    DataSourceSourceVersionAdded = "DATA_SOURCE_SOURCE_VERSION_ADDED",
    DataSourceSelectedIndexesChanged = "DATA_SOURCE_SELECTED_INDEXES_CHANGED",
    DataSourceSelectionChanged = "DATA_SOURCE_SELECTION_CHANGED",
    SetDataSourcePreloadData = "SET_DATA_SOURCE_PRELOAD_DATA",
    SetDataNeedRefresh = "SET_DATA_NEED_REFRESH",
    SetDataLastRefreshTime = "SET_DATA_LAST_REFRESH_TIME",
    UpdateWidgetQuery = "UPDATE_WIDGET_QUERY",
    ChangeDataSourceGDBVersion = "CHANGE_DATA_SOURCE_GDB_VERSION",
    ClearDataSourceInfo = "CLEAR_DATA_SOURCE_INFO",
    UpdateDataSourceInfo = "UPDATE_DATA_SOURCE_INFO",
    BatchUpdateDataSourceInfo = "BATCH_UPDATE_DATA_SOURCE_INFO",
    JimuMapViewAdded = "JIMU_MAP_VIEW_ADDED",
    JimuMapViewRemoved = "JIMU_MAP_VIEW_REMOVED",
    JimuMapViewUpdated = "JIMU_MAP_VIEW_UPDATED",
    MapWidgetInfoAdded = "MAP_WIDGET_INFO_ADDED",
    MapWidgetInfoRemoved = "MAP_WIDGET_INFO_REMOVED",
    MapWidgetInfoUpdated = "MAP_WIDGET_INFO_UPDATED",
    RequestAutoControlMapWidget = "REQUEST_AUTO_CONTROL_MAP_WIDGET",
    ReleaseAutoControlMapWidget = "RELEASE_AUTO_CONTROL_MAP_WIDGET",
    WidgetStatePropChange = "WIDGET_STATE_PROP_CHANGE",
    WidgetMutableStatePropChange = "WIDGET_MUTABLE_STATE_PROP_CHANGE",
    UserSignIn = "USER_SIGN_IN",
    UserSignOut = "USER_SIGN_OUT",
    BrowserSizeModeChanged = "BROWSER_SIZE_MODE_CHANGED",
    UpdateStoreState = "UPDATE_STORE_STATE",
    ActivePagePartChanged = "ACTIVE_PAGE_PART_CHANGED",
    ChangeThemeMode = "CHANGE_THEME_MODE",
    OpenOverlay = "OPEN_OVERLAY",
    CloseOverlay = "CLOSE_OVERLAY",
    ActiveOverlay = "ACTIVE_OVERLAY",
    SetIsBusy = "SET_IS_BUSY",
    ZoomScaleChanged = "ZOOM_SCALE_CHANGED",
    SectionNavInfoChanged = "SECTION_NAV_INFO_CHANGED",
    SetupAnimationPreview = "SETUP_ANIMATION_PREVIEW",
    ClearAnimationPreview = "CLEAR_ANIMATION_PREVIEW",
    SetupHoverPreview = "SETUP_HOVER_PREVIEW",
    ScreenGroupNavInfoChanged = "SCREEN_GROUP_NAV_INFO_CHANGE",
    UserLocaleChanged = "USER_LOCALE_CHANGED",
    SetSystemError = "SET_SYSTEM_ERROR",
    ClearSystemError = "CLEAR_SYSTEM_ERROR",
    AddToRegisterClientIdList = "ADD_TO_REGISTER_CLIENT_ID_LIST",
    RemoveFromRegisterClientIdList = "REMOVE_FROM_REGISTER_CLIENT_ID_LIST",
    UpdateNoPermissionResourceChangedFlag = "UPDATE_NO_PERMISSION_RESOURCE_CHANGED_FLAG",
    UpdateResourceSessions = "UPDATE_RESOURCE_SESSIONS",
    ScreenPanelVisibleChange = "SCREEN_PANEL_VISIBLE_CHANGE",
    ActivePrintPreview = "ACTIVE_PRINT_PREVIEW",
    QuitPrintPreview = "QUIT_PRINT_PREVIEW",
    UtilityStateChange = "UTILITY_STATE_CHANGE",
    SaveThumbnailUrl = "SAVE_THUMBNAIL_URL",
    OpenCookieBannerSetting = "OPEN_COOKIE_BANNER_SETTING",
    OpenCookieSettingsWindow = "OPEN_COOKIE_SETTINGS_WINDOW",
    OpenCookieBannerByPrivacyPanel = "OPEN_COOKIE_BANNER_BY_PRIVACY_PANEL",
    OpenCookieBannerByUrl = "OPEN_COOKIE_BANNER_BY_URL",
    WidgetToolbarStateChange = "WIDGET_TOOLBAR_STATE_CHANGE",
    WidgetRuntimeInfoChange = "WIDGET_RUNTIME_INFO_CHANGE",
    CurrentGuideChange = "CURRENT_GUIDE_CHANGE",
    ChangeDynamicStylePreviewConditionInfo = "CHANGE_DYNAMIC_STYLE_PREVIEW_CONDITION_INFO",
    ChangeDynamicStylePreviewRepeatedRecordInfo = "CHANGE_DYNAMIC_STYLE_PREVIEW_REPEATED_RECORD_INFO",
    SetNoPermissionPages = "SET_NO_PERMISSION_PAGES"
}
export type ActionTypes = AppConfigLoadedAction | AppConfigChangedAction | AppIdChangedAction | SetPortalSelfAction | WidgetClassLoadedAction | WidgetsUpgradedAction | WidgetUpgradedAction | WidgetConfigLoadedAction | OpenWidgetAction | OpenWidgetsAction | CloseWidgetAction | CloseWidgetsAction | ResetWidgetsStateAction | AppRuntimeInfoInitAction | ThemeVariablesChangedAction | AppInfoChangedAction | ActivateWidgetAction | CurrentDialogChangedAction | DialogInfosChangedAction | AppContextInitAction | I18nMessagesLoadedAction | QueryObjectChangedAction | UrlHashObjectChangedAction | SetAppInBuilderAction | DataSourceInstanceStatusChangeAction | AppModeChangedAction | InitAction | LayoutClassLoadedAction | DataSourceStatusChangeAction | DataSourceCountStatusChangeAction | DataSourceVersionChangeAction | DataSourceSourceVersionChangeAction | InitStoreExtensionStateAction | WidgetStatePropChangeAction | WidgetMutableStatePropChangeAction | DataSourceSelectedIndexChangeAction | DataSourceSelectionChangeAction | JimuMapViewAddedAction | JimuMapViewRemovedAction | JimuMapViewUpdatedAction | UserSignInAction | UserSignOutAction | BrowserSizeModeChangedAction | SetWidgetIsInlineEditingStateAction | DataSourceSaveStatusChangeAction | SetWidgetPreloadPropsAction | SetDataSourcePreloadDataAction | AppPathChangedAction | NetworkStatusChangedAction | SetPortalInfoAction | SelectionChangedAction | UpdateStoreStateAction | CurrentPageChangedAction | UpdateDataSourceInfoAction | BatchUpdateDataSourceInfoAction | ActivePagePartChangedAction | ChangeThemeModeAction | OpenOverlayAction | CloseOverlayAction | ActiveOverlayAction | ChangeDataSourceGDBVersionAction | ClearDataSourceInfoAction | SetIsBusyAction | ZoomScaleChangedAction | ClipboardChangedAction | SectionNavInfoChangedAction | SetDataNeedRefreshAction | SetDataLastRefreshTimeAction | UpdateWidgetQueryAction | SetupAnimationPreviewAction | ClearAnimationPreviewAction | SetupHoverPreviewAction | ScreenGroupNavInfoChangedAction | UserLocaleChangedAction | SetSystemErrorAction | ClearSystemErrorAction | RequestAutoControlMapWidgetAction | ReleaseAutoControlMapWidgetAction | MapWidgetInfoAddedAction | MapWidgetInfoRemovedAction | MapWidgetInfoUpdatedAction | ScreenPanelVisibleChangeAction | AddToRegisterClientIdListAction | RemoveFromRegisterClientIdListAction | ActivePrintPreviewAction | QuitPrintPreviewAction | UpdateNoPermissionResourceChangedFlagAction | UtilityStateChangeAction | UpdateResourceSessionsAction | SaveThumbnailUrlAction | OpenCookieBannerAction | OpenCookieSettingsWindowAction | OpenCookieBannerByPrivacyPanelAction | OpenCookieBannerByUrlAction | WidgetToolbarStateChangeAction | WidgetRuntimeInfoChangeAction | GuideInfoChangeAction | ChangeDynamicStylePreviewConditionInfoAction | ChangeDynamicStylePreviewRepeatedRecordInfoAction | SetNoPermissionPagesAction;
interface InitAction extends UnknownAction {
    type: '@@INIT';
}
export interface InitStoreExtensionStateAction extends UnknownAction {
    type: ActionKeys.InitStoreExtensionState;
    extensionId: string;
}
export interface AppConfigLoadedAction extends UnknownAction {
    type: ActionKeys.AppConfigLoaded;
    appConfig: AppConfig;
}
export interface AppConfigChangedAction extends UnknownAction {
    type: ActionKeys.AppConfigChanged;
    appConfig: IMAppConfig;
}
export interface AppIdChangedAction extends UnknownAction {
    type: ActionKeys.AppIdChanged;
    appId: string;
}
export interface WidgetClassLoadedAction extends UnknownAction {
    type: ActionKeys.WidgetClassLoaded;
    widgetUri: string;
}
export interface WidgetsUpgradedAction extends UnknownAction {
    type: ActionKeys.WidgetsUpgraded;
    widgetUri: string;
    upgradeInfos?: WidgetUpgradeInfo[];
}
export interface WidgetUpgradedAction extends UnknownAction {
    type: ActionKeys.WidgetUpgraded;
    widgetId: string;
    upgradeInfo?: WidgetUpgradeInfo;
}
export interface WidgetConfigLoadedAction extends UnknownAction {
    type: ActionKeys.WidgetConfigLoaded;
    widgetId: string;
    config: any;
}
export interface WidgetToolbarStateChangeAction extends UnknownAction {
    type: ActionKeys.WidgetToolbarStateChange;
    widgetId: string;
    toolNames: string[];
}
export interface WidgetRuntimeInfoChangeAction extends UnknownAction {
    type: ActionKeys.WidgetRuntimeInfoChange;
    widgetId: string;
    prop: string;
    value: any;
}
export interface OpenWidgetAction extends UnknownAction {
    type: ActionKeys.OpenWidget;
    widgetId: string;
}
export interface OpenWidgetsAction extends UnknownAction {
    type: ActionKeys.OpenWidgets;
    widgetIds: string[];
}
export interface ActivateWidgetAction extends UnknownAction {
    type: ActionKeys.ActivateWidget;
    widgetId: string;
}
export interface CloseWidgetAction extends UnknownAction {
    type: ActionKeys.CloseWidget;
    widgetId: string;
}
export interface CloseWidgetsAction extends UnknownAction {
    type: ActionKeys.CloseWidgets;
    widgetIds: string[];
}
export interface ResetWidgetsStateAction extends UnknownAction {
    type: ActionKeys.ResetWidgetsState;
    widgetIds: string[];
}
export interface AppContextInitAction extends UnknownAction {
    type: ActionKeys.AppContextInit;
    appContext: AppContext;
}
export interface I18nMessagesLoadedAction extends UnknownAction {
    type: ActionKeys.I18nMessagesLoaded;
    key: string;
    messages: I18nMessages;
}
export interface QueryObjectChangedAction extends UnknownAction {
    type: ActionKeys.QueryObjectChanged;
    query: UrlParameters;
}
export interface UrlHashObjectChangedAction extends UnknownAction {
    type: ActionKeys.UrlHashObjectChanged;
    hash: UrlHashParameters;
}
export interface SetAppInBuilderAction extends UnknownAction {
    type: ActionKeys.SetAppInBuilder;
}
export interface AppModeChangedAction extends UnknownAction {
    type: ActionKeys.AppModeChanged;
    mode: AppMode;
}
export interface AppPathChangedAction extends UnknownAction {
    type: ActionKeys.AppPathChanged;
    path: string;
}
export interface AppInfoChangedAction extends UnknownAction {
    type: ActionKeys.AppInfoChanged;
    appInfo: Partial<AppInfo>;
}
export interface LayoutClassLoadedAction extends UnknownAction {
    type: ActionKeys.LayoutClassLoaded;
    layoutName: string;
}
export interface DataSourceStatusChangeAction extends UnknownAction {
    type: ActionKeys.DataSourceStatusChanged;
    dataSourceId: string;
    status: DataSourceStatus;
}
export interface DataSourceCountStatusChangeAction extends UnknownAction {
    type: ActionKeys.DataSourceCountStatusChanged;
    dataSourceId: string;
    countStatus: DataSourceStatus;
}
export interface DataSourceInstanceStatusChangeAction extends UnknownAction {
    type: ActionKeys.DataSourceInstanceStatusChanged;
    dataSourceId: string;
    status: DataSourceStatus;
}
export interface DataSourceSaveStatusChangeAction extends UnknownAction {
    type: ActionKeys.DataSourceSaveStatusChanged;
    dataSourceId: string;
    saveStatus: DataSourceStatus;
}
export interface DataSourceVersionChangeAction extends UnknownAction {
    type: ActionKeys.DataSourceVersionAdded;
    dataSourceId: string;
}
export interface DataSourceSourceVersionChangeAction extends UnknownAction {
    type: ActionKeys.DataSourceSourceVersionAdded;
    dataSourceId: string;
}
export interface ChangeDataSourceGDBVersionAction extends UnknownAction {
    type: ActionKeys.ChangeDataSourceGDBVersion;
    dataSourceId: string;
    gdbVersion: string;
}
export interface ClearDataSourceInfoAction extends UnknownAction {
    type: ActionKeys.ClearDataSourceInfo;
    dataSourceId: string;
}
export interface UpdateDataSourceInfoAction extends UnknownAction {
    type: ActionKeys.UpdateDataSourceInfo;
    dataSourceId: string;
    dataSourceInfo: IMDataSourceInfo;
}
export interface BatchUpdateDataSourceInfoAction extends UnknownAction {
    type: ActionKeys.BatchUpdateDataSourceInfo;
    dataSourcesInfo: ImmutableObject<{
        [dataSourceId: string]: DataSourceInfo;
    }>;
}
export interface DataSourceSelectedIndexChangeAction extends UnknownAction {
    type: ActionKeys.DataSourceSelectedIndexesChanged;
    dataSourceId: string;
    selectedIndexes: number[];
}
export interface DataSourceSelectionChangeAction extends UnknownAction {
    type: ActionKeys.DataSourceSelectionChanged;
    dataSourceId: string;
    selectOptions: SelectOptions;
}
export interface SetDataNeedRefreshAction extends UnknownAction {
    type: ActionKeys.SetDataNeedRefresh;
    dataSourceId: string;
    refresh: boolean;
}
export interface SetDataLastRefreshTimeAction extends UnknownAction {
    type: ActionKeys.SetDataLastRefreshTime;
    dataSourceId: string;
    lastAutoRefreshCheckTime: number;
}
export interface UpdateWidgetQueryAction extends UnknownAction {
    type: ActionKeys.UpdateWidgetQuery;
    dataSourceId: string;
    widgetId: string;
    query: QueryParams;
}
export interface JimuMapViewAddedAction extends UnknownAction {
    type: ActionKeys.JimuMapViewAdded;
    jimuMapViewId: string;
    jimuMapViewInfo: IMJimuMapViewInfo;
}
export interface JimuMapViewUpdatedAction extends UnknownAction {
    type: ActionKeys.JimuMapViewUpdated;
    jimuMapViewId: string;
    jimuMapViewInfo: IMJimuMapViewInfo;
}
export interface JimuMapViewRemovedAction extends UnknownAction {
    type: ActionKeys.JimuMapViewRemoved;
    jimuMapViewId: string;
}
export interface RequestAutoControlMapWidgetAction extends UnknownAction {
    type: ActionKeys.RequestAutoControlMapWidget;
    mapWidgetId: string;
    autoControlWidgetId: string;
}
export interface ReleaseAutoControlMapWidgetAction extends UnknownAction {
    type: ActionKeys.ReleaseAutoControlMapWidget;
    mapWidgetId: string;
}
export interface MapWidgetInfoAddedAction extends UnknownAction {
    type: ActionKeys.MapWidgetInfoAdded;
    mapWidgetId: string;
    mapWidgetInfo: IMMapWidgetInfo;
}
export interface MapWidgetInfoRemovedAction extends UnknownAction {
    type: ActionKeys.MapWidgetInfoRemoved;
    mapWidgetId: string;
}
export interface MapWidgetInfoUpdatedAction extends UnknownAction {
    type: ActionKeys.MapWidgetInfoUpdated;
    mapWidgetId: string;
    mapWidgetInfo: IMMapWidgetInfo;
}
export interface WidgetStatePropChangeAction extends UnknownAction {
    type: ActionKeys.WidgetStatePropChange;
    widgetId: string;
    propKey: string;
    value: any;
}
export interface WidgetMutableStatePropChangeAction extends UnknownAction {
    type: ActionKeys.WidgetMutableStatePropChange;
    widgetId: string;
    propKey: string;
}
export interface SetPortalInfoAction extends UnknownAction {
    type: ActionKeys.SetPortalInfo;
    portalInfo: PortalInfo;
}
export interface DataSourceSelectedIndexesChangeAction extends UnknownAction {
    type: ActionKeys.DataSourceSelectedIndexesChanged;
    dataSourceId: string;
    selectedIndexes: number[];
}
export interface UserSignInAction extends UnknownAction {
    type: ActionKeys.UserSignIn;
    user: IUser;
}
export interface UserSignOutAction extends UnknownAction {
    type: ActionKeys.UserSignOut;
}
export interface BrowserSizeModeChangedAction extends UnknownAction {
    type: ActionKeys.BrowserSizeModeChanged;
    browserSizeMode: BrowserSizeMode;
}
export interface SetWidgetIsInlineEditingStateAction extends UnknownAction {
    type: ActionKeys.SetWidgetIsInlineEditingState;
    widgetId: string;
    isInlineEditing: boolean;
}
export interface SetWidgetPreloadPropsAction extends UnknownAction {
    type: ActionKeys.SetWidgetPreloadProps;
    widgetId: string;
    props: any;
}
export interface SetDataSourcePreloadDataAction extends UnknownAction {
    type: ActionKeys.SetDataSourcePreloadData;
    dataSourceId: string;
    data: any[];
}
export interface NetworkStatusChangedAction extends UnknownAction {
    type: ActionKeys.NetworkStatusChanged;
    isOffLine: boolean;
}
export interface SelectionChangedAction extends UnknownAction {
    type: ActionKeys.SelectionChanged;
    selection: Selection;
}
export interface ClipboardChangedAction extends UnknownAction {
    type: ActionKeys.ClipboardChanged;
    item: ClipboardItem;
}
export interface UpdateStoreStateAction extends UnknownAction {
    type: ActionKeys.UpdateStoreState;
    state: IMState;
}
export interface AppRuntimeInfoInitAction extends UnknownAction {
    type: ActionKeys.AppRuntimeInfoInit;
    info: Partial<AppRuntimeInfo>;
}
export interface ThemeVariablesChangedAction extends UnknownAction {
    type: ActionKeys.ThemeVariablesChanged;
    theme: IMThemeVariables;
}
export interface SetPortalSelfAction extends UnknownAction {
    type: ActionKeys.SetPortalSelf;
    portalSelf: any;
}
export interface CurrentPageChangedAction extends UnknownAction {
    type: ActionKeys.CurrentPageChanged;
    pageId: string;
}
export interface CurrentDialogChangedAction extends UnknownAction {
    type: ActionKeys.CurrentDialogChanged;
    dialogId: string;
}
export interface DialogInfosChangedAction extends UnknownAction {
    type: ActionKeys.DialogInfosChanged;
    dialogInfos: DialogInfos;
}
export interface ActivePagePartChangedAction extends UnknownAction {
    type: ActionKeys.ActivePagePartChanged;
    part: PagePart;
}
export interface ChangeThemeModeAction extends UnknownAction {
    type: ActionKeys.ChangeThemeMode;
    value: ColorSchemeMode;
}
export interface OpenOverlayAction extends UnknownAction {
    type: ActionKeys.OpenOverlay;
    id: string;
    modalId?: string;
}
export interface CloseOverlayAction extends UnknownAction {
    type: ActionKeys.CloseOverlay;
    id: string;
}
export interface ActiveOverlayAction extends UnknownAction {
    type: ActionKeys.ActiveOverlay;
    id: string;
}
export interface SetIsBusyAction extends UnknownAction {
    type: ActionKeys.SetIsBusy;
    isBusy: boolean;
    loadingType: jimuUIModule.LoadingType;
    loadingText: string;
}
export interface ZoomScaleChangedAction extends UnknownAction {
    type: ActionKeys.ZoomScaleChanged;
    zoomScale: number;
}
export interface SectionNavInfoChangedAction extends UnknownAction {
    type: ActionKeys.SectionNavInfoChanged;
    sectionId: string;
    navInfo: SectionNavInfo;
}
export interface ScreenGroupNavInfoChangedAction extends UnknownAction {
    type: ActionKeys.ScreenGroupNavInfoChanged;
    screenGroupId: string;
    activeIndex: number;
    scrollIntoView: boolean;
}
export interface ScreenPanelVisibleChangeAction extends UnknownAction {
    type: ActionKeys.ScreenPanelVisibleChange;
    screenId: string;
    visible: boolean;
}
export interface SetupAnimationPreviewAction extends UnknownAction {
    type: ActionKeys.SetupAnimationPreview;
    data: {
        layoutInfo?: LayoutInfo;
        pageId?: string;
        playMode?: AnimationPlayMode;
        id: number;
    };
}
export interface ClearAnimationPreviewAction extends UnknownAction {
    type: ActionKeys.ClearAnimationPreview;
}
export interface SetupHoverPreviewAction extends UnknownAction {
    type: ActionKeys.SetupHoverPreview;
    data: {
        layoutInfo?: LayoutInfo;
        pageId?: string;
        id: number;
    };
}
export interface UserLocaleChangedAction extends UnknownAction {
    type: ActionKeys.UserLocaleChanged;
    locale: string;
    translatedLocale: string;
    isRTL: boolean;
}
export interface SetSystemErrorAction extends UnknownAction {
    type: ActionKeys.SetSystemError;
    systemError: SystemError;
}
export interface ClearSystemErrorAction extends UnknownAction {
    type: ActionKeys.ClearSystemError;
    systemErrorType: SystemErrorType;
}
export interface AddToRegisterClientIdListAction extends UnknownAction {
    type: ActionKeys.AddToRegisterClientIdList;
    portalUrl: string;
    needToSignIn?: boolean;
    forceLogin?: boolean;
    serviceUrl?: string;
}
export interface RemoveFromRegisterClientIdListAction extends UnknownAction {
    type: ActionKeys.RemoveFromRegisterClientIdList;
    portalUrl: string;
}
export interface UpdateNoPermissionResourceChangedFlagAction extends UnknownAction {
    type: ActionKeys.UpdateNoPermissionResourceChangedFlag;
}
export interface UpdateResourceSessionsAction extends UnknownAction {
    type: ActionKeys.UpdateResourceSessions;
    resourceRootUrl: string;
    userName: string;
}
export interface ActivePrintPreviewAction extends UnknownAction {
    type: ActionKeys.ActivePrintPreview;
}
export interface QuitPrintPreviewAction extends UnknownAction {
    type: ActionKeys.QuitPrintPreview;
}
export interface UtilityStateChangeAction extends UnknownAction {
    type: ActionKeys.UtilityStateChange;
    id: string;
    success: boolean;
    isSignInError?: boolean;
}
export interface SaveThumbnailUrlAction extends UnknownAction {
    type: ActionKeys.SaveThumbnailUrl;
    saveThumbnailUrl: string;
}
export interface OpenCookieBannerAction extends UnknownAction {
    type: ActionKeys.OpenCookieBannerSetting;
    isSettingOpen: boolean;
}
export interface OpenCookieSettingsWindowAction extends UnknownAction {
    type: ActionKeys.OpenCookieSettingsWindow;
    isCookieSettingsWindowOpen: boolean;
}
export interface OpenCookieBannerByPrivacyPanelAction extends UnknownAction {
    type: ActionKeys.OpenCookieBannerByPrivacyPanel;
    isCookieBannerOpenByPrivacyPanel: boolean;
}
export interface OpenCookieBannerByUrlAction extends UnknownAction {
    type: ActionKeys.OpenCookieBannerByUrl;
    isCookieBannerOpenByUrl: boolean;
}
export interface GuideInfoChangeAction extends UnknownAction {
    type: ActionKeys.CurrentGuideChange;
    guideId: string;
    shouldCheckGuideDisplay: boolean;
}
export interface ChangeDynamicStylePreviewConditionInfoAction extends UnknownAction {
    type: ActionKeys.ChangeDynamicStylePreviewConditionInfo;
    widgetId: string;
    value: any;
}
export interface ChangeDynamicStylePreviewRepeatedRecordInfoAction extends UnknownAction {
    type: ActionKeys.ChangeDynamicStylePreviewRepeatedRecordInfo;
    widgetId: string;
    value: any;
}
export interface SetNoPermissionPagesAction extends UnknownAction {
    type: ActionKeys.SetNoPermissionPages;
    pages: Array<{
        id: string;
        label: string;
        isDefault: boolean;
    }>;
}
export declare function appConfigLoaded(appConfig: any): AppConfigLoadedAction;
/**
 * Dispatch this action to update app config in store.
 */
export declare function appConfigChanged(appConfig: IMAppConfig): AppConfigChangedAction;
export declare function appPathChanged(path: string): AppPathChangedAction;
export declare function appInfoChanged(appInfo: Partial<AppInfo>): AppInfoChangedAction;
export declare function appIdChanged(appId: string): AppIdChangedAction;
export declare function widgetClassLoaded(widgetUri: string): WidgetClassLoadedAction;
/**
 * UpgradeInfo is optional. If it is not provided, the version will be upgraded only.
 */
export declare function widgetsUpgraded(widgetUri: string, upgradeInfos?: WidgetUpgradeInfo[]): WidgetsUpgradedAction;
export declare function widgetUpgraded(widgetId: string, upgradeInfo?: WidgetUpgradeInfo): WidgetUpgradedAction;
export declare function widgetConfigLoaded(widgetId: string, config: any): WidgetConfigLoadedAction;
export declare function widgetToolbarStateChange(widgetId: string, toolNames: string[]): WidgetToolbarStateChangeAction;
export declare function widgetRuntimeInfoChange(widgetId: string, prop: string, value: any): WidgetRuntimeInfoChangeAction;
/**
 * Dispatch this action to open a widget.
 * @param widgetId The widget id to open.
 */
export declare function openWidget(widgetId: string): OpenWidgetAction;
/**
 * Dispatch this action to open multiple widgets.
 * @param widgetIds The widget ids to open.
 */
export declare function openWidgets(widgetIds: string[]): OpenWidgetsAction;
/**
 * Dispatch this action to close a widget.
 * @param widgetId The widget id to close.
 */
export declare function closeWidget(widgetId: string): CloseWidgetAction;
/**
 * Dispatch this action to close multiple widgets.
 * @param widgetIds The widget ids to close.
 */
export declare function closeWidgets(widgetIds: string[]): CloseWidgetsAction;
export declare function resetWidgetsState(widgetIds: string[]): ResetWidgetsStateAction;
export declare function activateWidget(widgetId: string): ActivateWidgetAction;
export declare function initAppContext(appContext: AppContext): AppContextInitAction;
export declare function i18nMessagesLoaded(key: string, messages: I18nMessages): I18nMessagesLoadedAction;
export declare function queryObjectChanged(query: UrlParameters): QueryObjectChangedAction;
export declare function urlHashObjectChanged(hash: UrlHashParameters): UrlHashObjectChangedAction;
export declare function setAppInBuilder(): SetAppInBuilderAction;
export declare function appModeChanged(mode: AppMode): AppModeChangedAction;
export declare function layoutClassLoaded(layoutName: any): LayoutClassLoadedAction;
export declare function dataSourceStatusChanged(dataSourceId: string, status: DataSourceStatus): DataSourceStatusChangeAction;
export declare function dataSourceCountStatusChanged(dataSourceId: string, status: DataSourceStatus): DataSourceCountStatusChangeAction;
export declare function dataSourceInstanceStatusChanged(dataSourceId: string, status: DataSourceStatus): DataSourceInstanceStatusChangeAction;
export declare function dataSourceSaveStatusChanged(dataSourceId: string, saveStatus: DataSourceStatus): DataSourceSaveStatusChangeAction;
export declare function dataSourceVersionAdded(dataSourceId: string): DataSourceVersionChangeAction;
export declare function dataSourceSourceVersionAdded(dataSourceId: string): DataSourceSourceVersionChangeAction;
/**
 * To change to the default GDB version, set the version to null.
 * @param dataSourceId
 * @param gdbVersion
 */
export declare function changeDataSourceGDBVersion(dataSourceId: string, gdbVersion: string): ChangeDataSourceGDBVersionAction;
export declare function clearDataSourceInfo(dataSourceId: string): ClearDataSourceInfoAction;
export declare function updateDataSourceInfo(dataSourceId: string, dataSourceInfo: IMDataSourceInfo): UpdateDataSourceInfoAction;
export declare function batchUpdateDataSourceInfo(dataSourcesInfo: ImmutableObject<{
    [dataSourceId: string]: DataSourceInfo;
}>): BatchUpdateDataSourceInfoAction;
export declare function setDataNeedRefresh(dataSourceId: string, refresh: boolean): SetDataNeedRefreshAction;
export declare function setDataLastRefreshTime(dataSourceId: string, lastAutoRefreshCheckTime: number): SetDataLastRefreshTimeAction;
export declare function updateWidgetQuery(dataSourceId: string, widgetId: string, query: QueryParams): UpdateWidgetQueryAction;
export declare function jimuMapViewAdded(jimuMapViewId: string, jimuMapViewInfo: IMJimuMapViewInfo): JimuMapViewAddedAction;
export declare function jimuMapViewUpdated(jimuMapViewId: string, jimuMapViewInfo: IMJimuMapViewInfo): JimuMapViewUpdatedAction;
export declare function jimuMapViewRemoved(jimuMapViewId: string): JimuMapViewRemovedAction;
export declare function requestAutoControlMapWidget(mapWidgetId: string, autoControlWidgetId: string): RequestAutoControlMapWidgetAction;
export declare function releaseAutoControlMapWidget(mapWidgetId: string): ReleaseAutoControlMapWidgetAction;
export declare function MapWidgetInfoAdded(mapWidgetId: string, mapWidgetInfo: IMMapWidgetInfo): MapWidgetInfoAddedAction;
export declare function MapWidgetInfoUpdated(mapWidgetId: string, mapWidgetInfo: IMMapWidgetInfo): MapWidgetInfoUpdatedAction;
export declare function MapWidgetInfoRemoved(mapWidgetId: string): MapWidgetInfoRemovedAction;
export declare function initStoreExtensionState(extensionId: string): InitStoreExtensionStateAction;
export declare function widgetStatePropChange(widgetId: string, propKey: string, value: any): WidgetStatePropChangeAction;
export declare function widgetMutableStatePropChange(widgetId: string, propKey: string): WidgetMutableStatePropChangeAction;
export declare function setPortalInfo(portalInfo: PortalInfo): SetPortalInfoAction;
export declare function dataSourceSelectedIndexesChanged(dataSourceId: string, indexes: number[]): DataSourceSelectedIndexesChangeAction;
export declare function dataSourceSelectionChanged(dataSourceId: string, options: SelectOptions): DataSourceSelectionChangeAction;
export declare function userSignIn(user: IUser): UserSignInAction;
export declare function userSignOut(): UserSignOutAction;
export declare function browserSizeModeChanged(browserSizeMode: BrowserSizeMode): BrowserSizeModeChangedAction;
export declare function setWidgetIsInlineEditingState(widgetId: string, isInlineEditing: boolean): SetWidgetIsInlineEditingStateAction;
export declare function setWidgetPreloadProps(widgetId: string, props: any): SetWidgetPreloadPropsAction;
export declare function setDataSourcePreloadData(dataSourceId: string, data: any[]): SetDataSourcePreloadDataAction;
export declare function networkStatusChanged(isOffLine: boolean): NetworkStatusChangedAction;
export declare function currentPageChanged(pageId: string): CurrentPageChangedAction;
export declare function currentDialogChanged(dialogId: string): CurrentDialogChangedAction;
export declare function dialogInfosChanged(dialogInfos: DialogInfos): DialogInfosChangedAction;
export declare function selectionChanged(selection: Selection): SelectionChangedAction;
export declare function clipboardChanged(item: ClipboardItem): ClipboardChangedAction;
export declare function updateStoreState(state: IMState): UpdateStoreStateAction;
export declare function appRuntimeInfoInit(info: Partial<AppRuntimeInfo>): AppRuntimeInfoInitAction;
export declare function themeVariablesChanged(theme: IMThemeVariables): ThemeVariablesChangedAction;
export declare function setPortalSelf(portalSelf: any): SetPortalSelfAction;
export declare function activePagePartChanged(part: any): ActivePagePartChangedAction;
export declare function ThemeModeChanged(value: ColorSchemeMode): ChangeThemeModeAction;
export declare function openOverlay(id: string, modalId?: string): OpenOverlayAction;
export declare function closeOverlay(id: string): CloseOverlayAction;
export declare function activeOverlay(id: string): ActiveOverlayAction;
export declare function zoomScaleChange(zoomScale: number): ZoomScaleChangedAction;
export declare function setIsBusy(isBusy: boolean, loadingType?: jimuUIModule.LoadingType, loadingText?: string): SetIsBusyAction;
export declare function sectionNavInfoChanged(sectionId: string, navInfo: SectionNavInfo): SectionNavInfoChangedAction;
export declare function screenGroupNavInfoChanged(screenGroupId: string, activeIndex: number, scrollIntoView?: boolean): ScreenGroupNavInfoChangedAction;
export declare function screenPanelVisibleChanged(screenId: string, visible: boolean): ScreenPanelVisibleChangeAction;
export declare function setupAnimationPreview(data: {
    layoutInfo?: LayoutInfo;
    pageId?: string;
    controllerId?: string;
    dialogId?: string;
    playMode: AnimationPlayMode;
    id: number;
}): SetupAnimationPreviewAction;
export declare function clearAnimationPreview(): ClearAnimationPreviewAction;
export declare function setupHoverPreview(data: {
    layoutInfo: LayoutInfo;
    pageId: string;
    dialogId: string;
    id: number;
}): SetupHoverPreviewAction;
export declare function userLocaleChanged(locale: string, translatedLocale: string, isRTL: boolean): UserLocaleChangedAction;
export declare function setSystemError(systemError: SystemError): SetSystemErrorAction;
export declare function clearSystemError(systemErrorType: SystemErrorType): ClearSystemErrorAction;
export declare function addToRegisterClientIdList(portalUrl: string, needToSignIn?: boolean, serviceUrl?: string, forceLogin?: boolean): AddToRegisterClientIdListAction;
export declare function removeFromRegisterClientIdList(portalUrl: string): RemoveFromRegisterClientIdListAction;
export declare function updateNoPermissionResourceChangedFlag(): UpdateNoPermissionResourceChangedFlagAction;
export declare function updateResourceSessions(resourceRootUrl: string, userName: string): UpdateResourceSessionsAction;
export declare function activePrintPreview(): ActivePrintPreviewAction;
export declare function quitPrintPreview(): QuitPrintPreviewAction;
export declare function utilityStateChange(id: string, success: boolean, isSignInError?: boolean): UtilityStateChangeAction;
export declare function saveThumbnailUrl(saveThumbnailUrl: string): SaveThumbnailUrlAction;
export declare function OpenCookieBannerSetting(isSettingOpen: boolean): OpenCookieBannerAction;
export declare function OpenCookieSettingsWindow(isCookieSettingsWindowOpen: boolean): OpenCookieSettingsWindowAction;
export declare function OpenCookieBannerByPrivacyPanel(isCookieBannerOpenByPrivacyPanel: boolean): OpenCookieBannerByPrivacyPanelAction;
export declare function OpenCookieBannerByUrl(isCookieBannerOpenByUrl: boolean): OpenCookieBannerByUrlAction;
export declare function CurrentGuideChange(guideId: string, shouldCheckGuideDisplay: boolean): GuideInfoChangeAction;
export declare function changeDynamicStylePreviewConditionInfo(widgetId: string, value: any): ChangeDynamicStylePreviewConditionInfoAction;
export declare function changeDynamicStylePreviewRepeatedRecordInfo(widgetId: string, value: DynamicStyleWidgetPreviewRepeatedRecordInfo): ChangeDynamicStylePreviewRepeatedRecordInfoAction;
export declare function setNoPermissionPages(pages: Array<{
    id: string;
    label: string;
    isDefault: boolean;
}>): SetNoPermissionPagesAction;
export {};
