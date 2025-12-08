import type { IField, IFieldInfo, ILayerDefinition, IPopupInfo } from '@esri/arcgis-rest-feature-service';
import type { FieldSchema, IMExportOptions, IMFieldSchema, IMUseDataSource, UseDataSource } from '../../types/app-config';
import type { ServiceDefinition } from '../../types/service-definition';
import { type SqlExpression } from '../../types/sql-expression';
import { EsriFieldType, type DuplicateContext } from '../../types/common';
import { SqlQuerySortOrder, type CodedValue, type AttachmentInfo, type AttachmentQueryOptions, type QueriableDataSource, type DataSource, QueryScope, type IFeatureLayer, type FeatureLayerDataSource, type SceneLayerDataSource, type MapServiceDataSource, type ItemMixin, type TimeExtent, type ArcGISSubLayer, type JSAPILayerMixin, type ArcGISQueryParams, type TimezoneRuntime, type TimezoneAPI, type ArcGISQueriableDataSource, type ImageryTileLayerDataSource, type IMArcGISQueryParams } from '../../data-sources';
import { getWhetherUseProxy } from '../proxy-utils';
import type { ImmutableArray } from 'seamless-immutable';
import * as dataSourceJsonCreator from './data-source-json-creator';
export declare function queryAllAttachments(attachmentQuery: AttachmentQueryOptions): Promise<AttachmentInfo[]>;
export declare function filterAttachments(attachmentInfos: AttachmentInfo[], attachmentQuery: AttachmentQueryOptions): Promise<AttachmentInfo[]>;
export declare function convertFieldToJimuField(field: IField, fieldInfo: IFieldInfo): FieldSchema;
export declare function isNumericalField(fieldType: EsriFieldType): boolean;
export declare function getFieldInfoByFieldName(fieldInfos: IField[], fieldName: string): IField;
/** for codedvalue */
export interface DisplayValueObject {
    isCodedValueOrSubtype: boolean;
    value?: any;
    displayValue?: string;
}
export declare function getDisplayValueForCodedValueOrSubtype(layerDefinition: ServiceDefinition, fieldName: string, record: any): DisplayValueObject;
export declare function getDisplayValueForCodedValueOrSubtypeBatch(layerDefinition: ServiceDefinition, fieldName: string, recordList: any[]): DisplayValueObject[];
export declare function getCodedValueListForCodedValueOrSubtypeField(layerDefinition: ServiceDefinition, fieldName: string, record?: any): CodedValue[];
/**
 * Check if field domain is affected by subtypeField/typeIdField.
 * @ignore
 */
export declare function areFieldCodedValuesAffectedByTypeIdField(layerDefinition: ServiceDefinition, fieldNames: string[]): boolean;
export declare function isAGOLHostedService(url: string): boolean;
export declare function fixLayerId(layerId: string): string;
/**
 * Sublayer's id is type of number. Layer's id is type of string.
 * The function is used to generate jimuChildId by js api layer.
 */
export declare function getFixedLayerIdByLayer(layer: {
    id?: string | number;
    title?: string;
    name?: string;
}): string;
/**
 * The function is used to generate jimuChildId by layer definition.
 */
export declare function getFixedLayerIdByLayerDefinition(layerDefinition: ServiceDefinition): string;
/**
 * The function is used to generate jimuChildId by layer definition.
 */
export declare function _getFixedLayerIdByLayerDefinition(layerDefinition: ServiceDefinition): string;
export declare function isJSAPILayerTypeSupported(layer: __esri.Layer): boolean;
export declare function getSortedArrayByLabel<T extends {
    getLabel?: () => string;
    label?: string;
    sourceLabel?: string;
}>(arr: T[]): T[];
export declare function getChildDataSourceId(parentDsId: string, jimuChildId: string): string;
/**
 * @ignore
 */
export interface queryParamsAndOptionsProps {
    field: IMFieldSchema;
    dataSource: DataSource;
    dataSourceId: string;
    sqlExpression?: SqlExpression;
    queryScope?: QueryScope;
    widgetId?: string;
    sortOrder?: SqlQuerySortOrder;
}
export declare function getQueryParamsAndOptions(props: queryParamsAndOptionsProps): {
    queryParams: any;
    queryOptions: {
        scope: QueryScope;
        widgetId: string;
    };
};
/**
 * @ignore
 */
