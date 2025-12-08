/** @jsx jsx */
import { type IntlShape, type IMThemeVariables } from 'jimu-core';
import type { DropdownDataItem } from '..';
interface ImportAppProps {
    folderUrl: string;
    portalUrl: string;
    isExperiencesTemplate: boolean;
    folderDropdownData?: DropdownDataItem[];
    groupDropdownData?: DropdownDataItem[];
    theme: IMThemeVariables;
    intl: IntlShape;
    refreshAppList?: (isClearSearchText?: boolean) => void;
    toggleLoading?: (isShowLoading?: boolean) => void;
}
export declare const ImportApp: (props: ImportAppProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
