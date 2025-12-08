import { React, classNames, hooks } from 'jimu-core'
import { styled } from 'jimu-theme'
import { defaultMessages, Tooltip } from 'jimu-ui'
import { type CustomPopupDockPosition, CustomDockPositionArray } from '../../utils'

interface PositionItemProps {
  className?: string
  title?: string
  'aria-label'?: string
  activate: boolean
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void
}

const PositionItem = (props: PositionItemProps) => {
  const { className, activate, onClick, title, 'aria-label': ariaLabel } = props
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && onClick) {
      onClick(event)
    }
  }

  return (
    <Tooltip placement='top' title={title}>
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={classNames('position-item', { activate }, className)}
        style={{ cursor: 'pointer' }}
      />
    </Tooltip>
  )
}

const StyledPositionItem = styled(PositionItem)`
  width: 16px;
  height: 13px;
  cursor: pointer;
  background-color: transparent;
  border: 1px solid var(--sys-color-divider-secondary);

  &.top-left {
    border-right: 0;
    border-bottom: 0;
  }

  &.top-center {
    border-right: 0;
    border-bottom: 0;
  }

  &.top-right {
    border-bottom: 0;
  }

  &.bottom-left {
    border-right: 0;
  }

  &.bottom-center {
    border-right: 0;
  }

  &.activate {
    z-index: 1;
    background: var(--sys-color-primary-dark);
    border: 1px solid var(--sys-color-primary-light) !important;

    &.top-left {
      width: 16px;
      height: 13px;
    }

    &.top-center {
      width: 16px;
      height: 13px;
    }

    &.top-right {
      height: 13px;
    }

    &.bottom-left {
      width: 16px;
    }

    &.bottom-center {
      width: 16px;
    }
  }
`

interface PositionSettingProps {
  'aria-label'?: string
  value: CustomPopupDockPosition
  onChange: (value: CustomPopupDockPosition) => void
}

const Translations = {
  auto: 'default',
  'top-left': 'TL',
  'top-center': 'TC',
  'top-right': 'TR',
  'bottom-left': 'BL',
  'bottom-center': 'BC',
  'bottom-right': 'BR'
}

const PositionSettingRoot = styled.div`
  display: grid;
  grid-template-columns: 16px 16px 16px;
  grid-template-rows: 13px 13px;
  gap: 0;
`

export const PopupPositionSetting = (props: PositionSettingProps) => {
  const { value, onChange } = props
  const translate = hooks.useTranslation(defaultMessages)

  return (<PositionSettingRoot className='position-setting'>
    {
      CustomDockPositionArray.map((position) => {
        return <StyledPositionItem
          key={position}
          className={position}
          title={translate(Translations[position])}
          aria-label={translate(Translations[position])}
          activate={position === value}
          onClick={() => { onChange?.(position) }} />
      })
    }
  </PositionSettingRoot>)
}
