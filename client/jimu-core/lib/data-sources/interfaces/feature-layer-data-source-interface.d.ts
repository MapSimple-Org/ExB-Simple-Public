import type { ImmutableObject } from 'seamless-immutable';
import type { IPopupInfo, ILayerDefinition, ILayer, IDefinitionEditor } from '@esri/arcgis-rest-feature-service';
import type { DataSourceTypes } from './common-data-source-interface';
import type { ArcGISQueriableDataSource, FeatureDataRecord, ArcGISQueryParams, ArcGISQueryCapabilities } from './arcgis-queriable-data-source-interface';
import type { WebChart } from 'arcgis-charts-components';
import type { SceneLayerDataSource } from './scene-layer-data-source-interface';
/**
 * `FeatureLayerDataSource` is created from a single feature layer of feature service, map service or webmap/webscene.
 *
 * The source of feature layer data source may be from -
 * 1. an array directly (`sourceRecords`), `isDataInDataSourceInstance` is true for such data sources, or,
 * 2. an ArcGIS Maps SDK for JavaScript feature layer, or,
 * 3. an AGOL/portal item or a remote database.
 *
 * Please note, for the 2, the feature layer can be both client-side or server-side.
 */
export interface FeatureLayerDataSource extends ArcGISQueriableDataSource {
    type: DataSourceTypes.FeatureLayer;
    /**
     * The ArcGIS Maps SDK for JavaScript [FeatureLayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html) object.
     */
    layer?: __esri.FeatureLayer;
    /**
     * The [Feature Layer](https://developers.arcgis.com/web-map-specification/objects/featureLayer/) JSON object.
     */
    restLayer?: IFeatureLayer;
    /**
     * @ignore
     * Whether the feature layer data source is other data source's associated data source, which means the feature layer data source is created automatically.
     */
    isAssociatedFeatureLayer: boolean;
    createRestAPILayerByDataSource: () => IFeatureLayer;
    setAssociatedDataSource: (associatedDataSource: SceneLayerDataSource) => void;
    getAssociatedDataSource: () => SceneLayerDataSource;
    getCharts: () => WebChart[];
    createRelatedDataSources: () => Promise<FeatureLayerDataSource[]>;
    getRelatedDataSources: () => FeatureLayerDataSource[];
    queryRelatedRecords: (relatedDataSource: FeatureLayerDataSource, ids: string[], params?: ArcGISQueryParams, ignoreFilter?: boolean) => Promise<RelatedRecordGroup[]>;
    queryRelatedFieldValues: (records: FeatureDataRecord[], relatedDs: FeatureLayerDataSource, relatedFieldName: string) => Promise<any[]>;
    /** When the Arcade Script is executed, the feature is not loaded actually. Call this method to load features. */
    loadArcadeFeatures: () => Promise<__esri.FeatureLayer>;
}
export interface RelatedRecordGroup {
    objectId: number;
    relatedRecords?: FeatureDataRecord[];
    count?: number;
}
/**
 * @ignore
 * @deprecated
 */
export interface FeatureQueryDataSource extends FeatureLayerDataSource {
}
/**
 * Feature layers can be created by referencing a layer from either a map service or a feature service or by specifying a feature collection object.
 * Use a map service if you just want to retrieve geometries and attributes from the server and symbolize them yourself. Use a feature service if
 * you want to take advantage of symbols from the service's source map document. Also, use a feature service if you plan on doing editing with the
 * feature layer. Feature layers honor any feature templates configured in the source map document. Feature collection objects are used to create
 * a feature layer based on the supplied definition.
 */
export interface IFeatureLayer extends ILayer, ISupportsTime {
    /** A comma-separated string listing which editing operations are allowed on an editable feature service. */
    capabilities?: string;
    /** Stores interactive filters. */
    definitionEditor?: IDefinitionEditor;
    /** Indicates whether to allow a client to ignore popups defined by the service item. */
    disablePopup?: true;
    /** A featureCollection object defining a layer of features whose geometry and attributes are either stored directly within the web map or with an item. Feature Collections can be created from CSVs, shapefiles, GPX, or map notes. */
    featureCollection?: any;
    /** Indicates the type of features in the feature collection. If featureCollectionType is missing, it means the feature collection is a regular single-layer or multi-layer feature collection. */
    featureCollectionType?: 'markup' | 'notes' | 'route';
    /** A layerDefinition object defining the attribute schema and drawing information for the layer. */
    layerDefinition?: ILayerDefinition;
    /** String indicating the layer type. */
    layerType: 'ArcGISFeatureLayer';
    /** 0 is snapshot mode. 1 is on-demand mode. 2 is selection-only mode. Used with ArcGIS feature services and individual layers in ArcGIS map services. */
    mode?: 0 | 1 | 2;
    /** A popupInfo object defining the content of popup windows when you click or query a feature. */
    popupInfo?: IPopupInfo;
    /** Refresh interval of the layer in minutes. Non-zero value indicates automatic layer refresh at the specified interval. Value of 0 indicates auto refresh is not enabled. */
    refreshInterval?: number;
    /** Labels will display if this property is set to true and the layer also has a labelingInfo property associated with it. This property can get stored in the web map config and in the item/data. */
    showLabels?: true;
    /** An array of sublayer ids that should appear visible. Used with feature layers that are based on feature collections. */
    visibleLayers?: number[];
}
export interface ISupportsTime {
    /** This property is applicable to layers that support time. If 'true', timeAnimation is enabled. */
    timeAnimation?: boolean;
}
/**
 * ILayerDefinition in rest API defines Relationship as any
 * So LayerRelationship is defined by the actual response from rest API
 * JSAPI's Relationship class has the same properties as `layerDefinition.relationships` returned from rest API:
 * https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Relationship.html
 * Difference is the value naming in `cardinality` and `role`, see below:
 */
export interface LayerRelationship {
    cardinality: 'esriRelCardinalityOneToOne' | 'esriRelCardinalityOneToMany' | 'esriRelCardinalityManyToMany';
    composite: boolean;
    id: number;
    keyField: string;
    keyFieldInRelationshipTable?: string;
    name: string;
    relatedTableId: number;
    relationshipTableId?: number;
    role: 'esriRelRoleOrigin' | 'esriRelRoleDestination';
}
/**
 * Query parameters for the feature layer data source.
 */
export interface FeatureLayerQueryParams extends ArcGISQueryParams {
}
export type IMFeatureLayerQueryParams = ImmutableObject<FeatureLayerQueryParams>;
export interface FeatureLayerQueryCapabilities extends ArcGISQueryCapabilities {
}
