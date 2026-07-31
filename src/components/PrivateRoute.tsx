import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from './Loader';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFinanceiro?: boolean;
}

export function PrivateRoute({ children, requireAdmin = false, requireFinanceiro = false   }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Se estiver carregando, mostra um indicador de carregamento
  if (isLoading) {
    return <PageLoader />;
  }

  // Se não estiver autenticado, redireciona para o login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se precisar de admin e o usuário não for admin, redireciona para a página inicial
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requireFinanceiro && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 