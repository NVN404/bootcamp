import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { ClerkProvider, useSignIn, useAuth, useClerk } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Audio } from 'expo-av';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Added for chatbot icon

const CLERK_PUBLISHABLE_KEY = 'pk_test_bWVhc3VyZWQtYnVycm8tMzIuY2xlcmsuYWNjb3VudHMuZGV2JA';
const BASE_URL = 'http://192.168.72.237:5000';

// Function to get the last 30 days for the report chart
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

// Function to generate colors for chart lines
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

const App = () => {
  // State for screen navigation
  const [currentScreen, setCurrentScreen] = useState('Login'); // 'Login', 'Reminder', 'Report'
  const [user, setUser] = useState(null);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Reminder state
  const [medicines, setMedicines] = useState([]);
  const [reminderError, setReminderError] = useState('');
  const [activePatientId, setActivePatientId] = useState(null);
  const [alarmTriggered, setAlarmTriggered] = useState(null);
  const [noResponseCount, setNoResponseCount] = useState(0);
  const [adviceMessage, setAdviceMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [sound, setSound] = useState(null);

  // Report state
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [intakeData, setIntakeData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [reportError, setReportError] = useState('');

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Clerk hooks
  const { signIn } = useSignIn();
  const { userId, getToken, isLoaded } = useAuth();
  const { signOut } = useClerk();

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      if (isLoaded && userId) {
        const userData = {
          id: userId,
          userType: 'User',
        };
        setUser(userData);
        await AsyncStorage.setItem('userId', userData.id);
        setCurrentScreen('Reminder');
      }
    };
    loadUser();
  }, [isLoaded, userId]);

  // Load audio for reminders
  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/buttons/beep-01a.mp3' }
      );
      setSound(sound);
    };
    loadSound();

    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const playSound = async () => {
    if (sound) await sound.playAsync();
  };

  const stopSound = async () => {
    if (sound) await sound.stopAsync();
  };

  // Handle login
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
          userType: 'User',
        };
        setUser(userData);
        await AsyncStorage.setItem('userId', userData.id);
        setCurrentScreen('Reminder');
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } catch (err) {
      setLoginError(err.errors?.[0]?.message || 'Login failed');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('activePatientId');
      setCurrentScreen('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Reminder logic
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const token = await getToken();
        let response;
        const storedActivePatientId = await AsyncStorage.getItem('activePatientId');
        if (storedActivePatientId) {
          setActivePatientId(storedActivePatientId);
          response = await axios.get(`${BASE_URL}/api/auth/patients/by-id/${storedActivePatientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          response = await axios.get(`${BASE_URL}/api/auth/patients/latest/${userId}`, {
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
          setReminderError('No medicines found for this patient');
        }
      } catch (error) {
        console.error('Error fetching medicines:', error);
        setReminderError(error.response?.data?.message || 'Failed to fetch medicines');
      }
    };

    if (userId && currentScreen === 'Reminder') fetchMedicines();
  }, [userId, currentScreen]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setMedicines((prev) =>
        prev.map((med) => {
          if (med.timeLeft > 0) {
            const newTimeLeft = med.timeLeft - 1;
            if (newTimeLeft === 0) {
              setAlarmTriggered(med.name);
              setShowPopup(true);
              playSound();
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
        playSound();
      }
    }, 60000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(promptInterval);
      stopSound();
    };
  }, [showPopup]);

  useEffect(() => {
    if (showPopup) {
      const timeout = setTimeout(() => {
        setShowPopup(false);
        stopSound();
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [showPopup]);

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
      const token = await getToken();
      await axios.post(
        `${BASE_URL}/api/auth/medicine-intake`,
        { patientId: activePatientId, medicineName, taken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlarmTriggered(null);
      setNoResponseCount(0);
      setShowPopup(false);
      stopSound();
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
      setReminderError('Failed to record medicine intake');
    }
  };

  // Report logic
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = await getToken();
        let patientResponse;
        const storedActivePatientId = await AsyncStorage.getItem('activePatientId');
        if (storedActivePatientId) {
          patientResponse = await axios.get(`${BASE_URL}/api/auth/patients/by-id/${storedActivePatientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          patientResponse = await axios.get(`${BASE_URL}/api/auth/patients/latest/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await AsyncStorage.setItem('activePatientId', patientResponse.data._id);
        }
        const patient = patientResponse.data;

        if (!patient || !patient.medicines || patient.medicines.length === 0) {
          setReportError('No medicines found for this patient');
          return;
        }

        setPrescribedMedicines(patient.medicines);

        const intakeResponse = await axios.get(`${BASE_URL}/api/auth/medicine-intake/${storedActivePatientId || patient._id}`, {
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
        setReportError(error.response?.data?.message || 'Error fetching patient data');
      }
    };

    if (userId && currentScreen === 'Report') {
      fetchReportData();
      const interval = setInterval(fetchReportData, 10000);
      return () => clearInterval(interval);
    }
  }, [userId, currentScreen]);

  // Chatbot logic
  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, sender: 'user' };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');

    try {
      const token = await getToken();
      const response = await axios.post(
        `${BASE_URL}/api/auth/chatbot`,
        { message: chatInput, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botMessage = { text: response.data.reply, sender: 'bot' };
      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = { text: 'Sorry, I couldn’t process that.', sender: 'bot' };
      setChatMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Render functions
  const renderLoginScreen = () => (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Welcome back! Please sign in.</Text>
        {loginError ? <Text style={styles.error}>{loginError}</Text> : null}
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

  const renderReminderScreen = () => (
    <View style={styles.container}>
      {adviceMessage ? (
        <View style={styles.adviceMessage}>
          <Text style={styles.adviceText}>{adviceMessage}</Text>
        </View>
      ) : null}
      <View style={styles.content}>
        <Text style={styles.header}>Medicine Reminder</Text>
        {reminderError ? (
          <Text style={styles.error}>{reminderError}</Text>
        ) : medicines.length === 0 ? (
          <Text style={styles.noMedicines}>No medicines scheduled.</Text>
        ) : (
          <FlatList
            data={medicines}
            renderItem={({ item }) => (
              <View style={styles.medicineCard}>
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{item.name}</Text>
                  <Text style={styles.medicineDetail}>Dose: {item.dose}</Text>
                  <Text style={styles.medicineDetail}>Times: {item.times.join(', ')}</Text>
                  <Text style={styles.medicineDetail}>Frequency: {item.frequency}</Text>
                </View>
                <View style={styles.medicineTimer}>
                  <Text style={styles.timerText}>
                    {item.timeLeft > 0 ? formatTimeLeft(item.timeLeft) : 'Time’s Up!'}
                  </Text>
                  {item.timeLeft === 0 && <Text style={styles.alertText}>Take Now!</Text>}
                </View>
              </View>
            )}
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
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setCurrentScreen('Report')}
        >
          <Text style={styles.footerButtonText}>View Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReportScreen = () => (
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
              renderItem={({ item }) => (
                <View style={styles.medicineCard}>
                  <Text style={styles.medicineText}><Text style={styles.bold}>Name:</Text> {item.name}</Text>
                  <Text style={styles.medicineText}><Text style={styles.bold}>Dose:</Text> {item.dose}</Text>
                  <Text style={styles.medicineText}><Text style={styles.bold}>Times:</Text> {item.times.join(', ')}</Text>
                  <Text style={styles.medicineText}><Text style={styles.bold}>Prescribed Frequency:</Text> {item.frequency}</Text>
                </View>
              )}
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
          ) : reportError ? (
            <Text style={styles.error}>{reportError}</Text>
          ) : (
            <Text style={styles.loading}>Loading chart...</Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setCurrentScreen('Reminder')}
        >
          <Text style={styles.footerButtonText}>Back to Reminders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChatInterface = () => (
    <Modal visible={isChatOpen} animationType="slide" transparent>
      <View style={styles.chatModalOverlay}>
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Medicine Assistant</Text>
            <TouchableOpacity onPress={() => setIsChatOpen(false)}>
              <Icon name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={chatMessages}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.chatMessage,
                  item.sender === 'user' ? styles.userMessage : styles.botMessage,
                ]}
              >
                <Text style={styles.chatMessageText}>{item.text}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.chatList}
          />
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Ask about your medicines..."
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Icon name="send" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Main render
  return (
    <View style={styles.container}>
      {currentScreen === 'Login' && renderLoginScreen()}
      {currentScreen === 'Reminder' && renderReminderScreen()}
      {currentScreen === 'Report' && renderReportScreen()}
      
      {/* Floating Chatbot Button */}
      {currentScreen !== 'Login' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsChatOpen(true)}
        >
          <Icon name="chat" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Chat Interface */}
      {renderChatInterface()}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  formContainer: {
    width: '90%',
    maxWidth: 700,
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FF4040',
    marginBottom: 48,
    alignSelf: 'center',
    marginTop: 100,
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
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 80,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4040',
    textAlign: 'center',
    marginBottom: 32,
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
    backgroundColor: '#E6F0FA',
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
    flexDirection: 'column',
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
    color: '#4B0082',
  },
  alertText: {
    color: '#FF4040',
    fontSize: 12,
    marginTop: 8,
  },
  adviceMessage: {
    backgroundColor: '#FFF9C4',
    padding: 16,
    alignItems: 'center',
  },
  adviceText: {
    color: '#D32F2F',
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
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  noButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
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
  loading: {
    color: '#666',
    textAlign: 'center',
  },
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
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#FF4040',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  chatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#FFF',
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF4040',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  chatList: {
    flexGrow: 1,
  },
  chatMessage: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#FF4040',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  chatMessageText: {
    fontSize: 16,
    color: '#333',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#FF4040',
    padding: 10,
    borderRadius: 20,
  },
});

export default function AppWrapper() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  );
}