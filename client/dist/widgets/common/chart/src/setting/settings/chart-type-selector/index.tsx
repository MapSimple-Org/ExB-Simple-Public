/** @jsx jsx */
import { React, css, jsx, type SerializedStyles, type ImmutableObject, type UseDataSource, type ImmutableArray, classNames, hooks } from 'jimu-core'
import { Button, defaultMessages as jimUiDefaultMessage, Icon } from 'jimu-ui'
import type { IWebChart } from '../../../config'
import defaultMessages from '../../translations/default'
import { SidePopper } from 'jimu-ui/advanced/setting-components'
import Templates, { getMainTypeTranslation, getTemplateIcon } from './templates'
import { useTheme } from 'jimu-theme'
import completeChart from './utils/complete-chart'

export interface ChartTypeSelectorProps {
  templateId: string
  webChart: ImmutableObject<IWebChart>
  useDataSources: ImmutableArray<UseDataSource>
  onChange: (template: string, webChart: ImmutableObject<IWebChart>) => void
}

const useStyle = (): SerializedStyles => {
  const theme = useTheme()
  return React.useMemo(
    () => css`
    .jimu-button-outlined-primary {
      color: ${theme?.sys.color.primary.light};
      font-weight: 500;
      &:hover:not(.active) {
        color: ${theme?.sys.color.primary.light};
      }
    }`,
    [theme]
  )
}

const ChartTypeSelector = (props: ChartTypeSelectorProps): React.ReactElement => {
  const { templateId, webChart, useDataSources, onChange } = props
  const style = useStyle()
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)
  const [open, setOpen] = React.useState(false)

  const [templateIcon, templateLabel] = React.useMemo(() => {
    if (!templateId) return []
    const icon = getTemplateIcon(webChart)
    const label = translate(getMainTypeTranslation(webChart))
    return [icon, label]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId])

  const ref = React.useRef<HTMLButtonElement>(null)

  const handleChange = (template: IWebChart): void => {
    const webChart = completeChart(template)
    onChange?.(template.id, webChart)
    setOpen(false)
  }

  return (
    <React.Fragment>
      <div className="chart-type-selector w-100" css={style}>
        <Button
          ref={ref}
          variant={templateId ? 'contained' : 'outlined'}
          color={templateId ? 'default' : 'primary'}
          dashed={!templateId}
          title={templateId ? templateLabel : translate('selectChart')}
          aria-label={templateId ? templateLabel : translate('selectChart')}
          block={true}
          className={classNames({ 'justify-content-start pl-2 pr-2': templateId })}
          onClick={() => { setOpen(v => !v) }}>
          {templateId && <Icon icon={templateIcon} />}
          {templateId ? templateLabel : translate('selectChart')}
        </Button>
      </div>

      <SidePopper isOpen={open} position="right" toggle={() => { setOpen(false) }} trigger={ref?.current} backToFocusNode={ref?.current} title={translate('chartType')}>
        <Templates className='px-4' useDataSources={useDataSources} templateId={templateId} onChange={handleChange} />
      </SidePopper>
    </React.Fragment>
  )
}

export * from './templates/buildin-templates'

export default ChartTypeSelector
