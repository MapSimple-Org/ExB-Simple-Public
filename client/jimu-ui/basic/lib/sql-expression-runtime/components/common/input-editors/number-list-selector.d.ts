/** @jsx jsx */
import { React, type IntlShape, type ClauseValueOptions, dateUtils } from 'jimu-core';
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
interface State {
    isOpen: boolean;
    inputValue: number;
}
export declare class _NumberListSelector extends React.PureComponent<Props & IntlProps, State> {
    constructor(props: any);
    componentDidUpdate(prevProps: Props, prevState: State): void;
    i18nMessage: (id: string) => string;
    onUnitSelect: (unit: dateUtils.TimeUnit) => void;
    getInputValue: (value?: ClauseValueOptions) => number;
    onInputChange: (value: any) => void;
    onAcceptNumericValue: (value: any, unit: any) => void;
    onChange: (value: any, unit: any) => void;
    toggle: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const NumberListSelector: React.FC<import("react-intl").WithIntlProps<Props & IntlProps>> & {
    WrappedComponent: React.ComponentType<Props & IntlProps>;
};
export default NumberListSelector;
