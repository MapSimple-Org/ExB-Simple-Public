import { type WidgetJson, type IMThemeVariables, type IntlShape, type ImmutableObject, type RepeatedDataSource } from 'jimu-core';
export interface ComponentExtraProps {
    /**
     * @ignore
     */
    theme: IMThemeVariables;
    /**
     * @ignore
     */
    intl: IntlShape;
    /**
     * @ignore
     */
    repeatedDataSource?: RepeatedDataSource | RepeatedDataSource[];
    className?: string;
}
export declare function getWidgetJson(widgetId: string): ImmutableObject<WidgetJson>;
