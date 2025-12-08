import { type AppInfo } from '../type';
/**
 * Create app by portal template/AGOL template/local template
 * folderId: If the folderId has a value, the app will be created in the folder corresponding to the folderId
*/
export declare function createAppByItemTemplateInfo(appInfo: AppInfo, folderId?: string): Promise<string>;
/**
 * Create app with template id, such as: xxx.com/builder/?template=id
*/
export declare function createAppByItemTemplateId(templateId: string): Promise<string>;
/**
 *Create app by default template defined in the code
 *title: The translated string of 'Untitled experience'
 *label: The default template's name
 *folderId: If the folderId has a value, the app will be created in the folder corresponding to the folderId
 */
export declare function createAppByDefaultTemplate(title: string, templateName: string, folderId?: string, webmapId?: string, websceneId?: string): Promise<AppInfo>;
/**
 * folderId: If the folderId has a value, the template will be created in the folder corresponding to the folderId
*/
export declare function createTemplateByApp(appInfo: AppInfo, folderId?: string): Promise<string>;
