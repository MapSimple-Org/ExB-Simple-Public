import { TabPosition } from '../calcite-tabs/interfaces';
import { Scale } from '../interfaces';
export declare const ICON: {
    readonly chevronRight: "chevron-right";
    readonly chevronLeft: "chevron-left";
};
export declare const CSS: {
    container: string;
    containerHasEndTabTitleOverflow: string;
    containerHasStartTabTitleOverflow: string;
    scrollButton: string;
    scrollButtonContainer: string;
    scrollBackwardContainerButton: string;
    scrollForwardContainerButton: string;
    tabTitleSlotWrapper: string;
    scale: (scale: Scale) => "scale-s" | "scale-m" | "scale-l";
    position: (position: TabPosition) => "position-top" | "position-bottom";
};
