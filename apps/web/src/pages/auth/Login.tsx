import { useLoginMutation } from '../../api/auth.api';
import { setToken, setUser } from '../../features/auth/auth.slice';
import { useAppDispatch } from '../../store/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setToken(res.accessToken));
      dispatch(setUser(res.me));
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      
      const apiError = error as { status?: number; data?: { message?: string } };
      
      if (apiError?.status === 403) {
        setError('Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ để được hỗ trợ.');
      } else if (apiError?.status === 401) {
        setError('Email hoặc mật khẩu không đúng');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div style={{ background: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>Expense Manager</h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Đăng nhập để quản lý tài chính của bạn</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}> Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box' }} placeholder="your.email@example.com" required />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}> Mật khẩu</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box' }} placeholder="Nhập mật khẩu của bạn" required />
          </div>

          <button type="submit" disabled={isLoading} style={{ width: '100%', background: isLoading ? '#d1d5db' : '#3b82f6', color: 'white', fontWeight: 'bold', fontSize: '16px', padding: '16px', borderRadius: '12px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? ' Đang đăng nhập...' : ' Đăng nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>Chưa có tài khoản? <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Tạo tài khoản miễn phí </button></p>
        </div>
      </div>
    </div>
  );
}
