/** @jsx jsx */
interface BottomToolsProps {
    isRTL: boolean;
    showAllRef: any;
    isSelectedListShown: boolean;
    showSelectedList: (show: boolean) => void;
    unCheckAll: () => void;
    showAllKeyDown: (e: any) => void;
}
declare function BottomTools(props: BottomToolsProps): import("@emotion/react/jsx-runtime").JSX.Element;
export default BottomTools;
