/** @jsx jsx */
import { React, jsx, type ImmutableArray } from 'jimu-core'
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui'
import type { DSConfig } from '../../config'

interface DSSelectorProps {
  dsConfigs: ImmutableArray<DSConfig>
  activeDSConfigId: string
  onCurrentDSChange: (dsConfigId) => void
  width?: number
}

export function DSSelector (props: DSSelectorProps) {
  const activeDSConfig = props.dsConfigs.find(dsConfig => dsConfig.id === props.activeDSConfigId)
  return (
    <div className='data-source-selector' style={{}} >
      <Dropdown activeIcon>
        <DropdownButton type={'tertiary'} size='sm' style={{}} title={activeDSConfig?.label}>
          {activeDSConfig?.label}
        </DropdownButton>
        <DropdownMenu offsetOptions={4}>
          {
            props.dsConfigs.map((dsConfig, index) => {
              return (<DropdownItem key={index} active={props.activeDSConfigId === dsConfig.id} onClick={() => { props.onCurrentDSChange(dsConfig.id) }}> {dsConfig.label} </DropdownItem>)
            })
          }
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
