import type { Template } from '../templates/type';
/**
 *
 * @param templateJson
 * @param widgetId widget name is used to get translation. This is for the case that widget has internal templates such as list, card, etc.
 *    for other templates, pass null
 * @param defaultMessages
 */
export declare function processForTemplate(templateJson: Template, widgetId: string, defaultMessages: any): Template;
/**
   * get the express mode template names for the provided type.
   *
   * @param {string} templateType - The type of the template.
   * @returns {Promise<string[]>} - The names for express mode template.
   */
export declare const getExpressModeTemplateNames: (templateType: string) => Promise<string[]>;
