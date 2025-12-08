import * as React from 'react';
import type { ImmutableArray } from 'seamless-immutable';
import { type IntlShape } from 'react-intl';
import type { UseDataSource } from '../../types/app-config';
import { type IMDynamicStyle, type IMConditionStyleConfig } from '../../types/dynamic-style';
import { type RepeatedDataSource } from '../../repeat-data-source-context';
interface ConditionStyleResolverComponentProps {
    /**
     * The id of the widget that uses this component.
     */
    widgetId: string;
    /**
     * Widget's `useDataSources`, the data sources that the widget is using.
     */
    useDataSources?: ImmutableArray<UseDataSource>;
    /**
     * The condition style config that need to be resolved.
     */
    conditionStyleConfig?: IMConditionStyleConfig;
    /**
     * This callback will be called when the parsed style changes.
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
type FinalConditionStyleResolverComponentProps = ConditionStyleResolverComponentProps & ExtraProps;
export declare const ConditionStyleResolverComponent: React.FC<import("react-intl").WithIntlProps<Omit<FinalConditionStyleResolverComponentProps, "repeatedDataSource">>> & {
    WrappedComponent: React.ComponentType<Omit<FinalConditionStyleResolverComponentProps, "repeatedDataSource">>;
};
export {};
