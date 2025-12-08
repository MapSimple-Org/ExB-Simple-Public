import { ReactRedux, type IMState, type ImmutableObject, type ControllerPanelJson, Immutable } from 'jimu-core'
import { FixedPositionSize } from 'jimu-ui/advanced/style-setting-components'
import { styled } from 'jimu-theme'
import { DEFAULT_FIXED_LAYOUT_STYLE } from '../../common/consts'
import { getAppConfigAction } from 'jimu-for-builder'
import { FixedAnimationSetting } from './animation-setting'

interface FixedLayoutSettingProps {
  id: string
}

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--ref-palette-neutral-500);
  margin: 16px 0;
`

export const FixedLayoutStyleSetting = (props: FixedLayoutSettingProps) => {
  const { id } = props

  const panelJson = ReactRedux.useSelector((state: IMState) => {
    return state.appStateInBuilder.appConfig.controllerPanels?.[id] ?? Immutable(DEFAULT_FIXED_LAYOUT_STYLE)
  })

  const handleChange = (newValue: ImmutableObject<ControllerPanelJson>) => {
    const appConfigAction = getAppConfigAction()
    appConfigAction.editControllerPanel(id, newValue).exec()
  }

  return (
    <div className='w-100'>
      <FixedPositionSize fixedPositionSizeJson={panelJson} onChange={handleChange} />
      <Divider></Divider>
      <FixedAnimationSetting controllerId={id} />
    </div>
  )
}
