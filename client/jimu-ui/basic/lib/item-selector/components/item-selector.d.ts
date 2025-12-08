/** @jsx jsx */
import { React, type IntlShape, type ImmutableArray } from 'jimu-core';
import { type AdvancedSelectItem } from 'jimu-ui';
import type { IGroup } from '@esri/arcgis-rest-portal';
import { type ItemListProps } from './item-list';
import { ItemCategory, type ItemFolder, SortField, SortOrder, type IItemWithPortalUrl, ItemTypeCategory, type ItemCategoryInfo } from '../types';
/**
 * The ItemSelector props.
 */
export interface ItemSelectorProps extends Pick<ItemListProps, 'itemTypeCategory' | 'className' | 'mode' | 'portalUrl' | 'itemType' | 'selectedItems' | 'partSelectedItems' | 'loadingItems' | 'hideSingleLayer' | 'isMultiple' | 'detailReference' | 'onSelect' | 'onRemove' | 'afterToggleItemDetail' | 'disableRemoveItemsSelectedOnMount' | 'isSelectable' | 'disableDetailPopper' | 'allowAllSceneService' | 'disableDefaultSortSetting'> {
    /** @ignore */
    showItemTypeCategoryFilter?: boolean;
    /** @ignore */
    itemCategoriesInfo?: ItemCategoryInfo[];
    /**
     * @ignore
     * Whether or not to show content sort button in simple mode.
     */
    enableContentSortInSimpleMode?: boolean;
}
interface ExtraProps {
    /**
     * @ignore
     */
    intl: IntlShape;
}
interface State {
    searchValue: string;
    deferredSearchValue: string;
    selectedCategoryId: string;
    selectedItemTypeCategories: ImmutableArray<ItemTypeCategory>;
    selectedSortField: SortField;
    selectedSortOrder: SortOrder;
    selectedFolder: ItemFolder;
    selectedGroup: IGroup;
    isEnterOrSearchIconClicked: boolean;
    folders: ItemFolder[];
    groups: IGroup[];
    appServices: any;
    onlyShowItemDetail: IItemWithPortalUrl;
}
/**
 * The `ItemSelector` component allows an Experience author to select an AGOL/portal item for widgets. This is usually used in a settings panel.
 *
 * ```ts
 * import { ItemSelector } from 'jimu-ui/basic/item-selector'
 * ```
 */
export declare class _ItemSelector extends React.PureComponent<ItemSelectorProps & ExtraProps, State> {
    __unmount: boolean;
    itemCategories: {
        MY_CONTENT: string;
        MY_GROUP: string;
        MY_ORGANIZATION: string;
        PUBLIC: string;
        LIVING_ATLAS: string;
        CURATED: string;
    };
    defaultDisplayedItemCategories: ItemCategory[];
    sortFields: {
        modified: string;
        title: string;
        numViews: string;
    };
    itemTypeCategories: {
        value: any;
        label: any;
    }[];
    defaultSelectedFolder: ItemFolder;
    rootFolder: ItemFolder;
    defaultFolders: ItemFolder[];
    defaultSelectedGroup: IGroup;
    debounceSetSearchValue: (value: string) => void;
    constructor(props: ItemSelectorProps & ExtraProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: ItemSelectorProps): void;
    componentWillUnmount(): void;
    getShouldBeDisplayedItemCategories(): ItemCategoryInfo[];
    getGroups(): IGroup[];
    getFolders(): Promise<ItemFolder[]>;
    onCategoryIdChange: (id: string) => void;
    onSearchInputKeyDown: (evt: any) => void;
    enterOrSearchIsClicked: () => void;
    enterOrSearchIsUnclicked: () => void;
    setDebounceSearchValue: (value: string) => void;
    onSearchChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
    onSortFieldChange: (e: any) => void;
    onFolderChange: (e: any) => void;
    onGroupChange: (e: any) => void;
    onSortOrderChange: () => void;
    onSelectedItemTypeCategoriesChange: (valueObj: AdvancedSelectItem[]) => void;
    onItemAdded: (allSelectedItems: IItemWithPortalUrl[], latestSelectedItem?: IItemWithPortalUrl) => Promise<void>;
    onItemRemoved: (allSelectedItems: IItemWithPortalUrl[], latestRemovedItem?: IItemWithPortalUrl) => void;
    afterToggleItemDetail: (item: IItemWithPortalUrl) => void;
    GroupSelect: ({ size, groups, selectedGroup, onGroupChange }: {
        size: "sm" | "default";
        selectedGroup: IGroup;
        groups: IGroup[];
        onGroupChange: any;
    }) => import("@emotion/react/jsx-runtime").JSX.Element;
    customDropdownButtonContent: (selectedItems: AdvancedSelectItem[]) => import("@emotion/react/jsx-runtime").JSX.Element;
    getValidItemTypeCategories: () => {
        value: any;
        label: any;
    }[];
    isItemTypeCategoryValid: (itemTypeCategory: ItemTypeCategory) => boolean;
    getItemCategoryCustomLabel: (info: ItemCategoryInfo) => string;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * A component to select portal [item](https://developers.arcgis.com/rest/users-groups-and-items/item.htm).
 */
export declare const ItemSelector: React.FC<import("react-intl").WithIntlProps<ItemSelectorProps>> & {
    WrappedComponent: React.ComponentType<ItemSelectorProps>;
};
export default ItemSelector;
