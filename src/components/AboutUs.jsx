import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Hero from './Hero';
import Features from './Features.jsx';
import CallToAction from './CallToAction';
import Footer from './Footer';
import Form from './form';
function AboutUs() {
    return (
      <div>
        
        <Hero />
        <Features />
        <CallToAction />
        <Footer />
        {/* <Login />
        <Signup /> */}
     </div>
    );
  }
  
  export default AboutUs;
  