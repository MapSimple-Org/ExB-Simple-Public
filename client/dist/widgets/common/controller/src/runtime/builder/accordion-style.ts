const accordionStyle = {
  gap: 10,
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
        filename: 'expand.svg',
        size: 16,
        color: 'var(--sys-color-surface-overlay-text)',
        inlineSvg: true
      }
    },
    collapseIcon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M13.854 11.347a.486.486 0 0 1-.708 0L8 5.76l-5.146 5.587a.485.485 0 0 1-.708 0 .54.54 0 0 1 0-.738l5.5-5.956a.485.485 0 0 1 .708 0l5.5 5.956a.54.54 0 0 1 0 .738" clip-rule="evenodd"></path></svg>',
      properties: {
        filename: 'collapse.svg',
        size: 16,
        color: 'var(--sys-color-surface-overlay-text)',
        inlineSvg: true
      }
    },
    showWidgetIcon: false,
    widgetIconSize: 16,
    widgetIconColor: 'var(--sys-color-surface-overlay-text)',

    textStyle: {
      bold: true,
      color: 'var(--sys-color-surface-overlay-text)',
      size: '14px'
    },
    padding: {
      number: [0],
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
      number: [0],
      unit: 'px'
    },
    border: {
      color: 'var(--sys-color-primary-main)',
      type: 'solid',
      width: '0px'
    }
  },
  singleMode: false,
  showToggleAll: false,
  useQuickStyle: 3
}

export default accordionStyle
