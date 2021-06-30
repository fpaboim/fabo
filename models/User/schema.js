import C from "#semstack/shared/constants.js"
import validate from 'mongoose-validator'
import mongoose from 'mongoose'

// User schema
///////////////////////////////////////////////////////////////////////////////
export default {
  username: {
    type: String,
    unique: false,
    required: [true,"Username is required."],
    validate: [validate({
      validator: "isLength",
      arguments: [3,50],
      message: "Name should be between {ARGS[0]} and {ARGS[1]} characters"
    }), validate({
      validator: "isAlphanumeric",
      passIfEmpty: true,
      message: "Name should contain alpha-numeric characters only"
    })]
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: [true,"Email is required."],
    validate: [validate({
      validator: "isEmail",
      message: "Please enter a valid email"
    }), validate({
      validator: "isLength",
      only: "server",
      arguments: [4,100],
      message: "Email should be between {ARGS[0]} and {ARGS[1]} characters"
    })]
  },
  password: {
    type: String,
    trim: true,
    required: [true,"Password is required."],
    validate: [validate({
      validator: "isLength",
      arguments: [8,40],
      message: "Password should be between {ARGS[0]} and {ARGS[1]} characters"
    })]
  },
  joined: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  roles: {
    type: [String],
    default: ["C.ROLES.USER"]
  },
  liked: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "Post"
  },
  messages: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "Message"
  },
}



