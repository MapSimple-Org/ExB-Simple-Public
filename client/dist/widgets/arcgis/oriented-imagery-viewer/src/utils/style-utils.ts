import { css, type SerializedStyles } from 'jimu-core'

export function getCalciteBasicTheme(): SerializedStyles {
  return css`
    --calcite-color-brand: var(--sys-color-primary-main);
    --calcite-color-brand-press: var(--sys-color-primary-dark);
    --calcite-color-brand-hover: var(--sys-color-primary-light);
    --calcite-color-text-inverse: var(--sys-color-primary-text)};
  `
}
