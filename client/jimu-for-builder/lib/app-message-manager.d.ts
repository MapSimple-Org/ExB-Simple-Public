import { React, type MessageManager, type MessageType, type MessageAction, type ActionSettingProps, type IMMessageActionJson } from 'jimu-core';
export default class AppMessageManager {
    static instance: AppMessageManager;
    static getInstance(): AppMessageManager;
    private actionSettings;
    getAllActions(): MessageAction[];
    getAction(widgetId: string, actionName: string): MessageAction;
    getAppMessageManager(): MessageManager;
    /**
     * Return the action setting component uri, null means no setting.
     */
    getActionSettingComponentUri(action: MessageAction, messageType: MessageType, messageWidgetId?: string): string;
    getFilteredActions(messageType: MessageType, messageWidgetId?: string): MessageAction[];
    private getConvertedSettingUri;
    loadActionSettingClass(actionJson: IMMessageActionJson, actionSettingUri: string): Promise<React.ComponentClass<ActionSettingProps<unknown>>>;
    private loadRawSettingClass;
    private loadDependency;
    private injectActionSettingProps;
    registerActionRawSettingClass(uri: string, rawSettingClass: any): void;
    getActionRawSettingClass(uri: string): React.ComponentClass<ActionSettingProps<unknown>, any>;
}
