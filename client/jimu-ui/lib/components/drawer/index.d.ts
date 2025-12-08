import { React } from 'jimu-core';
import { type TransitionDurationOption } from 'jimu-theme';
import { type PaperProps } from '../surface';
import type { StandardComponentProps } from '../types';
export type AnchorDirection = 'left' | 'right' | 'top' | 'bottom' | 'full';
/**
 * The `Drawer` component props
 */
export interface DrawerProps extends StandardComponentProps {
    /**
     * Side from which the drawer will appear.
     * @default left
     */
    anchor?: AnchorDirection;
    /**
     * The contents of the drawer.
     */
    children: any;
    /**
     * Function for toggling open in the controlling component.
     * @event
     */
    toggle?: () => void;
    /**
     * If `true`, the drawer is open.
     * @default false
     */
    open: boolean;
    /**
     * Props applied to the `Paper` element.
     * @default {}
     */
    paperProps?: PaperProps;
    /**
     * The variant to use.
     * @default temporary
     */
    variant?: 'permanent' | 'temporary';
    /**
     * If `true`, the backdrop is not rendered.
     * @default false
     */
    backdrop?: boolean;
    /**
     * @ignore
     * Flips the anchor automatically, if the locale is following right-to-left (RTL).
     */
    autoFlip?: boolean;
    /**
     * Define the `z-index` of the element.
     */
    zIndex?: number;
    /**
     * The duration for the transition, in milliseconds.
     */
    transitionDuration?: TransitionDurationOption;
}
export declare const getAnchor: (anchor: AnchorDirection, isRTL: boolean, autoFlip: boolean) => AnchorDirection;
export declare const getSlideAnchor: (anchor: AnchorDirection, isRTL: boolean) => AnchorDirection;
/**
 * The Drawer component is surfaces containing supplementary content that are anchored to the left or right edge of the screen.
 *
 * ```ts
 * import { Drawer } from 'jimu-ui'
 * ```
 */
export declare const Drawer: React.ForwardRefExoticComponent<DrawerProps & React.RefAttributes<HTMLDivElement>>;
