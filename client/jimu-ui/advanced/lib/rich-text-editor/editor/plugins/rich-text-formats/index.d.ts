import { React } from 'jimu-core';
import type { RichTextFormatKeys } from '../../../type';
import { type RichTextFormatsPanelProps } from './rich-formats';
import type { RichPluginRequiredProps } from '../plugin';
/**
 * The `RichTextFormats` component props.
 */
export interface RichTextFormatProps extends Omit<RichPluginRequiredProps, 'onChange'>, Omit<RichTextFormatsPanelProps, 'onChange' | 'disableLink' | 'disableIndent'> {
    /**
     * Callback when text change.
     */
    onChange?: (text: string, key: RichTextFormatKeys, value: any) => void;
}
/**
 * The `RichTextFormats` component is used to provide the user the ability to format rich text,
 * which must be used with component `RichTextEditor`.
 *
 * Note: This component can only be used in `Builder`.
 */
export declare const RichTextFormats: (props: RichTextFormatProps) => React.ReactElement;
