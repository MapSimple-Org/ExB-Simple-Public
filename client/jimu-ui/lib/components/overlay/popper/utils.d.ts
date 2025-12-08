import type { Placement, ReferenceType } from '@floating-ui/react';
import type { Modifiers } from './type';
export type TargetType = string | ReferenceType | React.RefObject<any> | (() => any);
export declare const canUseDOM: () => boolean;
export declare const isReactRefObj: (target: any) => boolean;
export declare const isArrayOrNodeList: (els: any) => boolean;
export declare const findDOMElements: (target: any) => any;
export declare const getTarget: (target: TargetType) => HTMLElement;
export declare const isVirtualReference: (target: any) => boolean;
export declare const isOutBoundary: (node1: Element, node2: Element) => boolean;
export declare const outPopperOrReference: (popper: HTMLElement, reference: HTMLElement, target: HTMLElement) => boolean;
export declare const getPosition: (transform: string) => any;
export declare const flipPlacementForRTL: (placement: any, isRTL?: boolean) => Placement;
export declare const isTargetInContainer: (target: HTMLElement, container: HTMLElement) => boolean;
export declare const getLastModifier: (modifiers: Modifiers, name: string) => any;
export declare const isModifierEnabled: (modifiers: Modifiers, name: string) => boolean;
/**
 * A Popper.js modifier to set the standby placements
 * @param fallbackPlacements
 * @param flipPlacement Whether to flip placement during RTL
 *
 * @deprecated Use Popper props `flipOptions.fallbackPlacements` and `flipPlacement` instead
 */
export declare const getFallbackPlacementsModifier: (fallbackPlacements: Placement[], flipPlacement?: boolean) => {
    name: string;
    enabled: boolean;
    phase: string;
    options: {
        fallbackPlacements: Placement[];
    };
};
