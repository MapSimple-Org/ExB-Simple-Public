import { React } from 'jimu-core';
export interface BaseProps {
    exp: string;
    id: string;
    isEditable: boolean;
    tabIndex?: number;
    title?: string;
    style?: React.CSSProperties;
    className?: string;
    renderComma?: boolean;
}
export default class ExpBase extends React.PureComponent<BaseProps, unknown> {
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
