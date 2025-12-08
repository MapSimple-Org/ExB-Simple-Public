import { React } from 'jimu-core';
interface StylePickerProps {
    styles: {
        [key: string]: any;
    };
    value?: any;
    size?: 'small' | 'normal';
    onChange?: (value: any) => void;
}
interface StylePickerState {
    selectedValue: any;
}
export declare class _StylePicker extends React.PureComponent<StylePickerProps, StylePickerState> {
    constructor(props: any);
    onStyleClick: (value: any) => void;
    componentDidUpdate(prevProps: any, prevState: any): void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * @deprecated Deprecated since there is no place for use
 */
export declare const StylePicker: import("@emotion/styled").StyledComponent<any, {}, {}>;
export {};
