import rimraf from 'rimraf'
import fs from 'fs'
import path from 'path'
import compileSchemas from './handlebars/buildSchemas.js'
import compileAPIs from './handlebars/buildAPI.js'
import compileAdmin from './handlebars/buildAdmin.js'
import registerGlobalHelpers from './handlebars/globalHelpers.js'
import { readSchemas, readAPIs } from './services/readConfig.js'
import {
  scaffoldProject,
  copyProjectFiles,
  copyFolder
} from './services/fileUtils.js'
import ncp from 'ncp';
import { promisify } from 'util';
import execa from 'execa';

const access = promisify(fs.access);
const copy = promisify(ncp);

const defaultOptions = {
  buildAdmin: true,
  serverDir: './server/',
  adminDir: './admin/',
  clientDir: './client/src/lib/'
}

function filterfunc(source) {
  if (source.includes('.git')
   || source.includes('.webpack')
   || source.includes('.svelte-kit')
   || source.includes('.fabo')
   || source.includes('.log')
   || source.includes('node_modules')) {
    return false
  }
  return true
}

async function copyAdminTemplate(templateDirectory, targetDirectory) {
  let res = await copy(templateDirectory, targetDirectory, {
    clobber: false,
    filter: filterfunc,
    dereference: true,
  });

  return res
}

const adminTemplateDir = path.resolve(
  new URL(import.meta.url).pathname, '../../../templates/admin'
);

export const compile = async (optionsIn) => {
  try {
    let options = {
      ...defaultOptions,
      optionsIn
    }
    console.log("Fabo is working... 🏋️")
    console.log("Scaffolding...")
    const serverBase = options.serverDir
    const clientBase = options.clientDir
    const adminBase  = options.adminDir


    rimraf.sync(serverBase+'.fabo/');
    rimraf.sync(clientBase+'.fabo/');
    rimraf.sync(adminBase);
    scaffoldProject(serverBase, clientBase)

    console.log("Reading Configs... ")
    registerGlobalHelpers()
    let schemas = readSchemas()
    let apis = readAPIs()

    console.log("Compiling Templates...️")
    compileSchemas(schemas, clientBase, serverBase)
    compileAPIs(apis, clientBase, serverBase)

    console.log("Copying files...")
    copyProjectFiles(serverBase, clientBase)

    if (options.buildAdmin) {
      console.log("Building admin...")
      if (!fs.existsSync(adminBase)) {
        console.log("Creating admin...")
        fs.mkdirSync(adminBase, { recursive: true });
        await copyAdminTemplate(adminTemplateDir, adminBase)
        copyFolder(clientBase+'.fabo/', adminBase+'src/lib/.fabo/')
        fs.renameSync(adminBase+'env.development', '.env.development');
        const result = await execa('pnpm', ['i'], {
          cwd: adminBase,
        });
      }
      compileAdmin(schemas, apis, adminBase)
    }
    console.log("Done compiling 🙌")
  } catch(e) {
    console.log("ERROR COMPILING:", e)
  }
}
