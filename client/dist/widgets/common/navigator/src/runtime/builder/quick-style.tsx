/** @jsx jsx */
import {
  jsx, css, lodash, Immutable, type ImmutableArray, type IMState, type MobileSidePanelContentOptions,
  ReactRedux, AppMode
} from 'jimu-core'
import type { NavigationItem } from 'jimu-ui'
import type { ToolSettingPanelProps } from 'jimu-layouts/layout-runtime'
import { getAppConfigAction } from 'jimu-for-builder'
import { generateDisplayKey, type NavTemplate, useNavTemplates } from '../utils'
import { type IMViewNavigationDisplay, ViewNavigation, type ViewNavigationDisplay } from '../components/view-navigation'
import { setWidgetSize } from '../../utils'
import { ViewType } from '../../config'
import { NavQuickStyleItem } from './nav-quick-style-item'
import { getTheme, ThemeSwitchComponent } from 'jimu-theme'

const dummyNavData = Immutable([{ name: 'v1', value: 'p1,v1' }, { name: 'v2' }, { name: 'v3' }, { name: 'v4' }]) as ImmutableArray<NavigationItem>

export interface NavQuickStyleProps {
  templates: NavTemplate[]
  display: IMViewNavigationDisplay
  onChange: (template: NavTemplate) => void
}

const style = css`
  &.body {
    display: flex;
    padding: var(--sys-spacing-5);
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    .quick-style-item:not(:last-of-type) {
      margin-bottom: 10px;
    }
  }
`

const NavQuickStyle = (props: ToolSettingPanelProps | MobileSidePanelContentOptions) => {
  const { widgetId } = props

  const config = ReactRedux.useSelector((state: IMState) => {
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState.appConfig.widgets[widgetId]?.config
  })
  const templates = useNavTemplates(widgetId)
  const display = config?.display

  const appMode = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode)
  const onChange = (_display: Partial<ViewNavigationDisplay>) => {
    const display = Immutable(_display).set('vertical', appMode === AppMode.Express).set('advanced', false).without('variant')
    getAppConfigAction().editWidgetProperty(widgetId, 'config', config.setIn(['data', 'type'], ViewType.Auto).set('display', display)).exec()
    setWidgetSize(_display, getAppConfigAction)
  }

  const theme = getTheme()

  return <ThemeSwitchComponent useTheme2={window.jimuConfig.isBuilder}><div className='body' css={style}>
    {
      templates.map((item, index) => {
        const template = { ...item }
        const title = template.label
        delete template.label

        const navBtnStandard = item.type === 'navButtonGroup'
          ? {
              current: 1,
              totalPage: 4,
              disablePrevious: true,
              disableNext: false
            }
          : {}

        const navStandard = item.type === 'nav'
          ? {
              scrollable: false
            }
          : {}

        const standard = lodash.assign({}, template.standard, navBtnStandard, navStandard)

        return <NavQuickStyleItem key={index} title={title}
          selected={display?.advanced ? false : generateDisplayKey(template) === generateDisplayKey(display)}
          onClick={() => { onChange(template) }}>
          <ViewNavigation type={template.type} data={dummyNavData} navStyle={template.navStyle} activeView="v1" standard={standard} theme={theme} />
        </NavQuickStyleItem>
      })
    }
  </div></ThemeSwitchComponent>
}

export default NavQuickStyle
