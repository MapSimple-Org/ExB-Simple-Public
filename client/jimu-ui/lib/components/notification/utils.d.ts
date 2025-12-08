import type { SlideTransitionDirection } from '../slide';
import type { NotificationPlacement } from './type';
export declare const getSlideDirection: (placement: NotificationPlacement, isRTL: boolean) => SlideTransitionDirection;
export declare const getResponsivePlacement: (placement: NotificationPlacement, mobile?: boolean) => NotificationPlacement;
export declare function createChainedFunction<Args extends any[], This>(funcs: Array<((this: This, ...args: Args) => any) | undefined>, id?: string): (this: This, ...args: Args) => void;
