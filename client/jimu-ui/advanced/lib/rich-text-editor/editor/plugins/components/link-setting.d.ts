import { React, type ImmutableArray, type UseDataSource, type IMLinkParam } from 'jimu-core';
import { RichTextFormatKeys, FormatType } from '../../../type';
import type { LinkFormatValue } from '../../../quill/format';
import type * as JimuSettingComponentsModule from 'jimu-ui/advanced/setting-components';
export interface LinkSettingProps extends Pick<JimuSettingComponentsModule.LinkSelectorSidePopperProps, 'hiddenLinks' | 'position' | 'title'> {
    /**
     * Whether to show the setting popup.
     */
    open?: boolean;
    /**
     * The value of this component.
     */
    value?: IMLinkParam;
    /**
     * Defines the class names added to the component.
     */
    className?: string;
    /**
     * Defines the style added to the component.
     */
    style?: any;
    /**
     * Use widget id to get widget context, e.g. whether widget is in repeated data source context.
     */
    widgetId?: string;
    /**
     * Widget's `useDataSources`, which means data sources that widget is using.
     * If pass `useDataSources`, link can use these data sources to build `Expression` **(see `jimu-core` API documentation)**.
     */
    useDataSources?: ImmutableArray<UseDataSource>;
    /**
     * Fire callback when value change.
     */
    onChange?: (key: RichTextFormatKeys, value: LinkFormatValue, type: FormatType) => void;
    /**
     * Whether this component is disabled.
     */
    disabled?: boolean;
    /**
   * Whether this component is active.
   */
    active: boolean;
}
export declare const LinkSetting: (props: LinkSettingProps) => React.ReactElement;
