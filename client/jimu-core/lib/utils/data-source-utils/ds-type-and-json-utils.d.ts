import type { IntlShape } from 'react-intl';
import { SupportedServerTypes } from '../../data-sources';
import type { IMDataSourceJson } from '../../types/app-config';
import { type IItem } from '@esri/arcgis-rest-portal';
import type { ServiceDefinition } from '../../types/service-definition';
export declare function fetchAssociatedFeatureLayerDefinition(sceneLayerUrl: string, sceneLayerId: string, sceneLayerItemId: string, sceneLayerPortalUrl: string): Promise<{
    def: ServiceDefinition;
    url: string;
}>;
/**
 * Scene layer url should be proxy url if should use proxy (in app instead of builder).
 * Will return associated feature layer's proxy url if should use proxy (in app instead of builder).
 */
export declare function fetchAssociatedFeatureLayerUrl(sceneLayerUrl: string, sceneLayerId: string, sceneLayerItemId: string, sceneLayerPortalUrl: string): Promise<string>;
/**
 * Assume that scene layer has an associated feature layer.
 * Will return associated feature layer's proxy url if should use proxy (in app instead of builder).
 */
export declare function getAssumedAssociatedLayerUrl(sceneLayerUrl: string): string;
export declare function fetchAssociatedFeatureServicePortalItem(sceneLayerItemId: string, sceneLayerPortalUrl: string): Promise<IItem>;
/**
 * Added this to support Pro-published group FeatureServers - in this case the
 * layer ids are not 0,1,2.. but instead 1,2,3... -> we need to query the Feature
 * Server for the right layer id before we use it as an associated feature layer;
 */
export declare function findAssociatedFeatureLayerUrl(featureLayerUrl: string, sceneLayerUrl: string, sceneLayerId: string): Promise<string>;
/**
 * @ignore
 * Return service label from url,
 * e.g. https://servicesdev.arcgis.com/VxZfyyZuOsDEPxG8/ArcGIS/rest/services/features_(1)/FeatureServer/0 -> features_(1)
 * e.g. https://servicesdev.arcgis.com/VxZfyyZuOsDEPxG8/ArcGIS/rest/services/features_(1)/FeatureServer -> features_(1)
 * e.g. https://services.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer -> World_Terrain_Base
 * e.g. https://services2.arcgis.com/z2tnIkrLQ2BRzr6P/ArcGIS/rest/services/CampusViewer_IndoorData/SceneServer/layers/0 -> CampusViewer_IndoorData
 */
export declare function getLabelFromArcGISServiceUrl(url: string): string;
/**
 * @ignore
 * Indicate whether is a supported whole service,
 * whole service means is not a single layer service,
 * e.g. https://servicesdev.arcgis.com/VxZfyyZuOsDEPxG8/ArcGIS/rest/services/features_(1)/FeatureServer/0 -> false (is a single layer service)
 * e.g. https://servicesdev.arcgis.com/VxZfyyZuOsDEPxG8/ArcGIS/rest/services/features_(1)/FeatureServer -> true
 * e.g. https://services.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer -> true
 * e.g. https://copernicus.discomap.eea.europa.eu/arcgis/rest/services/GioLand/VHR_2018_LAEA/ImageServer -> true
 */
export declare function isSupportedWholeArcGISService(url: string): boolean;
export declare function isSupportedArcGISService(url: string, serviceTypes?: SupportedServerTypes[]): boolean;
/**
 * @ignore
 * Indicate whether is a supported single layer service,
 * e.g. https://servicesdev.arcgis.com/VxZfyyZuOsDEPxG8/ArcGIS/rest/services/features_(1)/FeatureServer/0 -> true
 * e.g. https://servicesdev.arcgis.com/VxZfyyZuOsDEPxG8/ArcGIS/rest/services/features_(1)/FeatureServer -> false
 * e.g. https://services2.arcgis.com/z2tnIkrLQ2BRzr6P/ArcGIS/rest/services/CampusViewer_IndoorData/SceneServer/layers -> false
 * e.g. https://services2.arcgis.com/z2tnIkrLQ2BRzr6P/ArcGIS/rest/services/CampusViewer_IndoorData/SceneServer -> false
 * e.g. https://services2.arcgis.com/z2tnIkrLQ2BRzr6P/ArcGIS/rest/services/CampusViewer_IndoorData/SceneServer/layers/0 -> true
*/
export declare function isSupportedSingleArcGISLayerService(url: string): boolean;
/**
 * @ignore
 * Get service url end up with layer id or url without layer id,
 * which depends on param `addIdToEnd`.
 */
export declare function getFullArcGISServiceUrl(url: string, addIdToEnd: boolean, layerDefinition?: ServiceDefinition): string;
export declare function getDataSourceProxyUrl(sourceUrl: string): string;
export declare function getDsTypeString(dataSourceType: string, intl: IntlShape): string;
export declare function getDsIcon(dsJson: IMDataSourceJson): any;
