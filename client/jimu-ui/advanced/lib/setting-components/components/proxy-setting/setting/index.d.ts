import { React, type IntlShape } from 'jimu-core';
import type { NeedProxyItems, ProxySettingConfig, ProxySettingConfigs } from '../types';
interface ProxySettingProps {
    appHasBeenSaved: boolean;
    className?: string;
    proxySettingConfigs: ProxySettingConfigs;
    needProxyItems: NeedProxyItems;
    onChange: (proxySettingConfigs: ProxySettingConfigs) => void;
}
interface ExtraProps {
    intl: IntlShape;
}
export declare class _ProxySetting extends React.PureComponent<ProxySettingProps & ExtraProps, unknown> {
    columnName: {
        authorized: string;
        subscriberContent: string;
        credits: string;
        requestLimit: string;
        requestInterval: string;
    };
    onProxyChange: (sourceUrl: string, proxySettingConfig: ProxySettingConfig) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const ProxySetting: React.FC<import("react-intl").WithIntlProps<ProxySettingProps & ExtraProps>> & {
    WrappedComponent: React.ComponentType<ProxySettingProps & ExtraProps>;
};
export {};
