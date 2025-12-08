import { React } from 'jimu-core';
import type { IntlShape, SerializedStyles, privilegeUtils } from 'jimu-core';
import { type AppItem, type SitePrivileges, type DropdownDataItem, ListViewsItemType } from '../types/types';
import { PublishStatus, AppSharedType } from '../types/types';
import type * as JimuForBuilder from 'jimu-for-builder';
import type * as JimuForBuilderService from 'jimu-for-builder/service';
interface State {
    tooltipOpen: boolean;
    itemSelected: boolean;
    showAlertPopup: boolean;
    publishStatus: PublishStatus;
    publishStatusText: string;
}
interface Props {
    itemIdx: number;
    appIndex: number;
    appItem: AppItem;
    folderUrl: string;
    portalUrl: string;
    itemType: ListViewsItemType;
    isSelectable: boolean;
    isSelected: boolean;
    jimuForBuilder: typeof JimuForBuilder;
    jimuForBuilderService: typeof JimuForBuilderService;
    intl?: IntlShape;
    createOnly?: boolean;
    allFavoritesIdData?: string[];
    updateGroupItemId?: string[];
    capabilities?: privilegeUtils.Capabilities;
    folderListData?: DropdownDataItem[];
    hasPrivilegeCheckCompleted?: boolean;
    deleteSelectedApps: (selectedApps: AppItem[]) => void;
    updateAppList: (app: AppItem, appIndex: number) => void;
    onAdd: (app: AppItem) => void;
    onRemove: (app: AppItem) => void;
    crateAppByTemplate?: (appInfo: AppItem) => void;
}
interface LimitJson {
    shareType: AppSharedType;
    tips: string;
}
interface NlsValues {
    [key: string]: any;
}
export declare class ListViewsAction extends React.PureComponent<Props, State> {
    constructor(props: any);
    componentDidUpdate(prevProps: Props, prevState: State): void;
    checkIsAppCanCreate: () => boolean;
    onCreateAppByTemplate: () => void;
    toggle: () => void;
    handleItemClick: () => boolean;
    stopPropagationAndDefault: (e: any) => void;
    getBuilderUrl: () => string;
    handleItemKeydown: (evt: any) => void;
    editTemplateClick: () => boolean;
    onCheckboxClick: (e: any) => void;
    onCheckboxKeyDown: (e: any) => void;
    getQueryString(key: string): string;
    checkIsOwner: () => boolean;
    viewDetails: (e: any) => void;
    handleToggle: () => void;
    getDetailUrl: () => string;
    getThumbnail: () => string;
    getPreviewTemplateAppUrl: () => string;
    getPreviewAppUrl: () => string;
    getShareState: (access: string) => LimitJson;
    getIconByShareType: (appShareType: AppSharedType) => import("@emotion/react/jsx-runtime").JSX.Element;
    getPublishStatus: (appItem: AppItem) => {
        publishStatus: PublishStatus;
        publishStatusText: string;
    };
    isHideEditDropBtn: () => boolean;
    nls: (id: string, values?: NlsValues) => string;
    getFavoriteStatus: (allFavoritesIdData: string[]) => boolean;
    judgeUserEditPrivileges: (updateGroupItemId?: string[]) => SitePrivileges;
    getAppVersionRemindString: () => string;
    getDisabledCreateButtonTooltipStyle(): SerializedStyles;
}
export {};
