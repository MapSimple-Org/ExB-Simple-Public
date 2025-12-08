/** @jsx jsx */
import { React, type IMHeaderJson } from 'jimu-core';
import type * as PortalComponentsTypes from 'jimu-ui/advanced/portal-components';
export declare function ClassificationBannerWrapper(props: Omit<PortalComponentsTypes.BannerProps, 'portalItemId'> & {
    showClassification: boolean;
}): import("@emotion/react/jsx-runtime").JSX.Element;
interface Props {
    headerJson: IMHeaderJson;
    showClassification: boolean;
    classification?: __esri.PortalItem['classification'];
    children?: React.ReactNode;
}
export declare function PageHeaderWrapper(props: Props): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode>> | import("@emotion/react/jsx-runtime").JSX.Element;
export {};
