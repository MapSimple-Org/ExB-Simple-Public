import { React } from 'jimu-core';
import { type AutoPlacementOptions, type FlipOptions, type OffsetOptions, type Placement, type ShiftOptions, type Strategy } from '../popper/core';
import { type TargetType } from '../utils';
import type { FloatingPanelChildrenProps } from './children';
export interface PositionProviderProps {
    /**
     * Reference node used to set the position of floating panel.
     */
    reference?: TargetType;
    /**
     * If `true`, the panel is visible.
     */
    open?: boolean;
    /**
     * Whether to keep the panel mounted when it is not visible.
     */
    keepMount?: boolean;
    /**
     * Describes the preferred placement of the panel.
     * This prop is valid when there is a `reference`.
     * @default bottom
     */
    placement?: Placement;
    /**
     * The shift options allow the panel to be moved when it exceeds the clipping boundary.
     * This prop is valid when there is a `reference`.
     */
    shiftOptions?: ShiftOptions | boolean;
    /**
     * The flip options can be used to adjust the popper panel when it exceeds the clipping boundary.
     * If it is a boolean value, it indicates whether the default behavior of the component is enabled or disabled.
     * This prop is valid when there is a `reference`.
     * Note: You cannot use `flipOptions` and `autoPlacementOptions` together inside the same middleware array.
     * @default true
     */
    flipOptions?: FlipOptions | boolean;
    /**
     * The offset modifier can shift your panel on both its axes.
     * If it is a boolean value, it enables or disables the component's default behavior.
     * This prop is valid when there is a `reference`.
     */
    offsetOptions?: OffsetOptions | [number, number] | boolean;
    /**
     * Describes the positioning strategy to use.
     * This prop is valid when there is a `reference`.
     * @default absolute
     */
    strategy?: Strategy;
    /**
     * You can customize how the auto placement behaves using the auto placement options.
     * This prop is valid when there is a `reference`.
     * Note: You cannot use `flipOptions` and `autoPlacementOptions` together inside the same middleware array.
     * @default false
     */
    autoPlacementOptions?: AutoPlacementOptions | boolean;
    /**
     * Whether to flip placement (Only valid for RTL).
     * This prop is valid when there is a `reference`.
     * @default true
     * @ignore
     */
    flipPlacement?: boolean;
    /**
     * When this value changes, will recalculate the position.
     * This prop is valid when there is a `reference`.
     * @ignore
     */
    version?: number;
    /**
     * Automatically updates the position of the floating panel when necessary to ensure it stays anchored.
     * This prop is valid when there is a `reference` and the panel is never dragged.
     * @default true
     */
    autoUpdate?: boolean;
    /**
     * The children of the component.
     */
    children: React.ReactElement<FloatingPanelChildrenProps & {
        ref: React.Ref<HTMLDivElement>;
        'data-version': number;
    }>;
}
export declare const PositionProvider: React.NamedExoticComponent<PositionProviderProps & React.RefAttributes<HTMLDivElement>>;
