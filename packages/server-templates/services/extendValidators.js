import pkg from  'mongoose-validator'

const {extend} = pkg

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
