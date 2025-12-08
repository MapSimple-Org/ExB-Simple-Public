import { AnimationDirection, AnimationEffectType, AnimationType, type AnimationSetting } from './types';
export declare function getNextAnimationId(): number;
export declare function getSpringParam(effectType: AnimationEffectType): {
    dampling: number;
    stiffness: number;
};
export declare const DEFAULT_VARIANTS: {
    show: {
        opacity: number;
        transition: {
            type: string;
            duration: number;
        };
    };
    hide: {
        opacity: number;
        transition: {
            type: string;
            duration: number;
        };
    };
};
export declare function getEffectVariants(type: AnimationType, direction: AnimationDirection): {
    hide: {
        x: number;
        y: number;
        rotateZ: number;
        scale: number;
        clipPath: string;
        opacity: number;
        transition: {
            type: string;
            duration: number;
        };
    };
    show: {
        opacity: number[];
        x: number[];
        y: number[];
        rotateZ: number[];
        scale: number[];
        clipPath: string[];
    };
} | {
    hide: {
        x: number;
        y: number;
        rotateZ: number;
        scale: number;
        clipPath: string;
        opacity: number;
        transition: {
            type: string;
            duration: number;
        };
    };
    show: {
        opacity: number;
        clipPath: string[];
        x: number[];
        y: number[];
        rotateZ: number[];
        scale: number[];
    };
};
export declare function prepareLocalVariants(uniqueId: string, innerLayoutId: string, parentId: string, animationSetting: AnimationSetting, parentMotionVariants: any, oneByOneSetting: AnimationSetting): any;
export declare function prepareOneByOneTransition(oneByOneSetting: AnimationSetting): {
    when: string | boolean;
    staggerChildren: number;
};
export declare function prepareOneByOneVariants(oneByOneSetting: AnimationSetting): any;
export declare function isVisible(elemtent: HTMLElement): boolean;
export declare function shouldHideWhenOutOfView(depth: number, element: HTMLElement): boolean;
export declare function isElementVisible(element: HTMLElement, parent?: HTMLElement): boolean;