export interface queryFeatureCountByFieldProps {
    field: IMFieldSchema;
    dataSource: DataSource;
    sqlExpression?: SqlExpression;
    queryScope?: QueryScope;
    widgetId?: string;
}
/**
 * @ignore
 */
export declare function queryFeatureCountByField(props: queryFeatureCountByFieldProps): Promise<number>;
interface queryValueLabelsByFieldAndPageSizeProps extends queryFeatureCountByFieldProps {
    pageSize: number;
    sortType?: 'VALUE' | 'LABEL';
    sortOrder?: SqlQuerySortOrder;
}
/**
 * @ignore
 */
export declare function queryValueLabelsByFieldAndPageSize(props: queryValueLabelsByFieldAndPageSizeProps): Promise<{
    list: CodedValue[];
    recordLength?: number;
}>;
export declare function getUrlByLayer(layer: ArcGISSubLayer | __esri.Layer): string;
/**
 * If use a global data source, the real data source id is `useDataSource.dataSourceId`.
 * If use a local data source, the real data source id is different from `useDataSource.dataSourceId`.
 */
export declare function getRealDataSourceId(useDataSource: IMUseDataSource | UseDataSource, localId?: string): string;
export declare function getUseDataSourceByDataSource(dataSource: DataSource): UseDataSource;
export declare function getOriginDataLabel(ds: DataSource & ItemMixin & JSAPILayerMixin): Promise<string>;
export declare function getJimuLayerIdByJSAPILayer(layer: __esri.Layer | ArcGISSubLayer): string;
/**
 * TODO: consider data source mapping, refactor this method.
 * If consider data source mapping, one JS API layer may match multiple layer data sources.
 *
 * `rootDataSource` can be the root node of any subtrees. That is to say, the function works as long as `rootDataSource` is parent node of the input `layer`.
 */
export declare function getDataSourceIdByJSAPILayer(rootDataSource: DataSource, layer: __esri.Layer | ArcGISSubLayer): string;
export declare function getWhetherDataSourceHasSameSourceWithJSAPILayer(ds: DataSource, layer: __esri.Layer | ArcGISSubLayer): boolean;
/**
 * If data source object is not created, only have data source id, can use this method to get whether data source is derived from another data source.
 * E.g. data view is derived from main data source.
 */
export declare function isDerivedFrom(baseDsId: string, derivedDsId: string): boolean;
/**
 * Return whether two data sources are derived from the same main data source.
 * E.g. data view1 and data view2 are derived from the same main data source, or data view and main data source are derived from the same main data source.
 */
export declare function areDerivedFromSameMain(dsId1: string, dsId2: string): boolean;
export declare function isDataView(dsId: string): boolean;
export declare function getMainDataSourceId(dsId: string): string;
export declare function getRootDataSourceId(dsId: string): string;
export declare function getDataViewId(dsId: string): string;
export declare function getUseDataSourceByDataSourceId(dsId: string): UseDataSource;
export declare function mapUseDataSources(contentMap: DuplicateContext, useDataSources: ImmutableArray<UseDataSource>): {
    isChanged: boolean;
    useDataSources: UseDataSource[];
};
export declare function mapUseDataSource(contentMap: DuplicateContext, useDataSource: UseDataSource | IMUseDataSource): {
    isChanged: boolean;
    useDataSource: UseDataSource;
};
export declare function isSelectionView(dsId: string): boolean;
export declare function isOwnerOrOrgAdminOfDataSource(dataSource: ArcGISQueriableDataSource): Promise<boolean>;
export declare function supportReplica(dataSource: ArcGISQueriableDataSource): Promise<boolean>;
export declare function supportSymbol(dataSource: ArcGISQueriableDataSource): boolean;
export declare function supportAttachment(dataSource: ArcGISQueriableDataSource): boolean;
export declare function supportTime(dataSource: ArcGISQueriableDataSource | MapServiceDataSource | ImageryTileLayerDataSource): boolean;
export declare function doesJSAPILayerSupportTime(layerOrSublayer: __esri.Layer | __esri.Sublayer): boolean;
/**
 * A null value specified for start time or end time will represent infinity for start or end time.
 * Return -1, indicates t1 and t2 have no intersection.
 */
