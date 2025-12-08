/** @jsx jsx */
import { React, ReactRedux, type LayoutItemConstructorProps, type IMThemeVariables } from 'jimu-core';
import type { DropHandlers } from '../../builder/types';
import { type LayoutProps, type StateToLayoutProps } from 'jimu-layouts/layout-runtime';
import { CanvasPane } from '../../builder/interactive/canvas-pane';
import { type FourSidesUnit } from 'jimu-ui';
type AccordionLayoutProps = LayoutProps & StateToLayoutProps & {
    singleMode: boolean;
    showToggleAll: boolean;
    expandByDefault: string;
    gap: number;
    padding: FourSidesUnit;
};
interface State {
    isDragover: boolean;
    expandedItems: string[];
}
declare class Layout extends React.PureComponent<AccordionLayoutProps, State> implements DropHandlers {
    ref: HTMLElement;
    canvasRef: HTMLCanvasElement;
    canvasPane: CanvasPane;
    boundingRect: DOMRect;
    isDragging: boolean;
    childRects: Array<DOMRect & {
        id: string;
    }>;
    domRect: DOMRect;
    resizingRect: Partial<DOMRect>;
    referenceId: string;
    builderTheme: IMThemeVariables;
    constructor(props: AccordionLayoutProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: AccordionLayoutProps): void;
    handleExpandedChange: (layoutItemId: string, expanded: boolean) => void;
    expandAll: () => void;
    collapseAll: () => void;
    handleItemResizeStart: (id: string, initWidth: number, initHeight: number) => void;
    handleItemResizeEnd: (id: string, x: number, y: number, dw: number, dh: number) => void;
    handleDragOver: (draggingItem: LayoutItemConstructorProps, draggingElement: HTMLElement, containerRect: Partial<DOMRect>, itemRect: Partial<DOMRect & {
        handlerRect?: DOMRect;
    }>) => void;
    handleToggleDragoverEffect: (value: boolean) => void;
    handleDrop: (draggingItem: LayoutItemConstructorProps, containerRect: DOMRect, itemRect: DOMRect & {
        handlerRect?: DOMRect;
    }) => void;
    collectBounds(id: string): Array<DOMRect & {
        id: string;
    }>;
    isEmpty(): boolean;
    createItem(itemId: string, index: number, layoutSetting: any): React.JSX.Element;
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
    gap: number;
    padding: FourSidesUnit;
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
    singleMode: boolean;
    showToggleAll: boolean;
    expandByDefault: string;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
