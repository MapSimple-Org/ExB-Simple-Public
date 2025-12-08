import { React, classNames, hooks } from 'jimu-core'
import { CollapsablePanel, defaultMessages, type CollapsablePanelProps, Button } from 'jimu-ui'
import editOutlined from 'jimu-icons/svg/outlined/editor/edit.svg'
import { styled } from 'jimu-theme'
import { MinusCircleOutlined } from 'jimu-icons/outlined/editor/minus-circle'

interface DeletableLabelProps {
  className?: string
  label: string
  wrap?: boolean
  deletable?: boolean
  onDelete?: () => void
}

interface DeletableCollapsePanelProps extends CollapsablePanelProps, Omit<DeletableLabelProps, 'label'> { }

const DeletableLabel = styled((props: DeletableLabelProps) => {
  const { className, label, wrap, deletable = false, onDelete } = props
  const translate = hooks.useTranslation(defaultMessages)

  return <div className={(classNames('deletable-collapse-header', className))}>
    <div title={label} className={classNames('title', { 'text-truncate': !wrap })}>
      {label}
    </div>
    {
      deletable && <Button className='collapse-remove' aria-label={translate('remove')} title={translate('remove')} type='tertiary' icon size='sm' onClick={onDelete}>
        <MinusCircleOutlined size='m' />
      </Button>
    }
  </div>
})(() => {
  return {
    display: 'flex',
    width: '100%',
    alignItems: 'center',

    justifyContent: 'space-between',
    'button.collapse-remove': {
      height: 'fit-content'
    }
  }
})

const StyledCollapsablePanel = styled(CollapsablePanel)`
  .collapse-label {
    max-width: calc(100% - 22px);
  }
`

export const DeletableCollapsePanel = (props: DeletableCollapsePanelProps): React.ReactElement => {
  const { label: propLabel, deletable = false, onDelete, wrap, rightIcon = editOutlined, ...others } = props

  const label = <DeletableLabel label={propLabel as string} deletable={deletable} wrap={wrap} onDelete={onDelete} />

  return (<StyledCollapsablePanel rightIcon={rightIcon} label={label} {...others} />)
}
