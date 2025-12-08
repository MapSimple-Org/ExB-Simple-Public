/** @jsx jsx */
import { React, type IMBoundingBox, type IMLayoutItemJson, type SerializedStyles } from 'jimu-core';
import { type LayoutItemProps, type FixedLayoutItemSetting } from '../../types';
interface OwnProps {
    transformedBBox?: IMBoundingBox;
    index: number;
    layoutItem: IMLayoutItemJson;
}
export default class FixedLayoutItem extends React.PureComponent<LayoutItemProps & OwnProps> {
    getPositionStyle(itemSetting: FixedLayoutItemSetting): [SerializedStyles, string];
    render(): React.JSX.Element;
}
export {};
