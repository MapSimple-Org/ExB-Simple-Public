import { hooks, type DataRecordSet } from 'jimu-core'
import { DataActionList, DataActionListStyle, Option, Select } from 'jimu-ui'

import defaultMessages from '../translations/default'

interface HeaderProps {
  widgetId: string
  layerId: string
  layerList: __esri.ImageryLayer[]
  enableDataAction: boolean
  actionDataSets: DataRecordSet[]
  onSelectedLayerChange: (event: Event) => void
}

export const Header = (props: HeaderProps): React.ReactElement => {
  const { widgetId, layerId, layerList, enableDataAction = true, actionDataSets, onSelectedLayerChange } = props

  const translate = hooks.useTranslation(defaultMessages)

  return (
    <div className='d-flex justify-content-between mb-2 px-3'>
        <Select
            aria-label={translate('selectLayers')}
            size='sm'
            value={layerId}
            useFirstOption={true}
            onChange={onSelectedLayerChange}
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
