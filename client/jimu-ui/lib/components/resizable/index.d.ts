import { React } from 'jimu-core';
import { type ControlPosition } from '../draggable';
import type { DraggableBounds } from 'react-draggable';
export type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export interface Size {
    width: number;
    height: number;
}
/**
 * The `Resizable` component props.
 */
export interface ResizableProps extends Omit<React.HtmlHTMLAttributes<HTMLDivElement>, 'onMouseDown' | 'children' | 'onResize'> {
    /**
     * Specifies resizing boundaries. Accepted values:
     * - A selector string, restricts resizing within the targeted node.
     * - An object with `left, top, right, and bottom` properties.
     *  These indicate how far in each direction the item can be resized.
     */
    bounds?: DraggableBounds | string | false;
    /**
     * Specifies the x and y that resizing should snap to.
     */
    grid?: [number, number];
    /**
     * If true, the item cannot be resized.
     * @default false
     */
    disabled?: boolean;
    /**
     * Set the minimum size of the resizable item.
     * @default { width: 50, height: 50 }
     */
    minSize?: Size;
    /**
     * Specifies the width and height of the resizable item at start.
     *
     * Note: defaultSize will be ignored when size is set.
     * @default { width: 50, height: 50 }
     */
    defaultSize?: Size;
    /**
     * Set the size of the resizable item.
     * Use size if you need to control size state by yourself.
     */
    size?: Size;
    /**
     * Specifies the left and top of the resizable item at start.
     *
     * Note: defaultPosition will be ignored when position set.
     * @default { left: 0, top: 0 }
     */
    defaultPosition?: ControlPosition;
    /**
     * Set the position of the resizable item.
     * Use position if you need to control position state by yourself.
     */
    position?: ControlPosition;
    /**
     * Provide a resize handle for the bottom right corner.
     * Flipped handles will be applied for the other corners.
     * A handle can be an icon, an image, or any other valid HTMLElement.
     */
    handle?: React.ReactElement<HTMLElement>;
    /**
     * If `true`, keep the element inside the `document.body`
     * Do not set this to `true` if it's not an immediate child of document.body
     * @default false
     * @ignore
     */
    keepInBody?: boolean;
    /**
     * Called when resizing starts.
     */
    onStart?: (size: Size, position?: ControlPosition) => void;
    /**
     * Called while resizing.
     */
    onResize?: (size: Size, position?: ControlPosition) => void;
    /**
     * Called when resizing stops.
     */
    onStop?: (size: Size, position?: ControlPosition) => void;
    /**
     * Called when a mouse button is pressed on the resizable component
     * regardless of the `disabled` status.
     */
    onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
    /**
     * A list of resize handles: 'top-left', 'top-right', 'bottom-left' and 'bottom-right'.
     * @default ['bottom-right']
     */
    handles?: ResizeHandle[];
    /**
     * Render function or node.
     */
    children?: React.ReactNode | ((props: {
        size: Size;
        position?: ControlPosition;
    }) => React.ReactNode);
}
/**
 * The `Resizable` component allows the user to resize an element.
 *
 * ```ts
 * import { Resizable } from 'jimu-ui'
 * ```
 */
export declare const Resizable: React.ForwardRefExoticComponent<ResizableProps & React.RefAttributes<unknown>>;
