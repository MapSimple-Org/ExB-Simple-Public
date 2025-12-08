import { React, type ImmutableObject, classNames } from 'jimu-core'
import { SettingCollapse } from '../../../components'
import { LineSymbolSetting } from './style-setting'
import type { ISimpleLineSymbol } from 'jimu-ui/advanced/chart'

interface LineStyleCollapseProps {
  label: string
  className?: string
  value: ImmutableObject<ISimpleLineSymbol>
  defaultColor: string
  open: boolean
  baseline?: boolean
  toggle: (open: boolean) => void
  onChange: (value: ImmutableObject<ISimpleLineSymbol>) => void
}

export const LineStyleCollapse = (props: LineStyleCollapseProps): React.ReactElement => {
  const { className, open, baseline, toggle, label, value, defaultColor, onChange } = props

  return (
    <div className={classNames('single-line-style', className)}>
      <SettingCollapse
        label={label}
        aria-label={label}
        level={1}
        isOpen={open}
        bottomLine={baseline}
        onRequestClose={() => { toggle(false) }}
        onRequestOpen={() => { toggle(true) }}>
        <LineSymbolSetting
          type='line'
          aria-label={label}
          defaultColor={defaultColor}
          className='mt-2'
          value={value}
          onChange={onChange}
        />
      </SettingCollapse>
    </div>
  )
}
