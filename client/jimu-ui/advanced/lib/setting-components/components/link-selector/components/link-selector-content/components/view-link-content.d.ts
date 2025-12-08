import { React, type IMAppConfig, type BrowserSizeMode, type IntlShape, type ImmutableArray, type IMLinkParam, OpenTypes } from 'jimu-core';
interface Props {
    linkParam: IMLinkParam;
    originLinkParam: IMLinkParam;
    onLinkParamChange: any;
    appConfig: IMAppConfig;
    browserSizeMode: BrowserSizeMode;
    intl: IntlShape;
    openTypes: ImmutableArray<OpenTypes>;
}
interface States {
    viewLinkParamArr: string[];
    scrollToViewId: string;
}
export default class ViewLinkContent extends React.PureComponent<Props, States> {
    noScroll: string;
    constructor(props: any);
    componentDidMount(): void;
    static getDerivedStateFromProps(newProps: Props, prevState: States): {
        viewLinkParamArr: string[];
        scrollToViewId: string;
    };
    getInitLinkParam: () => IMLinkParam;
    getInitOpenType: () => OpenTypes;
    pageOrDialogChange: (e: any) => void;
    viewChange: (viewId: string, sectionId: string) => void;
    viewRemove: (viewId: string) => void;
    getDefaultPageOrDialogId: () => string;
    getSelectedViewIds: () => string[];
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
