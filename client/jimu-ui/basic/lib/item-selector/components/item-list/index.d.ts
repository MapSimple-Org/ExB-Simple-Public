/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape, type ImmutableArray } from 'jimu-core';
import { type TargetType } from 'jimu-ui';
import type { ISearchOptions } from '@esri/arcgis-rest-portal';
import { ItemTypes, ItemCategory, type SortField, type SortOrder, type IItemWithPortalUrl, ItemSelectorMode, ItemTypeCategory } from '../../types';
/**
 * The ItemList props.
 */
export interface ItemListProps {
    /**
     * Portal url.
     */
    portalUrl: string;
    /**
     * Item types.
     */
    itemType: ItemTypes | ImmutableArray<ItemTypes>;
    /**
     * @ignore
     * Same with online item categories.
     */
    itemTypeCategory?: ItemTypeCategory | ImmutableArray<ItemTypeCategory>;
    /**
     * @default ItemSelectorMode.All
     */
    mode?: ItemSelectorMode;
    /**
     * Sort field.
     */
    sortField?: SortField;
    /**
     * Sort order.
     */
    sortOrder?: SortOrder;
    /**
     * Selected item ids.
     */
    selectedItems?: ImmutableArray<string>;
    /**
     * One item may contain multiple layers, item ids in the array mean that some of layers in the item are selected.
     * @ignore
     */
    partSelectedItems?: ImmutableArray<string>;
    /**
     * Items which are loading, will show a loading in the item card.
     */
    loadingItems?: ImmutableArray<string>;
    /**
     * If true, will save the selected items on mount and won't allow to remove these selected items.
     * @ignore
     */
    disableRemoveItemsSelectedOnMount?: boolean;
    /**
     * Will only show items which match the search value.
     */
    searchValue?: string;
    /**
     * Whether or not to support to select multiple items.
     *
     * @default false
     */
    isMultiple?: boolean;
    /**
     * My content, my organization, my group or public.
     */
    category?: ItemCategory;
    /**
     * Only list items in the folder, only works when category is my content,
     * list all items from my content if the value is null or undefined.
     */
    folderId?: string;
    /**
     * Only list items in these groups, only works when category is my group,
     * list all items from all my groups if the value is null or undefined.
     */
    groupId?: string;
    /**
     * In all mode, it is the reference node used to set the position of item detail popper. If do not pass in it, will use root node as the reference.
     * In simple mode, will ignore it.
     */
    detailReference?: TargetType;
    /**
     * If is true, the information icon in the item card will link to item detail page (open in new tab).
     * If is false, click the information icon in the item card, will trigger item detail popper.
     */
    disableDetailPopper?: boolean;
    /**
     * Whether or not to hide single layer items.
     * If `itemType` is `Web Map` or `Web Scene`, will ignore it.
     * For example, if `itemType` is `Feature Service` and `hideSingleLayer` is `true`, will hide feature service items which url ends up with layer id.
     *
     * @default false
     */
    hideSingleLayer?: boolean;
    /**
     * We only allow to show scene service items which contain 3DObject scene layer and Point scene layer by default.
     * The reason is that data source only support these two types of scene layer.
     * If allowAllSceneService is true, will allow to show all scene service items.
     * @ignore
     * @default false
     */
    allowAllSceneService?: boolean;
    /**
     * Callback when click one item to select it.
     */
    onSelect?: (allSelectedItems: IItemWithPortalUrl[], latestSelectedItem: IItemWithPortalUrl) => Promise<void>;
    /**
     * Callback when click one item co unselect it.
     */
    onRemove?: (allSelectedItems: IItemWithPortalUrl[], latestRemovedItem: IItemWithPortalUrl) => void;
    /**
     * Callback when click to show/hide item detail.
     * `showDetailItem` is null indicates item detail is hidden.
     */
    afterToggleItemDetail?: (showDetailItem: IItemWithPortalUrl) => void;
    /**
     * @ignore
     */
    isSelectable?: (item: IItemWithPortalUrl) => Promise<boolean>;
    /**
     * @ignore
     */
    className?: string;
    curatedFilter?: string;
    /**
     * @ignore
     * Whether or not to use default sort field and order.
     */
    disableDefaultSortSetting?: boolean;
}
interface State {
    loaded: boolean;
    items: IItemWithPortalUrl[];
    showDetailItem: IItemWithPortalUrl;
    isLoading: boolean;
}
interface ExtraProps {
    theme: IMThemeVariables;
    intl: IntlShape;
}
export declare class _ItemList extends React.PureComponent<ItemListProps & ExtraProps, State> {
    __unmount: boolean;
    pageStart: number;
    pageSize: number;
    contentNode: HTMLDivElement;
    showDetailItemRef: React.RefObject<HTMLButtonElement>;
    itemCache: IItemWithPortalUrl[];
    detailReference: HTMLDivElement;
    selectedItemsOnMount: ImmutableArray<string>;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: ItemListProps, prevState: State): void;
    componentWillUnmount(): void;
    isItemTypeSame(prevItemType: ItemTypes | ImmutableArray<ItemTypes>, itemType: ItemTypes | ImmutableArray<ItemTypes>): boolean;
    getRealGroupIds(): string[];
    getAllGroupIds(): string[];
    setItems: (type: ItemTypes | ImmutableArray<ItemTypes>, itemTypeCategory: ItemTypeCategory | ImmutableArray<ItemTypeCategory>, sort: SortField, order: SortOrder, groupIds?: string[], folderId?: string, search?: string, isMore?: boolean) => void;
    getSearchRequestOptions: (type: ItemTypes | ImmutableArray<ItemTypes>, itemTypeCategory: ItemTypeCategory | ImmutableArray<ItemTypeCategory>, sort: SortField, order: SortOrder, livingAtlasGroupId?: string, groupIds?: string[], folderId?: string, search?: string, isMore?: boolean) => ISearchOptions;
    getPortalUrl: () => string;
    fetchLivingAtlasGroupId: () => Promise<string>;
    getWhetherItemSelected: (item: IItemWithPortalUrl) => boolean;
    getWhetherItemPartSelected: (item: IItemWithPortalUrl) => boolean;
    getWhetherItemLoading: (item: IItemWithPortalUrl) => boolean;
    onScroll: (e: any) => void;
    onToggleDetail: (e: React.MouseEvent<HTMLElement>, item: IItemWithPortalUrl) => void;
    onToggleDetailPage: (e: React.MouseEvent<HTMLElement>) => void;
    onCloseDetailClicked: () => void;
    onDetailItemAdd: (e: React.MouseEvent<HTMLElement>, item: IItemWithPortalUrl) => Promise<void>;
    onAdd: (e: React.MouseEvent<HTMLElement>, item: IItemWithPortalUrl) => Promise<void>;
    onRemove: (e: React.MouseEvent<HTMLElement>, item: IItemWithPortalUrl) => Promise<void>;
    getItemsByIds: (itemIds: ImmutableArray<string>) => Promise<IItemWithPortalUrl[]>;
    showDetailDrillInPage: () => boolean;
    disableRemove: (itemId: string) => boolean;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * A component to list portal [item](https://developers.arcgis.com/rest/users-groups-and-items/item.htm).
 */
export declare const ItemList: import("@emotion/styled").StyledComponent<Omit<ItemListProps & {
    intl: IntlShape;
}, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default ItemList;
