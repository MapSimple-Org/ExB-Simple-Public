/** @jsx jsx */
import { React, TransitionType, TransitionDirection } from 'jimu-core';
import type { AnimationSetting } from 'jimu-core';
import type { TransitionMetaInfo } from './transition-info';
interface Transition {
    type: TransitionType;
    direction: TransitionDirection;
}
interface OwnProps {
    transition: Transition;
    transitionLabel?: string;
    showOneByOne?: boolean;
    oneByOneEffect?: AnimationSetting;
    onTransitionChange: (transition: Transition) => void;
    onOneByOneChange?: (AnimationSetting: any) => void;
    onPreviewTransitionClicked: () => void;
    onPreviewOneByOneClicked?: () => void;
    onPreviewAsAWhoneClicked: () => void;
    formatMessage: (id: string) => string;
}
interface State {
    showSidePanel: boolean;
}
export declare class TransitionSetting extends React.PureComponent<OwnProps, State> {
    sidePopperTrigger: React.RefObject<HTMLDivElement>;
    buttonRef: React.RefObject<HTMLButtonElement>;
    static defaultProps: Partial<OwnProps>;
    modalStyle: any;
    constructor(props: any);
    toggleSidePanel: () => void;
    previewTransition: (e: any) => void;
    createTransitionCard(metaInfo: TransitionMetaInfo, index: number): import("@emotion/react/jsx-runtime").JSX.Element;
    createDirectionChooser(): import("@emotion/react/jsx-runtime").JSX.Element;
    getSidePopperStyle(): import("jimu-core").SerializedStyles;
    getAnimBoxStyle(): import("jimu-core").SerializedStyles;
    onTransitionTypeChanged: (value: any) => void;
    onDirectionChanged: (e: any) => void;
    previewOneByOneEffect: () => void;
    onPreviewAsAWhoneClicked: (e: any) => void;
    onOnebyOneSettingChange: (mode: any, setting: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
