import { React, css, classNames, type ImmutableObject, type WidgetContext } from 'jimu-core'
import { Button, Icon, Select } from 'jimu-ui'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { type IMConfig, areaUnitList, lengthUnitList, measurementSystemList, type MeasureButton, MeasurementArrangement, type MeasurementClass } from '../../config'

const lengthUnitOptions = [...measurementSystemList, ...lengthUnitList]
const areaUnitOptions = [...measurementSystemList, ...areaUnitList]

interface MeasureToolsProps {
  config: IMConfig
  context: ImmutableObject<WidgetContext>
  activeButton: MeasureButton['name']
  activeTool: MeasurementClass
  translate: (id: string, values?: any) => string
  onSelectTool: (measureButton: MeasureButton) => void
  onChangeUnit: (unit: string) => void
  onClear: () => void
}

const style = css`
&.measure-toolbar {
  height: 40px;
  .measure-tools {
    height: 24px;
    .measure-tool {
      &.active {
        color: var(--sys-color-action-selected-text);
        background-color: var(--sys-color-action-selected);
      }
    }
  }
  .measure-unit-clear {
    height: 24px;
    flex-grow: 1;
    border-left: 1px solid var(--sys-color-divider-secondary);
    .measure-unit {
      flex-grow: 1;
    }
  }
}
`

const MeasureTools = React.forwardRef((props: MeasureToolsProps, ref: React.Ref<HTMLDivElement>): React.ReactElement => {
  const { config, context, activeButton, translate, onSelectTool, onChangeUnit, onClear } = props
  const {
    enableDistance = true,
    defaultDistanceUnit = 'metric',
    enableArea = true,
    defaultAreaUnit = 'metric',
    arrangement = MeasurementArrangement.Classic
  } = config
  const [distanceUnit, setDistanceUnit] = React.useState(defaultDistanceUnit)
  const [areaUnit, setAreaUnit] = React.useState(defaultAreaUnit)
  React.useEffect(() => {
    if (activeButton === 'measureDistance') {
      setDistanceUnit(defaultDistanceUnit)
    }
    if (activeButton === 'measureArea') {
      setAreaUnit(defaultAreaUnit)
    }
  }, [activeButton, defaultAreaUnit, defaultDistanceUnit])
  const onChangeDistanceUnit = React.useCallback((evt: any) => {
    setDistanceUnit(evt.target.value)
    onChangeUnit(evt.target.value)
  }, [onChangeUnit])
  const onChangeAreaUnit = React.useCallback((evt: any) => {
    setAreaUnit(evt.target.value)
    onChangeUnit(evt.target.value)
  }, [onChangeUnit])

  const isToolbarArrangement = arrangement === MeasurementArrangement.Toolbar

  const measureButtons: MeasureButton[] = [
    {
      name: 'measureDistance',
      icon: `${context.folderUrl}dist/runtime/assets/measure-distance.svg`,
      enabled: enableDistance
    },
    {
      name: 'measureArea',
      icon: `${context.folderUrl}dist/runtime/assets/measure-area.svg`,
      enabled: enableArea
    }
  ]

  return <div ref={ref} className='measure-toolbar d-flex justify-content-between p-2' css={style}>
    <div className='measure-tools d-flex' role='group'>
      {measureButtons.filter(m => m.enabled).map((measureButton) => {
        return (
          <Button
            key={measureButton.name}
            icon
            type='tertiary'
            title={translate(measureButton.name)}
            className={classNames('measure-tool p-0 mr-1', { active: activeButton === measureButton.name })}
            onClick={() => { onSelectTool(measureButton) }}
            aria-label={translate(measureButton.name)}
            aria-pressed={activeButton === measureButton.name}
            aria-describedby={'selectToStart'}
          >
            <Icon className='m-0' icon={measureButton.icon} />
          </Button>
        )
      })}
    </div>
    {isToolbarArrangement && <div className='measure-unit-clear d-flex align-items-center'>
      {activeButton === 'measureDistance' && enableDistance && <Select
        size='sm'
        value={distanceUnit}
        className='measure-unit ml-1'
        onChange={onChangeDistanceUnit}
        aria-label={translate('defaultUnit')}
      >
        {
          lengthUnitOptions.map((lengthUnit) => (
            <option key={lengthUnit.key} value={lengthUnit.value}>{translate(lengthUnit.key)}</option>
          ))
        }
      </Select>}
      {activeButton === 'measureArea' && enableArea && <Select
        size='sm'
        value={areaUnit}
        className='measure-unit ml-1'
        onChange={onChangeAreaUnit}
        aria-label={translate('defaultUnit')}
      >
        {
          areaUnitOptions.map((areaUnit) => (
            <option key={areaUnit.key} value={areaUnit.value}>{translate(areaUnit.key)}</option>
          ))
        }
      </Select>}
      {activeButton === '' && <Select size='sm' value='measureUnit' disabled className='measure-unit ml-1'>
        <option value='measureUnit'>{translate('measureUnit')}</option>
      </Select>}
      <Button
        icon
        type='tertiary'
        className='p-0 ml-1'
        disabled={activeButton === ''}
        onClick={onClear}
        aria-label={translate('clearMeasurement')}
      >
        <TrashOutlined className='m-0' />
      </Button>
    </div>}
  </div>
})

export default MeasureTools
