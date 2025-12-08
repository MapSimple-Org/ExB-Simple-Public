import { React } from 'jimu-core';
export type ReactRef = (ref?: HTMLElement) => any | {
    current?: HTMLElement;
};
export interface ReferenceChildrenProps {
    ref: ReactRef;
}
export interface ReferenceProps {
    className?: string;
    children: (ReferenceChildrenProps: any) => React.ReactElement;
    innerRef?: ReactRef;
}
export declare function Reference({ className, children, innerRef }: ReferenceProps): React.ReactElement;
