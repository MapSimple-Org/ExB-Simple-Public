/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
import type { SitePrivileges, AppItem, DropdownDataItem, ListViewsItemType } from '../../types/types';
import type * as JimuForBuilderService from 'jimu-for-builder/service';
interface State {
    isOpen: boolean;
    isShownEditInfo: boolean;
    isDescriptionEditorFocus: boolean;
    isOpenDownloadAppModal: boolean;
}
interface Props {
    isOwner: boolean;
    portalUrl: string;
    appItem: AppItem;
    itemType: ListViewsItemType;
    folderUrl: string;
    editPrivileges: SitePrivileges;
    isPublish: boolean;
    jimuForBuilderService: typeof JimuForBuilderService;
    className?: string;
    intl?: IntlShape;
    folderListData: DropdownDataItem[];
    appIndex: number;
    deleteSelectedApps: (selectedApps: AppItem[]) => void;
    updateAppList: (apps: AppItem, appIndex: number) => void;
}
export declare class ListViewsEditDropdown extends React.PureComponent<Props, State> {
    moreButtonRef: any;
    editInfoStyle: {
        width: string;
        height: string;
        maxWidth: string;
        margin: number;
    };
    constructor(props: any);
    getStyle: () => import("jimu-core").SerializedStyles;
    stopPropagationAndDefault: () => void;
    viewDetails: () => void;
    showEditInfo: () => void;
    getUrlOfItemDetails: () => string;
    onEditInfoCancel: () => void;
    onEditInfoOk: () => void;
    deleteToggle: () => void;
    setDescriptionFocusStatus: (isFocus?: boolean) => void;
    editInfoModalClick: (e: any) => void;
    onDownloadAppModalOpen: () => void;
    onDownloadAppModalClose: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
