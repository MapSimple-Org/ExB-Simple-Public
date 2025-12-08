import type { ButtonVars, LinkVars } from 'jimu-ui';
import type { ComponentNameToPartKey } from './parts';
type ComponentVarsMapping = {
    [x in keyof ComponentNameToPartKey]: any;
};
export interface ComponentsVarsList extends ComponentVarsMapping {
    Button: ButtonVars;
    Link: LinkVars;
}
export {};
