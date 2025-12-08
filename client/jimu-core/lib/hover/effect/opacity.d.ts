import { BaseHover } from './base';
export declare class Opacity extends BaseHover {
    opacity: number;
    constructor(option?: {
        opacity?: number;
    });
    animateProps(): {
        from: any;
        to: any;
        loop: {
            opacity: number;
            reverse: boolean;
        };
    };
    cssProps(): import("@emotion/utils/dist/declarations/src/types").SerializedStyles;
}
