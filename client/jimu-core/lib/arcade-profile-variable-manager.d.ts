import { type DataSource, DataSourceStatus } from './data-sources';
import type { IMUseDataSource, UseDataSource } from './types/app-config';
import type { SingleDataSourceProfileVariableInstances } from './types/arcade-content';
export type ArcadeDataSourceProfileVariableCallback = (dsId: string, data?: SingleDataSourceProfileVariableInstances) => void;
export type ArcadeDataSourceProfileVariableDirtyCallback = (dsId: string) => void;
/**
 * ArcadeProfileVariableManager is used to create Arcade profile variables for data sources.
 * ArcadeContentResolverComponent updates the data sources information used by Arcade through `registerResolverComponent` and `unregisterResolverComponent` methods.
 * ArcadeProfileVariableManager listens to various events from data sources by ArcadeProfileVariableManagerComponent in order to generate Arcade profile variables.
 */
export default class ArcadeProfileVariableManager {
    private static instance;
    static getInstance(): ArcadeProfileVariableManager;
    private componentInfoMap;
    private dataSourceInfoMap;
    private arcadeProfileVariableManagerComponent;
    constructor();
    /**
     * @ignore
     * Save the arcadeProfileVariableManagerComponent instance in order to update its useDataSources state.
     *
     * @param arcadeProfileVariableManagerComponent
     */
    setArcadeProfileVariableManagerComponent(arcadeProfileVariableManagerComponent: any): void;
    private updateUseDataSourcesForArcadeGlobalDataSourcesComponent;
    /**
     * Registers an ArcadeContentResolverComponent to listen for Arcade resources of the given useDataSources.
     * @param componentId
     * @param useDataSources
     * @param callback
     * @param dirtyCallback
     */
    registerResolverComponent(componentId: string, useDataSources: UseDataSource[], callback: ArcadeDataSourceProfileVariableCallback, dirtyCallback: ArcadeDataSourceProfileVariableDirtyCallback): void;
    /**
     * This method is called when ArcadeContentResolverComponent unmounts.
     * @param componentId
     */
    unregisterResolverComponent(componentId: string): void;
    private resolverComponentAddDataSource;
    private resolverComponentRemoveDataSourceId;
    /**
     * @ignore
     * @param ds
     */
    onDataSourceCreated(ds: DataSource): void;
    /**
     * @ignore
     * @param useDataSource
     * @param err
     * @returns
     */
    onCreateDataSourceFailed(useDataSource: IMUseDataSource, err: any): void;
    /**
     * @ignore
     * @param useDataSource
     */
    onQueryRequired(useDataSource: IMUseDataSource): void;
    /**
     * @ignore
     * @param useDataSource
     */
    onSelectionChange(useDataSource: IMUseDataSource): void;
    /**
     * @ignore
     * @param useDataSource
     * @param status
     * @param preStatus
     */
    onDataSourceStatusChange(useDataSource: IMUseDataSource, status: DataSourceStatus, preStatus?: DataSourceStatus): void;
    private increaseLatestVersion;
    private triggerDirtyCallback;
    private debounceCreateSingleDataSourceProfileVariableInstances;
    private isDataSourceInfoRefresh;
    private triggerCallbackWhenDataChanged;
    destroy(): void;
}
