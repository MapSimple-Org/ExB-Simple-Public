/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FlipPlacement, FloatingLayout, FloatingUIComponent, LogicalPlacement, OverlayPositioning, ReferenceElement } from '../../utils/floating-ui';
import { OpenCloseComponent } from '../../utils/openCloseComponent';
import { HeadingLevel } from '../functional/Heading';
import { Scale } from '../interfaces';
import { FocusTrapOptions } from '../../controllers/useFocusTrap';

/** @slot  - A slot for adding custom content. */
export declare class Popover extends LitElement {
    /**
     * When `true`, clicking outside of the component automatically closes open `calcite-popover`s.
     *
     * @default false
     */
    autoClose: boolean;
    /**
     * When `true`, displays a close button within the component.
     *
     * @default false
     */
    closable: boolean;
    /**
     * When `true`, prevents flipping the component's placement when overlapping its `referenceElement`.
     *
     * @default false
     */
    flipDisabled: boolean;
    /** Specifies the component's fallback `placement` when it's initial or specified `placement` has insufficient space available. */
    flipPlacements: FlipPlacement[];
    /**
     * When `true`, prevents focus trapping.
     *
     * @default false
     */
    focusTrapDisabled: boolean;
    /**
     * Specifies custom focus trap configuration on the component, where
     *
     * `"allowOutsideClick`" allows outside clicks,
     * `"initialFocus"` enables initial focus,
     * `"returnFocusOnDeactivate"` returns focus when not active, and
     * `"extraContainers"` specifies additional focusable elements external to the trap (e.g., 3rd-party components appending elements to the document body).
     * `"setReturnFocus"` customizes the element to which focus is returned when the trap is deactivated. Return `false` to prevent focus return, or `undefined` to use the default behavior (returning focus to the element focused before activation).
     */
    focusTrapOptions: Partial<FocusTrapOptions>;
    /** The component header text. */
    heading: string;
    /** Specifies the heading level of the component's `heading` for proper document structure, without affecting visual styling. */
    headingLevel: HeadingLevel;
    /**
     * Accessible name for the component.
     *
     * @required
     */
    label: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Offsets the position of the popover away from the `referenceElement`.
     *
     * @default 6
     */
    offsetDistance: number;
    /**
     * Offsets the position of the component along the `referenceElement`.
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
     * `"fixed"` value should be used to escape an overflowing parent container, or when the reference element's `position` CSS property is `"fixed"`.
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
     * When `true`, removes the caret pointer.
     *
     * @default false
     */
    pointerDisabled: boolean;
    /**
     * The `referenceElement` used to position the component according to its `placement` value.
     *
     * Setting to an `HTMLElement` is preferred so the component does not need to query the DOM.
     *
     * However, a string `id` of the reference element can also be used.
     *
     * The component should not be placed within its own `referenceElement` to avoid unintended behavior.
     *
     * @required
     */
    referenceElement: ReferenceElement | string;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * When `true`, disables automatically toggling the component when its `referenceElement` has been triggered.
     *
     * This property can be set to `true` to manage when the component is open.
     *
     * @default false
     */
    triggerDisabled: boolean;
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
    /** Updates the element(s) that are used within the focus-trap of the component. */
    updateFocusTrapElements(): Promise<void>;
    /** Fires when the component is requested to be closed and before the closing transition begins. */
    readonly calcitePopoverBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calcitePopoverBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calcitePopoverClose: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calcitePopoverOpen: TargetedEvent<this, void>;
    private messages: Partial<{
        close: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        close: string;
    }>;
}
