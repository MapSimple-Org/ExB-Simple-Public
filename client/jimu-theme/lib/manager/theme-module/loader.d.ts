import type { ThemeModule } from './type';
/**
  * Load theme by the theme uri.
  * @param uri
  * @internal
  */
export declare const loadTheme: (uri: string) => Promise<ThemeModule>;
