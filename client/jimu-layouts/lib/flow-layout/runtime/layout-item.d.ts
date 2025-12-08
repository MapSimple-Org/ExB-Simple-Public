/** @jsx jsx */
import { React, ReactRedux, type IMLayoutItemJson, type SerializedStyles } from 'jimu-core';
import type { LayoutItemProps, FlowLayoutItemSetting } from '../../types';
import { type StateToFlowItemProps } from '../layout-utils';
interface OwnProps {
    index: number;
    layoutItem: IMLayoutItemJson;
    gutter: number;
}
declare class FlowLayoutItem extends React.PureComponent<LayoutItemProps & StateToFlowItemProps & OwnProps> {
    autoHeight: boolean;
    componentDidMount(): void;
    calHeight(itemSetting: FlowLayoutItemSetting): string;
    getStyle(itemSetting: FlowLayoutItemSetting): [SerializedStyles, string];
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof FlowLayoutItem, {
    style?: React.CSSProperties;
    index: number;
    className?: string;
    children?: any;
    ref?: React.Ref<FlowLayoutItem>;
    aspectRatio?: number;
    key?: React.Key | null | undefined;
    onClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    draggable?: boolean;
    onDoubleClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    layoutId: string;
    layoutItemId: string;
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
    layoutItem: import("seamless-immutable").ImmutableObjectMixin<import("jimu-core").LayoutItemJson> & {
        readonly id?: string;
        readonly bbox?: import("seamless-immutable").ImmutableObject<import("jimu-core").BoundingBox>;
        readonly type?: import("jimu-core").LayoutItemType;
        readonly setting?: any;
        readonly widgetId?: string;
        readonly sectionId?: string;
        readonly screenGroupId?: string;
        readonly isPlaceholder?: boolean;
        readonly isPending?: boolean;
        readonly parent?: string;
        readonly children?: import("seamless-immutable").ImmutableArray<string>;
    };
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
