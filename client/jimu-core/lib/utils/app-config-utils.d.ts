import { type WidgetContext, type IMAppConfig, type IMWidgetJson, type WidgetJson, type AppConfig, type UseDataSource, type IMUseDataSource, type SizeModeLayoutJson, type Connection, type ElementType, type MessageActionJson, type IMDataSourceJson } from '../types/app-config';
import type { WidgetManifest } from '../types/manifest';
import type { IMState } from '../types/state';
import type { BrowserSizeMode } from '../types/common';
export declare function getWidgetContext(uri: string): WidgetContext;
export declare function addWidgetManifestProperties(manifest: WidgetManifest): WidgetManifest;
export declare function addWidgetDefaultLabelAndIcon(appConfig: IMAppConfig, widgetJson: WidgetJson): void;
export declare function addLayoutLabel(appConfig: AppConfig): void;
/**
 * @ignore
 * we use <type_number> format to generate key.
 * @param type
 */
export declare function getUniqueId(type: ElementType): string;
/**
 * @ignore
 * we use `<label> <index>` format to generate unique label.
 * @param type
 * @param label the i18n label
 *
 */
export declare function getUniqueLabel(appConfig: IMAppConfig | AppConfig, type: ElementType, label: string): string;
/**
 * The unique label looks like this: "label 1".
 * If the latter part is a number, this function return the [prefix, number], else will return the [label, null].
 */
export declare function parseUniqueLabel(label: string): [string, number];
export declare function getAllWidgets(appConfig: IMAppConfig): IMWidgetJson[];
export declare function getWidgetMessageActionJsons(appConfig: AppConfig, widgetId: string, actionName: string): MessageActionJson[];
export declare function isTwoViewsInSaveSection(appConfig: IMAppConfig | AppConfig, viewId1: string, viewId2: string): boolean;
/**
 * Add id property to layout since it's removed in cleanup
 * @param appConfig
 */
export declare function fixLayoutIds(appConfig: AppConfig): void;
export declare function updateStateWhenAppConfigChange(state: IMState, appConfig: IMAppConfig): IMState;
export declare const updateControllerWidgetId: (state: IMState) => IMState;
export declare function getLayoutIdInSizeMode(layout: SizeModeLayoutJson, sizeMode: BrowserSizeMode, mainSizeMode: BrowserSizeMode): string;
export declare function getSizeModeOfALayout(appConfig: IMAppConfig, layoutId: string): BrowserSizeMode;
/**
 * This util is used to get source widget id by output data source.
 * To get label of the source widget, please map source widget json to widget/component props.
 * Since source widget label may be edited by user, widget/component should listen to change of source widget json.
 *
 * The reason why doesn't need to pass in app config to the util is that,
 * widget/component only needs to listen to change of source widget json
 * and doesn't need to map the whole app config to its props.
 * The util will get app config by itself,
 * which can avoid getting app config before each call of the util.
 *
 * Please notes that the util always calculates with app's config both in app and in builder.
 * That is to say, if is in builder, instead of a builder widget (e.g. data source setting widget),
 * the returned widget id will still be id of an app widget (e.g. list widget).
 */
export declare function getWidgetIdByOutputDataSource(useDataSource: UseDataSource | IMUseDataSource): string;
export declare function validateConnectionsOfAppConfig(): void;
export declare function getConnectionInfoFromAppConfig(portalUrl: string): Connection;
export declare function setConnectionInfoToAppConfig(portalUrl: string, clientId: string, portalVersion: any): void;
export declare function addWebmapOrWebsceneToAppConfig(appConfig: AppConfig, webmapId: string, websceneId: string, whetherToCreateANewMapWidgetForBlankTemplate?: boolean): void;
export declare function getDataSourceJsonById(appConfig: IMAppConfig, dataSourceId: string): IMDataSourceJson;
/**
 * Get the map widget id that enables client-side query for the map data source.
 * @param mapDataSourceId
 */
export declare function getClientQueryEnabledMapWidgetId(mapDataSourceId: string): string;
export declare function getAllWidgetsInSameRootContainer(widgetId: string): string[];
export * from './resource-utils';
