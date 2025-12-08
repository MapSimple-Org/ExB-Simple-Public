import { React } from 'jimu-core';
interface RadioGroupOption {
    value: string;
    content: string;
}
interface RadioGroupProps {
    options: RadioGroupOption[];
    value?: string;
    className?: string;
    style?: React.CSSProperties;
    gutter?: string;
    onChange?: (value: string) => void;
}
interface RadioGroupState {
    value: string;
}
export declare class _RadioGroup extends React.PureComponent<RadioGroupProps, RadioGroupState> {
    static count: number;
    inputName: string;
    state: {
        value: string;
    };
    constructor(props: any);
    onRadioButtonChange: (evt: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const RadioGroup: import("@emotion/styled").StyledComponent<any, {}, {}>;
export {};
