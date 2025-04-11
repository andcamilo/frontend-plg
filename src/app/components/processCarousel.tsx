// src/components/processCarousel.tsx

import React from 'react';
import { useRouter } from 'next/navigation';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface Tramite {
  title: string;
  description: string;
  imageUrl: string;
  redirect: string;
}

interface Props {
  tramites: Tramite[];
}

const TramitesPopulares: React.FC<Props> = ({ tramites }) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 px-4 max-w-[1000px] mx-auto">
      {tramites.map((tramite, index) => (
        <button
          key={index}
          onClick={() => router.push(tramite.redirect)}
          className="flex items-center justify-between bg-profile text-white px-4 py-2 rounded-full font-bold text-base shadow-md hover:bg-opacity-90 hover:scale-105 transform transition-all w-[300px] min-h-[60px]"
        >
          <div
            className="text-center w-full leading-tight"
            title={tramite.title}
          >
            {tramite.title}
          </div>
          <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center ml-3">
            <ArrowForwardIosIcon style={{ color: 'white', fontSize: '18px' }} />
          </div>
        </button>
      ))}
    </div>
  );
};

export default TramitesPopulares;
