import React from "react";
import Footer from './Footer';
import { Link } from 'react-router-dom';


const Home = () => {
  return (
    <div>
    <div className=" text-white min-h-screen flex flex-col items-center justify-center p-6">
      {/* Main Content */}
      <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Section - Text Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brightRed">
            THE MEDICATION CLOUD
          </h1>
          <h2 className="text-3xl text-brightRed md:text-4xl font-semibold mb-6">
            Get the most out of medications
          </h2>
          <p className="text-black mb-8">
            Medications are essential to your organization's success, but are
            they delivering their full potential? MedCloud's intelligent
            Medication Cloud connects patients, care teams, and enterprises to
            maximize the value of medications.
          </p>
          {/* <Link
                    to='/get-started'
                    className='w-24 hidden p-3 px-6 pt-2 text-white bg-brightRed rounded-full baseline hover:bg-brightRedLight md:block'
                  >
                    Get Started
                  </Link> */}
        </div>

        {/* Right Section - Image and Info Panel */}
        <div className="md:w-1/2 relative">
          {/* Patient Image */}
          <div className="relative w-full h-96 bg-gray-800 rounded-xl overflow-hidden border-4 border-brightRed">
            <img
              src="https://imgs.search.brave.com/ZdgBrJpjxYN0D2u9vd7d9l655IeZyXnXc8OjFq4hXWQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQ0/NDM5NTk0MS9waG90/by9tYW4tdXNpbmct/c21hcnQtcGhvbmUt/d2VhcmluZy1oYXQu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PXg2Zko2RVZaZEVP/YzdILXVseGV2UkM5/QmhyWGdza0Nlb2Fm/SHBoeWZGTFk9"
              alt="Patient using app"
              className="w-full h-full object-cover"
            />
            {/* Info Panel */}
            <div className="absolute top-4 left-4 bg-white text-gray-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-semibold">Patients</span>
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  A
                </div>
                <div>
                  <p className="font-medium">Amos Porou</p>
                  <p className="text-sm text-gray-600">67 (M)</p>
                  <p className="text-sm text-gray-600">8 Active Medications</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
                  Missed Med Alerts
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                  Drug Interactions
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                  EHR Connected
                </div>
              </div>
            </div>
            {/* Reminder Popup */}
            <div className="absolute bottom-4 right-4 bg-white text-gray-800 p-4 rounded-lg shadow-lg flex items-center gap-2">
              <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white">
                M
              </span>
              <div>
                <p className="font-semibold">MedCloud Reminder</p>
                <p className="text-sm">It's time to take your medications!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="mt-12 w-full text-center">
        <p className="text-gray-400 mb-6">
          Trusted by the nation's leading healthcare organizations and 100,000+
          patients
        </p>
        <div className="flex justify-center gap-8 flex-wrap">
          <div className="bg-gray-800 p-4 rounded-lg">
            <img
              src="https://imgs.search.brave.com/pbUp0guxtDg_s-bbtTsqmxffWQ-9vDF_HZVBpa-02b0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wZW5q/aS5jby93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMS8wNC84Li1j/YXJlcG9pbnQtaGVh/bHRoLWhvc3BpdGFs/LWxvZ29zLmpwZw"
              alt="Health Org 1"
              className="h-20"
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <img
              src="https://imgs.search.brave.com/wOoSF05sWT9997yHN2Kx2HqFw2bd0yXJQbNiVkVRUtM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wZW5q/aS5jby93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMS8wNC8xMS4t/bGNtYy1oZWFsdGgt/aG9zcGl0YWwtbG9n/b3MuanBn"
              alt="Health Org 2"
              className="h-20"
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <img
              src="https://imgs.search.brave.com/8HF6XXWv_0EqpG6lLDVrYqLb59Y1YWE7feI1ywvnYKk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wZW5q/aS5jby93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMS8wNC82Li1r/cmlzaG5haS1ob3Nw/aXRhbC1ob3NwaXRh/bC1sb2dvcy5qcGc"
              alt="Health Org 3"
              className="h-20"
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <img
              src="https://imgs.search.brave.com/0AdgX7mQcbWPksc9DCzlJrWL-WzyZwuQNGI9l8JkCD0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wZW5q/aS5jby93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMS8wNC8zLi11/dGhlYWx0aC1ob3Nw/aXRhbC1sb2dvcy5q/cGc"
              alt="Health Org 4"
              className="h-20"
            />
          </div>

        </div>

      </div>

    </div>
            <Footer/>
</div>
  );
};

export default Home;