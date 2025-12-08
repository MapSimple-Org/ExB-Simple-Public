import { type IntlShape, type AttachmentInfo, type FeatureDataRecord, type ArcGISQueriableDataSource } from 'jimu-core';
import type { IFeature, IGeometry } from '@esri/arcgis-rest-feature-service';
import { AbstractDataRecord } from './abstract-data-record';
interface FeatureRecordOptions {
    isBeforeMappingData?: boolean;
    hasFullGeometry?: boolean;
}
export declare class FeatureDataRecordImpl extends AbstractDataRecord implements FeatureDataRecord {
    feature: IFeature | __esri.Graphic;
    attachmentInfos: AttachmentInfo[];
    hasFullGeometry: boolean;
    protected _dataSource: ArcGISQueriableDataSource;
    protected _queryAllAttachmentsPromise: Promise<AttachmentInfo[]>;
    protected _getSymbolPreviewHTMLPromise: Promise<HTMLElement>;
    private readonly _id;
    constructor(feature: IFeature | __esri.Graphic, dataSource: ArcGISQueriableDataSource, options?: FeatureRecordOptions);
    private setProxyForData;
    get dataSource(): ArcGISQueriableDataSource;
    set dataSource(d: ArcGISQueriableDataSource);
    private fillGeometry;
    queryAttachments(attachmentTypes?: string[]): Promise<AttachmentInfo[]>;
    fetchSymbolPreviewHTML(): Promise<HTMLElement>;
    getData(): {
        [key: string]: any;
    };
    setData(data: {
        [key: string]: any;
    }): void;
    clone(deep?: boolean): FeatureDataRecord;
    getDateFieldValue(jimuFieldName: string): number;
    getFormattedFieldValue(jimuFieldName: string, intl: IntlShape): string;
    getDataBeforeMapping(): {
        [key: string]: any;
    };
    getOriginData(): {
        [key: string]: any;
    };
    toJson(): IFeature | __esri.Graphic;
    getId(): string;
    setId(id: string): void;
    getGeometry(): IGeometry;
    getRawGeometry(): IGeometry | __esri.Geometry;
    getJSAPIGeometry(): __esri.Geometry;
    setGeometry(geo: IGeometry | __esri.Geometry): void;
    setFeature(feature: IFeature | __esri.Graphic): void;
    getFeature(): IFeature | __esri.Graphic;
    getJSAPIGraphic(): Promise<__esri.Graphic>;
    /**
     * @ignore
     * Returns whether `feature` is type of `__esri.Graphic`, some methods only work with `__esri.Graphic`.
     */
    private _isGraphicFeature;
}
export {};
