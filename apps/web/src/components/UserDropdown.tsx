import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../features/auth/auth.slice';
import { useLogoutMutation } from '../api/auth.api';
import { getAvatarUrl } from '../utils/api';

interface UserDropdownProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
  };
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      console.log('Logout API call failed, proceeding with local logout');
    }
    
    dispatch(logout());
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div 
          className="rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-300 shadow-sm"
          style={{ 
            width: '20px', 
            height: '20px',
            minWidth: '20px',
            minHeight: '20px'
          }}
        >
          {getAvatarUrl(user.avatarUrl || null) ? (
            <img
              src={getAvatarUrl(user.avatarUrl || null) || ''}
              alt={user.fullName}
              className="w-full h-full object-cover rounded-full"
              style={{ width: '20px', height: '20px' }}
            />
          ) : (
            <div className="flex items-center justify-center text-gray-500 w-full h-full">
              <span className="font-semibold" style={{ fontSize: '10px' }}>
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <ChevronDown 
          size={10} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} ml-1`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-center">
              <div className="font-medium text-gray-900">{user.fullName}</div>
              <div className="text-sm text-gray-500">{user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User size={16} className="mr-3 text-gray-400" />
              Thông tin cá nhân
            </Link>

            <hr className="my-1" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} className="mr-3 text-red-400" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};