import { React, hooks } from 'jimu-core'
import { Button, type CollapsablePanelProps } from 'jimu-ui'
import EditInput from './edit-input'
import defaultMessages from '../../../../../../translations/default'
import { SettingCollapse } from '../../../../../components'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { styled } from 'jimu-theme'

interface GuideCollapseProps extends CollapsablePanelProps {
  name: string
  onChange: (name: string) => void
  onDelete: () => void
}

const EditableLabelRoot = styled.div`
  margin-bottom: 2px;
`

function EditableLabel ({ value, onChange, onDelete }: { value: string, onChange: (value: string) => void, onDelete: () => void }) {
  const translate = hooks.useTranslation(defaultMessages)

  return (<EditableLabelRoot className='mw-100 d-flex align-items-center justify-content-between'>
    <EditInput value={value} onChange={onChange} className='mr-2' />
    <Button icon type='tertiary' size='sm' onClick={onDelete} title={translate('removeGuide')}>
      <TrashOutlined />
    </Button>
  </EditableLabelRoot>)
}

const GuideCollapse = (props: GuideCollapseProps) => {
  const { name, onChange, onDelete, ...others } = props

  const label = <EditableLabel value={name} onChange={onChange} onDelete={onDelete} />

  return <SettingCollapse type='primary' level={1} label={label} {...others} />
}

export default GuideCollapse
