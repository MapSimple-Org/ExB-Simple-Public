import { React, type ImmutableArray, type UseDataSource } from 'jimu-core';
import { type Formats, FormatType, RichTextFormatKeys } from '../../../type';
import type { RichPluginRequiredProps } from '../plugin';
export interface RichTextFormatsPanelProps extends Omit<RichPluginRequiredProps, 'onChange'> {
    /**
     * It's used to get widget context, e.g. whether widget is in repeated data source context.
     * Note: Used in `LinkSetting` components, if `linkWebAddressOnly` is true, this property is not required.
     */
    widgetId?: string;
    /**
     * Defines the class names added to the element.
     */
    className?: string;
    /**
     * Defines the style added to the element.
     */
    style?: any;
    /**
     * Widget's `useDataSources`, which means data sources that widget is using.
     * If pass `useDataSources`, link can use these data sources to build `Expression` **(see `jimu-core` API documentation)**.
     *
     * Note: Used in `LinkSetting` components, if `linkWebAddressOnly` is true, this property is not required.
     */
    useDataSources?: ImmutableArray<UseDataSource>;
    /**
     * The format of the current selection, used to activate the relevant ui of the current formats setting.
     */
    formats: Formats;
    /**
     * Callback when format change.
     */
    onChange?: (key: RichTextFormatKeys, value: any, type: FormatType) => void;
    /**
     * Whether to disable intend setting.
     */
    disableIndent?: boolean;
    /**
     * Whether to disable image selector.
     */
    disableImage?: boolean;
    /**
     * Whether to disable link setting.
     */
    disableLink?: boolean;
    /**
     * Whether to hide rich text effect settings.
     * @default false
     */
    hideEffect?: boolean;
    /**
     * Whether to hide rich text heading settings.
     * @default false
     */
    hideHeading?: boolean;
    /**
     * Whether to display only web address link settings.
     * @default false
     */
    linkWebAddressOnly?: boolean;
}
export declare const RichTextFormatsPanel: (props: RichTextFormatsPanelProps) => React.ReactElement;
