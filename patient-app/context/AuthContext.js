import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useClerk, useUser } from '@clerk/clerk-expo';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const { signOut } = useClerk();
    const { user: clerkUser, isLoaded } = useUser();

    useEffect(() => {
        const loadUser = async () => {
            if (isLoaded && clerkUser) {
                const userData = {
                    id: clerkUser.id,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    userType: clerkUser.publicMetadata?.userType || 'User',
                };
                setUser(userData);
                await AsyncStorage.setItem('userId', userData.id);
            }
        };
        loadUser();
    }, [isLoaded, clerkUser]);

    const logout = async () => {
        await signOut();
        setUser(null);
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('activePatientId');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};