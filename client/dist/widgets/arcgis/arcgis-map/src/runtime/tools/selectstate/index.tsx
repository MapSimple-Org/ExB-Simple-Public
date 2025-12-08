/** @jsx jsx */
import { css, jsx, React } from 'jimu-core'
import { Button, Icon, defaultMessages } from 'jimu-ui'
import { BaseTool, type BaseToolProps, type IconType } from '../../layout/base/base-tool'
import { SelectedNumber } from './selected-number'

const SelectZoomtoIcon = require('../../assets/icons/select-tool/select-zoomto.svg')
const SelectClearIcon = require('jimu-icons/svg/outlined/editor/clear-selection-general.svg')

interface States {
  selectedGraphicCount: number
}

export default class SelectState extends BaseTool<BaseToolProps, States> {
  toolName = 'SelectState'

  constructor (props) {
    super(props)

    this.state = {
      selectedGraphicCount: 0
    }
  }

  getMobileStyle () {
    return css`
      background-color: var(--sys-color-surface-overlay);
      color: var(--sys-color-surface-overlay-text);
    `
  }

  getTitle () {
    return ''
  }

  getIcon (): IconType {
    return null
  }

  handleSelectedGraphicsChanged = (selectedGraphicCount: number) => {
    this.setState({
      selectedGraphicCount
    })
  }

  zoomToSelectedFeatures = async () => {
    const view = this.props.jimuMapView?.view

    if (view) {
      const graphics = await this.getSelectedGraphics()

      if (graphics.length > 0) {
        view.goTo(graphics)
      }
    }
  }

  async getSelectedGraphics () {
    let selectedGraphics = []

    if (this.props.jimuMapView) {
      selectedGraphics = await this.props.jimuMapView.getSelectedFeatures()
    }

    return selectedGraphics
  }

  clearSelectedFeatures = async () => {
    const jimuMapView = this.props.jimuMapView

    if (jimuMapView) {
      try {
        const updateSelection = false
        await jimuMapView.cancelSelectByQuery(updateSelection)
      } catch (e) {
        console.error(`jimuMapView.cancelSelectByQuery() error, jimuMapViewId: ${jimuMapView.id}`, e)
      }

      setTimeout(() => {
        jimuMapView.clearSelectedFeatures()
      }, 200)
    }
  }

  getExpandPanel (): React.JSX.Element {
    const selectedFeaturesTip = this.props.intl.formatMessage({ id: 'SelectionSelectedFeatures', defaultMessage: defaultMessages.SelectionSelectedFeatures })
    const clearSelectionTitle = this.props.intl.formatMessage({ id: 'clearSelection', defaultMessage: defaultMessages.clearSelection })
    const zoomToSelectedFeaturesTip = this.props.intl.formatMessage({ id: 'SelectionZoomToSelectedFeatures', defaultMessage: defaultMessages.SelectionZoomToSelectedFeatures })

    if (this.props.isMobile) {
      return (
        <div css={this.getMobileStyle()} className='w-100 d-flex justify-content-between align-items-center' style={{ height: '40px' }}>
          <div className='ml-2'>
            {`${selectedFeaturesTip}: ${this.state.selectedGraphicCount}`}
          </div>
          <div className='d-flex'>
            <div
              title={zoomToSelectedFeaturesTip}
              className='h-100 border border-top-0 border-bottom-0 d-flex justify-content-center align-items-center' style={{ width: '40px', cursor: 'pointer' }}
              onClick={this.zoomToSelectedFeatures}
            >
              <Icon width={18} height={18} icon={SelectZoomtoIcon} />
            </div>
            <div
              className='h-100 d-flex justify-content-center align-items-center' style={{ width: '40px', cursor: 'pointer' }}
              onClick={this.clearSelectedFeatures}
              title={clearSelectionTitle}
            >
              <Icon width={18} height={18} icon={SelectClearIcon} />
            </div>
          </div>
          <SelectedNumber jimuMapView={this.props.jimuMapView} onSelectedGraphicsChanged={this.handleSelectedGraphicsChanged} />
        </div>
      )
    } else {
      return (
        <React.Fragment>
          <Button className='border-0' style={{ borderRadius: 0 }} onClick={this.zoomToSelectedFeatures} title={zoomToSelectedFeaturesTip}>
            <Icon width={16} height={16} icon={SelectZoomtoIcon} className='mr-2' />
            {`${selectedFeaturesTip}: ${this.state.selectedGraphicCount}`}
          </Button>
          <SelectedNumber jimuMapView={this.props.jimuMapView} onSelectedGraphicsChanged={this.handleSelectedGraphicsChanged} />
        </React.Fragment>
      )
    }
  }
}
