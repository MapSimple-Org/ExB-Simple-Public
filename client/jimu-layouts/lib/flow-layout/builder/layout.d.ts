/** @jsx jsx */
import { React, ReactRedux, type LayoutInfo, type LayoutItemConstructorProps, type IMThemeVariables, type IMLayoutItemJson, type IMAppConfig, type LayoutTransformFunc, type SerializedStyles } from 'jimu-core';
import { type LayoutProps, type StateToLayoutProps, type PageContextProps, type FlowLayoutSetting } from 'jimu-layouts/layout-runtime';
import type { DropHandlers } from '../../builder/types';
import { CanvasPane } from '../../builder/interactive/canvas-pane';
interface State {
    isDragover: boolean;
    isLoadingTemplate: boolean;
}
declare class Layout extends React.PureComponent<LayoutProps & StateToLayoutProps, State> implements DropHandlers {
    ref: React.RefObject<HTMLDivElement>;
    widgetListBtnRef: HTMLElement;
    canvasRef: HTMLCanvasElement;
    canvasPane: CanvasPane;
    boundingRect: DOMRect;
    isDragging: boolean;
    childRects: Array<DOMRect & {
        id: string;
    }>;
    domRect: DOMRect;
    resizingRect: DOMRect;
    referenceId: string;
    maxPageWidth: number;
    builderTheme: IMThemeVariables;
    pageContext: PageContextProps;
    layoutTransform: LayoutTransformFunc;
    state: State;
    blockReference: HTMLDivElement;
    blockReference2: HTMLDivElement;
    templateReference: HTMLDivElement;
    mousedownX: number;
    mousedownY: number;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(): void;
    handleActivate: (e: React.MouseEvent) => void;
    handleMouseDown: (e: any) => void;
    handleDragOver: (draggingItem: LayoutItemConstructorProps, draggingElement: HTMLElement, containerRect: Partial<DOMRect>, itemRect: Partial<DOMRect & {
        handlerRect?: DOMRect;
    }>, clientX: number, clientY: number) => void;
    handleToggleDragoverEffect: (value: boolean, draggingItem: LayoutItemConstructorProps) => void;
    handleDrop: (draggingItem: LayoutItemConstructorProps, containerRect: DOMRect, itemRect: DOMRect & {
        handlerRect?: DOMRect;
    }) => void;
    addWidgetToLayout(draggingItem: LayoutItemConstructorProps, containerRect: DOMRect, itemRect: DOMRect, width: number, insertIndex: number, appConfig?: IMAppConfig): void;
    handleDropAtBoundary: (draggingItem: LayoutItemConstructorProps, itemRect: DOMRect, insertIndex: number) => void;
    collectBounds(layoutInfo: LayoutInfo): Array<DOMRect & {
        id: string;
    }>;
    createItem(item: IMLayoutItemJson, total: number, index: number, layoutSetting: FlowLayoutSetting): React.JSX.Element;
    onWidgetItemSelected: (item: LayoutItemConstructorProps) => void;
    handleBlockTemplateSelected: (template: any) => void;
    handleScreenTemplateSelected: (template: any) => void;
    handlePageTemplateSelected: (templatePageJson: any) => void;
    getActionStyle(): SerializedStyles;
    getStyle(): SerializedStyles;
    createActions(blockOnly: boolean): React.JSX.Element;
    render(): React.JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof Layout, {
    style?: any;
    visible?: boolean;
    layouts: import("seamless-immutable").ImmutableObjectMixin<import("jimu-core").SizeModeLayoutJson> & {
        readonly [x: string]: string;
    };
    className?: string;
    children?: React.ReactNode;
    ref?: React.Ref<Layout>;
    key?: React.Key | null | undefined;
    onItemClick?: (e: any, widgetId: string) => void;
    showDefaultTools?: boolean;
    isInSection?: boolean;
    isInWidget?: boolean;
    isRepeat?: boolean;
    isPageItem?: boolean;
    itemDraggable?: boolean;
    itemResizable?: boolean;
    itemSelectable?: boolean;
    droppable?: boolean;
    isItemAccepted?: (item: LayoutItemConstructorProps, isReplacePlaceholder: boolean) => boolean;
    ignoreMinHeight?: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
