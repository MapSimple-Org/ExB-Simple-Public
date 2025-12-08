import { React } from 'jimu-core';
import { type NavButtonGroupProps } from '../pagination';
/**
 * The ScrollList component props.
 */
export interface ScrollListProps extends NavButtonGroupProps {
    /**
     * Defines the role added to the element.
     * @default tablist
     */
    role?: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     */
    'aria-label'?: string;
    /**
     * Display items vertically or not.
     * @default false
     */
    vertical?: boolean;
    /**
     * The duration of the animation when scrolling.
     * @default 300
     */
    duration?: number;
    /**
     * If `true`, hide scroll arrows on both sides.
     * By default, it is `false` on desktop and `true` on mobile.
     */
    hideArrow?: boolean;
    /**
     * Whether to leave the arrow space when there is no scroll.
     * @default false
     * @ignore
     */
    leaveArrowSpaceOnNoScroll?: boolean;
    /**
     * A set of react elements that need to be scrolled.
     * @deprecated Use `children` instead.
     */
    items?: React.ReactElement[];
    /**
     * Whether to use the wheel to scroll.
     * @default false
     */
    useWheel?: boolean;
    /**
     * The alignment of the scroll list items.
     * @default start
     */
    alignment?: 'start' | 'center' | 'end';
    /**
     * The tag name of the scroll list.
     * @default div
     */
    listTag?: React.ElementType;
    /**
     * The children of the scroll list, which are react elements that need to be scrolled.
     */
    children?: React.ReactNode;
}
/**
 * The `ScrollList` provides the user with the ability to scroll through internal items.
 *
 * ```ts
 * import { ScrollList } from 'jimu-ui'
 * ```
 */
export declare const ScrollList: (props: ScrollListProps) => import("@emotion/react/jsx-runtime").JSX.Element;
