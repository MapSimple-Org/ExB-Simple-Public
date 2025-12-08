import type { React } from 'jimu-core';
import type { IconComponentProps } from 'jimu-ui';
import type { _Tree } from '../tree';
import type { _TreeItem } from './tree-item';
import type { TreeMain } from './tree-main';
export declare enum TreeStyle {
    Basic = "BASIC",
    Card = "CARD"
}
export declare enum TreeAlignmentType {
    Typical = "TYPICAL",
    Intact = "INTACT"
}
export declare enum TreeCollapseStyle {
    PlusMinus = "PLUS_MINUS",
    Arrow = "ARROW"
}
/**
 * Only used inside component.
 * @ignore
 */
export declare enum TreeSelectionStyle {
    /**
     * Only for List component & single
     * @ignore
     */
    HighlightMark = "HIGHLIGHT_MARK",
    /**
     * Two styles for Tree component
     * Check: for Default style
     * Box: for Card style
     */
    CheckSelection = "CHECK_SELECTION",
    BoxSelection = "BOX_SELECTION",
    /** */
    CheckboxSelection = "CHECKBOX_SELECTION"
}
/**
 * TreeItemInRelationType: tree item with tree relationship data
 * - tree item array in bottom-up order: treeItemJsons, e.g. [tree item, parent item, parent of parent item, ... top parent item]
 * - level(depth) of the tree item: treeItemJsons.length, e.g. [tree item, parent item, top parent item].length => depth: 3
 * - for List, the level(depth) of the tree item is 1 and the tree item itself is an array of tree items(i.e. list items)
 */
export type TreeItemInRelationType = TreeItemType[];
/**
 * TreeItemsType: tree item array for a group of sibling tree items: treeItems, e.g. [sibling tree item 1, sibling tree item 2, sibling tree item 3]
 */
export type TreeItemsType = TreeItemType[];
export interface CommandActionDataType {
    event: React.SyntheticEvent;
    data?: any;
    command: CommandType;
    itemCommands: CommandType[];
}
export interface CommandType {
    /**
     * Id that can be used to identify the command item
     */
    key?: any;
    /**
     * Label of the command item
     */
    label?: string;
    /**
     * Whether the command item is collapsed
     */
    collapsed?: boolean;
    /**
     * Button props of the command item
     * @default null
     * @ignore
     */
    buttonAriaPressed?: boolean;
    /**
     * Icon props of the command item
     */
    iconProps?: IconComponentProps | (() => IconComponentProps);
    /**
     * Callback fired when the command is executed
     */
    action?: (actionData: CommandActionDataType) => void;
}
/**
 * Layout and content data to be used for tree item renderer
 */
