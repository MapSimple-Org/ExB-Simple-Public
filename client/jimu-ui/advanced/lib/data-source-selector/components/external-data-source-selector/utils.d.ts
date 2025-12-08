import { type IMDataSourceJson, type IntlShape, type DataSource } from 'jimu-core';
export declare enum AddDataErrorCode {
    DataTypeIsNotSupported = "DATA_TYPE_IS_NOT_SUPPORTED_YET",
    ItemInaccessible = "ITEM_INACCESSIBLE",
    SceneLayerWithoutAssociatedLayer = "SCENE_LAYER_WITHOUT_ASSOCIATED_LAYER",
    BuildingSceneLayerWithoutAssociatedLayer = "BUILDING_SCENE_LAYER_WITHOUT_ASSOCIATED_LAYER",
    WebMapUnsupportedVersion = "WEBMAP:UNSUPPORTED-VERSION"
}
export declare function getErrorTextFromErrorCode(errorCode: AddDataErrorCode, intl: IntlShape): string;
export declare function getDsJsonFromService(url: string, dsId: string, portalUrl?: string, itemId?: string, forceLogin?: boolean): Promise<{
    dsJson: IMDataSourceJson;
    label: string;
}>;
export declare function traverseHideChildDs(dataSource: DataSource): IMDataSourceJson;
export declare function traverseUnhideParentDs(dataSource: DataSource): IMDataSourceJson;
