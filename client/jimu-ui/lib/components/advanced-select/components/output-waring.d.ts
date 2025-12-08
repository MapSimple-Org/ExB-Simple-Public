/** @jsx jsx */
interface BottomToolsProps {
    item: any;
    isMultiple: boolean;
    allTag: string;
    isItemChecked: (value: any) => boolean;
    onItemClick: (item: any, isChecked: boolean) => void;
}
declare function OutputWarning(props: BottomToolsProps): import("@emotion/react/jsx-runtime").JSX.Element;
export default OutputWarning;
