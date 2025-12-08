/** @jsx jsx */
import { React, type IMDynamicTextStyle } from 'jimu-core';
import type * as SettingComponentsModuleType from 'jimu-ui/advanced/setting-components';
import type * as StyleSettingComponentsModuleType from 'jimu-ui/advanced/style-setting-components';
import { type ComponentExtraProps } from '../../../../../../../utils';
export interface SimpleTextStyleEditorProps {
    SettingComponentsModule: typeof SettingComponentsModuleType;
    StyleSettingComponentsModule: typeof StyleSettingComponentsModuleType;
    config?: IMDynamicTextStyle;
    onChange?: (config: IMDynamicTextStyle) => void;
}
type FinalSimpleTextEditorProps = SimpleTextStyleEditorProps & ComponentExtraProps;
export declare const SimpleTextStyleEditor: React.ForwardRefExoticComponent<Pick<Omit<FinalSimpleTextEditorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof SimpleTextStyleEditorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