export interface TreeItemBlockInfoType {
    name: TreeItemActionType;
    [configKey: string]: any;
    children?: TreeItemBlockInfoType[];
}
export interface TreeItemType {
    /**
     * Id that can be used to identify the item
     */
    itemKey: string;
    /**
     * Array that includes of all child items
     */
    itemChildren?: TreeItemsType;
    /**
     * Whether the item is disabled
     */
    itemStateDisabled?: boolean;
    /**
     * Whether the children is expanded
     */
    itemStateExpanded?: boolean;
    /**
     * Whether to always display the expand icon to trigger lazy loading of children, ignoring the case where there are no child nodes.
     * @default false
     */
    itemExpandIconShown?: boolean;
    /**
     * Whether the item is selectable.
     * @default True
     */
    isItemSelectable?: boolean;
    /**
     * Whether the item is selected or checked.
     */
    itemStateChecked?: boolean;
    /**
     * If `true`, the checkbox is indeterminate, regardless of `itemStateChecked`.
     * Only valid when isMultiSelection is true.
     */
    indeterminate?: boolean;
    /**
     * If `true`, the checkbox is disabled, the state is always 'Unchecked'.
     * Only valid when isMultiSelection is true.
     */
    isCheckboxDisabled?: boolean;
    /**
     * The text currently being edited
     */
    itemStateEditingText?: string;
    /**
     * Whether the detail content is displayed
     */
    itemStateDetailVisible?: boolean;
    /**
     * Detail content of the item
     */
    itemStateDetailContent?: any;
    /**
     * Icon of the item
     */
    itemStateIcon?: IconComponentProps | (() => IconComponentProps);
    /**
     * Title of the item
     */
    itemStateTitle?: string;
    /**
     * Array that includes the commands can be executed for the item
     */
    itemStateCommands?: CommandType[];
}
export interface TreeActionDataType {
    [key: string]: any;
}
export type AcceptedTreeActionType = TreeActionType | TreeMainActionType | TreeItemActionType;
export declare enum TreeActionType {
    RenderOverride = "renderOverride"
}
export declare enum TreeMainActionType {
    RenderOverrideMain = "renderOverrideMain"
}
export declare enum TreeItemActionType {
    RenderOverrideItemChildrenToggle = "renderOverrideItemChildrenToggle",
    RenderOverrideItemDragHandle = "renderOverrideItemDragHandle",
    RenderOverrideItemDetailToggle = "renderOverrideItemDetailToggle",
    RenderOverrideItemIcon = "renderOverrideItemIcon",
    RenderOverrideItemTitle = "renderOverrideItemTitle",
    RenderOverrideItemCommands = "renderOverrideItemCommands",
    RenderOverrideItemDraggableContainer = "renderOverrideItemDraggableContainer",
    RenderOverrideItemMainLine = "renderOverrideItemMainLine",
    RenderOverrideItemDetailLine = "renderOverrideItemDetailLine",
    RenderOverrideItemBody = "renderOverrideItemBody",
    RenderOverrideItemContent = "renderOverrideItemContent",
    RenderOverrideItemDroppableContainer = "renderOverrideItemDroppableContainer",
    RenderOverrideItemSubitems = "renderOverrideItemSubitems",
    RenderOverrideItem = "renderOverrideItem",
    OverrideItemBlockInfo = "overrideItemBlockInfo",
    HandleInitTreeItemDndDropZone = "handleInitTreeItemDndDropZone",
    HandleInitTreeItemDndDrag = "handleInitTreeItemDndDrag",
    HandleDidDrop = "handleDidDrop",
    HandleDisabledItemRemoved = "handleDisabledItemRemoved",
    HandleToggleDetail = "handleToggleDetail",
    HandleExpandItem = "handleExpandItem",
    HandleEditingTextChange = "handleEditingTextChange",
    HandleExitEditing = "handleExitEditing",
    HandleStartEditing = "handleStartEditing",
    HandleCheckboxChanged = "handleCheckboxChanged",
    HandleFindSearchText = "handleFindSearchText",
    IsItemDisplayable = "isItemDisplayable",
    IsItemFocused = "isItemFocused",
    HandleClickItemBody = "handleClickItemBody",
    HandleClickItemTitle = "handleClickItemTitle",
    HandleDoubleClickItemTitle = "handleDoubleClickItemTitle",
    HandleUpdateItem = "handleUpdateItem",
    GetDragItemJsons = "getDragItemJsons",
    SetDragItemJsons = "setDragItemJsons",
    IsItemDroppable = "isItemDroppable",
    IsFolder = "isFolder",
    OnToggleDetail = "onToggleDetail",
    OnExpandItem = "onExpandItem",
    OnEditingTextChange = "onEditingTextChange",
    OnExitEditing = "onExitEditing",
    OnDidDrop = "onDidDrop",
    OnClickItemBody = "onClickItemBody",
    OnDoubleClickItemTitle = "onDoubleClickItemTitle",
    OnClickItemCommand = "onClickItemCommand",
    OnUpdateItem = "onUpdateItem"
}
export interface TreeCheckDropItemActionDataType {
    draggingItemJsons: TreeItemInRelationType;
    targetItemJsons: TreeItemInRelationType;
    dropType?: string;
}
export interface TreeEditingItemDataType {
    itemStateEditingText: string;
}
export interface TreeCheckedItemDataType {
    itemStateEditingText: string;
}
export interface TreeDropItemActionDataType {
    dropType: string;
    dragItem: TreeDragItemActionDataType;
}
export interface TreeInitDndActionDataType {
    type: 'mount' | 'unmount';
}
export interface TreeRenderOverrideItemDataType {
    currentBlockInfo: TreeItemBlockInfoType;
}
export interface TreeOverrideItemBlockInfoActionDataType {
    itemBlockInfo: TreeItemBlockInfoType;
}
export interface TreeToggleItemDetailActionDataType {
    itemStateDetailVisible: boolean;
}
export interface TreeExpandItemActionDataType {
    itemStateExpanded: boolean;
}
export interface TreeDragItemActionDataType {
    itemJsons?: TreeItemInRelationType;
    dragEvent: any;
    type?: string;
}
export interface UpdateTreeActionDataType extends TreeActionDataType {
    updateType: AcceptedTreeActionType;
}
/**
 * Component managed render functions, can be overridden for customized render logic
 */
