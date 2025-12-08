import { type IMThemeVariables, css, type SerializedStyles } from 'jimu-core'
import type { IMConfig } from '../../config'

export function getStyle (theme: IMThemeVariables, widgetConfig: IMConfig): SerializedStyles {
  const root = theme.sys.color.surface.paper

  return css`
    overflow: auto;
    width: 100%;
    height: 100%;
    background-color: ${root};
    .widget-utility-trace {
      width: 100%;
      height: 100%;
      background-color: ${root};
    }
    .esri-utility-network-trace__block-container {
      --calcite-font-family: ${theme.sys.typography.body.fontFamily};
    }
    .esri-utility-network-trace__clear-results-block {
      width: 100%;
      h3 {
        font-family: ${theme.sys.typography.body.fontFamily};
      }
    }
    calcite-scrim {
      height: 200px;
    }
  `
}

export function getFullHeight (): SerializedStyles {
  return css`
    height: 100%;
  `
}
