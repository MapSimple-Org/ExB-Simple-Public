/** @jsx jsx */
import { React, jsx, css, defaultMessages as jimuCoreMessages, hooks, type IMThemeVariables, type SerializedStyles, i18n, dateUtils } from 'jimu-core'
import { TextInput, defaultMessages as jimuUIMessages, Select, Label, Radio, TextArea, Button, AlertPopup, Loading, LoadingType, Tooltip } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { SuccessOutlined } from 'jimu-icons/outlined/suggested/success'
import defaultMessages from '../translations/default'
import { uploadTemplate, deleteReportTemplate, getItemInfo, checkTemplateNameValid, reportMergeCommonConfig, checkTemplateSyntax } from '../../utils'
import { Fragment } from 'react'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import ProgressTypeLoading from './loading'
const { useState, useEffect } = React

const allDefaultMessages = Object.assign({}, defaultMessages, jimuCoreMessages, jimuUIMessages)

interface TemplateEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  templates: any[]
  selectedTemplates: any[]
  editTemplate?: any
  theme?: any
  onSaveTemplate?: any
  onDeleteTemplate?: any
  surveyItemInfo?: any
  serviceItemInfo?: any
  featureLayerUrl?: any
  editDisabled?: boolean
}

export const TemplateEditor = (props: TemplateEditorProps): React.ReactElement => {
  const { editTemplate, selectedTemplates, featureLayerUrl, templates, onSaveTemplate, surveyItemInfo, serviceItemInfo, onDeleteTemplate, theme, editDisabled } = props
  const getStyle = (theme?: IMThemeVariables): SerializedStyles => {
    // const inputVars = theme?.components?.input
    return css`
      .jimu-widget-setting--row {
        // padding: 0.625rem
      }
      .upload-label {
        margin-bottom: 0;
      }
      // .upload-template-btn {
      //   overflow: hidden
      //   text-overflow: ellipsis
      //   display: -webkit-box
      //   -webkit-box-orient: vertical
      //   word-break: break-word
      //   -webkit-line-clamp: 2
      // }
      .file-name-box {
        padding: 0.625rem;
        display: flex;
        align-items: center;
        // gap: 6px
        background: var(--sys-color-secondary);
        .file-name {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          word-break: break-word;
          -webkit-line-clamp: 2;
        }
      }
      .existing-file-name {
        overflow: auto;
        word-wrap: break-word;
        overflow: hidden;
      }
      .upload-template-btn {
        position: relative;
      }
      .display-error-tips {
        word-break: break-word;
        margin: 0 4px;
        color: ${theme.sys.color.error.main};
      }
      .display-warnning-tips {
        word-break: break-word;
        margin: 0 4px;
      }
      .check-syntax {
        cursor: pointer;
        padding-top: 0;
        padding-bottom: 0;
      }

      input.upload-template-input {
        position: absolute;
        display: block;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: 0;
     }
      .checking-syntax-status {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .template-editor-outter{
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        // margin-bottom: 8px
      }`
  }
  const intl = i18n.getIntl()
  const translate = hooks.useTranslation(allDefaultMessages)

  const [mode, setMode] = useState('select')
  const switchMode = (mode: string) => {
    setMode(mode)
    setSaveError('')
    setDeleteError('')
    setTitleErrorMsg('')
    if (mode === 'select') {
      setTitle('')
      setSnippet('')
      setFile('')
      setSyntaxError('')
      setSyntaxChecked(false)
      setIsInfoDirty(false)
    } else {
      // upload
      setId('')
      setTitle('')
      setSnippet('')
      setFile('')
      setSyntaxError('')
      setSyntaxChecked(false)
      setIsInfoDirty(true)
    }
  }

  const [allTemplates, setAllTemplates] = useState<any[]>(templates || [])
  const [title, setTitle] = useState(editTemplate?.title)
  const [snippet, setSnippet] = useState(editTemplate?.snippet)
  const [id, setId] = useState<string>(editTemplate?.id)
  const [isCheckingSyntax, setIsCheckingSyntax] = useState<boolean>(false)
  const [fileErrorMsg, setFileErrorMsg] = useState<string>()
  const [titleErrorMsg, setTitleErrorMsg] = useState<string>()

  // save and delete related
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string>()
  const [saveError, setSaveError] = useState<string>()
  const [isInfoDirty, setIsInfoDirty] = useState<boolean>(false)

  // check syntax
  const [syntaxError, setSyntaxError] = useState<string>()
  const [syntaxChecked, setSyntaxChecked] = useState<boolean>()

  // internal parameters
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  const [file, setFile] = useState<any | null>()
  useEffect(() => {
    setAllTemplates(templates)
  }, [templates])

  useEffect(() => {
    if (editTemplate) {
      setMode('upload')
    } else {
      setMode('select')
    }

    setTitle(editTemplate?.title || '')
    setSnippet(editTemplate?.snippet || '')
    setIsInfoDirty(false)
    setId(editTemplate?.id || '')
    setFile(editTemplate ? { name: editTemplate?.name, modified: editTemplate.modified || new Date(editTemplate.created) } : '')
    setFileErrorMsg('')
    setTitleErrorMsg('')
    setSyntaxError('')
    setSyntaxChecked(false)
  }, [editTemplate])

  /**
   * when user select an exisiting template
   * @param id
   */
  const handlerSelectTemplate = (id: string) => {
    setId(id)
    const curTemplate = allTemplates.find((item) => {
      return item.id === id
    })
    setTitle(curTemplate?.title || '')
    setSnippet(curTemplate?.snippet || '')
    setIsInfoDirty(false)
    setFile(curTemplate ? { name: curTemplate?.name } : '')
    setSyntaxError('')
    setSyntaxChecked(false)
    setTitleErrorMsg('')
  }

  const onTitleChange = (e: any) => {
    setTitle(e.target.value || '')
    const valid = checkTemplateNameValid({ title: e.target.value, id: id }, allTemplates)
    if (valid) {
      setTitleErrorMsg('')
    } else {
      if (!e.target.value) {
        setTitleErrorMsg(translate('templateEmptyNameMsg'))
      } else {
        setTitleErrorMsg(translate('templateDlgNameExistsMsg'))
      }
    }
  }

  /**
   * user selected a local file
   * @param e
   */
  const selectLocalFile = (e) => {
    setSaveError('')
    setDeleteError('')
    const files = e.target.files || e.dataTransfer.files
    const thisFile = files && files[0]

    if (e.target && e.target.value) {
      e.target.value = ''
    }

    let prevName = '' // the uploaded file name
    let curTemplate = null
    if (thisFile) {
      if (id) {
        curTemplate = allTemplates.find((item) => {
          return item.id === id
        })
        prevName = curTemplate.name
      }

      const duplicateFinder = thisFile && thisFile.name && checkTemplateFileNameDuplicate(thisFile && thisFile.name)
      if ((thisFile.type && thisFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
          // to handle the machine that not install ms word, thisFile.type is '', and use ext to judge the filetype validation
          (!thisFile.type && thisFile.name.split('.').pop() !== 'docx')
      ) {
        // upload a file but file type is wrong
        setFileErrorMsg(translate('templateDlgUploadTip'))
      } else if (id && thisFile.name !== prevName && thisFile.name.replace(/ /g, '_') !== prevName) {
        // current name is not the same with previous name
        setFileErrorMsg(translate('templateDlgUpdateFileNameChangedErrMsg'))
      } else if (!id && duplicateFinder) {
        // current name is duplicate with other existing file name
        setFileErrorMsg(translate('templateDlgFileNameExistsErrMsg', { existedTemplateName: duplicateFinder.name }))
      } else {
        // file is valid
        setFile(thisFile)
        setSyntaxError('')
        setSyntaxChecked(false)
        if (!editTemplate) {
          setTitle(thisFile.name)
        }
        setFileErrorMsg('')
        setTimeout(() => {
          checkSyntax(thisFile)
        }, 0)
      }
    }
  }

  const checkTemplateFileNameDuplicate = (thisName: string) => {
    const finder = allTemplates.find((item) => {
      return item.name === thisName || item.name === thisName.replace(/ /g, '_')
    })
    return finder
  }

  const removeFile = () => {
    setFile('')
    setSyntaxError('')
    setSyntaxChecked(false)
  }

  /**
   * upload template to be a portal item
   * @returns
   */
  const saveTemplate = () => {
    setIsSaving(true)
    setSaveError('')
    let template = editTemplate || {}
    if (id) {
      template = allTemplates.find((item) => {
        return item.id === id
      })
      template.file = file
    } else {
      template.file = file
      template.name = file.name
      const config = reportMergeCommonConfig.templateItem

      let typeKeywords: string[] = config.typeKeywords
      // let tags: string[] = config.tags
      if (surveyItemInfo) {
        typeKeywords = typeKeywords.concat(['Survey123', 'Survey123 Hub', surveyItemInfo.id])
        // tags = tags.concat(['Survey123'])
      } else if (serviceItemInfo) {
        // todo: in the future, set the relationship between the servcie item and template item.
        template.typeKeywords = typeKeywords.concat([serviceItemInfo.id])
      }

    }
    template.title = title
    template.snippet = snippet
    return uploadTemplate(template, allTemplates, surveyItemInfo, serviceItemInfo, editDisabled, !isInfoDirty).then((tmpt) => {
      setIsSaving(false)
      setSaveError('')
      // edit existing template
      if (id) {
        return tmpt
      }
      // for new template, request to get the template item info
      setId(tmpt.id)
      return getItemInfo(tmpt.id)
    }).then((res) => {
      if (onSaveTemplate) {
        onSaveTemplate(res)
      }
    }).catch((e) => {
      console.warn(translate('templateAddErrMsg'), e)
      setSaveError(translate('templateAddErrMsg'))
      setIsSaving(false)
    })
    //
  }

  const deleteTemplate = () => {
    setDeleteError('')
    setShowDeleteAlert(true)
  }

  // check file syntax
  const checkSyntax = (fileobj?: any) => {
    setIsCheckingSyntax(true)
    setSyntaxError('')
    setSyntaxChecked(false)
    const showErrorStatus = (err) => {
      setIsCheckingSyntax(false)
      setSyntaxError(err)
    }
    return checkTemplateSyntax(fileobj || file, featureLayerUrl, surveyItemInfo).then((res) => {
      if (res.success) {
        setIsCheckingSyntax(false)
        setSyntaxChecked(true)
      } else {
        const errorStr = translate('checkSyntaxErrMsg', { serverSideErrMsg: res.error?.message || (res.details && res.details[0] && res.details[0].description) })
        showErrorStatus(errorStr)
      }
    }).catch((e) => {
      showErrorStatus('Failed to check the template syntax.')
    })
  }

  /**
   * Here is a bug in this function, seems related to the Alert component: if the deleting failed, the alert modal will not fade.
   * need to ask @Junshan.
   * send request to delete template
   * @returns
   */
  const executeDeleteTemplate = () => {
    setIsDeleting(true)
    setDeleteError('')
    let template = editTemplate || {}
    if (id) {
      template = allTemplates.find((item) => {
        return item.id === id
      })
    }
    return deleteReportTemplate(template, surveyItemInfo, serviceItemInfo).then((templateId) => {
      setIsDeleting(false)
      if (onDeleteTemplate) {
        onDeleteTemplate(templateId)
      }
    }).catch((e) => {
      console.warn(translate('templateDeleteErrMsg'), e)
      setDeleteError(translate('templateDeleteErrMsg'))
      setIsDeleting(false)
      setShowDeleteAlert(false)
    })
  }

  return (<div className='template-editor-outter' aria-label={translate('manageTempate')} css={getStyle(theme)}>
    {editTemplate
      ? <SettingSection role='group'>
      <SettingRow flow="wrap" className="mb-0">
        <p className='existing-file-name'>{editTemplate.name}</p>
        <div css={css('position: relative;')}>
          {file && file.size
            ? <div className='w-100 file-name-box'>
                <span className='file-name'>{file.name}</span>
                <Button className="p-0" aria-label={translate('remove')} icon={true} type={'tertiary'} onClick={() => { removeFile() }}>
                  <CloseOutlined size={12} />
                </Button>
                {/* <span><CloseOutlined onClick={() => { removeFile() }} size={12} /></span> */}
            </div>
            : <a href="javascript:;">{translate('selectAnotherFile')}
              <input type='file' tabIndex={-1} aria-hidden="true" className='upload-template-input' multiple={false} accept='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                onChange={(e) => { selectLocalFile(e) }} />
            </a>
          }
        </div>
          {fileErrorMsg
            ? <div className="display-error-tips">
                {fileErrorMsg}
            </div>
            : ''}
      </SettingRow>
      </SettingSection>
      : <SettingSection>
        <SettingRow flow="wrap" role='radiogroup' className="mb-4">
          <Label className="d-flex align-items-center w-100">
            <Radio
              className="mr-2" name="template-mode"
              checked={mode === 'select'}
              onChange={() => { switchMode('select') }}
            />
            {translate('selectExistTemplate')}
          </Label>
          <Label className="d-flex align-items-center upload-label w-100">
            <Tooltip title={editDisabled ? (surveyItemInfo ? translate('notOwnerMsg'): translate('noActions')) : ''} showArrow placement='left' interactive={true} leaveDelay={100}>
              <Radio
                className="mr-2" name="template-mode"
                checked={mode === 'upload'}
                disabled={editDisabled}
                onChange={() => { switchMode('upload') }}
              />
              </Tooltip>
              <Tooltip title={editDisabled ? (surveyItemInfo ? translate('notOwnerMsg'): translate('noActions')) : ''} showArrow placement='left' interactive={true} leaveDelay={100}>
                <span>
                  {translate('uploadNewTemplate')}
                </span>
              </Tooltip>
          </Label>
          </SettingRow>

          {mode === 'select'
            ? <SettingRow>
              {/* <Label className="d-flex align-items-center"> */}
                <Select size='sm' className='w-100'
                  value={id}
                  onChange={e => { handlerSelectTemplate(e.target.value) }}
                >
                {(allTemplates || []).length
                  ? (allTemplates || []).map((template) => {
                      return <option key={template.id} disabled={selectedTemplates.includes(template)} value={template.id}>{template.title}</option>
                    })
                  : ''
                }
                {!(allTemplates || []).length
                  ? <option disabled value={''}>{translate('noData')}</option>
                  : ''}
                </Select>
              {/* </Label> */}
            </SettingRow>
            : ''
          }
          {
            mode === 'upload'
              ? (!file
                  ? <Fragment>
                    <Button type={'primary'} className='w-100 upload-template-btn'>
                        {translate('selectFile')}
                          <input type='file' className='upload-template-input' multiple={false} accept='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            onChange={(e) => { selectLocalFile(e) }} />
                      </Button>
                      {fileErrorMsg
                        ? <div className="display-error-tips">
                        {fileErrorMsg}
                      </div>
                        : ''}
                  </Fragment>
                  : <div className='w-100 file-name-box'>
                      <span className='file-name'>{file.name}</span>
                      <Button className="p-0" aria-label={translate('remove')} icon={true} type={'tertiary'} onClick={() => { removeFile() }}>
                        <CloseOutlined size={12} />
                      </Button>
                      {/* <span><CloseOutlined onClick={() => { removeFile() }} size={12} /></span> */}
                  </div>)
              : ''
          }
        </SettingSection>}

  <SettingSection>
    <SettingRow flow='wrap' label={translate('name')}>
    <TextInput
      aria-label={translate('name')}
      aria-required="true"
      // required
      disabled={editDisabled}
      title={translate('templateNameHint')}
      className="w-100"
      value={title}
      onChange={(e) => { onTitleChange(e); setIsInfoDirty(true) }} />
      {titleErrorMsg
        ? <div className="display-error-tips">
        {titleErrorMsg}
      </div>
        : ''}
    </SettingRow>

    <SettingRow flow='wrap' label={translate('templateSummary')}>
      <TextArea
        aria-label={translate('templateSummary')}
        title={translate('templateSummaryTip')}
        disabled={editDisabled}
        className="w-100 summary" height={134}
        value={snippet}
        onChange={(e) => { setSnippet(e.target.value || ''); setIsInfoDirty(true) }} />
    </SettingRow>

    {file
      ? <SettingRow css={css('margin-top: 0.75rem !important;')}>
        <i className='text-break' >
          {translate('templateLastModified') }
        </i>
        <i className='text-break' css={css('padding: 0 0.25em;')}>
          {dateUtils.formatDateValue(file.modified, intl)}
        </i>
        </SettingRow>
      : ''
    }
  </SettingSection>

  <SettingSection>
    {file && file.size
      ? <SettingRow className='mt-0' css={css('flex-wrap: wrap !important;')}>
      {isCheckingSyntax
        ? <div className='text-break checking-syntax-status' >
            {translate('checking')}
            <ProgressTypeLoading size={16}/>
          </div>
        : <Fragment>
            <Button icon={true} type={'tertiary'} className='text-break check-syntax' onClick={() => { checkSyntax() }}>
              <a href='javascript:;'>{translate('checkSyntax') }</a>
              <span css={css('margin: 0 0.25rem;')}>
                {syntaxChecked && !syntaxError ? <SuccessOutlined size={16} color='var(--sys-color-success-main)' css={css('margin: 0 6px;')}/> : ''}
                {syntaxError ? <WarningOutlined size={16} color='var(--sys-color-warning-main)' css={css('margin: 0 6px;')}/> : ''}
              </span>
            </Button>
            {syntaxError ? <div className="display-warnning-tips font-13 font-dark-800"> {syntaxError} </div> : ''}
          </Fragment>}
    </SettingRow>
      : ''}

    <SettingRow flow='wrap' css={css('margin-top: 12px;')}>
      <Button
        css={css('position: relative;')}
        aria-label={translate('saveTemplate')}
        className="w-100 summary"
        disabled={!file || !title || isSaving || isCheckingSyntax || !!titleErrorMsg}
        type="primary" onClick={() => { saveTemplate() }}>
        <span css={css(isSaving ? 'visibility: hidden' : 'visibility: visible;')}>{translate('saveTemplate')}</span>
        {isSaving && <Loading type={LoadingType.DotsSecondary}/>}
      </Button>
          {saveError
            ? <div className="display-error-tips"> {saveError} </div>
            : ''}
    </SettingRow>

    {mode === 'select' && id
      ? <SettingRow flow='wrap' css={css('margin-top: 12px;')}>
          <Tooltip title={editDisabled ? (surveyItemInfo ? translate('notOwnerMsg'): translate('noActions')) : ''} showArrow placement='left' interactive={true} leaveDelay={100}>
            <Button
              css={css('position: relative;')}
              aria-label={translate('deleteTemplatewarningHeader')}
              className="w-100 summary"
              disabled={surveyItemInfo?.isCoowner || serviceItemInfo?.isCoowner || isDeleting || editDisabled}
              type="primary" onClick={() => { deleteTemplate() }}>
              {translate('deleteTemplatewarningHeader')}
              {isDeleting && <Loading type={LoadingType.DotsSecondary}/>}
            </Button>
          </Tooltip>

          {deleteError
            ? <div className="display-error-tips"> {deleteError} </div>
            : ''}
          <AlertPopup
            title={translate('deleteTemplatewarningHeader')}
            okLabel={translate('deleteTemplate')} cancelLabel={translate('cancel')} isOpen={showDeleteAlert}
            onClickOk={() => { executeDeleteTemplate() }}
            onClickClose={() => { setShowDeleteAlert(false) }}>
            {translate('deleteTemplateWarning')}
          </AlertPopup>
        </SettingRow>
      : ''}
  </SettingSection>
  </div>)
}
