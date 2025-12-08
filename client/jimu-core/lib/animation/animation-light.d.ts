/** @jsx jsx */
import * as React from 'react';
import type { AnimationSetting } from './types';
export interface AnimationLightProps extends React.HTMLAttributes<HTMLDivElement> {
    parentId: string;
    parentRef?: React.RefObject<HTMLDivElement>;
    innerLayoutId?: string;
    /**
     * effect of the layout item
     */
    animationSetting?: AnimationSetting;
    oneByOneSetting?: AnimationSetting;
    /**
     * @ignore
     */
    wrapperClassName?: string;
}
/**
 * AnimationComponent is supported in Experience Builder to customize how your widgets appear. With provided effects and options, you can build the following experiences:
 *
 * - A window spins in as you load the app.
 * - Widgets fly in as you scroll down the page.
 * - The later view pushes the former one as you navigate a Section.
 * - The descriptions fade in as you hover over a Card widget.
 *
 * ```ts
 * import { Animation, OneByOneAnimation, AnimationContext } from 'jimu-core'
 * ```
 */
export declare const AnimationLight: React.ForwardRefExoticComponent<AnimationLightProps & React.RefAttributes<HTMLDivElement>>;
