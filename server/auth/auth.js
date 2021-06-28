const jwt    = require('jsonwebtoken')
const logger = require('../logger')
import User from '../models/User'

const getUser = async (token, User) => {
  if (token) {
    try {
      const userjwt = await jwt.verify(token, process.env.SECRET)
      const user = await User.findOne({id: userjwt.id}, {password: false})
      return user
    } catch(err) {
      console.log('getUser error:', err)
      // throw new AuthenticationError('Your session has expired. Please signin again.')
      // return null
    }
  }
}

module.exports = {
  getUser
}
