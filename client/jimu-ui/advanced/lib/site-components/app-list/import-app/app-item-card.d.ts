import type { AppInfo } from 'jimu-for-builder/service';
interface AppItemCardProps {
    portalUrl: string;
    folderUrl: string;
    isExperiencesTemplate: boolean;
    appItem: AppInfo;
    selectedApp: AppInfo;
    onScrollTop?: (isScrollEnd: boolean) => void;
    onItemSelected?: (selectedItemInfo: AppInfo) => void;
    children?: any;
    className?: string;
    showVersionRemindPopper?: (isExperiencesTemplate: boolean, confirmCallback: any) => void;
}
declare const AppItemCard: (props: AppItemCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default AppItemCard;
