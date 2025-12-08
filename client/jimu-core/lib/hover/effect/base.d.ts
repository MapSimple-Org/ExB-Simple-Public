import { type HoverType } from '../types';
export declare abstract class BaseHover {
    option: any;
    type: HoverType;
    constructor(type: HoverType, option?: any);
    abstract animateProps(): any;
    abstract cssProps(): any;
    generateProps(props: any): any;
}
