import { React } from 'jimu-core';
export declare const getCachedFocusableElements: (container: HTMLElement, cachedFocusEleRef: React.MutableRefObject<HTMLElement[]>, force?: boolean) => HTMLElement[];
/**
 * Loop within the focusable elements inside a container when the Tab key is pressed.
 *
 * @ignore
 * @param trapFocus
 * Whether to enable trap focus.
 * @param autoFocus
 * Whether to automatically focus on the first focusable element.
 * @param forceLatestFocusElements
 * Whether to query focusable elements every time you when the `Tab` key is pressed.
 */
export declare const useTrapFocusLoop: (containerRef: React.MutableRefObject<HTMLDivElement>, trapFocus?: boolean, autoFocus?: boolean, forceLatestFocusElements?: boolean, enable?: boolean) => void;
/**
 * Trigger callback when the escape key is pressed
 */
export declare const useCallbackForEscape: (containerRef: React.MutableRefObject<HTMLElement>, callback: (evt: any) => void, enable?: boolean) => void;
/**
 * Trap focus in container by first node ref and last node ref.
 * @ignore
 * @param firstNodeRef
 * The first interactive node ref in container.
 * @param lastNodeRef
 * The last interactive node ref in container.
 * @param version
 * Rebind keydown event when version is updated. Used for case: refs are changed.
 */
export declare const useTrapFocusByBoundaryNodes: (firstNodeRef: any, lastNodeRef: any, version?: number) => void;
/**
 * Trap focus in container by first node selector and last node selector.
 * @ignore
 * @param containerRef
 * The ref of the container to trap focus in
 * @param trapFocus
 * Whether to enable trap focus.
 * @param autoFocus
 * Whether to automatically focus on the first focusable element.
 * @param firstSelector
 * The first interactive node selector in container.
 * @param lastSelector
 * The last interactive node selector in container.
 */
export declare const useTrapFocusBySelector: (containerRef: React.MutableRefObject<HTMLDivElement>, trapFocus: boolean, autoFocus: boolean, firstSelector: string, lastSelector: string, isOpen?: boolean) => void;
