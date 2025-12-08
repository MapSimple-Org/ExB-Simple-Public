/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
import { type ThemeProps } from 'jimu-ui';
import type { CommandActionDataType, CommandType } from './tree-types';
interface ExtraProps extends ThemeProps {
    intl: IntlShape;
}
export interface CommandListProps {
    className?: string;
    itemCommands: CommandType[];
    data?: any;
    moreCommand?: CommandType;
    maxIconCount?: number;
    onClickItemCommand?: (actionData: CommandActionDataType) => void;
}
export declare const CommandList: React.ForwardRefExoticComponent<Pick<Omit<CommandListProps & ExtraProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof CommandListProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
