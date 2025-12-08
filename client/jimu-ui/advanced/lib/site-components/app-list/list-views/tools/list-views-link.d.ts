/** @jsx jsx */
import { React } from 'jimu-core';
interface CardLinkProps {
    href?: string;
    target?: '_self' | '_blank';
    children?: React.ReactElement | React.ReactNode;
    className?: string;
    onClick: () => void;
    onKeyDown: (evt: any) => void;
    title: string;
    a11yMessageId?: string;
}
export declare const ListViewsLink: (props: CardLinkProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
