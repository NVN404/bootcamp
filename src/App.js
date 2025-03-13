import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorDashboard from './components/DoctorDashboard';
import Form from './components/form';
import Report from './components/Report';
import Reminder from './components/Reminder';
import Home from './components/Home'; 
import AboutUs from './components/AboutUs'; 
import Specialist from './components/Specialist'; 

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/get-started" element={<Form />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/report" element={<Report />} />
          <Route path="/reminder" element={<Reminder />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/specialist" element={<Specialist />} />

          {/* Add other protected routes like /specialist if needed */}
        </Route>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;