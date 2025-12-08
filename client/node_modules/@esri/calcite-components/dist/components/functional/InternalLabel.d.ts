import { TemplateResult } from 'lit-html';
interface InternalLabelProps {
    alignmentCenter?: boolean;
    bottomSpacingDisabled?: boolean;
    labelText?: string;
    onClick?: () => void;
    required?: boolean;
    spacingInlineEnd?: boolean;
    spacingInlineStart?: boolean;
    tooltipText?: string;
}
export declare const CSS: {
    alignmentCenter: string;
    alignmentEnd: string;
    container: string;
    requiredIndicator: string;
    spacingBottom: string;
    spacingInlineEnd: string;
    spacingInlineStart: string;
    text: string;
};
/**
 * @slot label-content - A slot for rendering content next to the component's `labelText`.
 */
export declare const InternalLabel: ({ alignmentCenter, bottomSpacingDisabled, labelText, onClick, required, spacingInlineEnd, spacingInlineStart, tooltipText, }: InternalLabelProps) => TemplateResult;
export {};
