import type { Template } from 'jimu-for-builder/templates';
export interface TemplateListProps {
    className?: string;
    templates: Template[];
    formatMessage?: (id: string, values?: {
        [key: string]: any;
    }) => string;
    onItemSelect: (item: Template) => void;
}
export declare function TemplateList(props: TemplateListProps): import("@emotion/react/jsx-runtime").JSX.Element;
