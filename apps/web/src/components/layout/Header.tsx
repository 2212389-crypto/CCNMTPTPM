import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../features/auth/auth.slice';
import { UserDropdown } from '../UserDropdown';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function Header() {
  const reduxUser = useAppSelector(selectUser);
  const { user: profileUser } = useUserProfile();
  
  // Use profile user data if available (has updated avatarUrl), otherwise fallback to redux
  const me = profileUser || reduxUser;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #E5E7EB',
      padding: '16px 24px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1F2937'
      }}>
        💰 Expense Manager
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {me ? (
          <UserDropdown user={me} />
        ) : (
          <Link 
            to="/login"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
