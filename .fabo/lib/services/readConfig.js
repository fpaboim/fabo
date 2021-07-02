import yaml from 'js-yaml'
import fs   from 'fs'
import {
  getDirectories
} from './fileUtils.js'


export function readConfig() {
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

  return schemas
}