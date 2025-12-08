import { React, type IntlShape, type IMLinkParam } from 'jimu-core';
interface Props {
    linkParam: IMLinkParam;
    originLinkParam: IMLinkParam;
    onLinkParamChange: any;
    intl: IntlShape;
}
export default class BlockLinkContent extends React.PureComponent<Props, unknown> {
    componentDidMount(): void;
    getInitLinkParam: () => IMLinkParam;
    getBlockData: () => Array<{
        id: string;
        name: string;
    }>;
    setLinkParam: (newSelectItem: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
