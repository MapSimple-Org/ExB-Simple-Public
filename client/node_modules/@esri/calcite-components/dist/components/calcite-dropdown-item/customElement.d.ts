/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { ItemKeyboardEvent } from '../calcite-dropdown/interfaces';
import { RequestedItem } from '../calcite-dropdown-group/interfaces';
import { FlipContext, Scale, SelectionMode } from '../interfaces';
import { InteractiveComponent } from '../../utils/interactive';
import { IconNameOrString } from '../calcite-icon/interfaces';

/** @slot  - A slot for adding text. */
export declare class DropdownItem extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * Specifies the URL of the linked resource, which can be set as an absolute or relative path.
     *
     * Determines if the component will render as an anchor.
     */
    href: string;
    /** Specifies an icon to display at the end of the component. */
    iconEnd: IconNameOrString;
    /** Displays the `iconStart` and/or `iconEnd` as flipped when the element direction is right-to-left (`"rtl"`). */
    iconFlipRtl: FlipContext;
    /** Specifies an icon to display at the start of the component. */
    iconStart: IconNameOrString;
    /** Accessible name for the component. */
    label: string;
    /** Specifies the relationship to the linked document defined in `href`. */
    rel: string;
    /**
     * When `true`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /** Specifies the frame or window to open the linked document. */
    target: string;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component is selected. */
    readonly calciteDropdownItemSelect: TargetedEvent<this, void>;
}
