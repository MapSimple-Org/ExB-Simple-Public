/** @jsx jsx */
import { React, type AnimationMetaInfo, type AnimationSetting, AnimationDirection } from 'jimu-core';
interface OwnProps {
    effectSetting: AnimationSetting;
    metaInfos: AnimationMetaInfo[];
    onSettingChange: (setting: AnimationSetting) => void;
    isOneByOne?: boolean;
    isRoot?: boolean;
    previewEnabled?: boolean;
    onPreviewClicked?: () => void;
    formatMessage: (id: string) => string;
}
export declare class AnimationPart extends React.PureComponent<OwnProps> {
    onWidgetEffectTypeChanged: (e: any, value: any) => void;
    onDurationChange: (e: any) => void;
    onStartModeChange: (e: any) => void;
    onParentModeChange: (e: any) => void;
    onWidgetEffectDirectionChanged: (e: any) => void;
    createAnimationCard(metaInfo: AnimationMetaInfo, index: number): import("@emotion/react/jsx-runtime").JSX.Element;
    chooseDirectionIcon(direction: AnimationDirection): any;
    createEffectDirectionChooser(directions: AnimationDirection[]): import("@emotion/react/jsx-runtime").JSX.Element;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
