export interface CookieSettingsWindowProps {
    builderEntry: any;
    bannerUid: string;
    isEditable: boolean;
    onSave: (...args: any[]) => any;
    toggle: (...args: any[]) => any;
}
declare const CookieSettingsWindow: (props: CookieSettingsWindowProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default CookieSettingsWindow;
