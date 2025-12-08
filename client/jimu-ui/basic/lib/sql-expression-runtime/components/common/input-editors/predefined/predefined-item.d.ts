/** @jsx jsx */
import { React, type IntlShape, type ImmutableArray, type DataSource, type ClauseValuePair, type IMFieldSchema, type ImmutableObject, type CodedValue } from 'jimu-core';
/**
 * The PredefinedItem properties
 */
export interface PredefinedItemProps {
    index: number;
    value?: ClauseValuePair;
    excludeValues?: ImmutableArray<ClauseValuePair>;
    allValues?: ImmutableArray<ClauseValuePair>;
    codedValues?: CodedValue[];
    dataSource: DataSource;
    onChange: (index: number, value: ImmutableObject<ClauseValuePair>) => void;
    isMultiple?: boolean;
    field: IMFieldSchema;
}
interface IntlProps {
    intl: IntlShape;
}
export declare const PredefinedItem: React.FC<import("react-intl").WithIntlProps<PredefinedItemProps & IntlProps>> & {
    WrappedComponent: React.ComponentType<PredefinedItemProps & IntlProps>;
};
export default PredefinedItem;
