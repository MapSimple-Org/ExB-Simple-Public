import type { ListGroupItemProps as RSListGroupItemProps } from 'reactstrap';
export type ListGroupItemProps = Omit<RSListGroupItemProps, 'color' | 'action'>;
export declare const ListGroupItem: (props: ListGroupItemProps) => import("@emotion/react/jsx-runtime").JSX.Element;
