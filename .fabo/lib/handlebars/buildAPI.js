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
Handlebars.registerHelper('makeController', function (value) {
  let res = ''
  console.log('val:', value)
  res += ''

  return res
});

Handlebars.registerHelper('hasAuth', function (value) {
  let res = ''

  if (value != 'C.ROLES.USER') {
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

const defaultEntries = ['count', 'delete', 'find', 'findone', 'create', 'update']
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
      console.log('modelName:', modelName)

      const apiMethods = './models/'+modelName+'/methods.js'
      if (fs.existsSync(apiMethods)) {
        fs.copyFileSync(apiMethods,
                        serverBase+'.fabo/models/'+modelName+'/methods.js')
        controllers.push({
          name: modelName,
          default: false
        })
      }

      if (Object.keys(api).length > 0) {
        const mongooseTemplate = fs.readFileSync('./.fabo/lib/templates/api.hbs', 'utf8');
        createDirIfNone(serverBase+'.fabo/models/'+modelName)

        if (hasDefaultEntries(api)) {
          const buildMongoose = Handlebars.compile(mongooseTemplate, { noEscape: true });
          const mongooseOut = buildMongoose({name: modelName, apiEntries: api})
          fs.writeFileSync(serverBase+'.fabo/models/'+modelName+'/api.js', mongooseOut);
          controllers.push({
            name: modelName,
            default: true
          })
        }

        const apiHooks = './models/'+modelName+'/apiHooks.js'
        if (fs.existsSync(apiHooks))
          fs.copyFileSync(apiHooks,
                          serverBase+'.fabo/models/'+modelName+'/apiHooks.js')
      }
    }

    const routerTemplate = fs.readFileSync('./.fabo/lib/templates/router.hbs', 'utf8');
    const builtRouter = Handlebars.compile(routerTemplate, { noEscape: true });
    const mongooseOut = builtRouter({models, routerEntries, controllers})
    fs.writeFileSync(serverBase+'.fabo/router.js', mongooseOut);

  } catch(err) {
    console.log('**ERROR**: Template compilation error:',err)
  }
}
