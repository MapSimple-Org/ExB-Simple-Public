import { type TransitionHandler, TransitionDirection } from '../types';
export declare class CubeTransition implements TransitionHandler {
    private readonly isRTL;
    private readonly direction;
    constructor(isRTL?: boolean, direction?: TransitionDirection);
    initState(progress: number, i: number, currentIndex: number, previousIndex: number): [number, number];
    getContinuousOrigin(i: number, currentIndex: number, previousIndex: number): {
        originX: number;
        originY: string;
    } | {
        originX: string;
        originY: string;
    } | {
        originY: number;
        originX: string;
    };
    getVariants(): {
        toPrevious: any;
        toNext: any;
        fromPrevious: any;
        fromNext: any;
        showView: any;
        hideView: any;
    };
    getDiscreteOrigin(i: number, currentIndex: number, previousIndex: number, loop: boolean): {
        originX: number[];
        originY: string[];
    } | {
        originY: number[];
        originX: string[];
    } | {
        originY: string[];
        originX: string[];
    };
    getTransitionProps(i: number, currentIndex: number, previousIndex: number, progress?: number): {
        originX: number;
        originY: string;
        rotateX: number;
        rotateY: number;
        x: string | number;
        y: string | number;
        opacity: number;
        transformPerspective: number;
        transition: {
            type: string;
        };
    } | {
        originX: string;
        originY: string;
        rotateX: number;
        rotateY: number;
        x: string | number;
        y: string | number;
        opacity: number;
        transformPerspective: number;
        transition: {
            type: string;
        };
    } | {
        originY: number;
        originX: string;
        rotateX: number;
        rotateY: number;
        x: string | number;
        y: string | number;
        opacity: number;
        transformPerspective: number;
        transition: {
            type: string;
        };
    };
}
