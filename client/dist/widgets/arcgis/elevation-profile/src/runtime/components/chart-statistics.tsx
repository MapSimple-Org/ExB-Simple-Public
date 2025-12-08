/** @jsx jsx */
import { React, jsx, type IntlShape, type IMThemeVariables } from 'jimu-core'
import { Label, Button, Collapse, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { convertSingle } from '../../common/unit-conversion'
import defaultMessages from '../translations/default'
import { unitOptions, ElevationProfileStatisticsName, getReverseStatsOnFlip } from '../constants'
import { RightOutlined } from 'jimu-icons/outlined/directional/right'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import type { Statistics } from '../../config'

interface Props {
  theme: IMThemeVariables
  intl: IntlShape
  parentWidgetId: string
  index: number
  key: number
  isShowViewLineInGraph: boolean
  legendName: string
  activeDsConfig: any
  selectedElevationUnit: string
  selectedLinearUnit: string
  chartProfileResult: any
  selectedStatsDisplay: Statistics[]
  statsLineColor: string
  seriesId: string
  renderSeries: boolean
  toggledSeriesId: string
  isFlip: boolean
  chartDataUpdateTime: number
}

interface IState {
  legendExpanded: boolean
  statsResultList: React.JSX.Element[]
}

export default class ProfileStatistics extends React.PureComponent<Props, IState> {
  private _selectedStats: any
  constructor (props) {
    super(props)
    this.state = {
      legendExpanded: this.props.index === 0,
      statsResultList: []
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl && this.props.intl.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = () => {
    //generate the statistics list for displaying in the legend section
    this.generateStats()
  }

  generateStats = () => {
    this._selectedStats = []
    this.props.activeDsConfig.elevationLayersSettings.addedElevationLayers[this.props.index]?.selectedStatistics?.forEach((stats) => {
      if (stats.enabled) {
        this._selectedStats.push({
          label: stats.label,
          name: stats.name
        })
      }
    })
    if (this.props.isShowViewLineInGraph && !this.props.activeDsConfig.elevationLayersSettings.addedElevationLayers[this.props.index]) {
      this.props.activeDsConfig.elevationLayersSettings.volumetricObjSettingsOptions.selectedStatistics.forEach((stats) => {
        if (stats.enabled) {
          this._selectedStats.push({
            label: stats.label,
            name: stats.name
          })
        }
      })
    }
    this.selectedStatisticsDisplay()
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.selectedElevationUnit !== this.props.selectedElevationUnit ||
      prevProps.selectedLinearUnit !== this.props.selectedLinearUnit ||
      prevProps.selectedStatsDisplay !== this.props.selectedStatsDisplay ||
      prevProps.isFlip !== this.props.isFlip ||
      prevProps.chartDataUpdateTime !== this.props.chartDataUpdateTime) {
      this.generateStats()
    }

    if (prevProps.renderSeries !== this.props.renderSeries) {
      this.selectedStatisticsDisplay()
    }
  }

  selectedStatisticsDisplay = () => {
    const items: React.JSX.Element[] = []
    let statsValueWithUnit = ''
    let statsValue = null
    let statisticsName = ''
    this._selectedStats.forEach((stat) => {
      if (!this.props.renderSeries && this.props.seriesId === this.props.toggledSeriesId) { //on series hide, make the statistics values blank
        statsValueWithUnit = this.nls('noStatsValue')
      } else {
        statisticsName = stat.name
        if (!this.props.chartProfileResult) {
          statsValueWithUnit = this.nls('noStatsValue')
        } else {
          if (this.props.isFlip) {
            if (stat.name !== ElevationProfileStatisticsName.AvgElevation &&
              stat.name !== ElevationProfileStatisticsName.MaxDistance &&
              stat.name !== ElevationProfileStatisticsName.MaxElevation &&
              stat.name !== ElevationProfileStatisticsName.MinElevation) {
              statisticsName = getReverseStatsOnFlip(stat.name)
            }
          }
          statsValue = this.props.chartProfileResult?.statistics?.[statisticsName]
          statsValueWithUnit = this.getStatsValueWithUnit(statsValue, statisticsName)
        }
      }
      items.push(<React.Fragment>
        <div tabIndex={0} className={'statistic-info'}>
          <Label id={this.props.parentWidgetId + this.props.index} aria-label={this.nls(stat.name)} className={'statistic-label text-break mb-1 pt-4'}>
            {this.nls(stat.name)}
          </Label>
          <div tabIndex={0} aria-label={statsValueWithUnit}>{statsValueWithUnit}</div>
        </div>
      </React.Fragment>
      )
    })
    this.setState({
      statsResultList: items
    })
  }

  getStatsValueWithUnit = (statVal, name): string => {
    let roundOffStat = ''
    let convertedStats: number = null
    unitOptions.forEach((unit) => {
      if (name === ElevationProfileStatisticsName.MaxDistance) {
        if (unit.value === this.props.selectedLinearUnit) {
          convertedStats = convertSingle(statVal, this.props.chartProfileResult?.effectiveUnits.distance, this.props.selectedLinearUnit)
          roundOffStat = this.props.intl.formatNumber(convertedStats, { maximumFractionDigits: 2 }) + ' ' + this.nls(unit.abbreviation)
        }
      } else if (name === ElevationProfileStatisticsName.MaxPositiveSlope || name === ElevationProfileStatisticsName.MaxNegativeSlope ||
         name === ElevationProfileStatisticsName.AvgPositiveSlope || name === ElevationProfileStatisticsName.AvgNegativeSlope) { //Slope values in degree unit
        if (statVal === null) {
          roundOffStat = this.nls('noStatsValue')
        } else {
          roundOffStat = this.props.intl.formatNumber(statVal, { maximumFractionDigits: 2 }) + ' ' + '\u00b0'
        }
      } else {
        if (unit.value === this.props.selectedElevationUnit) {
          convertedStats = convertSingle(statVal, this.props.chartProfileResult?.effectiveUnits.elevation, this.props.selectedElevationUnit)
          roundOffStat = this.props.intl.formatNumber(convertedStats, { maximumFractionDigits: 2 }) + ' ' + this.nls(unit.abbreviation)
        }
      }
    })
    return roundOffStat
  }

  onExpandClick = () => {
    this.setState({
      legendExpanded: !this.state.legendExpanded
    })
  }

  render () {
    const leftBorderColor = '3px solid' + this.props.statsLineColor
    return (<div tabIndex={-1}>
      <div tabIndex={-1} className={'ep-legend-section ep-shadow py-1'} style={{ borderLeft: leftBorderColor }}>
        <div tabIndex={0} className={'d-flex justify-content-between w-100 align-items-center'}>
          <Label id={this.props.parentWidgetId + this.props.index} aria-label={this.props.legendName} className={'w-100 legendLabel text-break'}>
            {this.props.legendName}
          </Label>
          <Button id={this.props.parentWidgetId + this.props.index} role={'button'} aria-expanded={this.state.legendExpanded}
            title={this.nls('expandLegend')} type={'tertiary'}
            icon size={'sm'} onClick={this.onExpandClick.bind(this)}>
            {(!this.state.legendExpanded) && <RightOutlined size={'m'} autoFlip />}
            {this.state.legendExpanded && <DownOutlined size={'m'} />}
          </Button>
        </div>
        <Collapse isOpen={this.state.legendExpanded}>
          <div tabIndex={-1} className={'stat-content'}>
            <div tabIndex={0} className={'profile-statistics'}>
              {this.state.statsResultList.map((statsResult, index) => (
                <React.Fragment key={index}>
                  {statsResult}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Collapse>
      </div>
    </div>
    )
  }
}
