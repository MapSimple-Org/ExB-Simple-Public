import { BaseHover } from './base';
export declare class Grow extends BaseHover {
    x: number;
    y: number;
    constructor(option?: {
        scaleX?: number;
        scaleY?: number;
    });
    animateProps(): {
        from: any;
        to: any;
        loop: {
            scaleX: number;
            scaleY: number;
            reverse: boolean;
        };
    };
    cssProps(): import("@emotion/utils/dist/declarations/src/types").SerializedStyles;
}
