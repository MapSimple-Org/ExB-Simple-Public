import { React } from 'jimu-core';
import { DraggableCore } from 'react-draggable';
import type { DraggableData, DraggableEvent, ControlPosition, PositionOffsetControlPosition, DraggableBounds } from 'react-draggable';
export type { DraggableData, DraggableEvent, ControlPosition };
export { DraggableCore };
export type DragAxis = 'both' | 'x' | 'y' | 'none';
export interface DraggableProps {
    /**
     * If set to `true`, will allow dragging on non-left button clicks.
     * @default false
     */
    allowAnyClick?: boolean;
    /**
     * Determines which axis the draggable can move. This only affects
     * flushing to the DOM. Callbacks will still include all values.
     * Accepted values:
     *  - `"both"` allows movement horizontally and vertically.
     *  - `"x"` limits movement to horizontal axis.
     *  - `"y"` limits movement to vertical axis.
     *  - `"none"` stops all movement.
     *
     * Note: Only valid for uncontrolled mode
     * @default both
     */
    axis?: DragAxis;
    /**
     *
     * Specifies movement boundaries. Accepted values:
     * - `parent` restricts movement within the node's offsetParent
     *   (nearest node with position relative or absolute).
     * - A selector that restricts movement within the target node.
     * - An object with `left, top, right, and bottom` properties.
     *  These indicate how far in each direction the draggable
     *   can be moved.
     */
    bounds?: DraggableBounds | string | false;
    /**
     * Specifies a selector to prevent drag initialization.
     *  Example: '.body'
     */
    cancel?: string;
    /**
     * By default, we add `user-select:none` attributes to the document body
     * to prevent ugly text selection during dragging. If this causes problems
     * for your app, set it to `false`.
     * @default true
     */
    disableUserSelectWhenDragging?: boolean;
    /**
     * Class name inserted by default.
     * @default react-draggable
     */
    defaultClassName?: string;
    /**
     * Class name inserted when dragging.
     *  @default react-draggable-dragging
     */
    defaultClassNameDragging?: string;
    /**
     * Class name inserted after dragging.
     * @default react-draggable-dragged
     */
    defaultClassNameDragged?: string;
    /**
     * Specifies the starting positions `x` and `y` of the drag item.
     * In general, this is not necessary as you can use absolute or relative
     * positioning of the child item directly, but it helps to unify callbacks
     * and css transforms.
     */
    defaultPosition?: ControlPosition;
    /**
     * If true, will not call any drag handlers.
     * @default false
     */
    disabled?: boolean;
    /**
     * Specifies the x and y that dragging should snap to.
     */
    grid?: [number, number];
    /**
     * Specifies a selector to be used as the handle that initiates drag.
     * Example: '.handle'
     */
    handle?: string;
    /**
     * If desired, you can provide your own offsetParent for drag calculations.
     * By default, we use the Draggable's offsetParent. This can be useful for elements
     * with odd display types or floats.
     */
    offsetParent?: HTMLElement;
    /**
     * `ReactDOM.findDomNode` is deprecated from React 19 onwards.
     * A `nodeRef` of the children element must be passed to the `Draggable` component.
     */
    nodeRef: React.RefObject<HTMLElement>;
    /**
     * Called whenever the user mouses down. Called regardless of handle or disabled status.
     * @event
     */
    onMouseDown?: (e: MouseEvent) => void;
    /**
     * Called when dragging starts. If any handler returns `false`, the action will canceled.
     * @event
     */
    onStart?: (e: DraggableEvent, data: DraggableData) => void | false;
    /**
     * Called while dragging.
     * @event
     */
    onDrag?: (e: DraggableEvent, data: DraggableData) => void | false;
    /**
     * Called when dragging stops.
     * @event
     */
    onStop?: (e: DraggableEvent, data: DraggableData) => void | false;
    /**
     * Much like React form elements, if this property is present, the item
     * becomes 'controlled' and is not responsive to user input. Use `position`
     * if you need to have direct control of the element.
     */
    position?: ControlPosition;
    /**
     * A position offset to start with. Useful for giving an initial position
     * to the element. Differs from `defaultPosition` in that it does not
     * affect the position returned in draggable callbacks, and in that it
     * accepts strings, like `{x: '10%', y: '10%'}`.
     */
    positionOffset?: PositionOffsetControlPosition;
    /**
     * Specifies the scale of the canvas your are dragging this element on. This allows
     * you to, for example, get the correct drag deltas while you are zoomed in or out via
     * a transform or matrix in the parent of this element.
     * @default 1
     */
    scale?: number;
    /**
     * Child node to drag
     */
    children: React.ReactNode;
}
export declare const Draggable: (props: DraggableProps) => import("@emotion/react/jsx-runtime").JSX.Element;
