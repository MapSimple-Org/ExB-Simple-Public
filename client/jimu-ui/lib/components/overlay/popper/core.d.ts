import { React } from 'jimu-core';
import { type ReferenceType, type Middleware, type Placement, type Strategy, type OffsetOptions, type HideOptions, type ShiftOptions, type FlipOptions, type AutoPlacementOptions, type ArrowOptions, type InlineOptions, type SizeOptions, type MiddlewareData } from '@floating-ui/react';
import { DefaultArrowSize, type PopperChildrenProps } from './children';
export type { ReferenceType, Placement, Strategy, HideOptions, ShiftOptions, FlipOptions, OffsetOptions, AutoPlacementOptions, ArrowOptions, SizeOptions };
export { DefaultArrowSize };
export type AutoPlacement = 'auto' | 'auto-start' | 'auto-end';
export interface ArrowStyle {
    background?: string;
    border?: {
        type?: 'solid' | 'dashed' | 'dotted' | 'double';
        color?: string;
        width?: string;
    };
    size?: number;
}
export interface ArrowStyleOptions extends Omit<ArrowOptions, 'element'> {
    style?: ArrowStyle;
}
/**
 * The `PopperCore` component props.
 */
export interface PopperCoreProps extends Omit<PopperChildrenProps, 'strategy' | 'placement' | 'arrowRef' | 'arrowOptions' | 'middlewareData' | 'children'> {
    /**
     * If `true`, the popper is visible.
     */
    open: boolean;
    /**
     * Reference node used to set the position of popper.
     */
    reference: ReferenceType;
    /**
     * Automatically updates the position of the floating element when necessary to ensure it stays anchored.
     * @default false
     */
    autoUpdate?: boolean;
    /**
     * Improves positioning for inline reference elements that span over multiple lines.
     * If it is a boolean value, it means enabling the default behavior of the component or disabling that behavior.
     */
    inlineOptions?: InlineOptions | boolean;
    /**
     * The hide options can hide the popper when the reference is hidden.
     * If it is a boolean value, it means enabling the default behavior of the component or disabling that behavior.
     * @default true
     */
    hideOptions?: HideOptions | HideOptions[] | boolean;
    /**
     * The shift options can shift the popper when it will overflow the clipping boundary.
     * If it is a boolean value, it means enabling the default behavior of the component or disabling that behavior.
     */
    shiftOptions?: ShiftOptions | boolean;
    /**
     * The flip options can flip the popper when it will overflow the clipping boundary.
     * If it is a boolean value, it means enabling the default behavior of the component or disabling that behavior.
     * Note: `flipOptions` and `autoPlacementOptions` cannot be used together inside the same middleware array; make sure you choose only one of them to use.
     * @default true
     */
    flipOptions?: FlipOptions | boolean;
    /**
     * The auto placement options can customize the behavior of the auto placement.
     * Note: `flipOptions` and `autoPlacementOptions` cannot be used together inside the same middleware array; make sure you choose only one of them to use.
     * @default false
     */
    autoPlacementOptions?: AutoPlacementOptions | boolean;
    /**
     * The offset modifier can shift your popper on both its axis.
     * If it is a boolean value, it means enabling the default behavior of the component or disabling that behavior.
     */
    offsetOptions?: OffsetOptions | [number, number] | boolean;
    /**
     * The arrow options can show the arrow of the popper.
     * If it is a boolean value, it means enabling the default behavior of the component or disabling that behavior.
     * @default false
     */
    arrowOptions?: ArrowStyleOptions | boolean;
    /**
     * Provides data to change the size of a floating element.
     * This is useful to ensure the floating element isn’t too big to fit in the viewport (or more specifically, its clipping context), especially when a maximum size isn’t specified.
     * It also allows matching the width/height of the reference element.
     *
     * If it is a boolean value, it means enabling the default behavior of the component or disabling that behavior.
     */
    sizeOptions?: SizeOptions | boolean;
    /**
     * Middleware allow you to customize the behavior of the positioning and be as granular as you want, adding your own custom logic.
     * It is recommended to use `hideOptions`, `shiftOptions`, `flipOptions`, `offsetOptions` directly.
     * "Node": If `middleware` is set, the above options will be ignored and the component's preset middleware will not be enabled.
     */
    middleware?: Middleware[];
    /**
     * Describes the positioning strategy to use.
     * By default, it is absolute, which in the simplest cases does not require repositioning of the popper.
     * If your reference element is in a fixed container, use the fixed strategy.
     * @default absolute
     */
    strategy?: Strategy;
    /**
     * Describes the preferred placement of the popper.
     * @default bottom
     */
    placement?: Placement;
    /**
     * Disable the portal behavior. The children stay within it's parent DOM hierarchy.
     * @default false
     */
    disablePortal?: boolean;
    /**
     * Whether to keep the popper mounted when it is not visible.
     * @default false
     */
    keepMount?: boolean;
    /**
     * When this value changes, will recalculate the position.
     * Note: The `version` cannot be used together with `autoUpdate`, and `autoUpdate` has higher priority.
     * @ignore
     */
    version?: number;
    /**
     * Popper render function.
     */
    children: React.ReactNode | ((props: PopperCoreRenderProps) => React.ReactNode);
}
export interface PopperCoreRenderProps {
    open?: boolean;
    x: number;
    y: number;
    className?: string;
    isPositioned: boolean;
    setFloating: React.RefCallback<HTMLElement>;
    setReference: React.RefCallback<Element>;
    arrowRef: React.MutableRefObject<HTMLElement>;
    placement: string;
    styles: React.CSSProperties;
    middlewareData: MiddlewareData;
    update: () => void;
    [x: string]: any;
}
export declare const PopperCore: React.ForwardRefExoticComponent<PopperCoreProps & React.RefAttributes<HTMLDivElement>>;
