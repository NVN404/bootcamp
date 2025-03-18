import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import companyLogo from '../assets/images/logo-med.jpeg';

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const userType = user?.publicMetadata?.userType; // No default
  const userId = user?.id;

  useEffect(() => {
    if (isLoaded) {
      console.log('Navbar - Is Signed In:', isSignedIn);
      console.log('Navbar - User:', user);
      console.log('Navbar - Public Metadata:', user?.publicMetadata);
      console.log('Navbar - User Type:', userType);
      console.log('Navbar - User ID:', userId);
    }
  }, [isSignedIn, user, userType, userId, isLoaded]);

  const handleLogout = async () => {
    await signOut();
    navigate('/get-started');
  };

  if (!isLoaded) {
    return <div className='text-center'>Loading...</div>;
  }

  if (isSignedIn && !userType) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600">User type not set. Please contact support or set your user type.</p>
        <button
          onClick={handleLogout}
          className="mt-4 p-2 px-4 text-white bg-brightRed rounded-full hover:bg-brightRedLight"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <nav className="relative container mx-auto p-6">
      <div className="flex items-center justify-between">
        <div className="pt-2">
          <img src={companyLogo} alt="Company Logo" />
        </div>
        <div className="hidden space-x-6 md:flex">
          <Link to="/" className="hover:text-darkGrayishBlue">Home</Link>
          {isSignedIn && userType === 'User' && (
            <>
              <Link to="/reminder" className="hover:text-darkGrayishBlue">Reminder</Link>
              <Link to="/report" className="hover:text-darkGrayishBlue">Reports</Link>
              <Link to="/specialist" className="hover:text-darkGrayishBlue">Specialists</Link>
            </>
          )}
          {isSignedIn && userType === 'Doctor' && (
            <Link
              to="/doctor-dashboard"
              state={{ doctorId: userId }}
              className="hover:text-darkGrayishBlue"
            >
              Doctor Dashboard
            </Link>
          )}
          <Link to="/about-us" className="hover:text-darkGrayishBlue">About Us</Link>
        </div>
        <div>
          {isSignedIn ? (
            <button
              onClick={handleLogout}
              className="hidden p-3 px-6 pt-2 text-white bg-brightRed rounded-full baseline hover:bg-brightRedLight md:block"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/get-started"
              className="hidden p-3 px-6 pt-2 text-white bg-brightRed rounded-full baseline hover:bg-brightRedLight md:block"
            >
              Get Started
            </Link>
          )}
        </div>
        <button
          className={
            toggleMenu
              ? 'open block hamburger md:hidden focus:outline-none'
              : 'block hamburger md:hidden focus:outline-none'
          }
          onClick={() => setToggleMenu(!toggleMenu)}
        >
          <span className="hamburger-top"></span>
          <span className="hamburger-middle"></span>
          <span className="hamburger-bottom"></span>
        </button>
      </div>
      <div className="md:hidden">
        <div
          className={
            toggleMenu
              ? 'absolute flex flex-col items-center self-end py-8 mt-10 space-y-6 font-bold bg-white sm:w-auto sm:self-center left-6 right-6 drop-shadow-md'
              : 'absolute flex-col items-center hidden self-end py-8 mt-10 space-y-6 font-bold bg-white sm:w-auto sm:self-center left-6 right-6 drop-shadow-md'
          }
        >
          <Link to="/">Home</Link>
          {isSignedIn && userType === 'User' && (
            <>
              <Link to="/reminder">Reminder</Link>
              <Link to="/report">Reports</Link>
              <Link to="/specialist">Specialists</Link>
            </>
          )}
          {isSignedIn && userType === 'Doctor' && (
            <Link to="/doctor-dashboard" state={{ doctorId: userId }}>
              Doctor Dashboard
            </Link>
          )}
          <Link to="/about-us">About Us</Link>
          {isSignedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/get-started">Get Started</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;