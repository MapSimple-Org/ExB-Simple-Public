import { MessageCarryData, type MessageType, type MessageJson, type IMWidgetJson, type MessageAction, type MessageActionJson, Immutable, type ImmutableObject, type WidgetJson, type ImmutableArray, type UseDataSource, type IMSectionJson } from 'jimu-core';
import type { FrameWorkTargetJson } from '../type';
/**
 * Get new message json
*/
export declare const getNewMessage: (messageType: MessageType, widgetId: string) => MessageJson;
export declare function getDsIdsByWidgetId(wId: string, messageType: MessageType): ImmutableArray<string>;
export declare function getDsByWidgetId(wId: string, messageType: MessageType): ImmutableArray<UseDataSource>;
/**
 * Get MessageCarryData by widget id and messageType
*/
export declare function getMessageCarryData(wId: string, messageType: MessageType): MessageCarryData;
export declare function getMessageCarryDataByWidgetId(wId: string, messageType: MessageType): MessageCarryData;
export declare function initOutputDataSources(outputDataSources: any): ImmutableArray<UseDataSource>;
/**
 * Get new action item json
*/
export declare const getNewActionItem: (target: IMWidgetJson | IMSectionJson | FrameWorkTargetJson, action: MessageAction, widgetId: string, messageType: MessageType) => MessageActionJson;
/**
 * Get map useDataSources by widgetJson.useMapWidgetIds
 * @param widgetId Note, widgetId is not the map widget id. widgetId is the message widgetId.
 * @returns
 */
export declare function getMapUseDataSourcesByUseMapWidgetIds(widgetId: string): ImmutableArray<UseDataSource>;
export declare function getWidgetJson(widgetId: string): ImmutableObject<WidgetJson>;
export declare function getAppConfig(): Immutable.ImmutableObject<import("jimu-core").AppConfig>;
