const { SchemaDirectiveVisitor } = require('graphql-tools')
const {
  DirectiveLocation,
  GraphQLDirective,
} = require('graphql')
// const { getUser } = require('./auth');

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureObjWrapped(type);
    type._requiredAuthRole = this.args.requires;
  }

  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType, field);
    field._requiredAuthRole = this.args.requires;
  }

  ensureObjWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];

      field.resolve = async function (datain, args, context, info) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole;

        const data = datain[field.name]
        const { currentUser }  = context
        const user = currentUser

        if (requiredRole === 'PUBLIC') {
          return data
        }
      
        if (!user) {
          throw new Error(`Not authorized - no user: ${fieldName}`);
        }

        if (user.roles.indexOf('ADMIN') != -1) {
          return data
        }

        if (!requiredRole) {
          throw new Error(`Not authorized, no required credentials for: ${fieldName}`);
        }

        if (requiredRole === 'PRIVATE') {
          throw new Error(`Not authorized - private: ${fieldName}`);
        }

        if (user.roles.indexOf(requiredRole) === -1) {
          throw new Error(`Not authorized - insufficient credentials: ${fieldName}`);
        }

        return data
      };
    });
  }

  checkRole(role, user) {

  }

  ensureFieldsWrapped(fieldType, field) {
    // Mark the GraphQLfieldType object to avoid re-wrapping:
    if (fieldType._authFieldsWrapped) return;
    fieldType._authFieldsWrapped = true;

    const fields = fieldType.getFields()

    for (let fld in fields) {
      const obj = fields[fld]
      const directives = fields[fld].astNode.directives

      let hasAuth = false
      if (directives.length > 0) {
        for (let dir of directives) {
          if (dir.name && dir.name.value && dir.name.value == 'auth') {
            hasAuth = true
          }
        }
      }

      // no auth directive does not require patching resolve
      if (!hasAuth) {
        continue
      }

      let resolve = obj.resolve 
      obj.resolve = async function (datain, args, context, info) {
        // console.log('field:', obj)
        const requiredRole = obj._requiredAuthRole || 'ADMIN';
        // console.log('required role:', requiredRole)

        // const context = args[2]
        const { currentUser }  = context

        if (requiredRole === 'PUBLIC') {
          return await resolve(datain, args, context, info)
        }
      
        if (!currentUser) {
          throw new Error(`FLD: Not authorized - no currentUser: ${fld}`);
        }

        if (currentUser.roles.indexOf('ADMIN') !== -1) {
          return await resolve(datain, args, context, info)
        }

        if (!requiredRole) {
          throw new Error(`FLD: Not authorized, no required credentials for: ${fld}`);
        }

        if (requiredRole === 'PRIVATE') {
          throw new Error(`FLD: Not authorized - private: ${fld}`);
        }

        if (currentUser.roles.indexOf(requiredRole) === -1) {
          throw new Error(`FLD: Not authorized - insufficient credentials: ${fld}`);
        }

        return await resolve(datain, args, context, info)
      }
    }
  }
}

module.exports = {
  AuthDirective
}