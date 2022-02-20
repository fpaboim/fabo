// Imports
///////////////////////////////////////////////////////////////////////////////
import dayjs from "dayjs"
import chalk from "chalk"
import dotenv from 'dotenv'
import serverlessExpress from "@vendia/serverless-express"

import connectToDB from "./db/mongo.js"
import createApp from "./express.js"

// Vars
///////////////////////////////////////////////////////////////////////////////
const PORT = 4000

dotenv.config()
const result = dotenv.config()

if (result.error) {
  throw result.error
}

// funcs
///////////////////////////////////////////////////////////////////////////////
export function makeHandler(router, services, options) {
  return async function startApp(mongoose, local=false, ...args) {
    console.log("\n")
    console.log(
      chalk.bold(
        `---------------------[ Server starting at ${dayjs().format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        )} ]---------------------------`
      )
    )

    // Create express app and connect to db
    let connection = connectToDB(mongoose)
    connection = await connection
    console.log('Connected to DB')
    let app = createApp(router, services, options)

    if (!local) {
      app = serverlessExpress({app})
      console.log("Connected!")
      return app(...args)
    } else {
      app.listen(PORT, () => {
        console.log(`Example app listening at http://localhost:${PORT}`)
      })
    }
    // app = middy(app).use(cors())
  }
}
