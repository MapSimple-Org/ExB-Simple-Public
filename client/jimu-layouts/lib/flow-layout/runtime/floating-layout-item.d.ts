/** @jsx jsx */
import { React, type IMLayoutItemJson } from 'jimu-core';
import type { LayoutItemProps } from '../../types';
interface OwnProps {
    index: number;
    layoutItem: IMLayoutItemJson;
    gutter: number;
}
export default class FloatingLayoutItem extends React.PureComponent<LayoutItemProps & OwnProps> {
    calculatePosition(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
