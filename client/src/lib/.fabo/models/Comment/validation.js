import validate from 'mongoose-validator'

import '$lib/.fabo/shared/lib/extendValidators.js'

// Comment validation schema
///////////////////////////////////////////////////////////////////////////////
export default {
  body: [
    validate({
      validator: "isLength",
      arguments: [3,500],
      message: "Title should be between {ARGS[0]} and {ARGS[1]} characters"
    }), validate({
      validator: "required",
      message: "Title is required."
  })],
}



