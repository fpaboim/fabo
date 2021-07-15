# fabo serverless microframework

#### Easy backend serverless yaml based CMS and REST API generator, which aims to replace a lot of the boilerplate which goes along with creating JAMSTACK mobile/web apps without having to give up on your code editor. Serverless is easy with *fabo* doing the work for you! 🏋️

#### * This project is a WIP (pre-alpha), use at your own risk
![alt text](./server/static/raptors.jpg "The raptor fences are down")

## Features
- [x] Serverless
- [x] Easy to eject: it's just serverless + express + mongodb
- [x] Automatic schema generation based on yaml interface
- [x] Automatic API generation based on yaml interface
- [x] Easy client side and server-side validation
- [x] PNPM for more efficient monorepo organization
- [ ] Commandline client for scaffolding
- [ ] Integration tests

## Instructions
- Install fabo ``npm install fabo``
- Install mongodb
- Install serverless and login for deploying the serverless backend


## Guide


### Structure
Creating a folder in the models directory automatically created a route with the lowercased folder name. The folder can have the following files which auto-generate a schema and API:
- schema.yaml
- schemaHooks.yaml
- api.yaml
- methods.js

### Schema (/models/modelroute/schema.yaml)
Example schema:
```
imports:
  uniqid: uniqid
schema:
  username:
    type     : String
    unique   : false
    required: [true, Username is required.]
    validations:
      - validator: isLength
        arguments: [3, 50]
        message: Name should be between {ARGS[0]} and {ARGS[1]} characters
      - validator: isAlphanumeric
        passIfEmpty: true
        message: Name should contain alpha-numeric characters only
  email   :
    type    : String
    unique  : true
    lowercase: true
    trim    : true
    required: [true, 'Email is required.']
    validations:
      - validator: isEmail
        message: Please enter a valid email
      - validator: isLength
        only: server # one of ['client', 'server']
        arguments: [4, 100]
        message: Email should be between {ARGS[0]} and {ARGS[1]} characters
  password:
    type    : String
    trim    : true
    required: [true, 'Password is required.']
    validations:
      - validator: isLength
        arguments: [8, 40]
        message: Password should be between {ARGS[0]} and {ARGS[1]} characters
  imagepath:
    type: String
    default: uniqid()
  joined:
    type: Date
    default: Date.now
  verified  :
    type: Boolean
    default: false
  roles  :
    type: [String]
    default: [C.ROLES.USER]
  liked:
    type: [Id]
    default: "[]"
    ref: Post
  messages:
    type: [Id]
    default: "[]"
    ref: Message
```

### Schema Hooks (/models/modelroute/schemaHooks.js)
Example pre save mongoose hook for salting and hashing a password before saving:
```
import bcrypt   from 'bcryptjs'

const hooks = {
  pre: {
    save: function (next) {
      if (this.isModified('imagepath')) {
        return next()
      }

      // only run this if we're messing with the password field, or else bcrypt
      // will on all saves!
      if (!this.isModified('password')) {
        return next()
      }

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.log('ERR:', err)
          return next(err)
        }
        bcrypt.hash(this.password, salt, (err, hash) => {
          if (err) {
            console.log('BCRYPT ERR:', err)
            return next(err)
          }
          this.password = hash
          // console.log('newpass', this.password)
          next()
        })
      })
    }
  }
}

export default hooks
```

### API (/models/modelroute/api.yaml)
Example API:
```
count: true
delete:
  auth:
    - role: ROLES.ADMIN
find: true
findone: true
create:
  login: true
  middlewares: [apiLimiter]
  pre:
    setField:
      author: user.username
updateone:
  login: true
  auth:
    - role: ROLES.USER
      owner: author
    - role: ROLES.EDITOR
```

Example custom API:
```
auth/login:
  method: signinUser
  middlewares: [apiLimiter]
auth/signup:
  method: signupUser
  middlewares: [apiLimiter]
auth/refreshtoken:
  method: refreshToken
  middlewares: [apiLimiter]
auth/verifyEmail/:userid/:token:
  method: verifyEmail
  middlewares: [apiLimiter]
profile:
  method: getCurrentUser
  auth:
    - role: ROLES.USER
```

### Config for S3 Uploads
- Install aws cli client [here](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- Create S3 bucket for storing files:
```
aws s3api create-bucket --bucket my-bucket --region us-east-1
```
- Configure bucket:
```
aws s3api put-bucket-cors --bucket my-bucket --cors-configuration '{"CORSRules": [{
  "AllowedOrigins": ["*"],
  "AllowedHeaders": ["Authorization"],
  "AllowedMethods": ["GET", "POST"],
  "MaxAgeSeconds": 3000
}]}'
```
- ``pnpm i``
- ``pnpm run dev``

### Constants (models/constants.js)
Defines constants which your API and schema have access to, like roles and enums.

### Client
fabo currently was built with svelte kit in mind, but a general schema to integrate with any client side framework in on the roadmap.


## Securing your server
- Per ip rate limiting with AWS WAF: https://docs.aws.amazon.com/waf/latest/developerguide/how-aws-waf-works.html

## Todo
### planned
- Upload images
- Finish scaffolding cli
- Make docs page
- Tests

### maybe?
- Svelte autoforms
- Make schema requirements specific to server or client
- Upload generic media
