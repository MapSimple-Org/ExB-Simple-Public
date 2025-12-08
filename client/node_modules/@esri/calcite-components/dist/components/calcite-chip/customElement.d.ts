/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Appearance, Kind, Scale, SelectionMode } from '../interfaces';
import { InteractiveComponent } from '../../utils/interactive';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { ChipGroup } from '../calcite-chip-group/customElement.js';

/**
 * @slot  - A slot for adding text.
 * @slot [image] - A slot for adding an image.
 */
export declare class Chip extends LitElement {
    /**
     * Specifies the appearance style of the component.
     *
     * @default "solid"
     */
    appearance: Extract<"outline" | "outline-fill" | "solid", Appearance>;
    /**
     * When `true`, a close button is added to the component.
     *
     * @default false
     */
    closable: boolean;
    /**
     * When `true`, hides the component.
     *
     * @default false
     */
    closed: boolean;
    /**
     * When `true`, the component closes when the Delete or Backspace key is pressed while focused.
     *
     * @default false
     */
    closeOnDelete: boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Specifies an icon to display. */
    icon: IconNameOrString;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /**
     * Specifies the kind of the component, which will apply to border and background if applicable.
     *
     * @default "neutral"
     */
    kind: Extract<"brand" | "inverse" | "neutral", Kind>;
    /**
     * Accessible name for the component.
     *
     * @required
     */
    label: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Specifies the size of the component. When contained in a parent `calcite-chip-group` inherits the parent's `scale` value.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * When `true`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /** The component's value. */
    value: any;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component's close button is selected. */
    readonly calciteChipClose: TargetedEvent<this, void>;
    /** Fires when the selected state of the component changes. */
    readonly calciteChipSelect: TargetedEvent<this, void>;
    private messages: Partial<{
        dismissLabel: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        dismissLabel: string;
    }>;
}
