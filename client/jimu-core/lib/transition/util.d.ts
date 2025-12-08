import { TransitionType, type TransitionHandler, TransitionDirection } from './types';
import { AppMode } from '../types/common';
export declare function isIntegerProgress(progress: number): boolean;
export declare function getIndexFromProgress(progress: number, length: number): {
    currentIndex: number;
    previousIndex: number;
    progress: number;
};
export declare function clamp(value: number, min: number, max: number): number;
export declare function getTransition(type: TransitionType, direction?: TransitionDirection): TransitionHandler;
export declare function getViewAnimate(id: string, moveInIndex: number, moveOutIndex: number, currentMode: AppMode, isPlaying: boolean, loop: boolean): {};
