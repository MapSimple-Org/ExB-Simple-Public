import type { CSSInterpolation } from '../../__emotion__';
import type { ComponentsStyleStateList } from './style-states';
import type { ComponentNameToPartKey } from './parts';
import type { ComponentsVarsList } from './vars';
/**
 * The style rules for overriding component styles.
 */
export type OverridesStyleRules<Props = {
    [key: string]: unknown;
}, Theme = unknown> = CSSInterpolation | string | ((props: {
    styleState?: Props & {
        [key: string]: any;
    };
} & {
    theme: Theme;
} & {
    [key: string]: any;
}) => CSSInterpolation);
export type OverridesVarsRulesJson<Vars = {
    [key: string]: unknown;
}> = Vars & {
    [key: string]: any;
};
export type OverridesVarsRules<Vars = {
    [key: string]: unknown;
}, Theme = unknown> = OverridesVarsRulesJson<Vars> | ((theme: Theme) => OverridesVarsRulesJson<Vars>);
interface PartOverridesRules<Name = keyof ComponentNameToPartKey, PartKey = Name extends keyof ComponentNameToPartKey ? keyof ComponentNameToPartKey[Name] : string, Theme = unknown> {
    vars?: OverridesVarsRulesJson<Name extends keyof ComponentsVarsList ? PartKey extends keyof ComponentsVarsList[Name] ? ComponentsVarsList[Name][PartKey] : {
        [key: string]: unknown;
    } : {
        [key: string]: unknown;
    }>;
    style?: OverridesStyleRules<Name extends keyof ComponentsStyleStateList ? Partial<ComponentsStyleStateList[Name]> : {
        [key: string]: unknown;
    }, Theme>;
}
export type ComponentOverridesRules<Name = keyof ComponentNameToPartKey, Theme = unknown> = Name extends keyof ComponentNameToPartKey ? {
    [PartKey in ComponentNameToPartKey[Name]]?: PartOverridesRules<Name, PartKey, Theme>;
} : {
    [PartKey: string]: PartOverridesRules<Name, string, Theme>;
};
export type ComponentsOverrides<Theme = unknown> = {
    [Name in keyof ComponentNameToPartKey]?: ComponentOverridesRules<Name, Theme>;
};
export type ComponentsVarsOverridesJson = {
    [Name in keyof ComponentNameToPartKey]?: {
        [PartKey in ComponentNameToPartKey[Name]]?: OverridesVarsRulesJson<Name extends keyof ComponentsVarsList ? PartKey extends keyof ComponentsVarsList[Name] ? ComponentsVarsList[Name][PartKey] : {
            [key: string]: unknown;
        } : {
            [key: string]: unknown;
        }>;
    };
};
/**
 * The options for the style overrides of the a component in the theme.
 */
export type ComponentStyleOverrides<Name = keyof ComponentNameToPartKey, Theme = unknown> = Name extends keyof ComponentNameToPartKey ? {
    [PartKey in ComponentNameToPartKey[Name]]?: OverridesStyleRules<Name extends keyof ComponentsStyleStateList ? ComponentsStyleStateList[Name] : {
        [key: string]: any;
    }, Theme>;
} : {
    [PartKey: string]: OverridesStyleRules<{
        [key: string]: any;
    }>;
};
export {};
