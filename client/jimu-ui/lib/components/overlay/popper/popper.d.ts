import { React } from 'jimu-core';
import { type PopperCoreProps, type ArrowStyle, type Placement, type AutoPlacement } from './core';
import { type TargetType } from './utils';
import { type OverlayManagerProps } from '../manager';
import { type OverlayDismissReason, type OverlayDismissManagerProps } from './overlay-dismiss-manager';
/**
 * The `Popper` component props.
 */
export interface PopperProps extends Omit<PopperCoreProps, 'reference' | 'children' | 'placement'>, Pick<OverlayDismissManagerProps, 'avoidNestedToggle' | 'delayToggle'>, OverlayManagerProps {
    /**
     * Reference node used to set the position of popper
     */
    reference: TargetType;
    /**
     * Describes the preferred placement of the popper.
     * @default bottom
     */
    placement?: Placement | AutoPlacement;
    /**
     * Whether to show arrow of popper.
     * @default false
     * @deprecated Use `arrowOptions` instead.
     */
    showArrow?: boolean;
    /**
     * Define the style of the arrow.
     * @ignore
     * @deprecated Use `arrowOptions.style` instead.
     */
    arrowStyle?: ArrowStyle;
    /**
     * Modifiers for fine-tuning the behavior.
     * @deprecated Use `hideOptions`, `shiftOptions`, `flipOptions`, `offsetOptions` and `sizeOptions` instead.
     *
     * Note: If `middleware`(`hideOptions`, `shiftOptions`, `flipOptions`, `offsetOptions`, `inlineOptions`, `autoPlacementOptions` and `arrowOptions`) is not provided, Popper will try to upgrade `modifiers` to `middleware`, otherwise it will be ignored.
     */
    modifiers?: any[];
    /**
     * If `true`, the popper is visible.
     */
    open: boolean;
    /**
     * A ref that points to the used popper instance.
     */
    children: React.ReactNode;
    /**
     * The offset modifier can shift your popper on both its axis.
     * Notice: If you set the specified offset, we will ignore the offset in modifiers
     * @deprecated Use `offsetOptions` instead.
     */
    offset?: [number, number];
    /**
     * Callback fired when
     * - click on an area outside popper
     * - `currentPageId` or `browserSizeMode` changes
     * - `appMode` changes
     * @event
     */
    toggle?: (evt?: React.MouseEvent<any> | React.TouchEvent<any> | React.KeyboardEvent<any>, reason?: OverlayDismissReason) => any;
    /**
     * Whether to flip placement (Only valid for RTL)
     * @ignore
     */
    flipPlacement?: boolean;
    /**
     * A ref to get the root node of the popper.
     * @ignore
     * @deprecated Use `ref` instead.
     */
    popperNodeRef?: React.Ref<HTMLDivElement>;
    /**
     * Listen the popper version changes of `PopperVersionContext`.
     * @default false
     * @ignore
     * @deprecated Use `autoUpdate` instead.
     */
    listenContextPopperVersion?: boolean;
    /**
     * Whether the popper is visible when the reference is hidden.
     * @default false
     * @ignore
     * @deprecated Use `hideOptions` instead.
     */
    referenceHiddenVisibility?: boolean;
    /**
     * Loop within the focusable elements inside the `Popper` when the `Tab` key is pressed.
     * @ignore
     * @default true
     */
    trapFocus?: boolean;
    /**
     * Whether to automatically focus on the first focusable element when `Popper` is open.
     * @ignore
     * @default true
     */
    autoFocus?: boolean;
    /**
     * Whether to query focusable elements every time you when the `Tab` key is pressed.
     * Note: Valid only if `trapFocus` is `true`.
     * @ignore
     * @default false
     */
    forceLatestFocusElements?: boolean;
}
/**
 * The `Popper` component is used to display some content adjacent to, but connected with, another component.
 *
 * ```ts
 * import { Popper } from 'jimu-ui'
 * ```
 */
export declare const Popper: React.NamedExoticComponent<PopperProps & React.RefAttributes<HTMLDivElement>>;
