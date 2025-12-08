/** @jsx jsx */
import { type LayoutItemJson, type IMLayoutItemJson } from 'jimu-core';
import { type LayoutItemProps } from '../../types';
interface OwnProps {
    layoutId: string;
    layoutItem: LayoutItemJson | IMLayoutItemJson;
    gap: number;
    expanded: boolean;
    onExpandedChange: (layoutItemId: string, expanded: boolean) => void;
}
export declare function AccordionItem(props: LayoutItemProps & OwnProps): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
