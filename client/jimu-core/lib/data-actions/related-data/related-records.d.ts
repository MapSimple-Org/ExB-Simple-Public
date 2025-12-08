import type { FeatureLayerDataSource } from '../../data-sources';
import type { UIComponents } from './index';
export interface RelatedRecordsProps {
    widgetId: string;
    relatedDs: FeatureLayerDataSource;
    relatedIds: string[];
    version: number;
    dataViewInfo: {
        [version: number]: FeatureLayerDataSource[];
    };
    showBack: boolean;
    onBack: () => void;
    uiComponents: UIComponents;
}
export declare enum SelectionModeType {
    Single = "SINGLE",
    Multiple = "MULTIPLE"
}
export default function RelatedRecords(props: RelatedRecordsProps): import("@emotion/react/jsx-runtime").JSX.Element;
