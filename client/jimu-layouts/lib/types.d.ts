import type { React, IMLayoutItemJson, IMSizeModeLayoutJson, LayoutItemConstructorProps, IMLayoutJson, ImmutableArray, LayoutInfo, IMViewJson, IMWidgetJson, LayoutContextToolProps, IMSectionNavInfo, AnimationSetting, AnimationPlayMode, BrowserSizeMode, WidgetInitDragCallback, WidgetInitResizeCallback } from 'jimu-core';
import type { FourSidesUnit } from 'jimu-ui';
export interface Position {
    x?: number;
    y?: number;
    w: number;
    h: number;
}
export declare const enum OrderAdjustType {
    BringForward = 0,
    SendBackward = 1,
    BringToFront = 2,
    SendToBack = 3
}
export interface LayoutProps {
    layouts: IMSizeModeLayoutJson;
    className?: string;
    style?: any;
    isInSection?: boolean;
    isInWidget?: boolean;
    isRepeat?: boolean;
    isPageItem?: boolean;
    visible?: boolean;
    itemDraggable?: boolean;
    itemResizable?: boolean;
    itemSelectable?: boolean;
    droppable?: boolean;
    showDefaultTools?: boolean;
    isItemAccepted?: (item: LayoutItemConstructorProps, isReplacePlaceholder: boolean) => boolean;
    onItemClick?: (e: any, widgetId: string) => void;
    ignoreMinHeight?: boolean;
    children?: React.ReactNode;
}
export interface LayoutItemProps {
    layoutId: string;
    layoutItemId: string;
    parentRef?: React.RefObject<HTMLElement>;
    draggable?: boolean;
    resizable?: boolean;
    selectable?: boolean;
    forbidContextMenu?: boolean;
    forbidToolbar?: boolean;
    showDefaultTools?: boolean;
    isInSection?: boolean;
    className?: string;
    style?: React.CSSProperties;
    trailOrder?: number;
    onClick?: (e: any, layoutInfo: LayoutInfo) => void;
    onDoubleClick?: (e: any, layoutInfo: LayoutInfo) => void;
    forceAspectRatio?: boolean;
    aspectRatio?: number;
    resizeObserver?: ResizeObserver;
    children?: any;
    autoWidth?: boolean;
    autoHeight?: boolean;
}
export interface StateToLayoutProps {
    mainSizeMode: BrowserSizeMode;
    browserSizeMode: BrowserSizeMode;
    layout: IMLayoutJson;
}
export interface StateToLayoutItemProps {
    layoutItem: IMLayoutItemJson;
    selected?: boolean;
    autoScroll?: boolean;
    animationPreview?: boolean;
    hoverPreview?: boolean;
    playMode?: AnimationPlayMode;
    previewId?: number;
    watchViewportVisibility?: boolean;
}
export interface WidgetProps {
    widgetId: string;
    isClassLoaded: boolean;
    isInlineEditing: boolean;
    isFunctionalWidget: boolean;
    isInController: boolean;
    hasEmbeddedLayout: boolean;
    needHiddenState: boolean;
    useDragHandler: boolean;
    widgetState?: any;
    supportInlineEditing: boolean;
    supportRepeat: boolean;
    canCrossLayoutBoundary: boolean;
    rotate?: number;
    widgetStyle: any;
    hasExtension?: boolean;
    widgetJson?: IMWidgetJson;
    onInitResizeHandler?: WidgetInitResizeCallback;
    onInitDragHandler?: WidgetInitDragCallback;
}
export interface SectionProps {
    sectionId: string;
    views: ImmutableArray<string>;
    activeView?: IMViewJson;
    rotate?: number;
    sectionStyle: any;
    navInfo: IMSectionNavInfo;
    transition?: {
        type: string;
        direction?: string;
    };
    autoPlay?: boolean;
    interval?: number;
    loop?: boolean;
    focusable?: boolean;
}
export declare const COLS_IN_ONE_ROW = 12;
export declare const CONTEXT_MENU_ITEM_SIZE = 28;
export declare const CONTEXT_MENU_ICON_SIZE = 16;
export declare const MIN_LAYOUT_ITEM_SIZE = 16;
export declare const CLICK_TOLERANCE = 5;
export declare const DEFAULT_AUTOPLAY_INTERVAL = 3;
export declare enum LayoutZIndex {
    Auto = "auto",
    Normal = 0,
    BoundaryDropArea = 10,
    DragMoveTip = 20,
    HandlerTools = 30,
    DraggingItem = 40
}
export interface CommonLayoutSetting {
    className?: string;
    style?: any;
    order?: number;
    lockChildren?: boolean;
    lockDescendants?: boolean;
}
export interface CommonLayoutItemSetting {
    lockParent?: boolean;
    placeholderStyle?: any;
    style?: any;
    effect?: {
        [key: string]: AnimationSetting;
    };
    oneByOneEffect?: {
        [key: string]: AnimationSetting;
    };
    effectPlayMode?: AnimationPlayMode;
    hoverEffect?: {
        type: string;
        setting: any;
    };
    autoProps?: {
        left?: boolean;
        right?: boolean;
        top?: boolean;
        bottom?: boolean;
        width?: LayoutItemSizeModes;
        height?: LayoutItemSizeModes;
    };
    aspectRatio?: number | string;
    heightMode?: 'fit' | 'fixed' | 'ratio' | 'auto';
}
export interface FixedLayoutSetting extends CommonLayoutSetting {
    gridSize?: number;
}
export interface FlowLayoutSetting extends CommonLayoutSetting {
    gutter?: number;
}
export interface ColumnLayoutSetting extends CommonLayoutSetting {
    min: number;
    space: number;
    justifyContent?: string;
    overflowY?: boolean;
    padding?: {
        number: number[];
        unit: string;
    };
}
export interface FlexRowLayoutSetting extends CommonLayoutSetting {
    min: number;
    space: number;
    justifyContent?: string;
    overflowX?: boolean;
    padding?: {
        number: number[];
        unit: string;
    };
}
export interface GridLayoutSetting extends CommonLayoutSetting {
    rootItem: string;
    mainItemId?: string;
    resizable?: boolean;
    expandable?: boolean;
    splitSize?: number;
    splitColor?: string;
    paddingColor?: string;
    style?: {
        padding?: FourSidesUnit;
    };
}
export interface RowLayoutItemSetting extends CommonLayoutItemSetting {
    offsetX?: number;
    offsetY?: number;
    style: {
        alignSelf: 'flex-start' | 'flex-end' | 'center' | 'stretch';
    };
}
export interface RowLayoutSetting extends CommonLayoutSetting {
    space: number;
    style: {
        padding?: FourSidesUnit;
    };
}
export interface FlowLayoutItemSetting extends CommonLayoutItemSetting {
    isFloating?: boolean;
    floatingArea?: number;
    width?: number;
    offsetX?: number;
    offsetY?: number;
}
export declare enum LayoutItemSizeModes {
    Auto = "AUTO",
    Stretch = "STRETCH",
    Custom = "CUSTOM"
}
export interface FixedLayoutItemSetting extends CommonLayoutItemSetting {
    hCenter?: boolean;
    vCenter?: boolean;
    lockLayout?: boolean;
}
export interface ToolSettingPanelProps {
    layoutId: string;
    layoutItemId: string;
    widgetId?: string;
}
export interface ToolItemConfig {
    icon?: React.ComponentClass<React.SVGAttributes<SVGElement>> | ((props: LayoutContextToolProps) => React.ComponentClass<React.SVGAttributes<SVGElement>>);
    caret?: boolean;
    autoFlipIcon?: boolean;
    title?: string | ((props: LayoutContextToolProps & {
        formatMessage: (id: string, values?: any) => string;
    }) => string);
    size?: number;
    label?: string | ((props: LayoutContextToolProps & {
        formatMessage: (id: string, values?: any) => string;
    }) => string);
    disabled?: boolean | ((props: LayoutContextToolProps) => boolean);
    checked?: boolean | ((props: LayoutContextToolProps) => boolean);
    visible?: boolean | ((props: LayoutContextToolProps) => boolean);
    openWhenAdded?: boolean;
    rotate?: number;
    className?: string;
    onClick?: (props: LayoutContextToolProps, evt?: React.MouseEvent<any>) => void;
    onMouseEnter?: (props: LayoutContextToolProps, evt?: React.MouseEvent<any>) => void;
    onMouseLeave?: (props: LayoutContextToolProps, evt?: React.MouseEvent<any>) => void;
    settingPanel?: React.ComponentClass<ToolSettingPanelProps> | React.FunctionComponent<ToolSettingPanelProps>;
    widgetId?: string;
    separator?: boolean;
    extName?: string;
}
export type ToolbarConfig = Array<ToolItemConfig | ToolItemConfig[]>;
