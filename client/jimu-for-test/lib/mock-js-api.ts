import { EsriFieldType, JSAPILayerTypes } from 'jimu-core'

export function mockJSAPIClass (properties = { }) {
  return jest.fn().mockImplementation(constructorOptions => ({ ...properties, ...constructorOptions }))
}

class MockAPIAccessor {
  constructor (options = {}) {
    Object.assign(this, options)
  }

  watch () { return null }
}

export class MockAPICollection<T> {
  arr: T[]

  constructor (arr: T[]) {
    this.arr = arr || []
  }

  get length () {
    return this.arr.length
  }

  getItemAt (i) {
    return this.arr[i]
  }

  toArray () {
    // Should return a new array object containing the Collection's items.
    return this.arr.slice()
  }

  concat (clt: MockAPICollection<T>) {
    return new MockAPICollection(this.arr.concat(clt.arr))
  }

  add (item, index) {
    this.arr.splice(index, 0, item)
  }
  //eslint-disable-next-line @typescript-eslint/no-empty-function
  on () {

  }
}

export class MockAPILayer extends MockAPIAccessor {
  id: string
  parent: MockAPILayer

  load () {
    return Promise.resolve()
  }
  //eslint-disable-next-line @typescript-eslint/no-empty-function
  on () { }
}

export const mockJSAPIField = (data) => ({ ...data, toJSON: () => data })

export class MockFeatureLayer extends MockAPILayer {
  type = JSAPILayerTypes.FeatureLayer
  declaredClass = 'esri.layers.FeatureLayer'
  fields = [mockJSAPIField({ type: EsriFieldType.OID, name: 'objectId' })]
  queryFeatures () {
    return Promise.resolve({ features: [], fields: [] })
  }

  queryFeatureCount () {
    return Promise.resolve(0)
  }
}

export class MockCommonMapServiceLayer extends MockAPILayer {
  sublayers: MockAPICollection<MockSubLayer>

  constructor (options = {}) {
    super(options)
    if (!this.sublayers) {
      this.sublayers = new MockAPICollection([])
    } else {
      this.sublayers.toArray().forEach(subLayer => {
        subLayer.layer = this
        subLayer.parent = this
      })
    }
  }

  get allSublayers () {
    return flat(this, 'sublayers')
  }

  loadAll () {
    return Promise.resolve()
  }
}

export class MockTileLayer extends MockCommonMapServiceLayer {
  type = JSAPILayerTypes.TileLayer
  declaredClass = 'esri.layers.TileLayer'
}

export class MockMapImageLayer extends MockCommonMapServiceLayer {
  type = JSAPILayerTypes.MapImageLayer
  declaredClass = 'esri.layers.MapImageLayer'
}

export class MockSubLayer extends MockAPIAccessor {
  layer: MockCommonMapServiceLayer
  parent: MockSubLayer | MockAPILayer
  declaredClass = 'esri.layers.support.Sublayer'
  fields = []
  sublayers: MockAPICollection<MockSubLayer>

  constructor (options = {}) {
    super(options)
    if (!this.sublayers) {
      this.sublayers = new MockAPICollection([])
    } else {
      this.sublayers.toArray().forEach(subLayer => {
        subLayer.parent = this
      })
    }
  }

  load () {
    return Promise.resolve()
  }
}

export class MockGroupLayer extends MockAPILayer {
  type = JSAPILayerTypes.GroupLayer
  layers: MockAPICollection<MockAPILayer>
  declaredClass = 'esri.layers.support.GroupLayer'

  constructor (options = {}) {
    super(options)
    if (!this.layers) {
      this.layers = new MockAPICollection([])
    } else {
      this.layers.toArray().forEach(layer => {
        layer.parent = this
      })
    }
  }

  get allLayers () {
    return flat(this, 'layers')
  }

  loadAll () {
    return Promise.resolve()
  }
}

interface MapGround {
  layers: MockAPICollection<MockAPILayer>
}

export class MockMap extends MockAPIAccessor {
  id: string
  layers: MockAPICollection<MockAPILayer>
  ground: MapGround

  constructor (options = {}) {
    super(options)
    if (!this.layers) {
      this.layers = new MockAPICollection([])
    }
    if (!this.ground) {
      this.ground = { layers: new MockAPICollection([]) }
    }
  }

  get allLayers () {
    return flat(this, 'layers')
  }

  add (layer, index) {
    this.layers.add(layer, index)
  }
}

export class MockWebMap extends MockMap {
  async when (callback?, errback?) {
    callback && await callback()
    return Promise.resolve()
  }
}

export class MockView extends MockAPIAccessor {
  map: MockMap
  popup: MockPopup

  constructor (options = {}) {
    super(options)
    if (!this.map) {
      this.map = new MockMap()
    }
    if (!this.popup) {
      this.popup = new MockPopup()
    }
  }

  openPopup (options: any) {
    this.popup.open(options)
  }

  closePopup () {
    this.popup.close()
  }

  whenLayerView (layer: MockAPILayer) {
    return Promise.resolve(new MockLayerView({ layer }))
  }

  async when (callback?, errback?) {
    callback && await callback()
    return Promise.resolve()
  }
  //eslint-disable-next-line @typescript-eslint/no-empty-function
  on () {}
  //eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy () {}
}

export class MockMapView extends MockView {
}

export class MockSceneView extends MockView {
}

export class MockLayerView extends MockAPIAccessor {
  layer: MockAPILayer
  when () {
    return Promise.resolve()
  }
}

export class MockFeatureLayerView extends MockLayerView {
}

export class MockPopup extends MockAPIAccessor {
  visible: boolean = false
  features: __esri.Feature[] = []
  selectedFeature: __esri.Feature

  close () {
    this.visible = false
    this.features = []
    this.selectedFeature = null
  }

  open (options: any) {
    this.visible = true
    this.features = options.features || []

    if (this.features.length > 0) {
      this.selectedFeature = this.features[0]
    } else {
      this.selectedFeature = null
    }
  }
}

export class MockFeature extends MockAPIAccessor {
  getObjectId (): number {
    return (this as any).id
  }
}

function flat (tree, subProp: string) {
  const all = []

  const visit = node => {
    all.push(node)
    if (node[subProp]) {
      node[subProp].toArray().forEach(sl => {
        visit(sl)
      })
    }
  }

  tree[subProp].toArray().forEach(node => {
    visit(node)
  })

  return new MockAPICollection(all)
}
