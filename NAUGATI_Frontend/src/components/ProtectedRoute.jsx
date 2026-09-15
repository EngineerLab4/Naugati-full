import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Redirect them to the /auth page, but save the current location they were
    // trying to go to if we wanted to redirect them back later.
    return <Navigate to="/auth" />;
  }

  return children;
}
