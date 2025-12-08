import { React, type IntlShape, type privilegeUtils } from 'jimu-core';
import type * as JimuForBuilder from 'jimu-for-builder';
import type * as JimuForBuilderService from 'jimu-for-builder/service';
import type { AppItem, DropdownDataItem, ListViewsItemType } from '../../types/types';
interface Props {
    apps: AppItem[];
    selectedApps: AppItem[];
    folderUrl: string;
    portalUrl: string;
    itemType: ListViewsItemType;
    isSelectable: boolean;
    showSkeleton: boolean;
    jimuForBuilder: typeof JimuForBuilder;
    jimuForBuilderService: typeof JimuForBuilderService;
    createOnly?: boolean;
    intl?: IntlShape;
    allFavoritesIdData?: string[];
    updateGroupItemId?: string[];
    capabilities?: privilegeUtils.Capabilities;
    folderListData?: DropdownDataItem[];
    hasPrivilegeCheckCompleted?: boolean;
    innerRef?: React.RefObject<HTMLDivElement>;
    switchListView: (isDetail: boolean) => void;
    onSelectedAppsChange: (selectedApps: AppItem[]) => void;
    updateAppList: (apps: AppItem, appIndex: number) => void;
    deleteSelectedApps: (selectedApps: AppItem[]) => void;
    crateAppByTemplate?: (appInfo: AppItem) => void;
}
interface State {
    tooltipOpen: boolean;
}
export declare class ListViewsListView extends React.PureComponent<Props, State> {
    context: any;
    static contextType: React.Context<{
        deleteApps: (appIds: string[]) => any;
        refreshList: () => any;
        duplicateAppItem: (appInfo: AppItem) => any;
        createApp: (appInfo: AppItem) => any;
        favoriteToggle: (isFavorite: boolean, itemId: string) => Promise<boolean>;
        getFolderList: () => any;
        checkAndShowReadOnlyRemind: () => any;
        theme: any;
        skeletonNum: any;
    }>;
    constructor(props: any);
    renderSkeleton: () => any[];
    onAddApp: (app: AppItem) => void;
    onRemoveApp: (app: AppItem) => void;
    getViewContent(): any;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
