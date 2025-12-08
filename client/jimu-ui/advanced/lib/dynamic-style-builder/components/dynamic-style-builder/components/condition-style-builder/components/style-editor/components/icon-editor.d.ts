/** @jsx jsx */
import { React, type IMDynamicIconStyle } from 'jimu-core';
import type * as SettingComponentsModuleType from 'jimu-ui/advanced/setting-components';
import type * as StyleSettingComponentsModuleType from 'jimu-ui/advanced/style-setting-components';
import { type ComponentExtraProps } from '../../../../../../../utils';
export interface IconEditorProps {
    SettingComponentsModule: typeof SettingComponentsModuleType;
    StyleSettingComponentsModule: typeof StyleSettingComponentsModuleType;
    config: IMDynamicIconStyle;
    onChange: (config: IMDynamicIconStyle) => void;
}
type FinalIconEditorProps = IconEditorProps & ComponentExtraProps;
export declare const IconEditor: React.ForwardRefExoticComponent<Pick<Omit<FinalIconEditorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof IconEditorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
