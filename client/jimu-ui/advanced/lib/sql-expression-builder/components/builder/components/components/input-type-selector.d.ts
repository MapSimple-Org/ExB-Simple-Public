/** @jsx jsx */
import { React, type IntlShape, type CodedValue, type DataSource } from 'jimu-core';
import { ClauseInputEditor } from 'jimu-ui/basic/sql-expression-runtime';
interface Props {
    inputEditorType: ClauseInputEditor;
    list: ClauseInputEditor[];
    fieldName: string;
    codedValues: CodedValue[];
    dataSource: DataSource;
    onSelect: (inputEditorType: ClauseInputEditor) => void;
    isForGroupFilter?: boolean;
    className?: string;
}
interface IntlProps {
    intl: IntlShape;
}
interface State {
    isOpen: boolean;
    isWarningShown: boolean;
    inputEditorType: string;
}
export declare class _InputEditorTypeSelector extends React.PureComponent<Props & IntlProps, State> {
    styleBtnRef: any;
    rtl: string;
    constructor(props: any);
    i18nMessage: (id: string) => string;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    onTypeSelect: (evt: any, inputEditorType: ClauseInputEditor) => void;
    changeValueOptionByInputType: (inputEditorType: ClauseInputEditor, count?: any) => void;
    toggle: () => void;
    getWarningDOM: () => import("@emotion/react/jsx-runtime").JSX.Element;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const InputEditorTypeSelector: import("@emotion/styled").StyledComponent<Omit<Props & IntlProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default InputEditorTypeSelector;
