/** @jsx jsx */
import {
  React, jsx, type SerializedStyles,
  type IMThemeVariables, css, polished, type IntlShape, defaultMessages as jimuCoreNls,
  focusElementInKeyboardMode
} from 'jimu-core'
import { Button, TextInput, Dropdown, DropdownButton, DropdownMenu, DropdownItem, Label, Badge, defaultMessages as jimuUiNls } from 'jimu-ui'
import { PageMode, NewFeatureMode } from '../../setting'
import type { JimuMapView } from 'jimu-arcgis'
import type { FlyIds } from '../../../common/fly-facade/fly-manager'
import type { RouteConfig } from '../../../common/fly-facade/plan-routes/routes'
import type { RecordConfig } from '../../../common/fly-facade/plan-routes/record/record'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import nls from '../../translations/default'
import { RecordList } from './record/record-list'
import type { TreeItemsType } from 'jimu-ui/basic/list-tree'
import * as utils from '../../../common/utils/utils'

import { PinEsriOutlined } from 'jimu-icons/outlined/gis/pin-esri'
import { PolylineOutlined } from 'jimu-icons/outlined/gis/polyline'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { PlayOutlined } from 'jimu-icons/outlined/editor/play'
import { PauseOutlined } from 'jimu-icons/outlined/editor/pause'

interface Props {
  routeConfig: RouteConfig
  mapPopperJimuMapView: JimuMapView
  isTerrainLoaded: boolean
  theme: IMThemeVariables
  intl: IntlShape

  onShowMapPopperChange: (isShow: boolean) => void
  onSettingPageModeChange: (mode: PageMode) => void

  onRouteNameChange: (ids: FlyIds, name: string) => void
  onRouteEdit: (ids: FlyIds) => void
  onRouteDelete: (ids: FlyIds) => void

  // newFeatureMode
  newFeatureMode: NewFeatureMode
  onNewFeatureModeChange: (mode: NewFeatureMode) => void

  isPreviewRouteBtnPlaying: boolean
  onPreviewRoute: (speed: number, ids: FlyIds, needToReset: boolean) => void
  onPauseRoutePreview: () => void

  newestRecordIdx: string// for Btn badge or hightLight in list

  playingInfo: FlyIds
  onRecordEdit: (ids: FlyIds) => void
  onRecordPreview: (ids: FlyIds) => void
  onPauseRecordPreview: (ids: FlyIds, avoidTrigger?: boolean) => void
  onRecordDelete: (ids: FlyIds) => void
  onRecordsOrderUpdate: (treeItems: TreeItemsType) => void

  onRecordHighlight: (ids: FlyIds) => void

  isRecordCanPlay: (record: RecordConfig) => boolean

  isDrawHelperLoaded: boolean

  highlightL2RecordId: string
}
interface States {
  isNewFeaturePopupOpen: boolean
  previewNeedToResetFlag: boolean
  is2DJimuMapView: boolean
}

export class RouteDetail extends React.PureComponent<Props, States> {
  backBtnRefFor508: HTMLButtonElement = null //508

  constructor (props) {
    super(props)
    this.state = {
      isNewFeaturePopupOpen: false,
      previewNeedToResetFlag: false,
      is2DJimuMapView: false
    }
  }

  handleKeydown = (e: any, ref): void => {
    if (e.key === 'Enter') {
      ref.current.blur()
    }
  }

  componentDidMount (): void {
    focusElementInKeyboardMode(this.backBtnRefFor508) //508
  }

  componentDidUpdate (prevProps: Props/*, prevState: States */): void {
    if (this.props.newestRecordIdx !== prevProps.newestRecordIdx) {
      this._handleNewRecordNotify()
    }
    // Badge
    if (this.props.routeConfig !== prevProps.routeConfig) {
      if (this._handleIsDisablePlayBtn()) {
        this.setState({ previewNeedToResetFlag: false })
      }
    }

    // mapPopperJimuMapView changed
    if (this.props.mapPopperJimuMapView !== prevProps.mapPopperJimuMapView) {
      if (this.props.mapPopperJimuMapView.view.type === '2d') {
        this.setState({ is2DJimuMapView: true })
        this.setState({ previewNeedToResetFlag: false })
      } else {
        this.setState({ is2DJimuMapView: false })
      }
    }
  }

  _handleIsDisablePlayBtn = (): boolean => {
    const records: RecordConfig[] = this.props.routeConfig.records
    const isDisablePlayBtn = (records.length <= 0)
    return isDisablePlayBtn
  }

  _handleNewRecordNotify = (): void => {
    this.setState({ previewNeedToResetFlag: true })
  }

  handleRecordEdit = (ids: FlyIds): void => {
    this.props.onRecordEdit(ids)
    this.setState({ previewNeedToResetFlag: true })
  }

  handleRecordPreview = (ids: FlyIds): void => {
    this.props.onRecordPreview(ids)
    this.handleRecordHighlight(null)
  }

  handleRecordDelete = (ids: FlyIds): void => {
    this.props.onRecordDelete(ids)
    this.setState({ previewNeedToResetFlag: true })
  }

