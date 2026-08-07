'use client';

import type { ReactNode } from 'react';
import { useAuthorization } from '@/features/authentication/hooks/use-auth';
import type { Permission } from '@/features/authorization/permission.constants';
import type { AppRole } from '@/features/authorization/role.constants';
import {
  hasPermission,
  hasRole,
} from '@/features/authorization/rbac.service';

/**
 * Client page/section guard — hides children when role/permission fails.
 * Does not replace server redirects for sensitive routes.
 */
export function RequireAccess({
  roles,
  permission,
  children,
  fallback = null,
}: {
  roles?: AppRole | AppRole[];
  permission?: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role } = useAuthorization();

  if (roles && !hasRole(role, roles)) {
    return <>{fallback}</>;
  }
  if (permission && !hasPermission(role, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
