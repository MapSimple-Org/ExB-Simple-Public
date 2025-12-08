import { React, type IMFieldSchema, type IntlShape, type ClauseValueOptions } from 'jimu-core';
interface Props {
    'aria-label'?: string;
    'aria-describedby'?: string;
    value: ClauseValueOptions;
    fieldObj: IMFieldSchema;
    runtime: boolean;
    onChange: (valueObj: ClauseValueOptions) => void;
    className?: string;
}
interface IntlProps {
    intl: IntlShape;
}
export declare class _VIDoubleDateOnlyPicker extends React.PureComponent<Props & IntlProps> {
    value1: ClauseValueOptions;
    value2: ClauseValueOptions;
    i18nMessage: (id: string) => string;
    onChange: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const VIDoubleDateOnlyPicker: import("@emotion/styled").StyledComponent<Omit<Props & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default VIDoubleDateOnlyPicker;
