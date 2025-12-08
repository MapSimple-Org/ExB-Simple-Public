/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
/**
 * The InputRatio component props.
 */
interface Props {
    /**
     * The current ratio value. Can be a number of width/height or string like '4:3'
     */
    value: number | string;
    /**
     * Whether to disable the input.
     */
    disabled?: boolean;
    /**
     * @ignore
     */
    style?: any;
    /**
     * @ignore
     */
    intl: IntlShape;
    /**
     * Fires when the ratio value changes.
     * @event
     */
    onChange?: (ratio: string) => void;
}
export declare class _InputRatio extends React.PureComponent<Props, any> {
    static defaultProps: Partial<Props>;
    width: number;
    height: number;
    onWidthChange: (val: number) => void;
    onHeightChange: (val: number) => void;
    parseAspectRatio(ratio: number | string): void;
    formatMessage(id: string): string;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const InputRatio: React.FC<import("react-intl").WithIntlProps<Props>> & {
    WrappedComponent: React.ComponentType<Props>;
};
export {};
