import { React } from 'jimu-core';
import { type TypographyVariant } from 'jimu-theme';
import type { StandardComponentProps } from '../types';
/**
 * The Typography component props.
 */
export interface TypographyProps extends StandardComponentProps {
    /**
     * The unique id added to the element.
     */
    id?: string;
    /**
     * Defines the title added to the element.
     */
    title?: string;
    /**
     * The variant to use.
     * @default body
     */
    variant?: TypographyVariant | 'inherit';
    /**
     * The component used for the root node.
     * Either a string to use a HTML element or a component.
     */
    component?: React.ElementType;
    /**
     * The text color of this component.
     */
    color?: 'inherit' | 'backgroundText' | 'backgroundHint' | 'paperText' | 'paperHint' | 'overlayText' | 'overlayHint' | (string & {});
    /**
     *  If `true`, the text will not wrap, but instead will truncate with a text overflow ellipsis.
     * @default false
     */
    noWrap?: boolean;
    /**
     * The content of the component.
     */
    children?: React.ReactNode | undefined;
}
/**
 * The typography component is used to display text with themed styles.
 * It supports different variants for headings, titles, body text, and labels.
 *
 * ```ts
 * import { Typography } from 'jimu-ui'
 * ```
 */
export declare const Typography: React.ForwardRefExoticComponent<TypographyProps & React.RefAttributes<any>>;
