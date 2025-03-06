import { Link } from 'react-router-dom';

import maleAvatar from '../assets/images/avatar-photoaidcom-cropped.png';
import femaleAvatar from '../assets/images/favatar.png';
const Testimonial = () => {
  return (
    <section id='testimonials'>
      {/* Container to heading and testm blocks */}
      <div className='max-w-6xl px-5 mx-auto mt-32 text-center'>
        {/* Heading */}
        <h2 className='text-4xl font-bold text-left'>
          Our Doctors
        </h2>
        {/* Testimonials Container */}
        <div className='flex flex-col mt-24 md:flex-row md:space-x-6'>
          {/* Testimonial 1 */}
          <div className='flex flex-col items-center p-6 space-y-6 rounded-lg bg-veryLightGray md:w-1/3'>
            <img src={maleAvatar} className='w-16 -mt-14' alt='' />
            <h5 className='text-lg font-bold'>Dr. Devi Shetty</h5>
            <div className='space-y-3'>
            <p>Cardiologist</p>
            <p className='text-sm text-darkGrayishBlue'>
              “Founder of Narayana Health, Bangalore. He is one of the most well-known heart surgeons in India.”
            </p>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className='hidden flex-col items-center p-6 space-y-6 rounded-lg bg-veryLightGray md:flex md:w-1/3'>
            <img src={maleAvatar} className='w-16 -mt-14' alt='' />
            <h5 className='text-lg font-bold'>Dr. B.K. Misra</h5>
            <div className='space-y-3'>
            <p>Neurologist</p>
            <p className='text-sm text-darkGrayishBlue'>
              “One of the leading neurologists in India, known for his expertise in neuro-critical care and stroke management.”
            </p>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className='hidden flex-col items-center p-6 space-y-6 rounded-lg bg-veryLightGray md:flex md:w-1/3'>
            <img src={maleAvatar} className='w-16 -mt-14' alt='' />
            <h5 className='text-lg font-bold'>Dr. Ashok Rajgopal</h5>
            <div className='space-y-3'>
            <p>Orthopedist</p>
            <p className='text-sm text-darkGrayishBlue'>
              “A well-known orthopedic surgeon specializing in joint replacement surgery, particularly knee replacements.”
            </p>
            </div>
          </div>
          {/* Testimonial 4 */}
          <div className='hidden flex-col items-center p-6 space-y-6 rounded-lg bg-veryLightGray md:flex md:w-1/3'>
            <img src={femaleAvatar} className='w-16 -mt-14' alt='' />
            <h5 className='text-lg font-bold'>Dr. Ramesh Sarin</h5>
            <div className='space-y-3'>
              <p>Oncologists</p>
            <p className='text-sm text-darkGrayishBlue'>
              “One of the best-known oncologists in India for cancer treatment, especially in the field of head and neck cancers.”
            </p>
            </div>
          </div>
        </div>
        {/* Button */}
        <div className='my-16'>
          <Link
            to='/get-started'
            className='p-3 px-6 pt-2 text-white bg-brightRed rounded-full baseline hover:bg-brightRedLight'
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
