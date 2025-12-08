import type { MockServiceData, MockFeatureLayerData } from '../mock-service';
export declare const MAP_SERVICE_URL = "https://demographics.arcgis.com/arcgis/rest/services/911CallsHotspot/MapServer";
export declare const FEATURE_LAYER_URL = "https://demographics.arcgis.com/arcgis/rest/services/911CallsHotspot/MapServer/3";
export declare const SERVER_INFO: {
    currentVersion: number;
    fullVersion: string;
    soapUrl: string;
    secureSoapUrl: string;
    authInfo: {
        isTokenBasedSecurity: boolean;
        tokenServicesUrl: string;
        shortLivedTokenValidity: number;
    };
};
/**
 * Mocked point feature layer.
 */
export declare const featureLayer: MockFeatureLayerData;
/**
 * Mocked map service. The service contains three layers, one group layer and the group layer contains two point feature layer.
 */
export declare const mapService: MockServiceData;
