import yaml from 'js-yaml'
import fs   from 'fs'
import {
  getDirectories
} from './fileUtils.js'
import { defaultEntries } from '../handlebars/buildAPI.js'


export function readSchemas() {
  let schemas = {}
  try {
    const baseFolder = './models/';
    const dirs = getDirectories(baseFolder)
    for (let dir of dirs) {
      try {
        const schemafile = baseFolder+dir+'/schema.yaml'
        if (fs.existsSync(schemafile)) {
          const file = fs.readFileSync(schemafile, 'utf8')
          if (file) {
            const schema = yaml.load(file);
            schemas[dir] = schema
          }
        }
        // console.log('YAML:', schema);
      } catch(err) {
        console.log('**ERROR**: YAML read error:',err)
      }
    }
  } catch(err) {
    console.log('**ERROR**: Error reading config:', err)
  }

  return schemas
}

export function readAPIs() {
  let apis = {}
  try {
    const baseFolder = './models/';
    const dirs = getDirectories(baseFolder)
    for (let dir of dirs) {
      try {
        const apipath= baseFolder+dir+'/api.yaml'
        if (fs.existsSync(apipath)) {
          const schema = yaml.load(fs.readFileSync(apipath, 'utf8'));
          apis[dir] = schema
          // console.log('YAML:', schema);
        }
      } catch(err) {
        console.log('**ERROR**: API YAML read error:',err)
      }
      try {
        const apiMethods = baseFolder+dir+'/methods.js'
        if (fs.existsSync(apiMethods)) {
          if (!apis[dir])
            apis[dir] = {}
        }
      } catch(err) {
        console.log('**ERROR**: API YAML read error:',err)
      }
    }
  } catch(err) {
    console.log('**ERROR**: Error reading API config:', err)
  }

  return preProcessAPIs(apis)
}

function preProcessAPIs(apis) {
  for(let entry in apis) {
    for(let subentry in apis[entry]) {
      if (defaultEntries.includes(subentry.alias)) {
        apis[entry][subentry] = {
          ...apis[entry][subentry.alias],
          ...apis[entry][subentry]
        }
        console.log("PATCHED:", subentry)
      }
    }
  }

  return apis
}
