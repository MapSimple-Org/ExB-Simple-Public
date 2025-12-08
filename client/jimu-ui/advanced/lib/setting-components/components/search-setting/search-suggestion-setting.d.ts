import { type IMSearchSuggestionConfig } from './type/type';
interface SearchSuggestionSettingProps {
    id: string;
    settingConfig?: IMSearchSuggestionConfig;
    hideRecentSearchSetting?: boolean;
    onSettingChange?: (settingConfig: IMSearchSuggestionConfig) => void;
}
export declare const SearchSuggestionSetting: (props: SearchSuggestionSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
