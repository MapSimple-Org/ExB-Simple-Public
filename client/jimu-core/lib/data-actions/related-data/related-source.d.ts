import type { UIComponents } from './index';
export interface RelatedSourceProps {
    label: string;
    count: number;
    onSelect: () => void;
    uiComponents: UIComponents;
}
export default function RelatedSource(props: RelatedSourceProps): import("@emotion/react/jsx-runtime").JSX.Element;