  handleRecordsOrderUpdate = (treeItems: TreeItemsType): void => {
    this.props.onRecordsOrderUpdate(treeItems)
    this.setState({ previewNeedToResetFlag: true })
  }

  getStyle = (/* theme: IMThemeVariables */): SerializedStyles => {
    return css`
      .map-2d-warning{
        flex-direction: column;
        margin-top: 128px;
        color: ${this.props.theme.ref.palette.neutral[800]};

        .tip {
          font-size: 14px;
        }
      }

      .description {
        height: ${polished.rem(40)};
      }

      .new-feature-dropdown {
        width: 190px;/*calc(100% - ${polished.rem(32)});*/
      }

      .del-btn-wrapper {
        position: relative;

        .delete-con {
          & {
            position: absolute;
            bottom: ${polished.rem(16)};
            width: 100%;
            height: ${polished.rem(32)};
          }
          button {
            width: calc(100% - ${polished.rem(32)});
          }
        }
      }
      `
  }

  handleBackBtnClick = (): void => {
    this.props.onShowMapPopperChange(false)
    this.props.onRouteEdit({ routeUuid: null })
    this.props.onSettingPageModeChange(PageMode.Common)
  }

  handleDeleteClick = (): void => {
    this.props.onRouteDelete({ routeUuid: this.props.routeConfig.idx })
    this.handleBackBtnClick()
  }

  handleRouteNameChange = (name: string): void => {
    this.props.onRouteNameChange({ routeUuid: this.props.routeConfig.idx }, name)
  }

  handleRecordHighlight = (ids: FlyIds): void => {
    const _ids = (ids === null) ? null : ({ ...ids, ...{ routeUuid: this.props.routeConfig.idx } })
    this.props.onRecordHighlight(_ids)
  }

  render (): React.ReactElement {
    const { routeConfig } = this.props

    const backLabel = this.props.intl.formatMessage({ id: 'back', defaultMessage: jimuUiNls.back })
    const deleteLabel = this.props.intl.formatMessage({ id: 'delete', defaultMessage: jimuCoreNls.delete })
    const nameLabel = this.props.intl.formatMessage({ id: 'label', defaultMessage: jimuUiNls.label })
    const choose3DMapTip = this.props.intl.formatMessage({ id: 'chooseMapTip', defaultMessage: nls.chooseMapTip })
    // const descriptionLabel = this.props.intl.formatMessage({ id: 'description', defaultMessage: jimuUiNls.description });
    // const desPlaceHolder = this.props.intl.formatMessage({ id: 'desPlaceHolder', defaultMessage: nls.desPlaceHolder });
    const titleTextInput = React.createRef<HTMLInputElement>()

    const records: RecordConfig[] = routeConfig.records
    return (utils.isDefined(routeConfig) &&
      <div className='w-100 h-100' css={this.getStyle(/* theme */)}>
        {/* 1 header & content */}
        <div className='w-100 h-100'>
          {/* level-2 */}
          <SettingSection>
            <Button className='page-back-btn p-0 mt-1 mb-2' type='tertiary'
              title={backLabel} aria-label={backLabel}
              onClick={this.handleBackBtnClick} ref={(ref) => { this.backBtnRefFor508 = ref }} >
              <ArrowLeftOutlined size={16} autoFlip />
              <Label className='m-0'>{backLabel}</Label>
            </Button>

            <SettingRow label={nameLabel} />
            <SettingRow>
              <TextInput
                className='w-100' ref={titleTextInput} size='sm' required
                title={routeConfig.displayName} defaultValue={routeConfig.displayName ?? ''}
                onAcceptValue={this.handleRouteNameChange}
                onKeyDown={(e) => { this.handleKeydown(e, titleTextInput) }}
              />
            </SettingRow>
            {/* <SettingRow label={descriptionLabel} />
            <SettingRow>
              <TextInput className="w-100 description" type="textarea" ref={titleTextInput} size="sm" placeholder={desPlaceHolder}
                height={"2rem"}
                title={routeConfig.displayName} value={routeConfig.displayName || ''}
                onChange={evt => this.onRouteNameChange(routeConfig.idx, evt.target.value)}
                onKeyDown={(e) => this.handleKeydown(e, titleTextInput)}>
              </TextInput>
            </SettingRow> */}
          </SettingSection>

          <SettingSection>
            {(this.state.is2DJimuMapView) &&
              <div className='d-flex align-items-center justify-content-center map-2d-warning'>
                <InfoOutlined size={42} />
                <div className='tip text-center mt-4'>{choose3DMapTip}</div>
              </div>}

            {(!this.state.is2DJimuMapView) &&
              <React.Fragment>
                <div className='d-flex justify-content-between mb-5'>
                  {this.renderNewFeatureContent()}
                  {this.renderPreviewContent()}
                </div>

                {/* RecordList */}
                {(utils.isDefined(records) &&
                  <RecordList
                    records={records}
                    mapPopperJimuMapView={this.props.mapPopperJimuMapView}
                    isTerrainLoaded={this.props.isTerrainLoaded}
                    theme={this.props.theme}
                    intl={this.props.intl}
                    //
                    playingInfo={this.props.playingInfo}
                    //
                    onRecordEdit={this.handleRecordEdit}
                    onRecordPreview={this.handleRecordPreview}
                    onPauseRecordPreview={this.props.onPauseRecordPreview}
                    onRecordDelete={this.handleRecordDelete}
                    onRecordsOrderUpdate={this.handleRecordsOrderUpdate}
                    onRecordHighlight={this.handleRecordHighlight}
                    // onSettingPageModeChange={this.props.onSettingPageModeChange}
                    isRecordCanPlay={this.props.isRecordCanPlay}
                    highlightL2RecordId={this.props.highlightL2RecordId}
                  />
                )}
              </React.Fragment>}
          </SettingSection>
        </div>

        {/* 2 footer */}
        <SettingRow className='del-btn-wrapper'>
          <div className='d-flex w-100 justify-content-center delete-con'>
            <Button type='secondary' title={deleteLabel} aria-label={deleteLabel}
              onClick={this.handleDeleteClick}>
              {deleteLabel}
            </Button>
          </div>
        </SettingRow>
      </div>
    )
  }

