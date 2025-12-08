import { type Step as JoyRideStep, type Placement, type Status as JoyrideStatus, EVENTS } from 'react-joyride';
export type StepType = 'splash' | 'step';
type ValueOf<ObjectType, ValueType extends keyof ObjectType = keyof ObjectType> = ObjectType[ValueType];
export declare const Status: {
    readonly INJECTED: 'injected';
};
export declare const STATUS: {
    INJECTED: any;
    IDLE: "idle";
    READY: "ready";
    WAITING: "waiting";
    RUNNING: "running";
    PAUSED: "paused";
    SKIPPED: "skipped";
    FINISHED: "finished";
    ERROR: "error";
};
export type StatusValue = ValueOf<typeof Status> | JoyrideStatus;
/**
 * Interface representing the properties for a custom step in a guide.
 */
interface CustomStepProps {
    /** The type of the step.
     * "splash": the introductive dialog in a guide that is centered in the middle of the screen.
     * "step": the default step type.
     * @default "step"
     */
    type?: StepType;
    /**
     * Requires user to perform a specific action in order to move to the next step.
     * If defined, the "Next" button is disabled in step's tooltip, which forces the guide
     * to be controlled.
     */
    requiredAction?: {
        /** Type of the action:
         * For "click or other standard events," the event must be triggered. Use the Guide component's `onActionTriggered` callback to handle this event.
         * "custom": merely to tell the Guide component to wait for an action to be performed. like waiting for a widget to be added.
         */
        type: 'custom' | 'click' | 'hover' | 'dblclick' | 'focus' | 'blur' | 'change' | 'input';
        /** the target of the action to be performed. if it has the value, the guide target will use it as the selector */
        target?: string;
    };
    /**
     * By default, the target is found in the current window. If this property is set to `true`, the target will be found within the app's iframe.
     */
    targetInCanvas?: boolean;
    /** Manually disable the "Next" button */
    disableNextButton?: boolean;
}
/**
 * Interface representing a step in a guide.
 */
export interface Step extends CustomStepProps {
    /** The target for the step. It needs to be a CSS selector. */
    target: string;
    /** The step tooltip's title. */
    title?: React.ReactNode;
    /**
     * The step tooltip's content.
     * Text, image, or both can be added.
     */
    content: {
        /** The text of a step tooltip's content. */
        text?: string;
        htm?: string;
        /** The image of a step tooltip's content. */
        image?: {
            /** The source url of the image. */
            src: string;
            /** The alternate text of the image. */
            alt?: string;
            /** The width of the image. */
            width?: string | number;
            /** The height of the image. */
            height?: string | number;
            /** The position of the image. */
            position?: 'fill' | 'center';
            /** To add a border to the image. */
            border?: boolean;
            /** Wether to auto flip the image based on locales. */
            autoFlip?: boolean;
        };
        /** The content alignment direction. */
        direction?: 'vertical' | 'horizontal';
    };
    /** the placement of the tooltip. */
    placement?: Placement;
    /** the default width of the tooltip. */
    width?: string | number;
    /** hide the footer section in the tooltip. */
    hideFooter?: boolean;
    /** The padding of the spotlight. */
    spotlightPadding?: number;
    /** Allow mouse and touch events thru the spotlight. */
    spotlightClicks?: boolean;
}
export interface ConditionalStepIndexes {
    [id: number]: number;
}
export interface ConditionalStep {
    steps: Step[];
}
/**
 * Interface representing an injected step in a guide.
 */
export interface InjectedStep {
    /**
     * The name of the injected guide.
     * Available injectable guides are: "insert-widget" and "ds-selection".
     */
    injectedGuide: string;
    /**
     * The name of the widget that is passed to the injected guide.
     */
    widgetName?: string;
}
export type Steps = Array<Step | ConditionalStep>;
export type MappedStep = JoyRideStep & CustomStepProps;
export interface StepOnChangeCallBackProps {
    status?: StatusValue;
    index?: number;
    nextIndex?: number;
    event?: string;
    isInjected?: boolean;
    step?: Step;
    run?: boolean;
}
export { EVENTS };
