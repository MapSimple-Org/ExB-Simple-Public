import { React, SessionManager, esri, getAppStore, type IMThemeVariables } from 'jimu-core'
import { Image } from 'jimu-ui'
import { PlaceholderMapFilled } from 'jimu-icons/filled/data/placeholder-map'

interface Props {
  mapItemId: string
  portUrl: string
  label: string
  theme: IMThemeVariables
  usedInSetting: boolean
}

interface States {
  mapThumbUrl: string
}

export default class MapThumb extends React.PureComponent<Props, States> {
  unmount = false

  constructor (props) {
    super(props)

    this.state = {
      mapThumbUrl: null
    }
  }

  componentDidMount () {
    this.unmount = false
    this.setMapThumbUrl(this.props.mapItemId)
  }

  componentDidUpdate (prevProps: Props, prevState) {
    if (prevProps.mapItemId !== this.props.mapItemId) {
      this.setMapThumbUrl(this.props.mapItemId)
    }
  }

  setMapThumbUrl = (mapId: string): void => {
    if (!mapId) {
      this.setState({ mapThumbUrl: null })
    }

    // if no portalUrl or same to config portalUrl, use app config's portalUrl
    const portalUrl = this.props?.portUrl || getAppStore().getState().portalUrl
    const session = SessionManager.getInstance().getSessionByUrl(portalUrl) || null
    esri.restPortal.searchItems({
      q: `id:${mapId}`,
      authentication: session,
      portal: portalUrl + '/sharing/rest'
    }).then(items => {
      if (!this.unmount) {
        if (items.results[0]?.thumbnail) {
          const session = SessionManager.getInstance().getSessionByUrl(portalUrl)
          let tempThumbUrl = null
          if (session && session.token) {
            tempThumbUrl = `${portalUrl}/sharing/rest/content/items/${items.results[0].id}/` +
            `info/${items.results[0].thumbnail}?token=${session.token}`
          } else {
            tempThumbUrl = `${portalUrl}/sharing/rest/content/items/${items.results[0].id}/` +
            `info/${items.results[0].thumbnail}`
          }

          const img = document.createElement('img')

          img.onerror = () => {
            this.setState({ mapThumbUrl: null })
          }

          img.src = tempThumbUrl

          this.setState({ mapThumbUrl: tempThumbUrl })
        } else {
          this.setState({ mapThumbUrl: null })
        }
      }
    })
  }

  componentWillUnmount () {
    this.unmount = true
  }

  render () {
    const label = this.props?.label || ''
    const mapThumbUrl = this.state.mapThumbUrl

    if (mapThumbUrl) {
      return <Image src={mapThumbUrl} alt={label} />
    } else {
      const theme = this.props?.theme
      let bg = theme?.sys.color.surface.overlay
      let color = theme?.sys.color.surface.overlayHint

      if (this.props?.usedInSetting) {
        bg = theme?.ref.palette.neutral[300]
        color = theme?.ref.palette.neutral[600]
      }

      return (
        <div style={{ backgroundColor: bg, height: '100%' }} >
          <PlaceholderMapFilled color={color} size={'100%'} />
        </div>
      )
    }
  }
}
