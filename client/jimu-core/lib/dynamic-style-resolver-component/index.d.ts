import * as React from 'react';
import type { ImmutableArray } from 'seamless-immutable';
import { type IntlShape } from 'react-intl';
import type { UseDataSource } from '../types/app-config';
import { type IMDynamicStyle, type IMDynamicStyleConfig } from '../types/dynamic-style';
import { type RepeatedDataSource } from '../repeat-data-source-context';
export interface DynamicStyleResolverComponentProps {
    /**
     * The id of the widget that uses this component.
     */
    widgetId: string;
    /**
     * Widget's `useDataSources`, the data sources that the widget is using.
     */
    useDataSources: ImmutableArray<UseDataSource>;
    /**
     * The dynamic style config that need to be resolved.
     */
    dynamicStyleConfig: IMDynamicStyleConfig;
    /**
     * This callback will be called when the parsed style changes. The parsed style maybe null.
     * @param style
     */
    onChange?: (style: IMDynamicStyle) => void;
}
interface ExtraProps {
    /**
     * @ignore
     */
    intl: IntlShape;
    /**
     * @ignore
     */
    repeatedDataSource: RepeatedDataSource | RepeatedDataSource[];
}
type FinalConditionStyleResolverComponentProps = DynamicStyleResolverComponentProps & ExtraProps;
/**
 * The component is used to resolve dynamic style.
 *
 * ```ts
 * import { DynamicStyleResolverComponent } from 'jimu-core'
 * ```
 */
export declare const DynamicStyleResolverComponent: React.FC<import("react-intl").WithIntlProps<Omit<FinalConditionStyleResolverComponentProps, "repeatedDataSource">>> & {
    WrappedComponent: React.ComponentType<Omit<FinalConditionStyleResolverComponentProps, "repeatedDataSource">>;
};
export {};
