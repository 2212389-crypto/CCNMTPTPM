import React from 'react';
import { User } from 'lucide-react';
import { getAvatarUrl } from '../utils/api';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
  className?: string;
}

const sizeClasses = {
  xs: 'w-4 h-4 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm', 
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-lg'
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallbackText,
  className = ''
}) => {
  const sizeClass = sizeClasses[size];

  const avatarSrc = getAvatarUrl(src || null);

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => {
            console.error('Avatar image failed to load:', avatarSrc);
          }}
          onLoad={() => {
            console.log('Avatar image loaded successfully');
          }}
        />
      ) : (
        <div className="flex items-center justify-center text-gray-500">
          {fallbackText ? (
            <span className="font-semibold">
              {fallbackText.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={size === 'xs' ? 8 : size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 28} />
          )}
        </div>
      )}
    </div>
  );
};