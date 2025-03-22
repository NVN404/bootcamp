import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function Footer({ navigation }) {
    const { logout } = useContext(AuthContext);

    return (
        <View style={styles.footer}>
            <TouchableOpacity
                style={styles.footerButton}
                onPress={() => navigation.navigate('Report')}
            >
                <Text style={styles.footerButtonText}>View Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerButton: {
        backgroundColor: '#FF4040',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    footerButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#FF4040',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});