import { SupportedItemTypes } from 'jimu-core';
import type { IItem } from '@esri/arcgis-rest-portal';
export { SupportedItemTypes as ItemTypes };
export declare enum ItemCategory {
    MyContent = "MY_CONTENT",
    MyGroup = "MY_GROUP",
    MyOrganization = "MY_ORGANIZATION",
    Public = "PUBLIC",// ArcGIS Online
    LivingAtlas = "LIVING_ATLAS",
    Curated = "CURATED"
}
export interface ItemCategoryInfo {
    id: string;
    type: ItemCategory;
    customLabel: string;
    curatedFilter?: string;
}
export declare enum SortField {
    Modified = "modified",
    Title = "title",
    Views = "numViews"
}
export declare enum SortOrder {
    Desc = "desc",
    Asc = "asc"
}
export declare enum ItemSelectorMode {
    Simple = "SIMPLE",
    All = "ALL"
}
export interface ItemFolder {
    id: string;
    title: string;
    created?: number;
    username?: string;
}
export interface IItemWithPortalUrl extends IItem {
    portalUrl: string;
}
/**
 * Same with online item categories.
 */
export declare enum ItemTypeCategory {
    FeatureLayer = "Feature Layer",
    TileLayer = "Tile Layer",
    MapImageLayer = "Map Image Layer",
    ImageryLayer = "Imagery Layer",
    SceneLayer = "Scene Layer",
    TiledImageryLayer = "Tiled Imagery Layer",
    ElevationLayer = "Elevation Layer",
    Table = "Table",
    LayerFiles = "Layer Files",
    WebMap = "Web Map",
    Scenes = "Scenes",
    GeometricOperations = "Geometric Operations",
    Locator = "Locator",
    GeoprocessingTasks = "Geoprocessing Tasks",
    NetworkAnalysis = "Network Analysis",
    GroupLayer = "Group Layer",
    OrientedImageryLayer = "Oriented Imagery Layer"
}
