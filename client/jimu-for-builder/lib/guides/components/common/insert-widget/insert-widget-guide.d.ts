import { React, ReactRedux, type IMAppConfig, type IMSelection } from 'jimu-core';
import { type StepOnChangeCallBackProps, type GuideProps } from 'jimu-ui/basic/guide';
interface StateToProps {
    appConfig: IMAppConfig;
    widgetSelection: IMSelection;
}
export declare const InsertWidgetGuideComponent: (props: GuideProps & StateToProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const InsertWidgetGuide: ReactRedux.ConnectedComponent<(props: GuideProps & StateToProps) => import("@emotion/react/jsx-runtime").JSX.Element, {
    className?: string;
    disabled?: boolean;
    widgetJson?: import("jimu-core").WidgetJson;
    params?: any;
    run?: boolean;
    steps: import("jimu-ui/basic/guide").Steps;
    footerNav?: string | React.JSX.Element;
    stepIndex?: number;
    conditionalStepIndexes?: import("jimu-ui/basic/guide").ConditionalStepIndexes;
    onStepChange?: (data: StepOnChangeCallBackProps) => void;
    onActionTriggered?: (e: any, step: import("jimu-ui/basic/guide").Step, index: number) => void;
    sectionJson?: import("jimu-core").SectionJson;
    isInjected?: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export {};
