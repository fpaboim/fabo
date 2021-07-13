import bcrypt from 'bcryptjs'
import slugify from 'slugify'

const hooks = {
  pre: {
    save: function (next) {
      // only run this if we're messing with the password field, or else bcrypt
      // will on all saves!
      if (!this.isModified('title')) {
        return next()
      }

      this.slug = slugify(this.title)
      return next()
    }
  }
}

export default hooks
