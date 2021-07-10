import {extend} from  'mongoose-validator'

try {
  extend(
    'required',
    function(val, msg) {
      return val != undefined
    },
    'Value is required.'
  )
} catch(e) {
  //
}
