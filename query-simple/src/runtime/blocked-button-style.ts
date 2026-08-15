/**
 * r028.143 (DCE batch item 1): shared blocked look for aria-disabled Search/Reset buttons, both
 * tabs. Reads as inert (gray, no hover affordance) but the label clears WCAG 4.5:1 (#595959 on
 * #f0f0f0 is ~6.2:1) - DCE's low-vision complaint against the old native-disabled styling.
 * Native :disabled styling never applies since the attribute is gone (see block-reason-utils.ts
 * for the why of the aria-disabled pattern).
 */
import { css } from 'jimu-core'

export const blockedButtonStyle = css`
  &[aria-disabled='true'] {
    background-color: #f0f0f0 !important;
    border-color: #d9d9d9 !important;
    color: #595959 !important;
    cursor: default !important;
    box-shadow: none !important;
    &:hover, &:active, &:focus {
      background-color: #f0f0f0 !important;
      color: #595959 !important;
    }
  }
`
