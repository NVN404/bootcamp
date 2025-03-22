import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from './Footer';
import { AuthContext } from '../context/AuthContext';

const getLast30Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { day: 'numeric' }));
    }
    return dates;
};

const generateColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
    }
    return colors;
};

export default function ReportScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const userId = user?.id;
    const activePatientId = AsyncStorage.getItem('activePatientId');
    const [prescribedMedicines, setPrescribedMedicines] = useState([]);
    const [intakeData, setIntakeData] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                let patientResponse;
                if (activePatientId) {
                    patientResponse = await axios.get(`http://localhost:5000/api/auth/patients/by-id/${activePatientId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } else {
                    patientResponse = await axios.get(`http://localhost:5000/api/auth/patients/latest/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    await AsyncStorage.setItem('activePatientId', patientResponse.data._id);
                }
                const patient = patientResponse.data;

                if (!patient || !patient.medicines || patient.medicines.length === 0) {
                    setError('No medicines found for this patient');
                    return;
                }

                setPrescribedMedicines(patient.medicines);

                const intakeResponse = await axios.get(`http://localhost:5000/api/auth/medicine-intake/${activePatientId || patient._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const intakes = intakeResponse.data;

                setIntakeData(intakes);

                const days = getLast30Days();
                const colors = generateColors(patient.medicines.length);
                const datasets = patient.medicines.map((med, index) => {
                    const dailyData = days.map(() => 0);
                    intakes
                        .filter((intake) => intake.medicineName === med.name)
                        .forEach((intake) => {
                            const date = new Date(intake.date).toLocaleDateString('en-US', { day: 'numeric' });
                            const dayIndex = days.indexOf(date);
                            if (dayIndex !== -1) {
                                dailyData[dayIndex] += intake.frequency;
                            }
                        });

                    return {
                        data: dailyData,
                        color: () => colors[index],
                        strokeWidth: 2,
                    };
                });

                const data = {
                    labels: days,
                    datasets: datasets,
                    legend: patient.medicines.map((med) => med.name),
                };

                setChartData(data);
            } catch (error) {
                console.error('Fetch Error:', error.response || error.message);
                setError(error.response?.data?.message || 'Error fetching patient data');
            }
        };

        if (userId) {
            fetchData();
            const interval = setInterval(fetchData, 10000);
            return () => clearInterval(interval);
        } else {
            setError('No user ID provided! Please log in.');
        }
    }, [userId, activePatientId]);

    const renderMedicineItem = ({ item }) => (
        <View style={styles.medicineCard}>
            <Text style={styles.medicineText}><Text style={styles.bold}>Name:</Text> {item.name}</Text>
            <Text style={styles.medicineText}><Text style={styles.bold}>Dose:</Text> {item.dose}</Text>
            <Text style={styles.medicineText}><Text style={styles.bold}>Times:</Text> {item.times.join(', ')}</Text>
            <Text style={styles.medicineText}><Text style={styles.bold}>Prescribed Frequency:</Text> {item.frequency}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Medication Report</Text>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prescribed Medicines</Text>
                    {prescribedMedicines.length === 0 ? (
                        <Text style={styles.noData}>No medicines prescribed.</Text>
                    ) : (
                        <FlatList
                            data={prescribedMedicines}
                            renderItem={renderMedicineItem}
                            keyExtractor={(item, index) => index.toString()}
                            scrollEnabled={false}
                        />
                    )}
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Medicine Intake Trends (Last 30 Days)</Text>
                    {chartData ? (
                        <LineChart
                            data={chartData}
                            width={350}
                            height={220}
                            chartConfig={{
                                backgroundColor: '#FFF',
                                backgroundGradientFrom: '#FFF',
                                backgroundGradientTo: '#FFF',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: '3', strokeWidth: '2' },
                            }}
                            style={styles.chart}
                        />
                    ) : error ? (
                        <Text style={styles.error}>{error}</Text>
                    ) : (
                        <Text style={styles.loading}>Loading chart...</Text>
                    )}
                </View>
            </ScrollView>
            <Footer navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // gray-100 equivalent
    },
    content: {
        padding: 16,
        paddingBottom: 80,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    section: {
        marginBottom: 32,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    medicineCard: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    medicineText: {
        fontSize: 14,
        color: '#333',
    },
    bold: {
        fontWeight: '600',
    },
    noData: {
        color: '#666',
    },
    chart: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    error: {
        color: '#FF4040',
        textAlign: 'center',
    },
    loading: {
        color: '#666',
        textAlign: 'center',
    },
});