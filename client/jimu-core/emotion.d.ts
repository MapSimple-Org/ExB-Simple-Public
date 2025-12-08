/**
 * We set jsxImportSource to @emotion/react in tsconfig.json, this makes the typescript
 * compiler to add the following import to all tsx files:
 * import { jsx } from '@emotion/react/jsx-runtime'
 *
 * The import above causes all entries to include @emotion/react.
 * So we create this file to re-export all the necessary items from @emotion/react
 * and other related packages, so that all other entries can just depend on this file to avoid
 * the duplication of @emotion/react in each entry.
 */
import styled from '@emotion/styled';
import { ThemeProvider as EmotionThemeProvider, ThemeContext as EmotionThemeContext, Global, CacheProvider, css, ClassNames } from '@emotion/react';
import createEmotionCache from '@emotion/cache';
import type { SerializedStyles } from '@emotion/react';
import { jsx, jsxs, Fragment } from '@emotion/react/jsx-runtime';
export { EmotionThemeProvider, EmotionThemeContext, CacheProvider, styled, createEmotionCache, jsx, jsxs, css, Global, ClassNames, Fragment };
export type { SerializedStyles };
