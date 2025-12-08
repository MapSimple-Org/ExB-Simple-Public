import type { IMThemeVariables } from './types/theme';
import type { IntlShape } from 'react-intl';
import { type SystemError } from './types/state';
import type { UrlParameters } from './types/url-parameters';
export interface SystemErrorPageProps {
    systemError: SystemError;
    intl: IntlShape;
    theme: IMThemeVariables;
    queryObject: UrlParameters;
}
export interface PrivilegeErrorPageProps {
    systemError: SystemError;
    intl: IntlShape;
    theme: IMThemeVariables;
    queryObject: UrlParameters;
}
export declare function PrivilegeErrorPage(props: PrivilegeErrorPageProps): import("@emotion/react/jsx-runtime").JSX.Element;
export interface OAuthErrorPageProps {
    systemError: SystemError;
    fromUrl: string;
    intl: IntlShape;
    theme: IMThemeVariables;
}
export declare function OAuthErrorPage(props: OAuthErrorPageProps): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function SystemErrorPage(props: SystemErrorPageProps): import("@emotion/react/jsx-runtime").JSX.Element;
