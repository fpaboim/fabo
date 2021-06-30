export function getErrors(formInput, validators) {
  let errorMsgs = {}
  for (let label in validators) {
    for (let {message, validator} of validators[label]) {
      const isValid = validator(formInput[label])
      if (!isValid) {
        errorMsgs[label] = message
        break
      }
    }
  }
  return errorMsgs
}
