import { React, hooks, type DataRecordSet } from 'jimu-core'
import { DataActionList, DataActionListStyle, Option, Select } from 'jimu-ui'

import type { QualifiedLayer } from '../../config'

import defaultMessages from '../translations/default'

interface HeaderProps {
  widgetId: string
  layerId: string
  layerList: QualifiedLayer[]
  enableDataAction: boolean
  actionDataSets: DataRecordSet[]
  handleLayerChange: (event: any) => void
}

const Header = (props: HeaderProps) => {
  const { widgetId, layerId, layerList, enableDataAction = true, actionDataSets, handleLayerChange } = props

  const translate = hooks.useTranslation(defaultMessages)

  return (
    <div className='d-flex justify-content-between mb-2 px-3'>
        <Select
            aria-label={translate('selectLayers')}
            size='sm'
            value={layerId}
            useFirstOption={true}
            onChange={handleLayerChange}
            style={{ minWidth: '150px', width: 'fit-content' }}
        >
            {layerList.map(({ id: layerId, title }) => (
                <Option key={layerId} value={layerId}>{title}</Option>
            ))}
        </Select>
        {enableDataAction && <DataActionList
            widgetId={widgetId}
            dataSets={actionDataSets}
            listStyle={DataActionListStyle.Dropdown}
            buttonSize='sm'
        />}
    </div>
  )
}

export default Header
