/** @jsx jsx */
import { type ImmutableArray, type privilegeUtils, type IntlShape, type IMThemeVariables } from 'jimu-core';
import type { TemplateTagType } from 'jimu-for-builder/templates';
import type { TemplateInfo, TemplateAccessTypes } from '../types/types';
export interface Props {
    template: ImmutableArray<TemplateInfo>;
    capabilities: privilegeUtils.Capabilities;
    accessType: TemplateAccessTypes;
    showSkeleton?: boolean;
    skeletonNum?: number;
    intl?: IntlShape;
    theme?: IMThemeVariables;
    selectedTags: TemplateTagType[];
    isFilterByCategoriesTags: boolean;
    crateAppByTemplate?: (appInfo: TemplateInfo) => void;
    className?: string;
}
export declare const DefaultTemplateList: (props: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
