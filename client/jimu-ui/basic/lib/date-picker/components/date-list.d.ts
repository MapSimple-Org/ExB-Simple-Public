/** @jsx jsx */
import { React, type IntlShape, type dateUtils } from 'jimu-core';
interface Props {
    dateList: dateUtils.VirtualDateType[];
    selectedDate: Date | dateUtils.VirtualDateType;
    onChange: (startTime: number, endTime: number) => void;
    className?: string;
    style?: React.CSSProperties;
}
interface ExtraProps {
    intl: IntlShape;
}
export declare const DateList: React.FC<import("react-intl").WithIntlProps<Props & ExtraProps>> & {
    WrappedComponent: React.ComponentType<Props & ExtraProps>;
};
export {};
