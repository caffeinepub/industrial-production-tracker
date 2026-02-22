# Specification

## Summary
**Goal:** Fix role-based access control implementation errors in the backend to enable proper authentication and authorization with Admin and Viewer roles.

**Planned changes:**
- Fix UserRole type definition in backend/migration.mo to use correct Motoko variant syntax with #Admin and #Viewer tags
- Fix requireAdmin() function to properly pattern match on UserRole variant and throw authorization errors
- Fix requireAuthenticated() function to validate caller has a valid UserProfile and throw authentication errors
- Implement stable storage migration logic to add role field to existing UserProfile records, defaulting to #Admin
- Ensure type consistency for UserRole and UserProfile definitions between backend/main.mo and backend/migration.mo
- Fix createUserProfile mutation to correctly accept and store role parameter as UserRole variant
- Verify all mutation operations call requireAdmin() with proper error propagation

**User-visible outcome:** Users with Admin role can perform all mutation operations, while Viewer role users are properly denied access with clear error messages. Existing user profiles continue to work with Admin privileges after migration.
