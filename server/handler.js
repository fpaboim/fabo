import { makeHandler } from '../.fabo/server-core/makeHandler.js'
import setupPassport from './services/passport.js'

const services = [setupPassport]
const startApp = makeHandler(services)

export default {startApp}
