import { urlUtils } from 'jimu-core'
import { ErrorInfo } from '../../config'

export async function fetchShortLink (href: string): Promise<any> {
  const DEBUG = false
  const BITLY_URL = 'https://arcg.is/prod/shorten'
  const URL_MAX_LENGTH = 1980

  const promise = new Promise((resolve, reject) => {
    let uri = href// location.href;
    //uri = encodeURIComponent(uri) // can't encode url again
    uri = urlUtils.updateQueryStringParameter(BITLY_URL, 'longUrl', uri) // DO NOT encode BITLY_URL+param
    uri = urlUtils.updateQueryStringParameter(uri, 'f', 'json')

    fetch(uri).then(async response => await response.json())
      .then(json => {
        const shortLink = json.data.url

        if (DEBUG) {
          console.log('A:long_url==>' + json.data.long_url)
          console.log('B:s_url==>' + shortLink)
        }

        if (shortLink === '' && (json.data.hash.includes('maximum allowed'))) {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject({ href, reason: ErrorInfo.UrlIsTooLong })
        } else {
          // Successfully fetch shortLink
          resolve(shortLink)
        }
      })
      .catch(error => {
        console.log('Share: short-link, Fetch Error: ', error)

        let reason = ErrorInfo.NetworkFailed
        if (error.message === 'Failed to fetch' && href.length > URL_MAX_LENGTH) {
          reason = ErrorInfo.UrlIsTooLong
        }

        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject({ href, reason })
      })
  })
  return promise
}
