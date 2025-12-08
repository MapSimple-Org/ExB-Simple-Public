/** @jsx jsx */
import { React, ReactRedux, type IMSizeModeLayoutJson, type IMThemeVariables } from 'jimu-core';
import { type GridLayoutSetting } from 'jimu-layouts/layout-runtime';
interface Props {
    layouts: IMSizeModeLayoutJson;
    appTheme: IMThemeVariables;
    formatMessage: (id: string) => string;
}
interface StateToProps {
    layoutId: string;
    layoutSetting: GridLayoutSetting;
    allItemsExpandable: boolean;
    allItemsNotExpandable: boolean;
    useCustomLayoutInSmallSizeMode: boolean;
}
declare class _Setting extends React.PureComponent<Props & StateToProps> {
    handlePaddingChange: (value: any) => void;
    handleSettingChange: (prop: string, value: any) => void;
    toggleExpandable: () => void;
    getLayoutIds(): string[];
    render(): React.JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof _Setting, {
    layouts: import("seamless-immutable").ImmutableObjectMixin<import("jimu-core").SizeModeLayoutJson> & {
        readonly [x: string]: string;
    };
    ref?: React.Ref<_Setting>;
    key?: React.Key | null | undefined;
    formatMessage: (id: string) => string;
    appTheme: import("seamless-immutable").ImmutableObjectMixin<import("jimu-theme").ThemeVariable> & {
        readonly uri?: string;
        readonly darkTheme?: boolean;
        readonly coloration?: import("jimu-core").ThemeColorationType;
        readonly colorationVariants?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeColorationVariants>;
        readonly typography?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeTypography>;
        readonly colors?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeAllColors>;
        readonly sizes?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeSizes>;
        readonly borderRadiuses?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeBorderRadiuses>;
        readonly boxShadows?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeBoxShadows>;
        readonly focusedStyles?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeFocusedStyles>;
        readonly surfaces?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeSurfaces>;
        readonly header?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeHeader>;
        readonly footer?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeFooter>;
        readonly body?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeBody>;
        readonly link?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeLink>;
        readonly border?: import("seamless-immutable").ImmutableObject<import("jimu-ui").BorderStyle>;
        readonly components?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeComponents>;
        readonly arcgis?: import("seamless-immutable").ImmutableObject<import("jimu-core").ThemeArcGIS>;
        readonly breakpoints: import("seamless-immutable").ImmutableObject<import("jimu-theme").Breakpoints>;
        readonly src?: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeSourceOptions>;
        readonly ref: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeReference>;
        readonly sys: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeSystem>;
        readonly mixin?: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeMixin>;
        readonly comp?: import("seamless-immutable").ImmutableObject<import("jimu-theme").ThemeComponents<import("jimu-theme").Theme>>;
    };
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
