import { request } from './index';
export { getOriginUrl } from '../jimu-request/util';
export declare function getUserContentUrl(isNotContainUsers?: boolean): "/sharing/rest/content/" | "/sharing/rest/content/users/";
export declare function getUserName(): string;
export declare function getRequestMethod(isArcGisOnlineRequest?: boolean): typeof request;