  /// /////////////////////////////////////////////////////////////////////////////
  // NewFeature
  toggleNewFeaturePopup = (): void => {
    this.setState({ isNewFeaturePopupOpen: !this.state.isNewFeaturePopupOpen })
  }

  handleNewFeatureModeClick = (mode: NewFeatureMode): void => {
    this.props.onNewFeatureModeChange(mode)
  }

  renderNewFeatureContent (): React.ReactElement {
    const newFeatureTip = this.props.intl.formatMessage({ id: 'newFeature', defaultMessage: nls.newFeature })
    const addPointTip = this.props.intl.formatMessage({ id: 'addPoint', defaultMessage: nls.addPoint })
    const addPathTip = this.props.intl.formatMessage({ id: 'addPath', defaultMessage: nls.addPath })

    const isDisable = !this.props.isDrawHelperLoaded || this.state.is2DJimuMapView || !this.props.isTerrainLoaded
    return (
      <Dropdown isOpen={this.state.isNewFeaturePopupOpen} toggle={this.toggleNewFeaturePopup} className='dropdowns' activeIcon disabled={isDisable} menuRole='listbox'>
        <DropdownButton icon className='new-feature-dropdown operation-btns' arrow={false} role='combobox'>
          {newFeatureTip}
        </DropdownButton>
        <DropdownMenu showArrow={false}>
          <DropdownItem onClick={() => { this.handleNewFeatureModeClick(NewFeatureMode.Point) }} className='dropdown-items'>
            <PinEsriOutlined />
            <span className='mx-2'>{addPointTip}</span>
          </DropdownItem>
          <DropdownItem onClick={() => { this.handleNewFeatureModeClick(NewFeatureMode.Path) }} className='dropdown-items'>
            <PolylineOutlined />
            <span className='mx-2'>{addPathTip}</span>
          </DropdownItem>
          {/* <DropdownItem onClick={() => this.onNewFeatureModeClick(NewFeatureMode.Pick)}  className="dropdown-items">
          <Icon icon={pickIcon} />
          <span className="mx-2">{'Select Feature'}</span>
        </DropdownItem> */}
        </DropdownMenu>
      </Dropdown>
    )
  }

  /// ///////////////////////////////////////////////////////////////
  // preview comp
  handlePreviewRoute = (): void => {
    this.handleRecordHighlight(null)

    if (this.props.isPreviewRouteBtnPlaying) {
      // Pause
      this.props.onPauseRoutePreview()
    } else {
      // Play
      const speed = 0.5// mid speed
      this.props.onPreviewRoute(speed, { routeUuid: this.props.routeConfig.idx }, this.state.previewNeedToResetFlag)
      this.setState({ previewNeedToResetFlag: false })// clean badge
    }
  }

  renderPreviewContent (): React.ReactElement {
    let content
    const previewLabel = this.props.intl.formatMessage({ id: 'previewRoute', defaultMessage: nls.previewRoute })
    const previewWithBadgeLabel = this.props.intl.formatMessage({ id: 'previewRouteBadge', defaultMessage: nls.previewRouteBadge })
    const pauseLabel = this.props.intl.formatMessage({ id: 'pause', defaultMessage: jimuUiNls.pause })
    const isDisable = this._handleIsDisablePlayBtn() || !this.props.isDrawHelperLoaded || this.state.is2DJimuMapView || !this.props.isTerrainLoaded

    if (this.props.isPreviewRouteBtnPlaying) {
      content = (
        <Button icon onClick={this.handlePreviewRoute} title={pauseLabel} aria-label={pauseLabel} disabled={isDisable}>
          <PauseOutlined />
        </Button>
      )
    } else {
      const title = (this.state.previewNeedToResetFlag) ? previewWithBadgeLabel : previewLabel
      content = (
        <Button icon onClick={this.handlePreviewRoute} title={title} aria-label={title} disabled={isDisable}>
          <PlayOutlined />
        </Button>
      )
    }

    return (
      <Badge dot hideBadge={!this.state.previewNeedToResetFlag} color='error'>
        {content}
      </Badge>
    )
  }
}
