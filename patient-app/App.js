import React from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';

const CLERK_PUBLISHABLE_KEY = pk_test_bWVhc3VyZWQtYnVycm8tMzIuY2xlcmsuYWNjb3VudHMuZGV2JA; // Replace with your Clerk Publishable Key

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ClerkProvider>
  );
}