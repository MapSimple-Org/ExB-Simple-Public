/** @jsx jsx */
import { React, type IMDynamicBorderStyle } from 'jimu-core';
import type * as SettingComponentsModuleType from 'jimu-ui/advanced/setting-components';
import type * as StyleSettingComponentsModuleType from 'jimu-ui/advanced/style-setting-components';
import { type ComponentExtraProps } from '../../../../../../../utils';
export interface BorderEditorProps {
    SettingComponentsModule: typeof SettingComponentsModuleType;
    StyleSettingComponentsModule: typeof StyleSettingComponentsModuleType;
    config?: IMDynamicBorderStyle;
    onChange?: (config: IMDynamicBorderStyle) => void;
}
type FinalBorderEditorProps = BorderEditorProps & ComponentExtraProps;
export declare const BorderEditor: React.ForwardRefExoticComponent<Pick<Omit<FinalBorderEditorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof BorderEditorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
