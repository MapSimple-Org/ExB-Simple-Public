/** @jsx jsx */
import { React, Immutable, type IntlShape } from 'jimu-core';
import type { ThemeProps } from 'jimu-ui';
import { type TreeItemType, type BaseTreeListProps, TreeActionType, TreeMainActionType, TreeItemActionType, type TreeActionMapType, type TreeActionDataType, type TreeCollapseStyle, TreeAlignmentType, TreeStyle } from './common/tree-types';
import * as treeUtils from './common/tree-utils';
import { TreeMain } from './common/tree-main';
import type { _TreeItem } from './common/tree-item';
/**
 * The Tree component props
 */
export interface TreeProps extends BaseTreeListProps {
    /**
     * The key of template that you want to use to render the content.
     * @default TreeAlignmentType.Typical
     */
    treeAlignmentType?: TreeAlignmentType;
    /**
     * The styles for component.
     */
    treeStyle?: TreeStyle;
    /**
     * @ignore
     */
    singleLineText?: boolean;
    /**
     * It's used to check if tree since List extends Tree.
     * @default tree
     * @ignore
     */
    isTree?: boolean;
    /**
     * The style of expand/collapse icon.
     * @default TreeCollapseStyle.Plus
     */
    collapseStyle?: TreeCollapseStyle;
    /**
     * Root item node of the tree.
     */
    rootItemJson: TreeItemType;
    /**
     * Whether to display the root item itself.
     */
    rootItemVisible?: boolean;
    /**
     * The callback that will fire when any action is triggered (use default prop value unless for advanced usage)
     * @ignore
     */
    handleAction?: <ArgT, ResT>(actionKey: TreeActionType | TreeMainActionType | TreeItemActionType, actionData: ArgT, refComponent: _Tree | TreeMain | _TreeItem) => ResT;
}
interface IntlProps {
    /**
     * @ignore
     */
    intl: IntlShape;
}
export interface TreeState {
    searchForText: string;
    filterEnabled: boolean;
}
/**
 * The `Tree` component allows users to navigate complex data relationships by using multiple hierarchical structures.
 *
 * ```ts
 * import { Tree } from 'jimu-ui/basic/list-tree'
 * ```
 */
export declare class _Tree extends React.Component<TreeProps & ThemeProps & IntlProps, TreeState> {
    localRandomId: string;
    static count: number;
    constructor(props: any);
    render(): React.ReactNode;
    static defaultHandleActionMap: TreeActionMapType;
    static defaultProps: {
        renderOverrideItemDraggableContainer?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDroppableContainer?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemChildrenToggle?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDragHandle?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDetailToggle?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemIcon?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemTitle?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemCommands?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemMainLine?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDetailLine?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemBody?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemContent?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemSubitems?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItem?: (actionData: import("./common/tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        overrideItemBlockInfo?: (actionData: import("./common/tree-types").TreeOverrideItemBlockInfoActionDataType, refComponent: _TreeItem) => import("./common/tree-types").TreeItemBlockInfoType;
        handleInitTreeItemDndDropZone?: (actionData: import("./common/tree-types").TreeInitDndActionDataType, refComponent: _TreeItem) => void;
        handleInitTreeItemDndDrag?: (actionData: import("./common/tree-types").TreeInitDndActionDataType, refComponent: _TreeItem) => void;
        handleDidDrop?: (actionData: import("./common/tree-types").TreeDropItemActionDataType, refComponent: _TreeItem) => void;
        handleDisabledItemRemoved?: (actionData: any, refComponent: _TreeItem) => void;
        handleToggleDetail?: (actionData: import("./common/tree-types").TreeToggleItemDetailActionDataType, refComponent: _TreeItem) => void;
        handleExpandItem?: (actionData: import("./common/tree-types").TreeExpandItemActionDataType, refComponent: _TreeItem) => void;
        handleEditingTextChange?: (actionData: import("./common/tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        handleExitEditing?: (actionData: import("./common/tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        handleStartEditing?: (actionData: import("./common/tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        handleFindSearchText?: (actionData: TreeActionDataType, refComponent: _TreeItem) => any;
        isItemDisplayable?: (actionData: TreeActionDataType, refComponent: _TreeItem) => boolean;
        isItemFocused?: (actionData: any, refComponent: _TreeItem) => boolean;
        handleClickItemBody?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        handleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        handleDoubleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        handleCheckboxChanged?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        handleUpdateItem?: (actionData: import("./common/tree-types").UpdateTreeActionDataType, refComponent: _TreeItem) => void;
        getDragItemJsons?: (actionData: import("./common/tree-types").TreeDragItemActionDataType, refComponent: _TreeItem) => import("./common/tree-types").TreeDragItemActionDataType;
        setDragItemJsons?: (actionData: import("./common/tree-types").TreeDragItemActionDataType, refComponent: _TreeItem) => void;
        handleFocusItem?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        isItemDroppable?: (actionData: import("./common/tree-types").TreeCheckDropItemActionDataType, refComponent: _TreeItem) => void;
        isFolder?: (actionData: import("./common/tree-types").TreeCheckDropItemActionDataType, refComponent: _TreeItem) => void;
        onDidDrop?: (actionData: import("./common/tree-types").TreeDropItemActionDataType, refComponent: _TreeItem) => void;
        onToggleDetail?: (actionData: import("./common/tree-types").TreeToggleItemDetailActionDataType, refComponent: _TreeItem) => void;
        onExpandItem?: (actionData: import("./common/tree-types").TreeExpandItemActionDataType, refComponent: _TreeItem) => void;
        onEditingTextChange?: (actionData: import("./common/tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        onExitEditing?: (actionData: import("./common/tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        onClickItemBody?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        onDoubleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        onClickItemCommand?: (actionData: import("./common/tree-types").CommandActionDataType, refComponent: _TreeItem) => void;
        onUpdateItem?: (actionData: import("./common/tree-types").UpdateTreeActionDataType, refComponent: _TreeItem) => void;
        renderOverrideMain?: (actionData: TreeActionDataType, refComponent: TreeMain) => any;
        renderOverride?: (actionData: TreeActionDataType, refComponent: _Tree) => any;
        theme: Immutable.ImmutableObject<{}>;
        className: string;
        topTag: string;
        treeAlignmentType: TreeAlignmentType;
        treeStyle: TreeStyle;
        rootItemVisible: boolean;
        dndEnabled: boolean;
        onlyShowOnHover: boolean;
        handleAction: (actionKey: any, actionData: any, refComponent: any) => any;
    };
}
/**
 * The `Tree` component allows users to navigate complex data relationships by using multiple hierarchical structures.
 *
 * ```ts
 * import { Tree } from 'jimu-ui/basic/list-tree'
 * ```
 */
export declare const Tree: React.ForwardRefExoticComponent<Pick<Omit<TreeProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof TreeProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export { treeUtils };
