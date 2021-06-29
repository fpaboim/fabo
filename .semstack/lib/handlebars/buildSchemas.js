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

// helpers
///////////////////////////////////////////////////////////////////////////////
Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

Handlebars.registerHelper('parseValidationEntry', function (value) {
  let res = ''
  let keys = Object.keys(value)

  if (!keys.includes('validations')) {
    console.log('asdf', value)
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

Handlebars.registerHelper('parseEntry', function (value) {
  let res = ''
  let keys = Object.keys(value)

  for (let entry in value) {
    entry = entry.trim()
    if (entry === 'default')
      entry = 'def'

    switch (entry) {
      case 'type':
        res += entry+': '+parseType(value[entry])
        break
      case 'validations':
        res += entry+': [validate({\n      '+parseValidations(value[entry])
        break
      case 'def':
        entry = 'default'
        res += entry+': '+JSON.stringify(value[entry])
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
