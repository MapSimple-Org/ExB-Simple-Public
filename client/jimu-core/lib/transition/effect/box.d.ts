import { type TransitionHandler, TransitionDirection } from '../types';
export declare class BoxTransition implements TransitionHandler {
    private readonly isRTL;
    private readonly direction;
    constructor(isRTL?: boolean, direction?: TransitionDirection);
    getVariants(): {
        toPrevious: any;
        toNext: any;
        fromPrevious: any;
        fromNext: any;
        showView: any;
        hideView: any;
    };
    getTransitionProps(i: number, currentIndex: number, previousIndex: number, progress?: number): {
        originY: string;
        originX: string;
        rotateX: any;
        rotateY: any;
        opacity: number;
        x: number;
        y: number;
        transformPerspective: number;
        transition: {
            type: string;
        };
    } | {
        originY: number;
        originX: string;
        rotateX: any;
        rotateY: any;
        opacity: number;
        x: number;
        y: number;
        transformPerspective: number;
        transition: {
            type: string;
        };
    } | {
        originX: number;
        originY: string;
        rotateX: any;
        rotateY: any;
        opacity: number;
        x: number;
        y: number;
        transformPerspective: number;
        transition: {
            type: string;
        };
    };
    getContinuousOrigin(i: number, currentIndex: number, previousIndex: number): {
        originY: string;
        originX: string;
    } | {
        originY: number;
        originX: string;
    } | {
        originX: number;
        originY: string;
    };
    getDiscreteOrigin(i: number, currentIndex: number, previousIndex: number, loop: boolean): {};
}
