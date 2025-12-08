import { type extensionSpec, type IMAppConfig, type IMState } from 'jimu-core';
import type { UnknownAction } from 'redux';
declare module 'jimu-core/lib/types/state' {
    interface State {
        appStateInBuilder?: IMState;
    }
}
declare module 'jimu-core' {
    interface State {
        appStateInBuilder?: IMState;
    }
}
export declare enum ExtActionKeys {
    InAppAppStateChanged = "IN_APP_APP_STATE_CHANGED",
    InBuilderAppConfigChanged = "IN_BUILDER_APP_CONFIG_CHANGED"
}
export interface InAppAppStateChangeAction extends UnknownAction {
    type: ExtActionKeys.InAppAppStateChanged;
    appState: IMState;
}
export interface InBuilderAppConfigChangeAction extends UnknownAction {
    type: ExtActionKeys.InBuilderAppConfigChanged;
    appConfig: IMAppConfig;
}
declare const actions: {
    inAppAppStateChanged: (appState: IMState) => InAppAppStateChangeAction;
    inBuilderAppConfigChanged: (appConfig: IMAppConfig) => InBuilderAppConfigChangeAction;
};
type ActionTypes = InAppAppStateChangeAction | InBuilderAppConfigChangeAction;
export { type ActionTypes as AppStateActionTypes, actions as appStateActions };
export default class BuilderAppStateReduxStoreExtension implements extensionSpec.ReduxStoreExtension {
    id: string;
    getActions(): any[];
    getInitLocalState(): any;
    getReducer(): (appState: IMState, action: ActionTypes, builderState: IMState) => IMState;
    getStoreKey(): string;
}
