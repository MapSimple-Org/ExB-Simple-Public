/** @jsx jsx */
import { React } from 'jimu-core';
import type { ValidityResult } from '../../types';
import { type InputBaseProps } from './input-base';
export type TextInputType = 'text' | 'email' | 'select' | 'file' | 'date' | 'datetime-local' | 'month' | 'search' | 'tel' | 'week' | 'password' | 'datetime' | 'time';
/**
 * The TextInput component props.
 *
 * Inherits properties from the `HTMLInputElement`, only text related types are accepted for the `type` prop.
 *
 * See [additional props available from HTMLInputElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement).
 */
export interface TextInputProps extends Omit<InputBaseProps, 'type' | 'prefix'> {
    /**
     * The type attribute applied to the root input element.
     */
    type?: TextInputType;
    /**
     * If allow a clear icon to clear the input content.
     */
    allowClear?: boolean;
    /**
     * An optional suffix node append to the start of the input
     */
    prefix?: React.ReactNode;
    /**
     * An optional suffix node append to the end of the input
     */
    suffix?: React.ReactNode;
    /**
     * If the text input has no border.
     */
    borderless?: boolean;
    /**
     * A function to check if the text is valid during typing.
     */
    checkValidityOnChange?: (text: string) => ValidityResult | Promise<ValidityResult>;
    /**
     * A function to check if the text is valid when it is accepted (onBlur or press enter key).
     */
    checkValidityOnAccept?: (text: string) => ValidityResult | Promise<ValidityResult>;
    /**
     * Callback fires when the text box is blurred or the `enter` key is pressed,
     * which is considered to be the complete of the editing process.
     */
    onAcceptValue?: (value: string) => void;
    /**
     * The callback function that is triggered when Enter key is pressed.
     */
    onPressEnter?: (evt: React.KeyboardEvent<HTMLInputElement>) => void;
}
/**
 * The `TextInput` component provides the user with a text field to input string content.
 *
 * ```ts
 * import { TextInput } from 'jimu-ui'
 * ```
 */
export declare const TextInput: React.ForwardRefExoticComponent<TextInputProps & React.RefAttributes<HTMLInputElement>>;
