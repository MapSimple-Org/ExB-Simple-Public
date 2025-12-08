import { BaseHover } from './base';
export declare class Skew extends BaseHover {
    x: number;
    y: number;
    constructor(option?: {
        skewX?: number;
        skewY?: number;
    });
    animateProps(): {
        from: any;
        to: any;
        loop: {
            skewX: string;
            skewY: string;
            reverse: boolean;
        };
    };
    cssProps(): import("@emotion/utils/dist/declarations/src/types").SerializedStyles;
}
