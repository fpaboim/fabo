import mongoose from 'mongoose'
import validate from 'mongoose-validator'

export default async function getSchema(schema) {
  let mongooseSchema = {}
  var validationSchema = {}

  for (let key in schema) {
    mongooseSchema[key] = {}

    for (let subkey in schema[key]) {
      if (subkey == 'type') {
        for (let obj of schema[key].type) {
          if (typeof(obj) == String && obj == 'id') {
            schema[key][subkey] = mongoose.Schema.Types.ObjectId
          } else if (typeof(obj) == Array && obj[0] == 'id') {
            schema[key][subkey] = [mongoose.Schema.Types.ObjectId]
          }
        }
      }

      if (subkey == 'validations') {
        mongooseSchema[key]['validate'] = []
        validationSchema[key] = []
        for (let obj of schema[key].validations) {
          if (obj['validator'] == 'required') {
            if (obj.message) {
              mongooseSchema[key]['required'] = [true, obj.message]
            } else {
              mongooseSchema[key]['required'] = [true, key + ' is required.']
            }
            continue
          }
          mongooseSchema[key]['validate'].push(validate(obj))
          validationSchema[key].push(validate(obj))
        }
      } else {
        mongooseSchema[key][subkey] = schema[key][subkey]
      }
    }
  }

  return schema
}
