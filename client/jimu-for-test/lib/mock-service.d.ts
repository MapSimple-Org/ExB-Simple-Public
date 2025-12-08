import { type ArcGISServerInfo, type ServiceDefinition } from 'jimu-core';
import type { IQueryFeaturesResponse } from '@esri/arcgis-rest-feature-service';
/**
 * Mocked query of a single layer, including query url, query results, query delay.
 */
export interface MockQuery {
    /** The Query URL. */
    url: string;
    /** The Query result. */
    result: IQueryFeaturesResponse;
    /** The Query delay. */
    delay?: number;
}
/**
 * Mocked single feature layer data, including server info, layer definition, queries.
 */
export interface MockFeatureLayerData {
    /** Feature layer URL. */
    url: string;
    /** Feature server info. */
    serverInfo: ArcGISServerInfo;
    /** The feature layer definition. */
    layerDefinition: ServiceDefinition;
    /** The queries you want to mock. */
    queries?: MockQuery[];
}
/**
 * Mock a single feature layer.
 */
export declare function mockFeatureLayer(mockData: MockFeatureLayerData): void;
/**
 * Mocked single layer in a service, including url, layer definition.
 */
export interface MockLayerInService {
    /** Layer URL, e.g. `https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0`. */
    url: string;
    /** Layer definition. */
    layerDefinition: ServiceDefinition;
}
/**
 * Mocked whole service, including server info, service definition, layers in the service.
 */
export interface MockServiceData {
    /** The service URL, e.g. `https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer` */
    url: string;
    /** The root server info. */
    serverInfo: ArcGISServerInfo;
    /** The service definition. */
    serviceDefinition: ServiceDefinition;
    /** The layers of the service. */
    layers?: MockLayerInService[];
}
/**
 * Mock a whole service, e.g. feature service, map service or scene service.
 */
export declare function mockService(mockData: MockServiceData): void;
