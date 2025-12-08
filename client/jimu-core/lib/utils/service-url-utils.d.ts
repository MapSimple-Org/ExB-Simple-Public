/**
 * Return true if it's a service url
 * @param serviceUrl
 */
export declare function isServiceUrl(serviceUrl?: string): boolean;
/**
 * Return true if it's a server url
 * @param serviceUrl
 */
export declare function isServerUrl(serviceUrl?: string): boolean;
/**
 * Return service root url, return what was passed if it isn't a service url
 * @param serviceUrl
 *
 * Examples:
 *   'https://sampleserver6.arcgisonline.com/arcgis/rest/services/NapervilleShelters/FeatureServer/0' ===> 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/NapervilleShelters/FeatureServer'
 *   'http://portalhostqa.ags.esri.com/gis/sharing/servers/9cfff55a4c854188b0e6599e23a43315/rest/services/Wildfire_secure/MapServer/0' ===> 'http://portalhostqa.ags.esri.com/gis/sharing/servers/9cfff55a4c854188b0e6599e23a43315'
 *   'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/admin/services/test/FeatureServer' ===> 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/admin/services/test/FeatureServer'
 *   'https://notebookswebtoolsdev.arcgis.com/arcgis/rest/services/be3bbf1003ea438298880631d24088a1/GPServer/web_tool_-_string_input_output/jobs/65c324dc208d440983dbce0c6fe5e12f' ===> 'https://notebookswebtoolsdev.arcgis.com/arcgis/rest/services/be3bbf1003ea438298880631d24088a1/GPServer'
 */
export declare function getServiceRootUrl(serviceUrl?: string): string;
/**
 * Return server root url, return what was passed if it isn't a service url
 * @param serviceUrl
 *
 * Examples:
 *   'http://sampleserver6.arcgisonline.com/arcgis/rest/services' ===> 'http://sampleserver6.arcgisonline.com/arcgis'
 *   'http://utility.arcgis.com/usrsvcs/servers/6ae7fb0319a74f8cac3088b085b388d2/rest/services/DEU_Nexiga/MapServer' ===> 'http://utility.arcgis.com/usrsvcs/servers/6ae7fb0319a74f8cac3088b085b388d2'
 *   'http://portalhostqa.ags.esri.com/gis/sharing/servers/9cfff55a4c854188b0e6599e23a43315/rest/services/Wildfire_secure/MapServer' ===> 'http://portalhostqa.ags.esri.com/gis/sharing/servers/9cfff55a4c854188b0e6599e23a43315'
 *   'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/admin/services' ===> 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis'
 *   'https://notebookswebtoolsdev.arcgis.com/arcgis/rest/services/be3bbf1003ea438298880631d24088a1/GPServer/web_tool_-_string_input_output/jobs/65c324dc208d440983dbce0c6fe5e12f' ===> 'https://notebookswebtoolsdev.arcgis.com/arcgis'
 * Proxy url is something like:
 *   'https://utilitydevext.arcgis.com/sharing/appservices/BRbLRlPWcxmCx3Yp/rest/services/USA_Demographics_and_Boundaries_2020/MapServer/0' ===> 'https://utilitydevext.arcgis.com/sharing'
 */
export declare function getServerRootUrl(serviceUrl?: string): string | null;
