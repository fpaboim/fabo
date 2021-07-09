import fs   from 'fs'
import Handlebars from 'handlebars'
import {
  getDirectories,
  createDirIfNone,
  copyFolder
} from '../services/fileUtils.js'


// utils
///////////////////////////////////////////////////////////////////////////////
const toMongooseType = (inputType) => {
  switch (inputType) {
    case 'Id':
      return 'mongoose.Schema.Types.ObjectId'
    case 'Mixed':
      return 'mongoose.Schema.Types.Mixed'
    case 'Decimal128':
      return 'mongoose.Schema.Types.Decimal128'
    default:
      return inputType
  }
}

const parseType = (value) => {
  if (typeof(value) == 'object') {
    return '['+toMongooseType(value[0])+']'
  } else if (typeof(value) == 'string') {
    return toMongooseType(value)
  }
}

const parseValidations = (value, validationTemplate=false) => {
  let res = ''

  for (let i=0; i<value.length; i++) {
    const validationEntries = value[i]
    let keys = Object.keys(validationEntries)

    for (let entry in validationEntries) {
      // console.log('ENTRY@:', entry)
      switch (entry) {
        case 'def':
          res += 'default: '+JSON.stringify(validationEntries['default'])
          break
        default:
          res += entry+': '+JSON.stringify(validationEntries[entry])
          break
      }

      if (entry != keys.slice(-1)[0]) {
        res += ',\n      '
      } else {
        // console.log(res)
      }
    }
    // console.log('res:', res)
    if (i != value.length-1) {
      res += '\n    }), validate({\n      '
    } else {
      if (validationTemplate) {
        res += '\n  })],'
      } else {
        res += '\n    })]'
      }
    }
  }

  return res
}

const isRequired = (keys, value) => {
  // console.log('keys:', keys, keys.includes('required'), value['required'])
  let hasRequired = (keys.includes('required'))
  if (hasRequired) {
    if (typeof(value['required'])=='object') {
      hasRequired = value['required'][0]
      if (typeof(hasRequired)=='boolean') {
        return true
      } else {
        return false
      }
    }

    if (typeof(value['required'])=='boolean') {
      // console.log("IS BOOL", value['required'])
      hasRequired = value['required']
    } else {
      hasRequired = false
    }
  }
  return hasRequired
}

// partials
///////////////////////////////////////////////////////////////////////////////
Handlebars.registerPartial('authPartial', `
{{#if (requiresLogin this)}}
if (!user) {
  return res.status(400).send({errors: {auth: {message: 'User must be logged in.'}}})
}
{{/if}}

{{#if (hasAuth this.auth)}}
if (!(
  {{#each this.auth}}
  {{#if @first}}
      user.roles.includes({{this.role}})
  {{else}}
  || user.roles.includes({{this.role}})
  {{/if}}
  {{/each}}
)) {
  return res.status(400).send({errors: {auth: {message: 'User not authorized.'}}})
}
{{/if}}`
)


// helpers
///////////////////////////////////////////////////////////////////////////////
Handlebars.registerHelper('getController', function (entry) {
  let res = ''

  console.log('entry:', entry)

  return res
});
Handlebars.registerHelper('makeController', function (controllers) {
  let res = ''

  let controllerDict = {}
  for (let controller of controllers) {
    if (!controllerDict[controller.name])
      controllerDict[controller.name] = []

    if (controller.default)
      controllerDict[controller.name].push('Api')
    else
      controllerDict[controller.name].push('Methods')
  }

  for (let key in controllerDict) {
    if (controllerDict[key].length > 1) {
      res += `const ${key}Controller = {...${key}Api, ...${key}Methods}\n`
    } else {
      res += `const ${key}Controller = ${key}${controllerDict[key]}\n`
    }
  }

  return res
});

Handlebars.registerHelper('requiresLogin', function (obj) {
  let res = ''

  if (obj.login) {
    if (obj.auth) {
      return true
    }
    return obj.login
  }

  if (obj.auth) {
    return true
  }

  return false
});

Handlebars.registerHelper('hasAuth', function (value) {
  let res = ''

  if (value && typeof(value) == 'object' && value.length > 0) {
    return true
  }
  return false
});

