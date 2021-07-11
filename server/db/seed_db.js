import C      from "../.fabo/shared/constants.js"
import _ from 'lodash'
import faker from 'faker/locale/pt_BR.js'
import User from '../.fabo/models/User'
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
        username : "admin",
        email    : "admin@example.com",
        password : "asdfasdf",
        provider : "local",
        roles    : [C.ROLES.ADMIN],
        verified : true
      });
      users.push(admin.save());

      let editor = new User({
        username : "editor",
        email    : "editor@example.com",
        password : "asdfasdf",
        provider : "local",
        roles    : [C.ROLES.EDITOR],
        verified : true
      });
      users.push(editor.save());

      let user = new User({
        username : "user",
        email    : "user@example.com",
        password : "asdfasdf",
        provider : "local",
        roles    : [C.ROLES.USER],
        verified : true
      });
      users.push(user.save());

      return Promise.all(users)
    }
  }).catch((err) => {
    console.log(err);
  }).then(() => {
    console.log("Seeding done!");
  });
};

export default seedDB
