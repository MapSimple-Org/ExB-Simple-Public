/** @jsx jsx */
import { React, css, hooks, jsx, defaultMessages as jimuCoreMessages, uuidv1, urlUtils, lodash, ServiceManager, classNames, focusElementInKeyboardMode, appConfigUtils } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { Button, Checkbox, type ImageParam, Loading, LoadingType, TextArea, TextInput, Tooltip, defaultMessages as jimuUIMessages } from 'jimu-ui'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import type { BasemapFromUrl, IMConfig } from '../../config'
import { ImageSelector } from 'jimu-ui/advanced/resource-selector'
import ButtonWithSidePopper from './button-with-side-popper'
import { getIdForBasemapFromUrl } from '../utils'
import { MinusCircleOutlined } from 'jimu-icons/outlined/editor/minus-circle'
import { SuccessOutlined } from 'jimu-icons/outlined/suggested/success'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { isBasemapFromUrl } from '../../utils'

interface AddBasemapsByUrlProps extends AllWidgetSettingProps<IMConfig> {
  onConfirm: (basemapInfo: BasemapFromUrl) => void
  editingBasemapId?: string
}

const style = css`
  display: flex;
  flex-direction: column;
  .form-content {
    flex: 1;
  }
  .img-container {
    width: 100%;
    height: 152px;
    img, svg {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }
  }
  .urls-container {
    li {
      list-style: none
    }
  }
  .url-input {
    border: 1px solid var(--sys-color-divider-tertiary);
    background: var(--sys-color-surface-paper);
    .button-area {
      align-items: center;
      justify-content: space-between;
      .left-icon {
        font-size: 0;
        position: relative;
        min-width: 16px;
      }
      .jimu-btn {
        background: none;
        border: 0;
        &.icon-btn .jimu-icon {
          margin: 0;
        }
        &>.icon-btn-sizer {
          min-width: 0;
          min-height: 0;
        }
      }
    }
    .warn-icon {
      display: none !important;
    }
    .jimu-input-area .jimu-loading {
      display: none;
    }
    textarea {
      height: 56px;
      border: 1px solid var(--sys-color-divider-tertiary);
    }
  }
  .add-url-input {
    text-align: right;
    .jimu-btn {
      padding: 0;
      border: 0;
      &:hover {
        background: none;
      }
    }
  }
`

