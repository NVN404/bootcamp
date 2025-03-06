import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Form from './components/form';
import AboutUs from './components/AboutUs';
import Specialist from './components/Specialist';
import Reminder from './components/Reminder';
import Home from './components/Home';
import Report from './components/Report';
import ProtectedRoute from './components/ProtectedRoute';
// import Login from './components/Login.jsx';
// import Signup from './components/Signup.jsx';
function App() {
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
        <Route path='/report' element={<Report />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
