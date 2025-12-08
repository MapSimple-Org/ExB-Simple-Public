import {
  type extensionSpec, React, ReactRedux, moduleLoader, type LayoutContextToolProps, type IMState, getAppStore,
  type IMAppConfig, type IMUrlParameters, type IMThemeVariables, css, Immutable, classNames, i18n
} from 'jimu-core'
import { Icon, Tooltip } from 'jimu-ui'
import { type Config, DynamicUrlType } from '../config'
import defaultMessage from '../../src/runtime/translations/default'
import settingDefaultMessage from '../setting/translations/default'
import { getTheme, getTheme2 } from 'jimu-theme'
import ShapeOutlined from 'jimu-icons/svg/outlined/application/shape.svg'

interface Props {
  id: string
  appConfig: IMAppConfig
  queryObject?: IMUrlParameters
  widgetConfig: Config
}

class ChooseShape extends React.PureComponent<Props> {
  cropShapeList = ['square', 'circle', 'hexagon', 'pentagon', 'rhombus', 'triangle']

  getStyle (theme: IMThemeVariables) {
    return css`
      .widget-image-chooseshape-item {
        background-color: ${theme.ref.palette.neutral[400]};
      }

      .widget-image-chooseshape-item:hover {
        cursor: 'pointer';
        background-color: ${theme.ref.palette.neutral[500]};
      }

      .chooseshape-item-selected {
        background-color: ${theme.ref.palette.neutral[500]};
      }
      `
  }

  getTooltipStyle (theme: IMThemeVariables) {
    return css`
      border: none;

      .tooltip {
        color: ${theme.ref.palette.black};
        background-color: ${theme.ref.palette.neutral[600]};
        border-color: ${theme.ref.palette.neutral[400]};
      }
    `
  }

  shapeClick = (e, index) => {
    if (this.props.widgetConfig.functionConfig.imageParam && this.props.widgetConfig.functionConfig.imageParam.cropParam &&
       this.props.widgetConfig.functionConfig.imageParam.cropParam.cropShape === this.cropShapeList[index]) {
      return
    }

    const svgItem = e.currentTarget.getElementsByTagName('svg') && e.currentTarget.getElementsByTagName('svg')[0]
    if (svgItem) {
      const appConfigAction = moduleLoader.getJimuForBuilderModules().getAppConfigAction()
      let widgetConfig = Immutable(this.props.widgetConfig)
      let cropParam = Immutable(widgetConfig.functionConfig.imageParam ? widgetConfig.functionConfig.imageParam.cropParam : null)
      if (!cropParam) {
        cropParam = Immutable({})
      }
      cropParam = cropParam.set('svgViewBox', svgItem.getAttribute('viewBox'))
      cropParam = cropParam.set('svgPath', svgItem.getElementsByTagName('path')[0].getAttribute('d'))
      cropParam = cropParam.set('cropShape', this.cropShapeList[index])
      widgetConfig = widgetConfig.setIn(['functionConfig', 'imageParam', 'cropParam'], cropParam)
      appConfigAction.editWidgetConfig(this.props.id, widgetConfig).exec()
    }
  }

  render () {
    const { id, appConfig, widgetConfig } = this.props
    const widgetJson = appConfig.widgets[id]
    // get widgetSettingManager from the parent of the app frame
    const widgetSettingManager = window.parent._widgetSettingManager
    const messages = widgetSettingManager.getSettingI18nMessagesByUri(widgetJson.uri)
    const theme = window.jimuConfig.isBuilder ? getTheme() : getTheme2()
    return (
      <div style={{ width: '50px' }} css={this.getStyle(theme)}>
        {this.cropShapeList.map((item, index) => {
          const iconComponent = require(`jimu-icons/svg/filled/data/${item}.svg`)
          const imageNlsId = item === 'square' ? 'imagerectangle' : `image${item}`
          const tooltip = messages[imageNlsId] ?? settingDefaultMessage[imageNlsId]
          const selected = (item === 'rectangle' && !widgetConfig.functionConfig.imageParam?.cropParam) || widgetConfig.functionConfig.imageParam?.cropParam?.cropShape === item

          return (
            <Tooltip key={index} title={tooltip} placement='right-start' css={this.getTooltipStyle(theme)}>
              <div
                className={classNames('w-100 d-flex justify-content-center align-items-center widget-image-chooseshape-item',
                  {
                    'chooseshape-item-selected': selected
                  })}
                style={{ height: '40px' }} onClick={(e) => { this.shapeClick(e, index) }}
              ><Icon icon={iconComponent} color={theme.ref.palette.black} />
              </div>
            </Tooltip>
          )
        })}
      </div>
    )
  }
}

export default class CropTool implements extensionSpec.ContextToolExtension {
  index = 0
  id = 'choose-shape'
  widgetId: string

  classes: { [widgetId: string]: React.ComponentClass<unknown> } = {}

  getGroupId () {
    return null
  }

  getTitle () {
    const widgetId = this.widgetId
    const intl = i18n.getIntl(widgetId)
    return intl ? intl.formatMessage({ id: 'imageChooseShape', defaultMessage: defaultMessage.imageChooseShape }) : 'Shape'
  }

  getIcon () {
    return ShapeOutlined
  }

  onClick (props: LayoutContextToolProps) {
    return null
  }

  isEmptySource = (config: Config): boolean => {
    if ((!config.functionConfig?.imageParam || !config.functionConfig?.imageParam?.url) && !config.functionConfig?.srcExpression &&
      (config.functionConfig?.dynamicUrlType !== DynamicUrlType.Attachment)) {
      return true
    } else {
      return false
    }
  }

  visible (props: LayoutContextToolProps) {
    const appConfig = window.jimuConfig.isBuilder ? getAppStore().getState().appStateInBuilder?.appConfig : getAppStore().getState().appConfig
    const widgetInfo = appConfig.widgets[props.layoutItem.widgetId]
    if (widgetInfo) {
      const widgetConfig = widgetInfo.config as Config
      if (this.isEmptySource(widgetConfig)) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  getSettingPanel (props: LayoutContextToolProps): React.ComponentClass<unknown> {
    const widgetId = props.layoutItem.widgetId
    if (this.classes[widgetId]) {
      return this.classes[widgetId]
    }

    const mapStateToProps = (state: IMState) => {
      const appConfig = window.jimuConfig.isBuilder ? state.appStateInBuilder?.appConfig : state.appConfig
      const widgetConfig = Immutable(appConfig.widgets[widgetId].config)

      return {
        id: widgetId,
        appConfig: appConfig,
        queryObject: state.queryObject,
        widgetConfig: widgetConfig
      } as Props
    }
    this.classes[widgetId] = ReactRedux.connect(mapStateToProps)(ChooseShape) as any
    return this.classes[widgetId]
  }
}
