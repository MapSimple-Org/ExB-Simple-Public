import type { Expression, IMUseDataSource, LinkParam } from 'jimu-core'
import type { FourSidesUnit, BorderStyle, BoxShadowStyle, ImageParam, ImageFillMode, ImageDisplayQualityMode } from 'jimu-ui'
import type { ImmutableObject } from 'seamless-immutable'

export enum ImgSourceType {
  ByUpload = 'BYUPLOAD',
  ByStaticUrl = 'BYSTATICURL',
  ByDynamicUrl = 'BYDYNAMICURL'
}

export enum DynamicUrlType {
  Expression = 'EXPRESSION',
  Attachment = 'ATTACHMENT',
  Symbol = 'SYMBOL'
}

export interface FunctionConfig {
  altText: string
  toolTip: string
  altTextWithAttachmentName: boolean
  toolTipWithAttachmentName: boolean
  srcExpression?: ImmutableObject<Expression>
  altTextExpression: ImmutableObject<Expression>
  toolTipExpression: ImmutableObject<Expression>
  linkParam: LinkParam
  imageFillMode?: ImageFillMode
  imgSourceType?: ImgSourceType
  imageParam?: ImmutableObject<ImageParam>
  symbolScale?: number
  dynamicUrlType?: DynamicUrlType
  isSelectedFromRepeatedDataSourceContext: boolean
  useDataSourceForMainDataAndViewSelector: IMUseDataSource
  imageDisplayQualityMode?: ImageDisplayQualityMode
  imageViewer?: boolean
}

export interface StyleConfig {
  name?: string
  shape?: string
  backgroundColor?: string
  border?: BorderStyle
  borderRadius?: FourSidesUnit
  boxShadow?: BoxShadowStyle
}

export interface ShapeStyle {
  borderRadius?: FourSidesUnit
  thumbUrl?: string
}

export interface Config {
  functionConfig: FunctionConfig
  styleConfig: StyleConfig
}

export type IMConfig = ImmutableObject<Config>
