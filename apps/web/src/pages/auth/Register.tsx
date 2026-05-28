import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Gọi API đăng ký thật
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setMessageType('success');
        
        // Reset form
        setFullName('');
        setEmail('');
        setPassword('');
        
        // Tự động chuyển về trang login sau 2 giây
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Hiển thị lỗi từ server
        setMessage(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        setMessageType('error');
      }
      
    } catch (error) {
      console.error('Register failed:', error);
      setMessage('Có lỗi xảy ra. Vui lòng kiểm tra kết nối và thử lại.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>Tạo tài khoản mới</h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Hoàn toàn miễn phí và dễ sử dụng</p>
        </div>

        {/* Message */}
        {message && (
          <div 
            style={{
              background: messageType === 'success' ? '#f0fdf4' : '#fef2f2',
              border: messageType === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span style={{ marginRight: '12px', fontSize: '20px' }}>
              {messageType === 'success' ? '✅' : '⚠️'}
            </span>
            <p style={{ color: messageType === 'success' ? '#15803d' : '#dc2626', margin: 0 }}>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Họ và tên</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box' }} 
              placeholder="Nguyễn Văn A" 
              required 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box' }} 
              placeholder="your.email@example.com" 
              required 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box' }} 
              placeholder="Tối thiểu 4 ký tự" 
              minLength={4}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              width: '100%', 
              background: isLoading ? '#d1d5db' : '#10b981', 
              color: 'white', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              padding: '16px', 
              borderRadius: '12px', 
              border: 'none', 
              cursor: isLoading ? 'not-allowed' : 'pointer' 
            }}
          >
            {isLoading ? '⏳ Đang tạo tài khoản...' : ' Tạo tài khoản miễn phí'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>Đã có tài khoản? <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Đăng nhập ngay </button></p>
        </div>
      </div>
    </div>
  );
}
