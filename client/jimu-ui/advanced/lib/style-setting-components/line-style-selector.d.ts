import { type LineType, type StandardComponentProps } from 'jimu-ui';
export interface LineStyleProps extends StandardComponentProps {
    /**
     * Define the text displayed in the input when the component has no value.
     */
    placeholder?: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     * With this prop, a sr-only DOM would be created with this label before value DOM.
     */
    'aria-label'?: string;
    /**
     * Two supported types, `normal` represents common line types, including `solid`, `dashed`, `dotted`, and `double`;
     * `symbol` indicates the line type supported by esri symbol, including `esriSLSSolid`, `esriSLSDash`, etc.
     */
    type?: 'normal' | 'symbol';
    /**
     * The value of this component.
     */
    value?: LineType;
    /**
     * Invoked when the value is changed.
     */
    onChange?: (value: string) => void;
}
export declare const LineStyleSelector: (props: LineStyleProps) => import("@emotion/react/jsx-runtime").JSX.Element;
