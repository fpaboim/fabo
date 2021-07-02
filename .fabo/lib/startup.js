import compileTemplates from './handlebars/buildSchemas.js'
import { readConfig } from './services/readConfig.js'
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
  let schemas = readConfig()

  console.log("Compiling Templates...️")
  const {mongooseSchemas, validationSchemas} = compileTemplates(schemas, clientBase, serverBase)

  console.log("Copying files...")
  copyProjectFiles(serverBase, clientBase)
  console.log("OK!")
}

export default startup
