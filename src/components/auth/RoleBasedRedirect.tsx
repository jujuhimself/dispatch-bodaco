import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  switch(user.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'dispatcher':
      return <Navigate to="/dispatcher-dashboard" replace />;
    case 'responder':
      return <Navigate to="/responder-dashboard" replace />;
    default:
      return <Navigate to="/user-dashboard" replace />;
  }
};

export default RoleBasedRedirect;
