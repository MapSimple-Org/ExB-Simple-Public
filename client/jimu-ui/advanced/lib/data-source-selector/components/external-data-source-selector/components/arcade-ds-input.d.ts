import { type ArcadeDataSourceResult } from 'jimu-data-source';
interface ArcadeDataSourceInputProps {
    script?: string;
    onAddDataSource: (name: string, script: string, result: ArcadeDataSourceResult) => void;
}
export declare function ArcadeDataSourceInput(props: ArcadeDataSourceInputProps): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
