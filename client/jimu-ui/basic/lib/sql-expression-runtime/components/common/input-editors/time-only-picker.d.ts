/** @jsx jsx */
import { React, type SerializedStyles, type ClauseValueOptions, type IntlShape, type IMFieldSchema } from 'jimu-core';
interface Props {
    'aria-label'?: string;
    'aria-describedby'?: string;
    value: ClauseValueOptions;
    fieldObj: IMFieldSchema;
    runtime: boolean;
    isSmallSize?: boolean;
    onChange: (valueObj: ClauseValueOptions) => void;
    style?: React.CSSProperties;
    className?: string;
}
interface IntlProps {
    intl: IntlShape;
}
interface State {
    TimeInput: any;
    isOpen: boolean;
    inputValue: string;
    inputValueLabel: string;
    isLongTime: boolean;
}
export declare class _VITimeOnlyPicker extends React.PureComponent<Props & IntlProps, State> {
    __unmount: boolean;
    inputBtnRef: React.RefObject<HTMLButtonElement | null>;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    componentWillUnmount(): void;
    getStylesForTimeInputPopper: () => SerializedStyles;
    getInputValue: (value?: ClauseValueOptions) => string;
    getInputValueLabel: (value: string) => string;
    popperToggle: () => void;
    timeInputChange: (event: any) => void;
    timeInputAccepted: (value: string) => void;
    getPrefix: (value: number, offset?: number) => string;
    timeValueChange: (hour: number, minute: number, second: number) => void;
    onValueChanged: (newValue: string) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const VITimeOnlyPicker: import("@emotion/styled").StyledComponent<Omit<Props & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default VITimeOnlyPicker;
