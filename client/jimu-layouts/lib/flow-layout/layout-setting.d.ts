/** @jsx jsx */
import { React, ReactRedux } from 'jimu-core';
interface Props {
    layoutId: string;
    formatMessage: (id: string) => string;
}
interface StateToProps {
    setting?: any;
}
declare class FlowLayoutSetting extends React.PureComponent<Props & StateToProps> {
    updateSpace: (value: any) => void;
    updatePadding: (value: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof FlowLayoutSetting, {
    ref?: React.Ref<FlowLayoutSetting>;
    key?: React.Key | null | undefined;
    layoutId: string;
    formatMessage: (id: string) => string;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
