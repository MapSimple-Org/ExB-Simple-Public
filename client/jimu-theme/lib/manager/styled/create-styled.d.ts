import { React } from 'jimu-core';
import { type PropsOf, type CreateStyledComponent, type StyledTags, type CSSInterpolation } from '../../__emotion__';
import type { Theme, ComponentsStyleStateList, ComponentsVarsList, ComponentNameToPartKey } from '../../system';
import type { JSX } from 'react';
export declare function shouldForwardProp(prop: string): boolean;
type ComponentVars<Name extends keyof ComponentNameToPartKey, Part extends ComponentNameToPartKey[Name]> = Partial<ComponentsVarsList[Name][Part]>;
type ComponentStyleState<Name extends keyof ComponentNameToPartKey> = Partial<ComponentsStyleStateList[Name]>;
interface StyledOptions<Name extends keyof ComponentNameToPartKey, Part extends ComponentNameToPartKey[Name], Theme = unknown> {
    /**
     * Emotion adds a CSS property called label which is appended to the generated class name to make it more readable
     */
    label?: string;
    /**
     * By default, Emotion passes all props (except for theme) to custom components and only props that are valid html attributes for string tags.
     * You can customize this by passing a custom shouldForwardProp function.
     */
    shouldForwardProp?: (propName: string) => boolean;
    /**
     * The component name.
     * Component names require each word to have its first letter capitalized
     */
    name?: Name;
    /**
     * The name of the nested element in the component. The styles of some elements of a component can be precisely overridden in the theme according to the `part` name.
     * The root node part name is fixed as "root", and each part name must be lowercase.
     */
    part?: Part;
    /**
     * The function to convert the variables of the component into styles.
     * @param props
     */
    varsResolver?: (props: {
        theme: Theme;
        vars: ComponentVars<Name, Part>;
        styleState?: ComponentStyleState<Name>;
    }) => CSSInterpolation;
}
export interface CreatedStyled<T extends object = Theme> extends StyledTags {
    <C extends React.ComponentType<React.ComponentProps<C>>>(component: C): CreateStyledComponent<PropsOf<C> & {
        theme?: T;
        styleState?: unknown;
    }>;
    <C extends React.ComponentType<React.ComponentProps<C>>, Name extends keyof ComponentNameToPartKey, Part extends ComponentNameToPartKey[Name]>(component: C, options?: StyledOptions<Name, Part, T>): CreateStyledComponent<PropsOf<C> & {
        theme?: T;
        styleState?: ComponentStyleState<Name>;
    }>;
    <Tag extends keyof JSX.IntrinsicElements>(tag: Tag): CreateStyledComponent<{
        theme?: T;
        styleState?: unknown;
        as?: React.ElementType;
    }, JSX.IntrinsicElements[Tag]>;
    <Tag extends keyof JSX.IntrinsicElements, Name extends keyof ComponentNameToPartKey, Part extends ComponentNameToPartKey[Name]>(tag: Tag, options?: StyledOptions<Name, Part, T>): CreateStyledComponent<{
        theme?: T;
        styleState?: ComponentStyleState<Name>;
        as?: React.ElementType;
    }, JSX.IntrinsicElements[Tag]>;
}
declare const createStyled: <T extends object = Theme>(input?: {
    defaultTheme?: T;
    rootShouldForwardProp?: (prop: PropertyKey) => boolean;
    partShouldForwardProp?: (prop: PropertyKey) => boolean;
}) => CreatedStyled<T>;
export default createStyled;
