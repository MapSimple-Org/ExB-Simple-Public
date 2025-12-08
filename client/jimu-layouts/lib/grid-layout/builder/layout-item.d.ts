import type { LayoutItemProps } from '../../types';
export declare function GridLayoutItem(props: LayoutItemProps & {
    onDragStart: (id: string) => void;
    onDragging: (id: string, dx: number, dy: number) => void;
    onDragEnd: (id: string) => void;
}): import("@emotion/react/jsx-runtime").JSX.Element;
