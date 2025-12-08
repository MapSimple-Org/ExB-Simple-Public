import { React, type FieldSchema, type IMFieldSchema, type DataSource, type ImmutableArray, type ImmutableObject, type IMThemeVariables, type IntlShape } from 'jimu-core';
interface Props {
    intl: IntlShape;
    theme: IMThemeVariables;
    fields: ImmutableObject<{
        [jimuName: string]: FieldSchema;
    }>;
    ds: DataSource;
    selectedFields?: ImmutableArray<string>;
    isMultiple?: boolean;
    onFieldClick: (clickedFields: IMFieldSchema[]) => void;
}
interface State {
    isOpen: boolean;
}
export default class CommonList extends React.PureComponent<Props, State> {
    constructor(props: any);
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
