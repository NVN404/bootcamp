import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const isLoggedIn = window.localStorage.getItem('loggedIn') === 'true';
  console.log('ProtectedRoute - isLoggedIn:', isLoggedIn);
  return isLoggedIn ? <Outlet /> : <Navigate to="/get-started" />;
}

export default ProtectedRoute;