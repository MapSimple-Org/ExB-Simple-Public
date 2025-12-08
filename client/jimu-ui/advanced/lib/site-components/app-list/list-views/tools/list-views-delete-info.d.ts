/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
import type { AppItem } from '../../types/types';
interface Props {
    apps: AppItem[];
    isOpen: boolean;
    deleteApps: (appIds: string[]) => Promise<void>;
    toggle: () => void;
    intl?: IntlShape;
}
export declare class ListViewsDeleteInfo extends React.PureComponent<Props, unknown> {
    focusTimeout: any;
    getStyle: () => import("jimu-core").SerializedStyles;
    componentDidUpdate(prevProps: Props): void;
    stopPropagation: (e: any) => void;
    handleCancelClick: (e: any) => void;
    handleDeleteClick: (e: any) => void;
    deleteApps: () => void;
    nls: (id: string, opt?: any) => string;
    getModalStyle: () => import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
