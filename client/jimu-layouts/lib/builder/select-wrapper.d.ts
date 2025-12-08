/** @jsx jsx */
import { React, ReactRedux, type IMLayoutItemJson, type IntlShape, type IMWidgetJson, type ImmutableArray, type IMSectionNavInfo, type SerializedStyles } from 'jimu-core';
import { type ToolbarConfig, type PageContextProps } from 'jimu-layouts/layout-runtime';
import type { FlipOptions, ShiftOptions } from 'jimu-ui';
interface Props {
    layoutId: string;
    layoutItem: IMLayoutItemJson;
    top?: boolean;
    left?: boolean;
    right?: boolean;
    bottom?: boolean;
    resizable?: boolean;
    draggable?: boolean;
    forbidToolbar?: boolean;
    toolItems?: ToolbarConfig;
    showDefaultTools?: boolean;
    selected: boolean;
    autoScroll?: boolean;
    isInlineEditing: boolean;
    isFunctionalWidget: boolean;
    hasEmbeddedLayout: boolean;
    isSection: boolean;
    views?: ImmutableArray<string>;
    isBlock?: boolean;
    hasExtension?: boolean;
    widgetJson?: IMWidgetJson;
    widgetState?: any;
    rotate?: number;
}
interface StateToProps {
    lockLayout: boolean;
    isDesignMode: boolean;
    isExpressMode: boolean;
    sectionNavInfo: IMSectionNavInfo;
}
interface State {
    selected: boolean;
    updateIndex: number;
}
interface IntlProps {
    intl: IntlShape;
}
export declare class SelectWrapper extends React.PureComponent<Props & IntlProps & StateToProps, State> {
    ref: HTMLElement;
    pageContext: PageContextProps;
    screenGroupInfo: string;
    keyBindings: {
        [key: string]: any;
    };
    shiftOptions: ShiftOptions;
    flipOptions: FlipOptions;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props & StateToProps): void;
    private doScroll;
    scrollIntoView(): void;
    formatMessage: (id: string, values?: any) => string;
    getStyle(): SerializedStyles;
    isMac: () => boolean;
    getKeyboardComponent(): React.JSX.Element;
    copyItem: () => void;
    deleteSelectedItem: () => void;
    isResizable(): boolean;
    showToolbar(): boolean;
    render(): React.JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<React.FC<import("react-intl").WithIntlProps<any>> & {
    WrappedComponent: React.ComponentType<any>;
}, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    layoutId: string;
    layoutItem: IMLayoutItemJson;
    top?: boolean;
    left?: boolean;
    right?: boolean;
    bottom?: boolean;
    resizable?: boolean;
    draggable?: boolean;
    forbidToolbar?: boolean;
    toolItems?: ToolbarConfig;
    showDefaultTools?: boolean;
    selected: boolean;
    autoScroll?: boolean;
    isInlineEditing: boolean;
    isFunctionalWidget: boolean;
    hasEmbeddedLayout: boolean;
    isSection: boolean;
    views?: ImmutableArray<string>;
    isBlock?: boolean;
    hasExtension?: boolean;
    widgetJson?: IMWidgetJson;
    widgetState?: any;
    rotate?: number;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
