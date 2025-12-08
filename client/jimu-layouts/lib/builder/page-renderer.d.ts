/** @jsx jsx */
import { React, type PageJson, ReactRedux, type ImmutableObject, BrowserSizeMode, PagePart, type IMHeaderJson, type IMFooterJson, type LayoutInfo, type IntlShape, type ClipboardItem, type DialogJson, type IMDialogJson, type IMThemeVariables, AppMode } from 'jimu-core';
import { type PageContextProps } from 'jimu-layouts/layout-runtime';
interface PageProps {
    intl: IntlShape;
    dialogId?: string;
    /**
     * store pages that have been rendered
     *
     * Only one page will be visible, all other pages will be hidden
     *  */
    pageStatus: ImmutableObject<{
        [pageId: string]: boolean;
    }>;
}
interface StateToProps {
    pages: ImmutableObject<{
        [pageId: string]: PageJson;
    }>;
    header: IMHeaderJson;
    headerVisible?: boolean;
    footer: IMFooterJson;
    footerVisible?: boolean;
    mainSizeMode: BrowserSizeMode;
    browserSizeMode: BrowserSizeMode;
    currentAppMode: AppMode;
    minHeight: number;
    activePagePart: PagePart;
    clipboardItem: ClipboardItem;
    dialogs: ImmutableObject<{
        [dlgId: string]: DialogJson;
    }>;
    openedDialogIds: string[];
    currentDialogId?: string;
    splashDialogJson: IMDialogJson;
    isSplashClosed: boolean;
    pageDialogId: string;
    pageDialogJson: IMDialogJson;
    isPageDlgClosed: boolean;
    urlDialogJson: IMDialogJson;
    showClassification: boolean;
    classification?: ImmutableObject<__esri.PortalItem['classification']>;
}
interface State {
    headerHeight: number;
    footerHeight: number;
    isResizing: boolean;
}
export declare class PageRenderer extends React.PureComponent<PageProps & StateToProps & {
    theme: IMThemeVariables;
}, State> {
    static displayName: string;
    pageRef: HTMLElement;
    pageContext: ImmutableObject<PageContextProps>;
    activeLayoutInfo: LayoutInfo;
    keyBindings: {
        [key: string]: any;
    };
    constructor(props: any);
    onResizeStart: () => void;
    onResizeEnd: () => void;
    updateHeaderHeight: (height: any) => void;
    updateFooterHeight: (height: any) => void;
    startPaste: () => void;
    isMac: () => boolean;
    componentDidUpdate(prevProps: PageProps): void;
    clearSelection: (e: any) => void;
    formatMessage: (id: string, values?: any) => string;
    getPageStyle(): import("jimu-core").SerializedStyles;
    updatePageContext(): void;
    onClassificationBannerReady: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
    renderHeader(): import("@emotion/react/jsx-runtime").JSX.Element;
    renderFooter(): import("@emotion/react/jsx-runtime").JSX.Element;
    renderPageBody(renderedPageId: string): import("@emotion/react/jsx-runtime").JSX.Element;
    isDialogViewOnly(dialogJson: any): boolean;
    renderDialog(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: React.FC<import("react-intl").WithIntlProps<{
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    intl: IntlShape;
    dialogId?: string;
    pageStatus: ImmutableObject<{
        [pageId: string]: boolean;
    }>;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>> & {
    WrappedComponent: React.ComponentType<{
        [x: string]: any;
        [x: number]: any;
        [x: symbol]: any;
        intl: IntlShape;
        dialogId?: string;
        pageStatus: ImmutableObject<{
            [pageId: string]: boolean;
        }>;
        context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
        store?: import("redux").Store;
    }>;
};
export default _default;
