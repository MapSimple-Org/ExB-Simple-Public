import { type DataSource, type IMDataSourceJson, type ImmutableArray, type UseDataSource, type AllDataSourceTypes } from 'jimu-core';
export declare function traverseGetToUseDss(parentDs: DataSource, toUseDss: DataSource[], toUseTypes: ImmutableArray<string>): void;
export declare function getWhetherUseDataSourceByTypes(dsJson: IMDataSourceJson, toUseTypes: ImmutableArray<string>): boolean;
export declare function getToUseChildDss(rootDss: DataSource[], toUseTypes: ImmutableArray<string>): Promise<{
    [rootDsId: string]: DataSource[];
}>;
export declare function getSortedLabels(labels: string[]): string[];
export declare function getAddedDataTypes(types: ImmutableArray<AllDataSourceTypes>): ImmutableArray<AllDataSourceTypes>;
export declare function getOutputTypes(types: ImmutableArray<AllDataSourceTypes>): ImmutableArray<AllDataSourceTypes>;
/**
 * Return all root data sources, which self is [to-use data sources](./components/ds-added-data.tsx) or which contains to-use child data sources.
 */
export declare function getAllToUseRootDss(toUseRootDss: Array<DataSource | IMDataSourceJson>, toUseChildDss: {
    [rootDsId: string]: DataSource[];
}): Array<DataSource | IMDataSourceJson>;
/**
 * Return all [to-use data sources](./components/ds-added-data.tsx).
 */
export declare function getAllToUseDss(toUseRootDss: Array<DataSource | IMDataSourceJson>, toUseChildDss: {
    [rootDsId: string]: DataSource[];
}): Array<DataSource | IMDataSourceJson>;
export declare enum DataSourceTab {
    Added = "ADDED",// user added data
    Output = "OUTPUT"
}
export declare function getDefaultSelectedTypes(types: ImmutableArray<AllDataSourceTypes>, useDataSources: ImmutableArray<UseDataSource>, hideAllOptionOfTypeDropdown: boolean): ImmutableArray<AllDataSourceTypes>;
export declare function isDataSourceInstance(ds: DataSource | IMDataSourceJson): ds is DataSource;
export declare function getUseDataSource(ds: DataSource | IMDataSourceJson): UseDataSource;
