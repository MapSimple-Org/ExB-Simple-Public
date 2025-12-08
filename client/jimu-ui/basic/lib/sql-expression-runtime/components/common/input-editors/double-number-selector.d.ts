import { React, type IMFieldSchema, type IntlShape, type ClauseValueOptions } from 'jimu-core';
interface Props {
    'aria-label'?: string;
    'aria-describedby'?: string;
    value: ClauseValueOptions;
    fieldObj: IMFieldSchema;
    onChange: (valueObj: ClauseValueOptions) => void;
    runtime: boolean;
    style?: React.CSSProperties;
    className?: string;
}
interface IntlProps {
    intl: IntlShape;
}
export declare class _VIDoubleNumberSelector extends React.PureComponent<Props & IntlProps> {
    value1: number;
    value2: number;
    i18nMessage: (id: string) => string;
    onValue1Change: (value: any) => void;
    onValue2Change: (value: any) => void;
    onChange: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const VIDoubleNumberSelector: import("@emotion/styled").StyledComponent<Omit<Props & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default VIDoubleNumberSelector;
