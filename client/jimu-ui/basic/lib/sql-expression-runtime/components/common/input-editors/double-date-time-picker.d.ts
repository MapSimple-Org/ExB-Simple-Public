import { React, type IMFieldSchema, type IntlShape, type ClauseValueOptions, type DataSource } from 'jimu-core';
interface Props {
    'aria-label'?: string;
    'aria-describedby'?: string;
    value: ClauseValueOptions;
    dataSource: DataSource;
    fieldObj: IMFieldSchema;
    runtime: boolean;
    onChange: (valueObj: ClauseValueOptions) => void;
    className?: string;
}
interface IntlProps {
    intl: IntlShape;
}
interface State {
    DatePicker: any;
    displayUI: string;
}
export declare class _VIDoubleDateTimePicker extends React.PureComponent<Props & IntlProps, State> {
    value1: ClauseValueOptions;
    value2: ClauseValueOptions;
    i18nMessage: (id: string) => string;
    onChange: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const VIDoubleDateTimePicker: import("@emotion/styled").StyledComponent<Omit<Props & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default VIDoubleDateTimePicker;
