import type * as React from 'react';
import type { AnimationPlayMode, AnimationSetting } from '../animation';
export declare enum TransitionDirection {
    Horizontal = "H",
    Vertical = "V"
}
export declare enum TransitionType {
    Cube = "CUBE",
    Cover = "COVER",
    Fade = "FADE",
    Push = "PUSH",
    Box = "BOX",
    None = "None"
}
export interface TransitionContainerProps {
    children: React.ReactNode | React.ReactNode[];
    /**
     * If use progress to navigate the contents
     */
    useProgress?: boolean;
    /**
     * If navigate in predefined step
     */
    useStep?: boolean;
    /**
     * Navigation progress whose value is from 0.0 to 1.0
     */
    progress?: number;
    /**
     * The content index which is active before navigation.
     */
    previousIndex?: number;
    /**
     * The content index which is active after navigation.
     */
    currentIndex?: number;
    /**
     * Direction of the transition. TransitionDirection.Horizontal or TransitionDirection.Vertical.
     */
    direction?: TransitionDirection;
    /**
     * Type of the transition effect. Includes:
     * TransitionType.Cube
     * TransitionType.Cover
     * TransitionType.Fade
     * TransitionType.Push
     * TransitionType.Box
     * TransitionType.None
     */
    transitionType?: TransitionType;
    oneByOneSetting?: AnimationSetting;
    /**
     * Used in builder to preview the transition effect.
     */
    playId?: number;
    /**
     * Used in builder to preview the section's one by one animation
     */
    previewId?: number;
    previewMode?: AnimationPlayMode;
    /**
     * Used to specify if the widgets animation should be played.
     */
    withOneByOne?: boolean;
    loop?: boolean;
}
export interface TransitionHandler {
    /**
     * Calculate transition props of all items
     * @param i index of the item
     * @param progress the progress of the transition
     * @param currentIndex currently selected item
     * @param previousIndex previously selected item
     * @param isInitTransitionStyle only useful in continuous change. Move the current view to the start point if it is ture
     */
    getTransitionProps: (i: number, currentIndex: number, previousIndex: number, progress?: number) => any;
    getVariants: () => {
        toPrevious: any;
        toNext: any;
        fromPrevious: any;
        fromNext: any;
        showView: any;
        hideView: any;
    };
}
