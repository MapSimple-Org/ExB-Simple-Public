/** @jsx jsx */
import { type IntlShape } from 'jimu-core';
import { UIComponent, type UIComponentProps } from './ui-component';
import type { ToolConfig } from '../../config';
import type { LayoutJson } from '../config';
export interface ToolShellProps extends UIComponentProps {
    layoutConfig: LayoutJson;
    toolConfig: ToolConfig;
    toolName: string;
    isMobile?: boolean;
    isHidden?: boolean;
    intl?: IntlShape;
    isLastElement?: boolean;
    mapComponentsLoaded: boolean;
    className?: string;
    activeToolName: string;
    onActiveToolNameChange: (activeToolName: string) => void;
}
export default class BaseToolShell extends UIComponent<ToolShellProps, unknown> {
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
