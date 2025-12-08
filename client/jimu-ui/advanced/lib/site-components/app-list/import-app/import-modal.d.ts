/** @jsx jsx */
import { type IntlShape, type IMThemeVariables } from 'jimu-core';
import { type DropdownDataItem } from '..';
import type * as JimuForBuilderService from 'jimu-for-builder/service';
interface ImportAppProps {
    folderUrl: string;
    portalUrl: string;
    isOpen: boolean;
    isExperiencesTemplate: boolean;
    jimuForBuilderService: typeof JimuForBuilderService;
    folderDropdownData?: DropdownDataItem[];
    groupDropdownData?: DropdownDataItem[];
    intl: IntlShape;
    theme: IMThemeVariables;
    toggle: () => void;
    refreshAppList?: (isClearSearchText?: boolean) => void;
    setErrorMessage?: (errMsg?: string) => void;
    toggleErrorPopper?: () => void;
    showVersionRemindPopper?: (isExperiencesTemplate: boolean, confirmCallback: any) => void;
}
declare const ImportAppModal: (props: ImportAppProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default ImportAppModal;
