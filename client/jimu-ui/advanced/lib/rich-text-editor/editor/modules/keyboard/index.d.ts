import type { Editor, RichSelection } from '../../../type';
export declare const useHandleEnter: (editor: Editor) => (range: RichSelection, context: any) => [(range: RichSelection, context: any) => void];
export declare const useHandleTab: (editor: Editor) => (range: RichSelection, context: any) => [(range: RichSelection, context: any) => void];
export declare const useKeyboardModule: (editor: Editor) => {
    bindings: {
        'inline remain enter': {
            key: string;
            collapsed: boolean;
            handler: (range: RichSelection, context: any) => [(range: RichSelection, context: any) => void];
        };
        tab: {
            key: string;
            handler: (range: RichSelection, context: any) => [(range: RichSelection, context: any) => void];
        };
    };
};
