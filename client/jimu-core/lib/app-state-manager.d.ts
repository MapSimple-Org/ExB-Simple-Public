export interface LocalState {
    app_current_page?: string;
    app_current_dlg?: string;
    app_current_views?: string[];
    [widgetId: string]: any;
}
type RestoreFunction = (lastLocalState: LocalState) => void;
/**
 * The `AppStateManager` is used to manage app state.
 * It handles local state persistence and restoration using IndexedDB.
 */
declare class AppStateManager {
    static instance: AppStateManager;
    /**
     * Get the singleton instance of the AppStateManager.
     * If in builder mode, use the app's state manager.
     */
    static getInstance(): AppStateManager;
    /**
     * Check if local state is supported.
     * Local state is supported if IndexedDB is available and the app is not builder, site, or in builder.
     */
    static isSupportLocalState(): boolean;
    private lastLocalState;
    private initialized;
    private localStateCache;
    /**
     * Store restore functions for both framework and widgets.
     * These function will be called after the user click the "Restore" button in the restore banner.
     */
    private readonly restoreFunctions;
    /**
     * Indicate whether framework and widgets should restore their local states.
     * This property will be set to true after the user click the "Restore" button in the restore banner.
     */
    private shouldRestoreLocalState;
    /**
     * Initialize the app state manager.
     * Load the local state from IndexedDB and store it in the `lastLocalState` property.
     * Show the restore banner if necessary.
     */
    init(): Promise<this>;
    /**
     * Indicate whether framework and widgets should restore their local states.
     * This method returns true after the user click the "Restore" button in the restore banner.
     */
    isLocalStateRestored(): boolean;
    /**
     * Save a key-value pair as a local state and persist it in IndexedDB.
     * This method won't change the `lastLocalState` property which is initialized in `init()` method.
     * For widgets, the `key` is the `widgetId`.
     */
    putLocalState(key: string, value: any): Promise<void>;
    /**
     * Get the persistent state from IndexedDB.
     * For widgets, the `key` is the `widgetId`.
     */
    getLocalState(key: string): Promise<any>;
    /**
     * Retrieve a value from the `lastLocalState` property by its key.
     */
    getLastLocalState(key: string): any;
    /**
     * Check if the `lastLocalState` property contains any data.
     * This is used to determine if there is any local state to restore.
     */
    existLocalState(): boolean;
    /**
     * Register a function to restore the local state.
     * If the `shouldRestoreLocalState` is true (meaning the user has clicked the "Restore" button), the function is executed immediately.
     */
    registerRestoreFunction(restoreFunction: RestoreFunction): void;
    /**
     * Restore the local state by executing all registered restore functions.
     */
    restoreLocalState(): void;
}
export default AppStateManager;
