import { css, type SerializedStyles } from 'jimu-core'

export function getStyles (): SerializedStyles {
  return css`
    .placeholder-wrapper { /* larger placeholder size ,#11524 */
      display: flex;
      align-items: center;
      min-width: 468px;
      min-height: 444px;
    }

    .placeholder-wrapper.in-controller { /* smaller placeholder size ,#22767 */
      min-width: 270px;
      min-height: 44px;
    }
  `
}
