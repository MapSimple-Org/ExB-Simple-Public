import { AbstractDataAction, DataLevel } from '../base-data-action';
import { type DataSource, type QueriableDataSource, type DataRecord, type DataRecordSet } from '../data-sources';
import type { GeometryType, IGeometry, ISpatialReference, Units } from '@esri/arcgis-rest-feature-service';
export declare abstract class ExportBase extends AbstractDataAction {
    constructor(props: any);
    isFeatureCollectionDataSource(dataSource: DataSource): boolean;
    isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean>;
    dataSourceAllowExport(dataSet: DataRecordSet, dataLevel: DataLevel): Promise<boolean>;
    checkPrivilegeAsync(): Promise<boolean>;
    confirm(dataSource: DataSource, dataLevel: DataLevel): Promise<{
        needed: boolean;
        content?: {
            title: string;
            content: string;
            okLabel: string;
            cancelLabel: string;
        };
    }>;
    getExportFileName(dataSource: DataSource): string;
    /**
     * Used in DataLevel.Records, return dataSet records or dataSource selection.
     * @param dataSet
     */
    getLocalRecrods(dataSet: DataRecordSet): DataRecord[];
    getSpatialReferenceFromRecord(record: DataRecord): ISpatialReference;
    getRecords(dataSource: DataSource, fields?: string[], returnGeometry?: boolean): Promise<DataRecord[]>;
    processGeometryAndBuffer(geometry: IGeometry, distance: number, units: Units): Promise<[IGeometry, GeometryType]>;
    createReplicaRequest(dataSource: QueriableDataSource, format: string, layerId: string, queryOption: any, geometry?: any, geometryType?: any): Promise<string>;
    tryCreateReplica(dataSource: QueriableDataSource, format: 'filegdb' | 'shapefile' | 'kml' | 'json' | 'csv' | 'geojson', outFields?: string[], forceGeometry?: boolean): Promise<string>;
    tryCreateReplicaUsingRecords(dataset: DataRecordSet, format: 'filegdb' | 'shapefile' | 'kml', forceGeometry?: boolean): Promise<string>;
    saveAsLocalFile(blob: Blob, fileName: string): void;
}
