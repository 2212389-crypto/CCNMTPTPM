import React, { useState, useEffect } from 'react';
import { Save, User, Mail } from 'lucide-react';
import { AvatarUpload } from '../components/AvatarUpload';
import { useUserProfile } from '../hooks/useUserProfile';
import { getApiUrl, getAuthHeaders } from '../utils/api';

export const ProfilePage: React.FC = () => {
  const { user, loading: isLoading, updateAvatar, updateProfile, refetch } = useUserProfile();
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
  }>({
    fullName: '',
    email: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(getApiUrl('/api/users/me'), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      updateProfile(updatedUser);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi khi cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (newAvatarUrl: string | null) => {
    console.log('Avatar changed to:', newAvatarUrl);
    console.log('Current user before update:', user);
    updateAvatar(newAvatarUrl);
    console.log('User after updateAvatar:', user);
    // Also refetch user data to ensure sync
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Không thể tải thông tin người dùng</h2>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản và ảnh đại diện của bạn</p>
        </div>

        {/* Avatar Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ảnh đại diện</h2>
          <AvatarUpload
            currentAvatarUrl={user.avatarUrl}
            onAvatarChange={handleAvatarChange}
            isLoading={false}
          />
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                <User size={16} className="inline mr-1" />
                Họ và tên
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <Mail size={16} className="inline mr-1" />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Role (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
              </div>
            </div>

            {/* Created Date (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày tạo tài khoản
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {new Date(user.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};