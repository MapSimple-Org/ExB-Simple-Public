/** @jsx jsx */
import { React, type IntlShape, type IMThemeVariables, ReactRedux, type IMAppConfig } from 'jimu-core';
export interface ProxySettingPopupProps {
    isOpen: boolean;
    appHasBeenSaved: boolean;
    className?: string;
    onFinish: (appConfig?: IMAppConfig) => Promise<void>;
    onCancel: () => void;
    onToggle: () => void;
}
interface ExtraProps {
    intl: IntlShape;
    theme: IMThemeVariables;
}
export declare const ProxySettingPopup: ReactRedux.ConnectedComponent<import("@emotion/styled").StyledComponent<Pick<Omit<ProxySettingPopupProps & ExtraProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof ProxySettingPopupProps> & {
    theme?: IMThemeVariables;
}, {}, {}>, {
    theme?: IMThemeVariables;
    className?: string;
    onToggle: () => void;
    onCancel: () => void;
    isOpen: boolean;
    forwardedRef?: React.Ref<any>;
    onFinish: (appConfig?: IMAppConfig) => Promise<void>;
    appHasBeenSaved: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export {};
