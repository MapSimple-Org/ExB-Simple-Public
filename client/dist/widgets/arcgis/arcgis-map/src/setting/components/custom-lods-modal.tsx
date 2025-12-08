import { React, hooks, css, type ImmutableArray } from 'jimu-core'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, NumericInput, AlertPopup, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import type { JimuMapView } from 'jimu-arcgis'
import mapDefaultMessages from '../translations/default'
import { getOriginalBasemapLODs, sortLODs } from '../../utils'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { ResetOutlined } from 'jimu-icons/outlined/editor/reset'

export interface CustomLodsModalProps {
  jimuMapView: JimuMapView
  lods: ImmutableArray<__esri.LODProperties>
  onModalOk: (lods: __esri.LoadableProperties[]) => void
  onModalCancel: () => void
}

const style = css`
max-width: 480px !important;

.scale-numeric-input {
  margin-right: 1px;
}

.lod-list {
  height: 224px;
  background-color: var(--sys-color-action-input-field);
  color: var(--sys-color-surface-background-text);
  font-size: 14px;
  overflow: auto;
}

.lod-item {
  height: 32px;

  .lod-scale-text {
    height: 32px;
    line-height: 32px;
    cursor: default;
  }

  .delete-icon {
    cursor: pointer;
  }
}
`

