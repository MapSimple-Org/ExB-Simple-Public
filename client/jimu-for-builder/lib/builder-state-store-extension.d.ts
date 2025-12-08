import { type IMRuntimeInfos, type ImmutableObject, type LayoutInfo, type IMState, type extensionSpec } from 'jimu-core';
import type { ToolbarConfig } from 'jimu-layouts/layout-runtime';
import type { UnknownAction } from 'redux';
interface WidgetMessageActionSettingStatus {
    [widgetId: string]: boolean;
}
interface BuilderState {
    currentAppId: string;
    widgetsSettingRuntimeInfo?: IMRuntimeInfos;
    widgetsSettingClassStatus: ImmutableObject<{
        [widgetUri: string]: boolean;
    }>;
    widgetSettingI18nMessages: ImmutableObject<{
        [widgetName: string]: any;
    }>;
    refreshAppList: boolean;
    toolbarConfig?: ToolbarConfig;
    contentToDelete?: LayoutInfo;
    widgetMessageActionSettingStatus?: WidgetMessageActionSettingStatus;
}
type IMBuilderState = ImmutableObject<BuilderState>;
/**
 * To simplify the builder widgets communication, we store a shared state in store
 */
declare module 'jimu-core/lib/types/state' {
    interface State {
        builder?: IMBuilderState;
    }
}
declare module 'jimu-core' {
    interface State {
        builder?: IMBuilderState;
    }
}
declare enum ActionKeys {
    SelectTemplate = "SELECT_TEMPLATE",
    WidgetSettingClassLoaded = "WIDGET_SETTING_CLASS_LOADED",
    WidgetsRemoved = "WIDGETS_REMOVED",
    WidgetsAdded = "WIDGETS_ADDED",
    ChangeCurrentApp = "CHANGE_CURRENT_APP",
    RefreshAppList = "REFRSH_APPLIST",
    WidgetSettingI18nMessageLoaded = "WIDGET_SETTING_I18N_MESSAGE_LOADED",
    ConfirmDeleteContentChanged = "CONFIRM_DELETE_CONTENT_CHANGED",
    MessageActionSettingOpenStateChange = "MESSAGE_ACTION_OPEN_STATE_CHANGE"
}
export interface SelectTemplateAction extends UnknownAction {
    type: ActionKeys.SelectTemplate;
    templateName: string;
}
export interface MessageActionSettingOpenStateChangeAction extends UnknownAction {
    type: ActionKeys.MessageActionSettingOpenStateChange;
    widgetId: string;
    open: boolean;
}
export interface WidgetSettingClassLoadedAction extends UnknownAction {
    type: ActionKeys.WidgetSettingClassLoaded;
    wigetUri: string;
}
export interface WidgetsAddedAction extends UnknownAction {
    type: ActionKeys.WidgetsAdded;
    widgets: Array<{
        widgetId: string;
        widgetUri: string;
    }>;
}
export interface WidgetsRemovedAction extends UnknownAction {
    type: ActionKeys.WidgetsRemoved;
    widgetIds: string[];
}
export interface ChangeCurrentAppAction extends UnknownAction {
    type: ActionKeys.ChangeCurrentApp;
    appId: string;
}
export interface RefreshAppListAction extends UnknownAction {
    type: ActionKeys.RefreshAppList;
    isRefresh: boolean;
}
export interface WidgetSettingI18nMessageLoadedAction extends UnknownAction {
    type: ActionKeys.WidgetSettingI18nMessageLoaded;
    widgetName: string;
    i18nMessages: any;
}
export interface ConfirmDeleteContentChangedAction extends UnknownAction {
    type: ActionKeys.ConfirmDeleteContentChanged;
    itemToDelete: LayoutInfo;
}
type ActionTypes = SelectTemplateAction | WidgetSettingClassLoadedAction | WidgetsAddedAction | WidgetsRemovedAction | RefreshAppListAction | ChangeCurrentAppAction | WidgetSettingI18nMessageLoadedAction | ConfirmDeleteContentChangedAction | MessageActionSettingOpenStateChangeAction;
export { ActionKeys as BuilderStateActionTypes };
declare const actions: {
    selectTemplate: (templateName: string) => SelectTemplateAction;
    refreshAppListAction: (isRefresh: boolean) => RefreshAppListAction;
    widgetSettingClassLoaded: (wigetUri: string) => {
        type: ActionKeys;
        wigetUri: string;
    };
    changeMessageActionSettingOpenState: (widgetId: string, open: boolean) => MessageActionSettingOpenStateChangeAction;
    widgetsAdded: (widgets: Array<{
        widgetId: string;
        widgetUri: string;
    }>) => {
        type: ActionKeys;
        widgets: {
            widgetId: string;
            widgetUri: string;
        }[];
    };
    widgetsRemoved: (widgetIds: string[]) => {
        type: ActionKeys;
        widgetIds: string[];
    };
    changeCurrentApp: (appId: string) => ChangeCurrentAppAction;
    widgetSettingI18nMessageLoaded: (widgetName: string, i18nMessages: any) => WidgetSettingI18nMessageLoadedAction;
    confirmDeleteContentChanged: (itemToDelete: LayoutInfo) => ConfirmDeleteContentChangedAction;
};
export { actions as builderActions, ActionKeys as builderActionKeys };
export default class BuilderStateReduxStoreExtension implements extensionSpec.ReduxStoreExtension {
    id: string;
    getActions(): any[];
    getInitLocalState(): IMBuilderState;
    getReducer(): (builderState: IMBuilderState, action: ActionTypes, builderFullState: IMState) => IMBuilderState;
    getStoreKey(): string;
}
