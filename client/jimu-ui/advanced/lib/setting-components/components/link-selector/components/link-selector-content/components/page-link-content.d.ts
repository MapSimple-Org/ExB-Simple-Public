import { React, type IMAppConfig, type IntlShape, type ImmutableArray, type IMLinkParam, OpenTypes } from 'jimu-core';
interface Props {
    linkParam: IMLinkParam;
    originLinkParam: IMLinkParam;
    onLinkParamChange: any;
    appConfig: IMAppConfig;
    intl: IntlShape;
    openTypes: ImmutableArray<OpenTypes>;
}
export default class PageLinkContent extends React.PureComponent<Props, unknown> {
    componentDidMount(): void;
    getInitLinkParam: () => IMLinkParam;
    setLinkParam: (newSelectItem: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
