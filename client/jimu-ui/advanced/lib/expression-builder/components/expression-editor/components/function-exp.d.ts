import { React, type ImmutableArray } from 'jimu-core';
interface Props {
    exp: string;
    dataSourceIds: ImmutableArray<string>;
    id: string;
    externalId: string;
    isEditable: boolean;
    isDsDisabled: boolean;
    className?: string;
}
export default class FunctionExp extends React.PureComponent<Props, unknown> {
    getFunctionTooltip: (exp: string) => string;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
