/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape } from 'jimu-core';
import type { DropdownDataItem } from '../types/types';
interface Props {
    dropDownData: DropdownDataItem[];
    value: string;
    intl: IntlShape;
    theme: IMThemeVariables;
    isShowSelectIcon?: boolean;
    useMoreIcon?: boolean;
    className?: string;
    ariaLabel?: string;
    onChange?: (value: any) => void;
    onOptionClick?: (value: any) => void;
}
interface States {
    dropdownOpen: boolean;
    text: string;
}
export declare class ClassifyDropdown extends React.PureComponent<Props & {
    theme: IMThemeVariables;
}, States> {
    constructor(props: any);
    getTextAndIndexById: (dropDownData: any, value: any) => string;
    toggleDropdown: () => void;
    optionClick: (e: any, optionText: any, optionValue: any) => void;
    getStyle(): import("jimu-core").SerializedStyles;
    getDropdownStyle(): import("jimu-core").SerializedStyles;
    nls: (id: string) => string;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
