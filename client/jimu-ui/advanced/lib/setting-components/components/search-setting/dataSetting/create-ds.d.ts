/** @jsx jsx */
import { type ImmutableArray } from 'jimu-core';
import { type SearchDataConfig } from '../type/type';
interface SearchOptionsProps {
    datasourceConfig: ImmutableArray<SearchDataConfig>;
    dsStatusChange: (dsId: string, isDsCreateSuccess?: boolean) => void;
}
declare const CreateDataSource: (props: SearchOptionsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default CreateDataSource;
