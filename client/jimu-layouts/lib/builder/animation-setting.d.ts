/** @jsx jsx */
import { React, type LayoutInfo, type ImmutableObject, ReactRedux, AnimationPlayMode, type AnimationSetting, TransitionType, type TransitionDirection } from 'jimu-core';
import { type CommonLayoutItemSetting } from 'jimu-layouts/layout-runtime';
interface OwnProps {
    layoutId: string;
    layoutItemId: string;
    onSettingChange?: (layoutInfo: LayoutInfo, setting: any) => void;
    formatMessage: (id: string) => string;
}
interface StateProps {
    setting: ImmutableObject<CommonLayoutItemSetting>;
    isWidget: boolean;
    supportOneByOne: boolean;
    isSection: boolean;
    transitionType?: TransitionType;
    transitionDirection?: TransitionDirection;
    sectionId?: string;
}
interface State {
    animationType: 'in' | 'transition' | 'hover';
}
declare class LayoutItemAnimationSetting extends React.PureComponent<OwnProps & StateProps, State> {
    modalStyle: any;
    constructor(props: any);
    hasAnimationEffect(): boolean;
    hasHoverEffect(): boolean;
    onTransitionSettingChange: (setting: any) => void;
    onHoverEffectChange: (effect: any) => void;
    onEffectSettingChange: (mode: AnimationPlayMode, effectSetting: AnimationSetting) => void;
    onSectionOneByOneEffectSettingChange: (effectSetting: AnimationSetting) => void;
    previewAnimation: (mode: AnimationPlayMode) => void;
    previewTransition: (withOneByOne?: boolean) => void;
    previewTransitionAndOnebyOne: () => void;
    previewOneByOneInSection: () => void;
    previewHover: () => void;
    onPlayModeChange: (mode: AnimationPlayMode) => void;
    switchToIn: () => void;
    switchToTransition: () => void;
    switchToHover: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof LayoutItemAnimationSetting, {
    ref?: React.Ref<LayoutItemAnimationSetting>;
    key?: React.Key | null | undefined;
    layoutId: string;
    layoutItemId: string;
    formatMessage: (id: string) => string;
    onSettingChange?: (layoutInfo: LayoutInfo, setting: any) => void;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
