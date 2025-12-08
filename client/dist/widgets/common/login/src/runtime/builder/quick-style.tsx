/** @jsx jsx */
import { jsx, css, type IMThemeVariables, type SerializedStyles, classNames, polished, hooks, type MobileSidePanelContentOptions, ReactRedux, type IMState } from 'jimu-core'
import { ThemeSwitchComponent, useTheme, useTheme2, useUseTheme2 } from 'jimu-theme'
import { Button, Icon, defaultMessages as jimuUIMessages } from 'jimu-ui'
import type { ToolSettingPanelProps } from 'jimu-layouts/layout-runtime'
import { getAppConfigAction } from 'jimu-for-builder'
import { QuickStyleMode } from '../../config'
const IconAccount = require('../assets/default-user.svg')

const quickStyleModes: QuickStyleMode[] = [
  QuickStyleMode.default,
  QuickStyleMode.iconOnly,
  QuickStyleMode.labelOnly,
  QuickStyleMode.linkLabelOnly
]

const getStyle = (appTheme: IMThemeVariables, builderTheme: IMThemeVariables): SerializedStyles => {
  return css`
    width: 360px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: ${appTheme.sys.spacing[3]};
    padding: ${appTheme.sys.spacing[5]};
    .button-item{
      width: 100%;
      font-size: ${polished.rem(13)};
    }
    .quick-style-item{
      padding: ${appTheme.sys.spacing[2]};
      margin: 2px;
      &.quick-style-item-selected{
        outline: 2px solid ${builderTheme.sys.color.primary.light};
      }
      background-color: ${appTheme.sys.color.surface.background};
        cursor: pointer;
    }
  `
}

export const QuickStyle = (props: ToolSettingPanelProps | MobileSidePanelContentOptions) => {
  const { widgetId } = props

  const config = ReactRedux.useSelector((state: IMState) => {
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState.appConfig.widgets[widgetId]?.config
  })

  const selectedMode = config?.functionConfig?.quickStyleMode || QuickStyleMode.default

  const onChange = (quickStyleMode: QuickStyleMode) => {
    const newConfig = config.setIn(['functionConfig', 'quickStyleMode'], quickStyleMode)
    //if (quickStyleMode === QuickStyleMode.linkLabelOnly) {
    //  newConfig = newConfig.setIn(['styleConfig', 'useCustom'], true)
    //  newConfig = newConfig.setIn(['styleConfig', 'customStyle', 'regular', 'background'], {color: 'transparent', fillType: 'fill'})
    //  newConfig = newConfig.setIn(['styleConfig', 'customStyle', 'hover', 'background'], {color: 'transparent', fillType: 'fill'})
    //  newConfig = newConfig.setIn(['styleConfig', 'customStyle', 'regular', 'text'], {color: 'var(--sys-color-action-link)'})
    //  newConfig = newConfig.setIn(['styleConfig', 'customStyle', 'hover', 'text'], {underline: true, color: 'var(--sys-color-action-link)'})
    //}
    getAppConfigAction().editWidgetConfig(widgetId, newConfig).exec()
  }

  const theme = useTheme()
  const theme2 = useTheme2()
  const isUseTheme2 = useUseTheme2()
  const appTheme = window.jimuConfig.isBuilder !== isUseTheme2 ? theme2 : theme
  const builderTheme = window.jimuConfig.isBuilder !== isUseTheme2 ? theme : theme2
  const translate = hooks.useTranslation(jimuUIMessages)

  return <div css={getStyle(appTheme, builderTheme)}>
    <ThemeSwitchComponent useTheme2={window.jimuConfig.isBuilder}>
    {
      quickStyleModes.map((t, i) =>
        <div key={i} className={classNames('quick-style-item', { 'quick-style-item-selected': selectedMode === t })} onClick={() => { onChange(t) }}>
          <Button title={translate('signIn')}
            className="button-item text-truncate"
            type= {t === QuickStyleMode.linkLabelOnly ? 'link' : 'default'}
          >
            {(t !== QuickStyleMode.labelOnly && t !== QuickStyleMode.linkLabelOnly) && <Icon className={t === QuickStyleMode.default ? 'mr-2': ''} icon={IconAccount} width={20} height={20} />}
            {(t !== QuickStyleMode.iconOnly) && translate('signIn')}
          </Button>
        </div>
      )
    }
    </ThemeSwitchComponent>
  </div>
}
