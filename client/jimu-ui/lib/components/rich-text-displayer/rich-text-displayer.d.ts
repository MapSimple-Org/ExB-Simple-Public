import { React, type RepeatedDataSource, type UseDataSource, type ImmutableArray, type IMExpressionMap, type LinkParam, type ImmutableObject, type DataRecord, type IMArcadeContentConfigMap, type ArcadeContent } from 'jimu-core';
import { type RichDisplayerProps } from './rich-displayer';
/**
 * The RichTextDisplayer components props.
 */
export interface RichTextDisplayerProps extends RichDisplayerProps {
    /**
     * The data source inherited from the parent widget to parse expressions in rich text.
     */
    repeatedDataSource?: RepeatedDataSource;
    /**
     * The data source of the widget where the component is located to parse expressions in rich text.
     */
    useDataSources?: ImmutableArray<UseDataSource>;
    /**
     * If included, it will use these `records` to resolve the expression.
     * If not, it will use `useDataSources` to create the data source instances, then use these data sources to resolve the expression.
     *
     * Must pass in one of `useDataSources` and `records`.
     */
    records?: {
        [dataSourceId: string]: DataRecord[];
    };
    /**
     * The id of the widget where the component is located.
     */
    widgetId?: string;
    /**
     * Rich text to display in this component.
     */
    value: string;
    /**
     * If the value is empty, placeholder will be displayed.
     */
    placeholder?: string;
}
export interface ArcadeContentWithStatus {
    content: ArcadeContent;
    status: 'loading' | 'ok' | 'error';
}
export interface ArcadeContentMap {
    [arcadeId: string]: ArcadeContentWithStatus;
}
export type IMArcadeContentMap = ImmutableObject<ArcadeContentMap>;
export type IMArcadeContentWithStatus = ImmutableObject<ArcadeContentWithStatus>;
export declare const useClickLinkHandler: (onClick: (evt: any) => void) => [HTMLLinkElement, LinkParam | string, string[], (evt?: React.MouseEvent<HTMLElement>) => void];
export declare const useParsedExpressions: (html: string) => IMExpressionMap;
export declare const useParsedArcades: (html: string) => IMArcadeContentConfigMap;
export declare const useResolvedHtml: (propHtml: string, expressionValues: ImmutableObject<{
    [id: string]: string;
}>, arcadeValues: ImmutableObject<{
    [id: string]: string;
}>) => string;
/**
 * The `RichTextDisplayer` component provides the user the ability to show the results of the `RichTextEditor`.
 *
 * Note: This component will handle the jump of the link and the parsing of the expression together.
 * If you just display pure rich text, please use component `RichDisplayer`.
 *
 * ```ts
 * import { RichTextDisplayer } from 'jimu-ui'
 * ```
 */
export declare const RichTextDisplayer: React.NamedExoticComponent<RichTextDisplayerProps & React.RefAttributes<HTMLDivElement>>;
