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
Handlebars.registerHelper('buildSchemas_parseValidationEntry', function (value) {
  let res = ''
  let keys = Object.keys(value)

  if (isRequired(keys,value)) {
    if (!value['validations']) {
      value['validations'] = []
    }

    if (value['validations'] && typeof(value['validations']=='object')) {
      if (typeof(value['required'])=='object') {
        const msg = value['required'][1]
        value['validations'].push({
          validator: 'required',
          message: msg
        })
      } else {
        value['validations'].push({
          validator: 'required'
        })
      }
    }
  }
  keys = Object.keys(value)

  if (!keys.includes('validations')) {
    return ''
  }

  if (keys.length == 0) {
    return ''
  }

  for (let entry in value) {
    // console.log('ent:', entry)
    entry = entry.trim()
    if (entry === 'default')
      entry = 'def'

    switch (entry) {
      case 'validations':
        res += 'validate({\n      '+parseValidations(value[entry], true)
        break
      default:
        continue
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

Handlebars.registerHelper('buildSchemas_hasValidationEntries', function (value) {
  let keys = Object.keys(value)

  // console.log('reqr0:', isRequired(keys, value))
  return (keys.includes('validations') || isRequired(keys,value))
});

Handlebars.registerHelper('buildSchemas_parseEntry', function (value) {
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
      case 'ref':
        res += entry+': '+JSON.stringify(value[entry])
        break
      case 'required':
        res += entry+': '+JSON.stringify(value[entry])
        break
      case 'def':
        entry = 'default'
        if (typeof(value[entry]) == 'object' && value[entry].length == 0) {
          res += entry+': '+JSON.stringify(value[entry])
        } else {
          res += entry+': '+value[entry]
        }
        break
      default:
        if (typeof(value[entry]) == 'object' && value[entry].length == 0) {
          res += entry+': '+JSON.stringify(value[entry])
        } else {
          res += entry+': '+value[entry]
        }
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

// exports
///////////////////////////////////////////////////////////////////////////////
export default function compileSchemas(schemas, clientBase, serverBase) {
  let mongooseSchemas = {}
  let validationSchemas = {}

  try {
    for (let modelName in schemas) {
      let schema = schemas[modelName]
      let schemaEntries = []
      for (let key in schema) {
        schemaEntries.push({name: key, data: schema[key]})
      }
      if (schemaEntries.length == 0) {
        // console.log('no entries for:', modelName)
        continue
      }

      let file_loc = new URL('../templates/schema.hbs', import.meta.url)
      const mongooseTemplate = fs.readFileSync(file_loc, 'utf8');

      file_loc = new URL('../templates/validation.hbs', import.meta.url)
      const validationTemplate = fs.readFileSync(file_loc, 'utf8');

      file_loc = new URL('../templates/model.hbs', import.meta.url)
      const modelTemplate = fs.readFileSync(file_loc, 'utf8');

      createDirIfNone(serverBase+'.fabo/models/'+modelName)
      createDirIfNone(clientBase+'.fabo/models/'+modelName)

      const buildMongoose = Handlebars.compile(mongooseTemplate, { noEscape: true });
      const mongooseOut = buildMongoose({name: modelName, schemaEntries})
      fs.writeFileSync(serverBase+'.fabo/models/'+modelName+'/schema.js', mongooseOut);

      const schemaHooksIn = './models/'+modelName+'/schemaHooks.js'
      const hasHooks = fs.existsSync(schemaHooksIn)
      if (hasHooks)
        fs.copyFileSync(schemaHooksIn,
                        serverBase+'.fabo/models/'+modelName+'/schemaHooks.js')

      const buildModel = Handlebars.compile(modelTemplate, { noEscape: true });
      const modelInput = {name: modelName, hasHooks, schemaEntries}
      const modelOut = buildModel(modelInput)
      fs.writeFileSync(serverBase+'.fabo/models/'+modelName+'/index.js', modelOut);

      const buildValidation = Handlebars.compile(validationTemplate, { noEscape: true });
      const validationOut = buildValidation({name: modelName, schemaEntries})
      fs.writeFileSync(serverBase+'.fabo/models/'+modelName+'/validation.js', validationOut);
      fs.writeFileSync(clientBase+'.fabo/models/'+modelName+'/validation.js', validationOut);
    }
  } catch(err) {
    console.log('**ERROR**: Template compilation error:',err)
  }

  return {mongooseSchemas, validationSchemas}
}
