import { React } from 'jimu-core';
interface RichTextEffectProps {
    value: string;
    disabled?: boolean;
    onChange?: (value: string) => void;
}
export declare const RichTextEffect: (props: RichTextEffectProps) => React.ReactElement;
export {};
