import { BaseHover } from './base';
export declare class Sink extends BaseHover {
    x: number;
    y: number;
    constructor(option?: {
        offsetX?: number;
        offsetY?: number;
    });
    animateProps(): {
        from: any;
        to: any;
        loop: {
            translateX: string;
            translateY: string;
            reverse: boolean;
        };
    };
    cssProps(): import("@emotion/utils/dist/declarations/src/types").SerializedStyles;
}
