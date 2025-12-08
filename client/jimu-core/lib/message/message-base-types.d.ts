import type { DataRecord, DataRecordSet, DataSource } from '../data-sources';
import type { IntlShape } from 'react-intl';
import type { BaseVersionManager } from '../version-manager';
import type { UseDataSource, AppConfig } from '../types/app-config';
import type { IPoint } from '@esri/arcgis-rest-request';
import type { JimuMapView } from 'jimu-arcgis';
/**
 * This enum defines all supported messages in the framework.
 */
export declare enum MessageType {
    /** @ignore */
    StringSelectionChange = "STRING_SELECTION_CHANGE",
    ExtentChange = "EXTENT_CHANGE",
    DataRecordsSelectionChange = "DATA_RECORDS_SELECTION_CHANGE",
    DataSourceFilterChange = "DATA_SOURCE_FILTER_CHANGE",
    DataRecordSetChange = "DATA_RECORD_SET_CHANGE",
    DataSourcesChange = "DATA_SOURCES_CHANGE",
    LocationChange = "LOCATION_CHANGE",
    /** @ignore */
    SelectDataRecord = "SELECT_DATA_RECORD",
    /** @since 1.14 */
    ButtonClick = "BUTTON_CLICK",
    /** @since 1.15 */
    ViewChange = "VIEW_CHANGE"
}
/**
 * Some messages carry data, use this property to declare where the data comes from,
 * which helps constrain the trigger data source selection in config.
 */
export declare enum MessageCarryData {
    UseDataSource = "USE_DATA_SOURCE",
    OutputDataSource = "OUTPUT_DATA_SOURCE",
    BothDataSource = "BOTH_DATA_SOURCE"
}
/**
 * The message description. This description helps filter available actions in builder.
 * Widget can use this interface to declare the published message in manifest.
 */
export interface MessageDescription {
    messageType: MessageType;
    /**
     * If this property is not set, it means the message may carry use data source
     */
    messageCarryData?: MessageCarryData;
    /**
     * The widget id from which the message is sourced. If a widget id or section id is not provided, the message is provided by the Jimu framework.
     */
    widgetId?: string;
    /**
     * The section id from which the message is sourced. If a widget id or section id is not provided, the message is provided by the Jimu framework.
     */
    sectionId?: string;
}
/** @ignore */
export declare function getMessageTypeLabel(messageType: MessageType, intl: IntlShape): string;
/**
 * The interface for all message types `MessageType`.
 */
export interface Message {
    /** The message type.  */
    type: MessageType;
    /**
     * The widget id from which the message is sourced. If a widget id is not provided, the message is provided by the Jimu framework.
     */
    widgetId?: string;
}
/** @ignore */
export declare class StringSelectionChangeMessage implements Message {
    type: MessageType;
    widgetId: string;
    str: string;
    constructor(widgetId: string, str: string);
}
/**
 * This message is used when implementing a workflow on a change of selected records. This message carries the selected records. Other widgets
 * within an experience may subscribe to this message and implement an update workflow when the message
 * is received.
 */
export declare class DataRecordsSelectionChangeMessage implements Message {
    type: MessageType;
    widgetId: string;
    /** The data sources the message carries. */
    dataSourceIds: string[];
    /** The selected records. To cancel selection, use an empty array. */
    records: DataRecord[];
    /**
     * The extent of the selected records.
     */
    extent?: __esri.Extent | __esri.Graphic | ((jimuMapView: JimuMapView) => Promise<__esri.Extent | __esri.Graphic>);
    constructor(widgetId: string, records: DataRecord[], dataSourceIds: string[]);
}
/**
 * This message is used when needing to implement a workflow upon a change of extent.
 * This message carries the map [`Extent`](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-Extent.html).
 * Other widgets within an experience may subscribe to this message and implement an update workflow when the message is received.
 */
