/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Alignment, Layout, Scale, SelectionAppearance, SelectionMode } from '../interfaces';
import { SelectableComponent } from '../../utils/selectableComponent';
import { IconNameOrString } from '../calcite-icon/interfaces';

/**
 * @slot [content-top] - A slot for adding non-actionable elements above the component's content.  Content slotted here will render in place of the `icon` property.
 * @slot [content-bottom] - A slot for adding non-actionable elements below the component's content.
 * @slot [content-start] - [Deprecated] use `content-top` slot instead.  A slot for adding non-actionable elements before the component's content.
 * @slot [content-end] - [Deprecated] use `content-bottom` slot instead. A slot for adding non-actionable elements after the component's content.
 */
export declare class Tile extends LitElement {
    /**
     * When `true`, the component is active.
     *
     * @deprecated
     * @default false
     */
    active: boolean;
    /**
     * Specifies the alignment of the Tile's content.
     *
     * @default "start"
     */
    alignment: Exclude<Alignment, "end">;
    /** A description for the component, which displays below the heading. */
    description: string;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * The component's embed mode.
     *
     * When `true`, renders without a border and padding for use by other components.
     *
     * @deprecated No longer necessary.
     * @default false
     */
    embed: boolean;
    /** The component header text, which displays between the icon and description. */
    heading: string;
    /** When embed is `"false"`, the URL for the component. */
    href: string;
    /** Specifies an icon to display. */
    icon: IconNameOrString;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /** Accessible name for the component. */
    label: string;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * When `true` and the parent's `selectionMode` is `"single"`, `"single-persist"', or `"multiple"`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the selected state of the component changes. */
    readonly calciteTileSelect: TargetedEvent<this, void>;
}
