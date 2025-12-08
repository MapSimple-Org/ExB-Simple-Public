/** @jsx jsx */
import { React, type IMDynamicTextStyle } from 'jimu-core';
import type * as SettingComponentsModuleType from 'jimu-ui/advanced/setting-components';
import type * as StyleSettingComponentsModuleType from 'jimu-ui/advanced/style-setting-components';
import { type ComponentExtraProps } from '../../../../../../../utils';
export interface AdvancedTextStyleEditorProps {
    SettingComponentsModule: typeof SettingComponentsModuleType;
    StyleSettingComponentsModule: typeof StyleSettingComponentsModuleType;
    config?: IMDynamicTextStyle;
    onChange?: (config: IMDynamicTextStyle) => void;
}
type AdvancedTextEditorProps = AdvancedTextStyleEditorProps & ComponentExtraProps;
export declare const AdvancedTextStyleEditor: React.ForwardRefExoticComponent<Pick<Omit<AdvancedTextEditorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof AdvancedTextStyleEditorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
