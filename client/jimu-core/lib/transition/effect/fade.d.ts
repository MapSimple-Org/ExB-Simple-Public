import type { TransitionHandler } from '../types';
export declare class FadeTransition implements TransitionHandler {
    getTransitionProps(i: number, currentIndex: number, previousIndex: number, progress?: number): {
        x: number;
        y: number;
        rotateX: number;
        rotateY: number;
        transition: {
            type: string;
        };
        opacity: number;
    };
    getVariants(): {
        toPrevious: any;
        toNext: any;
        fromPrevious: any;
        fromNext: any;
        showView: any;
        hideView: any;
    };
}
