import { React, type IMState } from 'jimu-core';
import type { AllWidgetSettingProps, WidgetSettingProps } from './props';
declare class BaseWidgetSetting<P extends AllWidgetSettingProps<unknown> = AllWidgetSettingProps<unknown>, S = unknown> extends React.PureComponent<P, S> {
    /**
     * By default, the props in "WidgetSettingInjectedProps" will be injected into widget setting props. To map more props, please use this function.
     */
    static mapExtraStateProps: (state: IMState, ownProps: Partial<AllWidgetSettingProps<unknown>>) => any;
    /**
     * A widget can just save partial of its config in an app config. In the setting, the widget can use this function to get the full config, and the full config will be available in the `props.fullConfig`.
     * @param config The config saved in the app config
     * @returns The full config
     */
    getFullConfig?: (config: any) => any;
}
export default BaseWidgetSetting;
export interface WidgetSettingStaticMethods {
    mapExtraStateProps?: (state: IMState, ownProps: Partial<AllWidgetSettingProps<any>>) => any;
    /**
     * A widget can just save partial of its config in an app config. In the setting, the widget can use this function to get the full config, and the full config will be available in the `props.fullConfig`.
     * @param config The config saved in the app config
     * @returns The full config
     */
    getFullConfig?: (config: any) => any;
}
export type RawWidgetSettingType = (React.ComponentClass<AllWidgetSettingProps<any>> | React.FunctionComponent<AllWidgetSettingProps<any>>) & WidgetSettingStaticMethods;
export type WrappedWidgetSettingType = (React.ComponentClass<WidgetSettingProps> | React.FunctionComponent<WidgetSettingProps>) & WidgetSettingStaticMethods;
