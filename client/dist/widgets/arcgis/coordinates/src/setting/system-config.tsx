/** @jsx jsx */
import { React, jsx, type IMThemeVariables, type ImmutableArray, hooks } from 'jimu-core'
import { Link, Select, Tooltip, defaultMessages as jimuDefaultMessages, Label, Radio, Button, NumericInput, Loading, LoadingType, Checkbox, TextInput } from 'jimu-ui'
import defaultMessages from './translations/default'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { type CoordinateConfig, ElevationUnitType, type MapInfo } from '../config'
import { type JimuMapView, loadArcGISJSAPIModules } from 'jimu-arcgis'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { Fragment } from 'react'
import { getPanelStyle } from './style'

const { useState, useEffect, useRef } = React

export interface SystemConfigProps {
  allDataLoaded: boolean
  useMapWidgetIds: ImmutableArray<string>
  mapView: JimuMapView
  theme: IMThemeVariables
  wkidUtils: any
  mapInfo: MapInfo
  mapInfo2: MapInfo
  multiOptionsChange: (updateOptions: any) => void
  onWkidChangeSave: (newWkid: string, crs: any) => void
  onClose?: () => void
}

export const SystemConfig = (props: SystemConfigProps & CoordinateConfig): React.ReactElement => {
  const {
    id, name, wkid, crs, displayUnit, elevationUnit, datumWkid, datumName, transformForward, datumWkid2, datumName2, transformForward2,
    mapInfo, mapInfo2, mapView, theme, wkidUtils, allDataLoaded, multiOptionsChange, onWkidChangeSave
  } = props

  // state
  const [apiLoaded, setApiLoaded] = useState(false)
  const [datumStatus, setDatumStatus] = useState(false)
  const [datum2Status, setDatum2Status] = useState(false)

  const [curWkid, setCurWkid] = useState(wkid)
  const [curDatumWkid, setCurDatumWkid] = useState(datumWkid)
  const [curDatumWkid2, setCurDatumWkid2] = useState(datumWkid2)
  const [wkidInvalid, setWkidInvalid] = useState(false)
  const [datumWkidInvalid, setDatumWkidInvalid] = useState(false)
  const [datumWkid2Invalid, setDatumWkid2Invalid] = useState(false)
  const [itemLabel, setItemLabel] = useState(name)
  const [systemName, setSystemName] = useState(crs?.name)
  // translate
  const translate = hooks.useTranslation(defaultMessages, jimuDefaultMessages)
  const outputCoordinateHint = translate('outputCoordinateHint')
  const datumTransformationHint = translate('datumTransformationHint')
  const displayUnitsLabel = translate('displayUnits')
  const elevationUnitLabel = translate('elevationUnit')
  const elevationHint = translate('elevationHint')
  const invalidWkidTips = translate('invalidWkidTips')
  const invalidDatumWkidTips = translate('invalidDatumWkidTips')
  const elevMeter = translate('elevMeter')
  const elevMile = translate('elevMile')
  // units translate
  const unitDefault = translate('default')
  const unitInches = translate('unitsInches')
  const unitFoot = translate('unitsLabelFeet')
  const unitFootUs = translate('unitsFoot_US')
  const unitYards = translate('unitsLabelYards')
  const unitMiles = translate('unitsLabelMiles')
  const unitNauticalMiles = translate('unitsLabelNauticalMiles')
  const unitMillimeters = translate('unitsMillimeters')
  const unitCentimeters = translate('unitsCentimeters')
  const unitMeters = translate('unitsLabelMeters')
  const unitKilometers = translate('unitsLabelKilometers')
  const unitDecimeters = translate('unitsDecimeters')
  const unitDD = translate('unitsDecimalDegrees')
  const unitDDM = translate('unitsDegreesDecimalMinutes')
  const unitDMS = translate('unitsDegreeMinutesSeconds')
  const unitMgrs = translate('unitsMgrs')
  const unitUsng = translate('unitsUsng')
  // global variable
  const spatialReferenceRef = useRef(null)
  const helpUrl = 'https://developers.arcgis.com/rest/services-reference/enterprise/using-spatial-references.htm'

  useEffect(() => {
    if (!apiLoaded) {
      loadArcGISJSAPIModules([
        'esri/geometry/SpatialReference'
      ]).then(modules => {
        [spatialReferenceRef.current] = modules
        setApiLoaded(true)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setCurWkid(wkid)
    setItemLabel(name)
    setSystemName(crs?.name)
    setCurDatumWkid(datumWkid)
    setCurDatumWkid2(datumWkid2)
    if (apiLoaded) {
      checkMapSupportDatum(wkid)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiLoaded, wkid, name, crs, datumWkid, mapInfo, mapInfo2, wkidUtils])

  useEffect(() => {
    setWkidInvalid(false)
  }, [id])

  const wkidChange = (value): void => {
    setCurWkid(value)
  }

  const checkMapSupportDatum = (wkid) => {
    const map1Wkid = mapInfo?.wkid
    const map2Wkid = mapInfo2?.wkid
    const SRConstructors = spatialReferenceRef.current
    if (!wkidUtils) return
    const { isSameSpheroid } = wkidUtils
    if (wkid) {
      const outputSr = new SRConstructors({ wkid: wkid })
      // only one map view
      if (map1Wkid && !map2Wkid) {
        const mapSr = new SRConstructors({ wkid: map1Wkid })
        if (!isSameSpheroid(outputSr, mapSr)) {
          setDatumStatus(true)
        } else {
          setDatumStatus(false)
        }
      } else if (map1Wkid && map2Wkid) {
        const map1Sr = new SRConstructors({ wkid: map1Wkid })
        const map2Sr = new SRConstructors({ wkid: map2Wkid })
        const map1EqualMap2 = isSameSpheroid(map1Sr, map2Sr)
        const map1EqualOutput = isSameSpheroid(map1Sr, outputSr)
        const map2EqualOutput = isSameSpheroid(map2Sr, outputSr)
        // map1Sr != map2Sr
        if (!map1EqualMap2) {
          if (!map1EqualOutput && map2EqualOutput) {
            setDatumStatus(true)
            setDatum2Status(false)
          } else if (!map2EqualOutput && map1EqualOutput) {
            setDatumStatus(false)
            setDatum2Status(true)
          } else {
            setDatumStatus(true)
            setDatum2Status(true)
          }
        } else { // map1Sr = map2Sr
          if (map1EqualOutput) {
            setDatumStatus(false)
            setDatum2Status(false)
          } else {
            setDatumStatus(true)
            setDatum2Status(false)
          }
        }
      }
    }
  }

  const wkidAccept = (value) => {
    if (!wkidInvalid && (wkid === value)) return
    if (!wkidUtils) return
    const { wkidLookup, isValidWkid } = wkidUtils
    const newWkid = value === '' ? wkid : value
    const isValid = isValidWkid(newWkid)
    const crs = wkidLookup(newWkid)
    const label = crs?.name
    // new system
    if (!id) {
      if (isValid) {
        setWkidInvalid(false)
        setItemLabel(label)
        setSystemName(label)
        onWkidChangeSave(newWkid, crs)
      } else {
        setWkidInvalid(true)
      }
      return
    }
    // edit system
    if (isValid) {
      setWkidInvalid(false)
      // check whether support datum
      checkMapSupportDatum(newWkid)
      setCurWkid(newWkid)
      setItemLabel(label)
      setSystemName(label)
      multiOptionsChange({
        wkid: newWkid,
        name: label,
        crs,
        displayUnit: '',
        datumWkid: '',
        datumName: '',
        datumWkid2: '',
        datumName2: ''
      })
    } else { // invalid
      setWkidInvalid(true)
    }
  }

  const datumWkidChange = (value): void => {
    setCurDatumWkid(value)
  }

  const datumWkid2Change = (value): void => {
    setCurDatumWkid2(value)
  }

  const datumWkidAccept = (value) => {
    if (datumWkid === value) return
    const newDatumWkid = value
    const { isValidDatumWkid, getDatumSRLabel } = wkidUtils
    if (isValidDatumWkid(newDatumWkid)) {
      setDatumWkidInvalid(false)
      const label = getDatumSRLabel(newDatumWkid)
      multiOptionsChange({
        datumWkid: newDatumWkid,
        datumName: label
      })
    } else { // invalid
      setDatumWkidInvalid(true)
      multiOptionsChange({
        datumWkid: '',
        datumName: ''
      })
    }
  }

  const datumWkid2Accept = (value) => {
    if (datumWkid === value) return
    const newDatumWkid = value
    const { isValidDatumWkid, getDatumSRLabel } = wkidUtils
    if (isValidDatumWkid(newDatumWkid)) {
      setDatumWkid2Invalid(false)
      const label = getDatumSRLabel(newDatumWkid)
      multiOptionsChange({
        datumWkid2: newDatumWkid,
        datumName2: label
      })
    } else { // invalid
      setDatumWkid2Invalid(true)
      multiOptionsChange({
        datumWkid2: '',
        datumName2: ''
      })
    }
  }

  const handleUnitChange = (event): void => {
    const newUnit = event.target.value
    if (displayUnit === newUnit) return
    multiOptionsChange({ displayUnit: newUnit })
  }

  const getUnitOptions = (): React.JSX.Element[] => {
    const allUnits = [
      <option key='Default' value=''>{unitDefault}</option>,

      <option key='INCHES' value='INCHES'>{unitInches}</option>,
      <option key='FOOT' value='FOOT'>{unitFoot}</option>,
      <option key='FOOT_US' value='FOOT_US'>{unitFootUs}</option>,
      <option key='YARDS' value='YARDS'>{unitYards}</option>,
      <option key='MILES' value='MILES'>{unitMiles}</option>,
      <option key='NAUTICAL_MILES' value='NAUTICAL_MILES'>{unitNauticalMiles}</option>,
      <option key='MILLIMETERS' value='MILLIMETERS'>{unitMillimeters}</option>,
      <option key='CENTIMETERS' value='CENTIMETERS'>{unitCentimeters}</option>,
      <option key='METER' value='METER'>{unitMeters}</option>,
      <option key='KILOMETERS' value='KILOMETERS'>{unitKilometers}</option>,
      <option key='DECIMETERS' value='DECIMETERS'>{unitDecimeters}</option>,

      <option key='DECIMAL_DEGREES' value='DECIMAL_DEGREES'>{unitDD}</option>,
      <option key='DEGREES_DECIMAL_MINUTES' value='DEGREES_DECIMAL_MINUTES'>{unitDDM}</option>,
      <option key='DEGREE_MINUTE_SECONDS' value='DEGREE_MINUTE_SECONDS'>{unitDMS}</option>,
      <option key='MGRS' value='MGRS'>{unitMgrs}</option>,
      <option key='USNG' value='USNG'>{unitUsng}</option>
    ]

    const geographicUnits = [<option key='Default' value=''>{unitDefault}</option>].concat(allUnits.slice(12))
    const projectUnits = allUnits.slice(0, 12)

    const curWkidNum = parseInt(curWkid)
    const SRConstructors = spatialReferenceRef.current
    if (!SRConstructors) return allUnits
    const sr = new SRConstructors({ wkid: curWkidNum })
    if (curWkidNum === mapView?.view?.spatialReference?.wkid) { // realtime
      const isSpecialCS = sr.isWebMercator
      if (isSpecialCS) {
        return allUnits
      } else if (curWkidNum === 4326 || sr.isGeographic) {
        return geographicUnits
      } else {
        return projectUnits
      }
    } else if (sr.isGeographic) {
      return geographicUnits
    }
    return allUnits
  }

  const nameChange = (event) => {
    const value = event.target.value
    setItemLabel(value)
  }

  const nameAccept = (value) => {
    value = value?.trim()
    value = value === '' ? name : value
    if (value !== itemLabel) {
      setItemLabel(value)
    }
    multiOptionsChange({ name: value })
  }

  const wkidLink = (
    <Link
      className='wkid-link jimu-outline-inside'
      icon
      to={helpUrl}
      target='_blank'
      title={'WKID'}
      aria-label={'WKID'}
    >
      {'WKID'}
    </Link>
  )

  const outputSystemTip = (
    <div className='w-100'>
      <div className='p-1 d-flex justify-content-between'>
        <div className='tip-text'>{translate('outputCoordinate', { wkid: wkidLink })}</div>
        <Tooltip title={outputCoordinateHint} showArrow placement='left'>
          <Button icon type='tertiary' className='d-inline jimu-outline-inside' disableHoverEffect={true} disableRipple={true}>
            <InfoOutlined />
          </Button>
        </Tooltip>
      </div>
    </div>
  )

  const displayUnitsTip = (
    <div className='w-100'>
      <div className='p-1 d-flex justify-content-between'>
        <div className='tip-text'>{elevationUnitLabel}</div>
        <Tooltip title={elevationHint} showArrow placement='left'>
          <Button icon type='tertiary' className='d-inline jimu-outline-inside' disableHoverEffect={true} disableRipple={true}>
            <InfoOutlined />
          </Button>
        </Tooltip>
      </div>
    </div>
  )

  const datumTip = (
    <div className='w-100'>
      <div className='p-1 d-flex justify-content-between'>
        <div className='tip-text'>{translate('datumTransformation', { wkid: wkidLink })}</div>
        <Tooltip title={datumTransformationHint} showArrow placement='left'>
          <Button icon type='tertiary' className='d-inline jimu-outline-inside' disableHoverEffect={true} disableRipple={true}>
            <InfoOutlined />
          </Button>
        </Tooltip>
      </div>
    </div>
  )

  return (
    <div className='w-100 h-100' css={getPanelStyle(theme)}>
      <div className='w-100 h-100 system-config-panel'>
        {allDataLoaded
          ? <Fragment>
            <SettingSection className='pt-0'>
              <SettingRow
                flow='wrap'
                label={outputSystemTip}
                truncateLabel={false}
                className='mt-0'
              >
                <NumericInput
                  size='sm'
                  className='w-100'
                  value={curWkid}
                  precision={0}
                  min={0}
                  onChange={wkidChange}
                  onAcceptValue={wkidAccept}
                  showHandlers={false}
                  aria-describedby={'output-system-name'}
                  aria-label={translate('outputCoordinate', { wkid: 'WKID' })}
                />
              </SettingRow>
              <div id='output-system-name' className='text-break system-name d-flex align-items-center'>
                {wkidInvalid
                  ? <Fragment>
                      <WarningOutlined color={theme.sys.color.error.main} />
                      <div className='invalid-tips'>
                        {invalidWkidTips}
                      </div>
                  </Fragment>
                  : systemName
                }
              </div>
            </SettingSection>

            <SettingSection title={translate('label')}>
              <SettingRow>
                <TextInput
                  size='sm'
                  type='text'
                  className='w-100'
                  value={itemLabel}
                  onChange={nameChange}
                  onAcceptValue={nameAccept}
                  aria-label={translate('label')}
                />
              </SettingRow>
            </SettingSection>

            <SettingSection>
              <SettingRow
                flow='wrap'
                label={displayUnitsLabel}
              >
                <Select
                  size='sm'
                  value={displayUnit}
                  onChange={handleUnitChange}
                  aria-label={displayUnitsLabel}
                  disabled={!curWkid || wkidInvalid}
                >
                  {getUnitOptions()}
                </Select>
              </SettingRow>

              <SettingRow
                flow='wrap'
                label={displayUnitsTip}
                truncateLabel={false}
              >
                <div role='radiogroup' className='mb-4' aria-label={elevationUnitLabel}>
                  <Label className='d-flex align-items-center'>
                    <Radio
                      style={{ cursor: 'pointer' }}
                      name='elevationUnitType'
                      className='mr-2'
                      checked={elevationUnit === ElevationUnitType.metric}
                      onChange={() => { multiOptionsChange({ elevationUnit: ElevationUnitType.metric }) }}
                      disabled={!curWkid || wkidInvalid}
                    />
                    {elevMeter}
                  </Label>
                  <Label className='d-flex align-items-center'>
                    <Radio
                      style={{ cursor: 'pointer' }}
                      name='elevationUnitType'
                      className='mr-2'
                      checked={elevationUnit === ElevationUnitType.imperial}
                      onChange={() => { multiOptionsChange({ elevationUnit: ElevationUnitType.imperial }) }}
                      disabled={!curWkid || wkidInvalid}
                    />
                    {elevMile}
                  </Label>
                </div>
              </SettingRow>
            </SettingSection>

            {(datumStatus || datum2Status) &&
              <SettingSection>
                <SettingRow flow='wrap' label={datumTip} truncateLabel={false} />
                {datumStatus &&
                  <Fragment>
                    <SettingRow flow='wrap' className='mt-0'>
                      {datumStatus && datum2Status &&
                        <div>{mapInfo?.title}</div>
                      }
                      <NumericInput
                        size='sm'
                        className='w-100'
                        value={curDatumWkid}
                        precision={0}
                        min={0}
                        onChange={datumWkidChange}
                        onAcceptValue={datumWkidAccept}
                        showHandlers={false}
                        aria-describedby={'datum-transformation-1'}
                        aria-label={translate('datumTransformation', { wkid: 'WKID' })}
                        disabled={!curWkid || wkidInvalid}
                      />
                    </SettingRow>
                    {datumWkidInvalid
                      ? <div id='datum-transformation-1' className='text-break system-name d-flex align-items-center'>
                          <WarningOutlined color={theme.sys.color.error.main} />
                          <div className='invalid-tips'>
                            {invalidDatumWkidTips}
                          </div>
                      </div>
                      : <Fragment>
                        <div id='datum-transformation-1' className='text-break system-name d-flex align-items-center'>
                          <div className='w-100'>{datumName}</div>
                        </div>
                        {datumName &&
                          <Label className='d-flex align-items-center mt-2'>
                            <Checkbox
                              checked={transformForward}
                              className='mr-1'
                              onChange={evt => { multiOptionsChange({ transformForward: evt.target.checked }) }}
                            />
                            {translate('useTransformationForward')}
                          </Label>
                        }
                      </Fragment>
                    }
                  </Fragment>
                }
                {datum2Status &&
                  <Fragment>
                    <SettingRow flow='wrap' className='mt-0'>
                      {datumStatus && datum2Status &&
                        <div>{mapInfo2?.title}</div>
                      }
                      <NumericInput
                        size='sm'
                        className='w-100'
                        value={curDatumWkid2}
                        precision={0}
                        min={0}
                        onChange={datumWkid2Change}
                        onAcceptValue={datumWkid2Accept}
                        showHandlers={false}
                        aria-describedby={'datum-transformation-2'}
                        aria-label={translate('datumTransformation', { wkid: 'WKID' })}
                        disabled={!curWkid || wkidInvalid}
                      />
                    </SettingRow>
                    {datumWkid2Invalid
                      ? <div id='datum-transformation-2' className='text-break system-name d-flex align-items-center'>
                          <WarningOutlined color={theme.sys.color.error.main} />
                          <div className='invalid-tips'>
                            {invalidDatumWkidTips}
                          </div>
                      </div>
                      : <Fragment>
                        <div id='datum-transformation-2' className='text-break system-name d-flex align-items-center'>
                          <div className='w-100'>{datumName2}</div>
                        </div>
                        {datumName2 &&
                          <Label className='d-flex align-items-center mt-2'>
                            <Checkbox
                              checked={transformForward2}
                              className='mr-1'
                              onChange={evt => { multiOptionsChange({ transformForward2: evt.target.checked }) }}
                            />
                            {translate('useTransformationForward')}
                          </Label>
                        }
                      </Fragment>
                    }
                  </Fragment>
                }
              </SettingSection>
            }
          </Fragment>
          : <Loading type={LoadingType.Secondary} />
        }
      </div>
    </div>
  )
}
