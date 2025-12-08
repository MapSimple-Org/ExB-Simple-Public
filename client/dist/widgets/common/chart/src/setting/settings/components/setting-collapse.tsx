import { React } from 'jimu-core'
import { CollapsablePanel, type CollapsablePanelProps } from 'jimu-ui'
import editOutlined from 'jimu-icons/svg/outlined/editor/edit.svg'

export const SettingCollapse = (props: CollapsablePanelProps): React.ReactElement => {
  const { rightIcon = editOutlined, ...others } = props
  return (<CollapsablePanel rightIcon={rightIcon} {...others} />)
}
