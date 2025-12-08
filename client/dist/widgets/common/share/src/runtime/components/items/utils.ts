import type { React, IntlShape } from 'jimu-core'
import { ErrorInfo } from '../../../config'
import nls from '../../translations/default'

// for popper toggle
export function stopPropagation (evt: React.MouseEvent<HTMLDivElement>) {
  evt.stopPropagation()
  evt.nativeEvent?.stopImmediatePropagation()
}

export function replaceAttr (text: string, attr: string, val: string | number) {
  if (typeof text === 'undefined' || typeof attr === 'undefined' || typeof val === 'undefined') {
    return ''
  }

  const regex = new RegExp(`(${attr}=")([^"]*)`, 'gi')
  const res = text.replace(regex, `$1${val}`)
  return res
}

/*
  Share widget support url params

  Specifically, will remove: /page/{}/, ?views={}, #{}
*/
export function sliceUrlForSharing (isIncludeUrlParams: boolean): string {
  let res = window.location.href

  if (!isIncludeUrlParams) {
    let query = _keepUrlParams((window.location.search?.substring(1)), ['draft', 'org','id']) // remove: ?views={view}
    if (query) {
      query = '?' + query
    }

    let hash = _keepUrlParams((window.location.hash?.substring(1)), []) // remove: #{hash}
    if (hash) {
      hash = '#' + hash
    }

    let partOne = _removeHashOrSearchFromUrl(res)
    partOne = _removePageInfoFromUrl(partOne) // remove: /page/${page}/

    res = partOne + query + hash
  }

  return res
}

// Remove the last splash in the url.
export function getUrlWithoutLastSplash(url: string): string {
  return url.replace(/\/(?=\?|$)/, '')
}

function _keepUrlParams (url: string, params: string[]) {
  const queryParams = url.split('&')

  const newQueryParams = queryParams.filter(param => {
    const paramName = param.split('=')[0]
    return params.includes(paramName)
  })

  if (newQueryParams.length > 0) {
    return newQueryParams.join('&')
  } else {
    return ''
  }
}

function _removeHashOrSearchFromUrl (href: string) {
  const hashIndex = href.indexOf('#')
  const searchIndex = href.indexOf('?')

  let cleanUrl = href
  if (hashIndex !== -1) {
    cleanUrl = cleanUrl.substring(0, hashIndex)
  }
  if (searchIndex !== -1) {
    cleanUrl = cleanUrl.substring(0, searchIndex)
  }

  return cleanUrl
}

function _removePageInfoFromUrl (url) {
  const regex = /\/page\/[^/]+\/?/ // page info format: page/${pageId}/ , page/${pageLabel}/ or page/${pageId}
  const cleanedUrl = url.replace(regex, '/')

  return cleanedUrl
}

// error info
export function getErrorInfoNls (errorInfo: ErrorInfo, intl: IntlShape) {
  let errorNls = ''
  if (errorInfo === ErrorInfo.UrlIsTooLong) {
    errorNls = intl.formatMessage({ id: 'urlIsTooLong', defaultMessage: nls.urlIsTooLong })
  } else if (errorInfo === ErrorInfo.NetworkFailed) {
    errorNls = intl.formatMessage({ id: 'networkFailed', defaultMessage: nls.networkFailed })
  }

  return errorNls
}
