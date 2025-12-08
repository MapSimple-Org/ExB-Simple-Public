/** @jsx jsx */
import { React, jsx, css, classNames } from 'jimu-core'
import { Alert, WidgetPlaceholder } from 'jimu-ui'
import type { TemplateType } from '../../../config'

const Placeholders = {
  bar: require('../../assets/icons/bar.svg'),
  column: require('../../assets/icons/column.svg'),
  'stacked-bar': require('../../assets/icons/stacked-bar.svg'),
  'stacked100-bar': require('../../assets/icons/stacked100-bar.svg'),
  'stacked-column': require('../../assets/icons/stacked-column.svg'),
  'stacked100-column': require('../../assets/icons/stacked100-column.svg'),
  line: require('../../assets/icons/line.svg'),
  'smooth-line': require('../../assets/icons/smooth-line.svg'),
  area: require('../../assets/icons/area.svg'),
  'smooth-area': require('../../assets/icons/smooth-area.svg'),
  pie: require('../../assets/icons/pie.svg'),
  donut: require('../../assets/icons/donut.svg'),
  scatter: require('../../assets/icons/scatter.svg'),
  histogram: require('../../assets/icons/histogram.svg'),
  gauge: require('../../assets/icons/gauge.svg')
}

export interface PlaceholderProps {
  className?: string
  templateType: TemplateType
  showMessage: boolean
  messageType?: 'basic' | 'tooltip'
  message: string
}

const style = css`
  display: flex;
  justify-content: center;
  position: absolute;
  z-index: 1;
  .jimu-widget-placeholder {
    width: 100%;
    height: 100%;
  }
  .jimu-alert-panel {
    position: absolute;
    width: 100% !important;
    bottom: 0px;
  }
`

export const Placeholder = (props: PlaceholderProps) => {
  const {
    templateType,
    showMessage,
    message,
    messageType = 'tooltip',
    className
  } = props

  const icon = React.useMemo(() => Placeholders[templateType], [templateType])

  return <div className={classNames('placeholder-container w-100 h-100', className)} css={style}>
    <WidgetPlaceholder iconSize='large' icon={icon} />
    {showMessage && <Alert form={messageType} banner withIcon={true} size='small' type='warning' text={message}></Alert>}
  </div>
}
