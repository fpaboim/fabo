<h1 align="center">fabo serverless framework</h1>
<h3 align="center">Build scalable serverless APIs in minutes, not days.</h3>

Easy backend serverless yaml based REST API generator, which aims to replace a lot of the boilerplate which goes along with creating jamstack mobile/web apps.
* This project is in ALPHA, documentation is a work in progress, *caveat emptor*

![raptors, beware!](./assets/raptors.jpg "The raptor fences are down")

## Introduction
fabo is a small serverless framework for auto generating rest api's on top of a yaml configurations. It was made out of necessity of reducing boilerplate and being able to provide sensible defaults for scaffolding serverless + mongodb projects.

feedback @[publicbuilds](https://www.publicbuilds.com)(which is built with fabo): https://www.publicbuilds.com/builds/fpaboim/FABOjs

## Features
- [x] Serverless
- [x] Easy to eject: it's just serverless + express + mongodb
- [x] Automatic schema generation based on yaml interface
- [x] Automatic API generation based on yaml interface
- [x] Easy query building and validation
- [x] Easy client side and server-side schema validation
- [x] Commandline client for scaffolding

## Instructions
- Install the latest version of mongodb 4.4+ if not already installed
- Install serverless and login for deploying the serverless backend ``npm install -g serverless`` or with pnpm ``pnpm add -g serverless``
- Install fabo ``npm install -g fabo`` or with pnpm ``pnpm add -g fabo``
- To create a project in the current directory ``fabo init`` or to make a new directory with your project files ``fabo init newdirectory``

## Guide

### Structure
Your schema definition and methods relating to the schema reside in the ``./models`` folder. Creating a folder in the models directory automatically creates a route with the lowercased folder name and corresponding routes. The folder can have the following files which auto-generate a schema and API:
- schema.yaml
- schemaHooks.yaml
- api.yaml
- methods.js

### Examples:

#### Schema (/models/modelroute/schema.yaml)
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

#### Schema Hooks (/models/modelroute/schemaHooks.js)
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

#### API (/models/modelroute/api.yaml)
Example API:
```
endpoints:
  count: true
  delete:
    auth:
      - role: C.ROLES.ADMIN
  find:
    query:
      filter:
        allow: [build]
        required: [build]
  findone: true
  create:
    login: true
    pre:
      allowFields: [body, build]
      setFields:
        - author: user.username
        - edited: Date.now()
        - created: Date.now()
  updateone:
    login: true
    auth:
      - role: C.ROLES.USER
      - role: C.ROLES.EDITOR
    query:
      filter:
        setFields:
          - field: author
            value: user.username
    pre:
      allowFields: [body]
      setFields:
        - edited: Date.now()
query:
  filter:
    required: [build]
  skip: true
  limit:
    default: 25
    max: 25
    min: 1
  sort:
    default: -created
  fields: false
  populate: false


```

Example custom API:
```
endpoints:
  auth/login:
    method: signinUser
    middlewares: [apiLimiter]
  auth/signup:
    method: signupUser
    middlewares: [apiLimiter]
  auth/refreshtoken:
    method: refreshToken
    middlewares: [apiLimiter]
  auth/verify:
    method: verifyEmail
    middlewares: [apiLimiter]
  profile:
    method: getCurrentUser
    auth:
      - role: C.ROLES.USER
  auth/get:
    method: getUser
    middlewares: [apiLimiter]
```

#### Extending API Methods (/models/modelroute/methods.yaml)
The canonical ``User`` model uses custom methods which are mapped to routes in the example above.
```
import User from "./";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const createToken = (user, secret, expiresIn='2d') => {
  return jwt.sign({ email: user.email, _id: user._id }, secret, { expiresIn })
}


const methods = {
  getCurrentUser: async (req, res, next) => {
    const user = req.user
    if (!user) {
      return null
    } else {
      // const user = await User.findOne({email: user.email}, {password: false, favorites: false})
      return res.send({user})
    }
  },

  verifyEmail: async (req, res, next) => {
    const user = await User.findById(req.user.id, '-password').lean()
    if (!user) {
      return res.status(401).send({errors: {email: {message: 'Error refreshing token.'}}})
    }
  },


  refreshToken: async (req, res, next) => {
    const user = await User.findById(req.user.id, '-password').lean()
    if (!user) {
      return res.status(401).send({errors: {email: {message: 'Error refreshing token.'}}})
    }

    return res.status(200).send({ token: createToken(user, process.env.SECRET) })
  },

  signinUser: async (req, res, next) => {
    const {email, password} = req.body
    // console.log('signing in', email)
    let user = await User.findOne({email}).lean()
    // console.log('signing in user:', user)
    if (!user) {
      return res.status(401).send({errors: {email: {message: 'Email not found.'}}})
    }
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).send({errors: {password: {message: 'Invalid password.'}}})
    }

    delete user.password
    // console.log('token for:', user)

    const token = createToken(user, process.env.SECRET)

    return res.status(200).send({...user, token})
  },

  signupUser: async (req, res, next) => {
    try {
      console.log('signup')
      // console.log('USER:', email, password)
      const {username, email, password} = req.body

      const user = await User.findOne({ email }).lean()
      const user2 = await User.findOne({ username }).lean()

      if (user) {
        return res.status(400).send({errors: {email: {message: 'Email already registered.'}}})
      }

      if (user2) {
        return res.status(400).send({errors: {username: {message: 'Username already exists.'}}})
      }

      let newUser = await new User({
        username,
        email,
        password
      }).save()
      newUser=newUser.toObject()
      const token = createToken(newUser, process.env.SECRET)

      return res.status(200).send({...newUser, token})
    } catch(err) {
      console.log('err:', err)
      return res.status(400).json(err)
    }
  }
};

export default methods
```

### Querying the API
fabo uses the awesome [api-query-params](https://github.com/loris/api-query-params) to parse query strings and assist in build your mongodb queries with ease.

Example query:
```
const res = await post('/build/find?status=sent&timestamp>2016-01-01&author.firstName=/john/i&limit=100&skip=50&sort=-timestamp&populate=logs&fields=id,logs.ip')
```

### Supported query features by [api-query-params](https://github.com/loris/api-query-params)

#### Filtering operators

| MongoDB   | URI                  | Example                 | Result                                                                  |
| --------- | -------------------- | ----------------------- | ----------------------------------------------------------------------- |
| `$eq`     | `key=val`            | `type=public`           | `{filter: {type: 'public'}}`                                            |
| `$gt`     | `key>val`            | `count>5`               | `{filter: {count: {$gt: 5}}}`                                           |
| `$gte`    | `key>=val`           | `rating>=9.5`           | `{filter: {rating: {$gte: 9.5}}}`                                       |
| `$lt`     | `key<val`            | `createdAt<2016-01-01`  | `{filter: {createdAt: {$lt: Fri Jan 01 2016 01:00:00 GMT+0100 (CET)}}}` |
| `$lte`    | `key<=val`           | `score<=-5`             | `{filter: {score: {$lte: -5}}}`                                         |
| `$ne`     | `key!=val`           | `status!=success`       | `{filter: {status: {$ne: 'success'}}}`                                  |
| `$in`     | `key=val1,val2`      | `country=GB,US`         | `{filter: {country: {$in: ['GB', 'US']}}}`                              |
| `$nin`    | `key!=val1,val2`     | `lang!=fr,en`           | `{filter: {lang: {$nin: ['fr', 'en']}}}`                                |
| `$exists` | `key`                | `phone`                 | `{filter: {phone: {$exists: true}}}`                                    |
| `$exists` | `!key`               | `!email`                | `{filter: {email: {$exists: false}}}`                                   |
| `$regex`  | `key=/value/<opts>`  | `email=/@gmail\.com$/i` | `{filter: {email: /@gmail.com$/i}}`                                     |
| `$regex`  | `key!=/value/<opts>` | `phone!=/^06/`          | `{filter: {phone: { $not: /^06/}}}`                                     |

For more advanced usage (`$or`, `$type`, `$elemMatch`, etc.), pass any MongoDB query filter object as JSON string in the `filter` query parameter, ie:

```js
'filter={"$or":[{"key1":"value1"},{"key2":"value2"}]}'
//  {
//    filter: {
//      $or: [
//        { key1: 'value1' },
//        { key2: 'value2' }
//      ]
//    },
//  }
```

#### Skip / Limit operators

- Useful to limit the number of records returned.
- Default operator keys are `skip` and `limit`.

```js
'skip=5&limit=10'
//  {
//    skip: 5,
//    limit: 10
//  }
```

#### Projection operator

- Useful to limit fields to return in each records.
- Default operator key is `fields`.
- It accepts a comma-separated list of fields. Default behavior is to specify fields to return. Use `-` prefixes to return all fields except some specific fields.
- Due to a MongoDB limitation, you cannot combine inclusion and exclusion semantics in a single projection with the exception of the \_id field.
- It also accepts JSON string to use more powerful projection operators (`$`, `$elemMatch` or `$slice`)

```js
'fields=id,url'
//  {
//    projection: { id: 1, url: 1}
//  }
```

```js
'fields=-_id,-email'
//  {
//    projection: { _id: 0, email: 0 }
//  }
```

```js
'fields={"comments":{"$slice":[20,10]}}'
//  {
//    projection: { comments: { $slice: [ 20, 10 ] } }
//  }
```

#### Sort operator

- Useful to sort returned records.
- Default operator key is `sort`.
- It accepts a comma-separated list of fields. Default behavior is to sort in ascending order. Use `-` prefixes to sort in descending order.

```js
'sort=-points,createdAt'
//  {
//    sort: { points: -1, createdAt: 1 }
//  }
```

#### Population operator

- Useful to populate (reference documents in other collections) returned records. This is a [mongoose-only feature](https://mongoosejs.com/docs/populate.html).
- Default operator key is `populate`.
- It accepts a comma-separated list of fields.
- It extracts projection on populated documents from the `projection` object.

```js
'populate=a,b&fields=foo,bar,a.baz'
// {
//    population: [ { path: 'a', select: { baz: 1 } } ],
//    projection: { foo: 1, bar: 1 },
//  }
```

#### Keys with multiple values

Any operators which process a list of fields (`$in`, `$nin`, sort and projection) can accept a comma-separated string or multiple pairs of key/value:

- `country=GB,US` is equivalent to `country=GB&country=US`
- `sort=-createdAt,lastName` is equivalent to `sort=-createdAt&sort=lastName`

#### Embedded documents using `.` notation

Any operators can be applied on deep properties using `.` notation:

```js
'followers[0].id=123&sort=-metadata.created_at'
//  {
//    filter: {
//      'followers[0].id': 123,
//    },
//    sort: { 'metadata.created_at': -1 }
//  }
```

#### Automatic type casting

The following types are automatically casted: `Number`, `RegExp`, `Date` and `Boolean`. `null` string is also casted:

```js
'date=2016-01-01&boolean=true&integer=10&regexp=/foobar/i&null=null'
// {
//   filter: {
//     date: Fri Jan 01 2016 01:00:00 GMT+0100 (CET),
//     boolean: true,
//     integer: 10,
//     regexp: /foobar/i,
//     null: null
//   }
// }
```

If you need to disable or force type casting, you can wrap the values with `string()`, `date()` built-in casters or by specifying your own custom functions (See below):

```js
'key1=string(10)&key2=date(2016)&key3=string(null)'
// {
//   filter: {
//     key1: '10',
//     key2: Fri Jan 01 2016 01:00:00 GMT+0100 (CET),
//     key3: 'null'
//   }
// }
```

## Available options (`opts`)

#### Customize operator keys

The following options are useful to change the operator default keys:

- `skipKey`: custom skip operator key (default is `skip`)
- `limitKey`: custom limit operator key (default is `limit`)
- `projectionKey`: custom projection operator key (default is `fields`)
- `sortKey`: custom sort operator key (default is `sort`)
- `filterKey`: custom filter operator key (default is `filter`)
- `populationKey`: custom populate operator key (default is `populate`)

```js
'organizationId=123&offset=10&max=125',
  limitKey: 'max',
  skipKey: 'offset',
});
// {
//   filter: {
//     organizationId: 123,
//   },
//   skip: 10,
//   limit: 125
// }
```

#### Blacklist / Whitelist

The following options are useful to specify which keys to use in the `filter` object. (ie, avoid that authentication parameter like `apiKey` ends up in a mongoDB query). All operator keys are (`sort`, `limit`, etc.) already ignored.

- `blacklist`: filter on all keys except the ones specified
- `whitelist`: filter only on the keys specified

```js
'id=e9117e5c-c405-489b-9c12-d9f398c7a112&apiKey=foobar',
  blacklist: ['apiKey'],
});
// {
//   filter: {
//     id: 'e9117e5c-c405-489b-9c12-d9f398c7a112',
//   }
// }
```

#### Add custom casting functions

You can specify you own casting functions to apply to query parameter values, either by explicitly wrapping the value in URL with your custom function name (See example below) or by implictly mapping a key to a function (See `Specify casting per param keys` below). Note that you can also override built-in casting functions: `boolean`, `date` ,`null` ,`number` ,`regex` and `string`.

- `casters`: object to specify custom casters, key is the caster name, and value is a function which is passed the query parameter value as parameter.

```js
'key1=lowercase(VALUE)&key2=int(10.5)&key3=true',
  casters: {
    lowercase: val => val.toLowerCase(),
    int: val => parseInt(val, 10),
    boolean: val => (val === 'true' ? '1' : '0'),
  },
});
// {
//   filter: {
//     key1: 'value',
//     key2: 10,
//     key3: '1',
//   }
// }
```

#### Specify casting per param keys

You can specify how query parameter values are casted by passing an object.

- `castParams`: object which map keys to casters (built-in or custom ones using the `casters` option).

```js
'key1=VALUE&key2=10.5&key3=20&key4=foo',
  casters: {
    lowercase: val => val.toLowerCase(),
    int: val => parseInt(val, 10),
  },
  castParams: {
    key1: 'lowercase',
    key2: 'int',
    key3: 'string',
    key4: 'unknown',
  },
});
// {
//   filter: {
//     key1: 'value',
//     key2: 10,
//     key3: '20',
//     key4: 'foo',
//   }
// }
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

### Configuring Cache w/ S3 and cloudfront
https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/

### Constants (models/constants.js)
Defines constants which your API and schema have access to, like roles and enums.

### Client
fabo currently was built with svelte kit in mind, but a general schema to integrate with any client side framework in on the roadmap.

## Securing your server
- Per ip rate limiting with AWS WAF: https://docs.aws.amazon.com/waf/latest/developerguide/how-aws-waf-works.html

## Todo
### planned
- [ ] Admin
- [ ] Register KPIs on admin
- [x] Easier image uploads
- [ ] fabo config file for configuring different client frameworks
- [ ] Page for the docs
- [x] Validate query parameters
- [ ] Alias endpoints with different config
- [ ] Global query limits config
- [ ] Tests

### maybe?
- Svelte autoforms
- Make schema requirements specific to server or client
- Upload generic media
