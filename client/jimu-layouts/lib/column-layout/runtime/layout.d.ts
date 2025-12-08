/** @jsx jsx */
import { React, ReactRedux, Immutable } from 'jimu-core';
import type { LayoutProps, StateToLayoutProps, ColumnLayoutSetting } from '../../types';
declare class Layout extends React.PureComponent<LayoutProps & StateToLayoutProps> {
    ref: React.RefObject<HTMLDivElement>;
    constructor(props: any);
    createItem(itemId: string, index: number, layoutSetting: ColumnLayoutSetting): import("@emotion/react/jsx-runtime").JSX.Element;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof Layout, {
    style?: any;
    visible?: boolean;
    layouts: Immutable.ImmutableObjectMixin<import("jimu-core").SizeModeLayoutJson> & {
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
    isItemAccepted?: (item: import("jimu-core").LayoutItemConstructorProps, isReplacePlaceholder: boolean) => boolean;
    ignoreMinHeight?: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
