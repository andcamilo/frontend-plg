import React, { useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface ProcessCarouselProps {
  items: { title: string; imageUrl: string; description: string }[];
}


const ProcessCarousel: React.FC<ProcessCarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const newIndex = (currentIndex - 1 + items.length) % items.length;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % items.length;
    setCurrentIndex(newIndex);
  };

  const getVisibleItems = () => {
    const visibleItems = [];
    for (let i = 0; i < 3; i++) {
      visibleItems.push(items[(currentIndex + i) % items.length]);
    }
    return visibleItems;
  };

  return (
    <div className="relative w-full max-w-6xl  mt-3 mx-auto">
      <h2 className="text-white text-2xl font-bold mb-4">Trámites Populares</h2>
      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button
          className="absolute left-0 z-30 p-3 bg-gray-700 rounded-full hover:bg-gray-600"
          onClick={prevSlide}
        >
          <ChevronLeftIcon style={{ color: 'white', fontSize: 40 }} />
        </button>

        {/* Carousel Items */}
        <div className="overflow-hidden w-full">
          <div className="flex transition-transform duration-500 items-stretch" style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}>
            {getVisibleItems().map((item, index) => (
              <div
                key={index}
                className="w-full md:w-1/3 flex-shrink-0 px-1"
              >
                <div className="overflow-hidden rounded-lg flex flex-col h-full">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="bg-component bg-opacity-50 p-4 flex-grow">
                    <h3 className="text-white font-bold text-xl">{item.title}</h3>
                    <p className="text-white">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          className="absolute right-0 z-30 p-3 bg-gray-700 rounded-full hover:bg-gray-600"
          onClick={nextSlide}
        >
          <ChevronRightIcon style={{ color: 'white', fontSize: 40 }} />
        </button>
      </div>
    </div>
  );
};

export default ProcessCarousel;
