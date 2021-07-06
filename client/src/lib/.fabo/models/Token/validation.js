import validate from 'mongoose-validator'

import '$lib/.fabo/shared/lib/extendValidators.js'

// Token validation schema
///////////////////////////////////////////////////////////////////////////////
export default {
  userId: [
    validate({
      validator: "required",
      message: "Id is required"
  })],
  token: [
    validate({
      validator: "required",
      message: "Token is required"
  })],
}



