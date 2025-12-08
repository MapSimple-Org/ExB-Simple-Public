import { React } from 'jimu-core';
import { type InputBaseProps } from './input-base';
import type { ValidityResult } from '../../types';
/**
 * The TextArea component props.
 *
 * Inherits properties from the `HTMLInputElement`, only text related types are accepted for the `type` prop.
 *
 * See [additional props available from HTMLInputElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement).
 */
export interface TextAreaProps extends Omit<InputBaseProps, 'type' | 'size' | 'tag'> {
    height?: number;
    /**
     * A function to check if the text is valid during typing.
     */
    checkValidityOnChange?: (text: string) => ValidityResult;
    /**
      * A function to check if the text is valid when it is accepted (onBlur or press enter key).
      */
    checkValidityOnAccept?: (text: string) => ValidityResult | Promise<ValidityResult>;
    /**
     * Callback fires when the text box is blurred or the `enter` key is pressed,
     * which is considered to be the complete of the editing process.
     */
    onAcceptValue?: (value: string) => void;
}
/**
 * The `TextArea` input component is similar to the `TextInput` component, but creates a large input area and is intended to be used for longer texts, like messages.
 *
 * ```ts
 * import { TextArea } from 'jimu-ui'
 * ```
 */
export declare const TextArea: React.ForwardRefExoticComponent<TextAreaProps & React.RefAttributes<HTMLInputElement>>;
