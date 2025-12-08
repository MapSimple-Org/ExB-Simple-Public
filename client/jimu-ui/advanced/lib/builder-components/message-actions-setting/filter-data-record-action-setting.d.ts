/** @jsx jsx */
import { React, type IMThemeVariables, type UseDataSource, ReactRedux, MessageType } from 'jimu-core';
import type { IMConfig } from './type';
declare const _default: ReactRedux.ConnectedComponent<React.ForwardRefExoticComponent<Pick<any, string | number | symbol> & {
    theme?: IMThemeVariables;
}>, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    actionId: string;
    widgetId?: string;
    sectionId?: string;
    messageWidgetId: string;
    config?: IMConfig;
    messageType: MessageType;
    useDataSources?: UseDataSource[];
    intl?: import("jimu-core").IntlShape;
    onSettingChange: import("jimu-core").ActionSettingChangeFunction;
    onDisableDoneBtn?: (isDisable: boolean) => void;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
