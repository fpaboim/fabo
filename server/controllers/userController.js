import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'

import User from '#fabo/models/User'
import C      from "#fabo/shared/constants.js"

const createToken = (user, secret, expiresIn='2d') => {
  // console.log('CRETE TOKEN USER:', user)
  return jwt.sign({ email: user.email, _id: user._id }, secret, { expiresIn })
}

const methods = {
  getCurrentUser: async (req, res, next) => {
    const user = req.user
    if (!user) {
      return null
    } else {
      // const user = await User.findOne({email: user.email}, {password: false, favorites: false})
      return res.send({user})
    }
  },

  refreshToken: async (req, res, next) => {
    const user = await User.findById(req.user.id, '-password').lean()
    if (!user) {
      throw new Error('Error refreshing token')
    }

    return res.status(200).send({ token: createToken(user, process.env.SECRET) })
  },

  signinUser: async (req, res, next) => {
    const {email, password} = req.body
    // console.log('signing in', email)
    let user = await User.findOne({email}).lean()
    // console.log('signing in user:', user)
    if (!user) {
      return res.status(401).send({errors: {email: {message: 'Email not found.'}}})
    }
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).send({errors: {password: {message: 'Invalid password.'}}})
    }

    delete user.password
    // console.log('token for:', user)

    const token = createToken(user, process.env.SECRET)

    return res.status(200).send({...user, token})
  },

  signupUser: async (req, res, next) => {
    try {
      console.log('signup')
      // console.log('USER:', email, password)
      const {username, email, password} = req.body

      const user = await User.findOne({ email }).lean()
      const user2 = await User.findOne({ username }).lean()

      if (user) {
        return res.status(400).send({errors: {email: {message: 'Email already registered.'}}})
      }

      if (user2) {
        return res.status(400).send({errors: {username: {message: 'Username already exists.'}}})
      }

      let newUser = await User.create({
        username,
        email,
        password
      })

      const token = createToken(newUser, process.env.SECRET)

      newUser = {
        ...newUser,
        token
      }

      return res.status(200).json(newUser)
    } catch(err) {
      console.log('err:', err)
      return res.status(400).json(err)
    }
  }
};

export default methods
