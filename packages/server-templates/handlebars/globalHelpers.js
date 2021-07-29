import Handlebars from 'handlebars'

// helpers
///////////////////////////////////////////////////////////////////////////////
export default function registerGlobalHelpers() {
  Handlebars.registerHelper('lowercase', function (value) {
    return String(value).toLowerCase()
  });

  Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });

  Handlebars.registerHelper('notEmptyArray', function(val) {
    if (!val || !val.length) {
      return false
    }
    return val.length > 0
  });

  Handlebars.registerHelper('hasKey', function(object, key, options) {
    if (!object) {
      return options.inverse(this);
    }
    if (Object.keys(object).includes(key)) {
      return (object[key]) ? options.fn(this) : options.inverse(this);
    }
    options.inverse(this);
  });

  Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
        return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
});
}
