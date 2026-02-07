import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  let isAdmin = false;
  if (user) {
    try {
      const parsed = JSON.parse(user);
      isAdmin = parsed.role === 'admin';
    } catch {
      isAdmin = false;
    }
  }

  if (!token || !user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default AdminRoute;
