/** @jsx jsx */
import { React, type ImmutableObject } from 'jimu-core';
import { type FourSidesUnit } from 'jimu-ui';
import type * as SettingComponentsModuleType from 'jimu-ui/advanced/setting-components';
import type * as StyleSettingComponentsModuleType from 'jimu-ui/advanced/style-setting-components';
import { type ComponentExtraProps } from '../../../../../../../utils';
export interface BorderRadiusEditorProps {
    SettingComponentsModule: typeof SettingComponentsModuleType;
    StyleSettingComponentsModule: typeof StyleSettingComponentsModuleType;
    config?: ImmutableObject<FourSidesUnit>;
    onChange?: (config: ImmutableObject<FourSidesUnit>) => void;
}
type FinalBorderRadiusEditorProps = BorderRadiusEditorProps & ComponentExtraProps;
export declare const BorderRadiusEditor: React.ForwardRefExoticComponent<Pick<Omit<FinalBorderRadiusEditorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof BorderRadiusEditorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
