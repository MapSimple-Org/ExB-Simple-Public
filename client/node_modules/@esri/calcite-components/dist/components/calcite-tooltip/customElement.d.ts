/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FloatingLayout, FloatingUIComponent, LogicalPlacement, OverlayPositioning, ReferenceElement } from '../../utils/floating-ui';
import { OpenCloseComponent } from '../../utils/openCloseComponent';

/** @slot  - A slot for adding text. */
export declare class Tooltip extends LitElement {
    /**
     * Closes the component when the `referenceElement` is clicked.
     *
     * @default false
     */
    closeOnClick: boolean;
    /**
     * Accessible name for the component.
     *
     * @deprecated No longer necessary. Overrides the context of the component's description, which could confuse assistive technology users.
     */
    label: string;
    /**
     * Offset the position of the component away from the `referenceElement`.
     *
     * @default 6
     */
    offsetDistance: number;
    /**
     * Offset the position of the component along the `referenceElement`.
     *
     * @default 0
     */
    offsetSkidding: number;
    /**
     * When `true`, the component is open.
     *
     * @default false
     */
    open: boolean;
    /**
     * Determines the type of positioning to use for the overlaid content.
     *
     * Using `"absolute"` will work for most cases. The component will be positioned inside of overflowing parent containers and will affect the container's layout.
     *
     * The `"fixed"` value should be used to escape an overflowing parent container, or when the reference element's `position` CSS property is `"fixed"`.
     *
     * @default "absolute"
     */
    overlayPositioning: OverlayPositioning;
    /**
     * Determines where the component will be positioned relative to the `referenceElement`.
     *
     * @default "auto"
     */
    placement: LogicalPlacement;
    /**
     * The `referenceElement` to position the component according to its `"placement"` value.
     *
     * Setting to the `HTMLElement` is preferred so the component does not need to query the DOM for the `referenceElement`.
     *
     * However, a string ID of the reference element can be used.
     *
     * The component should not be placed within its own `referenceElement` to avoid unintended behavior.
     */
    referenceElement: ReferenceElement | string;
    /**
     * Updates the position of the component.
     *
     * @param delayed
     */
    reposition(delayed?: boolean): Promise<void>;
    /** Fires when the component is requested to be closed and before the closing transition begins. */
    readonly calciteTooltipBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteTooltipBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteTooltipClose: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteTooltipOpen: TargetedEvent<this, void>;
}
