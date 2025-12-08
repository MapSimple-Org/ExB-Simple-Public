const { System } = require('systemjs/dist/system-node.cjs')
global.systemRegister = System.register
global.TextEncoder = require('util').TextEncoder
require('jest-fetch-mock').enableMocks()
