import { React } from 'jimu-core';
export declare const ManagerReferenceNodeContext: React.Context<Element>;
export declare const ManagerReferenceNodeSetterContext: React.Context<(element: Element) => void>;
export interface ManagerProps {
    children: React.ReactNode;
}
export declare function Manager({ children }: ManagerProps): React.ReactElement;
