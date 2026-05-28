import { NavLink, Outlet } from 'react-router-dom';
import Header from './Header';
import AccountStatusChecker from './AccountStatusChecker';
import { useAppSelector } from '../../app/hooks';

export default function AppLayout() {
  const user = useAppSelector((state) => state.auth.me);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Header />
      <AccountStatusChecker />
      
      {/* Sidebar Navigation */}
      <div style={{ display: 'flex' }}>
        <nav style={{
          width: '250px',
          backgroundColor: 'white',
          borderRight: '1px solid #E5E7EB',
          minHeight: 'calc(100vh - 73px)', // Subtract header height
          padding: '24px 0'
        }}>
          <div style={{ paddingLeft: '24px', paddingRight: '24px', marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Menu chính
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavLink 
              to="/"
              end
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                color: isActive ? '#3B82F6' : '#374151',
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                borderRight: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                transition: 'all 0.2s ease'
              })}
            >
              📊 Tổng quan
            </NavLink>
            
            <NavLink 
              to="/accounts"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                color: isActive ? '#3B82F6' : '#374151',
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                borderRight: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                transition: 'all 0.2s ease'
              })}
            >
              🏦 Tài khoản
            </NavLink>
            
            <NavLink 
              to="/transactions"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                color: isActive ? '#3B82F6' : '#374151',
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                borderRight: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                transition: 'all 0.2s ease'
              })}
            >
              💳 Giao dịch
            </NavLink>
            
            <NavLink 
              to="/reports"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                color: isActive ? '#3B82F6' : '#374151',
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                borderRight: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                transition: 'all 0.2s ease'
              })}
            >
              📈 Báo cáo
            </NavLink>
            
            {/* Admin only menu items */}
            {user?.role === 'ADMIN' && (
              <NavLink 
                to="/users"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  color: isActive ? '#3B82F6' : '#374151',
                  backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                  borderRight: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                })}
              >
                👥 Quản lý Users
              </NavLink>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#F9FAFB'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
