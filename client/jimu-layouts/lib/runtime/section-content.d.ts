/** @jsx jsx */
import { React, type AnimationPlayMode, type TransitionType, type TransitionDirection, type IMSectionNavInfo, type ImmutableArray } from 'jimu-core';
import type { LayoutProps } from '../types';
interface Props {
    layoutId: string;
    layoutItemId: string;
    views: ImmutableArray<string>;
    navInfo: IMSectionNavInfo;
    animationPreview: boolean;
    playMode: AnimationPlayMode;
    previewId: number;
    currentIndex: number;
    previousIndex: number;
    progress: number;
    loop: boolean;
    viewTransition: {
        type: TransitionType;
        direction: TransitionDirection;
    };
    layoutEntryComponent: React.ComponentClass<LayoutProps>;
}
export declare function SectionContent(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
