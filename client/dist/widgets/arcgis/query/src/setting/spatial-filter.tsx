/** @jsx jsx */
import { React, jsx, type ImmutableObject, DataSourceComponent, hooks } from 'jimu-core'
import { TextInput, Icon, Collapse, Button, TextArea } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from './translations/default'
import type { QueryItemType } from '../config'
import { widgetSettingDataMap } from './setting-config'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { TitleComponent } from './titleComponent'

const { iconMap } = widgetSettingDataMap

interface Props {
  queryItem: ImmutableObject<QueryItemType>
  // the query item setting has three stages: main, draw mode and spatial relationship
  handleStageChange: (id: number, e) => void
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
}

export function SpatialFilterSetting (props: Props) {
  const { queryItem, handleStageChange, onPropertyChanged } = props

  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const enabled = currentItem.useSpatialFilter

  const [label, setLabel] = React.useState(currentItem.spatialFilterLabel ?? getI18nMessage('spatialFilter'))
  const [desc, setDesc] = React.useState(currentItem.spatialFilterDesc)

  React.useEffect(() => {
    setLabel(queryItem?.spatialFilterLabel ?? getI18nMessage('spatialFilter'))
    setDesc(queryItem?.spatialFilterDesc ?? '')
  }, [queryItem, getI18nMessage])

  const handleLabelChanged = (prop: string, value: string, defaultValue: string) => {
    if (value === defaultValue) {
      onPropertyChanged(prop, null)
    } else {
      onPropertyChanged(prop, value)
    }
  }

  const titleComponent = (
    <TitleComponent label='spatialFilter' enabled={enabled} onChange={(e) => { onPropertyChanged('useSpatialFilter', e.target.checked) }} />
  )
  return (
    <DataSourceComponent useDataSource={currentItem.useDataSource}>
      {(ds) => {
        // check if ds has geometryType
        if (ds.getGeometryType() == null) {
          return null
        }
        return (
          <SettingSection role='group' aria-label={getI18nMessage('spatialFilter')} title={titleComponent}>
            <Collapse isOpen={enabled}>
              <SettingRow flow='wrap' label={getI18nMessage('label')}>
                <TextInput
                  aria-label={getI18nMessage('label')}
                  className='w-100'
                  size='sm'
                  value={label}
                  onChange={(e) => { setLabel(e.target.value) }}
                  onAcceptValue={(value) => { handleLabelChanged('spatialFilterLabel', value, getI18nMessage('spatialFilter')) }}
                />
              </SettingRow>
              <SettingRow role='group' aria-label={getI18nMessage('typesOfFilter')} flow='wrap' label={getI18nMessage('typesOfFilter')}>
                <div className='setting-ui-unit-check-input-item w-100 d-flex align-items-center'>
                  <label className='setting-ui-unit-check-input-label my-1'>
                    <span id='queryItemDataMode'>{getI18nMessage('featureFromDs')}</span>
                  </label>
                  <Button aria-describedby='queryItemDataMode' className='ml-auto' size='sm' type='tertiary' icon onClick={(e) => { handleStageChange(2, e) }}>
                    <Icon size={16} icon={iconMap.arrowRight} autoFlip/>
                  </Button>
                </div>
                <div className='setting-ui-unit-check-input-item w-100 d-flex align-items-center'>
                  <label className='setting-ui-unit-check-input-label my-1'>
                    <span id='queryItemMapMode'>{getI18nMessage('featureFromMap')}</span>
                  </label>
                  <Button aria-describedby='queryItemMapMode' className='ml-auto' size='sm' type='tertiary' icon onClick={(e) => { handleStageChange(1, e) }}>
                    <Icon size={16} icon={iconMap.arrowRight} autoFlip/>
                  </Button>
                </div>
              </SettingRow>
              <SettingRow label={getI18nMessage('description')} flow='wrap'>
                <TextArea
                  aria-label={getI18nMessage('description')}
                  height={80}
                  value={desc}
                  placeholder={getI18nMessage('describeTheFilter')}
                  onChange={(e) => { setDesc(e.target.value) }}
                  onAcceptValue={(value) => { onPropertyChanged('spatialFilterDesc', value) }}
                />
              </SettingRow>
            </Collapse>
          </SettingSection>
        )
      }}
    </DataSourceComponent>
  )
}
