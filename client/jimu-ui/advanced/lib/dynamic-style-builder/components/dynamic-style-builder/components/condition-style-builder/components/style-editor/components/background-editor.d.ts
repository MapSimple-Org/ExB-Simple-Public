/** @jsx jsx */
import { React, type ImmutableObject } from 'jimu-core';
import { type BackgroundStyle } from 'jimu-ui';
import type * as SettingComponentsModuleType from 'jimu-ui/advanced/setting-components';
import type * as StyleSettingComponentsModuleType from 'jimu-ui/advanced/style-setting-components';
import { type ComponentExtraProps } from '../../../../../../../utils';
export interface BackgroundEditorProps {
    SettingComponentsModule: typeof SettingComponentsModuleType;
    StyleSettingComponentsModule: typeof StyleSettingComponentsModuleType;
    config?: ImmutableObject<BackgroundStyle>;
    onChange?: (config: ImmutableObject<BackgroundStyle>) => void;
}
type FinalBackgroundEditorProps = BackgroundEditorProps & ComponentExtraProps;
export declare const BackgroundEditor: React.ForwardRefExoticComponent<Pick<Omit<FinalBackgroundEditorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof BackgroundEditorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
