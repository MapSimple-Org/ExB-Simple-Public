import { React } from 'jimu-core';
import { type TargetType } from './utils';
export type OverlayDismissReason = 'clickOutside' | 'pageOrSizeMode' | 'appMode' | 'escape' | 'close';
interface OverlayDismissProps {
    /**
     * If `true`, the overlay is visible.
     */
    open: boolean;
    /**
      * Reference node used to set the position of overlay
      */
    reference: TargetType;
    /**
      * A ref to get the root node of the overlay.
      */
    overlayNodeRef: React.RefObject<HTMLDivElement>;
    /**
      * By default, clicking into a nested `Popper` will not trigger the toggle method of the current Popper.
      * If you want to trigger the toggle method of the current Popper, you can set `avoidNestedToggle` to `false`.
      * @default true
      * @ignore
      */
    avoidNestedToggle?: boolean;
    /**
      * By default, the toggle method will be triggered when the user trigger mousedown event on the element outside the popper.
      * If you want to delay triggering the toggle method, set delay time of `toggle` by `delayToggle` (millisecond).
      *
      * Usage scenarios: If user click the element of the nested popper, the toggle method of current popper will be triggered when the mousedown event is triggered.
      * General toggle callbacks will unmount the current Popper, which will cause the nested Popper to be unmount,
      * and the event of clicking on the element in the nested Popper is not triggered. Delay triggering the toggle method can solve this problem.
      *
      * @default 0
      * @ignore
      */
    delayToggle?: number;
    /**
     * A ref to record the node of nested poppers that have been clicked, put it on the `NestedTargetContext`.
     */
    nestedTargetRef: React.MutableRefObject<any>;
    /**
      * The callback function when the overlay is dismissed.
      */
    onDismiss: (evt: React.MouseEvent<any> | React.TouchEvent<any> | React.KeyboardEvent<any>, reason: OverlayDismissReason) => void;
}
export interface OverlayDismissManagerProps extends Omit<OverlayDismissProps, 'nestedTargetRef'> {
    /**
     * The children of the component.
     */
    children?: React.ReactNode;
}
export declare const OverlayDismissManager: React.FC<OverlayDismissManagerProps>;
export {};
