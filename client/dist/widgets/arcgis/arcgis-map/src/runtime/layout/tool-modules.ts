import type { BaseTool, BaseToolProps } from './base/base-tool'
import Zoom from '../tools/zoom'
import Home from '../tools/home'
import Compass from '../tools/compass'
import Locate from '../tools/locate'
import ClearActionData from '../tools/clear-action-data'
import Navigation from '../tools/navigation'
import Search from '../tools/search'
import Layers from '../tools/layers'
import BaseMap from '../tools/basemap'
import MapSwitch from '../tools/mapswitch'
import FullScreen from '../tools/fullscreen'
import ScaleBar from '../tools/scalebar'
import Attribution from '../tools/attribution'
import Measure from '../tools/measure'
import Select from '../tools/select'
import SelectState from '../tools/selectstate'
import ExtentNavigate from '../tools/extent-navigate'
import OverviewMap from '../tools/overview-map'

const ToolModules: { [ModuleName: string]: new (props: BaseToolProps, deprecatedLegacyContext?: any) => BaseTool<BaseToolProps, any> } = {
  Zoom: Zoom,
  Home: Home,
  Navigation: Navigation,
  Locate: Locate,
  ClearActionData: ClearActionData,
  Compass: Compass,
  Search: Search,
  Layers: Layers,
  BaseMap: BaseMap,
  Measure: Measure,
  MapSwitch: MapSwitch,
  FullScreen: FullScreen,
  ScaleBar: ScaleBar,
  Attribution: Attribution,
  Select: Select,
  SelectState: SelectState,
  ExtentNavigate: ExtentNavigate,
  OverviewMap
}

export default ToolModules
