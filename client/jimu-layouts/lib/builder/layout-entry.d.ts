/** @jsx jsx */
import { React, ReactRedux, type LayoutItemConstructorProps } from 'jimu-core';
import { type LayoutProps, type StateToLayoutProps } from 'jimu-layouts/layout-runtime';
declare const enum LayoutEntryMode {
    ChooseLayoutType = 0,
    RenderLayout = 1
}
interface State {
    mode: LayoutEntryMode;
}
declare class LayoutEntry extends React.Component<LayoutProps & StateToLayoutProps, State> {
    layoutComponent: any;
    state: State;
    constructor(props: LayoutProps & StateToLayoutProps);
    shouldComponentUpdate(nextProps: LayoutProps): boolean;
    onLayoutTypeSelected: () => void;
    switchToChoosingMode: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof LayoutEntry, {
    style?: any;
    visible?: boolean;
    layouts: import("seamless-immutable").ImmutableObjectMixin<import("jimu-core").SizeModeLayoutJson> & {
        readonly [x: string]: string;
    };
    className?: string;
    children?: React.ReactNode;
    ref?: React.Ref<LayoutEntry>;
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
export declare function defaultWidgetFilter(item: LayoutItemConstructorProps): boolean;
