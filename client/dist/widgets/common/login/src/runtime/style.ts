import { type IMThemeVariables, css, type SerializedStyles, AppMode } from 'jimu-core'
import { DistanceUnits, styleUtils } from 'jimu-ui'
import type { IMCustomStyle, IMIconProps } from '../config'

export function getStyle (theme: IMThemeVariables): SerializedStyles {
  return css`

    .login-button-box {
      .login-button {
        width: 100%;
        height: 100%;
        // padding for default auto style
        padding: 12px 24px;
        //border-radius: ${theme.sys.shape.shape2};
      }
      .avatar-icon {
        margin: 0 4px;
      }
      .user-name {
        margin: 0 4px;
      }
    }

    .login-dropdown-box {
      width: 250px;
      color: unset;
      background: unset;
      .login-dropdown-item {
        &:hover {
          background: none;
          color: unset;
          text-decoration: none;
        }
      }

      .login-dropdown-item.header-item {
        .header-portrait {
          width: 48px;
          min-height: 48px;
          margin-right: 8px;
        }
        .user-info-content {
          align-items: center;
        }
        .user-name-content {
          //line-height: 22px;
          justify-content: flex-end;
          padding: 0 8px;
          .user-name {
            margin: 2px 0;
            max-width: 130px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .main-title {
            font-weight: 600;
          }
          .sub-title {
          }
        }
      }

      .login-dropdown-item.link-item {
        min-height: 40px;
        &:hover {
          color: ${theme.sys.color.primary.text};
          background: ${theme.sys.color.primary.main};
        }
      }
      .login-dropdown-item.link-item.disabled {
        color: unset;
        &:hover {
          color: ${theme.sys.color.primary.text};
          background: ${theme.sys.color.primary.main};
        }
      }

      .login-dropdown-item.jimu-dropdown-item-divider {
        border-top-color : ${theme.sys.color.divider.tertiary};
      }

      .permission-list-title {
        padding: 0 12px;
      }
      .permission-list {
         max-height: 250px;
        .banner-list-item-content {
          display: block;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1px;
          position: relative;
          font-size: 12px;
          .item-info {
            flex-grow: 2;
            .fold-btn {
              .directional {
                width: 8px;
                height: 8px;
              }
            }
          }
          .item-info{
            display: flex;
            align-items: center;
          }
          .item-link {
            display: block;
            max-width: 160px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .item-link.sub-item-link {
            max-width: 240px;
            padding-left: 26px;
          }
          .item-operation {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            .item-operation-btn {
              height: 20px;
              font-size: 12px;
            }
          }
          .button-separator {
            height: 18px;
            border-right-width: 1px;
            border-right-style: solid;
            border-right-color: var(--sys-color-divider-secondary)
          }
        }
        .user-name-content {
          justify-content: flex-end;
          padding: 0 16px;
          .user-name {
            font-size: 12px;
            font-style: italic;
          }
        }
      }

    }
  `
}

export interface LoginCustomStyle {
  backgroundColor?: string
  backgroundPosition?: string | number
  backgroundRepeat?: string
  backgroundSize?: string | number
  transform?: string
}

export interface LoginCustomIconStyle {
  color: string
  fill: string
  height: string
  width: string
}

export interface LoginStyleState {
  isConfiguringHover?: boolean
  regularStyle: LoginCustomStyle
  hoverStyle: LoginCustomStyle
  dropdownRegularStyle?: LoginCustomStyle
  dropdownHoverStyle?: LoginCustomStyle
  iconStyle?: {
    regularStyle: LoginCustomIconStyle
    hoverStyle: LoginCustomIconStyle
  }
}

export function getIconStyleState (customStyle: IMCustomStyle, widgetId: string, active: boolean, appMode: AppMode, isConfiguringHover: boolean) {
  const regular = customStyle?.regular
  const hover = customStyle?.hover
  let regularIconProps
  let hoverIconProps
  if (active && appMode !== AppMode.Run) {
    regularIconProps = isConfiguringHover ? { ...regular?.iconProps, ...hover?.iconProps } : regular?.iconProps
    hoverIconProps = hover?.iconProps
  } else {
    regularIconProps = regular?.iconProps
    hoverIconProps = hover?.iconProps
  }
  const r = regularIconProps || ({} as IMIconProps)
  const h = hoverIconProps || ({} as IMIconProps)

  return {
    regularStyle: {
      color: r.color,
      fill: r.color,
      width: `${r.size}${DistanceUnits.PIXEL}`,
      height: `${r.size}${DistanceUnits.PIXEL}`
    },
    hoverStyle: {
      color: h.color,
      fill: h.color,
      width: `${h.size}${DistanceUnits.PIXEL}`,
      height: `${h.size}${DistanceUnits.PIXEL}`
    }
  }
}

export function getStyleState (customStyle: IMCustomStyle, widgetId: string, active: boolean, appMode: AppMode, isConfiguringHover: boolean): LoginStyleState {
  let regularStyle
  let dropdownRegularStyle
  //let dropdownHoverStyle
  const regular = customStyle.regular
  const style = styleUtils.toCSSStyle(regular && regular.without('iconProps').asMutable({ deep: true })) as React.CSSProperties
  const hover = customStyle.hover
  const originalHoverStyle = styleUtils.toCSSStyle(hover && hover.without('iconProps').asMutable({ deep: true })) as React.CSSProperties
  const hoverStyle = { ...style, ...originalHoverStyle }

  const dropdownRegular = customStyle.dropdownRegular
  const dropdownStyle = styleUtils.toCSSStyle(dropdownRegular && dropdownRegular.without('iconProps').asMutable({ deep: true })) as React.CSSProperties
  const dropdownHover = customStyle.dropdownHover
  const originalDropdownHoverStyle = styleUtils.toCSSStyle(dropdownHover && dropdownHover.without('iconProps').asMutable({ deep: true })) as React.CSSProperties
  const dropdownHoverStyle = {...dropdownStyle, ...originalDropdownHoverStyle}
  //Object.entries(originalDropdownHoverStyle).forEach(entry => {
  //  const key = entry[0]
  //  const value = entry[1]
  //  const newValue = `${value} !important`
  //  dropdownHoverStyle[key] = newValue
  //})

  if (active && appMode !== AppMode.Run) {
    regularStyle = isConfiguringHover ? { ...removeUndefinedStyle(style), ...removeUndefinedStyle(hoverStyle) } : style
    dropdownRegularStyle = isConfiguringHover ? { ...removeUndefinedStyle(dropdownStyle), ...removeUndefinedStyle(dropdownHoverStyle) } : dropdownStyle
  } else {
    regularStyle = style
    dropdownRegularStyle = dropdownStyle
  }
  const iconStyle = getIconStyleState(customStyle, widgetId, active, appMode, isConfiguringHover)
  return {
    isConfiguringHover,
    regularStyle,
    hoverStyle,
    dropdownRegularStyle,
    dropdownHoverStyle,
    iconStyle
  }
}

const removeUndefinedStyle = (style: React.CSSProperties): React.CSSProperties => {
  if (!style) {
    return style
  }
  const removedUndefinedStyle = {}
  Object.keys(style).forEach(styleName => {
    if ((typeof style[styleName] === 'string' && !style[styleName].includes('undefined')) ||
      typeof style[styleName] === 'number') {
      removedUndefinedStyle[styleName] = style[styleName]
    }
  })
  return removedUndefinedStyle
}

