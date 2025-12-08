import {
  React, Immutable, LinkType, type RepeatedDataSource, ExpressionResolverComponent,
  ExpressionResolverErrorCode, type Size, getAppStore, type LinkTarget, css,
  type AllWidgetProps, type DataRecord, ReactResizeDetector, type IMExpression,
  ExpressionPartType, type LinkResult, type AttachmentInfo, type IMUrlParameters,
  type IMState, type BrowserSizeMode, classNames
} from 'jimu-core'
import { Link, Image, ImageFillMode, CropType } from 'jimu-ui'
import { utils as layoutUtils } from 'jimu-layouts/layout-runtime'
import { type IMConfig, ImgSourceType, DynamicUrlType, type FunctionConfig } from '../config'
import { AttachmentComponent } from './components/attachment-component'
import SymbolWidget from './components/symbol-widget'
import { RecordComponent } from './components/record-component'
import { ImageGallery } from './components/image-gallery'
import { ImageWidgetViewer } from './components/image-widget-viewer'

interface State {
  record?: DataRecord
  imageWidth?: number
  imageHeight?: number
  cropWidgetWidth?: number
  cropWidgetHeight?: number

  toolTip: string
  altText: string
  src: string
  linkUrl: string
  attachmentInfos: AttachmentInfo[]

  srcExpression: IMExpression
  altTextExpression: IMExpression
  toolTipExpression: IMExpression
  linkUrlExpression: IMExpression
}

interface ExtraProps {
  useAspectRatio: boolean
  aspectRatio: number | string
  queryObject: IMUrlParameters
  browserSizeMode: BrowserSizeMode
}

