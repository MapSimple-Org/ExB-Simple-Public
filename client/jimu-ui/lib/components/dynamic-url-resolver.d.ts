import { React, type RepeatedDataSource, type UseDataSource, type ImmutableArray } from 'jimu-core';
export declare const DATA_URLINFO_REGEXP: RegExp;
export interface DynamicUrlResolverProps {
    /**
     * The data source inherited from the parent widget to parse expressions in rich text
     */
    repeatedDataSource?: RepeatedDataSource;
    /**
     * The data source of the widget where the component is located to parse expressions in rich text
     */
    useDataSources?: ImmutableArray<UseDataSource>;
    /**
     * The id of the widget where the component is located
     */
    widgetId?: string;
    /**
     * Rich text to display in this component
     */
    value: string;
    /**
     * Resolve the html to url, even the data or app url is not avialiable, in this case, it will resolve the url that contains "{}"
     * @param hasExpressionUnresolved Return true when parsing is not complete(Feature is not selected or DS and URL params are unavailable)
     */
    onHtmlResolved: (url: any, hasExpressionUnresolved: any) => void;
}
export declare const DynamicUrlResolver: React.ForwardRefExoticComponent<DynamicUrlResolverProps & React.RefAttributes<HTMLDivElement>>;
