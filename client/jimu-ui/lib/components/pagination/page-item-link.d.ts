import { type PageLinkProps } from './page-link';
export type PaginationItemType = 'previous' | 'start-ellipsis' | 'page' | 'end-ellipsis' | 'next';
interface PageItemLinkProps extends PageLinkProps {
    type: PaginationItemType;
}
export declare const PageItemLink: (props: PageItemLinkProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
