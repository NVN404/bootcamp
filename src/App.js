import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Form from './components/form';
import AboutUs from './components/AboutUs';
import Specialist from './components/Specialist';
import Reminder from './components/Reminder';
import Home from './components/Home';
import Report from './components/Report';
import DoctorDashboard from './components/DoctorDashboard'; // New component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const userId = window.localStorage.getItem('userId');
  const userType = window.localStorage.getItem('userType'); // Assuming stored on login

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/get-started" element={<Form />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/specialist" element={<Specialist />} />
          <Route path="/reminder" element={<Reminder />} />
          <Route path="/report" element={<Report userId={userId} />} />
          {userType === 'Doctor' && (
            <Route path="/doctor-dashboard" element={<DoctorDashboard doctorId={userId} />} />
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;