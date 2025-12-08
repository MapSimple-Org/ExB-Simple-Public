import type { React } from 'jimu-core';
export interface StyleState<S> {
    styleState?: Partial<S>;
}
export interface StandardComponentProps {
    /**
     * Defines the class names added to the component.
     */
    className?: string;
    /**
     * Defines the styles added to the element.
     */
    style?: React.CSSProperties;
}
