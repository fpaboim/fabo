export async function getSchema(model) {
  const getMongooseSchema = await import("../services/getSchema.js")
  const schema = await import(`./${model}/schema.js`)
  return getMongooseSchema(schema)
}
