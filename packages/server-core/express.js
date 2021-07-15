// Imports
///////////////////////////////////////////////////////////////////////////////
import path        from 'path'
import express     from 'express'
import helmet      from 'helmet'
import crossdomain from "helmet-crossdomain"
import netjet      from 'netjet'
import compression from 'compression'
import cors        from "cors"
import rateLimit   from "express-rate-limit"

// import pino        from "pino-http"
// const routerpath = process.cwd()+'/server/.fabo/router.js'
// const router = await import(routerpath)

function initHelmetHeaders(app) {
  // Use helmet to secure Express headers
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.frameguard());
  app.use(helmet.ieNoOpen());
  app.use(crossdomain());
  app.use(helmet.hidePoweredBy());
}

const whitelist = [
  'http://www.myproject.com.br',
  'https://myproject-front.vercel.app',
  'http://myproject-front.vercel.app',
  'http://192.168.111.2:3000',
];

const corsOptions = {
  origin: function(origin, callback){
    let originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  credentials: true
};

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://myproject-front.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

const createApp = (router, services) => {
  console.log('Initializing express...')
  const app = express()

  app.use(compression())
  app.use(netjet())
  app.use(cors(corsOptions))
  // app.options('*', cors());
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(express.static('./static'))
  // app.use(pino())

  // Rate limit per function
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: {errors: [{username: 'Too many attempts.'}]},
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  initHelmetHeaders(app)

  // Force https in production
  if (app.get('env') === 'production') {
    app.use(function(req, res, next) {
      var protocol = req.get('x-forwarded-proto');
      protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });
  }

  console.log('Express init done.')

  app.use(allowCrossDomain)

  for (let service of services) {
    service(app)
  }

  router(app)

  return app
}

export default createApp;

