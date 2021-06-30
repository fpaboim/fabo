import {extend} from  'mongoose-validator'

try {
  extend(
    'required',
    function(val) {
      return val != undefined
    },
    'Value is required.'
  )
} catch(e) {
  //
}
