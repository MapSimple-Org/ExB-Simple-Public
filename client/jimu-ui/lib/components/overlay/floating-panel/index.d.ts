import { React } from 'jimu-core';
import { type OverlayDismissReason } from '../overlay-dismiss-manager';
import { type FloatingPanelChildrenProps } from './children';
import { type PositionProviderProps } from './position-provider';
/**
 * The `FloatingPanel` component props.
 */
export interface FloatingPanelProps extends Omit<PositionProviderProps, 'children'>, FloatingPanelChildrenProps {
    /**
     * If `true`, the panel is visible.
     *
     * For backward compatability:
     * - If there is no `reference`, it defaults to `true`.
     * - If there is a `reference`, it defaults to `false`.
     */
    open?: boolean;
    /**
     * Whether to keep the panel mounted when it is not visible.
     *
     * For backward compatability:
     * - If there is no `reference`, it defaults to `true`.
     * - If there is a `reference`, it defaults to `false`.
     */
    keepMount?: boolean;
    /**
     * If `true`, it disables portal behavior, and keeps children within their parent DOM hierarchy.
     * If `false`, children are appended to `document.body`.
     *
     * For backward compatability:
     * - If there is no `reference`, it defaults to `false`.
     * - If there is a `reference`, it is always `true` even if `disablePortal` is set to `false`.
     */
    disablePortal?: boolean;
    /**
     * By default, clicking into a nested `Popper` will not trigger the toggle method of the current Popper.
     * If you want to trigger the toggle method of the current Popper, you can set `avoidNestedToggle` to `false`.
     * @default true
     * @ignore
     */
    avoidNestedToggle?: boolean;
    /**
     * Callback fired when panel requests to be closed.
     * @event
     */
    toggle?: (evt?: React.MouseEvent<any> | React.TouchEvent<any> | React.KeyboardEvent<any>, reason?: OverlayDismissReason) => any;
    /**
     * Whether the floating panel is hidden when the reference is hidden.
     * This prop is valid when there is a `reference`.
     * @default false
     */
    referenceHiddenVisibility?: boolean;
}
/**
 * The `FloatingPanel` component allows content to be placed in a draggable floating container.
 * If `reference` is provided, `position` and `defaultPosition` from props will be ignored, and the initial position automatically determined based the `reference`.
 *
 * ```ts
 * import { FloatingPanel } from 'jimu-ui'
 * ```
 */
export declare const FloatingPanel: React.NamedExoticComponent<FloatingPanelProps & React.RefAttributes<HTMLDivElement>>;
