import { React } from 'jimu-core';
import type { Sanitizer } from '@esri/arcgis-html-sanitizer';
/**
 * The `RichDisplayer` components props.
 */
export interface RichDisplayerProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Rich text to display.
     */
    value?: string;
    /**
     * @default: `defaultSanitizer`
     * @ignore
     *
     * For sanitizing rich text.
     */
    sanitizer?: Sanitizer;
}
/**
 * The `RichDisplayer` component provides the user the ability to show the results of the `RichTextEditor`.
 *
 * Note: This component will only handle pure rich text.
 * If you want to handle link jump and expression parsing, please use component `RichTextDisplayer`.
 *
 * ```ts
 * import { RichDisplayer } from 'jimu-ui'
 * ```
 */
export declare const RichDisplayer: React.NamedExoticComponent<RichDisplayerProps & React.RefAttributes<HTMLDivElement>>;
