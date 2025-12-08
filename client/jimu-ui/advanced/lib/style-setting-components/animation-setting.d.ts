/** @jsx jsx */
import { React, type AnimationPlayMode, type AnimationSetting } from 'jimu-core';
interface OwnProps {
    contentId: string;
    effectSetting: AnimationSetting;
    oneByOneSetting: AnimationSetting;
    isRoot?: boolean;
    supportAsOne?: boolean;
    supportOneByOne?: boolean;
    previewEnabled?: boolean;
    onSettingChange: (mode: AnimationPlayMode, setting: AnimationSetting) => void;
    onPreviewClicked?: (mode: AnimationPlayMode) => void;
    formatMessage: (id: string) => string;
}
interface State {
    showSidePanel: boolean;
}
export declare class AnimationSettingComponent extends React.PureComponent<OwnProps, State> {
    sidePopperTrigger: React.RefObject<HTMLDivElement>;
    buttonRef: React.RefObject<HTMLButtonElement>;
    static defaultProps: Partial<OwnProps>;
    constructor(props: any);
    componentDidUpdate(prevProps: OwnProps): void;
    toggleSidePanel: () => void;
    previewAnimation: (e: any) => void;
    getAnimBoxStyle(): import("jimu-core").SerializedStyles;
    getSidePopperStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
