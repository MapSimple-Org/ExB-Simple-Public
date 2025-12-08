/** @jsx jsx */
import { React } from 'jimu-core';
import type { Sources } from '../../../type';
import { type PopperProps } from 'jimu-ui';
import type { RichPluginRequiredProps } from '../plugin';
/**
 * The `Bubble` component props.
 */
export interface BubblePluginProps extends RichPluginRequiredProps, Omit<PopperProps, 'children' | 'reference' | 'open' | 'version' | 'onChange'> {
    /**
     * Specify the trigger source when editing through the current component.
     */
    source?: Sources;
    /**
     * `Bubble` will be hidden when version changes.
     */
    version?: number;
    /**
     * Whether the link-setting is visible.
     */
    showLinkSetting?: boolean;
}
/**
 * The `Bubble` component is used to provide the user the ability to format the text in a small pop-up,
 * which must be used with component `RichTextEditor`.
 */
export declare const Bubble: (props: BubblePluginProps) => React.ReactElement;
