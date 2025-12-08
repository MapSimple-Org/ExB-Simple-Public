/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Appearance, Kind, Scale } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';

export declare class Fab extends LitElement {
    /**
     * Specifies the appearance style of the component.
     *
     * @default "solid"
     */
    appearance: Extract<"solid" | "outline-fill", Appearance>;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * Specifies an icon to display.
     *
     * @default "plus"
     */
    icon: IconNameOrString;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /**
     * Specifies the kind of the component, which will apply to border and background.
     *
     * @default "brand"
     */
    kind: Extract<"brand" | "danger" | "inverse" | "neutral", Kind>;
    /** Accessible name for the component. */
    label: string;
    /**
     * When `true`, a busy indicator is displayed.
     *
     * @default false
     */
    loading: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** Specifies text to accompany the component's icon. */
    text: string;
    /**
     * When `true`, displays the `text` value in the component.
     *
     * @default false
     */
    textEnabled: boolean;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
}
