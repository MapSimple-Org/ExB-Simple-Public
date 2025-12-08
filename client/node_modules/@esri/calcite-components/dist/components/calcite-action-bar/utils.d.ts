import { ActionGroup } from '../calcite-action-group/customElement.js';
import { Action } from '../calcite-action/customElement.js';
export declare const queryActions: (el: HTMLElement) => HTMLCalciteActionElement[];
export declare const overflowActions: ({ actionGroups, expanded, overflowCount, }: {
    actionGroups: HTMLCalciteActionGroupElement[];
    expanded: boolean;
    overflowCount: number;
}) => void;
