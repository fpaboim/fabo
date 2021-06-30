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
Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

Handlebars.registerHelper('parseValidationEntry', function (value) {
  let res = ''
  let keys = Object.keys(value)

  if (isRequired(keys,value)) {
    if (!value['validations']) {
      value['validations'] = []
    }

    if (value['validations'] && typeof(value['validations']=='object')) {
      value['validations'].push({
        validator: 'required',
      })
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

Handlebars.registerHelper('hasValidationEntries', function (value) {
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

// exports
///////////////////////////////////////////////////////////////////////////////
export default function buildSchemas(schemas, clientBase, serverBase) {
  let mongooseSchemas = {}
  let validationSchemas = {}

  try {
    for (let modelName in schemas) {
      let schema = schemas[modelName]
      let schemaEntries = []
      for (let key in schema) {
        schemaEntries.push({name: key, data: schema[key]})
      }
      const mongooseTemplate = fs.readFileSync('./.semstack/lib/templates/schema.hbs', 'utf8');
      const validationTemplate = fs.readFileSync('./.semstack/lib/templates/validation.hbs', 'utf8');

      createDirIfNone(serverBase+'.semstack/models/'+modelName)
      createDirIfNone(clientBase+'.semstack/models/'+modelName)

      const buildMongoose = Handlebars.compile(mongooseTemplate, { noEscape: true });
      const mongooseOut = buildMongoose({name: modelName, schemaEntries})
      fs.writeFileSync(serverBase+'.semstack/models/'+modelName+'/schema.js', mongooseOut);

      const buildValidation = Handlebars.compile(validationTemplate, { noEscape: true });
      const validationOut = buildValidation({name: modelName, schemaEntries})
      fs.writeFileSync(serverBase+'.semstack/models/'+modelName+'/validation.js', validationOut);
      fs.writeFileSync(clientBase+'.semstack/models/'+modelName+'/validation.js', validationOut);
    }
  } catch(err) {
    console.log('**ERROR**: Template compilation error:',err)
  }

  return {mongooseSchemas, validationSchemas}
}
