/** @jsx jsx */
import { React } from 'jimu-core';
import { type Placement } from 'jimu-ui';
import type { TreeItemType, TreeDropItemActionDataType, UpdateTreeActionDataType } from 'jimu-ui/basic/list-tree';
import { type SerializedStyles } from 'jimu-theme';
export interface SortTreePopperProps {
    title?: string;
    referenceElement: HTMLElement;
    placement?: Placement;
    onClose?: (evt?: React.MouseEvent<any>) => void;
    css?: SerializedStyles;
    className?: string;
    rootItemJson: TreeItemType;
    onSort?: (actionData: UpdateTreeActionDataType & TreeDropItemActionDataType) => void;
    onRemove: (item: TreeItemType) => void;
}
export declare const SortTreePopper: (props: SortTreePopperProps) => import("@emotion/react/jsx-runtime").JSX.Element;
