import { React, type IMAppConfig, type IntlShape, type IMLinkParam } from 'jimu-core';
interface Props {
    linkParam: IMLinkParam;
    originLinkParam: IMLinkParam;
    onLinkParamChange: any;
    appConfig: IMAppConfig;
    intl: IntlShape;
}
export default class DialogLinkContent extends React.PureComponent<Props, unknown> {
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    getInitLinkParam: () => IMLinkParam;
    setLinkParam: (newSelectItem: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
