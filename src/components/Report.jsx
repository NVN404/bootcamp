import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';
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

// Function to generate random colors for chart bars
const generateColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    colors.push(`rgba(${r}, ${g}, ${b}, 0.5)`); // Background color with opacity
  }
  return colors;
};

const Report = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();

  // Get userId from state or fall back to localStorage
  const userId = location.state?.userId || window.localStorage.getItem('userId');
  const activePatientId = window.localStorage.getItem('activePatientId');

  useEffect(() => {
    console.log('useEffect triggered with userId:', userId, 'activePatientId:', activePatientId);

    const fetchPatientData = async () => {
      try {
        console.log('Fetching data for userId/activePatientId:', userId, activePatientId);
        let response;
        if (activePatientId) {
          response = await axios.get(`http://localhost:5000/api/auth/patients/by-id/${activePatientId}`);
        } else {
          response = await axios.get(`http://localhost:5000/api/auth/patients/latest/${userId}`);
          window.localStorage.setItem('activePatientId', response.data._id);
        }
        const patient = response.data;

        if (!patient || !patient.medicines || patient.medicines.length === 0) {
          console.log('No patient or medicines found');
          setError('No medicines found for this patient');
          return;
        }

        console.log('Patient:', patient);

        // Dynamically get the list of medicines and their frequencies
        const medicines = patient.medicines.map((med) => med.name);
        const frequencies = patient.medicines.map((med) => med.frequency || 0);

        // Generate colors dynamically based on the number of medicines
        const backgroundColors = generateColors(medicines.length);
        const borderColors = backgroundColors.map((color) =>
          color.replace('0.5', '1') // Increase opacity for border
        );

        const data = {
          labels: medicines,
          datasets: [
            {
              label: `Medicine Frequency for ${patient.patientId}`,
              data: frequencies,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        };

        console.log('Chart Data:', data);
        setChartData(data);
      } catch (error) {
        console.error('Fetch Error:', error.response || error.message);
        setError('Error fetching patient data');
      }
    };

    if (userId || activePatientId) {
      fetchPatientData(); // Initial fetch
      // Set up polling to check for updates every 10 seconds
      const interval = setInterval(fetchPatientData, 10000);
      return () => clearInterval(interval);
    } else {
      console.log('No userId provided');
      setError('No user ID provided! Please log in.');
    }
  }, [userId, activePatientId]);

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Frequency (Times Taken)' },
      },
      x: {
        title: { display: true, text: 'Medicines' },
      },
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Patient Medication Frequency' },
    },
  };

  console.log('Rendering with chartData:', chartData, 'error:', error);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Medication Frequency Report</h2>
      {chartData ? (
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : error ? (
        <p className="text-center text-sm text-red-600">{error}</p>
      ) : (
        <p className="text-center text-sm text-gray-600">Loading chart...</p>
      )}
    </div>
  );
};

export default Report;