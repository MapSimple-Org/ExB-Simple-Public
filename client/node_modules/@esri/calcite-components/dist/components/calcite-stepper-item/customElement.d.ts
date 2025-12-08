/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale } from '../interfaces';
import { InteractiveComponent } from '../../utils/interactive';
import { StepperItemEventDetail, StepperItemKeyEventDetail, StepperLayout } from '../calcite-stepper/interfaces';
import { NumberingSystem } from '../../utils/locale';

/** @slot  - A slot for adding custom content. */
export declare class StepperItem extends LitElement {
    /**
     * When `true`, the step has been completed.
     *
     * @default false
     */
    complete: boolean;
    /** A description for the component. Displays below the header text. */
    description: string;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * When `true`, the component contains an error that requires resolution from the user.
     *
     * @default false
     */
    error: boolean;
    /** The component header text. */
    heading: string;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, the component is selected.
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
    /** Fires when the active `calcite-stepper-item` changes. */
    readonly calciteStepperItemSelect: TargetedEvent<this, void>;
    private messages: Partial<{
        complete: string;
        previousStep: string;
        nextStep: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        complete: string;
        previousStep: string;
        nextStep: string;
    }>;
}
