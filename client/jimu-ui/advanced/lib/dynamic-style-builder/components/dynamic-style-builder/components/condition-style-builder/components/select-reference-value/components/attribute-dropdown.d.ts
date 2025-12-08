/** @jsx jsx */
import { React } from 'jimu-core';
import type * as ExpressionBuilderModuleType from 'jimu-ui/advanced/expression-builder';
import type { ComponentExtraProps } from '../../../../../../../utils';
interface ExtraAttributeDropdownProps {
    hideDsViewSelector?: boolean;
}
export type AttributeDropdownProps = ExpressionBuilderModuleType.AttributeTabProps & ComponentExtraProps & ExtraAttributeDropdownProps;
export declare const AttributeDropdown: React.ForwardRefExoticComponent<Pick<Omit<AttributeDropdownProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "widgetId" | "useDataSources" | "className" | "onChange" | "expression" | "forwardedRef" | "types" | "hideDsViewSelector"> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
