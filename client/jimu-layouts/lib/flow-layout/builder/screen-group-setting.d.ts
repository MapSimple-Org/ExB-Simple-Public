/** @jsx jsx */
import { React, ReactRedux, ScreenTransitionType } from 'jimu-core';
import type { LayoutItemSettingProps } from '../../builder/types';
interface StateToProps {
    transitionType: ScreenTransitionType;
    panelTransitionType: ScreenTransitionType;
}
interface State {
    showSidePanel: boolean;
}
declare class ScreenGroupSetting extends React.PureComponent<LayoutItemSettingProps & StateToProps, State> {
    sidePopperTrigger: React.RefObject<HTMLDivElement>;
    constructor(props: any);
    onTransitionTypeChange: (type: ScreenTransitionType) => void;
    onPanelTransitionTypeChange: (type: ScreenTransitionType) => void;
    getAnimBoxStyle(): import("jimu-core").SerializedStyles;
    getSidePopperStyle(): import("jimu-core").SerializedStyles;
    toggleSidePanel: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof ScreenGroupSetting, {
    style: any;
    ref?: React.Ref<ScreenGroupSetting>;
    key?: React.Key | null | undefined;
    layoutId: string;
    additionalInfo?: any;
    supportAutoSize?: boolean;
    layoutItem: import("jimu-core").LayoutItemJson;
    formatMessage: (id: string) => string;
    onSettingChange: (layoutInfo: import("jimu-core").LayoutInfo, setting: any) => void;
    isLockLayout: boolean;
    onStyleChange: (layoutInfo: import("jimu-core").LayoutInfo, style: any) => void;
    onPosChange: (layoutInfo: import("jimu-core").LayoutInfo, bbox: import("jimu-core").BoundingBox) => void;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
