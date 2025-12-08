// object for pass GraphicsInfo

// for reduce storage
export enum SymbolTypes {
  Default = 0, // to reduce storage
  Custom
}
export interface GraphicsInfoConfig {
  graphics: __esri.Graphic[] // without Symbol
  isPicked: boolean
}

export interface GraphicsInfoProps {
  graphics: __esri.Graphic[] // [0] is main graphic
  isPicked: boolean
  // pickedOriginalGraphic?: __esri.Graphic // reset raw Graphic highlight, when alt reset to 0
  // symbolType?: SymbolTypes.Default//9.2 support Default-type only
}

export default class GraphicsInfo {
  private graphics: __esri.Graphic[] // jsObj refs, [0] is main graphic
  isPicked: boolean
  symbolType: SymbolTypes

  constructor (graphicsInfoProps: GraphicsInfoProps) {
    this.update(graphicsInfoProps)
  }

  update (graphicsInfoProps: GraphicsInfoProps): this {
    const { graphics, isPicked } = graphicsInfoProps
    this.setGraphics(graphics)
    this.isPicked = isPicked
    this.symbolType = SymbolTypes.Default
    return this
  }

  setGraphics (graphics: __esri.Graphic[]): void {
    this.graphics = graphics
  }

  getGraphics (): __esri.Graphic[] {
    return this.graphics
  }

  getMainGraphic (): __esri.Graphic {
    if (this.graphics) {
      return this.graphics[0]
    } else {
      return null
    }
  }

  getConfig (): GraphicsInfoConfig {
    const graphicsInfoConfig = {
      graphics: null,
      isPicked: this.isPicked,
      symbolType: SymbolTypes.Default
    }
    graphicsInfoConfig.graphics = this.graphics?.map((g) => {
      const _graphic = g.clone()
      _graphic.symbol = null // g.delete('symbol')
      if (_graphic.toJSON) {
        return _graphic.toJSON()
      }

      return undefined
    })

    return graphicsInfoConfig
  }

  // Symbol
  // wall test ,#6159
  // getLineMaterials = (height?: number): __esri.LineSymbol3D => {
  //   return new this.LineSymbol3D({
  //     symbolLayers: [
  //       new this.LineSymbol3DLayer({
  //         material: { color: [245, 203, 66] },
  //         size: "3px",
  //       }),
  //       new this.PathSymbol3DLayer({
  //         profile: "quad",
  //         material: { color: [245, 203, 66, 0.2] },
  //         width: 0,
  //         height: height ?? 0,
  //         join: "miter",
  //         cap: "butt",
  //         anchor: "top",
  //         profileRotation: "heading",
  //       })
  //     ]
  //   })
  // }
  // updateWallSymbolByAlt (lineGraphic, alt): void {
  //   //update wall
  //   const symbol = lineGraphic.symbol as __esri.Symbol3D
  //   if (!symbol) {
  //     lineGraphic.symbol = this.getLineMaterials(alt);
  //   } else if (utils.isDefined(symbol?.symbolLayers) && utils.isDefined(symbol?.symbolLayers[1])) {
  //     symbol.symbolLayers[1].height = alt
  //   }
  // }
}
