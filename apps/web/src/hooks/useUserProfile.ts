import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../features/auth/auth.slice';
import { getApiUrl, getAuthHeaders } from '../utils/api';

interface ExtendedUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const useUserProfile = () => {
  const currentUser = useAppSelector(selectUser);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl('/api/users/me'), {
        headers: {
          ...getAuthHeaders()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load user profile');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      // Fallback to basic user info from Redux store
      setUser(currentUser as ExtendedUser);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateUserAvatar = (avatarUrl: string | null) => {
    if (user) {
      setUser({ ...user, avatarUrl });
    }
  };

  const updateUserProfile = (updates: Partial<ExtendedUser>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return {
    user,
    loading,
    error,
    refetch: loadUserProfile,
    updateAvatar: updateUserAvatar,
    updateProfile: updateUserProfile
  };
};