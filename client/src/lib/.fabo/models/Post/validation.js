import validate from 'mongoose-validator'

import '$lib/.fabo/shared/lib/extendValidators.js'

// Post validation schema
///////////////////////////////////////////////////////////////////////////////
export default {
  title: [
    validate({
      validator: "isLength",
      arguments: [3,120],
      message: "Title should be between {ARGS[0]} and {ARGS[1]} characters"
    }), validate({
      validator: "required",
      message: "Title is required."
  })],
  body: [
    validate({
      validator: "isLength",
      arguments: [10,100000],
      message: "Post body should be between {ARGS[0]} and {ARGS[1]} characters"
    }), validate({
      validator: "required",
      message: "Post body is required."
  })],
}



