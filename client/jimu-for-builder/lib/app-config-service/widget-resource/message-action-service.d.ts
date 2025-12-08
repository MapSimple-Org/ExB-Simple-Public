import { type IMAppConfig, type DuplicateContext } from 'jimu-core';
export declare class MessageActionService {
    /**
     * Duplicate a widget's message action config. Including:
     * 1. duplicate the item that matches widgetId
     * 2. duplicate actions that matches widgetId
     * @param appConfig
     * @param widgetId
     * @param newWidgetId
     * @returns
     */
    duplicate(appConfig: IMAppConfig, widgetId: string, newWidgetId: string, context: DuplicateContext): [IMAppConfig, string];
    /**
     * Clean the messageConfigs, remove anything that related to the widgetId
     * @param appConfig
     * @param widgetId
     * @returns
     */
    removeFromWidget(appConfig: IMAppConfig, widgetId: string): IMAppConfig;
    /**
     * Clean the messageConfigs, remove anything that related to the section
     * @param appConfig
     * @param sectionId
     * @returns
     */
    removeFromSection(appConfig: IMAppConfig, sectionId: string): IMAppConfig;
}
declare const _default: MessageActionService;
export default _default;
