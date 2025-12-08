import * as React from 'react';
import type { ImmutableArray } from 'seamless-immutable';
import type { UseDataSource } from '../../../../types/app-config';
import type { DataSourcesProfileContext } from '../../../../types/arcade-content';
import { type ComponentExtraProps } from '../../../utils';
export interface DataSourcesProfileContextProviderProps {
    usedForArcadeEditor: boolean;
    widgetId: string;
    useDataSources: ImmutableArray<UseDataSource>;
    onProfileContextChange: (profileContext: DataSourcesProfileContext, ready: boolean) => void;
    onDirty: () => void;
}
type FinalDataSourcesProfileContextProviderProps = DataSourcesProfileContextProviderProps & ComponentExtraProps;
export declare const DataSourcesProfileContextProvider: React.FC<import("react-intl").WithIntlProps<FinalDataSourcesProfileContextProviderProps>> & {
    WrappedComponent: React.ComponentType<FinalDataSourcesProfileContextProviderProps>;
};
export {};
