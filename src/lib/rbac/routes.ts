import { Role } from "@prisma/client";

export const roleRoutes: Record<Role, string[]> = {
  ADMIN: ["/admin"],
  EMPLOYEE: ["/dashboard"], // Employees can only access dashboard, not admin
};

export const publicRoutes = [
  "/",
  "/login",
  "/auth/register",
  "/services",
  "/services/[serviceId]",
  "/samples",
];

export function canAccessRoute(role: Role, pathname: string, permissions?: string[] | null): boolean {
  // Check public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // ADMIN with permissions
  if (role === "ADMIN") {
    // Dashboard routes are always accessible
    if (pathname.startsWith("/dashboard")) {
      return true;
    }
    
    // For admin routes, check permissions if specified
    if (pathname.startsWith("/admin")) {
      // Always allow access to /admin root path to prevent redirect loops
      if (pathname === "/admin") {
        return true;
      }
      
      // If no permissions specified, allow all (full admin access)
      if (!permissions || permissions.length === 0) {
        return true;
      }
      
      // Check if path matches any permission
      return permissions.some((permission) => {
        // Exact match
        if (pathname === permission) {
          return true;
        }
        // Path starts with permission (for nested routes)
        if (pathname.startsWith(permission + "/")) {
          return true;
        }
        return false;
      });
    }
  }

  // EMPLOYEE - only dashboard access
  if (role === "EMPLOYEE") {
    // Dashboard routes are always accessible
    if (pathname.startsWith("/dashboard")) {
      return true;
    }
    
    // Employees cannot access admin routes
    return false;
  }

  // Check role-specific routes
  const allowedRoutes = roleRoutes[role];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

export function getRedirectPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "EMPLOYEE":
      return "/dashboard";
    default:
      return "/login";
  }
}
