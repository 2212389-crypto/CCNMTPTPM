import { useState, useEffect } from 'react';
import { useListUsersQuery, useListUserActivitiesQuery, useDeleteUserMutation, User, UserActivity } from '../api/users.api';

export default function UsersManagement() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'activities'>('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const [deleteUser] = useDeleteUserMutation();
  
  const { data: usersData, isLoading: loadingUsers } = useListUsersQuery({ 
    page: 1, 
    limit: 50,
    sortBy: 'lastActivityAt',
    sortOrder: 'desc'
  }, {
    pollingInterval: 3000, // Refresh mỗi 3 giây
    skipPollingIfUnfocused: true
  });

  const { data: activitiesData, isLoading: loadingActivities } = useListUserActivitiesQuery({ 
    page: 1, 
    limit: 100,
    userId: selectedUserId || undefined,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  }, {
    pollingInterval: 3000, // Refresh mỗi 3 giây
    skipPollingIfUnfocused: true // Chỉ poll khi tab đang active
  });

  const users = usersData?.items ?? [];
  const activities = activitiesData?.items ?? [];

  // Update timestamp khi có data mới
  useEffect(() => {
    if (activitiesData) {
      setLastUpdate(new Date());
    }
  }, [activitiesData]);

  // Debug: Log user data to check fields
  console.log('Users data:', users);  const handleViewUserDetails = (user: User) => {
    setSelectedUserForModal(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa user "${user.fullName}" (${user.email})?\n\nViệc này sẽ xóa vĩnh viễn:\n- Tài khoản người dùng\n- Tất cả giao dịch\n- Tất cả tài khoản ngân hàng\n- Tất cả ngân sách\n- Tất cả dữ liệu liên quan\n\nHành động này KHÔNG THỂ hoàn tác!`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteUser(user.id).unwrap();
        alert(`Đã xóa thành công user ${user.fullName}`);
      } catch (error) {
        console.error('Error deleting user:', error);
        const err = error as { data?: { error?: string }; message?: string };
        alert(`Có lỗi khi xóa user: ${err?.data?.error || err?.message || 'Unknown error'}`);
      }
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Chưa có';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const getUserStatusInfo = (user: User) => {
    // Ẩn trạng thái hoạt động của Admin
    if (user.role === 'ADMIN') {
      return { text: 'Chưa có', color: '#6B7280', bgColor: '#F3F4F6' };
    }
    
    if (user.isCurrentlyActive) {
      return { text: 'Đang hoạt động', color: '#065F46', bgColor: '#D1FAE5' };
    } else {
      return { text: 'Không hoạt động', color: '#92400E', bgColor: '#FEF3C7' };
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'account': return 'Quản lý tài khoản';
      case 'transaction': return 'Quản lý giao dịch';
      case 'budget': return 'Quản lý ngân sách';
      case 'report': return 'Xem báo cáo';
      case 'login': return 'Đăng nhập';
      case 'logout': return 'Đăng xuất';
      default: return type;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'account': return '#3B82F6';       // Blue - Quản lý tài khoản
      case 'transaction': return '#10B981';   // Green - Giao dịch
      case 'budget': return '#F59E0B';        // Orange - Ngân sách
      case 'report': return '#8B5CF6';       // Purple - Báo cáo
      case 'login': return '#059669';        // Teal - Đăng nhập
      case 'logout': return '#DC2626';       // Red - Đăng xuất
      default: return '#6B7280';            // Gray - Mặc định
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          👥 Quản lý Users
        </h1>
        <p style={{ color: '#6B7280', fontSize: '16px' }}>
          Theo dõi hoạt động và quản lý trạng thái người dùng
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'users' ? '#3B82F6' : '#6B7280',
              borderBottom: activeTab === 'users' ? '2px solid #3B82F6' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Danh sách Users
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'activities' ? '#3B82F6' : '#6B7280',
              borderBottom: activeTab === 'activities' ? '2px solid #3B82F6' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Lịch sử hoạt động
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>
              Tổng số users: {users.length}
            </h3>
          </div>

          {loadingUsers ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              Đang tải dữ liệu...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      User
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Role
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Trạng thái
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Đăng nhập cuối
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Hoạt động cuối
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr 
                      key={user.id} 
                      style={{ 
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: selectedUserId === user.id ? '#F0F9FF' : 'white'
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            {user.fullName}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6B7280' }}>
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: user.role === 'ADMIN' ? '#FEF3C7' : '#DBEAFE',
                          color: user.role === 'ADMIN' ? '#92400E' : '#1E40AF'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getUserStatusInfo(user).bgColor,
                          color: getUserStatusInfo(user).color
                        }}>
                          {getUserStatusInfo(user).text}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                        {formatDateTime(user.lastLoginAt)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '2px' }}>
                            {formatDateTime(user.lastActivityAt)}
                          </div>
                          {user.lastActivityType && (
                            <div style={{ 
                              fontSize: '12px', 
                              color: getActivityColor(user.lastActivityType),
                              fontWeight: '500'
                            }}>
                              {getActivityTypeLabel(user.lastActivityType)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleViewUserDetails(user)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              border: '1px solid #D1D5DB',
                              borderRadius: '6px',
                              backgroundColor: 'white',
                              color: '#374151',
                              cursor: 'pointer'
                            }}
                          >
                            Xem chi tiết
                          </button>
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                border: '1px solid #EF4444',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                color: '#EF4444',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>
                  Lịch sử hoạt động {selectedUserId ? '(User đã chọn)' : '(Tất cả users)'}
                </h3>
                {selectedUserId && (
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0 0' }}>
                    Hiển thị hoạt động của user: {users.find((u: User) => u.id === selectedUserId)?.fullName}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                  Cập nhật cuối: {lastUpdate.toLocaleTimeString('vi-VN')}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  fontSize: '12px',
                  color: '#059669'
                }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: '#10B981',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }} />
                  Tự động cập nhật
                </div>
              </div>
            </div>
          </div>

          {loadingActivities ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              Đang tải dữ liệu...
            </div>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {activities.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                  Không có hoạt động nào
                </div>
              ) : (
                <div style={{ padding: '16px' }}>
                  {activities.map((activity: UserActivity, index: number) => {
                    const user = users.find((u: User) => u.id === activity.userId);
                    return (
                      <div 
                        key={activity.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          borderBottom: index < activities.length - 1 ? '1px solid #F3F4F6' : 'none',
                          gap: '12px'
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getActivityColor(activity.activityType),
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500', color: '#374151' }}>
                              {user?.fullName || 'Unknown User'}
                            </span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: '500',
                              backgroundColor: getActivityColor(activity.activityType) + '20',
                              color: getActivityColor(activity.activityType)
                            }}>
                              {getActivityTypeLabel(activity.activityType)}
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '2px' }}>
                            {activity.description}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                            {formatDateTime(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUserForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: 0 }}>
                Chi tiết User
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                style={{
                  padding: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Họ và tên:</label>
                <p style={{ fontSize: '16px', color: '#374151', margin: '4px 0 0 0' }}>{selectedUserForModal.fullName}</p>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Email:</label>
                <p style={{ fontSize: '16px', color: '#374151', margin: '4px 0 0 0' }}>{selectedUserForModal.email}</p>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Role:</label>
                <p style={{ fontSize: '16px', color: '#374151', margin: '4px 0 0 0' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: selectedUserForModal.role === 'ADMIN' ? '#FEF3C7' : '#DBEAFE',
                    color: selectedUserForModal.role === 'ADMIN' ? '#92400E' : '#1E40AF'
                  }}>
                    {selectedUserForModal.role}
                  </span>
                </p>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Trạng thái:</label>
                <p style={{ fontSize: '16px', margin: '4px 0 0 0' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getUserStatusInfo(selectedUserForModal).bgColor,
                    color: getUserStatusInfo(selectedUserForModal).color
                  }}>
                    {getUserStatusInfo(selectedUserForModal).text}
                  </span>
                </p>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Ngày tạo tài khoản:</label>
                <p style={{ fontSize: '16px', color: '#374151', margin: '4px 0 0 0' }}>
                  {formatDateTime(selectedUserForModal.createdAt)}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Đăng nhập cuối:</label>
                <p style={{ fontSize: '16px', color: '#374151', margin: '4px 0 0 0' }}>
                  {formatDateTime(selectedUserForModal.lastLoginAt)}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Hoạt động cuối:</label>
                <p style={{ fontSize: '16px', color: '#374151', margin: '4px 0 0 0' }}>
                  {formatDateTime(selectedUserForModal.lastActivityAt)}
                  {selectedUserForModal.lastActivityType && (
                    <span style={{ 
                      marginLeft: '8px',
                      fontSize: '12px', 
                      color: getActivityColor(selectedUserForModal.lastActivityType),
                      fontWeight: '500'
                    }}>
                      ({getActivityTypeLabel(selectedUserForModal.lastActivityType)})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setSelectedUserId(selectedUserId === selectedUserForModal.id ? null : selectedUserForModal.id);
                  setActiveTab('activities');
                  setShowUserModal(false);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #3B82F6',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#3B82F6',
                  cursor: 'pointer'
                }}
              >
                Xem lịch sử hoạt động
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}