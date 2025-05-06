import React, { useRef } from 'react';
import HomeLayout from '@components/homeLayout';
import TramitesPopulares from '@components/processCarousel';
import FaqComponent from '@/src/app/components/faqComponent';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

const Home: React.FC = () => {
  const carouselItems = [
    {
      title: 'Consulta - Propuesta Legal',
      imageUrl: '/images/process1.jpg',
      description: 'Descripción de la consulta y propuesta legal.',
      redirect: '/request/consulta-propuesta'
    },
    {
      title: 'Sociedades Anónimas ',
      imageUrl: '/images/process2.jpg',
      description: 'Descripción de las sociedades y empresas.',
      redirect: '/request/sociedad-empresa'
    },
    {
      title: 'Fundaciones de Interés Privado',
      imageUrl: '/images/process3.jpg',
      description: 'Descripción de las fundaciones de interés privado.',
      redirect: '/request/fundacion'
    },
    {
      title: 'Permiso de Salida de Menores al Extranjero',
      imageUrl: '/images/process3.jpg',
      description: 'Descripción de las permiso de salidade menores al extranjero.',
      redirect: '/request/menores-extranjero'
    },
    {
      title: 'Pensión Alimenticia y Desacato',
      imageUrl: '/images/process3.jpg',
      description: 'Descripción de las pensión alimenticia y desacato.',
      redirect: '/request/pension-alimenticia'
    }
  ];

  const router = useRouter();

  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScrollToCarousel = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <HomeLayout>
      <div className="relative w-full min-h-screen overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover object-[center_20%] z-10"
          autoPlay
          loop
          muted
        >
          <source src="/videos/video-uQA.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Contenido sobre el video */}
        <div className="relative z-20 flex flex-col items-center justify-start text-white pt-20 px-4">
          <div className="font-bold text-4xl text-center">
            Bienvenido a <span className="text-profile ml-2">Legix</span>
          </div>
          <div className="mt-4 text-2xl text-center">
            Trámites Legales Digitales
          </div>
          <div className="mt-2 text-2xl text-center">
            Panama Legal Group
          </div>
          <div className="mt-8 mb-15 flex flex-wrap justify-center space-x-4">
            {/* <button
              onClick={handleScrollToCarousel}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg"
            >
              Nueva Solicitud
            </button> */}
            <button
              className="bg-profile text-white px-6 py-3 rounded-lg"
              onClick={() => router.push('/login')}
            >
              Ingresar
            </button>
          </div>

          <div className="w-[48rem] h-[2px] bg-white opacity-40 rounded-full mt-12 mx-auto" />
          <div className="text-2xl mt-4 text-center">
            Trámites Populares
          </div>
          {/* Carrusel de trámites */}
          <div className="relative w-full overflow-hidden my-12 mt-4 mb-12" ref={carouselRef}>
            <TramitesPopulares tramites={carouselItems} />
          </div>

          <div className="w-[48rem] h-[2px] bg-white opacity-40 rounded-full mt-2 mb-6 mx-auto" />

          {/* Botones de FAQs y Contacto */}
          <div className="w-full flex flex-wrap justify-center gap-6 mb-12">
            <button
              className="text-xl font-bold bg-profile rounded-lg px-4 py-2 text-white hover:bg-opacity-90"
              onClick={() => (window.location.href = '/faqs')}
            >
              Preguntas Frecuentes LEGIX
            </button>
            <button
              className="text-xl font-bold bg-profile rounded-lg px-4 py-2 text-white hover:bg-opacity-90"
              onClick={() => (window.location.href = '/contacts')}
            >
              Contáctanos
            </button>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default Home;
