import React, { useRef } from 'react';
import HomeLayout from '@components/homeLayout';
// import ProcessCarousel from '@components/ProcessCarousel'; 
import FaqComponent from '@/src/app/components/faqComponent';

const Home: React.FC = () => {
  const carouselItems = [
    {
      title: 'Consulta - Propuesta Legal',
      imageUrl: '/images/process1.jpg', 
      description: 'Descripción de la consulta y propuesta legal.',
    },
    {
      title: 'Sociedades / Empresas',
      imageUrl: '/images/process2.jpg',
      description: 'Descripción de las sociedades y empresas.',
    },
    {
      title: 'Fundaciones de Interés Privado',
      imageUrl: '/images/process3.jpg', 
      description: 'Descripción de las fundaciones de interés privado.',
    }
  ];

  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScrollToCarousel = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <HomeLayout>
      <div className="relative w-full h-screen overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-10"
          autoPlay
          loop
          muted
        >
          <source src="/videos/video-uQA.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white">
          <div className="font-bold text-4xl">
            Bienvenido a  <span className='text-profile ml-2'>Legix</span> 
          </div>
          <div className="mt-4 text-2xl">
            Trámites Legales Digitales
          </div>
          <div className="mt-2 text-2xl">
            Panama Legal Group
          </div>
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleScrollToCarousel}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg"
            >
              Nueva Solicitud
            </button>
            <button className="bg-profile text-white px-6 py-3 rounded-lg">
              Ingresar
            </button>
          </div>
        </div>
      </div>
      {/* <div className="relative w-full overflow-hidden my-8" ref={carouselRef}>
        <ProcessCarousel items={carouselItems} />
      </div> */}
      <div className="relative w-full h-screen mt-8 overflow-hidden">
        <FaqComponent />
      </div>
    </HomeLayout>
  );
}

export default Home;
