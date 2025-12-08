/** Mock SystemJS.import() */
export function mockSystemJs () {
  if (!window.SystemJS) {
    window.SystemJS = {
      import: mockImport,
      get: mockGet,
      resolve: mockResolve
    } as typeof System
  } else {
    window.SystemJS.import = mockImport
  }
}

const mockImport = (moduleName: string) => Promise.resolve(require(moduleName))
const mockGet = (moduleName: string) => require(moduleName)
const mockResolve = (moduleName: string) => moduleName
