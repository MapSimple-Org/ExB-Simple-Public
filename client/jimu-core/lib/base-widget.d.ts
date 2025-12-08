import * as React from 'react';
import type { AllWidgetProps, WidgetProps } from './types/props';
import type { IMState } from './types/state';
import { BaseVersionManager, type Version } from './version-manager';
import type { IMDataSourcesJson, IMWidgetJson } from './types/app-config';
/**
 * The upgrade info of a widget, will be used when the `upgradeFullInfo` is true in a version.
 */
export interface WidgetUpgradeInfo {
    /** The whole widget JSON. */
    widgetJson: IMWidgetJson;
    /** The output data source JSON need to be upgraded. For each data source JSON, it should be the whole  data source JSON. */
    outputDataSourceJsons?: IMDataSourcesJson;
}
/**
 * The version of a widget.
 */
export interface WidgetVersion extends Version<WidgetUpgradeInfo> {
    /** If a version needs to upgrade full info (widgetJson and outputDataSourceJsons), it should set "upgradeFullInfo" to true. */
    upgradeFullInfo?: boolean;
}
/**
 * When a widget needs to upgrade widgetJson or outputDataSourceJsons, it should extend this class.
 *
 * The versions in this VersionManager can upgrade config only or upgrade full info (widgetJson and outputDataSourceJsons).
 * If a version can upgrade full info, it should set "upgradeFullInfo" to true.
 */
export declare class WidgetVersionManager extends BaseVersionManager<WidgetUpgradeInfo> {
    /** The versions list. */
    versions: WidgetVersion[];
    widgetUpgrade(oldUpgradeInfo: WidgetUpgradeInfo, oldVersion: string, newVersion: string, id: string): Promise<WidgetUpgradeInfo>;
    private runWidgetUpgrader;
}
/**
 * This base class defines some common methods for a widget.
 * A widget is a React component. We don't recommend extending this class. Use the functional React component instead.
 */
declare class BaseWidget<P extends AllWidgetProps<unknown> = AllWidgetProps<unknown>, S = unknown> extends React.PureComponent<P, S> {
    /**
     * The framework has injected many props into the widget props. Check `AllWidgetProps` to see the details.
     * If your widget needs to use more state, you can use this function. However, for functional components, the `useSelector` hook is recommended.
     */
    static mapExtraStateProps: (state: IMState, ownProps: Partial<AllWidgetProps<any>>) => any;
    /**
     * The version manager of a widget (optional)
     */
    static versionManager?: BaseVersionManager | WidgetVersionManager;
    /**
     * A widget can just save partial of its config in an app config. In the runtime, the widget can use this function to get the full config.
     * @param config The config saved in the app config
     * @returns The full config
     */
    static getFullConfig?: (config: any) => any;
}
/**
 * The static methods of a widget.
 */
export interface WidgetStaticMethods {
    /**
     * If a widget needs more state, it can use this function to map the state to the props.
     * @param state The app state
     * @param ownProps The widget props
     * @returns
     */
    mapExtraStateProps?: (state: IMState, ownProps: Partial<AllWidgetProps<any>>) => any;
    /**
     * The version manager of a widget (optional)
     */
    versionManager?: BaseVersionManager;
    /**
     * A widget can just save partial of its config in an app config. In the runtime, the widget can use this function to get the full config.
     * @param config The config saved in the app config
     * @returns The full config
     */
    getFullConfig?: (config: any) => any;
}
export type RawWidgetType = (React.ComponentClass<AllWidgetProps<any>> | React.FunctionComponent<AllWidgetProps<any>>) & WidgetStaticMethods;
export type WrappedWidgetType = (React.ComponentClass<WidgetProps> | React.FunctionComponent<WidgetProps>) & WidgetStaticMethods;
export default BaseWidget;
