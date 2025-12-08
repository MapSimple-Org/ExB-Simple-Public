import { DataLevel } from '../base-data-action';
import { type DataSource, type DataRecord, type DataRecordSet } from '../data-sources';
import { type IItemAdd, type ICreateItemOptions, type ICreateItemResponse } from '@esri/arcgis-rest-portal';
import type { IDomain, ArcGISIdentityManager } from '@esri/arcgis-rest-request';
import type { ILayerDefinition, IField } from '@esri/arcgis-rest-feature-service';
import { type FieldSchema } from '../types/app-config';
import type * as jimuArcgis from 'jimu-arcgis';
import { ExportBase } from './export-base';
export declare abstract class ExportToItemBase extends ExportBase {
    isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean>;
    isDataSetSupportExportItem(dataSet: DataRecordSet, dataLevel: DataLevel): Promise<boolean>;
    addItem(item: IItemAdd, auth: ArcGISIdentityManager, option?: Partial<ICreateItemOptions>, folderId?: string): Promise<ICreateItemResponse>;
    createItem(item: IItemAdd, folderId: string): Promise<string>;
    createServiceItem(dataSet: DataRecordSet, name: string, folderId: string): Promise<string>;
    getFieldDomain(field: FieldSchema | IField, dataSource: DataSource, records: DataRecord[]): IDomain;
    getFieldForLayerDefinition(field: FieldSchema | IField, dataSource: DataSource, records: DataRecord[]): IField;
    getLayerForFeatureCollection(dataSet: DataRecordSet, dataLevel: DataLevel, featureUtils: typeof jimuArcgis.featureUtils, widgetId: string, returnGeometry?: boolean): Promise<{
        popupInfo: import("@esri/arcgis-rest-feature-service").IPopupInfo;
        layerDefinition: ILayerDefinition;
        featureSet: any;
    }>;
    createFeatureCollectionItem(dataSets: DataRecordSet[], dataLevel: DataLevel, name: string, folderId: string, widgetId: string, returnGeometry?: boolean): Promise<string>;
    checkPrivilegeAsync(): Promise<boolean>;
    private checkRenderPrivilege;
    private getAllFeatureCollection;
    private query;
}
