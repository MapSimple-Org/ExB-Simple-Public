import { type TransitionHandler, TransitionDirection } from '../types';
export declare class PushTransition implements TransitionHandler {
    private readonly isRTL;
    private readonly direction;
    constructor(isRTL?: boolean, direction?: TransitionDirection);
    initOffset(progress: number, i: number, currentIndex: number, previousIndex: number): number;
    getVariants(): {
        toPrevious: any;
        toNext: any;
        fromPrevious: any;
        fromNext: any;
        showView: any;
        hideView: any;
    };
    getTransitionProps(i: number, currentIndex: number, previousIndex: number, progress?: number): {
        x: string;
        y: string;
        transition: {
            type: string;
        };
        opacity: number;
    };
}
