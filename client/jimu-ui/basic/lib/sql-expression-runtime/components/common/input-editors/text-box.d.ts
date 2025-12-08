import { React, type IMFieldSchema, JimuFieldType, type ClauseValueOptions } from 'jimu-core';
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
interface State {
    displayUI: string;
    inputValue: number | string;
}
export declare class _VITextBox extends React.PureComponent<Props, State> {
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    setStateForDisplayUI: () => void;
    getInputValue: (value?: ClauseValueOptions) => string | number;
    getDisplayUI: (fieldType: JimuFieldType) => string;
    onNumberChange: (value: any) => void;
    onAcceptNumericValue: (value: any) => void;
    onTextChange: (e: any) => void;
    onAcceptTextValue: (value: any) => void;
    onChange: (value: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const VITextBox: typeof _VITextBox;
export default VITextBox;
