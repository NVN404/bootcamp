import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react'; // Add useAuth
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Function to generate colors for chart bars
const generateColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    colors.push(`rgba(${r}, ${g}, ${b}, 0.5)`);
  }
  return colors;
};

const Report = () => {
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [intakeData, setIntakeData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();
  const { user } = useUser();
  const { getToken } = useAuth(); // Add getToken for authentication
  const userId = location.state?.userId || user?.id;
  const activePatientId = window.localStorage.getItem('activePatientId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken(); // Get the Clerk token
        if (!token) {
          throw new Error('Failed to retrieve authentication token');
        }

        // Fetch prescribed medicines
        let patientResponse;
        if (activePatientId) {
          patientResponse = await axios.get(`http://localhost:5000/api/auth/patients/by-id/${activePatientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          patientResponse = await axios.get(`http://localhost:5000/api/auth/patients/latest/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          window.localStorage.setItem('activePatientId', patientResponse.data._id);
        }
        const patient = patientResponse.data;

        if (!patient || !patient.medicines || patient.medicines.length === 0) {
          setError('No medicines found for this patient');
          return;
        }

        setPrescribedMedicines(patient.medicines);

        // Fetch medicine intake history
        const intakeResponse = await axios.get(`http://localhost:5000/api/auth/medicine-intake/${activePatientId || patient._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const intakes = intakeResponse.data;

        setIntakeData(intakes);

        // Prepare chart data
        const medicines = patient.medicines.map((med) => med.name);
        const frequencies = medicines.map((medName) => {
          const relevantIntakes = intakes.filter((intake) => intake.medicineName === medName);
          return relevantIntakes.reduce((sum, intake) => sum + intake.frequency, 0);
        });

        const backgroundColors = generateColors(medicines.length);
        const borderColors = backgroundColors.map((color) => color.replace('0.5', '1'));

        const data = {
          labels: medicines,
          datasets: [
            {
              label: `Medicine Intake Frequency for ${patient.patientId}`,
              data: frequencies,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        };

        setChartData(data);
      } catch (error) {
        console.error('Fetch Error:', error.response || error.message);
        setError(error.response?.data?.message || 'Error fetching patient data');
      }
    };

    if (userId || activePatientId) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    } else {
      setError('No user ID provided! Please log in.');
    }
  }, [userId, activePatientId, getToken]); // Add getToken to dependencies

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Total Frequency (Times Taken)' },
      },
      x: {
        title: { display: true, text: 'Medicines' },
      },
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Patient Medication Intake Frequency' },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Medication Report</h2>

      <div className="w-full max-w-4xl mb-8">
        <h3 className="text-xl font-semibold mb-4">Prescribed Medicines</h3>
        {prescribedMedicines.length === 0 ? (
          <p className="text-gray-500">No medicines prescribed.</p>
        ) : (
          <ul className="space-y-2">
            {prescribedMedicines.map((med, index) => (
              <li key={index} className="p-3 bg-white rounded-lg shadow">
                <p><strong>Name:</strong> {med.name}</p>
                <p><strong>Dose:</strong> {med.dose}</p>
                <p><strong>Time:</strong> {med.time}</p>
                <p><strong>Prescribed Frequency:</strong> {med.frequency}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="w-full max-w-4xl">
        <h3 className="text-xl font-semibold mb-4">Medicine Intake Frequency Chart</h3>
        {chartData ? (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-center text-sm text-gray-600">Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default Report;