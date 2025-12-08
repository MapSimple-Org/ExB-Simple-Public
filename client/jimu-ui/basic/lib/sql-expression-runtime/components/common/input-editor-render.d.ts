import { React, SqlQuerySortOrder } from 'jimu-core';
import type { DataSource, CodedValue, ClauseValueOptions, IMFieldSchema, SqlExpression } from 'jimu-core';
/**
 * @ignore
 */
export interface InputEditorProps {
    'aria-label'?: string;
    'aria-describedby'?: string;
    runtime: boolean;
    valueOptions: ClauseValueOptions;
    fieldObj: IMFieldSchema;
    dataSource: DataSource;
    isSmallSize?: boolean;
    codedValues?: CodedValue[];
    sortType?: 'VALUE' | 'LABEL';
    sortOrder?: SqlQuerySortOrder;
    sqlExpression?: SqlExpression;
    isFromBuilder?: boolean;
    onChange: (valueOptions: ClauseValueOptions) => void;
    customProps?: any;
}
interface State {
    inputEditor: any;
}
export declare class _InputEditorRender extends React.PureComponent<InputEditorProps, State> {
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: InputEditorProps, prevState: State): void;
    _setStateForInputEditor: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * @ignore
 */
export declare const InputEditorRender: typeof _InputEditorRender;
export {};
