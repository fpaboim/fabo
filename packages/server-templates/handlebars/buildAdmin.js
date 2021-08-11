import fs   from 'fs'
import Handlebars from 'handlebars'
import path from "path"

import {
  getDirectories,
  createDirIfNone,
  copyFolder
} from '../services/fileUtils.js'


// utils
///////////////////////////////////////////////////////////////////////////////


// helpers
///////////////////////////////////////////////////////////////////////////////
Handlebars.registerHelper('toLowerCase', function (value) {
  let lower = value.toLowerCase()
  return lower
})


// exports
///////////////////////////////////////////////////////////////////////////////
export default function compileAdmin(schemas, apis, adminBase) {
  try {
    let file_loc = new URL('../templates/admin/sidebar.hbs', import.meta.url)
    const sidebarTemplate = fs.readFileSync(file_loc, 'utf8');
    const builtSidebar = Handlebars.compile(sidebarTemplate, { noEscape: true });
    const sideBarSvelte = builtSidebar({schemas, apis})
    createDirIfNone(adminBase+'/src/routes/models/')
    for (let modelName in schemas) {
      file_loc = new URL('../templates/admin/model.hbs', import.meta.url)
      const modelTemplate = fs.readFileSync(file_loc, 'utf8');
      const buildModel = Handlebars.compile(modelTemplate, { noEscape: true });
      const modelSvelte = buildModel({model: modelName, schema: schemas[modelName], api: apis[modelName]})
      fs.writeFileSync(adminBase+'/src/routes/models/'+modelName+'.svelte', modelSvelte);
    }
    fs.writeFileSync(adminBase+'/src/lib/components/Sidebar.svelte', sideBarSvelte);
  } catch(err) {
    console.log('**ERROR**: Template compilation error:',err)
  }

  return
}
