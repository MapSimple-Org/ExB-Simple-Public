/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale } from '../interfaces';
import { NumberingSystem } from '../../utils/locale';
import { StepperItem } from '../calcite-stepper-item/customElement.js';
import { StepperItemChangeEventDetail, StepperLayout } from './interfaces';

/** @slot  - A slot for adding `calcite-stepper-item` elements. */
export declare class Stepper extends LitElement {
    /**
     * When `true`, displays a status icon in the `calcite-stepper-item` heading.
     *
     * @default false
     */
    icon: boolean;
    /**
     * Defines the layout of the component.
     *
     * @default "horizontal"
     */
    layout: StepperLayout;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, displays the step number in the `calcite-stepper-item` heading.
     *
     * @default false
     */
    numbered: boolean;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem?: NumberingSystem;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** Specifies the component's selected item. */
    readonly selectedItem: HTMLCalciteStepperItemElement;
    /** Set the last `calcite-stepper-item` as active. */
    endStep(): Promise<void>;
    /**
     * Set a specified `calcite-stepper-item` as active.
     *
     * @param step
     */
    goToStep(step: number): Promise<void>;
    /** Set the next `calcite-stepper-item` as active. */
    nextStep(): Promise<void>;
    /** Set the previous `calcite-stepper-item` as active. */
    prevStep(): Promise<void>;
    /** Set the first `calcite-stepper-item` as active. */
    startStep(): Promise<void>;
    /** Fires when the active `calcite-stepper-item` changes. */
    readonly calciteStepperChange: TargetedEvent<this, void>;
    /**
     * Fires when the active `calcite-stepper-item` changes.
     *
     * @deprecated use `calciteStepperChange` instead or `calciteStepperItemChange` on items instead.
     */
    readonly calciteStepperItemChange: TargetedEvent<this, void>;
    private messages: Partial<{
        label: string;
        previousStep: string;
        nextStep: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        label: string;
        previousStep: string;
        nextStep: string;
    }>;
}
