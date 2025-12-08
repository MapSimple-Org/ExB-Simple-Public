import { hooks, React, type AllWidgetProps } from 'jimu-core'
import { defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import type { IMConfig } from '../config'
import { versionManager } from '../version-manager'
import { MenuNavigation } from './menu-navigation'
import { useMenuType, useFullConfig } from '../utils'

type MenuProps = AllWidgetProps<IMConfig>

const Widget = (props: MenuProps) => {
  const { config, theme } = props

  const translate = hooks.useTranslation(jimuiDefaultMessage)

  const menuType = useMenuType(config)
  const fullConfig = useFullConfig(config, menuType, translate)

  return (
    <div className='widget-menu jimu-widget'>
      <MenuNavigation {...fullConfig.asMutable()} theme={theme} />
    </div>
  )
}

Widget.versionManager = versionManager

export default Widget
