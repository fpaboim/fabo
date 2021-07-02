const jwt = require('jsonwebtoken')
import passport from 'passport'

import userController from './controllers/userController.js'
import User from '#fabo/models/User'

const auth = passport.authenticate("jwt", { session: false })

// 3. Routes
const router = (app) => {
  console.log("Setup routes...")
  // 4. Authentication Routes
  app.post("/auth/login", userController.signinUser)
  app.post("/auth/signup", userController.signupUser)
  app.post("/auth/refreshtoken", userController.refreshToken)
  app.get("/profile", auth, userController.getCurrentUser)

  // 5. Application Routes
}

export default router
