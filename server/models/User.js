import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'
import validate from 'mongoose-validator'
import schema from '#semstack/models/User/schema.js'
import hooks from '#semstack/models/User/schemaHooks.js'

const UserSchema = new mongoose.Schema(schema)
// hooks
///////////////////////////////////////////////////////////////////////////////
for (hook in hooks) {
  UserSchema.pre(hook, hooks[hook])
}

const User = mongoose.model('User', UserSchema)
export default User
