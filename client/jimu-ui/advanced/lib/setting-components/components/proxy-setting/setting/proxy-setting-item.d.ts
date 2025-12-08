import { React, type IntlShape } from 'jimu-core';
import type { ProxySettingConfig } from '../types';
interface Props {
    proxySettingConfig: ProxySettingConfig;
    sourceUrl: string;
    isPremium: boolean;
    isSubscriber: boolean;
    intl: IntlShape;
    label: string;
    onChange: (sourceUrl: string, proxyConfig: ProxySettingConfig) => void;
}
interface State {
    isHostedInSamePortal: boolean;
}
type IntervalUnit = 'none' | 'second' | 'minute' | 'hour' | 'day';
export declare class ProxySettingItem extends React.PureComponent<Props, State> {
    __unmount: boolean;
    interval: {
        none: string;
        second: string;
        minute: string;
        hour: string;
        day: string;
    };
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    componentWillUnmount(): void;
    setIsHostedInSamePortal: () => void;
    getIntervalUnit(intervalSeconds: number): IntervalUnit;
    getIntervalSeconds(intervalUnit: IntervalUnit): number;
    onToggleProxy: () => void;
    onHitsPerIntervalChange: (value: number | undefined) => void;
    onIntervalUnitChange: (e: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
