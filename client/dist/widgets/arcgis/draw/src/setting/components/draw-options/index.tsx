/** @jsx jsx */
import { jsx, css, React, useIntl, Immutable, type ImmutableObject, type IMThemeVariables, defaultMessages as jimuCoreMessages } from 'jimu-core'
import { Checkbox, Label, Select, Option, Switch, Tooltip, Button, defaultMessages, AdvancedSelect, type AdvancedSelectItem } from 'jimu-ui'
import { useTheme } from 'jimu-theme'
import { type DrawOptionsInfo, SnappingMode } from 'jimu-ui/advanced/map'
import { type JimuMapView, SnappingUtils } from 'jimu-arcgis'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { SnappingOption } from './snapping-option'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

interface Props {
  drawOptions: ImmutableObject<DrawOptionsInfo>
  onDrawOptionsChange: (drawOptions: ImmutableObject<DrawOptionsInfo>) => void
  jimuMapViews: JimuMapView[]
  have3dViews: boolean
}

export const DrawOptions = React.memo((props: (Props)) => {
  const theme = useTheme()
  // config
  const _onDrawOptionsChange = (item: string, value): void => {
    let config = props.drawOptions ?? Immutable({})
    config = config.set(item, value)

    props.onDrawOptionsChange(config as ImmutableObject<DrawOptionsInfo>)
  }

  // snapping layers
  const allSnappingLayerItemsState = React.useMemo(() => {
    return SnappingUtils.getAllSnappingLayerItems(props.jimuMapViews)
  }, [props.jimuMapViews])
  const selectedSnappingLayersState = React.useMemo(() => {
    return allSnappingLayerItemsState.filter(l => props.drawOptions?.defaultSnappingLayers?.includes(l.value as string))
  }, [allSnappingLayerItemsState, props.drawOptions?.defaultSnappingLayers])

  const onSnappingLayersChange = (valueObj: AdvancedSelectItem[]) => {
    const selectedLayers = (valueObj || []).map(item => item.value)
    _onDrawOptionsChange('defaultSnappingLayers', selectedLayers)
  }

  const getStyle = (theme: IMThemeVariables) => {
    return css`
      .item-label {
        font-weight: 500;
        color:${theme.ref.palette.neutral[1000]};
      }
      .default-enable-label {
        color: ${theme.ref.palette.neutral[1100]};
        margin-left: 8px;
      }
    `
  }

  // nls
  // tooltip
  const tooltipNls = useIntl().formatMessage({ id: 'tooltip', defaultMessage: defaultMessages.tooltip })
  const segmentLabelNls = useIntl().formatMessage({ id: 'segmentLabel', defaultMessage: defaultMessages.segmentLabel })
  const segmentLabelTipForSceneNls = useIntl().formatMessage({ id: 'segmentLabelTipForScene', defaultMessage: defaultMessages.segmentLabelTipForScene })
  //const tipNls = useIntl().formatMessage({ id: 'tipsForSnappingTooltip', defaultMessage: defaultMessages.tipsForSnappingTooltip })
  const defaultEnabledNls = useIntl().formatMessage({ id: 'defaultEnabled', defaultMessage: defaultMessages.defaultEnabled })
  // snapping
  const snappingNls = useIntl().formatMessage({ id: 'snapping', defaultMessage: defaultMessages.snapping })
  const prescriptiveModeNls = useIntl().formatMessage({ id: 'prescriptiveMode', defaultMessage: defaultMessages.prescriptiveMode })
  const flexibleModeNls = useIntl().formatMessage({ id: 'flexibleMode', defaultMessage: defaultMessages.flexibleMode })
  const geometryGuidesNls = useIntl().formatMessage({ id: 'geometryGuides', defaultMessage: defaultMessages.geometryGuides })
  const featureToFeatureNls = useIntl().formatMessage({ id: 'featureToFeature', defaultMessage: defaultMessages.featureToFeature })
  const gridFeatureNls = useIntl().formatMessage({ id: 'grid', defaultMessage: jimuCoreMessages.grid })
  const chooseDefaultSnappingLayersNls = useIntl().formatMessage({ id: 'chooseDefaultSnappingLayers', defaultMessage: defaultMessages.chooseDefaultSnappingLayers })

  return (<div className={'draw-options'} css={getStyle(theme)}>
    {/* 1. tooltip */}
    <React.Fragment>
      <SettingRow className='mt-3 d-flex align-items-center justify-content-between'>
        <div className='d-flex'>
          <Label className={'item-label'}>{tooltipNls}</Label>
          {/* <Tooltip showArrow role="tooltip" title={tipNls}>
            <Button icon disableHoverEffect disableRipple variant="text"> <InfoOutlined /> </Button>
          </Tooltip> */}
        </div>
        <Switch
          checked={props.drawOptions?.tooltipEnabled}
          onChange={evt => { _onDrawOptionsChange('tooltipEnabled', evt.target.checked) }}
        />
      </SettingRow>
      {props.drawOptions?.tooltipEnabled &&
        <div className='mt-3'>
          <Label className='d-flex align-items-center default-enable-label'>
            <Checkbox
              checked={props.drawOptions?.defaultTooltipEnabled}
              className='mr-1'
              onChange={evt => { _onDrawOptionsChange('defaultTooltipEnabled', evt.target.checked) }}
            />
            {defaultEnabledNls}
          </Label>
        </div>
      }
    </React.Fragment>

    {/* 2. segment labels */}
    {props.have3dViews && <React.Fragment>
      <SettingRow className='mt-3 d-flex align-items-center justify-content-between'>
        <div className='d-flex'>
          <Label className={'item-label'}>{segmentLabelNls}</Label>
          {/* <Tooltip showArrow role="tooltip" title={tipNls}>
            <Button icon disableHoverEffect disableRipple variant="text"> <InfoOutlined /> </Button>
          </Tooltip> */}
        </div>
        <div className='d-flex align-items-center '>
          <Tooltip showArrow role="tooltip" title={segmentLabelTipForSceneNls} className='mr-1'>
            <Button icon disableHoverEffect disableRipple variant="text"> <InfoOutlined /> </Button>
          </Tooltip>
          <Switch
            checked={props.drawOptions?.segmentLabelEnabled}
            onChange={evt => { _onDrawOptionsChange('segmentLabelEnabled', evt.target.checked) }}
          />
        </div>
      </SettingRow>
      {props.drawOptions?.segmentLabelEnabled &&
        <div className='mt-3'>
          <Label className='d-flex align-items-center default-enable-label'>
            <Checkbox
              checked={props.drawOptions?.defaultSegmentLabelEnabled}
              className='mr-1'
              onChange={evt => { _onDrawOptionsChange('defaultSegmentLabelEnabled', evt.target.checked) }}
            />
            {defaultEnabledNls}
          </Label>
        </div>
      }
    </React.Fragment>}

    {/* Snapping mode */}
    <React.Fragment>
      <SettingRow className='mt-3 d-flex align-items-center justify-content-between'>
        <div className='d-flex w-100 justify-content-between'>
          <Label className={'item-label'}>{snappingNls}</Label>
          <Tooltip showArrow role="tooltip" title={SnappingUtils.useGetTipsForSnappingOptions(defaultMessages, jimuCoreMessages)}>
            <Button icon disableHoverEffect disableRipple variant="text"> <InfoOutlined /> </Button>
          </Tooltip>
        </div>
      </SettingRow>
      {/* 2. select for snappingMode: prescriptive/flexible */}
      <div className='mt-1'>
        <Select size='sm' className='w-100'
          value={props.drawOptions?.snappingMode}
          onChange={evt => { _onDrawOptionsChange('snappingMode', evt.target.value) }}
        >
          <Option value={SnappingMode.Flexible}>{flexibleModeNls}</Option>
          <Option value={SnappingMode.Prescriptive}>{prescriptiveModeNls}</Option>
        </Select>
      </div>
    </React.Fragment>

    {/* geometryGuides */}
    <SnappingOption
      drawOptions={props.drawOptions}
      onSnappingOptionsChange={_onDrawOptionsChange}
      // ui
      labelNls={geometryGuidesNls}
      enabledItemName={'geometryGuidesEnabled'}
      defaultEnabledItemName={'defaultGeometryGuidesEnabled'}
    ></SnappingOption>

    {/* featureToFeature */}
    <SnappingOption
      drawOptions={props.drawOptions}
      onSnappingOptionsChange={_onDrawOptionsChange}
      // ui
      labelNls={featureToFeatureNls}
      enabledItemName={'featureToFeatureEnabled'}
      defaultEnabledItemName={'defaultFeatureToFeatureEnabled'}
    ></SnappingOption>

    {/* grid */}
    <SnappingOption
      drawOptions={props.drawOptions}
      onSnappingOptionsChange={_onDrawOptionsChange}
      // ui
      labelNls={gridFeatureNls}
      enabledItemName={'gridEnabled'}
      defaultEnabledItemName={'defaultGridEnabled'}
      // control
      isShow={!(props.drawOptions?.snappingMode === SnappingMode.Prescriptive)}
    ></SnappingOption>

    {/* snapping layers */}
    <SettingRow label={chooseDefaultSnappingLayersNls} className='snapping-layers mt-4' flow='wrap'>
      <AdvancedSelect
        size='sm' isMultiple
        disabled={props.jimuMapViews.length === 0}
        title={chooseDefaultSnappingLayersNls} aria-label={chooseDefaultSnappingLayersNls}
        hideCheckAll={false} hideBottomTools={true} hideSearchInput={true}
        staticValues={allSnappingLayerItemsState}
        sortList={false}
        selectedValues={selectedSnappingLayersState}
        onChange={onSnappingLayersChange}
      />
    </SettingRow>

  </div>)
})