Handlebars.registerHelper('isEntry', function (value) {
  let keys = Object.keys(value)

  // console.log('reqr0:', isRequired(keys, value))
  return (keys.includes('validations') || isRequired(keys,value))
});

Handlebars.registerHelper('parseEntry', function (value) {
  let res = ''
  let keys = Object.keys(value)

  if (keys.length == 0) {
    return ''
  }

  for (let entry in value) {
    entry = entry.trim()
    if (entry === 'default')
      entry = 'def'

    switch (entry) {
      case 'type':
        res += entry+': '+parseType(value[entry])
        break
      case 'validations':
        res += 'validate: [validate({\n      '+parseValidations(value[entry])
        break
      case 'def':
        entry = 'default'
        if (typeof(value[entry])=='object') {
          res += entry+': '+JSON.stringify(value[entry])
        } else {
          res += entry+': '+value[entry]
        }
        break
      default:
        res += entry+': '+JSON.stringify(value[entry])
        break
    }

    if (entry != keys.slice(-1)[0]) {
      res += ',\n    '
    } else {
      // console.log('last')
    }
    // console.log('res:', res)
  }
  return res
});

const defaultEntries = ['count', 'delete', 'find', 'findone', 'create', 'updateone', 'updatemany']
const hasDefaultEntries = api => {
  let foundDefaultEntries = false
  for (let key of Object.keys(api)) {
    for (let entry of defaultEntries) {
      if (entry == key) {
        foundDefaultEntries = true
        break
      }
    }
  }
  return foundDefaultEntries
}
// exports
///////////////////////////////////////////////////////////////////////////////
export default function compileAPIs(apis, clientBase, serverBase) {
  try {
    let routerEntries = []
    let models = []
    let controllers = []
    for (let modelName in apis) {
      models.push({name: modelName})
      let api = apis[modelName]
      // console.log('modelName:', modelName)

      for (let key of Object.keys(api)) {
        let obj = {
          name: modelName,
          path: key,
          data: api[key]
        }
        if (obj.data.role) {
          if (obj.data.middlewares) {
            obj.data.middlewares.push('auth')
          } else {
            obj.data.middlewares = ['auth']
          }
        }
        routerEntries.push(obj)
      }

      const apiMethods = './models/'+modelName+'/methods.js'
      if (fs.existsSync(apiMethods)) {
        fs.copyFileSync(apiMethods,
                        serverBase+'.fabo/models/'+modelName+'/methods.js')
        controllers.push({
          name: modelName,
          default: false
        })
      }

      // console.log("NAME:", modelName, api)
      if (Object.keys(api).length > 0) {
        let file_loc = new URL('../templates/api.hbs', import.meta.url)
        const mongooseTemplate = fs.readFileSync(file_loc, 'utf8');
        createDirIfNone(serverBase+'.fabo/models/'+modelName)

        if (hasDefaultEntries(api)) {
          const buildMongoose = Handlebars.compile(mongooseTemplate, { noEscape: true });
          const mongooseOut = buildMongoose({name: modelName, apiEntries: api})
          fs.writeFileSync(serverBase+'.fabo/models/'+modelName+'/api.js', mongooseOut);
          controllers.push({
            name: modelName,
            default: true
          })
          // console.log("DEFAUL ENTRIES:", api)
        } else {
        }

        const apiHooks = './models/'+modelName+'/apiHooks.js'
        if (fs.existsSync(apiHooks))
          fs.copyFileSync(apiHooks,
                          serverBase+'.fabo/models/'+modelName+'/apiHooks.js')
      }
    }

    let file_loc = new URL('../templates/router.hbs', import.meta.url)
    const routerTemplate = fs.readFileSync(file_loc, 'utf8');
    const builtRouter = Handlebars.compile(routerTemplate, { noEscape: true });
    const mongooseOut = builtRouter({models, routerEntries, controllers})
    fs.writeFileSync(serverBase+'.fabo/router.js', mongooseOut);

  } catch(err) {
    console.log('**ERROR**: Template compilation error:',err)
  }
}
