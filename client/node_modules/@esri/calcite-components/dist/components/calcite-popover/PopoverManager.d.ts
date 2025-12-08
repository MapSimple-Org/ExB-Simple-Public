import { ReferenceElement } from '../../utils/floating-ui';
import { Popover } from './customElement.js';
export declare function isDrag({ startX, startY, endX, endY, }: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}): boolean;
export default class PopoverManager {
    private registeredElements;
    private registeredElementCount;
    private pointerDownPosition?;
    registerElement(referenceEl: ReferenceElement, popover: HTMLCalcitePopoverElement): void;
    unregisterElement(referenceEl: ReferenceElement): void;
    private queryPopover;
    private togglePopovers;
    private closeAllPopovers;
    private keyDownHandler;
    private pointerDownHandler;
    private clickHandler;
    private addListeners;
    private removeListeners;
}
