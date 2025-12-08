/** @jsx jsx */
import { React } from 'jimu-core';
import type * as ExpressionBuilderModuleType from 'jimu-ui/advanced/expression-builder';
import type { ComponentExtraProps } from '../../../../../../../utils';
export type StatisticsDropdownProps = ExpressionBuilderModuleType.StatisticsTabProps & ComponentExtraProps;
export declare const StatisticsDropdown: React.ForwardRefExoticComponent<Pick<Omit<StatisticsDropdownProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "widgetId" | "useDataSources" | "className" | "onChange" | "expression" | "forwardedRef"> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
