import { Immutable } from 'jimu-core'
import { versionManager } from '../src/version-manager'
import {
  type ItemsType, FlyItemMode, DefaultSpeedOptions,
  type RotateItemConfig, type PathItemConfig, type RouteItemConfig,
  RotateTargetMode
} from '../src/config'

describe('test 1.5.0', () => {
  const TARGET_VER = '1.5.0'
  const WIDGET_ID = 'widget0'

  it('ver. Dec 2019', async () => {
    const oldConfig = Immutable({
      useMapWidgetIds: [],
      itemsList: [{
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW'
      }, {
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED'
      }],
      layout: 'HORIZONTAL'
    })
    await versionManager.upgrade(oldConfig, '1.0.0', TARGET_VER, WIDGET_ID).then((newConfig) => {
      const itemsList: ItemsType[] = newConfig.itemsList

      // 1.FlyItemMode.Rotate
      expect(itemsList[0].uuid).toBe('0')
      // 2.FlyItemMode.Path
      expect(itemsList[1].uuid).toBe('1')
      // 3.FlyItemMode.Route
      const routeItem = itemsList[2] as RouteItemConfig
      expect(routeItem.uuid).toBe('2')
      expect(routeItem.name).toBe(FlyItemMode.Route)
      expect(routeItem.isInUse).toBe(false)
      expect(routeItem.routes).toStrictEqual([])
    })
  })

  it('ver. 15 Apr 2020', async () => {
    const oldConfig = Immutable({
      useMapWidgetIds: [],
      itemsList: [{
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW'
      }, {
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED'
      }, {
        name: 'RECORD',
        isInUse: true,
        records: []
      }
      ],
      layout: 'HORIZONTAL'
    })

    await versionManager.upgrade(oldConfig, '1.2.0', TARGET_VER, WIDGET_ID).then((newConfig) => {
      const itemsList: ItemsType[] = newConfig.itemsList

      // 1.FlyItemMode.Rotate
      expect(itemsList[0].uuid).toBe('0')
      // 2.FlyItemMode.Path
      expect(itemsList[1].uuid).toBe('1')
      // 3.FlyItemMode.Route
      const routeItem = itemsList[2] as RouteItemConfig
      expect(routeItem.uuid).toBe('2')
      expect(routeItem.name).toBe(FlyItemMode.Route)
      expect(routeItem.isInUse).toBe(false)
      expect(routeItem.routes).toStrictEqual([])
    })
  })

  it('ver. 9 May 2020', async () => {
    const oldConfig = Immutable({
      useMapWidgetIds: [],
      itemsList: [{
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW'
      }, {
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED'
      }, {
        name: 'RECORD',
        isInUse: false,
        records: []
      }],
      layout: 'HORIZONTAL'
    })

    await versionManager.upgrade(oldConfig, '1.2.0', TARGET_VER, WIDGET_ID).then((newConfig) => {
      const itemsList: ItemsType[] = newConfig.itemsList

      // 1.FlyItemMode.Rotate
      expect(itemsList[0].uuid).toBe('0')
      // 2.FlyItemMode.Path
      expect(itemsList[1].uuid).toBe('1')
      // 3.FlyItemMode.Route
      const routeItem = itemsList[2] as RouteItemConfig
      expect(routeItem.uuid).toBe('2')
      expect(routeItem.name).toBe(FlyItemMode.Route)
      expect(routeItem.isInUse).toBe(false)
      expect(routeItem.routes).toStrictEqual([])
    })
  })

  it('ver. 27 Sep 2020', async () => {
    const oldConfig = Immutable({
      useMapWidgetIds: [],
      itemsList: [{
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW'
      }, {
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED'
      }, {
        name: 'RECORD',
        isInUse: false,
        routes: []
      }],
      layout: 'HORIZONTAL'
    })

    await versionManager.upgrade(oldConfig, '1.2.0', TARGET_VER, WIDGET_ID).then((newConfig) => {
      const itemsList: ItemsType[] = newConfig.itemsList

      // 1.FlyItemMode.Rotate
      expect(itemsList[0].uuid).toBe('0')
      // 2.FlyItemMode.Path
      expect(itemsList[1].uuid).toBe('1')
      // 3.FlyItemMode.Route
      const routeItem = itemsList[2] as RouteItemConfig
      expect(routeItem.uuid).toBe('2')
      expect(routeItem.name).toBe(FlyItemMode.Route)
      expect(routeItem.isInUse).toBe(false)
      expect(routeItem.routes).toStrictEqual([])
    })
  })

  it('ver. 10 Oct 2020 ', async () => {
    const oldConfig = Immutable({
      useMapWidgetIds: [],
      itemsList: [{
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW'
      }, {
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED'
      }, {
        name: 'RECORD',
        isInUse: true,
        routes: []
      }],
      layout: 'HORIZONTAL'
    })

    await versionManager.upgrade(oldConfig, '1.2.0', TARGET_VER, WIDGET_ID).then((newConfig) => {
      const itemsList: ItemsType[] = newConfig.itemsList

      // 1.FlyItemMode.Rotate
      expect(itemsList[0].uuid).toBe('0')
      // 2.FlyItemMode.Path
      expect(itemsList[1].uuid).toBe('1')
      // 3.FlyItemMode.Route
      const routeItem = itemsList[2] as RouteItemConfig
      expect(routeItem.uuid).toBe('2')
      expect(routeItem.name).toBe(FlyItemMode.Route)
      expect(routeItem.isInUse).toBe(false)
      expect(routeItem.routes).toStrictEqual([])
    })
  })

  it('ver. 20 Oct 2020 ', async () => {
    const oldConfig = Immutable({
      useMapWidgetIds: [],
      itemsList: [{
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW'
      }, {
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED'
      }, {
        name: 'ROUTE',
        isInUse: true,
        routes: []
      }],
      layout: 'HORIZONTAL'
    })

    await versionManager.upgrade(oldConfig, '1.2.0', TARGET_VER, WIDGET_ID).then((newConfig) => {
      const itemsList: ItemsType[] = newConfig.itemsList

      // 1.FlyItemMode.Rotate
      expect(itemsList[0].uuid).toBe('0')
      // 2.FlyItemMode.Path
      expect(itemsList[1].uuid).toBe('1')
      // 3.FlyItemMode.Route
      const routeItem = itemsList[2] as RouteItemConfig
      expect(routeItem.uuid).toBe('2')
      expect(routeItem.name).toBe(FlyItemMode.Route)
      expect(routeItem.isInUse).toBe(false)
      expect(routeItem.routes).toStrictEqual([])
    })
  })

  it('ver 1.12.0, support default speed in setting ,#9630', async () => {
    const oldConfig = Immutable({
      useMapWidgetIds: [],
      itemsList: [{
        uuid: '0',
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW'
        //defaultSpeed: "default"
      }, {
        uuid: '1',
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED'
        //defaultSpeed: "default"
      }, {
        uuid: '2',
        name: 'ROUTE',
        isInUse: false,
        routes: []
      }
      ],
      layout: 'HORIZONTAL'
    })

    await versionManager.upgrade(oldConfig, '1.11.0', '1.12.0', WIDGET_ID).then((newConfig) => {
      const itemsList: ItemsType[] = newConfig.itemsList

      // 1.FlyItemMode.Rotate
      const rotateItem = itemsList[0] as RotateItemConfig
      expect(rotateItem.defaultSpeed).toStrictEqual(DefaultSpeedOptions.DEFAULT)

      // 2.FlyItemMode.Path
      const pathItem = itemsList[1] as PathItemConfig
      expect(pathItem.defaultSpeed).toBe(DefaultSpeedOptions.DEFAULT)

      // 3.FlyItemMode.Route
      const routeItem = itemsList[2] as RouteItemConfig
      expect((routeItem as any).defaultSpeed).toBe(undefined)
    })
  })

  it('ver 1.13.0, support Fly around map center ,#14462', async () => {
    const oldConfig = Immutable({
      useMapWidgetIds: [],
      itemsList: [{
        uuid: '0',
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW',
        defaultSpeed: DefaultSpeedOptions.DEFAULT
        // AroundMapCenter
        // targetMode: "POINT",
        // rotationPauseTime: "2.0"
      }, {
        uuid: '1',
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED',
        defaultSpeed: DefaultSpeedOptions.DEFAULT
      }, {
        uuid: '2',
        name: 'ROUTE',
        isInUse: false,
        routes: []
      }],
      layout: 'HORIZONTAL'
    })

    await versionManager.upgrade(oldConfig, '1.12.0', '1.13.0', WIDGET_ID).then((newConfig) => {
      const itemsList: ItemsType[] = newConfig.itemsList

      // 1.FlyItemMode.Rotate
      const rotateItem = itemsList[0] as RotateItemConfig
      expect(rotateItem.targetMode).toStrictEqual(RotateTargetMode.Point) // targetMode: "POINT",
      expect(rotateItem.rotationPauseTime).toStrictEqual('2.0') // rotationPauseTime: "2.0"

      // 2.FlyItemMode.Path
      const pathItem = itemsList[1] as PathItemConfig
      expect((pathItem as any).targetMode).toBe(undefined)

      // 3.FlyItemMode.Route
      const routeItem = itemsList[2] as RouteItemConfig
      expect((routeItem as any).targetMode).toBe(undefined)
    })
  })

  it('ver 1.15.0, remove default useMapWidgetIds[] for auto-select map ,#19299', async () => {
    // 1. should remove
    const oldConfig = Immutable({
      useMapWidgetIds: [],
      itemsList: [{
        uuid: '0',
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW',
        defaultSpeed: DefaultSpeedOptions.DEFAULT
      }, {
        uuid: '1',
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED',
        defaultSpeed: DefaultSpeedOptions.DEFAULT
      }, {
        uuid: '2',
        name: 'ROUTE',
        isInUse: false,
        routes: []
      }],
      layout: 'HORIZONTAL'
    })

    await versionManager.upgrade(oldConfig, '1.14.0', '1.15.0', WIDGET_ID).then((newConfig) => {
      const useMapWidgetIds = newConfig.useMapWidgetIds
      expect(useMapWidgetIds).toBe(undefined)

      const itemsList: ItemsType[] = newConfig.itemsList
      const rotateItem = itemsList[0] as RotateItemConfig
      expect(rotateItem.defaultSpeed).toStrictEqual(DefaultSpeedOptions.DEFAULT)
    })

    // 2. should NOT remove
    const TEST_WIDGET_ID = 'widget_29'
    const oldConfig2 = Immutable({
      useMapWidgetIds: [TEST_WIDGET_ID], // meaningful value
      itemsList: [{
        uuid: '0',
        name: 'ROTATE',
        isInUse: true,
        direction: 'CCW',
        defaultSpeed: DefaultSpeedOptions.DEFAULT
      }, {
        uuid: '1',
        name: 'PATH',
        isInUse: true,
        direction: 'FORWARD',
        style: 'CURVED',
        defaultSpeed: DefaultSpeedOptions.DEFAULT
      }, {
        uuid: '2',
        name: 'ROUTE',
        isInUse: false,
        routes: []
      }],
      layout: 'HORIZONTAL'
    })

    await versionManager.upgrade(oldConfig2, '1.14.0', '1.15.0', WIDGET_ID).then((newConfig) => {
      const useMapWidgetIds = newConfig.useMapWidgetIds
      expect(useMapWidgetIds).toEqual([TEST_WIDGET_ID])

      const itemsList: ItemsType[] = newConfig.itemsList
      const rotateItem = itemsList[0] as RotateItemConfig
      expect(rotateItem.defaultSpeed).toStrictEqual(DefaultSpeedOptions.DEFAULT)
    })
  })
})
