import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from './Footer';
import { AuthContext } from '../context/AuthContext';

export default function ReminderScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const userId = user?.id;
    const [medicines, setMedicines] = useState([]);
    const [error, setError] = useState('');
    const [activePatientId, setActivePatientId] = useState(null);
    const [alarmTriggered, setAlarmTriggered] = useState(null);
    const [noResponseCount, setNoResponseCount] = useState(0);
    const [adviceMessage, setAdviceMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const audio = new Sound('https://www.soundjay.com/buttons/beep-01a.mp3', null, (error) => {
        if (error) {
            console.log('Failed to load sound:', error);
            return;
        }
    });

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                let response;
                if (activePatientId) {
                    response = await axios.get(`http://localhost:5000/api/auth/patients/by-id/${activePatientId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } else {
                    response = await axios.get(`http://localhost:5000/api/auth/patients/latest/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setActivePatientId(response.data._id);
                    await AsyncStorage.setItem('activePatientId', response.data._id);
                }
                const patient = response.data;
                if (patient && patient.medicines) {
                    const updatedMedicines = patient.medicines.map((med) => ({
                        ...med,
                        timeLeft: calculateNextTimeLeft(med.times),
                    }));
                    setMedicines(updatedMedicines);
                    const dueMedicine = updatedMedicines.find((med) => med.timeLeft === 0);
                    if (dueMedicine) {
                        setAlarmTriggered(dueMedicine.name);
                        setShowPopup(true);
                    }
                } else {
                    setError('No medicines found for this patient');
                }
            } catch (error) {
                console.error('Error fetching medicines:', error);
                setError(error.response?.data?.message || 'Failed to fetch medicines');
            }
        };

        if (userId) fetchMedicines();
    }, [activePatientId, userId]);

    useEffect(() => {
        const timerInterval = setInterval(() => {
            setMedicines((prev) =>
                prev.map((med) => {
                    if (med.timeLeft > 0) {
                        const newTimeLeft = med.timeLeft - 1;
                        if (newTimeLeft === 0) {
                            setAlarmTriggered(med.name);
                            setShowPopup(true);
                            audio.play();
                        }
                        return { ...med, timeLeft: newTimeLeft };
                    }
                    return med;
                })
            );
        }, 1000);

        const promptInterval = setInterval(() => {
            if (showPopup) {
                setNoResponseCount((prev) => prev + 1);
                audio.play();
            }
        }, 60000);

        return () => {
            clearInterval(timerInterval);
            clearInterval(promptInterval);
            audio.stop();
        };
    }, [showPopup, audio]);

    useEffect(() => {
        if (showPopup) {
            const timeout = setTimeout(() => {
                setShowPopup(false);
                audio.stop();
            }, 30000);
            return () => clearTimeout(timeout);
        }
    }, [showPopup, audio]);

    const calculateNextTimeLeft = (times) => {
        const now = new Date();
        let nextTimeDiff = Infinity;
        const validTimes = times.filter((time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return !isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
        });

        if (validTimes.length === 0) return 0;

        validTimes.forEach((time) => {
            const [hours, minutes] = time.split(':').map(Number);
            const reminderTime = new Date(now);
            reminderTime.setHours(hours, minutes, 0, 0);
            if (reminderTime < now) reminderTime.setDate(reminderTime.getDate() + 1);
            const timeDiff = reminderTime - now;
            if (timeDiff < nextTimeDiff) nextTimeDiff = timeDiff;
        });

        return Math.max(0, Math.floor(nextTimeDiff / 1000));
    };

    const formatTimeLeft = (seconds) => {
        if (!isFinite(seconds) || seconds < 0) return '00:00:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMedicineIntake = async (medicineName, taken) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/auth/medicine-intake',
                { patientId: activePatientId, medicineName, taken },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAlarmTriggered(null);
            setNoResponseCount(0);
            setShowPopup(false);
            audio.stop();
            if (!taken) {
                setAdviceMessage(`Please take ${medicineName} as soon as possible. Consult your doctor if needed.`);
                setTimeout(() => setAdviceMessage(''), 30000);
            } else {
                setAdviceMessage('');
            }
            setMedicines((prev) =>
                prev.map((med) =>
                    med.name === medicineName ? { ...med, timeLeft: calculateNextTimeLeft(med.times) } : med
                )
            );
        } catch (error) {
            console.error('Error recording medicine intake:', error);
            setError('Failed to record medicine intake');
        }
    };

    const renderMedicineItem = ({ item }) => (
        <View style={styles.medicineCard}>
            <View style={styles.medicineInfo}>
                <Feather name="bell" size={24} color="#FF4040" />
                <View style={styles.medicineDetails}>
                    <Text style={styles.medicineName}>{item.name}</Text>
                    <Text style={styles.medicineDetail}>Dose: {item.dose}</Text>
                    <Text style={styles.medicineDetail}>Times: {item.times.join(', ')}</Text>
                    <Text style={styles.medicineDetail}>Frequency: {item.frequency}</Text>
                </View>
            </View>
            <View style={styles.medicineTimer}>
                <Text style={styles.timerText}>
                    {item.timeLeft > 0 ? formatTimeLeft(item.timeLeft) : 'Time’s Up!'}
                </Text>
                {item.timeLeft === 0 && <Text style={styles.alertText}>Take Now!</Text>}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {adviceMessage ? (
                <View style={styles.adviceMessage}>
                    <Text style={styles.adviceText}>{adviceMessage}</Text>
                </View>
            ) : null}
            <View style={styles.content}>
                <Text style={styles.header}>Medicine Reminder</Text>
                {error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : medicines.length === 0 ? (
                    <Text style={styles.noMedicines}>No medicines scheduled.</Text>
                ) : (
                    <FlatList
                        data={medicines}
                        renderItem={renderMedicineItem}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
            </View>
            <Modal visible={showPopup} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Time to take {alarmTriggered}! (Prompt {noResponseCount + 1})
                        </Text>
                        <Text style={styles.modalText}>Did you take the medicine?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => handleMedicineIntake(alarmTriggered, true)}
                                style={styles.yesButton}
                            >
                                <Text style={styles.buttonText}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleMedicineIntake(alarmTriggered, false)}
                                style={styles.noButton}
                            >
                                <Text style={styles.buttonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Footer navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF4040', // brightRed-100 equivalent
    },
    content: {
        flex: 1,
        padding: 24,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FF4040',
        textAlign: 'center',
        marginBottom: 32,
    },
    error: {
        color: '#FF4040',
        textAlign: 'center',
        marginBottom: 16,
    },
    noMedicines: {
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    medicineCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#E6F0FA', // blue-50 to purple-50 gradient equivalent
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    medicineInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medicineDetails: {
        marginLeft: 16,
    },
    medicineName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
    },
    medicineDetail: {
        fontSize: 14,
        color: '#666',
    },
    medicineTimer: {
        alignItems: 'flex-end',
    },
    timerText: {
        fontSize: 16,
        fontFamily: 'monospace',
        color: '#4B0082', // indigo-600 equivalent
    },
    alertText: {
        color: '#FF4040',
        fontSize: 12,
        marginTop: 8,
    },
    adviceMessage: {
        backgroundColor: '#FFF9C4', // yellow-200 equivalent
        padding: 16,
        alignItems: 'center',
    },
    adviceText: {
        color: '#D32F2F', // red-600 equivalent
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    yesButton: {
        backgroundColor: '#4CAF50', // green-500
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    noButton: {
        backgroundColor: '#F44336', // red-500
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});