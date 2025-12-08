/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { HeadingLevel } from '../functional/Heading';
import { FlipPlacement, LogicalPlacement, OverlayPositioning } from '../../utils/floating-ui';
import { CollapseDirection, Scale } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';

/**
 * @slot  - A slot for adding custom content.
 * @slot [action-bar] - A slot for adding a `calcite-action-bar` to the component.
 * @slot [alerts] - A slot for adding `calcite-alert`s to the component.
 * @slot [content-bottom] - A slot for adding content below the unnamed (default) slot and above the footer slot (if populated)
 * @slot [content-top] - A slot for adding content above the unnamed (default) slot and below the action-bar slot (if populated).
 * @slot [header-actions-start] - A slot for adding actions or content to the start side of the header.
 * @slot [header-actions-end] - A slot for adding actions or content to the end side of the header.
 * @slot [header-content] - A slot for adding custom content to the header.
 * @slot [header-menu-actions] - A slot for adding an overflow menu with actions inside a `calcite-dropdown`.
 * @slot [fab] - A slot for adding a `calcite-fab` (floating action button) to perform an action.
 * @slot [footer] - A slot for adding custom content to the component's footer. Should not be used with the `"footer-start"` or `"footer-end"` slots.
 * @slot [footer-actions] - [Deprecated] Use the `footer-start` and `footer-end` slots instead. A slot for adding `calcite-button`s to the component's footer.
 * @slot [footer-end] - A slot for adding a trailing footer custom content. Should not be used with the `"footer"` slot.
 * @slot [footer-start] - A slot for adding a leading footer custom content. Should not be used with the `"footer"` slot.
 */
export declare class Panel extends LitElement {
    /** Passes a function to run before the component closes. */
    beforeClose: () => Promise<void>;
    /**
     * When `true`, displays a close button in the trailing side of the header.
     *
     * @default false
     */
    closable: boolean;
    /**
     * When `true`, the component will be hidden.
     *
     * @default false
     */
    get closed(): boolean;
    set closed(value: boolean);
    /**
     * When `collapsible` is present, specifies the direction of the collapse icon.
     *
     * @default "down"
     */
    collapseDirection: CollapseDirection;
    /**
     * When `true`, hides the component's content area.
     *
     * @default false
     */
    collapsed: boolean;
    /**
     * When `true`, the component is collapsible.
     *
     * @default false
     */
    collapsible: boolean;
    /** A description for the component. */
    description: string;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** The component header text. */
    heading: string;
    /** Specifies the heading level of the component's `heading` for proper document structure, without affecting visual styling. */
    headingLevel: HeadingLevel;
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
    /** Specifies the component's fallback menu `placement` when it's initial or specified `placement` has insufficient space available. */
    menuFlipPlacements: FlipPlacement[];
    /**
     * When `true`, the action menu items in the `header-menu-actions` slot are open.
     *
     * @default false
     */
    menuOpen: boolean;
    /**
     * Determines where the action menu will be positioned.
     *
     * @default "bottom-end"
     */
    menuPlacement: LogicalPlacement;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
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
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
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
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the close button is clicked. */
    readonly calcitePanelClose: TargetedEvent<this, void>;
    /** Fires when the component's content area is collapsed. */
    readonly calcitePanelCollapse: TargetedEvent<this, void>;
    /** Fires when the component's content area is expanded. */
    readonly calcitePanelExpand: TargetedEvent<this, void>;
    /** Fires when the content is scrolled. */
    readonly calcitePanelScroll: TargetedEvent<this, void>;
    /** Fires when the collapse button is clicked. */
    readonly calcitePanelToggle: TargetedEvent<this, void>;
    private messages: Partial<{
        close: string;
        options: string;
        collapse: string;
        expand: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        close: string;
        options: string;
        collapse: string;
        expand: string;
    }>;
}
