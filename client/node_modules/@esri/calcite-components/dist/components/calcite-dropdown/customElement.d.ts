/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { FlipPlacement, FloatingUIComponent, MenuPlacement, OverlayPositioning } from '../../utils/floating-ui';
import { InteractiveComponent } from '../../utils/interactive';
import { OpenCloseComponent } from '../../utils/openCloseComponent';
import { Scale, Width } from '../interfaces';
import { DropdownItem } from '../calcite-dropdown-item/customElement.js';

/**
 * @slot  - A slot for adding `calcite-dropdown-group` elements. Every `calcite-dropdown-item` must have a parent `calcite-dropdown-group`, even if the `groupTitle` property is not set.
 * @slot [trigger] - A slot for the element that triggers the `calcite-dropdown`.
 */
export declare class Dropdown extends LitElement {
    /**
     * When `true`, the component will remain open after a selection is made.
     *
     * If the `selectionMode` of the selected `calcite-dropdown-item`'s containing `calcite-dropdown-group` is `"none"`, the component will always close.
     *
     * @default false
     */
    closeOnSelectDisabled: boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Specifies the component's fallback `calcite-dropdown-item` `placement` when it's initial or specified `placement` has insufficient space available. */
    flipPlacements: FlipPlacement[];
    /**
     * Specifies the maximum number of `calcite-dropdown-item`s to display before showing a scroller.
     * Value must be greater than `0`, and does not include `groupTitle`'s from `calcite-dropdown-group`.
     *
     * @default 0
     */
    maxItems: number;
    /**
     * Offset the position of the component away from the `referenceElement`.
     *
     * @default 0
     */
    offsetDistance: number;
    /**
     * Offset the position of the component along the `referenceElement`.
     *
     * @default 0
     */
    offsetSkidding: number;
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
    /** Specifies the component's selected items. */
    readonly selectedItems: HTMLCalciteDropdownItemElement[];
    /**
     * Specifies the action to open the component from the container element.
     *
     * @default "click"
     */
    type: "hover" | "click";
    /**
     * Specifies the width of the component.
     *
     * @deprecated Use the `width` property instead.
     */
    widthScale: Scale;
    /** Specifies the width of the component. */
    width: Extract<Width, Scale>;
    /**
     * Updates the position of the component.
     *
     * @param delayed
     */
    reposition(delayed?: boolean): Promise<void>;
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component is requested to be closed and before the closing transition begins. */
    readonly calciteDropdownBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteDropdownBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteDropdownClose: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteDropdownOpen: TargetedEvent<this, void>;
    /** Fires when a `calcite-dropdown-item`'s selection changes. */
    readonly calciteDropdownSelect: TargetedEvent<this, void>;
}
