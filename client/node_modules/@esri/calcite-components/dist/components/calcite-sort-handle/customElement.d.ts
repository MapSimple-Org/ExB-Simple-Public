/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Scale } from '../interfaces';
import { FlipPlacement, MenuPlacement, OverlayPositioning } from '../../utils/floating-ui';
import { MoveEventDetail, SortMenuItem, ReorderEventDetail, AddEventDetail } from './interfaces';

export declare class SortHandle extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Specifies the component's fallback `calcite-dropdown-item` `placement` when it's initial or specified `placement` has insufficient space available. */
    flipPlacements: FlipPlacement[];
    /** Specifies the label of the component. */
    label: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** Defines the "Add to" items. */
    addToItems: SortMenuItem[];
    /** Defines the "Move to" items. */
    moveToItems: SortMenuItem[];
    /**
     * When `true`, displays and positions the component.
     *
     * @default false
     */
    open: boolean;
    /**
     * Determines the type of positioning to use for the overlaid content.
     *
     * Using `"absolute"` will work for most cases. The component will be positioned inside of overflowing parent containers and will affect the container's layout.
     *
     * `"fixed"` should be used to escape an overflowing parent container, or when the reference element's `position` CSS property is `"fixed"`.
     *
     * @default "absolute"
     */
    overlayPositioning: OverlayPositioning;
    /**
     * Determines where the component will be positioned relative to the container element.
     *
     * @default "bottom-start"
     */
    placement: MenuPlacement;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** The current position of the handle. */
    setPosition: number;
    /** The total number of sortable items. */
    setSize: number;
    /**
     * When `true`, items are no longer sortable.
     *
     * @default false
     */
    sortDisabled: boolean;
    /** Specifies the width of the component. */
    widthScale: Scale;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component is requested to be closed and before the closing transition begins. */
    readonly calciteSortHandleBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteSortHandleBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteSortHandleClose: TargetedEvent<this, void>;
    /** Fires when a move item has been selected. */
    readonly calciteSortHandleMove: TargetedEvent<this, MoveEventDetail>;
    /** Fires when an add item has been selected. */
    readonly calciteSortHandleAdd: TargetedEvent<this, AddEventDetail>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteSortHandleOpen: TargetedEvent<this, void>;
    /** Fires when a reorder has been selected. */
    readonly calciteSortHandleReorder: TargetedEvent<this, ReorderEventDetail>;
    private messages: {
        reorder: string;
        addTo: string;
        moveTo: string;
        moveToTop: string;
        moveToBottom: string;
        moveUp: string;
        moveDown: string;
        repositionLabel: string;
        reposition: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        reorder: string;
        addTo: string;
        moveTo: string;
        moveToTop: string;
        moveToBottom: string;
        moveUp: string;
        moveDown: string;
        repositionLabel: string;
        reposition: string;
    }>;
}
