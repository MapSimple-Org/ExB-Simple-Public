/** @jsx jsx */
import { type AppInfo, type IntlShape, type IMThemeVariables } from 'jimu-core';
import { ListViewsItemType, SortField, SortOrder, type DropdownDataItem } from '../types/types';
export interface FilterItemsBarProps {
    isDetailView: boolean;
    itemType: ListViewsItemType;
    intl: IntlShape;
    theme: IMThemeVariables;
    selectedSortField?: SortField;
    selectedSortOrder?: SortOrder;
    count?: number;
    selectedApps?: AppInfo[];
    folderDropdownData?: DropdownDataItem[];
    groupDropdownData?: DropdownDataItem[];
    categoryDropdownData?: DropdownDataItem[];
    subCategoryDropdownData?: DropdownDataItem[];
    selectedFolder?: string;
    selectedGroup?: string;
    selectedCategory?: string;
    selectedSubCategory?: string;
    clearSelectedApps?: (selectedApps: AppInfo[]) => void;
    deleteSelectedApps?: (selectedApps: AppInfo[]) => void;
    onIsDetailViewChange?: (isDetail: boolean) => void;
    onSortChange?: (sortField: SortField, sortOrder: SortOrder) => void;
    onFolderChange?: (folderId: string) => void;
    onGroupChange?: (groupId: string) => void;
    onCategoryChange?: (category: string) => void;
    onSubCategoryChange?: (subCategory: string) => void;
    className?: string;
}
export declare const FilterItemsBar: (props: FilterItemsBarProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare function getSortOderBySortField(sortField: SortField): SortOrder;
