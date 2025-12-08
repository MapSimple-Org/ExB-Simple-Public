interface SearchGeneralSettingProps {
    id: string;
    hint?: string;
    allowSearchSourceSelection?: boolean;
    enableAllowSearchSourceSelectionSetting?: boolean;
    onGeneralSettingChange?: (key: string[], value: any) => void;
}
export declare const SearchGeneralSetting: (props: SearchGeneralSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
