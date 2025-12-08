import type { TagTypes } from '../types/types';
export interface Props {
    isAGOLFilter: boolean;
    selectedTags: TagTypes[];
    onTagsChange: (selectedTags?: TagTypes[]) => void;
}
export declare const DefaultTemplateFilter: (props: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
