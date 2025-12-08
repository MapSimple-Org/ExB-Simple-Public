/** @jsx jsx */
import { React, type IMLayoutJson } from 'jimu-core';
interface Props {
    layout: IMLayoutJson;
    layoutItemId: string;
    isLast?: boolean;
    onDragStart?: (id: string) => void;
    onDragging?: (id: string, dx: number, dy: number) => void;
    onDragEnd?: (id: string) => void;
}
export declare function GridItemComponent(props: Props & React.HTMLAttributes<HTMLDivElement>): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
