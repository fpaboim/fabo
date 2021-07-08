import chalk from "chalk"
import mongoose from "mongoose"

import seedDB from '/db/seed_db.js'

const connectToDB = async () => {
  let db

  console.log("Setup mongodb")
  mongoose.Promise = global.Promise
  mongoose.set("useNewUrlParser", true)
  mongoose.set("useFindAndModify", false)
  mongoose.set("useCreateIndex", true)
  mongoose.set("useUnifiedTopology", true)
  mongoose.set("bufferCommands", false)
  mongoose.set("bufferMaxEntries", 0)

  db = await mongoose.connect(process.env.MONGO_URI)
  // seedDB()

  return db
}

export default connectToDB
