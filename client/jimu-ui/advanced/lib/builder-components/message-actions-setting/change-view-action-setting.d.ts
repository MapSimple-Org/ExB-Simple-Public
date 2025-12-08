/** @jsx jsx */
import { React, ReactRedux, type ImmutableArray, type ActionSettingProps, MessageType, type UseDataSource } from 'jimu-core';
interface Config {
    sectionId: string;
    viewId: string;
    useDataSources?: UseDataSource[];
}
interface StateExtraProps {
    views: ImmutableArray<string>;
}
interface State {
    useCustomData: boolean;
}
declare class _ChangeViewActionSetting extends React.PureComponent<ActionSettingProps<Config> & StateExtraProps, State> {
    constructor(props: any);
    handleViewChange: (_evt: any, viewId: string) => void;
    handleDataChange: (useDataSources: UseDataSource[]) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof _ChangeViewActionSetting, {
    config?: Config;
    widgetId?: string;
    useDataSources?: UseDataSource[];
    ref?: React.Ref<_ChangeViewActionSetting>;
    key?: React.Key | null | undefined;
    sectionId?: string;
    intl?: import("jimu-core").IntlShape;
    messageType: MessageType;
    actionId: string;
    messageWidgetId: string;
    onSettingChange: import("jimu-core").ActionSettingChangeFunction;
    onDisableDoneBtn?: (isDisable: boolean) => void;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
