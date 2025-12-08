import { type DataSource } from '../../data-sources';
import { type SqlExpression, ClauseLogic, ClauseOperator } from '../../types/sql-expression';
export interface Suggestion {
    suggestionHtml: string | Element;
    suggestion: string;
    fieldName: string;
}
export interface CategoryField {
    fields: string[];
    fullTextField: string[];
}
export interface QuerySuggestionParams {
    searchText?: string;
    searchFields: string[];
    dataSource: DataSource;
    maxSuggestions?: number;
    exact?: boolean;
    extent?: __esri.Extent;
}
export declare function querySuggestions(option: QuerySuggestionParams): Promise<Suggestion[]>;
/**
 * fetch suggestion by where
*/
export declare function fetchSuggestionByWhere(option: QuerySuggestionParams, maxSuggestions?: number): Promise<Suggestion[]>;
/**
 * fetch suggestion by fullText
*/
export declare function fetchSuggestionByFullText(option: QuerySuggestionParams): Promise<any[]>;
/**
 * Query suggestion
*/
export declare function getSuggestions(queryParams: any, option: QuerySuggestionParams, maxSuggestions?: number, isFullTextSearch?: boolean): Promise<Suggestion[]>;
export declare function getRegOfSearchText(searchText: string): RegExp;
/**
 * Query ds records by full text
*/
export declare function queryRecordsByFullText(queryParams: QuerySuggestionParams, ds: DataSource): Promise<any>;
/**
 * Check whether the suggestion is repeated
*/
export declare function checkIsSuggestionRepeat(searchSuggestion: Suggestion[], suggestionRecord: string): boolean;
/**
 * Init suggestion list item (Bold search text)
*/
export declare function getSuggestionItem(suggestion: string, searchText: string): string;
/**
 * Get query SQL
*/
export declare function getSQL(searchText: string, searchFields: string[], dataSource: DataSource, searchExact?: boolean, clauseLogic?: ClauseLogic, defaultClauseOperator?: ClauseOperator): SqlExpression;
export declare function convertStringToNumber(numberString: string): number;
