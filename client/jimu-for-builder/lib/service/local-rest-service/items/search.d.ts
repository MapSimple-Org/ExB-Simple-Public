import type { IItem, ISearchOptions, SearchQueryBuilder, ISearchResult } from '@esri/arcgis-rest-portal';
import { SearchType } from '../../type';
export declare function searchItems(search: string | ISearchOptions | SearchQueryBuilder, searchType?: SearchType): Promise<ISearchResult<IItem>>;
export declare function searchItemsByPortalUrl(search: string | ISearchOptions | SearchQueryBuilder, portalUrl: string): Promise<ISearchResult<IItem>>;
