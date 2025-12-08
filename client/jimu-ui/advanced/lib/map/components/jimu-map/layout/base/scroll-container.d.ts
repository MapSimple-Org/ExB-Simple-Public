/** @jsx jsx */
import { React } from 'jimu-core';
interface ScrollContainerProps {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}
export default class ScrollContainer extends React.PureComponent<ScrollContainerProps, unknown> {
    moveY: number;
    startY: number;
    isRegisted: boolean;
    getStyle(): import("jimu-core").SerializedStyles;
    registerTouchEvent: (ref: HTMLElement) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
