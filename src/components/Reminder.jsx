import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import Footer from './Footer';
import axios from 'axios';

const Reminder = ({ patientId, isDoctor = false }) => {
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: '', dose: '', time: '', frequency: 0 });

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/patients/${patientId}`);
        const patient = response.data[0]; // Assuming one patient per userId
        if (patient && patient.medicines) {
          const updatedMedicines = patient.medicines.map(med => ({
            ...med,
            timeLeft: calculateTimeLeft(med.time),
          }));
          setMedicines(updatedMedicines);
        }
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };

    if (patientId) fetchMedicines();
  }, [patientId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMedicines((prev) =>
        prev.map((med) => {
          if (med.timeLeft > 0) {
            const newTimeLeft = med.timeLeft - 1;
            if (newTimeLeft === 0) {
              alert(`Time to take ${med.name} (${med.dose})!`);
            }
            return { ...med, timeLeft: newTimeLeft };
          }
          return med;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateTimeLeft = (time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);
    if (reminderTime < now) reminderTime.setDate(reminderTime.getDate() + 1);
    return Math.max(0, Math.floor((reminderTime - now) / 1000));
  };

  const formatTimeLeft = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addMedicine = async () => {
    if (!newMedicine.name || !newMedicine.dose || !newMedicine.time || !newMedicine.frequency) {
      alert('Please fill all fields');
      return;
    }

    const updatedMedicines = [
      ...medicines,
      { ...newMedicine, timeLeft: calculateTimeLeft(newMedicine.time) },
    ];
    setMedicines(updatedMedicines);
    setNewMedicine({ name: '', dose: '', time: '', frequency: 0 });

    try {
      await axios.put(`http://localhost:5000/api/auth/patients/${patientId}/medicines`, {
        medicines: updatedMedicines,
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
  };

  const removeMedicine = async (index) => {
    const updatedMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(updatedMedicines);

    try {
      await axios.put(`http://localhost:5000/api/auth/patients/${patientId}/medicines`, {
        medicines: updatedMedicines,
      });
    } catch (error) {
      console.error('Error removing medicine:', error);
    }
  };

  return (
    <div>
      <div className="min-h-screen from-brightRed-100 via-purple-100 to-pink-100 flex items-center justify-center p-6 back">
        <div className="rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-center text-brightRed mb-8">Medicine Reminder</h1>

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
                        <p className="text-sm text-gray-600">Time: {medicine.time}</p>
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
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-brightRed mb-4">Add Medicine</h2>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Dose"
                  value={newMedicine.dose}
                  onChange={(e) => setNewMedicine({ ...newMedicine, dose: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="time"
                  value={newMedicine.time}
                  onChange={(e) => setNewMedicine({ ...newMedicine, time: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Frequency"
                  value={newMedicine.frequency}
                  onChange={(e) => setNewMedicine({ ...newMedicine, frequency: Number(e.target.value) })}
                  className="p-2 border rounded"
                />
                <button
                  onClick={addMedicine}
                  className="bg-brightRed text-white p-2 rounded hover:bg-red-700"
                >
                  Add Medicine
                </button>
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