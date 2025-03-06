// src/App.jsx
// import App from './App.js';
import React, { useState, useEffect } from 'react';
import { FaBell,} from 'react-icons/fa';
import Footer from './Footer';



const Reminder = () => {
  // Hardcoded patient data
  const patient = {
    name: 'John Doe',
    age: 45,
    condition: 'Hypertension',
  };

  // Hardcoded medicine data with initial timeLeft calculated
  const initialMedicines = [
    { id: 1, name: 'Aspirin', dose: '1 tablet', time: '08:00', timeLeft: calculateTimeLeft('08:00') },
    { id: 2, name: 'Lisinopril', dose: '10 mg', time: '12:00', timeLeft: calculateTimeLeft('12:00') },
    { id: 3, name: 'Metformin', dose: '500 mg', time: '18:00', timeLeft: calculateTimeLeft('18:00') },
  ];

  const [medicines, setMedicines] = useState(initialMedicines);

  // Calculate initial time left in seconds
  function calculateTimeLeft(time) {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);
    if (reminderTime < now) reminderTime.setDate(reminderTime.getDate() + 1);
    return Math.max(0, Math.floor((reminderTime - now) / 1000));
  }

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setMedicines((prev) =>
        prev.map((med) => {
          if (med.timeLeft > 0) {
            const newTimeLeft = med.timeLeft - 1;
            if (newTimeLeft === 0) {
              alert('Time to take ${med.name} (${med.dose})!');
            }
            return { ...med, timeLeft: newTimeLeft };
          }
          return med;
        })
      );
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Format time left into hours, minutes, seconds
  const formatTimeLeft = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

  return (
    <div>
    <div className="min-h-screen from-brightRed-100 via-purple-100 to-pink-100 flex items-center justify-center p-6 back">
      <div className=" rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-center text-brightRed mb-8">Medicine Reminder</h1>

        {/* Patient Details */}
        <div className="mb-8 p-6 bg-indigo-50 rounded-xl shadow-inner">
          <h2 className="text-2xl font-semibold text-brightRed mb-4">Patient Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {patient.name}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Age:</span> {patient.age}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Condition:</span> {patient.condition}
            </p>
          </div>
        </div>

        {/* Medicine List */}
        <div>
          <h2 className="text-2xl font-semibold text-brightRed mb-4">Medicine Schedule</h2>
          {medicines.length === 0 ? (
            <p className="text-gray-500 text-center">No medicines scheduled.</p>
          ) : (
            <div className="space-y-4">
              {medicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <FaBell className="text-brightRed" />
                    <div>
                      <p className="text-lg font-medium text-gray-800">{medicine.name}</p>
                      <p className="text-sm text-gray-600">Dose: {medicine.dose}</p>
                      <p className="text-sm text-gray-600">Time: {medicine.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono text-indigo-600">
                      {medicine.timeLeft > 0 ? formatTimeLeft(medicine.timeLeft) : 'Time’s Up!'}
                    </p>
                    {medicine.timeLeft === 0 && (
                      <span className="text-red-500 text-sm animate-pulse">Take Now!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default Reminder;