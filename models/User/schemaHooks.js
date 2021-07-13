import bcrypt   from 'bcryptjs'

const hooks = {
  pre: {
    save: function (next) {
      if (this.isModified('imagepath')) {
        return next()
      }

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
    }
  }
}

export default hooks
