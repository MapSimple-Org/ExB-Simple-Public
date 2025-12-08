import { React } from 'jimu-core';
import type { Sources } from '../../../type';
import type { RichPluginRequiredProps } from '../plugin';
import type * as JimuArcadeContentBuilder from 'jimu-ui/advanced/arcade-content-builder';
/**
 * The `RichArcadeContentBuilder` component props.
 */
export interface RichArcadeContentBuilderProps extends RichPluginRequiredProps, Omit<JimuArcadeContentBuilder.ArcadeContentBuilderProps, 'arcade' | 'onChange'> {
    /**
     * Defines the class names added to the component.
     */
    className?: string;
    /**
     * Specify the trigger source when editing through the current component.
     */
    source?: Sources;
    /**
     * Whether to allow editing of arcade tags
     */
    editable?: boolean;
    /**
     * Whether to automatically insert a space after the arcade tag
     */
    autoInsertSpace?: boolean;
}
/**
 * The `RichArcadeContentBuilder` component is used to provide the user the ability to insert arcade to rich text editor in the form of popups,
 * which must be used with component `RichTextEditor`.
 */
export declare const RichArcadeContentBuilder: (props: RichArcadeContentBuilderProps) => React.ReactElement;
