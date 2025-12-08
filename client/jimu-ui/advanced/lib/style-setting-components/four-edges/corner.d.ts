import { type ButtonProps } from 'jimu-ui';
interface CornerProps extends ButtonProps {
    detached?: boolean;
    activated?: -1 | 0 | 1 | 2 | 3;
}
export declare const Corner: (props: CornerProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