export interface TreeItemRenderActionMapType {
    /**
     * @ignore
     */
    renderOverrideItemDraggableContainer?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemDroppableContainer?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemChildrenToggle?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemDragHandle?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemDetailToggle?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemIcon?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemTitle?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemCommands?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * Render the custom main line content.
     */
    renderOverrideItemMainLine?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemDetailLine?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemBody?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemContent?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItemSubitems?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
    /**
     * @ignore
     */
    renderOverrideItem?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
}
export interface TreeMainRenderActionMapType {
    renderOverrideMain?: (actionData: TreeActionDataType, refComponent: TreeMain) => any;
}
export interface TreeRenderActionMapType {
    renderOverride?: (actionData: TreeActionDataType, refComponent: _Tree) => any;
}
/**
 * Component managed internal logic functions, can be overridden for customized logic.
 */
export interface TreeItemInternalActionMapType {
    /**
     * Fired when getting the block layout info.
     */
    overrideItemBlockInfo?: (actionData: TreeOverrideItemBlockInfoActionDataType, refComponent: _TreeItem) => TreeItemBlockInfoType;
    /**
     * Fired when adding or removing dnd features into the component.
     * @ignore
     */
    handleInitTreeItemDndDropZone?: (actionData: TreeInitDndActionDataType, refComponent: _TreeItem) => void;
    /**
     * @ignore
     */
    handleInitTreeItemDndDrag?: (actionData: TreeInitDndActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when dropping a dragging item.
     * @ignore
     */
    handleDidDrop?: (actionData: TreeDropItemActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when checking if the disabled item supports to be removed.
     * @ignore
     */
    handleDisabledItemRemoved?: (actionData: any, refComponent: _TreeItem) => void;
    /**
     * Fired when detail content is toggling for display.
     * @ignore
     */
    handleToggleDetail?: (actionData: TreeToggleItemDetailActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when expanding or collapsing the children.
     * @ignore
     */
    handleExpandItem?: (actionData: TreeExpandItemActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when changing the editing text of item title.
     * @ignore
     */
    handleEditingTextChange?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when exiting the editing text mode.
     * @ignore
     */
    handleExitEditing?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when starting to edit text of item title.
     * @ignore
     */
    handleStartEditing?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when searching for filter text.
     * @ignore
     */
    handleFindSearchText?: (actionData: TreeActionDataType, refComponent: _TreeItem) => any;
    /**
     * Fired when checking if the item should be displayed.
     */
    isItemDisplayable?: (actionData: TreeActionDataType, refComponent: _TreeItem) => boolean;
    /**
     * Fired when checking if an item is focused.
     * Please use `itemStateChecked` to set the focus state for each tree item.
     * @deprecated
     */
    isItemFocused?: (actionData: any, refComponent: _TreeItem) => boolean;
    /**
     * Fired when clicking the item body.
     * @ignore
     */
    handleClickItemBody?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when clicking the item title.
     * @ignore
     */
    handleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when double-clicking the item title.
     * @ignore
     */
    handleDoubleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when the check state of the item is changed.
     * @ignore
     */
    handleCheckboxChanged?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when item json is changed.
     * @ignore
     */
    handleUpdateItem?: (actionData: UpdateTreeActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when getting current drag item data.
     * @ignore
     */
    getDragItemJsons?: (actionData: TreeDragItemActionDataType, refComponent: _TreeItem) => TreeDragItemActionDataType;
    /**
     * Fired when setting current drag item data.
     * @ignore
     */
    setDragItemJsons?: (actionData: TreeDragItemActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when setting the item focused.
     * @ignore
     */
    handleFocusItem?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
    /**
     * Triggered to verify if the current item is being targeted by a dragged item.
     * The possible drop positions are inside, above, or below.
     */
    isItemDroppable?: (actionData: TreeCheckDropItemActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when checking if the current item is a folder.
     * Disable the checkbox if the current item is in the root and has no children.
     */
    isFolder?: (actionData: TreeCheckDropItemActionDataType, refComponent: _TreeItem) => void;
}
export interface TreeItemExternalActionMapType {
    /**
     * Fired when a dragged item is dropped.
     */
    onDidDrop?: (actionData: TreeDropItemActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when the detail content is expanded for display.
     */
    onToggleDetail?: (actionData: TreeToggleItemDetailActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when children are expanded or collapsed.
     */
    onExpandItem?: (actionData: TreeExpandItemActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when the text editing of an item title is changed.
     */
    onEditingTextChange?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when the text-editing mode is exited.
     */
    onExitEditing?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when the item body is clicked.
     */
    onClickItemBody?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when the item title is double-clicked.
     */
    onDoubleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when any command item is clicked.
     */
    onClickItemCommand?: (actionData: CommandActionDataType, refComponent: _TreeItem) => void;
    /**
     * Fired when the item is updated.
     */
    onUpdateItem?: (actionData: UpdateTreeActionDataType, refComponent: _TreeItem) => void;
}
export interface TreeItemActionMapType extends TreeItemRenderActionMapType, TreeItemInternalActionMapType, TreeItemExternalActionMapType {
}
export interface TreeMainActionMapType extends TreeItemActionMapType, TreeMainRenderActionMapType {
}
export interface TreeActionMapType extends TreeMainActionMapType, TreeRenderActionMapType {
}
/**
 * The base tree/list component props.
 */
export interface BaseTreeListProps extends TreeItemActionMapType {
    /**
     * ForwardRef to component outer div.
     * @ignore
     */
    forwardRef?: (ref: any) => void;
    /**
     * Defines the size of the Tree item.
     * @default default
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * Add class name to the component.
     */
    className?: string;
    /**
     * A component or tag name to render the component's top level node.
     * @ignore
     */
    topTag?: React.ComponentType<any> | string;
    /**
     * Whether to support drag-and-drop feature.
     */
    dndEnabled?: boolean;
    /**
     * Whether to show checkbox for every item.
     * Use `checkboxLinkage` instead.
     * @default false
     * @deprecated
     * @ignore
     */
    showCheckbox?: boolean;
    /**
     * Whether to disable the double-click on the title to enter edit mode.
     * @default false
    */
    disableDoubleClickTitle?: boolean;
    /**
     * Whether to show the remove icon for any disabled item.
     * @default false
     */
    showRemoveIconForDisabledItem?: boolean;
    /**
     * Whether to support multi-selection.
     * @default true
     */
    isMultiSelection?: boolean;
    /**
     * Whether the specific tree node change affects parent and child nodes.
     * Only valid when isMultiSelection is true.
     * @default true
     */
    checkboxLinkage?: boolean;
    /**
     * Tree style.
     */
    treeStyle?: TreeStyle;
    /**
     * Tree alignment type.
     */
    treeAlignmentType?: TreeAlignmentType;
    /**
     * Single line text is displayed. Only for layer selector now.
     * @default false
     * @ignore
     */
    singleLineText?: boolean;
    /**
     * Wrap the searchedText with a <strong/> TAG when it exists.
     * @ignore
     */
    searchedText?: string;
    /**
     * Whether the command items are only displayed only when hovering mouse on them.
     * @default false
     * @ignore
     */
    onlyShowOnHover?: boolean;
    /**
     * Auto focus on the next item, previous item, or the whole list when the current item is removed.
     * @default true
     * @ignore
     */
    autoHandleFocus?: boolean;
}
