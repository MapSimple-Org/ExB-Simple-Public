import { React, type IMLinkParam } from 'jimu-core';
interface Props {
    datas: any[];
    linkParam: IMLinkParam;
    onClick: any;
    'aria-label': string;
}
export default class LinkSelectorList extends React.PureComponent<Props, unknown> {
    itemOnClick: (newSelectItem: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
