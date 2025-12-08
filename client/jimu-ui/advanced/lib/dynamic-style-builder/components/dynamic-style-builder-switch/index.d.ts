/** @jsx jsx */
import { React } from 'jimu-core';
import type { ComponentExtraProps } from '../../utils';
import { type DynamicStyleBuilderProps } from '../dynamic-style-builder';
export interface DynamicStyleBuilderSwitchProps extends DynamicStyleBuilderProps {
    /**
     * If true, the switch is checked.
     */
    switchChecked?: boolean;
    disabled?: boolean;
    /**
     * Callback fires when the `checked` state is changed.
     */
    onSwitchChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}
type FinalDynamicStyleBuilderSwitchProps = DynamicStyleBuilderSwitchProps & ComponentExtraProps;
/**
 * The `DynamicStyleBuilderSwitch` component is the wrapper of `DynamicStyleBuilder` component. It allows users to build dynamic style using a side popper.
 *
 * ```ts
 * import { DynamicStyleBuilderSwitch } from 'jimu-ui/advanced/dynamic-style-builder'
 * ```
 */
export declare const DynamicStyleBuilderSwitch: React.ForwardRefExoticComponent<Pick<Omit<FinalDynamicStyleBuilderSwitchProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof DynamicStyleBuilderSwitchProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
