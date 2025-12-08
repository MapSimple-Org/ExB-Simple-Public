import { React, type IMFieldSchema, type ClauseValueOptions, type ClauseValuePair, type DataSource } from 'jimu-core';
interface Props {
    'aria-label'?: string;
    'aria-describedby'?: string;
    value: ClauseValueOptions;
    dataSource: DataSource;
    fieldObj: IMFieldSchema;
    runtime: boolean;
    isSmallSize?: boolean;
    onChange: (valueObj: ClauseValueOptions) => void;
    style?: React.CSSProperties;
}
interface State {
    value: ClauseValueOptions;
    DatePicker: any;
    displayUI: string;
}
export declare class _VIDateTimePicker extends React.PureComponent<Props, State> {
    __unmount: boolean;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    getInputEditor: (inputEditorType: string) => string;
    onChange: (value: number, label?: string) => void;
    getValueWithTZ: () => ClauseValueOptions;
    getDateFromUTC: (valuePair: ClauseValuePair) => Date;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const VIDateTimePicker: typeof _VIDateTimePicker;
export default VIDateTimePicker;
