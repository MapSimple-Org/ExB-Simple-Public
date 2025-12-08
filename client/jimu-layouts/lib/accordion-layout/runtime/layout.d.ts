/** @jsx jsx */
import { React, ReactRedux } from 'jimu-core';
import type { LayoutProps, StateToLayoutProps } from '../../types';
import { type FourSidesUnit } from 'jimu-ui';
type AccordionLayoutProps = LayoutProps & StateToLayoutProps & {
    singleMode: boolean;
    showToggleAll: boolean;
    expandByDefault: string;
    gap: number;
    padding: FourSidesUnit;
};
interface State {
    expandedItems: string[];
}
declare class Layout extends React.PureComponent<AccordionLayoutProps, State> {
    constructor(props: AccordionLayoutProps);
    handleExpandedChange: (layoutItemId: string, expanded: boolean) => void;
    expandAll: () => void;
    collapseAll: () => void;
    createItem(itemId: string): React.JSX.Element;
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
    isItemAccepted?: (item: import("jimu-core").LayoutItemConstructorProps, isReplacePlaceholder: boolean) => boolean;
    ignoreMinHeight?: boolean;
    singleMode: boolean;
    showToggleAll: boolean;
    expandByDefault: string;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
