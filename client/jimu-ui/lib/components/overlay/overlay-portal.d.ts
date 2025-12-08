import { React } from 'jimu-core';
export declare const useFullscreenElement: () => Element;
export declare const JimuOverlaysContainerId = "jimu-overlays-container";
interface OverlayPortalProps {
    /**
     * If `true`, disables portal behavior, keeping children within their parent DOM hierarchy.
     * @default false
     */
    disablePortal?: boolean;
    /**
     * The children to render within the portal.
     */
    children: React.ReactNode;
    /**
     * The ref of the overlay panel element. Used to determine the container to render the overlay.
     */
    overlayRef?: React.RefObject<HTMLElement>;
}
export declare const OverlayPortal: React.FC<OverlayPortalProps>;
export {};
