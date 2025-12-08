import type { ImmutableObject } from 'seamless-immutable';
import type { JimuFieldType } from './common';
import type { IconResult, UseDataSource } from './app-config';
import type { DynamicStyle, DynamicIconPosition, DynamicTextStyle } from './dynamic-style';
import type { ArcGISQueryParams, FeatureLayerDataSource, OrientedImageryLayerDataSource, SubtypeGroupLayerDataSource, SubtypeSublayerDataSource } from '../data-sources';
import type { FillType } from 'jimu-ui';
export type ArcadeDataSource = FeatureLayerDataSource | OrientedImageryLayerDataSource | SubtypeGroupLayerDataSource | SubtypeSublayerDataSource;
export declare enum ArcadeContentCapability {
    Value = "VALUE",
    Style = "STYLE"
}
export declare const ArcadeContentValueKeys: string[];
export declare const ArcadeContentStyleKeys: string[];
export declare const ArcadeContentAllKeys: string[];
export interface ArcadeScriptBackground {
    color?: string;
    fillType: FillType;
    image?: string;
}
export interface ArcadeScriptIcon {
    name?: string;
    position?: DynamicIconPosition;
    size?: number;
    color?: string;
}
export interface ArcadeScriptText extends Omit<DynamicTextStyle, 'size'> {
    size?: number;
}
export interface ArcadeScriptResult extends Omit<DynamicStyle, 'background' | 'text' | 'icon'> {
    value?: number | string | Date;
    background?: ArcadeScriptBackground;
    text?: ArcadeScriptText;
    icon?: ArcadeScriptIcon;
}
export interface ArcadeContent extends DynamicStyle {
    value?: number | string | Date;
}
export type IMArcadeContent = ImmutableObject<ArcadeContent>;
export interface ArcadeIcon {
    name: string;
    data: IconResult;
}
export interface ArcadeContentConfig {
    id: string;
    title: string;
    scriptContent: string;
    valueType: JimuFieldType;
    icons: ArcadeIcon[];
    useDataSources?: UseDataSource[];
}
/**
 * Multiple arcade content configs.
 */
export interface ArcadeContentConfigMap {
    [arcadeId: string]: ArcadeContentConfig;
}
/**
 * Immutable multiple arcade content configs.
 */
export type IMArcadeContentConfigMap = ImmutableObject<ArcadeContentConfigMap>;
export type IMArcadeContentConfig = ImmutableObject<ArcadeContentConfig>;
export declare enum ArcadeProfileType {
    FeatureProfile = "FEATURE_PROFILE",
    DataSourcesProfile = "DATASOURCES_PROFILE"
}
export interface FeatureProfileVariableInstances {
    $feature: __esri.Graphic;
}
export type ArcadeLayer = __esri.FeatureLayer | __esri.OrientedImageryLayer | __esri.SubtypeGroupLayer | __esri.SubtypeSublayer;
export interface SingleDataSourceProfileVariableInstances {
    layer: ArcadeLayer;
    queryParams: ArcGISQueryParams;
    selectedFeatures: __esri.FeatureLayer;
    loadedFeatures: __esri.FeatureLayer;
    loadedFields: string[];
}
export interface DataSourcesVariableInstance {
    [dataSourceId: string]: SingleDataSourceProfileVariableInstances;
}
export interface DataSourcesProfileVariableInstances {
    $dataSources: DataSourcesVariableInstance;
}
export interface ArcadeProfileContext {
    type: ArcadeProfileType;
    profile: __esri.Profile;
    profileVariableInstances: any;
    timeZone: string;
}
export interface FeatureProfileContext extends ArcadeProfileContext {
    type: ArcadeProfileType.FeatureProfile;
    profileVariableInstances: FeatureProfileVariableInstances;
}
export interface DataSourcesProfileContext extends ArcadeProfileContext {
    type: ArcadeProfileType.DataSourcesProfile;
    profileVariableInstances: DataSourcesProfileVariableInstances;
}
