/* BA Debounce class

   How to use the debouncer:

    import Debounce from '../debounce'

    // event handler function
    const onClickHandler = () => {
        console.log('CLICKED ', count++)
    }
    // create the debouncer instance
    const debouncer = new Debounce()
    // create the delayed click function stand-in using debounce
    const delayedClick = debouncer.debounce(onClickHandler, 2000)

    const button = document.getElementById('myButton')
    if (button){
      button.addEventListener('click', delayedClick)
    }

    Note: the debounce instance has a 'cancel' function that stops any
    pending calls from happening.
 */
export default class Debounce {
  //
  private timeoutId: number
  private readonly owner: any

  constructor (context: any) {
    this.owner = context
  }

  public cancel = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  public debounce<F extends Function>(func: F, wait?: number): F {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this

    if (!wait) { wait = 1000 }
    return <any> function (context: any, ...args: any[]) {
      clearTimeout(self.timeoutId)
      //   const ctx = context

      self.timeoutId = window.setTimeout(function () {
        func.apply(self.owner, args)
      }, wait)
    }
  }
}
