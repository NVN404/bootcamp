import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../components/LoginScreen';
import ReminderScreen from '../components/ReminderScreen';
import ReportScreen from '../components/ReportScreen';
import { AuthContext } from '../context/AuthContext';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { user } = useContext(AuthContext);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={user ? 'Reminder' : 'Login'}>
                {!user ? (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="Reminder"
                            component={ReminderScreen}
                            options={{
                                title: 'Medicine Reminder',
                                headerStyle: { backgroundColor: '#FF4040' },
                                headerTintColor: '#FFF',
                            }}
                        />
                        <Stack.Screen
                            name="Report"
                            component={ReportScreen}
                            options={{
                                title: 'Medication Report',
                                headerStyle: { backgroundColor: '#FF4040' },
                                headerTintColor: '#FFF',
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}