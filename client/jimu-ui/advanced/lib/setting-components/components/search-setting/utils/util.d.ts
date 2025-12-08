import { type SceneLayerDataSource, type FeatureLayerDataSource, type IMFieldSchema, type UseDataSource, type IMWidgetJson, JimuFieldType, type ImmutableArray, type DataSourceSchema, type DataSourceJson, type FieldSchema, EsriFieldType } from 'jimu-core';
import { type SearchDataConfig, type AddressFields, SearchServiceType, type IMSearchDataConfig, type DSInWidgetJson, type DataSourceConfigWithMapCentric } from '../type/type';
interface AddressFieldSchemaResult {
    addressFieldsSchema: FieldSchema[];
    defaultAddressFieldName: string;
}
export declare const ObjectIdSchema: {
    jimuName: string;
    alias: string;
    esriType: EsriFieldType;
    type: JimuFieldType;
    name: string;
};
interface FieldItemInMapSearchProperties {
    exactMatch: boolean;
    name: string;
    type?: string;
}
interface GetNewDataSourceConfigOptions {
    datasourceConfig: ImmutableArray<SearchDataConfig>;
    dsJsonOriginDs: FeatureLayerDataSource;
    useDataSource: UseDataSource;
    datasourceConfigItem?: IMSearchDataConfig;
    configId?: string;
    viewId?: string;
    fieldsInMapSearchProperties?: FieldItemInMapSearchProperties[];
    exactMatch?: boolean;
    label?: string;
    searchInCurrentMapExtent?: boolean;
}
/**
 * Get outputDs default schema
*/
export declare const getInitSchema: (label?: string, addressFields?: FieldSchema[]) => DataSourceSchema;
export declare const getNameOfDefaultAddressField: (fields: FieldSchema[], nameIndex?: number) => string;
export declare const getAddressFieldsSchemaAndDefaultFieldName: (addressFields?: AddressFields[]) => AddressFieldSchemaResult;
/**
 * Get outputDs json
*/
export declare const getInitOutDataSource: (widgetId: string, configId: string, geocodeUrl: string, label?: string) => DataSourceJson;
export declare const getOutputJsonOriginDs: (ds: SceneLayerDataSource | FeatureLayerDataSource) => FeatureLayerDataSource;
export declare const getWhetherDsInUseDataSources: (ds: UseDataSource, useDataSources: ImmutableArray<UseDataSource>) => boolean;
export declare const isDsInDataSources: (dataSource: UseDataSource, dataSources: UseDataSource[]) => boolean;
export declare const checkIsUseDsChanged: (dataSource: UseDataSource[], preDataSources: UseDataSource[]) => boolean;
/**
 * Check is useDataSource or outputDataSource changed in widgetJson
*/
export declare const checkIsWidgetJsonDsChanged: (widgetJson: IMWidgetJson, useDataSource: UseDataSource[], outputDataSource: string[]) => boolean;
/**
 * Get config id list
*/
export declare const getConfigIdList: (dataSourceConfig: SearchDataConfig[]) => string[];
/**
 * Get new dataSource config id
*/
export declare const getNewConfigId: (configIdList: string[], viewId?: string) => string;
export declare const getOutputDataSourceId: (configId: string, widgetId: string) => string;
export declare const getNewDsConfigItem: (options: GetNewDataSourceConfigOptions) => SearchDataConfig | {
    configId: string;
    icon: any;
    label: string;
    displayLabel: boolean;
    useDataSource: UseDataSource;
    displayFields: IMFieldSchema[];
    searchFields: IMFieldSchema[];
    hint: string;
    searchServiceType: SearchServiceType;
    searchExact: boolean;
    searchInCurrentMapExtent: boolean;
};
export declare const initNewDatasourceConfigByField: (datasourceConfigItem: IMSearchDataConfig) => IMSearchDataConfig;
/**
 * Get layer default config
 */
export declare const getNewDataSourceConfig: (options: GetNewDataSourceConfigOptions) => {
    dsConfigItem: SearchDataConfig | {
        configId: string;
        icon: any;
        label: string;
        displayLabel: boolean;
        useDataSource: UseDataSource;
        displayFields: IMFieldSchema[];
        searchFields: IMFieldSchema[];
        hint: string;
        searchServiceType: SearchServiceType;
        searchExact: boolean;
        searchInCurrentMapExtent: boolean;
    };
    datasourceConfig: any;
};
/**
 * Get default field after add layer
*/
export declare const getDefaultField: (useDataSource: UseDataSource, fieldsInMapSearchProperties?: FieldItemInMapSearchProperties[]) => IMFieldSchema[];
/**
 * Create output datasource by useDataSource
 */
export declare const getDsJsonOfOriginDs: (useDataSource: any) => Promise<FeatureLayerDataSource>;
export declare const getAllDsByDataConfigWithMapCentric: (dataSourceConfigWithMapCentric: DataSourceConfigWithMapCentric) => {
    useDataSources: UseDataSource[];
    outputDataSources: any[];
};
/**
 * Get all useDataSources and outputDataSources
 */
export declare const getAllDataSourceBySearchDataConfig: (datasourceConfig: ImmutableArray<SearchDataConfig>, createOutputDs: boolean) => {
    useDataSources: UseDataSource[];
    outputDataSources: any[];
};
/**
 * get new ds in widgetJson after select layer.
 */
export declare const getDsInWidgetJson: (allDataSources: any, widgetId: string, createOutputDs: boolean) => DSInWidgetJson;
export declare const getOutputDsJson: (dsConfigItem: SearchDataConfig, isOutputFromWidget?: boolean) => any;
export declare function checkIsTableDs(dataSourceId: string): boolean;
export {};
