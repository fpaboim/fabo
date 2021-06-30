import {extend} from  'mongoose-validator'

try {
  extend(
    'required',
    function(val) {
      val != undefined
    },
    'field is required.'
  )
} catch(e) {
  //
}
