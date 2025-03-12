import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DoctorDashboard = ({ doctorId }) => {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/doctor-patients/${doctorId}`);
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError('Error fetching patients');
      }
    };

    if (doctorId) fetchPatients();
  }, [doctorId]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold text-center text-brightRed mb-8">Doctor Dashboard</h1>
      {error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : patients.length === 0 ? (
        <p className="text-center text-gray-600">No patients assigned yet.</p>
      ) : (
        <div className="w-full max-w-4xl space-y-4">
          {patients.map((patient) => (
            <div
              key={patient._id}
              className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
            >
              <p className="text-lg font-medium">{patient.name} (ID: {patient.patientId})</p>
              <div>
                <Link
                  to={`/report`}
                  state={{ userId: patient.userId }}
                  className="text-brightRed hover:underline mr-4"
                >
                  View Report
                </Link>
                <Link
                  to={`/reminder`}
                  state={{ patientId: patient.userId, isDoctor: true }}
                  className="text-brightRed hover:underline"
                >
                  Manage Reminders
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;