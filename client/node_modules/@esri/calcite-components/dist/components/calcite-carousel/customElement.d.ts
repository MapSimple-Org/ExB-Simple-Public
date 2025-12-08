/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { CarouselItem } from '../calcite-carousel-item/customElement.js';
import { ArrowType, AutoplayType } from './interfaces';

/** @slot  - A slot for adding `calcite-carousel-item`s. */
export declare class Carousel extends LitElement {
    /**
     * Specifies how and if the "previous" and "next" arrows are displayed.
     *
     * @default "inline"
     */
    arrowType: ArrowType;
    /**
     * When `true`, the carousel will autoplay and controls will be displayed. When "paused" at time of initialization, the carousel will not autoplay, but controls will be displayed.
     *
     * @default false
     */
    autoplay: AutoplayType;
    /**
     * When `autoplay` is `true`, specifies in milliseconds the length of time to display each Carousel Item.
     *
     * @default 6000
     */
    autoplayDuration: number;
    /**
     * Specifies if the component's controls are positioned absolutely on top of slotted Carousel Items.
     *
     * @default false
     */
    controlOverlay: boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * Accessible name for the component.
     *
     * @required
     */
    label: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** The component's selected `calcite-carousel-item`. */
    readonly selectedItem: HTMLCalciteCarouselItemElement;
    /** Play the carousel. If `autoplay` is not enabled (initialized either to `true` or `"paused"`), these methods will have no effect. */
    play(): Promise<void>;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Stop the carousel. If `autoplay` is not enabled (initialized either to `true` or `"paused"`), these methods will have no effect. */
    stop(): Promise<void>;
    /** Fires when the selected `calcite-carousel-item` changes. */
    readonly calciteCarouselChange: TargetedEvent<this, void>;
    /** Fires when the carousel autoplay state pauses due to a user hovering over the component or focusing on the component or slotted content */
    readonly calciteCarouselPause: TargetedEvent<this, void>;
    /** Fires when the carousel autoplay is invoked by the user. */
    readonly calciteCarouselPlay: TargetedEvent<this, void>;
    /** Fires when the carousel autoplay state resumes due to a user no longer hovering over the component or focusing on the component or slotted content */
    readonly calciteCarouselResume: TargetedEvent<this, void>;
    /** Fires when the carousel autoplay state is stopped by a user. */
    readonly calciteCarouselStop: TargetedEvent<this, void>;
    private messages: Partial<{
        previous: string;
        next: string;
        play: string;
        pause: string;
        carousel: string;
        carouselItemProgress: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        previous: string;
        next: string;
        play: string;
        pause: string;
        carousel: string;
        carouselItemProgress: string;
    }>;
}
