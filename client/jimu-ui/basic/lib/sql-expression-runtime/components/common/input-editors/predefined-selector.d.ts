import { React, type DataSource, type IMFieldSchema, type ClauseValueOptions, type ClauseValuePair, type IntlShape, type IMThemeVariables, type ImmutableArray, type CodedValue, BrowserSizeMode } from 'jimu-core';
interface PredefinedProps {
    value: ClauseValueOptions;
    dataSource: DataSource;
    runtime: boolean;
    onChange: (valueObj: ClauseValueOptions) => void;
    isSmallSize?: boolean;
    isMultiple?: boolean;
    fieldObj?: IMFieldSchema;
    codedValues?: CodedValue[];
    style?: React.CSSProperties;
    className?: string;
}
/**
 * @ignore
 */
interface ExtraProps {
    theme: IMThemeVariables;
}
interface AppStateProps {
    browserSizeMode: BrowserSizeMode;
}
interface IntlProps {
    intl: IntlShape;
}
interface State {
    isValid: boolean;
    isOpen: boolean;
    value: ImmutableArray<ClauseValuePair>;
}
export declare class _VIPredefinedSelector extends React.PureComponent<PredefinedProps & ExtraProps & IntlProps & AppStateProps, State> {
    headerRef: any;
    externalDsStyle: {
        maxWidth: string;
    };
    constructor(props: any);
    i18nMessage: (id: string, values?: any) => string;
    componentDidUpdate(prevProps: PredefinedProps, prevState: State): void;
    handleToggle: (isDisplay: boolean | undefined) => void;
    handleOkBtn: () => void;
    getInputEditorAtRuntime: (value: any) => any;
    isPredefinedValid: () => boolean;
    handleCancelBtn: () => void;
    onSettingValueChange: (values: any) => void;
    isValuesSet: () => boolean;
    onValueChangeForRuntime: (valuePairs: ClauseValuePair[]) => void;
    getValuesForRuntime: (values: any, isSelect: boolean) => {
        selectedValues: any;
        staticValues: any[];
        valueOptions?: undefined;
    } | {
        valueOptions: ClauseValueOptions & {
            value: any[];
        };
        staticValues: any[];
        selectedValues?: undefined;
    };
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const VIPredefinedSelector: import("@emotion/styled").StyledComponent<Pick<Omit<PredefinedProps & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof PredefinedProps> & {
    theme?: IMThemeVariables;
}, {}, {}>;
export default VIPredefinedSelector;
