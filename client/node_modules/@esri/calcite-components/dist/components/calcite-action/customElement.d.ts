/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Alignment, Appearance, AriaAttributesCamelCased, Scale, Width } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { FormOwner } from '../../utils/form';

/**
 * @slot  - A slot for adding non-interactive content, such as a `calcite-icon`.
 * @slot [tooltip] - [Deprecated] Use the `calcite-tooltip` component instead.
 */
export declare class Action extends LitElement {
    /**
     * Use this property to override or extend ARIA properties and attributes on the component's button.
     *
     * @internal
     */
    aria?: Partial<Pick<AriaAttributesCamelCased, "controlsElements" | "describedByElements" | "expanded" | "hasPopup" | "labelledByElements" | "ownsElements" | "pressed">>;
    /**
     * When `true`, the component is highlighted.
     *
     * @default false
     */
    active: boolean;
    /** Specifies the horizontal alignment of button elements with text content. */
    alignment: Alignment;
    /**
     * Specifies the appearance of the component.
     *
     * @default "solid"
     */
    appearance: Extract<"solid" | "transparent", Appearance>;
    /**
     * When `true`, the side padding of the component is reduced.
     *
     * @deprecated No longer necessary.
     * @default false
     */
    compact: boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * The `id` of the form that will be associated with the component.
     *
     * When not set, the component will be associated with its ancestor form element, if any.
     */
    form: string;
    /** Specifies an icon to display. */
    icon: IconNameOrString;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /**
     * When `true`, displays a visual indicator.
     *
     * @default false
     */
    indicator: boolean;
    /** Specifies the label of the component. If no label is provided, the label inherits what's provided for the `text` prop. */
    label: string;
    /**
     * When `true`, a busy indicator is displayed.
     *
     * @default false
     */
    loading: boolean;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Specifies text that accompanies the icon.
     *
     * @required
     */
    text: string;
    /**
     * When `true`, indicates whether the text is displayed.
     *
     * @default false
     */
    textEnabled: boolean;
    /**
     * Specifies the default behavior of the component.
     *
     * @mdn [type](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type)
     * @default "button"
     */
    type: HTMLButtonElement["type"];
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    private messages: {
        loading: string;
        indicator: string;
        indicatorLabel: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        loading: string;
        indicator: string;
        indicatorLabel: string;
    }>;
}
