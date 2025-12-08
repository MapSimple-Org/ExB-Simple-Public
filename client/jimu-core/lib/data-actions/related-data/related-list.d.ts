import type { FeatureLayerDataSource, FeatureDataRecord } from '../../data-sources';
import type { UIComponents } from './index';
export interface RelatedListProps {
    widgetId: string;
    dataSource: FeatureLayerDataSource;
    records: FeatureDataRecord[];
    version: number;
    dataViewInfo: {
        [version: number]: FeatureLayerDataSource[];
    };
    uiComponents: UIComponents;
}
export default function RelatedList(props: RelatedListProps): import("@emotion/react/jsx-runtime").JSX.Element;