export declare class ExtentChangeMessage implements Message {
    type: MessageType;
    widgetId: string;
    /** The extent, which is the main content of the extent change message. */
    extent: __esri.Extent;
    /** Represents the current view as a Viewpoint or point of observation on the view. */
    viewpoint: __esri.Viewpoint;
    /**
     * Indication whether the view is animating, being navigated with or resizing.
     * During a movement, the ExtentChangeMessage message will be published multiple times with stationary value false,
     * and when the map is static, the ExtentChangeMessage message will be published with stationary value true.
     */
    stationary: boolean;
    private relatedWidgetIds?;
    /**
     * @ignore
     * See details in MapBase component of Map widget.
     */
    publishTime: number;
    /**
     * Indicate whether the view is interactive or not.
     * @ignore
     */
    interactive: boolean;
    constructor(widgetId: string, extent: __esri.Extent, viewpoint: __esri.Viewpoint, stationary: boolean);
    setRelatedWidgetIds(widgetIds: string[]): void;
    getRelatedWidgetIds(): string[];
    addRelatedWidgetId(widgetId: string): void;
    clone(): ExtentChangeMessage;
}
/**
 * This message is used when a widget needs to announce its changes on data source filter to other widgets.
 * This message carries the data source ids that the filter has changed. Other widgets within an experience may subscribe to this message and implement an update workflow when the message is received.
 * For example: Map widget is triggered by Filter widget to zoomTo current features.
 */
export declare class DataSourceFilterChangeMessage implements Message {
    type: MessageType;
    widgetId: string;
    /** The id of the data source. */
    dataSourceIds: string[];
    constructor(widgetId: string, dataSourceIds: string[]);
}
/**
 * The `RecordSetChangeType` provides three types of a record set change: `CREATE_UPDATE` and `REMOVE`.
 * This can be used whenever a workflow involves reliance on a change to record set(s). It is also used in
 * the `DataRecordSetChangeMessage`.
*/
export declare enum RecordSetChangeType {
    CreateUpdate = "CREATE_UPDATE",
    Remove = "REMOVE"
}
/**
 * This message is used when needing to implement a workflow upon the creation, update or removal of a record set.
 * This message carries the changed `DataRecordSet` information.
 * Other widgets may need to subscribe to this message whenever a workflow involves reliance on a change to record set(s).
 */
export declare class DataRecordSetChangeMessage implements Message {
    type: MessageType;
    widgetId: string;
    /** The record set change type. */
    changeType: RecordSetChangeType;
    /** The name of the record sets. When removing some data record sets, only names are required.  */
    dataRecordSetNames?: string[];
    /** The data record sets that are created or updated. */
    dataRecordSets?: DataRecordSet[];
    /**
     * The extent of the created records.
     */
    extent?: __esri.Extent | __esri.Graphic | ((jimuMapView: JimuMapView) => Promise<__esri.Extent | __esri.Graphic>);
    /**
     * When removing data record sets, please pass in dataRecordSetNames; when adding or updating data record sets, please pass in dataRecordSets
     */
    constructor(widgetId: string, changeType: RecordSetChangeType, data: string[] | DataRecordSet[]);
}
/**
 * The `DataSourcesChangeType` provides two types of data sources change: `CREATE` and `REMOVE`.
 * This can be used when data sources are added or removed in the runtime.
*/
export declare enum DataSourcesChangeType {
    Create = "CREATE",
    Remove = "REMOVE"
}
/**
 * This message is used when needing to implement a workflow upon the creation or removal of some data sources.
 * This message carries the changed data sources information.
 * Other widgets may need to subscribe to this message whenever a workflow involves reliance on data sources change.
 */
export declare class DataSourcesChangeMessage implements Message {
    type: MessageType;
    widgetId: string;
    /** The change type. */
    changeType: DataSourcesChangeType;
    /** The changed data sources. */
    dataSources: DataSource[];
    constructor(widgetId: string, changeType: DataSourcesChangeType, dataSources: DataSource[]);
}
/**
 * This message is used when a widget needs to announce its changes on location to other widgets.
 * For example: Map widget publishes this message when user click the locate tool.
 */
export declare class LocationChangeMessage implements Message {
    type: MessageType;
    widgetId: string;
    point: IPoint;
    constructor(widgetId: string, point: IPoint);
}
/** @ignore */
export declare class SelectDataRecordMessage implements Message {
    type: MessageType;
    widgetId: string;
    dataSourceId: string;
    recordId: string;
    constructor(widgetId: string, dataSourceId: string, recordId: string);
}
/**
 * This message is published when a widget needs to announce the user click event.
 * For example: A Button widget publishes this message when user click on it, and triggers a Sidebar
 * widget toggling between expand and collapse.
 */
export declare class ButtonClickMessage implements Message {
    type: MessageType;
    widgetId: string;
    constructor(widgetId: string);
}
/**
 * This message is published when a widget needs to announce the view change event.
 */
