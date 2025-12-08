/** @jsx jsx */
import {
  jsx,
  type IntlShape,
  injectIntl,
  css,
  type SerializedStyles,
  classNames,
  polished,
  Immutable,
  ReactRedux,
  type IMState,
  hooks,
  type MobileSidePanelContentOptions,
  React
} from 'jimu-core'
import { getQuickStyleConfig } from './quick-style-config'
import { PointStyle, Direction } from '../../config'
import { Button, defaultMessages } from 'jimu-ui'
import { ThemeSwitchComponent, useTheme, useTheme2, useUseTheme2 } from 'jimu-theme'
import { getNewDividerLineStyle, getDividerLinePositionStyle, getNewPointStyle } from '../utils/util'
import type { ToolSettingPanelProps } from 'jimu-layouts/layout-runtime'
import { getAppConfigAction } from 'jimu-for-builder'

export interface ExtraProps {
  intl: IntlShape
}

const QuickStyleComponent = (props: (ToolSettingPanelProps | MobileSidePanelContentOptions) & ExtraProps) => {
  const { widgetId } = props
  const widgetConfig = ReactRedux.useSelector((state: IMState) => {
    const appConfig = state?.appStateInBuilder?.appConfig || state.appConfig
    const newWidgetConfig = appConfig?.widgets?.[widgetId]?.config
    return newWidgetConfig
  })

  const nls = hooks.useTranslation(defaultMessages)

  const theme = useTheme()
  const theme2 = useTheme2()
  const isUseTheme2 = useUseTheme2()
  const appTheme = window.jimuConfig.isBuilder !== isUseTheme2 ? theme2 : theme
  const builderTheme = window.jimuConfig.isBuilder !== isUseTheme2 ? theme : theme2

  const getStyle = (): SerializedStyles => {
    return css`
      width: ${polished.rem(360)};
      padding: 16px 12px 8px 12px;
      z-index: 1001 !important;
      button {
        border-radius: 0;
      }
      .quick-style-item-container {
        padding-left: 4px;
        padding-right: 4px;
        padding-bottom: 8px;
      }
      .quick-style-item {
        border: 2px solid transparent;
        &.quick-style-item-selected {
          border: 2px solid ${builderTheme.sys.color.primary.light};
        }
        .quick-style-item-inner {
          background-color: ${appTheme.sys.color.mode === 'dark' ? '#1B1B1B' : '#F1F1F1'};
          cursor: pointer;
        }
      }
    `
  }

  const getTitleOfItems = (index: number): string => {
    const AllKeysOfItemsTitle = [
      "solidLine",
      "dottedLine",
      "dashedDotLine",
      "dashedLine",
      "dottedDashLine",
      "doubleThinLine",
      "lowerEmphasizedDoubleLine",
      "upperEmphasizedDoubleLine",
      "arrowEndLine",
      "thinArrowLine",
      "blockEndLine",
      "doubleArrowLine",
      "diamondEndLine",
      "triangleEndLine",
      "bracketEndLine",
      "reverseDoubleArrowLine",
      "circleEndLine",
      "crossEndLine",
      "tripleThinLine",
      "thickCrossEndLine"
    ]

    const key = AllKeysOfItemsTitle[index]
    return key ? nls(key) : ''
  }

  const quickStyleComponent = () => {
    const selectedType = widgetConfig?.themeStyle?.quickStyleType
    const quickStyleComponent = []
    const QuickStyleConfig = getQuickStyleConfig()
    let index = -1
    for (const key in QuickStyleConfig) {
      index += 1
      const config = QuickStyleConfig[key]
      const { pointStart, pointEnd, themeStyle } = config
      const dividerLineStyle = getNewDividerLineStyle(config, appTheme)
      const dividerLinePositionStyle = getDividerLinePositionStyle(config)
      const pointStartStyle = getNewPointStyle(config, appTheme, true)
      const pointEndStyle = getNewPointStyle(config, appTheme, false)
      const dividerLineClasses = classNames(
        'divider-line',
        'position-absolute',
        `point-start-${pointStart.pointStyle}`,
        `point-end-${pointEnd.pointStyle}`
      )
      const ele = (
        <div key={key} className='col-6 quick-style-item-container'>
          <div
            className={classNames('quick-style-item', {
              'quick-style-item-selected':
                selectedType === themeStyle.quickStyleType
            })}
          >
            <Button
              className='quick-style-item-inner p-2 w-100'
              onClick={() => { onConfirm(config) }}
              disableHoverEffect={true}
              disableRipple={true}
              type='tertiary'
              title={getTitleOfItems(index)}
              aria-label={getTitleOfItems(index)}
            >
              <div className='quick-style-item-inner w-100 p-2 position-relative'>
                {pointStart.pointStyle !== PointStyle.None && (
                  <span
                    className='point-start position-absolute'
                    css={pointStartStyle}
                  />
                )}
                <div
                  className={dividerLineClasses}
                  css={[dividerLineStyle, dividerLinePositionStyle]}
                />
                {pointEnd.pointStyle !== PointStyle.None && (
                  <span
                    className='point-end position-absolute'
                    css={pointEndStyle}
                  />
                )}
              </div>
            </Button>
          </div>
        </div>
      )
      quickStyleComponent.push(ele)
    }
    return quickStyleComponent
  }

  const onConfirm = hooks.useEventCallback(config => {
    config.direction = widgetConfig.direction || Direction.Horizontal
    getAppConfigAction().editWidgetConfig(widgetId, Immutable(config)).exec()
  })

  return (
    <div>
      <div css={getStyle()}>
        <div className='row no-gutters'><ThemeSwitchComponent useTheme2={false}>{quickStyleComponent()}</ThemeSwitchComponent></div>
      </div>
    </div>
  )
}

export const QuickStyle = injectIntl(QuickStyleComponent)
