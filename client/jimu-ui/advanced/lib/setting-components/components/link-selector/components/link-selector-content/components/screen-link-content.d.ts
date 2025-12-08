import { React, type IntlShape, type IMLinkParam } from 'jimu-core';
interface Props {
    linkParam: IMLinkParam;
    originLinkParam: IMLinkParam;
    onLinkParamChange: any;
    intl: IntlShape;
}
export default class BlockLinkContent extends React.PureComponent<Props, unknown> {
    screenGroupLabelStyle: {
        marginLeft: string;
    };
    componentDidMount(): void;
    getInitLinkParam: () => IMLinkParam;
    getScreenData: () => import("jimu-layouts/lib/search/contents").ScreenAnchorPoint[];
    setLinkParam: (e: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
