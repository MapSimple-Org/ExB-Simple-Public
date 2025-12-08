import { React, type IMFieldSchema, type ClauseValueOptions } from 'jimu-core';
interface Props {
    'aria-label'?: string;
    'aria-describedby'?: string;
    value: ClauseValueOptions;
    fieldObj: IMFieldSchema;
    runtime: boolean;
    isSmallSize?: boolean;
    onChange: (valueObj: ClauseValueOptions) => void;
    style?: React.CSSProperties;
}
interface State {
    value: Date | string;
    DatePicker: any;
}
export declare class _VIDateOnlyPicker extends React.PureComponent<Props, State> {
    __unmount: boolean;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    onChange: (value: number, label?: string) => void;
    getTimesByDateValue: () => Date | string;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const VIDateOnlyPicker: typeof _VIDateOnlyPicker;
export default VIDateOnlyPicker;
