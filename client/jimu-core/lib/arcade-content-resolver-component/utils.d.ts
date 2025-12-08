import type { IntlShape } from 'react-intl';
import type { RepeatedDataSource } from '../repeat-data-source-context';
import type { FeatureProfileContext, ArcadeDataSource, SingleDataSourceProfileVariableInstances } from '../types/arcade-content';
import { type DataSource, type ArcGISQueriableDataSource } from '../data-sources';
export interface ComponentExtraProps {
    /**
     * @ignore
     */
    repeatedDataSource?: RepeatedDataSource | RepeatedDataSource[];
    /**
     * @ignore
     */
    intl: IntlShape;
}
export declare function getArcadeTimeZone(dataSources: ArcGISQueriableDataSource[]): string;
export declare function createFeatureProfileContext(usedForArcadeEditor: boolean, repeatedDataSource: RepeatedDataSource): Promise<FeatureProfileContext>;
export declare function createDataSourcesProfile(usedForArcadeEditor: boolean, dataSourceIds: string[]): __esri.Profile;
export declare function createSingleDataSourceProfileVariableInstances(dataSource: ArcadeDataSource): Promise<SingleDataSourceProfileVariableInstances>;
export declare function waitTime(time: number): Promise<void>;
export declare function isArcadeDataSource(dataSource: DataSource): boolean;
export declare function getArcadeDataSource(dataSourceId: string): ArcadeDataSource;
