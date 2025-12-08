/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
import { type ThemeProps } from 'jimu-ui';
import { type TreeItemInRelationType, type TreeRenderOverrideItemDataType, TreeItemActionType, type TreeItemBlockInfoType, type TreeOverrideItemBlockInfoActionDataType, type TreeExpandItemActionDataType, type TreeToggleItemDetailActionDataType, type TreeDragItemActionDataType, type TreeInitDndActionDataType, type TreeDropItemActionDataType, type TreeEditingItemDataType, type TreeItemActionMapType, type TreeCheckDropItemActionDataType, type TreeActionDataType, TreeCollapseStyle, TreeAlignmentType, TreeSelectionStyle, TreeStyle } from './tree-types';
interface IntlProps {
    /**
     * @ignore
     */
    intl: IntlShape;
}
/**
 * The TreeItem component props.
 */
export interface TreeItemProps extends TreeItemActionMapType {
    className?: string;
    treeAlignmentType?: TreeAlignmentType;
    /**
     * The style of expand/collapse icon.
     * @default TreeCollapseStyle.Plus
     */
    collapseStyle?: TreeCollapseStyle;
    /**
     * Whether to show checkbox for every item
     * @default false
     */
    isMultiSelection?: boolean;
    treeStyle?: TreeStyle;
    /**
     * @ignore
     */
    singleLineText?: boolean;
    /**
     * @ignore
     */
    searchedText?: string;
    checkboxLinkage?: boolean;
    size?: 'default' | 'sm' | 'lg';
    dndEnabled?: boolean;
    onlyShowOnHover?: boolean;
    disableDoubleClickTitle?: boolean;
    itemJsons: TreeItemInRelationType;
    /**
     * @ignore
     */
    withStates?: {
        [key: string]: any;
    };
    /**
     * @ignore
     */
    handleAction?: <ArgT, ResT>(actionKey: TreeItemActionType, actionData: ArgT, refComponent: _TreeItem) => ResT;
    /**
     * @ignore
     */
    itemBlockInfo?: TreeItemBlockInfoType;
    showRemoveIconForDisabledItem?: boolean;
    children?: React.ReactNode;
}
/**
 * The TreeItem component.
 *
 * ```ts
 * import { TreeItem } from 'jimu-ui/basic/list-tree'
 * ```
 */
export declare class _TreeItem extends React.Component<TreeItemProps & ThemeProps & IntlProps> {
    dropZoneInteractable: Interact.Interactable;
    dragInteractable: Interact.Interactable;
    dropZoneRef: React.RefObject<HTMLDivElement>;
    dragRef: React.RefObject<HTMLDivElement>;
    dragTriggered: boolean;
    dndInteract: any;
    intl: any;
    sanitizer: any;
    context: any;
    constructor(props: any);
    static contextType: React.Context<{
        isTree: boolean;
        uuid: string;
        selectionStyle: TreeSelectionStyle;
        multiLevel: boolean;
        isRTL: boolean;
    }>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element[];
    renderChildBlocks(actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem): import("@emotion/react/jsx-runtime").JSX.Element[];
    static defaultHandleActionMap: TreeItemActionMapType;
    static itemBlockInfos: {
        TYPICAL: {
            name: TreeItemActionType;
            children: ({
                name: TreeItemActionType;
                children: {
                    name: TreeItemActionType;
                    children: ({
                        name: TreeItemActionType;
                        children?: undefined;
                    } | {
                        name: TreeItemActionType;
                        children: ({
                            name: TreeItemActionType;
                            children: {
                                name: TreeItemActionType;
                                children: {
                                    name: TreeItemActionType;
                                }[];
                            }[];
                        } | {
                            name: TreeItemActionType;
                            children?: undefined;
                        })[];
                    })[];
                }[];
            } | {
                name: TreeItemActionType;
                children?: undefined;
            })[];
        };
        INTACT: {
            name: TreeItemActionType;
            children: ({
                name: TreeItemActionType;
                children: {
                    name: TreeItemActionType;
                    children: {
                        name: TreeItemActionType;
                        children: ({
                            name: TreeItemActionType;
                            children: {
                                name: TreeItemActionType;
                                children: {
                                    name: TreeItemActionType;
                                }[];
                            }[];
                        } | {
                            name: TreeItemActionType;
                            children?: undefined;
                        })[];
                    }[];
                }[];
            } | {
                name: TreeItemActionType;
                children?: undefined;
            })[];
        };
    };
    static defaultProps: {
        renderOverrideItemDraggableContainer?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDroppableContainer?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemChildrenToggle?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDragHandle?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDetailToggle?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemIcon?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemTitle?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemCommands?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemMainLine?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemDetailLine?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemBody?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemContent?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItemSubitems?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        renderOverrideItem?: (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => any;
        overrideItemBlockInfo?: (actionData: TreeOverrideItemBlockInfoActionDataType, refComponent: _TreeItem) => TreeItemBlockInfoType;
        handleInitTreeItemDndDropZone?: (actionData: TreeInitDndActionDataType, refComponent: _TreeItem) => void;
        handleInitTreeItemDndDrag?: (actionData: TreeInitDndActionDataType, refComponent: _TreeItem) => void;
        handleDidDrop?: (actionData: TreeDropItemActionDataType, refComponent: _TreeItem) => void;
        handleDisabledItemRemoved?: (actionData: any, refComponent: _TreeItem) => void;
        handleToggleDetail?: (actionData: TreeToggleItemDetailActionDataType, refComponent: _TreeItem) => void;
        handleExpandItem?: (actionData: TreeExpandItemActionDataType, refComponent: _TreeItem) => void;
        handleEditingTextChange?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
        handleExitEditing?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
        handleStartEditing?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
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
        isItemDroppable?: (actionData: TreeCheckDropItemActionDataType, refComponent: _TreeItem) => void;
        isFolder?: (actionData: TreeCheckDropItemActionDataType, refComponent: _TreeItem) => void;
        onDidDrop?: (actionData: TreeDropItemActionDataType, refComponent: _TreeItem) => void;
        onToggleDetail?: (actionData: TreeToggleItemDetailActionDataType, refComponent: _TreeItem) => void;
        onExpandItem?: (actionData: TreeExpandItemActionDataType, refComponent: _TreeItem) => void;
        onEditingTextChange?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
        onExitEditing?: (actionData: TreeEditingItemDataType, refComponent: _TreeItem) => void;
        onClickItemBody?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        onDoubleClickItemTitle?: (actionData: TreeActionDataType, refComponent: _TreeItem) => void;
        onClickItemCommand?: (actionData: import("./tree-types").CommandActionDataType, refComponent: _TreeItem) => void;
        onUpdateItem?: (actionData: import("./tree-types").UpdateTreeActionDataType, refComponent: _TreeItem) => void;
        theme: {};
        className: string;
        treeAlignmentType: TreeAlignmentType;
        treeStyle: TreeStyle;
        dndEnabled: boolean;
        withStates: {};
        handleAction: (actionKey: any, actionData: any, refComponent: any) => any;
    };
}
/**
 * The TreeItem component.
 *
 * ```ts
 * import { TreeItem } from 'jimu-ui/basic/list-tree'
 * ```
 */
export declare const TreeItem: React.ForwardRefExoticComponent<Pick<Omit<any, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, string | number | symbol> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
