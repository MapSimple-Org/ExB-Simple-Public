/** @jsx jsx */
import { React } from 'jimu-core';
import { FormatType, type Formats, RichTextFormatKeys } from '../../../type';
export interface RichToolbarProps {
    className?: string;
    style?: any;
    formats?: Formats;
    onClear?: () => void;
    onChange?: (key: RichTextFormatKeys, value: any, type: FormatType, focus?: boolean) => void;
    showLinkSetting?: boolean;
}
export declare const RichToolbar: (props: RichToolbarProps) => React.ReactElement;
