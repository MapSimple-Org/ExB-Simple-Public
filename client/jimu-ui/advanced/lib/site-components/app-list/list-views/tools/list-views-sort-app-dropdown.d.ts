import { React, type IntlShape } from 'jimu-core';
interface State {
    isOpen: boolean;
}
interface Props {
    className?: string;
    style?: React.CSSProperties;
    onChange?: any;
    intl?: IntlShape;
}
export declare class ListViewsSortAppDropdown extends React.PureComponent<Props, State> {
    constructor(props: any);
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
