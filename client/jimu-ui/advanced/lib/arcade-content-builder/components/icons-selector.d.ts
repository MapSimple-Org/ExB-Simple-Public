/** @jsx jsx */
import { React, type ArcadeIcon, type ImmutableArray } from 'jimu-core';
import type { ComponentExtraProps } from '../utils';
export interface IconsSelectorProps {
    className?: string;
    inModal: boolean;
    expand: boolean;
    icons: ImmutableArray<ArcadeIcon>;
    onExpandChange?: (newExpand: boolean) => void;
    onClose?: () => void;
    onIconsChange: (newIcons: ImmutableArray<ArcadeIcon>) => void;
}
type FinalIconsSelectorProps = IconsSelectorProps & ComponentExtraProps;
export declare const IconsSelector: React.ForwardRefExoticComponent<Pick<Omit<FinalIconsSelectorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "expand" | "onClose" | "className" | "icons" | "forwardedRef" | "repeatedDataSource" | "inModal" | "onExpandChange" | "onIconsChange"> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
