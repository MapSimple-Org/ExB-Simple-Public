import { BaseHover } from './base';
export declare class Spin extends BaseHover {
    rotate: number;
    constructor(option?: {
        rotate?: number;
    });
    animateProps(): {
        from: any;
        to: any;
        loop: {
            rotate: string;
            reverse: boolean;
        };
    };
    cssProps(): import("@emotion/utils/dist/declarations/src/types").SerializedStyles;
}
