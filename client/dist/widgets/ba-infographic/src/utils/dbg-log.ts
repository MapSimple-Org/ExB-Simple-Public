class DbgLog {
  fixForLint: string

  constructor () {
    this.fixForLint = ''
  }

  // Default is to not show any console statements.  Set to 'true' to enable
  public static showDebugConsoleLogs: boolean = false

  public static log (title: string, ...list: any) {
    if (DbgLog.showDebugConsoleLogs) {
      console.log('=======>' + title + ': ')
      if (list && list.length) {
        for (let ii = 0; ii < list.length; ii++) {
          console.log('...', list[ii])
        }
      }
    }
  }

  public static logc (str: string, ...list: any) {
    if (DbgLog.showDebugConsoleLogs) {
      console.log('%c' + str, 'color:yellow')
      if (list && list.length) {
        for (let ii = 0; ii < list.length; ii++) {
          console.log('...', list[ii])
        }
      }
    }
  }
}

export default DbgLog
