import 'arcgis-portal-components';
export interface BannerProps {
    className?: string;
    portalItemId: string;
    classification?: __esri.PortalItem['classification'];
    position: 'top' | 'bottom';
    needSticky?: boolean;
    onReady?: () => void;
}
export declare const ClassificationBanner: (props: BannerProps) => import("@emotion/react/jsx-runtime").JSX.Element;
