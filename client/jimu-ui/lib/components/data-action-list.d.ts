import { type DataAction, type DataRecordSet, type ThemeButtonType } from 'jimu-core';
import type { ButtonSize } from './button';
export declare enum DataActionListStyle {
    IconList = "ICON_LIST",
    List = "LIST",
    Dropdown = "DROPDOWN"
}
export declare enum IconListDirection {
    Horizontal = "HORIZONTAL",
    Vertical = "VERTICAL"
}
/**
 * The DataActionList component props.
 */
interface DataActionListProps {
    /**
     * The widget's ID that is using this data-action list
     */
    widgetId: string;
    /**
     * The dataSets used for generating data-action list
     */
    dataSets: DataRecordSet[];
    /**
     * The data-action-list style, it can be 'List', 'IconList', or 'Dropdown', please use the variables provided in `DataActionListStyle`
     * @default List
     */
    listStyle?: DataActionListStyle;
    /**
     * The button type of the dropdown button
     * @default default
     */
    buttonType?: ThemeButtonType;
    /**
     * The button size of the dropdown button
     * @default sm
     */
    buttonSize?: ButtonSize;
    /**
     * The extra button classnames of the dropdown button
     */
    buttonClassName?: string;
    /**
     * The icon list's direction, it can be Horizontal or Vertical, please use the variables provided in `IconListDirection`
     * @default Horizontal
     */
    iconListDirection?: IconListDirection;
    /**
     * Hide the data source level actions
     * @default false
     */
    disableDataSourceLevelActions?: boolean;
    /**
     * Hide the group title (All Data, Loaded, .etc) when there is only one group type
     * @default false
     */
    hideGroupTitle?: boolean;
    /**
     * Render nothing when no action is supported
     * @default false
     */
    shouldHideEmptyList?: boolean;
    /**
     * The callback function of clicking an action */
    onActionListItemClick?: () => void;
    /**
     * Always display the dropdown icon in the batch-style even if there's only one dataSet
     * @default false
     */
    alwaysShowBatchIcon?: boolean;
    /**
     * The reference anchor DOM node for the list mode's popper
     */
    actionPanelRefDOM?: HTMLElement;
    /**
     * The extra data actions that the widget wants to support
     */
    extraActions?: DataAction[];
    /**
     * @ignore
     * Fired when the list is loaded, it's for the map-layers remove action case
     */
    whenListLoaded?: () => any;
}
/**
 * This DataActionList component is used to display available data action in a list, icon list, or dropdown style.
 * Widgets that need to use DataAction can use this component.
 * To display in a specific style, just pass `listStyle` with ‘List', ‘IconList’, or ‘Dropdown' provided in the `DataActionListStyle`
 *
 * ```ts
 * import { DataActionList } from 'jimu-ui'
 * ```
 */
export declare const DataActionList: (props: DataActionListProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
