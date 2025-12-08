/** @jsx jsx */
import { React, type SerializedStyles } from 'jimu-core';
import { type RowLayoutItemSetting, type LayoutItemProps, type StateToLayoutItemProps } from '../../types';
interface OwnProps {
    offset: number;
    span: number;
    gutter: number;
    isMultiRow: boolean;
    alignItems?: string;
    children?: any;
}
export default class RowItem extends React.PureComponent<LayoutItemProps & StateToLayoutItemProps & OwnProps> {
    getStyle(itemSetting: RowLayoutItemSetting): [SerializedStyles, string];
    render(): React.JSX.Element;
}
export {};
