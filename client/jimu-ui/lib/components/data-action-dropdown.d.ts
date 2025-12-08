import { React, type ThemeButtonType, type DataRecordSet } from 'jimu-core';
import type { ButtonSize } from './button';
interface DataActionDropDownProps {
    widgetId: string;
    dataSets: DataRecordSet[];
    type?: ThemeButtonType;
    size?: ButtonSize;
}
/**
 * @deprecated
 * This component is deprecated, please use `DataActionList` and pass `DataActionListStyle.Dropdown` as
 * the `listStyle`'s value to get the same experience. The `type` and `size` fields are renamed to `buttonType`
 * and `buttonSize`.
 * Please do notice that UI style might change
 * a little for hover & click, overwritten the style as you need.
 */
export declare class DataActionDropDown extends React.PureComponent<DataActionDropDownProps> {
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
