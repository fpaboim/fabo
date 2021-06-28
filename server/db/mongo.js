import chalk from "chalk"
import mongoose from "mongoose"

import seedDB from './seed_db.js'
import config from "../config.js"

const connectToDB = async () => {
  let db

  console.log("Setup mongodb")
  mongoose.Promise = global.Promise
  mongoose.set("useNewUrlParser", true)
  mongoose.set("useFindAndModify", false)
  mongoose.set("useCreateIndex", true)
  mongoose.set("useUnifiedTopology", true)

  db = await mongoose.connect(config.db.uri, config.db.options)
  seedDB()

  return db
}

export default connectToDB
