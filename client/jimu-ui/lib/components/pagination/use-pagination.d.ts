import type { PaginationItemType } from './page-item-link';
import type { PaginationType } from './type';
export interface UsePaginationItem {
    type: PaginationItemType | 'page-number' | 'page-select' | 'page-jumper';
    page: number | null;
    selected: boolean;
    disabled: boolean;
    'aria-current'?: any;
}
export interface UsePaginationProps {
    boundaryCount: number;
    count: number;
    page: number;
    siblingCount: number;
    hidePrevButton?: boolean;
    hideNextButton?: boolean;
    disabled?: boolean;
    hidePageSelect?: boolean;
    hidePageJumper?: boolean;
    simple?: boolean;
    paginationType?: PaginationType;
    isLastPage?: boolean;
    showEndEllipsis?: boolean;
}
export default function usePagination(props: UsePaginationProps): UsePaginationItem[];
