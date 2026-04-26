import React from 'react';
import { ShieldOff } from 'lucide-react';
import { AdminPermission } from '@/hooks/useAdminPermissions';

interface PermissionGuardProps {
  permission: AdminPermission;
  hasPermission: boolean;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ hasPermission, children }) => {
  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
          <ShieldOff size={28} className="text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Access Denied</h3>
          <p className="text-sm text-gray-500">
            You don't have permission to access this section.<br />
            Contact your administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
