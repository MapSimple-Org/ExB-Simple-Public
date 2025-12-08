/** @jsx jsx */
import { React, type IMDynamicStyleConditionInfo, DynamicStyleConditionSourceType } from 'jimu-core';
import type { ComponentExtraProps } from '../../../../../../../utils';
export interface ConditionSourceTypeSelectorProps {
    supportedConditionSourceTypes: DynamicStyleConditionSourceType[];
    conditionInfo: IMDynamicStyleConditionInfo;
    onChange: (sourceType: DynamicStyleConditionSourceType) => void;
}
type FinalConditionSourceTypeSelectorProps = ConditionSourceTypeSelectorProps & ComponentExtraProps;
export declare const ConditionSourceTypeSelector: React.ForwardRefExoticComponent<Pick<Omit<FinalConditionSourceTypeSelectorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof ConditionSourceTypeSelectorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
