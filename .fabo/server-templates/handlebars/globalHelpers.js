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
}
