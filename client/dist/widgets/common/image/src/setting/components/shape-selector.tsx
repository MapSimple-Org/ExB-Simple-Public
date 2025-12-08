import { React, classNames, type IMThemeVariables, css, type ImmutableObject, Immutable, type IntlShape } from 'jimu-core'
import { Button, type CropParam, Icon } from 'jimu-ui'
import defaultMessages from '../translations/default'

interface Props {
  intl?: IntlShape

  theme: IMThemeVariables

  cropParam: ImmutableObject<CropParam>

  onShapeChosen: (cropParam: ImmutableObject<CropParam>) => void
}

export default class ShapeChooser extends React.PureComponent<Props> {
  cropShapeList = ['square', 'circle', 'hexagon', 'pentagon', 'rhombus', 'triangle']

  getStyle () {
    const theme = this.props.theme

    return css`
      .widget-image-chooseshape-item {
        cursor: pointer;
        height: 30px;
        width: 35px;
        background-color: ${theme.ref.palette.white};

        svg {
          fill: ${theme.ref.palette.black};
        }
      }
      `
  }

  shapeClick = (e, index) => {
    if (this.props.cropParam && this.props.cropParam.cropShape === this.cropShapeList[index]) {
      return
    }

    const svgItem = e.currentTarget.getElementsByTagName('svg') && e.currentTarget.getElementsByTagName('svg')[0]
    if (svgItem) {
      let cropParam = this.props.cropParam
      if (!cropParam) {
        cropParam = Immutable({})
      }

      cropParam = cropParam.set('svgViewBox', svgItem.getAttribute('viewBox'))
      cropParam = cropParam.set('svgPath', svgItem.getElementsByTagName('path')[0].getAttribute('d'))
      cropParam = cropParam.set('cropShape', this.cropShapeList[index])

      this.props.onShapeChosen && this.props.onShapeChosen(cropParam)
    }
  }

  render () {
    return (
      <div className='w-100 d-flex justify-content-between' css={this.getStyle()}>
        {this.cropShapeList.map((item, index) => {
          const iconComponent = require(`jimu-icons/svg/filled/data/${item}.svg`)

          if (item === 'square' && !this.props.cropParam) {
            return (
              <Button
                key={index} className={classNames('widget-image-chooseshape-item border-selected p-0')}
                onClick={(e) => { this.shapeClick(e, index) }} icon
                title={this.props.intl.formatMessage({ id: 'imagerectangle', defaultMessage: defaultMessages.imagerectangle })}
                aria-pressed
              >
                <Icon width={12} height={12} icon={iconComponent} />
              </Button>
            )
          } else {
            const intlItem = item === 'square' ? 'imagerectangle' : `image${item}`
            const iconSelected = this.props?.cropParam?.cropShape === item
            return (
              <Button
                key={index} className={classNames('widget-image-chooseshape-item p-0',
                  { 'border-selected': iconSelected })}
                onClick={(e) => { this.shapeClick(e, index) }} icon
                title={this.props.intl.formatMessage({ id: intlItem, defaultMessage: defaultMessages[intlItem] })}
                aria-pressed={iconSelected}
              >
                <Icon width={12} height={12} icon={iconComponent} />
              </Button>
            )
          }
        })}
      </div>
    )
  }
}
