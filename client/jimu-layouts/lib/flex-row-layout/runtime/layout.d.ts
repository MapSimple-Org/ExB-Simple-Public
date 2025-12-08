/** @jsx jsx */
import { React, ReactRedux } from 'jimu-core';
import type { LayoutProps, StateToLayoutProps } from '../../types';
declare class Layout extends React.PureComponent<LayoutProps & StateToLayoutProps> {
    createItem(itemId: string, index: number): React.JSX.Element;
    isEmpty(): boolean;
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
    isItemAccepted?: (item: import("jimu-core").LayoutItemConstructorProps, isReplacePlaceholder: boolean) => boolean;
    ignoreMinHeight?: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
