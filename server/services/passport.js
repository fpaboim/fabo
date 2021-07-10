import passportJWT from 'passport-jwt';
import passport from "passport"

import User from '../.fabo/models/User'


const setupPassport = (app) => {
  // passport & jwt config
  const {
    Strategy: JWTStrategy,
    ExtractJwt: ExtractJWT,
  } = passportJWT;

  // define passport jwt strategy
  const opts = {};
  opts.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme('Bearer')
  opts.secretOrKey = process.env.SECRET;
  const passportJWTStrategy = new JWTStrategy(opts, function(jwtPayload, done) {
    // retrieve mail from jwt payload
    console.log("** payload:", jwtPayload)
    const id = jwtPayload._id;

    // if mail exist in database then authentication succeed
    User.findById(id, '-password', (error, user) => {
      if (error) {
        console.log("Passport error:", error)
        return done(error, false);
      } else {
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      }
    });
  });

  // token strategy
  passport.use(passportJWTStrategy);

  app.use(passport.initialize())

  const auth = passport.authenticate("jwt", { session: false })

  return auth
}

export default setupPassport
