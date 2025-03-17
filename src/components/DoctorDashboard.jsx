import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const DoctorDashboard = () => {
  const { state } = useLocation();
  const { user } = useUser(); // Use Clerk's useUser hook to get the current user
  const doctorId = state?.doctorId || user?.id; // Use user.id instead of localStorage
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [newPatient, setNewPatient] = useState({ email: '', name: '', patientId: '' });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (!doctorId) {
          setError('Doctor ID is not available');
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/auth/doctor-patients/${doctorId}`);
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError('Error fetching patients');
      }
    };

    if (doctorId) fetchPatients();
  }, [doctorId]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/doctor/${doctorId}/add-patient`,
        newPatient
      );
      setPatients([...patients, response.data.patient]);
      setSuccessMessage(response.data.message);
      setNewPatient({ email: '', name: '', patientId: '' });
    } catch (error) {
      console.error('Error adding patient:', error);
      setError(error.response?.data?.message || 'Error adding patient');
    }
  };

  const handleManageReminders = (patientId) => {
    // Store the active Patient _id in localStorage for the patient to use
    window.localStorage.setItem('activePatientId', patientId);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold text-center text-brightRed mb-8">Doctor Dashboard</h1>

      {/* Add Patient Form */}
      <div className="w-full max-w-4xl mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-brightRed mb-4">Add New Patient</h2>
        {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
        {error && !patients.length && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleAddPatient} className="space-y-4">
          <div>
            <label className="block text-lg font-medium">Patient Email</label>
            <input
              type="email"
              value={newPatient.email}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter patient’s email"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-medium">Patient Name</label>
            <input
              type="text"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter patient’s name (optional)"
            />
          </div>
          <div>
            <label className="block text-lg font-medium">Patient ID</label>
            <input
              type="text"
              value={newPatient.patientId}
              onChange={(e) => setNewPatient({ ...newPatient, patientId: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter unique patient ID (optional)"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-brightRed text-white rounded hover:bg-red-700"
          >
            Add Patient
          </button>
        </form>
      </div>

      {/* Patient List */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-brightRed mb-4">Assigned Patients</h2>
        {error && patients.length === 0 ? (
          <p className="text-center text-red-600">{error}</p>
        ) : patients.length === 0 ? (
          <p className="text-center text-gray-600">No patients assigned yet.</p>
        ) : (
          <div className="space-y-4">
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
                    state={{ patientId: patient._id, isDoctor: true }}
                    className="text-brightRed hover:underline"
                    onClick={() => handleManageReminders(patient._id)}
                  >
                    Manage Reminders
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;