import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectAuth } from './auth.slice';

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const { accessToken } = useAppSelector(selectAuth);
  const loc = useLocation();
  if (!accessToken) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}
