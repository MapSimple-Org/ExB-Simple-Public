export const quickStyles = [
  {
    gap: 4,
    padding: {
      number: [0],
      unit: 'px'
    },
    header: {
      expandIcon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path d="M7.5 0a.5.5 0 0 0-.5.5V7H.5a.5.5 0 0 0 0 1H7v6.5a.5.5 0 0 0 1 0V8h6.5a.5.5 0 0 0 0-1H8V.5a.5.5 0 0 0-.5-.5"></path></svg>',
        properties: {
          size: 16,
          color: 'var(--sys-color-action-selected-text)',
          inlineSvg: true,
          isUploaded: false,
          originalName: 'outlined/editor/plus.svg',
          path: ['general', 'add']
        }
      },
      collapseIcon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path d="M0 7.5A.5.5 0 0 1 .5 7h14a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5"></path></svg>',
        properties: {
          size: 16,
          color: 'var(--sys-color-action-selected-text)',
          inlineSvg: true,
          isUploaded: false,
          originalName: 'outlined/editor/minus.svg',
          path: ['editor', 'MinusOutlined']
        }
      },
      showWidgetIcon: true,
      widgetIconSize: 16,
      widgetIconColor: 'var(--sys-color-action-selected-text)',

      textStyle: {
        bold: true,
        color: 'var(--sys-color-action-selected-text)',
        size: '14px'
      },
      padding: {
        number: [8],
        unit: 'px'
      },
      borderRadius: {
        number: [0],
        unit: 'px'
      },
      collapsedColor: 'var(--sys-color-action-selected)',
      expandedColor: 'var(--sys-color-action-selected-hover)'
    },
    panel: {
      borderRadius: {
        number: [0],
        unit: 'px'
      },
      padding: {
        number: [4],
        unit: 'px'
      },
      border: {
        color: 'var(--sys-color-action-selected)',
        type: 'solid',
        width: '1px'
      }
    },
    singleMode: false,
    showToggleAll: false,
    useQuickStyle: 1
  },
  {
    gap: 4,
    padding: {
      number: [0],
      unit: 'px'
    },
    header: {
      expandIcon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2.146 4.653a.485.485 0 0 1 .708 0L8 10.24l5.146-5.587a.485.485 0 0 1 .708 0 .54.54 0 0 1 0 .738l-5.5 5.956a.485.485 0 0 1-.708 0l-5.5-5.956a.54.54 0 0 1 0-.738" clip-rule="evenodd"></path></svg>',
        properties: {
          size: 16,
          color: 'var(--sys-color-action-selected-text)',
          inlineSvg: true,
          isUploaded: false,
          originalName: 'outlined/directional/down.svg',
          path: ['arrows', 'arrowDown']
        }
      },
      collapseIcon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M13.854 11.347a.486.486 0 0 1-.708 0L8 5.76l-5.146 5.587a.485.485 0 0 1-.708 0 .54.54 0 0 1 0-.738l5.5-5.956a.485.485 0 0 1 .708 0l5.5 5.956a.54.54 0 0 1 0 .738" clip-rule="evenodd"></path></svg>',
        properties: {
          size: 16,
          color: 'var(--sys-color-action-selected-text)',
          inlineSvg: true,
          isUploaded: false,
          originalName: 'outlined/directional/up.svg',
          path: ['arrows', 'arrowUp']
        }
      },
      showWidgetIcon: false,
      widgetIconSize: 16,
      widgetIconColor: 'var(--sys-color-action-selected-text)',

      textStyle: {
        bold: true,
        color: 'var(--sys-color-action-selected-text)',
        size: '14px'
      },
      padding: {
        number: [8],
        unit: 'px'
      },
      borderRadius: {
        number: [45],
        unit: 'px'
      },
      collapsedColor: 'var(--sys-color-action-selected)',
      expandedColor: 'var(--sys-color-action-selected-hover)'
    },
    panel: {
      borderRadius: {
        number: [8],
        unit: 'px'
      },
      padding: {
        number: [12],
        unit: 'px'
      }
    },
    singleMode: false,
    showToggleAll: false,
    useQuickStyle: 2
  },
  {
    gap: 0,
    padding: {
      number: [0],
      unit: 'px'
    },
    header: {
      borderTop: {
        type: 'solid',
        color: 'var(--sys-color-primary-main)',
        width: '2px'
      },
      expandIcon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2.146 4.653a.485.485 0 0 1 .708 0L8 10.24l5.146-5.587a.485.485 0 0 1 .708 0 .54.54 0 0 1 0 .738l-5.5 5.956a.485.485 0 0 1-.708 0l-5.5-5.956a.54.54 0 0 1 0-.738" clip-rule="evenodd"></path></svg>',
        properties: {
          size: 16,
          color: 'var(--sys-color-surface-paper-text)',
          inlineSvg: true,
          isUploaded: false,
          originalName: 'outlined/directional/down.svg',
          path: ['arrows', 'arrowDown']
        }
      },
      collapseIcon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M13.854 11.347a.486.486 0 0 1-.708 0L8 5.76l-5.146 5.587a.485.485 0 0 1-.708 0 .54.54 0 0 1 0-.738l5.5-5.956a.485.485 0 0 1 .708 0l5.5 5.956a.54.54 0 0 1 0 .738" clip-rule="evenodd"></path></svg>',
        properties: {
          size: 16,
          color: 'var(--sys-color-surface-paper-text)',
          inlineSvg: true,
          isUploaded: false,
          originalName: 'outlined/directional/up.svg',
          path: ['arrows', 'arrowUp']
        }
      },
      showWidgetIcon: false,
      widgetIconSize: 16,
      widgetIconColor: 'var(--sys-color-surface-paper-text)',

      textStyle: {
        bold: true,
        color: 'var(--sys-color-surface-paper-text)',
        size: '14px'
      },
      padding: {
        number: [4],
        unit: 'px'
      },
      borderRadius: {
        number: [0],
        unit: 'px'
      },
      collapsedColor: 'rgba(0,0,0,0)',
      expandedColor: 'rgba(0,0,0,0)'
    },
    panel: {
      backgroundColor: 'rgba(0,0,0,0)',
      borderRadius: {
        number: [0],
        unit: 'px'
      },
      padding: {
        number: [10],
        unit: 'px'
      },
      border: {
        color: 'var(--sys-color-action-selected)',
        type: 'solid',
        width: '0px'
      }
    },
    singleMode: false,
    showToggleAll: false,
    useQuickStyle: 3
  },
  {
    gap: 4,
    padding: {
      number: [0],
      unit: 'px'
    },
    header: {
      expandIcon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path d="m4 2 8 6-8 6z"></path></svg>',
        properties: {
          size: 12,
          color: 'var(--sys-color-action-selected-text)',
          inlineSvg: true,
          isUploaded: false,
          originalName: 'filled/directional/right.svg',
          path: ['directional', 'RightFilled']
        }
      },
      collapseIcon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path d="m14 4-6 8-6-8z"></path></svg>',
        properties: {
          size: 12,
          color: 'var(--sys-color-action-selected-text)',
          inlineSvg: true,
          isUploaded: false,
          originalName: 'filled/directional/down.svg',
          path: ['directional', 'DownFilled']
        }
      },
      showWidgetIcon: false,
      widgetIconSize: 16,
      widgetIconColor: 'var(--sys-color-action-selected-text)',
      togglePosition: 'left',

      textStyle: {
        bold: true,
        color: 'var(--sys-color-action-selected-text)',
        size: '14px'
      },
      padding: {
        number: [8, 8, 8, 4],
        unit: 'px'
      },
      borderRadius: {
        number: [0],
        unit: 'px'
      },
      collapsedColor: 'var(--sys-color-action-selected)',
      expandedColor: 'var(--sys-color-action-selected-hover)'
    },
    panel: {
      borderRadius: {
        number: [0],
        unit: 'px'
      },
      padding: {
        number: [8],
        unit: 'px'
      },
      border: {
        color: 'var(--sys-color-action-selected)',
        type: 'solid',
        width: '1px'
      }
    },
    singleMode: false,
    showToggleAll: false,
    useQuickStyle: 4
  }
]
