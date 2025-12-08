import type React from 'react';
import type { IntlShape } from 'react-intl';
import type { DataRecordSet } from './data-sources';
import type { AppConfig, IconResult } from './types/app-config';
/** The data action constructor options. */
export interface DataActionConstructorOptions {
    /** The data action ID. */
    id: string;
    /** The data action name. */
    name?: string;
    /** The data action label. */
    label?: string;
    /** The data action icon. */
    icon?: string;
    index?: number;
    /** The widget ID that provides the data action. */
    widgetId?: string;
    /** The `Intl` object for i18n. */
    intl: IntlShape;
}
/** The options to register a data action. */
export interface RegisterDataActionOptions {
    /** The data action ID. */
    id: string;
    /** The data action name. */
    name?: string;
    /** The data action URI. */
    uri?: string;
    /** The data action icon. */
    icon?: string;
    /** The widget ID that provides the data action. */
    widgetId?: string;
    /** The data action label. */
    label: string;
    /** The data action class. */
    ActionClass?: typeof DummyDataAction;
    /** The app config. Will be set only on the first time load. */
    appConfig?: AppConfig;
}
/** The props of the data action setting component */
export interface DataActionSettingProps<T> {
    /** The widget ID that provides the data action. */
    widgetId: string;
    /** The data action name. */
    actionName: string;
    /** The data action config. */
    config?: T;
    /** The `Intl` object for i18n. */
    intl?: IntlShape;
    /** The callback when the setting is changed. */
    onSettingChange: (config: T) => void;
}
/** The data level of the data action. */
export declare enum DataLevel {
    /** The data source level. */
    DataSource = "DATA_SOURCE",
    /** The records level. */
    Records = "RECORDS"
}
/**
 * A data action is a piece code that can process data. It can process the whole data source, some data records, or both (determined by the `isSupported` method).
 *
 * A data action can receive multiple data sets, but the data action can decide whether it supports multiple data sets or not.
 *
 * The `isSupported` method is invoked first to test whether the data action can process the provided data.
 * The `onExecute` method will be invoked when an user click the action menu.
 * Both of these two methods are passed in the `DataRecordSet` and `DataLevel` parameters, the widget that uses the data action decides how to pass in `DataRecordSet`,
 * and the action can decide how to process the data.
 *
 * Widgets should use the `DataActionList` component to use the data actions.
 *
 * Although the data action can be very flexible, for consistent UX, these guides should be followed:
 * * For widgets that use data actions:
 *    * Set the correct `DataRecordSet.type` and the records, more specifically, pass in the selected records, loaded records or the current record.
 * * For data actions:
 *    * For `Records` level data action:
 *      * Use the passed in `records`, the records are always not empty.
 *    * For `DataSource` level data action:
 *      * Always process all of the data despite the passed-in records.
 */
export interface DataAction {
    /**
     * The unique ID. For widget-provided actions, the ID is the combination of the widget ID and action name.
     */
    id: string;
    /** @ignore */
    index?: number;
    /** The action name. */
    name?: string;
    /** The user readable-label for the action. */
    label?: string;
    /** The action icon. */
    icon?: IconResult | string;
    /**
     * The widget ID that provides the action.  If no widget ID is provided, the action is provided by the framework.
     */
    widgetId?: string;
    /** The `Intl` object for i18n. */
    intl: IntlShape;
    /**
     * Whether the action can be used by the widget that provides the action.
     */
    supportProviderWidget?: boolean;
    /**
     * Whether the action is watching the data sets change. If the action is watching the data sets change, the `onDataSetsChange` method will be invoked when the data sets change.
     */
    isWatchingDataSetsChange?: boolean;
    /** This method will be invoked when the widget that provides the action is removed. */
    destroy: () => void;
    /**
     * Will be invoked to determine whether the data action can process the data.
     *
     * @param dataSets The data sets that will be processed.
     * @param dataLevel The data level that will be processed.
     * @param widgetId The widget id that use the data actions.
     * @returns `true` if the data action can process the data.
     */
    isSupported: (dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string) => Promise<boolean>;
    /**
     * This is the action logic.
     *
     * @param dataSets The data sets that will be processed.
     * @param dataLevel The data level that will be processed.
     * @param widgetId The widget id that use the data actions.
     * @param actionConfig The action config that is set by the user. Not all actions have the config.
     * @returns `true` if the action is executed successfully. If the action needs to show a dialog, return the dialog content.
     */
    onExecute: (dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string, actionConfig?: any) => Promise<boolean | React.ReactElement>;
    /**
     * This method will be invoked when the data sets change and the action is watching the data sets change.
     * Please make sure check the widget ID before processing the data sets.
     *
     * @param dataSets The data sets that will be processed.
     * @param widgetId The widget id that use the data actions.
     */
    onDataSetsChange?: (dataSets: DataRecordSet[], widgetId: string) => void;
}
/**
 * The abstract class for data action.
 */
export declare abstract class AbstractDataAction implements DataAction {
    /**
     * The unique ID
     */
    id: string;
    name: string;
    label: string;
    index: number;
    intl: IntlShape;
    isWatchingDataSetsChange?: boolean;
    /**
     * The widget ID that provides the action
     */
    widgetId: string;
    icon?: IconResult | string;
    constructor(options: DataActionConstructorOptions);
    destroy(): any;
    getLabel(dataSet: DataRecordSet): string;
    abstract isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean>;
    abstract onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string, actionConfig?: any): Promise<boolean | React.ReactElement>;
}
export declare class DummyDataAction extends AbstractDataAction {
    isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean>;
    onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean | React.ReactElement>;
}
