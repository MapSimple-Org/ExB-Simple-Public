/** @jsx jsx */
import { React, type IMDynamicStyle, type IMDynamicStyleTypes } from 'jimu-core';
import { type ComponentExtraProps } from '../../../../../../utils';
export interface StyleEditorProps {
    className?: string;
    dynamicStyleTypes: IMDynamicStyleTypes;
    dynamicStyle: IMDynamicStyle;
    onChange: (dynamicStyle: IMDynamicStyle) => void;
}
type FinalStyleEditorProps = StyleEditorProps & ComponentExtraProps;
export declare const StyleEditor: React.ForwardRefExoticComponent<Pick<Omit<FinalStyleEditorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "onChange" | "dynamicStyle" | "forwardedRef" | "dynamicStyleTypes"> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
