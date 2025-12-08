import { urlUtils, type ExpressionPart, type IMExpressionMap } from 'jimu-core'

/**
 * Get expression parts from expressions
 * @param {IMExpressionMap} expressions
 */
export const getExpressionParts = (expressions: IMExpressionMap): ExpressionPart[] => {
  let parts = []
  for (const uniqueId in expressions) {
    const expression = expressions[uniqueId]
    const expParts = expression?.parts
    if (expParts != null) {
      parts = parts.concat(expParts)
    }
  }
  return parts
}

/**
 * Function to get embed url from embed code.
 * @param {string} embedCode embed code
 * @returns {string} embed url
 */
export const getUrlByEmbedCode = (embedCode: string) => {
  let embedUrl = ''
  // Youtube, Facebook, Vimeo and other common iframe embedded websites
  const regIframe = /<iframe\s+[^>]*src=['"]([^'"]+)[^>](.*)/gi
  // Instagram
  const regIns = /<blockquote [^>]*data-instgrm-permalink=['"]([^'"]+)[^>]*>(.*)<\/blockquote>/gi
  // Twitter
  const regTweet = /<blockquote class="twitter-tweet"(.*)<\/blockquote>/gi
  const regTimeLine = /<a class="twitter-timeline" [^>]*href=['"]([^'"]+)[^>]*>(.*)<\/a>/gi
  const regHref = /<a [^>]*href=['"]([^'"]+)[^>]*>/gi

  const regTweetTheme = /<blockquote [^>]*data-theme=['"]([^'"]+)[^>]*>(.*)<\/blockquote>/gi
  const regTweetLang = /<blockquote [^>]*data-lang=['"]([^'"]+)[^>]*>(.*)<\/blockquote>/gi
  const regTimelineTheme = /<a [^>]*data-theme=['"]([^'"]+)[^>]*>(.*)<\/a>/gi
  const regTimelineLang = /<a [^>]*data-lang=['"]([^'"]+)[^>]*>(.*)<\/a>/gi
  const allowedTwitterHosts = [
    'twitter.com',
    'www.twitter.com'
  ]

  if (regIframe.test(embedCode)) {
    embedCode.replace(regIframe, (match, capture) => {
      embedUrl = capture
      return match
    })
  } else if (regIns.test(embedCode)) {
    embedCode.replace(regIns, (match, capture) => {
      const preUrl = capture.substr(0, capture.indexOf('?'))
      embedUrl = `${preUrl}embed`
      return match
    })
  } else if (regTweet.test(embedCode)) {
    embedCode.replace(regHref, (match, capture) => {
      const host = urlUtils.getUrlHost(capture)
      if (allowedTwitterHosts.includes(host)) {
        const tweetId = capture.substring(capture.lastIndexOf('/') + 1).replace(/[?].*$/, '')
        const themeArr = regTweetTheme.exec(embedCode)
        const langArr = regTweetLang.exec(embedCode)
        let theme, lang
        if (themeArr?.length > 1) theme = themeArr[1]
        if (langArr?.length > 1) lang = langArr[1]
        embedUrl = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}${theme ? `&theme=${theme}` : ''}${lang ? `&lang=${lang}` : ''}`
      }
      return match
    })
  } else if (regTimeLine.test(embedCode)) {
    embedCode.replace(regHref, (match, capture) => {
      const host = urlUtils.getUrlHost(capture)
      if (allowedTwitterHosts.includes(host)) {
        const screenName = capture.substring(capture.lastIndexOf('/') + 1).replace(/[?].*$/, '')
        const themeArr = regTimelineTheme.exec(embedCode)
        const langArr = regTimelineLang.exec(embedCode)
        let theme, lang
        if (themeArr?.length > 1) theme = themeArr[1]
        if (langArr?.length > 1) lang = langArr[1]
        const questionMark = (theme || lang) ? '?' : ''
        embedUrl = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${screenName}${questionMark}${theme ? `&theme=${theme}` : ''}${lang ? `&lang=${lang}` : ''}`
      }
      return match
    })
  }
  const formatUrl = decodeURI(embedUrl).trim().toLocaleLowerCase()
  if (formatUrl.startsWith('javascript:') || formatUrl.startsWith('data:') || formatUrl.startsWith('vbscript:')) embedUrl = ''
  return embedUrl
}

/**
 * Function to get width/height from embed code.
 * @param {string} embedCode embed code
 * @returns {{width: string, height: string}} width and height from iframe
 */
export const getParamsFromEmbedCode = (embedCode: string) => {
  // Youtube, Facebook, Vimeo and other common iframe embedded websites
  // const regIframe = /<iframe [^>]*src=['"]([^'"]+)[^>](.*)/gi
  const regIframeWidth = /<iframe\s+[^>]*width=['"]([^'"]+)[^>](.*)/gi
  const regIframeHeight = /<iframe\s+[^>]*height=['"]([^'"]+)[^>](.*)/gi
  const widthArr = regIframeWidth.exec(embedCode)
  const heightArr = regIframeHeight.exec(embedCode)
  let width, height
  if (widthArr?.length > 1) width = widthArr[1]
  if (heightArr?.length > 1) height = heightArr[1]
  return { width, height }
}
