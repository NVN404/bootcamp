import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';

const Reminder = () => {
  const location = useLocation();
  const { patientId, isDoctor = false } = location.state || {};
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id;
  const storedPatientId = window.localStorage.getItem('activePatientId');
  const initialPatientId = isDoctor ? patientId : storedPatientId || null;
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: '', dose: '', times: [], frequency: 0 });
  const [error, setError] = useState('');
  const [activePatientId, setActivePatientId] = useState(initialPatientId);
  const [alarmTriggered, setAlarmTriggered] = useState(null);
  const [noResponseCount, setNoResponseCount] = useState(0);
  const [adviceMessage, setAdviceMessage] = useState('');

  const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');

  useEffect(() => {
    console.log('Reminder State:', { patientId, isDoctor, userId, activePatientId });
    const fetchMedicines = async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Failed to retrieve authentication token');
        }

        let response;
        if (isDoctor && activePatientId) {
          response = await axios.get(`http://localhost:5000/api/auth/patients/by-id/${activePatientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (activePatientId) {
          response = await axios.get(`http://localhost:5000/api/auth/patients/by-id/${activePatientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          response = await axios.get(`http://localhost:5000/api/auth/patients/latest/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setActivePatientId(response.data._id);
          window.localStorage.setItem('activePatientId', response.data._id);
        }
        const patient = response.data;
        if (patient && patient.medicines) {
          const updatedMedicines = patient.medicines.map((med) => ({
            ...med,
            timeLeft: calculateNextTimeLeft(med.times),
          }));
          setMedicines(updatedMedicines);
        } else {
          setError('No medicines found for this patient');
        }
      } catch (error) {
        console.error('Error fetching medicines:', error);
        setError(error.response?.data?.message || 'Failed to fetch medicines');
      }
    };

    if (isDoctor ? activePatientId : (userId || activePatientId)) fetchMedicines();
  }, [activePatientId, isDoctor, userId, getToken]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setMedicines((prev) =>
        prev.map((med) => {
          if (med.timeLeft > 0) {
            const newTimeLeft = med.timeLeft - 1;
            if (newTimeLeft === 0 && !isDoctor) {
              setAlarmTriggered(med.name);
              audio.play().catch(err => console.error('Audio play failed:', err));
            }
            return { ...med, timeLeft: newTimeLeft };
          }
          return med;
        })
      );
    }, 1000);

    const promptInterval = setInterval(() => {
      if (alarmTriggered && noResponseCount > 0) {
        setNoResponseCount(prev => prev + 1);
        audio.play().catch(err => console.error('Audio play failed:', err));
      }
    }, 60000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(promptInterval);
    };
  }, [isDoctor, alarmTriggered, noResponseCount]);

  const calculateNextTimeLeft = (times) => {
    const now = new Date();
    let nextTimeDiff = Infinity;

    // Filter out invalid times and calculate the next valid time
    const validTimes = times.filter(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return !isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    });

    if (validTimes.length === 0) return 0; // Default to 0 if no valid times

    validTimes.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const reminderTime = new Date(now);
      reminderTime.setHours(hours, minutes, 0, 0);
      if (reminderTime < now) reminderTime.setDate(reminderTime.getDate() + 1);
      const timeDiff = reminderTime - now;
      if (timeDiff < nextTimeDiff) {
        nextTimeDiff = timeDiff;
      }
    });

    return Math.max(0, Math.floor(nextTimeDiff / 1000));
  };

  const formatTimeLeft = (seconds) => {
    if (!isFinite(seconds) || seconds < 0) return '00:00:00'; // Handle invalid inputs
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMedicineIntake = async (medicineName, taken) => {
    try {
      const token = await getToken();
      await axios.post(
        'http://localhost:5000/api/auth/medicine-intake',
        { patientId: activePatientId, medicineName, taken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlarmTriggered(null);
      setNoResponseCount(0);
      if (!taken) {
        setAdviceMessage(`Please take ${medicineName} as soon as possible. Consult your doctor if needed.`);
        setTimeout(() => setAdviceMessage(''), 30000);
      }
      setMedicines((prev) =>
        prev.map((med) =>
          med.name === medicineName
            ? { ...med, timeLeft: calculateNextTimeLeft(med.times) }
            : med
        )
      );
    } catch (error) {
      console.error('Error recording medicine intake:', error);
      setError('Failed to record medicine intake');
    }
  };

  const handleFrequencyChange = (e) => {
    const frequency = Number(e.target.value);
    setNewMedicine((prev) => {
      const times = Array.from({ length: Math.min(frequency, 3) }, (_, i) => prev.times[i] || '');
      return { ...prev, frequency, times };
    });
  };

  const handleTimeChange = (index, value) => {
    setNewMedicine((prev) => {
      const times = [...prev.times];
      times[index] = value;
      return { ...prev, times };
    });
  };

  const addMedicine = async () => {
    // Enhanced validation for times
    const validTimes = newMedicine.times.filter(time => time && /^\d{2}:\d{2}$/.test(time));
    if (!newMedicine.name || !newMedicine.dose || newMedicine.frequency <= 0 || validTimes.length < newMedicine.frequency) {
      setError('Please fill all fields and provide valid times (HH:MM) for the frequency');
      return;
    }

    const updatedMedicines = [
      ...medicines,
      { ...newMedicine, timeLeft: calculateNextTimeLeft(newMedicine.times) },
    ];
    setMedicines(updatedMedicines);
    setNewMedicine({ name: '', dose: '', times: [], frequency: 0 });
    setError('');

    try {
      const token = await getToken();
      const endpoint = `http://localhost:5000/api/auth/patients/${activePatientId}/medicines`;
      await axios.put(
        endpoint,
        { medicines: updatedMedicines },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Medicine added successfully');
    } catch (error) {
      console.error('Error adding medicine:', error);
      setError('Failed to add medicine');
      setMedicines(medicines); // Revert to previous state on error
    }
  };

  const removeMedicine = async (index) => {
    const updatedMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(updatedMedicines);
    setError('');

    try {
      const token = await getToken();
      const endpoint = `http://localhost:5000/api/auth/patients/${activePatientId}/medicines`;
      await axios.put(
        endpoint,
        { medicines: updatedMedicines },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Medicine removed successfully');
    } catch (error) {
      console.error('Error removing medicine:', error);
      setError('Failed to remove medicine');
      setMedicines(medicines); // Revert to previous state on error
    }
  };

  return (
    <div>
      {adviceMessage && (
        <div className="bg-yellow-200 text-center p-4 text-red-600 font-semibold">
          {adviceMessage}
        </div>
      )}
      <div className="min-h-screen from-brightRed-100 via-purple-100 to-pink-100 flex items-center justify-center p-6 back">
        <div className="rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-center text-brightRed mb-8">Medicine Reminder</h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div>
            <h2 className="text-2xl font-semibold text-brightRed mb-4">Medicine Schedule</h2>
            {medicines.length === 0 ? (
              <p className="text-gray-500 text-center">No medicines scheduled.</p>
            ) : (
              <div className="space-y-4">
                {medicines.map((medicine, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <FaBell className="text-brightRed" />
                      <div>
                        <p className="text-lg font-medium text-gray-800">{medicine.name}</p>
                        <p className="text-sm text-gray-600">Dose: {medicine.dose}</p>
                        <p className="text-sm text-gray-600">Times: {medicine.times.join(', ')}</p>
                        <p className="text-sm text-gray-600">Frequency: {medicine.frequency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono text-indigo-600">
                        {medicine.timeLeft > 0 ? formatTimeLeft(medicine.timeLeft) : 'Time’s Up!'}
                      </p>
                      {medicine.timeLeft === 0 && (
                        <span className="text-red-500 text-sm animate-pulse">Take Now!</span>
                      )}
                      {isDoctor && (
                        <button
                          onClick={() => removeMedicine(index)}
                          className="mt-2 text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isDoctor && (
            <div className="mt-8 w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-brightRed mb-4">Add Medicine</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Dose"
                  value={newMedicine.dose}
                  onChange={(e) => setNewMedicine({ ...newMedicine, dose: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Frequency"
                  value={newMedicine.frequency}
                  onChange={handleFrequencyChange}
                  className="w-full p-2 border rounded"
                />
                {Array.from({ length: Math.min(newMedicine.frequency, 3) }).map((_, index) => (
                  <input
                    key={index}
                    type="time"
                    value={newMedicine.times[index] || ''}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder={`Time ${index + 1}`}
                  />
                ))}
                <button
                  onClick={addMedicine}
                  className="w-full p-2 bg-brightRed text-white rounded hover:bg-red-700"
                >
                  Add Medicine
                </button>
              </div>
            </div>
          )}

          {alarmTriggered && !isDoctor && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Time to take {alarmTriggered}! (Prompt {noResponseCount + 1})
                </h3>
                <p className="mb-4">Did you take the medicine?</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleMedicineIntake(alarmTriggered, true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleMedicineIntake(alarmTriggered, false)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Reminder;