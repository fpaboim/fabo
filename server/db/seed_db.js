import config from "../config.js"
import C      from "#semstack/shared/constants.js"
import _ from 'lodash'
import faker from 'faker/locale/pt_BR.js'
faker.seed(42)


const seedDB = () => {
  /**
   * Create default `admin` and `test` users
   */
  return User.find({}).exec().then((docs) => {
    if (docs.length === 0) {
      console.log("Load default Users to DB...");

      let users = [];

      let admin = new User({
        firstName: "admin",
        lastName : "admin",
        email    : "admin@example.com",
        password : "asdfasdf",
        provider : "local",
        roles    : [C.ROLES.ADMIN],
        ratings  : [],
        liked    : [],
        verified : true
      });
      users.push(admin.save());

      let seller = new User({
        firstName: "editor",
        lastName : "editor",
        email    : "editor@example.com",
        password : "asdfasdf",
        provider : "local",
        roles    : [C.ROLES.EDITOR],
        ratings  : [],
        liked    : [],
        verified : true
      });
      users.push(seller.save());

      let manager = new User({
        firstName: "user",
        lastName : "user",
        email    : "user@example.com",
        password : "asdfasdf",
        provider : "local",
        roles    : [C.ROLES.USER],
        ratings  : [],
        liked    : [],
        verified : true
      });
      users.push(manager.save());

      return Promise.all(users)
    }
  }).catch((err) => {
    console.log(err);
  }).then(() => {
    console.log("Seeding done!");
  });
};

export default seedDB