const imageWidgetSizeMap: { [key: string]: Size } = {}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig> & ExtraProps, State> {
  __unmount = false
  widgetConRef = React.createRef<HTMLDivElement>()

  static mapExtraStateProps = (state: IMState, props: AllWidgetProps<IMConfig>): ExtraProps => {
    const appConfig = state.appConfig
    const { layouts } = appConfig
    const { layoutId, layoutItemId } = props
    const layout = layouts[layoutId]
    const layoutItemSetting = layout?.content?.[layoutItemId]?.setting || {}
    const useAspectRatio = layoutItemSetting.heightMode === 'ratio' && layoutItemSetting.aspectRatio != null
    return {
      useAspectRatio,
      aspectRatio: layoutItemSetting.aspectRatio,
      queryObject: state.queryObject,
      browserSizeMode: state.browserSizeMode
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      record: null,
      toolTip: this.props?.config?.functionConfig?.toolTip || '',
      altText: this.props?.config?.functionConfig?.altText || '',
      src: this.props?.config?.functionConfig?.imageParam?.url || '',
      linkUrl: this.props?.config?.functionConfig?.linkParam?.value || '',
      srcExpression: this.props.useDataSourcesEnabled && this.getSrcExpression(),
      altTextExpression: this.props.useDataSourcesEnabled && this.getAltTextExpression(),
      toolTipExpression: this.props.useDataSourcesEnabled && this.getToolTipExpression(),
      linkUrlExpression: this.props.useDataSourcesEnabled && this.getLinkUrlExpression(),
      attachmentInfos: [],
      cropWidgetWidth: null,
      cropWidgetHeight: null
    }
  }

  getStyle () {
    const { aspectRatio, useAspectRatio } = this.props
    const cropParam = this.props.config.functionConfig.imageParam?.cropParam
    const cropPixel = cropParam?.cropPixel
    const cropType = cropParam?.cropType
    const noCrop = !cropPixel || !cropType || cropType === CropType.Real

    return css`
      ${noCrop && useAspectRatio && `img {
        aspect-ratio: ${layoutUtils.parseAspectRatio(aspectRatio)};
      }`}
      .widget-image-link {
        display: block;
        padding: 0;
        border: none;
        width: 100%;
        height: 100%;
        outline-offset: -2px !important;
        border-radius: unset;
      }
    `
  }

  componentDidMount () {
    this.__unmount = false
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State) {
    if (!this.props.useDataSourcesEnabled &&
      (
        this.props.config !== prevProps.config || prevProps.useDataSourcesEnabled
      )
    ) {
      this.setState({
        src: this.props?.config?.functionConfig?.imageParam?.url || '',
        toolTip: this.props?.config?.functionConfig?.toolTip,
        altText: this.props?.config?.functionConfig?.altText,
        linkUrl: this.props?.config?.functionConfig?.linkParam?.value
      })
    }

    if (this.props.useDataSourcesEnabled &&
      (
        this.props.config !== prevProps.config || !prevProps.useDataSourcesEnabled
      )
    ) {
      if (this.checkIsStaticSrc(this.props.config.functionConfig.imgSourceType)) {
        this.setState({
          src: this.props?.config?.functionConfig?.imageParam?.url || '',
          toolTipExpression: this.getToolTipExpression(),
          altTextExpression: this.getAltTextExpression(),
          linkUrlExpression: this.getLinkUrlExpression()
        })
      } else if ((this.props.config.functionConfig.imgSourceType === ImgSourceType.ByDynamicUrl &&
        (!this.props.config.functionConfig.dynamicUrlType || this.props.config.functionConfig.dynamicUrlType === DynamicUrlType.Expression))) {
        this.setState({
          record: null,
          srcExpression: this.getSrcExpression(),
          toolTipExpression: this.getToolTipExpression(),
          altTextExpression: this.getAltTextExpression(),
          linkUrlExpression: this.getLinkUrlExpression()
        })
      } else {
        this.setState({
          src: '',
          toolTipExpression: this.getToolTipExpression(),
          altTextExpression: this.getAltTextExpression(),
          linkUrlExpression: this.getLinkUrlExpression()
        })
      }
    }
  }

  componentWillUnmount () {
    this.__unmount = true

    const widgetJson = getAppStore().getState().appConfig.widgets[this.props.id]
    if (!widgetJson) {
      delete imageWidgetSizeMap[this.props.id + '-' + this.props.layoutId]
    }
  }

  checkIsStaticSrc = (imgSourceType: ImgSourceType): boolean => {
    return imgSourceType === ImgSourceType.ByUpload || imgSourceType === ImgSourceType.ByStaticUrl || !imgSourceType
  }

  getSrcExpression = (): IMExpression => {
    return (this.props.config && this.props.config.functionConfig && this.props.config.functionConfig.srcExpression) ||
      Immutable({
        name: '',
        parts: [{
          type: ExpressionPartType.String,
          exp: `"${this.props.config &&
          this.props.config.functionConfig && this.props.config.functionConfig.imageParam && this.props.config.functionConfig.imageParam.url}"`
        }]
      })
  }

  getAltTextExpression = (): IMExpression => {
    return (this.props.config && this.props.config.functionConfig && this.props.config.functionConfig.altTextExpression) ||
      Immutable({
        name: '',
        parts: [{
          type: ExpressionPartType.String,
          exp: `"${this.props.config &&
          this.props.config.functionConfig && this.props.config.functionConfig.altText}"`
        }]
      })
  }

  getToolTipExpression = (): IMExpression => {
    return (this.props.config && this.props.config.functionConfig && this.props.config.functionConfig.toolTipExpression) ||
    Immutable({
      name: '',
      parts: [{
        type: ExpressionPartType.String,
        exp: `"${this.props.config &&
        this.props.config.functionConfig && this.props.config.functionConfig.toolTip}"`
      }]
    })
  }

  getLinkUrlExpression = (): IMExpression => {
    const expression = this.props.config && this.props.config.functionConfig && this.props.config.functionConfig.linkParam &&
      this.props.config.functionConfig.linkParam && this.props.config.functionConfig.linkParam.expression

    return expression || null
  }

  onSrcExpResolveChange = result => {
    if (result.isSuccessful) {
      this.setState({ src: (result.value === 'null' ? '' : result.value) })
    }
  }

  onToolTipExpResolveChange = result => {
    if (result.isSuccessful) {
      this.setState({ toolTip: (result.value === 'null' ? '' : result.value) })
    } else {
      let res: string = ''
      const errorCode = result.value
      if (errorCode === ExpressionResolverErrorCode.Failed) {
        res = this.state.srcExpression && this.state.srcExpression.name
      }

      this.setState({ toolTip: res })
    }
  }

  onAltTextExpResolveChange = result => {
    if (result.isSuccessful) {
      this.setState({ altText: (result.value === 'null' ? '' : result.value) })
    } else {
      let res: string = ''
      const errorCode = result.value
      if (errorCode === ExpressionResolverErrorCode.Failed) {
        res = this.state.srcExpression && this.state.srcExpression.name
      }

      this.setState({ altText: res })
    }
  }

  onLinkUrlExpResolveChange = result => {
    if (result.isSuccessful) {
      this.setState({ linkUrl: result.value })
    } else {
      let res: string = ''
      const errorCode = result.value
      if (errorCode === ExpressionResolverErrorCode.Failed) {
        res = this.state.srcExpression && this.state.srcExpression.name
      }

      this.setState({ linkUrl: res })
    }
  }

  onAttachmentInfosChange = (attachmentInfos: AttachmentInfo[]) => {
    this.setState({
      attachmentInfos: attachmentInfos
    })
  }

  unmountAttachmentInfosChange = () => {
    this.setState({
      attachmentInfos: []
    })
  }

  onClick = (event: MouseEvent | TouchEvent) => {
    const linkParam = this.props.config.functionConfig.linkParam
    if (linkParam && linkParam.value && linkParam.linkType !== LinkType.None) {
      (event as any).exbEventType = 'linkClick'
    }
  }

  onCropWidgetResize = ({ width, height }) => {
    if (this.__unmount) {
      return
    }

    if (!width && !height) {
      return
    }

    this.setState({
      cropWidgetWidth: width,
      cropWidgetHeight: height
    })
  }

  clearCropWidgetSize = () => {
    this.setState({
      cropWidgetWidth: null,
      cropWidgetHeight: null
    })
  }

  handleRecordChange = (record: DataRecord) => {
    this.setState({
      record: record,
      attachmentInfos: null
    })
  }

  render () {
    const {
      id, useDataSourcesEnabled: isDataSourceUsed, useDataSources, config,
      autoHeight, autoWidth, isInlineEditing, repeatedDataSource, builderSupportModules,
      queryObject, browserSizeMode, intl
    } = this.props
    const { functionConfig = {} as FunctionConfig } = config
    const {
      dynamicUrlType, imageFillMode, imageDisplayQualityMode, altTextWithAttachmentName,
      toolTipWithAttachmentName, symbolScale, linkParam, imgSourceType, imageViewer,
      useDataSourceForMainDataAndViewSelector, isSelectedFromRepeatedDataSourceContext,
      imageParam, srcExpression
    } = functionConfig
    const {
      toolTip, altText, src, record, attachmentInfos, linkUrl,
      cropWidgetWidth, cropWidgetHeight, linkUrlExpression
    } = this.state

    let renderResult = null
    let imageContent = null

    const { originalWidth, fileFormat, cropParam } = imageParam || {}

    const isDynamic = imgSourceType === ImgSourceType.ByDynamicUrl
    const isAttachment = dynamicUrlType === DynamicUrlType.Attachment && isDataSourceUsed
    const isSymbol = dynamicUrlType === DynamicUrlType.Symbol && isDataSourceUsed
    const isExpression = isDynamic && (!dynamicUrlType || dynamicUrlType === DynamicUrlType.Expression) && isDataSourceUsed
    const isAttachmentSymbol = isAttachment || isSymbol
    const notAttachmentSymbol = !isAttachmentSymbol

    let srcList = []
    if (isAttachment) {
      if (attachmentInfos && attachmentInfos.length > 0) {
        srcList = attachmentInfos.map(a => a.url)
      } else {
        srcList = ['']
      }
    } else if (!isSymbol) {
      srcList = [src]
    }

    imageContent = (
      <React.Fragment>
        {notAttachmentSymbol &&
        <Image
          src={src}
          title={toolTip}
          alt={altText}
          fadeInOnLoad
          imageFillMode={imageFillMode}
          isAutoHeight={autoHeight}
          isAutoWidth={autoWidth}
          quality={imageDisplayQualityMode}
          originalWidth={originalWidth}
          fileFormat={fileFormat}
          cropParam={cropParam}
          showBrokenPlaceholder={true}
          className={classNames({'d-none': srcExpression && !src})}
        />}
        {isAttachment &&
          <div className='w-100 h-100'>
            <ImageGallery
              sources={attachmentInfos}
              cropParam={imageParam?.cropParam}
              imageFillMode={imageFillMode}
              isAutoHeight={autoHeight}
              isAutoWidth={autoWidth}
              title={toolTip} alt={altText}
              altTextWithAttachmentName={altTextWithAttachmentName}
              toolTipWithAttachmentName={toolTipWithAttachmentName}
              intl={intl}
              browserSizeMode={browserSizeMode}
            />
          </div>}
        {isSymbol &&
          <SymbolWidget record={record} toolTip={toolTip} altText={altText} symbolScale={symbolScale} />
        }
      </React.Fragment>
    )

    let target: LinkTarget
    let linkTo: LinkResult
    if (linkParam && linkParam.linkType) {
      target = linkParam.openType
      linkTo = {
        linkType: linkParam.linkType
      }

      if (linkParam.linkType === LinkType.WebAddress) {
        linkTo.value = linkUrl
      } else {
        linkTo.value = linkParam.value
      }
    }
    if (linkTo && linkTo?.linkType !== LinkType.None) {
      renderResult = (
        <Link to={linkTo} target={target} queryObject={queryObject} className='widget-image-link' unstyled>
          {imageContent}
        </Link>
      )
    } else {
      renderResult = imageContent
    }

    if (imageFillMode !== ImageFillMode.Fit && isInlineEditing && src &&
      (!repeatedDataSource || (repeatedDataSource && (repeatedDataSource as RepeatedDataSource).recordIndex === 0))) {
      // open crop tool
      const WidgetInBuilder = builderSupportModules.widgetModules.WidgetInBuilder
      renderResult = (
        <div className='widget-image w-100 h-100' ref={this.widgetConRef} css={this.getStyle()}>
          <ReactResizeDetector targetRef={this.widgetConRef} handleWidth handleHeight onResize={this.onCropWidgetResize} />
          {renderResult}
          {cropWidgetHeight && cropWidgetWidth && <WidgetInBuilder
            widgetId={id} config={config} onUnmount={() => { this.clearCropWidgetSize() }}
            widgetWidth={cropWidgetWidth} widgetHeight={cropWidgetHeight}
          >
          </WidgetInBuilder>}
        </div>
      )
    } else {
      renderResult = (
        <div
          className='widget-image w-100 h-100' ref={this.widgetConRef} css={this.getStyle()}
          onClick={(event) => { this.onClick(event as any) }} onTouchEnd={(event) => { this.onClick(event as any) }}
        >
          {renderResult}
          {isExpression &&
            <ExpressionResolverComponent
              useDataSources={useDataSources} expression={this.getSrcExpression()}
              onChange={this.onSrcExpResolveChange} widgetId={id}
            />
          }
          {
            isDataSourceUsed && <React.Fragment>
              <ExpressionResolverComponent
                useDataSources={useDataSources} expression={this.getAltTextExpression()}
                onChange={this.onAltTextExpResolveChange} widgetId={id}
              />
              <ExpressionResolverComponent
                useDataSources={useDataSources} expression={this.getToolTipExpression()}
                onChange={this.onToolTipExpResolveChange} widgetId={id}
              />
              <ExpressionResolverComponent
                useDataSources={useDataSources} expression={linkUrlExpression}
                onChange={this.onLinkUrlExpResolveChange} widgetId={id}
              />
            </React.Fragment>
          }
          {isAttachment &&
          // The original logic determines whether the AttachmentComponent and SymbolComponent were rendered by dynamicUrlType, this causes attachmentInfos
          // to remain unchanged when the data source changes and the type is reset to default, and the onChange event is not executed. When attachment type
          // is selected again, if the new data is null, then attachmentInfos does not change internally (null -> null), so attachmentInfos does not change.
          // Now add the method to reset the corresponding state when unmount
            <AttachmentComponent
              record={record}
              unmountAttachmentInfosChange={this.unmountAttachmentInfosChange}
              onChange={this.onAttachmentInfosChange}
            />
          }
          {isAttachmentSymbol &&
            <RecordComponent
              widgetId={id}
              useDataSource={useDataSourceForMainDataAndViewSelector}
              isSelectedFromRepeatedDataSourceContext={isSelectedFromRepeatedDataSourceContext}
              onRecordChange={this.handleRecordChange}
            />
          }
          {imageViewer && srcList.length > 0 && <ImageWidgetViewer srcList={srcList} />}
        </div>
      )
    }

    return renderResult
  }
}
