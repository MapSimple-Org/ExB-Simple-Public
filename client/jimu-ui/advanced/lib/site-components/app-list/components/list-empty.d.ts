/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
import { AppAccessTypes, TemplateAccessTypes } from '../types/types';
interface Props {
    accessType: AppAccessTypes | TemplateAccessTypes;
    isTemplateList: boolean;
    searchText: string;
    hasOtherSearchParams: boolean;
    intl: IntlShape;
    isImportAppListEmpty?: boolean;
}
interface States {
    emptyTextTop: string;
    emptyTextBottom: string;
}
export declare class ListEmpty extends React.PureComponent<Props, States> {
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    getEmptyText: () => void;
    nls: (id: string) => string;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
