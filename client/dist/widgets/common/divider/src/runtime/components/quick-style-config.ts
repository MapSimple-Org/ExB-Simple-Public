import { LineStyle, PointStyle, Direction, QuickStyleType } from '../../config'
import { getAllDefaultStrokeSize } from '../../utils/util'
export function getQuickStyleConfig () {
  const POINT_SIZE = 4
  const POINT_SIZE1 = 2
  const DIRECTION = Direction.Horizontal
  const allDefaultStrokeSize = getAllDefaultStrokeSize()

  return {
    Default: {
      direction: DIRECTION,
      template: 'Default',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Default
      }
    },
    Style1: {
      direction: DIRECTION,
      template: 'Style1',
      strokeStyle: {
        type: LineStyle.Style2,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style2]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style1
      }
    },
    Style2: {
      direction: DIRECTION,
      template: 'Style2',
      strokeStyle: {
        type: LineStyle.Style3,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style3]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style2
      }
    },
    Style3: {
      direction: DIRECTION,
      template: 'Style3',
      strokeStyle: {
        type: LineStyle.Style6,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style6]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style3
      }
    },
    Style4: {
      direction: DIRECTION,
      template: 'Style4',
      strokeStyle: {
        type: LineStyle.Style1,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style1]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style4
      }
    },
    Style5: {
      direction: DIRECTION,
      template: 'Style5',
      strokeStyle: {
        type: LineStyle.Style7,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style7]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style5
      }
    },
    Style6: {
      direction: DIRECTION,
      template: 'Style6',
      strokeStyle: {
        type: LineStyle.Style8,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style8]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style6
      }
    },
    Style7: {
      direction: DIRECTION,
      template: 'Style7',
      strokeStyle: {
        type: LineStyle.Style9,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style9]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style7
      }
    },
    Style18: {
      direction: DIRECTION,
      template: 'Style18',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point7,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style18
      }
    },
    Style19: {
      direction: DIRECTION,
      template: 'Style19',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point0,
        pointSize: POINT_SIZE1
      },
      pointEnd: {
        pointStyle: PointStyle.Point6,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style19
      }
    },
    Style8: {
      direction: DIRECTION,
      template: 'Style8',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point3,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point3,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style8
      }
    },
    Style9: {
      direction: DIRECTION,
      template: 'Style9',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point6,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point6,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style9
      }
    },
    Style10: {
      direction: DIRECTION,
      template: 'Style10',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point4,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point4,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style10
      }
    },
    Style11: {
      direction: DIRECTION,
      template: 'Style11',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point5,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point5,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style11
      }
    },
    Style12: {
      direction: DIRECTION,
      template: 'Style12',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point2,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point2,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style12
      }
    },
    Style13: {
      direction: DIRECTION,
      template: 'Style13',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point7,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point7,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style13
      }
    },
    Style14: {
      direction: DIRECTION,
      template: 'Style14',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point0,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point0,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style14
      }
    },
    Style15: {
      direction: DIRECTION,
      template: 'Style15',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point8,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point8,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style15
      }
    },
    Style16: {
      direction: DIRECTION,
      template: 'Style16',
      strokeStyle: {
        type: LineStyle.Style10,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style10]
      },
      pointStart: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.None,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style16
      }
    },
    Style17: {
      direction: DIRECTION,
      template: 'Style17',
      strokeStyle: {
        type: LineStyle.Style0,
        color: '',
        size: allDefaultStrokeSize[LineStyle.Style0]
      },
      pointStart: {
        pointStyle: PointStyle.Point1,
        pointSize: POINT_SIZE
      },
      pointEnd: {
        pointStyle: PointStyle.Point1,
        pointSize: POINT_SIZE
      },
      themeStyle: {
        quickStyleType: QuickStyleType.Style17
      }
    }
  }
}
