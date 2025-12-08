/** @jsx jsx */
import { css, jsx, React, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { Switch, Label, defaultMessages } from 'jimu-ui'
import { DrawingTool } from '../../config'
// icons
import { PinEsriOutlined } from 'jimu-icons/outlined/gis/pin-esri'
import { PolylineOutlined } from 'jimu-icons/outlined/gis/polyline'
import { PolygonOutlined } from 'jimu-icons/outlined/gis/polygon'
import { RectangleOutlined } from 'jimu-icons/outlined/gis/rectangle'
import { CircleOutlined } from 'jimu-icons/outlined/gis/circle'
import { WidgetTextOutlined } from 'jimu-icons/outlined/brand/widget-text'
import { FreehandLineOutlined } from 'jimu-icons/outlined/gis/freehand-line'
import { FreehandAreaOutlined } from 'jimu-icons/outlined/gis/freehand-area'

interface Props {
  items?: string[]
  onDrawingToolsChange: (drawingTools: DrawingTool[]) => void

  intl: IntlShape
  theme: IMThemeVariables
  title: string
}

export const DrawToolsSelector = React.memo((props: (Props)) => {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const toolsItems = [
    { id: DrawingTool.Point, icon: PinEsriOutlined, des: props.intl.formatMessage({ id: 'drawModePoint', defaultMessage: defaultMessages.drawModePoint }) },
    { id: DrawingTool.Polyline, icon: PolylineOutlined, des: props.intl.formatMessage({ id: 'drawModeLineAlias', defaultMessage: defaultMessages.drawModeLineAlias }) },
    { id: DrawingTool.Polygon, icon: PolygonOutlined, des: props.intl.formatMessage({ id: 'drawModePolygon', defaultMessage: defaultMessages.drawModePolygon }) },
    { id: DrawingTool.Rectangle, icon: RectangleOutlined, des: props.intl.formatMessage({ id: 'drawModeRectangle', defaultMessage: defaultMessages.drawModeRectangle }) },
    { id: DrawingTool.Circle, icon: CircleOutlined, des: props.intl.formatMessage({ id: 'drawModeCircle', defaultMessage: defaultMessages.drawModeCircle }) },
    { id: DrawingTool.FreehandPolyline, icon: FreehandLineOutlined, des: props.intl.formatMessage({ id: 'drawModeFreehandPolyline', defaultMessage: defaultMessages.drawModeFreehandPolyline }) },
    { id: DrawingTool.FreehandPolygon, icon: FreehandAreaOutlined, des: props.intl.formatMessage({ id: 'drawModeFreehandPolygon', defaultMessage: defaultMessages.drawModeFreehandPolygon }) },
    { id: DrawingTool.Text, icon: WidgetTextOutlined, des: props.intl.formatMessage({ id: 'text', defaultMessage: defaultMessages.text }) }
  ]

  const _isItemChecked = (id) => {
    if (!props.items || !props.items.length) {
      return false
    }

    for (let i = 0, len = props.items.length; i < len; i++) {
      const itemId = props.items[i]
      if (id === itemId) {
        return true
      }
    }
    return false
  }

  const _createItemUI = () => {
    const elements = []

    for (let i = 0, len = toolsItems.length; i < len; i++) {
      const item = toolsItems[i]
      const isChecked = _isItemChecked(item.id)
      elements.push(
        <li className='d-flex item' key={'key-' + i}>
          {<item.icon className='icon mr-2'/>}

          <Label className='d-flex item-label justify-content-between flex-grow-1 text-break'
            aria-label={item.des}>

            {item.des}

            <Switch className='d-flex' data-itemid={item.id} checked={isChecked} onChange={onItemChange} aria-label={item.des} />
          </Label>
        </li>
      )
    }
    return elements
  }

  const onItemChange = () => {
    onOptionsChange()
  }

  const onOptionsChange = () => {
    const checkedItems = []

    const inputs = rootRef.current.querySelectorAll('input')
    for (let i = 0, len = inputs.length; i < len; i++) {
      const item = inputs[i]

      if (item.checked) {
        checkedItems.push(item.getAttribute('data-itemid'))
      }
    }

    props.onDrawingToolsChange(checkedItems)
  }

  const getStyle = () => {
    const theme = props.theme

    return css`
      font-size: 13px;
      font-weight: lighter;
      color: ${theme.ref.palette.neutral[1100]};

      .items-option{
        padding: 0;
        margin: 0;
        list-style: none;
        list-style-type: none;
        /*background: ${theme.ref.palette.neutral[300]};*/

        .item{
          margin: 6px 0;
          padding: 4px 0;

          .icon{
            color: ${theme.ref.palette.neutral[1000]};
          }

          .item-label{
            margin: 0;
          }
        }

        .item:first-of-type {
          margin-top: 0;
        }

        .item:last-of-type {
          margin-bottom: 0;
        }
      }
    `
  }

  return (
    <div ref={rootRef} css={getStyle()}>
      <ul className='items-option' role='group' aria-label={props.title}>
        {_createItemUI()}
      </ul>
    </div>
  )
})
