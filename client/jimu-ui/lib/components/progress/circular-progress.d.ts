import type { BasicProgressProps } from './type';
interface CircularProgressProps extends Pick<BasicProgressProps, 'thickness' | 'value'> {
    /**
     * The size of the component.
     * @default 100
     * Note: only valid when `type` is `circular`.
     */
    size?: number;
}
export declare const CircularProgress: (props: CircularProgressProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
