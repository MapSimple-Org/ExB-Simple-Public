interface ScrollListProps {
    onScrollTop?: (isScrollEnd: boolean) => void;
    onScroll?: () => void;
    onScrollBottom?: (isScrollEnd: boolean) => void;
    children?: any;
    className?: string;
}
declare const ScrollList: (props: ScrollListProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default ScrollList;
