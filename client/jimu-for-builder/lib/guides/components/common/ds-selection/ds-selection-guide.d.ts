import { React, ReactRedux, type ImmutableObject, type ImmutableArray, type DataSourceInfo, type UseDataSource, type WidgetJson } from 'jimu-core';
import { type Step, type Steps, type StepOnChangeCallBackProps, type GuideProps } from 'jimu-ui/basic/guide';
interface StateToProps {
    dataSourcesInfo: ImmutableObject<{
        [dsId: string]: DataSourceInfo;
    }>;
    widgetDs: ImmutableArray<UseDataSource>;
    widgetJson: WidgetJson;
}
export declare const DataSourceSelectionGuide: ReactRedux.ConnectedComponent<(props: GuideProps & StateToProps) => import("@emotion/react/jsx-runtime").JSX.Element, {
    className?: string;
    disabled?: boolean;
    params?: any;
    run?: boolean;
    steps: Steps;
    footerNav?: string | React.JSX.Element;
    stepIndex?: number;
    conditionalStepIndexes?: import("jimu-ui/basic/guide").ConditionalStepIndexes;
    onStepChange?: (data: StepOnChangeCallBackProps) => void;
    onActionTriggered?: (e: any, step: Step, index: number) => void;
    sectionJson?: import("jimu-core").SectionJson;
    isInjected?: boolean;
    widgetJson?: WidgetJson;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export {};
