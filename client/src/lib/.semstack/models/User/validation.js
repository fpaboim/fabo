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
  })],
  email: [
    validate({
      validator: "isEmail",
      message: "Please enter a valid email"
  })],
  password: [
    validate({
      validator: "isLength",
      arguments: [8,40],
      message: "Password should be between {ARGS[0]} and {ARGS[1]} characters"
  })],
  joined: [
    
  verified: [
    
  roles: [
    
  liked: [
    
  messages: [
    
}



