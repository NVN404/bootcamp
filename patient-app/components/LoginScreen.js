import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signIn } = useSignIn();
    const { setUser } = useContext(AuthContext);

    const handleLogin = async () => {
        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });
            if (result.status === 'complete') {
                const userData = {
                    id: result.createdSessionId,
                    email,
                    userType: 'User', // Since this is patient-only
                };
                setUser(userData);
                navigation.navigate('Reminder');
            } else {
                setError('Login failed. Please try again.');
            }
        } catch (err) {
            setError(err.errors?.[0]?.message || 'Login failed');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Welcome back! Please sign in.</Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        width: '90%',
        maxWidth: 700,
        backgroundColor: '#FFF',
        padding: 40,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#FF4040', // brightRed
        marginBottom: 48,
    },
    title: {
        fontSize: 48,
        fontWeight: '600',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
    },
    error: {
        color: '#FF4040',
        textAlign: 'center',
        marginTop: 16,
    },
    input: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        marginTop: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#FF4040',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 32,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});