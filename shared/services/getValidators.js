export default function getValidators(model, schema) {
  validationSchema[model] = {}
  for (let key in schema) {
    if (schema[key].validations) {
      validationSchema[model][key] = schema[key].validate
    }
  }
}

