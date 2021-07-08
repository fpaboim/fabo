import compileSchemas from './handlebars/buildSchemas.js'
import compileAPIs from './handlebars/buildAPI.js'
import { readSchemas, readAPIs } from './services/readConfig.js'
import {
  scaffoldProject,
  copyProjectFiles
} from './services/fileUtils.js'

const startup = () => {
  console.log("Fabo is working... 🏋️")
  console.log("Scaffolding...")
  const serverBase = './server/'
  const clientBase = './client/src/lib/'
  scaffoldProject(serverBase, clientBase)

  console.log("Reading Configs... ")
  let schemas = readSchemas()
  let apis = readAPIs()

  console.log("Compiling Templates...️")
  compileSchemas(schemas, clientBase, serverBase)
  compileAPIs(apis, clientBase, serverBase)

  console.log("Copying files...")
  copyProjectFiles(serverBase, clientBase)
  console.log("OK!")
}

export default startup
