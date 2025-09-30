import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [lastPath, setLastPath] = useState(location.pathname);

  // Update last path when location changes
  useEffect(() => {
    if (location.pathname !== lastPath) {
      console.log('Route changed from', lastPath, 'to', location.pathname);
      setLastPath(location.pathname);
    }
  }, [location, lastPath]);

  useEffect(() => {
    console.log('ProtectedRoute - Auth state changed:', {
      isLoading,
      user: user ? { id: user.id, email: user.email } : null,
      currentPath: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading, location.pathname]);

  if (isLoading) {
    console.log('ProtectedRoute: Loading authentication state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    console.log('Redirecting to /login from', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};