export function CustomLodsModal(props: CustomLodsModalProps) {
  const jimuMapViewRef = React.useRef<JimuMapView>(null)
  jimuMapViewRef.current = props.jimuMapView
  const lodsPropRef = React.useRef<ImmutableArray<__esri.LODProperties>>(null)
  // If 'lods' undefined(or null, or empty array), means user doesn't customize LODs yet. This is the default value.
  // If customLODs.lods is a not-empty array, means user already customizes LODs.
  lodsPropRef.current = props.lods
  const onModalOkProp = props.onModalOk
  const onModalCancelProp = props.onModalCancel

  const [lodsState, setLodsState] = React.useState<__esri.LODProperties[]>([])
  const finalLodsState = lodsState || []
  const [numericInputValue, setNumericInputValue] = React.useState<number>(undefined)
  const [isAlertPopupOpen, setIsAlertPopupOpen] = React.useState<boolean>(false)

  const translate = hooks.useTranslation(jimuUIMessages, mapDefaultMessages)
  const customizeScaleListLabel = translate('customizeScaleList')
  const deleteLabel = translate('delete')
  const resetLodLabel = translate('resetLod')
  const keepAtLeastOneLodLabel = translate('keepAtLeastOneLod')
  const okLabel = translate('ok')
  const cancelLabel = translate('cancel')

  // only init lodsState after component mounted
  React.useEffect(() => {
    const propLods = lodsPropRef.current
    const propJimuMapView = jimuMapViewRef.current

    if (propLods?.length > 0) {
      const mutablePropLods = propLods.asMutable({ deep: true })
      setLodsState(mutablePropLods)
    } else {
      const lods = getOriginalBasemapLODs(propJimuMapView?.view)
      setLodsState(lods)
    }
  }, []) // make sure no dependencies

  const onNumericInputChange = React.useCallback((value) => {
    if (typeof value === 'number' && !isNaN(value) && value > 0) {
      setNumericInputValue(value)
    }
  }, [])

  const onAddScaleBtnClick = React.useCallback(() => {
    const newScale = numericInputValue

    if (typeof newScale === 'number' && !isNaN(newScale) && newScale > 0 && lodsState?.length > 0) {
      const sameScaleLod = lodsState.find(lod => lod?.scale === newScale)

      if (!sameScaleLod) {
        const firstLod = lodsState[0]

        if (firstLod) {
          const newResolution = newScale / firstLod.scale * firstLod.resolution

          if (typeof newResolution === 'number' && !isNaN(newResolution) && newResolution > 0) {
            const newLod: __esri.LODProperties = {
              level: lodsState.length,
              resolution: newResolution,
              scale: newScale
            }

            let newLodsState: __esri.LODProperties[] = lodsState.slice()
            newLodsState.push(newLod)
            newLodsState = sortLODs(newLodsState)

            setLodsState(newLodsState)
          }
        }
      }
    }

    setNumericInputValue(undefined)
  }, [lodsState, numericInputValue])

  const onAlertPopupOkBtnClick = React.useCallback(() => {
    setIsAlertPopupOpen(false)
  }, [])

  const onResetLodsBtnClick = React.useCallback(() => {
    const propJimuMapView = jimuMapViewRef.current
    const lods = getOriginalBasemapLODs(propJimuMapView?.view)
    setLodsState(lods)
  }, [])

  const onClickLodDeleteIcon = React.useCallback((selectedLodIndex: number) => {
    if (lodsState?.length > 0 && selectedLodIndex >= 0) {
      let newLodsState = lodsState.filter((lod, index) => index !== selectedLodIndex)

      if (newLodsState.length > 0) {
        newLodsState = sortLODs(newLodsState)
        setLodsState(newLodsState)
      } else {
        setIsAlertPopupOpen(true)
      }
    }
  }, [lodsState])

  const onModalOkBtnClick = React.useCallback(() => {
    if (onModalOkProp) {
      onModalOkProp(lodsState)
    }
  }, [lodsState, onModalOkProp])

  const onModalCancelBtnClick = React.useCallback(() => {
    if (onModalCancelProp) {
      onModalCancelProp()
    }
  }, [onModalCancelProp])

  return (
    <React.Fragment>
      <Modal
        className='custom-lods-modal'
        centered
        isOpen
        keyboard
        css={style}
      >
        <ModalHeader
          className='d-flex justify-content-between align-items-center'
          toggle={onModalCancelBtnClick}
        >
          {customizeScaleListLabel}
        </ModalHeader>
        <ModalBody className='w-auto pt-5'>
          <div className='scale-input-container d-flex align-items-center'>
            <NumericInput
              className='scale-numeric-input w-100'
              showHandlers={false}
              min={0}
              value={numericInputValue}
              onChange={onNumericInputChange}
            />
            <Button className='ml-2' icon onClick={onAddScaleBtnClick}>
              <PlusOutlined />
            </Button>
          </div>
          <div className='lod-list mt-6 pl-2 pr-2'>
            {
              finalLodsState?.length > 0 && finalLodsState.map((lod, index) => {
                return (
                  <div
                    key={index}
                    className='lod-item d-flex align-items-center'
                  >
                    <div className='lod-scale-text w-100' aria-label={lod.scale?.toString()}>{lod.scale}</div>
                    <CloseOutlined className='delete-icon ml-2' aria-label={deleteLabel} onClick={() => { onClickLodDeleteIcon(index) }} />
                  </div>
                )
              })
            }
          </div>
          <Button
            className='mt-2'
            aria-label={resetLodLabel}
            variant='text'
            onClick={onResetLodsBtnClick}
          >
            <ResetOutlined />
            {resetLodLabel}
          </Button>
        </ModalBody>
        <ModalFooter className='d-flex'>
          <Button
            type='primary'
            className='ml-auto mr-2'
            style={{ minWidth: '64px', minHeight: '32px' }}
            aria-label={okLabel}
            onClick={onModalOkBtnClick}
          >
            {okLabel}
          </Button>
          <Button
            type='secondary'
            style={{ minWidth: '64px', minHeight: '32px' }}
            aria-label={cancelLabel}
            onClick={onModalCancelBtnClick}
          >
            {cancelLabel}
          </Button>
        </ModalFooter>
      </Modal>

      <AlertPopup
        isOpen={isAlertPopupOpen}
        severity='warning'
        title=''
        description={keepAtLeastOneLodLabel}
        withIcon
        closable={false}
        hideCancel
        onClickOk={onAlertPopupOkBtnClick}
      />
    </React.Fragment>
  )
}
