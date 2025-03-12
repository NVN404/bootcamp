// src/components/Report.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
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

const Report = ({ userId }) => {
  const [chartData, setChartData] = useState(null); // Single chart object instead of array
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('useEffect triggered with userId:', userId);

    const fetchPatientData = async () => {
      try {
        console.log('Fetching data for userId:', userId);
        const response = await axios.get(`http://localhost:5000/api/auth/patients/${userId}`);
        console.log('API Response:', response.data);
        const patients = response.data;

        if (!patients || patients.length === 0) {
          console.log('No patient found');
          setError('No patient data found for this user');
          return;
        }

        // Since we expect only one patient, take the first one
        const patient = patients[0];
        console.log('Patient:', patient);

        const medicines = ['Aspirin', 'Paracetamol', 'Dolo650'];
        const frequencies = medicines.map((medicine) =>
          patient.medicines.find((m) => m.name === medicine)?.frequency || 0
        );
        console.log('Frequencies:', frequencies);

        const data = {
          labels: medicines, // X-axis: medicine names
          datasets: [
            {
              label: `Medicine Frequency for ${patient.patientId}`,
              data: frequencies, // Y-axis: frequency values
              backgroundColor: [
                'rgba(54, 162, 235, 0.5)',  // Aspirin
                'rgba(75, 192, 192, 0.5)',  // Paracetamol
                'rgba(255, 99, 132, 0.5)',  // Dolo650
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
              ],
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

    if (userId) {
      fetchPatientData();
    } else {
      console.log('No userId provided');
      setError('No user ID provided');
    }
  }, [userId]);

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
    <div className="min-h-screen flex flex-col items-center p-4">
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