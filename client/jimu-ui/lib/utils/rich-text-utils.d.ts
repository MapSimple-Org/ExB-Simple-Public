import { type IMExpressionMap, type Expression, type RepeatedDataSource, type LinkParam, type MultipleExpressionResolveResults, type ImmutableObject, type ExpressionPart, type ArcadeContentConfig, type IMArcadeContentConfigMap, type IntlShape } from 'jimu-core';
import type { IMArcadeContentMap, IMArcadeContentWithStatus } from '../components/rich-text-displayer';
export type IMLinkParamMap = ImmutableObject<{
    [id: string]: LinkParam;
}>;
export declare const EXP_TAG_REGEXP: RegExp;
export declare const LINK_TAG_REGEXP: RegExp;
export declare const ARCADE_TAG_REGEXP: RegExp;
export declare const DATA_DS_ID_REGEXP: RegExp;
export declare const DATA_EXPRESSION_REGEXP: RegExp;
export declare const DATA_LINK_REGEXP: RegExp;
export declare const DATA_ARCADE_REGEXP: RegExp;
export declare const DATA_UNIQUE_ID_REGEXP: RegExp;
export declare const HREF_REGEXP: RegExp;
/**
 * Capture all regular expression matching results
 *
 * @param string
 * @param regexp Must have a global label
 */
export declare const matchAll: (string: string, regexp: RegExp) => string[];
/**
 * Decode and parse the encoded object string as an object
 *
 * @param encodeString %7B%22foo%22%3A1%2C%22bar%22%3A2%7D
 * @returns {foo: 1, bar: 2}
 */
export declare const convertEncodeObject: (encodeString: string) => Expression | LinkParam;
/**
 * Get expression information from exp tag string
 *
 * Note: If there are multiple data-expressions, only return the first
 * @param html e.g: <exp data-expression="%7B%22name%22%3A%22value%22%7D">{Rank}</exp>
 */
export declare const getExpressionInfo: (html: string) => Expression;
/**
 * Get arcade information from the attribute data-arcade of a tag string
 * Note: If there are multiple data-arcade, only return the first
 * @param html e.g: <arcade data-arcade="%7B%22name%22%3A%22value%22%7D">{Rank}</arcade>
 */
export declare const getArcadeInfo: (html: string) => ArcadeContentConfig;
/**
 * Get link information from the attribute data-link of a tag string
 *
 * Note: If there are multiple data-link, only return the first
 * @param html e.g: <a data-link="%7B%22name%22%3A%22value%22%7D">{Rank}</a>
 */
export declare const getLinkInfo: (html: string) => LinkParam;
/**
 * Get uniqueid from html string
 *
 * Note: If there are multiple data-uniqueid, only return the first
 * @param html e.g: <exp/a data-uniqueid="foo">{Rank}</exp/a>
 */
export declare const getUniqueId: (html: string) => string;
/**
 * Get all data-expression from html, associate it with a uniqueid and return it as an object
 *
 * @param html <p>ddd<exp data-uniqueid="e3c" data-expression="%7B%22name%22%3A%22value%22%7D">{Rank}</exp>abc</p>
 * @returns {e3c: {name: value}}
 */
export declare const getExpressions: (html: string) => IMExpressionMap;
/**
 * Get all data-arcade from html, associate it with a uniqueid and return it as an object
 * @param html <p>ddd<arcade data-uniqueid="e3c" data-arcade="%7B%22name%22%3A%22value%22%7D">{Rank}</arcade>abc</p>
 * @returns {e3c: {name: value}}
 */
export declare const getArcades: (html: string) => IMArcadeContentConfigMap;
/**
 * Get all data-link from html, associate it with a uniqueid and return it as an object
 *
 * @param html <a href="#" target="_blank" data-uniqueid="9721" data-link="%7B%22name%22%3A%22value%22%7D">link</a>abc</p>
 * @returns {9721: {name: value}}
 */
export declare const getLinks: (html: string) => IMLinkParamMap;
/**
 * Get all data-expression attribute values and data-link.expression values from HTML strings
 *
 * @param html
 * <p>ddd<exp data-uniqueid="e3c" data-expression="%7B%22name%22%3A%22value%22%7D">{Rank}</exp>
 * <a href="#" target="_blank" data-uniqueid="9721" data-link="{%7B%22name%22%3A%22value%22%7D">link</a></p>
 * @returns  {e3c: {name: value}, 9721: {name: value}}
 */
export declare const getAllExpressions: (html: string) => IMExpressionMap;
export declare const getRecords: (repeatedDataSource: RepeatedDataSource) => {
    [x: string]: import("jimu-core").DataRecord;
};
/**
 * Whether it is a valid value
 * @param value
 */
export declare const isValidValue: (value: string) => boolean;
/**
 * Replace <exp data-uniqueid="id_1"></exp> in HTML strings with corresponding values based on uniqueID
 *
 * @param html <p> ddd <exp data-uniqueid="e3c" data-dsid="ds_1" data-expression="{name: value}">{Rank}</exp></p>
 * @param values {e3c: 'foo'}
 * @returns <p> ddd foo</p>
 */
export declare const replaceHtmlExpression: (html: string, values: ImmutableObject<{
    [id: string]: string;
}>) => string;
/**
 * Replace <arcade data-uniqueid="id_1"></arcade> in HTML strings with corresponding values based on uniqueID
 * @param html <p> ddd <arcade data-uniqueid="e3c" data-dsid="ds_1" data-arcade="{name: value}">{Rank}</arcade></p>
 * @param values {e3c: 'foo'}
 * @returns <span style="color:red;"> ddd foo</span>
 */
export declare const replaceHtmlArcade: (html: string, values: ImmutableObject<{
    [id: string]: string;
}>) => string;
/**
 *  Calculate the specific value of href in html and replace it
 *
 * @param html <p> ddd <a href="#" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a></p>
 * @param values {9721: 'foo'}
 * @returns <p> ddd  <a href="foo" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a></p>
 */
export declare const replaceHtmlLinkHref: (html: string, values: ImmutableObject<{
    [id: string]: string;
}>) => string;
export declare const getExpressionValues: (results: MultipleExpressionResolveResults) => ImmutableObject<{
    [id: string]: string;
}>;
export declare const getArcadeValues: (results: IMArcadeContentMap, intl: IntlShape) => ImmutableObject<{
    [id: string]: string;
}>;
/**
 * Get the styled value from arcade content
 * @param results
 * @returns {string}
 */
export declare const getStyledArcadeHtml: (contentWithStatus: IMArcadeContentWithStatus, intl: IntlShape) => string;
/**
 * Find the node of the specified nodeName from the inside out recursion, and encounter the specified container stop
 * @param node
 * @param targetNodeName
 * @param container
 */
export declare const findNode: (node: HTMLElement, targetNodeName: string, container: HTMLElement) => any;
/**
 * Get the plain text content from a html string.
 *
 * @param html
 */
export declare const getHTMLTextContent: (html: string) => string;
/**
 * Check whether is rich text with empty content.
 */
export declare const isBlankRichText: (text: string) => boolean;
/**
 * Edit parts of all expressions, including <exp> and <a>.
 */
export declare const editExpressionPart: (html: string, editor: (partIndex: number, expression: Expression) => ExpressionPart) => string;
export declare const convertEncodedString: (input: {
    [x: string]: any;
}) => string;
