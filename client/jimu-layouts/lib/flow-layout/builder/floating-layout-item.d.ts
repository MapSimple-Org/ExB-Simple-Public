/** @jsx jsx */
import { React, ReactRedux, type IMLayoutItemJson, type IMSizeModeLayoutJson, type IMThemeVariables, type LayoutItemConstructorProps } from 'jimu-core';
import { type LayoutItemProps, type PageContextProps, type StateToLayoutItemProps } from 'jimu-layouts/layout-runtime';
interface OwnProps {
    layouts: IMSizeModeLayoutJson;
    layoutItem: IMLayoutItemJson;
    builderTheme: IMThemeVariables;
    index: number;
    total: number;
    gutter: number;
    formatMessage: (id: string) => string;
    children?: any;
    onDropAtBoundary: (draggingItem: LayoutItemConstructorProps, itemRect: DOMRect, insertIndex: number) => void;
}
interface State {
    isResizing: boolean;
    dx: number;
    dy: number;
    dw: number;
    dh: number;
}
declare class FloatingLayoutItem extends React.PureComponent<LayoutItemProps & StateToLayoutItemProps & OwnProps, State> {
    domRect: DOMRect;
    state: State;
    pageContext: PageContextProps;
    initWidth: number;
    initHeight: number;
    onResizeStart: (id: string, initWidth: number, initHeight: number) => void;
    onResizing: (id: string, x: number, y: number, dw: number, dh: number) => void;
    onResizeEnd: (id: string, x: number, y: number, dw: number, dh: number, shiftKey?: boolean) => void;
    calculatePosition(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof FloatingLayoutItem, {
    style?: React.CSSProperties;
    index: number;
    layouts: import("seamless-immutable").ImmutableObjectMixin<import("jimu-core").SizeModeLayoutJson> & {
        readonly [x: string]: string;
    };
    className?: string;
    children?: any;
    ref?: React.Ref<FloatingLayoutItem>;
    aspectRatio?: number;
    key?: React.Key | null | undefined;
    onClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    draggable?: boolean;
    onDoubleClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    layoutId: string;
    layoutItemId: string;
    total: number;
    resizable?: boolean;
    autoWidth?: boolean;
    gutter: number;
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
    formatMessage: (id: string) => string;
    builderTheme: import("seamless-immutable").ImmutableObjectMixin<import("jimu-theme").ThemeVariable> & {
        readonly uri?: string;
        readonly darkTheme?: boolean;
        readonly coloration?: import("jimu-core").ThemeColorationType;
        readonly colorationVariants?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeColorationVariants>;
        readonly typography?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeTypography>;
        readonly colors?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeAllColors>;
        readonly sizes?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeSizes>;
        readonly borderRadiuses?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeBorderRadiuses>;
        readonly boxShadows?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeBoxShadows>;
        readonly focusedStyles?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeFocusedStyles>;
        readonly surfaces?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeSurfaces>;
        readonly header?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeHeader>;
        readonly footer?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeFooter>;
        readonly body?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeBody>;
        readonly link?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeLink>;
        readonly border?: import("seamless-immutable").ImmutableObject<import("jimu-ui").BorderStyle>;
        readonly components?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeComponents>;
        readonly arcgis?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeArcGIS>;
        readonly breakpoints: import("seamless-immutable").ImmutableObject<import("jimu-theme").Breakpoints>;
        readonly src?: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeSourceOptions>;
        readonly ref: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeReference>;
        readonly sys: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeSystem>;
        readonly mixin?: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeMixin>;
        readonly comp?: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeComponents<import("jimu-theme").Theme>>;
    };
    onDropAtBoundary: (draggingItem: LayoutItemConstructorProps, itemRect: DOMRect, insertIndex: number) => void;
    layoutItem: IMLayoutItemJson;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