export const AddBasemapsByUrlPopperContent = (props: AddBasemapsByUrlProps) => {
  const { widgetId, config, onConfirm: propOnConfirm, editingBasemapId } = props
  const { customBasemaps } = config

  const translate = hooks.useTranslation(defaultMessages, jimuCoreMessages, jimuUIMessages)

  const getDefaultLayerUrlInfo = () => {
    return { id: uuidv1(), url: '', valid: false, msg: '', finished: true, loading: false }
  }

  const [title, setTitle] = React.useState('')
  const [thumbnail, setThumbnail] = React.useState<ImageParam>()
  const [layerUrls, setLayerUrls] = React.useState([getDefaultLayerUrlInfo()])
  const [disablePopup, setDisablePopup] = React.useState(false)

  const getBasemapTitle = (usedTitles: string[]) => {
    const titlePrefix = translate('untitledBasemap')
    const indexData = []
    const reg = /^[\d]+$/
    usedTitles.forEach(title => {
      const index = title.split(`${titlePrefix} `)[1]?.split(' ')[0]
      if (reg.test(index)) {
        indexData.push(Number(index))
      } else if (title === titlePrefix) {
        indexData.push(1)
      }
    })
    indexData.sort(function (a, b) {
      return a < b ? 1 : -1
    })
    const index = indexData[0] ? indexData[0] + 1 : 1
    return index === 1 ? titlePrefix : `${titlePrefix} ${index}`
  }

  const initTitle = () => {
    const allCustomBasemapTitles = customBasemaps.filter((item) => isBasemapFromUrl(item)).map((item) => item.title)
    setTitle(getBasemapTitle([...allCustomBasemapTitles.asMutable(), title]))
  }

  React.useEffect(() => {
    if (!editingBasemapId) {
      initTitle()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const titleInputRef = React.useRef<HTMLInputElement>(null)
  const clearForm = () => {
    initTitle()
    setThumbnail(null)
    setLayerUrls([getDefaultLayerUrlInfo()])
    setDisablePopup(false)
    focusElementInKeyboardMode(titleInputRef.current)
  }

  const onConfirm = () => {
    if (checkIfAddButtonDisabled()) {
      return
    }
    const validUrls = layerUrls.filter((item) => item.valid && item.finished && !!item.url).map((item) => item.url)
    const newBasemapItem: BasemapFromUrl = {
      id: editingBasemapId || getIdForBasemapFromUrl(),
      title,
      layerUrls: validUrls
    }
    if (thumbnail) {
      newBasemapItem.thumbnail = thumbnail
    }
    if (disablePopup) {
      newBasemapItem.disablePopup = disablePopup
    }
    propOnConfirm(newBasemapItem)

    lodash.defer(clearForm)
  }

  const checkBasemapUrl = (value: string) => {
    const urlPatterns = {
      mapServer: /\/rest\/services\/.*\/MapServer\/?$/,
      imageServer: /\/rest\/services\/.*\/ImageServer\/?$/,
      vectorTileServer: /\/rest\/services\/.*\/VectorTileServer\/?$/,
      styleJson: /\/items\/.*\/resources\/styles\/root.json\/?/,
      basemapStyleService: /^https:\/\/basemapstyles-api\.arcgis.com\/arcgis\/rest\/services\/styles\/v2\/styles\/?/
    }
    const isValid = Object.values(urlPatterns).some((pattern) => pattern.test(value))
    if (isValid) {
      return { valid: true, msg: '' }
    }
    return { valid: false, msg: translate('basemapUrlInvalid') }
  }

  const checkUrl = (url: string) => {
    const urlCheckRes = urlUtils.checkAbsoluteUrl(url, ['https'])
    if (urlCheckRes !== 'valid') {
      return {
        valid: false,
        msg: translate(urlCheckRes === 'invalidUrlError' ? 'invalidUrlMessage' : 'httpsUrlMessage')
      }
    }
    const { valid, msg } = checkBasemapUrl(url)
    return { valid, msg }
  }

  const onUrlChange = (url: string, index: number) => {
    const { valid, msg } = checkUrl(url)
    const urls = [...layerUrls]
    urls[index] = {
      ...urls[index],
      url,
      valid,
      msg,
      finished: false,
      loading: false
    }
    setLayerUrls(urls)
  }

  const onAcceptUrl = async (url: string, index: number) => {
    if (!url) {
      return { valid: true, msg: '' }
    }
    let { valid, msg } = layerUrls[index]

    if (valid) {
      try {
        // check if url is accessible
        setLayerUrls((arr) => {
          const newArr = [...arr]
          newArr[index] = {
            ...newArr[index],
            loading: true
          }
          return newArr
        })
        await ServiceManager.getInstance().fetchServiceInfo(url)
      } catch (error) {
        console.log('fetch service info error', error)
        valid = false
        msg = translate('basemapUrlInvalid')
      }
    }
    setLayerUrls((urls) => {
      const newUrls = [...urls]
      newUrls[index] = {
        ...newUrls[index],
        valid,
        msg,
        finished: true,
        loading: false
      }
      return newUrls
    })

    return { valid, msg }
  }

  const onAddUrlInput = () => {
    setLayerUrls([...layerUrls, getDefaultLayerUrlInfo()])
  }
  const onRemoveUrlInput = (index) => {
    const urls = [...layerUrls]
    urls.splice(index, 1)
    setLayerUrls(urls)
  }

  const editingBasemapInfo = React.useMemo(() => {
    if (editingBasemapId) {
      return customBasemaps.find((item) => item.id === editingBasemapId) as BasemapFromUrl
    }
    return null
  }, [customBasemaps, editingBasemapId])

  const checkIfAddButtonDisabled = () => {
    const urls = layerUrls.filter((item) => !!item.url)
    if (!title || !urls.length || urls.every((item) => !item.valid || !item.finished)) {
      return true
    }
    if (editingBasemapInfo) {
      if (editingBasemapInfo.title !== title ||
        editingBasemapInfo.thumbnail?.url !== thumbnail?.url ||
        urls.length !== editingBasemapInfo.layerUrls.length ||
        urls.some((item, index) => item.url !== editingBasemapInfo.layerUrls[index]) ||
        disablePopup !== !!editingBasemapInfo.disablePopup
      ) {
        return false
      }
      return true
    }
    return false
  }

  React.useEffect(() => {
    if (editingBasemapInfo) {
      setTitle(editingBasemapInfo.title)
      setLayerUrls(editingBasemapInfo.layerUrls.map((url) => ({ id: uuidv1(), url, valid: true, msg: '', finished: true, loading: false })))
      setThumbnail(editingBasemapInfo.thumbnail)
      setDisablePopup(!!editingBasemapInfo.disablePopup)
    }
  }, [editingBasemapInfo])

  const saveButtonDisabled = checkIfAddButtonDisabled()

  return <div className='h-100 px-4 pb-4' css={style}>
    <div className='form-content'>
      <SettingRow label={<span>{translate('label')} <span style={{ color: 'var(--ref-palette-error-500)' }}>*</span></span>} flow='wrap' aria-label={translate('label')} role='group'>
        <TextInput ref={titleInputRef} className='w-100' required aria-required='true' type='text' value={title} placeholder={translate('basemapTitle')} onChange={(e) => { setTitle(e.target.value) }} />
      </SettingRow>
      <SettingRow
        aria-label={translate('thumbnail')}
        role='group'
        label={translate('thumbnail')}
        flow='no-wrap'>
        <ImageSelector
          widgetId={widgetId}
          buttonLabel={translate('browse')}
          aria-label={translate('browse')}
          buttonSize='sm'
          imageParam={thumbnail}
          onChange={setThumbnail}
        />
      </SettingRow>
      <div className='img-container mt-3 mb-4'><img src={appConfigUtils.processResourceUrl(thumbnail?.url) || require('../assets/default-thumbnail.svg')} /></div>
      <SettingRow label={translate('url')} aria-label={translate('url')} role='group' flow='no-wrap'>
        <Button type='default' size='sm' aria-label={translate('add')} onClick={onAddUrlInput}>{translate('add')}</Button>
      </SettingRow>
      <ul aria-label={translate('url')} className='urls-container pl-0 pt-4'>
        {layerUrls.map((item, index) => {
          return <li className='w-100 url-input p-1 mb-2' key={item.id}>
            <div className='button-area d-flex mb-1'>
              <div className='left-icon'>
                {item.msg && <Tooltip placement="top" title={item.msg}>
                  <Button className='p-0'><WarningOutlined color='var(--sys-color-error-main)'/></Button>
                </Tooltip>}
                {item.finished && item.valid && <SuccessOutlined color='var(--sys-color-success-main)' />}
                {item.loading && <Loading type={LoadingType.Donut} width={16} height={16} />}
              </div>
              <Button className='p-0' title={translate('delete')} aria-label={translate('delete')} icon disabled={layerUrls.length === 1} onClick={() => { onRemoveUrlInput(index) }}><MinusCircleOutlined /></Button>
            </div>
            <TextArea
              className='w-100' placeholder={translate('websitePlaceholder')}
              value={item.url} spellCheck={false}
              checkValidityOnChange={checkUrl} checkValidityOnAccept={(url) => { return onAcceptUrl(url, index) }}
              onChange={(e) => { onUrlChange(e.target.value, index) }}
              onAcceptValue={(url) => { onAcceptUrl(url, index) }}
            />
          </li>
        })}
      </ul>
    </div>
    <div className='d-flex align-items-center mb-2'>
      <Checkbox className='mr-2' aria-label={translate('disablePopup')} checked={disablePopup} onChange={(e, checked) => { setDisablePopup(checked) }} />
      {translate('disablePopup')}
    </div>
    <Button
      className={classNames({ disabled: saveButtonDisabled })}
      type='primary' aria-label={translate('save')} onClick={onConfirm}
      ref={(ref) => {
        // change disabled state for screen reader, since aria-disabled is depend on disabled attribute in Button component
        if (ref) {
          ref.ariaDisabled = saveButtonDisabled ? 'true' : 'false'
        }
      }}
    >{translate('save')}</Button>
  </div>
}

const AddBasemapsByUrl = (props: AddBasemapsByUrlProps) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  return <ButtonWithSidePopper buttonText={translate('url')} sidePopperTitle={translate('addBasemapsByUrl')} buttonDescription={translate('urlTip')} widgetId={props.widgetId}>
    <AddBasemapsByUrlPopperContent {...props} />
  </ButtonWithSidePopper>
}

export default AddBasemapsByUrl
