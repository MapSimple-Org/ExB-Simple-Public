import { type AdvancedSelectItem } from 'jimu-ui';
import type * as JimuForBuilderTemplates from 'jimu-for-builder/templates';
interface Props {
    value: AdvancedSelectItem[];
    jimuForBuilderTemplates: typeof JimuForBuilderTemplates;
    onChange?: (value: AdvancedSelectItem[]) => void;
}
declare const CapabilitiesSelector: (props: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export default CapabilitiesSelector;
