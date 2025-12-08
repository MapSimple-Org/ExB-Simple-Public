import { jimuHistory } from 'jimu-core'
import { sliceUrlForSharing, replaceAttr, getUrlWithoutLastSplash } from '../src/runtime/components/items/utils'

describe('share items utils', () => {
  beforeEach(() => {
    jimuHistory.browserHistory.replace('/')
  })


  it('isIncludeUrlParams = true', () => {
    const location = {
      pathname: '/experience/11/page/Page-2/',
      search: '?draft=true&views=View-6%2CView-2&org=beijing',
      hash: '#widget_32=p1:encodedValue1,p2:22,p3:3'
    }
    jimuHistory.browserHistory.replace(location)

    const isIncludeUrlParams = true
    const slicedUrl = sliceUrlForSharing(isIncludeUrlParams)

    const URL = 'http://localhost/experience/11/page/Page-2/?draft=true&views=View-6%2CView-2&org=beijing#widget_32=p1:encodedValue1,p2:22,p3:3'
    expect(slicedUrl).toBe(URL)
  })


  it('isIncludeUrlParams = false', () => {
    const location = {
      pathname: '/experience/11/page/Page-2/',
      search: '?draft=true&views=View-6%2CView-2',
      hash: '#widget_32=p1:encodedValue1,p2:22,testSetHash:false,p3:3'
    }
    jimuHistory.browserHistory.replace(location)

    const isIncludeUrlParams = false
    const slicedUrl = sliceUrlForSharing(isIncludeUrlParams)

    const URL = 'http://localhost/experience/11/?draft=true'
    expect(slicedUrl).toBe(URL)
  })


  it('test org', () => {
    const location = {
      pathname: '/experience/11/page/Page-2/',
      search: '?draft=true&views=View-6%2CView-2&org=beijing',
      hash: '#widget_32=p1:encodedValue1,p2:22,testSetHash:false,p3:3'
    }
    jimuHistory.browserHistory.replace(location)

    const isIncludeUrlParams = false
    const slicedUrl = sliceUrlForSharing(isIncludeUrlParams)

    const URL = 'http://localhost/experience/11/?draft=true&org=beijing'
    expect(slicedUrl).toBe(URL)
  })


  it('test page/pageInfo/ 1', () => {
    const location = {
      pathname: '/experience/11/page/Page-1/',
      search: '?draft=true&views=View-6%2CView-2&org=beijing&any=page/pageInfo/',
      hash: '#widget_32=p1:encodedValue1,any:page/pageInfo/'
    }
    jimuHistory.browserHistory.replace(location)

    const isIncludeUrlParams = false
    const slicedUrl = sliceUrlForSharing(isIncludeUrlParams)

    const URL = 'http://localhost/experience/11/?draft=true&org=beijing'
    expect(slicedUrl).toBe(URL)
  })

  it('test page/pageInfo 2', () => {
    const location = {
      pathname: '/experience/12/page/Page-2',
      search: '?draft=true&views=View-6%2CView-2&org=beijing&any=page/pageInfo/',
      hash: '#widget_32=p1:encodedValue1,any:page/pageInfo/'
    }
    jimuHistory.browserHistory.replace(location)

    const isIncludeUrlParams = false
    const slicedUrl = sliceUrlForSharing(isIncludeUrlParams)

    const URL = 'http://localhost/experience/12/?draft=true&org=beijing'
    expect(slicedUrl).toBe(URL)
  })

  it('test page/pageInfo 3', () => {
    const location = {
      pathname: '/experience/13/page/Page-3'
    }
    jimuHistory.browserHistory.replace(location)

    const isIncludeUrlParams = false
    const slicedUrl = sliceUrlForSharing(isIncludeUrlParams)

    const URL = 'http://localhost/experience/13/'
    expect(slicedUrl).toBe(URL)
  })

  it('test replaceAttr url', () => {
    const text = '<iframe width="800" height="600" frameborder="0" allowfullscreen src="https://arcg.is/1OmHyv1"></iframe>'
    const longUrl = 'https://horizon.esri.com:3001/experience/20/?draft=true&org=esridevbeijing#'

    const newText = replaceAttr(text, 'src', longUrl)
    expect(newText).toBe('<iframe width="800" height="600" frameborder="0" allowfullscreen src="https://horizon.esri.com:3001/experience/20/?draft=true&org=esridevbeijing#"></iframe>')
  })

  it('test replaceAttr params', () => {
    const text = '<iframe width="800" height="600" frameborder="0" allowfullscreen src="https://arcg.is/1OmHyv1" params1>params2</iframe>'
    const longUrl = 'https://horizon.esri.com:3001/experience/20/?draft=true&org=esridevbeijing#'

    let newText = replaceAttr(text, 'width', 799)
    newText = replaceAttr(newText, 'height', 599)
    newText = replaceAttr(newText, 'src', longUrl)
    expect(newText).toBe('<iframe width="799" height="599" frameborder="0" allowfullscreen src="https://horizon.esri.com:3001/experience/20/?draft=true&org=esridevbeijing#" params1>params2</iframe>')
  })

  describe('getUrlWithoutLastSplash', () => {
    it('should remove trailing slash before query params', () => {
      const url = 'http://localhost/experience/11/page/Page-2/?draft=true'
      const expected = 'http://localhost/experience/11/page/Page-2?draft=true'
      expect(getUrlWithoutLastSplash(url)).toBe(expected)
    })

    it('should remove trailing slash at the end of the url', () => {
      const url = 'http://localhost/experience/11/page/Page-2/'
      const expected = 'http://localhost/experience/11/page/Page-2'
      expect(getUrlWithoutLastSplash(url)).toBe(expected)
    })

    it('should not remove slash in the middle of the path', () => {
      const url = 'http://localhost/experience/11/page/Page-2/subpage'
      const expected = 'http://localhost/experience/11/page/Page-2/subpage'
      expect(getUrlWithoutLastSplash(url)).toBe(expected)
    })

    it('should handle url without trailing slash', () => {
      const url = 'http://localhost/experience/11/page/Page-2'
      const expected = 'http://localhost/experience/11/page/Page-2'
      expect(getUrlWithoutLastSplash(url)).toBe(expected)
    })

    it('should handle url with hash but no trailing slash', () => {
      const url = 'http://localhost/experience/11#hash'
      const expected = 'http://localhost/experience/11#hash'
      expect(getUrlWithoutLastSplash(url)).toBe(expected)
    })

    it('should handle url with trailing slash before hash', () => {
      // The regex /\/(?=\?|$)/ only looks for slash before ? or end of string ($)
      // It won't remove a slash before a #
      const url = 'http://localhost/experience/11/#hash'
      const expected = 'http://localhost/experience/11/#hash'
      expect(getUrlWithoutLastSplash(url)).toBe(expected)
    })

    it('should handle url with trailing slash before query and hash', () => {
      const url = 'http://localhost/experience/11/?query=1#hash'
      const expected = 'http://localhost/experience/11?query=1#hash'
      expect(getUrlWithoutLastSplash(url)).toBe(expected)
    })

    it('should handle empty string', () => {
      const url = ''
      const expected = ''
      expect(getUrlWithoutLastSplash(url)).toBe(expected)
    })

    it('should handle url with only a slash', () => {
      const url = '/'
      const expected = ''
      expect(getUrlWithoutLastSplash(url)).toBe(expected)
    })
  })
})
