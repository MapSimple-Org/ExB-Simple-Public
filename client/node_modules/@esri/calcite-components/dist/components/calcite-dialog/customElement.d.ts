/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { OpenCloseComponent } from '../../utils/openCloseComponent';
import { Kind, Scale, Width } from '../interfaces';
import { HeadingLevel } from '../functional/Heading';
import { OverlayPositioning } from '../../utils/floating-ui';
import { FocusTrapOptions } from '../../controllers/useFocusTrap';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { DialogPlacement } from './interfaces';

/**
 * @slot  - A slot for adding content.
 * @slot [content] - [Deprecated] Use `custom-content` slot instead.
 * @slot [custom-content] - A slot for displaying custom content. Will prevent the rendering of any default Dialog UI, except for `box-shadow` and `corner-radius`.
 * @slot [action-bar] - A slot for adding a `calcite-action-bar` to the component.
 * @slot [alerts] - A slot for adding `calcite-alert`s to the component.
 * @slot [content-bottom] - A slot for adding content below the unnamed (default) slot and - if populated - the `footer` slot.
 * @slot [content-top] - A slot for adding content above the unnamed (default) slot and - if populated - below the `action-bar` slot.
 * @slot [header-actions-start] - A slot for adding actions or content to the starting side of the component's header.
 * @slot [header-actions-end] - A slot for adding actions or content to the ending side of the component's header.
 * @slot [header-content] - A slot for adding custom content to the component's header.
 * @slot [header-menu-actions] - A slot for adding an overflow menu with actions inside a `calcite-dropdown`.
 * @slot [fab] - A slot for adding a `calcite-fab` (floating action button) to perform an action.
 * @slot [footer] - A slot for adding custom content to the component's footer. Should not be used with the `"footer-start"` or `"footer-end"` slots.
 * @slot [footer-end] - A slot for adding a trailing footer custom content. Should not be used with the `"footer"` slot.
 * @slot [footer-start] - A slot for adding a leading footer custom content. Should not be used with the `"footer"` slot.
 */
export declare class Dialog extends LitElement {
    /** Passes a function to run before the component closes. */
    beforeClose: () => Promise<void>;
    /**
     * When `true`, disables the component's close button.
     *
     * @default false
     */
    closeDisabled: boolean;
    /** A description for the component. */
    description: string;
    /**
     * When `true`, the component is draggable.
     *
     * @default false
     */
    dragEnabled: boolean;
    /**
     * When `true`, disables the default close on escape behavior.
     *
     * By default, an open dialog can be dismissed by pressing the Esc key.
     *
     * @see [Dialog Accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog#accessibility).
     * @default false
     */
    escapeDisabled: boolean;
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
    /** Specifies the kind of the component, which will style the top border. */
    kind: Extract<"brand" | "danger" | "info" | "success" | "warning", Kind>;
    /** Specifies an icon to display. */
    icon: IconNameOrString;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /**
     * When `true`, a busy indicator is displayed.
     *
     * @default false
     */
    loading: boolean;
    /**
     * When `true`, the action menu items in the `header-menu-actions` slot are open.
     *
     * @default false
     */
    menuOpen: boolean;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, displays a scrim blocking interaction underneath the component.
     *
     * @default false
     */
    modal: boolean;
    /**
     * When `true` and `modal` is `false`, prevents focus trapping.
     *
     * @default false
     */
    focusTrapDisabled: boolean;
    /**
     * When `true`, displays and positions the component.
     *
     * @default false
     */
    get open(): boolean;
    set open(value: boolean);
    /**
     * When `true`, disables the closing of the component when clicked outside.
     *
     * @default false
     */
    outsideCloseDisabled: boolean;
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
     * Specifies the placement of the dialog.
     *
     * @default "center"
     */
    placement: DialogPlacement;
    /**
     * When `true`, the component is resizable.
     *
     * @default false
     */
    resizable: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Specifies the width of the component.
     *
     * @deprecated Use the `width` property instead.
     * @default "m"
     */
    widthScale: Scale;
    /** Specifies the width of the component. */
    width: Extract<Width, Scale>;
    /**
     * Scrolls the component's content to a specified set of coordinates.
     *
     * @example
     * myCalciteFlowItem.scrollContentTo({
     *   left: 0, // Specifies the number of pixels along the X axis to scroll the window or element.
     *   top: 0, // Specifies the number of pixels along the Y axis to scroll the window or element
     *   behavior: "auto" // Specifies whether the scrolling should animate smoothly (smooth), or happen instantly in a single jump (auto, the default value).
     * });
     * @param options - allows specific coordinates to be defined.
     * @returns - promise that resolves once the content is scrolled to.
     */
    scrollContentTo(options?: ScrollToOptions): Promise<void>;
    /**
     * Sets focus on the component's "close" button (the first focusable item).
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     * @returns - A promise that is resolved when the operation has completed.
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /**
     * Updates the element(s) that are included in the focus-trap of the component.
     *
     * @param extraContainers - Additional elements to include in the focus trap. This is useful for including elements that may have related parts rendered outside the main focus trapping element.
     */
    updateFocusTrapElements(extraContainers?: FocusTrapOptions["extraContainers"]): Promise<void>;
    /** Fires when the component is requested to be closed and before the closing transition begins. */
    readonly calciteDialogBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteDialogBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteDialogClose: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteDialogOpen: TargetedEvent<this, void>;
    /** Fires when the content is scrolled. */
    readonly calciteDialogScroll: TargetedEvent<this, void>;
    private messages: Partial<{
        close: string;
        resizeEnabled: string;
        dragEnabled: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        close: string;
        resizeEnabled: string;
        dragEnabled: string;
    }>;
}
