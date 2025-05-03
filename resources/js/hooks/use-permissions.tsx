import { usePage } from '@inertiajs/react';

export function useCan(permission: string): boolean {
  const { auth } = usePage().props as {
    auth: { user_permissions: string[] };
  };

  return auth?.user_permissions?.includes(permission) ?? false;
}