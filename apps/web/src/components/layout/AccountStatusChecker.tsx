import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectUser, logout } from '../../features/auth/auth.slice';
import { useMeQuery } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';

export default function AccountStatusChecker() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Chỉ query khi user đã login
  const { error } = useMeQuery(undefined, {
    skip: !user,
    pollingInterval: 30000 // Check every 30 seconds
  });

  useEffect(() => {
    const apiError = error as { status?: number };
    if (error && apiError?.status === 403) {
      // Tài khoản bị khóa, logout và hiển thị thông báo
      dispatch(logout());
      alert('Tài khoản của bạn đã bị khóa bởi quản trị viên. Bạn sẽ được chuyển về trang đăng nhập.');
      navigate('/login');
    }
  }, [error, dispatch, navigate]);

  return null; // Component này không render gì cả
}