# Auth
Imagine a hypothetical @auth directive that takes an argument requires of type Role, which defaults to ADMIN. This @auth directive can appear on an OBJECT like User to set default access permissions for all User fields, as well as appearing on individual fields, to enforce field-specific @auth restrictions:

```
  directive @auth(
    requires: Role = ADMIN,
  ) on OBJECT | FIELD_DEFINITION

  enum Role {
    ADMIN
    REVIEWER
    USER
    UNKNOWN
  }

  type User @auth(requires: USER) {
    name: String
    banned: Boolean @auth(requires: ADMIN)
    canPost: Boolean @auth(requires: REVIEWER)
  }
```
