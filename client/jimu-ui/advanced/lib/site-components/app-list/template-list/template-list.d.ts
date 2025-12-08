/** @jsx jsx */
import { React, type IMUser, type IMThemeVariables, type IntlShape, type WidgetContext } from 'jimu-core';
export interface TemplateListProps {
    dispatch: any;
    context: WidgetContext;
    portalUrl?: string;
    user?: IMUser;
    title?: string;
    allowImport?: boolean;
    showDraft?: boolean;
    createOnly?: boolean;
    searchMyPortalTemplates?: boolean;
    onlyFetchData?: boolean;
}
interface ExtraProps {
    theme: IMThemeVariables;
    intl: IntlShape;
}
type Props = TemplateListProps & ExtraProps;
export declare const TemplateList: React.ForwardRefExoticComponent<Pick<Omit<Props, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof TemplateListProps> & {
    theme?: IMThemeVariables;
}>;
export {};
