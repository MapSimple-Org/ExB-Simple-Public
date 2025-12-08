/** @jsx jsx */
import { React } from 'jimu-core';
import type { IMThemeVariables, IntlShape } from 'jimu-core';
interface Props {
    intl?: IntlShape;
    theme?: IMThemeVariables;
    style?: React.CSSProperties;
}
export declare class Empty extends React.PureComponent<Props, unknown> {
    nls: (id: string) => string;
    getStyle: () => import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
