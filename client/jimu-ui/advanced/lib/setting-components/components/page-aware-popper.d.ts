/** @jsx jsx */
import { type PopperProps } from 'jimu-ui';
import { React, ReactRedux, type BrowserSizeMode, type IMThemeVariables } from 'jimu-core';
interface StateToPopperProps {
    pageId: string;
    sizemode: BrowserSizeMode;
    dispatch?: any;
}
declare class PageAwarePopper extends React.PureComponent<PopperProps & StateToPopperProps & {
    theme?: IMThemeVariables;
}> {
    componentDidUpdate(prevProps: PopperProps & StateToPopperProps): void;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof PageAwarePopper, {
    theme?: IMThemeVariables;
    style?: React.CSSProperties;
    version?: number;
    className?: string;
    children: React.ReactNode;
    ref?: React.Ref<PageAwarePopper>;
    offset?: [number, number];
    shape?: "none" | "shape1" | "shape2";
    open: boolean;
    zIndex?: number;
    key?: React.Key | null | undefined;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    autoFocus?: boolean;
    tabIndex?: number;
    role?: React.AriaRole;
    'aria-modal'?: boolean;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    placement?: import("jimu-ui").Placement | import("jimu-ui").AutoPlacement;
    toggle?: (evt?: React.MouseEvent<any> | React.TouchEvent<any> | React.KeyboardEvent<any>, reason?: import("jimu-ui").OverlayDismissReason) => any;
    disableOverlayManager?: boolean;
    disableActivateOverlay?: boolean;
    disablePortal?: boolean;
    trapFocus?: boolean;
    overflowHidden?: boolean;
    strategy?: import("jimu-ui").Strategy;
    arrowOptions?: import("jimu-ui").ArrowStyleOptions | boolean;
    unstyled?: boolean;
    arrowAfterContent?: boolean;
    reference: import("jimu-ui").TargetType;
    autoUpdate?: boolean;
    inlineOptions?: import("@floating-ui/core").InlineOptions | boolean;
    hideOptions?: boolean | {
        padding?: import("@floating-ui/utils").Padding;
        strategy?: "referenceHidden" | "escaped";
        rootBoundary?: import("@floating-ui/core").RootBoundary;
        elementContext?: import("@floating-ui/core").ElementContext;
        altBoundary?: boolean;
        boundary?: import("@floating-ui/dom").Boundary;
    } | {
        padding?: import("@floating-ui/utils").Padding;
        strategy?: "referenceHidden" | "escaped";
        rootBoundary?: import("@floating-ui/core").RootBoundary;
        elementContext?: import("@floating-ui/core").ElementContext;
        altBoundary?: boolean;
        boundary?: import("@floating-ui/dom").Boundary;
    }[];
    shiftOptions?: boolean | {
        padding?: import("@floating-ui/utils").Padding;
        rootBoundary?: import("@floating-ui/core").RootBoundary;
        elementContext?: import("@floating-ui/core").ElementContext;
        altBoundary?: boolean;
        mainAxis?: boolean;
        crossAxis?: boolean;
        limiter?: {
            fn: (state: import("@floating-ui/core").MiddlewareState) => import("@floating-ui/utils").Coords;
            options?: any;
        };
        boundary?: import("@floating-ui/dom").Boundary;
    };
    flipOptions?: boolean | {
        padding?: import("@floating-ui/utils").Padding;
        rootBoundary?: import("@floating-ui/core").RootBoundary;
        elementContext?: import("@floating-ui/core").ElementContext;
        altBoundary?: boolean;
        mainAxis?: boolean;
        crossAxis?: boolean | "alignment";
        fallbackPlacements?: Array<import("jimu-ui").Placement>;
        fallbackStrategy?: "bestFit" | "initialPlacement";
        fallbackAxisSideDirection?: "none" | "start" | "end";
        flipAlignment?: boolean;
        boundary?: import("@floating-ui/dom").Boundary;
    };
    autoPlacementOptions?: boolean | {
        padding?: import("@floating-ui/utils").Padding;
        rootBoundary?: import("@floating-ui/core").RootBoundary;
        elementContext?: import("@floating-ui/core").ElementContext;
        altBoundary?: boolean;
        crossAxis?: boolean;
        alignment?: import("@floating-ui/utils").Alignment | null;
        autoAlignment?: boolean;
        allowedPlacements?: Array<import("jimu-ui").Placement>;
        boundary?: import("@floating-ui/dom").Boundary;
    };
    offsetOptions?: import("jimu-ui").OffsetOptions | [number, number] | boolean;
    sizeOptions?: boolean | {
        padding?: import("@floating-ui/utils").Padding;
        rootBoundary?: import("@floating-ui/core").RootBoundary;
        elementContext?: import("@floating-ui/core").ElementContext;
        altBoundary?: boolean;
        boundary?: import("@floating-ui/dom").Boundary;
        apply?: (args: import("@floating-ui/dom").MiddlewareState & {
            availableWidth: number;
            availableHeight: number;
        }) => void | Promise<void>;
    };
    middleware?: import("@floating-ui/dom").Middleware[];
    keepMount?: boolean;
    avoidNestedToggle?: boolean;
    delayToggle?: number;
    showArrow?: boolean;
    arrowStyle?: import("jimu-ui").ArrowStyle;
    modifiers?: any[];
    flipPlacement?: boolean;
    popperNodeRef?: React.Ref<HTMLDivElement>;
    listenContextPopperVersion?: boolean;
    referenceHiddenVisibility?: boolean;
    forceLatestFocusElements?: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
