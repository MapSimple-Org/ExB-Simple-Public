/** @jsx jsx */
import { type UseUtility, type ImmutableArray, SupportedUtilityType } from 'jimu-core';
export { addNewUtility } from './org-utility';
export { extractService } from 'jimu-ui/basic/lib/runtime-components';
export { type UtilityTreeItem } from './types';
export interface UtilitySelectorProps {
    pattern?: RegExp;
    types?: SupportedUtilityType[];
    isMultiple?: boolean;
    showRemove?: boolean;
    closePopupOnSelect?: boolean;
    showOrgUtility?: boolean;
    useUtilities?: ImmutableArray<UseUtility>;
    onChange?: (utilities: ImmutableArray<UseUtility>) => void;
}
export declare function UtilitySelector(props: UtilitySelectorProps): import("@emotion/react/jsx-runtime").JSX.Element;
