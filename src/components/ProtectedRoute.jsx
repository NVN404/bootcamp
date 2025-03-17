import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

function ProtectedRoute() {
  const { isSignedIn } = useUser();
  return isSignedIn ? <Outlet /> : <Navigate to="/get-started" />;
}

export default ProtectedRoute;