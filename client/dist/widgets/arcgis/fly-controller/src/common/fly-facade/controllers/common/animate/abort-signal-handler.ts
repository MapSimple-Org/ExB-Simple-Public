// use Signal to cancel controller's fly ,#6258

export default class AbortSignalHandler {
  signalHandler: AbortController// for goTo().signal

  constructor () {
    this.abort()
    this.update()
  }

  destructor () {
    if (this.signalHandler) {
      this.signalHandler.abort()
      this.signalHandler = null
    }
  }

  update () {
    // this.abort()
    this.signalHandler = null
    this.signalHandler = new AbortController()

    return this.signalHandler.signal
  }

  abort (): void {
    if (this.signalHandler?.signal) {
      this.signalHandler.abort()
    }
  }
}
