/** @jsx jsx */
import { React, type IntlShape, type OrderByOption, type IMThemeVariables, type IMUseDataSource, type ImmutableArray, type UseDataSource } from 'jimu-core';
interface ExtraProps {
    intl: IntlShape;
}
export interface SortSettingOption {
    ruleOptionName: string;
    rule: OrderByOption[];
    /**
     * If true, the option name will be automatically updated when field or sort rule change.
     * For apps before version 1.19, the default value is false
    */
    autoUpdateOptionName?: boolean;
    isEditOptionName?: boolean;
}
export interface SortSettingProps {
    singleRowItemOnly?: boolean;
    optionRenderFunction?: (props: SortSettingProps, createOptionElement: (useDataSources: ImmutableArray<UseDataSource>, el: any, index: number) => any) => React.JSX.Element;
    onChange: (sortData: SortSettingOption[], index?: number) => void;
    useDataSource: IMUseDataSource;
    value: ImmutableArray<SortSettingOption>;
    theme?: IMThemeVariables;
    className?: string;
}
export interface SortSettingState {
    option: SortSettingOption;
    ruleOptionName: ImmutableArray<string>;
    editOptionNameStatus: ImmutableArray<boolean>;
}
export declare const SortSetting: import("@emotion/styled").StyledComponent<Omit<SortSettingProps & ExtraProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export {};
