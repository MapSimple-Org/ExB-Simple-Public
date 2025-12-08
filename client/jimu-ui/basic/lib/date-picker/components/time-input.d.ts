/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
interface TimeInputProps {
    isLongTime: boolean;
    value: string;
    onChange: (hour: number, minute: number, second: number) => void;
    /**
     * Not trigger the input change.
     * @default false
    */
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
interface IntlProps {
    intl: IntlShape;
}
export declare const TimeInput: import("@emotion/styled").StyledComponent<Omit<TimeInputProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export {};
