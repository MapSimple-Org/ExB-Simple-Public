import { React, type ImmutableArray } from 'jimu-core';
export declare const ModalOverlayIdContext: React.Context<string>;
export declare const baseOverlayZIndex = 1;
export declare const TooltipZIndex = 2001;
export declare const isTargetInContainer: (target: HTMLElement, container: HTMLElement) => boolean;
export declare const getOverlayZIndex: (overlays: ImmutableArray<string>, uniqueId: string, baseZIndex: number) => number;
export interface OverlayManagerProps {
    /**
     * If `true`, it disables portal behavior, and keeps children within their parent DOM hierarchy.
     * If `false`, children are appended to `document.body`.
     * @default false
     */
    disablePortal?: boolean;
    /**
     * If `true`, it prevents activating the overlay when clicking on the popper body.
     * @default false
     */
    disableActivateOverlay?: boolean;
    /**
     * If `true`, it disables z-index management via `state.overlays`.
     * @default false
     */
    disableOverlayManager?: boolean;
    /**
     * @ignore
     */
    zIndex?: number;
}
export interface OverlayManagerResult {
    /**
     * The unique ID of the overlay, it will be generated when the overlay is opened.
     */
    overlayId: string;
    /**
     * The z-index of the overlay.
     */
    zIndex: number;
    /**
     * The function to open the overlay.
     */
    openOverlay: () => void;
    /**
     * The function to activate the overlay.
     */
    activateOverlay: () => void;
    /**
     * The function to close the overlay.
     */
    closeOverlay: () => void;
}
export interface OverlayManagerOptions {
    /**
     * The type of overlay to manage, either 'modal' or 'popper'.
     * @default popper
     */
    type: 'modal' | 'popper';
    /**
     * Whether the overlay is open.
     * @default true
     */
    open: boolean;
    /**
     * Whether to keep the overlay mounted when closed.
     * @default false
     */
    keepMount?: boolean;
    /**
     * Whether to disable the overlay manager.
     * @default false
     */
    disableOverlayManager?: boolean;
    /**
     * Whether to disable activating the overlay.
     * @default false
     */
    disableActivateOverlay?: boolean;
    /**
     * The base z-index for the overlay.
     * @default 1
     */
    baseZindex?: number;
}
export declare const useOverlayManager: (options: OverlayManagerOptions) => OverlayManagerResult;
/**
 * Return the portal container according to whether it is fullscreen or not.
 */
export declare const usePortalContainer: (disablePortal: boolean, panelRef: React.MutableRefObject<HTMLElement>) => HTMLElement;
