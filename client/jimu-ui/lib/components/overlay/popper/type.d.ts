type ModifierPhases = 'beforeRead' | 'read' | 'afterRead' | 'beforeMain' | 'main' | 'afterMain' | 'beforeWrite' | 'write' | 'afterWrite';
type BasePlacement = 'top' | 'bottom' | 'right' | 'left';
type VariationPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end';
type AutoPlacement = 'auto' | 'auto-start' | 'auto-end';
type Placement = AutoPlacement | BasePlacement | VariationPlacement;
type PositioningStrategy = 'absolute' | 'fixed';
export interface VirtualElement {
    getBoundingClientRect: () => DOMRect;
    contextElement?: Element;
}
interface OptionsGeneric<TModifier> {
    placement: Placement;
    modifiers: TModifier[];
    strategy: PositioningStrategy;
    onFirstUpdate?: (arg0: Partial<State>) => void;
}
interface Rect {
    width: number;
    height: number;
    x: number;
    y: number;
}
interface Offsets {
    y: number;
    x: number;
}
interface StateRects {
    reference: Rect;
    popper: Rect;
}
interface SideObject {
    top: number;
    left: number;
    right: number;
    bottom: number;
}
type OffsetData = {
    [key in Placement]?: Offsets;
};
interface State {
    elements: {
        reference: Element | VirtualElement;
        popper: HTMLElement;
        arrow?: HTMLElement;
    };
    options: OptionsGeneric<any>;
    placement: Placement;
    strategy: PositioningStrategy;
    orderedModifiers: Array<Modifier<any, any>>;
    rects: StateRects;
    scrollParents: {
        reference: Array<Element | Window | VisualViewport>;
        popper: Array<Element | Window | VisualViewport>;
    };
    styles: {
        [key: string]: Partial<CSSStyleDeclaration>;
    };
    attributes: {
        [key: string]: {
            [key: string]: string | boolean;
        };
    };
    modifiersData: {
        arrow?: {
            x?: number;
            y?: number;
            centerOffset: number;
        };
        hide?: {
            isReferenceHidden: boolean;
            hasPopperEscaped: boolean;
            referenceClippingOffsets: SideObject;
            popperEscapeOffsets: SideObject;
        };
        offset?: OffsetData;
        preventOverflow?: Offsets;
        popperOffsets?: Offsets;
        [key: string]: any;
    };
    reset: boolean;
}
interface ModifierArguments<Options extends {
    [key: string]: any;
}> {
    state: State;
    options: Partial<Options>;
    name: string;
}
interface Modifier<Name, Options extends {
    [key: string]: any;
}> {
    name: Name;
    enabled: boolean;
    phase: ModifierPhases;
    requires?: string[];
    requiresIfExists?: string[];
    fn: (arg0: ModifierArguments<Options>) => State | void;
    effect?: (arg0: ModifierArguments<Options>) => (() => void) | void;
    options?: Partial<Options>;
    data?: {
        [key: string]: any;
    };
}
export type Modifiers = Array<Partial<Modifier<any, any>>>;
export {};
