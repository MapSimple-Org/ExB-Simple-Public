export {};

declare global {
  namespace __esri {
    interface Symbol {
      type: string
      size: number
      style: string
      color: number[]
      outline: any
    }
  }
}
