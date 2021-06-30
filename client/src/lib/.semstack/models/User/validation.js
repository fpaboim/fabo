import validate from 'mongoose-validator'
import '$lib/.semstack/shared/lib/extendValidators.js'

// User validation schema
///////////////////////////////////////////////////////////////////////////////
export default {
  username: [
    validate({
      validator: "isLength",
      arguments: [3,50],
      message: "Name should be between {ARGS[0]} and {ARGS[1]} characters"
    }), validate({
      validator: "isAlphanumeric",
      passIfEmpty: true,
      message: "Name should contain alpha-numeric characters only"
    }), validate({
      validator: "required",
      message: "Username is required."
  })],
  email: [
    validate({
      validator: "isEmail",
      message: "Please enter a valid email"
    }), validate({
      validator: "isLength",
      only: "server",
      arguments: [4,100],
      message: "Email should be between {ARGS[0]} and {ARGS[1]} characters"
    }), validate({
      validator: "required",
      message: "Email is required."
  })],
  password: [
    validate({
      validator: "isLength",
      arguments: [8,40],
      message: "Password should be between {ARGS[0]} and {ARGS[1]} characters"
    }), validate({
      validator: "required",
      message: "Password is required."
  })],
}



