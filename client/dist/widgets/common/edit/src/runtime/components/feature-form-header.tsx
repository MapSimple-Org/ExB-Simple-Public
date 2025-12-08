import { classNames, hooks, type FeatureDataRecord, css, useIntl } from 'jimu-core'
import defaultMessages from '../translations/default'
import { getDisplayField } from './utils'
import type { FeatureFormStep, LayerInfo } from './feature-form-component'
import { Button, Typography } from 'jimu-ui'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'

interface FeatureFormHeaderProps {
  widgetLabel: string
  description: string
  hasTableLayerAdd: boolean
  featureFormStep: FeatureFormStep
  activeLayerInfo: LayerInfo
  activeFeatures: Array<FeatureDataRecord['feature']>
  editCount: number
  onBack: () => void
  onNew: () => void
}

const style = css`
  border-bottom: 1px solid var(--sys-color-divider-secondary);
  border-top-left-radius: var(--sys-shape-2);
  border-top-right-radius: var(--sys-shape-2);
  .list-empty {
    padding: 12px 15px;
    .list-empty-header {
      margin: 0;
      .list-empty-header-title {
        line-height: 1.2;
        margin-bottom: 8px;
      }
      .list-empty-description-text {
        margin: 0;
        line-height: 1.4;
      }
    }
  }
  .form-header {
    min-height: 56px;
    .form-heading{
      margin: 0 8px;
      padding: 1px 0;
      height: 56px;
      line-height: 54px;
    }
  }
  .back-button{
    width: 32px;
    padding-inline: 8px;
    padding-block: 4px;
    line-height: 16px;
    color: var(--sys-color-surface-surface-text);
    background-color: transparent;
    border-top: 0px !important;
    border-left: 0px !important;
    border-bottom: 0px !important;
    border-style: solid;
    border-color: var(--sys-color-divider-secondary);
    border-inline-end-width: 1px;
  }
  .add-feature-btn {
    position: absolute;
    right: 15px;
    top: 12px;
    button{
      width: 32px;
      height: 32px;
    }
  }
`

const FeatureFormHeader = (props: FeatureFormHeaderProps) => {
  const { activeLayerInfo, widgetLabel, description, activeFeatures, editCount, hasTableLayerAdd, featureFormStep, onBack, onNew } = props
  const isListOrEmpty = featureFormStep === 'list' || featureFormStep === 'empty'
  const isFormOrNew = featureFormStep === 'form' || featureFormStep === 'new'
  let addEditLabel = ''
  const translate = hooks.useTranslation(defaultMessages)
  if (featureFormStep === 'new') {
    addEditLabel = translate('addFeature')
  } else if (featureFormStep === 'form' && activeLayerInfo && activeFeatures) {
    if (activeFeatures.length > 1) {
      addEditLabel = activeLayerInfo.dataSource.getLabel()
    } else if (activeFeatures.length === 1) {
      const displayField = getDisplayField(activeLayerInfo.dataSource)
      addEditLabel = activeFeatures[0].attributes[displayField] || ''
    }
  }

  const intl = useIntl()
  const countLabel = editCount > 1 ? ` (${intl.formatNumber(editCount)})` : ''

  return <div className={classNames({ 'd-flex': isFormOrNew })} css={style}>
    {isFormOrNew &&
      <button
        className='back-button'
        title={translate('back')}
        onClick={onBack}
      >&lt;</button>
    }
    {isListOrEmpty && <div className='list-empty'>
      <div className='list-empty-header'>
        <Typography variant='title1' className='list-empty-header-title'>{widgetLabel + countLabel}</Typography>
        {description && <Typography
          variant='title3'
          color='var(--sys-color-surface-paper-hint)'
          noWrap
          title={description}
          className='list-empty-description-text'
        >
          {description}
        </Typography>}
      </div>
    </div>}
    {isFormOrNew &&
      <header className='form-header'>
        <Typography variant='title1' noWrap title={addEditLabel} className='form-heading'>
          {addEditLabel}
        </Typography>
      </header>
    }
    {hasTableLayerAdd && isListOrEmpty &&
      <Button
        size='sm'
        icon
        type='tertiary'
        color='inherit'
        className='add-feature-btn'
        onClick={onNew}
        title={translate('addFeature')}
        aria-label={translate('addFeature')}
      >
        <PlusOutlined className='mr-1' />
        {translate('add')}
      </Button>
    }
  </div>
}

export default FeatureFormHeader
