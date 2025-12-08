export declare enum AnimationTriggerType {
    ScrollIntoView = "SCROLL_IN",
    Manual = "MANUAL"
}
export declare enum AnimationType {
    None = "NONE",
    Pulse = "PULSE",
    RubberBand = "RUBBER_BAND",
    FadeIn = "FADE_IN",
    FadeOut = "FADE_OUT",
    FlyIn = "FLY_IN",
    ZoomIn = "ZOOM_IN",
    WipeIn = "WIPE_IN",
    SpinIn = "SPIN_IN",
    FloatIn = "FLOAT_IN"
}
export declare enum AnimationEffectType {
    Default = "DEFAULT",
    Gentle = "GENTLE",
    Wobbly = "WOBBLY",
    Stiff = "STIFF",
    Slow = "SLOW",
    Molasses = "MOLASSES"
}
export declare enum AnimationDirection {
    Top = "TOP",
    Bottom = "BOTTOM",
    Left = "LEFT",
    Right = "RIGHT"
}
export declare enum AnimationPlayMode {
    AsOne = "AS_ONE",
    OneByOne = "ONE_BY_ONE"
}
export declare enum AnimationStartMode {
    WithPrevious = "WITH_PREVIOUS",
    AfterPrevious = "AFTER_PREVIOUS"
}
export declare enum ParentAnimationMode {
    OneByOne = "ONE_BY_ONE",
    AllAtOnce = "ALL_AT_ONCE"
}
export interface AnimationMetaInfo {
    type: AnimationType;
    icon?: any;
    supportedTriggers?: AnimationTriggerType[];
    supportedDirections?: AnimationDirection[];
}
export interface AnimationProps {
    from?: any;
    to?: any;
    reset?: boolean;
    x?: number | string;
    y?: number | string;
    translateX?: number;
    translateY?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    skewX?: number;
    skewY?: number;
    scaleX?: number;
    scaleY?: number;
    transformOrigin?: string;
    display?: string;
    opacity?: number;
    clipPath?: string;
    zIndex?: number;
    config?: any;
    immediate?: boolean;
    onRest?: () => void;
}
export interface AnimationSetting {
    type: AnimationType;
    option?: {
        direction?: AnimationDirection;
        configType?: AnimationEffectType;
        start?: AnimationStartMode;
        parentMode?: ParentAnimationMode;
    };
}
export interface Animation {
    type: AnimationType;
    /**
     * init props
     */
    initProps: () => AnimationProps;
    /**
     * animate props
     */
    animateProps: () => AnimationProps;
    /**
     * props based on the mouse position on the element
     * @param x
     * @param y
     */
    propsOnXY: (x: number, y: number) => AnimationProps;
    hasMoveEffect: () => boolean;
}
