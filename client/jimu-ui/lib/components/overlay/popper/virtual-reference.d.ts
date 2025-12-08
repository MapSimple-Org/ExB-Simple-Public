export declare const VIRTUAL_REFERENCE_CLASS = "virtual-reference";
export declare class VirtualReference {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
    declareClass: string;
    constructor(options: DOMRect);
    isVirtualReference: true;
    getBoundingClientRect(): any;
    get clientWidth(): any;
    get clientHeight(): any;
}
