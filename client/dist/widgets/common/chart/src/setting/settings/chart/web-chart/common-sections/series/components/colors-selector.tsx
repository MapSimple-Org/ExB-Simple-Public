/**@jsx jsx */
import { React, jsx, css, classNames, hooks } from 'jimu-core'
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui'
import defaultMessages from '../../../../../../translations/default'
import { ColorStrip } from './color-strip'

interface ColorsSelectorProps {
  className?: string
  style?: any
  label?: string
  onChange?: (colors: string[]) => void
}
const colors1 = ['#5E8FD0', '#77B484', '#DF6B35', '#DBCF4E', '#41546D', '#8257C2', '#D6558B']
const colors2 = ['#596A90', '#85C2E4', '#DEB3D9', '#9FB6E1', '#BBE4EF', '#C5B2E1', '#8482D0']
const colors3 = ['#A6382F', '#47707A', '#F0CF35', '#D18332', '#B9C143', '#E38B67', '#AAC86A']
const colors4 = ['#E49DAF', '#B1F2D0', '#F5F49A', '#94CAFC', '#E9C7A3', '#C9A7E8', '#DDF3AA']
const colors5 = ['#004CA3', '#005ECA', '#076FE5', '#2C8FFF', '#65ADFF', '#ACD3FF', '#E6F2FF']
const colors6 = ['#7D5D00', '#AA7F00', '#DDA400', '#FFC300', '#FFCE2F', '#FFDE72', '#FFEDB1']
const colors7 = ['#4E427E', '#6A5A9E', '#8E7AC3', '#A293D9', '#B0A3E7', '#C4B7EB', '#DFD9F1']
const colors8 = ['#BA4300', '#ED5500', '#FF7121', '#FF8D4C', '#FFA878', '#FFC4A3', '#FFE0CE']

export const COLORS_SET = [colors1, colors2, colors3, colors4, colors5, colors6, colors7, colors8]

const styles = css`
  padding: 12px 0px;
  .jimu-dropdown-item {
    padding: 4px 16px !important;
    &:hover {
      background-color: var(--ref-palette-neutral-500) !important;
    }
  }
`

export const ColorsSelector = (props: ColorsSelectorProps): React.ReactElement => {
  const { className, label, style, onChange } = props
  const translate = hooks.useTranslation(defaultMessages)

  return (
    <Dropdown style={style} className={classNames('colors-selector', className)} aria-label={label}>
      <DropdownButton size='sm' title={label}>{translate('applyColors')}</DropdownButton>
      <DropdownMenu showArrow={true} css={styles}>
        <div>
          {
            COLORS_SET.map((colors, index) => {
              return <DropdownItem className='my-1' key={index} aria-label={`${translate('colorSet')} ${index + 1}`}>
                <ColorStrip colors={colors} onChange={onChange} />
              </DropdownItem>
            })
          }
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}
