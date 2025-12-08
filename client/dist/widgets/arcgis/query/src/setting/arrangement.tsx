/** @jsx jsx */
import { jsx, css, hooks } from 'jimu-core'
import { Button, Icon, Switch, Tooltip, ButtonGroup } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from './translations/default'
import { QueryArrangeType } from '../config'
import { widgetSettingDataMap } from './setting-config'

const { arrangementStyleMap } = widgetSettingDataMap

interface Props {
  arrangeType: QueryArrangeType
  arrangeWrap?: boolean
  onArrangeTypeChanged: (type: QueryArrangeType) => void
  onArrangeWrapChanged: (wrap: boolean) => void
}

const style = css`
  .icon-btn {
    padding: 0;
    &.active {
      outline: 2px solid var(--sys-color-primary-light) !important;
    }
    img {
      background-color: var(--ref-palette-neutral-300);
    }
  }
`

export function Arrangement (props: Props) {
  const { arrangeType, arrangeWrap = false, onArrangeTypeChanged, onArrangeWrapChanged } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  return (
    <SettingSection role='group' aria-label={getI18nMessage('arrangementStyle')} title={getI18nMessage('arrangementStyle')} css={style}>
      <SettingRow flow='wrap'>
        <ButtonGroup className='w-100 d-flex justify-content-between'>
          {Object.entries(arrangementStyleMap).map(([arrangementStyleKey, arrangementStyleValue]) => {
            return (
              <Tooltip key={arrangementStyleKey} title={arrangementStyleValue.getTitle(getI18nMessage)} placement='bottom'>
                <Button
                  onClick={() => { onArrangeTypeChanged(arrangementStyleKey as QueryArrangeType) }}
                  icon
                  size='sm'
                  variant='text'
                  disableRipple={true}
                  active={arrangeType === arrangementStyleKey}
                  aria-pressed={arrangeType === arrangementStyleKey}
                >
                  <Icon width={68} height={68} icon={arrangementStyleValue.icon} autoFlip />
                </Button>
              </Tooltip>
            )
          })}
        </ButtonGroup>
      </SettingRow>
      {arrangeType === QueryArrangeType.Inline && (
        <SettingRow tag='label' label={getI18nMessage('wrapItems')}>
          <Switch checked={arrangeWrap} onChange={(e) => { onArrangeWrapChanged(e.target.checked) }} />
        </SettingRow>
      )}
    </SettingSection>
  )
}
