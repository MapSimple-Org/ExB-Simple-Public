import { type ButtonProps } from 'jimu-ui';
export interface EdgeProps extends ButtonProps {
    detached?: boolean;
    activated?: -1 | 0 | 1 | 2 | 3;
}
export declare const Edge: (props: EdgeProps) => import("@emotion/react/jsx-runtime").JSX.Element;
