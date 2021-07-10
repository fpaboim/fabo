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
dotenv.config()
const PORT = 4000

// funcs
///////////////////////////////////////////////////////////////////////////////
export async function startApp(...args) {
  console.log("\n")
  console.log(
    chalk.bold(
      `---------------------[ Server starting at ${dayjs().format(
        "YYYY-MM-DD HH:mm:ss.SSS"
      )} ]---------------------------`
    )
  )

  // Create express app and connect to db
  let connection = connectToDB()
  console.log("Connected!")
  let app = createApp()
  connection = await connection

  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })


  return app(...args)
}
