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

// helpers
///////////////////////////////////////////////////////////////////////////////
Handlebars.registerHelper('buildAPI_getController', function (entry) {
  let res = ''

  console.log('entry:', entry)

  return res
});

Handlebars.registerHelper('buildAPI_makeController', function (controllers) {
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

Handlebars.registerHelper('buildAPI_requiresLogin', function (obj) {
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

Handlebars.registerHelper('buildAPI_hasVal', function (value) {
  let res = ''

  if (value && typeof(value) == 'object') {
    return true
  }
  return false
});

Handlebars.registerHelper('buildAPI_isEntry', function (value) {
  let keys = Object.keys(value)

  // console.log('reqr0:', isRequired(keys, value))
  return (keys.includes('validations') || isRequired(keys,value))
});


export const defaultEntries = ['count', 'delete', 'find', 'findone', 'create', 'updateone', 'updatemany']
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

Handlebars.registerHelper('buildAPI_isNumQuery', function(val, options) {
  const arr = ['skip', 'limit']
  if (!arr) {
    return options.inverse(this);
  }
  if (arr.includes(val)) {
    return options.fn(this)
  }
  options.inverse(this);
});

Handlebars.registerHelper('buildAPI_mergeSettings', function(settings, context) {
  const merged = {
    ...settings,
    ...context.query
  }

  return {
    query: merged,
  }
});

Handlebars.registerHelper('buildAPI_mergeBtoA', function(A, B) {
  const merged = {
    ...A,
    ...B
  }

  return {
    query: merged,
  }
});

Handlebars.registerHelper('buildAPI_useField', function(settings, defaultField, localField, options) {
  if (localField && localField !== false)
    return options.fn(this)
  if (settings && (Object.keys(settings).includes(defaultField) &&
      settings[defaultField] !== false))
    return options.fn(this)
  return ''
})

// partials
///////////////////////////////////////////////////////////////////////////////
Handlebars.registerPartial('buildAPI_authPartial', `
{{#if (buildAPI_requiresLogin this)}}
if (!user) {
  return res.status(400).send({errors: {auth: {message: 'User must be logged in.'}}})
}
{{/if}}
{{#ifCond (buildAPI_hasVal this.auth) '&&' (notEmptyArray this.auth)}}
// auth
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
{{/ifCond}}`
)



Handlebars.registerPartial('buildAPI_preQuery', `
{{#if settings.query}}
{{#each settings.query}}
{{#ifCond @key '==' 'filter'}}
{{#if this.allow}}
const allowedVals = allowQueryBase.concat({{json this.allow}})
for (let key in query) {
  if (!allowedVals.includes(key)) {
    return res.status(400).send({errors: {auth: {message: 'Unauthorized key:'+key}}})
  }
}
{{/if}}
{{#if this.deny}}
const deniedVals = {{json this.deny}}
for (let key in query) {
  if (deniedVals.includes(key)) {
    return res.status(400).send({errors: {auth: {message: 'Unauthorized key:'+key}}})
  }
}
{{/if}}
{{#if this.required}}
const requiredVals = {{json this.required}}
for (let key of requiredVals) {
  if (!Object.keys(query).includes(key)) {
    return res.status(400).send({errors: {auth: {message: 'Required key:'+key}}})
  }
}
{{/if}}
{{#if this.setFields}}
{{#each this.setFields}}
{{#each this}}
query["{{@key}}"] = {{this}}
{{/each}}
{{/each}}
{{/if}}
{{/ifCond}}
{{#buildAPI_isNumQuery @key}}
{{#if this.min}}
if (query['{{@key}}'] && query['{{@key}}'] < {{this.min}}) {
  return res.status(400).send({errors: {auth: {message: 'Query param:{{@key}} below minimum'}}})
}
{{/if}}
{{#if this.max}}
//max
if (query['{{@key}}'] && query['{{@key}}'] > {{this.max}}) {
  return res.status(400).send({errors: {auth: {message: 'Query param:{{@key}} above maximum'}}})
}
{{/if}}
{{#if this.default}}
if (!query['{{@key}}']) {
  query['{{@key}}'] = {{this.default}}
}
{{/if}}
{{/buildAPI_isNumQuery}}
{{#ifCond @key '==' 'sort'}}
{{#if this.default}}
if (!query['{{@key}}']) {
  query['{{@key}}'] = {{json this.default}}
}
{{/if}}
{{/ifCond}}
{{/each}}
{{/if}}`
)

Handlebars.registerPartial('buildAPI_postQuery', `
{{#if settings.query}}
{{#each settings.query}}
{{#ifCond @key '==' 'fields'}}
{{#if this.setFields}}
{{#each this.setFields}}
{{#each this}}
projection = {
  ...projection,
  {{@key}}: {{this}}
}
{{/each}}
{{/each}}
{{/if}}
{{/ifCond}}
{{/each}}
{{/if}}`
)

Handlebars.registerPartial('buildAPI_preAllow', `
{{#if (buildAPI_hasVal this.pre)}}
{{#each this.pre}}
{{#ifCond @key '==' 'allowFields'}}
const allowKeys = [
{{#each this}}
  "{{this}}",
{{/each}}
]
for (let key in bodyKeys) {
  if (!allowKeys.includes(key)) {
    delete body[key]
  }
}
{{/ifCond}}
{{/each}}
{{/if}}`
)

Handlebars.registerPartial('buildAPI_preDeny', `
{{#if (buildAPI_hasVal this.pre)}}
{{#each this.pre}}
{{#ifCond @key '==' 'denyFields'}}
const denyKeys = [
{{#each this}}
  "{{this}}",
{{/each}}
]
for (let key in bodyKeys) {
  if (denyKeys.includes(key)) {
    delete body[key]
  }
}
{{/ifCond}}
{{/each}}
{{/if}}`
)

Handlebars.registerPartial('buildAPI_preSet', `
{{#if (buildAPI_hasVal this.pre)}}
{{#each this.pre}}
{{#ifCond @key '==' 'setField'}}
body = {
  ...body,
{{#each this}}
  {{@key}}: {{this}},
{{/each}}
}
{{/ifCond}}
{{#ifCond @key '==' 'setFields'}}
body = {
  ...body,
{{#each this}}
{{#each this}}
  {{@key}}: {{this}},
{{/each}}
{{/each}}
}
{{/ifCond}}
{{/each}}
{{/if}}`
)


// exports
///////////////////////////////////////////////////////////////////////////////
export default function compileAPIs(apis, clientBase, serverBase) {
  try {
    let routerEntries = []
    let models = []
    let controllers = []
    for (let modelName in apis) {
      let api = {}
      let querysettings = {}
      if (apis[modelName]['endpoints']) {
        models.push({name: modelName})

        api = apis[modelName]['endpoints']
        if (apis[modelName]['endpoints']) {
          querysettings = apis[modelName]['query']
        }
      } else {
        continue
      }

      for (let key of Object.keys(api)) {
        let obj = {
          name: modelName,
          path: key,
          type: 'post',
          data: api[key]
        }
        if (obj.data.auth || obj.data.login) {
          if (obj.data.middlewares) {
            obj.data.middlewares = ['auth'].concat(obj.data.middlewares)
          } else {
            obj.data.middlewares = ['auth']
          }
        }

        if (key == 'find' || key == 'findone') {
          obj.type = 'get'
        }
        if (obj.data.alias && (obj.data.alias == 'find') || (obj.data.alias == 'findone')) {
          obj.type = 'get'
        }

        routerEntries.push(obj)
      }

      const apiMethods = './models/'+modelName+'/methods.js'
      if (fs.existsSync(apiMethods)) {
        createDirIfNone(serverBase+'.fabo/models/'+modelName)
        fs.copyFileSync(apiMethods,
                        serverBase+'.fabo/models/'+modelName+'/methods.js')
        controllers.push({
          name: modelName,
          default: false
        })
      }

      if (Object.keys(api).length > 0) {
        let file_loc = new URL('../templates/api.hbs', import.meta.url)
        const apiTemplate = fs.readFileSync(file_loc, 'utf8');
        createDirIfNone(serverBase+'.fabo/models/'+modelName)

        if (hasDefaultEntries(api)) {
          const compiledApiTpl = Handlebars.compile(apiTemplate, { noEscape: true });

          const mongooseOut = compiledApiTpl({name: modelName, apiEntries: api, querySettings: querysettings})
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
