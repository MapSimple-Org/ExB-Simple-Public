/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape, type ImmutableObject } from 'jimu-core';
import type * as PortalComponentsTypes from 'jimu-ui/advanced/portal-components';
import { type AppItem, type DropdownDataItem, ListViewsItemType } from '../../types/types';
import type * as JimuForBuilderService from 'jimu-for-builder/service';
interface Props {
    appItem: AppItem;
    portalUrl: string;
    folderUrl: string;
    itemType: ListViewsItemType;
    jimuForBuilderService: typeof JimuForBuilderService;
    isDescriptionEditorFocus?: boolean;
    setDescriptionFocusStatus?: (boolean: any) => void;
    onEditInfoCancel?: () => void;
    onEditInfoOk?: () => void;
    checkAndShowReadOnlyRemind?: () => boolean;
    intl?: IntlShape;
    folderListData: DropdownDataItem[];
    appIndex: number;
    updateAppList: (apps: AppItem, appIndex: number) => void;
}
interface States {
    localAppItem: ImmutableObject<AppItem>;
    currentTitleInput: string;
    currentDescribeInput: string;
    loading: boolean;
    files: any;
    buttonWidth: string;
    isShowAlertPopup: boolean;
    isDescriptionEditorEnabled: boolean;
    RichTextEditor: any;
    tags: string[];
    userTags: string[];
    summary: string;
    modules?: any;
    preserve?: any;
    ownerFolder?: string;
    errorTipsText?: string;
    showClassification: boolean;
    classificationValid: boolean;
    tempClassification: PortalComponentsTypes.ClassificationValues;
    showClassificationConfig: boolean;
    PortalComponents: typeof PortalComponentsTypes;
}
export declare class _ListViewsEditInfo extends React.PureComponent<Props & {
    theme: IMThemeVariables;
}, States> {
    okButton: HTMLButtonElement;
    cancelButton: HTMLButtonElement;
    closeButton: HTMLButtonElement;
    autoFocusTimeout: any;
    fileInput: any;
    isUpdateThumbnail: boolean;
    thumbnailField: any;
    __unmount: boolean;
    supportedResourceSuffix: {
        IMAGE: string[];
    };
    classificationBannerTextId: string;
    editClassificationButton: HTMLButtonElement;
    classificationConfigElement: HTMLArcgisPortalClassificationConfigElement;
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
    componentDidMount(): void;
    getStyle(): import("jimu-core").SerializedStyles;
    getItemData: () => void;
    updateAppItem: (newAppItem: AppItem) => void;
    updateState: () => void;
    uploadThumbnail: () => Promise<boolean>;
    handleFilesChange: () => boolean;
    titleInputChange: (e: any, isBlur?: boolean) => void;
    describeInputChange: (html: string) => void;
    nls: (id: string, values?: {
        [key: string]: any;
    }) => string;
    onConfirm: () => Promise<void>;
    onBack: () => void;
    updateAppInfo: () => void;
    changeItemsFolder: () => Promise<boolean>;
    nameOnChange: (event: any) => void;
    getUserTags: () => void;
    getThumbnailUrl: () => string;
    alignButtonWidth: (buttonType: string, ref: HTMLButtonElement) => void;
    handleToggle: () => void;
    descriptionEditorFocus: (e: any) => void;
    editInfoContentClick: (e: any) => void;
    onTagInputChange: (data: string[]) => void;
    onSummaryChange: (e: any, isBlur?: boolean) => void;
    onFolderChange: (e: any) => void;
    getAlertPopupStyle: () => import("jimu-core").SerializedStyles;
    loadPortalComponents: () => void;
    onEditClassification: () => void;
    handleClassificationChange: (valid: boolean, values: PortalComponentsTypes.ClassificationValues) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const ListViewsEditInfo: React.ForwardRefExoticComponent<Pick<any, string | number | symbol> & {
    theme?: IMThemeVariables;
}>;
export {};
