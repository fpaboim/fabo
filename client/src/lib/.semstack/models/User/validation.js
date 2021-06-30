import '$lib/.semstack/shared/lib/extendValidators.js'
import validate from 'mongoose-validator'

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
      validator: "required"
  })],
  email: [
    validate({
      validator: "isEmail",
      message: "Please enter a valid email"
    }), validate({
      validator: "required"
  })],
  password: [
    validate({
      validator: "isLength",
      arguments: [8,40],
      message: "Password should be between {ARGS[0]} and {ARGS[1]} characters"
    }), validate({
      validator: "required"
  })],
  joined: [
    validate({
      validator: "required"
  })],
  verified: [
    validate({
      validator: "required"
  })],
  roles: [
    validate({
      validator: "required"
  })],
  liked: [
    validate({
      validator: "required"
  })],
  messages: [
    validate({
      validator: "required"
  })],
}



