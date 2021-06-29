import Handlebars from 'handlebars'
import yaml from 'js-yaml'
import fs   from 'fs'
import path   from 'path'
import buildSchemas from './handlebars/buildSchemas.js'
import {
  getDirectories,
  createDirIfNone,
  copyFolder
} from './services/fileUtils.js'

const startup = () => {
  console.log("Scaffolding...")
  const serverBase = './server/'
  const clientBase = './client/src/lib/'

  try {
    createDirIfNone(serverBase+'.semstack/')
    createDirIfNone(clientBase+'.semstack/')
    createDirIfNone(serverBase+'.semstack/models/')
    createDirIfNone(clientBase+'.semstack/models/')
  } catch(err) {
    console.log("ERR:", err)
  }

  console.log("Reading Configs... ")
  let schemas = {}
  try {
    const baseFolder = './models/';
    const dirs = getDirectories(baseFolder)
    for (let dir of dirs) {
      try {
        const schema = yaml.load(fs.readFileSync(baseFolder+dir+'/schema.yaml', 'utf8'));
        schemas[dir] = schema
        // console.log('YAML:', schema);
      } catch(err) {
        console.log('**ERROR**: YAML read error:',err)
      }
    }
  } catch(err) {
    console.log('**ERROR**: Error reading config:', err)
  }

  console.log("Compiling Templates... 🏋️")
  const {mongooseSchemas, validationSchemas} = buildSchemas(schemas, clientBase, serverBase)

  copyFolder('./shared', serverBase+'.semstack/shared')
  copyFolder('./shared', clientBase+'.semstack/shared')
}

export default startup
