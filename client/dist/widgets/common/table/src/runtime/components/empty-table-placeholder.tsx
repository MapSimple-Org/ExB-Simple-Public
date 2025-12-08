/** @jsx jsx */
import { jsx, hooks, css } from 'jimu-core'
import { Alert, defaultMessages as jimuUIMessages, WidgetPlaceholder } from 'jimu-ui'
import defaultMessages from '../translations/default'

const getStyles = (searchOn: boolean) => {
  return css`
    &.placeholder-table-con{
      height: ${searchOn ? 'calc(100% - 40px)' : '100%'};
      width: 100%;
      position: relative;
      .jimu-widget-placeholder{
        width: 100%;
      }
      .placeholder-alert-con{
        position: absolute;
        right: 10px;
        bottom: 10px;
      }
    }
  `
}

interface EmptyTablePlaceholderProps {
  searchOn: boolean
  notReady: boolean
  dataSourceLabel: string
  widgetLabel: string
  isSelectionView?: boolean
}

const EmptyTablePlaceholder = (props: EmptyTablePlaceholderProps) => {
  const { searchOn, notReady, dataSourceLabel, widgetLabel, isSelectionView } = props
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const alertText = isSelectionView
    ? translate('noSelectionTips', { layer: dataSourceLabel })
    : translate('outputDataIsNotGenerated', { outputDsLabel: dataSourceLabel, sourceWidgetName: widgetLabel })

  return <div className='placeholder-table-con' css={getStyles(searchOn)}>
    <WidgetPlaceholder
      icon={require('../assets/icon.svg')}
      name={translate('noData')}
    />
    {notReady &&
      <div className='placeholder-alert-con'>
        <Alert
          form='tooltip'
          size='small'
          type='warning'
          text={alertText}
        />
      </div>
    }
  </div>
}

export default EmptyTablePlaceholder
