/** @jsx jsx */
import { React } from 'jimu-core';
import type { ThemeProps } from 'jimu-ui';
import { type BaseTreeListProps, type TreeItemsType } from './common/tree-types';
export type ListItemsType = TreeItemsType;
/**
 * The List component props.
 */
export interface ListProps extends Omit<BaseTreeListProps, 'checkboxLinkage'> {
    /**
     * The list item nodes array.
     */
    itemsJson?: ListItemsType;
}
/**
 * The `List` component allows users to add, manage, and interact with items in a list.
 *
 * ```ts
 * import { List } from 'jimu-ui/basic/list-tree'
 * ```
 */
export declare function ListComponent(props: ListProps & ThemeProps): import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * The `List` component allows users to add, manage, and interact with items in a list.
 *
 * ```ts
 * import { List } from 'jimu-ui/basic/list-tree'
 * ```
 */
export declare const List: React.ForwardRefExoticComponent<Pick<ListProps & ThemeProps, keyof ListProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
