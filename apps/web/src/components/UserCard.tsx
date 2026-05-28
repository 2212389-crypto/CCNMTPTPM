import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Edit } from 'lucide-react';
import { Avatar } from './Avatar';

interface UserCardProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
    createdAt?: string;
  };
  showActions?: boolean;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  showActions = true,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <Avatar 
          src={user.avatarUrl}
          alt={user.fullName}
          size="lg"
          fallbackText={user.fullName}
        />

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {user.fullName}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
          <div className="flex items-center mt-1">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.role === 'ADMIN' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
            </span>
          </div>
          {user.createdAt && (
            <p className="text-xs text-gray-400 mt-1">
              Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col space-y-2">
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Edit size={14} className="mr-2" />
              Sửa
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Settings size={14} className="mr-2" />
              Cài đặt
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};