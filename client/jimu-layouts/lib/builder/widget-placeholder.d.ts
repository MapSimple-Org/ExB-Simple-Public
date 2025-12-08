/** @jsx jsx */
import { React, type IMSizeModeLayoutJson, BrowserSizeMode, type LayoutItemConstructorProps, type IMThemeVariables, type IntlShape, ReactRedux } from 'jimu-core';
import { type PageContextProps, type LayoutItemProps, type LayoutContextProps } from 'jimu-layouts/layout-runtime';
interface IntlProps {
    intl: IntlShape;
}
interface OtherProps {
    browserSizeMode: BrowserSizeMode;
    isMainSizeMode: boolean;
    isTemplate: boolean;
    placeholderId: number;
    currentDialogId: string;
}
interface State {
    showModal: boolean;
    isBusy: boolean;
}
export declare class _WidgetPlaceholder extends React.PureComponent<LayoutItemProps & IntlProps & OtherProps, State> {
    ref: HTMLElement;
    btnRef: HTMLElement;
    pageContext: PageContextProps;
    layoutContext: LayoutContextProps;
    fakeLayouts: IMSizeModeLayoutJson;
    constructor(props: any);
    componentDidUpdate(prevProps: Readonly<LayoutItemProps & IntlProps & OtherProps>): void;
    getStyle(builderTheme: IMThemeVariables): import("jimu-core").SerializedStyles;
    toggleModal: (e: any) => void;
    closeModal: () => void;
    toggleDragoverEffect: (isDragover: boolean, draggingItem: LayoutItemConstructorProps) => void;
    onDrop: (draggingItem: LayoutItemConstructorProps) => void;
    setContent: (item: LayoutItemConstructorProps) => void;
    handleSyncChange: (newPlaceholderId: number) => void;
    getPopupStyle(): import("jimu-core").SerializedStyles;
    getModalStyle(): import("jimu-core").SerializedStyles;
    isItemAccepted: (item: LayoutItemConstructorProps) => boolean;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const WidgetPlaceholder: React.FC<import("react-intl").WithIntlProps<{
    style?: React.CSSProperties;
    className?: string;
    children?: any;
    ref?: React.Ref<_WidgetPlaceholder>;
    aspectRatio?: number;
    key?: React.Key | null | undefined;
    onClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    draggable?: boolean;
    onDoubleClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    layoutId: string;
    layoutItemId: string;
    resizable?: boolean;
    autoWidth?: boolean;
    intl: IntlShape;
    parentRef?: React.RefObject<HTMLElement>;
    selectable?: boolean;
    forbidContextMenu?: boolean;
    forbidToolbar?: boolean;
    showDefaultTools?: boolean;
    isInSection?: boolean;
    trailOrder?: number;
    forceAspectRatio?: boolean;
    resizeObserver?: ResizeObserver;
    autoHeight?: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>> & {
    WrappedComponent: React.ComponentType<{
        style?: React.CSSProperties;
        className?: string;
        children?: any;
        ref?: React.Ref<_WidgetPlaceholder>;
        aspectRatio?: number;
        key?: React.Key | null | undefined;
        onClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
        draggable?: boolean;
        onDoubleClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
        layoutId: string;
        layoutItemId: string;
        resizable?: boolean;
        autoWidth?: boolean;
        intl: IntlShape;
        parentRef?: React.RefObject<HTMLElement>;
        selectable?: boolean;
        forbidContextMenu?: boolean;
        forbidToolbar?: boolean;
        showDefaultTools?: boolean;
        isInSection?: boolean;
        trailOrder?: number;
        forceAspectRatio?: boolean;
        resizeObserver?: ResizeObserver;
        autoHeight?: boolean;
        context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
        store?: import("redux").Store;
    }>;
};
export {};