export declare class ViewChangeMessage implements Message {
    type: MessageType;
    widgetId: string;
    viewId: string;
    preViewId: string;
    constructor(widgetId: string, viewId: string, preViewId?: string);
}
/**
 * The interface for all message actions. Message action executes when a matched message is received.
 */
export interface MessageAction {
    /**
     * The unique id of the action. For actions provided by a widget, the id is: widgetId + actionName.
     */
    id: string;
    /** The action name. */
    name?: string;
    /** The action label. To support i18n, use `_action_${actionName}` as the string key. */
    label: string;
    /**
     * The widget ID that provides the action. If a widget id or section id is not provided, the action is provided by the Jimu framework.
  
     */
    widgetId?: string;
    /**
     * The section ID that provides the action. If a widget id or section id is not provided, the action is provided by the Jimu framework.
  
     */
    sectionId?: string;
    intl: IntlShape;
    /**
     * This indicates whether or not the type of message can trigger the filter message action.
     * This method is used in builder to filter the available actions.
     * @param messageDescription
     */
    filterMessageDescription: (messageDescription: MessageDescription) => boolean;
    /**
     * This indicates whether a specific message can trigger the filter message action.
     * This method is used to filter messages in the message manager.
     */
    filterMessage: (message: Message) => boolean;
    /**
     * Get the default message action config.
     * This method is called when a new message action is configured in the builder.
     */
    getDefaultMessageActionConfig?: (message: Message) => any;
    /**
     * The execution of the action when the message is matched.
     *
     * Please make sure this method returns true to indicate the action is executed successfully, so the following actions can be executed.
     * @param message
     * @param actionConfig
     */
    onExecute: (message: Message, actionConfig?: any) => Promise<boolean> | boolean;
    /**
     * This returns the action setting component uri. The returned value should match the
     * `settingUri` from the widget manifest. If no setting is required, `null` is returned.
     *
     * This method is required for framework actions but optional for widget actions.
     *
     * This setting component is used to configure the action according to the message.
     */
    getSettingComponentUri?: (messageType: MessageType, messageWidgetId?: string) => string;
    /**
     * When a widget is removed, actions provided by this widget will be destroyed.
     */
    destroy: () => void;
    /**
     * When an action is removed from a message's listener, this function will be invoked.
     */
    onRemoveListen: (messageType: MessageType, messageWidgetId?: string) => void;
}
/** @ignore */
export interface ActionSettingProps<T> {
    actionId: string;
    widgetId?: string;
    sectionId?: string;
    messageWidgetId: string;
    config?: T;
    messageType: MessageType;
    useDataSources?: UseDataSource[];
    intl?: IntlShape;
    onSettingChange: ActionSettingChangeFunction;
    onDisableDoneBtn?: (isDisable: boolean) => void;
}
/** @ignore */
export type ActionSettingChangeFunction = (settingOptions: ActionSettingOptions) => void;
/** @ignore */
export interface ActionSettingOptions {
    actionId: string;
    config: any;
    useDataSources?: UseDataSource[];
}
/** @ignore */
export interface MessageActionConstructorOptions {
    id: string;
    name?: string;
    widgetId?: string;
    sectionId?: string;
    label: string;
    intl: IntlShape;
}
/** @ignore */
export interface RegisterMessageActionOptions {
    id: string;
    name?: string;
    uri?: string;
    widgetId?: string;
    sectionId?: string;
    label: string;
    ActionClass?: typeof DummyMessageAction;
    appConfig?: AppConfig;
}
/**
 * The abstract base class for `MessageAction`. To create a custom message action, extend from this class.
 */
export declare abstract class AbstractMessageAction implements MessageAction {
    id: string;
    name?: string;
    widgetId?: string;
    sectionId?: string;
    label: string;
    intl: IntlShape;
    static versionManager: BaseVersionManager;
    constructor(options: MessageActionConstructorOptions);
    destroy(): any;
    onRemoveListen(messageType: MessageType, messageWidgetId?: string): any;
    abstract filterMessageDescription(messageDescription: MessageDescription): boolean;
    abstract filterMessage(message: Message): boolean;
    abstract onExecute(message: Message, actionConfig?: any): Promise<boolean> | boolean;
}
/**
 * This class is used for type check.
 */
/** @ignore */
export declare class DummyMessageAction extends AbstractMessageAction {
    filterMessageDescription(messageDescription: MessageDescription): boolean;
    filterMessage(message: Message): boolean;
    onExecute(message: Message, actionConfig?: any): Promise<boolean> | boolean;
}
