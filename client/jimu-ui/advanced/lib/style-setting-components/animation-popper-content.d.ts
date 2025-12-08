/** @jsx jsx */
import { React, ReactRedux, AnimationPlayMode, type AnimationSetting } from 'jimu-core';
interface OwnProps {
    effectSetting: AnimationSetting;
    oneByOneSetting: AnimationSetting;
    onSettingChange: (mode: AnimationPlayMode, setting: AnimationSetting) => void;
    previewEnabled?: boolean;
    supportOneByOne?: boolean;
    supportAsOne?: boolean;
    isRoot?: boolean;
    onPreviewClicked?: (mode: AnimationPlayMode) => void;
    formatMessage: (id: string) => string;
}
interface State {
    asOneOpened: boolean;
    oneByOneOpened: boolean;
}
interface StateToProps {
    selectedWidgetLabel: string;
}
declare class AnimationPopperContent extends React.PureComponent<OwnProps & StateToProps, State> {
    constructor(props: any);
    onAsOneSettingChange: (setting: AnimationSetting) => void;
    onOneByOneSettingChange: (setting: AnimationSetting) => void;
    previewAsOne: () => void;
    previewOneByOne: () => void;
    toggleAsOneOpened: () => void;
    toggleOneByOneOpened: () => void;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof AnimationPopperContent, {
    ref?: React.Ref<AnimationPopperContent>;
    key?: React.Key | null | undefined;
    previewEnabled?: boolean;
    oneByOneSetting: AnimationSetting;
    formatMessage: (id: string) => string;
    onSettingChange: (mode: AnimationPlayMode, setting: AnimationSetting) => void;
    effectSetting: AnimationSetting;
    isRoot?: boolean;
    onPreviewClicked?: (mode: AnimationPlayMode) => void;
    supportOneByOne?: boolean;
    supportAsOne?: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
