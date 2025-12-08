import { React } from 'jimu-core';
import type { RawWidgetSettingType, WidgetSettingInjectedProps, AllWidgetSettingProps } from 'jimu-for-builder';
export type WrappedWidgetSettingTypePartialProps = (React.ComponentClass<Partial<AllWidgetSettingProps<unknown>>> | React.FunctionComponent<Partial<AllWidgetSettingProps<unknown>>>);
export type WrappedWidgetSettingProps = Partial<Omit<WidgetSettingInjectedProps<unknown>, 'theme' | 'intl'>>;
/**
 * Wrap a widget setting for unit testing.
 * The recommended way is to wrap the widget setting one time, then change props in test cases
 * @param WidgetSettingClass
 * @param props The props here can be considered as default props for a bunch of test cases.
 * @returns
 */
export declare function wrapWidgetSetting(WidgetSettingClass: RawWidgetSettingType, props?: WrappedWidgetSettingProps): WrappedWidgetSettingTypePartialProps;
