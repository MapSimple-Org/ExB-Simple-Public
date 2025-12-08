import { React, type IntlShape, type ClauseValueOptions } from 'jimu-core';
interface Props {
    'aria-label'?: string;
    'aria-describedby'?: string;
    value: ClauseValueOptions;
    runtime: boolean;
    isSmallSize?: boolean;
    onChange: (valueObj: ClauseValueOptions) => void;
}
interface IntlProps {
    intl: IntlShape;
}
export declare class _VIDateRangeSelector extends React.PureComponent<Props & IntlProps> {
    onValueChange: (evt: any, value: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const VIDateRangeSelector: React.FC<import("react-intl").WithIntlProps<Props & IntlProps>> & {
    WrappedComponent: React.ComponentType<Props & IntlProps>;
};
export default VIDateRangeSelector;
