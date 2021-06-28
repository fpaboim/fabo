import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'
import validate from 'mongoose-validator'
import {getSchema} from '#shared/models'

const UserSchema = new mongoose.Schema(schema)
const schema = await getSchema('User')

// hooks
///////////////////////////////////////////////////////////////////////////////
UserSchema.pre('save', function (next) {
  // only run this if we're messing with the password field, or else bcrypt 
  // will on all saves!
  if (!this.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.log('ERR:', err)
      return next(err)
    }
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) {
        console.log('BCRYPT ERR:', err)
        return next(err)
      }
      this.password = hash
      // console.log('newpass', this.password)
      next()
    })
  })
})

const User = mongoose.model('User', UserSchema)
export default User
