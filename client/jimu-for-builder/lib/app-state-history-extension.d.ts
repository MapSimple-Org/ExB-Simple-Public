import type { IMState, extensionSpec, IMHistoryState } from 'jimu-core';
declare enum ActionKeys {
    InBuilderPutAppConfigIntoHistory = "IN_BUILDER_PUT_APPCONFIG_INTO_HISTORY",
    InBuilderRemoveLastAppConfigFromHistory = "IN_BUILDER_REMOVE_LAST_APPCONFIG_FROM_HISTORY",
    InBuilderReplaceLastAppConfigInHistory = "IN_BUILDER_REPLACE_LAST_APPCONFIG_IN_HISTORY",
    InBuilderAppConfigUndo = "IN_BUILDER_APPCONFIG_UNDO",
    InBuilderAppConfigRedo = "IN_BUILDER_APPCONFIG_REDO",
    InBuilderAppConfigRedoClear = "IN_BUILDER_APPCONFIG_REDOCLEAR",
    InBuilderAppConfigClear = "IN_BUILDER_APPCONFIG_CLEAR"
}
declare module 'jimu-core/lib/types/state' {
    interface State {
        appStateHistory?: IMHistoryState;
    }
}
declare module 'jimu-core' {
    interface State {
        appStateHistory?: IMHistoryState;
    }
}
declare const actions: {
    InBuilderAppConfigUndo: () => {
        type: ActionKeys;
    };
    InBuilderAppConfigRedo: () => {
        type: ActionKeys;
    };
    InBuilderPutAppConfigIntoHistory: (appState: any) => {
        type: ActionKeys;
        appState: any;
    };
    InBuilderRemoveLastAppConfigFromHistory: () => {
        type: ActionKeys;
    };
    InBuilderReplaceLastAppConfigInHistory: (appState: any) => {
        type: ActionKeys;
        appState: any;
    };
    InBuilderAppConfigRedoClear: () => {
        type: ActionKeys;
    };
    InBuilderAppConfigClear: () => {
        type: ActionKeys;
    };
};
export { actions as appStateHistoryActions, ActionKeys as AppStateHistoryActionKeys };
export default class AppStateHistoryExtension implements extensionSpec.ReduxStoreExtension {
    id: string;
    getActions(): ActionKeys[];
    getInitLocalState(): {
        past: any[];
        future: any[];
    };
    getReducer(): (historyState: IMHistoryState, action: any, builderState: IMState) => any;
    handleAppStateUndo(state: any): any;
    handleAppStateRedo(state: any): any;
    handleAppStateAdd(state: any, appState: any): any;
    handleAppStateRemoveLast(state: IMHistoryState): IMHistoryState;
    handleAppStateReplaceLast(state: IMHistoryState, appState: any): IMHistoryState;
    handleAppStateRedoClear(state: any): any;
    handleAppStateClear(state: any): any;
    getStoreKey(): string;
}
