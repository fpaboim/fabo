import chalk from "chalk"

const connectToDB = async (mongoose) => {
  let db

  console.log("Setup mongodb")
  mongoose.Promise = global.Promise
  // mongoose.set("useNewUrlParser", true)
  // mongoose.set("useFindAndModify", false)
  // mongoose.set("useCreateIndex", true)
  // mongoose.set("useUnifiedTopology", true)

  db = await mongoose.connect(process.env.MONGO_URI, {
    "bufferCommands": false
  })

  return db
}

export default connectToDB
