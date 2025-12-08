/** @jsx jsx */
import { AppMode, React, type ImmutableArray, type UseDataSource, type ImmutableObject, type UrlParameters, type IMLinkParam } from 'jimu-core';
interface Props {
    linkParam: IMLinkParam;
    appMode: AppMode;
    queryObject?: ImmutableObject<UrlParameters>;
    widgetId?: string;
    useDataSources?: ImmutableArray<UseDataSource>;
    children?: React.ReactNode;
    role?: string;
    'aria-label'?: string;
    changeIsCanClickLink?: () => boolean;
}
/**
 * The problem this component solves:
 * 1. When using the Link component as the parent container, there is also an a tag in the child component.
 * 2. In mobile devices, `Table api` add a global touchend method, it prevents jumping to the link through linkRef.current.click.
 *
*/
export declare const LinkContainer: (props: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
