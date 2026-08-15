/**
 * r028.149/150 (DCE batch follow-up): shared REQUIRED marker for unmet required inputs, both tabs.
 * Introduced on the Spatial tab in r028.143 (relationship + target layers headers); the Query tab
 * renders it as a ::after on the SqlExpressionRuntime clause label (r028.150), so the declarations
 * are exported raw and both forms build from ONE source. Terse by design - the marker scans, the
 * refusal popover explains (UX layering). Render text with the widget-unique i18n key
 * qsRequiredMarker (see exb i18n shadowing lesson, r028.146/148).
 */
import { css } from 'jimu-core'

/** Raw declarations, shared by the element marker and the ::after variant. */
export const requiredMarkDeclarations = `
  margin-left: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #b45309;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`

/** Element form - Spatial tab headers. */
export const requiredMarkStyle = css`${requiredMarkDeclarations}`
