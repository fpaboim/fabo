import Post from '#fabo/models/Post'
import C      from "#fabo/shared/constants.js"

const methods = {
  example: async (req, res, next) => {
    const user = req.user
    if (!user) {
      return null
    } else {
      // const user = await User.findOne({email: user.email}, {password: false, favorites: false})
      return res.send({user})
    }
  },
};

export default methods
