/** @jsx jsx */
import { React } from 'jimu-core';
import { type TreeDragItemActionDataType, type TreeMainActionMapType, TreeItemActionType, type TreeItemInRelationType, type TreeItemType, TreeMainActionType, type TreeActionDataType, type TreeCollapseStyle, TreeAlignmentType, TreeStyle } from './tree-types';
import { type _TreeItem } from './tree-item';
/**
 * The tree-main component props
 */
export interface TreeMainProps extends TreeMainActionMapType {
    className?: string;
    isTree?: boolean;
    topTag?: React.ComponentType<any> | string;
    treeAlignmentType?: TreeAlignmentType;
    uuid?: string;
    collapseStyle?: TreeCollapseStyle;
    isMultiSelection?: boolean;
    checkboxLinkage?: boolean;
    treeStyle?: TreeStyle;
    singleLineText?: boolean;
    searchedText?: string;
    rootItemVisible?: boolean;
    size?: 'default' | 'sm' | 'lg';
    dndEnabled?: boolean;
    onlyShowOnHover?: boolean;
    disableDoubleClickTitle?: boolean;
    showRemoveIconForDisabledItem?: boolean;
    rootItemJson: TreeItemType;
    withStates?: any;
    handleAction?: <ArgT, ResT>(actionKey: TreeMainActionType | TreeItemActionType, actionData: ArgT, refComponent: TreeMain | _TreeItem) => ResT;
}
export interface TreeMainState {
    dragItems: TreeDragItemActionDataType[];
}
export declare class TreeMain extends React.Component<TreeMainProps, TreeMainState> {
    constructor(props: any);
    render(): React.ReactNode;
    renderItemJson(itemJsons: TreeItemInRelationType): import("@emotion/react/jsx-runtime").JSX.Element;
    static defaultHandleActionMap: TreeMainActionMapType;
    static defaultProps: {
        renderOverrideItemDraggableContainer?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDroppableContainer?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemChildrenToggle?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDragHandle?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDetailToggle?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemIcon?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemTitle?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemCommands?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemMainLine?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDetailLine?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemBody?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemContent?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemSubitems?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItem?: (actionData: import("./tree-types").TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        overrideItemBlockInfo?: (actionData: import("./tree-types").TreeOverrideItemBlockInfoActionDataType, refComponent: _TreeItem) => import("./tree-types").TreeItemBlockInfoType;
        handleInitTreeItemDndDropZone?: (actionData: import("./tree-types").TreeInitDndActionDataType, refComponent: _TreeItem) => void;
        handleInitTreeItemDndDrag?: (actionData: import("./tree-types").TreeInitDndActionDataType, refComponent: _TreeItem) => void;
        handleDidDrop?: (actionData: import("./tree-types").TreeDropItemActionDataType, refComponent: _TreeItem) => void;
        handleDisabledItemRemoved?: (actionData: any, refComponent: _TreeItem) => void;
        handleToggleDetail?: (actionData: import("./tree-types").TreeToggleItemDetailActionDataType, refComponent: _TreeItem) => void;
        handleExpandItem?: (actionData: import("./tree-types").TreeExpandItemActionDataType, refComponent: _TreeItem) => void;
        handleEditingTextChange?: (actionData: import("./tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        handleExitEditing?: (actionData: import("./tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        handleStartEditing?: (actionData: import("./tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        handleFindSearchText?: (actionData: TreeActionDataType, refComponent: _TreeItem) => any;
        isItemDisplayable?: (actionData: TreeActionDataType, refComponent: _TreeItem) => boolean;
        isItemFocused?: (actionData: any, refComponent: _TreeItem) => boolean;
        handleClickItemBody?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        handleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        handleDoubleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        handleCheckboxChanged?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        handleUpdateItem?: (actionData: import("./tree-types").UpdateTreeActionDataType, refComponent: _TreeItem) => void;
        getDragItemJsons?: (actionData: TreeDragItemActionDataType, refComponent: _TreeItem) => TreeDragItemActionDataType;
        setDragItemJsons?: (actionData: TreeDragItemActionDataType, refComponent: _TreeItem) => void;
        handleFocusItem?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        isItemDroppable?: (actionData: import("./tree-types").TreeCheckDropItemActionDataType, refComponent: _TreeItem) => void;
        isFolder?: (actionData: import("./tree-types").TreeCheckDropItemActionDataType, refComponent: _TreeItem) => void;
        onDidDrop?: (actionData: import("./tree-types").TreeDropItemActionDataType, refComponent: _TreeItem) => void;
        onToggleDetail?: (actionData: import("./tree-types").TreeToggleItemDetailActionDataType, refComponent: _TreeItem) => void;
        onExpandItem?: (actionData: import("./tree-types").TreeExpandItemActionDataType, refComponent: _TreeItem) => void;
        onEditingTextChange?: (actionData: import("./tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        onExitEditing?: (actionData: import("./tree-types").TreeEditingItemDataType, refComponent: _TreeItem) => void;
        onClickItemBody?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        onDoubleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        onClickItemCommand?: (actionData: import("./tree-types").CommandActionDataType, refComponent: _TreeItem) => void;
        onUpdateItem?: (actionData: import("./tree-types").UpdateTreeActionDataType, refComponent: _TreeItem) => void;
        renderOverrideMain?: (actionData: TreeActionDataType, refComponent: TreeMain) => any;
        className: string;
        topTag: string;
        treeAlignmentType: TreeAlignmentType;
        singleLineText: boolean;
        treeStyle: TreeStyle;
        rootItemVisible: boolean;
        dndEnabled: boolean;
        withStates: {};
        handleAction: (actionKey: any, actionData: any, refComponent: any) => any;
    };
}