export declare function mergeTimeExtent(t1: TimeExtent, t2: TimeExtent): TimeExtent;
export declare function findMapServiceDataSource(subLayerDataSource: DataSource): MapServiceDataSource;
export declare function getJSAPILayer(dataSource: ArcGISQueriableDataSource): __esri.Layer | ArcGISSubLayer;
export declare function getRestAPILayer(dataSource: ArcGISQueriableDataSource): IFeatureLayer;
export declare function getLayerDefinition(dataSource: ArcGISQueriableDataSource): ILayerDefinition;
export declare function getPopupInfo(dataSource: ArcGISQueriableDataSource): IPopupInfo;
export declare function getExportOptions(dataSource: QueriableDataSource): IMExportOptions;
/**
 * Return a new popup info, which fields are intersection of data source fields and provided popup info fields.
 */
export declare function getPopupInfoIntersection(popupInfo: IPopupInfo, dataSource: FeatureLayerDataSource | SceneLayerDataSource): IPopupInfo;
/**
 * Return a new layer definition, which fields are intersection of data source fields and provided layer definition fields.
 */
export declare function getLayerDefinitionIntersection(layerDef: ILayerDefinition, dataSource: FeatureLayerDataSource | SceneLayerDataSource): ILayerDefinition;
/**
 * Return the related main data source which contains information about original AGOL/portal item or original remote database.
 * - For output data source, if it only has one origin data source and its schema isn't changed (comparing with the origin schema), will continue checking using the origin data source.
 * - For data view and local data source, will return main data source.
 */
export declare function getRelatedMainDataSourceWithOriginInfo(dataSource: QueriableDataSource): QueriableDataSource;
/**
 * Create a Rest API layer from a data source.
 * Always create a new Rest API layer even if the data source has one.
 */
export declare function createRestAPILayerByDataSource(ds: FeatureLayerDataSource): IFeatureLayer;
export declare function createJSAPIFeatureLayerByDataSourceFromFeatureCollectionItem(ds: FeatureLayerDataSource): Promise<__esri.FeatureLayer>;
export declare function areDatesInUnknownTimezone(dataSource: DataSource): boolean;
/**
 * Get time offset by timezone name.
 * @param timeZone: specific IANA or timezone from services.
 * @returns number
 * @ignore
 */
export declare function getTimeZoneOffsetByName(timeZone: string): number;
/**
 * Get timezone for API.
 * @ignore
 */
export declare function getTimezoneAPIFromRuntime(timezone: TimezoneRuntime): TimezoneAPI;
export declare function getChildDsJsonFromRootDs(dataSource: DataSource, jimuChildId: string): {};
/**
 * Get date value with dataSource's timezone offset.
 * Displayed date label should honor timezone.
 * Three cases: unknown timezone, device (by default), specific timezone.
 * @param value
 * @param dataSource
 * @returns
 * @ignore
 */
export declare function getDateFieldValue(value: number, dataSource: any): number;
/**
 * Get date value without the offset of dataSource's timezone and local timezone.
 * @ignore
 */
export declare function getDateFieldValueWithoutTzOffset(value: number, dataSource: any): number;
export declare function getUsedFieldsFromFeatureLayerQueryParams(query: ArcGISQueryParams, dataSource: DataSource, queryType: 'feature' | 'id' | 'count' | 'extent'): string[];
/**
 * get main ds/origin ds of data view or output ds
 */
export declare function getMainOriginDataSource(ds: DataSource): DataSource;
export interface JimuDataSourceRelationship {
    keyField: string;
    relatedKeyField: string;
    hasRelationshipTable: boolean;
}
/**
 * get key fields and whether has a relationship table in relationship, return null if relationship not existed
 */
export declare function getJimuDataSourceRelationship(ds: DataSource, relatedDs: DataSource): JimuDataSourceRelationship;
export declare const NON_COUNT_AFFECTING_QUERY_PARAMS_KEYS: Array<keyof ArcGISQueryParams>;
export declare function areQueryParamsEmpty(queryParams: IMArcGISQueryParams): boolean;
export declare function doesDsSupportQuery(ds: DataSource): boolean;
export declare function getSortedDataViewIds(dsId: string): string[];
export * from './rest-api-and-js-api-types-utils';
export * from './ds-type-and-json-utils';
export * from './sql-utils';
export * from './sql-expression-factory';
export * from './get-suggestion-utils';
export * from './advanced-data-source-select-utils';
export { getWhetherUseProxy, dataSourceJsonCreator };
