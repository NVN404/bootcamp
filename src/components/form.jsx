import React, { useState } from 'react';
import { SignIn, SignUp, useUser, useClerk, useSignUp } from '@clerk/clerk-react';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Form() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedUserType, setSelectedUserType] = useState('User');
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignUpComplete = async () => {
    if (!isLoaded || !user) {
      console.error('User not loaded yet');
      return;
    }
    try {
      // Get the token from the active session
      const token = await signUp.clerk.client.activeSessions[0]?.getToken();
      if (!token) {
        throw new Error('No session token available');
      }

      // Call backend to set userType
      const response = await axios.post(
        'http://localhost:5000/api/auth/set-user-type',
        { userType: selectedUserType },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Backend Response:', response.data);

      // Redirect based on userType (no need to sign out and sign in again)
      const userType = selectedUserType;
      navigate(userType === 'Doctor' ? '/doctor-dashboard' : '/');
    } catch (error) {
      console.error('Error updating user type:', error);
    }
  };

  const handleSignInComplete = () => {
    if (!isLoaded || !user) {
      console.error('User not loaded yet');
      return;
    }
    const userType = user.publicMetadata?.userType || 'User';
    console.log('User Type on sign-in:', userType);
    navigate(userType === 'Doctor' ? '/doctor-dashboard' : '/');
  };

  return (
    <div>
      <div className="mx-60 w-11/12 max-w-[700px] px-20 py-20 rounded-3xl border-2 border-brightRed bb-10 mb-12">
        <h1 className="text-5xl font-semibold">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="font-medium text-lg text-gray-500 mt-4">
          {isLogin ? 'Welcome back! Please sign in.' : 'Sign up to get started!'}
        </p>
        <div className="mt-8">
          {isLogin ? (
            <SignIn afterSignInUrl="/" onSignIn={handleSignInComplete} />
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Account Type</label>
                <select
                  value={selectedUserType}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                  className="w-full p-2 border-2 border-gray-100 rounded-xl mt-1 bg-transparent"
                >
                  <option value="User">User</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>
              <SignUp
                afterSignUpUrl="/get-started"
                onSignUp={handleSignUpComplete}
              />
            </>
          )}
        </div>
        <div className="mt-8 flex justify-center items-center">
          <p className="font-medium text-base">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 font-medium text-base text-violet-500"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
        {user && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLogout}
              className="active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01] ease-in-out transform py-4 bg-brightRed rounded-xl text-white font-bold text-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}