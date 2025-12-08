import { React } from 'jimu-core';
import { type StandardComponentProps } from 'jimu-ui';
export type FontStyles = 'bold' | 'italic' | 'underline' | 'strike';
interface FontStyleItemProps extends StandardComponentProps {
    /**
     * Type of this component.
     */
    type: FontStyles;
    /**
     * Defines the size of the button group.
     * @default sm
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * Value of this component.
     */
    value?: boolean;
    /**
     * Whether to apply a default value when the input is empty.
     * @default true
     */
    applyDefaultValue?: boolean;
    /**
     * Invoked when the value changes.
     */
    onChange?: (value: boolean, evt?: React.MouseEvent<HTMLButtonElement>) => void;
}
export declare const FontStyleItem: (props: FontStyleItemProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
